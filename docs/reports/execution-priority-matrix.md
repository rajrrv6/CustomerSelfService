# Execution Priority & ROI Matrix
## CustomerSelfService Platform — Sprint Planning Reports

**Last Updated:** 2026-06-03T16:50:54+05:30  
**Evaluator:** Senior Enterprise Frontend Architect (Antigravity)  

---

## 1. ROI Quadrant Map

This matrix categorizes all remaining implementation, refactoring, and quality control tasks by business value (ROI) vs. implementation complexity (effort).

```
                            HIGH IMPACT (ROI)
             ┌───────────────────────────────┬───────────────────────────────┐
             │  * Order Lookup Page (H1)     │  * Knowledge Source (H9)      │
             │  * Voice Call Form (H8)       │  * WFM Dashboard (H5)         │
             │  * Ticket Client Identity (C3)│  * Split SLA Monolith (H2)    │
             │  * Error Boundaries (M8)      │  * Split Portal Layout (M11)  │
             │  * Fix Callback Route (C1)    │  * Split AppContext (M9)      │
  LOW EFFORT ├───────────────────────────────┼───────────────────────────────┤ HIGH EFFORT
             │  * Hide Notification (C2)     │  * Voice IVR wiring (C4)      │
             │  * Tailwind Palette (M7)      │  * QA Scorecard & Dispute (H7)│
             │  * Update README (M10)        │  * Integration Panels (H3)    │
             │  * Chat Lang Selector (M3)    │  * Escalation Matrix (H6)     │
             │                               │  * Module Toast Alerts (H4)   │
             └───────────────────────────────┴───────────────────────────────┘
                            LOW IMPACT (ROI)
```

---

## 2. Quadrant Breakdown & Task Specifications

### A. Quadrant 1: High ROI / Low Effort (Quick Wins)
*Focus: Resolve immediately to unblock testing and clean the user flows.*

* **Task C1 — Dead Callback Route:**
  - *Priority:* 🔴 Critical Blocker
  - *Effort:* 0.5 Day (Low)
  - *Target:* `src/app/callback/page.tsx`
  - *Outcome:* Prevents 404 navigation crashes on guest portals.
* **Task C3 — Hardcoded Customer Identity in Tickets:**
  - *Priority:* 🔴 Critical Blocker
  - *Effort:* 1 hour (Low)
  - *Target:* `CustomerPortalLayout.tsx` L186-192
  - *Outcome:* Restores basic authentication data-binding for tickets.
* **Task H8 — Voice Call Request Modal Stub Expansion:**
  - *Priority:* 🟠 High Priority Gap
  - *Effort:* 0.5 Day (Low)
  - *Target:* `VoiceCallModal.tsx`
  - *Outcome:* Makes the prominent Bottom-Left FAB button interactive.
* **Task M8 — Introduce React Error Boundaries:**
  - *Priority:* 🟡 Tech Debt
  - *Effort:* 0.5 Day (Low)
  - *Target:* Router configuration
  - *Outcome:* Insulates layouts against total page crashes.

---

### B. Quadrant 2: High ROI / High Effort (Strategic Foundations)
*Focus: Foundation tasks that must be planned carefully; require refactoring or complex chart integration.*

* **Task H1 — Order Lookup Standalone Page:**
  - *Priority:* 🟠 High Priority Gap
  - *Effort:* 2 Days (Medium-High)
  - *Target:* `/portal/orders`
  - *Outcome:* Full tracking timeline compliant with Screen 126.
* **Task H9 — Knowledge Source Ingestion Modals:**
  - *Priority:* 🟠 High Priority Gap
  - *Effort:* 3 Days (High)
  - *Target:* `KnowledgeBaseTab.tsx`
  - *Outcome:* Complete ingestion configurations (PDF, URL, Notion, DB).
* **Task H2 — Decompose SlaAnalytics.tsx Monolith (86KB):**
  - *Priority:* 🟡 Tech Debt
  - *Effort:* 2 Days (High)
  - *Target:* `SlaAnalytics.tsx`
  - *Outcome:* Improves hot-reload times and component testability.
* **Task M9 — Refactor AppContext.tsx Monolith:**
  - *Priority:* 🟡 Tech Debt
  - *Effort:* 2 Days (High)
  - *Target:* `AppContext.tsx`
  - *Outcome:* Prevents global re-renders on minor context changes.

---

### C. Quadrant 3: Low ROI / Low Effort (Polish & Housekeeping)
*Focus: Minor visual style updates or simple settings panels.*

* **Task C2 — Customer Notifications Sidebar Link:**
  - *Priority:* 🔴 Critical Blocker (Due to visual blank output)
  - *Effort:* 0.5 Day (Low)
  - *Target:* `Sidebar.tsx`
  - *Outcome:* Temporary removal or visual empty state banner.
* **Task M7 — Standardize Tailwind Color Classes:**
  - *Priority:* 🟢 Polish
  - *Effort:* 0.5 Day (Low)
  - *Target:* Global styles
  - *Outcome:* Sanitation of invalid tailwind classes.
* **Task M3 — Multilingual Live Chat Switcher:**
  - *Priority:* 🟢 Polish
  - *Effort:* 1 Day (Medium-Low)
  - *Target:* `LiveChatOverlay.tsx`
  - *Outcome:* Adds inline Arabic/English toggle inside floating chat.

---

### D. Quadrant 4: Low ROI / High Effort (Advanced Operations / Optional)
*Focus: Specialized admin features or large-scale integrations.*

* **Task H5 — Workforce Management (WFM) Planning Dashboards:**
  - *Priority:* 🟠 High Priority Gap
  - *Effort:* 4 Days (High)
  - *Target:* `/client-admin/wfm`
  - *Outcome:* Full calendar and shrinkage screens (Screens 92-93).
* **Task H7 — QA Scorecard Criteria Builder & disputes:**
  - *Priority:* 🟠 High Priority Gap
  - *Effort:* 3 Days (High)
  - *Target:* `QAManagerView.tsx`
  - *Outcome:* Complete QA template CRUD and dispute submission logs.
* **Task C4 — Wire 13 Orphaned Voice Components:**
  - *Priority:* 🟡 Tech Debt
  - *Effort:* 2 Days (High)
  - *Target:* `src/components/voice/`
  - *Outcome:* Re-integration of dormant voice dialers into active routes.

---

## 3. Recommended Sequencing (ROI-Driven)

1. **Sprint 01 (Quick Wins & Blockers):** Tackle C1, C3, C5, M8, M7. Establish baseline.
2. **Sprint 02 (Customer-Facing ROI):** Build H1 (Order lookup), H8 (Voice request form), M1 (URL parameter deep-linking).
3. **Sprint 03 (Admin-Facing ROI):** Build H9 (Ingestion modals), H6 (Escalation matrix rules), M4 (SLA CRUD actions).
4. **Sprint 04 (Architectural Payback):** Refactor monolithic files (H2, M11, M9) to avoid build bottlenecks.
5. **Sprint 05 (Final Compliance Polish):** Build H5 (WFM tables), H7 (QA scorecard builders), H4 (Module alerts system).
