# Remaining Work Summary
## CustomerSelfService Platform — Sprint Planning Reports

**Last Updated:** 2026-06-03T16:50:54+05:30  
**Status:** Planning Phase Completed  
**Compiler:** Senior Technical Program Manager (Antigravity)  

---

## 1. Executive Summary

This report aggregates all verified functional gaps, structural issues, and technical debt remaining on the CustomerSelfService platform. The total estimated implementation weight across all modules is **136 Story Points (approximately 57 Person-Days)**. By executing the phased roadmap, the repository will achieve 100% compliance with the `03_CustomerSelfService` and `Common_Per_App` PDF specifications and reach production release readiness.

---

## 2. Work Categorization (9 Pillars)

### Pillar 1: Critical Blockers (C1–C5)
*Focus: Severe bugs breaking navigation or data integrity.*
* **C1: Dead `/callback` Route:** No folder/file exists for this route. Navigate to callback request modal form within a new `app/callback/page.tsx`. (Sprint 1)
* **C2: customer_notifications Sidebar Link:** Clicks lead to blank main panels. Create fallback template inside layout. (Sprint 1)
* **C3: Hardcoded Customer Identity in Tickets:** Submitted tickets hardcode `'David Miller'`. Replace with metadata from `useAuth()`. (Sprint 1)
* **C5: ConversationTimeline event logs:** Agent view shows an empty div container. Add mock event render logic. (Sprint 1)

---

### Pillar 2: Production Gaps
*Focus: Large functional systems missing from the admin operational scope.*
* **H5: Workforce Management (WFM) Forecasting (Screen 92-93):** Shift planners and shrinkage grids are missing. Create calendar dashboards consuming workforce seeds. (Sprint 5)
* **H7: QA Scorecard Builder & disputes (Screen 88, 90):** Criteria builders and dispute appeal modals are absent. Build interactive forms. (Sprint 5)
* **H6: Escalation Matrix rules engine (Screen 83):** Rule definitions for automatic supervisor transfers are missing. Create condition config grid. (Sprint 3)

---

### Pillar 3: Customer Portal Completion
*Focus: End-user screen scope completion.*
* **H1: Order Lookup Standalone Page (Screen 126):** Standalone page for OTP verification and shipping timelines. (Sprint 2)
* **H8: Voice Call FAB modal stub (Screen 120):** Upgrade 1.3KB placeholder to capture phone, callback slots, and submit actions. (Sprint 2)
* **Screen 118 callback queue routing:** Navigate automatically to `CallbackQueueCard` upon callback submission. (Sprint 2)

---

### Pillar 4: Admin/Workspace Completion
*Focus: Key controls and configurations in the agent workspace or admin dashboard.*
* **H9: Knowledge Source Ingestion Modals (Screen 44-47):** Modals configuring source types (file upload, url crawler, database connectors) for the KB admin tab. (Sprint 3)
* **H3: Unwired Integration Dashboard Components:** api credential vaults, retry panels, sync logs must be linked to active tabs. (Sprint 3)

---

### Pillar 5: Analytics Improvements
*Focus: SLA indicators and charts.*
* **M4: SLA Policy CRUD definitions:** Grid rules must link to dynamic Create, Edit, and Delete actions. (Sprint 3)
* **WFM Shrinkage and forecast charts:** Visual tracking lines mapping forecast vs actual volume. (Sprint 5)

---

### Pillar 6: Architecture Stabilization
*Focus: Refactoring massive files and adding error protections.*
* **H2: SlaAnalytics.tsx Monolith (86KB):** Split the 1,774-line component into isolated, unit-testable sub-charts. (Sprint 4)
* **M11: CustomerPortalLayout.tsx Monolith (714 lines):** Extract distinct customer sub-screen views. (Sprint 4)
* **M9: AppContext.tsx State Monolith:** Split global state context into modular domain-specific context hooks. (Sprint 4)
* **M8: React Error Boundaries:** Add routing safety boundaries to prevent total page crashes. (Sprint 4)

---

### Pillar 7: Technical Debt
*Focus: Dormant code organization and build health.*
* **C4: Dormant voice components (13 files):** PURGE files or wire them into active agent workspace tabs after team reviews. (Sprint 3)
* **M10: README Updates:** Update starter files with details on architecture structures. (Sprint 4)
* **package.json Package name:** Standardize package metadata from `"temp-app"` to `"customer-self-service-portal"`. (Sprint 1)

---

### Pillar 8: UX / Polish Improvements
*Focus: Navigations, deep-links, and translation togglers.*
* **M1: Customer Portal URL Search Parameter Routing:** Support parameter parsing (`?view=...`) on mount to deep-link support ticket screens. (Sprint 2)
* **M3: Multilingual Live Chat Switcher (Screen 129):** Globe switch icon in chat header to toggle languages inline. (Sprint 2)
* **M2: Conference and Hold timers:** Ticking duration counters inside agent call dials. (Sprint 5)

---

### Pillar 9: Optional Enhancements (L1–L7)
*Focus: Non-blocking items for future releases.*
* **L6/L7: E2E Playwright tests:** Automated verification scripts checking complete paths.
* **L3: Super Admin configs:** Promoted to active development scope under Sprint 6 and Sprint 7! (Platform dashboard HUD, provisioning wizards, DID pools, connectors, AI defaults, compliance audits, gateway settings).
* **L4: Mock API Service layer:** Move local states to fetch libraries.

---

## 3. Total Effort Summary

| Sprint | Goal / Focus | Story Points | Est. Duration |
|---|---|---|---|
| **Sprint 1** | Critical Stabilization | 12 SP | 1 Week |
| **Sprint 2** | Customer Portal | 18 SP | 1.5 Weeks |
| **Sprint 3** | Admin & Workspace | 22 SP | 2 Weeks |
| **Sprint 4** | Architecture Hardening | 20 SP | 1.5 Weeks |
| **Sprint 5** | Production Polish | 25 SP | 2 Weeks |
| **Sprint 6** | Super Admin Core Provisioning | 23 SP | 2 Weeks |
| **Sprint 7** | Super Admin Enterprise Operations | 16 SP | 2 Weeks |
| **Total** | **All Sprints** | **136 SP** | **12 Weeks** |
