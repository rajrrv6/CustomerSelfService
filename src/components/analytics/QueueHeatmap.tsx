import React from 'react';
import { useWallboardFeed } from '@/hooks/useWallboardFeed';
import { HeatmapGrid } from './shared/HeatmapGrid';
import { StatusIndicator } from './shared/StatusIndicator';
import { EnterpriseTable } from '@/components/shared/EnterpriseTable';
import { Users, ShieldAlert, Award, Clock } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';

export function QueueHeatmap() {
  const { agents, distribution } = useWallboardFeed();
  const { lang } = useApp();
  const t = translations[lang];

  const rosterHeaders = [
    t.analyticsCenter.workforce.colAgentSpec,
    t.analyticsCenter.workforce.colActiveStatus,
    t.analyticsCenter.workforce.colSlaAdherence,
    t.analyticsCenter.workforce.colHandled,
    t.analyticsCenter.workforce.colCsat,
    t.analyticsCenter.workforce.colUtilRate
  ];

  const getStatusLabel = (status: string) => {
    if (lang === 'ar') {
      switch (status.toLowerCase()) {
        case 'online':
        case 'available':
          return 'نشط';
        case 'busy':
          return 'مشغول';
        case 'break':
          return 'استراحة';
        case 'training':
          return 'تدريب';
        case 'lunch':
          return 'غداء';
        case 'offline':
          return 'غير متصل';
        default:
          return status;
      }
    }
    return status;
  };

  const getAgentRole = (role: string) => {
    if (lang === 'ar') {
      if (role.includes('Refunds')) return 'دعم الاسترداد والمالية';
      if (role.includes('VIP')) return 'دعم كبار العملاء (VIP)';
      if (role.includes('Technical')) return 'الدعم الفني والربط';
      if (role.includes('Telephony')) return 'الدعم الهاتفي والصوت';
      if (role.includes('Generalist')) return 'أخصائي دعم عام';
      return role;
    }
    return role;
  };

  const getStateLabel = (label: string) => {
    if (lang === 'ar') {
      switch (label.toLowerCase()) {
        case 'telephony':
        case 'voice':
          return 'الاتصالات الهاتفية';
        case 'breaks':
        case 'break':
          return 'فترات الراحة';
        case 'admin':
        case 'backoffice':
          return 'المهام الإدارية';
        case 'offline':
          return 'غير متصل';
        default:
          return label;
      }
    }
    return label;
  };

  return (
    <div className="space-y-6 text-xs text-slate-800 dark:text-slate-200">
      
      {/* Row 1: Agent roster & State Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Agent Roster */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none">{t.analyticsCenter.workforce.rosterTitle}</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-455 mt-1">{t.analyticsCenter.workforce.rosterSubtitle}</p>
          </div>

          <div className="overflow-x-auto min-w-0">
            <EnterpriseTable headers={rosterHeaders}>
              {agents.map((agent) => (
                <tr key={agent.agentName} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-950/10">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-150 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold font-mono">
                        {agent.avatarLetter}
                      </div>
                      <div>
                        <strong className="block font-bold text-slate-900 dark:text-white">{agent.agentName}</strong>
                        <span className="text-[9px] text-slate-400 block mt-0.5 leading-none">{getAgentRole(agent.role)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusIndicator status={agent.activeStatus} label={getStatusLabel(agent.activeStatus)} />
                  </td>
                  <td className="px-4 py-3 font-mono font-bold">
                    <span className={agent.slaAdherence < 96 ? 'text-amber-500' : 'text-emerald-500'}>
                      {agent.slaAdherence}%
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{agent.handledTickets}</span> {t.analyticsCenter.workforce.ticketsUnit} / <span className="font-bold text-slate-800 dark:text-slate-200">{agent.handledCalls}</span> {t.analyticsCenter.workforce.callsUnit}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-amber-500">{agent.csatAvg} ★</td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">{agent.utilizationRate}%</td>
                </tr>
              ))}
            </EnterpriseTable>
          </div>
        </div>

        {/* State allocation distribution */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none">{t.analyticsCenter.workforce.utilizationTitle}</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-455 mt-1">{t.analyticsCenter.workforce.utilizationSubtitle}</p>
          </div>

          <div className="space-y-4 py-4">
            {distribution.map((state) => {
              // calculate percentage out of total (sum is 42)
              const percentage = Math.round((state.count / 42) * 100);
              return (
                <div key={state.label} className="space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-slate-655 dark:text-slate-400">{getStateLabel(state.label)}</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-250">
                      {state.count} {t.analyticsCenter.workforce.agentsCountLabel} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-100 dark:bg-slate-950/80 rounded-full overflow-hidden border border-slate-200/40 dark:border-slate-850">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ backgroundColor: state.color, width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-905 rounded-2xl flex items-start gap-2 text-[10px] text-slate-500 dark:text-slate-405">
            <Clock className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <span>{t.analyticsCenter.workforce.shiftScheduleSync}</span>
          </div>
        </div>

      </div>

      {/* Row 2: Heatmap grid */}
      <HeatmapGrid />

    </div>
  );
}
