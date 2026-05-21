'use client';

import React from 'react';

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  description,
  action,
  className = ''
}: SectionHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${className}`}>
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white transition-colors">
          {title}
        </h2>
        {description && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 transition-colors">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex items-center gap-2.5 shrink-0">{action}</div>}
    </div>
  );
}
