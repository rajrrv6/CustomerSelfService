'use client';

import React from 'react';

interface OperationalCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  loading?: boolean;
}

export function OperationalCard({
  children,
  className = '',
  hoverEffect = true,
  loading = false
}: OperationalCardProps) {
  const hoverClass = hoverEffect
    ? 'hover-lift hover:border-slate-350 dark:hover:border-slate-700 transition-all duration-200'
    : '';
  return (
    <div
      className={`bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 ${hoverClass} ${className}`}
    >
      {loading ? (
        <div className="space-y-4">
          <div className="h-5 rounded-md w-1/3 animate-shimmer"></div>
          <div className="space-y-2">
            <div className="h-3.5 rounded-md animate-shimmer"></div>
            <div className="h-3.5 rounded-md w-5/6 animate-shimmer"></div>
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
