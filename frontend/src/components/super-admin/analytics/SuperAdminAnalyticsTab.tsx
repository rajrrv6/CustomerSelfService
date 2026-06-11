'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { SVGBarChart, SVGLineChart } from '@/components/dashboard/Charts';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { OperationalCard } from '@/components/shared/OperationalCard';
import { EnterpriseTable } from '@/components/shared/table/EnterpriseTable';
import { ColumnDef } from '@tanstack/react-table';
import { translations } from '@/i18n/translations';
import { AlertTriangle, TrendingDown, TrendingUp, Activity, Download, FileText, CheckCircle, BarChart3, DollarSign, Users } from 'lucide-react';
import { ModalWrapper } from '@/components/shared/ModalWrapper';

interface SuperAdminAnalyticsTabProps {
  activeSubScreen: string;
}

export function SuperAdminAnalyticsTab({ activeSubScreen }: SuperAdminAnalyticsTabProps) {
  const { lang, llmModels } = useApp();
  const t = translations[lang];
  const isRtl = lang === 'ar';

  // Modal and drawer states
  const [selectedTenant, setSelectedTenant] = useState<any | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf' | 'json'>('csv');
  const [exportStep, setExportStep] = useState<'idle' | 'running' | 'done'>('idle');
  const [exportProgress, setExportProgress] = useState(0);

  const exportIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    return () => {
      if (exportIntervalRef.current) clearInterval(exportIntervalRef.current);
    };
  }, []);

  const handleStartExport = () => {
    setExportStep('running');
    setExportProgress(0);

    if (exportIntervalRef.current) clearInterval(exportIntervalRef.current);

    const interval = setInterval(() => {
      setExportProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          
          // Generate actual mock data and download it
          const mockData = exportFormat === 'json' 
            ? JSON.stringify(tenantRows, null, 2)
            : "Client ID,Tokens,Bots,SLA,Containment,Cost,Load\n" + 
              tenantRows.map(r => `${r.id},${r.tokens},${r.bots},${r.sla},${r.containment},${r.cost},"${r.load}"`).join("\n");
          
          const mimeType = exportFormat === 'json' ? 'application/json' : 'text/csv';
          const blob = new Blob([mockData], { type: mimeType });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `super_admin_analytics.${exportFormat}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          setExportStep('done');
          return 100;
        }
        return p + 20;
      });
    }, 200);
    exportIntervalRef.current = interval;
  };

  if (activeSubScreen === 'cost_benchmarks') {
    return (
      <div className="space-y-6">
        <SectionHeader
          title={t.superAdmin.analytics.benchmarksTitle}
          description={t.superAdmin.analytics.benchmarksDesc}
        />
        
        {/* Side-by-side Cost Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            barColor="#10b981"
          />
        </div>

        {/* System Anomalies HUD & Weekly Throughput */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <SVGLineChart
              data={[120, 180, 140, 290, 220, 340, 410]}
              labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
              title={isRtl ? 'حجم نقل البيانات الأسبوعي (مليون رمز)' : 'Weekly LLM Throughput (Millions of Tokens)'}
              gradientColor="#8b5cf6"
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
            
            <OperationalCard hoverEffect={false} className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30 flex-1 bg-gradient-to-br dark:from-blue-950/20 dark:to-transparent">
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
    { id: 'saudi-telecom-corp', tokens: '14.8M', bots: 8, sla: '99.2%', containment: '82.4%', cost: '$4,420', load: lang === 'ar' ? '14.2 طلب/ثانية' : '14.2 req/sec', trend: 'up' },
    { id: 'al-rajhi-retail', tokens: '22.1M', bots: 12, sla: '98.5%', containment: '76.8%', cost: '$6,605', load: lang === 'ar' ? '22.8 طلب/ثانية' : '22.8 req/sec', trend: 'down' },
    { id: 'emirates-airlines', tokens: '8.4M', bots: 4, sla: '99.8%', containment: '84.0%', cost: '$2,510', load: lang === 'ar' ? '8.1 طلب/ثانية' : '8.1 req/sec', trend: 'stable' },
    { id: 'gulf-fintech-hub', tokens: '1.2M', bots: 2, sla: '94.0%', containment: '68.5%', cost: '$715', load: lang === 'ar' ? '1.1 طلب/ثانية' : '1.1 req/sec', trend: 'up' }
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t.superAdmin.analytics.crossTenantTitle}
        description={t.superAdmin.analytics.crossTenantDesc}
        action={
          <button
            type="button"
            onClick={() => {
              setIsExportOpen(true);
              setExportStep('idle');
              setExportProgress(0);
            }}
            className="px-4 py-2.5 bg-blue-650 hover:bg-blue-700 text-white rounded-xl font-bold text-[11px] shadow-md cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>{isRtl ? 'تصدير التقارير' : 'Export Reports'}</span>
          </button>
        }
      />

      {/* Enhanced KPI Operational Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <OperationalCard className="flex flex-col justify-between border-l-4 border-l-blue-500">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-455 dark:text-slate-400 uppercase tracking-wider font-mono">
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
              <span className="text-[10px] font-bold text-slate-455 dark:text-slate-400 uppercase tracking-wider font-mono">
                {isRtl ? 'متوسط معدل الاحتواء الذاتي' : 'Average Containment Rate'}
              </span>
              <TrendingUp className="w-4 h-4 text-purple-500 opacity-70" />
            </div>
            <div className="flex items-baseline gap-3 mt-2">
              <p className="text-3xl font-bold text-slate-900 dark:text-white font-mono">78.5%</p>
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">
                <TrendingUp className="w-3 h-3" />
                <span>3.1%</span>
              </div>
            </div>
          </div>
          <span className="text-[10px] text-slate-500 mt-4 block font-medium">
            {isRtl ? 'معدل دقة حل المشكلات ذاتياً للعملاء.' : 'Self-service problem resolution accuracy index.'}
          </span>
        </OperationalCard>

        <OperationalCard className="flex flex-col justify-between border-l-4 border-l-emerald-500 relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-[10px] font-bold text-slate-455 dark:text-slate-400 uppercase tracking-wider font-mono">
              {isRtl ? 'تكلفة استهلاك واجهة برمجة التطبيقات' : 'Inference Cost Spend'}
            </span>
            <div className="flex items-baseline gap-3 mt-2">
              <p className="text-3xl font-bold text-slate-900 dark:text-white font-mono">$14,250</p>
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">
                <TrendingDown className="w-3 h-3" />
                <span>-8.2%</span>
              </div>
            </div>
          </div>
          <span className="text-[10px] text-slate-500 mt-4 block font-medium relative z-10">
            {isRtl ? 'التوفير التراكمي بفضل تحسين توجيه النماذج.' : 'Cumulative savings from optimized model routing.'}
          </span>
        </OperationalCard>
      </div>

      {/* Side-by-Side Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SVGLineChart
          data={[72, 75, 74, 78, 77, 79, 78.5]}
          labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
          title={isRtl ? 'معدل الاحتواء الذاتي اليومي (%)' : 'Daily Containment Success Rate (%)'}
          gradientColor="#10b981"
        />
        <SVGBarChart
          data={[6605, 4420, 2510, 715]}
          labels={['Al-Rajhi', 'STC', 'Emirates', 'Gulf Fintech']}
          title={isRtl ? 'توزيع تكاليف الـ AI بالدولار' : 'AI Spent Cost Distribution ($)'}
          barColor="#6366f1"
        />
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
              accessorKey: 'containment',
              header: isRtl ? 'معدل الاحتواء' : 'Containment Rate',
              cell: ({ row }) => (
                <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">
                  {row.original.containment}
                </span>
              ),
            },
            {
              accessorKey: 'cost',
              header: isRtl ? 'تكلفة الذكاء الاصطناعي' : 'AI Spent Cost',
              cell: ({ row }) => (
                <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">
                  {row.original.cost}
                </span>
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
              onRowClick={(row) => setSelectedTenant(row)}
            />
          );
        })()}
      </div>

      {/* Operational Anomaly alerts banner */}
      <OperationalCard hoverEffect={false} className="bg-amber-50/50 dark:bg-amber-955/10 border-amber-200 dark:border-amber-900/30">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-[11px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider font-mono mb-1">
              {isRtl ? 'رصد شذوذ في معدل الاحتواء' : 'Containment Rate Anomaly Warning'}
            </h4>
            <p className="text-[10px] text-amber-600/80 dark:text-amber-300/70 leading-relaxed font-semibold">
              {isRtl
                ? 'انخفاض مفاجئ بنسبة 12٪ في معدل الاحتواء لـ (Gulf Fintech Hub) خلال آخر 24 ساعة. يوصى بمراجعة سجلات محرك NLU في خادم الاستدلال.'
                : 'Sudden -12% containment rate drop observed on Gulf Fintech Hub over the last 24h. Recommend reviewing NLU parser exceptions in System Operations.'}
            </p>
          </div>
        </div>
      </OperationalCard>

      {/* Tenant Usage Detail Overlay Drawer */}
      <ModalWrapper
        isOpen={!!selectedTenant}
        onClose={() => setSelectedTenant(null)}
        title={isRtl ? 'تفاصيل استهلاك المستأجر ومقاييس الأداء' : 'Tenant Usage Metrics & Cost Benchmarks'}
      >
        {selectedTenant && (
          <div className="space-y-5 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white font-mono uppercase">{selectedTenant.id}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">{isRtl ? 'الأحمال المباشرة:' : 'Current active load:'} {selectedTenant.load}</p>
              </div>
              <div className="px-2 py-0.5 rounded text-[9px] uppercase font-bold bg-blue-105/10 text-blue-600 dark:text-blue-400 font-mono border border-blue-200 dark:border-blue-800">
                {selectedTenant.containment} Containment
              </div>
            </div>

            {/* Simulated Token Usage Graph */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl">
              <SVGLineChart
                data={selectedTenant.id === 'saudi-telecom-corp' ? [1.2, 1.8, 1.4, 2.9, 2.2, 2.7, 2.6] : [2.1, 2.5, 2.8, 3.1, 2.9, 3.4, 3.3]}
                labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
                title={isRtl ? 'منحنى استهلاك الرموز اليومي (بالمليون)' : 'Daily Inbound Token Volume (Millions)'}
                gradientColor="#3b82f6"
              />
            </div>

            {/* Agent Seats & Costs Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl">
                <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block font-mono">
                  {isRtl ? 'تكلفة استهلاك النموذج' : 'Model Inference Cost'}
                </span>
                <span className="text-sm font-mono font-bold text-slate-800 dark:text-white mt-1 block">{selectedTenant.cost}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl">
                <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block font-mono">
                  {isRtl ? 'البوتات ومقاعد الوكلاء' : 'Active Bots & Seats'}
                </span>
                <span className="text-sm font-bold text-slate-800 dark:text-white mt-1 block font-mono">
                  {selectedTenant.bots} bots / {selectedTenant.bots * 4} seats
                </span>
              </div>
            </div>

            {/* SLA Adherence Detail */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block font-mono">
                  {isRtl ? 'معدل الالتزام باتفاقية الخدمة SLA' : 'Real-Time SLA Adherence'}
                </span>
                <span className="text-xs font-mono font-bold text-slate-800 dark:text-white mt-1 block">{selectedTenant.sla}</span>
              </div>
              <div className={`w-3.5 h-3.5 rounded-full ${selectedTenant.id === 'gulf-fintech-hub' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTenant(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-350 rounded-xl font-bold text-[10px] cursor-pointer transition-colors"
              >
                {isRtl ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        )}
      </ModalWrapper>

      {/* Report Export Simulation Modal */}
      <ModalWrapper
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        title={isRtl ? 'تصدير تقارير الأداء والتحليلات' : 'Export System Analytics Reports'}
      >
        <div className="space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
          {exportStep === 'idle' && (
            <>
              <p className="text-xs text-slate-655 dark:text-slate-400 leading-relaxed font-normal">
                {isRtl 
                  ? 'اختر صيغة الملف المفضلة لتصدير سجلات ونشاطات استهلاك الرموز والتكاليف للمستأجرين:'
                  : 'Select your preferred layout format to download token logs, active SLAs, and cost benchmarks for all tenant orgs:'}
              </p>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setExportFormat('csv')}
                  className={`p-3.5 rounded-xl border font-bold text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    exportFormat === 'csv'
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-955/20 text-blue-650'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-5 h-5 text-blue-500" />
                  <span>CSV Form</span>
                </button>

                <button
                  type="button"
                  onClick={() => setExportFormat('pdf')}
                  className={`p-3.5 rounded-xl border font-bold text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    exportFormat === 'pdf'
                      ? 'border-red-500 bg-red-50/50 dark:bg-red-955/20 text-red-600'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-5 h-5 text-red-500" />
                  <span>PDF Document</span>
                </button>

                <button
                  type="button"
                  onClick={() => setExportFormat('json')}
                  className={`p-3.5 rounded-xl border font-bold text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    exportFormat === 'json'
                      ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-955/20 text-purple-600'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-5 h-5 text-purple-500" />
                  <span>JSON Output</span>
                </button>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleStartExport}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-[10px] cursor-pointer transition-colors"
                >
                  {isRtl ? 'بدء التصدير وتحميل الملف' : 'Export & Download'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsExportOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-350 rounded-xl font-bold text-[10px] cursor-pointer transition-colors"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </>
          )}

          {exportStep === 'running' && (
            <div className="py-6 text-center space-y-4">
              <Download className="w-10 h-10 text-blue-500 animate-bounce mx-auto" />
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">
                  {isRtl ? 'جاري تجميع البيانات وتوليد الملف...' : 'Compiling & Generating File...'}
                </h4>
                <p className="text-[10px] text-slate-400 mt-1">
                  {isRtl ? `تنسيق الملف المستهدف: ${exportFormat.toUpperCase()}` : `Writing system analytics record format: ${exportFormat.toUpperCase()}`}
                </p>
              </div>

              <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-200 dark:border-slate-900">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-200"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
              <span className="text-[10px] font-mono font-extrabold text-blue-600 dark:text-blue-400">
                {exportProgress}%
              </span>
            </div>
          )}

          {exportStep === 'done' && (
            <div className="py-4 text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">
                  {isRtl ? 'اكتمل تصدير الملف بنجاح' : 'Success! File Dispatched'}
                </h4>
                <p className="text-[10px] text-slate-450 mt-1 max-w-xs mx-auto">
                  {isRtl
                    ? `تم بنجاح تنزيل ملف التقرير بتنسيق ${exportFormat.toUpperCase()} إلى جهازك.`
                    : `System analytics report has been formatted into ${exportFormat.toUpperCase()} and downloaded to your local drive.`}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-center">
                <button
                  type="button"
                  onClick={() => setIsExportOpen(false)}
                  className="px-6 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 text-slate-750 dark:text-slate-350 rounded-xl font-bold text-[10px] cursor-pointer transition-colors"
                >
                  {isRtl ? 'إغلاق النافذة' : 'Close window'}
                </button>
              </div>
            </div>
          )}
        </div>
      </ModalWrapper>
    </div>
  );
}

