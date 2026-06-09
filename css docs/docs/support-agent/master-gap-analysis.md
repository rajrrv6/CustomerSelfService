# Support Agent Workspace — Master Gap Analysis

This document provides a thorough audit of the Support Agent Workspace screens, workflows, and frontend state within the AI-Native mPaaS CustomerSelfService portal. It evaluates implemented vs. missing structures and identifies layout, usability, and UI flow risks.

## Current Completion Audit

### Fully Implemented Screens
These screens are visually present and have operational basic behaviors, though they require final state connection and data-binding:
* **Agent Dashboard** (`/tenant/dashboard` sub-screen `agent_dashboard`): Layout is set up and loads the metrics scorecard interface.
* **Unified Inbox** (rendered inside the main desk split-pane via `<UnifiedInbox />`): Supports search, queue filtering, tab navigation (active vs. voice), and status changes.
* **Customer 360 Side Panel** (rendered via `<RightWorkspacePanel />`): Shows customer profile metadata, recent ticket history, and RAG knowledge-base recommendations.
* **Wrap-up / Disposition** (rendered via `<WrapupModal />`): Includes forms for simulated resolution codes, custom agent notes, and next follow-up dates.

### Partially Implemented Screens
These systems exist in basic skeletal layouts but lack complete interaction workflows:
* **Reply Composer with AI Copilot** (`<AIReplyComposer />` & `<AICopilotPanel />`): Basic text generation and tone rewriting are mock-streamed. Missing inline simulation checks, local citation hover details, and multilingual translation visual representations.
* **Personal Scorecard** (`<PerformanceScorecard />`): Renders basic stats like CSAT and SLAs using static seed data; lacks historical timelines and target benchmarks.
* **Schedule / Shift Planner** (`<ShiftSchedule />`): Shows basic shift calendars. However, it is mapped to the wrong route (`/tickets`).
* **Break / AUX Status** (`<WorkspaceAuxToolbar />`): Displays status timer and supports basic dropdown state changes. Lacks sync hooks for status durations and break-reason category validations.

### Completely Missing Screens
These workspaces, modals, or drawers have no underlying implementation beyond placeholder declarations:
* **Active Conversation Panel**: Although a `<ConversationPanel />` layout container exists, it lacks operational messaging streams, attachment previews, and multi-channel indicators.
* **Internal Notes**: Missing a dedicated logging stream, note tag overrides, and inline conversation thread pinning.
* **Transfer / Consult**: Missing a unified consult drawer (enabling warm transfers with team consults) and intermediate dial states.
* **Conference Call**: Telephony multi-party roster controls, participant mute states, and conference status UI are completely absent.
* **Hold Music Selector**: There is no selector for holding streams, audio preview players, or agent-facing hold status banners.

### Incorrect Route Mapping
* **Incident Tickets Route**: Navigating to `/tickets` currently displays the **Shift Planner UI** (`<ShiftSchedule />`) rather than a listing of support incident cases. This route mapping must be corrected during Phase 1.

---

## Screen Completion Matrix

| Screen / Feature | Current Status | Completion % | Missing Functionality | Reusable Components Required | Complexity | Dependencies | Priority |
| :--- | :--- | :---: | :--- | :--- | :---: | :--- | :---: |
| **1. Agent Dashboard** | Mostly Implemented | 90% | Simulated statistics binding, alert feed, personal productivity charts | `StatsMetric` | Low | UI State Store | Medium |
| **2. Unified Inbox** | Mostly Implemented | 85% | Multi-channel selection tabs, batch triage actions, sorting filters | `QueueSwitcher`, `ChannelBadge` | Medium | Inbox Filters Hook | High |
| **3. Active Conversation** | Completely Missing | 25% | Message history rendering, file attachment mock uploads, typing status, status events | `MessageComposer`, `TypingIndicator` | High | Conversation Store | Critical |
| **4. Customer 360 Panel** | Mostly Implemented | 90% | Interactive ticket expanders, mock RAG citation details on hover | `CustomerContextCard`, `RAGArticleCard` | Low | Customer Seed Data | High |
| **5. Reply Composer & AI** | Partially Implemented | 60% | Local mask checks, dynamic sentiment confidence scoring, streaming controls | `AICopilotPanel`, `AIReplyComposer` | High | AI Copilot State | High |
| **6. Internal Notes** | Completely Missing | 10% | Specialized timeline logs, note markers, text formatting | `NoteTimelineCard`, `TimelineBadge` | Medium | Conversation Store | High |
| **7. Transfer / Consult** | Completely Missing | 0% | Warm transfer timeline, interactive team agent status directory, consult toggles | `TransferModal`, `ConsultDrawer` | High | Telephony State Store | High |
| **8. Conference Call** | Completely Missing | 0% | Multi-party bridge dials, participant volume and mute states | `ConferenceModal`, `ParticipantList` | High | Voice Core Engine | High |
| **9. Hold Music Selector** | Completely Missing | 0% | Sound stream selections, live playback preview player, hold state banner | `HoldMusicDropdown`, `HoldBanner` | Medium | Telephony State Store | Medium |
| **10. Wrap-up / Dispo** | Mostly Implemented | 80% | Simulated CRM updates, resolution code selection triggers on case close | `WrapupModal`, `DispositionForm` | Medium | Conversation Panel | High |
| **11. Break / AUX Status** | Partially Implemented | 70% | Adherence validation flags, break code request flows | `AUXSelector`, `AdherenceTimer` | Medium | Workforce State Store | High |
| **12. Personal Scorecard** | Partially Implemented | 60% | Metric performance comparison curves, CSAT breakdowns | `ScorecardCard`, `PerformanceChart` | Medium | Metrics Service | Medium |
| **13. Shift Planner** | Partially Implemented | 55% | Calendar month displays, shift swapping request workflow | `ShiftSchedule`, `SwapRequestModal` | High | Route Correction | Medium |

---

## UI/UX Weaknesses

* **Layout Jitter on Drawer Transitions**: Toggling the Right Workspace Panel or expanding/collapsing sidebars triggers layout shifts in the message composer.
* **Non-Unified Modals**: Modals for Transfer, Conference, and Wrap-up utilize custom CSS variants with varying border-radius and shadow systems, creating visual inconsistency.
* **RTL (Arabic) Inversion Gaps**: Text inputs inside components like `<AIReplyComposer />` lack explicit direction indicators, leading to layout breaks in Arabic mode.
* **Responsive Breakpoint Failures**: Under tablet viewport widths, the 3-column desk layout collapses aggressively, hiding the Unified Inbox without providing touch-accessible gestures to reveal it.

## Workflow Weaknesses

* **Telephony State Conflicts**: Initiating a new dial request while a voice call is parked on hold does not enforce standard signaling checks, causing status mismatches in simulated state.
* **Consult to Transfer Disconnect**: There is no logical bridge transitioning a voice consultation into a warm transfer, breaking the agent handoff flow.
* **No Offline/Disconnect Banner**: The workspace fails to notify agents when network connections disconnect, meaning draft updates can be lost without feedback.

## Scalability Risks

* **DOM Node Accumulation in Long Chats**: The message timeline renders all active conversation history in a single flat list. High message volumes will cause frame drops during typing events.
* **Leaking Timers**: AUX status and resolution timers rely on intervals that are not consistently cleaned up upon component unmounting, creating potential memory leaks.

## Architecture Risks

* **Scattered State Contexts**: Workspace properties are split between the Zustand stores and the React contexts. This leads to synchronization challenges during status updates.
* **Hardcoded mock data dependencies**: Components are coupled with mock seeds (e.g. `customer360Seed` indexed by chat ID), which limits dynamic scaling and simulated API integrations.
