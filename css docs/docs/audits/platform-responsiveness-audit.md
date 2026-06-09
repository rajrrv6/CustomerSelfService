# Platform Responsiveness, Accessibility & Overlay QA Audit

## 1. Viewport & Responsive Containment
This audit validates the responsive containment of dashboard containers, layout grids, tables, and sidebar navigation wrappers across standardized resolution ranges (1920px down to 320px).

### Observed Behaviors & Stabilizations:
- **Tablet Boundaries (768px - 1024px):** Custom sidebars translate out of the viewport cleanly, utilizing the layout-managed burger-menu trigger. Horizontal layout grids stack to prevent compression on dashboard components.
- **Grids and Cards:** Breakpoints (`xl`, `lg`, `md`, `sm`) are normalized in metrics, bots lists, and system operations tables. Cards collapse into single columns on mobile viewports.
- **Activity & Timeline Feeds:** Feeds wrap and wrap titles using `min-w-0 flex-1` layout, ensuring readable layouts on narrow screens.
- **Table Data Containment:** Tables use custom TanStack hooks with `overflow-x-auto` wrappers to support responsive horizontal scrolling.

---

## 2. Overlay Stacking & Scroll Bleed
Ensures drawer/modal layering remains functional on stacked overlays.

### QA Stems Verified:
- **Z-Index Layering:** `ModalWrapper` stack height raised to `z-[70]` to always sit above drawer dialog overlays (`z-50`).
- **Body Scroll Locking:** Dynamic, stack-safe counter (`window.__activeOverlayCount`) blocks main document scroll on open, and restores it on the final overlay close event.
- **Dismissal Controls:** Escape keys map directly to callback hooks. Close buttons are fully visible and responsive.

---

## 3. Keyboard & Assistive Navigation
Ensures focus is keyboard-reachable and navigable without mouse dependencies.

### Accessible Mappings Implemented:
- **Sidebar Navigation:**
  - `Arrow Up` / `Arrow Down` moves active keyboard focus between links.
  - `Arrow Left` / `Arrow Right` expands/collapses accordion headers (mirrored automatically in RTL).
  - `Home` key jumps focus directly to the first visible nav control.
  - `End` key jumps focus directly to the last visible nav control.
- **Interactive Links:** Focus visible rings (`focus-visible:ring-2 focus-visible:ring-blue-500 focus:outline-none`) standard across all navigation anchors and buttons.
