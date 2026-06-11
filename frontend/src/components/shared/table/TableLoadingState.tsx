'use client';

import React from 'react';

interface TableLoadingStateProps {
  columnsCount?: number;
  rowsCount?: number;
}

export function TableLoadingState({
  columnsCount = 5,
  rowsCount = 5,
}: TableLoadingStateProps) {
  const rows = Array.from({ length: rowsCount });
  const cols = Array.from({ length: columnsCount });

  return (
    <div className="w-full divide-y divide-slate-100 dark:divide-slate-800 animate-pulse">
      {rows.map((_, rowIndex) => (
        <div key={rowIndex} className="flex items-center gap-4 px-6 py-4">
          {/* Checkbox placeholder */}
          <div className="w-4 h-4 bg-slate-200 dark:bg-slate-800 rounded shrink-0" />
          
          {/* Columns placeholders */}
          {cols.map((_, colIndex) => {
            // Varying widths to look like real data
            const widthClass = colIndex % 3 === 0 
              ? 'w-1/4' 
              : colIndex % 3 === 1 
                ? 'w-1/3' 
                : 'w-1/6';
            
            return (
              <div
                key={colIndex}
                className={`h-3 bg-slate-200 dark:bg-slate-800 rounded-lg ${widthClass}`}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
