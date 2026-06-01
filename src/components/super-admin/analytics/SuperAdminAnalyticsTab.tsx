'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { SVGBarChart, SVGLineChart } from '@/components/dashboard/Charts';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { OperationalCard } from '@/components/shared/OperationalCard';
import { EnterpriseTable } from '@/components/shared/table/EnterpriseTable';
import { ColumnDef } from '@tanstack/react-table';
import { translations } from '@/i18n/translations';
import { AlertTriangle, TrendingDown, TrendingUp, Activity } from 'lucide-react';

interface SuperAdminAnalyticsTabProps {
  activeSubScreen: string;
}

export function SuperAdminAnalyticsTab({ activeSubScreen }: SuperAdminAnalyticsTabProps) {
  const { lang, llmModels } = useApp();
  const t = translations[lang];
  const isRtl = lang === 'ar';

  if (activeSubScreen === 'cost_benchmarks') {
    return (
      <div className="space-y-6">
        <SectionHeader
          title={t.superAdmin.analytics.benchmarksTitle}
          description={t.superAdmin.analytics.benchmarksDesc}
        />
        
        {/* System Anomalies HUD */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <SVGBarChart
              data={llmModels.map((m) => m.costInput * 1000)}
              labels={llmModels.map((m) => m.name.substring(0, 8))}
              title={t.superAdmin.analytics.inputCostTitle}
              barColor="#3b82f6"
            />
            {/* Swapped output cost for a Time-Series Line Chart simulating throughput/load */}
            <SVGLineChart
              data={[120, 180, 140, 290, 220, 340, 410]}
              labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
              title={isRtl ? 'حجم نقل البيانات الأسبوعي' : 'Weekly LLM Throughput (Tokens)'}
              gradientColor="#10b981"
            />
          </div>

          <div className="flex flex-col gap-4">
            <OperationalCard hoverEffect={false} className="bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-red-800 dark:text-red-400 uppercase tracking-wide font-mono mb-1">
                    {isRtl ? 'اكتشاف شذوذ في زمن الوصول' : 'Latency Anomaly Detected'}
                  </h4>
                  <p className="text-[10px] text-red-600/80 dark:text-red-300/70 leading-relaxed font-semibold">
                    {isRtl 
                      ? 'تم رصد ارتفاع بنسبة 18٪ في زمن استجابة Anthropic Claude 3.5 Sonnet خلال الـ 45 دقيقة الماضية في خوادم (EU-West).'
                      : '+18% latency spike observed on Anthropic Claude 3.5 Sonnet routing gateway (EU-West) over the last 45m window.'}
                  </p>
                </div>
              </div>
            </OperationalCard>
            
            <OperationalCard hoverEffect={false} className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30 flex-1">
              <h4 className="text-xs font-bold text-blue-800 dark:text-blue-400 uppercase font-mono mb-2">
                {t.superAdmin.analytics.recommendationTitle}
              </h4>
              <p className="text-[11px] leading-relaxed text-blue-700/80 dark:text-blue-300/80 font-medium">
                {t.superAdmin.analytics.recommendationText}
              </p>
            </OperationalCard>
          </div>
        </div>
      </div>
    );
  }

  // Cross tenant analytics view
  const tenantHeaders = [...t.superAdmin.analytics.tableHeaders];

  const tenantRows = [
    { id: 'saudi-telecom-corp', tokens: '14.8M', bots: 8, sla: '99.2%', load: lang === 'ar' ? '14.2 طلب/ثانية' : '14.2 req/sec', trend: 'up' },
    { id: 'al-rajhi-retail', tokens: '22.1M', bots: 12, sla: '98.5%', load: lang === 'ar' ? '22.8 طلب/ثانية' : '22.8 req/sec', trend: 'down' },
    { id: 'emirates-airlines', tokens: '8.4M', bots: 4, sla: '99.8%', load: lang === 'ar' ? '8.1 طلب/ثانية' : '8.1 req/sec', trend: 'stable' },
    { id: 'gulf-fintech-hub', tokens: '1.2M', bots: 2, sla: '94.0%', load: lang === 'ar' ? '1.1 طلب/ثانية' : '1.1 req/sec', trend: 'up' }
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t.superAdmin.analytics.crossTenantTitle}
        description={t.superAdmin.analytics.crossTenantDesc}
      />

      {/* Enhanced KPI Operational Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <OperationalCard className="flex flex-col justify-between border-l-4 border-l-blue-500">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider font-mono">
                {t.superAdmin.analytics.metricApiCalls}
              </span>
              <Activity className="w-4 h-4 text-blue-500 opacity-70" />
            </div>
            <div className="flex items-baseline gap-3 mt-2">
              <p className="text-3xl font-bold text-slate-900 dark:text-white font-mono">45.2M</p>
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">
                <TrendingUp className="w-3 h-3" />
                <span>12.4%</span>
              </div>
            </div>
          </div>
          <span className="text-[10px] text-slate-500 mt-4 block font-medium">
            {isRtl ? 'تمت معالجة الطلبات عبر 14 مزود قناة.' : 'Requests processed across 14 channel providers.'}
          </span>
        </OperationalCard>
        
        <OperationalCard className="flex flex-col justify-between border-l-4 border-l-purple-500">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider font-mono">
                {t.superAdmin.analytics.metricActiveClusters}
              </span>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            </div>
            <div className="flex items-baseline gap-3 mt-2">
              <p className="text-3xl font-bold text-slate-900 dark:text-white font-mono">18</p>
              <span className="text-xs font-bold text-slate-500 font-mono">/ 20</span>
            </div>
          </div>
          <span className="text-[10px] text-slate-500 mt-4 block font-medium">
            {isRtl ? 'جميع المجموعات المعزولة في حالة صحية.' : 'Isolated database clusters reporting healthy.'}
          </span>
        </OperationalCard>

        <OperationalCard className="flex flex-col justify-between border-l-4 border-l-emerald-500 relative overflow-hidden">
          {/* subtle background pattern to differentiate */}
          <div className="absolute right-0 bottom-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
            <TrendingDown className="w-32 h-32 transform translate-x-4 translate-y-4" />
          </div>
          <div className="relative z-10">
            <span className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider font-mono">
              {t.superAdmin.analytics.metricLatency}
            </span>
            <div className="flex items-baseline gap-3 mt-2">
              <p className="text-3xl font-bold text-slate-900 dark:text-white font-mono">240<span className="text-sm text-slate-500">ms</span></p>
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">
                <TrendingDown className="w-3 h-3" />
                <span>-15ms</span>
              </div>
            </div>
          </div>
          <span className="text-[10px] text-slate-500 mt-4 block font-medium relative z-10">
            {isRtl ? 'انخفض زمن استجابة LLM بسبب التخزين المؤقت.' : 'ASR+LLM orchestration pipeline (cached).'}
          </span>
        </OperationalCard>
      </div>

      {/* Tenants list */}
      <div className="space-y-4 pt-2">
        <h3 className="font-bold text-[11px] text-slate-655 dark:text-slate-400 uppercase tracking-wider font-mono">
          {t.superAdmin.analytics.activeClientsTitle}
        </h3>
        {(() => {
          const columns: ColumnDef<typeof tenantRows[0]>[] = [
            {
              accessorKey: 'id',
              header: tenantHeaders[0] || (isRtl ? 'معرّف العميل' : 'Client ID'),
              cell: ({ row }) => (
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-6 rounded-full ${row.original.id === 'gulf-fintech-hub' ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                  <span className="font-bold text-slate-900 dark:text-white font-mono">{row.original.id}</span>
                </div>
              ),
            },
            {
              accessorKey: 'tokens',
              header: tenantHeaders[1] || (isRtl ? 'حجم الرموز' : 'Token Volume'),
              cell: ({ row }) => (
                <span className="font-mono text-slate-600 dark:text-slate-400">
                  {row.original.tokens}
                </span>
              ),
            },
            {
              accessorKey: 'bots',
              header: tenantHeaders[2] || (isRtl ? 'البوتات النشطة' : 'Active Bots'),
              cell: ({ row }) => (
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold font-mono">
                    {row.original.bots}
                  </div>
                </div>
              ),
            },
            {
              accessorKey: 'sla',
              header: tenantHeaders[3] || (isRtl ? 'الالتزام باتفاقية الخدمة' : 'SLA Adherence'),
              cell: ({ row }) => {
                const isAmber = row.original.id === 'gulf-fintech-hub';
                return (
                  <span className={`px-2 py-1 rounded text-xs font-bold ${isAmber ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                    {row.original.sla}
                  </span>
                );
              },
            },
            {
              accessorKey: 'load',
              header: tenantHeaders[4] || (isRtl ? 'الحمل المباشر' : 'Real-Time Load'),
              cell: ({ row }) => (
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-600 dark:text-slate-400 text-xs">{row.original.load}</span>
                  {row.original.trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-rose-500" />}
                  {row.original.trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />}
                  {row.original.trend === 'stable' && <span className="w-3.5 h-3.5 text-slate-400 font-mono">-</span>}
                </div>
              ),
            },
          ];
          return (
            <EnterpriseTable
              data={tenantRows}
              columns={columns}
              lang={lang}
              enableSearch={true}
              searchPlaceholder={isRtl ? 'البحث عن عميل...' : 'Search active clients...'}
              enableColumnVisibility={false}
            />
          );
        })()}
      </div>
    </div>
  );
}

