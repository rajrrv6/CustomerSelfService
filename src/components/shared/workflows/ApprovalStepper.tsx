'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface ApprovalStepperProps {
  steps: { labelEn: string; labelAr: string; key: string }[];
  currentStepKey: string;
  isRtl?: boolean;
}

export function ApprovalStepper({ steps, currentStepKey, isRtl = false }: ApprovalStepperProps) {
  const currentIndex = steps.findIndex((s) => s.key === currentStepKey);

  return (
    <div className="w-full py-4 overflow-x-auto select-none" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between min-w-[500px] px-2 text-xs font-bold">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isActive = idx === currentIndex;

          return (
            <React.Fragment key={step.key}>
              {/* Stepper Node */}
              <div className="flex flex-col items-center flex-1 relative group">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all font-mono font-bold ${
                    isCompleted
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : isActive
                      ? 'border-blue-500 bg-white text-blue-600 dark:bg-slate-900 dark:text-blue-450 ring-4 ring-blue-500/10'
                      : 'border-slate-205 dark:border-slate-800 bg-slate-50 text-slate-400 dark:bg-slate-950 dark:text-slate-600'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                <span
                  className={`mt-2 font-bold text-[10px] text-center max-w-[90px] whitespace-normal truncate ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : isCompleted
                      ? 'text-slate-700 dark:text-slate-350'
                      : 'text-slate-400 dark:text-slate-600'
                  }`}
                >
                  {isRtl ? step.labelAr : step.labelEn}
                </span>
              </div>

              {/* Stepper connector line */}
              {idx < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 transition-all ${
                    idx < currentIndex
                      ? 'bg-blue-600'
                      : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                  style={{
                    marginLeft: isRtl ? '-1.5rem' : '1.5rem',
                    marginRight: isRtl ? '1.5rem' : '-1.5rem',
                    transform: 'translateY(-14px)',
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
export default ApprovalStepper;
