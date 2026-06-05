# Sprint 10 Phase 1 — Persona Restoration & Workspace Segregation Planning

## 1. Goal
Restore the PDF-aligned multi-persona workspace architecture by re-introducing dedicated Support Agent, QA Manager, and Supervisor workspaces while maintaining strict RBAC segregation.

## 2. Execution Strategy
- **Permissions Mappings**: Restrict `client_admin` default matrix access to operations, queues, and agent features. Restructure `ROLE_PERMISSIONS` and `SCREEN_TO_MODULE_MAP` to segregate roles.
- **Dynamic Navigation**: Filter sidebar groups dynamically. Introduce grouped layout lists for Support Agent (*Conversations*, *Productivity*, *AI Assist*), QA Manager (*Quality Assurance*), and Supervisor (*Workforce Management*).
- **Workspace Segregation**: Create `SupportAgentView` to mount agent features directly. Extract QA reviews and evaluations from Client Admin layout into a separate `QAManagerView`. Extract monitoring and WFM tools into a dedicated `SupervisorView`.
- **Launcher Restoration**: Restore cards representing all 7 roles with realistic hover telemetry data for a premium CX experience.
