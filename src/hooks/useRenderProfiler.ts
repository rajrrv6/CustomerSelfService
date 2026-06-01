'use client';

import { useEffect, useRef } from 'react';

/**
 * useRenderProfiler — Development-only render frequency logging.
 * Logs render counts to the console to verify render boundaries and selector isolation.
 */
export function useRenderProfiler(componentName: string) {
  const renderCount = useRef(0);
  renderCount.current += 1;

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[RenderProfiler] ${componentName} rendered. Count: ${renderCount.current}`);
    }
  });
}
