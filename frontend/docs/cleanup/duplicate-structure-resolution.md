# Duplicate Structure Resolution Report
## CustomerSelfService Platform — Structure Stabilization

**Cleanup Date:** 2026-06-03  
**Last Updated:** 2026-06-03T16:30:58+05:30  
**Auditor / Architect:** Senior Frontend Architecture Maintainer (Antigravity)  

---

## 1. Finding: Duplicate Dialog Flow Builders

The workspace contained two separate directories implementing dialog flow visual builders:

1. **Duplicate Folder:** `frontend/src/components/dialog-builder/` (6 components, hooks, node configurations)
2. **Active Folder:** `frontend/src/components/client-admin/dialog-builder/` (Orchestrated by Client Admin layouts)

### Analysis & Verifications
- **Imports Scan:** `ClientAdminLayout.tsx` lazily loads the builder relative to `../dialog-builder/DialogFlowLayout`. Since `ClientAdminLayout.tsx` resides at `src/components/client-admin/shared/ClientAdminLayout.tsx`, the relative path `../dialog-builder/` resolves specifically to `src/components/client-admin/dialog-builder/`.
- **Global Alias Scan:** A search for imports referencing `@/components/dialog-builder/` returned no hits in any active application files (only inside the `tests/vitest/` directory).
- **Active Node Set:** The active builder uses the node types located under `client-admin/dialog-builder/nodes/` (such as `HumanHandoffNode.tsx`, `IntentNode.tsx`, etc.), which utilize the full forms framework.

---

## 2. Resolution Strategy (Gated Archiving)

To reduce technical debt and avoid developer confusion regarding which builder represents the source-of-truth, the duplicate directory at `src/components/dialog-builder/` has been safely relocated to:
```
frontend/src/archive/old-builders/dialog-builder/
```

### Path & Compiler Configuration
- To prevent typescript compilation conflicts arising from broken relative paths in archived components, the archive directory has been added to the `"exclude"` list inside `tsconfig.json`.
- The test file [dialog-builder.test.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/tests/vitest/dialog-builder.test.tsx#L4) has been updated to import `WorkflowToolbar` from `@/archive/old-builders/dialog-builder/WorkflowToolbar` so that Vitest tests remain fully functional.

---

## 3. Results & Verification

- **TypeScript compilation:** ✅ Passed. `npm run typecheck` compiles cleanly.
- **Vitest Testing:** ✅ Passed. All 3 tests in `dialog-builder.test.tsx` pass.
- **Maintenance Status:** Clean. Developers working on the NLU builder will now edit exclusively under `src/components/client-admin/dialog-builder/`, avoiding collision risks.
