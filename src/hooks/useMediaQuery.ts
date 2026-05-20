'use client';

import { useEffect, useState } from 'react';

/**
 * Subscribes to a CSS media query. SSR-safe: returns `initial` until mounted.
 */
export function useMediaQuery(query: string, initial = false): boolean {
  const [matches, setMatches] = useState(initial);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** Tailwind `lg` breakpoint (1024px) — desktop operational layouts */
export function useIsDesktopOperational(): boolean {
  return useMediaQuery('(min-width: 1024px)', false);
}
