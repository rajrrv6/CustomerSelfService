# Sprint 03 — Admin & Workspace Plan
## CustomerSelfService Platform — Sprint Plans

**Execution Window:** Sprint 03 (2 Weeks)  
**Last Updated:** 2026-06-03T16:50:54+05:30  
**Priority:** 🟠 HIGH PRIORITY IMPLEMENTATION GAPS  
**Risk Level:** Medium (Settings and rule extensions)  
**Complexity Estimate:** High (22 Story Points / 10 Person-Days)  

---

## 1. Sprint Goal

Complete key administrative settings panels (Knowledge ingestion, SLA rules CRUD, escalation matrix builder) and wire orphaned ecosystem integration dashboards to ensure client administrators can fully manage active bot nodes.

---

## 2. Scope & Target Areas

* `/frontend/src/components/client-admin/knowledge/` (KnowledgeBaseTab.tsx additions)
* `/frontend/src/components/client-admin/operations/` (Escalation rules, SLA CRUD panels)
* `/frontend/src/components/integrations/` (Orphaned integrations view dashboard)
* `/frontend/src/components/agent-workspace/` (Conference/Hold panels)

---

## 3. Implementation Tasks

### Task 1: Build Knowledge Source Ingestion Modals (H9 / Screens 44–47)
* **Goal:** Enable file uploads, site crawls, Notion links, and DB connectors in the Knowledge Admin tab.
* **Implementation:** Create modal triggers in `KnowledgeBaseTab.tsx` linking to:
  - `SourceFileUploadModal.tsx` (drag/drop UI, upload bars)
  - `SourceUrlCrawlModal.tsx` (domain scope, limit crawlers)
  - `SourceConnectorModal.tsx` (Notion, Drive setup oauth cards)
  - `DatabaseConnectorModal.tsx` (DB credential fields, query schedules)
* **Complexity:** 5 SP (3 Days)

### Task 2: Build Escalation Matrix Rules Engine (H6 / Screen 83)
* **Goal:** Auto-escalate tickets failing SLA thresholds.
* **Implementation:** Create `EscalationMatrix.tsx` rules configuration panel under `components/client-admin/operations/`. Build grid interfaces editing rule conditions (Time elapsed, priority, tag) and actions (re-assign to supervisor, send notifications).
* **Complexity:** 4 SP (2 Days)

### Task 3: Create SLA Configuration CRUD Operations (M4 / Screen 81)
* **Goal:** Enable creating and editing SLA rule policies.
* **Implementation:** Expand `SlaTab.tsx` rules grid inside client admin settings. Allow addition of SLA conditions (Target response times, resolving thresholds, grace window bounds) publishing updates to the SLA context state.
* **Complexity:** 4 SP (2 Days)

### Task 4: Reconnect Unwired Integration Panels (H3)
* **Goal:** Bring 12 integration helper components back into active admin routes.
* **Implementation:** Ensure all unreferenced tabs (ApiCredentialVault, RetryQueuePanel, SyncTimeline, ConflictResolutionDrawer) are mounted correctly inside `IntegrationsDashboard.tsx` view router tabs.
* **Complexity:** 3 SP (1.5 Days)

### Task 5: Refine Agent Workspace Hold & Conference Modals (M2 / Screen 138)
* **Goal:** Add visual realism to agent workspace stubs.
* **Implementation:** Upgrade [ConferenceModal.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/components/agent-workspace/ConferenceModal.tsx) to support adding participants and updating call timelines, and add live timers to the Hold notification dock in the workspace layout.
* **Complexity:** 3 SP (1.5 Days)

---

## 4. Dependencies

* **Task 1** connects to mock ingest data logs in `mockData.ts`.
* **Task 2** relies on rules stores to persist active escalation chains.

---

## 5. Expected Outcomes

* Administrators can upload, configure, and monitor knowledge indexes.
* SLA policies and auto-escalation gates are fully configurable.
* Core agent call actions (Hold, Conference, Transfer) have functional UI loops.

---

## 6. Verification Requirements

- [ ] Open the Knowledge tab in admin. Click "Add Source". Open and submit each of the 4 source modals. Verify mock files populate the logs database.
- [ ] Create an SLA policy rule. Verify it is persisted in the policy table.
- [ ] Open the integrations console. Confirm overview, marketplace, webhooks, and credential vault panels render with valid seed metrics.
