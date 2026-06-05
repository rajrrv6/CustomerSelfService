'use client';

import React from 'react';
import { AlertTriangle, Clock, Layers, ShieldAlert, TrendingUp, Users } from 'lucide-react';
import type { Agent, Conversation } from '@/types';
import { QueueHeatmapDashboard } from '@/components/client-admin/operations/QueueHeatmapDashboard';
import { QueueManagement, type QueueItem } from '@/components/client-admin/operations/QueueManagement';

function formatSeconds(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0s';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainderSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainderSeconds}s`;
}

function getPressureTone(pressureIndex: number): { label: string; className: string } {
  if (pressureIndex >= 180) {
    return { label: 'Critical', className: 'text-rose-600 dark:text-rose-455' };
  }
  if (pressureIndex >= 120) {
    return { label: 'Warning', className: 'text-amber-600 dark:text-amber-400' };
  }
  return { label: 'Stable', className: 'text-emerald-600 dark:text-emerald-400' };
}

export function LiveQueuesDashboard({
  lang,
  queuesList,
  setQueuesList,
  agents,
  conversations,
  addAuditLog,
  canEdit,
  canManage,
}: {
  lang: 'en' | 'ar';
  queuesList: QueueItem[];
  setQueuesList: React.Dispatch<React.SetStateAction<QueueItem[]>>;
  agents: Agent[];
  conversations: Conversation[];
  addAuditLog: (msg: string, type: 'success' | 'failed') => void;
  canEdit: boolean;
  canManage: boolean;
}) {
  const isRtl = lang === 'ar';

  const totalWaiting = queuesList.reduce((acc, q) => acc + q.waitingChatsCount, 0);
  const totalQueueAgents = queuesList.reduce((acc, q) => acc + q.activeAgentsCount, 0);
  const pressureIndex =
    totalQueueAgents > 0 ? Math.round((totalWaiting / totalQueueAgents) * 100) : totalWaiting > 0 ? 999 : 0;
  const pressureTone = getPressureTone(pressureIndex);

  const atRiskQueuesCount = queuesList.filter((q) => q.waitingChatsCount > 0 && q.waitingChatsCount >= q.activeAgentsCount)
    .length;
  const criticalQueuesCount = queuesList.filter((q) => q.waitingChatsCount > 0 && q.activeAgentsCount === 0).length;

  const activeAgentsOnline = agents.filter((a) => a.status !== 'offline').length;
  const escalationsOpen = conversations.filter((c) => c.status === 'escalated').length;

  const estimatedAvgWaitSeconds = queuesList.length
    ? Math.round(
        queuesList.reduce((acc, q) => {
          const estimatedQueueWaitSeconds = Math.min(q.maxWaitTimeMins * 60, 20 + q.waitingChatsCount * 45);
          return acc + estimatedQueueWaitSeconds;
        }, 0) / queuesList.length
      )
    : 0;

  const topAgents = agents
    .filter((a) => a.status !== 'offline')
    .slice()
    .sort((a, b) => b.activeChatsCount - a.activeChatsCount)
    .slice(0, 6);

  const overflowAlerts = queuesList
    .map((q) => {
      const estimatedQueueWaitSeconds = Math.min(q.maxWaitTimeMins * 60, 20 + q.waitingChatsCount * 45);
      const isCritical = q.waitingChatsCount > 0 && q.activeAgentsCount === 0;
      const isWarning = q.waitingChatsCount > 0 && q.waitingChatsCount >= q.activeAgentsCount;
      const label = isCritical ? 'Critical overflow' : isWarning ? 'Breach risk' : 'Stable';
      return {
        id: q.id,
        name: isRtl ? q.nameAr : q.nameEn,
        waiting: q.waitingChatsCount,
        agents: q.activeAgentsCount,
        slaTargetPercent: q.slaTargetPercent,
        maxWaitTimeMins: q.maxWaitTimeMins,
        overflowRule: q.overflowRule,
        estimatedQueueWaitSeconds,
        label,
        tone: isCritical ? 'critical' : isWarning ? 'warning' : 'stable',
      } as const;
    })
    .sort((a, b) => b.waiting - a.waiting);

  return (
    <div className="w-full min-w-0 flex-1 space-y-6 animate-in fade-in-50 duration-200" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="space-y-1.5">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          {isRtl ? 'الطوابير المباشرة ومؤشرات التوجيه' : 'Live Queues & Routing Telemetry'}
        </h2>
        <p className="text-xs text-slate-455">
          {isRtl
            ? 'مراقبة ضغط الطوابير، ووقت الانتظار، وتوزيع الوكلاء، والتنبيهات الفائضة (Overflow) بشكل مباشر.'
            : 'Monitor queue pressure, estimated wait times, agent distribution, and overflow risks in real-time.'}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 min-w-0">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl min-w-0">
          <span className="text-[9px] uppercase font-bold text-slate-400 font-mono block">
            {isRtl ? 'مؤشر ضغط الطوابير' : 'Queue Pressure Index'}
          </span>
          <div className="mt-1 flex items-end justify-between gap-3">
            <strong className="text-lg font-bold text-slate-800 dark:text-white font-mono block">{pressureIndex}</strong>
            <span className={`text-[10px] font-bold font-mono uppercase ${pressureTone.className}`}>
              {isRtl
                ? pressureTone.label === 'Critical'
                  ? 'حرج'
                  : pressureTone.label === 'Warning'
                    ? 'تحذير'
                    : 'مستقر'
                : pressureTone.label}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            {isRtl ? 'انتظار/وكلاء (تقديري)' : 'Waiting per active agent (est.)'}
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl min-w-0">
          <span className="text-[9px] uppercase font-bold text-slate-400 font-mono block">
            {isRtl ? 'عملاء في الانتظار' : 'Waiting Customers'}
          </span>
          <strong className="text-lg font-bold text-slate-800 dark:text-white font-mono block mt-1">{totalWaiting}</strong>
          <span className="text-[10px] text-slate-400 block mt-1">
            {isRtl ? 'عبر جميع الطوابير' : 'Across all queues'}
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl min-w-0">
          <span className="text-[9px] uppercase font-bold text-slate-400 font-mono block">
            {isRtl ? 'متوسط الانتظار' : 'Avg Wait (est.)'}
          </span>
          <strong className="text-lg font-bold text-slate-800 dark:text-white font-mono block mt-1">
            {formatSeconds(estimatedAvgWaitSeconds)}
          </strong>
          <span className="text-[10px] text-slate-400 block mt-1">
            {isRtl ? 'قبل الوصول لوكيل' : 'Before agent pickup'}
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl min-w-0">
          <span className="text-[9px] uppercase font-bold text-slate-400 font-mono block">
            {isRtl ? 'طوابير معرضة للخرق' : 'SLA At-Risk'}
          </span>
          <strong className="text-lg font-bold text-amber-600 dark:text-amber-400 font-mono block mt-1">
            {atRiskQueuesCount}
          </strong>
          <span className="text-[10px] text-slate-400 block mt-1">
            {isRtl ? 'انتظار ≥ وكلاء' : 'Waiting ≥ agents'}
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl min-w-0">
          <span className="text-[9px] uppercase font-bold text-slate-400 font-mono block">
            {isRtl ? 'وكلاء نشطون' : 'Active Agents'}
          </span>
          <strong className="text-lg font-bold text-slate-800 dark:text-white font-mono block mt-1">
            {activeAgentsOnline}
          </strong>
          <span className="text-[10px] text-slate-400 block mt-1">
            {isRtl ? 'متصلون/مشغولون' : 'Online/Busy'}
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl min-w-0">
          <span className="text-[9px] uppercase font-bold text-slate-400 font-mono block">
            {isRtl ? 'تصعيدات مفتوحة' : 'Escalations Open'}
          </span>
          <strong className="text-lg font-bold text-rose-600 dark:text-rose-455 font-mono block mt-1">
            {escalationsOpen}
          </strong>
          <span className="text-[10px] text-slate-400 block mt-1">
            {isRtl ? 'جلسات مصعدة' : 'Escalated sessions'}
          </span>
        </div>
      </div>

      <QueueHeatmapDashboard lang={lang} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 min-w-0">
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 min-w-0">
          <h3 className="font-bold text-xs text-slate-655 dark:text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            {isRtl ? 'توزيع الحمل وقياس الفائض' : 'Queue Load Distribution & Overflow Telemetry'}
          </h3>

          <div className="overflow-x-auto min-w-0">
            <table className="w-full text-left text-xs border-collapse min-w-[720px]">
              <thead>
                <tr className="border-b border-slate-105 dark:border-slate-800 text-slate-455 font-bold">
                  <th className="pb-3 pr-3">{isRtl ? 'الطابور' : 'Queue'}</th>
                  <th className="pb-3 pr-3">{isRtl ? 'انتظار' : 'Waiting'}</th>
                  <th className="pb-3 pr-3">{isRtl ? 'وكلاء' : 'Agents'}</th>
                  <th className="pb-3 pr-3">{isRtl ? 'انتظار (تقديري)' : 'Est. Wait'}</th>
                  <th className="pb-3 pr-3">{isRtl ? 'SLA' : 'SLA'}</th>
                  <th className="pb-3 pr-3">{isRtl ? 'قاعدة الفائض' : 'Overflow Rule'}</th>
                  <th className="pb-3 text-right">{isRtl ? 'الحالة' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-600 dark:text-slate-350">
                {overflowAlerts.map((row) => (
                  <tr key={row.id}>
                    <td className="py-3 pr-3 font-semibold text-slate-800 dark:text-slate-200 min-w-0">
                      <div className="min-w-0">
                        <div className="truncate">{row.name}</div>
                        <div className="text-[10px] text-slate-450 font-mono mt-0.5">ID: {row.id}</div>
                      </div>
                    </td>
                    <td className="py-3 pr-3 font-mono font-bold">{row.waiting}</td>
                    <td className="py-3 pr-3 font-mono">{row.agents}</td>
                    <td className="py-3 pr-3 font-mono inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {formatSeconds(row.estimatedQueueWaitSeconds)}
                    </td>
                    <td className="py-3 pr-3 font-mono">{row.slaTargetPercent}%</td>
                    <td className="py-3 pr-3 font-mono uppercase text-[10px] text-blue-650 dark:text-blue-400">
                      {row.overflowRule.replace('_', ' ')}
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold font-mono uppercase border ${
                          row.tone === 'critical'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-455 border-rose-500/25 animate-pulse'
                            : row.tone === 'warning'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25'
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
                        }`}
                      >
                        {row.tone === 'critical' ? (
                          <ShieldAlert className="w-3 h-3" />
                        ) : row.tone === 'warning' ? (
                          <AlertTriangle className="w-3 h-3" />
                        ) : (
                          <Users className="w-3 h-3" />
                        )}
                        <span>
                          {isRtl
                            ? row.tone === 'critical'
                              ? 'حرج'
                              : row.tone === 'warning'
                                ? 'تحذير'
                                : 'مستقر'
                            : row.label}
                        </span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {criticalQueuesCount > 0 && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-2xl text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 mt-0.5" />
              <div className="min-w-0">
                <div className="font-bold">
                  {isRtl ? 'تحذير فائض حرج' : 'Critical Overflow Warning'}
                </div>
                <div className="text-[11px] text-rose-700/80 dark:text-rose-200/80">
                  {isRtl
                    ? `يوجد ${criticalQueuesCount} طوابير بلا وكلاء نشطين مع عناصر في الانتظار. قم بتفعيل قواعد الفائض أو إعادة توزيع الوكلاء فوراً.`
                    : `${criticalQueuesCount} queues have waiting items with zero active agents. Trigger overflow rules or rebalance agent assignments immediately.`}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 min-w-0">
          <h3 className="font-bold text-xs text-slate-655 dark:text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-500" />
            {isRtl ? 'توزيع الوكلاء النشطين' : 'Active Agent Distribution'}
          </h3>

          <div className="space-y-3">
            {topAgents.map((a) => {
              const utilization = a.maxChatsCount > 0 ? Math.round((a.activeChatsCount / a.maxChatsCount) * 100) : 0;
              const barTone =
                utilization >= 90
                  ? 'bg-rose-500'
                  : utilization >= 70
                    ? 'bg-amber-500'
                    : 'bg-emerald-500';
              return (
                <div key={a.id} className="space-y-1">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{a.name}</span>
                    <span className="font-mono text-[11px] text-slate-500 shrink-0">
                      {a.activeChatsCount}/{a.maxChatsCount}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className={`h-full ${barTone}`} style={{ width: `${Math.min(100, utilization)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-105 dark:border-slate-850 text-[11px] text-slate-500">
            {isRtl
              ? 'تعرض هذه اللوحة توزيع الحمل الحالي حسب عدد الجلسات النشطة لكل وكيل.'
              : 'Shows current load distribution based on active sessions per agent.'}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 min-w-0">
        <h3 className="font-bold text-xs text-slate-655 dark:text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-indigo-500" />
          {isRtl ? 'إدارة الطوابير وعتبات الـ SLA' : 'Queue Management & SLA Thresholds'}
        </h3>
        <QueueManagement
          lang={lang}
          queuesList={queuesList}
          setQueuesList={setQueuesList}
          addAuditLog={addAuditLog}
          canEdit={canEdit}
          canManage={canManage}
        />
      </div>
    </div>
  );
}

