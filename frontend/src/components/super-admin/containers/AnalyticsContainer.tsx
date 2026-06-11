'use client';

import React, { Suspense } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { translations } from '@/i18n/translations';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { BarChart2, TrendingUp } from 'lucide-react';
import { SuperAdminAnalyticsTab } from '../analytics/SuperAdminAnalyticsTab';
import { useTabQueryState } from '@/hooks/useTabQueryState';

function TabFallback() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500 animate-pulse">
      <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-3" />
      <span className="text-xs font-semibold font-mono tracking-wider uppercase">Loading module...</span>
    </div>
  );
}

export function AnalyticsContainer({ activeTab: propActiveTab }: { activeTab?: string }) {
  const lang = useUIStore((s) => s.lang);
  const t = translations[lang];

  const [activeTab, setActiveTab] = useTabQueryState(
    'cross_tenant_analytics',
    ['cross_tenant_analytics', 'cost_benchmarks'],
    propActiveTab
  );

  const tabs = [
    { id: 'cross_tenant_analytics', label: t.superAdmin.analytics.crossTenantTitle || 'Cross-Tenant Analytics', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'cost_benchmarks', label: t.superAdmin.analytics.benchmarksTitle || 'Model Cost Benchmarks', icon: <BarChart2 className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t.saAnalyticsTitle}
        description={t.saAnalyticsDesc}
      />

      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto whitespace-nowrap scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold transition-all -mb-px text-[11px] cursor-pointer shrink-0 ${
                isActive
                  ? 'border-blue-600 text-blue-600 dark:text-blue-600'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <Suspense fallback={<TabFallback />}>
          <SuperAdminAnalyticsTab activeSubScreen={activeTab} />
        </Suspense>
      </div>
    </div>
  );
}
