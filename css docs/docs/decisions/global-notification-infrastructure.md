# Architectural Decision: Global Notification Infrastructure & Telemetry

## Status
Approved

## Context
As the CustomerSelfService platform scales, it requires a unified, high-performance telemetry and operational alert system that makes the workspace feel alive. Legacy notifications were mock-driven, localized to separate headers, and audit logs were coupled with app context states, causing parent-level re-render loops. We needed a decoupled alert pipeline that supports deduplication, priority queuing, lifecycles, muting configurations, and is compatible with future websocket integrations.

## Decisions

### 1. Unified State Store & Backward Compatibility
We migrated all notifications, audit logs, and filter queries into a single, global Zustand store (`notificationStore.ts`). 
- To prevent breaking 15+ existing components that use the audit log trail, we refactored the legacy `notificationsStore.ts` to export the new store instance as a backward-compatible alias.
- Components subscribe to narrow slices of state via isolated selector hooks (`notificationSelectors.ts`), preventing global re-renders.

### 2. Notification Deduplication & Lifecycle States
To prevent toast spamming during operational spikes, we added a deduplication and lifecycle layer:
- Incoming alerts with identical `category`, `severity`, `sourceEntity`, and `alertCode` do not stack separate cards. They increment an occurrence counter (`count`) and update the `lastOccurred` timestamp, briefly pulsing the active toast.
- We expanded alert states beyond simple read/unread to support: `active` (visible in queue), `acknowledged` (acknowledged by agent), `resolved` (collapsed to history), and `muted` (toast suppressed, logged in background).

### 3. Priority Queueing & Rate Limiting
To preserve screen real-estate and operator focus:
- Active toasts are rate-limited to a maximum of 3 concurrent cards. Lower-severity notifications queue behind.
- Critical alerts auto-pin, bypass active count limits, and do not auto-dismiss.
- Non-critical alerts have auto-dismiss durations based on severity: `info` (4s), `success` (5s), and `warning` (8s).

### 4. Decoupled Event Creators
To future-proof the application for real backend or WebSocket integration, we decoupled alert triggering from UI click handlers:
- Created a separate event dispatch layer (`notificationEvents.ts`) hosting helper functions (`triggerSlaBreach`, `triggerWebhookFailure`, etc.).
- UI components import and invoke these helper functions, which dispatch to the Zustand store imperatively. This enables swapping the storage dispatching logic for a WebSocket broadcast client without editing component files.
