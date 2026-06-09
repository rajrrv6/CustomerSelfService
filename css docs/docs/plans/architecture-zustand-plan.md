# Architecture Plan: Zustand State Management & Hook Conventions

**Sprint:** Sprint 1 — Global Architecture Stabilization  
**Author:** Antigravity  
**Status:** Approved  

---

## 1. Store Ownership Diagram

The state layout is segregated into globally shared Zustand stores (cross-feature) and context-based feature stores:

```mermaid
graph TD
    subgraph Zustand Stores (Cross-Feature Shared)
        UI[uiStore: lang, theme]
        Auth[authStore: role]
        Notif[notificationsStore: auditLogs]
    end

    subgraph Context & Local (Feature-Scoped)
        AppCtx[AppContext: conversations, bots, intents, knowledgeSources, tickets]
        LocalState[Local useState: wizardStep, activeTab, voiceCall]
    end

    UI --> |Compatibility Shim| AppCtx
    Auth --> |Compatibility Shim| AppCtx
    Notif --> |Compatibility Shim| AppCtx

    AppCtx --> |useApp| Components[Legacy Consumer Components]
    UI --> |useUIStore Selector| DirectComponents[Optimized Components: TrainingTab, AgentWorkspaceLayout, BotsTab]
    Auth --> |useAuthStore Selector| DirectComponents
    Notif --> |useNotificationsStore Selector| DirectComponents
```

---

## 2. Store Boundaries & Responsibility Matrix

### UI Store (`src/stores/uiStore.ts`)
- **Responsibility**: Global interface configurations.
- **State**: `lang` ('en' | 'ar'), `theme` ('light' | 'dark' | 'system').
- **Side Effects**: Automatically handles writing to `localStorage`, matching preferred system scheme listeners, and modifying HTML layout attributes (`dir="rtl"`, classes, theme-color).

### Auth Store (`src/stores/authStore.ts`)
- **Responsibility**: RBAC validation flags.
- **State**: `role` (UserRole type).
- **Side Effects**: Persists to `localStorage` to allow seamless multi-tab RBAC gating without flashing defaults.

### Notifications Store (`src/stores/notificationsStore.ts`)
- **Responsibility**: System-wide log dispatch.
- **State**: `auditLogs` array.
- **Actions**: `addAuditLog` prepend handler. Isolates log logging updates so that a log append does not re-render every view in the application.

---

## 3. Hook Conventions

To manage state cleanups and keep component markup (JSX) clean, we adhere to four core custom hooks:

### A. Filters & View State (`src/hooks/useInboxFilters.ts`)
Encapsulates conversation searches and category tab filtering logic. Separates component rendering from collection manipulation:
```typescript
const { filteredConversations, activeTab, setActiveTab } = useInboxFilters(conversations);
```

### B. Composed Telephony (`src/hooks/useVoiceState.ts`)
Integrates the underlying individual hook surfaces (`useCallState`, `useDialer`, `useVoiceQueue`, `useSupervisorVoice`) into a single state boundary. Replaces verbose hook wiring declarations in `AgentWorkspaceLayout`:
```typescript
const voice = useVoiceState(addAuditLog, initialHistory);
```

### C. Session & Metrics (`src/hooks/useQueueMetrics.ts`)
Owns AUX states, AUX ticking duration counts, and active capacity calculations:
```typescript
const { auxStatus, auxSeconds, formatAuxTime } = useQueueMetrics();
```

### D. Semantic Breakpoints (`src/hooks/useResponsiveLayout.ts`)
Exposes reactive JS breakpoints to control layout structures (e.g. sidebar panels versus overlay dialog sheets) programmatically:
```typescript
const { isMobile, isDesktop } = useResponsiveLayout();
```
