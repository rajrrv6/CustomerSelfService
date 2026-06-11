/**
 * Design System — Token Registry (Barrel Export)
 *
 * Import from here in all customer-portal components:
 *   import { FOCUS_RING, ENTER_PANEL, SURFACE_PANEL, Z } from '@/design-system/tokens';
 */

// Animation: durations, easing, enter sequences, pulse
export * from './animation';

// Focus: primary, card, danger, success, warning, neutral, link
export * from './focus';

// Z-Index: base → top layering system
export * from './zIndex';

// Overlays: drawer/modal backdrops, tint surfaces
export * from './overlay';

// Border Radii: pill → lg
export * from './radii';

// Shadows: xs → 2xl, colored semantic variants
export * from './shadows';

// Gradients: brand, status, wash
export * from './gradients';

// Surfaces: glass, solid enterprise panels
export * from './surfaces';

// Spacing: padding scales, gap, space-y
export * from './spacing';

// Interactions: composed utility patterns (drawers, modals, cards, buttons)
export * from './interactions';
