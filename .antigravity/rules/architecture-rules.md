# Architecture & Scoping Rules

## 1. Feature Modularization
- Do not build giant monolithic files. Split components under descriptive subdirectories, e.g., `/super-admin/channels/` or `/client-admin/channels/`.
- Lay out tabs and child drawers as self-contained sub-components rather than embedding them directly in layout wrappers.

## 2. Role Segregation Boundaries
- Expose platform administration parameters (global API keys, vector DB configurations, telephony trunks) ONLY under `SuperAdmin` components.
- Confine `ClientAdmin` features to tenant-level business parameters (support hours, color choices, bot behavior settings, template previews). 
- Prevent credential leakage or privilege escalation by strictly separating these panels.

## 3. Shared State Conventions
- Leverage the React context provider (`useApp`) for user sessions, system languages, active conversations, and audit logs.
- Manage component-specific properties (e.g. preview themes, modal toggles) using local React state flags (`useState`) to avoid context bloat.
