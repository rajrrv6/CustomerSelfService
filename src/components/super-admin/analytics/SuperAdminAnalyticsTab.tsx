'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { SVGBarChart } from '@/components/dashboard/Charts';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { OperationalCard } from '@/components/shared/OperationalCard';
import { EnterpriseTable } from '@/components/shared/EnterpriseTable';
import { translations } from '@/i18n/translations';

interface SuperAdminAnalyticsTabProps {
  activeSubScreen: string;
}

export function SuperAdminAnalyticsTab({ activeSubScreen }: SuperAdminAnalyticsTabProps) {
  const { lang, llmModels } = useApp();
  const t = translations[lang];

  if (activeSubScreen === 'cost_benchmarks') {
    return (
      <div className="space-y-6">
        <SectionHeader
          title={t.superAdmin.analytics.benchmarksTitle}
          description={t.superAdmin.analytics.benchmarksDesc}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SVGBarChart
            data={llmModels.map((m) => m.costInput * 1000)}
            labels={llmModels.map((m) => m.name.substring(0, 8))}
            title={t.superAdmin.analytics.inputCostTitle}
            barColor="#3b82f6"
          />
          <SVGBarChart
            data={llmModels.map((m) => m.costOutput * 1000)}
            labels={llmModels.map((m) => m.name.substring(0, 8))}
            title={t.superAdmin.analytics.outputCostTitle}
            barColor="#f43f5e"
          />
        </div>

        <OperationalCard hoverEffect={false} className="bg-slate-100 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase font-mono mb-2">{t.superAdmin.analytics.recommendationTitle}</h4>
          <p className="text-xs leading-relaxed text-slate-500">
            {t.superAdmin.analytics.recommendationText}
          </p>
        </OperationalCard>
      </div>
    );
  }

  // Cross tenant analytics view
  const tenantHeaders = [...t.superAdmin.analytics.tableHeaders];

  const tenantRows = [
    { id: 'saudi-telecom-corp', tokens: '14.8M', bots: 8, sla: '99.2%', load: lang === 'ar' ? '14.2 طلب/ثانية' : '14.2 req/sec' },
    { id: 'al-rajhi-retail', tokens: '22.1M', bots: 12, sla: '98.5%', load: lang === 'ar' ? '22.8 طلب/ثانية' : '22.8 req/sec' },
    { id: 'emirates-airlines', tokens: '8.4M', bots: 4, sla: '99.8%', load: lang === 'ar' ? '8.1 طلب/ثانية' : '8.1 req/sec' },
    { id: 'gulf-fintech-hub', tokens: '1.2M', bots: 2, sla: '94.0%', load: lang === 'ar' ? '1.1 طلب/ثانية' : '1.1 req/sec' }
  ];

  const cards = [
    { title: t.superAdmin.analytics.metricApiCalls, value: '45.2M', desc: t.superAdmin.analytics.metricApiCallsDesc },
    { title: t.superAdmin.analytics.metricActiveClusters, value: lang === 'ar' ? '18 مجموعة مستأجرين' : '18 Tenant DBs', desc: t.superAdmin.analytics.metricActiveClustersDesc },
    { title: t.superAdmin.analytics.metricLatency, value: '240ms', desc: t.superAdmin.analytics.metricLatencyDesc }
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t.superAdmin.analytics.crossTenantTitle}
        description={t.superAdmin.analytics.crossTenantDesc}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {cards.map((card, i) => (
          <OperationalCard key={i} className="flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">{card.title}</span>
              <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1 font-mono">{card.value}</p>
            </div>
            <span className="text-[10px] text-slate-500 mt-2 block">{card.desc}</span>
          </OperationalCard>
        ))}
      </div>

      {/* Tenants list */}
      <div className="space-y-4">
        <h3 className="font-bold text-xs text-slate-600 dark:text-slate-400 uppercase font-mono">{t.superAdmin.analytics.activeClientsTitle}</h3>
        <EnterpriseTable headers={tenantHeaders}>
          {tenantRows.map((row, idx) => (
            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-850">
              <td className="px-6 py-4 font-bold text-slate-900 dark:text-white font-mono">{row.id}</td>
              <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">{row.tokens}</td>
              <td className="px-6 py-4 text-slate-650 dark:text-slate-350">{row.bots}</td>
              <td className="px-6 py-4 text-emerald-500 font-bold">{row.sla}</td>
              <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">{row.load}</td>
            </tr>
          ))}
        </EnterpriseTable>
      </div>
    </div>
  );
}
