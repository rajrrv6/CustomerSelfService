# Client Admin Persona Boundary Audit

## 1. Audit Scope & Context
This audit ensures strict persona separation across workspace roles to prevent leakage of support agent interactions, QA evaluations, or supervisor workforce planning tools into the Client Admin dashboard.

---

## 2. Segregation Verification Matrix

We verify that role boundaries are mapped correctly:

| Persona | Functional Scope | Primary Screens | Codebase Location | Boundary Enforced? |
| :--- | :--- | :--- | :--- | :--- |
| **Client Admin** | Global tenant settings, bot creation, NLU intents, knowledge databases, security guardrails, channel routing. | `bots`, `intents`, `dialog_flow`, `knowledge_base`, `guardrails`, `channels` | `src/components/client-admin/` | **Yes** (Support/Workforce options excluded) |
| **Support Agent** | Conversation inbox, tickets logs, co-pilot composition, wrap-up codes. | `inbox`, `tickets`, `agent_dashboard` | `src/components/agent-workspace/` | **Yes** (Admins/QA blocked from inline composition) |
| **QA Manager** | Scores evaluations, QA review queues, agent training plans. | `qa_queue`, `coaching` | `QAManagerView.tsx` | **Yes** (Access restricted to QA Manager only) |
| **Supervisor** | Real-time agent monitoring, barge-in, workforce planning schedules. | `supervisor_monitor`, `workforce` | `SupervisorView.tsx` | **Yes** (Planning tools locked under supervisor view) |

---

## 3. RBAC Enforcements Verified
1. **Sidebar Filter Routing:** Check inside `canAccessScreen` ensures screens are rejected if they are not explicitly defined in `ROLE_PERMISSIONS` configuration for that user role.
2. **Tab Access Control:** `ClientAdminLayout.tsx` switch cases match and enforce correct screen components depending on routing, rejecting unauthorized tab access.
