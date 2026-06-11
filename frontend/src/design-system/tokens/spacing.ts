/**
 * Design System — Spacing Tokens
 * Semantic spacing scales normalized from Tailwind values used across Phase 2 + 3.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Component Padding
// ─────────────────────────────────────────────────────────────────────────────

export const PADDING = {
  /** Inline badge, chip */
  badge: 'px-2 py-0.5',
  /** Small button, control */
  btnSm: 'px-3 py-1.5',
  /** Standard button */
  btn: 'px-4 py-2',
  /** Large CTA button */
  btnLg: 'px-5 py-2.5',
  /** Form input */
  input: 'px-3.5 py-2.5',
  /** Compact card */
  cardSm: 'p-3.5',
  /** Standard card */
  card: 'p-5',
  /** Large panel */
  panel: 'p-6',
  /** Section wrapper */
  section: 'p-8',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Gap / Spacing Scales
// ─────────────────────────────────────────────────────────────────────────────

export const GAP = {
  xs: 'gap-1.5',
  sm: 'gap-2',
  md: 'gap-3',
  lg: 'gap-4',
  xl: 'gap-5',
  '2xl': 'gap-6',
} as const;

export const SPACE_Y = {
  xs: 'space-y-1.5',
  sm: 'space-y-2',
  md: 'space-y-3',
  lg: 'space-y-4',
  xl: 'space-y-5',
  '2xl': 'space-y-6',
} as const;
