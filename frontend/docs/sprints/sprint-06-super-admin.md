# Sprint 06 — Super Admin Platform Configuration & Telephony Setup
## CustomerSelfService Platform — Sprint Plans

**Execution Window:** Sprint 06 (2 Weeks)  
**Last Updated:** 2026-06-03T17:39:32+05:30  
**Priority:** 🟡 SUPER SAAS CORE ROUTING & CONFIGURATION  
**Risk Level:** Medium (Sidebar restructuring & layout containers updates)  
**Complexity Estimate:** High (23 Story Points / 10 Person-Days)  

---

## 1. Sprint Goal

Implement the core platform operator surfaces (Tenant onboarding template wizard, Number pool, Knowledge connector registry) and restructure the Super Admin sidebar navigation into structured, compact categories matching the inventory PDF categories.

---

## 2. Scope & Target Areas

This sprint targets settings registries, provisioning wizards, container components, and navigation switches inside:
* `/frontend/src/components/super-admin/` (NEW container tabs and controllers)
* `/frontend/src/components/dashboard/Sidebar.tsx` (sidebar grouping and category headers)
* `/frontend/src/lib/rbac/permissions.ts` (route permissions mapping)

---

## 3. Implementation Tasks

### Task 1: Build Tenant Onboarding Template Wizard (Screen 9)
* **Goal:** Enable provisioning new customer tenants.
* **Implementation:** Create `TenantOnboardingWizard.tsx` tab containing a 3-step wizard:
  - Step 1: Organization details (Org name, Tenant ID, primary domain).
  - Step 2: Intent library selection (select Banking/Retail/Telecom templates).
  - Step 3: Resource bounds (caps on monthly tokens, max concurrent bots).
* **Affected Modules:** Master Data
* **Complexity:** 5 SP (2 Days)

### Task 2: Build Number Pool Manager (Screen 14)
* **Goal:** Manage Direct Inbound Dial (DID) number pools and tenant routing.
* **Implementation:** Create `NumberPoolTab.tsx` providing:
  - Table of active phone numbers, with status tags (Available, Reserved, Assigned) and region identifiers.
  - "Reserve DID" modal drawer letting operators search for available numbers and assign them directly to active tenants.
* **Affected Modules:** Telephony
* **Complexity:** 4 SP (2 Days)

### Task 3: Build Knowledge Connector Registry (Screen 13)
* **Goal:** View and configure global RAG connector statuses.
* **Implementation:** Create `KnowledgeConnectorRegistry.tsx` detailing global connection status, authorization indicators, and synchronization trackers for RAG plugins (Notion, Google Drive, DB SQL adapters).
* **Affected Modules:** Infra
* **Complexity:** 4 SP (1.5 Days)

### Task 4: Polish Cross-Tenant Analytics & SIP config (Screens 10, 11, 15)
* **Goal:** Polish cost benchmarks and expand SIP parameters.
* **Implementation:** Integrate detailed curves comparisons in `SuperAdminAnalyticsTab.tsx`. Add fields for SIP trunk capacity configurations inside `SipTrunkConfigTab.tsx`.
* **Affected Modules:** Analytics, Telephony
* **Complexity:** 3 SP (1.5 Days)

### Task 5: Sidebar Layout Restructuring (Sidebar Restructuring)
* **Goal:** Group Super Admin sidebar links into the 5 inventory-safe categories and remove flat lists.
* **Implementation:** Modify [Sidebar.tsx](file:///frontend/src/components/dashboard/Sidebar.tsx) to mount Section Headers and categorize the 11 active screen IDs. Purge the dead/hallucinated `analytics_center` sidebar link.
* **Affected Modules:** Sidebar & Layout
* **Complexity:** 3 SP (1 Day)

### Task 6: Route & Navigation Permissional Normalization (Route Normalization)
* **Goal:** Configure new route IDs and access tokens.
* **Implementation:** Modify [permissions.ts](file:///frontend/src/lib/rbac/permissions.ts) to define the new active screen IDs under the `SUPER_ADMIN_SCREENS` and `ROLE_PERMISSIONS` registries.
* **Affected Modules:** RBAC Store / Router
* **Complexity:** 2 SP (1 Day)

### Task 7: Build Container Tab Components (Nested Tabs Conversion)
* **Goal:** Convert flat modules to nested tab controllers.
* **Implementation:**
  - Build `MasterDataContainer.tsx` (switching LLM registry, ASR/TTS, Channels, NLU Governance, Tenant onboarding).
  - Build `TelephonyConfigContainer.tsx` (switching DIDs, SIP Trunk).
  - Build `InfrastructureStatusContainer.tsx` (switching Vector DB, Connectors).
  - Refactor [SuperAdminLayout.tsx](file:///frontend/src/components/super-admin/shared/SuperAdminLayout.tsx) to render these container views.
* **Affected Modules:** Super Admin Layout
* **Complexity:** 2 SP (1 Day)

---

## 4. Dependencies

* All tasks depend on authentication hooks mapping the active persona as a `super_admin` role.

---

## 5. Expected Outcomes

* Platform operators can navigate the Super Admin space through a clean, compact sidebar.
* Sidebar items are grouped into Master Data, Analytics, Infra, and Telephony.
* High-volume screens (Models, Channels, Credentials) are accessible via nested tab interfaces.
* Dead links are completely resolved.

---

## 6. Verification Requirements & Checklist

- [ ] Log in as a `super_admin` account. Verify that the sidebar renders the category headers.
- [ ] Confirm clicking "Master Data" renders a top navbar with LLM Registry, ASR/TTS Provider Registry, Channel Catalog, NLU Governance, and Tenant Onboarding tabs.
- [ ] Confirm clicking "Telephony" renders a top navbar with Number Pool and SIP Trunk Config tabs.
- [ ] Confirm clicking "Infra" renders a top navbar with Vector DB Status and Knowledge Connector Registry tabs.
- [ ] Ensure that `analytics_center` does not appear in the sidebar.
- [ ] Execute `npm run typecheck` and verify compiling is error-free.
