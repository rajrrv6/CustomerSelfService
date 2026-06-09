# Support Agent Workspace — Screen Implementation Inventory

This inventory defines the route, current status, functional requirements, and UI characteristics for all 13 targeted screens in the Support Agent Workspace.

---

## 01. Agent Dashboard
* **Route**: `/tenant/dashboard` (active sub-screen `agent_dashboard`)
* **Current Status**: Mostly Implemented
* **Missing Functionality**: Telemetry data refresh triggers, personal productivity charts, personal KPI metric gauges.
* **Required Reusable Components**: `StatsMetric`, `MetricTrendChart`, `PersonalRosterCard`
* **Required Forms**: None
* **Required Cards**: `PersonalScorecardCard`
* **Required Tables**: None
* **Required Drawers**: None
* **Required Modals**: None
* **Required Interactions**: Click metric card to navigate to Performance Scorecard.
* **Required AI Integrations**: Simulated recommendation feed for agent wellness and productivity action items.
* **Required Omnichannel Behaviors**: Aggregated occupancy KPI values matching active simulated channels (voice vs. chat vs. email).
* **Required States**:
  * *Loading State*: Skeletal indicators for KPI cards.
  * *Empty State*: No active tasks message.
  * *Error State*: Offline warning banner with fallback cached stats.
* **Responsive Requirements**: Flex layouts collapse from 3-column Grid to single-column stack on screens under `1024px`.
* **RTL Requirements**: Mirror grid layouts; flip metric trend indicators.
* **Dark Mode Requirements**: Dark slate backgrounds (`bg-slate-900`/`bg-slate-950`) with borders in `slate-800`.
* **Accessibility Requirements**: Metric values must have appropriate `aria-label` tags; graphs require text fallback tables.
* **Implementation Priority**: Medium

---

## 02. Unified Inbox
* **Route**: `/tenant/dashboard` (rendered inside agent workspace split-pane)
* **Current Status**: Mostly Implemented
* **Missing Functionality**: Multi-channel filter tab (email, whatsapp, chat, voice), batch ticket update checkboxes, sound indicator toggles on incoming message triggers.
* **Required Reusable Components**: `QueueSwitcher`, `ChannelIconBadge`, `PriorityLabel`
* **Required Forms**: Inline ticket search and category filter controls.
* **Required Cards**: `InboxConversationCard`
* **Required Tables**: None
* **Required Drawers**: None
* **Required Modals**: None
* **Required Interactions**: Focus-select conversation card; filter by conversation queue or priority; toggle tabs.
* **Required AI Integrations**: AI priority classification tags (e.g., "At Risk", "Billing Priority") based on local sentiment helper.
* **Required Omnichannel Behaviors**: Dynamic inbox item templates reflecting channels (e.g., previewing subject line for emails, telephone number for call records, text for chat).
* **Required States**:
  * *Loading State*: Pulsing card list structure.
  * *Empty State*: "Inbox Zero" graphic with checkmark and descriptive text.
  * *Error State*: Retry alert banner with warning color scheme.
* **Responsive Requirements**: Collapses into a full-screen mobile sheet overlay via `<MobileSheet />` on viewport sizes `<1024px`.
* **RTL Requirements**: Flip list direction and search icons; align filters to the right.
* **Dark Mode Requirements**: Dark slate items (`bg-slate-950`) with slate highlight borders.
* **Accessibility Requirements**: Screen readers must announce active unread counts (`aria-live="polite"`); search field requires search role attributes.
* **Implementation Priority**: Critical

---

## 03. Active Conversation Panel
* **Route**: `/tenant/dashboard` (middle pane viewport of workspace shell)
* **Current Status**: Completely Missing (Component layout exists, but is static and decoupled from core workflows)
* **Missing Functionality**: Message history rendering from active state, file upload queue progress bar, real-time typing status indicators, channel transfer event flags.
* **Required Reusable Components**: `ConversationTimeline`, `MessageBubble`, `TypingIndicator`, `AttachmentPreview`
* **Required Forms**: `MessageComposerForm` (handling enter-to-send, emoji picker, attachment uploads).
* **Required Cards**: None
* **Required Tables**: None
* **Required Drawers**: None
* **Required Modals**: None
* **Required Interactions**: Auto-scroll to bottom of conversation timeline; drag-and-drop file upload overlay.
* **Required AI Integrations**: Interactive suggestion triggers displaying recommended templates directly inside composer toolbars.
* **Required Omnichannel Behaviors**: Interface automatically renders subject headers for emails, phone controls for calls, and interactive quick-replies for WhatsApp.
* **Required States**:
  * *Loading State*: Skeletal conversation list loading spinner.
  * *Empty State*: "Select a conversation to begin" graphic.
  * *Error State*: Composer input block with "Failed to send message — Click to Retry" warning text.
* **Responsive Requirements**: Takes over the entire central pane on mobile. Left/Right panels are accessed via toggle sheets.
* **RTL Requirements**: Text alignments mapped to user direction; message bubbles flipped based on sender role.
* **Dark Mode Requirements**: Alternating message bubble colors (`slate-800` for user, `blue-900` for agent) against deep background.
* **Accessibility Requirements**: Standard keyboard navigation (`Tab` to move between composer, timeline, and actions); timeline uses role description matching live chat.
* **Implementation Priority**: Critical

---

## 04. Customer 360 Side Panel
* **Route**: `/tenant/dashboard` (right-hand drawer of workspace shell)
* **Current Status**: Mostly Implemented
* **Missing Functionality**: Live connection to the local customer profile state, collapsible section headers, interactive past-tickets lookup timeline drawer.
* **Required Reusable Components**: `CustomerProfileHeader`, `RecentTicketItem`, `ContactInformationList`
* **Required Forms**: Edit customer detail inline fields.
* **Required Cards**: `CustomerContextCard`, `SentimentGaugeCard`
* **Required Tables**: None
* **Required Drawers**: `TicketDetailDrawer` (reveals details of previous support instances from seed data)
* **Required Modals**: None
* **Required Interactions**: Clicking "View Details" launches full profile view; expanding/collapsing details sections.
* **Required AI Integrations**: Local RAG citation hover cards showcasing search criteria matching resolved cases.
* **Required Omnichannel Behaviors**: Displays contact endpoints for all client communication options (Email, Phone, WhatsApp) based on mock profile data.
* **Required States**:
  * *Loading State*: Pulsing details block.
  * *Empty State*: "No profile details found" warning text.
  * *Error State*: "Failed to retrieve profile" banner with refresh CTA.
* **Responsive Requirements**: Collapses into a drawer panel triggered by right-panel toggle button on mobile block view.
* **RTL Requirements**: Text aligned right; contact info fields reversed.
* **Dark Mode Requirements**: Slate gray metadata fields against deep gray background.
* **Accessibility Requirements**: Tooltips have proper description tags; sections have expanded/collapsed state indicators.
* **Implementation Priority**: High

---

## 05. Reply Composer with AI Copilot
* **Route**: `/tenant/dashboard` (anchored bottom interface of Active Conversation Panel)
* **Current Status**: Partially Implemented
* **Missing Functionality**: Local compliance mask checks (Pll checks), streaming speed controls, citation hover cards, manual edit locks.
* **Required Reusable Components**: `AIReplyComposer`, `AICopilotPanel`, `CitationTooltip`
* **Required Forms**: Tone adjustment selections; prompt input text area.
* **Required Cards**: `SuggestionCard`
* **Required Tables**: None
* **Required Drawers**: None
* **Required Modals**: None
* **Required Interactions**: Click suggestion card to stream draft into composer; change tone select menu to trigger rewrites.
* **Required AI Integrations**: Connection to simulated LLM generation helper with character streaming and prompt adjustments.
* **Required Omnichannel Behaviors**: Custom response lengths matched to channels (concise for SMS/WhatsApp, structured for Email).
* **Required States**:
  * *Loading State*: Sparkle indicator pulsing during text generation.
  * *Empty State*: "No suggestion available for this response" message.
  * *Error State*: "Generation failed" notice with retry button.
* **Responsive Requirements**: Tool options shift to bottom drawer menu overlay on screens under `768px`.
* **RTL Requirements**: Mirror composer controls; align Arabic text suggestions.
* **Dark Mode Requirements**: Sleek gradient highlights (`from-blue-600/10 to-indigo-600/10`) for AI recommendation borders.
* **Accessibility Requirements**: Composer inputs use `aria-multiline`; screen readers announce when AI generation completes.
* **Implementation Priority**: High

---

## 06. Internal Notes
* **Route**: `/tenant/dashboard` (integrated composer tab within Active Conversation Panel)
* **Current Status**: Completely Missing
* **Missing Functionality**: Dedicated notes timeline, markdown text support, colleague mentions dropdown, toggle switch to post to public timeline vs. notes.
* **Required Reusable Components**: `NoteComposer`, `NoteTimelineCard`, `CollaboratorSelector`
* **Required Forms**: Mentions search input; rich note-logging editor.
* **Required Cards**: None
* **Required Tables**: None
* **Required Drawers**: `NotesRosterDrawer` (listing historical internal notes from seed data)
* **Required Modals**: None
* **Required Interactions**: Pressing `@` launches colleague search directory; notes marked with visual warning banners.
* **Required AI Integrations**: AI summarizing helper to auto-fill internal note context based on preceding conversation threads.
* **Required Omnichannel Behaviors**: Logs notes directly onto simulated ticket timeline, bypassing channel delivery.
* **Required States**:
  * *Loading State*: Spinning note submission loader.
  * *Empty State*: "No internal notes have been posted on this conversation" layout.
  * *Error State*: Highlighted border with error label indicator.
* **Responsive Requirements**: Notes timeline component stacked inline inside conversation timeline.
* **RTL Requirements**: Right-to-left alignment for text inputs; direction metadata stored with note text.
* **Dark Mode Requirements**: Dedicated purple border highlights (`bg-purple-950/20 border-purple-500/30`) to distinguish from public chats.
* **Accessibility Requirements**: Mentions dropdown requires `aria-expanded` and listbox role properties.
* **Implementation Priority**: High

---

## 07. Transfer / Consult
* **Route**: `/tenant/dashboard` (overlay interface triggered from Conversation Header)
* **Current Status**: Completely Missing
* **Missing Functionality**: Team directory search, real-time agent presence checking, consult chat drawer, warm-transfer sequence execution.
* **Required Reusable Components**: `AgentDirectoryItem`, `ConsultChatComposer`, `PresenceDot`
* **Required Forms**: Transfer comments form; agent search query inputs.
* **Required Cards**: `ConsultOverviewCard`
* **Required Tables**: None
* **Required Drawers**: `ConsultDrawer` (holds sidebar consult thread with targeted colleague)
* **Required Modals**: `TransferModal`
* **Required Interactions**: Click agent directory item to start consult; warm transition slider action.
* **Required AI Integrations**: Recommendation helper prioritizing agents best suited for transfer target based on incident category matching.
* **Required Omnichannel Behaviors**: Simulated voice consult calls, while text channels launch private sidebar chat loops.
* **Required States**:
  * *Loading State*: Pulsing search results.
  * *Empty State*: "No online agents match search query" indicator.
  * *Error State*: "Transfer request rejected by target agent" warning window.
* **Responsive Requirements**: Fits comfortably into center of screen; scale down modal sizing on viewport `<640px`.
* **RTL Requirements**: Mirror layout; slide consult drawer from opposite direction.
* **Dark Mode Requirements**: Slate gray modals with contrasting border styles.
* **Accessibility Requirements**: Search directory item selection must support keyboard navigation; inputs require descriptive labels.
* **Implementation Priority**: High

---

## 08. Conference Call
* **Route**: `/tenant/dashboard` (telephony workspace action overlay)
* **Current Status**: Completely Missing
* **Missing Functionality**: Participant roster builder, audio control sliders, invite dialing system.
* **Required Reusable Components**: `ParticipantRosterItem`, `MuteToggle`
* **Required Forms**: Add participant phone search input.
* **Required Cards**: `ConferenceStatusCard`
* **Required Tables**: None
* **Required Drawers**: None
* **Required Modals**: `ConferenceModal`
* **Required Interactions**: Multi-select agents to invite to call; slide controls.
* **Required AI Integrations**: Simulated meeting note transcripts from ASR helper displayed on sidebar streams.
* **Required Omnichannel Behaviors**: Bridges multi-party lines over simulated voice lines.
* **Required States**:
  * *Loading State*: "Connecting participant..." dialing indicator.
  * *Empty State*: "No active participants in conference" state.
  * *Error State*: "Failed to connect participant" alert on roster item.
* **Responsive Requirements**: Modal elements adapt to full-screen viewports on small screens.
* **RTL Requirements**: Flip list directions; align call controls.
* **Dark Mode Requirements**: Deep dark slate modals with clean red hangup actions.
* **Accessibility Requirements**: Participant actions (mute/remove) must be read explicitly by screen reader controls.
* **Implementation Priority**: High

---

## 09. Hold Music Selector
* **Route**: `/tenant/dashboard` (telephony active call panel action bar)
* **Current Status**: Completely Missing
* **Missing Functionality**: Music track selection dropdown, track preview audio player, active hold indicator.
* **Required Reusable Components**: `HoldMusicDropdown`, `AudioPreviewPlayer`, `HoldBanner`
* **Required Forms**: Selector fields for hold track category matching.
* **Required Cards**: `HoldStatusCard`
* **Required Tables**: None
* **Required Drawers**: None
* **Required Modals**: None
* **Required Interactions**: Toggle play/pause for track preview; select music source from dropdown list.
* **Required AI Integrations**: Contextual music recommendations matching customer mood (e.g. soothing music for irritated sentiments).
* **Required Omnichannel Behaviors**: Simulates audio routing to the customer line.
* **Required States**:
  * *Loading State*: Spinning track loader.
  * *Empty State*: None (fallback default hold stream always loaded).
  * *Error State*: "Failed to load audio stream" banner.
* **Responsive Requirements**: Dropdown select menu transitions into select-list sheet layout on mobile screen views.
* **RTL Requirements**: Flip player control alignments.
* **Dark Mode Requirements**: Classic slate dark theme elements with blue indicators.
* **Accessibility Requirements**: Play/pause controls must specify state changes using `aria-pressed`.
* **Implementation Priority**: Medium

---

## 10. Wrap-up / Disposition
* **Route**: `/tenant/dashboard` (modal dialog appearing automatically on call/chat disconnect)
* **Current Status**: Mostly Implemented
* **Missing Functionality**: Simulated ticketing update on case close, mandatory notes validation before close, disposition classification history lookup.
* **Required Reusable Components**: `DispositionForm`, `ResolutionCodeSelect`, `ComplianceChecklist`
* **Required Forms**: Resolution details entry.
* **Required Cards**: `SLACompletionCard`
* **Required Tables**: None
* **Required Drawers**: None
* **Required Modals**: `WrapupModal`
* **Required Interactions**: Search resolution code database; toggle compliance validation checkboxes; submit.
* **Required AI Integrations**: AI auto-generation of case summaries matching selected disposition codes.
* **Required Omnichannel Behaviors**: Synced disposition updates posted back to local conversation timeline.
* **Required States**:
  * *Loading State*: Note sync progress spinner.
  * *Empty State*: None (pre-filled fields loaded from context).
  * *Error State*: "Failed to sync disposition" warning.
* **Responsive Requirements**: Sized dynamically to block center screen; padding reduces on viewport under `640px`.
* **RTL Requirements**: Form layouts mirrored; checkboxes placed to the right of text.
* **Dark Mode Requirements**: Muted dark gray modal panels with bold action buttons.
* **Accessibility Requirements**: Dialog has role `dialog`; focus trapped within modal until form submission or cancel.
* **Implementation Priority**: High

---

## 11. Break / AUX Status
* **Route**: `/tenant/dashboard` (workspace top navigation header)
* **Current Status**: Partially Implemented
* **Missing Functionality**: Adherence validation markers, break-reason selection confirmation popup.
* **Required Reusable Components**: `AUXSelector`, `AdherenceTimer`, `StateDurationIndicator`
* **Required Forms**: Reason select field.
* **Required Cards**: `AdherenceAlertCard`
* **Required Tables**: None
* **Required Drawers**: None
* **Required Modals**: `AUXReasonModal`
* **Required Interactions**: Dropdown status select; confirmation click.
* **Required AI Integrations**: Simulated break optimization scheduler matching queue load predictions.
* **Required Omnichannel Behaviors**: Automatically syncs agent status to offline inside local routing queues.
* **Required States**:
  * *Loading State*: None.
  * *Empty State*: None.
  * *Error State*: "Adherence Warning — AUX Limit Exceeded" alert.
* **Responsive Requirements**: Sized down to clean status badge and icon button on mobile screens.
* **RTL Requirements**: Flip dropdown placement; align status timer text.
* **Dark Mode Requirements**: Color coded status indicators (amber for AUX, emerald for online).
* **Accessibility Requirements**: Announced states on status change; timer uses clean screen reader updates.
* **Implementation Priority**: High

---

## 12. Personal Scorecard
* **Route**: `/tenant/dashboard` (navigated sub-screen from dashboard layout)
* **Current Status**: Partially Implemented
* **Missing Functionality**: Scorecard history timeline, metric target reference curves.
* **Required Reusable Components**: `ScorecardCard`, `PerformanceChart`, `FeedbackTimeline`
* **Required Forms**: None
* **Required Cards**: `MetricTargetCard`
* **Required Tables**: `HistoricalScoresTable`
* **Required Drawers**: None
* **Required Modals**: None
* **Required Interactions**: Click score trend to expand details.
* **Required AI Integrations**: Local natural language coaching feedback summarizes agent areas of improvement.
* **Required Omnichannel Behaviors**: Displays separate metric evaluations matching channels (e.g., AHT for voice vs. FRT for chat).
* **Required States**:
  * *Loading State*: Skeletal line charts.
  * *Empty State*: "No scorecards available for current period" notification.
  * *Error State*: "Failed to retrieve scorecard details" warn page.
* **Responsive Requirements**: Charts resize dynamically; tables collapse to card list on screens under `768px`.
* **RTL Requirements**: Reverse axis lines on performance charts; flip tables.
* **Dark Mode Requirements**: High contrast charts with clean gray slate backgrounds.
* **Accessibility Requirements**: Charts require textual description fallback tables; dispute forms use labels.
* **Implementation Priority**: Medium

---

## 13. Schedule / Shift Planner
* **Route**: `/tenant/dashboard` (sub-screen `tickets` - route mapping correction pending)
* **Current Status**: Partially Implemented
* **Missing Functionality**: Calendar grid month display, swap request sub-form, shift trade catalog.
* **Required Reusable Components**: `ShiftSchedule`, `CalendarGrid`, `SwapRequestModal`
* **Required Forms**: Swap request details entry.
* **Required Cards**: `ShiftDetailCard`, `SwapRequestItem`
* **Required Tables**: `BiddingListTable`
* **Required Drawers**: None
* **Required Modals**: `SwapRequestModal`
* **Required Interactions**: Click shift cell to launch details popup; complete swap request modal inputs.
* **Required AI Integrations**: Local schedule suggestions based on shift preferences.
* **Required Omnichannel Behaviors**: None.
* **Required States**:
  * *Loading State*: Pulsing schedule cells.
  * *Empty State*: "No schedules populated for selected month" indicator.
  * *Error State*: "Failed to update schedule status" warning.
* **Responsive Requirements**: Transition calendar grid to vertical list view on screens under `640px`.
* **RTL Requirements**: Calendar grids ordered right-to-left.
* **Dark Mode Requirements**: Clean slate grid lines against dark layout backdrops.
* **Accessibility Requirements**: Grid cells require explicit description of dates/status for keyboard navigation focus.
* **Implementation Priority**: Medium
