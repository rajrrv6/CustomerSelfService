# Support Agent Workspace — Sprint 06 Planning

## Sprint Goal
Build AUX break state managers, personal scorecards, and the shift schedule calendar interface.

## Business Objective
Ensure agents can manage their availability status, track their performance metrics, and view their shift schedules.

## Technical Objective
Implement the AUX timer, connect performance stats, and build the shift planner calendar layout.

## Screens Covered
* Break / AUX Status (Aux Toolbar)
* Personal Scorecard
* Schedule / Shift Planner

## Components Required
* AUX selector status switcher
* Adherence timer metrics tracker
* Performance scorecard layout
* Shift schedule calendar grid view

## Modal/Drawer Requirements
* AUX reason modal
* Swap request modal

## State Management Requirements
* Add states for active AUX codes, adherence status, and shift listings in the workspace store.
* Implement status changes and shift trade actions.

## AI Workflow Requirements
* AI break suggestions display notifications.
* AI summarizes productivity suggestions.

## Omnichannel Requirements
* Changing status updates routing systems to prevent new mock chats from being assigned.

## Responsive Tasks
* Calendar views collapse to vertical lists on mobile.
* Charts adjust automatically on small screens.

## RTL Tasks
* Mirror chart axes.
* Calendar weeks display right-to-left.

## Accessibility Tasks
* Ensure calendar cells identify date and status for keyboard navigation focus.
* Confirm focus indicators show clearly on grid cells.

## Risks
* Interval timers can leak memory if not properly cleaned up on component unmount.

## Dependencies
* Sprint 01 must be complete.

## QA Checklist
- [ ] Changing status updates the AUX timer.
- [ ] Exceeding break limits highlights timers.
- [ ] Scorecard charts load seed trends.
- [ ] Shift cells display details on click.

## Definition of Done (DoD)
* AUX status selectors function.
* Adherence timers track durations.
* Charts display performance stats.
* Calendar views render shifts.
* Layout mirrors correctly in Arabic.
* Code meets accessibility requirements.
