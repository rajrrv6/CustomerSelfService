# Hotfix Audit Log — Persona Launcher UI Switcher Mismatch

This document registers the audit results and subsequent remediation steps taken to resolve the mismatch in the Application Switcher dropdown and Internal Sub-Role selector dropdown, aligning both dropdown interfaces to display all 7 restored enterprise personas.

## 1. Discrepancy Found
During the audit of Sprint 10 Phase 1 restoration parameters, it was discovered that:
* The **Header Application Switcher** rendered a hardcoded 4-item list (`super_admin`, `client_admin`, `end_user`, `public_bot`) under the legacy `TopApp` structure rather than displaying the 7 discrete personas.
* The **Sidebar Internal Sub-Role Selector** rendered static localized lists segregated depending on top-level role categories (`clientAdminRoles` vs `endUserRoles`), which failed to display the unified 7-persona options.
* There was no centralized source of truth defining the roles, labels, default target screens, and workspace routes.

## 2. Root Cause
The codebase previously used a simplified grouping where roles like `support_agent`, `qa_manager`, and `supervisor` were consolidated under `end_user` or `client_admin` apps. With Sprint 10 Phase 1 segregation complete, the workspace launcher listed all 7 roles, but header and sidebar dropdowns had not yet been migrated to the new config.

## 3. Remediation & Action Taken
To synchronize role selection interfaces and prevent configuration drifts:
1. **Centralized Configuration**: Defined `CENTRALIZED_PERSONAS` in `src/config/personas.ts` detailing:
   * Value (e.g. `support_agent`)
   * Localized Labels (English and Arabic)
   * Default Sub-Screen ID (`defaultScreen`)
   * Routing path (`route`)
2. **Header Dropdown Switcher**: Modified [Header.tsx](file:///c:/Users/rajrr/CustomerSelfService/src/components/dashboard/Header.tsx) to read directly from `CENTRALIZED_PERSONAS`, rendering all 7 roles and dynamically mapping active labels.
3. **Sidebar Dropdown Selector**: Modified [Sidebar.tsx](file:///c:/Users/rajrr/CustomerSelfService/src/components/dashboard/Sidebar.tsx) to render all 7 roles in the sub-role selector, removing stale `clientAdminRoles` and `endUserRoles` arrays.
4. **Workspace Launcher**: Inspected [WorkspaceShell.tsx](file:///c:/Users/rajrr/CustomerSelfService/src/components/workspace/WorkspaceShell.tsx) and confirmed it is fully aligned with the central config.

## 4. Verification Check
* Verified that selecting any option in either dropdown correctly mutates the auth store role state and triggers a route transition.
* Verified that Arabic translation maps and RTL orientation function seamlessly.
