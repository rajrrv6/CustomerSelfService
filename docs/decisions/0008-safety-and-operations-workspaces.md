# Architectural Decision Record — Safety & Operations Workspaces

## Status
Approved

## Context
The CustomerSelfService platform had small stubs for **Safety & Guardrails** and **Queues & Roster** configurations. They lacked critical real-world interactive capabilities (dials, sandboxes, holiday management, rule builders, presence Aux state controllers, and dynamic routing maps). Additionally, several screen inventory IDs were leaking into translation libraries and UI layouts.

## Decisions

1. **Safety Workspace Refactoring**:
   - We consolidated the various security options under a single high-fidelity, multi-tab `GuardrailsTab.tsx` workspace.
   - Built an interactive **Jailbreak Sandbox** using local React state to evaluate arbitrary prompts against mock threat rules (Toxicity, Jailbreaks, PII patterns).
   - Designed a visual **Escalation Triggers** list with full CRUD rules to dispatch to target support queues with severity indicators.

2. **Operations Workspace Consolidation**:
   - Refactored `QueuesRosterTab.tsx` to handle overall scheduling, presence, hours, rules, and roster under a unified operations layout.
   - Introduced a **Skills Assignment Matrix** allowing supervisors to check capabilities per agent directly in the browser.
   - Created a live **Presence Board** showing Aux break states alongside supervisor wiretap trigger icons (silent listen-in, whisper coaching, barge).
   - Added timezone controls and a **Holiday Exception CRUD Manager**.

3. **Elimination of Inventory Screen Suffixes**:
   - We removed all screen inventory codes (e.g. "Screen 101", "Screen 102") from the UI, translating dictionaries, and code comments.
   - Imposed a permanent repository guideline to ensure developers write clean, business-oriented titles only.

## Consequences
- Supervisors and Operations managers now experience realistic workflow mockups, eliminating speculative backend fetches.
- The UI, documentation, and metadata maintain a highly professional, enterprise-level aesthetic.
