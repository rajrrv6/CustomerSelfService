# Support Agent Workspace — Enterprise Readiness Checklist

This checklist defines the QA requirements and validation criteria to ensure the Support Agent Workspace is production-ready.

---

## 1. UI & Route Quality Assurance (QA)

### UI Layout Audits
- [ ] Verify there is no layout shifting when sidebars are collapsed.
- [ ] Confirm layout spacing matches design system guidelines (e.g., standard padding, uniform border-radius).
- [ ] Check that all text elements are readable with sufficient contrast.

### Route Stabilizations
- [ ] Confirm the `/tickets` route correctly lists support tickets instead of displaying the Shift Planner UI.
- [ ] Verify that unauthorized users are redirected to the access-denied page, per role-based access controls (RBAC).
- [ ] Check that refreshing the workspace retains the active conversation view.

---

## 2. Modal & Drawer Controls

### Interaction Validations
- [ ] Verify the Transfer Modal traps keyboard focus, preventing navigation of background elements.
- [ ] Confirm the Consult Drawer slides in from the correct direction (right in LTR, left in RTL).
- [ ] Check that clicking outside a modal or pressing `ESC` cancels the action.
- [ ] Verify warning alerts prevent starting a new call while an active call is in progress.

---

## 3. AI Copilot Verification

### Content Audits
- [ ] Verify suggested replies are parsed for personal data (PII) before rendering.
- [ ] Confirm suggestion ratings (thumbs up/down) log feedback to the local state.
- [ ] Check that hover citations display the correct article titles and match confidence scores.
- [ ] Verify the copy-to-clipboard button operates cleanly.

---

## 4. Omnichannel & Telephony Workflows

### Telephony Life-cycle Checks
- [ ] Verify incoming call modals ring correctly, showing caller information.
- [ ] Confirm hold actions mute caller audio and play mock hold music.
- [ ] Check that call disposition modals appear immediately when calls end.
- [ ] Verify conference controls can mute individual lines.

### Message Timeline Synchronization
- [ ] Confirm incoming messages from chat channels update the timeline.
- [ ] Verify that typing indicators display correctly on active inbox cards.
- [ ] Check that sending file attachments shows upload progress.

---

## 5. Viewports, Localization, & Themes

### Responsive Display Audits
- [ ] Verify the 3-column desk layout collapses to a single-column layout on screens under `1024px`.
- [ ] Confirm touch targets on mobile viewports are at least `44px` to ensure usability.
- [ ] Check that charts adjust automatically on small screens.

### Arabic RTL Mirroring
- [ ] Verify changing the language to Arabic (`ar`) switches text direction to `rtl`.
- [ ] Confirm input elements, search bars, and action icons mirror their layouts.
- [ ] Check that scrollbars render on the correct side in Arabic mode.

### Dark Mode Transitions
- [ ] Verify switching to dark mode updates background colors to dark slate.
- [ ] Confirm border styles shift to dark-gray slate.
- [ ] Check that text elements adjust contrast to remain readable.

---

## 6. Accessibility (WCAG 2.1 AA)

### Accessibility Audits
- [ ] Verify all interactive elements are reachable via keyboard navigation.
- [ ] Confirm that active elements (buttons, inputs) display a visible focus indicator.
- [ ] Check that screen readers read unread counts and timer updates using `aria-live`.
- [ ] Verify all images, icons, and status badges include appropriate `alt` descriptions or `aria-label` tags.

---

## 7. Data Consistency

### Seed Data Verification
- [ ] Verify mock data matches the types defined in types folders.
- [ ] Confirm simulated message lists load correctly on initial render.
- [ ] Check that SLA timers calculate durations based on seed date-time inputs.
- [ ] Verify user profiles match their roles during simulation testing.
