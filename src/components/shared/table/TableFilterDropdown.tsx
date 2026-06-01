'use client';

import React from 'react';

export interface FilterOption {
  label: string;
  value: string;
}

interface TableFilterDropdownProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  className?: string;
}

export function TableFilterDropdown({
  label,
  value,
  onChange,
  options,
  className = '',
}: TableFilterDropdownProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono shrink-0">
        {label}:
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-xs font-bold text-slate-750 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:focus:border-blue-500/80 cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
