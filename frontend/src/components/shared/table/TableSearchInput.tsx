'use client';

import React, { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';

interface TableSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function TableSearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
}: TableSearchInputProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      onChange(localValue);
    }, 250);
    return () => clearTimeout(handler);
  }, [localValue, onChange]);

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500 rtl:right-3 rtl:left-auto" />
      <input
        type="text"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-transparent py-2 pl-9 pr-8 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500/80 rtl:pr-9 rtl:pl-8"
      />
      {localValue && (
        <button
          type="button"
          onClick={() => setLocalValue('')}
          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-650 dark:hover:text-slate-350 rtl:left-3 rtl:right-auto"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
