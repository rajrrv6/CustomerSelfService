'use client';

import React, { useState } from 'react';
import { useWallboardFeed } from '@/hooks/useWallboardFeed';
import { useVoiceQueue } from '@/hooks/useVoiceQueue';
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';
import { useApp } from '@/context/AppContext';
import { useAuthStore } from '@/stores/authStore';
import { translations } from '@/i18n/translations';
import { StatusIndicator } from './shared/StatusIndicator';
import { EnterpriseTable } from '@/components/shared/EnterpriseTable';
import { Badge } from '@/components/shared/BadgeSystem';
import { 
  Phone, 
  Clock, 
  Activity, 
  ShieldAlert, 
  Radio, 
  Ear, 
  Volume2, 
  UserCheck, 
  Plus, 
  UserMinus, 
  ExternalLink 
} from 'lucide-react';

export function LiveWallboard() {
  const { lang } = useApp();
  const t = translations[lang];
  const role = useAuthStore((state) => state.role);
  const isSupervisor = role === 'supervisor' || role === 'client_admin' || role === 'super_admin';
  const [speedMultiplier, setSpeedMultiplier] = useState(1);

  const { agents, logs, qualityBreakdown } = useWallboardFeed(speedMultiplier);
  const { queue, simulateInboundQueuedCall, dequeueCall } = useVoiceQueue();
  const { metrics } = useRealtimeMetrics();
  const [lastActionMsg, setLastActionMsg] = useState<string>('');

  const handleSimulateCall = () => {
    const call = simulateInboundQueuedCall();
    setLastActionMsg(`Simulated new inbound call from ${call.customerName} (${call.priority} Priority).`);
  };

  const handleRouteCall = (id: string, name: string) => {
    dequeueCall(id);
    setLastActionMsg(`Routed call for ${name} to available support agent.`);
  };

  // Find longest wait time in queue (in seconds)
  const longestWaitSeconds = queue.length > 0 ? Math.max(...queue.map((c) => c.waitTime)) : 0;
  const formatWaitTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  // Calculate average MOS score
  const avgMos = qualityBreakdown.length > 0 
    ? (qualityBreakdown.reduce((sum, q) => sum + q.mosScore, 0) / qualityBreakdown.length).toFixed(2)
    : '4.50';

  const getPriorityBadge = (p: 'VIP' | 'High' | 'Normal') => {
    if (p === 'VIP') return 'error'; // Red
    if (p === 'High') return 'warning'; // Yellow
    return 'info'; // Blue
  };

  const getActionBadge = (action: 'whisper' | 'barge' | 'silent_monitor') => {
    if (action === 'whisper') return 'info';
    if (action === 'barge') return 'error';
    return 'success';
  };

  const getActionLabel = (action: 'whisper' | 'barge' | 'silent_monitor') => {
    if (action === 'whisper') return t.analyticsCenter.wallboard.actionWhisper;
    if (action === 'barge') return t.analyticsCenter.wallboard.actionBarge;
    return t.analyticsCenter.wallboard.actionSilent;
  };

  return (
    <div className="space-y-6 text-xs text-slate-800 dark:text-slate-200">
      
      {/* Simulation Controls & Notification Feed */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950/20 border border-blue-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-none flex items-center gap-2">
              <Radio className="w-4 h-4 text-blue-500 animate-pulse" />
              {t.analyticsCenter.wallboard.consoleTitle}
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {t.analyticsCenter.wallboard.consoleSubtitle}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {isSupervisor && (
              <div className="flex items-center gap-1 bg-white dark:bg-slate-950 p-1.5 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-xs">
                <span className="text-[9px] font-bold text-slate-500 uppercase font-mono tracking-wider px-1">
                  Speed:
                </span>
                {[
                  { value: 1, label: '1x' },
                  { value: 2, label: '2x (Busy)' },
                  { value: 5, label: '5x (Surge)' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSpeedMultiplier(opt.value)}
                    className={`px-2 py-0.5 rounded-xl text-[9.5px] font-extrabold transition-all cursor-pointer ${
                      speedMultiplier === opt.value
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
            
            <button
              onClick={handleSimulateCall}
              disabled={!isSupervisor}
              className={`flex items-center justify-center gap-1.5 px-4 py-2 font-bold rounded-2xl shadow-sm transition-all outline-none ${
                isSupervisor
                  ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-850 text-white cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500'
                  : 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed'
              }`}
              aria-label="Simulate inbound VIP/high priority call"
            >
              <Plus className="w-4 h-4" />
              {t.analyticsCenter.wallboard.simulateCall}
            </button>
          </div>
        </div>

        {/* Aria live logs region */}
        <div 
          className="mt-3 py-2 px-3.5 bg-white dark:bg-slate-950/70 border border-slate-200/50 dark:border-slate-850 rounded-xl font-mono text-[9px] text-slate-500 dark:text-slate-400 flex items-center gap-2 min-h-[30px]"
          aria-live="polite"
          role="status"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
          <span>{lastActionMsg || t.analyticsCenter.wallboard.systemIdle}</span>
        </div>
      </div>

      {/* Wallboard KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Waiting Calls */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-widest">{t.analyticsCenter.wallboard.kpiCallsInQueue}</span>
            <Phone className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <span className={`text-2xl font-black font-mono tracking-tight leading-none ${queue.length > 3 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
              {queue.length}
            </span>
            <span className="block text-[9px] text-slate-400 mt-1 font-semibold">{t.analyticsCenter.wallboard.kpiCallsInQueueSub}</span>
          </div>
        </div>

        {/* Longest Wait */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-widest">{t.analyticsCenter.wallboard.kpiMaxWait}</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <span className={`text-2xl font-black font-mono tracking-tight leading-none ${longestWaitSeconds > 120 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
              {formatWaitTime(longestWaitSeconds)}
            </span>
            <span className="block text-[9px] text-slate-400 mt-1 font-semibold">{t.analyticsCenter.wallboard.kpiMaxWaitSub}</span>
          </div>
        </div>

        {/* SIP Codec Avg Quality */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-widest">{t.analyticsCenter.wallboard.kpiVoiceQuality}</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <span className="text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white leading-none">
              {avgMos} <span className="text-slate-400 text-xs font-normal">/ 5.0</span>
            </span>
            <span className="block text-[9px] text-slate-400 mt-1 font-semibold">{t.analyticsCenter.wallboard.kpiVoiceQualitySub}</span>
          </div>
        </div>

        {/* Roster active counts */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-widest">{t.analyticsCenter.wallboard.kpiActiveStaff}</span>
            <UserCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <span className="text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white leading-none">
              {metrics.activeAgents}
            </span>
            <span className="block text-[9px] text-slate-400 mt-1 font-semibold">{t.analyticsCenter.wallboard.kpiActiveStaffSub}</span>
          </div>
        </div>

      </div>

      {/* Row 2: Live Inbound Queue & SIP Trunk Quality */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Waiting queue list */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none">{t.analyticsCenter.wallboard.queueTitle}</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-455 mt-1">{t.analyticsCenter.wallboard.queueSubtitle}</p>
          </div>

          <div className="overflow-x-auto min-w-0" aria-live="polite">
            <EnterpriseTable headers={[
              t.analyticsCenter.wallboard.queueColCustomer,
              t.analyticsCenter.wallboard.queueColPhone,
              t.analyticsCenter.wallboard.queueColQueue,
              t.analyticsCenter.wallboard.queueColPriority,
              t.analyticsCenter.wallboard.queueColWait,
              t.analyticsCenter.wallboard.queueColAction
            ]}>
              {queue.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400 dark:text-slate-500">
                    {t.analyticsCenter.wallboard.queueEmpty}
                  </td>
                </tr>
              ) : (
                queue.map((call) => (
                  <tr key={call.id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-950/10 animate-fade-in-up">
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{call.customerName}</td>
                    <td className="px-4 py-3 font-mono text-slate-500 dark:text-slate-400">{call.phoneNumber}</td>
                    <td className="px-4 py-3 text-slate-655 dark:text-slate-400">{call.queueName}</td>
                    <td className="px-4 py-3">
                      <Badge type={getPriorityBadge(call.priority)}>
                        {call.priority}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-rose-500">
                      {formatWaitTime(call.waitTime)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleRouteCall(call.id, call.customerName)}
                        disabled={!isSupervisor}
                        className={`flex items-center gap-1 py-1 px-2.5 rounded-lg transition-colors border border-slate-200/40 dark:border-slate-700 outline-none ${
                          isSupervisor
                            ? 'bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/50 text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 cursor-pointer focus-visible:ring-1 focus-visible:ring-blue-500'
                            : 'bg-slate-50 text-slate-350 dark:bg-slate-900/60 dark:text-slate-600 cursor-not-allowed'
                        }`}
                        aria-label={`Route ${call.customerName} to agent`}
                      >
                        <UserMinus className="w-3 h-3" />
                        <span>{t.analyticsCenter.wallboard.routeAction}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </EnterpriseTable>
          </div>
        </div>

        {/* SIP Trunk Quality */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none">{t.analyticsCenter.wallboard.sipTitle}</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-455 mt-1">{t.analyticsCenter.wallboard.sipSubtitle}</p>
          </div>

          <div className="space-y-4 pt-2">
            {qualityBreakdown.map((trunk) => {
              const getMosBadgeColor = (mos: number) => {
                if (mos > 4.2) return 'success';
                if (mos > 3.8) return 'warning';
                return 'error';
              };
              
              return (
                <div key={trunk.codec} className="p-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-150 dark:border-slate-850 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 dark:text-white font-mono">{trunk.codec}</span>
                    <Badge type={getMosBadgeColor(trunk.mosScore)}>
                      MOS: {trunk.mosScore.toFixed(2)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                    <div className="bg-white dark:bg-slate-900/60 p-2 rounded-xl border border-slate-100 dark:border-slate-850">
                      <span className="block text-[8px] text-slate-400 font-sans uppercase">{t.analyticsCenter.wallboard.jitter}</span>
                      <span className="font-extrabold text-slate-800 dark:text-slate-250">{trunk.jitterMs.toFixed(1)} ms</span>
                    </div>
                    <div className="bg-white dark:bg-slate-900/60 p-2 rounded-xl border border-slate-100 dark:border-slate-850">
                      <span className="block text-[8px] text-slate-400 font-sans uppercase">{t.analyticsCenter.wallboard.packetLoss}</span>
                      <span className={`font-extrabold ${trunk.packetLossAvg > 1.0 ? 'text-rose-500' : 'text-slate-800 dark:text-slate-250'}`}>
                        {trunk.packetLossAvg.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Row 3: Supervisor Activity Whisper Log */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none">{t.analyticsCenter.wallboard.supervisorTitle}</h4>
          <p className="text-[10px] text-slate-500 dark:text-slate-455 mt-1">{t.analyticsCenter.wallboard.supervisorSubtitle}</p>
        </div>

        <div className="overflow-x-auto min-w-0" aria-live="polite">
          <EnterpriseTable headers={[
            t.analyticsCenter.wallboard.supColSupervisor,
            t.analyticsCenter.wallboard.supColAgent,
            t.analyticsCenter.wallboard.supColMode,
            t.analyticsCenter.wallboard.supColDuration,
            t.analyticsCenter.wallboard.supColTimestamp
          ]}>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-950/10 animate-fade-in-up">
                <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{log.supervisorName}</td>
                <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">{log.agentName}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    {log.actionType === 'whisper' && <Volume2 className="w-3.5 h-3.5 text-blue-500" />}
                    {log.actionType === 'barge' && <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />}
                    {log.actionType === 'silent_monitor' && <Ear className="w-3.5 h-3.5 text-emerald-500" />}
                    <Badge type={getActionBadge(log.actionType)}>
                      {getActionLabel(log.actionType)}
                    </Badge>
                  </div>
                </td>
                <td className="px-6 py-4 font-mono font-bold text-slate-800 dark:text-slate-250">{log.durationMins} {t.analyticsCenter.wallboard.minsUnit}</td>
                <td className="px-6 py-4 text-slate-450 font-mono font-semibold">{log.timestamp}</td>
              </tr>
            ))}
          </EnterpriseTable>
        </div>
      </div>

    </div>
  );
}
