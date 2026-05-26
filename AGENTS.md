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
- **Dialog Flow Builder**: Nodes representing branch logic, DB/API requests, RAG retrieval calls, human handoffs, and interactive form structures. Includes variable tracing consoles and step-by-step simulator panels.
- **Safety & Guardrails**: Toggles for PII anonymization (Credit Cards, Phone Numbers, Saudi Civil Registry IDs) and toxic input score sensitivity parameters.
- **Version Control & Deploy Pipelines**: Log console streamers outputting compilation pipelines, dynamic variant traffic diverters (e.g. controle split Variant A/B weight changes), and rollback actions.
- **Workforce & Schedules**: Calendar roster shifts and forecasting volume adherence panels.

### C. Agent Unified Workspace
- **Omnichannel Inbox**: Segregated channels (WhatsApp bubble interfaces, emails, phone SIP records) with macro canned responses, co-pilot suggestion tabs, supervisor whisper coaching, and live wiretap barge-in buttons.
- **Disposition & SLA**: Modal wrapups logging SAP CRM diagnostic codes and SLA breach dashboards tracking resolution compliance.

### D. Customer Self-Service & Public Portals
- **Public Guest Portal (`/portal/public`)**: Guest visitor access point allowing KB searches, chatbot conversations, and voice callbacks without credential login.
- **OTP-Gated Refund Wizard**: Validates order returns via 4-digit MFA code challenge triggers without password registration.
- **Accessibility Toolbox**: Dynamic font resizing (sm, base, lg) and high contrast theme class injects.

---

## 4. Engineering & Workflow Rules
* **Modular Codebase**: Do not build monolith components. Break complex modules down into focused components. Keep JSX clean and avoid massive layout blocks.
* **Strict Type Safety**: Write strict TypeScript. No loose `any` types. Properly type event handlers, component states, and context structures.
* **Visual Excellence & Realism**: Maintain visual design system parameters (glassmorphic border styles, subtle hover states, HSL-tailored colors). Do not use lorem ipsum placeholders or blank dashboard slots. Populate all components with realistic, domain-specific mock data.
* **No Speculative Backend Assumptions**: Never implement mock endpoints or remote fetch blocks that assume nonexistent backend services. Keep data operations local and state-driven using the React context framework (`useApp`).

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
