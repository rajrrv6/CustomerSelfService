# Sprint 08 Phase 2 — System Operations Operational Foundation Plan

**Sprint**: 08  
**Phase**: 2  
**Status**: Approved  
**Date**: 2026-06-04  

---

## Objective
Implement the System Operations operational foundation for the Super Admin portal, introducing the new `sa_system_ops` screen module under the `PLATFORM MANAGEMENT` navigation group. The module will include a health status dashboard, a jobs queue monitoring table, an error exceptions log, a database schema/release migrations timeline, and inline state-driven controls (retry, abort, filter).

---

## Architectural Constraints & Scope
* No visual redesign. Preserve all colors, fonts, spacing, and styles from existing screens.
* Bilingual (EN/AR) support with automated RTL layouts.
* Query parameter tab sync via `useTabQueryState`.
* No screen numbers or inventory labels in UI text, code comments, or variables.
* Fully mock data with realistic metrics, compute load, and audit logs.
* No external chart packages — use the pre-existing SVG charting primitives (`Charts.tsx`).

---

## File Changes Overview

### Configuration & Permissions
* `src/config/superAdminNavigation.ts` — Insert `sa_system_ops` module under the `PLATFORM MANAGEMENT` group.
* `src/lib/rbac/permissions.ts` — Register permissions and screen title mappings.

### Layout Routing
* `src/components/super-admin/shared/SuperAdminLayout.tsx` — Add `sa_system_ops` routing to lazy-loaded `SystemOperationsContainer`.

### Localization
* `src/i18n/en.ts` — Add English keys for System Operations nav labels, tabs, tables, status terms, and exception details.
* `src/i18n/ar.ts` — Add Arabic translations for all the same keys.

### Core Components
* `src/types/systemOperations.ts` — Define System Operations interfaces.
* `src/components/super-admin/system-operations/mockSystemOperationsData.ts` — Seed mock datasets.
* `src/components/super-admin/system-operations/SystemOpsStatusBadge.tsx` — Status badge component.
* `src/components/super-admin/system-operations/SystemOperationsContainer.tsx` — Main container layout.
* `src/components/super-admin/system-operations/HealthDashboardTab.tsx` — System health metrics and SVG charts.
* `src/components/super-admin/system-operations/JobsQueueTab.tsx` — background job orchestration lists.
* `src/components/super-admin/system-operations/ErrorMonitoringTab.tsx` — Failure logs and severity filters.
* `src/components/super-admin/system-operations/MigrationHistoryTab.tsx` — Release tracking and migrations timeline.
