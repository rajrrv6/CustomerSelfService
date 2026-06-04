# Sprint 09 Phase 06 Walkthrough: Persistence & UX Realism

This document outlines the state persistence upgrades and visual customizations implemented in Sprint 09 Phase 06.

---

## 1. Upgrade Summary

This phase upgrades the Client Admin domain from stateless transient mock dashboards into persistent, high-density, localized workspaces. All configs save locally to the browser's storage and reload dynamically.

* **Zustand Persistence store**: Unified [clientAdminPersistenceStore.ts](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/stores/clientAdminPersistenceStore.ts) is wired to local storage.
* **Branding Theme Injection**: Settings page color changes update the layout accents instantly.
* **Client-Side CSV Exporters**: Dynamic reports compile logs and download spreadsheets without contacting server APIs.
* **Translation Parity**: Fully synchronized Arabic/English terms for all persistence elements, paging controls, and warning popups.

---

## 2. Interactive Features Walkthrough

### A. Campaigns Workspace
* **Simulated Rolling Rates**: When campaigns are "Running", a client interval loop updates sent messages, delivery numbers, and open rates.
* **Search & Filters**: Users can query campaigns by name or filter by status tabs.
* **Pagination**: Interactive page controllers display localized indices like `Showing 1 - 5 of 6`.

### B. Voice & IVR Workspace
* **Telephony Simulator**: Allows operators to trigger simulated inbound VoIP trunk calls, tracing steps like DTMF keypress actions.
* **Replay Last Call**: Saves the last simulation execution trace and allows one-click re-runs to debug pathways.
* **SIP Logs search**: Installs a query filter over active SIP telecommunication logs.

### C. Reports Workspace
* **CSV Compiler**: "Export & Download" compiles actual tables (CSAT performance, LLM token spending, SLA margins) and triggers browser downloads.
* **Auto-Report Schedules**: Users can schedule reports (Daily, Weekly, Monthly) and delete scheduled tasks.

### D. Settings & Branding skin
* **Live Accent Injections**: Modifying the color picker changes the `--primary-accent` style property, immediately recoloring boundaries, hover highlights, and badges.
* **Unsaved Changes Shield**: Form edits trigger warning modals if reset actions are taken before clicking "Save Settings".

---

## 3. Step-by-Step Verification Guide

1. Navigate to **Client Settings**.
2. Select a different HSL Primary Accent color (e.g. Emerald Green `#10b981`) and click **Save Settings**.
3. Verify that borders and button skins update instantly to match the chosen color.
4. Reload the browser page; confirm settings and chosen color remain saved.
5. In **Reports**, click **Export & Download** on the CSAT or SLA card.
6. Verify a spreadsheet file is downloaded containing formatted row logs.
7. Click the English/Arabic toggle at the top of the app; confirm pagination labels translate accurately.
