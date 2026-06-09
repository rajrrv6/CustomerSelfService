# Sprint 02 — Customer Portal Plan
## CustomerSelfService Platform — Sprint Plans

**Execution Window:** Sprint 02 (1.5 Weeks)  
**Last Updated:** 2026-06-03T16:50:54+05:30  
**Priority:** 🟠 HIGH PRIORITY IMPLEMENTATION GAPS  
**Risk Level:** Medium (UI structure changes)  
**Complexity Estimate:** High (18 Story Points / 7 Person-Days)  

---

## 1. Sprint Goal

Complete all remaining customer-facing surfaces in the Customer Self-Service Portal to achieve 100% compliance with the `03_CustomerSelfService` PDF scope, ensuring bilingual translation consistency and responsive view support.

---

## 2. Scope & Target Areas

* `/frontend/src/components/customer-portal/` (shared layouts, live chat overlay)
* `/frontend/src/components/customer-portal/orders/` (NEW directory)
* `/frontend/src/components/customer-portal/callbacks/VoiceCallModal.tsx`

---

## 3. Implementation Tasks

### Task 1: Create Standalone Order Lookup Page (H1 / Screen 126)
* **Goal:** Implement order tracking portal.
* **Implementation:** Create `src/components/customer-portal/orders/OrderLookup.tsx`. Build a view with order ID search inputs, OTP-gated validation (`OtpAuth.tsx` integration), shipping timeline progress bars (Processing → Shipped → Delivered), item lists, and a return launch CTA linking directly to `RefundWizard.tsx`.
* **Complexity:** 5 SP (2 Days)

### Task 2: Build Interactive Voice Call Request Form (H8 / Screen 120)
* **Goal:** Expand `VoiceCallModal.tsx` from its 1.3KB placeholder stub into a functional form.
* **Implementation:** Add phone number inputs, dynamic callback hour slot selection, bilingual validations, and submit triggers publishing audit log alerts.
* **Complexity:** 3 SP (1 Day)

### Task 3: Wire Callback Queue Position Navigation (Screen 118)
* **Goal:** Surface the queue card immediately after callback scheduling.
* **Implementation:** Add `callback_queue_position` sub-screen state to `CustomerPortalLayout.tsx`. Upon scheduling callbacks, route users automatically to this screen displaying `CallbackQueueCard` with dynamic timing metrics.
* **Complexity:** 3 SP (1 Day)

### Task 4: Implement In-Chat Multilingual Toggle Modal (Screen 129)
* **Goal:** Provide mid-conversation language options inside the live chat drawer.
* **Implementation:** Add a globe switch button to `LiveChatOverlay.tsx` header. Clicking it displays a translation popover that toggles local chat bubble languages scoped only to the conversation, adding a system notification indicating the language update.
* **Complexity:** 4 SP (2 Days)

### Task 5: Customer Portal URL Search Parameter Routing (M1)
* **Goal:** Support deep-linking to support tickets and knowledge base articles.
* **Implementation:** Add search parameter listeners inside `CustomerPortalLayout` mount effects to set the active sub-screen from URL parameters (e.g. `?view=ticket_detail&id=TCK-892`).
* **Complexity:** 3 SP (1 Day)

---

## 4. Dependencies

* **Task 1** depends on `OtpAuth` for validation codes.
* **Task 3** depends on `CallbackQueueCard` for queue telemetry.

---

## 5. Expected Outcomes

* All Customer Portal screens (19 of 20) are fully compliant and interactive.
* Support tickets and orders can be deep-linked from external URLs.

---

## 6. Verification Requirements

- [ ] Load the Customer Portal. Search for order ID `ORD-99881` with code `1234` and confirm detail cards load.
- [ ] Open the floating Voice FAB in the portal. Verify the voice form opens, validates phone values, and issues a success toast.
- [ ] Confirm that deep-linking to a specific ticket via search query parameters resolves instantly.
