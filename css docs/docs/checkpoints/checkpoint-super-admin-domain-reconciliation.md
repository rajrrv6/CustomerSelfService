# Checkpoint — Super Admin Domain Reconciliation

**Checkpoint Date:** 2026-06-04  
**Phase:** Pre-Sprint-08 Architecture Reconciliation  
**Purpose:** Record the final authoritative IA decisions before any further SA sidebar expansion

---

## What This Checkpoint Covers

This checkpoint records the outcome of the Super Admin Domain Consolidation & Verification Audit, which determined:
- What is actually implemented in the SA portal
- What inventory items incorrectly imply they deserve sidebar entries
- The correct classification of all inventory items (sidebar module vs. tab vs. wizard vs. modal)
- The true remaining backlog and correct Sprint 08 direction

> [!IMPORTANT]
> This checkpoint is the governance gate before Sprint 08 execution. No new SA sidebar modules or screen additions should be implemented without referencing this document first.

---

## Current Sidebar State (Post Sprint 08 Phase 0)

10 items across 6 sections. All verified functional.

```
MAIN                      → Dashboard           ✅
PLATFORM MANAGEMENT       → Master Data          ✅ (4 tabs)
                          → Infrastructure      ⚠️ (2 tabs, partial)
                          → Telephony            ⚠️ (2 tabs, partial)
OPERATIONS                → Analytics            ⚠️ (2 tabs, partial)
                          → Billing              ✅ (2 tabs, full)
GOVERNANCE                → Audit & Compliance   ✅ (2 sub-tabs, full)
SYSTEM                    → Notifications        ✅ (Sprint 08 Phase 0)
                          → Settings             ✅ (Sprint 08 Phase 0)
SUPPORT                   → Help Center          ✅ (Sprint 08 Phase 0)
```

---

## Critical Architecture Decisions (Locked)

### Decision 1: AI Co-pilot is NOT a SA sidebar module
- "AI Co-pilot" in inventory PDFs refers to the **agent reply suggestion panel** (`AICopilotPanel.tsx`) in agent workspace
- At SA level, model management = **LLM Registry tab** (already implemented in Master Data)
- Model A/B testing belongs in **Client Admin → Lifecycle** (Screen 105), not SA
- Evaluation configs = metrics columns in LLM Registry + Analytics tabs
- **No `sa_ai_copilot` sidebar item will be created**

### Decision 2: Tenant Management IS a missing top-level module
- No tenant management components exist anywhere in the codebase
- Billing module's suspend/resume are billing operations, not tenant lifecycle
- `sa_tenant_management` must be added as a new sidebar item
- Requires a new sidebar section: **TENANT MANAGEMENT** (between PLATFORM MANAGEMENT and OPERATIONS)
- Internal structure: tabs (Tenant List, Tenant Detail slide-over, Metering, Feature Flags)
- Onboarding Wizard = wizard/flow triggered from "Provision New Tenant" in Tenant List (NOT a sidebar item)

### Decision 3: System Operations IS a missing top-level module
- No health dashboard, jobs queue, error monitoring, or migration tracking exists anywhere
- Must be added as `sa_system_ops` under PLATFORM MANAGEMENT section
- Internal structure: tabs (Health Dashboard, Jobs Queue, Error Monitoring, Migrations)
- Rate limits + cache invalidation = operational actions within these tabs (NOT separate sidebar items)

### Decision 4: Billing sub-features are tabs/modals, NOT sidebar items
- Coupons → 3rd sub-tab within `BillingOverviewTab`
- Failed Payments → filter view + row actions in Tenants sub-tab
- Refunds → modal action in Tenants sub-tab
- Tax Configuration → sub-tab in Settings or Billing Settings
- **No new billing sidebar items will be created**

### Decision 5: Shared utilities classification locked
| Item | Correct Home |
|---|---|
| Favorites | Header toolbar (if ever built) |
| Recently Viewed | Dashboard widget or header dropdown |
| Search | Header command palette (Cmd+K) |
| Release Notes | Tab in System Operations or Help Center |
| Rate Limits | Tab in System Operations |
| Cache Invalidation | Action within System Operations |

---

## Verified Hidden Systems (Operational but Not SA-Navigable)

These are working systems already in the codebase that the SA can access but not through the sidebar:

| System | Access Point | Status |
|---|---|---|
| SA Audit Log Side Panel | Header "Audit Logs" button → slide-over | ✅ Working (separate from AuditOverviewTab) |
| Notification Drawer | Header bell icon → slide-over | ✅ Working |
| Notification Center | From Notification Drawer → "View All" | ✅ Working |
| Notification Simulator | Toggle within Notification Drawer | ✅ Working (dev utility) |
| Public Bot Widget Preview | Bottom-right FAB (all roles) | ✅ Working |

None of these need to become sidebar items. They are correctly surfaced via header and overlay patterns.

---

## True SA Backlog Summary

### Tier 1 — Critical Missing (blocks operational capability)
1. **Tenant Management module** — no tenant visibility at SA level without this
2. **System Operations module** — no platform health or job observability

### Tier 2 — Partially implemented (functional gaps in existing modules)
3. **SIP Trunk Config** — needs CRUD, currently read-only
4. **ASR/TTS Registry** — needs Edit/Delete row actions + language config
5. **Knowledge Connectors** — mounted but form-stub only
6. **Cross-Tenant Analytics** — missing containment rate + per-tenant cost table
7. **Model Cost Benchmarks** — missing output cost chart

### Tier 3 — Module completions (existing modules need additional sub-features)
8. **Billing: Coupons** — sub-tab
9. **Billing: Refunds** — modal
10. **Billing: Tax Config** — settings sub-tab

### Tier 4 — Deferred / low priority
11. Settings page drill-downs (currently category overview only)
12. Help Center external doc links

---

## Sprint 08 Execution Sequence

```
Phase 0 (DONE)     → Sidebar IA grouping + Notifications/Settings/Help Center
Phase 1 (NEXT)     → Tenant Management module (sa_tenant_management)
Phase 2            → System Operations module (sa_system_ops)
Phase 3            → Billing completion (Coupons + Refunds + Tax sub-tabs)
Phase 4            → Analytics completion + Master Data partial fixes
```

---

## Anti-Patterns Locked Out by This Audit

The following patterns are **explicitly prohibited** in Sprint 08 and beyond:

- ❌ Creating a standalone "AI Co-pilot" SA sidebar module
- ❌ Creating separate sidebar items for Coupons, Refunds, Tax Config, Failed Payments
- ❌ Creating a sidebar item for "Onboarding Wizard" or "Provisioning Flow"
- ❌ Creating sidebar items for Favorites, Recently Viewed, or Search
- ❌ Creating sidebar items for Release Notes, Rate Limits, Cache Invalidation in isolation
- ❌ Adding a 4th tier of nesting to the sidebar (section → module → tab is the max depth)
- ❌ Splitting a single logical module across multiple sidebar items to appear comprehensive
