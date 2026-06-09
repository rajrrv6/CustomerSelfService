# Support Agent Workspace — Sprint 04 Planning

## Sprint Goal
Implement internal notes, team directories, and transfer/consult workflows to support collaboration and case handoffs.

## Business Objective
Allow agents to transfer complex cases and log internal notes without exposing sensitive details to customers.

## Technical Objective
Build the internal notes layout, the transfer modal directory, and the consult drawer chat view.

## Screens Covered
* Internal Notes
* Transfer / Consult Drawer

## Components Required
* Note composer (notes inputs)
* Note timeline card (notes timeline logs)
* Transfer modal (directory lookup)
* Consult drawer (sidebar chat)

## Modal/Drawer Requirements
* Transfer modal (directory lookup)
* Consult drawer (sidebar chat consult)

## State Management Requirements
* Add states for active transfers, consult chat logs, and online agent directories.
* Implement note logging and transfer execution actions.

## AI Workflow Requirements
* Implement an AI summary generator that creates a brief case overview when a transfer is initiated.

## Omnichannel Requirements
* Internal notes are logged to the ticket timeline, bypassing channel delivery.

## Responsive Tasks
* Modals scale to fill the screen on small viewports.
* Verify the consult drawer slides in from the edge of the viewport.

## RTL Tasks
* Mirror forms and search bars.
* The consult drawer slides in from the opposite side in Arabic mode.

## Accessibility Tasks
* Ensure the transfer modal traps focus when active.
* Verify keyboard navigation works throughout the agent directory list.

## Risks
* Ownership sync errors can occur if both agents attempt to edit the chat simultaneously during handoff.

## Dependencies
* Sprint 02 must be complete.

## QA Checklist
- [ ] Internal notes display on the timeline with purple highlighting.
- [ ] Transfer modals load list of online agents.
- [ ] Initiating a consult opens the sidebar chat.
- [ ] Completing a transfer updates case ownership.

## Definition of Done (DoD)
* Internal notes function.
* The transfer directory displays online agents.
* Consult workflows execute.
* Layout mirrors correctly in Arabic.
* Code meets accessibility requirements.
* Transfer states update correctly in the state store.
