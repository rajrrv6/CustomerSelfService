'use client';

import React from 'react';
import { useFilters, useSetFilters, useResetFilters } from '@/stores/notifications/notificationSelectors';
import { NotificationCategory, NotificationSourceType, NotificationSeverity } from '@/stores/notifications/notificationTypes';
import { X, Filter } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';

export function NotificationFilters() {
  const filters = useFilters();
  const setFilters = useSetFilters();
  const resetFilters = useResetFilters();
  const lang = useUIStore((s) => s.lang);

  const isRtl = lang === 'ar';

  const categories: { value: NotificationCategory | 'all'; labelEn: string; labelAr: string }[] = [
    { value: 'all', labelEn: 'All Categories', labelAr: 'جميع الفئات' },
    { value: 'operations', labelEn: 'Operations', labelAr: 'العمليات' },
    { value: 'ai', labelEn: 'AI Engine', labelAr: 'محرك الذكاء الاصطناعي' },
    { value: 'routing', labelEn: 'Routing', labelAr: 'التوجيه' },
    { value: 'webhook', labelEn: 'Webhooks', labelAr: 'خطافات الويب' },
    { value: 'sla', labelEn: 'SLA Breaches', labelAr: 'اتفاقية مستوى الخدمة' },
    { value: 'escalation', labelEn: 'Escalations', labelAr: 'التصعيد' },
    { value: 'sync', labelEn: 'Sync', labelAr: 'مزامنة البيانات' },
    { value: 'compliance', labelEn: 'Compliance', labelAr: 'الامتثال والسرية' },
    { value: 'analytics', labelEn: 'Analytics', labelAr: 'التحليلات' },
  ];

  const severities: { value: NotificationSeverity | 'all'; labelEn: string; labelAr: string; color: string }[] = [
    { value: 'all', labelEn: 'All Severities', labelAr: 'جميع المستويات', color: 'border-slate-200 text-slate-700 dark:text-slate-300 dark:border-slate-700' },
    { value: 'info', labelEn: 'Info', labelAr: 'معلومات', color: 'border-blue-200 text-blue-700 bg-blue-50/50 dark:border-blue-900 dark:text-blue-400' },
    { value: 'success', labelEn: 'Success', labelAr: 'نجاح', color: 'border-emerald-200 text-emerald-700 bg-emerald-50/50 dark:border-emerald-900 dark:text-emerald-400' },
    { value: 'warning', labelEn: 'Warning', labelAr: 'تحذير', color: 'border-amber-200 text-amber-700 bg-amber-50/50 dark:border-amber-900 dark:text-amber-400' },
    { value: 'critical', labelEn: 'Critical', labelAr: 'حرج', color: 'border-rose-200 text-rose-700 bg-rose-50/50 dark:border-rose-900 dark:text-rose-400' },
  ];

  const sources: { value: NotificationSourceType | 'all'; labelEn: string; labelAr: string }[] = [
    { value: 'all', labelEn: 'All Sources', labelAr: 'جميع المصادر' },
    { value: 'operations', labelEn: 'Operations', labelAr: 'العمليات' },
    { value: 'dialog-builder', labelEn: 'Dialog Builder', labelAr: 'مخطط الحوار' },
    { value: 'AI-training', labelEn: 'AI Training', labelAr: 'تدريب النموذج' },
    { value: 'guardrails', labelEn: 'Guardrails', labelAr: 'حواجز الحماية' },
    { value: 'omnichannel', labelEn: 'Omnichannel', labelAr: 'القنوات المتعددة' },
    { value: 'analytics', labelEn: 'Analytics', labelAr: 'التحليلات' },
    { value: 'voice', labelEn: 'Voice IVR', labelAr: 'الرد الصوتي' },
    { value: 'integrations', labelEn: 'Integrations', labelAr: 'التكامل' },
    { value: 'SLA', labelEn: 'SLA', labelAr: 'اتفاقية الخدمة' },
    { value: 'routing', labelEn: 'Routing', labelAr: 'التوجيه' },
  ];

  const hasActiveFilters = filters.category !== 'all' || filters.severity !== 'all' || filters.source !== 'all' || filters.unreadOnly;

  return (
    <div className="space-y-3.5 bg-slate-50 dark:bg-slate-950 p-3 sm:p-4 border border-slate-200 dark:border-slate-800/80 rounded-2xl text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-white">
          <Filter className="w-3.5 h-3.5 text-blue-500" />
          <span>{isRtl ? 'تصفية الإشعارات' : 'Filter Alerts'}</span>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center gap-1 text-[10px] text-blue-500 hover:text-blue-600 font-semibold transition-colors"
          >
            <X className="w-3 h-3" />
            <span>{isRtl ? 'إعادة تعيين' : 'Clear Filters'}</span>
          </button>
        )}
      </div>

      {/* Unread Only Switch */}
      <div className="flex items-center justify-between py-1 border-b border-slate-200/55 dark:border-slate-800/50">
        <span className="font-semibold text-slate-600 dark:text-slate-400">
          {isRtl ? 'عرض غير المقروء فقط' : 'Unread Alerts Only'}
        </span>
        <button
          type="button"
          onClick={() => setFilters({ unreadOnly: !filters.unreadOnly })}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            filters.unreadOnly ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
              filters.unreadOnly ? (isRtl ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Severity Filter Pills */}
      <div className="space-y-1.5">
        <div className="font-semibold text-slate-500 dark:text-slate-500">
          {isRtl ? 'مستوى الخطورة' : 'Severity Scale'}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {severities.map((sev) => (
            <button
              key={sev.value}
              type="button"
              onClick={() => setFilters({ severity: sev.value })}
              className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all ${
                filters.severity === sev.value
                  ? 'bg-blue-600 border-blue-600 text-white dark:text-white'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {isRtl ? sev.labelAr : sev.labelEn}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {/* Category Select */}
        <div className="space-y-1.5">
          <label className="block font-semibold text-slate-500 dark:text-slate-500">
            {isRtl ? 'فئة التنبيه' : 'Category'}
          </label>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ category: e.target.value as NotificationCategory | 'all' })}
            className="w-full px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {isRtl ? cat.labelAr : cat.labelEn}
              </option>
            ))}
          </select>
        </div>

        {/* Source Select */}
        <div className="space-y-1.5">
          <label className="block font-semibold text-slate-500 dark:text-slate-500">
            {isRtl ? 'مصدر التنبيه' : 'System Source'}
          </label>
          <select
            value={filters.source}
            onChange={(e) => setFilters({ source: e.target.value as NotificationSourceType | 'all' })}
            className="w-full px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {sources.map((src) => (
              <option key={src.value} value={src.value}>
                {isRtl ? src.labelAr : src.labelEn}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
export default NotificationFilters;
