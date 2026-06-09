# Sprint 09 Phase 1 Plan: Client Admin Normalization

## 1. Goal & Objectives
Normalize the Client Admin information architecture, role boundaries, and sidebar navigation system into a scalable enterprise operational structure.

- **Persona Separation:** Exclude live workspace support/agent actions from the Client Admin workspace.
- **Grouped Sidebar Navigation:** Render collapsible accordion categories for Operations, AI, Channels, Governance, and System workspaces.
- **Dashboard Stabilization:** Improve default workspace container views to display active queue telemetry, warning banners, quick actions, and training activity feeds.

---

## 2. Implemented Code Changes

1. **Permissions (`permissions.ts` & `permissionStore.ts`):**
   - Cleaned `client_admin` array by removing `'inbox', 'tickets', 'agent_dashboard', 'qa_queue', 'coaching', 'supervisor_monitor', 'workforce'`.
   - Updated `canAccessScreen` to verify explicit route listings under `ROLE_PERMISSIONS`.
   - Registered new placeholder permissions (e.g. `campaigns`, `voice_ivr`).
2. **Navigation Config (`clientAdminNavigation.ts`):**
   - Created grouped configuration mapping screen IDs and Lucide icons into collapsible categories.
3. **Sidebar Navigation UI (`Sidebar.tsx`):**
   - Implemented collapsible accordion rendering, keyboard accessibility, active state mirroring, and RTL direction overrides.
4. **Dashboard Container (`BotsTab.tsx`):**
   - Resized landing view to double-column layout containing SLA health banners, recent training events, quick actions grids, and queue metrics.

---

## 3. Verification Plan

### Automated
- Compile and build codebase:
  ```bash
  cd frontend
  npm run typecheck
  npm run build
  ```

### Manual
- Validate grouped accordion sidebar menu listings.
- Toggle between sub-roles (Client Admin, Supervisor, QA Manager) to check proper permission filters.
