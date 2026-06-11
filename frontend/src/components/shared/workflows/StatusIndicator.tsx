'use client';

import React from 'react';

export type SystemStatusType =
  | 'online'
  | 'syncing'
  | 'stale'
  | 'degraded'
  | 'error'
  | 'complete'
  | 'pending'
  | 'disputed';

interface StatusIndicatorProps {
  status: SystemStatusType;
  customLabel?: string;
  customLabelAr?: string;
  isRtl?: boolean;
}

export function StatusIndicator({
  status,
  customLabel,
  customLabelAr,
  isRtl = false,
}: StatusIndicatorProps) {
  const getStatusStyles = (type: SystemStatusType) => {
    switch (type) {
      case 'online':
      case 'complete':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
          dot: 'bg-emerald-500 shadow-emerald-500/30',
          pulse: true,
          labelEn: 'Active',
          labelAr: 'نشط',
        };
      case 'syncing':
        return {
          bg: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900',
          dot: 'bg-blue-500 shadow-blue-500/30',
          pulse: true,
          labelEn: 'Syncing',
          labelAr: 'مزامنة',
        };
      case 'stale':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900',
          dot: 'bg-amber-500 shadow-amber-500/30',
          pulse: false,
          labelEn: 'Stale Data',
          labelAr: 'بيانات قديمة',
        };
      case 'degraded':
        return {
          bg: 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900',
          dot: 'bg-orange-500 shadow-orange-500/30',
          pulse: true,
          labelEn: 'Degraded',
          labelAr: 'أداء منخفض',
        };
      case 'error':
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900',
          dot: 'bg-rose-500 shadow-rose-500/30',
          pulse: true,
          labelEn: 'Failed',
          labelAr: 'فشل',
        };
      case 'disputed':
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900',
          dot: 'bg-rose-500 shadow-rose-500/30',
          pulse: false,
          labelEn: 'Disputed',
          labelAr: 'متنازع عليه',
        };
      case 'pending':
      default:
        return {
          bg: 'bg-slate-50 dark:bg-slate-900/50 text-slate-655 dark:text-slate-400 border-slate-200 dark:border-slate-800',
          dot: 'bg-slate-400 dark:bg-slate-500',
          pulse: false,
          labelEn: 'Pending Review',
          labelAr: 'قيد المراجعة',
        };
    }
  };

  const config = getStatusStyles(status);
  const label = isRtl
    ? customLabelAr || config.labelAr
    : customLabel || config.labelEn;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors select-none ${config.bg}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <span className="relative flex h-1.5 w-1.5">
        {config.pulse && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dot}`} />
        )}
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${config.dot}`} />
      </span>
      <span>{label}</span>
    </span>
  );
}

export default StatusIndicator;
