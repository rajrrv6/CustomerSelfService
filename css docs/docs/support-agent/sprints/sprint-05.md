# Support Agent Workspace — Sprint 05 Planning

## Sprint Goal
Build core voice telephony controls, the active call status panel, the hold music selector, and wrap-up disposition modals.

## Business Objective
Support voice call flows directly in the workspace, allowing agents to take calls, place callers on hold, and dial in third-party participants in a simulated environment.

## Technical Objective
Build the virtual dialer interface, the telephony state machine, the hold stream router, and participant controls.

## Screens Covered
* Active Voice Call Panel
* Hold Music Selector
* Conference Call
* Wrap-up / Disposition

## Components Required
* Voice dialer pad
* Active call panel
* Conference modal
* Hold music dropdown
* Wrap-up modal

## Modal/Drawer Requirements
* Incoming call modal
* Call disposition modal
* Conference modal
* Wrap-up modal

## State Management Requirements
* Integrate active call logs, timers, mute states, and hold parameters in the telephony state store.
* Implement answer call, hangup call, toggle hold, and toggle mute actions.

## AI Workflow Requirements
* Simulated meeting note transcripts display on sidebar streams.
* The wrap-up modal uses the AI helper to auto-generate case resolution summaries.

## Omnichannel Requirements
* Route active call audio streams over simulated voice lines.

## Responsive Tasks
* Verify touch target sizes for dial buttons are at least `44px` on mobile screens.

## RTL Tasks
* Mirror dial pad layout structures.
* Flip call status icons.

## Accessibility Tasks
* Ensure call controls include clear text alternatives for screen readers.
* Confirm that active calls display high-contrast status colors.

## Risks
* State mismatches can occur if state machine transitions are not fully synchronized.

## Dependencies
* Sprint 04 must be complete.

## QA Checklist
- [ ] Dialer inputs register keypresses.
- [ ] Ringing modals overlay incoming calls.
- [ ] Toggling hold plays mock hold music.
- [ ] Disconnecting calls launches wrap-up modals.

## Definition of Done (DoD)
* Voice calling functions.
* Hold music selections update correctly.
* Conference calls bridge lines.
* Disposition selections function.
* Layout mirrors correctly in Arabic.
* Code meets accessibility standards.
