# Client Admin State Persistence Audit

This document records the architecture, state definitions, and local persistence validation parameters for the Client Admin workspace in Sprint 09 Phase 06.

---

## 1. Persistence Adapter Configuration

* **Store Engine**: Zustand
* **Middleware**: `persist` from `zustand/middleware`
* **Local Storage Key**: `client-admin-persistence`
* **Synchronization**: Synchronizes automatically on state update. Handles server-side rendering (SSR) hydration safety via client-side mount guards (`isMounted`).
* **Dynamic Accent Synchronization**: On rehydration, executes `applyAccentToDom` to bind saved `--primary-accent` theme colors to the document element styles list.

---

## 2. Persisted State Structures

The following state slices are managed inside [clientAdminPersistenceStore.ts](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/stores/clientAdminPersistenceStore.ts):

### A. Campaigns (`campaigns`)
Stores marketing broadcast metadata.
```typescript
interface Campaign {
  id: string;
  name: string;
  channel: 'email' | 'sms' | 'whatsapp';
  audienceSize: number;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'failed';
  sent: number;
  openRate: number;
  delivered: number;
  failedCount: number;
}
```

### B. IVR & Telephony (`ivrFlows`, `providers`, `sipLogs`)
Stores interactive voice trees and SIP telephony trunk connections status.
```typescript
interface IvrFlow {
  id: string;
  name: string;
  language: string;
  nodesCount: number;
  callsHandled: number;
  status: 'active' | 'inactive';
}

interface TelephonyProvider {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'error' | 'disconnected';
  activeTrunks: number;
}

interface SipLog {
  id: string;
  timestamp: string;
  direction: 'inbound' | 'outbound';
  from: string;
  to: string;
  durationSec: number;
  status: 'completed' | 'failed' | 'dropped';
  flowName: string;
  path: string[];
}
```

### C. Automation (`rules`, `automationLogs`)
Stores triggered automation rules and execution histories.
```typescript
interface AutomationRule {
  id: string;
  name: string;
  triggerEvent: string;
  triggerEventAr: string;
  conditions: string;
  conditionsAr: string;
  action: string;
  actionAr: string;
  enabled: boolean;
  category: 'security' | 'routing' | 'billing' | 'system';
  severity: 'info' | 'warning' | 'critical';
  triggerCount: number;
  lastExecuted: string | null;
}
```

### D. Exporter & Reports (`schedules`, `exportHistory`)
Stores scheduled automated delivery rules and client-side compiled CSV downloads history.
```typescript
interface ReportSchedule {
  id: string;
  name: string;
  schedule: string;
  format: 'PDF' | 'CSV';
  sendTo: string;
  nextTrigger: string;
}

interface ExportHistoryItem {
  id: string;
  fileName: string;
  format: 'PDF' | 'CSV';
  timestamp: string;
  size: string;
  status: 'ready' | 'expired';
}
```

### E. Compliance Audit Trails (`auditLogs`, `pinnedAuditLogIds`)
Stores audit security traces and client action triggers.
```typescript
interface ClientAuditLog {
  id: string;
  timestamp: string;
  category: 'security' | 'api' | 'ai' | 'user';
  action: string;
  actionAr: string;
  actor: string;
  ip: string;
  severity: 'info' | 'warning' | 'critical';
  payload: Record<string, any>;
}
```

### F. Alerts & Notifications (`notifications`)
Stores live telemetry operational alerts.
```typescript
interface ClientNotification {
  id: string;
  timestamp: string;
  category: 'sla' | 'security' | 'webhook' | 'system';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  read: boolean;
}
```

### G. Brand Settings (`settings`)
Stores primary theme accent colors, deflection preferences, and localized language configurations.
```typescript
interface TenantSettings {
  tenantName: string;
  logoUrl: string;
  themeMode: 'system' | 'dark' | 'light';
  accentColor: string;
  standardWait: number;
  vipWait: number;
  warnTimeout: number;
  aiDeflection: boolean;
  ragSearch: boolean;
  autoRetry: boolean;
  webhookLog: boolean;
  defaultLang: 'en' | 'ar';
}
```

---

## 3. Operational State Mutators

* **Campaigns**: `addCampaign`, `togglePauseCampaign`, `cloneCampaign`, `archiveCampaign`, `updateCampaignDelivery`, `clearCampaigns`.
* **Voice / IVR**: `addIvrFlow`, `toggleIvrStatus`, `toggleProviderStatus`, `addSipLog`, `clearSipLogs`.
* **Automation Rules**: `addAutomationRule`, `toggleAutomationRule`, `deleteAutomationRule`, `triggerAutomationLog`, `incrementAutomationTrigger`, `clearRules`.
* **Reports**: `addReportSchedule`, `deleteReportSchedule`, `addExportHistory`.
* **Audit Logs**: `addAuditLog`, `togglePinAuditLog`.
* **Notifications**: `addNotification`, `markNotificationRead`, `markAllNotificationsRead`, `dismissNotification`.
* **Settings**: `updateSettings`, `resetSettings`.
