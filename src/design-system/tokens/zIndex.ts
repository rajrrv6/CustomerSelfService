/**
 * Design System — Z-Index Layers
 * Ordered z-index stack to prevent collision between layered components.
 */

export const Z = {
  /** Default content layer */
  base: 'z-0',
  /** Sticky headers, scroll-pinned toolbars */
  sticky: 'z-10',
  /** Dropdown menus, tooltip triggers */
  dropdown: 'z-20',
  /** Mobile slide-over overlay backdrop */
  overlayBackdrop: 'z-25',
  /** Mobile slide-over panel drawers */
  drawer: 'z-35',
  /** Floating buttons, bottom nav */
  floating: 'z-30',
  /** Dialogs, modals, notification drawers */
  modal: 'z-40',
  /** Toasts, global alerts */
  toast: 'z-50',
  /** AI drag overlay, screenshare ring */
  top: 'z-[70]',
} as const;
