# Architecture Decision Record: Voice IVR Designer Flow Builder

## Status
Accepted (June 2026)

## Context
The platform requires an operational Voice IVR Designer (Screen 60) for client administrators to construct and deploy caller paths for SIP trunks. 
To maintain high performance and avoid bloated third-party dependencies (such as heavy graphical canvas drawing libraries), we needed a lightweight, frontend-only flow layout that is easy to navigate, supports full Arabic/RTL translation, and includes real-time validation and step-by-step caller path simulation.

## Decision
We implemented a state-driven node pipeline workspace:
1. **State Schema**: IVR nodes are modeled as plain JavaScript arrays containing data parameters and explicit target connection IDs.
2. **UI Layout**: A three-pane modular layout consists of:
   - Left Pane: Call Simulator Panel (visual screen, DTMF keypad input, override sliders).
   - Center Canvas: Vertical flow list of cards with status labels, starting node indicators, and route outputs.
   - Right Pane: Configurator inspector form updating properties of the selected node.
3. **Link Verification**: Graph validation engine runs client-side on every edit, checking for unconnected nodes, dead ends, or missing targets.
4. **Simulator Engine**: The simulator executes step-by-step traversals of the nodes, rendering decision history lists for real-time visualization.

## Consequences
- **Pros**:
  - Extremely fast render times, zero canvas library footprint.
  - Highly accessible: supports keyboard inputs, focus states, and custom styling.
  - Bidirectional RTL mirroring functions natively.
- **Cons**:
  - Visual layout is structured sequentially rather than as a freeform drag-and-drop grid (offset by simplicity, ease of testing, and connection selector dropdowns).
