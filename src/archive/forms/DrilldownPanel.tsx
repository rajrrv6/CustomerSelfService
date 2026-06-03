'use client';

import React from 'react';

export interface DrilldownProperty {
  labelEn: string;
  labelAr: string;
  value: string | number | React.ReactNode;
  isCode?: boolean;
}

interface DrilldownPanelProps {
  properties: DrilldownProperty[];
  isRtl?: boolean;
  cols?: 1 | 2 | 3 | 4;
}

export function DrilldownPanel({
  properties,
  isRtl = false,
  cols = 3,
}: DrilldownPanelProps) {
  const getGridColsClass = (c: number) => {
    switch (c) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 sm:grid-cols-2';
      case 4:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4';
      case 3:
      default:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
    }
  };

  return (
    <div
      className={`grid gap-3.5 p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-805/50 rounded-2xl ${getGridColsClass(
        cols
      )}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {properties.map((prop, idx) => (
        <div
          key={idx}
          className="flex flex-col gap-1 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
        >
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {isRtl ? prop.labelAr : prop.labelEn}
          </span>
          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
            {prop.isCode ? (
              <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-blue-600 dark:text-blue-400 select-all border border-slate-200/50 dark:border-slate-700/50">
                {prop.value}
              </code>
            ) : (
              prop.value
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default DrilldownPanel;
