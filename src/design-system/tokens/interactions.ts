/**
 * Design System — Interaction Utility Tokens
 * Pre-composed class strings for common interactive patterns.
 * Import and spread into className strings.
 */

import {
  TRANSITION_STANDARD, TRANSITION_MICRO, TRANSITION_FAST,
  ENTER_FADE, ENTER_PANEL, ENTER_MODAL, ENTER_TOAST,
  ENTER_CHAT_MSG, ENTER_SCREEN, ENTER_FADE_FAST, PULSE
} from './animation';
import {
  FOCUS_RING, FOCUS_RING_CARD, FOCUS_RING_INSET, FOCUS_LINK
} from './focus';
import { OVERLAY_DRAWER, OVERLAY_MODAL } from './overlay';
import { SURFACE_PANEL } from './surfaces';

// ─────────────────────────────────────────────────────────────────────────────
// Drawer Transitions
// ─────────────────────────────────────────────────────────────────────────────

/** Slide-over panel from the right (LTR) */
export const DRAWER_ENTER_LTR = `${TRANSITION_STANDARD} animate-in slide-in-from-right-4`;

/** Slide-over panel from the left (RTL) */
export const DRAWER_ENTER_RTL = `${TRANSITION_STANDARD} animate-in slide-in-from-left-4`;

/** Drawer backdrop overlay */
export const DRAWER_BACKDROP = `${OVERLAY_DRAWER} cursor-pointer`;

// ─────────────────────────────────────────────────────────────────────────────
// Modal Transitions
// ─────────────────────────────────────────────────────────────────────────────

/** Fullscreen modal overlay */
export const MODAL_OVERLAY = `${OVERLAY_MODAL} z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4`;

/** Modal content panel entrance */
export const MODAL_CONTENT_ENTER = ENTER_MODAL;

// ─────────────────────────────────────────────────────────────────────────────
// Screen / Panel Transitions
// ─────────────────────────────────────────────────────────────────────────────

/** Standard screen-level fade in */
export const SCREEN_ENTER = ENTER_SCREEN;

/** Panel reveal (smaller offset) */
export const PANEL_ENTER = ENTER_PANEL;

/** Quick reveal for dropdowns/badges */
export const REVEAL_FAST = ENTER_FADE_FAST;

// ─────────────────────────────────────────────────────────────────────────────
// Tooltip Transitions
// ─────────────────────────────────────────────────────────────────────────────

/** Tooltip appearance */
export const TOOLTIP_ENTER = `${ENTER_FADE_FAST} scale-in-95`;

// ─────────────────────────────────────────────────────────────────────────────
// Typing Animations
// ─────────────────────────────────────────────────────────────────────────────

/** AI typing indicator dot pulse */
export const TYPING_PULSE = PULSE;

/** Streaming cursor blink */
export const STREAMING_CURSOR = 'animate-pulse duration-700';

// ─────────────────────────────────────────────────────────────────────────────
// Toast / Notification Transitions
// ─────────────────────────────────────────────────────────────────────────────

/** Toast notification entrance */
export const TOAST_ENTER = ENTER_TOAST;

// ─────────────────────────────────────────────────────────────────────────────
// Hover Transitions
// ─────────────────────────────────────────────────────────────────────────────

/** Standard hover transition — most cards and buttons */
export const HOVER_TRANSITION = TRANSITION_STANDARD;

/** Micro hover transition — icon buttons, star ratings */
export const HOVER_MICRO = TRANSITION_MICRO;

/** Card hover lift effect */
export const HOVER_LIFT = `${TRANSITION_STANDARD} hover:-translate-y-1 hover:shadow-xl`;

// ─────────────────────────────────────────────────────────────────────────────
// Chat Message Transitions
// ─────────────────────────────────────────────────────────────────────────────

/** Chat bubble entrance animation */
export const CHAT_MSG_ENTER = ENTER_CHAT_MSG;

// ─────────────────────────────────────────────────────────────────────────────
// Compound Interactive Patterns
// ─────────────────────────────────────────────────────────────────────────────

/** Standard interactive card: hover border + focus ring */
export const INTERACTIVE_CARD = `${TRANSITION_STANDARD} hover:border-blue-400 dark:hover:border-blue-500/60 hover:shadow-sm ${FOCUS_RING_CARD} cursor-pointer`;

/** Standard primary button interaction */
export const INTERACTIVE_BTN_PRIMARY = `${TRANSITION_FAST} ${FOCUS_RING} hover:scale-[1.02] active:scale-[0.98]`;

/** Standard secondary/ghost button interaction */
export const INTERACTIVE_BTN_GHOST = `${TRANSITION_FAST} ${FOCUS_RING} hover:bg-slate-100 dark:hover:bg-slate-800`;

/** Link-style interaction */
export const INTERACTIVE_LINK = `${TRANSITION_MICRO} ${FOCUS_LINK} hover:underline`;

/** Standard panel fade-in entrance + surface */
export const PAGE_PANEL = `${SURFACE_PANEL} ${ENTER_FADE}`;
