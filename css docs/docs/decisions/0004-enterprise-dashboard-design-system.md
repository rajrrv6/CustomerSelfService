# Architectural Decision Record (ADR)

## Title
0004-enterprise-dashboard-design-system

## Status
Accepted

## Context
The CustomerSelfService platform is an enterprise-grade AI-native portal. To build a premium visual experience, the layout needs a unified design system that supports dark/light modes, micro-animations, structured borders, and high accessibility ratios across all modules.

## Decision
We enforce a strict dashboard theme structure:
1. **Glassmorphism & Borders**: Use clean card layouts with thin borders (`border-slate-200` in light mode, `border-slate-800` in dark mode) and subtle shadows (`shadow-sm`) instead of heavy gradients.
2. **Color Palette**: Utilize Tailwind CSS HSL tailored utility colors for states (emerald for operational, amber for warnings, rose for errors, and violet/sky-blue for indicators).
3. **Responsive Grids**: All overview sections default to responsive flex-wrapped grids (e.g. `grid-cols-2 md:grid-cols-3 xl:grid-cols-6`) to prevent screen overflow on smaller tablets and mobile devices.
4. **Interactive States**: Apply smooth hover translations (`hover:-translate-y-0.5 transition-all duration-200`) and scale responses to interactive elements to make the interface feel responsive.

## Consequences
- **Pros**: Maintains visual harmony across Super Admin and Client Admin screens; respects dark mode preferences out of the box.
- **Cons**: Card margins and padding must be strictly managed to prevent layout shifts.

## Alternatives Considered
- **Plain Material-Design/CSS Components**: Rejected because standard browser grids lack visual hierarchy and feel too basic for enterprise SaaS software.
