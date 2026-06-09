# Implementation Plan - Sprint 06 Phase 1: Super Admin RBAC & Sidebar Normalization

This document outlines the finalized implementation plan for Sprint 06 Phase 1 to normalize Super Admin RBAC permission groups and sidebar navigation.

## 1. Goal
Normalize Super Admin RBAC registries and sidebar navigation architecture into stable inventory-aligned platform modules without introducing visual design risks.

## 2. Scope & Target Areas
- `/frontend/src/config/superAdminNavigation.ts` (NEW configuration file)
- `/frontend/src/lib/rbac/permissions.ts` (RBAC routing matrix & screen mappings)
- `/frontend/src/components/dashboard/Sidebar.tsx` (sidebar grouping and navigation)
- `/frontend/src/components/super-admin/shared/SuperAdminLayout.tsx` (view dispatcher)
- `/frontend/src/app/admin/infrastructure/page.tsx` (landing route default)
- `/frontend/src/app/demo-sandbox/page.tsx` (sandbox default routing)
- `/frontend/src/lib/auth/roleRouting.ts` (path routing defaults)
- `/frontend/src/i18n/en.ts` & `/frontend/src/i18n/ar.ts` (module translation keys)

## 3. Engineering Guidelines
- **No new visual systems or placeholder UIs**: Fall back to the default "Screen not implemented" component for unreleased screens (Billing, Audit). Mapped Dashboard to the existing stable Model Registry view.
- **Strict Backward Compatibility**: Keep deprecated permission keys as aliases to ensure old routes and test scripts continue to work, while using new keys as the canonical source of truth.
- **Minimized Routing Modifications**: Do not redesign or modify unrelated project files; preserve all layout structures.

## 4. Verification Plan
- Run `npm run typecheck` to verify TypeScript compile integrity.
- Manual sandbox walk-through of the 7 modules.
