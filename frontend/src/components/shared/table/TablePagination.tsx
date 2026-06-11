'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Table } from '@tanstack/react-table';

interface TablePaginationProps<TData> {
  table: Table<TData>;
  lang: 'en' | 'ar';
}

export function TablePagination<TData>({ table, lang }: TablePaginationProps<TData>) {
  const isRtl = lang === 'ar';
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const totalRows = table.getFilteredRowModel().rows.length;
  const pageCount = table.getPageCount();

  const startRow = pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, totalRows);

  const formatText = (en: string, ar: string) => (isRtl ? ar : en);

  // Chevron components swap directions in RTL
  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;
  const FirstIcon = isRtl ? ChevronsRight : ChevronsLeft;
  const LastIcon = isRtl ? ChevronsLeft : ChevronsRight;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-b-2xl">
      {/* Items status */}
      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
        {totalRows > 0 ? (
          <span>
            {formatText('Showing', 'عرض')}{' '}
            <span className="font-bold text-slate-800 dark:text-slate-200">{startRow}</span>{' '}
            {formatText('to', 'إلى')}{' '}
            <span className="font-bold text-slate-800 dark:text-slate-200">{endRow}</span>{' '}
            {formatText('of', 'من')}{' '}
            <span className="font-bold text-slate-800 dark:text-slate-200">{totalRows}</span>{' '}
            {formatText('entries', 'سجلات')}
          </span>
        ) : (
          <span>{formatText('No entries to display', 'لا توجد سجلات لعرضها')}</span>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        {/* Page size selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {formatText('Rows per page:', 'سجلات لكل صفحة:')}
          </span>
          <select
            value={pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className="rounded-xl border border-slate-200 bg-transparent px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 dark:focus:border-blue-500/80 cursor-pointer"
          >
            {[5, 10, 20, 30, 40, 50].map((size) => (
              <option key={size} value={size} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                {size}
              </option>
            ))}
          </select>
        </div>

        {/* Page indicators & Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {formatText('Page', 'الصفحة')}{' '}
            <span className="font-bold text-slate-800 dark:text-slate-200">{totalRows > 0 ? pageIndex + 1 : 0}</span>{' '}
            {formatText('of', 'من')}{' '}
            <span className="font-bold text-slate-800 dark:text-slate-200">{pageCount}</span>
          </span>

          <div className="flex items-center gap-1.5 ml-2 rtl:ml-0 rtl:mr-2">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent dark:border-slate-800 dark:hover:bg-slate-850 dark:disabled:hover:bg-transparent text-slate-650 dark:text-slate-350 transition-colors cursor-pointer"
              title={formatText('First Page', 'الصفحة الأولى')}
            >
              <FirstIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent dark:border-slate-800 dark:hover:bg-slate-850 dark:disabled:hover:bg-transparent text-slate-650 dark:text-slate-350 transition-colors cursor-pointer"
              title={formatText('Previous Page', 'الصفحة السابقة')}
            >
              <PrevIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent dark:border-slate-800 dark:hover:bg-slate-850 dark:disabled:hover:bg-transparent text-slate-650 dark:text-slate-350 transition-colors cursor-pointer"
              title={formatText('Next Page', 'الصفحة التالية')}
            >
              <NextIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => table.setPageIndex(pageCount - 1)}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent dark:border-slate-800 dark:hover:bg-slate-850 dark:disabled:hover:bg-transparent text-slate-650 dark:text-slate-350 transition-colors cursor-pointer"
              title={formatText('Last Page', 'الصفحة الأخيرة')}
            >
              <LastIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
