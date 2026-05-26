# Architectural Decision Record (ADR)

## Title
0001-role-based-dashboard-architecture

## Status
Accepted

## Context
The AI-Native mPaaS customer self-service repository serves four distinct personas: Super Admin (platform operators), Client Admin (tenant managers), Agents (unified inbox responders), and QA Managers (quality score checkers). The application is built using Next.js App Router, and we need to determine how to securely partition views and actions for each role while maintaining single-page app speed.

## Decision
We enforce role-based segregation at the route and layout levels. 
1. Mapped roles to explicit dashboard templates (`SuperAdminLayout`, `ClientAdminLayout`, `AgentWorkspaceLayout`, `QAManagerView`).
2. Centralized permissions inside a modular helper (`src/lib/rbac/permissions.ts`) using a unified `useApp` state session.
3. Conditionally mount tabs and side panels dynamically based on the current persona, redirecting unauthorized role transitions back to access-denied pages.

## Consequences
- **Pros**: Zero page bundle duplication; fast route-switching for platform testing/demo sandbox; clean decoupling of dashboard components.
- **Cons**: Client-side layout changes must be guarded carefully to prevent unauthorized DOM leakage of configuration elements.

## Alternatives Considered
- **Separate Next.js Page Directories per Role**: Rejected due to requirements for a seamless sandbox demonstration experience, where users can swap roles dynamically using a floating control panel.
