# ADR-001 — Zustand Store Migration Strategy

**Date:** 2026-06-01  
**Status:** Accepted  
**Sprint:** Sprint 1 — Global Architecture Stabilization

---

## Context

The `AppContext.tsx` (414 lines) was a God Context holding 15+ entity slices consumed by ~40 files. Every AppContext state update (e.g., a bot list change, an ingestion log update) caused ALL consumers to re-render regardless of whether they used the changed slice.

## Decision

Migrate **only genuinely cross-feature shared state** to Zustand. Feature-scoped entity state stays in AppContext.

## Store Ownership Map

| State | Store | Justification |
|---|---|---|
| `lang`, `theme` | `uiStore` | Consumed by ~35 and ~20 files across all portals. Global UI metadata. |
| `role` | `authStore` | RBAC gate in ~40 files spanning all 5 portals simultaneously. |
| `auditLogs`, `addAuditLog` | `notificationsStore` | Written by 15+ features, read by the audit dashboard. Classic pub-sub shared state. |

## What Stays in AppContext

| State | Reason |
|---|---|
| `bots`, `createBot` | Only written/read by `BotsTab.tsx` |
| `intents`, `setIntents` | Only NLU and Training tabs |
| `conversations`, messaging actions | Only Agent Workspace |
| `agents` | Only TransferModal + AgentWorkspace (same feature) |
| `knowledgeSources`, `ingestionLogs` | Only KB tab |
| `channels`, `llmModels`, `asrProviders` | Only Super Admin tabs |
| `tickets`, `slaRules`, `qaReviews`, `callLogs` | Only operations/ticket tabs |

## What Stays as Local State

All ephemeral UI state remains as component-level `useState`:
- Modal open/close flags (showTransferModal, showWrapupModal, etc.)
- Wizard step counters (wizardStep in BotsTab)
- Voice call state (via `useCallState` hook — session-lived)
- AUX timer (via `useQueueMetrics` hook — session-lived)
- Form field values (newBotName, testQuery, etc.)
- Voice sub-tab selection (voiceTab)

## Migration Pattern

### Compatibility Shim
AppContext reads from Zustand stores via selectors and re-exposes the values through the existing context interface. All existing `useApp()` call sites continue working unchanged.

High-priority components are updated to use store selectors directly for render efficiency.

### Selector Rule
All Zustand consumers MUST use field selectors:
```typescript
// ✅ Correct — only re-renders when lang changes
const lang = useUIStore((s) => s.lang);

// ❌ Wrong — re-renders on any store update
const { lang, theme } = useUIStore();
```

## Consequences

**Benefits:**
- Components that only need `lang` no longer re-render on bot list changes
- `addAuditLog` calls (15+ features) no longer cascade re-renders to all AppContext consumers
- Zustand stores are testable in isolation without React tree setup
- Foundation for future incremental migration

**Trade-offs:**
- AppContext still re-renders on feature-scoped state changes (bots, conversations, etc.) — future sprint work
- Compatibility shim means dual state system for a period — acceptable for safe incremental migration

## Future Migration Path

Sprint 2 candidates (not in scope for Sprint 1):
- `conversations` → `inboxStore` (isolate agent workspace rendering)
- `tickets`, `slaRules` → `operationsStore`
- `bots`, `intents` → `trainingStore`
