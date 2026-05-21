import React from 'react';
import { voiceHeatmapMatrix, heatmapHours, heatmapDays } from '@/data/seed/voiceMetricsSeed';

export function HeatmapGrid() {
  // Helper to determine background color based on density value (0 to 100)
  const getHeatColor = (value: number) => {
    if (value === 0) return 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800';
    if (value < 20) return 'bg-blue-50 dark:bg-blue-950/20 text-blue-900 border-blue-100 dark:border-blue-950/30';
    if (value < 50) return 'bg-blue-100 dark:bg-blue-950/40 text-blue-900 border-blue-200 dark:border-blue-950/60';
    if (value < 75) return 'bg-blue-500 text-white border-blue-600';
    return 'bg-blue-700 text-white border-blue-800 animate-pulse'; // Peak load
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
      <div>
        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none">Weekly Queue Traffic Heatmap</h4>
        <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-1">Average hourly queue arrivals over a 7-day period. Darker blocks represent peak hours.</p>
      </div>

      <div className="overflow-x-auto min-w-0">
        <div className="min-w-[640px] p-1">
          {/* Days Header */}
          <div className="grid grid-cols-8 gap-1.5 text-center font-bold font-mono text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            <div className="text-start">Time Period</div>
            {heatmapDays.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Grid Rows */}
          <div className="space-y-1.5">
            {heatmapHours.map((hourLabel, rowIdx) => (
              <div key={hourLabel} className="grid grid-cols-8 gap-1.5 items-center">
                {/* Hour Label */}
                <div className="text-[9px] font-bold font-mono text-slate-500 dark:text-slate-400 text-start truncate">
                  {hourLabel}
                </div>

                {/* Heatmap cells */}
                {voiceHeatmapMatrix[rowIdx].map((val, colIdx) => {
                  const dayLabel = heatmapDays[colIdx];
                  const ariaDesc = `Time ${hourLabel} on ${dayLabel}: queue index is ${val}%.`;
                  
                  return (
                    <div
                      key={colIdx}
                      tabIndex={0}
                      aria-label={ariaDesc}
                      className={`h-7 rounded-lg border flex items-center justify-center text-[8px] font-mono font-bold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${getHeatColor(val)}`}
                      title={`${hourLabel} | ${dayLabel}: ${val}% capacity`}
                    >
                      {val}%
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-3 pt-4 text-[9px] font-bold text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded" />
              <span>Offline (0%)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-blue-100 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-950/60 rounded" />
              <span>Low (1-49%)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-blue-500 border border-blue-600 rounded" />
              <span>Moderate (50-74%)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-blue-700 border border-blue-800 rounded" />
              <span>Peak (&gt;75%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
