'use client';

import React from 'react';

interface AdaptiveSplitPaneProps {
  /** Narrow-first: stacked; `lg:` becomes row */
  children: React.ReactNode;
  className?: string;
}

/**
 * Column on mobile, row from `lg` — wrapper only; side widths live on children.
 */
export function AdaptiveSplitPane({ children, className = '' }: AdaptiveSplitPaneProps) {
  return <div className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:flex-row ${className}`}>{children}</div>;
}
