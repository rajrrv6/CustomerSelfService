# ADR 0007: Training Intelligence Loop Architecture

## Context
A key missing NLU operational block was the client-admin training loop (Screens 101 and 102). In production customer support environments, virtual assistants regularly encounter user queries that fail confidence thresholds or trigger fallback scenarios. Admin workflows must exist to review these unanswered utterances, cluster them, configure validation parameters, and promote them back to active NLU models.

## Decision
We implemented a client-side simulated NLU Training Loop comprising:
1. **Screen 101 (Unanswered Queries Queue)**: A detailed datagrid for searching and status-filtering queries. Incorporates live conversation drawer views, similar phrases lists, ignore/archive/escalate actions, and bulk merge options.
2. **Screen 102 (Suggested Clusters)**: An intent clustering workspace showing trends, top keywords, suggested schemas, and a 6-step Intent Generation Wizard.
3. **Intent Generation Wizard**: A controlled stepper that guides client-admins through:
   - Defining names and categories.
   - Editing/pruning training utterances.
   - Selecting entities from the active catalog (e.g. `@order_id`, `@phone_number`, `@iban`).
   - Defining slot rules (max retries, custom prompts, fallback handlers).
   - Drafting localized English/Arabic response templates.
   - Pushing the new intent live to `useApp().intents`.
4. **RBAC Guardrails**: Restricts edit/wizard functions for `qa_manager` roles, rendering them read-only, and prevents access for `support_agent` and `supervisor` roles.

## Status
Approved and Implemented.

## Consequences
- Reduces platform complexity by avoiding heavy backend ML training engine mock code.
- Successfully hooks new intents directly into the active `intents` registry which updates live sandbox/inbox dialog behaviors.
- Enforces strict role permission validation under the QA Manager role.
