# Centralized Constants & Enums Strategy

This document outlines the organization, type safety, and placement of system constants, enums, API codes, and configuration parameters to ensure consistency and prevent runtime spelling discrepancies.

---

## 1. Directory Structure & Organization
All shared keys, event names, and user categories are organized into dedicated files inside `src/common/constants/`:

```text
src/common/constants/
├── index.ts            # Umbrella exporter
├── roles.ts            # User roles and default scopes
├── permissions.ts      # Permission tags (matches frontend permissions.ts)
├── events.ts           # Socket.io and EventEmitter channels
├── queues.ts           # Cron identifiers and task names
└── error-codes.ts      # Structured API exception mapping
```

---

## 2. Code Blueprints

### 1. User Roles & Permissions (`roles.ts` & `permissions.ts`)
```typescript
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  CLIENT_ADMIN = 'client_admin',
  OPERATIONS_MANAGER = 'operations_manager',
  QA_MANAGER = 'qa_manager',
  SUPPORT_AGENT = 'support_agent',
  SUPERVISOR = 'supervisor',
  CUSTOMER = 'customer',
  VIEWER = 'viewer',
}

export enum Permission {
  SA_SYSTEM_OPS = 'sa_system_ops',
  BOTS_WRITE = 'bots_write',
  INTENTS_WRITE = 'intents_write',
  KB_WRITE = 'kb_write',
  INBOX_WRITE = 'inbox_write',
  QA_EVALUATIONS = 'qa_evaluations',
  SUPERVISOR_WIRETAP = 'supervisor_wiretap',
  CUSTOMER_PORTAL = 'customer_portal',
}
```

### 2. WebSocket Channels (`events.ts`)
```typescript
export enum WsEvent {
  // Connection Channel
  CONNECT = 'connection',
  DISCONNECT = 'disconnect',
  
  // Presence
  AGENT_PRESENCE_UPDATE = 'agent:presence:update',
  
  // Messaging
  CHAT_MESSAGE_SEND = 'chat:message:send',
  CHAT_MESSAGE_RECEIVE = 'chat:message:receive',
  CHAT_TYPING = 'chat:typing',
  
  // Supervisor Whispering
  SUPERVISOR_WHISPER = 'supervisor:whisper',
  SUPERVISOR_BARGE_IN = 'supervisor:barge_in',
  
  // AI Streams
  AI_STREAM_CHUNK = 'ai:stream:chunk',
}
```

### 3. Background Processing & Queues (`queues.ts`)
```typescript
export enum QueueName {
  NOTIFICATIONS = 'notifications',
  WEBHOOK_RETRIES = 'webhook_retries',
  AI_INGESTION = 'ai_ingestion',
  SLA_MONITORING = 'sla_monitoring',
}

export enum CronJobName {
  SLA_BREACH_CHECK = 'SLA_BREACH_CHECK',
  ORPHANED_JOB_CLEANUP = 'ORPHANED_JOB_CLEANUP',
  METERING_ROLLUP = 'METERING_ROLLUP',
}
```

### 4. API Error Codes (`error-codes.ts`)
```typescript
export enum ApiErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  TENANT_MISMATCH = 'TENANT_MISMATCH',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  MFA_REQUIRED = 'MFA_REQUIRED',
  DATA_INTEGRITY_VIOLATION = 'DATA_INTEGRITY_VIOLATION',
}
```
---

## 3. Usage Best Practices
1. **Never Hardcode String Constants**: Do not write `socket.emit('chat:typing')` or `user.role === 'customer'`. Import the enums:
   ```typescript
   import { WsEvent, UserRole } from '@/common/constants';
   socket.emit(WsEvent.CHAT_TYPING);
   ```
2. **Export Type Safety**: Ensure enums align with Mongoose schema definitions (e.g. `role: { type: String, enum: Object.values(UserRole) }`).