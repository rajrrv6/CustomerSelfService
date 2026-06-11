# Sprint 10 Phase 3 — QA Manager Scorecard Builder Restoration Plan

This plan outlines the architecture, routing registry integration, and visual layouts implemented to expose the Scorecard Template Builder as a first-class citizen of the QA manager workspace.

## 1. Context & Scope
To satisfy the inventory specification documents, we restored the dedicated template builder module to create and recalibrate QA grading scorecards (e.g. weights splits, auto-fail conditions) separately from reviews auditing.

## 2. Technical Modifications
- [permissions.ts](file:///c:/Users/rajrr/CustomerSelfService/src/lib/rbac/permissions.ts): Added route access permissions and title translations.
- [en.ts](file:///c:/Users/rajrr/CustomerSelfService/src/i18n/en.ts), [ar.ts](file:///c:/Users/rajrr/CustomerSelfService/src/i18n/ar.ts): Registered localized strings for scorecard terms.
- [Sidebar.tsx](file:///c:/Users/rajrr/CustomerSelfService/src/components/dashboard/Sidebar.tsx): Exposed the new tab under Quality Assurance.
- [ScorecardBuilderWorkspace.tsx](file:///c:/Users/rajrr/CustomerSelfService/src/components/qa/ScorecardBuilderWorkspace.tsx): Created the scorecard editor workspace.
- [QAManagerView.tsx](file:///c:/Users/rajrr/CustomerSelfService/src/components/dashboard/QAManagerView.tsx): Mounted the workspace case logic.
