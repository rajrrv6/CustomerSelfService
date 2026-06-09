# Support Agent Workspace — Omnichannel & Voice Roadmap

This roadmap defines the routing logic, user interface behaviors, and continuity strategies across chat, email, and voice telephony channels in the Support Agent Workspace.

---

## 1. Unified Message Flow & Indicators

### A. Message Status States
To maintain clear visibility, every message sent by the agent displays real-time delivery indicators:
* **Sending**: A pulsing gray circle icon.
* **Sent**: A single checkmark, indicating receipt by the mock gateway.
* **Delivered**: Double checkmarks, indicating delivery to the simulated customer's device.
* **Read**: Double blue checkmarks (or colored equivalents based on channel), indicating the message has been viewed.

### B. Typing Indicators
* **Customer Typing**: When a customer is typing, a pulsing three-dot animation renders at the bottom of the conversation window and on the active inbox card.
* **Agent Typing**: The composer sends typing events when the agent focuses the input field, which displays a typing indicator on the customer portal view.

### C. Attachment Workflows
* **Incoming Files**: Image and document attachments render inline as thumbnail previews. Clicking an attachment opens a modal preview window.
* **Outgoing Uploads**: Support for drag-and-drop file sharing. Dropping a file onto the composer displays a simulated upload progress bar before sending.
* **File Validation**: The upload system blocks executables and enforces a 10MB size limit.

---

## 2. Channel Workflows

### A. Chat Workflows (WhatsApp & Web Chat)
* **Real-time Simulation**: Messages sync instantly in the active session store.
* **Quick Replies**: Integrates templates for fast replies directly in the composer.
* **Session Expiry Warning**: For WhatsApp, a warning banner displays if 24 hours have elapsed since the customer's last reply, as templates are required to resume the session.

### B. Email Workflows
* **Composer view**: Selecting an email thread opens a structured subject and address block (To, CC, Subject) at the top of the composer.
* **Signature Append**: The composer automatically appends the agent's professional signature when sending.
* **Attachment Previews**: Email attachments are displayed in a collapsible file list at the top of the timeline.

### C. Voice Telephony Workflows
The telephony system uses a virtual dialer interface supporting the following operations:
* **Outbound Dialing**: Agents can click a telephone number in a profile to open the dialer and initiate a call.
* **Incoming Ringing Modal**: Incoming calls trigger an overlay display showing caller information, and Accept/Reject buttons.
* **Active Call Panel**: Displays call duration, caller details, and controls for hold, mute, recording, and transfers.
* **Disposition Modal**: Appears automatically when a call ends, requiring the agent to select a resolution code before going back to the available queue.

---

## 3. Telephony Simulation Workflows

### A. Hold Workflows
* **Action**: Toggling hold mutes the call audio and plays a simulated hold music track to the customer.
* **UI Indicator**: A banner displays at the top of the screen: "Call on Hold — [Track Name]".

### B. Transfer Workflows
* **Blind Transfer**: Immediately routes the call to a selected agent or queue, ending the call for the original agent.
* **Warm Transfer (Consult)**: Places the customer on hold while dialing a targeted colleague. The original agent can discuss details with their colleague before completing the transfer or returning to the customer.

### C. Conference Workflows
* **Initiation**: The agent can add a third participant to an active call by dialing their number.
* **Control UI**: The conference window displays a list of active participants, with options to mute or disconnect lines individually in the simulated roster.

---

## 4. Continuity & Queue Management

### A. Queue Continuity
* **Cross-Channel Integration**: Customer requests are consolidated under a single conversation thread. If a customer starts a web chat and then dials the call center, both interactions display in the timeline.
* **Agent Assignment**: If a customer transitions to a different channel, the conversation remains assigned to the original agent to maintain context.

### B. Omnichannel Continuity
* **Offline Draft Recovery**: Active composer drafts and notes are cached in the workspace store. If the browser is refreshed, draft text is restored.
* **Status Synchronization**: Changing AUX availability status updates all simulated channel gateways, ensuring the agent does not receive new tasks while on break.
