# Sprint: Agent Workspace & Omnichannel inbox

## Goal
Optimize the Agent Workspace and Unified Inbox to enforce visual differentiation across support channels (WhatsApp, Web Chat, Email, and Escalated tickets) to increase triage speed and reduce cognitive fatigue.

## Scope
- Multi-channel Inbox routing.
- Conversation detail transcripts.
- Channel-specific layout styling.
- SAP invoice integration inside email panels.
- Escalated conversation locked states.

## Major Systems Implemented
* **Unified Inbox Left Border Indicators**: Color-coded left-side highlights on conversation cards (emerald for WhatsApp, violet for Email, sky-blue for Web Chat, and pulsing crimson for Escalated).
* **WhatsApp Chat Interface**: Speech bubble chat rendering, audio waveform mockups, and quick-reply action chips.
* **Email Helpdesk Interface**: Document-style layout showing Subject and From fields, CC/BCC toggles, and a PDF file attachment block mapped to Dubai-Core SAP ERP billing databases.
* **Escalated Banner & Lock**: Pulsing danger banner with supervisor-only note entries and locked input fields for standard agents.

## Decisions
* **Visual Border Highlights**: Chose colored left-border strips rather than changing card background colors to maintain legibility in dark mode and preserve consistent typography contrast.
* **In-Context Tools**: Embed action tools directly in the message stream (e.g., download buttons inside the email cards) to avoid context switching.

## Known Carryovers
- Live voice-call dialer dial-out connections.
- Real-time customer screen co-browse control.
