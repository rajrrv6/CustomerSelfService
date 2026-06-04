# Sprints & Hotfix Checkpoint — Persona Launcher UI Switcher Mismatch

This checkpoint documents the validation criteria, automated compilation check results, and manual verify lists for the persona switcher hotfix.

## 1. Validation Checklist
- [x] **Centralized Registry**: File [personas.ts](file:///c:/Users/rajrr/CustomerSelfService/src/config/personas.ts) defines all 7 enterprise personas consistently.
- [x] **Header Switcher**: Dropdown in [Header.tsx](file:///c:/Users/rajrr/CustomerSelfService/src/components/dashboard/Header.tsx) lists all 7 personas.
- [x] **Sidebar Switcher**: Sub-role selector dropdown in [Sidebar.tsx](file:///c:/Users/rajrr/CustomerSelfService/src/components/dashboard/Sidebar.tsx) lists all 7 personas.
- [x] **Unused Cleanups**: Removed static segregated arrays (`clientAdminRoles`, `endUserRoles`) and unused imports (`getTopAppForRole` in `WorkspaceShell.tsx`).
- [x] **Next.js Routing**: Selecting a role triggers navigation to the correct path (`/tenant/dashboard`, `/admin/infrastructure`, `/portal/home`, `/portal/public`).
- [x] **RTL Alignment**: Layout and label text translation behaves correctly in Arabic.

## 2. Automated Run Summary
Commands:
```bash
npm run typecheck
npm run build
```
Target results:
* **TypeScript compilation passes with 0 errors.**
* **Next.js static site builder completes production build with 0 routes errors.**

## 3. Manual Inspection Steps
1. Deploy local dev environment.
2. In the Header dropdown, select the `QA Manager` persona. Check if the workspace refreshes, shows QA tools, and redirects to `/tenant/dashboard`.
3. In the Sidebar Internal Sub-Role selector, select the `Supervisor` persona. Check if it mounts Supervisor views and updates the active label.
4. Select `Public / Bot` in either switcher. Verify that it routes to `/portal/public` (Guest Helpdesk Portal).
5. Verify the visual layout direction matches language switching (Arabic `dir="rtl"`).
