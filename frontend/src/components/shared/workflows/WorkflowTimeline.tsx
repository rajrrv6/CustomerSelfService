'use client';

import React from 'react';
import { Clock, User, CheckCircle2 } from 'lucide-react';

export interface TimelineEvent {
  status: string;
  date: string;
  updatedBy: string;
  notes?: string;
}

interface WorkflowTimelineProps {
  events?: TimelineEvent[];
  isRtl?: boolean;
}

export function WorkflowTimeline({ events = [], isRtl = false }: WorkflowTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-4 text-slate-405 dark:text-slate-500 text-xs italic">
        {isRtl ? 'لا يوجد سجل عمليات مسجل' : 'No workflow events logged.'}
      </div>
    );
  }

  return (
    <div className="relative text-xs space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Center timeline vertical bar */}
      <div
        className={`absolute top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-800 ${
          isRtl ? 'right-2.5' : 'left-2.5'
        }`}
      />

      <div className="space-y-4">
        {events.map((event, idx) => (
          <div
            key={idx}
            className={`relative flex gap-4 ${isRtl ? 'pr-8 pl-2' : 'pl-8 pr-2'}`}
          >
            {/* Timeline node point */}
            <div
              className={`absolute top-1 w-5.5 h-5.5 rounded-full border-2 border-white dark:border-slate-900 bg-blue-500 text-white flex items-center justify-center shadow-sm ${
                isRtl ? 'right-0' : 'left-0'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
            </div>

            {/* Event Details Card */}
            <div className="flex-1 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1.5 pb-1.5 border-b border-slate-100 dark:border-slate-900 text-[10px] text-slate-400 font-semibold font-mono uppercase">
                <span className="text-blue-600 dark:text-blue-400 font-bold">{event.status.replace('_', ' ')}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {event.date}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mt-2 font-medium">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{isRtl ? `تم التحديث بواسطة:` : `Updated by:`} <strong className="text-slate-800 dark:text-slate-200">{event.updatedBy}</strong></span>
              </div>

              {event.notes && (
                <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 mt-1.5 italic pl-0.5 bg-white/40 dark:bg-slate-900/40 p-1.5 rounded-xl border border-dashed border-slate-200/50 dark:border-slate-800/50">
                  "{event.notes}"
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default WorkflowTimeline;
