# ADR-010 — Enterprise Workflow Investigation Patterns

**Date:** 2026-06-01  
**Status:** Accepted  
**Sprint:** Sprint 6 — Enterprise Workflow Depth

---

## Context

The CustomerSelfService platform requires realistic enterprise audit loops, sync recovery diagnostics, and capacity forecasting tools. 
Previously, there were no unified visual elements to model process step calibrations, dispute logs, cron execution progress, key-value drilldowns, or emergency coverage overrides. This led to fragmented UX styling and bloated individual page layouts.

## Decision

We will implement a standard directory of reusable process workflow primitives under `src/components/shared/workflows/` to establish a shared pattern for operational dashboards.

## Core Component Map

| Component | Responsibility |
|---|---|
| `ApprovalStepper.tsx` | Visualizes milestone-based progression steps (e.g. Pending -> Calibration -> Disputed -> Completed). |
| `WorkflowTimeline.tsx` | Chronological vertical status log displaying actors, action names, timestamps, and notes. |
| `InvestigationDrawer.tsx` | RTL-mirrored details slide-out drawer utilizing focus traps and Esc-to-close behavior. |
| `ActivityFeed.tsx` | Chronological timeline items colored by event type (database, security, agent, error). |
| `StatusIndicator.tsx` | Badges equipped with pulsing dots mapping operational readiness (syncing, stale, degraded). |
| `OperationalBanner.tsx` | High-importance action callouts for degraded systems or threshold warnings. |
| `DrilldownPanel.tsx` | Key-value responsive grid for displaying raw process parameters and debug logs. |
| `RetryPanel.tsx` | Sync error displays featuring retry action buttons, simulated progress loaders, and success/failure resolution callbacks. |

## Consequences

- **Consistent UX Theme:** All workflow elements adhere strictly to the established HSL neutral, blue, and slate palette with no accent violations.
- **RTL & Mirroring:** Standardizes the `isRtl` parameter across all workflow details, automatically aligning layouts and spacing rules for Arabic localization.
- **Improved Code Reuse:** Pages like QA Queue, Surveys, Knowledge Base, and Workforce Roster consume these primitives instead of replicating custom state logic or styling templates.
