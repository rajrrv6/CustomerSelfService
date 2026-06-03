'use client';

import React from 'react';
import { useUIStore } from '@/stores/uiStore';

export type TelephonyStatus = 'active' | 'inactive' | 'degraded' | 'reserved' | 'assigned' | 'connecting' | 'available';

interface TelephonyStatusBadgeProps {
  status: TelephonyStatus;
}

export function TelephonyStatusBadge({ status }: TelephonyStatusBadgeProps) {
  const lang = useUIStore((s) => s.lang);
  const isRtl = lang === 'ar';

  const config: Record<TelephonyStatus, { en: string; ar: string; classes: string }> = {
    active: {
      en: 'Active',
      ar: 'نشط',
      classes: 'bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
    },
    inactive: {
      en: 'Inactive',
      ar: 'غير نشط',
      classes: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-800'
    },
    degraded: {
      en: 'Degraded',
      ar: 'متدهور',
      classes: 'bg-amber-50 text-amber-700 border-amber-250 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30'
    },
    reserved: {
      en: 'Reserved',
      ar: 'محجوز',
      classes: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30'
    },
    assigned: {
      en: 'Assigned',
      ar: 'معين',
      classes: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30'
    },
    connecting: {
      en: 'Connecting',
      ar: 'جاري الاتصال',
      classes: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/30'
    },
    available: {
      en: 'Available',
      ar: 'متوفر',
      classes: 'bg-teal-50 text-teal-700 border-teal-250 dark:bg-teal-950/20 dark:text-teal-400 dark:border-teal-900/30'
    }
  };

  const current = config[status] || {
    en: status,
    ar: status,
    classes: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-800'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${current.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full bg-current shrink-0 ${isRtl ? 'ml-1' : 'mr-1'} ${status === 'connecting' ? 'animate-pulse scale-125' : ''}`} />
      <span>{isRtl ? current.ar : current.en}</span>
    </span>
  );
}
