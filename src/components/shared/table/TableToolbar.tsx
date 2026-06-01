'use client';

import React from 'react';
import { Table } from '@tanstack/react-table';
import { TableSearchInput } from './TableSearchInput';
import { TableFilterDropdown } from './TableFilterDropdown';
import { TableColumnVisibility } from './TableColumnVisibility';
import { LayoutGrid, Maximize2, Minimize2 } from 'lucide-react';

interface TableToolbarProps<TData> {
  table: Table<TData>;
  lang: 'en' | 'ar';
  
  // Search
  enableSearch?: boolean;
  searchPlaceholder?: string;
  globalFilter: string;
  setGlobalFilter: (val: string) => void;
  
  // Filters
  filterOptions?: {
    columnId: string;
    label: string;
    options: { label: string; value: string }[];
  }[];
  
  // Column visibility
  enableColumnVisibility?: boolean;
  
  // Density
  density: 'compact' | 'normal' | 'spacious';
  setDensity: (density: 'compact' | 'normal' | 'spacious') => void;
}

export function TableToolbar<TData>({
  table,
  lang,
  enableSearch = true,
  searchPlaceholder,
  globalFilter,
  setGlobalFilter,
  filterOptions = [],
  enableColumnVisibility = true,
  density,
  setDensity,
}: TableToolbarProps<TData>) {
  const isRtl = lang === 'ar';
  const formatText = (en: string, ar: string) => (isRtl ? ar : en);

  const densities: { value: 'compact' | 'normal' | 'spacious'; label: string; icon: any }[] = [
    { value: 'compact', label: formatText('Compact', 'مدمج'), icon: Minimize2 },
    { value: 'normal', label: formatText('Normal', 'عادي'), icon: LayoutGrid },
    { value: 'spacious', label: formatText('Spacious', 'متسع'), icon: Maximize2 },
  ];

  return (
    <div className="flex flex-col gap-4 p-4 bg-white dark:bg-slate-900 border-b border-slate-205 dark:border-slate-800 rounded-t-2xl sm:flex-row sm:items-center sm:justify-between">
      {/* Left items: Search and Filter select components */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center flex-1">
        {enableSearch && (
          <TableSearchInput
            value={globalFilter}
            onChange={setGlobalFilter}
            placeholder={searchPlaceholder || formatText('Search records...', 'البحث في السجلات...')}
            className="w-full sm:w-64 shrink-0"
          />
        )}

        <div className="flex flex-wrap items-center gap-3">
          {filterOptions.map((filter) => {
            // Read column filters value
            const currentFilterValue = (table.getColumn(filter.columnId)?.getFilterValue() as string) || '';
            
            return (
              <TableFilterDropdown
                key={filter.columnId}
                label={filter.label}
                value={currentFilterValue}
                onChange={(val) => {
                  table.getColumn(filter.columnId)?.setFilterValue(val === '' ? undefined : val);
                }}
                options={filter.options}
              />
            );
          })}
        </div>
      </div>

      {/* Right items: Density Toggle & Column Visibility */}
      <div className="flex items-center gap-2 self-end sm:self-auto">
        {/* Density Selector */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          {densities.map((d) => {
            const Icon = d.icon;
            const active = density === d.value;
            return (
              <button
                key={d.value}
                type="button"
                onClick={() => setDensity(d.value)}
                className={`p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer ${
                  active ? 'bg-white dark:bg-slate-900 shadow-sm text-blue-600 dark:text-blue-500 border border-slate-200/50 dark:border-slate-800/50' : 'opacity-70'
                }`}
                title={d.label}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            );
          })}
        </div>

        {/* Column Visibility dropdown */}
        {enableColumnVisibility && (
          <TableColumnVisibility table={table} lang={lang} />
        )}
      </div>
    </div>
  );
}
