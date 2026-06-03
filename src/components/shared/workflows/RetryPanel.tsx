'use client';

import React, { useEffect, useState } from 'react';
import { RotateCw, AlertTriangle } from 'lucide-react';

interface RetryPanelProps {
  errorDetail: string;
  errorDetailAr?: string;
  attempts: number;
  maxAttempts?: number;
  isRetrying: boolean;
  onRetry: () => void;
  isRtl?: boolean;
  disabled?: boolean;
}

export function RetryPanel({
  errorDetail,
  errorDetailAr,
  attempts,
  maxAttempts = 3,
  isRetrying,
  onRetry,
  isRtl = false,
  disabled = false,
}: RetryPanelProps) {
  const [progress, setProgress] = useState(0);

  // Simulated progress loader
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRetrying) {
      setProgress(0);
      const intervalTime = 40; // Total 1.5 seconds approximately
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            return 100;
          }
          return prev + 2.5;
        });
      }, intervalTime);
    } else {
      setProgress(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRetrying]);

  const errorMsg = isRtl && errorDetailAr ? errorDetailAr : errorDetail;

  return (
    <div
      className="p-4 bg-rose-50/50 dark:bg-rose-950/10 border border-rose-200 dark:border-rose-900/40 rounded-2xl text-xs space-y-3.5"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="flex items-start gap-2.5">
        <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-rose-800 dark:text-rose-450">
            {isRtl ? 'فشل عملية المزامنة' : 'Sync Process Failed'}
          </h4>
          <p className="text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
            {errorMsg}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1.5 border-t border-rose-100 dark:border-rose-950/45">
        {/* Attempt count details */}
        <div className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
          <span>{isRtl ? 'المحاولات:' : 'Sync Attempts:'}</span>
          <span className="font-mono bg-rose-100/60 dark:bg-rose-950/50 px-2 py-0.5 rounded-lg text-rose-700 dark:text-rose-400 font-bold">
            {attempts} / {maxAttempts}
          </span>
        </div>

        {/* Retry Button */}
        <button
          onClick={onRetry}
          disabled={isRetrying || disabled}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[10px] uppercase tracking-wider font-bold bg-rose-600 hover:bg-rose-700 text-white transition-all outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50 select-none shadow-sm shadow-rose-600/10 ${
            isRetrying || disabled ? 'disabled:bg-rose-400 opacity-60 cursor-not-allowed pointer-events-none' : ''
          }`}
          title={disabled ? "Requires Edit Permission" : undefined}
        >
          <RotateCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
          <span>{isRetrying ? (isRtl ? 'جاري إعادة المحاولة...' : 'Retrying...') : (isRtl ? 'إعادة المحاولة الآن' : 'Retry Now')}</span>
        </button>
      </div>

      {/* Progress slider simulation */}
      {isRetrying && (
        <div className="space-y-1 pt-1.5">
          <div className="flex justify-between text-[9px] font-bold text-rose-500 uppercase tracking-wider font-mono">
            <span>{isRtl ? 'جاري الاتصال بقاعدة المعرفة...' : 'Connecting base ingestion...'}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-205 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-500 rounded-full transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default RetryPanel;
