import React from 'react';
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';
import { useAnalyticsFeed } from '@/hooks/useAnalyticsFeed';
import { Sparkline } from './shared/Sparkline';
import { journeyFunnelData, deflectionTrends, initialExecutiveKpis } from '@/data/seed/analyticsSeed';
import { TrendingUp, Users, Activity, Clock, Percent, ShieldCheck, HelpCircle } from 'lucide-react';

export function ExecutiveDashboard() {
  const { metrics, alerts } = useRealtimeMetrics();
  const { feed } = useAnalyticsFeed();

  // Color categories for live feed events
  const getFeedCategoryStyle = (category: string) => {
    switch (category) {
      case 'bot':
        return 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900/40';
      case 'voice':
        return 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40';
      case 'ticket':
        return 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/40';
      case 'integration':
        return 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/40';
      case 'system':
      default:
        return 'bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-405 border-slate-200 dark:border-slate-800';
    }
  };

  return (
    <div className="space-y-6 text-xs text-slate-800 dark:text-slate-200">
      
      {/* Active Alerts HUD */}
      {alerts.length > 0 && (
        <div className="bg-rose-50/50 dark:bg-rose-950/10 border border-rose-200 dark:border-rose-900/50 rounded-3xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-rose-700 dark:text-rose-450 font-mono">
              Live Operations Warnings & SLA Indicators
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3" aria-live="polite">
            {alerts.slice(0, 2).map((alert) => (
              <div 
                key={alert.id}
                className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-850 p-3 rounded-2xl flex items-start gap-2.5 shadow-sm"
              >
                <div className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${alert.severity === 'critical' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                <div>
                  <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 font-bold">
                    {alert.source}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono ml-2">{alert.timestamp}</span>
                  <p className="font-bold text-[11px] text-slate-700 dark:text-slate-300 mt-1">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Interactions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-widest">Portal Traffic</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <span className="text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white leading-none">
              {metrics.totalInteractions.toLocaleString()}
            </span>
            <span className="block text-[9px] text-slate-400 mt-1 font-semibold">Realtime sessions tracked</span>
          </div>
          <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-850">
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">+18.2% vs prev week</span>
            <Sparkline data={[120, 135, 142, 128, 145, 160, metrics.totalInteractions % 200]} color="#10b981" />
          </div>
        </div>

        {/* Deflection Rate */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-widest">Self-Service Deflection</span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <div>
            <span className="text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white leading-none">
              {metrics.deflectionRate}%
            </span>
            <span className="block text-[9px] text-slate-400 mt-1 font-semibold">Resolved without Agent</span>
          </div>
          <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-850">
            <span className="text-[10px] text-purple-650 dark:text-purple-400 font-bold">Target: 60.0%</span>
            <Sparkline data={deflectionTrends.map(d => d.value)} color="#8b5cf6" />
          </div>
        </div>

        {/* SLA Compliance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-widest">SLA Compliance</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <span className={`text-2xl font-black font-mono tracking-tight leading-none ${metrics.slaCompliance < 95 ? 'text-rose-600 dark:text-rose-450' : 'text-slate-900 dark:text-white'}`}>
              {metrics.slaCompliance}%
            </span>
            <span className="block text-[9px] text-slate-400 mt-1 font-semibold">Response & Resolution</span>
          </div>
          <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-850">
            <span className="text-[10px] text-slate-450 font-bold">Goal: 98.0%</span>
            <Sparkline data={[98.5, 98.1, 98.4, 97.9, 98.3, 98.5, metrics.slaCompliance]} color="#10b981" />
          </div>
        </div>

        {/* Average CSAT */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-widest">Satisfaction Score</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <span className="text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white leading-none">
              {metrics.averageCsat} <span className="text-slate-400 text-xs font-normal">/ 5.0</span>
            </span>
            <span className="block text-[9px] text-slate-400 mt-1 font-semibold">Average CSAT index</span>
          </div>
          <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-850">
            <span className="text-[10px] text-amber-600 dark:text-amber-450 font-bold">Positive ratio: 84%</span>
            <Sparkline data={[4.70, 4.71, 4.69, 4.72, 4.75, 4.70, metrics.averageCsat]} color="#f59e0b" />
          </div>
        </div>

      </div>

      {/* Row 2: Customer Journey Funnel & Real-time Live Event Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Customer Journey Funnel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none">Customer Journey Conversion Funnel</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-1">Deflection conversion vs ticket creation drop-off.</p>
          </div>

          <div className="space-y-3.5 pt-2">
            {journeyFunnelData.map((step, idx) => {
              const barWidth = `${step.percentage}%`;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-slate-650 dark:text-slate-300">{step.step}</span>
                    <span className="font-mono text-slate-500 dark:text-slate-400">
                      {step.count.toLocaleString()} sessions <span className="font-bold text-slate-800 dark:text-slate-200">({step.percentage}%)</span>
                    </span>
                  </div>
                  <div className="h-4 bg-slate-100 dark:bg-slate-950/80 rounded-lg overflow-hidden border border-slate-200/40 dark:border-slate-850">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg transition-all duration-500"
                      style={{ width: barWidth }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Real-time Operational Feed */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between" style={{ height: '350px' }}>
          <div className="shrink-0 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none">Real-Time Operational Feed</h4>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-455 mt-1">Live streaming logs from RAG searches, webhooks, and telephony gateways.</p>
          </div>

          <div 
            className="flex-1 overflow-y-auto space-y-3 pr-1 bg-slate-50/50 dark:bg-slate-950/30 p-3 rounded-2xl border border-slate-100 dark:border-slate-900"
            aria-live="polite"
            aria-atomic="false"
          >
            {feed.map((event) => (
              <div 
                key={event.id}
                className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-2.5 rounded-xl space-y-1 transition-all shadow-xs"
              >
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-0.5 border rounded text-[8px] font-bold font-mono uppercase ${getFeedCategoryStyle(event.category)}`}>
                    {event.category}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">{event.timestamp}</span>
                </div>
                <h5 className="font-extrabold text-[11px] text-slate-850 dark:text-slate-200 leading-tight">{event.message}</h5>
                {event.details && (
                  <p className="text-[9px] text-slate-400 leading-relaxed font-mono truncate">{event.details}</p>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
