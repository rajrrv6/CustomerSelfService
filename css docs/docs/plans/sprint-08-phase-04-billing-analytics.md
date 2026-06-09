# Implementation Plan — Sprint 08 Phase 4 — Billing & Analytics Completion Pass

**Sprint**: 08  
**Phase**: 4  
**Status**: Pending Review  
**Date**: 2026-06-04  

---

## Goal
Perform a billing and analytics completion pass to address financial governance gaps and telemetry reporting maturity while maintaining the stabilized UI/UX design standards.

---

## User Review Required

> [!IMPORTANT]
> All systems, calculations, and lists remain state-driven and mock-driven. No payment gateways or live tax API clients are introduced.
> Spacing scale, HSL status badges, focus-trapping overlays, and search synchronization conform to Sprint 08 Phase 3 UX stabilization standards.

---

## Proposed Changes

### Billing Feature Completeness

#### [MODIFY] [billing.ts](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/types/billing.ts)
* Expand `BillingStatus` and `PlanStatus` types to include new lifecycle options: `pending_refund`, `refunded`, `failed_payment`, `recovering`, `coupon_active`, `coupon_expired`.
* Declare `CouponCampaign`, `RefundRequest`, `TaxRule`, and `FailedPaymentRecord` structures.

#### [MODIFY] [mockBillingData.ts](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/components/super-admin/billing/mockBillingData.ts)
* Seed realistic mock collections for `mockCoupons`, `mockRefundRequests`, `mockTaxRules`, and `mockFailedPayments`.

#### [MODIFY] [BillingStatusBadge.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/components/super-admin/billing/BillingStatusBadge.tsx)
* Support text mapping and styling colors for: `pending_refund`, `refunded`, `failed_payment`, `recovering`, `coupon_active`, `coupon_expired`.
* Retain HSL styling standard, standardized padding (`px-2.5 py-0.5`), and RTL-safe dot margins.

#### [MODIFY] [BillingOverviewTab.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/components/super-admin/billing/BillingOverviewTab.tsx)
* Orchestrate 6 sub-tabs:
  1. `overview` (KPIs + Failed Payments Tracking Table)
  2. `tenants` (Tenant Billing accounts table)
  3. `plans` (Subscription price configurations)
  4. `coupons` (Registry table & discount adjustments)
  5. `refunds` (Approval/rejection queue)
  6. `taxes` (Taxation rules registry)
* Use the hardened `useTabQueryState` hook to synchronize sub-tab selection with URL parameter checks.
* Implement Failed Payments recovery HUD including retry counters, dunning alerts, and recovery status columns.

#### [NEW] [BillingCouponsTab.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/components/super-admin/billing/BillingCouponsTab.tsx)
* Renders coupon code tables (code, type, value, expiry date, status, usage stats).
* Implement interactive create dialog form, toggling state logic, and deletion handler.

#### [NEW] [RefundQueueTab.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/components/super-admin/billing/RefundQueueTab.tsx)
* Displays incoming client refund requests, amount, reason code, reference invoice.
* Implement actions: Approve, Reject, and Mark Reviewed (generating audit logging outputs and push notifications).

#### [NEW] [TaxConfigurationTab.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/components/super-admin/billing/TaxConfigurationTab.tsx)
* Renders regional tax rates (VAT/GST/Exempt status toggles) and invoice metadata.
* Supports adding new tax configurations, editing parameters, and toggling status.

---

### Analytics Reporting Refinement

#### [MODIFY] [SuperAdminAnalyticsTab.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/components/super-admin/analytics/SuperAdminAnalyticsTab.tsx)
* **Cross-Tenant Metrics**:
  * Expand KPI blocks to display average Containment Success Rates (target vs. actual) and aggregate Cost Optimization savings.
  * Integrate an SVG containment trend line chart and an AI Token Cost Comparison bar chart.
  * Update the Tenant Ranking table to report token volume, active bot load, highest cost distribution, and containment rates.
  * Embed an Operational Anomaly banner highlighting latency spikes or usage irregularities.

---

### Localization Integration

#### [MODIFY] [en.ts](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/i18n/en.ts)
* Seed localized strings for dunning notices, recovery statuses, refund reasons, tax labels, and coupons.

#### [MODIFY] [ar.ts](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/i18n/ar.ts)
* Mirror all translation additions in Arabic with RTL-safe wording.

---

## Verification Plan

### Automated Tests
* Validate type correctness and production bundle builds:
  ```bash
  cd frontend
  npm run typecheck
  npm run build
  ```

### Manual Verification
* Navigate to `/admin/billing?tab=coupons` and verify active coupons campaign management.
* Perform refund approval and rejection actions, confirming simulated toast notification updates and audit logging entries.
* View `/admin/analytics?tab=cross_tenant_analytics` and check that cost, containment, and tenant load metrics align.
