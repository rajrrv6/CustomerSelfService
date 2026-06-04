# Super Admin Domain Consolidation & Existing Implementation Verification Audit

**Audit Date:** 2026-06-04  
**Auditor:** Antigravity — Code inspection (no estimates)  
**Source Cross-References:**  
- `docs/repository_audit_report.md` (161-screen inventory, generated 2026-06-01)  
- `docs/audits/super-admin-screen-validation-audit.md` (Sprint 06 visual validation)  
- Direct code inspection of `src/components/super-admin/` and `src/components/super-admin/shared/SuperAdminLayout.tsx`  
- `src/config/superAdminNavigation.ts`, `src/lib/rbac/permissions.ts`

---

## Executive Summary

The Super Admin domain currently has **10 sidebar modules** (Sprint 08 Phase 0 structure). Of the six inventory domains under audit, only **2 are fully built** (Billing, Audit). Three are **partially built via tabs/sub-views within existing modules**. Two entire domains (**Tenant Management** and **System Operations**) are **completely absent** — no components, no routing, no stubs. The "AI Co-pilot" concept from the inventory PDFs **does not correspond to a distinct Super Admin module** — it is distributed across existing Master Data tabs and client-admin lifecycle tabs.

---

## Part 1 — Current Sidebar Inventory vs. Implementation State

### Verified Current SA Sidebar Structure (10 items, 6 sections)

| Sidebar Item | Screen ID | Container | Implementation File(s) | Status |
|---|---|---|---|---|
| **Dashboard** (`sa_dashboard`) | — | `SuperAdminDashboardOverview` | `SuperAdminLayout.tsx` (inline) | ✅ Implemented — 4 stat tiles, telemetry overview |
| **Master Data** (`sa_master_data`) | 1–8 | `MasterDataContainer` | 4 tabs below | ✅ Routing to MasterDataContainer |
| ↳ LLM Registry | Inv 1 | `LlmRegistryTab` | `llm-registry/LlmRegistryTab.tsx` (15 KB) | ✅ Fully implemented — registry table, register modal, search, sync animation |
| ↳ ASR/TTS Registry | Inv 2 | `AsrTtsRegistryTab` | `speech-providers/AsrTtsRegistryTab.tsx` (14 KB) | ⚠️ Partial — missing Edit/Delete row actions, language config hardcoded |
| ↳ Channels (Catalog + Credentials) | Inv 3,4 | `SuperAdminChannelsTab` | `channels/SuperAdminChannelsTab.tsx` (49 KB) + helper (21 KB) | ✅ Fully implemented — channel catalog, credential modals, all providers |
| ↳ NLU Governance | Inv 5–8 | `NluGovernanceTab` | `nlu-governance/NluGovernanceTab.tsx` (35 KB) | ✅ Implemented — intent libraries, blocklists, PII policy, response templates |
| **Infrastructure** (`sa_infra`) | 12,13 | `InfrastructureContainer` | 2 tabs below | ✅ Routing |
| ↳ Vector DB Status | Inv 12 | `VectorDbStatusTab` | `vector-db/VectorDbStatusTab.tsx` (18 KB) | ✅ Fully implemented — cluster metrics, rebalancing simulation |
| ↳ Knowledge Connectors | Inv 13 | `KnowledgeConnectorRegistry` | `infrastructure/KnowledgeConnectorRegistry.tsx` (10 KB) | ⚠️ Partial — component exists and is mounted, content is form-stub only |
| **Telephony** (`sa_telephony`) | 14,15 | `TelephonyContainer` | 2 tabs below | ✅ Routing |
| ↳ SIP Trunk Config | Inv 15 | `SipTrunkConfigTab` | `telephony/SipTrunkConfigTab.tsx` (33 KB) | ⚠️ Partial — large file but UI is primarily read-only; missing CRUD operations |
| ↳ DID Number Pool | Inv 14 | `NumberPoolTab` | `telephony/NumberPoolTab.tsx` (39 KB) | ⚠️ Partial — built but was listed as "Placeholder" in prior audit; needs verification |
| **Analytics** (`sa_analytics`) | 10,11 | `AnalyticsContainer` | 2 tabs below | ✅ Routing |
| ↳ Cross-Tenant Analytics | Inv 10 | `SuperAdminAnalyticsTab` | `analytics/SuperAdminAnalyticsTab.tsx` (13 KB) | ⚠️ Partial — cross-tenant table exists, missing containment rate + per-tenant cost table |
| ↳ Model Cost Benchmarks | Inv 11 | `SuperAdminAnalyticsTab` | same file, `cost_benchmarks` sub-tab | ⚠️ Partial — input cost bar chart only; missing output cost chart |
| **Billing** (`sa_billing`) | N/A | `BillingOverviewTab` | `billing/BillingOverviewTab.tsx` (626 lines) | ✅ Fully implemented — tenant billing table, subscription plans, filter HUD, modals |
| **Audit & Compliance** (`sa_audit`) | N/A | `AuditOverviewTab` | `audit/AuditOverviewTab.tsx` (516 lines) | ✅ Fully implemented — audit event log, compliance policy CRUD, severity filters |
| **Notifications** (`sa_notifications`) | — | `NotificationsOverviewTab` | `notifications/NotificationsOverviewTab.tsx` | ✅ Implemented (Sprint 08 Phase 0) — operational announcements board |
| **Settings** (`sa_settings`) | — | `SettingsOverviewTab` | `settings/SettingsOverviewTab.tsx` | ✅ Implemented (Sprint 08 Phase 0) — 6-category overview grid |
| **Help Center** (`sa_help`) | — | `HelpCenterTab` | `help/HelpCenterTab.tsx` | ✅ Implemented (Sprint 08 Phase 0) — quick links, guides, escalation |

---

## Part 2 — Domain Classification Audit

### Domain A: AI Co-pilot

**Inventory claim:** Model registry, Model A/B testing, Evaluation configs  
**Architecture ruling:** ⚠️ **This domain does NOT exist as a distinct SA module**

| Inventory Item | Already Implemented | Partial | Missing | Classification |
|---|:---:|:---:|:---:|---|
| Model Registry (LLM + ASR/TTS) | ✅ | | | **Tab within Master Data → LLM Registry tab** |
| Model A/B Testing | | | ✅ | **Does not belong in SA sidebar.** A/B testing in PDF (Screen 105) is a Client Admin lifecycle feature (bot version traffic split). No SA-level model A/B infrastructure exists or is needed as a top-level module. If SA ever needs cross-tenant model routing experiments, the correct home is a new tab inside Master Data or Analytics, not a new sidebar item. |
| Evaluation Configs | | | ✅ | **Does not belong in SA sidebar.** Evaluation is a per-bot or per-model function. At SA level it surfaces as cost/accuracy metrics in LLM Registry (cost columns already present) and in Analytics. A dedicated SA "Evaluation" sidebar module would create fake enterprise complexity. |

**Verdict:** "AI Co-pilot" from the inventory is a **client-agent facing feature** (agent reply suggestions in `AICopilotPanel.tsx`). At the SA level, model management lives in **Master Data**. No new top-level sidebar module is warranted. Existing tabs cover the functional scope.

---

### Domain B: Billing

| Inventory Item | Already Implemented | Partial | Missing | Classification | Notes |
|---|:---:|:---:|:---:|---|---|
| Plans Catalog (SubscriptionPlansTable) | ✅ | | | **Tab within Billing** (`plans` sub-tab) | Full CRUD — create, edit, toggle, archive |
| Revenue Dashboard / MRR | ✅ | | | **KPI cards in Billing header** | Active subs, MRR, outstanding invoices, tier distribution |
| Tenant Billing Accounts | ✅ | | | **Tab within Billing** (`tenants` sub-tab) | Filter, suspend, resume, mark paid, view details |
| Coupons | | | ✅ | **Missing** — not implemented anywhere | If built: should be a **3rd sub-tab within Billing**, NOT a new sidebar item |
| Failed Payments | | | ✅ | **Missing** — `invoiceStatus: 'overdue'` exists as a filter state, no dedicated view | If built: should be a **filter view within Tenants sub-tab** or a status badge workflow, NOT a new sidebar item |
| Refunds | | | ✅ | **Missing at SA level.** `RefundWizard.tsx` exists in customer portal only — that is customer-facing. SA refund processing (issuing credit notes) is absent. | If built: should be a **row action or modal within Tenant Billing**, NOT a sidebar item |
| Tax Configuration | | | ✅ | **Missing** — no SA-level tax config | If built: should be a **Settings sub-item or Billing Settings tab**, NOT a sidebar item |

**Verdict:** Billing module is **substantively implemented**. Plans + Billing Accounts = two working tabs with full CRUD and audit logging. Four sub-features (Coupons, Failed Payments, Refunds, Tax Config) are absent but all correctly classify as **tabs or modals inside the existing Billing module**, not new sidebar items.

---

### Domain C: Tenant Management

**Inventory claim:** Tenant list, Tenant detail, Metering, Feature flags, White-label, Export/Suspend/Delete/Clone, Tenant audit logs  
**Architecture ruling:** 🔴 **Entire domain is absent. Zero components exist.**

| Inventory Item | Already Implemented | Partial | Missing | Classification | Notes |
|---|:---:|:---:|:---:|---|---|
| Tenant List | | | ✅ | **Missing** | This is the most critical SA gap. No SA-level tenant registry or management list exists anywhere |
| Tenant Detail / Profile | | | ✅ | **Missing** | No per-tenant drill-down |
| Metering / Usage | | | ✅ | **Missing** — billing records show `monthlySpend` only | Full token consumption, API call counts, seat utilization per tenant is absent |
| Feature Flags per Tenant | | | ✅ | **Missing** | No feature flag management exists |
| White-label Config | | | ✅ | **Missing** | No white-labelling interface exists anywhere |
| Export / Suspend / Delete / Clone | | ✅ | | **Partially present in Billing** — suspend/resume exist on `TenantBillingRecord`, but these are billing operations, not full tenant lifecycle operations | Full lifecycle (delete, clone, export as JSON/CSV) is absent |
| Tenant Audit Logs | | | ✅ | **Missing at SA level** — `AuditOverviewTab` has a tenant filter dropdown but is a global audit log, not per-tenant scoped view | A per-tenant audit log drill-down is absent |

**Verdict:** Tenant Management is the **single largest missing domain** in the SA portal. It **deserves a top-level sidebar module** (`sa_tenant_management`) with tabs: Tenant List → Tenant Detail (slide-over or page) → Metering → Feature Flags. White-label and lifecycle actions (delete/clone) are sub-features within Tenant Detail, not separate sidebar items.

---

### Domain D: Tenant Provisioning

**Inventory claim:** Onboarding wizard, OTP, Launch flow, Review flow

| Inventory Item | Already Implemented | Partial | Missing | Classification | Notes |
|---|:---:|:---:|:---:|---|---|
| Onboarding Wizard | | | ✅ | **Missing** — inventory Screen 9, explicitly deferred in prior audits | **NOT a sidebar item.** This is a wizard/flow accessed from Tenant Management (e.g., "New Tenant" button → multi-step wizard) |
| OTP Verification step | | ✅ | | **Partially present** — `OtpAuth.tsx` exists in customer portal for refund flow; NOT reusable for tenant provisioning | Should be a shared OTP primitive consumed by the wizard, not a separate page |
| Launch Flow (provision and go-live) | | | ✅ | **Missing** | Should be wizard step 4/5, not a sidebar item |
| Review Flow (approval gate) | | | ✅ | **Missing** | Should be wizard step 5/5 or a pending-approval state in Tenant List, not a sidebar item |

**Verdict:** Tenant Provisioning is **not a sidebar module**. It is a **wizard triggered from within Tenant Management**. The Onboarding Wizard (Inventory Screen 9) should launch from a "Provision New Tenant" button in the Tenant List tab. No sidebar entry is needed.

---

### Domain E: System Operations

**Inventory claim:** Health dashboard, Jobs queue, Release notes, Error monitoring, Migrations, Rate limits, Cache invalidation  
**Architecture ruling:** 🔴 **Entire domain is absent. Zero components exist.**

| Inventory Item | Already Implemented | Partial | Missing | Classification | Notes |
|---|:---:|:---:|:---:|---|---|
| Health Dashboard | | | ✅ | **Missing** | Platform-wide health (infrastructure, API gateway, services) — **deserves a top-level sidebar module** |
| Jobs Queue | | | ✅ | **Missing** | Async job monitoring (ingestion, sync, webhook delivery) — **tab within System Operations** |
| Release Notes | | | ✅ | **Missing** | Could be surfaced as tab in System Operations or in Help Center | Lightweight: a changelog list, not a full SA module |
| Error Monitoring | | | ✅ | **Missing** | Platform error log aggregation — **tab within System Operations** |
| Migrations | | | ✅ | **Missing** | DB schema migration history/status — **tab within System Operations**, not sidebar item |
| Rate Limits | | | ✅ | **Missing** | Per-tenant or per-API rate limit enforcement UI — **tab within Settings or System Operations** |
| Cache Invalidation | | | ✅ | **Missing** | Manual cache flush triggers — **action within System Operations**, not a page |

**Verdict:** System Operations **deserves a top-level sidebar module** (`sa_system_ops`) under the PLATFORM MANAGEMENT group. Internal tabs: Health Dashboard → Jobs Queue → Error Monitoring → Migrations. Rate Limits and Cache Invalidation are operational actions within these tabs, not separate sidebar items.

---

### Domain F: Shared Utilities

| Inventory Item | Already Implemented | Partial | Missing | Classification | Notes |
|---|:---:|:---:|:---:|---|---|
| Notifications | ✅ | | | **✅ Sidebar item** (`sa_notifications`) — Sprint 08 Phase 0 | Operational announcements board. Implemented correctly. |
| Settings | ✅ | | | **✅ Sidebar item** (`sa_settings`) — Sprint 08 Phase 0 | Platform settings hub with 6 category overview. Implemented correctly. |
| Help Center | ✅ | | | **✅ Sidebar item** (`sa_help`) — Sprint 08 Phase 0 | Docs + guides + escalation. Implemented correctly. |
| Favorites | | | ✅ | **Should NOT be a sidebar item.** Favorites is a header/toolbar utility (bookmark current screen). If implemented, it belongs in the top header bar, not as a sidebar navigation destination. | Not a super admin–specific feature |
| Recently Viewed | | | ✅ | **Should NOT be a sidebar item.** This is a header dropdown or a small widget on the Dashboard, not a sidebar route. | Implemented as part of Dashboard if ever needed |
| Search | | | ✅ | **Should NOT be a sidebar item.** Platform-level search belongs in the header (Cmd+K command palette pattern). | Not a page/route |

**Verdict:** Notifications, Settings, and Help Center are correctly sidebar items. Favorites, Recently Viewed, and Search must **not** become sidebar items — they are header/toolbar utilities.

---

## Part 3 — Final Enterprise IA Recommendation

### Recommended Final SA Sidebar Structure

```
MAIN
  └─ Dashboard

PLATFORM MANAGEMENT
  ├─ Master Data              [✅ Implemented — 4 tabs]
  ├─ Infrastructure           [⚠️ Partial — 2 tabs, Knowledge Connectors stub]
  ├─ Telephony                [⚠️ Partial — 2 tabs, SIP needs CRUD]
  └─ System Operations        [🔴 MISSING — new module needed]

TENANT MANAGEMENT             [🔴 MISSING — new top-level section + module needed]
  └─ Tenant Management        [Tenant List + Tenant Detail + Metering + Feature Flags]
  
OPERATIONS
  ├─ Analytics                [⚠️ Partial — 2 tabs, cost chart incomplete]
  └─ Billing                  [✅ Implemented — 2 tabs, missing Coupons/Refunds/Tax sub-tabs]

GOVERNANCE
  └─ Audit & Compliance       [✅ Fully Implemented]

SYSTEM
  ├─ Notifications            [✅ Sprint 08 Phase 0]
  └─ Settings                 [✅ Sprint 08 Phase 0]

SUPPORT
  └─ Help Center              [✅ Sprint 08 Phase 0]
```

### Items that Must NOT Become Sidebar Items

| Inventory Item | Correct Classification |
|---|---|
| AI Co-pilot (SA level) | Not applicable — model management is in Master Data tabs |
| Model A/B Testing | Tab in Lifecycle (Client Admin) or future Master Data analytics sub-tab |
| Evaluation Configs | Metrics within LLM Registry table + Analytics |
| Coupons | Sub-tab within Billing |
| Failed Payments | Filter view within Billing → Tenants sub-tab |
| Refunds (SA) | Row action / modal within Billing → Tenants sub-tab |
| Tax Configuration | Tab within Settings or Billing Settings |
| Onboarding Wizard | Wizard flow triggered from Tenant Management list |
| OTP (provisioning) | Shared primitive used within the wizard |
| Launch Flow | Wizard step, not a page |
| Review Flow | Approval state in Tenant List, not a page |
| Release Notes | Tab in System Operations or Help Center |
| Rate Limits | Tab in System Operations or Settings |
| Cache Invalidation | Action within System Operations tabs |
| Favorites | Header toolbar utility |
| Recently Viewed | Dashboard widget or header dropdown |
| Search | Header command palette (Cmd+K), not a route |
| Migrations | Tab within System Operations |

---

## Part 4 — True Remaining SA Backlog

### Backlog Item 1 — CRITICAL: Tenant Management Module
- New sidebar item: `sa_tenant_management`  
- New container: `TenantManagementContainer`  
- Tabs: Tenant List → Tenant Detail (slide-over) → Metering → Feature Flags  
- Lifecycle actions in Tenant Detail: Suspend, Delete, Clone, Export  
- Provisioning: "New Tenant" button → multi-step Onboarding Wizard (separate modal/page flow)  
- Tenant audit logs: scoped tab within Tenant Detail  
- **New sidebar section required:** TENANT MANAGEMENT (between PLATFORM MANAGEMENT and OPERATIONS)

### Backlog Item 2 — HIGH: System Operations Module
- New sidebar item: `sa_system_ops`  
- New container: `SystemOperationsContainer`  
- Tabs: Health Dashboard → Jobs Queue → Error Monitoring → Migrations  
- Actions: Rate Limit editor, Cache Flush (within tabs, not as sidebar items)  
- Home in sidebar: under PLATFORM MANAGEMENT section

### Backlog Item 3 — MEDIUM: Billing Completion
- Coupons sub-tab (3rd tab in BillingOverviewTab)  
- Failed payment queue view (filter state + row actions in Tenants tab)  
- Refund processing modal (row action in Tenants tab)  
- Tax configuration (new sub-tab or card in Settings)

### Backlog Item 4 — MEDIUM: Analytics Completion
- Cross-Tenant Analytics: add per-tenant containment rate + cost-per-conversation table  
- Model Cost Benchmarks: restore output cost chart side-by-side with input chart

### Backlog Item 5 — MEDIUM: Master Data Completion
- ASR/TTS Registry: add Edit/Delete row actions, language config fields  
- Knowledge Connectors: expand from form-stub to functional connector registry  
- SIP Trunk Config: expand from read-only to full CRUD with credentials + capacity form  
- DID Number Pool: verify and complete if still placeholder

### Backlog Item 6 — LOW: Shared Utilities Enhancement
- Notifications: keep as operational announcements (correct scope, do not expand to real-time stream)  
- Settings: implement actual category drill-downs in a future sprint (currently overview-only)  
- Help Center: link documentation URLs when external docs platform is available

---

## Part 5 — Hidden / Internal Workflows Already in Codebase

These systems exist and are functioning but are not discoverable from the SA sidebar:

| System | Location | Currently Accessible Via |
|---|---|---|
| SA Audit Logs Panel | `WorkspaceShell.tsx` → `showAuditLogs` state | Header "Logs" button — slide-over panel. Separate from AuditOverviewTab |
| Notification Drawer + Center | `WorkspaceShell.tsx` + `NotificationDrawer.tsx` + `NotificationCenter.tsx` | Header bell icon — runtime notification simulator wired in |
| Notification Simulator | `notificationSimulator.ts` | Toggle within Notification Drawer — enabled in WorkspaceShell |
| Knowledge Connector Registry | `infrastructure/KnowledgeConnectorRegistry.tsx` | Mounted in InfrastructureContainer — accessible but form stub only |
| Public Bot Widget | `WorkspaceShell.tsx` → `showPublicBotOverlay` state | "Launch Bot Widget" FAB (bottom right) — all roles including SA |

---

## Part 6 — Recommended Sprint 08 Direction

Based on this audit, Sprint 08 should proceed in the following phase order:

| Phase | Work Item | Priority |
|---|---|---|
| **Sprint 08 Phase 1** | Build `Tenant Management` module (Tenant List + Tenant Detail + Metering) | 🔴 Critical |
| **Sprint 08 Phase 2** | Build `System Operations` module (Health Dashboard + Jobs Queue + Error Monitoring) | 🔴 High |
| **Sprint 08 Phase 3** | Complete Billing (Coupons sub-tab + Refund modal + Tax config) | 🟡 Medium |
| **Sprint 08 Phase 4** | Complete Analytics (containment table + cost chart fix) and Master Data (ASR CRUD + SIP CRUD) | 🟡 Medium |

**Sidebar expansion sequence:**
1. Add `sa_tenant_management` with new "TENANT MANAGEMENT" section between PLATFORM MANAGEMENT and OPERATIONS
2. Add `sa_system_ops` under PLATFORM MANAGEMENT section
3. No other new top-level sidebar items are warranted until Phases 1–2 are complete

---

## Audit Confidence

| Domain | Evidence Source | Confidence |
|---|---|---|
| Existing implementations | Direct file inspection + SuperAdminLayout switch map | **High** |
| Missing domains (Tenant, SysOps) | grep search + full component tree inspection | **High** |
| AI Co-pilot classification | Inventory PDF cross-reference + `AICopilotPanel.tsx` location | **High** |
| Billing completeness | Full read of BillingOverviewTab.tsx (626 lines) | **High** |
| Audit completeness | Full read of AuditOverviewTab.tsx (516 lines) | **High** |
| Shared utilities classification | WorkspaceShell inspection + header component analysis | **High** |
