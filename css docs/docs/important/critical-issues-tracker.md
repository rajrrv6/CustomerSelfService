# Critical Issues Tracker
## CustomerSelfService Platform — Actionable Checklist

**Source Audit:** `enterprise-audit-report-2026-06-03.md`  
**Last Updated:** 2026-06-03T15:47:36+05:30  
**Purpose:** Long-term sprint tracking reference for all CRITICAL and HIGH PRIORITY issues identified during the enterprise audit.

> **How to use this tracker:**
> - Work through CRITICAL issues before any staging/production deployment
> - HIGH PRIORITY items must be resolved before full platform release
> - Check off items as they are resolved; include PR/commit reference in the notes column
> - Do not mark an item complete without a corresponding code verification pass

---

## Table of Contents

1. [Critical Issues (C1–C5)](#critical-issues-c1c5)
2. [High Priority Issues (H1–H9)](#high-priority-issues-h1h9)
3. [Resolution Status Summary](#resolution-status-summary)

---

## Critical Issues (C1–C5)

> These issues represent broken navigation, data integrity failures, and dead code. None of these require new features — they are bugs or gaps that actively break the application.

---

### C1 — Dead `/callback` Route

- [ ] **Status:** ❌ Open
- **Severity:** 🔴 CRITICAL
- **Found In:** `src/middleware.ts` L19 (`PUBLIC_PREFIXES` array) and `src/app/portal/public/page.tsx` (link card to `/callback`)
- **Problem:** The route `/callback` is listed in the middleware `PUBLIC_PREFIXES` array and is linked from the Guest Helpdesk Portal (`/portal/public`) as a callback request card. However, **no `/app/callback/` directory or `page.tsx` exists**. Any user clicking the callback card from the guest portal will receive a 404.
- **Evidence:** Middleware `PUBLIC_PREFIXES = ['/kb', '/bot', '/callback', '/portal/public']` at line 19. No `src/app/callback/` directory found in codebase.
- **Resolution Options:**
  - [ ] **Option A (Preferred):** Create `src/app/callback/page.tsx` with a guest callback request form using `CallbackRequestModal` logic
  - [ ] **Option B:** Remove `/callback` from `PUBLIC_PREFIXES` in `middleware.ts` and change the `/portal/public` card to link to `/portal/public` itself with an inline callback modal
- **Verification:** Load `/callback` in browser. Confirm it renders a page (not 404). Verify the link from `/portal/public` card navigates correctly.
- **Notes / PR:**

---

### C2 — `customer_notifications` Sidebar → Blank Screen

- [ ] **Status:** ❌ Open
- **Severity:** 🔴 CRITICAL
- **Found In:** `src/components/dashboard/Sidebar.tsx` L116 (sidebar item registered), `src/components/customer-portal/shared/CustomerPortalLayout.tsx` (no matching screen block)
- **Problem:** The customer sidebar includes `customer_notifications` as a navigation item (label: "Notifications", icon: Bell). When a customer clicks this, the `activeSubScreen` is set to `'customer_notifications'`, but **no `{activeSubScreen === 'customer_notifications' && ...}` block exists** in `CustomerPortalLayout.tsx`. The customer sees a blank content area with no error message.
- **Evidence:** `Sidebar.tsx` L116: `customer_notifications: { id: 'customer_notifications', label: isRtl ? 'التنبيهات' : 'Notifications', icon: <Bell ...> }`. No match in `CustomerPortalLayout.tsx`.
- **Resolution Options:**
  - [ ] **Option A (Preferred):** Build a basic notification/alert history screen for the customer portal (past callbacks, ticket updates, chat transcripts) and wire it as a new sub-screen
  - [ ] **Option B (Quick fix):** Remove `customer_notifications` from the customer sidebar order array in `Sidebar.tsx` until the screen is built
- **Verification:** Log in as `customer` role. Click "Notifications" in sidebar. Confirm content renders (Option A) or item is not visible (Option B).
- **Notes / PR:**

---

### C3 — Hardcoded Customer Identity in Ticket Creation

- [ ] **Status:** ❌ Open
- **Severity:** 🔴 CRITICAL
- **Found In:** `src/components/customer-portal/shared/CustomerPortalLayout.tsx` L186–192
- **Problem:** The `handleTicketSubmit` function hardcodes `customerName: 'David Miller'` and `customerEmail: 'david.miller@yahoo.com'` in the `createTicket()` call. Every ticket submitted by any customer — regardless of who is logged in — will be attributed to "David Miller". This is a data integrity failure.
- **Evidence:**
  ```tsx
  // CustomerPortalLayout.tsx L186–192
  createTicket({
    title: ticketTitle,
    description: ticketDesc,
    customerName: 'David Miller',        // ← HARDCODED
    customerEmail: 'david.miller@yahoo.com',  // ← HARDCODED
    priority: ticketPriority,
    status: 'open',
    category: ticketCategory
  });
  ```
- **Resolution:** Import `useAuth()` hook (already exists at `src/hooks/useAuth.ts`) and replace hardcoded values with `user.name` and `user.email` from the auth context.
  ```tsx
  const { user } = useAuth();
  createTicket({
    customerName: user?.name ?? 'Unknown Customer',
    customerEmail: user?.email ?? '',
    ...
  });
  ```
- **Additional:** Audit `addAuditLog` call at L198 which also hardcodes `'David Miller'` — replace with dynamic user name.
- **Verification:** Log in with a different customer account. Submit a ticket. Confirm the ticket shows the correct customer name.
- **Notes / PR:**

---

### C4 — 13 Voice Components Fully Orphaned (Dead Code)

- [ ] **Status:** ❌ Open
- **Severity:** 🔴 CRITICAL
- **Found In:** `src/components/voice/` (13 files)
- **Problem:** The following voice components exist in the codebase but are imported by **zero** routes, pages, or parent components. They are completely unreachable dead code:
  - `ActiveCallPanel.tsx` (7.6KB)
  - `CallControls.tsx` (4.4KB)
  - `CallDispositionModal.tsx` (5.0KB)
  - `CallHistory.tsx` (3.8KB)
  - `CallNotes.tsx` (1.6KB)
  - `CallQualityBadge.tsx` (1.7KB)
  - `CallTimeline.tsx` (1.0KB)
  - `DialPad.tsx` (4.7KB)
  - `IncomingCallModal.tsx` (6.9KB)
  - `SupervisorVoicePanel.tsx` (6.2KB)
  - `VoiceDialer.tsx` (11.1KB)
  - `VoiceQueuePanel.tsx` (5.5KB)
  - `VoicemailPanel.tsx` (5.2KB)
- **Resolution Options:**
  - [ ] **Option A:** Wire to agent workspace — create a Voice tab or voice sidebar item in the client admin area; import and render relevant components (VoiceDialer, ActiveCallPanel, VoiceQueuePanel) in the agent/supervisor view
  - [ ] **Option B:** Delete the entire `src/components/voice/` directory if the Voice IVR Designer (`/dialog-builder/`) already covers the client admin voice configuration scope
  - [ ] **Decision required from team before action**
- **Verification:** Grep all files for `from '../voice/'` or `from '@/components/voice/'` — should return > 0 results after wiring (Option A) or 0 files after deletion (Option B).
- **Notes / PR:**

---

### C5 — `ConversationTimeline.tsx` — Empty Component

- [ ] **Status:** ❌ Open
- **Severity:** 🔴 CRITICAL
- **Found In:** `src/components/agent-workspace/ConversationTimeline.tsx` (588 bytes)
- **Problem:** `ConversationTimeline.tsx` is a 588-byte file that is effectively an empty div wrapper. It is imported (or expected to be used) within the agent workspace, but renders no actual timeline content. Any surface area relying on this component shows blank output.
- **Evidence:** File size of 588 bytes for a component named "Conversation Timeline" indicates shell/stub level implementation.
- **Resolution Options:**
  - [ ] **Option A:** Implement the conversation timeline — show a chronological list of events (agent joins, status changes, channel switches, notes) with timestamps
  - [ ] **Option B:** If the timeline is displayed within `ConversationPanel.tsx` directly, verify that `ConversationTimeline.tsx` is not actually imported and delete the dead file
- **Verification:** Open an active conversation in the Agent Workspace. Verify a timeline of conversation events renders correctly.
- **Notes / PR:**

---

## High Priority Issues (H1–H9)

> These issues block full platform release and represent gaps in PDF scope coverage, architecture quality, or significant UX failures.

---

### H1 — Order Lookup Page Missing (Screen 126)

- [ ] **Status:** ❌ Open
- **Severity:** 🟠 HIGH
- **Screen ID:** 126 (End User · Customer Portal · Order Lookup · Page)
- **PDF Description:** "Lookup + status" — standalone page for order status lookup
- **Problem:** No standalone Order Lookup page exists in the customer portal. The `RefundWizard.tsx` references an order number inline (hardcoded `'ORD-99881'`) but there is no browsable order status page where a customer can look up any order by ID.
- **Resolution:** Create `src/components/customer-portal/orders/OrderLookup.tsx` with:
  - Order ID input field
  - OTP-gated lookup (reuse `OtpAuth.tsx` pattern)
  - Order status timeline (status: Processing → Shipped → Delivered)
  - Order line items display
  - "Initiate Return/Refund" CTA linking to `RefundWizard`
  - Wire as `customer_order_lookup` sub-screen in `CustomerPortalLayout.tsx`
  - Add to sidebar or home page card grid
- **Verification:** Navigate to Order Lookup in portal. Enter order ID. Confirm order status renders. Confirm CTA links to refund wizard.
- **Notes / PR:**

---

### H2 — `SlaAnalytics.tsx` — God Component (1,774 lines / 86KB)

- [ ] **Status:** ❌ Open
- **Severity:** 🟠 HIGH
- **Found In:** `src/components/analytics/SlaAnalytics.tsx`
- **Problem:** A single 1,774-line, 86KB file violating AGENTS.md Section 4. Extremely slow to compile in development. Impossible to test individual sections. Contains: local dictionaries, breach case data, incident timeline data, leaderboard data, multiple chart tabs, 7+ distinct UI sections.
- **Resolution:** Split into focused sub-components:
  - [ ] `SlaBreachMonitor.tsx` — real-time SLA breach table
  - [ ] `SlaQueueHealth.tsx` — queue health panel
  - [ ] `SlaTrendCharts.tsx` — trend analytics chart tabs
  - [ ] `SlaIncidentTimeline.tsx` — incident feed
  - [ ] `SlaLeaderboard.tsx` — agent leaderboard
  - [ ] `SlaAIInsights.tsx` — AI workforce recommendations
  - [ ] `SlaAnalytics.tsx` — slim orchestrator importing the above
- **Verification:** `npm run build` completes without timeout. `npm run typecheck` passes. All SLA dashboard sections render identically to pre-refactor.
- **Notes / PR:**

---

### H3 — Integration Components Partially Orphaned

- [ ] **Status:** ❌ Open
- **Severity:** 🟠 HIGH
- **Found In:** `src/components/integrations/` (12 files)
- **Problem:** The following integration components are built but not rendered in any route or navigation:
  - `IntegrationsDashboard.tsx` (11.9KB)
  - `EventLogTable.tsx` (8.2KB)
  - `MarketplaceGrid.tsx` (6.9KB)
  - `RetryQueuePanel.tsx` (7.3KB)
  - `ConflictResolutionDrawer.tsx` (10.7KB)
  - `ApiCredentialVault.tsx` (16.1KB)
  - `SyncTimeline.tsx` (5.9KB)
- **Resolution:** Audit which files the client admin `integrations` sidebar screen renders. Wire all unrendered components into the `IntegrationsView` or appropriate sub-tabs. Components that are clearly superseded (e.g., by `WebhookConsole.tsx`) should be removed.
- **Verification:** Navigate to Integrations in client admin sidebar. Confirm all 12 integration component surfaces are reachable.
- **Notes / PR:**

---

### H4 — Module Popups System Entirely Absent (Screens 147–157)

- [ ] **Status:** ❌ Open
- **Severity:** 🟠 HIGH
- **Screens:** 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157
- **Problem:** All 11 operational event-driven popups are absent. These fire in response to real-time platform events and are critical for operational realism:
  - Bot Publish Safety Check confirmation
  - Knowledge Ingest Failed modal
  - PII Detected — Redacted toast
  - Jailbreak Attempt Logged toast
  - Handoff Queued intermediate
  - Co-pilot Consent Prompt modal
  - Transcript Privacy Notice toast
  - Recording Disclosure toast
  - Channel Verification (Meta/WABA) page
  - WhatsApp Template Rejected modal
  - Voice Number Porting page
- **Resolution:** Leverage the existing **Notification System** (`notificationStore`, `notificationEvents.ts`, `ToastProvider`). Define event types for each popup and wire them to the appropriate triggers. Most popups (toasts) can reuse the existing toast infrastructure; modals need new modal components.
- **Verification:** Trigger each event type (e.g., publish a bot, simulate a PII event). Confirm the corresponding popup/toast appears.
- **Notes / PR:**

---

### H5 — WFM Module Entirely Absent (Screens 92–93)

- [ ] **Status:** ❌ Open
- **Severity:** 🟠 HIGH
- **Screens:** 92 (Forecast & Schedule), 93 (Shrinkage & Adherence)
- **Problem:** No Workforce Management module exists anywhere in the codebase. There is a `workforce` sidebar item that routes to a screen, but no WFM components or data.
- **Resolution:** Build:
  - [ ] `WorkforceForecast.tsx` — volume forecasting chart, shift recommendations, schedule builder calendar
  - [ ] `ShrinkageAdherence.tsx` — real-time adherence table, shrinkage breakdown by category (breaks, training, sick), forecast vs. actual
  - Seed data: Reuse `workforceMetricsSeed.ts` (2.7KB, already exists)
- **Verification:** Navigate to Workforce Planning in client admin sidebar. Confirm forecast chart and adherence table render with realistic seed data.
- **Notes / PR:**

---

### H6 — Escalation Matrix Not Implemented (Screen 83)

- [ ] **Status:** ❌ Open
- **Severity:** 🟠 HIGH
- **Screen:** 83 (Client Admin · Tickets · Escalation Matrix · Page)
- **PDF Description:** "Auto-escalation" — rule builder for automatic ticket escalation
- **Problem:** No escalation matrix, rule builder, or auto-escalation configuration screen exists anywhere in the codebase.
- **Resolution:** Build `EscalationMatrix.tsx` within `client-admin/operations/`:
  - Escalation rule table (trigger condition → target → action)
  - Create/edit rule drawer
  - Conditions: SLA breach time, priority level, ticket tag, channel
  - Actions: Assign to supervisor, notify email, create urgent ticket
  - Enable/disable toggle per rule
- **Verification:** Navigate to Escalation Matrix in client admin. Create a rule. Confirm it appears in the table and can be toggled.
- **Notes / PR:**

---

### H7 — QA Scorecard Builder & Dispute Modal Missing (Screens 88, 90)

- [ ] **Status:** ❌ Open
- **Severity:** 🟠 HIGH
- **Screens:** 88 (QA Scorecard Builder), 90 (QA Dispute / Appeal)
- **Problem:** `QAManagerView.tsx` implements the QA Review Queue (Screen 89) and Coaching Plan (Screen 91) well, but the QA Scorecard Builder and Dispute/Appeal Modal are absent.
- **Resolution:**
  - [ ] **Screen 88 — Scorecard Builder:** Build a criteria editor within `QAManagerView.tsx` or as a new tab. Criteria: dimension name, weight (%), scoring type (binary/scale). CRUD for scorecard templates.
  - [ ] **Screen 90 — Dispute / Appeal Modal:** Add a dispute modal that an agent can trigger from their QA score review. Fields: reason for dispute, evidence text, supporting screenshot upload. Notify QA manager action.
- **Verification:** Open QA Workspace. Access Scorecard Builder tab. Create a scorecard. Open a reviewed conversation and trigger dispute modal. Confirm modal renders with form fields.
- **Notes / PR:**

---

### H8 — `VoiceCallModal.tsx` Is a Stub (Screen 120)

- [ ] **Status:** ❌ Open
- **Severity:** 🟠 HIGH
- **Found In:** `src/components/customer-portal/callbacks/VoiceCallModal.tsx` (1.3KB)
- **Screen:** 120 (End User · Customer Portal · Voice Call Request · Modal)
- **Problem:** The Voice Call Request Modal is triggered from a prominent bottom-left FAB button (`Volume2` icon) in the customer portal. However `VoiceCallModal.tsx` at 1.3KB is a minimal stub with no real form or request flow.
- **Resolution:** Expand `VoiceCallModal.tsx` to include:
  - Phone number input with format validation
  - Best time to call selector
  - Reason for call dropdown (Technical Support, Billing, Account Access, Other)
  - Bilingual labels (EN/AR)
  - Submit handler with toast confirmation and `addAuditLog` entry
  - Loading state and success confirmation
- **Verification:** Click the Voice Hotline FAB in the customer portal. Confirm the modal opens with form fields. Submit the form. Confirm toast confirmation appears.
- **Notes / PR:**

---

### H9 — Knowledge Source Add Modals Missing (Screens 44–47)

- [ ] **Status:** ❌ Open
- **Severity:** 🟠 HIGH
- **Screens:** 44 (File Upload), 45 (URL Crawl), 46 (Connector), 47 (DB/SQL)
- **Problem:** The Knowledge Base admin tab (`KnowledgeBaseTab.tsx`) shows a sources list but has no mechanism to add a new source. The four source type modals specified in the PDF do not exist anywhere in the codebase.
- **Resolution:**
  - [ ] Add "Add Source" button to `KnowledgeBaseTab.tsx` that opens a source type selector
  - [ ] Build `SourceFileUploadModal.tsx` — drag/drop PDF/DOCX/MD, file name display, upload progress simulation
  - [ ] Build `SourceUrlCrawlModal.tsx` — URL/sitemap input, crawl depth selector, domain scope
  - [ ] Build `SourceConnectorModal.tsx` — Notion/Confluence/Google Drive OAuth connection cards
  - [ ] Build `SourceDbModal.tsx` — connection string, table/query selector, schedule frequency
- **Verification:** Open Knowledge Base admin tab. Click "Add Source". Verify type selector appears. Open each modal type. Confirm form fields match PDF specification.
- **Notes / PR:**

---

## Resolution Status Summary

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| C1 | Dead `/callback` route | 🔴 Critical | ❌ Open |
| C2 | `customer_notifications` → blank screen | 🔴 Critical | ❌ Open |
| C3 | Hardcoded customer identity in tickets | 🔴 Critical | ❌ Open |
| C4 | 13 voice components orphaned | 🔴 Critical | ❌ Open |
| C5 | `ConversationTimeline.tsx` empty component | 🔴 Critical | ❌ Open |
| H1 | Order Lookup page missing (Screen 126) | 🟠 High | ❌ Open |
| H2 | `SlaAnalytics.tsx` God component (86KB) | 🟠 High | ❌ Open |
| H3 | Integration components partially orphaned | 🟠 High | ❌ Open |
| H4 | Module Popups system absent (11 screens) | 🟠 High | ❌ Open |
| H5 | WFM module absent (Screens 92–93) | 🟠 High | ❌ Open |
| H6 | Escalation Matrix not implemented | 🟠 High | ❌ Open |
| H7 | QA Scorecard & Dispute missing | 🟠 High | ❌ Open |
| H8 | `VoiceCallModal.tsx` stub (1.3KB) | 🟠 High | ❌ Open |
| H9 | Knowledge Source modals absent | 🟠 High | ❌ Open |

**Critical Issues Resolved:** 0 / 5  
**High Priority Issues Resolved:** 0 / 9  
**Total Open Blockers:** 14

---

*Source: Enterprise Audit Report — 2026-06-03*  
*Update this file after each sprint resolution pass.*
