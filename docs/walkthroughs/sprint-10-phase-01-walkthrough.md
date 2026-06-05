# Sprint 10 Phase 1 Walkthrough

## Features Walkthrough

### 1. Launcher Dashboard
The Workspace Launcher features a card grid that renders 7 role launchers. Hovering over any card slides up a telemetry stats overlay with domain-specific metrics. Clicking the card updates the session state role and redirects directly to the selected workspace.

### 2. Sidebars and Grouping
Sidebar links are dynamically calculated:
- **Support Agent**: Grouped into *Conversations*, *Productivity*, and *AI Assist*.
- **QA Manager**: Grouped into *Quality Assurance* (Review queue, coaching plans, completed evaluations).
- **Supervisor**: Grouped into *Supervisor Dashboards*, *Workforce Management*, and *Service Levels*.

### 3. Screen Mounting & Separation
- `QAManagerView` isolates the review queue, completed evaluations, and training coaching.
- `SupervisorView` mounts live monitoring, aux tracking, and SLA analytics.
- `SupportAgentView` mounts unified inbox, agent metrics, and calendars.
- `ClientAdminView` is clean of raw agent inbox and operational screens.
