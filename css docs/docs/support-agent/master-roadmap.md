# Support Agent Workspace — Master Implementation Roadmap

This roadmap outlines the 8-phase implementation plan for the Support Agent Workspace, detailing the objectives, systems, accessibility, and verification criteria for each phase.

---

## Phase 1 → Route Stabilization & Shared Architecture
* **Objectives**: Resolve route mapping corrections for `/tickets`, set up workspace state management stores, and build shared layout elements.
* **Included Screens**: Workspace Launcher, Sidebar.
* **Required Reusable Systems**: Theme and language providers, standard UI styling tokens.
* **Required State Systems**: State selectors for themes and route navigations.
* **Required Modals/Drawers**: None.
* **Workflow Dependencies**: None.
* **Responsive Requirements**: Layouts adapt dynamically to screen viewports.
* **RTL Requirements**: Verify language change toggles direction between LTR and RTL.
* **Accessibility Requirements**: Layout shells use proper HTML landmark tags (e.g., `main`, `aside`).
* **Risks**: Modifying global route configurations could impact navigation if not properly sandboxed.
* **Implementation Complexity**: Low.
* **Expected Outcomes**: Sidebar navigation functions correctly; `/tickets` route lists tickets; the launcher loads correctly.
* **Manual Verification Outcomes**: Navigate to `/tickets` and verify the tickets list displays; verify role permissions allow access.

---

## Phase 2 → Active Conversation System
* **Objectives**: Implement the core conversation timeline and composition elements, supporting chat and email layouts.
* **Included Screens**: Active Conversation Panel.
* **Required Reusable Systems**: Timeline, composers, and message bubbles.
* **Required State Systems**: Centralized conversation state slices.
* **Required Modals/Drawers**: None.
* **Workflow Dependencies**: Route stabilization must be complete.
* **Responsive Requirements**: The center pane collapses on mobile, with panels toggled via sheets.
* **RTL Requirements**: Align message bubbles based on sender direction (Arabic agent replies on the left).
* **Accessibility Requirements**: Message additions are announced in real-time (`aria-live="polite"`).
* **Risks**: Large message counts can impact rendering performance if list virtualization is not configured.
* **Implementation Complexity**: High.
* **Expected Outcomes**: Messages render correctly; sending messages updates the timeline dynamically.
* **Manual Verification Outcomes**: Open active conversation, send chat replies, and verify messages append to the list.

---

## Phase 3 → AI Reply Composer Completion
* **Objectives**: Build the AI Copilot integration, supporting streamed replies, tone rewrites, and mock knowledge article previews.
* **Included Screens**: Reply Composer with AI Copilot, Customer 360 Side Panel.
* **Required Reusable Systems**: AI panels, composers, and citation tooltips.
* **Required State Systems**: Simulated streaming hooks.
* **Required Modals/Drawers**: None.
* **Workflow Dependencies**: The Active Conversation System must be complete.
* **Responsive Requirements**: AI toolbars collapse into a bottom sheet menu on screens under `768px`.
* **RTL Requirements**: Mirror the position of suggestions and copy buttons.
* **Accessibility Requirements**: Suggestions can be focused and applied using keyboard shortcuts.
* **Risks**: Network drops during simulated streaming can cause inputs to lock if cancel options are not configured.
* **Implementation Complexity**: High.
* **Expected Outcomes**: Suggestions display in the composer; selecting options streams text inline.
* **Manual Verification Outcomes**: Click "Apply Suggestion" and verify text streams into the composer; select "Empathetic" tone and verify the draft rewrites.

---

## Phase 4 → Agent Operations Workflows
* **Objectives**: Implement the internal notes system, team directories, and transfer/consult workflows.
* **Included Screens**: Internal Notes, Transfer / Consult Drawer.
* **Required Reusable Systems**: Note composers, note timelines, directories, and consult drawers.
* **Required State Systems**: Agent presence data provider.
* **Required Modals/Drawers**: Transfer modal, consult drawer.
* **Workflow Dependencies**: The Active Conversation System must be complete.
* **Responsive Requirements**: Modals expand to fill the screen on small viewports.
* **RTL Requirements**: Mirror form fields; the consult drawer slides in from the opposite side.
* **Accessibility Requirements**: Transfer modals trap focus and can be closed using the `ESC` key.
* **Risks**: Status sync issues can occur if transfers are initiated while the target agent is offline.
* **Implementation Complexity**: High.
* **Expected Outcomes**: Internal notes save to the timeline; the transfer directory displays online agents.
* **Manual Verification Outcomes**: Post an internal note and verify the purple banner displays; click transfer, search for an agent, and verify the transfer completes.

---

## Phase 5 → Voice & Conference Workflows
* **Objectives**: Implement the dialer, active call panel, hold music selector, conference controls, and wrap-up dispositions.
* **Included Screens**: Conference Call, Hold Music Selector, Wrap-up / Disposition.
* **Required Reusable Systems**: Dialers, active call panels, conference modals, and wrap-up modals.
* **Required State Systems**: Telephony state machine slices.
* **Required Modals/Drawers**: Conference modal, call disposition modal, wrap-up modal.
* **Workflow Dependencies**: Operations workflows must be complete.
* **Responsive Requirements**: Touch targets for dial buttons are at least `44px` on mobile viewports.
* **RTL Requirements**: Mirror call logs and dialed numbers.
* **Accessibility Requirements**: Audio controls include text alternatives for screen readers.
* **Risks**: State conflicts can occur if outbound calls are dialed while a call is parked on hold.
* **Implementation Complexity**: High.
* **Expected Outcomes**: Incoming call alerts display; holding calls routes hold music; wrap-up options display on disconnect.
* **Manual Verification Outcomes**: Answer call, click hold, verify hold indicator displays; hang up, verify wrap-up code selection works.

---

## Phase 6 → Shift / AUX / Productivity Systems
* **Objectives**: Implement AUX break states, performance scorecards, and shift planners.
* **Included Screens**: Break / AUX Status, Personal Scorecard, Schedule / Shift Planner.
* **Required Reusable Systems**: AUX selectors, performance scorecards, and shift schedules.
* **Required State Systems**: Adherence timers.
* **Required Modals/Drawers**: AUX reason modal, swap request modal.
* **Workflow Dependencies**: Route stabilization must be complete.
* **Responsive Requirements**: Calendar views transition to vertical lists on mobile.
* **RTL Requirements**: Reverse performance chart axes; calendar weeks display right-to-left.
* **Accessibility Requirements**: Calendar cells identify dates and statuses for keyboard navigation focus.
* **Risks**: Background timers can leak memory if not properly cleaned up on unmount.
* **Implementation Complexity**: Medium.
* **Expected Outcomes**: Changing AUX status updates availability; charts display scorecard trends.
* **Manual Verification Outcomes**: Change status to Break, verify the timer ticks; open shift planner, click calendar cell, verify details modal displays.

---

## Phase 7 → Enterprise States & Interaction Polish
* **Objectives**: Polish animations, add layout transitions, and implement offline warnings.
* **Included Screens**: All workspace screens.
* **Required Reusable Systems**: Connection warning banners, toast notifications.
* **Required State Systems**: Local offline auto-save managers.
* **Required Modals/Drawers**: None.
* **Workflow Dependencies**: All core systems must be complete.
* **Responsive Requirements**: Resize observers manage panel widths dynamically.
* **RTL Requirements**: Verify transitions translate smoothly in both directions.
* **Accessibility Requirements**: Page status alerts are announced in real-time.
* **Risks**: Fast transitions can cause layout stutter on lower-end devices.
* **Implementation Complexity**: Medium.
* **Expected Outcomes**: Drawer transitions are smooth; offline statuses display warnings without losing work.
* **Manual Verification Outcomes**: Simulate offline mode, verify the warning banner appears, and confirm composition drafts are retained.

---

## Phase 8 → RTL / Dark Mode / Accessibility / Responsive QA
* **Objectives**: Perform comprehensive quality assurance testing for internationalization, styling, accessibility, and layout scaling.
* **Included Screens**: All workspace screens.
* **Required Reusable Systems**: Accessibility test suites.
* **Required State Systems**: Local layout checkers.
* **Required Modals/Drawers**: None.
* **Workflow Dependencies**: Phase 7 must be complete.
* **Responsive Requirements**: Verify layout displays correctly across all targeted viewports.
* **RTL Requirements**: Verify 100% Arabic translation coverage and layout mirroring.
* **Accessibility Requirements**: Reach 100% keyboard navigation coverage and pass WCAG 2.1 AA audits.
* **Risks**: Layout breaks can occur if fonts or scrollbars are not sized correctly.
* **Implementation Complexity**: Low.
* **Expected Outcomes**: The workspace passes all QA checks and layout validations.
* **Manual Verification Outcomes**: Complete a full end-to-end support workflow in Arabic, dark mode, using keyboard navigation, on a mobile viewport.
