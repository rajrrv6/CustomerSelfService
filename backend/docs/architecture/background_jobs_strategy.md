# Background Jobs & Scheduling Strategy

This document details the background processing and scheduling design. The system handles tasks asynchronously without requiring paid external messaging or queueing infrastructure.

---

## 1. Core Principles
- **No Paid Queue Requirements**: Avoid dependencies on paid Amazon SQS, RabbitMQ Cloud, or enterprise Redis instances.
- **Environment Isolation**: Fall back to in-memory scheduling and lightweight MongoDB task polling for development and free-tier environments.
- **Reliable Retries**: Standard exponential backoff retries for third-party operations (webhooks, email dispatch, AI ingestion).
- **Tenant Fairness**: Ensure background job consumption is rate-limited and distributed equally across active tenant boundaries to prevent single-tenant starvation.

---

## 2. In-Memory Scheduler vs. Mongo-Backed Queue
The queueing service uses an adapter pattern to switch between deployment environments:

```text
+------------------+
|    Job Queue     |
+--------+---------+
         |
         | (Adapter Pattern)
         v
+--------+---------+                 +--------+---------+
| Mongo Queue      | (Dev/Free Tier) | Redis Queue      | (Production Scale)
| - Polls MongoDB  |                 | - BullMQ         |
| - Low memory     |                 | - High throughput|
+------------------+                 +------------------+
```

### 1. Development & Free-Tier Plan (MongoDB Queue)
- **Engine**: A lightweight Node.js helper class that polls a `background_jobs` collection.
- **Execution Interval**: Defaults to every 5-10 seconds depending on traffic load.
- **Locking Mechanism**: Uses Mongoose `findOneAndUpdate` with atomic locks (`lockedAt` and `lockedBy` variables) to prevent duplicate consumption by multiple Node instances.

### 2. High Scale Production Plan (BullMQ with Redis)
- **Engine**: BullMQ library powered by an active Redis instance.
- **Switch Condition**: Instantiated automatically if `.env` parameter `REDIS_ENABLED` is set to `true`.

---

## 3. Background Job Database Schema (MongoDB)
When Redis is disabled, jobs are registered in the `background_jobs` collection:

```typescript
interface IBackgroundJob {
  id: string;
  tenantId: string;
  queueName: 'notifications' | 'webhook_retries' | 'ai_ingestion' | 'sla_monitoring';
  taskType: string;
  payload: Record<string, unknown>;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  attempts: number;
  maxAttempts: number;
  runAt: Date;
  lockedAt?: Date;
  lockedBy?: string; // Node process identity
  errorLog?: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Key Indices
- `{ queueName: 1, status: 1, runAt: 1 }`: Optimizes job polling queries.
- `{ lockedAt: 1 }`: Identifies orphaned/stuck tasks for cleanup.

---

## 4. Scheduling & Cron Architecture
For scheduled tasks (SLA breach alerts, billing cycle reminders, periodic resource reports), the modular monolith registers timers in-memory:

- **Library**: `node-cron`
- **Cron Jobs**:
  1. **SLA Monitoring Daemon**: Runs every 1 minute to check active conversations against their SLA thresholds and flag warnings.
  2. **Orphaned Job Sweeper**: Runs every 10 minutes to unlock jobs stuck in the `processing` status due to dyno sleep or crash events.
  3. **Metering Rollups**: Runs once every 24 hours (midnight) to aggregate API call volume and token usage data into history logs.

---

## 5. Webhook & Notification Retry Patterns

Third-party network targets are inherently unreliable. The background runner manages webhook retries using **Exponential Backoff**:

```text
Attempt 1 (Fail) -> Wait 2m -> Attempt 2 (Fail) -> Wait 4m -> Attempt 3 (Fail) -> Wait 8m -> Fail / Alarm
```

### Webhook Dispatch Flow
1. A service registers a webhook dispatch event.
2. The event handler queues a task in `background_jobs`.
3. The queue worker pops the job and triggers the HTTP request to the external service.
4. **On Success**: Mark status as `completed`.
5. **On Failure**: 
   - Increment `attempts`.
   - If `attempts < maxAttempts`, set `runAt = now + (2^attempts * 1 minute)` and revert status to `queued`.
   - If `attempts == maxAttempts`, mark status as `failed` and emit a system alarm to the telemetry dashboard.