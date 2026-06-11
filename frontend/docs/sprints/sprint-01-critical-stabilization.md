# Sprint 01 — Critical Stabilization Plan
## CustomerSelfService Platform — Sprint Plans

**Execution Window:** Sprint 01 (1 Week)  
**Last Updated:** 2026-06-03T16:50:54+05:30  
**Priority:** 🔴 CRITICAL BLOCKERS  
**Risk Level:** Low (Fixes/stabilization focus)  
**Complexity Estimate:** Medium (12 Story Points / 5 Person-Days)  

---

## 1. Sprint Goal

Establish baseline routing, navigation, and data integrity stability for the Customer Portal and Agent Workspace, eliminating all confirmed production blockers (C1–C5) and preparing the codebase for release candidate gating.

---

## 2. Scope & Target Areas

This sprint targets navigation routes, context bindings, and layout interfaces across the following files:
* `/frontend/src/middleware.ts`
* `/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx`
* `/frontend/src/components/dashboard/Sidebar.tsx`
* `/frontend/src/components/agent-workspace/ConversationTimeline.tsx`
* `/frontend/src/app/` router prefixes

---

## 3. Implementation Tasks

### Task 1: Resolve Dead `/callback` Route (C1)
* **Goal:** Create a fallback page to handle callback navigations from the guest helpdesk portal without triggering 404.
* **Implementation:** Create `src/app/callback/page.tsx` rendering a basic callback form linked to the `CallbackRequestModal` component triggers.
* **Affected Modules:** App Router, Guest Portal (`/portal/public`)
* **Complexity:** 2 SP (1 Day)

### Task 2: Resolve Silent `customer_notifications` Link (C2)
* **Goal:** Avoid blank content area when the customer clicks notifications.
* **Implementation:** Add a visual fallback panel inside `CustomerPortalLayout.tsx` indicating "No notifications at this time" or temporarily remove the item from the sidebar order array inside `Sidebar.tsx`.
* **Affected Modules:** Customer Sidebar, Portal layout
* **Complexity:** 1 SP (0.5 Day)

### Task 3: Secure Dynamic Ticket Identity (C3)
* **Goal:** Eliminate hardcoded customer names during ticket creations.
* **Implementation:** Replace `'David Miller'` and `david.miller@yahoo.com` in ticket submission payloads and audit logs with user attributes extracted from `useAuth()`.
* **Affected Modules:** `CustomerPortalLayout.tsx`
* **Complexity:** 2 SP (0.5 Day)

### Task 4: Restore Conversation Timeline Events Layout (C5)
* **Goal:** Resolve blank timelines in the agent support desk.
* **Implementation:** Populate [ConversationTimeline.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/components/agent-workspace/ConversationTimeline.tsx) with list structures rendering system events (agent joins, transfers, channel updates).
* **Affected Modules:** Agent Workspace Inbox
* **Complexity:** 3 SP (1.5 Days)

### Task 5: Sanitize Tailwind Color Classes (M7)
* **Goal:** Fix elements with unrendered colors.
* **Implementation:** Replace invalid classes like `slate-850`, `emerald-650` with standard Tailwind colors (`slate-800`/`emerald-600`).
* **Affected Modules:** Global CSS
* **Complexity:** 2 SP (1 Day)

---

## 4. Dependencies

* **C3** depends on `AuthContext` to fetch session details dynamically.
* **C5** requires the `conversationsSeed` events timeline array to fetch mock event timestamps.

---

## 5. Expected Outcomes & Production Impact

* **Outcome:** Clean compiler typechecks and zero broken links in guest paths.
* **Production Impact:** Eliminates immediate customer-facing crash bugs. Secure data-binding is enabled.

---

## 6. Verification Requirements & Checklist

- [ ] Load `/portal/public` and click the "Request Callback" card. Confirm navigation resolves to a page (not a 404).
- [ ] Log in with a client account. Submit a new ticket. Verify the ticket is created under the active user's credentials (not David Miller).
- [ ] Open the agent dashboard. Select an active conversation. Verify that internal notes and transfer logs render in the timeline.
- [ ] Execute `npm run typecheck` and `npm run build` to confirm compilation matches zero warnings.
