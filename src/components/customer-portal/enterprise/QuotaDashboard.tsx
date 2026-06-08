import React, { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { MOCK_QUOTA_METRICS } from './constants';
import { MemoizedQuotaUsageCard } from './QuotaUsageCard';
import { Activity, ShieldAlert, CheckCircle } from 'lucide-react';

export function QuotaDashboard() {
  const { lang } = useApp();

  // 1. Calculate overall limits and status summaries (memoized)
  const stats = useMemo(() => {
    const total = MOCK_QUOTA_METRICS.length;
    const warnings = MOCK_QUOTA_METRICS.filter(m => {
      const pct = (m.used / m.limit) * 100;
      return pct >= 80;
    }).length;
    return { total, warnings };
  }, []);

  const t = {
    en: {
      title: 'Operational Telemetry & Quota Status',
      desc: 'Real-time resource limit logs and API throttling metrics across your active workspace instance.',
      summary: `Workspace Quota Overview: Monitoring ${stats.total} total system metrics. ${
        stats.warnings > 0
          ? `${stats.warnings} metrics are currently near or over operational thresholds.`
          : 'All telemetry channels are operating within normal SLA thresholds.'
      }`,
      healthOk: 'All metrics within thresholds',
      healthWarning: `${stats.warnings} metrics near threshold limit`,
    },
    ar: {
      title: 'القياس عن بعد وحالة الحصص التشغيلية',
      desc: 'سجلات حدود الموارد في الوقت الفعلي ومقاييس خنق واجهة برمجة التطبيقات عبر مثيل مساحة العمل النشط.',
      summary: `نظرة عامة على حصص مساحة العمل: مراقبة ${stats.total} من المقاييس الكلية. ${
        stats.warnings > 0
          ? `يوجد ${stats.warnings} من المقاييس قريبة أو متجاوزة للحدود التشغيلية حالياً.`
          : 'جميع القنوات تعمل ضمن حدود اتفاقية مستوى الخدمة العادية.'
      }`,
      healthOk: 'جميع المقاييس ضمن الحدود المسموحة',
      healthWarning: `يوجد ${stats.warnings} مقاييس قريبة من الحد الأقصى`,
    },
  }[lang] || {
    title: 'Operational Telemetry & Quota Status',
    desc: 'Real-time resource limit logs and API throttling metrics across your active workspace instance.',
    summary: `Workspace Quota Overview: Monitoring ${stats.total} total system metrics. ${
      stats.warnings > 0
        ? `${stats.warnings} metrics are currently near or over operational thresholds.`
        : 'All telemetry channels are operating within normal SLA thresholds.'
    }`,
    healthOk: 'All metrics within thresholds',
    healthWarning: `${stats.warnings} metrics near threshold limit`,
  };

  return (
    <div className="space-y-6">
      {/* Accessibility screen-reader summary banner */}
      <div className="sr-only" role="status">
        {t.summary}
      </div>

      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div style={{ textAlign: lang === 'ar' ? 'right' : 'left' }}>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight flex items-center gap-2">
            <Activity className="w-4.5 h-4.5 text-blue-500" />
            {t.title}
          </h3>
          <p className="text-[10px] text-slate-450 dark:text-slate-400 font-semibold block mt-0.5">
            {t.desc}
          </p>
        </div>

        {/* Global health indicator */}
        <div className="shrink-0">
          {stats.warnings > 0 ? (
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500/15 border border-amber-550/20 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-bold">
              <ShieldAlert className="w-4 h-4 animate-pulse text-amber-500" />
              <span>{t.healthWarning}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500/15 border border-emerald-550/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-bold">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>{t.healthOk}</span>
            </div>
          )}
        </div>
      </div>

      {/* Grid of usage meters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_QUOTA_METRICS.map(metric => (
          <MemoizedQuotaUsageCard
            key={metric.name}
            metric={metric}
            lang={lang}
          />
        ))}
      </div>
    </div>
  );
}
