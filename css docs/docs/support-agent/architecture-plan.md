# Support Agent Workspace — Enterprise Architecture Plan

This architecture plan outlines the modular frontend guidelines, state management design, mock omnichannel event flows, and UI rendering strategies for the Support Agent Workspace.

---

## 1. Conceptual Folder Structure

The Support Agent features are designed to be isolated to prevent leakage into non-agent routes. The codebase should organize responsibilities cleanly, maintaining flexibility for future implementation:

* **Views**: Layout handlers managing multi-panel workspaces (e.g. Inbox lists, Active Chat timeline, Customer Context cards).
* **Workspace Components**: UI items managing user interactions, such as composer text inputs, timelines, and status select drop menus.
* **Telephony UI Modules**: Mock calling elements like dialing pads, duration indicators, call controls, and wrap-up select fields.
* **Shared Modals & Drawers**: Focus-locked overlays for transfer configurations and consultations.
* **State Managers & Helpers**: Frontend state stores and custom hooks managing filters, timers, simulated status transitions, and seeded workflows.
* **Data Seed Layer**: Static datasets defining mock customer profiles, chat history, and scheduling roster structures.

---

## 2. Shared Component Architecture

To maintain design consistency and speed up development, the workspace relies on standard reusable component blocks. These components must consume theme and layout tokens from the design system, enforcing uniform typography, focus styles, borders, and animations.

* **Layout Blocks**: Shell headers, collapsable sidebars, dynamic grid wrappers, and responsive split-panes.
* **Telephony Controls**: Standard dialing keys, call action buttons (hold, mute, record, transfer, conference), and volume controllers.
* **Notification Indicators**: SLA tickers, sentiment markers, unread badges, channel badges, and connection status banners.

---

## 3. Conversation & Omnichannel State Architecture

The active conversation state must be managed via a centralized state store. This store coordinates updates across the inbox listing, active timeline, composer, and customer details.

* **Message Data Schema**:
  * `id`: unique message identifier.
  * `sender`: identifies if a message is from the agent, the customer, or a system event.
  * `text`: message string.
  * `timestamp`: time formatting.
  * `attachments`: optional collection of local mock file metadata.
* **Conversation Thread Schema**:
  * `id`: unique chat reference.
  * `customerName`: customer identifier.
  * `channel`: maps the mock source channel (e.g. WhatsApp, web chat, email, call record).
  * `status`: current support state (`unassigned`, `active`, `resolved`, `escalated`).
  * `lastMessage`: preview text.
  * `messages`: Message list array.
  * `slaStatus`: color coding values (`within_limit`, `warning`, `breached`).
  * `sentiment`: tracks customer mood state (`positive`, `neutral`, `negative`).

The state manager must expose clean actions to:
1. Select active conversations.
2. Append new mock messages to timelines.
3. Update conversation statuses (e.g., resolving, escalating).
4. Assign conversations to the active agent profile.

---

## 4. AI Copilot Simulation Architecture

The AI Copilot operates as a local utility mock, simulating the dynamic feel of live LLM suggestions without relying on real AI web services:

* **Text Streaming Simulation**: Uses local timing functions to append text character-by-character to composer fields.
* **Tone Rewriter Utility**: Modifies the draft string based on the selected tone (Empathetic, Concise, or Professional) using pre-configured text filters.
* **Compliance Masking**: Client-side validation function scans draft text for personal data (credit cards, Saudi National IDs) before saving, replacing them with generic mask tokens.
* **Citation tooltips**: Hover indicators on suggested article references render local RAG matching scores.

---

## 5. Voice Workflow Simulation Architecture

Telephony workflows operate as a simulated state machine on the client, managing the UI states of inbound and outbound voice sessions without WebRTC or SIP engines:

* **Call States**: The state machine cycles through `idle`, `ringing`, `connecting`, `active`, `held`, and `disposition`.
* **Mock Active Call Status**: Tracks simulated connection duration, active parameters (mute, hold, recording), and call events.
* **Hold Music Simulator**: Toggles state flags in the call log and plays a simulated audio track in the browser when the call is placed on hold.
* **Roster Conference Bridge**: Merges additional participant lines in a simulated conference roster view.

---

## 6. Modal & Drawer System Architecture

Workspace overlay menus must follow a centralized container pattern. Opening a modal dispatcher does not trigger a full layout re-render, and focus is locked to the overlay to ensure accessibility compliance.

* **Modal Triggers**: Handled via store flags.
* **Drawer Sheets**: Used for details-heavy operations (e.g., Customer 360 lookup, Warm Consult logs). They slide in from the screen edges (right for LTR, left for RTL).
* **Alert System**: Incorporates warning popups for call conflicts (e.g., trying to place an outbound call while a voice session is active).

---

## 7. AUX State & Workforce Adherence Architecture

The agent availability status is managed via a dedicated timer:

* **Status Options**: Online (available for routing), Break, Lunch, Training, Wrap-up.
* **Adherence Tracking**: A background clock counts up from zero when the agent transitions into an AUX state. If the duration exceeds predefined compliance limits, the timer flashes amber to alert the agent.
* **Omnichannel Routing Link**: Selecting an AUX state updates the routing availability status, preventing the queue simulator from dispatching new cases to the agent.

---

## 8. Theme, RTL, & Responsive Layout Architecture

* **CSS Variable Theme Tokens**: Tailwind colors and themes are linked directly to CSS variables (e.g., `--bg-workspace`, `--border-slate`). Changing themes toggles CSS classes on the `<html>` node.
* **RTL Inversion**: Handled via the CSS direction attribute (`dir="rtl"`). The workspace shell detects the language selection (English vs. Arabic) and mirrors layouts, alignments, transitions, and icons.
* **Responsive Breakpoints**:
  * Desktop (`>=1024px`): Full 3-column split view (Inbox, Active Chat, Details panel).
  * Tablet (`768px - 1023px`): Central panel is visible; Inbox and Details panels collapse into slide-out drawers.
  * Mobile (`<768px`): Header, active message feed, and bottom composer stack vertically. Nav and settings are accessible via overlay sheets.

---

## 9. Mock Workflow Simulation Strategy

Telephony events and incoming chat simulations are managed locally to allow developer testing without real backend APIs or SIP integrations:

* **Inbound Call Simulation**: When the agent is "Online" and idle, a timer simulates an incoming call by dequeuing a caller and triggering the ringing modal.
* **Incoming Chat Message Simulation**: A background simulator appends simulated messages from customers to active conversations and triggers toast notifications.
* **SLA Countdown Timer**: SLA countdowns calculate ticking minutes and seconds based on active chat parameters, triggering a visual warning state when the SLA limit approaches.
