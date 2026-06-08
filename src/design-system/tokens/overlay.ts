/**
 * Design System — Overlay Tokens
 * Backdrop blur and overlay opacity levels for modals, drawers, and slide-overs.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Backdrop Overlays
// ─────────────────────────────────────────────────────────────────────────────

/** Standard mobile drawer backdrop — matches LiveSupportWorkspace, KnowledgeFilters */
export const OVERLAY_DRAWER = 'absolute inset-0 bg-slate-900/50 backdrop-blur-xs';

/** Dark fullscreen modal backdrop — matches SubmitTicketModal */
export const OVERLAY_MODAL = 'fixed inset-0 bg-black/50 backdrop-blur-sm';

/** Lighter modal backdrop — hover/secondary confirmations */
export const OVERLAY_LIGHT = 'fixed inset-0 bg-slate-900/30 backdrop-blur-xs';

// ─────────────────────────────────────────────────────────────────────────────
// Surface Opacity Levels (for tinted content panels)
// ─────────────────────────────────────────────────────────────────────────────

/** Success tint surface — resolved tickets, feedback thank-you */
export const TINT_SUCCESS = 'bg-emerald-500/5 border border-emerald-500/20';

/** Info tint surface — AI suggestions, partial feedback state */
export const TINT_INFO = 'bg-blue-500/5 border border-blue-500/15';

/** Warning tint surface — SLA near-breach, amber states */
export const TINT_WARNING = 'bg-amber-500/5 border border-amber-500/20';

/** Danger tint surface — SLA breach, error states */
export const TINT_DANGER = 'bg-rose-500/5 border border-rose-500/20';

/** Accent tint surface — AI copilot suggestions, violet contexts */
export const TINT_ACCENT = 'bg-violet-50/60 dark:bg-violet-900/10 border border-violet-200 dark:border-violet-800/40';
