# Seed & Demo Data Architecture

This document describes the design of the seeding engine, dataset generations, and deterministic configurations.

---

## 1. Deterministic Seeding Strategy
- **Why**: Integration tests and frontend API wrappers depend on predictable entities. If IDs rotate randomly on every seed execution, frontend test scripts (Playwright) will break.
- **Rules**:
  - All default tenants, users, and bots use static, hardcoded MongoDB ObjectIds.
  - Hardcoded IDs are declared in a centralized constants file `src/database/seed/seed-constants.ts`.
  - Example seed ID bindings:
    - Tenant ACME: `60c72b2f9b1d8a001c8e9b01`
    - Client Admin User: `60c72b2f9b1d8a001c8e9b02`
    - Support Agent User: `60c72b2f9b1d8a001c8e9b03`
    - Default Chatbot: `60c72b2f9b1d8a001c8e9b04`

---

## 2. Seed Dataset Generators

### 1. Tenant & RBAC Seeds
- Provision 3 default tenants (`acme` on trial plan, `globex` on active premium plan, and `initech` on suspended plan).
- Seed users mapping to every role:
  - 1 Super Admin (global scope, no tenant ID).
  - 1 Client Admin for each tenant.
  - 2 Support Agents and 1 Supervisor for the `acme` tenant.
  - 1 Customer User for the `acme` portal.

### 2. Conversational Transcripts & Messages
- To demonstrate agent workspace workflows, seed 20 conversations:
  - **Unassigned Queue**: 5 chats (3 WhatsApp, 2 Web) containing initial customer greetings.
  - **Active Queue**: 8 conversations assigned to agents with ongoing dialogues.
  - **Escalated Queue**: 4 locked chats flagged as SLA breach threats.
  - **Resolved Queue**: 3 conversations with wrap-up codes and CSAT feedback replies.
- Transcripts should feature domain-specific issues (payment issues, order tracking lookup triggers, return policy FAQs).

### 3. Analytics & Latency Seeds
- To populate the Super Admin and Client Admin dashboards, seed a time-series history mapping the last 30 days of metrics:
  - Daily API request counters.
  - Token counts parsed.
  - Deflection rates (contained conversations vs. agent handoffs).
  - Latency trends split by LLM model registries (Gemini vs. OpenAI).

---

## 3. Seed Execution Command Flow
1. Install development dependencies.
2. Run command:
   ```bash
   npm run seed
   ```
3. Execution lifecycle:
   - Verify `process.env.NODE_ENV !== 'production'`.
   - Open Mongoose connection.
   - Drop matching collections.
   - Insert tenants, users, bots, intents, dialog flows, knowledge sources, and conversations.
   - Create Atlas Vector indexes.
   - Close database connection and exit.