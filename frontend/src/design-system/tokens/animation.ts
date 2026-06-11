/**
 * Design System — Animation Tokens
 * Single source of truth for all motion and timing values.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Duration Primitives
// ─────────────────────────────────────────────────────────────────────────────

export const DURATION = {
  /** 100ms — star rating scale, instant feedback */
  instant: 'duration-100',
  /** 150ms — hover state micro-transitions */
  micro: 'duration-150',
  /** 200ms — quick reveals, dropdowns, toasts */
  fast: 'duration-200',
  /** 300ms — standard component transitions */
  standard: 'duration-300',
  /** 500ms — SLA bar, progress fills */
  slow: 'duration-500',
  /** 1000ms — streaming progress */
  xslow: 'duration-1000',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Easing Primitives
// ─────────────────────────────────────────────────────────────────────────────

export const EASING = {
  /** Tailwind default linear */
  linear: 'ease-linear',
  /** Standard ease-in-out */
  inOut: 'ease-in-out',
  /** Fast ease-out — snappy exits */
  out: 'ease-out',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Transition Combinations
// ─────────────────────────────────────────────────────────────────────────────

/** Instant hover/scale micro-interaction */
export const TRANSITION_MICRO = `transition-all ${DURATION.micro} ${EASING.out}`;

/** Fast dropdown/badge reveal */
export const TRANSITION_FAST = `transition-all ${DURATION.fast}`;

/** Standard panel/card transition */
export const TRANSITION_STANDARD = `transition-all ${DURATION.standard} ${EASING.inOut}`;

/** SLA bar fill — slow, linear */
export const TRANSITION_SLA_BAR = `transition-all ${DURATION.xslow} ${EASING.linear}`;

// ─────────────────────────────────────────────────────────────────────────────
// Enter Animations (animate-in sequences)
// ─────────────────────────────────────────────────────────────────────────────

/** Quick fade — chat bubbles, small chips */
export const ENTER_FADE_FAST = `animate-in fade-in ${DURATION.fast}`;

/** Standard fade — screen transitions, drawers */
export const ENTER_FADE = `animate-in fade-in ${DURATION.standard}`;

/** Panel entrance — slides up from slight offset */
export const ENTER_PANEL = `animate-in fade-in slide-in-from-bottom-2 ${DURATION.standard}`;

/** Screen-level content entrance — larger slide */
export const ENTER_SCREEN = `animate-in fade-in slide-in-from-bottom-4 ${DURATION.standard}`;

/** Modal/dropdown entrance — scales in */
export const ENTER_MODAL = `animate-in fade-in zoom-in-95 ${DURATION.fast}`;

/** Toast notification entrance */
export const ENTER_TOAST = `animate-in fade-in slide-in-from-bottom-2 ${DURATION.fast}`;

/** Chat message entrance — subtle opacity */
export const ENTER_CHAT_MSG = `animate-in fade-in-50 ${DURATION.fast}`;

// ─────────────────────────────────────────────────────────────────────────────
// Pulse / Repeat Animations
// ─────────────────────────────────────────────────────────────────────────────

/** Standard animate-pulse for typing indicators / loading states */
export const PULSE = 'animate-pulse';

/** Pulse with slower timing for SLA near-breach warning */
export const PULSE_SLOW = 'animate-pulse duration-700';

/** Bounce for success confirmations */
export const BOUNCE = 'animate-bounce';
