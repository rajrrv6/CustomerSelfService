# Safe to Delete Analysis (Clean & Orphaned Files)
## CustomerSelfService Platform — Repo Hygiene

**Audit Date:** 2026-06-03  
**Last Updated:** 2026-06-03T16:06:48+05:30  
**Auditor:** Senior Repository Cleanup Auditor (Antigravity)  
**Verification Method:** AST Import Tree BFS Traversal (Entry point: `app/layout.tsx` + App Router routes)

---

## 1. Overview & Summary

This report identifies all files and folders in the CustomerSelfService repository that have **zero references** in the build graph, layout entry points, page routes, or style chains. These files can be immediately and safely deleted without breaking compilation, typechecking, running tests, or runtime execution.

---

## 2. Inventory of Safe-to-Delete Files

### A. Root Directory Debug Scripts & Dumps
These are temporary helper scripts and generated text files left behind by developers or automated agents. They are not part of Next.js and pollute the repository root.

| File Path | File Size | Description / Reason for Deletion | Evidence | Risk Level |
|---|---|---|---|---|
| `frontend/check_log_contents.py` | 851 B | Developer debug utility script | Never imported | 🔴 Zero Risk |
| `frontend/find_line_with_key.py` | 852 B | Developer debug utility script | Never imported | 🔴 Zero Risk |
| `frontend/get_subagent_input.py` | 395 B | Agent communication debug script | Never imported | 🔴 Zero Risk |
| `frontend/get_subagent_messages.py` | 826 B | Agent communication debug script | Never imported | 🔴 Zero Risk |
| `frontend/get_subagent_output.py` | 940 B | Agent communication debug script | Never imported | 🔴 Zero Risk |
| `frontend/get_subagent_steps.py` | 914 B | Agent communication debug script | Never imported | 🔴 Zero Risk |
| `frontend/read_subagent_logs.py` | 689 B | Agent communication debug script | Never imported | 🔴 Zero Risk |
| `frontend/search_messages.py` | 692 B | Agent communication debug script | Never imported | 🔴 Zero Risk |
| `frontend/search_messages_v2.py` | 695 B | Agent communication debug script | Never imported | 🔴 Zero Risk |
| `frontend/log_check.txt` | 17 B | Temporary debugging log dump | Stale log dump | 🔴 Zero Risk |
| `frontend/line_context.txt` | 8.7 KB | Temporary debug output dump | Stale log dump | 🔴 Zero Risk |
| `frontend/sub1_messages.txt` | 1.2 KB | Temporary agent log dump | Stale log dump | 🔴 Zero Risk |
| `frontend/sub1_steps.txt` | 6.6 KB | Temporary agent log dump | Stale log dump | 🔴 Zero Risk |
| `frontend/subagent_input.txt` | 4.2 KB | Temporary agent log dump | Stale log dump | 🔴 Zero Risk |
| `frontend/subagent_output.txt` | 18.3 KB | Temporary agent log dump | Stale log dump | 🔴 Zero Risk |
| `frontend/subagents_args.txt` | 2.1 KB | Temporary agent log dump | Stale log dump | 🔴 Zero Risk |
| `frontend/en_portal.txt` | 12.0 KB | Text dump of translation dictionary | Non-code asset | 🔴 Zero Risk |
| `frontend/ar_portal.txt` | 15.0 KB | Text dump of translation dictionary | Non-code asset | 🔴 Zero Risk |

---

### B. Duplicate Dialog Flow Builder Directory
The codebase contains a top-level `src/components/dialog-builder/` directory which is a duplicate of `src/components/client-admin/dialog-builder/`. The active system imports solely from the `client-admin/` directory.

> [!IMPORTANT]
> The directory `frontend/src/components/dialog-builder/` contains 19 files that must be deleted. The active workflow builder is located in `frontend/src/components/client-admin/dialog-builder/`.

| File Path | Description / Reason for Deletion | Evidence | Risk Level |
|---|---|---|---|
| `frontend/src/components/dialog-builder/DialogFlowLayout.tsx` | Duplicate orchestrator page | Unreachable from active routes | 🔴 Zero Risk |
| `frontend/src/components/dialog-builder/WorkflowCanvas.tsx` | Duplicate ReactFlow canvas wrapper | Unreachable from active routes | 🔴 Zero Risk |
| `frontend/src/components/dialog-builder/WorkflowInspector.tsx` | Duplicate inspector sidebar drawer | Unreachable from active routes | 🔴 Zero Risk |
| `frontend/src/components/dialog-builder/WorkflowMinimap.tsx` | Duplicate minimap control | Unreachable from active routes | 🔴 Zero Risk |
| `frontend/src/components/dialog-builder/WorkflowSimulator.tsx` | Duplicate simulator console widget | Unreachable from active routes | 🔴 Zero Risk |
| `frontend/src/components/dialog-builder/WorkflowToolbar.tsx` | Duplicate canvas control toolbar | Unreachable from active routes | 🔴 Zero Risk |
| `frontend/src/components/dialog-builder/drawers/NodeSettingsDrawer.tsx` | Duplicate node parameter forms | Unreachable from active routes | 🔴 Zero Risk |
| `frontend/src/components/dialog-builder/hooks/useNodeSelection.ts` | Duplicate custom hook | Unreachable from active routes | 🔴 Zero Risk |
| `frontend/src/components/dialog-builder/hooks/useWorkflowSimulation.ts` | Duplicate custom hook | Unreachable from active routes | 🔴 Zero Risk |
| `frontend/src/components/dialog-builder/hooks/useWorkflowState.ts` | Duplicate custom hook | Unreachable from active routes | 🔴 Zero Risk |
| `frontend/src/components/dialog-builder/nodes/ApiNode.tsx` | Duplicate node render | Unreachable from active routes | 🔴 Zero Risk |
| `frontend/src/components/dialog-builder/nodes/BranchNode.tsx` | Duplicate node render | Unreachable from active routes | 🔴 Zero Risk |
| `frontend/src/components/dialog-builder/nodes/CarouselNode.tsx` | Duplicate node render | Unreachable from active routes | 🔴 Zero Risk |
| `frontend/src/components/dialog-builder/nodes/DbNode.tsx` | Duplicate node render | Unreachable from active routes | 🔴 Zero Risk |
| `frontend/src/components/dialog-builder/nodes/DelayNode.tsx` | Duplicate node render | Unreachable from active routes | 🔴 Zero Risk |
| `frontend/src/components/dialog-builder/nodes/FormNode.tsx` | Duplicate node render | Unreachable from active routes | 🔴 Zero Risk |
| `frontend/src/components/dialog-builder/nodes/HandoffNode.tsx` | Duplicate node render | Unreachable from active routes | 🔴 Zero Risk |
| `frontend/src/components/dialog-builder/nodes/IntentNode.tsx` | Duplicate node render | Unreachable from active routes | 🔴 Zero Risk |
| `frontend/src/components/dialog-builder/nodes/RagNode.tsx` | Duplicate node render | Unreachable from active routes | 🔴 Zero Risk |

---

### C. Unused Shared Components & Layouts
These are experimental UI layouts, custom table wrappers, or form structures that have no import declarations.

| File Path | Description / Reason for Deletion | Evidence | Risk Level |
|---|---|---|---|
| `frontend/src/components/responsive/AdaptiveSplitPane.tsx` | Unused split-pane layout component | Never imported | 🔴 Zero Risk |
| `frontend/src/components/responsive/CollapsibleActionTray.tsx` | Unused action tray component | Never imported | 🔴 Zero Risk |
| `frontend/src/components/responsive/ResponsiveDrawer.tsx` | Unused drawer utility | Never imported | 🔴 Zero Risk |
| `frontend/src/components/responsive/index.ts` | Barrel file exporting unused responsive components | Never imported | 🔴 Zero Risk |
| `frontend/src/components/shared/forms/CheckboxField.tsx` | Unused Form Checkbox | Never imported | 🔴 Zero Risk |
| `frontend/src/components/shared/forms/DateTimeField.tsx` | Unused DateTime selector | Never imported | 🔴 Zero Risk |
| `frontend/src/components/shared/forms/FormDrawer.tsx` | Unused modal drawer shell | Never imported | 🔴 Zero Risk |
| `frontend/src/components/shared/forms/FormErrorBanner.tsx` | Unused form validation UI | Never imported | 🔴 Zero Risk |
| `frontend/src/components/shared/forms/FormSection.tsx` | Unused layout section wrapper | Never imported | 🔴 Zero Risk |
| `frontend/src/components/shared/forms/JsonEditorField.tsx` | Unused JSON textbox | Never imported | 🔴 Zero Risk |
| `frontend/src/components/shared/forms/MultiSelectField.tsx` | Unused combobox | Never imported | 🔴 Zero Risk |
| `frontend/src/components/shared/forms/RadioGroupField.tsx` | Unused radio input | Never imported | 🔴 Zero Risk |
| `frontend/src/components/shared/forms/SearchableComboboxField.tsx` | Unused input | Never imported | 🔴 Zero Risk |
| `frontend/src/components/shared/forms/SliderField.tsx` | Unused slider control | Never imported | 🔴 Zero Risk |
| `frontend/src/components/shared/forms/TagInputField.tsx` | Unused tag composer | Never imported | 🔴 Zero Risk |
| `frontend/src/components/shared/table/TableRowActionMenu.tsx` | Unused table dropdown | Never imported | 🔴 Zero Risk |
| `frontend/src/components/shared/workflows/ActivityFeed.tsx` | Unused workflow UI | Never imported | 🔴 Zero Risk |
| `frontend/src/components/shared/workflows/DrilldownPanel.tsx` | Unused workflow UI | Never imported | 🔴 Zero Risk |
| `frontend/src/components/shared/workflows/InvestigationDrawer.tsx` | Unused workflow UI | Never imported | 🔴 Zero Risk |

---

### D. Unused Hooks, Utilities, & Seeds
These support files are associated with the unused directories above and can be pruned.

| File Path | Description / Reason for Deletion | Evidence | Risk Level |
|---|---|---|---|
| `frontend/src/hooks/useResponsiveLayout.ts` | Hook for breakpoint tracking | Never imported | 🔴 Zero Risk |
| `frontend/src/lib/forms/formTransformers.ts` | Object parsers for unused forms | Never imported | 🔴 Zero Risk |
| `frontend/src/data/seed/workflowSeed.ts` | Mock dataset for duplicate dialog flow | Only imported by dead `dialog-builder` components | 🔴 Zero Risk |

---

## 3. Recommended Actions

1. **Automation:** Run `rm -rf` on `frontend/src/components/dialog-builder/`.
2. **File Deletion:** Execute script to delete all listed `.py` and `.txt` files in the root.
3. **Clean imports:** Delete form elements under `src/components/shared/forms/` listed above.
