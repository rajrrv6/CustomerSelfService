'use client';

import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info, ArrowRight } from 'lucide-react';

interface OperationalBannerProps {
  type: 'warning' | 'info' | 'error' | 'success';
  messageEn: string;
  messageAr: string;
  isRtl?: boolean;
  actionTextEn?: string;
  actionTextAr?: string;
  onAction?: () => void;
}

export function OperationalBanner({
  type,
  messageEn,
  messageAr,
  isRtl = false,
  actionTextEn,
  actionTextAr,
  onAction,
}: OperationalBannerProps) {
  const getBannerStyles = (t: typeof type) => {
    switch (t) {
      case 'warning':
        return {
          container: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300',
          icon: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
          action: 'bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200',
        };
      case 'error':
        return {
          container: 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 text-rose-850 dark:text-rose-350',
          icon: <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />,
          action: 'bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/40 dark:hover:bg-rose-900/60 text-rose-900 dark:text-rose-200',
        };
      case 'success':
        return {
          container: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300',
          icon: <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />,
          action: 'bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200',
        };
      case 'info':
      default:
        return {
          container: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/60 text-blue-800 dark:text-blue-300',
          icon: <Info className="w-4 h-4 text-blue-500 shrink-0" />,
          action: 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 text-blue-900 dark:text-blue-200',
        };
    }
  };

  const styles = getBannerStyles(type);
  const message = isRtl ? messageAr : messageEn;
  const actionText = isRtl ? actionTextAr : actionTextEn;

  return (
    <div
      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 border rounded-2xl text-xs font-semibold ${styles.container}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center gap-2.5">
        {styles.icon}
        <span className="leading-relaxed">{message}</span>
      </div>

      {actionText && onAction && (
        <button
          onClick={onAction}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-colors select-none text-[10px] uppercase tracking-wider shrink-0 border border-transparent outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 ${styles.action}`}
        >
          <span>{actionText}</span>
          <ArrowRight className={`w-3 h-3 ${isRtl ? 'rotate-180' : ''}`} />
        </button>
      )}
    </div>
  );
}

export default OperationalBanner;
