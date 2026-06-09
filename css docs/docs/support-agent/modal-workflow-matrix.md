# Support Agent Workspace — Modal, Drawer, & Workflow Matrix

This matrix maps out every interactive overlay, modal, and key workflow within the Support Agent Workspace, detailing its triggers, transitions, states, and error handling.

---

## 1. Modals & Drawers State Matrix

| Element Name | Primary Trigger | Target Component | Transition Animation | Confirmation / Action Trigger | Secondary / Exit Trigger |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Transfer Modal** | "Transfer" button in Conversation Header | `<TransferModal />` | Scale Fade-In (0.2s) | Click "Confirm Transfer" button | Click "Cancel" / Press `ESC` |
| **Consult Drawer** | Select Agent in Transfer directory | `<ConsultDrawer />` | Slide-In from Right (Left for RTL) (0.3s) | Click "Initiate Consult" / "Warm Transfer" | Click "Close Drawer" / Backdrop click |
| **Conference Modal** | "Conference" button in Voice toolbar | `<ConferenceModal />` | Scale Fade-In (0.2s) | Click "Dial Participant" / "Add Line" | Click "Cancel" / Backdrop click |
| **AUX Reason Modal** | Selecting AUX status in Aux Toolbar | `<AUXReasonModal />` | Slide-Down from Top (0.2s) | Click reason code cell (e.g. Lunch) | Click outside modal / `ESC` |
| **Internal Notes Drawer** | Mentions indicator in composer note tab | `<NotesRosterDrawer />` | Slide-In from Left (Right for RTL) (0.3s) | None (timeline lookup list) | Click "Close" / Backdrop click |

---

## 2. Comprehensive Workflow Definitions

### A. Escalation Workflows
1. **Trigger**: Agent clicks "Escalate Case" in the Conversation Panel options menu.
2. **State Transition**: Case status updates from `active` to `escalated`. SLA Resolution Target shifts to high-priority `warning` status, recalculating the resolution countdown timer to a 15-minute SLA target.
3. **Visual Indicators**: Pinned `EscalationBadge` displays at the top of the chat view. Conversation card in the inbox receives a red priority outline.
4. **Mock Sync Action**: Sends background mock request to log the case ID change on the local conversation timeline.

### B. Warm Transfer / Consult Sequence
1. **Initiation**: Agent initiates consult chat/call from the transfer directory.
2. **State Transition**: Primary customer call remains active but audio is placed on hold (triggering hold music). A secondary consult line is opened with the target agent.
3. **Consult Mode**:
   * *Chat Consult*: Agent chats with targeted colleague. The customer remains in the queue.
   * *Voice Consult*: Agent speaks with colleague privately before transferring.
4. **Handoff**: Agent clicks "Complete Handoff". Active conversation ownership updates to the new agent ID. The original agent is redirected to the Wrap-up screen.

### C. Voice Telephony Hold Sequence
1. **Hold Trigger**: Agent clicks "Hold" on the active call toolbar.
2. **Signaling State**: Telephone status transitions to `held`. Primary audio stream is muted, and a loop of the selected hold music track is routed back to the customer line.
3. **Timer Trigger**: A secondary timer tracks total hold duration on screen.
4. **Restore Event**: Agent clicks "Resume Call". Hold music ceases, and voice channels are restored.

---

## 3. Visual & Technical Interaction States

### Loading States
* **UI Skeleton Rendering**: Used during roster loads, database searches, and performance chart retrievals. Renders light-gray gradient blocks that pulse gently (`animate-pulse`).
* **Composer Disable**: The composer text inputs lock during active transmission events.

### Confirmation States
* **Destructive Actions**: Hanging up active calls, deleting draft replies, and submitting AUX status reasons trigger secondary confirmation checks if in-progress states exist.
* **Visual Check**: Buttons display a confirmation checkmark and transition to a success color scheme before closing.

### AI Generation States
* **Sparkle Pulse**: When the AI helper is processing rewrites or suggestions, the AI Copilot Panel renders an active loading state with a spinning sparkle icon.
* **Streaming Text Insertion**: Text streams character-by-character into the message draft area, disabling manual text edits until completion.

### Error & Retry States
* **Network Offline Warning**: If connection drops during message transmission, a warning card renders overlaying the composer: "Failed to send message — Network Disrupted".
* **Interactive Retry Trigger**: Includes a "Resend Message" button. If the retry fails twice, a secondary fallback button copies the draft text to the clipboard, preventing data loss.

### Success States
* **Note Logged Confirmation**: When an internal note is submitted, the composer flashes green and the note is immediately appended to the timeline with a fade-in transition.
* **Disposition Synced**: Successful wrap-up submissions show a centered checkmark card before routing the agent back to the available queue.
