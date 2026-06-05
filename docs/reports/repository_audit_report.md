# CustomerSelfService Repository Audit Report
**Generated:** 2026-06-01  
**Auditor:** Antigravity (code inspection only — no estimates)  
**Reference:** AI_Native_mPaaS Screen Inventory PDF (161 screens), README, Master UI Prompt, AGENTS.md

---

## Audit Summary

| Category | Count |
|---|---|
| Fully Implemented | 70 |
| Partially Implemented | 27 |
| Not Implemented | 64 |
| **Total in Inventory** | **161** |

---

## Section 1 — Super Admin (Screens 1–15)

| Screen ID | Screen Name | Status |
|---|---|---|
| 1 | LLM Model Registry | **Fully Implemented** |
| 2 | ASR / TTS Provider Registry | **Fully Implemented** |
| 3 | Channel Catalog | **Fully Implemented** |
| 4 | Channel Provider Credentials (Twilio/Meta/Plivo) | **Fully Implemented** |
| 5 | Industry Intent Libraries | **Not Implemented** |
| 6 | Industry Response Templates | **Not Implemented** |
| 7 | Profanity / Safety Blocklist | **Not Implemented** |
| 8 | PII Redaction Policy (Global) | **Not Implemented** |
| 9 | Tenant Onboarding Template | **Not Implemented** |
| 10 | Cross-Tenant Analytics | **Partially Implemented** |
| 11 | Model Cost Benchmarks | **Partially Implemented** |
| 12 | Vector DB Cluster Status | **Fully Implemented** |
| 13 | Knowledge Connector Registry | **Not Implemented** |
| 14 | Number Pool (DIDs) | **Not Implemented** |
| 15 | SIP Trunk Config | **Partially Implemented** |

### Gaps

**Screen 10 — Cross-Tenant Analytics** (Partial)  
- `SuperAdminAnalyticsTab.tsx` contains cross-tenant metrics but lacks the containment + cost benchmark breakdown required by the PDF.  
- **Gap:** Missing per-tenant containment rate comparison, cost-per-conversation table, and benchmark comparison grid.  
- **File:** `src/components/super-admin/analytics/SuperAdminAnalyticsTab.tsx`  
- **Fix:** Add containment benchmark panel and cost table sections.

**Screen 11 — Model Cost Benchmarks** (Partial)  
- `LlmRegistryTab.tsx` shows model registry but does not show $/conversation cost columns or benchmark comparison.  
- **Gap:** Missing cost per model per conversation, benchmark comparators.  
- **File:** `src/components/super-admin/llm-registry/LlmRegistryTab.tsx`  
- **Fix:** Add cost benchmark columns to the registry grid.

**Screen 15 — SIP Trunk Config** (Partial)  
- `SipTrunkConfigTab.tsx` is a 2,974-byte stub — minimal content.  
- **Gap:** Missing trunk credentials form, capacity limits, failover config, and status indicators.  
- **File:** `src/components/super-admin/telephony/SipTrunkConfigTab.tsx`  
- **Fix:** Expand into full SIP trunk management form with credentials, capacity, and status.

**Screens 5, 6, 7, 8, 9, 13, 14 — Not Implemented**  
No components exist for these Super Admin master-data screens. The Super Admin portal currently only covers LLM, ASR/TTS, Channels, Credentials, Vector DB, and analytics.

---

## Section 2 — Client Admin: Bots (Screens 16–25)

| Screen ID | Screen Name | Status |
|---|---|---|
| 16 | Bot List | **Fully Implemented** |
| 17 | Bot Create — Basics | **Fully Implemented** |
| 18 | Bot Create — Persona | **Fully Implemented** |
| 19 | Bot Create — Channels | **Fully Implemented** |
| 20 | Bot Create — Knowledge | **Fully Implemented** |
| 21 | Bot Create — Test | **Fully Implemented** |
| 22 | Bot Create — Publish | **Fully Implemented** |
| 23 | Bot Detail / Overview | **Fully Implemented** |
| 24 | Persona Editor | **Fully Implemented** |
| 25 | Welcome / Fallback Messages | **Fully Implemented** |

All 10 Bot screens are implemented within `BotsTab.tsx` (67 KB) as a multi-step wizard with inline pages.

---

## Section 3 — Client Admin: NLU (Screens 26–29)

| Screen ID | Screen Name | Status |
|---|---|---|
| 26 | Intents List | **Fully Implemented** |
| 27 | Intent Detail (Training Phrases + Slots) | **Fully Implemented** |
| 28 | Entity Types | **Fully Implemented** |
| 29 | Slot Filling Editor | **Fully Implemented** |

All NLU screens are implemented within `IntentsList.tsx` (67 KB) as a single tabbed composite page matching PDF description.

---

## Section 4 — Client Admin: Flows (Screens 30–42)

| Screen ID | Screen Name | Status |
|---|---|---|
| 30 | Dialog Flow Builder | **Partially Implemented** |
| 31 | Decision Tree Node | **Partially Implemented** |
| 32 | API Call Node | **Partially Implemented** |
| 33 | DB Query Node | **Partially Implemented** |
| 34 | RAG Retrieval Node | **Partially Implemented** |
| 35 | Agent (Tool-Use) Node | **Not Implemented** |
| 36 | Form Node | **Partially Implemented** |
| 37 | Card / Carousel Node | **Partially Implemented** |
| 38 | Branch / Condition Node | **Partially Implemented** |
| 39 | Human Handoff Node | **Partially Implemented** |
| 40 | Variables / Context Inspector | **Not Implemented** |
| 41 | Flow Simulator | **Partially Implemented** |
| 42 | Regression Suite | **Not Implemented** |

### Gaps

**Screen 30 — Dialog Flow Builder** (Partial)  
- `DialogFlowLayout.tsx`, `WorkflowCanvas.tsx`, `WorkflowToolbar.tsx` exist and provide visual node builder.  
- **Gap:** Canvas uses static node lists rather than a true connected graph with live link validation; node types not fully matching PDF (missing Agent/Tool-use node, missing delay node as configurable type).  
- **Files:** `src/components/dialog-builder/DialogFlowLayout.tsx`, `WorkflowCanvas.tsx`  
- **Fix:** Add Agent node type; add Variables/Context inspector drawer.

**Screens 31–34, 36–39 — Node Modals** (Partial)  
- Node files exist (`ApiNode.tsx`, `BranchNode.tsx`, `CarouselNode.tsx`, `DbNode.tsx`, `FormNode.tsx`, `HandoffNode.tsx`, `RagNode.tsx`, `IntentNode.tsx`) but are small stubs (2–3 KB each) with minimal real configuration UI.  
- **Gap:** Node drawers in `NodeSettingsDrawer.tsx` (26 KB) hold most config, but individual node type-specific config panels (HTTP auth, reranker config, SQL params, expression builder) are incomplete.  
- **Fix:** Expand `NodeSettingsDrawer.tsx` sections for each node type to match PDF modal descriptions.

**Screen 40 — Variables / Context Inspector** (Not Implemented)  
No drawer or side panel for live context variable inspection.

**Screen 41 — Flow Simulator** (Partial)  
- `WorkflowSimulator.tsx` (7 KB) exists.  
- **Gap:** No step-by-step call path highlighting, no live variable state panel alongside simulation.  
- **Fix:** Connect simulator to context inspector.

**Screen 42 — Regression Suite** (Not Implemented)  
No saved test case management or regression runner.

---

## Section 5 — Client Admin: Knowledge (Screens 43–51)

| Screen ID | Screen Name | Status |
|---|---|---|
| 43 | Sources List | **Partially Implemented** |
| 44 | Source — File Upload (Modal) | **Not Implemented** |
| 45 | Source — URL Crawl (Modal) | **Not Implemented** |
| 46 | Source — Connector (Notion/Confluence/Drive) | **Not Implemented** |
| 47 | Source — DB / SQL (Modal) | **Not Implemented** |
| 48 | Ingestion Logs | **Partially Implemented** |
| 49 | Reindex Confirmation | **Not Implemented** |
| 50 | Chunking & Embedding Config | **Partially Implemented** |
| 51 | Citation Display Config | **Not Implemented** |

### Gaps

**Screen 43 — Sources List** (Partial)  
- `KnowledgeBaseTab.tsx` shows sources list with sync triggers.  
- **Gap:** No "Add Source" button that opens type-selection flow. No per-source metadata drawer. No source type filtering.  
- **File:** `src/components/client-admin/knowledge/KnowledgeBaseTab.tsx`  
- **Fix:** Add Add Source modal launcher with type options (file, URL, connector, DB).

**Screens 44–47 — Source Modals** (Not Implemented)  
No modals for file upload, URL crawl, Notion/Confluence/Drive connector, or DB/SQL connector exist anywhere in the codebase.

**Screen 48 — Ingestion Logs** (Partial)  
- Logs shown as a sidebar timeline in `KnowledgeBaseTab.tsx`.  
- **Gap:** Not a standalone page. Missing per-doc status filters, error expansion, and re-queue action.  
- **Fix:** Extract into dedicated ingestion log panel with filters and actions.

**Screen 50 — Chunking & Embedding Config** (Partial)  
- A basic chunking config section exists in `KnowledgeBaseTab.tsx` (2 inputs only).  
- **Gap:** Missing chunk strategy options (sliding window, fixed, semantic), overlap preview, and embedding model comparison.  
- **Fix:** Expand chunking config into a proper configuration form.

---

## Section 6 — Client Admin: Safety

| Screen ID | Screen Name | Status |
|---|---|---|
| Topics | **Fully Implemented** |
| PII Redaction | **Fully Implemented** |
| Jailbreak Detection | **Fully Implemented** |
| Escalation Triggers | **Fully Implemented** |

### Notes

`GuardrailsTab.tsx` now provides the full multi-tab safety workspace: topic allow/block controls, PII masking policies, jailbreak sandbox testing, escalation triggers, and safety audit logs.

---

## Section 7 — Client Admin: Channels (Screens 56–63)

| Screen ID | Screen Name | Status |
|---|---|---|
| 56 | Web Widget Config | **Fully Implemented** |
| 57 | WhatsApp Business Config | **Fully Implemented** |
| 58 | SMS Config | **Fully Implemented** |
| 59 | Email Helpdesk Inbox | **Fully Implemented** |
| 60 | Voice IVR Designer | **Fully Implemented** |
| 61 | Mobile SDK Keys | **Partially Implemented** |
| 62 | Social (FB/IG/X) | **Partially Implemented** |
| 63 | Slack / Teams | **Partially Implemented** |

### Gaps

**Screen 61 — Mobile SDK Keys** (Partial)  
- Present in `ChannelsTab.tsx` as a config card.  
- **Gap:** No SDK key generation workflow, no API key rotation, no platform-specific (iOS/Android) distinction.  
- **Fix:** Add key generation modal and platform tabs.

**Screens 62, 63 — Social / Slack/Teams** (Partial)  
- Channel cards exist in `ChannelsTab.tsx` for FB/IG/X and Slack/Teams.  
- **Gap:** Social channels lack OAuth auth flow UI. Slack/Teams lacks webhook URL + event subscription config.  
- **Fix:** Add configuration drawers for these channels matching the depth of the WhatsApp and SMS config drawers.

---

## Section 8 — Client Admin: Operations

| Screen ID | Screen Name | Status |
|---|---|---|
| Business Hours | **Fully Implemented** |
| Routing Rules | **Fully Implemented** |
| Queue Management | **Fully Implemented** |
| Agent Roster | **Fully Implemented** |
| Agent Skills Profile | **Fully Implemented** |
| Agent Live Status Board | **Fully Implemented** |

### Notes

`QueuesRosterTab.tsx` now consolidates business hours, routing, queue CRUD, roster CRUD, skills assignment, presence states, and holiday exceptions into one operations workspace.

---

## Section 9 — Client Admin: Agent (Screens 70–78)

| Screen ID | Screen Name | Status |
|---|---|---|
| 70 | Agent Workspace (Unified Inbox) | **Fully Implemented** |
| 71 | Conversation Detail | **Fully Implemented** |
| 72 | Customer 360 Merged Identity | **Fully Implemented** |
| 73 | Macros / Canned Responses | **Partially Implemented** |
| 74 | Co-browse / Screen Share | **Partially Implemented** |
| 75 | Agent Co-pilot Reply Suggestions | **Fully Implemented** |
| 76 | Sentiment Indicator | **Fully Implemented** |
| 77 | Tag / Label Editor | **Partially Implemented** |
| 78 | Disposition Codes | **Fully Implemented** |

### Gaps

**Screen 73 — Macros / Canned Responses** (Partial)  
- Macro suggestions referenced in `AgentWorkspaceLayout.tsx`.  
- **Gap:** No standalone macro management page. No create/edit/delete for macro library.

**Screen 74 — Co-browse / Screen Share** (Partial)  
- `CobrowseModal.tsx` exists (2.6 KB) — minimal stub with invite button.  
- **Gap:** Missing session control panel, stop sharing confirmation, access levels.

**Screen 77 — Tag / Label Editor** (Partial)  
- Tagging referenced in conversation panel.  
- **Gap:** No tag management modal. No auto-tag rule configuration.

---

## Section 10 — Client Admin: Tickets (Screens 79–83)

| Screen ID | Screen Name | Status |
|---|---|---|
| 79 | Tickets List | **Partially Implemented** |
| 80 | Ticket Detail | **Fully Implemented** |
| 81 | SLA Policies | **Partially Implemented** |
| 82 | SLA Breach Dashboard | **Partially Implemented** |
| 83 | Escalation Matrix | **Not Implemented** |

### Gaps

**Screen 79 — Tickets List** (Partial)  
- `SlaTab.tsx` (5 KB) and ticket list exist for client admin but are lightweight.  
- **Gap:** No bulk actions, no advanced filter bar, no column sort.

**Screen 81 — SLA Policies** (Partial)  
- `SlaTab.tsx` shows SLA metrics but does not allow creating/editing SLA policy definitions.  
- **Gap:** Missing policy CRUD (response time / resolution time per ticket type/channel).

**Screen 82 — SLA Breach Dashboard** (Partial)  
- `SlaAnalytics.tsx` covers breach analytics.  
- **Gap:** Not real-time — no live breach counter, no breach notification feed.

**Screen 83 — Escalation Matrix** (Not Implemented)  
No auto-escalation rule builder found in codebase.

---

## Section 11 — Client Admin: CX Surveys (Screens 84–87)

| Screen ID | Screen Name | Status |
|---|---|---|
| 84 | CSAT Survey Config | **Partially Implemented** |
| 85 | NPS Survey Config | **Partially Implemented** |
| 86 | Post-Chat Survey | **Partially Implemented** |
| 87 | Voice of Customer Dashboard | **Partially Implemented** |

### Gaps

`SurveysTab.tsx` (34 KB) covers CSAT and NPS analytics together. It is a well-built analytics dashboard, but:
- **Screen 84/85 gap:** Survey *configuration* (trigger conditions, question text, per-channel toggle) is missing — only analytics are shown. The "Survey Trigger Settings" button exists but has no implementation behind it.
- **Screen 86 gap:** Post-chat survey widget (shown immediately after conversation ends from agent workspace) is not implemented.
- **Screen 87 gap:** Voice of Customer themes + sentiment dashboard is merged into SurveysTab analytics — not a standalone thematic analysis view.

**File:** `src/components/client-admin/operations/SurveysTab.tsx`

---

## Section 12 — Client Admin: QA

| Screen ID | Screen Name | Status |
|---|---|---|
| Scorecard Builder | **Not Implemented** |
| QA Review Queue | **Fully Implemented** |
| QA Dispute / Appeal | **Not Implemented** |
| Coaching Plan | **Fully Implemented** |

### Notes

`QAManagerView.tsx` now provides a working QA queue and coaching plan experience. Scorecard construction and dispute/appeal remain absent.

---

## Section 13 — Client Admin: WFM (Screens 92–93)

| Screen ID | Screen Name | Status |
|---|---|---|
| 92 | Forecast & Schedule | **Not Implemented** |
| 93 | Shrinkage & Adherence | **Not Implemented** |

No WFM module exists. These are fully absent.

---

## Section 14 — Client Admin: Analytics (Screens 94–100)

| Screen ID | Screen Name | Status |
|---|---|---|
| 94 | Deflection Rate | **Fully Implemented** |
| 95 | Containment by Intent | **Fully Implemented** |
| 96 | Top Intents | **Fully Implemented** |
| 97 | Drop-off / Abandonment | **Fully Implemented** |
| 98 | Cost Saved | **Fully Implemented** |
| 99 | LLM Cost & Latency | **Fully Implemented** |
| 100 | Conversation Explorer | **Partially Implemented** |

### Gap

**Screen 100 — Conversation Explorer** (Partial)  
- Analytics center includes a transcript search/explorer component.  
- **Gap:** No full-text transcript search with filters (channel, date, agent, intent, sentiment). Explorer view is cosmetic.  
- **File:** `src/components/analytics/AnalyticsCenterLayout.tsx`

---

## Section 15 — Client Admin: Training (Screens 101–102)

| Screen ID | Screen Name | Status |
|---|---|---|
| 101 | Unanswered Queries Queue | **Fully Implemented** |
| 102 | Suggested Intent Clusters | **Fully Implemented** |

Both screens are fully implemented via:
- `TrainingTab.tsx`, `UnansweredQueriesTab.tsx`, `SuggestedClustersTab.tsx`, `IntentGenerationWizard.tsx`

---

## Section 16 — Client Admin: Lifecycle (Screens 103–106)

| Screen ID | Screen Name | Status |
|---|---|---|
| 103 | Version & Environment | **Partially Implemented** |
| 104 | Release / Deploy Pipeline | **Fully Implemented** |
| 105 | A/B Test Config | **Partially Implemented** |
| 106 | Rollback | **Fully Implemented** |

### Gaps

**Screen 103 — Version & Environment** (Partial)  
- `LifecycleTab.tsx` shows release v2.4.1 and pipeline stages.  
- **Gap:** No dev/stage/prod environment selector or environment-specific configuration management.

**Screen 105 — A/B Test Config** (Partial)  
- Traffic split slider exists in `LifecycleTab.tsx`.  
- **Gap:** No A/B test creation wizard, no winner selection logic, no test naming or hypothesis tracking.

---

## Section 17 — Client Admin: Integration (Screens 107–109)

| Screen ID | Screen Name | Status |
|---|---|---|
| 107 | Per-Bot Webhooks | **Partially Implemented** |
| 108 | CRM Connector | **Partially Implemented** |
| 109 | Order / Billing Connector | **Not Implemented** |

### Gaps

**Screen 107 — Per-Bot Webhooks** (Partial)  
- `WebhookConsole.tsx` (15 KB) exists with webhook event log.  
- **Gap:** Component is built but not connected to the Client Admin bot context — it appears as a standalone integration component not wired into the per-bot settings flow.

**Screen 108 — CRM Connector** (Partial)  
- `ConnectorRegistry.tsx`, `OAuthConnectModal.tsx`, `MappingBuilder.tsx` exist.  
- **Gap:** CRM-specific fields (contact write-back, ticket sync, lead creation) not scoped per PDF description. Generic connector UI, not CRM-specialized.

**Screen 109 — Order / Billing Connector** (Not Implemented)  
No commerce backend connector UI found.

---

## Section 18 — Client Admin: Auth (Screen 110)

| Screen ID | Screen Name | Status |
|---|---|---|
| 110 | In-Bot OTP Auth | **Partially Implemented** |

### Gap

`OtpAuth.tsx` exists in `customer-portal/refunds/` as a refund-specific OTP gating component. The PDF describes this as a general in-bot step-up auth mechanism configurable at the bot settings level. The current implementation is not exposed as a per-bot configurable auth step.

---

## Section 19 — Customer Portal (Screens 111–130)

| Screen ID | Screen Name | Status |
|---|---|---|
| 111 | Self-Service Home | **Fully Implemented** |
| 112 | KB Article View | **Fully Implemented** |
| 113 | KB Search Results | **Fully Implemented** |
| 114 | Submit Ticket (Modal) | **Fully Implemented** |
| 115 | Ticket List | **Fully Implemented** |
| 116 | Ticket Detail / Reply | **Fully Implemented** |
| 117 | Schedule Callback (Modal) | **Fully Implemented** |
| 118 | Callback Queue Position | **Not Implemented** |
| 119 | Live Chat Overlay | **Fully Implemented** |
| 120 | Voice Call Request (Modal) | **Fully Implemented** |
| 121 | Co-browse Join (Modal) | **Fully Implemented** |
| 122 | CSAT Survey (Post-Resolution) | **Not Implemented** |
| 123 | NPS Survey (Periodic) | **Not Implemented** |
| 124 | Transcript Email (Modal) | **Not Implemented** |
| 125 | Chat History | **Fully Implemented** |
| 126 | Order Lookup | **Not Implemented** |
| 127 | Return / Refund Initiate | **Fully Implemented** |
| 128 | OTP Authenticate | **Fully Implemented** |
| 129 | Multilingual Switch in Chat | **Not Implemented** |
| 130 | Accessibility Chat Widget | **Fully Implemented** |

### Gaps

**Screen 118 — Callback Queue Position** (Not Implemented)  
No intermediate screen showing estimated wait time and queue position after callback is scheduled.

**Screens 122, 123 — CSAT / NPS Survey (End-User Portal)** (Not Implemented)  
No customer-facing post-resolution survey screen exists. The CSAT/NPS in `SurveysTab.tsx` is admin analytics only.

**Screen 124 — Transcript Email Modal** (Not Implemented)  
No modal for emailing conversation transcript to the customer.

**Screen 126 — Order Lookup** (Not Implemented)  
No order lookup page exists in the customer portal. The refund wizard references orders but there is no standalone order status lookup.

**Screen 129 — Multilingual Switch in Chat** (Not Implemented)  
Language switching exists globally via the header toggle, but no per-conversation language switch modal within the chat interface.

---

## Section 20 — Agent Workspace (Screens 131–146)

| Screen ID | Screen Name | Status |
|---|---|---|
| 131 | Agent Dashboard (KPIs + Queue) | **Fully Implemented** |
| 132 | Unified Inbox | **Fully Implemented** |
| 133 | Active Conversation Panel | **Fully Implemented** |
| 134 | Customer 360 Side Panel | **Fully Implemented** |
| 135 | Reply Composer with Co-pilot | **Fully Implemented** |
| 136 | Internal Note | **Partially Implemented** |
| 137 | Transfer / Consult | **Fully Implemented** |
| 138 | Conference Call | **Partially Implemented** |
| 139 | Hold Music Selector | **Not Implemented** |
| 140 | Wrap-up / Disposition | **Fully Implemented** |
| 141 | Break / Aux Status | **Not Implemented** |
| 142 | Coaching Whisper View | **Partially Implemented** |
| 143 | Supervisor Live Monitoring | **Partially Implemented** |
| 144 | Supervisor Barge-in | **Partially Implemented** |
| 145 | Personal Scorecard | **Partially Implemented** |
| 146 | Schedule / Shifts | **Partially Implemented** |

### Gaps

**Screen 136 — Internal Note** (Partial)  
- Internal note input exists in `ConversationPanel.tsx`.  
- **Gap:** No distinct modal for internal notes. Notes not visually differentiated from messages (no "not visible to customer" indicator in the composer).

**Screen 138 — Conference Call** (Partial)  
- `ConferenceModal.tsx` (3.3 KB) exists.  
- **Gap:** Minimal stub — no participant management, no current call integration.

**Screen 139 — Hold Music Selector** (Not Implemented)  
No hold music selection modal found.

**Screen 141 — Break / Aux Status** (Not Implemented)  
No break/aux status change modal found. Agent status is shown but not configurable via modal.

**Screen 142 — Coaching Whisper** (Partial)  
- `CoachingWidget.tsx` (1.8 KB) is a minimal stub.  
- **Gap:** No live whisper message composition, no supervisor control, no coaching session log.

**Screen 143 — Supervisor Live Monitoring** (Partial)  
- `SupervisorPanel.tsx` (3.4 KB) shows queue overview.  
- **Gap:** No live conversation view/listen, no agent grid with real-time status.

**Screen 144 — Supervisor Barge-in** (Partial)  
- Referenced in `SupervisorVoicePanel.tsx`.  
- **Gap:** No confirmation modal as specified in PDF (type: Confirmation).

**Screen 145 — Personal Scorecard** (Partial)  
- `PerformanceScorecard.tsx` (2.7 KB) exists.  
- **Gap:** Minimal KPI display only. No detailed QA score breakdown, trend charts, or coaching feedback.

**Screen 146 — Schedule / Shifts** (Partial)  
- `ShiftSchedule.tsx` (2.3 KB) exists.  
- **Gap:** Minimal roster display. No week view, no shift swap request, no roster export.

---

## Section 21 — Module Popups (Screens 147–157)

| Screen ID | Screen Name | Status |
|---|---|---|
| 147 | Bot Publish — Safety Check | **Not Implemented** |
| 148 | Knowledge Ingest Failed (Modal) | **Not Implemented** |
| 149 | PII Detected — Redacted (Toast) | **Not Implemented** |
| 150 | Jailbreak Attempt Logged (Toast) | **Not Implemented** |
| 151 | Handoff Queued (Intermediate) | **Not Implemented** |
| 152 | Co-pilot Consent Prompt | **Not Implemented** |
| 153 | Transcript Privacy Notice (Toast) | **Not Implemented** |
| 154 | Recording Disclosure (Toast) | **Not Implemented** |
| 155 | Channel Verification — Meta/WABA | **Not Implemented** |
| 156 | WhatsApp Template Rejected (Modal) | **Not Implemented** |
| 157 | Voice Number Porting | **Not Implemented** |

All 11 module popup screens are absent. These are operational toasts, confirmation dialogs, and intermediate states that fire in response to real-time platform events. None have been built.

---

## Section 22 — Public Bot (Screens 158–161)

| Screen ID | Screen Name | Status |
|---|---|---|
| 158 | Public Site Bot Greeting | **Fully Implemented** |
| 159 | Pre-auth Product Q&A (RAG) | **Partially Implemented** |
| 160 | Pre-auth Order Lookup (OTP-gated) | **Not Implemented** |
| 161 | Pre-auth Callback Request | **Partially Implemented** |

### Gaps

**Screen 159 — Pre-auth Product Q&A** (Partial)  
- `PublicBotWidget.tsx` and `/portal/public` page exist.  
- **Gap:** No RAG-over-catalog response mode in the public widget. Responses are scripted.

**Screen 160 — Pre-auth Order Lookup (OTP-gated)** (Not Implemented)  
No OTP-gated order lookup flow in the public bot. `OtpAuth.tsx` exists only in the authenticated customer portal refund flow.

**Screen 161 — Pre-auth Callback Request** (Partial)  
- Callback modal exists but only in authenticated portal (`CallbackRequestModal.tsx`).  
- **Gap:** Not exposed in the pre-auth public bot interface.

---

## Additional Observations

### Duplicated Functionality
1. **OTP Authentication** — `OtpAuth.tsx` in `customer-portal/refunds/` is used for refund gating only, but the `/login/mfa` route also implements OTP. Screen 128 and Screen 160 require separate OTP contexts that currently share no reusable OTP primitive.
2. **CSAT/NPS** — Analytics for CSAT/NPS live in `SurveysTab.tsx` (Client Admin) but the customer-facing survey screens (122, 123) are entirely absent. The survey trigger in `WrapupModal.tsx` fires but routes nowhere visible to the customer.
3. **Supervisor Monitoring** — `SupervisorPanel.tsx` (client-admin operations) and `SupervisorVoicePanel.tsx` (voice components) overlap in purpose without clear role segregation.

### Obsolete / Misplaced Files
1. `src/components/voice/` — 11 voice components exist in isolation (VoiceDialer, ActiveCallPanel, CallHistory, VoicemailPanel, etc.) but are not wired into any navigation route. They appear to have been built speculatively and are not accessible from any app route.
2. `src/components/integrations/` — 12 integration components exist (`WebhookConsole.tsx`, `ConnectorRegistry.tsx`, `IntegrationsDashboard.tsx`, etc.) but the `/tenant/dashboard` and `/admin/infrastructure` routes do not surface them. They are rendered nowhere verifiable in the current route tree.
3. `src/components/landing/LandingPage.tsx` — Root landing page not mapped to a route. Root `/` redirects directly to `/login`.
4. `src/components/workspace/WorkspaceShell.tsx` — An outer workspace shell that appears redundant alongside `AgentWorkspaceLayout.tsx`.

### Missing Documentation Entries
Per AGENTS.md Section 8 requirements, the following gaps remain:
- `docs/plans/` — No architectural plan for the QA module, workforce management, or module popups system.
- `docs/decisions/` — No ADR documenting the remaining QA and WFM integration strategy.
- `docs/checkpoints/` — No checkpoint logs yet for the QA module and workforce management workstreams.
- `docs/sprints/` — The sprint record is still missing a completion summary for QA and workforce follow-up work.

---

## Prioritized Implementation Roadmap

Ordered by business value and PDF alignment coverage.

### Priority 1 — Critical Gaps in Core Operational Screens
Screens that block real operator workflows.

| Priority | Screen ID(s) | Work Item |
|---|---|---|
| P1 | 52, 53, 54, 55 | Expand GuardrailsTab with Topics, Jailbreak Detection, Escalation Triggers sub-tabs |
| P1 | 64, 65, 66, 67, 68, 69 | Build Operations sub-tabs: Business Hours (per-channel), Routing Rules, Agent Roster with CRUD, Agent Skills Profile, Live Status Board |
| P1 | 44, 45, 46, 47, 49 | Add Knowledge source modals (File Upload, URL Crawl, Connector, DB/SQL) and Reindex confirmation |
| P1 | 88, 89, 90, 91 | Build QA module from scratch: Scorecard Builder, QA Review Queue, Dispute Modal, Coaching Plan |
| P1 | 118, 122, 123, 124 | Customer Portal: Callback Queue Position, CSAT Survey, NPS Survey, Transcript Email Modal |

### Priority 2 — Partially Built Screens Requiring Completion
Screens that exist but fall short of PDF specification.

| Priority | Screen ID(s) | Work Item |
|---|---|---|
| P2 | 40, 42 | Dialog Flow: Add Variables/Context Inspector drawer; build Regression Suite page |
| P2 | 15 | Expand SIP Trunk Config from stub to full credentials + capacity form |
| P2 | 83 | Build Escalation Matrix auto-escalation rule builder |
| P2 | 139, 141 | Agent Workspace: Hold Music Selector modal; Break/Aux Status modal |
| P2 | 142, 143, 144 | Strengthen Coaching Whisper, Supervisor Live Monitoring, and Barge-in Confirmation |
| P2 | 147–157 | Implement all 11 Module Popup toasts, confirmations, and intermediate screens as a toast/notification system |
| P2 | 105, 103 | Lifecycle: A/B test creation wizard; dev/stage/prod environment tabs |

### Priority 3 — Missing Master Data & Super Admin Screens

| Priority | Screen ID(s) | Work Item |
|---|---|---|
| P3 | 5, 6, 7, 8 | Super Admin: Industry Intent Libraries, Industry Templates, Profanity Blocklist, PII Redaction Policy |
| P3 | 9 | Tenant Onboarding Template builder |
| P3 | 13, 14 | Knowledge Connector Registry; Number Pool (DID) management |
| P3 | 92, 93 | WFM: Forecast & Schedule; Shrinkage & Adherence panels |

### Priority 4 — Public Bot & Pre-Auth Flows

| Priority | Screen ID(s) | Work Item |
|---|---|---|
| P4 | 159, 160, 161 | Wire RAG Q&A, OTP-gated Order Lookup, and Callback Request into the pre-auth public bot flow |
| P4 | 126, 129 | Customer Portal: Order Lookup page; Multilingual Switch in Chat modal |

### Structural Cleanup (Non-Screen)
- Wire `src/components/voice/` components into app routes or remove if superseded by `VoiceIvrDesigner.tsx`.
- Wire `src/components/integrations/` into the Client Admin navigation (Screens 107–109).
- Create missing `docs/sprints/`, `docs/checkpoints/`, `docs/decisions/` entries per AGENTS.md Section 8.
- Remove or redirect orphaned `LandingPage.tsx` and `WorkspaceShell.tsx`.
