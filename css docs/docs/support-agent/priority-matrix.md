# Support Agent Workspace — Priority Matrix

This priority matrix classifies the remaining work for the Support Agent Workspace into priority groups to guide implementation sequencing.

---

## 1. Priority Matrix Overview

| Task / Feature Area | Priority | Primary Impact | Complexity | Dependencies | Demo Importance |
| :--- | :---: | :---: | :---: | :--- | :---: |
| **Route Stabilization & Mapping Corrections** | Critical | Architecture | Low | None | Critical |
| **Active Conversation Panel Timeline** | Critical | Workflow | High | Unified Inbox | Critical |
| **Message Composer Input Core Actions** | Critical | Workflow | Medium | Active Conversation Panel | Critical |
| **AI Reply Composer character streaming** | High | AI Experience | High | Message Composer | High |
| **Warm Transfer / Consult workflows** | High | Telephony | High | Active Call Engine | High |
| **Break / AUX Status Adherence System** | High | Workforce | Medium | UI State Store | High |
| **Multi-Party Conference Call controls** | Medium | Telephony | High | Active Call Engine | Medium |
| **Personal Scorecard live binding** | Medium | UX Impact | Medium | Scorecard Component | Medium |
| **Shift Schedule calendar grid view** | Medium | Workflow | Medium | Roster Components | Medium |
| **Hold Music audio stream selection** | Low | UX Impact | Low | Telephony State Store | Low |
| **RAG citation tooltip hover metrics** | Low | AI Experience | Low | AI Suggestion Cards | Low |

---

## 2. Priority Classification Detail

### Critical Priority
These items are essential for basic workspace functionality and demo flows. They must be implemented first.
* **Route Mapping Corrections**: Correcting the `/tickets` route to load incident lists instead of the Shift Planner is a prerequisite for all other work.
* **Active Conversation Timeline**: The timeline is required to render chats, notes, and call logs. Without it, the workspace cannot show message history.
* **Message Composer Core Actions**: Basic inputs and send controls are required to support user testing and workflow validations.

### High Priority
These items provide significant workflow improvements and are important for demonstrating core platform capabilities.
* **AI Reply Composer Streaming**: Simulated character streaming is key to showing AI capabilities in demo scenarios.
* **Warm Transfer / Consult Drawer**: Outlines the transition from consulting a targeted colleague to completing a warm transfer.
* **AUX Break Adherence**: Important for showing agent availability status and workload management features.

### Medium Priority
These items add specialized features to the workspace and have moderate implementation complexity.
* **Multi-Party Conference Controls**: Adds audio management and participant roster widgets.
* **Personal Scorecard Binding**: Connects UI metrics elements to performance statistics from seed data.
* **Shift Planner Grid View**: Renders the complete calendar grid and shift swapping interface.

### Low Priority
These items provide minor improvements and can be implemented last.
* **Hold Music Selector**: Adds stream selections and preview players for hold music.
* **RAG Citation Tooltip Hover**: Displays query match statistics when hovering over article links.
