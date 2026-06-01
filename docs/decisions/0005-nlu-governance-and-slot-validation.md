# ADR 0005: Conversational NLU Governance and Slot Validation Sandbox

## Status
Accepted

## Context
Our enterprise CustomerSelfService platform requires high operational realism for AI agent configuration and governance. Specifically, we needed:
1. A Bot Provisioning Wizard that resides in a single controlled workflow shell with unsaved-change protection and real-time simulation diagnostic logging.
2. A lightweight NLU Governance panel for tenant administrators to adjust safety controls (toxicity scores, PII anonymization, forbidden blocklists), manage response templates, and track tenant deployments without over-engineering platform simulations.
3. Conversational slot sandboxes that reflect true operational cycles, including active attempt counting, detailed failure explanations, and clear escalation triggers when failure thresholds are reached.

## Decision
We implemented these capabilities inside two main client-admin views:
* **`BotsTab.tsx` Refinements**:
  - Bound the modal close action to a dirty-checking variable (`isWizardDirty`).
  - Added a responsive warning dialog block inside the modal to prevent accidental data loss.
  - Added a visible top progress bar linked to stepper steps.
  - Exposed matched intent, confidence score, extracted entities table, and fallback/escalation trigger reasons in Step 5 simulator diagnostics.
* **`IntentsList.tsx` Refinements**:
  - Created a dedicated `governance` tab containing:
    - **Toxicity & PII Shield Gateways**: Sliders and options to set thresholds, mask PII, and register forbidden keywords.
    - **Safety Intercept Sandbox**: Panel to verify input censoring, PII masking, and word filters before sending queries to the NLU.
    - **Response Template Governance**: Mapped standardized templates with variable placeholders (e.g. `{{customer_name}}`, `{{order_id}}`) directly to intents.
    - **NLU Tenant Deployment**: Track release stage rollout assignment (A/B weight split slider), publish/rollback NLU states, and view a dedicated audit log console.
  - Upgraded the **Slot Validation Sandbox** to track active attempts (`Attempt X of Y`), explain RegEx mismatch failures explicitly, and log session locks upon triggering escalation paths.

## Consequences
- Enhanced UX usability with unsaved-change safety nets.
- Improved compliance with Saudi data standards (PII data filtering).
- Zero academic jargon; all slot extraction and safety filters correspond directly to commercial support platform operations.
