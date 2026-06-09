# Master Plan: Super Admin Platform Configuration & Telephony Setup
## CustomerSelfService Platform — Master Plans

**Last Updated:** 2026-06-03T17:39:32+05:30  
**Architect:** Senior Enterprise Documentation Architect (Antigravity)  
**Status:** Approved for Backlog Gating  

---

## 1. Architectural Scope & Status Matrix

This matrix reviews the implementation coverage for all Super Admin screens and Common Per App modules defined in the Screen Inventory PDF:

| Category | Reference Screens | Current Implementation Status | Focus Areas / Actions |
|---|---|---|---|
| **Master Data** | LLM model registry (1)<br>ASR / TTS provider registry (2)<br>Channel catalog (3)<br>Channel provider credentials (4)<br>Industry intent libraries (5)<br>Industry response templates (6)<br>Profanity / safety blocklist (7)<br>PII redaction policy (8)<br>Tenant onboarding template (9) | 🟡 Partial | Registry tabs (1, 2) and Channel catalog (3, 4) are implemented. Intents, templates, safety blocklist, and PII policy (5, 6, 7, 8) are built inside `NluGovernanceTab.tsx` sub-tabs. Tenant onboarding template (9) wizard is missing. |
| **Analytics** | Cross-tenant analytics (10)<br>Model cost benchmarks (11) | 🟡 Partial | Renders basic metrics inside `SuperAdminAnalyticsTab.tsx`, but cost-per-conversation curve comparisons are absent. |
| **Infra** | Vector DB cluster status (12)<br>Knowledge connector registry (13) | 🟡 Partial | Vector DB status (12) is implemented. Knowledge connector registry (13) Notion and Drive connector credentials panels are missing. |
| **Telephony** | Number pool (14)<br>SIP trunk config (15) | 🟡 Partial | SIP trunk config (15) exists as a thin card without credentials fields. Number pool (14) DID routing dashboard is missing. |
| **Platform Common** | Platform Billing Plans (Common)<br>Immutable System Audit Trail (Common) | ❌ Missing | Pricing plan setups and immutable system event log tables are absent. |

---

## 2. Proposed System Design

### A. Route Management & Viewports
All screens are nested under `/super-admin/` and grouped into 5 container viewports. Switching categories displays a top tab navigation toolbar:
*   `/super-admin/master-data` (switches LLM model registry, ASR / TTS provider registry, Channel catalog, NLU Governance, and Tenant onboarding template)
*   `/super-admin/analytics` (switches Cross-tenant analytics and Model cost benchmarks)
*   `/super-admin/infra` (switches Vector DB cluster status and Knowledge connector registry)
*   `/super-admin/telephony` (switches Number pool and SIP trunk config)
*   `/super-admin/common` (switches Platform Billing Plans and Immutable System Audit Trail)

### B. State Management
Define a `SuperAdminContext.tsx` provider to fetch platform metrics, DID lists, and provider parameters to isolate operator scopes.

### C. Security Controls (RBAC)
Verify that the `ProtectedRoute` and Zustand `permissionStore` enforce strict checks (`role === 'super_admin'`) before mounting any Super Admin view.

---

## 3. Module-by-Module Actionable Backlog

### Module 1: Master Data (Screens 1–9)
* **Goal:** Centralized registries for models, speech providers, channels, NLU libraries, and tenant configurations.
* **Tasks:**
  - Build `TenantOnboardingWizard.tsx` (Screen 9) providing a 3-step provisioning wizard (Org details -> Intent Allocation -> Limits setups).
  - Verify that LLM model registry (1), ASR / TTS provider registry (2), Channel catalog (3), and Channel provider credentials (4) are fully functional.
  - Audit NLU Governance tabs for Industry intent libraries (5), Response templates (6), Profanity blocklist (7), and PII policy (8).

### Module 2: Analytics & Benchmarks (Screens 10–11)
* **Goal:** Compare cost, latency, and containment curves across tenants.
* **Tasks:**
  - Expand `SuperAdminAnalyticsTab.tsx` with dynamic line charts displaying cross-tenant containment vs. cost trends (Screen 10).
  - Implement benchmark tables comparing per-model cost metrics ($/conversation) and average response latencies (Screen 11).

### Module 3: Infra (Screens 12–13)
* **Goal:** Monitor RAG storage and configure connectors.
* **Tasks:**
  - Build `KnowledgeConnectorRegistry.tsx` (Screen 13) detailing global notion/drive statuses and enable/disable toggle config panels.
  - Confirm `VectorDbStatusTab.tsx` (Screen 12) renders compact details of DB clusters and reindexing events.

### Module 4: Telephony (Screens 14–15)
* **Goal:** Configure DID numbers and active trunk SIP bounds.
* **Tasks:**
  - Build `NumberPoolTab.tsx` (Screen 14) providing filters to search, purchase, and route DIDs to active tenants.
  - Expand `SipTrunkConfigTab.tsx` (Screen 15) stub to include fields for gateway credentials, channel concurrency thresholds, and primary failover routing inputs.

### Module 5: Platform Common (Common Per App)
* **Goal:** Platform-wide controls for subscription plans and SIEM logs.
* **Tasks:**
  - Build `GlobalBillingPlans.tsx` tab to adjust billing variables and define default tier thresholds (Free/Pro/Enterprise limits).
  - Build `PlatformAuditTrail.tsx` datagrid rendering logs of all platform operator changes, credential adjustments, and data exports.

---

## 4. Implementation Phases & Sequence

To adhere to the Vibe Coding principles of small, verifiable steps, the Super Admin orchestration is scheduled across two distinct sprints (Sprints 06 and 07).

### Phase 6A: Super Admin Core Configuration & Routing (Sprint 06)
* **Expected Outcome:** A functional operator portal showing category headers in the sidebar, nested tabs containers, and onboarding/telephony setups.
* **Important Constraints:**
  - Enforce `role === 'super_admin'` checks in components.
  - Sidebar labels must match category names exactly.
* **Manual Outcome You Should See:**
  1. Log in as `super_admin` in the demo sandbox. Confirm the sidebar renders Master Data, Analytics, Infra, Telephony, and Platform Common headers.
  2. Navigate to "Master Data", open the "Tenant Onboarding" tab, complete the 3 steps of the wizard, and verify the record is added to the roster.
  3. Navigate to "Telephony", open the "Number Pool" tab, search for numbers, and assign an available DID. Confirm the status updates to "Assigned".
  4. Navigate to "Infra" -> "Knowledge Connectors" and verify standard connectors can be toggled.

### Phase 6B: Super Admin Enterprise Operations & Common (Sprint 07)
* **Expected Outcome:** A compliance and billing console managing global billing rates and system audit logs.
* **Important Constraints:**
  - The audit log trail must be read-only in frontend state.
* **Manual Outcome You Should See:**
  1. Open the "Platform Common" -> "Platform Billing Plans" tab, adjust the cost parameters, and verify saving displays a success toast.
  2. Perform a settings update (e.g. SIP config), navigate to "Immutable System Audit Trail", and verify the event is logged.
