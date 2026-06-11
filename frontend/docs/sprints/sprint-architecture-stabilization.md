# Sprint 1 — Global Architecture Stabilization

**Date:** 2026-06-01  
**Status:** Complete  
**Goal:** Establish Zustand store foundation, slim God Context, extract reusable hooks, improve rendering boundaries.

---

## What Was Done

### Zustand Foundation (Phase 1–2)
- Installed `zustand` package
- Created `src/stores/uiStore.ts` — owns `lang` and `theme`, handles localStorage persistence and DOM side-effects internally
- Created `src/stores/authStore.ts` — owns `role`, reads initial value from localStorage
- Created `src/stores/notificationsStore.ts` — owns `auditLogs` and `addAuditLog`
- Created `src/stores/index.ts` — barrel export

### AppContext Slimming (Phase 3 — Compatibility Shim)
- `AppContext.tsx` now reads `lang`, `theme`, `role`, `auditLogs`, `addAuditLog` from Zustand stores via selectors
- Removed 3 `useEffect` blocks for localStorage + DOM side-effects (handled in stores)
- Removed `addAuditLog` function body (delegated to `notificationsStore`)
- All existing `useApp()` consumers unchanged — backward compatible
- File reduced from ~414 lines to ~340 lines

### Surgical Consumer Updates (Phase 4)
- `AgentWorkspaceLayout.tsx` — uses `useUIStore(s => s.lang)` and `useNotificationsStore(s => s.addAuditLog)` directly
- `TrainingTab.tsx` — uses narrow selectors for `lang`, `role`, `addAuditLog`
- `BotsTab.tsx` — uses narrow selectors for `lang`, `addAuditLog`

### Hook Extraction (Phase 5)
- `src/hooks/useInboxFilters.ts` — inbox tab/search/queue filter state + memoized filteredConversations
- `src/hooks/useVoiceState.ts` — composes 4 telephony hooks into one surface, includes callHistory and parkedHeldCall state
- `src/hooks/useQueueMetrics.ts` — AUX timer + active conversation count
- `src/hooks/useResponsiveLayout.ts` — named breakpoints (isMobile, isTablet, isDesktop)
- `AgentWorkspaceLayout.tsx` updated to use all 4 new hooks — removed ~70 lines of inline hook wiring and timer logic

---

## Files Changed

### New
- `src/stores/uiStore.ts`
- `src/stores/authStore.ts`
- `src/stores/notificationsStore.ts`
- `src/stores/index.ts`
- `src/hooks/useInboxFilters.ts`
- `src/hooks/useVoiceState.ts`
- `src/hooks/useQueueMetrics.ts`
- `src/hooks/useResponsiveLayout.ts`
- `docs/decisions/adr-001-zustand-migration.md`
- `docs/plans/architecture-zustand-plan.md`
- `docs/checkpoints/checkpoint-sprint1-architecture.md`

### Modified
- `package.json` (added `zustand`)
- `src/context/AppContext.tsx` (compatibility shim)
- `src/components/agent-workspace/AgentWorkspaceLayout.tsx`
- `src/components/client-admin/bots/BotsTab.tsx`
- `src/components/client-admin/training/TrainingTab.tsx`
- `AGENTS.md` (added State Management section)

---

## Architecture Rules Followed
- Zustand only for cross-feature shared state (3 stores, ≤4 fields each)
- Ephemeral/wizard/modal state stays as local `useState`
- Selector-based subscriptions throughout (no React.memo)
- No async abstraction layers
- No service/repository pattern
- Compatibility shim ensures zero breaking changes to existing consumers
- Incremental migration — AppContext still serves feature-scoped state
