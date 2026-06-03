# Sprint 05 — Production Polish Plan
## CustomerSelfService Platform — Sprint Plans

**Execution Window:** Sprint 05 (2 Weeks)  
**Last Updated:** 2026-06-03T16:50:54+05:30  
**Priority:** 🔵 PRODUCTION READY POLISH & COMPLIANCE  
**Risk Level:** Medium (Adding WFM charts, QA forms, and global alerts)  
**Complexity Estimate:** High (25 Story Points / 10 Person-Days)  

---

## 1. Sprint Goal

Deliver final operational compliance features (WFM forecast charting, QA criteria builder, dispute appeals) and wire all 11 system event-driven popup modals and toasts to satisfy full enterprise auditing criteria and complete product-readiness checklists.

---

## 2. Scope & Target Areas

This sprint targets workforce scheduling tools, quality control dashboards, and toast triggers across the following areas:
* `/frontend/src/components/client-admin/wfm/` (NEW calendar and adherence dashboards)
* `/frontend/src/components/client-admin/qa/` (Scorecard builder panel, dispute response list)
* `/frontend/src/components/agent-workspace/` (QA dispute appeal button, hold/call timer bindings)
* `/frontend/src/stores/notifications/` and global popups container

---

## 3. Implementation Tasks

### Task 1: Build Workforce Management (WFM) Forecasting & Adherence (H5 / Screens 92–93)
* **Goal:** Provide volume forecasts, shift planners, and real-time adherence lists.
* **Implementation:** Create:
  - `WorkforceForecast.tsx` — Bar/Line chart mapping incoming call volumes vs. active agent schedules, plus hourly shift planning tables.
  - `ShrinkageAdherence.tsx` — Grid list displaying agent active status (In-Call, Idle, Auxiliary breaks) vs. scheduled rosters, mapping shrinkage categorizations.
* **Affected Modules:** Admin Operations
* **Complexity:** 7 SP (3 Days)

### Task 2: Build QA Scorecard Builder & Agent Dispute appeal (H7 / Screens 88, 90)
* **Goal:** Complete quality assurance scoring standards and dispute workflows.
* **Implementation:**
  - Create `ScorecardBuilder.tsx` in `client-admin/qa/` allowing managers to define scorecard criteria (accuracy, tone, policy compliance) and weight percentages.
  - Create `DisputeAppealModal.tsx` triggering from the agent's QA scorecard details, letting agents write appeal reasons and reference ticket numbers, which populate a review log in the QA Manager dashboard.
* **Affected Modules:** QA Workspace, Agent Inbox
* **Complexity:** 6 SP (2.5 Days)

### Task 3: Wire Event-Driven Module Popups (H4 / Screens 147–157)
* **Goal:** Connect 11 critical system-event popups and toasts to dynamic triggers.
* **Implementation:** Expand `ToastProvider` and alert overlays to support:
  1. Bot Publish Safety check confirmations (modal before publish execution)
  2. Knowledge Ingest Failed alert (banner notification)
  3. PII Detected redact notice (inline warning and redacting style)
  4. Jailbreak Attempt Logged toast (supervisor security dashboard notification)
  5. Handoff Queued intermediate loading state (customer portal chat screen)
  6. Co-pilot Consent prompt (agent layout dialogue card)
  7. Transcript Privacy notice (chat start toast)
  8. Recording Disclosure prompt (call start toast)
  9. Channel Verification status (admin WhatsApp settings grid)
  10. WhatsApp Template Rejected panel (template designer grid)
  11. Voice Number Porting logs (admin settings tables)
* **Affected Modules:** Global Notifications, Alert Overlays
* **Complexity:** 7 SP (3 Days)

### Task 4: Upgrade Agent Call Controls & Timers (M2)
* **Goal:** Bind active counters and participant logs inside Agent Workspace.
* **Implementation:** Update `ActiveCallPanel.tsx` and `ConferenceModal.tsx` with ticking timers (e.g. `HH:MM:SS` duration on Hold) and mock lists dynamically appending external transfer participants.
* **Affected Modules:** Agent Workspace Voice controls
* **Complexity:** 3 SP (1 Day)

---

## 4. Dependencies

* **Task 1** consumes `workforceMetricsSeed.ts` records for historical volume metrics.
* **Task 2** relies on the QA grading system to populate disputes inside `QAManagerView.tsx`.
* **Task 3** integrates directly with `notificationStore` status events.

---

## 5. Expected Outcomes

* Managers can run WFM forecasting models and schedule shift allocations.
* Agents can review QA scorecards and submit official dispute appeals.
* Global system triggers (PII redactions, safety prompts) render clear and interactive elements.
* Core calling options display realistic timing and participant counts.

---

## 6. Verification Requirements

- [ ] Navigate to Client Admin -> Workforce. Confirm call forecasting charts render, and schedule planner loads without freezing.
- [ ] Open QA dashboard. Click "Create Template", define criteria weights, and save. Open a conversation transcript as an agent, click "Dispute QA Score", fill out details, and confirm the appeal appears in the QA Manager's action list.
- [ ] Simulate a jailbreak attempt in the portal chat. Confirm the supervisor dashboard immediately raises a security toast.
- [ ] Initiate a callback or call stub in the agent console. Turn on "Hold" and verify the hold timer ticker counts up in seconds.
