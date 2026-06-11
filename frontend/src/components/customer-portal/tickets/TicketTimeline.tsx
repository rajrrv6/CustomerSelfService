import React from 'react';
import { TicketTimelineStep } from '../support/types';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface TicketTimelineProps {
  isRtl: boolean;
  steps: TicketTimelineStep[];
}

const STATUS_NODE = {
  completed: 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30',
  current: 'bg-blue-600 text-white ring-4 ring-blue-500/20',
  pending: 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-2 border-slate-200 dark:border-slate-700'
};

const STATUS_LABEL = {
  completed: 'text-slate-700 dark:text-slate-300',
  current: 'text-blue-600 dark:text-blue-400',
  pending: 'text-slate-400 dark:text-slate-500'
};

const STATUS_CONNECTOR = {
  completed: 'bg-emerald-400',
  current: 'bg-blue-300 dark:bg-blue-800',
  pending: 'bg-slate-200 dark:bg-slate-800'
};

export function TicketTimeline({ isRtl, steps }: TicketTimelineProps) {
  return (
    <div className="space-y-3" dir={isRtl ? 'rtl' : 'ltr'}>
      <h5 className="font-bold text-[9px] text-slate-400 uppercase tracking-widest font-mono">
        {isRtl ? 'جدول تقدم حالة التذكرة' : 'Case Resolution Progress'}
      </h5>

      <div className="relative space-y-0 pt-1">
        {steps.map((step, idx) => {
          const isCompleted = step.status === 'completed';
          const isCurrent = step.status === 'current';
          const isLast = idx === steps.length - 1;

          return (
            <div key={step.id} className="flex gap-3 relative" style={{ paddingBottom: isLast ? 0 : '20px' }}>
              {/* Vertical connector line */}
              {!isLast && (
                <div
                  className={`absolute top-5 bottom-0 w-0.5 transition-colors duration-500 ${STATUS_CONNECTOR[step.status]} ${isRtl ? 'right-[7px]' : 'left-[7px]'}`}
                />
              )}

              {/* Status node */}
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 z-10 transition-all duration-300 mt-0.5 ${STATUS_NODE[step.status]} ${isCurrent ? 'animate-pulse' : ''}`}
                aria-label={`${step.label} — ${step.status}`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-2.5 h-2.5" />
                ) : isCurrent ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                )}
              </div>

              {/* Step content */}
              <div className="flex-1 min-w-0 pb-0.5">
                <div className="flex items-start justify-between gap-2">
                  <h6 className={`font-extrabold text-[11px] leading-tight ${STATUS_LABEL[step.status]}`}>
                    {step.label}
                  </h6>
                  {step.timestamp && (
                    <span className="text-[8px] text-slate-400 font-mono tracking-wide shrink-0 mt-0.5 whitespace-nowrap">
                      {step.timestamp}
                    </span>
                  )}
                </div>
                {step.description && (
                  <p className="text-[9.5px] text-slate-400 dark:text-slate-500 font-normal mt-1 leading-relaxed">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default TicketTimeline;
