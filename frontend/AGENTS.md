# AI Agent Guidelines & Repository Governance (AGENTS.md)

Welcome, AI Developer. This repository is an AI-Native enterprise frontend CustomerSelfService platform built using Next.js, React, TypeScript, and Tailwind CSS. The guidelines in this document are permanent repository governance rules. You must strictly adhere to them for every code modification, implementation plan, and verification pass.

---

## 1. Project Mission
The goal of this platform is to provide a complete, operationally realistic client self-service portal, agent workspace, and admin orchestration console for multi-channel customer support. The frontend must look and feel like a premium, enterprise-grade application with visual and operational realism (seeded metrics, live traffic logs, local translation engines, and responsive customization tools).

---

## 2. Architecture Overview
The repository follows a clean role-based segregation system across the client-admin, super-admin, agent workspace, and end-user portal layers:
* **Super Admin Portal**: Exposes LLM registries, vector DB statistics, global channel catalogs, and provider credential states (e.g. Twilio, Meta, Plivo, SendGrid secrets).
* **Client Admin Portal**: Manages tenant-scoped metadata configuration parameters, support operation hours, queue layouts, chatbot handoff thresholds, WhatsApp template approvals, and chat widget customizations.
* **Agent Workspace**: Operates the Unified Inbox with distinct visual layout cues (WhatsApp bubbles, email document compositions, escalation locks) and ERP SAP data connectors.
* **Customer Self-Service Portal**: Handles RAG search interfaces, ticket histories, callback schedulers, and refund exemption workflows.
* **Permissions Engine**: Centralized client-side RBAC validation inside `src/lib/rbac/permissions.ts`.

---

## 3. Realism & Implemented Systems

### A. Super Admin Master Data
- **LLM Model Registry**: Interactive grid register for foundation and fine-tuned configurations. Includes 400ms search mismatch loader row skeleton simulations and 1.5s AI Gateway credential sync animations.
- **ASR/TTS Speech Registry**: Registers speech-to-text and text-to-speech engine latencies and minute billing coefficients.
- **Omnichannel Channel Catalog & Credentials**: Exposes configuration drawers for SMS, Voice, WhatsApp, email connectors, and Twilio/Meta provider secrets.
- **Vector DB Status**: Real-time compaction simulations, index vector metrics, partition storage capacity limits, and manual rebalancing triggers with warning lock statuses and successful retries.

### B. Client Admin Operations
- **Dialog Flow & Bot Builder**: High-fidelity conversational graph orchestration engine powered by React Flow supporting 11 node types (Start, Message, Condition, Intent, API Action, Escalation, Variable Set, Delay, Human Handoff, Knowledge Search, End). Includes dynamic LTR/RTL handle position mirroring, Zod-validated node inspectors with sticky save panels, a live validation diagnostics engine, and a client-side execution simulator with path highlighting and slot-filling prompts.
- **Bot Wizard**: Single controlled modal shell with a top progress tracker, unsaved-change close intercept warning overlay, and real-time simulator diagnostics (matched intent, confidence score, extracted entities table, fallback reasons, and escalation triggers).
- **Safety & Guardrails**: Toxicity Sensitivity score sliders, dropdown actions for PII masking (Strict block, Medium mask, Log only), custom forbidden word blocklists, and safety intercept test panels.
- **Response Template Governance**: Standardized templates mapped to intents using double brackets (e.g. `{{customer_name}}`, `{{order_id}}`) for structured response delivery.
- **NLU Tenant Deployment**: Active NLU version indicators, rollout traffic splits (A/B weight split slider), publish/rollback controls, and live governance audit logs.
- **Entity & Slot Validation Sandbox**: Sandbox with active attempt counter logs (e.g. `Attempt X of Y`), RegEx failure explanations, and visual escalation triggers when thresholds are breached.
- **Workforce & Schedules**: Calendar roster shifts and forecasting volume adherence panels.
- **Voice IVR Designer**: High-fidelity flow-focused IVR workflow builder supporting 9 custom node types (Welcome, Menu, Business Hours, Queues, Agent Transfer, Voicemail, Callback, AI Assistant, End Call). Includes real-time link validations (warnings for unconnected nodes, dead ends, missing routes) and a step-by-step interactive call simulation console with keypad input, active call path highlighting, and Farah AI voice confidence thresholds.

### C. Agent Unified Workspace
- **Omnichannel Inbox**: Segregated channels (WhatsApp bubble interfaces, emails, phone SIP records) with macro canned responses, co-pilot suggestion tabs, supervisor whisper coaching, and live wiretap barge-in buttons.
- **Disposition & SLA**: Modal wrapups logging SAP CRM diagnostic codes and SLA breach dashboards tracking resolution compliance.

### D. Customer Self-Service & Public Portals
- **Public Guest Portal (`/portal/public`)**: Guest visitor access point allowing KB searches, chatbot conversations, and voice callbacks without credential login.
- **OTP-Gated Refund Wizard**: Validates order returns via 4-digit MFA code challenge triggers without password registration.
- **Accessibility Toolbox**: Dynamic font resizing (sm, base, lg) and high contrast theme class injects.

### E. NLU Training Intelligence Loop
- **Unanswered Queries Queue**: Multi-column datagrid of unmatched customer queries detailing sentiment, language, frequency, and last seen metrics. Includes contextual drawers showing live transcripts, similar utterances, and actions (Ignore, Archive, Escalate, Add to existing intent).
- **Suggested Clusters**: Grid of AI-generated clusters containing confidence metrics, trend indicators, sample phrases, extracted keywords, and slot rules.
- **Intent Generation Wizard**: 6-step workflow that guides admins through naming intents, managing training phrases, linking entity catalogs, defining slot validation prompts, drafting bilingual responses, and publishing directly to the active NLU registry.
- **RBAC Policy Guardrails**: Enforces read-only access for QA Manager users, disabling all modifications and deployment wizards.

### F. Global Notification & Telemetry Center
- **Zustand Telemetry Engine**: Ephemeral operational alert store with narrow selectors, deduplication counters, rate-limiting constraints, and alert mute toggles. Exposes backward-compatible alises for legacy audit logging.
- **Toast Stacking viewport**: Renders active toasts with LTR/RTL mirrored layouts, severity-based auto-dismiss progress timelines, and interactive inline actions.
- **Telemetry Drawer & Filters**: Slide-out timeline organizer showing categorized events, structured metadata tables, and interactive simulation console settings.
- **SIEM Security Center**: Full-screen overlay console displaying aggregate cluster metrics, category muting switches, searchable telemetry timelines, and immutable security audit logs.
- **Decoupled Event Publisher**: Future-proof event-based creators for SLA breaches, webhook delays, API timeouts, NLU drops, safety blockages, and DB indexes.

---

## 4. Engineering & Workflow Rules
* **Modular Codebase**: Do not build monolith components. Break complex modules down into focused components. Keep JSX clean and avoid massive layout blocks.
* **Strict Type Safety**: Write strict TypeScript. No loose `any` types. Properly type event handlers, component states, and context structures.
* **Visual Excellence & Realism**: Maintain visual design system parameters (glassmorphic border styles, subtle hover states, HSL-tailored colors). Do not use lorem ipsum placeholders or blank dashboard slots. Populate all components with realistic, domain-specific mock data.
* **No Speculative Backend Assumptions**: Never implement mock endpoints or remote fetch blocks that assume nonexistent backend services. Keep data operations local and state-driven using the React context framework (`useApp`).
* **Clean Business Naming & No Screen Numbers**: Under no circumstances should inventory screen numbers (such as Screen 52, Screen 55, Screen 102, etc.) or terms like "Inventory Item" be displayed in the UI, navigation, page titles, tabs, cards, drawers, modals, breadcrumbs, walkthroughs, task files, documentation, or code comments. Always use business names only. This rule is absolute and permanent.

---

## 5. AI Workflow & Plan-Verify Discipline
1. **Plan Before Implementation**: For complex tasks, research, check the codebase, and write or update an `implementation_plan.md` outlining gap analyses and affected files. Get user confirmation before writing code.
2. **Checkpoint After Changes**: Use the `task.md` checkpoint checklist to record tasks. Maintain documentation progress during implementation.
3. **Verify Integrity**: Every major layout modification requires a mandatory verification phase:
   - Run `npm run typecheck` to verify TypeScript compliance.
   - Run `npm run build` to verify production builds and route optimizations.

---

## 6. Localization & RTL Mirroring
* All layout systems must support dynamic English (EN) and Arabic (AR) translations.
* Mirror the visual layout automatically using `dir="rtl"` flags inside layout wrappers when language is set to Arabic.
* Feed text structures using the localized dictionary maps (`translations[lang]` or local dictionaries) to prevent hardcoded language keys in core layouts.

---

## 7. Accessibility & Keyboard Control
* Interactive modal frames must trap keyboard focus and support escape key closing triggers.
* Custom input controls (toggles, buttons, sliders) must maintain focus outlines (`focus-visible:ring-2`) and support standard `aria-*` tags.

---

## 8. Documentation Discipline
Every major feature release or refinement requires updating:
* `docs/sprints/` with sprint completion summaries.
* `docs/checkpoints/` with validation criteria logs.
* `docs/plans/` for subsequent architectural integrations.
* `docs/decisions/` for significant ADR updates.

---

## 9. State Management Architecture
To prevent "God Context" performance bottlenecks and unnecessary component re-renders:
* **Zustand for Cross-Feature State**: Only migrate state that is truly shared across multiple decoupled features (e.g., `lang`, `theme` in `uiStore`, `role` in `authStore`, `auditLogs` in `notificationsStore`).
* **Feature-Scoped State in Context**: Feature-specific data (e.g. `conversations` for the Agent Workspace, `bots` for the BotsTab) must remain in localized context providers or localized state unless explicit cross-feature sharing is required.
* **Ephemeral UI State is Local**: Wizard steps, active tabs, dialog dialpad inputs, and voice call session-lived states must stay as local `useState` within the owning component or localized custom hook (e.g., `useVoiceState`, `useQueueMetrics`).
* **Strict Selector Pattern**: When consuming a Zustand store, always use narrow field selectors to avoid subscribing to unrelated changes:
  ```typescript
  // CORRECT: Subscribes only to lang
  const lang = useUIStore((s) => s.lang);

  // INCORRECT: Causes re-renders on any store update
  const { lang, theme } = useUIStore();
  ```

---

## 10. Enterprise Table System
For clean scalability and UI consistency, follow these table guidelines:
* **Composable Sub-Components**: Do not write monolothic custom tables. Break search, visibility, pagination, and action controls into small, decoupled components managed by the core `EnterpriseTable` orchestrator.
* **Strict Separation of Concerns**: Keep parent feature tabs in control of data fetching and row action definitions (ColumnDefs). The shared table layout components must remain pure presentation shells.
* **Dynamic Mirroring & RTL**: Support dynamic English/Arabic i18n, setting `dir="rtl"` in layouts automatically based on the language context.
* **Sticky Headers**: Set high-precision z-indices (`z-20`) for header columns to prevent overlaps from sidebar menus or modals.

---

## 11. Documentation Discipline & Sprint Checkpoints
All non-trivial implementation phases must be persisted into markdown documentation files inside docs/plans, docs/checkpoints, or docs/decisions. Architectural walkthroughs and implementation completion reports must never remain only in chat history.

Additional rules:
* After every completed sprint phase:
  * Create/update checkpoint markdown.
  * Include validation results.
  * Include carried-forward items.
  * Include known limitations.
* Do not mark implementation complete until documentation files are saved.


