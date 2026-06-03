# Super Admin Navigation & Routing Architecture Audit
## CustomerSelfService Platform — Routing & Layout Plans

**Last Updated:** 2026-06-03T17:44:14+05:30  
**Lead Architect:** Senior Enterprise Frontend Auditor (Antigravity)  
**Status:** Approved for Backlog Gating  

---

## 1. Current Navigation Problems Identified

A deep audit of the current sidebar in [Sidebar.tsx](file:///frontend/src/components/dashboard/Sidebar.tsx) and route dispatchers reveals the following architectural issues:

1. **Flat Sidebar Clutter:** The current Super Admin view lists all screens (`llm_registry`, `asr_tts_registry`, `channels`, `nlu_governance`, `cost_benchmarks`, `cross_tenant_analytics`, `vector_db`, `sip_trunk`) as flat, top-level sidebar items.
2. **Dead / Hallucinated Links:** The sidebar lists `analytics_center` as a link for the `super_admin` role. However, there is no corresponding handler for `analytics_center` in [SuperAdminLayout.tsx](file:///frontend/src/components/super-admin/shared/SuperAdminLayout.tsx), meaning that clicking it leads to a "Screen not implemented" default page.
3. **Disjointed Groupings:** Analytics and cost metrics are split into flat items (`cost_benchmarks` and `cross_tenant_analytics`), whereas they represent tabs under the single **Analytics** module.
4. **Missing Top-level Modules:** Platform Billing Plans and the Immutable System Audit Trail are not mounted anywhere in the navigation structure.
5. **No Category Groupings:** The sidebar lists menus as a flat list under "SUPER ADMIN Options" without grouping them into the functional categories defined in the screen inventory PDF (Master Data, Analytics, Infra, Telephony).

---

## 2. Corrected Navigation Hierarchy (Compact & Grouped)

To deliver a premium, enterprise-grade operator console, the sidebar is organized into **6 functional categories** matching the categories defined in the screen inventory PDF and Common Per App specifications:

```
PLATFORM OPERATOR SIDEBAR
├── 1. Master Data [Tabs: LLM model registry, ASR / TTS provider registry, Channel catalog, NLU governance, Tenant onboarding template]
├── 2. Analytics [Tabs: Cross-tenant analytics, Model cost benchmarks]
├── 3. Infra [Tabs: Vector DB cluster status, Knowledge connector registry]
├── 4. Telephony [Tabs: Number pool, SIP trunk config]
├── 5. Billing [Standalone Page: Platform Billing Plans]
└── 6. Audit & Compliance [Standalone Page: Immutable System Audit Trail]
```

Within categories 1 to 4, we use nested tabs to navigate between the screens. Categories 5 and 6 are mounted directly.

---

## 3. Explicit Screen & Module Placement Matrix

This matrix maps all 15 screens from the screen inventory PDF plus Common Per App operator modules to their exact navigation category and viewport type:

| Screen Name | Spec ID | Sidebar Placement | Viewport Type | Trigger / Action Controls |
|---|---|---|---|---|
| **LLM model registry** | Screen 1 | Master Data | Nested Tab | Action Modals: Add Model, API Key Reveal |
| **ASR / TTS provider registry** | Screen 2 | Master Data | Nested Tab | Action Modal: Add Speech Provider |
| **Channel catalog** | Screen 3 | Master Data | Nested Tab | Unified card grid |
| **Channel provider credentials** | Screen 4 | Master Data | Drawer | Action Drawer: Add Credentials Form |
| **Industry intent libraries** | Screen 5 | Master Data | Sub-tab (NLU) | Load pre-built intent libraries |
| **Industry response templates** | Screen 6 | Master Data | Sub-tab (NLU) | Load response templates |
| **Profanity / safety blocklist** | Screen 7 | Master Data | Sub-tab (NLU) | Modify word filters |
| **PII redaction policy** | Screen 8 | Master Data | Sub-tab (NLU) | Toggle default PII redactors |
| **Tenant onboarding template** | Screen 9 | Master Data | Nested Tab | 3-step provisioning wizard |
| **Cross-tenant analytics** | Screen 10 | Analytics | Nested Tab | Containment curves |
| **Model cost benchmarks** | Screen 11 | Analytics | Nested Tab | Cost benchmark tables |
| **Vector DB cluster status** | Screen 12 | Infra | Nested Tab | Compact Cluster status panels |
| **Knowledge connector registry** | Screen 13 | Infra | Nested Tab | Action Drawer: Enable/Disable plugins |
| **Number pool** | Screen 14 | Telephony | Nested Tab | Action Drawer: DID Allocations Form |
| **SIP trunk config** | Screen 15 | Telephony | Nested Tab | Action Modal: Credentials Form |
| **Platform Billing Plans** | Common | Billing | Standalone Page | Action Modal: Adjust Billing Plan limits |
| **Immutable System Audit Trail** | Common | Audit & Compliance | Standalone Page | Read-only compliance logger |

---

## 4. Route Map & Active Screen Identifiers

For both Next.js URL parameter parsing and client-side ZUSTAND navigation stores, the routing layout maps as follows:

| Target Page URL | Client-Side Active Screen ID | Active Nested Tab ID | Viewport Component |
|---|---|---|---|
| `/super-admin/master-data` | `sa_master_data` | `llm_registry`, `asr_tts_registry`, `channels`, `nlu_governance`, `tenant_onboarding` | `MasterDataContainer.tsx` |
| `/super-admin/analytics` | `sa_analytics` | `cross_tenant`, `cost_benchmarks` | `SuperAdminAnalyticsTab.tsx` |
| `/super-admin/infra` | `sa_infra` | `vector_db`, `knowledge_connectors` | `InfrastructureStatusContainer.tsx` |
| `/super-admin/telephony` | `sa_telephony` | `number_pool`, `sip_trunk` | `TelephonyConfigContainer.tsx` |
| `/super-admin/billing` | `sa_billing` | - | `GlobalBillingPlans.tsx` |
| `/super-admin/audit` | `sa_audit` | - | `PlatformAuditTrail.tsx` |

---

## 5. Backlog Tasks for Restructuring

### Task 1: Sidebar Layout Restructuring
* **Goal:** Group Super Admin sidebar links into the 6 inventory-safe categories and remove flat lists.
* **Scope:**
  - Update [Sidebar.tsx](file:///frontend/src/components/dashboard/Sidebar.tsx) to mount the 6 category items.
  - Purge the dead/hallucinated `analytics_center` sidebar link for Super Admin.
  - Set default redirects to first nested tabs.

### Task 2: Route Normalization & Permissions Setup
* **Goal:** Configure permissions and route IDs.
* **Scope:**
  - Update [permissions.ts](file:///frontend/src/lib/rbac/permissions.ts) to define the new active screen IDs under the `SUPER_ADMIN_SCREENS` and `ROLE_PERMISSIONS` registries.

### Task 3: Container Component Restructuring (Master Data, Telephony, Infrastructure)
* **Goal:** Create unified container components that manage sub-screen navigation via nested tabs.
* **Scope:**
  - Build `MasterDataContainer.tsx` switching LLM registry, ASR/TTS provider, Channels, NLU Governance, and Tenant onboarding template.
  - Build `TelephonyConfigContainer.tsx` switching Number pool and SIP trunk config.
  - Build `InfrastructureStatusContainer.tsx` switching Vector DB cluster status and Knowledge connector registry.
  - Refactor [SuperAdminLayout.tsx](file:///frontend/src/components/super-admin/shared/SuperAdminLayout.tsx) switch cases to load container panels or standalone views.
