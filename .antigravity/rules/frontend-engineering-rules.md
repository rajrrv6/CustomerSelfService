# Frontend Engineering Rules

## 1. Strict TypeScript Compliance
- Enable and enforce absolute type check parameters. Avoid using loose type maps or `any` assertions.
- Explicitly define prop interfaces for child cards, modals, and list rows.
- Ensure event handlers (such as form submits and color changes) are fully typed.

## 2. Reusable Component Patterns
- Extract generic visual elements (e.g. table wrappers, dialog wrappers, badges) into shared component directories (`/components/shared/`).
- Avoid replicating complex logic inside layouts. Hook custom states into shared context triggers.

## 3. Keep Files Focused
- Limit component file sizes. Break layout structures containing massive JSX nodes into focused, descriptive sub-components.
- Keep helper calculations, seed lists, and translation mappings separated from main rendering functions.
