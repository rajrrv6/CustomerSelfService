# Implementation Plan - Sprint 06 Phase 3: Deep-Linkable Tab State & URL Synchronization

Introduce refresh-safe, deep-linkable tab synchronization for Super Admin module containers using lightweight URL search parameter state while preserving all existing working routing behavior and container architecture.

## User Review Required

> [!IMPORTANT]
> - We will create a reusable hook `src/hooks/useTabQueryState.ts` that maps query parameters (`?tab=`) to container tabs.
> - **Do not introduce nested route segments, dynamic route metadata, context providers, or router rewrites.**
> - Query parameters are updated using `router.replace()` to prevent browser history pollution.
> - A client-side hydration guard will be implemented in the hook to prevent server-to-client mismatches and hydration-warning bugs.
> - Legacy alias route overrides will initialize the URL search parameter state once during mount, after which the URL becomes authoritative.

## Proposed Changes

### Hooks Layer

#### [NEW] [useTabQueryState.ts](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/hooks/useTabQueryState.ts)
- Custom React hook managing search parameters `?tab=` in Next.js using `useRouter`, `usePathname`, and `useSearchParams`.
- Includes:
  - Hydration guard (`isMounted` state check).
  - Mount-effect to initialize URL parameters from `propActiveTab` once on load if the parameter is absent.
  - State updater using `router.replace()`.

### Containers Layer

#### [MODIFY] [MasterDataContainer.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/components/super-admin/containers/MasterDataContainer.tsx)
- Replace `useState` for activeTab with `useTabQueryState('llm_registry', [...], propActiveTab)`.

#### [MODIFY] [AnalyticsContainer.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/components/super-admin/containers/AnalyticsContainer.tsx)
- Replace `useState` with `useTabQueryState('cross_tenant_analytics', [...], propActiveTab)`.

#### [MODIFY] [InfrastructureContainer.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/components/super-admin/containers/InfrastructureContainer.tsx)
- Replace `useState` with `useTabQueryState('vector_db', [...], propActiveTab)`.

#### [MODIFY] [TelephonyContainer.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/components/super-admin/containers/TelephonyContainer.tsx)
- Replace `useState` with `useTabQueryState('sip_trunk', [...], propActiveTab)`.

### Routing Layer

#### [MODIFY] [SuperAdminLayout.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/components/super-admin/shared/SuperAdminLayout.tsx)
- Intercept legacy routing aliases and propagate them as `activeTab` props to the containers.

## Verification Plan

### Automated Tests
- Run `npm run typecheck` to verify TypeScript compile integrity.

### Manual Verification
- Verify browser refresh on each container tab preserves the tab state.
- Verify direct URL access (e.g. `/admin/infrastructure?tab=knowledge_connectors`) renders the correct sub-view.
- Verify browser back/forward buttons work correctly.
- Verify invalid tabs (e.g. `/admin/infrastructure?tab=invalid_tab`) fall back safely.
