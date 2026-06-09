# Sprint 01 — Accessibility & QA Foundation

This document defines the accessibility guidelines and quality assurance checklists for Sprint 01 of the Support Agent Workspace.

---

## 1. Accessibility Baseline (WCAG 2.1 AA)

### Landmark Structure
* Layout wrappers must use appropriate HTML landmark elements:
  * `aside` for sidebar navigation.
  * `header` for workspace headers.
  * `main` for active views.
  * `section` with `aria-label` tags for modular panels.

### Keyboard Navigation
* All interactive controls must be reachable using the `Tab` and arrow keys.
* Focused elements must display a high-contrast focus ring (`focus-visible:ring-2`).

### Focus Management
* Opening a modal or drawer traps keyboard focus within that component, preventing interaction with background elements.
* Closing a modal returns focus to the button that triggered it.

### Screen Reader & ARIA Labels
* Non-text elements (buttons, icons, status indicators) must include descriptive labels (`aria-label` or `alt` tags).
* Dynamic status updates (such as unread counts) are announced in real-time using `aria-live` attributes.

---

## 2. Quality Assurance (QA) Checklists

### Route Verification Checklist
- [ ] Log in as a support agent and verify navigation routes correctly.
- [ ] Confirm navigating to `/tickets` displays the tickets list instead of the shift planner.
- [ ] Verify that unauthorized route requests redirect to the access-denied page.
- [ ] Check that refreshing the workspace retains the active view.

### RTL Verification Checklist
- [ ] Toggle the language setting to Arabic.
- [ ] Verify the layout direction flips to `rtl` and the interface mirrors.
- [ ] Check that directional icons mirror their orientation.
- [ ] Confirm text alignments mirror correctly.
- [ ] Verify scrollbars transition to the opposite side of scroll panels.

### Responsive Verification Checklist
- [ ] Verify the workspace layout scales correctly at `1440px`, `1024px`, `768px`, and `320px` viewports.
- [ ] Confirm the sidebar collapses on screens under `1024px`.
- [ ] Check that slide-out drawers and bottom sheets display correctly on mobile screens.
- [ ] Verify touch targets are at least `44px` on mobile viewports.

### Regression Checklist
- [ ] Verify that support agent workspace changes do not affect supervisor or QA views.
- [ ] Confirm global authentication states and theme preferences persist after changes.
- [ ] Check that the workspace shell is free of layout shifts during drawer transitions.
