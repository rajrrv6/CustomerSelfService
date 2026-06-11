# Sprint Completion: Global Notification Infrastructure

## Features Delivered

### 1. Zustand Unified Store & Selector Hardening
- Implemented `notificationStore.ts` to manage active toast stacks, historical logs, muted alert codes, and filters.
- Exposed narrow selector hooks (`useAlerts`, `useUnreadCount`, `useActiveToasts`, `useMutedAlertCodes`, `useNotificationActions`) in `notificationSelectors.ts` to eliminate re-render propagation.
- Maintained 100% backward compatibility by aliasing the legacy `useNotificationsStore` in `notificationsStore.ts` to point to the new store instance, preserving 15+ audit logging features.

### 2. High-Fidelity Toast Stacking & Priority Queue
- **ToastCard**: Interactive card that renders alert metadata, occurrence count, action buttons, and a visual countdown bar.
- **ToastViewport**: Positioned relative to layout directions (bottom-right for LTR, bottom-left for RTL Arabic) and stacks toasts vertically.
- **Rate-Limiting & Pinning**: Restricts visible toasts to a maximum of 3. Critical alerts bypass auto-dismiss, auto-pin, and override stacking limits to display at the top.
- **Severity Timers**: Configured auto-dismiss timers scaled by severity: `info` (4s), `success` (5s), `warning` (8s).

### 3. Alert Lifecycle & Deduplication Strategy
- **Lifecycle States**: Alerts transition through `active`, `acknowledged`, `resolved`, and `muted`.
- **Deduplication Strategy**: Grouped repetitive alerts by `category`, `severity`, `sourceEntity`, and `alertCode`. Matches increment a repeat counter (`count`) and flash the toast briefly rather than flooding the viewport.
- **Suppression (Muting)**: Mutex switches allow administrators to mute specific alert codes. Muted codes suppress toast popups while preserving timeline logging.

### 4. SIEM Console & Drawer Orchestrator
- **Right-side Drawer**: Slides out from the screen edge (LTR/RTL mirrored), providing quick access to active alerts, timeline logs, filters, and bulk acknowledgement actions.
- **NotificationCenter Overlay**: Full-screen modal overlay for advanced operations monitoring. Integrates:
  - Search inputs filtering telemetry and audit events.
  - Switch toggles for muting alert codes to suppress toasts.
  - Tabbed viewport showing historical telemetry logs and immutable SIEM security logs.

### 5. Decoupled Simulation & Event Instrumentation
- **Simulation Engine**: Isolated hook `useNotificationSimulator` running random background alerts (SLA breaches, queue overflows, API timeouts, etc.) when toggled.
- **Interactive Controls**: Embedded developer controls inside the drawer to toggle, monitor, and reset the simulation interval.
- **Instrumentation**: Connected alerts to the following key modules:
  - **SLA Dashboard**: Simulate SLA breaches.
  - **Queue Roster**: Trigger staffing shortages and volume spikes.
  - **Safety Guardrails**: Sandbox evaluation PII redaction and jailbreak intercepts.
  - **Dialog Flow Builder**: Simulates API timeouts, low RAG search confidence, and escalation overrides.
  - **Training Intelligence**: Publishes intents to active registries.
  - **Vector DB Status**: Compaction failure locks and rebalance completions.
