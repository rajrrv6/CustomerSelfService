# Customer Portal Completion Checkpoint
## CustomerSelfService Platform — Quality Gating

**Module Status:** 🟡 PARTIAL (85% Completed)  
**Target Gate:** Beta Readiness Gate  
**Last Updated:** 2026-06-03T16:50:54+05:30  
**Owner:** Senior Enterprise Frontend Auditor (Antigravity)  

---

## 1. Compliance Matrix (03_CustomerSelfService PDF)

This table tracks compliance status for all specified customer portal views and interactions:

| Screen / Modal | PDF Spec ID | Status | Current Coverage |
|---|---|---|---|
| **Guest Support Portal** | Screen 115 | ✅ Complete | Static info panels and cards render correctly |
| **Guest Callback Request** | Screen 116 | ✅ Complete | In-modal callback fields present |
| **Callback Success Panel** | Screen 117 | ✅ Complete | Success message cards render |
| **Callback Queue Position** | Screen 118 | ❌ Missing | Redirect to CallbackQueueCard needs routing wire (Sprint 2) |
| **Voice FAB Callback** | Screen 120 | 🟡 Stub | Modal structure exists; lacks inputs and validators (Sprint 2) |
| **Customer Login Card** | Screen 121 | ✅ Complete | Gated auth layouts render |
| **Customer Portal Home** | Screen 122 | ✅ Complete | Navigation buttons and welcome headers styled |
| **Ticket History List** | Screen 123 | ✅ Complete | Grids load support tickets |
| **Ticket Details View** | Screen 124 | ✅ Complete | Details card and message reply logs render |
| **Create Ticket Form** | Screen 125 | ✅ Complete | Form inputs present (C3 identity fix pending) |
| **Order Lookup Page** | Screen 126 | ❌ Missing | Lookup tracking component must be built (Sprint 2) |
| **Refund Request Wizard** | Screen 127 | ✅ Complete | Multi-step return items builder compiles |
| **Knowledge Base Search** | Screen 128 | ✅ Complete | Article lookups and sidebar guides render |
| **Multilingual Live Chat** | Screen 129 | 🟡 Partial | Chat layout renders; lacks inline local switcher (Sprint 2) |

---

## 2. Accessibility (A11y) & UX Polish Requirements

To achieve production quality, the customer portal must complete the following Polish checklist during Sprint 02 and Sprint 05:

### A. Empty, Loading, and Error States
* **Support Ticket List:** Show clean skeleton loading rows when searching; render visual empty state illustration when zero tickets exist.
* **Knowledge Base search:** Provide "No articles found matching your query" helper alerts with suggestion tags.
* **Order Lookup:** OTP modal validation must trigger red error boundaries and shake animations on incorrect inputs.

### B. Mobile Responsiveness & Polish
* Floating Voice FAB button positioning must clear bottom tab bars on mobile layout (viewports under 640px).
* Chat overlay drawer must expand to full-viewport height on mobile safari to avoid layout shifts.

### C. Multilingual & RTL Support
* Arabic locale strings must align correctly from Right-to-Left (RTL). Wrap layout roots in `<div dir={isRtl ? 'rtl' : 'ltr'}>` and confirm margins are standard.
* Translation keys inside `src/components/customer-portal/LiveChatOverlay.tsx` must switch dynamically when language options change.

---

## 3. Remaining Tasks & Priority

1. **Task 1: Order Lookup (H1 / Screen 126):** High priority. Links landing page to RefundWizard.
2. **Task 2: Callback Queue (Screen 118):** Wire routing upon callback submissions to queue card.
3. **Task 3: Voice Form Inputs (H8 / Screen 120):** Upgrade VoiceCallModal fields.
4. **Task 4: Multilingual Chat Switcher (M3 / Screen 129):** Globe indicator inside live chat overlay header.
5. **Task 5: Search parameter routing (M1):** Link parsing on mount to route directly to articles.

---

## 4. Verification & Testing Gating

- [ ] **Manual Browser Walkthrough:** Open `/portal/orders`. Insert mock tracking code. Confirm progress timelines load correctly.
- [ ] **Bilingual Validation:** Toggle between EN and AR layouts. Verify that Arabic text is properly right-aligned, and layout boundaries are not broken.
- [ ] **Responsive check:** Resize browser viewport to 375px (iPhone width). Confirm chat drawers and ticket forms do not trigger horizontal scrolling.
- [ ] **A11y Check:** Verify that all interactive form elements (OTP fields, ticket description inputs) have associated `<label>` attributes and unique selector IDs.
