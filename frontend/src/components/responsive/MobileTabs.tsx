'use client';

import React from 'react';

export interface MobileTabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface MobileTabsProps {
  items: MobileTabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

/**
 * Horizontally scrollable tab strip for narrow viewports (queues, voice sub-tabs, etc.).
 */
export function MobileTabs({ items, activeId, onChange, className = '' }: MobileTabsProps) {
  return (
    <div
      className={`flex gap-1 overflow-x-auto overscroll-x-contain border-b border-slate-200 bg-slate-50/90 px-2 py-1.5 dark:border-slate-800 dark:bg-slate-900/40 ${className}`}
      role="tablist"
    >
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-[10px] font-bold transition-colors ${
              active
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            {item.icon}
            <span className="whitespace-nowrap">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
