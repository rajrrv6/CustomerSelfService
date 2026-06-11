# Sprint Completion: Dialog Builder Refactor

## Features Delivered

### 1. React Flow Graph Canvas
- Replaced the legacy absolute coordinate coordinate-based canvas with a scalable, zoomable, and pannable canvas using **React Flow**.
- Registered a typed custom node registry (`customNodeTypes`) representing all 11 conversational node types.
- Configured edge connection lines (Bezier/SmoothStep) with dynamic coloring and animations during simulator execution.
- Added snap-to-grid (`[15, 15]`) canvas alignment, zoom/pan controls, fit view, pane click overlays, and keyboard delete listeners.

### 2. Custom Node System (11 Nodes)
Integrated an isolated rendering boundary pattern using `BaseNode` as a shell. All 11 custom node types are implemented:
- **Start Node**: Session entry point.
- **Message Node**: Multilingual response editor, typing delays, and files attachment counts.
- **Condition Node**: Evaluation branch comparing variables using operators.
- **Intent Node**: Listens for NLU intent classifier triggers.
- **API Action Node**: REST endpoints, methods, headers arrays, template payload mappings, timeout controls, and retry policies.
- **Escalation Node**: SLA priority, severity weightings, and queue targets.
- **Variable Set Node**: Context key-value assignments.
- **Delay Node**: Timing holds in seconds.
- **Human Handoff Node**: Active representative queue transfers.
- **Knowledge Search Node**: Generative RAG document scans and confidence bounds.
- **End Node**: CSAT rating prompts and session closure.

### 3. Live Validation Diagnostics Engine
- Checks graph connections on every update, evaluating:
  - Missing start nodes or multiple start gates.
  - Unconnected nodes and unreachable components.
  - Dead-end branches (non-terminal nodes missing outgoing paths).
  - Missing branch routing outputs or missing fallback branches.
  - Unwired API action success/failure paths.
  - Orphan variables (tokens using double curly brackets that are not registered in the system registry).
  - Invalid API JSON payload formats.
- Flags validation summaries at the bottom of the canvas graded by severity: `info`, `warning`, `critical`.

### 4. Interactive Conversational Simulator
- Traverses the active React Flow graph step-by-step from the start node.
- Supports distinct simulator scenarios: Normal customer flow, Low NLU confidence RAG fallback, Immediate agent handoff, and API timeout failures.
- Interactive Slot Filling: If a template parameter is empty, the simulator pauses and prompts the user for slot input via a terminal form, then dynamically injects it.
- Live variable grid: Exposes active session values, allowing real-time edits during simulation.
- Integrated a scrolling Developer Console terminal listing detailed step operations and condition outcomes.
