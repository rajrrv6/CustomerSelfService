'use client';

import React from 'react';
import { useUIStore } from '@/stores/uiStore';

interface SystemOpsStatusBadgeProps {
  status: string;
}

export function SystemOpsStatusBadge({ status }: SystemOpsStatusBadgeProps) {
  const lang = useUIStore((s) => s.lang);
  const isRtl = lang === 'ar';

  const cleanStatus = status.toLowerCase().trim();

  // Color Mapping
  let bgClass = 'bg-slate-50 text-slate-650 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-800';
  let label = status;
  let pulse = false;

  switch (cleanStatus) {
    // Service Statuses
    case 'healthy':
    case 'success':
    case 'completed':
    case 'resolved':
      bgClass = 'bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30';
      label = isRtl ? 'سليم' : 'Operational';
      break;

    case 'degraded':
    case 'running':
    case 'medium':
      bgClass = 'bg-amber-50 text-amber-700 border-amber-250 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
      label = cleanStatus === 'running' 
        ? (isRtl ? 'جاري التشغيل' : 'Running') 
        : (cleanStatus === 'medium' 
          ? (isRtl ? 'متوسط' : 'Medium') 
          : (isRtl ? 'أداء منخفض' : 'Degraded'));
      pulse = cleanStatus === 'running' || cleanStatus === 'degraded';
      break;

    case 'offline':
    case 'failed':
    case 'critical':
    case 'high':
    case 'active':
      bgClass = 'bg-red-50 text-red-700 border-red-250 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30';
      label = cleanStatus === 'offline' 
        ? (isRtl ? 'متوقف' : 'Outage') 
        : (cleanStatus === 'failed' 
          ? (isRtl ? 'فشل' : 'Failed') 
          : (cleanStatus === 'critical'
            ? (isRtl ? 'حرج' : 'Critical')
            : (cleanStatus === 'high'
              ? (isRtl ? 'عالي' : 'High')
              : (isRtl ? 'نشط' : 'Active'))));
      pulse = cleanStatus === 'offline' || cleanStatus === 'active';
      break;

    case 'rolled_back':
      bgClass = 'bg-indigo-50 text-indigo-700 border-indigo-250 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30';
      label = isRtl ? 'تم التراجع' : 'Rolled Back';
      break;

    case 'pending':
      bgClass = 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-900/60 dark:text-slate-400 dark:border-slate-800/40';
      label = isRtl ? 'معلق' : 'Pending';
      break;

    case 'low':
      bgClass = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30';
      label = isRtl ? 'منخفض' : 'Low';
      break;

    default:
      label = status;
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${bgClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 bg-current ${isRtl ? 'ml-1.5' : 'mr-1.5'} ${pulse ? 'animate-pulse' : ''}`} />
      <span>{label}</span>
    </span>
  );
}
