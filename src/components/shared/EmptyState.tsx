'use client';

import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = ''
}: EmptyStateProps) {
  return (
    <div
      className={`text-center py-12 px-6 bg-slate-50/50 dark:bg-slate-900/10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center space-y-4 animate-fade-in-up ${className}`}
    >
      <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-full border border-slate-200/50 dark:border-slate-800 text-slate-400 dark:text-slate-500 shadow-inner">
        {icon || <Inbox className="w-6 h-6 stroke-[1.5]" />}
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-350">
          {title}
        </h4>
        <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      </div>
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}
