# Technical Debt & Refactoring Roadmap
## CustomerSelfService Platform — Sprint Planning Reports

**Last Updated:** 2026-06-03T16:50:54+05:30  
**Status:** Planning Phase Completed  
**Compiler:** Senior Frontend Delivery Architect (Antigravity)  

---

## 1. Core Refactoring Objectives

To sustain high performance, modularity, and easy scaling, the development team must address architectural hot-spots. The primary focus of the refactoring track is decomposing monolithic components, isolating global states, and enforcing clean code structure rules.

---

## 2. Target Monolith Decompositions (Sprint 04 Focus)

### A. Decomposing `SlaAnalytics.tsx` (86KB / 1,774 Lines)
* **Problem:** Large file violating file size rules. Slows development compilation times and prevents writing targeted unit tests.
* **Proposed Layout Extraction:**
  ```mermaid
  graph TD
      orchestrator[SlaAnalytics.tsx - Orchestrator] --> breach[SlaBreachMonitor.tsx]
      orchestrator --> queue[SlaQueueHealth.tsx]
      orchestrator --> charts[SlaTrendCharts.tsx]
      orchestrator --> timeline[SlaIncidentTimeline.tsx]
      orchestrator --> board[SlaLeaderboard.tsx]
      orchestrator --> insights[SlaAIInsights.tsx]
  ```
* **Separation Steps:**
  1. Move breach event mock lists and table configurations to `SlaBreachMonitor.tsx`.
  2. Isolate charts container logic and Recharts bindings in `SlaTrendCharts.tsx` with memoized data hooks.
  3. Extract leaderboards and recommendation panels.
  4. Retain `SlaAnalytics.tsx` as a thin tab controller importing and rendering these sub-components.

### B. Decomposing `CustomerPortalLayout.tsx` (714 Lines)
* **Problem:** Layout files should only handle margins, wrappers, and route gateways. `CustomerPortalLayout` currently contains inline JSX blocks for five different client views.
* **Proposed Layout Extraction:**
  - Create directory `src/components/customer-portal/views/`.
  - Extract `PortalHomeView.tsx` (welcome banner, quick CTA grid).
  - Extract `TicketListView.tsx` (data tables for client tickets).
  - Extract `TicketFormView.tsx` (ticket creation inputs, validation states).
  - Extract `KnowledgeSearchView.tsx` (search inputs and category grids).
* **State Cleanups:** Pass current user session hooks and setter functions down as explicit props or retrieve them via contextual selectors.

### C. Refactoring Global `AppContext.tsx` State
* **Problem:** AppContext is a general-purpose state bucket. A state change in tickets triggers re-renders on the admin configurations screen.
* **Proposed Splitting Strategy:**
  - Split into three domain context providers in `src/context/`:
    1. `TicketsContext.tsx` — Handles active ticket queries, category tabs, and submission loads.
    2. `BotsContext.tsx` — Handles bot node variables and draft publish states.
    3. `KbContext.tsx` — Handles mock files ingestion statuses.
  - Keep `AppContext.tsx` only for global preferences (RTL/LTR direction toggles, language, theme).

---

## 3. Shared UI Extractions & Reusable Hooks

### Shared Components
* **`StatusBadge.tsx`:** Standardize status indicators across tickets, SLA compliance levels, and workforce shifts. Replace duplicated status switch conditions.
* **`OtpVerificationModal.tsx`:** Consolidate the OTP verification interfaces inside `src/components/shared/` to support both order lookups and invoice access points.

### Reusable Custom Hooks
* **`useTranslation` / `useLocale`:** Consolidate translation context selectors.
* **`useToast`:** Standardize alert messaging triggers (`toast.success(...)`, `toast.error(...)`) to replace inline mock alerts.

---

## 4. Code Quality & Size Guidelines

To prevent the recurrence of architectural debt, the project adopts these rules for new code submissions:

1. **Component Length Cap:** No single React file should exceed **400 lines**. If a file grows beyond this threshold, extract its sub-structures or sub-charts.
2. **Modular Directories:** Place components in folders named after their scope (e.g. `src/components/client-admin/qa/` or `src/components/customer-portal/orders/`). Avoid dumping components directly into generic parent folders.
3. **State Isolation:** Maintain state as close to the target UI elements as possible. Avoid pushing transient states (e.g. modal open toggles) to global contexts.
4. **Type safety:** All custom payloads must define typescript interface contracts. Avoid using `any` types.
