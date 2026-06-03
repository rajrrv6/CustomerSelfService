'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical } from 'lucide-react';

export interface RowAction {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'success';
}

interface TableRowActionMenuProps {
  actions: RowAction[];
  lang: 'en' | 'ar';
  className?: string;
}

export function TableRowActionMenu({
  actions,
  lang,
  className = '',
}: TableRowActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isRtl = lang === 'ar';

  // Toggle open state
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (actions.length === 0) return null;

  return (
    <div className={`relative inline-block text-left ${className}`} ref={menuRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="flex items-center justify-center p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850/60 text-slate-500 hover:text-slate-700 dark:text-slate-450 dark:hover:text-slate-300 transition-colors cursor-pointer"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          className={`absolute mt-1 w-44 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl py-1.5 z-40 animate-in fade-in duration-100 ${
            isRtl ? 'left-0 origin-top-left' : 'right-0 origin-top-right'
          }`}
          role="menu"
        >
          {actions.map((action) => {
            const Icon = action.icon;
            const isDanger = action.variant === 'danger';
            const isSuccess = action.variant === 'success';

            let actionColorClass = 'text-slate-750 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850/50';
            if (isDanger) {
              actionColorClass = 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30';
            } else if (isSuccess) {
              actionColorClass = 'text-green-650 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950/30';
            }

            return (
              <button
                key={action.id}
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  action.onClick();
                }}
                className={`flex w-full items-center gap-2 px-3.5 py-2 text-xs font-semibold transition-colors text-left cursor-pointer rtl:text-right ${actionColorClass}`}
                role="menuitem"
              >
                {Icon && <Icon className="w-4 h-4 opacity-80 shrink-0" />}
                <span className="truncate">{action.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
