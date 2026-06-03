# Sprint 07 — Super Admin Platform Common & Compliance Plan
## CustomerSelfService Platform — Sprint Plans

**Execution Window:** Sprint 07 (2 Weeks)  
**Last Updated:** 2026-06-03T17:39:32+05:30  
**Priority:** 🟡 SUPER SAAS ORCHESTRATION & ENTERPRISE CONTROLS  
**Risk Level:** Medium (Platform settings screens & audit trail integrations)  
**Complexity Estimate:** Medium (10 Story Points / 5 Person-Days)  

---

## 1. Sprint Goal

Implement the remaining platform enterprise operations controls (Platform Billing Plans, Immutable System Audit Trail, and Platform Common tab containers) to deliver a comprehensive administration dashboard compliant with the Screen Inventory and Common Per App specifications.

---

## 2. Scope & Target Areas

This sprint targets settings registries, system trackers, and configuration panels inside:
* `/frontend/src/components/super-admin/` (NEW tabs and controllers)
* `/frontend/src/components/dashboard/Sidebar.tsx` (expose new links under role check)

---

## 3. Implementation Tasks

### Task 1: Platform-wide Billing Plan Configuration (Billing)
* **Goal:** Edit subscription parameters and token pricing.
* **Implementation:** Create `GlobalBillingPlans.tsx` allowing adjustments of:
  - Input/Output token price thresholds (pricing per 1M tokens).
  - Monthly subscription packages (adjust base price limits for Free/Pro tiers).
  - Action limits (set warning alerts when storage volumes exceed 80%).
* **Affected Modules:** Platform Common / Billing
* **Complexity:** 4 SP (1.5 Days)

### Task 2: Implement Immutable System Audit Trail & Compliance Viewer (Audit & Compliance)
* **Goal:** Provide platform-wide auditing of operator modifications.
* **Implementation:** Create `PlatformAuditTrail.tsx` rendering an immutable table of platform log events (logins, tenant provisioning, credential alterations, data wipes).
* **Affected Modules:** Platform Common / Audit
* **Complexity:** 4 SP (1.5 Days)

### Task 3: Build Platform Common Container Layout (Nested Tabs Conversion)
* **Goal:** Convert common components to nested tab controllers.
* **Implementation:** Build `PlatformCommonContainer.tsx` switching Platform Billing Plans and Immutable System Audit Trail. Refactor [SuperAdminLayout.tsx](file:///frontend/src/components/super-admin/shared/SuperAdminLayout.tsx) to mount it under route `/super-admin/common`.
* **Affected Modules:** Super Admin Layout
* **Complexity:** 2 SP (1 Day)

---

## 4. Dependencies

* All tasks depend on authentication hooks mapping the active persona as a `super_admin` role.

---

## 5. Expected Outcomes

* Platform operators can configure global billing tiers and check compliance trails.
* System audit logs are captured and displayed in a read-only list.

---

## 6. Verification Requirements & Checklist

- [ ] Log in as a `super_admin` account. Open the "Platform Common" -> "Platform Billing Plans" tab. Modify token rates and check that the updates save.
- [ ] Open the "Platform Common" -> "Immutable System Audit Trail" tab. Confirm logs of recent actions are displayed in a table.
- [ ] Execute `npm run typecheck` and verify the compilation is error-free.
