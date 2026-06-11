/**
 * Design System — Focus Ring Tokens
 * Consistent keyboard/accessibility focus styles across all interactive elements.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Base focus outline suppression
// ─────────────────────────────────────────────────────────────────────────────

/** Always pair with a focus-visible variant */
export const FOCUS_SUPPRESS = 'focus:outline-none';

// ─────────────────────────────────────────────────────────────────────────────
// Focus Ring Variants
// ─────────────────────────────────────────────────────────────────────────────

/** Primary focus ring — used on buttons, inputs, cards */
export const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1';

/** Focus ring without offset — inline elements, chips in dark containers */
export const FOCUS_RING_INSET = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

/** Focus ring with larger offset — standalone cards with light backgrounds */
export const FOCUS_RING_CARD = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-900';

/** Success/emerald ring — thumbs-up, success actions */
export const FOCUS_RING_SUCCESS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1';

/** Danger/rose ring — destructive or negative actions */
export const FOCUS_RING_DANGER = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-1';

/** Warning/amber ring — star ratings, caution actions */
export const FOCUS_RING_WARNING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400';

/** Neutral ring — cancel, secondary actions */
export const FOCUS_RING_NEUTRAL = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400';

/** Inline link focus — underline instead of ring */
export const FOCUS_LINK = 'focus-visible:outline-none focus-visible:underline';
