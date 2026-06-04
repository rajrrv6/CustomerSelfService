# Sprint 08 Phase 1 — Tenant Management Operational Foundation Plan

**Sprint**: 08  
**Phase**: 1  
**Status**: Approved  
**Date**: 2026-06-04  

---

## Objective
Implement the Tenant Management operational foundation for the Super Admin portal, adding the new `TENANT MANAGEMENT` sidebar section, the `sa_tenant_management` screen module, and the core views: Tenant List, Tenant Detail (slide-over), Consumption Metering, Feature Toggles, and a multi-step Tenant Onboarding Wizard.

---

## Architectural Constraints & Scope
* No visual redesign. Preserve all colors, fonts, spacing, and styles from existing screens.
* Bilingual (EN/AR) support with automated RTL layouts.
* Query parameter tab sync via `useTabQueryState`.
* No screen numbers or inventory labels in UI text, code comments, or variables.
* Fully mock data with realistic metrics, resource loads, and audit logs.

---

## File Changes Overview

### Configuration & Permissions
* `src/config/superAdminNavigation.ts` — Insert `tenant_management` section and navigation item.
* `src/lib/rbac/permissions.ts` — Register permissions and screen title mappings.

### Layout Routing
* `src/components/super-admin/shared/SuperAdminLayout.tsx` — Add `sa_tenant_management` routing to lazy-loaded `TenantManagementContainer`.

### Localization
* `src/i18n/en.ts` — Add English keys for Tenant Management nav labels, tabs, tables, drawer, and wizard.
* `src/i18n/ar.ts` — Add Arabic translations for all the same keys.

### Core Components
* `src/types/tenant.ts` — Define Tenant Management interfaces.
* `src/components/super-admin/tenant-management/mockTenantData.ts` — Seed mock datasets.
* `src/components/super-admin/tenant-management/TenantManagementContainer.tsx` — Main container layout.
* `src/components/super-admin/tenant-management/TenantListTab.tsx` — Searchable grid of tenants with action triggers.
* `src/components/super-admin/tenant-management/TenantDetailDrawer.tsx` — Slide-over details, whitelist configs, scoped audit log, lifecycle triggers.
* `src/components/super-admin/tenant-management/TenantProvisioningWizard.tsx` — Step-by-step onboarding wizard.
* `src/components/super-admin/tenant-management/TenantMeteringTab.tsx` — Utilization telemetry graphs and metrics.
* `src/components/super-admin/tenant-management/TenantFeatureFlagsTab.tsx` — Individual gate settings toggles per tenant.
