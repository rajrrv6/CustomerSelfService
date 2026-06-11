/**
 * Design System — Border Radius Tokens
 * Normalized panel, control, and chip radii.
 */

export const RADIUS = {
  /** Inline badges, tags, pill chips */
  pill: 'rounded-full',
  /** Badges, kbd elements, small labels */
  xs: 'rounded-md',
  /** Inputs, buttons, chips, icon containers */
  sm: 'rounded-xl',
  /** Cards, panels, dropdowns */
  md: 'rounded-2xl',
  /** Large panels, modals, workspace containers */
  lg: 'rounded-3xl',
} as const;
