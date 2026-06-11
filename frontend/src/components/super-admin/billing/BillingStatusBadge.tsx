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
    },
    pending_refund: {
      en: 'Pending Refund',
      ar: 'استرداد معلق',
      classes: 'bg-indigo-50 text-indigo-700 border-indigo-250 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30'
    },
    refunded: {
      en: 'Refunded',
      ar: 'تم الاسترداد',
      classes: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-800'
    },
    failed_payment: {
      en: 'Payment Failed',
      ar: 'فشل الدفع',
      classes: 'bg-red-50 text-red-700 border-red-250 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30'
    },
    recovering: {
      en: 'Recovering',
      ar: 'جاري الاسترداد',
      classes: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/30'
    },
    coupon_active: {
      en: 'Active',
      ar: 'نشط',
      classes: 'bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
    },
    coupon_expired: {
      en: 'Expired',
      ar: 'منتهي',
      classes: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-800'
    }
  };

  const current = config[status] || {
    en: status,
    ar: status,
    classes: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-800'
  };

  const isPulse = status === 'overdue' || status === 'failed_payment' || status === 'recovering' || status === 'pending_refund';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${current.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full bg-current shrink-0 ${isRtl ? 'ml-1.5' : 'mr-1.5'} ${isPulse ? 'animate-pulse' : ''}`} />
      <span>{isRtl ? current.ar : current.en}</span>
    </span>
  );
}
