import React from 'react';
import { useAiMetrics } from '@/hooks/useAiMetrics';
import { ragSearchFailures } from '@/data/seed/aiMetricsSeed';
import { SVGBarChart } from '@/components/dashboard/Charts';
import { EnterpriseTable } from '@/components/shared/EnterpriseTable';
import { Coins, Database, DollarSign } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';

export function TokenCostAnalytics() {
  const { modelCosts } = useAiMetrics();
  const { lang } = useApp();
  const t = translations[lang];

  const searchHeaders = [
    t.analyticsCenter.costAnalytics.colQuery,
    t.analyticsCenter.costAnalytics.colCategory,
    t.analyticsCenter.costAnalytics.colFrequency,
    t.analyticsCenter.costAnalytics.colClosestMatch
  ];

  // Sum of total costs
  const totalCost = modelCosts.reduce((acc, c) => acc + c.costUsd, 0);

  return (
    <div className="space-y-6 text-xs text-slate-800 dark:text-slate-200">

      {/* Row 1: AI Cost KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-widest block">{t.analyticsCenter.costAnalytics.kpiTotalCost}</span>
            <span className="text-xl font-black font-mono text-slate-900 dark:text-white leading-none">
              ${totalCost.toFixed(2)}
            </span>
            <span className="block text-[8px] text-slate-400 mt-1">{t.analyticsCenter.costAnalytics.kpiTotalCostSub}</span>
          </div>
          <DollarSign className="w-8 h-8 text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 p-1.5 rounded-full shrink-0" />
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-widest block">{t.analyticsCenter.costAnalytics.kpiInputTokens}</span>
            <span className="text-xl font-black font-mono text-slate-900 dark:text-white leading-none">
              {(modelCosts.reduce((acc, c) => acc + c.inputTokens, 0) / 1000000).toFixed(2)}M
            </span>
            <span className="block text-[8px] text-slate-400 mt-1">{t.analyticsCenter.costAnalytics.kpiInputTokensSub}</span>
          </div>
          <Database className="w-8 h-8 text-blue-500 bg-blue-50 dark:bg-blue-950/20 p-1.5 rounded-full shrink-0" />
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-widest block">{t.analyticsCenter.costAnalytics.kpiOutputTokens}</span>
            <span className="text-xl font-black font-mono text-slate-900 dark:text-white leading-none">
              {(modelCosts.reduce((acc, c) => acc + c.outputTokens, 0) / 1000000).toFixed(2)}M
            </span>
            <span className="block text-[8px] text-slate-400 mt-1">{t.analyticsCenter.costAnalytics.kpiOutputTokensSub}</span>
          </div>
          <Coins className="w-8 h-8 text-purple-500 bg-purple-50 dark:bg-purple-950/20 p-1.5 rounded-full shrink-0" />
        </div>
      </div>

      {/* Row 2: Costs split chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SVGBarChart
            data={modelCosts.map((c) => Math.round(c.costUsd))}
            labels={modelCosts.map((c) => c.modelName)}
            title={t.analyticsCenter.costAnalytics.chartTitle}
            barColor="#3b82f6"
          />
        </div>

        {/* Model metrics logs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none">{t.analyticsCenter.costAnalytics.logsTitle}</h4>
          <div className="space-y-4">
            {modelCosts.map((cost) => (
              <div key={cost.modelName} className="border-b border-slate-100 dark:border-slate-850 pb-2.5 space-y-1">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-slate-800 dark:text-white">{cost.modelName}</span>
                  <span className="font-mono text-emerald-500">${cost.costUsd.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                  <span>{t.analyticsCenter.costAnalytics.inputLabel}: {(cost.inputTokens / 1000000).toFixed(3)}M</span>
                  <span>{t.analyticsCenter.costAnalytics.outputLabel}: {(cost.outputTokens / 1000000).toFixed(3)}M</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: RAG Search Failures */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none">{t.analyticsCenter.costAnalytics.ragTitle}</h4>
          <p className="text-[10px] text-slate-500 dark:text-slate-455 mt-1">{t.analyticsCenter.costAnalytics.ragSubtitle}</p>
        </div>

        <EnterpriseTable headers={searchHeaders}>
          {ragSearchFailures.map((fail, idx) => (
            <tr key={idx} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-950/10">
              <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">"{fail.query}"</td>
              <td className="px-6 py-4 font-mono uppercase tracking-wider">{fail.category}</td>
              <td className="px-6 py-4 font-mono font-bold text-rose-500 dark:text-rose-405">{fail.frequency} {t.analyticsCenter.costAnalytics.hitsUnit}</td>
              <td className="px-6 py-4 text-slate-500 dark:text-slate-400 italic">{t.analyticsCenter.costAnalytics.closestTarget}: {fail.closestMatch}</td>
            </tr>
          ))}
        </EnterpriseTable>
      </div>

    </div>
  );
}
