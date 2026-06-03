# Sprint 07 Phase 2 — Telephony Operational Management Foundation Plan

## Goal
Upgrade the stabilized Telephony module into a scalable operational management foundation for SIP trunks and DID number pools while preserving the normalized Sprint 06 architecture and Sprint 07 stabilization patterns.

---

## 1. Objectives & Scope
- **SIP Trunk Operational Refinement**: Add `activeSessions` property. Display columns: Trunk ID, Provider, Gateway Address, Route Prefix, Concurrency Limit, Active Sessions, MOS Quality, Status, Actions. Support CRUD, Enable/Disable toggles, and searching/filtering.
- **DID Number Pool Operational Refinement**: Support Add/Edit, Tenant Assign/Unassign, Reserve/Release, and Activate/Deactivate flows. Display columns: Phone Number, Country/Region, Provider, Assigned Tenant, Activation Date, Status, Assignment State, Actions.
- **Telephony Status System**: Create `TelephonyStatusBadge` to render statuses: Active, Inactive, Degraded, Reserved, Assigned, Connecting, Available.
- **Empty States**: Render full-width EmptyState cards with inline "Add" CTAs if trunks or numbers are cleared.

---

## 2. Affected Files

| Component | File Path | Action |
|-----------|-----------|--------|
| Types | [telephony.ts](file:///c:/Users/rajrr/CustomerSelfService/src/types/telephony.ts) | [NEW] Create shared type schemas |
| Badges | [TelephonyStatusBadge.tsx](file:///c:/Users/rajrr/CustomerSelfService/src/components/super-admin/telephony/TelephonyStatusBadge.tsx) | [NEW] Create status badge system |
| SIP Trunks | [SipTrunkConfigTab.tsx](file:///c:/Users/rajrr/CustomerSelfService/src/components/super-admin/telephony/SipTrunkConfigTab.tsx) | [MODIFY] Upgrade table, fields, filters, empty state |
| Number Pool | [NumberPoolTab.tsx](file:///c:/Users/rajrr/CustomerSelfService/src/components/super-admin/telephony/NumberPoolTab.tsx) | [MODIFY] Upgrade table, assignments, filters, empty state |
| Containers | [TelephonyContainer.tsx](file:///c:/Users/rajrr/CustomerSelfService/src/components/super-admin/containers/TelephonyContainer.tsx) | [MODIFY] Update translations/imports if needed |
| Localization | [en.ts](file:///c:/Users/rajrr/CustomerSelfService/src/i18n/en.ts) | [MODIFY] Add telephony column labels |
| Localization | [ar.ts](file:///c:/Users/rajrr/CustomerSelfService/src/i18n/ar.ts) | [MODIFY] Add Arabic column labels |

---

## 3. Verification Plan

### Automated Checks
- Run typecheck: `npm run typecheck`
- Run build check: `npm run build`

### Manual Verification
- Edit/Add SIP trunks and filter list by Provider.
- Reserve, Assign, Unassign, and Deactivate DIDs and filter DID pool list by Assignment State.
- Clear both lists to verify EmptyState CTA layouts.
- Toggle language to Arabic and check layout mirroring (`dir="rtl"`).
