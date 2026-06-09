# Sprint 01 — Route Normalization Strategy

This document details the routing corrections, access controls, and navigation rules for the Support Agent Workspace.

---

## 1. Current Route Problems
Navigating to the `/tickets` route currently displays the **Shift Planner UI** (`<ShiftSchedule />`) rather than a list of support incidents. This mapping error must be resolved.

## 2. Route Mapping Analysis
In `AgentWorkspaceLayout.tsx`, the sub-routing matches screen keys to components:
* The Sidebar component links the "Tickets" item to the `tickets` active sub-screen.
* The conditional block in `AgentWorkspaceLayout.tsx` for `activeSubScreen === 'tickets'` incorrectly returns `ShiftSchedule` (the Shift Planner).
* This mapping error must be corrected so that `tickets` displays the tickets listing, and the Shift Planner is mapped to its own screen (`shift_planner`).

---

## 3. Desired Final Route Structure

For a Support Agent, the active workspace shell sub-screens are mapped as follows:

```text
/workspace/inbox
  ├── ?screen=agent_dashboard       -> Agent Dashboard (Metrics Scorecard)
  ├── ?screen=inbox                 -> Unified Inbox (default workspace view)
  ├── ?screen=tickets               -> Incident Tickets list (corrected mapping)
  ├── ?screen=copilot               -> AI Copilot recommendations center
  ├── ?screen=suggested_replies     -> AI composer testing workspace
  └── ?screen=wrapup_codes          -> Resolution codes configurations
```

---

## 4. Route Isolation & RBAC Safety Strategy

To prevent role leakage, the workspace router must enforce role boundaries:
* **Agent Role Boundaries**: Support agents can access only their dashboard, inbox, tickets, and AI components.
* **Access Checks**: The layout shell runs access checks (`canAccessScreen`) before rendering components. If an unauthorized screen (e.g. `supervisor_monitor`) is requested, the workspace redirects to the access-denied page.
* **Component isolation**: Supervisor monitors and QA widgets are not imported or rendered inside the Support Agent Workspace layouts.

---

## 5. Navigation Consistency Rules

* **Page Reload Prevention**: Sub-screen navigation is handled via local state transitions, preventing full page reloads.
* **Deep Link Handling**: On initial load, the layout checks URL query parameters (e.g., `?screen=tickets`) and focuses the requested view, if the user has access.
* **Refresh Handling**: Active sub-screen selections are cached in the UI store, ensuring the active view persists when the page is refreshed.
* **Route Fallback Handling**: If an invalid sub-screen is requested, the router falls back to the role's default screen (`agent_dashboard` or `inbox`).
