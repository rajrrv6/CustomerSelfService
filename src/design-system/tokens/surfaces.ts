/**
 * Design System — Glassmorphism Surface Tokens
 * Frosted glass surfaces used across cards, quick actions, and overlays.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Glass Card Surfaces
// ─────────────────────────────────────────────────────────────────────────────

/** Standard glass card — QuickActions, EnterpriseStates */
export const GLASS_CARD = 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200 dark:border-slate-800/80';

/** Lighter glass — tooltips, inline callouts */
export const GLASS_LIGHT = 'bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-white/30 dark:border-slate-700/50';

/** Dark glass — AI assistant thought bubbles, sidebar items */
export const GLASS_DARK = 'bg-slate-900/80 backdrop-blur-md border border-slate-700/60';

/** Branded glass — AI copilot hero, header banners */
export const GLASS_BRAND = 'bg-blue-600/10 backdrop-blur-md border border-blue-500/20';

// ─────────────────────────────────────────────────────────────────────────────
// Solid Enterprise Surfaces (no blur)
// ─────────────────────────────────────────────────────────────────────────────

/** Standard panel — ticket detail, settings, article view */
export const SURFACE_PANEL = 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800';

/** Muted panel — nested content sections, description blocks */
export const SURFACE_MUTED = 'bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900';

/** Workspace panel — 3-panel workspaces (AI, Support, Ticket) */
export const SURFACE_WORKSPACE = 'bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800';
