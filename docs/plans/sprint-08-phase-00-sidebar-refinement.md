# Sprint 08 Phase 0 — Super Admin Sidebar IA Refinement

**Sprint**: 08  
**Phase**: 0  
**Status**: Complete  
**Date**: 2026-06-04  

---

## Objective

Transform the flat Super Admin sidebar into a grouped enterprise navigation layout without visual redesign. Add three new operational placeholder pages (Notifications, Settings, Help Center) with meaningful bilingual content.

---

## Problem Statement

The existing Super Admin sidebar rendered all 7 navigation items in a single unlabeled flat block under a generic `super_admin Options` heading. This resulted in:

- Poor operational discoverability
- Weak enterprise hierarchy
- Difficult visual scanning as future modules are added
- No operational segmentation between system areas

---

## Solution

Introduced a `SuperAdminNavSection` grouping model and refactored the sidebar to render enterprise section labels, separating the 10 SA nav items (7 existing + 3 new) into 6 logical groups.

### Navigation Groups

| Group | Items |
|---|---|
| MAIN | Dashboard |
| PLATFORM MANAGEMENT | Master Data, Infrastructure, Telephony |
| OPERATIONS | Analytics, Billing |
| GOVERNANCE | Audit & Compliance |
| SYSTEM | Notifications, Settings |
| SUPPORT | Help Center |

---

## Files Changed

### Configuration
- `src/config/superAdminNavigation.ts` — Introduced `SuperAdminNavSection` type and grouped sections array. Flat export retained for backward compatibility.

### Sidebar
- `src/components/dashboard/Sidebar.tsx` — SA sidebar now renders grouped sections with section labels. All non-SA role sidebar behavior unchanged.

### New Page Components
- `src/components/super-admin/notifications/NotificationsOverviewTab.tsx`
- `src/components/super-admin/settings/SettingsOverviewTab.tsx`
- `src/components/super-admin/help/HelpCenterTab.tsx`

### Layout Routing
- `src/components/super-admin/shared/SuperAdminLayout.tsx` — Added 3 lazy-loaded case routes for `sa_notifications`, `sa_settings`, `sa_help`.

### RBAC
- `src/lib/rbac/permissions.ts` — Added 3 new IDs to `ROLE_PERMISSIONS.super_admin`, `SUPER_ADMIN_SCREENS`, and `getScreenTitle()`.

### Localization
- `src/i18n/en.ts` — Added section labels, nav item keys, and 3 page namespaces (notifications, settings, help).
- `src/i18n/ar.ts` — Mirrored all additions in Arabic with RTL-safe wording.

---

## Design Decisions

1. **No `labelKeyAr` field on SuperAdminNavSection** — The existing i18n system handles Arabic via `labelKey` + `ar.ts`. Adding a duplicate field would create split localization responsibility.

2. **Flat array retained** — `superAdminNavigation` is re-exported as a derived flat array from `superAdminNavSections.flatMap()` so any existing consumers are unaffected.

3. **Notifications kept operational-only** — No real-time simulation. Content is operational announcements, sync notices, governance reminders, deployment updates, and billing advisories.

4. **Lazy loading** — All three new tab components follow the existing `React.lazy` + `Suspense` pattern used by BillingOverviewTab and AuditOverviewTab.

---

## Constraints Respected

- No visual redesign (colors, typography, spacing, shadows unchanged)
- No new routing system (existing screen-ID / WorkspaceShell architecture preserved)
- No new state management
- No accordion / collapsible sidebar
- All existing modules intact
- RBAC normalization preserved
- Mobile sidebar behavior unchanged
- Dark/light theme preserved
- Arabic RTL mirroring preserved
