# UI/UX & Design System Rules

## 1. Enterprise Realism
- Design clean dashboard layouts using thin borders (`border-slate-200` / `border-slate-800` in dark mode) and subtle shadows (`shadow-sm`).
- Incorporate smooth hover animations (`hover:-translate-y-0.5 transition-all duration-200`) and scaling states to provide responsive visual feedback.
- Avoid generic UI designs or bare templates. Populate layouts with realistic support logs, metric figures, and timeline events.

## 2. Channel Differentiation
- Enforce clear visual indicators on contact records inside workspace feeds:
  - **WhatsApp**: Emerald color schemes (`text-emerald-500` / left-border strip).
  - **Email**: Violet indicators (`text-violet-500` / document composer layouts).
  - **Web Chat**: Sky-blue tags (`text-sky-500` / chat widgets).
  - **Escalated**: Crimson accents with locked input statuses.

## 3. Responsive Grids
- Use responsive-first grid wrappers (such as `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6`) to prevent card clipping or screen overflow on tablet and mobile viewports.
