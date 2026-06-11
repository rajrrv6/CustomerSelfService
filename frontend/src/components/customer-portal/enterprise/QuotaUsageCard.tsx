import React, { useMemo } from 'react';
import { QuotaMetric } from './types';
import { ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';

interface QuotaUsageCardProps {
  metric: QuotaMetric;
  lang: 'en' | 'ar';
}

export function QuotaUsageCard({ metric, lang }: QuotaUsageCardProps) {
  // 1. Calculate ratio and determine semantic states dynamically (memoized)
  const { percentage, status } = useMemo(() => {
    const pct = Math.min(100, Math.max(0, (metric.used / metric.limit) * 100));
    let stat: 'normal' | 'warning' | 'critical' = 'normal';
    if (pct >= 95) {
      stat = 'critical';
    } else if (pct >= 80) {
      stat = 'warning';
    }
    return { percentage: pct, status: stat };
  }, [metric.used, metric.limit]);

  // 2. Semantic styling configurations based on warning level
  const statusConfig = {
    normal: {
      style: 'bg-blue-500 shadow-xs shadow-blue-500/20',
      border: 'border-slate-150 dark:border-slate-800',
      badge: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400 dark:border-blue-900',
      text: lang === 'ar' ? 'اعتيادي' : 'Normal',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    warning: {
      style: 'bg-amber-500 shadow-xs shadow-amber-500/20',
      border: 'border-amber-200/50 dark:border-amber-900/40 bg-amber-500/2',
      badge: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400 dark:border-amber-900',
      text: lang === 'ar' ? 'قريب من الحد' : 'Near Limit',
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
    },
    critical: {
      style: 'bg-rose-500 shadow-xs shadow-rose-500/20',
      border: 'border-rose-200/60 dark:border-rose-900/50 bg-rose-500/2',
      badge: 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400 dark:border-rose-900',
      text: lang === 'ar' ? 'حرج جداً' : 'Over Limit Warning',
      icon: <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />,
    },
  }[status];

  // 3. Screen-reader friendly summary label construction
  const srLabel = useMemo(() => {
    const formattedPercent = percentage.toFixed(1);
    if (lang === 'ar') {
      return `مقياس الحصة المخصصة لـ ${metric.name}: تم استخدام ${metric.used} من أصل ${metric.limit} ${metric.unit} (${formattedPercent}%). الحالة: ${statusConfig.text}.`;
    }
    return `Quota usage card for ${metric.name}: ${metric.used} of ${metric.limit} ${metric.unit} used (${formattedPercent}%). Status is ${statusConfig.text}.`;
  }, [metric, percentage, statusConfig.text, lang]);

  return (
    <div
      role="region"
      aria-label={srLabel}
      className={`p-4 rounded-2xl border bg-white dark:bg-slate-900 transition-all hover:shadow-md ${statusConfig.border}`}
    >
      <div className="flex justify-between items-start mb-3" style={{ textAlign: lang === 'ar' ? 'right' : 'left' }}>
        <div>
          <h4 className="font-bold text-xs text-slate-800 dark:text-white leading-tight">
            {metric.name}
          </h4>
          <span className="block text-[9px] text-slate-400 font-mono mt-0.5">
            {metric.used.toLocaleString()} / {metric.limit.toLocaleString()} {metric.unit}
          </span>
        </div>

        <span className={`flex items-center gap-1 text-[8.5px] font-bold px-2 py-0.5 rounded-full border ${statusConfig.badge}`}>
          {statusConfig.icon}
          {statusConfig.text}
        </span>
      </div>

      {/* Lightweight CSS progress bar (does not trigger layout recalculations) */}
      <div className="space-y-1">
        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${statusConfig.style}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[8.5px] font-bold text-slate-400 font-mono">
          <span>0%</span>
          <span className={status !== 'normal' ? 'text-amber-600 dark:text-amber-400' : ''}>
            {percentage.toFixed(1)}%
          </span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}
export const MemoizedQuotaUsageCard = React.memo(QuotaUsageCard);
