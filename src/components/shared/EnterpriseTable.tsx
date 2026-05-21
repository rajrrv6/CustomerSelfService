'use client';

import React from 'react';
import { EmptyState } from './EmptyState';

export interface HeaderItem {
  key: string;
  label: string;
  className?: string;
}

interface EnterpriseTableProps {
  headers: (string | HeaderItem)[];
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
  empty?: boolean;
  emptyTitle?: string;
  emptyDesc?: string;
}

export function EnterpriseTable({
  headers,
  children,
  className = '',
  loading = false,
  empty = false,
  emptyTitle = 'No Records',
  emptyDesc = 'There are no active records in this list.'
}: EnterpriseTableProps) {
  return (
    <div
      className={`bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm min-w-0 ${className}`}
    >
      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <table className="w-full min-w-max border-collapse text-start text-xs text-slate-500 dark:text-slate-400">
          <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-350 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              {headers.map((header, idx) => {
                const isObject = typeof header === 'object';
                const label = isObject ? header.label : header;
                const customClass = isObject ? header.className : '';
                return (
                  <th key={idx} className={`px-6 py-4 text-start ${customClass}`}>
                    {label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {loading ? (
              Array.from({ length: 4 }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  {headers.map((_, cIdx) => (
                    <td key={cIdx} className="px-6 py-4.5">
                      <div
                        className="h-3.5 rounded-md animate-shimmer"
                        style={{
                          width:
                            cIdx === 0
                              ? '50%'
                              : cIdx === headers.length - 1
                              ? '35%'
                              : '75%',
                        }}
                      ></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              !empty && children
            )}
          </tbody>
        </table>
      </div>
      {!loading && empty && (
        <div className="border-t border-slate-200 dark:border-slate-800">
          <EmptyState
            title={emptyTitle}
            description={emptyDesc}
            className="rounded-t-none border-none bg-transparent"
          />
        </div>
      )}
    </div>
  );
}
