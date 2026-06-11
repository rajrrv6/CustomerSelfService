'use client';

/**
 * useResponsiveLayout — Named breakpoint hook built on useMediaQuery.
 *
 * Replaces scattered magic pixel values across workspace components
 * with semantic, named breakpoints that match the Tailwind config.
 *
 * Previously components had direct checks like:
 *   window.innerWidth < 768 (magic number, not reactive)
 *   className="hidden lg:block" (CSS-only, not available to JS logic)
 *
 * This hook provides reactive JS breakpoint flags for conditional
 * rendering decisions that cannot be handled by CSS alone (e.g.,
 * deciding whether to render a MobileSheet or a sidebar panel).
 *
 * All values match Tailwind's default breakpoints:
 *   sm: 640px, md: 768px, lg: 1024px, xl: 1280px
 */

import { useMediaQuery } from '@/hooks/useMediaQuery';

interface ResponsiveLayout {
  /** < 640px — small mobile */
  isSmall: boolean;
  /** >= 640px && < 1024px — tablet / phablet */
  isTablet: boolean;
  /** >= 1024px — desktop operational layouts */
  isDesktop: boolean;
  /** < 1024px — mobile or tablet (show MobileSheet, MobileTabs) */
  isMobile: boolean;
}

export function useResponsiveLayout(): ResponsiveLayout {
  const isSmall = useMediaQuery('(max-width: 639px)', false);
  const isDesktop = useMediaQuery('(min-width: 1024px)', false);
  const isTablet = !isSmall && !isDesktop;
  const isMobile = !isDesktop;

  return {
    isSmall,
    isTablet,
    isDesktop,
    isMobile,
  };
}
