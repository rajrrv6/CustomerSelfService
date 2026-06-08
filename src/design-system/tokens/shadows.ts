/**
 * Design System — Shadow Tokens
 * Normalized elevation shadows for panels, modals, and floating elements.
 */

export const SHADOW = {
  /** Ultra-subtle — panel borders on high-contrast dark */
  xs: 'shadow-xs',
  /** Default card shadow */
  sm: 'shadow-sm',
  /** Elevated cards, hover lift */
  md: 'shadow-md',
  /** Modals, active drawers */
  lg: 'shadow-lg',
  /** Floating actions, toasts */
  xl: 'shadow-xl',
  /** Full-screen modals, command palettes */
  '2xl': 'shadow-2xl',
  /** Blue-tinted primary action shadow */
  primary: 'shadow-sm shadow-blue-500/25',
  /** Colored SLA breach shadow */
  danger: 'shadow-sm shadow-rose-500/30',
  /** Success confirmation shadow */
  success: 'shadow-sm shadow-emerald-500/30',
} as const;
