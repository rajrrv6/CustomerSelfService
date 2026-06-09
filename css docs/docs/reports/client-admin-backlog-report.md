# Client Admin Backlog Report & Sprint Roadmap

## 1. Defining the True Backlog

This backlog report filters out logical items that were intentionally merged into context-rich screens. The remaining gaps are classified into architectural refactoring, UX consolidation, and API integrations.

By consolidating workflows, the project prevents navigation bloat and provides clear boundaries between administrative configuration and operational agent execution.

---

## 2. Sprint 09+ Normalization Roadmap

### Phase 1: Sidebar Grouping & IA Normalization
- **Objective:** Group the flat sidebar menu items for non-Super Admin roles into structured directories.
- **Action items:**
  1. Modify [Sidebar.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/components/dashboard/Sidebar.tsx) to replace the flat `menuItems` array with a grouped configuration, mirroring the Super Admin grouped sections.
  2. Implement collapsible accordion headers for *Operations*, *AI & Knowledge*, *Channels*, and *Governance*.
  3. Ensure active route highlighting scales across nested child sub-screens (e.g., highlighting `AI & Knowledge` when in `dialog_flow` or `intents`).

### Phase 2: UX Consolidation & Persona Relocation
- **Objective:** Relocate screens that do not belong to the Client Admin persona to prevent cross-persona layout leakage.
- **Action items:**
  1. **Move Agent Workspace items:** Relocate `inbox`, `tickets`, and `agent_dashboard` strictly under the `support_agent` view context. Remove these entries from the `client_admin` default permission mappings in [permissions.ts](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/lib/rbac/permissions.ts).
  2. **Isolate QA Workspace:** Ensure the QA queue and coaching plans (`qa_queue` and `coaching`) are accessible *only* to the `qa_manager` role.
  3. **Isolate Supervisor & Workforce:** Relocate supervisor live monitors (`supervisor_monitor`) and predictive shift scheduling (`workforce`) to the `supervisor` sub-role dashboard.
  4. **Verify Customer Portal isolation:** Ensure OTP authentication (`OtpAuth.tsx`) and help article displays are restricted to the `customer` portal route.

### Phase 3: API Integration & Live Data Binding
- **Objective:** Transition simulation models and state mocks in the Client Admin features into live API broker calls.
- **Action items:**
  1. Bind the RAG file/URL crawls forms in [KnowledgeBaseTab.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/components/client-admin/knowledge/KnowledgeBaseTab.tsx) to background ingestion routes.
  2. Integrate the visual nodes config in [DialogFlowCanvas.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/components/client-admin/dialog-builder/graph/DialogFlowCanvas.tsx) with the backend graph engine to load/save JSON flows.
  3. Connect the Guardrails topics blocklist and PII regex switches to the live chat pipeline middleware.

---

## 3. Prioritized Backlog Items

Below is the structured Sprint 09+ backlog prioritized by impact and complexity:

| Priority | Feature / Refactoring Task | Domain | Complexity | Description |
| :--- | :--- | :--- | :--- | :--- |
| **P1** | Grouped Sidebar Implementation | Navigation | Low | Modify `Sidebar.tsx` to group the flat navigation list into collapsible operational folders. |
| **P1** | RBAC Persona Route Cleanup | Security / RBAC | Medium | Relocate `inbox`, `tickets`, `qa_queue`, `workforce`, and `supervisor_monitor` out of the default `client_admin` sidebar views in `permissions.ts`. |
| **P2** | Dialog Builder JSON Sync | AI & Knowledge | High | Bind visual node coordinates and parameters in `DialogFlowCanvas.tsx` to backend API endpoints. |
| **P2** | Knowledge Ingestion Pipelines | AI & Knowledge | Medium | Connect the file upload modal, database credentials form, and sitemap crawl inputs to active RAG indexes. |
| **P3** | Live Gateway Telemetry | Channels | Medium | Transition mock WhatsApp and SMS template listings into Meta API and Twilio status bindings. |
| **P3** | Guardrails Interceptor Hook | Safety | Medium | Bind guardrails toggle states (PII redaction, topic blocklists) to real-time chat input middleware. |

---

## 4. Speculative Features to Avoid

To prevent bloat and maintain a unified platform, the following design requests should be **denied** or **avoided**:

1. **Standalone Pages for Drawer Workflows:** 
   - *Speculative Request:* Creating standalone pages/routes for editing intent details or viewing chunk profiles.
   - *Consolidation Decision:* Keep these as inline drawers/modals. standalone pages introduce routing delays and break flow context.
2. **Duplicated Channels Configuration screens:**
   - *Speculative Request:* Creating a standalone WhatsApp settings page separate from the Omnichannel grid.
   - *Consolidation Decision:* Keep all integrations unified in `ChannelsTab.tsx` to maintain a single page for all channels metadata.
3. **Speculative Super Admin Master data overlays:**
   - *Speculative Request:* Adding custom LLM model registrations directly in the Client Admin wizard.
   - *Consolidation Decision:* Model additions must remain in the Super Admin area; Client Admins only select from approved options.
