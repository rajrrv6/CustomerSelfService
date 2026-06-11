'use client';

import React, { useState } from 'react';
import { Eye, ChevronDown } from 'lucide-react';
import { Table } from '@tanstack/react-table';

interface TableColumnVisibilityProps<TData> {
  table: Table<TData>;
  className?: string;
  lang: 'en' | 'ar';
}

export function TableColumnVisibility<TData>({
  table,
  className = '',
  lang,
}: TableColumnVisibilityProps<TData>) {
  const [isOpen, setIsOpen] = useState(false);

  const columns = table.getAllLeafColumns().filter(
    (column) => typeof column.accessorFn !== 'undefined' && column.getCanHide()
  );

  if (columns.length === 0) return null;

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10.5px] font-bold rounded-xl transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
      >
        <Eye className="w-3.5 h-3.5" />
        <span>{lang === 'ar' ? 'عرض الأعمدة' : 'Columns'}</span>
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-40 animate-in fade-in-50 slide-in-from-top-3 rtl:left-0 rtl:right-auto">
            <div className="px-3 py-1 text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
              {lang === 'ar' ? 'تبديل رؤية الأعمدة' : 'Toggle Columns'}
            </div>
            <div className="max-h-52 overflow-y-auto mt-1 px-1 space-y-0.5">
              {columns.map((column) => {
                const label = column.columnDef.header;
                const displayLabel = typeof label === 'string' ? label : column.id;
                
                return (
                  <label
                    key={column.id}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850/50 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={column.getIsVisible()}
                      onChange={column.getToggleVisibilityHandler()}
                      className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                    />
                    <span className="truncate">{displayLabel}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
