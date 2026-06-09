# Sprint 10A Plan — Guest Layer Completion & Guest-to-Customer Transition Continuity
## CustomerSelfService Platform — Sprint Plans

**Execution Window:** Sprint 10A (1.5 Weeks)  
**Last Updated:** 2026-06-09T12:25:00+05:30  
**Priority:** 🟠 HIGH PRIORITY IMPLEMENTATION GAPS  
**Risk Level:** Medium (UI routing and state sync)  
**Complexity Estimate:** Medium (12 Story Points / 5 Person-Days)  

---

## 1. Sprint Goal

Establish transition continuity between the anonymous **Guest Helpdesk Layer** and the authenticated **End-User Customer Portal Layer**. Complete the outstanding guest interface gaps and build state-preservation pathways for chatbot context, callback bookings, and deep-link redirects during user login/registration.

---

## 2. Scope & Target Areas

* `/frontend/src/components/auth/ProtectedRoute.tsx` (Route redirection query preservation)
* `/frontend/src/app/login/page.tsx` (Post-auth redirect routing handler)
* `/frontend/src/components/dashboard/PublicBotWidget.tsx` (Guest chat history storage and deflection rules)
* `/frontend/src/components/customer-portal/live-chat/LiveChatOverlay.tsx` (Merging guest chats into authenticated customer view)
* `/frontend/src/app/callback/page.tsx` (Preserving phone callback queue data)
* `/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx` (Restoring active callback queue cards)
* `/frontend/src/components/customer-portal/tickets/SubmitTicketPage.tsx` (Appending guest session logs to ticket description field)

---

## 3. Implementation Tasks

### Task 1: Guest → Auth Redirect Continuity
* **Objective:** Ensure visitors who click gated customer portal actions (like ticket submission or saving KB bookmarks) are redirected to log in/register, and then returned back to their intended view with their action active.
* **Existing implementation state:** [ProtectedRoute.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/components/auth/ProtectedRoute.tsx) calls `router.replace('/login')` on lack of authentication, stripping current path parameters. [page.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/app/login/page.tsx) automatically redirects users to their default home route based on user roles, ignoring their original query parameters.
* **Target implementation behavior:**
  * Update [ProtectedRoute.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/components/auth/ProtectedRoute.tsx) to capture pathname and query parameters, routing to `/login?redirect=${encodeURIComponent(pathname + searchParams)}`.
  * Update [page.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/app/login/page.tsx) to parse `searchParams.get('redirect')`. On login success, forward users to this `redirect` target route if it is a secure internal path (starts with `/`). Fall back to `getHomeRouteForRole` if no query is found.
* **Important constraints:** Prevent open redirect vulnerabilities by ensuring the target redirect string starts with a single `/` and does not begin with `//` or external protocol schemes.
* **Dependencies:** Next.js `useSearchParams` hook and router state handlers.
* **Manual validation steps:**
  1. Open the guest portal and select a gated favorite.
  2. Verify you route to `/login?redirect=/portal/home%3Fview%3Dfavorites`.
  3. Enter valid customer credentials.
  4. Confirm the portal routes you directly to the favorites sub-view inside the customer workspace.
* **Out-of-scope items:** Restoring draft form state across logout/login boundaries (routing path preservation only).
* **Risks:** Incorrect URL encoding causing corrupted route parameters. Use standard `encodeURIComponent` and `decodeURIComponent` helpers.
* **Suggested implementation order:** 1st (Core routing foundation).
* **Complexity:** 3 SP (1 Person-Day)

---

### Task 2: Guest Chat Context Preservation
* **Objective:** Persist anonymous chatbot dialogue history across registration and authentication boundaries, allowing agents to see the visitor's pre-auth chat history and pre-populating ticket descriptions on escalation.
* **Existing implementation state:** The [PublicBotWidget.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/components/dashboard/PublicBotWidget.tsx) stores conversation bubbles inside local React state, which is destroyed upon page redirection.
* **Target implementation behavior:**
  * In [PublicBotWidget.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/components/dashboard/PublicBotWidget.tsx), add a `useEffect` hook to serialize the `messages` array into `sessionStorage` under the key `mPaaS_guest_chat_history` on change.
  * In [LiveChatOverlay.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/components/customer-portal/live-chat/LiveChatOverlay.tsx), query this key on mount. If present, parse and merge the chat logs into the customer message history with a separator labeled "Guest Session history".
  * In [SubmitTicketPage.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/components/customer-portal/tickets/SubmitTicketPage.tsx), check for guest history on load. Pre-fill the details field with a summary of their conversation if they escalated.
* **Important constraints:** Do not sync guest history to permanent database storage until the user successfully authenticates. Purge the sessionStorage key upon merge to prevent duplicated loops.
* **Dependencies:** Unified chat array structure shared between the public bot and customer overlay components.
* **Manual validation steps:**
  1. Open `/bot` and search for "SaaS license refund".
  2. Click the escalation trigger labeled **File ticket**.
  3. Complete login. Verify the customer ticket creation form description text box is pre-populated with your refund question.
  4. Open the customer portal chat overlay and verify the guest conversation bubbles render inline.
* **Out-of-scope items:** Database persistence for guest user logs.
* **Risks:** Corrupt JSON strings in `sessionStorage` breaking render cycles. Enforce defensive `try-catch` structures.
* **Suggested implementation order:** 2nd.
* **Complexity:** 3 SP (1.5 Person-Days)

---

### Task 3: Callback Queue Continuity
* **Objective:** Link anonymous callbacks booked via `/callback` to customer profiles upon login, preventing duplicate slots and displaying queue countdowns inside the authenticated workspace.
* **Existing implementation state:** Guest callback scheduling stores its status in local component state. Once the user navigates away or logs in, the active queue card is lost.
* **Target implementation behavior:**
  * In [page.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/app/callback/page.tsx), store scheduled phone numbers and queue tokens in `localStorage` under `mPaaS_active_callback` on scheduling.
  * In [CustomerPortalLayout.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx), check `localStorage` for `mPaaS_active_callback` on mount.
  * If found, automatically render [CallbackQueueCard.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/components/customer-portal/feedback/CallbackQueueCard.tsx) on the home screen, updating queue details.
* **Important constraints:** Clear callback cache keys from storage once the call is answered, rejected, or expires.
* **Dependencies:** Shared state behaviors inside `CallbackQueueCard.tsx`.
* **Manual validation steps:**
  1. Go to `/callback` as a guest and book a callback. Verify the queue card loads.
  2. Log in and route to `/portal/home`.
  3. Verify the same queue countdown timer card renders directly on the customer home dashboard.
* **Out-of-scope items:** Real-time telephony integration.
* **Risks:** Stale callback items remaining cached in localStorage indefinitely. Enforce a 2-hour TTL expiration.
* **Suggested implementation order:** 3rd.
* **Complexity:** 2 SP (1 Person-Day)

---

### Task 4: Public Bot Deflection & Escalation Improvements
* **Objective:** Expand the guest chatbot widget ([PublicBotWidget.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/components/dashboard/PublicBotWidget.tsx)) with basic RAG search deflection, navigation buttons, and clear redirection routes.
* **Existing implementation state:** The bot widget uses basic regex keyword evaluations and falls back to a canned response. It has no integration with knowledge base lists.
* **Target implementation behavior:**
  * Import `kbArticles` dataset into [PublicBotWidget.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/components/dashboard/PublicBotWidget.tsx).
  * Build a simple token search handler. When user queries match article tags or titles, return a formatted suggestion: "Related Article: [Article Name](/kb?article=id)".
  * On search failures, render clickable prompt buttons: **[Schedule Voice Callback]** (links to `/callback`) and **[Submit Case]** (links to `/login?redirect=/portal/home?action=submit_ticket`).
* **Important constraints:** Do not establish true server-side semantic search engines; rely on client-side indexing.
* **Dependencies:** Static constants in `constants.ts`.
* **Manual validation steps:**
  1. Open `/bot`. Ask: "How do I request a subscription refund?".
  2. Confirm the chatbot returns a RAG deflection message pointing to the refund article.
  3. Type "support agent". Confirm that callback and case submission prompt buttons load.
* **Out-of-scope items:** Real vector database query executions.
* **Risks:** UI alignment bugs within the chat bubble container when list items are rendered. Verify text wrapping constraints.
* **Suggested implementation order:** 4th.
* **Complexity:** 2 SP (1 Person-Day)

---

### Task 5: Guest/Public UX & Validation Polish
* **Objective:** Implement missing loading skeletons, validation error states, and transition notifications within the public guest layers.
* **Existing implementation state:** Forms inside public pages use basic input borders and lack loading skeletons or visual error states.
* **Target implementation behavior:**
  * Add input validation shake effects and helper texts inside [page.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/app/callback/page.tsx).
  * Build skeleton components to display when the guest portal is loading articles.
  * Integrate redirect banner notifications (e.g. "Preserving your session. Redirection in progress...") on the login card during auth handshakes.
* **Important constraints:** Maintain existing styling variables from `globals.css` and `tokens.ts`.
* **Dependencies:** Tailwind CSS config configurations.
* **Manual validation steps:**
  1. Open `/callback` as a guest. Input an invalid phone string and submit. Confirm shake animation fires.
  2. Select the "Submit Case" trigger in the chatbot. Verify a prompt informing you that your session history is preserved renders.
* **Out-of-scope items:** Global UI refactorings.
* **Risks:** Layout breaks under 640px viewport resizes. Ensure standard flex layout configurations.
* **Suggested implementation order:** 5th.
* **Complexity:** 2 SP (0.5 Person-Day)

---

## 4. Dependencies Matrix

| Task ID | Component / File | Dependent On | Purpose |
|---|---|---|---|
| **Task 2** | `LiveChatOverlay.tsx` | sessionStorage storage rules | Fetching cached guest chats post-login |
| **Task 3** | `CustomerPortalLayout.tsx` | localStorage queue tokens | Syncing guest callbacks to customer dashboard |
| **Task 4** | `PublicBotWidget.tsx` | `constants.ts` article index | Suggesting articles during anonymous chats |

---

## 5. Expected Outcomes

* Guest users can seamlessly browse articles, chat with Farah AI, request callbacks, and register accounts.
* Chat histories, callback schedules, and route redirects are preserved and carried forward upon authentication.
* Gated routes prevent unauthorized access, forwarding users to login page targets with redirect parameters intact.

---

## 6. Verification Requirements

- [ ] Verify that gating an authenticated route properly passes the redirect query parameter.
- [ ] Confirm that post-login, the router forwards to the redirect target.
- [ ] Verify that guest chat history is saved to sessionStorage and successfully merged into the live support panel.
- [ ] Confirm that anonymous voice callback bookings populate the customer home dashboard upon login.
- [ ] Verify that the guest chatbot deflects queries to knowledge base articles.
