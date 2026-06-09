# Orphan Component Audit & Analysis
## CustomerSelfService Platform — Repo Hygiene

**Audit Date:** 2026-06-03  
**Last Updated:** 2026-06-03T16:06:48+05:30  
**Auditor:** Senior Repository Cleanup Auditor (Antigravity)  

---

## 1. Executive Summary

This audit performs an import dependency review on candidate component directories flagged in the June 1, 2026 audit. 

1. **Duplicate Dialog Flow Builder Components:** Verified as **completely orphaned** and duplicate. Safe to delete.
2. **Telephony Voice Components:** Verifiable through dependency mapping as **fully imported and wired** in `AgentWorkspaceLayout.tsx` using relative paths (`../voice/...`). They are active and should **not** be deleted.
3. **Integration Components:** Verifiable as **fully imported and wired** in `IntegrationsDashboard.tsx` (which is lazy-loaded in `ClientAdminLayout.tsx`). They are active and should **not** be deleted.

---

## 2. Dialog Builder Duplicate Code (Orphaned)

* **Location:** `frontend/src/components/dialog-builder/` (19 files)
* **Status:** ❌ **Orphaned / Duplicate**
* **Finding:** The developer cloned the dialog builder into `frontend/src/components/client-admin/dialog-builder/` to support RBAC role division. However, the original directory at `src/components/dialog-builder/` was left intact. No active routes or files import from the top-level folder, except a Vitest file (`tests/vitest/dialog-builder.test.tsx` line 4) which was mistakenly targeted there.
* **Risk of Deletion:** Very Low. The test file needs to be retargeted to `src/components/client-admin/dialog-builder/` before deletion.

### Files to Delete:
- `src/components/dialog-builder/DialogFlowLayout.tsx`
- `src/components/dialog-builder/WorkflowCanvas.tsx`
- `src/components/dialog-builder/WorkflowInspector.tsx`
- `src/components/dialog-builder/WorkflowMinimap.tsx`
- `src/components/dialog-builder/WorkflowSimulator.tsx`
- `src/components/dialog-builder/WorkflowToolbar.tsx`
- `src/components/dialog-builder/drawers/NodeSettingsDrawer.tsx`
- `src/components/dialog-builder/hooks/useNodeSelection.ts`
- `src/components/dialog-builder/hooks/useWorkflowSimulation.ts`
- `src/components/dialog-builder/hooks/useWorkflowState.ts`
- `src/components/dialog-builder/nodes/ApiNode.tsx`
- `src/components/dialog-builder/nodes/BranchNode.tsx`
- `src/components/dialog-builder/nodes/CarouselNode.tsx`
- `src/components/dialog-builder/nodes/DbNode.tsx`
- `src/components/dialog-builder/nodes/DelayNode.tsx`
- `src/components/dialog-builder/nodes/FormNode.tsx`
- `src/components/dialog-builder/nodes/HandoffNode.tsx`
- `src/components/dialog-builder/nodes/IntentNode.tsx`
- `src/components/dialog-builder/nodes/RagNode.tsx`

---

## 3. Telephony Voice Components (Wired & Active)

* **Location:** `frontend/src/components/voice/` (13 files)
* **Status:** ✅ **Wired & Active** (NOT ORPHANED)
* **Correction vs. Previous Audit:** The previous audit report stated that the 13 voice components were orphaned dead code. This is incorrect.
* **Evidence:** [AgentWorkspaceLayout.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/components/agent-workspace/AgentWorkspaceLayout.tsx#L24-L31) imports all voice components explicitly using relative imports:
  ```tsx
  import { VoiceDialer } from '../voice/VoiceDialer';
  import { IncomingCallModal } from '../voice/IncomingCallModal';
  import { CallDispositionModal } from '../voice/CallDispositionModal';
  import { ActiveCallPanel } from '../voice/ActiveCallPanel';
  import { CallHistory } from '../voice/CallHistory';
  import { VoiceQueuePanel } from '../voice/VoiceQueuePanel';
  import { SupervisorVoicePanel } from '../voice/SupervisorVoicePanel';
  import { VoicemailPanel } from '../voice/VoicemailPanel';
  ```
  These components are conditionally rendered when the agent accesses the "Voice" tab (`activeTab === 'voice'`) in the Unified Inbox.
* **Risk of Deletion:** 🔴 **HIGH RISK.** Deleting these files will crash the Next.js compilation of the Agent Workspace. Keep all files.

---

## 4. Integration Components (Wired & Active)

* **Location:** `frontend/src/components/integrations/` (12 files)
* **Status:** ✅ **Wired & Active** (NOT ORPHANED)
* **Finding:** All 12 integration components are imported and orchestrated by [IntegrationsDashboard.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/components/integrations/IntegrationsDashboard.tsx#L5-L13). 
* **Wiring:** `IntegrationsDashboard` is lazily imported and rendered by `ClientAdminLayout.tsx` (line 27, line 76) under the `integrations` subscreen.
* **Risk of Deletion:** 🔴 **HIGH RISK.** Keep all files.
