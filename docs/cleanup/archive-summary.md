# Archive Summary (Experimental & Unused Components)
## CustomerSelfService Platform — Repo Hygiene

**Cleanup Date:** 2026-06-03  
**Last Updated:** 2026-06-03T16:26:14+05:30  
**Auditor:** Senior Frontend Repository Maintainer (Antigravity)  

---

## 1. Overview & Summary

To avoid breaking compiling pipelines while cleaning codebase directories, medium-risk unused UI components, custom form validators, and old layout experiments were moved to `src/archive/` instead of being permanently hard-deleted.

To prevent build errors from broken relative paths in these archived items, the path `src/archive` has been explicitly added to the `"exclude"` list inside `tsconfig.json`.

---

## 2. Archived Directories Log

### A. Experimental / Duplicate Dialog Flow Builder
* **Archive Path:** `frontend/src/archive/experimental/dialog-builder/`
* **Original Path:** `frontend/src/components/dialog-builder/`
* **Contents:** 19 files including `DialogFlowLayout.tsx`, `WorkflowCanvas.tsx`, `WorkflowInspector.tsx`, `WorkflowMinimap.tsx`, `WorkflowSimulator.tsx`, `WorkflowToolbar.tsx`, node definitions, and hooks.
* **Reason:** This was a duplicate experimental layout cloned to `components/client-admin/dialog-builder/` to satisfy role-based routing.

---

### B. Old Responsive Layouts
* **Archive Path:** `frontend/src/archive/old-responsive/`
* **Original Paths:** `frontend/src/components/responsive/` (select files) and `frontend/src/hooks/useResponsiveLayout.ts`
* **Contents:**
  - `AdaptiveSplitPane.tsx`
  - `CollapsibleActionTray.tsx`
  - `ResponsiveDrawer.tsx`
  - `index.ts`
  - `useResponsiveLayout.ts`
* **Reason:** These responsive helpers are unused; the active application uses explicit breakpoints and mobile sheet containers (`MobileSheet.tsx`, `MobileTabs.tsx`).

---

### C. Inactive Shared Form Fields & Workflows
* **Archive Path:** `frontend/src/archive/forms/`
* **Original Paths:** `frontend/src/components/shared/forms/` (select files), `frontend/src/components/shared/table/TableRowActionMenu.tsx`, `frontend/src/components/shared/workflows/` (select files), and `frontend/src/lib/forms/formTransformers.ts`
* **Contents:**
  - `CheckboxField.tsx`, `DateTimeField.tsx`, `FormDrawer.tsx`, `FormErrorBanner.tsx`, `FormSection.tsx`, `JsonEditorField.tsx`, `MultiSelectField.tsx`, `RadioGroupField.tsx`, `SearchableComboboxField.tsx`, `SliderField.tsx`, `TagInputField.tsx`
  - `TableRowActionMenu.tsx`
  - `ActivityFeed.tsx`, `DrilldownPanel.tsx`, `InvestigationDrawer.tsx`
  - `formTransformers.ts`
* **Reason:** These components represent custom UI controls and workflow panels that are currently not used or imported in any active module.

---

## 3. Compilation Protection

The `exclude` configuration in `tsconfig.json` protects compilation stability:
```json
"exclude": ["node_modules", "src/archive"]
```
This ensures TypeScript and Next.js compiler steps bypass the archived folder, ignoring any relative import resolution issues within archived experiments.
