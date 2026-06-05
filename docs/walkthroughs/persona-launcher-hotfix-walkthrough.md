# Hotfix Walkthrough — Persona Launcher UI Switcher Mismatch

This walkthrough details the changes implemented to repair the mismatch in the Application Switcher dropdown and Sidebar role selector.

## Changes Made

### 1. Centralized Config File
#### [NEW] [personas.ts](file:///c:/Users/rajrr/CustomerSelfService/src/config/personas.ts)
A centralized array mapping the 7 core personas:
* `super_admin`
* `client_admin`
* `support_agent`
* `qa_manager`
* `supervisor`
* `customer` (End User)
* `public_bot` (Public / Bot)

---

### 2. Header Switcher Dropdown
#### [MODIFY] [Header.tsx](file:///c:/Users/rajrr/CustomerSelfService/src/components/dashboard/Header.tsx)
- Replaced the legacy 4-item list `topAppList` with `CENTRALIZED_PERSONAS`.
- Dynamically resolved the displayed button text based on the active role:
```typescript
const currentPersona = CENTRALIZED_PERSONAS.find((p) => p.value === role) || CENTRALIZED_PERSONAS[0];
```
- Redesigned click actions to update Zustand auth store and trigger target route redirects:
```typescript
onClick={() => {
  setShowRoleMenu(false);
  if (item.value === 'public_bot') {
    router.push('/portal/public');
  } else {
    setRole(item.value);
    router.push(item.route);
  }
}}
```

---

### 3. Sidebar Sub-Role Selector
#### [MODIFY] [Sidebar.tsx](file:///c:/Users/rajrr/CustomerSelfService/src/components/dashboard/Sidebar.tsx)
- Deleted local static segregated arrays `clientAdminRoles` and `endUserRoles`.
- Imported `useRouter` to handle Next.js client routing transitions.
- Re-routed the dropdown menu items list to render all 7 entries from `CENTRALIZED_PERSONAS` directly.
- Mapped selected options to dispatch set role actions and execute redirect routines:
```typescript
onClick={() => {
  setShowSubRoleMenu(false);
  if (subItem.value === 'public_bot') {
    router.push('/portal/public');
  } else {
    useAuthStore.getState().setRole(subItem.value as UserRole);
    setActiveScreen(subItem.defaultScreen);
    router.push(subItem.route);
  }
}}
```

---

### 4. Workspace Launcher Imports
#### [MODIFY] [WorkspaceShell.tsx](file:///c:/Users/rajrr/CustomerSelfService/src/components/workspace/WorkspaceShell.tsx)
- Cleaned up unused import references for `getTopAppForRole`.
