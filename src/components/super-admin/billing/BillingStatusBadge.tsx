'use client';

import React from 'react';
import { useUIStore } from '@/stores/uiStore';
import { BillingStatus, PlanStatus } from '@/types/billing';

interface BillingStatusBadgeProps {
  status: BillingStatus | PlanStatus;
}

export function BillingStatusBadge({ status }: BillingStatusBadgeProps) {
  const lang = useUIStore((s) => s.lang);
  const isRtl = lang === 'ar';

  const config: Record<BillingStatus | PlanStatus, { en: string; ar: string; classes: string }> = {
    active: {
      en: 'Active',
      ar: 'نشط',
      classes: 'bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
    },
    trial: {
      en: 'Trial',
      ar: 'تجريبي',
      classes: 'bg-teal-50 text-teal-700 border-teal-250 dark:bg-teal-950/20 dark:text-teal-400 dark:border-teal-900/30'
    },
    overdue: {
      en: 'Overdue',
      ar: 'متأخر السداد',
      classes: 'bg-rose-50 text-rose-700 border-rose-250 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30'
    },
    suspended: {
      en: 'Suspended',
      ar: 'موقوف',
      classes: 'bg-amber-50 text-amber-700 border-amber-250 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30'
    },
    expired: {
      en: 'Expired',
      ar: 'منتهي الصلاحية',
      classes: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-800'
    },
    draft: {
      en: 'Draft',
      ar: 'مسودة',
      classes: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30'
    },
    archived: {
      en: 'Archived',
      ar: 'مؤرشف',
      classes: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-800'
    },
    disabled: {
      en: 'Disabled',
      ar: 'معطل',
      classes: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-800'
    }
  };

  const current = config[status] || {
    en: status,
    ar: status,
    classes: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-800'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${current.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full bg-current shrink-0 ${isRtl ? 'ml-1' : 'mr-1'} ${status === 'overdue' ? 'animate-pulse' : ''}`} />
      <span>{isRtl ? current.ar : current.en}</span>
    </span>
  );
}
