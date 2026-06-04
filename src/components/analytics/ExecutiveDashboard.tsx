import React from 'react';
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';
import { Sparkline } from './shared/Sparkline';
import { journeyFunnelData, deflectionTrends } from '@/data/seed/analyticsSeed';
import { 
  TrendingUp, 
  Users, 
  Activity, 
  Clock, 
  Percent, 
  ShieldCheck, 
  HelpCircle,
  AlertTriangle,
  Brain,
  Globe,
  Coins,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import { OperationalActivityFeed } from '@/components/client-admin/shared/OperationalActivityFeed';

export function ExecutiveDashboard() {
  const { metrics, alerts } = useRealtimeMetrics();
  const { lang } = useApp();
  const isRtl = lang === 'ar';
  const t = translations[lang];

  // Cast translation keys to accommodate new fields safely
  const text = t.analyticsCenter.execDashboard as any;

  const handleNavigate = (screenId: string) => {
    window.dispatchEvent(
      new CustomEvent('navigate-to-screen', { detail: { screenId } })
    );
  };

  // Mock data for top failing NLU intents
  const failingIntents = [
    { name: 'cancel_order', count: 184, failureRate: 12.4, status: 'high' },
    { name: 'refund_request', count: 142, failureRate: 9.8, status: 'warning' },
    { name: 'update_payment', count: 96, failureRate: 8.5, status: 'warning' },
    { name: 'track_package', count: 210, failureRate: 6.2, status: 'normal' },
  ];

  // Mock data for AI token spend distribution
  const tokenCosts = [
    { provider: 'OpenAI GPT-4o', tokens: '4.2M', cost: '$63.00', pct: 60 },
    { provider: 'Anthropic Claude 3.5 Sonnet', tokens: '1.8M', cost: '$27.00', pct: 25 },
    { provider: 'DeepSeek-V3 (Self-Hosted)', tokens: '5.0M', cost: '$10.00', pct: 15 },
  ];

  return (
    <div className="space-y-6 text-xs text-slate-800 dark:text-slate-200">
      
      {/* Dynamic Anomaly & Alerts Center */}
      <div className="bg-rose-50/50 dark:bg-rose-950/10 border border-rose-200 dark:border-rose-900/50 rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-rose-100 dark:border-rose-900/30 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <h4 className="font-black text-xs uppercase tracking-wider text-rose-700 dark:text-rose-450 font-mono">
              {text.anomalyTitle || (isRtl ? 'تنبيهات الشذوذ التشغيلية والنظام' : 'System & Operational Anomaly Alerts')}
            </h4>
          </div>
          <span className="text-[10px] text-rose-600 dark:text-rose-450 font-bold font-mono">
            {alerts.length + 3} ACTIVE OBSERVATIONS
          </span>
        </div>

        {/* Anomaly Alerts Stack with Navigation Drilldowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Anomaly 1: Deflection Drop */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl flex flex-col justify-between gap-3 shadow-xs hover:border-rose-300 dark:hover:border-rose-900/40 transition-all">
            <div className="flex items-start gap-2.5">
              <div className="p-2 bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl">
                <TrendingUp className="w-4 h-4 rotate-180" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded font-bold">
                    SLA DEGRADATION
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono font-semibold">Just now</span>
                </div>
                <h5 className="font-bold text-[11px] text-slate-850 dark:text-slate-200 mt-1">
                  {isRtl 
                    ? 'انخفاض حرج في معدل الانحراف (52٪) على قنوات الواتساب.' 
                    : 'Critical deflection drop (52% < 60% threshold) detected on WhatsApp Bot.'}
                </h5>
                <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-0.5">
                  {isRtl 
                    ? 'السبب الجذري: زيادة في طلبات استرداد الأموال المرتجعة التي تتطلب مصادقة العميل.'
                    : 'Root cause: Surge in complex refund request dialog flows requiring human verification.'}
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-1 border-t border-slate-100 dark:border-slate-850">
              <button
                onClick={() => handleNavigate('bots')}
                className="px-2.5 py-1 text-[9px] font-bold bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg text-slate-650 dark:text-slate-300 transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>{text.viewBot || (isRtl ? 'عرض البوت' : 'View Bot')}</span>
              </button>
              <button
                onClick={() => handleNavigate('sla')}
                className="px-2.5 py-1 text-[9px] font-bold bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-600 dark:text-blue-400 transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>{text.inspectSla || (isRtl ? 'فحص اتفاقية الخدمة' : 'Inspect SLA')}</span>
              </button>
            </div>
          </div>

          {/* Anomaly 2: Token Cost Surge */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl flex flex-col justify-between gap-3 shadow-xs hover:border-amber-300 dark:hover:border-amber-900/40 transition-all">
            <div className="flex items-start gap-2.5">
              <div className="p-2 bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-450 rounded-xl">
                <Coins className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 bg-amber-100 dark:bg-amber-950/30 text-amber-650 dark:text-amber-400 rounded font-bold">
                    COST SURGE
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono font-semibold">12 mins ago</span>
                </div>
                <h5 className="font-bold text-[11px] text-slate-850 dark:text-slate-200 mt-1">
                  {isRtl 
                    ? 'ارتفاع حاد في استهلاك الرموز بنسبة (+142٪) في نموذج GPT-4o.' 
                    : 'Token spend anomaly detected in GPT-4o deployments (+142% spike over 3h).'}
                </h5>
                <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-0.5">
                  {isRtl 
                    ? 'السبب الجذري: موجهات طويلة بشكل مفرط في تراجع المحادثات الطارئة.'
                    : 'Root cause: Overly long prompt payloads triggering during recursive fallback loops.'}
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-1 border-t border-slate-100 dark:border-slate-850">
              <button
                onClick={() => handleNavigate('bots')}
                className="px-2.5 py-1 text-[9px] font-bold bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg text-slate-650 dark:text-slate-300 transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>{text.viewBot || (isRtl ? 'عرض البوت' : 'View Bot')}</span>
              </button>
              <button
                onClick={() => handleNavigate('guardrails')}
                className="px-2.5 py-1 text-[9px] font-bold bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900 border border-rose-200 dark:border-rose-805 rounded-lg text-rose-650 dark:text-rose-400 transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>{text.openGuardrails || (isRtl ? 'فتح حواجز الحماية' : 'Open Guardrails')}</span>
              </button>
            </div>
          </div>

          {/* Anomaly 3: API Endpoint Latency */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl flex flex-col justify-between gap-3 shadow-xs hover:border-rose-300 dark:hover:border-rose-900/40 transition-all">
            <div className="flex items-start gap-2.5">
              <div className="p-2 bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-450 rounded-xl">
                <Globe className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 bg-rose-100 dark:bg-rose-950/30 text-rose-650 dark:text-rose-400 rounded font-bold">
                    LATENCY CRITICAL
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono font-semibold">24 mins ago</span>
                </div>
                <h5 className="font-bold text-[11px] text-slate-850 dark:text-slate-200 mt-1">
                  {isRtl 
                    ? 'ارتفاع زمن استجابة نظام SAP CRM إلى 920 مللي ثانية على قناة الاتحاد الأوروبي.' 
                    : 'SAP CRM Webhook endpoint latency spiked to 920ms on EU channels.'}
                </h5>
                <p className="text-[10px] text-slate-500 dark:text-slate-455 mt-0.5">
                  {isRtl 
                    ? 'السبب الجذري: انتهاء مهلة المصادقة في البوابة الخارجية لشركاء الخدمة.'
                    : 'Root cause: External auth token refresh delays on partner SAP gateways.'}
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-1 border-t border-slate-100 dark:border-slate-850">
              <button
                onClick={() => handleNavigate('channels')}
                className="px-2.5 py-1 text-[9px] font-bold bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg text-slate-650 dark:text-slate-300 transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>{text.openChannel || (isRtl ? 'فتح القناة' : 'Open Channel')}</span>
              </button>
              <button
                onClick={() => handleNavigate('sla')}
                className="px-2.5 py-1 text-[9px] font-bold bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-600 dark:text-blue-400 transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>{text.inspectSla || (isRtl ? 'فحص اتفاقية الخدمة' : 'Inspect SLA')}</span>
              </button>
            </div>
          </div>

          {/* Anomaly 4: Generative Content / PII Trigger */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl flex flex-col justify-between gap-3 shadow-xs hover:border-amber-300 dark:hover:border-amber-900/40 transition-all">
            <div className="flex items-start gap-2.5">
              <div className="p-2 bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-450 rounded-xl">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 bg-amber-100 dark:bg-amber-950/30 text-amber-650 dark:text-amber-400 rounded font-bold">
                    COMPLIANCE WARNING
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono font-semibold">45 mins ago</span>
                </div>
                <h5 className="font-bold text-[11px] text-slate-850 dark:text-slate-200 mt-1">
                  {isRtl 
                    ? 'تم تنشيط مصفاة معلومات الهوية الشخصية (PII) 14 مرة خلال الـ 10 دقائق الأخيرة.' 
                    : 'PII Redaction filter triggered 14 times in past 10 minutes.'}
                </h5>
                <p className="text-[10px] text-slate-500 dark:text-slate-455 mt-0.5">
                  {isRtl 
                    ? 'السبب الجذري: محاولات إدخال أرقام الهوية الوطنية والبطاقات بشكل متكرر في المدخلات.'
                    : 'Root cause: Recursive submission of plain national ID card numbers in text inputs.'}
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-1 border-t border-slate-100 dark:border-slate-850">
              <button
                onClick={() => handleNavigate('guardrails')}
                className="px-2.5 py-1 text-[9px] font-bold bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900 border border-rose-200 dark:border-rose-805 rounded-lg text-rose-650 dark:text-rose-405 transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>{text.openGuardrails || (isRtl ? 'فتح حواجز الحماية' : 'Open Guardrails')}</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Interactions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-widest">{t.analyticsCenter.execDashboard.kpiPortalTraffic}</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <span className="text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white leading-none">
              {metrics.totalInteractions.toLocaleString()}
            </span>
            <span className="block text-[9px] text-slate-400 mt-1 font-semibold">{t.analyticsCenter.execDashboard.kpiPortalTrafficSub}</span>
          </div>
          <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-850">
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{t.analyticsCenter.execDashboard.kpiPortalTrafficTrend}</span>
            <Sparkline data={[120, 135, 142, 128, 145, 160, metrics.totalInteractions % 200]} color="#10b981" />
          </div>
        </div>

        {/* Deflection Rate */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-widest">{t.analyticsCenter.execDashboard.kpiDeflection}</span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <div>
            <span className="text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white leading-none">
              {metrics.deflectionRate}%
            </span>
            <span className="block text-[9px] text-slate-400 mt-1 font-semibold">{t.analyticsCenter.execDashboard.kpiDeflectionSub}</span>
          </div>
          <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-850">
            <span className="text-[10px] text-purple-650 dark:text-purple-400 font-bold">{t.analyticsCenter.execDashboard.kpiDeflectionTarget}</span>
            <Sparkline data={deflectionTrends.map(d => d.value)} color="#8b5cf6" />
          </div>
        </div>

        {/* SLA Compliance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-widest">{t.analyticsCenter.execDashboard.kpiSla}</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <span className={`text-2xl font-black font-mono tracking-tight leading-none ${metrics.slaCompliance < 95 ? 'text-rose-600 dark:text-rose-450' : 'text-slate-900 dark:text-white'}`}>
              {metrics.slaCompliance}%
            </span>
            <span className="block text-[9px] text-slate-400 mt-1 font-semibold">{t.analyticsCenter.execDashboard.kpiSlaSub}</span>
          </div>
          <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-850">
            <span className="text-[10px] text-slate-455 font-bold">{t.analyticsCenter.execDashboard.kpiSlaGoal}</span>
            <Sparkline data={[98.5, 98.1, 98.4, 97.9, 98.3, 98.5, metrics.slaCompliance]} color="#10b981" />
          </div>
        </div>

        {/* Average CSAT */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-widest">{t.analyticsCenter.execDashboard.kpiCsat}</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <span className="text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white leading-none">
              {metrics.averageCsat} <span className="text-slate-400 text-xs font-normal">/ 5.0</span>
            </span>
            <span className="block text-[9px] text-slate-400 mt-1 font-semibold">{t.analyticsCenter.execDashboard.kpiCsatSub}</span>
          </div>
          <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-850">
            <span className="text-[10px] text-amber-600 dark:text-amber-450 font-bold">{t.analyticsCenter.execDashboard.kpiCsatPositive}</span>
            <Sparkline data={[4.70, 4.71, 4.69, 4.72, 4.75, 4.70, metrics.averageCsat]} color="#f59e0b" />
          </div>
        </div>

      </div>

      {/* Row 2: Customer Journey Funnel & Real-time Live Event Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Customer Journey Funnel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none">{t.analyticsCenter.execDashboard.funnelTitle}</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-1">{t.analyticsCenter.execDashboard.funnelSubtitle}</p>
          </div>

          <div className="space-y-3.5 pt-2">
            {journeyFunnelData.map((step, idx) => {
              const barWidth = `${step.percentage}%`;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-slate-650 dark:text-slate-300">{step.step}</span>
                    <span className="font-mono text-slate-500 dark:text-slate-400">
                      {step.count.toLocaleString()} {t.analyticsCenter.execDashboard.funnelSessions} <span className="font-bold text-slate-800 dark:text-slate-200">({step.percentage}%)</span>
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

        {/* Real-time Operational Feed (Polished with Reusable Activity Feed) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-5 shadow-sm flex flex-col justify-between" style={{ height: '350px' }}>
          <div className="shrink-0 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none">
                {t.analyticsCenter.execDashboard.feedTitle}
              </h4>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-455 mt-1">
              {t.analyticsCenter.execDashboard.feedSubtitle}
            </p>
          </div>

          <div 
            className="flex-1 overflow-y-auto space-y-3 pr-1 bg-slate-50/50 dark:bg-slate-950/30 p-3 rounded-2xl border border-slate-100 dark:border-slate-900"
            aria-live="polite"
            aria-atomic="false"
          >
            <OperationalActivityFeed filterScope="analytics" compact limit={5} />
          </div>
        </div>

      </div>

      {/* Row 3: Top Failing NLU Intents & AI Token Spend observatory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Failing NLU Intents Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none">
                {text.failingIntentsTitle || (isRtl ? 'أهم نيات NLU الفاشلة' : 'Top Failing NLU Intents')}
              </h4>
              <Brain className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-1">
              {text.failingIntentsSub || (isRtl ? 'النيات ذات الثقة المنخفضة أو معدلات التراجع العالية.' : 'Intents with low confidence or high fallback rates.')}
            </p>
          </div>

          <div className="space-y-2.5 pt-2 flex-1">
            {failingIntents.map((intent, idx) => (
              <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850">
                <div className="space-y-0.5">
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-350">{intent.name}</span>
                  <span className="block text-[8px] text-slate-450">{intent.count} total occurrences</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono font-bold ${intent.status === 'high' ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {intent.failureRate}% fail rate
                  </span>
                  <div className={`w-2 h-2 rounded-full ${intent.status === 'high' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-850 flex justify-end">
            <button
              onClick={() => handleNavigate('bots')}
              className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer"
            >
              <span>{text.tuneOptimizer || (isRtl ? 'ضبط في محسن النيات' : 'Tune in Intent Optimizer')}</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* AI Token Spend & Costs Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none">
                {text.tokenSpendTitle || (isRtl ? 'مرصد استهلاك رموز الذكاء الاصطناعي والتكلفة' : 'AI Token Spend & Cost Observatory')}
              </h4>
              <Coins className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-1">
              {text.tokenSpendSub || (isRtl ? 'توزيعات استخدام وحجم الرموز وتكلفتها لكل مزود نموذج لغوي.' : 'Token volume usage and cost distributions per LLM provider.')}
            </p>
          </div>

          <div className="space-y-3.5 pt-2 flex-1">
            {tokenCosts.map((cost, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">{cost.provider}</span>
                  <span className="font-mono text-slate-600 dark:text-slate-400">
                    {cost.tokens} tokens <span className="font-bold text-slate-800 dark:text-slate-200">({cost.cost})</span>
                  </span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-950/80 rounded-full overflow-hidden border border-slate-200/40 dark:border-slate-850">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${cost.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-850 flex justify-end">
            <button
              onClick={() => handleNavigate('guardrails')}
              className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer"
            >
              <span>{text.configureGuardrails || (isRtl ? 'تكوين حواجز تكلفة الرموز' : 'Configure Cost Guardrails')}</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

