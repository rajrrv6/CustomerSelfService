'use client';

import React from 'react';
import { ConnectorStatus } from '@/types/knowledgeConnector';
import { useUIStore } from '@/stores/uiStore';

export function KnowledgeConnectorStatusBadge({ status }: { status: ConnectorStatus }) {
  const lang = useUIStore((s) => s.lang);
  const isRtl = lang === 'ar';

  const config: Record<ConnectorStatus, { en: string; ar: string; classes: string }> = {
    active: {
      en: 'Active',
      ar: 'نشط',
      classes: 'bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
    },
    pending: {
      en: 'Pending',
      ar: 'قيد الانتظار',
      classes: 'bg-amber-50 text-amber-700 border-amber-250 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30'
    },
    error: {
      en: 'Error',
      ar: 'خطأ',
      classes: 'bg-rose-50 text-rose-700 border-rose-250 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30'
    },
    disabled: {
      en: 'Disabled',
      ar: 'معطل',
      classes: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-800'
    },
    synchronizing: {
      en: 'Synchronizing',
      ar: 'جاري المزامنة',
      classes: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30'
    }
  };

  const current = config[status] || config.disabled;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${current.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full bg-current shrink-0 ${isRtl ? 'ml-1' : 'mr-1'} ${status === 'synchronizing' ? 'animate-pulse scale-125' : ''}`} />
      <span>{isRtl ? current.ar : current.en}</span>
    </span>
  );
}
