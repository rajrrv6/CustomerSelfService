# Archived Components Catalog
## CustomerSelfService Platform — Structure Stabilization

**Cleanup Date:** 2026-06-03  
**Last Updated:** 2026-06-03T16:30:58+05:30  
**Auditor / Architect:** Senior Frontend Architecture Maintainer (Antigravity)  

---

## 1. Directory Structure

The `src/archive/` namespace is structured into five functional subdivisions to maintain historical context and code logs for unused or legacy items:

```
src/archive/
├── forms/               ← Unused shared input fields and custom form wrappers
├── responsive/          ← Obsolete layout wrappers and breakpoint hooks
├── experimental/        ← Stale UI tests and interactive experiments
├── deprecated/          ← Legacy production components superseded by newer implementations
└── old-builders/        ← Original drag-and-drop workflow canvases (e.g. dialog-builder)
```

---

## 2. Directory Assignments

### A. `src/archive/forms/`
Contains custom form elements and layout section tags that have no imports or entries in the active codebase:
* `CheckboxField.tsx`
* `DateTimeField.tsx`
* `FormDrawer.tsx`
* `FormErrorBanner.tsx`
* `FormSection.tsx`
* `JsonEditorField.tsx`
* `MultiSelectField.tsx`
* `RadioGroupField.tsx`
* `SearchableComboboxField.tsx`
* `SliderField.tsx`
* `TagInputField.tsx`
* `TableRowActionMenu.tsx` (Table row actions menu dropdown)
* `ActivityFeed.tsx` (Activity feed layout card)
* `DrilldownPanel.tsx` (Workflow drilldown data grid panel)
* `InvestigationDrawer.tsx` (Case detail slide-out drawer)
* `formTransformers.ts` (Form mapping utilities)

### B. `src/archive/responsive/`
Contains responsive layouts and hook helpers superseded by Next.js breakpoint controls and native layouts:
* `AdaptiveSplitPane.tsx`
* `CollapsibleActionTray.tsx`
* `ResponsiveDrawer.tsx`
* `index.ts` (Barrel file)
* `useResponsiveLayout.ts` (Custom media query breakpoint hook)

### C. `src/archive/experimental/`
* *Currently empty.* Reserved for active dashboard or canvas UI experiments.

### D. `src/archive/deprecated/`
* *Currently empty.* Reserved for active production code that will be deprecated during upcoming sprints.

### E. `src/archive/old-builders/`
Contains the original duplicate drag-and-drop workspace flow builder:
* `dialog-builder/` — 19 component files (originally at `src/components/dialog-builder/`).
  - orchestrators (`DialogFlowLayout.tsx`, `WorkflowCanvas.tsx`, `WorkflowSimulator.tsx`)
  - nodes (`ApiNode.tsx`, `BranchNode.tsx`, `DbNode.tsx`, `IntentNode.tsx`, etc.)
  - custom canvas state hooks and mini-maps.

---

## 3. Maintenance

The files in the archive directory are **not** compiled by Next.js and are ignored during typechecking to prevent relative path conflicts. This is managed by the following setting in `tsconfig.json`:
```json
"exclude": ["node_modules", "src/archive"]
```
If an archived file is needed for reuse, it must be moved back into the active `src/components/` directories, and its relative imports must be updated to resolve correctly.
