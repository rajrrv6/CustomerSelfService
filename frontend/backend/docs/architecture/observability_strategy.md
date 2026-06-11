# Observability Architecture

This document describes the observability strategy, structured logging, transaction correlation IDs, websocket connection telemetry, and AI billing/token trackers.

---

## 1. Structured Logging & JSON Transports
All stdout logging conforms to structured JSON output using a winston configuration. Raw text strings are banned in staging and production to allow ingestion by SIEM tools:

```json
{
  "timestamp": "2026-06-10T17:20:00.123Z",
  "level": "info",
  "correlationId": "82f8a846-9289-4fa2-bfbb-1a525f6e80b2",
  "tenantId": "acme_tenant_12",
  "module": "tickets",
  "message": "SLA status updated to warning",
  "metadata": {
    "ticketId": "60c72b2f9b1d8a001c8e9b1a",
    "breachTime": "2026-06-10T18:00:00Z"
  }
}
```

---

## 2. Request Tracing: Correlation IDs
To track requests across multiple modular boundaries (e.g. from Express route to Background worker to LLM provider calls):
1. **Correlation Middleware**: A global middleware generates or extracts a correlation header (`X-Correlation-ID`) on every incoming HTTP request:
   ```typescript
   import { v4 as uuidv4 } from 'uuid';
   app.use((req, res, next) => {
     const correlationId = req.headers['x-correlation-id'] || uuidv4();
     req.correlationId = correlationId;
     // Save in AsyncLocalStorage context for Winston logger retrieval
     cls.run({ correlationId }, next);
   });
   ```
2. **Propagation**: Include this correlation ID in all downstream outgoing payloads (headers to external webhook APIs, event logs, background queues).

---

## 3. Real-time Telemetry Metrics
Real-time connections require monitoring of concurrent loads to identify memory drops:
- **Metrics Collected**:
  - `websocket_connections_active`: Gauge of active client sockets.
  - `websocket_events_dispatched_rate`: Rate of payloads broadcast per minute.
  - `websocket_reconnection_failures`: Count of client handshake drop-offs.
- **Dashboard API**: Expose `/api/v1/super-admin/system-ops/health` returning aggregated stats on CPU memory, DB connections pool, and WebSocket room dimensions.

---

## 4. AI Gateway Observability & Token Trackers
Because AI providers represent a high-cost variable, we log metadata on every API gateway call:

- **Token Audits**: Log `promptTokens` and `completionTokens` to compare billing aggregates.
- **Latency Telemetries**: Track model latency (from request sent to first stream chunk, and final token response).
- **Safety Intercepts**: Flag queries blocked by content filters.

---

## 5. Audit Trail Event Pipeline
Audit events are decoupled from transaction databases using an internal event publisher:
1. When an administrative activity is executed (e.g. updating safety guardrails, downloading customer profiles, altering billing data), the service emits an audit event.
2. The event handler catches this asynchronously and registers it in the immutable `audit_logs` collection.
3. If configured, a background worker polls and dispatches these audit summaries to the client's external webhook endpoint.