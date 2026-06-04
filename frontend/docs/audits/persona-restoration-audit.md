# Persona Restoration Audit Report

## Audited Role Segregation Matrix

| Role | Default Screen | Allowed Screens / Workspaces | Prohibited Screens (Blocked via RBAC) |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `sa_dashboard` | `sa_master_data`, `sa_infra`, `sa_telephony`, `llm_registry`, `vector_db` | All client tenant workspaces |
| **Client Admin** | `bots` | `bots`, `intents`, `dialog_flow`, `guardrails`, `channels`, `settings`, `rbac` | `inbox`, `qa_queue`, `workforce`, `supervisor_monitor` |
| **Support Agent** | `agent_dashboard` | `agent_dashboard`, `inbox`, `tickets` | QA queue, bot builders, supervisor whisper configs |
| **QA Manager** | `qa_queue` | `qa_queue`, `coaching`, `evaluations` | RAG config, channels, agent inbox operations |
| **Supervisor** | `supervisor_monitor`| `supervisor_monitor`, `workforce`, `sla`, `live_queues` | QA scorecards, LLM registries, RAG database rules |

## Key Findings
- Primary permission controls inside `permissions.ts` and `permissionStore.ts` have been verified.
- Access attempt audits correctly trigger a block when accessing out-of-role screen IDs.
- Telephony live wiretaps, active coaching whisper dispatch, and CSAT telemetry are preserved.
