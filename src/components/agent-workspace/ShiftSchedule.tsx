import React from 'react';
import { Calendar } from 'lucide-react';
import { ShiftDay } from '@/data/seed/agentMetricsSeed';

interface ShiftScheduleProps {
  schedule: ShiftDay[];
}

export function ShiftSchedule({ schedule }: ShiftScheduleProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm text-xs font-semibold">
      <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-850">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-500" />
          <h3 className="font-bold text-slate-800 dark:text-white">Shift & Schedule Planner</h3>
        </div>
        <span className="text-[10px] text-slate-400 font-mono uppercase">Zone: AST (UTC+3)</span>
      </div>

      <div className="space-y-2.5">
        {schedule.map((day, idx) => (
          <div
            key={idx}
            className={`flex justify-between items-center p-3 rounded-xl border ${
              day.status === 'work'
                ? 'bg-blue-50/20 dark:bg-blue-900/5 border-slate-150 dark:border-slate-800/60'
                : day.status === 'training'
                ? 'bg-purple-50/20 dark:bg-purple-900/5 border-purple-100 dark:border-purple-900/30'
                : 'bg-slate-50/40 dark:bg-slate-950/20 border-slate-100 dark:border-slate-850'
            }`}
          >
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block">{day.day}</span>
              <span className="text-[10px] text-slate-400 font-normal mt-0.5 block">{day.hours}</span>
            </div>

            <div>
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${
                day.status === 'work'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400'
                  : day.status === 'training'
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-400'
                  : 'bg-slate-100 text-slate-500'
              }`}>
                {day.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
