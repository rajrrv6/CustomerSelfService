# Sprint 01 — File Impact Analysis

This document evaluates the files in scope for Sprint 01 changes, detailing the modifications and risks associated with each.

---

## 1. Workspace Shell Component
* **File Reference**: [WorkspaceShell.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/components/workspace/WorkspaceShell.tsx)
* **Why Impacted**: Houses the main workspace shell wrapper and determines which views load for specific roles.
* **Expected Changes**: Remove imports and rendering declarations for supervisor/QA views (e.g. `SupervisorView`, `QAManagerView`). Remove supervisor monitoring logs overlays from the workspace shell.
* **Risk Level**: Medium.
* **Dependency Chain**: `permissions.ts`, `Sidebar.tsx`.
* **Regression Risk**: Removing supervisor code blocks could affect supervisor views if changes are not properly scoped to the support agent role.
* **Responsive Risk**: Low.
* **RTL Risk**: Low.
* **Accessibility Risk**: Ensure landmark elements (`main`, `aside`) remain properly defined after cleanup.

---

## 2. Sidebar Component
* **File Reference**: [Sidebar.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/components/dashboard/Sidebar.tsx)
* **Why Impacted**: Renders the left-hand navigation list.
* **Expected Changes**: Remove links to supervisor panels, coaching planners, and QA queues for the support agent view.
* **Risk Level**: Low.
* **Dependency Chain**: `WorkspaceShell.tsx`, translations file.
* **Regression Risk**: Low.
* **Responsive Risk**: Verify the sidebar collapse toggle operates correctly on small viewports.
* **RTL Risk**: Ensure mirrored margins and flex alignments are maintained in Arabic mode.
* **Accessibility Risk**: Confirm links use appropriate labels and keyboard focus is clear.

---

## 3. Agent Workspace Layout Component
* **File Reference**: [AgentWorkspaceLayout.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/components/agent-workspace/AgentWorkspaceLayout.tsx)
* **Why Impacted**: Connects individual agent views and handles sub-screen changes.
* **Expected Changes**: Correct the conditional block for the `tickets` active sub-screen to render a tickets list view component instead of the shift schedule. Modify state bindings to remove references to supervisor whispering and voice panel components.
* **Risk Level**: High.
* **Dependency Chain**: `WorkspaceShell.tsx`, `Sidebar.tsx`.
* **Regression Risk**: Updating active sub-screen conditions can affect layout renders if not tested carefully.
* **Responsive Risk**: Verify split-pane layouts scale correctly without overlapping content.
* **RTL Risk**: Mirror layout elements in Arabic mode.
* **Accessibility Risk**: Timeline sections must use proper aria attributes.

---

## 4. RBAC Route Configuration
* **File Reference**: [permissions.ts](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/lib/rbac/permissions.ts)
* **Why Impacted**: Configures the screen access permissions matrix for roles.
* **Expected Changes**: Ensure the support agent permissions array includes the corrected tickets screen and dashboard items, while excluding supervisor and QA resources.
* **Risk Level**: Medium.
* **Dependency Chain**: `WorkspaceShell.tsx`, `Sidebar.tsx`.
* **Regression Risk**: Misconfiguring permissions can lead to access-denied errors on valid routes.
* **Responsive Risk**: None.
* **RTL Risk**: None.
* **Accessibility Risk**: None.

---

## 5. UI State Store
* **File Reference**: [uiStore.ts](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/stores/uiStore.ts)
* **Why Impacted**: Manages language, theme, and active screen state.
* **Expected Changes**: Add actions to cache composer drafts locally, preventing data loss when language preferences change.
* **Risk Level**: Low.
* **Dependency Chain**: Layout components.
* **Regression Risk**: Ensure existing layout states are not disrupted by store updates.
* **Responsive Risk**: Low.
* **RTL Risk**: Ensure language toggle changes update layout direction variables correctly.
* **Accessibility Risk**: None.

---

## 6. Language Providers & Translations
* **File Reference**: [translations.ts](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/i18n/translations.ts)
* **Why Impacted**: Contains dictionaries for LTR and RTL rendering.
* **Expected Changes**: Verify ticket list labels and navigation links are defined in both English and Arabic.
* **Risk Level**: Low.
* **Dependency Chain**: Sidebar, layouts.
* **Regression Risk**: Missing translation keys can cause UI text elements to display raw code.
* **Responsive Risk**: Low.
* **RTL Risk**: Verify Arabic translations display correctly.
* **Accessibility Risk**: None.
