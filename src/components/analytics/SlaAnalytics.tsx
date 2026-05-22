import React from 'react';
import { SVGDonutChart, SVGLineChart } from '@/components/dashboard/Charts';
import { EnterpriseTable } from '@/components/shared/EnterpriseTable';
import { Badge } from '@/components/shared/BadgeSystem';
import { slaBreachTrends } from '@/data/seed/analyticsSeed';
import { Clock, ShieldAlert, TrendingUp, AlertTriangle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';

interface EscalationRecord {
  id: string;
  ticketId: string;
  customerName: string;
  priority: 'critical' | 'high' | 'medium';
  reason: string;
  timeSpentMins: number;
}

const recentEscalations: EscalationRecord[] = [
  { id: 'esc-1', ticketId: 'TCK-892', customerName: 'Ahmed Al-Shehri', priority: 'critical', reason: 'SAP refund invoice sync validation failed twice', timeSpentMins: 35 },
  { id: 'esc-2', ticketId: 'TCK-765', customerName: 'John Doe', priority: 'high', reason: 'NLU fail - bot failed refund eligibility rules', timeSpentMins: 18 },
  { id: 'esc-3', ticketId: 'TCK-491', customerName: 'Yasmine Smith', priority: 'medium', reason: 'Co-Browse session session connection timeout', timeSpentMins: 12 }
];

export function SlaAnalytics() {
  const { lang } = useApp();
  const t = translations[lang];

  const tableHeaders = [
    t.analyticsCenter.slaAnalytics.colTicketId,
    t.analyticsCenter.slaAnalytics.colCustomer,
    t.analyticsCenter.slaAnalytics.colPriority,
    t.analyticsCenter.slaAnalytics.colReason,
    t.analyticsCenter.slaAnalytics.colTime
  ];

  const getPriorityBadgeType = (p: EscalationRecord['priority']) => {
    if (p === 'critical') return 'warning';
    if (p === 'high') return 'info';
    return 'neutral';
  };

  const getPriorityLabel = (p: EscalationRecord['priority']) => {
    if (lang === 'ar') {
      if (p === 'critical') return 'حرجة';
      if (p === 'high') return 'عالية';
      return 'متوسطة';
    }
    return p.toUpperCase();
  };

  const csatLabels = lang === 'ar'
    ? ['راضي (CSAT 4-5)', 'محايد (CSAT 3)', 'غير راضي (CSAT 1-2)']
    : ['Satisfied (CSAT 4-5)', 'Neutral (CSAT 3)', 'Unsatisfied (CSAT 1-2)'];

  const weekdayLabels = lang === 'ar'
    ? ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-6 text-xs text-slate-800 dark:text-slate-200">

      {/* SLA Metric HUD Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-widest block">{t.analyticsCenter.slaAnalytics.kpiFirstResponse}</span>
            <span className="text-xl font-black font-mono text-slate-900 dark:text-white leading-none">99.1%</span>
            <span className="block text-[8px] text-slate-400 mt-1">{t.analyticsCenter.slaAnalytics.kpiFirstResponseGoal}</span>
          </div>
          <Clock className="w-8 h-8 text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 p-1.5 rounded-full shrink-0" />
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-widest block">{t.analyticsCenter.slaAnalytics.kpiResolution}</span>
            <span className="text-xl font-black font-mono text-slate-900 dark:text-white leading-none">97.8%</span>
            <span className="block text-[8px] text-slate-400 mt-1">{t.analyticsCenter.slaAnalytics.kpiResolutionGoal}</span>
          </div>
          <AlertTriangle className="w-8 h-8 text-amber-500 bg-amber-50 dark:bg-amber-950/20 p-1.5 rounded-full shrink-0" />
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-widest block">{t.analyticsCenter.slaAnalytics.kpiAvgLatency}</span>
            <span className="text-xl font-black font-mono text-slate-900 dark:text-white leading-none">2.4 {t.analyticsCenter.wallboard.minsUnit}</span>
            <span className="block text-[8px] text-slate-400 mt-1">{t.analyticsCenter.slaAnalytics.kpiAvgLatencySub}</span>
          </div>
          <TrendingUp className="w-8 h-8 text-blue-500 bg-blue-50 dark:bg-blue-950/20 p-1.5 rounded-full shrink-0" />
        </div>
      </div>

      {/* Row 2: CSAT / NPS breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SVGDonutChart
          data={[82, 12, 6]}
          labels={csatLabels}
          colors={['#10b981', '#6b7280', '#f43f5e']}
          title={t.analyticsCenter.slaAnalytics.csatTitle}
        />

        <SVGLineChart
          data={[78, 80, 84, 86, 85, 87, 89]}
          labels={weekdayLabels}
          title={t.analyticsCenter.slaAnalytics.npsTitle}
          gradientColor="#8b5cf6"
        />
      </div>

      {/* Row 3: Live Escalation Audit Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none">{t.analyticsCenter.slaAnalytics.escalationTitle}</h4>
          <p className="text-[10px] text-slate-500 dark:text-slate-455 mt-1">{t.analyticsCenter.slaAnalytics.escalationSubtitle}</p>
        </div>

        <EnterpriseTable headers={tableHeaders}>
          {recentEscalations.map((esc) => (
            <tr key={esc.id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-950/10">
              <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400 font-mono">{esc.ticketId}</td>
              <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{esc.customerName}</td>
              <td className="px-6 py-4">
                <Badge type={getPriorityBadgeType(esc.priority)}>
                  {getPriorityLabel(esc.priority)}
                </Badge>
              </td>
              <td className="px-6 py-4 text-slate-655 dark:text-slate-400 leading-relaxed max-w-xs truncate" title={esc.reason}>
                {esc.reason}
              </td>
              <td className="px-6 py-4 font-mono font-bold text-rose-500 dark:text-rose-405">{esc.timeSpentMins} {t.analyticsCenter.slaAnalytics.minsAgo}</td>
            </tr>
          ))}
        </EnterpriseTable>
      </div>

    </div>
  );
}
