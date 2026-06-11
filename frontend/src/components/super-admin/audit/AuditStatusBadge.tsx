'use client';

import React from 'react';
import { useUIStore } from '@/stores/uiStore';

interface AuditStatusBadgeProps {
  type: 'status' | 'severity' | 'compliance';
  value: string;
}

export function AuditStatusBadge({ type, value }: AuditStatusBadgeProps) {
  const lang = useUIStore((s) => s.lang);
  const isRtl = lang === 'ar';

  const normalized = value.toLowerCase();

  let styles = '';
  let label = value;

  if (type === 'status') {
    switch (normalized) {
      case 'open':
        styles = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-905/20 dark:text-blue-400 dark:border-blue-800/50';
        label = isRtl ? 'مفتوح' : 'Open';
        break;
      case 'reviewed':
        styles = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-905/20 dark:text-emerald-400 dark:border-emerald-800/50';
        label = isRtl ? 'تمت المراجعة' : 'Reviewed';
        break;
      case 'escalated':
        styles = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-905/20 dark:text-amber-400 dark:border-amber-800/50';
        label = isRtl ? 'تم التصعيد' : 'Escalated';
        break;
      case 'archived':
        styles = 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700/50';
        label = isRtl ? 'مؤرشف' : 'Archived';
        break;
      default:
        styles = 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-500';
    }
  } else if (type === 'severity') {
    switch (normalized) {
      case 'low':
        styles = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700/50';
        label = isRtl ? 'منخفض' : 'Low';
        break;
      case 'medium':
        styles = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50';
        label = isRtl ? 'متوسط' : 'Medium';
        break;
      case 'high':
        styles = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50';
        label = isRtl ? 'مرتفع' : 'High';
        break;
      case 'critical':
        styles = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/50';
        label = isRtl ? 'حرج' : 'Critical';
        break;
      default:
        styles = 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-500';
    }
  } else if (type === 'compliance') {
    switch (normalized) {
      case 'compliant':
        styles = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50';
        label = isRtl ? 'ممتثل' : 'Compliant';
        break;
      case 'warning':
        styles = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50';
        label = isRtl ? 'تحذير' : 'Warning';
        break;
      case 'violated':
        styles = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/50';
        label = isRtl ? 'مخترق' : 'Violated';
        break;
      case 'disabled':
        styles = 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700/50';
        label = isRtl ? 'معطل' : 'Disabled';
        break;
      default:
        styles = 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-500';
    }
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border font-mono tracking-wide ${styles}`}>
      <span className={`w-1.5 h-1.5 rounded-full bg-current shrink-0 ${isRtl ? 'ml-1.5' : 'mr-1.5'}`} />
      <span>{label}</span>
    </span>
  );
}
