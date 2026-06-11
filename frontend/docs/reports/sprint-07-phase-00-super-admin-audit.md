# Sprint 07 Phase 0 — Super Admin Inventory & Screen Validation Audit

**Date:** 2026-06-03  
**Auditor:** Antigravity Agent  
**Scope:** Super Admin module screens (Inventory IDs 1–15) against `inventory_pdf.txt` specification  
**Status:** AUDIT COMPLETE — awaiting review  

---

## Audit Methodology

Each Super Admin screen was cross-referenced against:
1. The `inventory_pdf.txt` screen specification (IDs 1–15)
2. The actual rendered component file(s) in `frontend/src/components/super-admin/`
3. The `SuperAdminLayout.tsx` routing switch
4. The `superAdminNavigation.ts` sidebar configuration
5. The `superAdmin` namespace in `en.ts` / `ar.ts`

Classification scale:
- ✅ **VALID** — Fully implemented, inventory-aligned, correct business logic
- 🟡 **PARTIAL** — Present and functional but missing key inventory-specified features
- 🔶 **THIN** — Renders visually but is scaffolding-level; business depth missing
- ❌ **MISSING** — Not yet implemented; falls through to `NotImplementedFallback`
- 🚨 **REWRITE NEEDED** — Implemented but with fundamental structural problems

---

## Section 1 — Screen-by-Screen Classification

### Module: Master Data (IDs 1–9) → `MasterDataContainer.tsx`

| ID | Screen Name | File | Classification | Notes |
|----|-------------|------|----------------|-------|
| 1 | LLM model registry | `LlmRegistryTab.tsx` | ✅ **VALID** | Full CRUD table, register modal with API/latency/accuracy fields, live search with skeleton loader, sync animation states, audit log integration. Matches inventory spec. |
| 2 | ASR/TTS provider registry | `AsrTtsRegistryTab.tsx` | 🟡 **PARTIAL** | Table, register modal, language badges all render correctly. Missing: language multi-select in create form (hardcoded `['English', 'Arabic']`), no edit/delete actions on existing rows, no bilingual empty state. |
| 3 | Channel catalog | `SuperAdminChannelsTab.tsx` | ✅ **VALID** | Most complete SA screen in the codebase. KPI HUD, channel health cards, full TanStack table with search, AI routing toggles, telemetry bars. Covers inventory IDs 3 AND 4 in one unified tab. |
| 4 | Channel provider credentials | `SuperAdminChannelsTab.tsx` | ✅ **VALID** | Implemented within the Channels tab (Section B — Provider Credentials). Provider cards + full credential table, masked API key reveal, webhook URL, environment toggle, ping test. |
| 5 | Industry intent libraries | `NluGovernanceTab.tsx` | ✅ **VALID** | Implemented under the `industries` sub-tab. 5 industry verticals (Banking, Telecom, Retail, Healthcare, Logistics), per-intent confidence threshold display, bilingual phrases. Well-implemented. |
| 6 | Industry response templates | `NluGovernanceTab.tsx` | ✅ **VALID** | Implemented under the `templates` sub-tab. Inline edit forms, bilingual EN+AR content, save & inject to tenants. |
| 7 | Profanity/safety blocklist | `NluGovernanceTab.tsx` | ✅ **VALID** | Implemented under the `blocklists` sub-tab. Add form, severity classification, delete action, enforcement action field. Solid. |
| 8 | PII redaction policy | `NluGovernanceTab.tsx` | ✅ **VALID** | Implemented under the `pii` sub-tab. Toggle-based policy controls, regex display, intervention count, live audit log stream. |
| 9 | Tenant onboarding template | *(none)* | ❌ **MISSING** | No component exists. Falls through to `NotImplementedFallback`. No route alias either. |

---

### Module: Analytics (IDs 10–11) → `AnalyticsContainer.tsx`

| ID | Screen Name | File | Classification | Notes |
|----|-------------|------|----------------|-------|
| 10 | Cross-tenant analytics | `SuperAdminAnalyticsTab.tsx` | 🟡 **PARTIAL** | KPI cards (API calls, clusters, latency), TanStack table of 4 hardcoded tenants with token volume / SLA / load columns. Renders correctly. **Missing:** actual containment rate metric, cost-per-conversation breakdown, any live-ish date filtering, export functionality. Data is fully hardcoded — no mock data module. |
| 11 | Model cost benchmarks | `SuperAdminAnalyticsTab.tsx` | 🟡 **PARTIAL** | Bar chart (input token cost from `llmModels` store), line chart (static weekly throughput data). Cost optimization recommendation card with static text. **Missing:** output cost bar chart, per-model comparison table, no benchmarks against industry baselines. The second chart is a throughput line rather than the specified output cost comparison. |

---

### Module: Infrastructure (IDs 12–13) → `InfrastructureContainer.tsx`

| ID | Screen Name | File | Classification | Notes |
|----|-------------|------|----------------|-------|
| 12 | Vector DB cluster status | `VectorDbStatusTab.tsx` | ✅ **VALID** | Two cluster cards (Pinecone + pgvector) with dimension/vector/index counts, storage progress bars, expandable namespace distribution, full rebalance simulation (analyze → shift → compact → fail → retry → success), notification event integration. Excellent implementation. |
| 13 | Knowledge connector registry | `KnowledgeConnectorRegistry.tsx` | 🟡 **PARTIAL** | All 5 component files created (types, mock data, status badge, form modal, table, registry). However, **NOT yet wired into `InfrastructureContainer.tsx`** — the `knowledge_connectors` tab still renders `<NotImplementedFallback />`. The components are complete and correct but the integration step was paused when Sprint 07 was halted. |

---

### Module: Telephony (IDs 14–15) → `TelephonyContainer.tsx`

| ID | Screen Name | File | Classification | Notes |
|----|-------------|------|----------------|-------|
| 14 | Number pool (DID) | *(none)* | ❌ **MISSING** | `TelephonyContainer` declares the `number_pool` tab in `useTabQueryState` but renders `<NotImplementedFallback />` for it. No component file exists. |
| 15 | SIP trunk config | `SipTrunkConfigTab.tsx` | 🔶 **THIN** | Renders one `OperationalCard` with two read-only input fields (primary/secondary VoIP gate SIP addresses) and two checkboxes. **Severely under-specified:** inventory calls for "Trunk credentials + capacity" — the existing screen has no trunk table, no add/edit forms, no credential management, no capacity metrics, no status indicators, no rebalancing or diagnostics. This is scaffolding-grade, not a valid implementation. |

---

### Module: Billing & Audit (Not in inventory IDs 1–15)

| Module | Sidebar ID | Status | Notes |
|--------|-----------|--------|-------|
| Billing | `sa_billing` | ❌ **MISSING** | In sidebar nav + RBAC permissions, but no container or screen exists. `SuperAdminLayout.tsx` falls through to `NotImplementedFallback`. Not in inventory IDs 1–15 (likely "Common Per App" billing which is platform-level). |
| Audit & Compliance | `sa_audit` | ❌ **MISSING** | Same as billing — exists in sidebar + RBAC but has no implementation. Inventory does not list a specific SA Audit screen in IDs 1–15; this is likely "Common Per App" scope. |

---

## Section 2 — Architectural Observations

### ✅ What Is Correctly Normalized (Do Not Touch)
- **RBAC permission groups** (`sa_dashboard`, `sa_master_data`, `sa_analytics`, `sa_infra`, `sa_telephony`, `sa_billing`, `sa_audit`) — correct canonical IDs
- **Sidebar config** (`superAdminNavigation.ts`) — config-driven, permission-gated
- **Container architecture** (MasterData, Analytics, Infrastructure, Telephony) — correct tab orchestration pattern
- **`useTabQueryState` hook** — deep-linkable URL tab sync, hydration-safe
- **`SuperAdminLayout.tsx` routing switch** — alias routing for legacy links works correctly
- **Translation keys** (`saInfrastructureTitle`, `saMasterDataTitle`, etc.) — aligned between `en.ts` and `ar.ts`

### 🔶 Reusable Canonical UI Patterns Identified

These patterns appear consistently in the strongest screens and should be reused in all future screens:

| Pattern | Example Usage | Component |
|---------|--------------|-----------|
| Section header + action button | All containers | `SectionHeader` |
| TanStack `EnterpriseTable` with search + filters | Channels, Analytics, Knowledge Connectors | `shared/table/EnterpriseTable` |
| `OperationalCard` metric HUD | VectorDB, Analytics | `shared/OperationalCard` |
| `ModalWrapper` + form state | LlmRegistry, KnowledgeConnectorFormModal | `shared/ModalWrapper` |
| Status badge system | KnowledgeConnectorStatusBadge, BadgeSystem | `shared/BadgeSystem` |
| Animated sync/progress console | VectorDbStatusTab (rebalance) | Local pattern |
| Toast feedback via `useFeedbackToasts` | KnowledgeConnectorRegistry, callbacks | `PostChatToasts` context |

### ⚠️ Weak Implementations Identified

| Component | Problem |
|-----------|---------|
| `SipTrunkConfigTab.tsx` | Two read-only inputs + checkboxes — not a usable config screen. Needs trunk table, add/edit modals, capacity columns, credential management. |
| `AsrTtsRegistryTab.tsx` | Missing edit/delete on registered rows. Language field hardcoded in form. No bilingual empty state. Relatively easy to fix. |
| `SuperAdminAnalyticsTab.tsx` (cost_benchmarks) | Second chart is throughput, not output cost. No per-model comparison table or industry baselines. Partially misaligned with inventory spec. |

### ❌ Missing Screens (Priority Order)

1. **Knowledge Connector Registry wiring** (ID 13) — components exist, 1-line integration needed in `InfrastructureContainer.tsx`
2. **DID Number Pool** (ID 14) — no component, needs full implementation
3. **SIP Trunk Config rebuild** (ID 15) — existing component needs complete rewrite
4. **Tenant Onboarding Template** (ID 9) — no component, needs wizard
5. **Billing module** — sidebar present, no screen
6. **Audit & Compliance module** — sidebar present, no screen

---

## Section 3 — Summary Score

| Module | Inventory IDs | Screens Total | Valid | Partial | Thin | Missing |
|--------|--------------|---------------|-------|---------|------|---------|
| Master Data | 1–9 | 9 | 6 | 2 | 0 | 1 |
| Analytics | 10–11 | 2 | 0 | 2 | 0 | 0 |
| Infrastructure | 12–13 | 2 | 1 | 1* | 0 | 0 |
| Telephony | 14–15 | 2 | 0 | 0 | 1 | 1 |
| Billing/Audit | — | 2 | 0 | 0 | 0 | 2 |
| **TOTAL** | **1–15 + 2** | **17** | **7** | **5** | **1** | **4** |

*Knowledge Connector (ID 13) classified Partial: all components complete, wiring pending.

**Overall completion: ~47% fully valid, ~35% partial/thin, ~18% missing**

---

## Section 4 — Recommended Sprint 07 Execution Order

Given this audit, the recommended build sequence before expanding to new modules is:

### Phase 0A — Zero-code wins (immediate)
1. Wire `KnowledgeConnectorRegistry` into `InfrastructureContainer` (1 line change + lazy import)
2. Fix `AsrTtsRegistryTab`: add edit/delete action buttons, fix language multi-select field

### Phase 0B — SIP Trunk Rebuild (ID 15)
Rewrite `SipTrunkConfigTab.tsx` to include:
- Trunk health metrics header (active trunks, concurrent calls, MOS index)
- TanStack `EnterpriseTable` of provisioned trunks with credential + capacity columns
- Add/Edit trunk modal form

### Phase 0C — Analytics Alignment (IDs 10–11)
- Fix cost_benchmarks: add output cost bar chart, replace throughput line chart
- Add mock data module for cross-tenant tenants (extract from hardcoded array)

### Phase 1 (Sprint 07) — New Screens
After Phase 0A/0B/0C are complete:
- DID Number Pool (ID 14)
- Tenant Onboarding Template (ID 9)
- Billing module
- Audit & Compliance module

---

## Section 5 — Files Requiring Action

| File | Action | Priority |
|------|--------|----------|
| `containers/InfrastructureContainer.tsx` | Wire KnowledgeConnectorRegistry into `knowledge_connectors` tab | 🔴 High |
| `speech-providers/AsrTtsRegistryTab.tsx` | Add edit/delete row actions, fix language field | 🟡 Medium |
| `telephony/SipTrunkConfigTab.tsx` | Full rewrite to inventory spec | 🟠 High |
| `analytics/SuperAdminAnalyticsTab.tsx` | Fix cost_benchmarks chart, extract mock data | 🟡 Medium |
| `telephony/` *(new)* | Create `NumberPoolTab.tsx` (ID 14) | 🟠 High |
