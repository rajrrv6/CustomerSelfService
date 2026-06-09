# Sprint 07 Phase 3 — Billing Operational Foundation Plan

## Goal
Transform the placeholder Billing module into a scalable operational billing management foundation aligned with the inventory workflows while preserving the Sprint 06 architecture and Sprint 07 operational stabilization patterns.

---

## 1. Objectives & Scope
- **Billing Operational Overview**: Replace the Coming Soon placeholder with KPI stats card summaries (MRR, Trials count, Outstanding Invoices, Tiers distribution).
- **Subscription Plan Management**: Add `SubscriptionPlansTable` rendering limits, AI credits, pricing tiers. Supporting Add/Edit, Enable/Disable status, and Archiving.
- **Tenant Billing Records**: Add `TenantBillingTable` managing client renewals, Invoice Status, and Billing Status. Support View Details, Suspend/Resume billing, and Mark Invoice Paid.
- **Billing Status System**: Create `BillingStatusBadge` supporting Active, Trial, Overdue, Suspended, Expired, Draft, and Archived badges.
- **Empty States**: Render full EmptyState templates with inline CTAs if records are wiped.

---

## 2. Affected Files

| Component | File Path | Action |
|-----------|-----------|--------|
| Types | [billing.ts](file:///c:/Users/rajrr/CustomerSelfService/src/types/billing.ts) | [NEW] Define schemas for plans and records |
| Badges | [BillingStatusBadge.tsx](file:///c:/Users/rajrr/CustomerSelfService/src/components/super-admin/billing/BillingStatusBadge.tsx) | [NEW] Create status badge system |
| Pricing Plans | [SubscriptionPlansTable.tsx](file:///c:/Users/rajrr/CustomerSelfService/src/components/super-admin/billing/SubscriptionPlansTable.tsx) | [NEW] Manage price plan layouts |
| Tenant Billings | [TenantBillingTable.tsx](file:///c:/Users/rajrr/CustomerSelfService/src/components/super-admin/billing/TenantBillingTable.tsx) | [NEW] Manage client subscriptions |
| Modals | [BillingPlanModal.tsx](file:///c:/Users/rajrr/CustomerSelfService/src/components/super-admin/billing/BillingPlanModal.tsx) | [NEW] Edit/Add modal form |
| Mock Data | [mockBillingData.ts](file:///c:/Users/rajrr/CustomerSelfService/src/components/super-admin/billing/mockBillingData.ts) | [NEW] Initialize mock records |
| Billing Hub | [BillingOverviewTab.tsx](file:///c:/Users/rajrr/CustomerSelfService/src/components/super-admin/billing/BillingOverviewTab.tsx) | [NEW] Core billing dashboard tab |
| Layout | [SuperAdminLayout.tsx](file:///c:/Users/rajrr/CustomerSelfService/src/components/super-admin/shared/SuperAdminLayout.tsx) | [MODIFY] Mount BillingOverviewTab |
| Localization | [en.ts](file:///c:/Users/rajrr/CustomerSelfService/src/i18n/en.ts) | [MODIFY] Add billing translations |
| Localization | [ar.ts](file:///c:/Users/rajrr/CustomerSelfService/src/i18n/ar.ts) | [MODIFY] Add Arabic billing translations |

---

## 3. Verification Plan

### Automated Checks
- Run typecheck: `npm run typecheck`
- Run build check: `npm run build`

### Manual Verification
- Edit billing price rates and test negative price constraint triggers.
- Suspend a tenant subscription and verify status updates.
- Wipe lists to verify premium EmptyState page CTAs.
- Toggle language to Arabic and check layout mirroring (`dir="rtl"`).
