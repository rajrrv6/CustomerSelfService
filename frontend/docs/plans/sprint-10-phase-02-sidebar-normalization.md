# Sprint 10 Phase 2 — Persona Sidebar Normalization Plan

This document details the plan implemented for segregating all persona sidebars according to the original inventory PDFs, removing cross-persona navigation leakage, replacing the sidebar header switcher with an active workspace telemetry panel, and auditing all role-based paths.

## 1. Goal & Objectives
- **PDF Alignment**: Align navigation items for the Support Agent, QA Manager, Supervisor, Client Admin, and Super Admin personas to match the respective functional taxonomies.
- **Segregation of Concerns**: Ensure Client Admins do not see agent workspace tools, Support Agents only see productivity/conversation tools, and Supervisors only see live operational queues and workforce schedules.
- **Aesthetic telemetry**: Replace the role switcher dropdown with an environment indicator badge and active persona labeling system.

## 2. Affected Files
- [permissions.ts](file:///c:/Users/rajrr/CustomerSelfService/src/lib/rbac/permissions.ts): Restricted `ROLE_PERMISSIONS` scopes and mapped titles.
- [clientAdminNavigation.ts](file:///c:/Users/rajrr/CustomerSelfService/src/config/clientAdminNavigation.ts): Restructured client admin accordion navigation.
- [Sidebar.tsx](file:///c:/Users/rajrr/CustomerSelfService/src/components/dashboard/Sidebar.tsx): Refactored navigation links, integrated active workspace indicator, and removed role switcher dropdown.
- [AgentWorkspaceLayout.tsx](file:///c:/Users/rajrr/CustomerSelfService/src/components/agent-workspace/AgentWorkspaceLayout.tsx): Mounted productivity and assist tabs.
- [QAManagerView.tsx](file:///c:/Users/rajrr/CustomerSelfService/src/components/dashboard/QAManagerView.tsx): Mounted and verified QA performance charts.
- [SupervisorView.tsx](file:///c:/Users/rajrr/CustomerSelfService/src/components/dashboard/SupervisorView.tsx): Added custom cases for `shift_planning`, `occupancy`, `agent_presence`, `queue_distribution`, and `escalations`.

## 3. Verification Plan
- **Type Checking**: Proactively verify compilation compliance via `npm run typecheck`.
- **Production Build**: Verify route layout bundle generation using `npm run build`.
- **RTL Mirroring**: Validate text directions under Arabic localizations.
