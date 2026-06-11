import React from 'react';
import { useAiMetrics } from '@/hooks/useAiMetrics';
import { SVGLineChart } from '@/components/dashboard/Charts';
import { EnterpriseTable } from '@/components/shared/EnterpriseTable';
import { Badge } from '@/components/shared/BadgeSystem';
import { ShieldAlert, AlertCircle, Clock } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';

export function AIContainmentMetrics() {
  const { prompts, hallucinationAlerts, containmentSeries } = useAiMetrics();
  const { lang } = useApp();
  const t = translations[lang];

  const promptHeaders = [
    t.analyticsCenter.containment.colPromptName,
    t.analyticsCenter.containment.colCategory,
    t.analyticsCenter.containment.colSuccessRate,
    t.analyticsCenter.containment.colAvgTokens,
    t.analyticsCenter.containment.colLatency
  ];

  const getAlertSeverityStyle = (score: number) => {
    if (score < 0.4) return 'bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/40 text-rose-800 dark:text-rose-400';
    return 'bg-amber-50 border-amber-250 dark:bg-amber-950/15 dark:border-amber-900/40 text-amber-800 dark:text-amber-400';
  };

  return (
    <div className="space-y-6 text-xs text-slate-800 dark:text-slate-200">
      
      {/* Row 1: Containment Trends & Safety Alert Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Containment Trend */}
        <SVGLineChart
          data={containmentSeries.map((s) => s.value)}
          labels={containmentSeries.map((s) => s.timestamp)}
          title={t.analyticsCenter.containment.chartTitle}
          gradientColor="#10b981"
        />

        {/* Hallucination Alerts */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between" style={{ minHeight: '270px' }}>
          <div className="shrink-0 mb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500 animate-bounce" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none">{t.analyticsCenter.containment.guardrailTitle}</h4>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-455 mt-1">{t.analyticsCenter.containment.guardrailSubtitle}</p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[190px]" aria-live="polite">
            {hallucinationAlerts.map((alert) => (
              <div 
                key={alert.id}
                className={`p-3 rounded-2xl border ${getAlertSeverityStyle(alert.confidenceScore)} space-y-1.5`}
              >
                <div className="flex justify-between items-center text-[9px] font-mono">
                  <span className="font-bold uppercase tracking-wider">{t.analyticsCenter.containment.confidenceScore}: {alert.confidenceScore} ({t.analyticsCenter.containment.critical})</span>
                  <span>{alert.timestamp}</span>
                </div>
                <div className="space-y-1 font-sans">
                  <p className="font-bold leading-tight">Q: "{alert.query}"</p>
                  <p className="opacity-80 italic">A: "{alert.response}"</p>
                </div>
                <div className="flex justify-end">
                  <span className="px-2 py-0.5 bg-rose-600/90 text-white rounded text-[8px] font-bold uppercase tracking-wide font-mono">
                    {alert.resolution.toLowerCase() === 'escalated'
                      ? (lang === 'ar' ? 'تم التصعيد إلى الوكيل' : 'ESCALATED TO AGENT')
                      : `${alert.resolution.toUpperCase()} ${t.analyticsCenter.containment.escalatedTo}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Row 2: Prompt configuration table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none">{t.analyticsCenter.containment.promptMatrixTitle}</h4>
          <p className="text-[10px] text-slate-500 dark:text-slate-455 mt-1">{t.analyticsCenter.containment.promptMatrixSubtitle}</p>
        </div>

        <EnterpriseTable headers={promptHeaders}>
          {prompts.map((p) => (
            <tr key={p.id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-950/10">
              <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{p.name}</td>
              <td className="px-6 py-4">
                <Badge type={p.category === 'NLU' ? 'info' : p.category === 'RAG' ? 'success' : 'neutral'}>
                  {p.category}
                </Badge>
              </td>
              <td className="px-6 py-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">{p.successRate}%</td>
              <td className="px-6 py-4 font-mono text-slate-500 dark:text-slate-400">{p.tokensAvg} {t.analyticsCenter.containment.tokensUnit}</td>
              <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">{p.latencyMs} ms</td>
            </tr>
          ))}
        </EnterpriseTable>
      </div>

    </div>
  );
}
