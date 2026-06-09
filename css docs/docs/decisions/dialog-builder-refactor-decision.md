# Architectural Decision: React Flow Dialog Orchestration

## Status
Approved

## Context
The legacy Dialog Flow builder in the client admin portal utilized custom HTML coordinates and custom connection paths, which was structurally shallow, difficult to extend, and prone to performance bottlenecks on larger conversation trees. To build a premium enterprise self-service portal, we required a robust node-graph library that supports zoom/pan, custom node layouts, multiple input/output handle mappings, and state-driven simulation steps.

## Decisions

### 1. Graph Engine Selection: React Flow
We selected `reactflow` (integrated with React 19) to provide the visual workspace canvas. React Flow provides native hooks, viewports, snap-to-grid controls, edge connection rules, selection handlers, and drag-and-drop helpers out of the box, ensuring high reliability and a fluid user experience.

### 2. State Isolation: Dedicated Zustand store
To avoid re-rendering the entire canvas whenever single inputs change, we created an isolated Zustand store:
- Graph changes (move, connect, drag-in) are pushed to the store.
- Component selection is stored as simple string references (`selectedNodeId`, `selectedEdgeId`).
- Narrow state selectors are utilized by custom node nodes and canvas components.

### 3. Bidirectional RTL Layout Mirroring
To support native localization (EN/AR), the connection handles are dynamically mirrored depending on active language direction:
- LTR (English): Target handles are rendered on the Left; source/output handles are on the Right.
- RTL (Arabic): Target handles are mirrored to the Right; source/output handles are on the Left.
This maintains a natural left-to-right or right-to-left layout flow.

### 4. Reusable Node Shell Pattern
To avoid duplicating wrapper templates, all 11 custom node types render within a single `<BaseNode>` container. The base node container handles common selection styles, simulator active states, and validation warnings, keeping individual node leaves extremely small and readable.
