# Sprint 08 Phase 3 — Platform UX Stabilization & Operational Consistency Pass Plan

**Sprint**: 08  
**Phase**: 3  
**Status**: Approved  
**Date**: 2026-06-04  

---

## Goal
Perform a full-platform UX stabilization, operational consistency, and enterprise refinement pass across the Super Admin ecosystem. This sprint focuses on spacing alignment, status badge standardization, drawer and modal behavioral normalization, query-sync robustness, EmptyState quality, and clean removal of duplicated components.

---

## User Review Required

> [!IMPORTANT]
>
> * **No Route or Layout Explosion**: We will not introduce any new routed folders or layout hierarchies. Depth remains strictly `section → module → internal tab`.
> * **Standardized Badges**: All status badges will share the same typography, border padding (`px-2.5 py-0.5`), and RTL-safe dot layouts.
> * **URL Sync Safeguards**: The `useTabQueryState` hook will be hardened to automatically clean up invalid parameter options from browser history.
> * **Lightweight focus restoration**: Drawers and overlay screens will utilize ref-based keyboard controls.

---

## Proposed Changes

### Status Badges Standardization

---

#### [MODIFY] [AuditStatusBadge.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/components/super-admin/audit/AuditStatusBadge.tsx)
* Add status dot indicator (`w-1.5 h-1.5 bg-current rounded-full`) for consistency.
* Enforce standard padding (`px-2.5 py-0.5`).
* Mirror margin gaps in RTL mode (`mr-1.5 rtl:ml-1.5 rtl:mr-0`).

#### [MODIFY] [BillingStatusBadge.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/components/super-admin/billing/BillingStatusBadge.tsx)
* Change padding to standard `px-2.5 py-0.5`.
* Apply RTL-aware margins on the status indicator dot.

#### [MODIFY] [KnowledgeConnectorStatusBadge.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/components/super-admin/infrastructure/KnowledgeConnectorStatusBadge.tsx)
* Change padding to standard `px-2.5 py-0.5`.
* Apply RTL-aware margins on the status indicator dot.

#### [MODIFY] [TelephonyStatusBadge.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/components/super-admin/telephony/TelephonyStatusBadge.tsx)
* Change padding to standard `px-2.5 py-0.5`.
* Apply RTL-aware margins on the status indicator dot.

#### [MODIFY] [SystemOpsStatusBadge.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/components/super-admin/system-operations/SystemOpsStatusBadge.tsx)
* Enforce standard padding (`px-2.5 py-0.5`).
* Change status dot background class from hardcoded colors to `bg-current` to ensure it matches the HSL text colors natively.
* Apply RTL-aware margins on the status indicator dot.

#### [MODIFY] [TenantListTab.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/components/super-admin/tenant-management/TenantListTab.tsx)
* Delete duplicated inline `getStatusBadge` function.
* Import and reuse `BillingStatusBadge` directly inside the table columns rendering.

---

### Drawer & Modal Behavior Normalization

---

#### [MODIFY] [TenantDetailDrawer.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/components/super-admin/tenant-management/TenantDetailDrawer.tsx)
* Integrate overlay click-outside bindings, Escape keyboard listeners, and standard overlay backdrops (`bg-slate-900/40 backdrop-blur-[2px]`).
* Implement focus-trapping checks to prevent keyboard focus escaping from the details slide-over.

---

### Query-Sync Reliability

---

#### [MODIFY] [useTabQueryState.ts](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/hooks/useTabQueryState.ts)
* Add fallback mechanism: if an invalid parameter is detected in the URL search query, overwrite the search param automatically with the default tab to ensure URL-state synchronization.

---

## Verification Plan

### Automated Tests
* Validate compilation of TypeScript types and production bundler paths:
  ```bash
  cd frontend
  npm run typecheck
  npm run build
  ```

### Manual Verification
* Inspect all Super Admin screens (Billing, Telephony, Infrastructure, Analytics, Audit, Tenant Management, System Operations) to check status badge layout consistency.
* Open Tenant Detail slide-over drawer, verify Escape key closes the drawer, and verify focus is trapped within the drawer.
* Navigate to `/admin/infrastructure?tab=invalid_tab_name` and verify that the page fallback logic automatically resets the URL to the default tab.
