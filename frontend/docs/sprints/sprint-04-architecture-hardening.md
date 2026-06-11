# Sprint 04 — Architecture Hardening Plan
## CustomerSelfService Platform — Sprint Plans

**Execution Window:** Sprint 04 (1.5 Weeks)  
**Last Updated:** 2026-06-03T16:50:54+05:30  
**Priority:** 🟡 ARCHITECTURE & TECH DEBT RESOLUTION  
**Risk Level:** High (Refactoring core layout and state context)  
**Complexity Estimate:** High (20 Story Points / 8 Person-Days)  

---

## 1. Sprint Goal

Break down massive monolithic code structures (specifically the SLA Analytics, Customer Portal Layout, and global AppContext files) into isolated, domain-specific, and unit-testable files to reduce development hot-reload latency, prevent global rendering crashes via React Error Boundaries, and improve codebase maintainability.

---

## 2. Scope & Target Areas

This sprint targets global state management, layout routing wrappers, and analytic reporting modules across the following files:
* `/frontend/src/components/analytics/SlaAnalytics.tsx`
* `/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx`
* `/frontend/src/context/AppContext.tsx`
* `/frontend/src/components/shared/ErrorBoundary.tsx`
* `/frontend/README.md` and root `README.md`

---

## 3. Implementation Tasks

### Task 1: Decompose `SlaAnalytics.tsx` Monolith (H2)
* **Goal:** Break up the 1,774-line dashboard into smaller components to improve compilation and testability.
* **Implementation:** Decompose into:
  - `SlaBreachMonitor.tsx` — Grid display of real-time SLA breach incidents.
  - `SlaQueueHealth.tsx` — Quick status badges of queues under breach risk.
  - `SlaTrendCharts.tsx` — Tabs containing historical trend charts.
  - `SlaIncidentTimeline.tsx` — Chronological log of incident transitions.
  - `SlaLeaderboard.tsx` — Agent leaderboard ranking by compliance.
  - `SlaAIInsights.tsx` — AI-powered workforce scheduling recommendation panel.
  - `SlaAnalytics.tsx` — Orchestrator component.
* **Affected Modules:** Admin Analytics Dashboard
* **Complexity:** 6 SP (2.5 Days)

### Task 2: Decompose `CustomerPortalLayout.tsx` (M11)
* **Goal:** Split the 714-line customer layout file into specialized subscreen views.
* **Implementation:** Extract sections inside the `activeSubScreen` branch logic:
  - `TicketFormView.tsx` — Subscreen layout for ticket creation form.
  - `TicketListView.tsx` — Table layout of existing support tickets.
  - `KnowledgeSearchView.tsx` — Knowledge base browse and search screen.
  - `PortalHomeView.tsx` — Welcome panel and action cards.
* **Affected Modules:** Customer Portal Home
* **Complexity:** 5 SP (2 Days)

### Task 3: Refactor Global `AppContext.tsx` State (M9)
* **Goal:** Split global monolithic state provider to reduce unnecessary renders.
* **Implementation:** Split context state into dedicated domain contexts:
  - `TicketsContext.tsx` (manages ticket lists and lifecycle updates)
  - `BotsContext.tsx` (manages conversation templates and nodes)
  - `KbContext.tsx` (manages knowledge sources and ingestion status)
* **Affected Modules:** Global State Providers
* **Complexity:** 5 SP (2 Days)

### Task 4: Implement React Error Boundaries (M8)
* **Goal:** Insulate dashboard frames and portal sections from complete page crashes.
* **Implementation:** Create a reusable `ErrorBoundary.tsx` component. Wrap core router segments and high-complexity analytics views (e.g. SLA dashboards) in boundary wrappers displaying fallback error cards.
* **Affected Modules:** Shared UI, App Routing Portal
* **Complexity:** 2 SP (0.5 Day)

### Task 5: Standardize Repository Documentation (M10)
* **Goal:** Update the workspace READMEs to detail setup guidelines and architectural rules.
* **Implementation:** Revamp `README.md` files with clear details on directory structures, local dev setup instructions, environment configurations, and the newly established context separation guidelines.
* **Affected Modules:** Documentation
* **Complexity:** 2 SP (1 Day)

---

## 4. Dependencies

* **Task 1** relies on consistent formats in `/frontend/src/utils/mockData.ts` or local analytics helper functions.
* **Task 3** requires updating consumer hooks/components that import and execute `useApp()`.

---

## 5. Expected Outcomes & Production Impact

* **Outcome:** Zero functional regressions across customer screens and SLA tabs. Hot-reload speed in dev mode decreases under 1 second.
* **Production Impact:** Localized runtime javascript errors in complex widgets (like charts) no longer crash the customer's portal or the agent's dashboard.

---

## 6. Verification Requirements & Checklist

- [ ] Execute `npm run build` and `npm run typecheck` to confirm refactored modular hooks/contexts pass Next.js compilation.
- [ ] Open the Customer Portal. Navigate through every sub-screen (Home, Tickets, Knowledge, Order tracking). Ensure UI is visually identical to the monolithic version.
- [ ] Go to SLA Analytics tab. Switch between trend views, breach monitors, and incident lists to confirm state doesn't wipe on tab click.
- [ ] Inject an intentional runtime error in `SlaTrendCharts.tsx` (e.g. rendering undefined object properties). Confirm the error boundary catches it, shows a neat diagnostic panel, and the sidebar/navigation remains interactive.
