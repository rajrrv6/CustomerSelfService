# QA Workspace Boundary Report

This document reports on the boundary segregation checks between QA Manager modules and other functional personas.

## 1. Segregation Validation
- **Goal**: Ensure QA Scorecard templates, reviews queue audits, and coaching plans are only editable by QA Manager.
- **Support Agent Scope**: Can view scorecard scores inside their feedback evaluations panel but cannot alter section weights, clone templates, or view other agents' audits.
- **Supervisor Scope**: Maintains access to monitoring/whispering controls and shift schedule calendars, but is prohibited from modifying NLU intent matrices or template categories.
- **Client Admin Scope**: Governs safety sliders, builder nodes, NLU versions, and deployments, but has no access to specific agent-calibrated scorecard templates.
- **RBAC Policy Guardrails**: Enforced via matrix configurations in `permissions.ts` and evaluated during initial routing verification passes.
