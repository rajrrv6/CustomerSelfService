'use client';

import React, { useState, useEffect } from 'react';
import { Eye, Volume2, AlertOctagon, Clock, UserCheck, ShieldAlert, CheckCircle, RotateCcw } from 'lucide-react';
import { OperationalCard } from '@/components/shared/OperationalCard';

interface AgentItem {
  id: string;
  name: string;
  avatarUrl: string;
  email: string;
  status: 'online' | 'busy' | 'away' | 'offline';
  activeChatsCount: number;
  maxChatsCount: number;
  csatScore: number;
  resolvedTicketsCount: number;
  lastActive: string;
}

interface LivePresenceBoardProps {
  lang: 'en' | 'ar';
  agents: AgentItem[];
  onAgentStatusChange: (agentId: string, status: 'online' | 'busy' | 'away' | 'offline') => void;
  supervisedAgent: string | null;
  setSupervisedAgent: (val: string | null) => void;
  activeSupervisorMode: 'silent' | 'whisper' | 'barge' | null;
  setActiveSupervisorMode: (val: 'silent' | 'whisper' | 'barge' | null) => void;
  addAuditLog: (msg: string, type: 'success' | 'failed') => void;
  canEdit: boolean;
  canManage: boolean;
}

type AuxCode = 'Available' | 'Break' | 'Lunch' | 'Coaching' | 'Meeting' | 'Offline' | 'After Call Work';

export function LivePresenceBoard({
  lang,
  agents,
  onAgentStatusChange,
  supervisedAgent,
  setSupervisedAgent,
  activeSupervisorMode,
  setActiveSupervisorMode,
  addAuditLog,
  canEdit,
  canManage
}: LivePresenceBoardProps) {
  const isRtl = lang === 'ar';

  // State to track Aux code and duration in seconds for each agent
  const [auxRoster, setAuxRoster] = useState<Record<string, { code: AuxCode; seconds: number }>>({
    'agent-1': { code: 'Available', seconds: 320 },
    'agent-2': { code: 'Break', seconds: 145 },
    'agent-3': { code: 'Lunch', seconds: 840 },
    'agent-4': { code: 'After Call Work', seconds: 75 },
    'agent-5': { code: 'Coaching', seconds: 480 }
  });

  // Ticking interval for duration timers
  useEffect(() => {
    const timer = setInterval(() => {
      setAuxRoster((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((key) => {
          next[key] = {
            ...next[key],
            seconds: next[key].seconds + 1
          };
        });
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDuration = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAuxChange = (agentId: string, code: AuxCode) => {
    if (!canEdit) return;
    // Map Aux Code to base DB status
    let baseStatus: 'online' | 'busy' | 'away' | 'offline' = 'online';
    if (code === 'Available') baseStatus = 'online';
    else if (code === 'Offline') baseStatus = 'offline';
    else if (code === 'After Call Work') baseStatus = 'busy';
    else baseStatus = 'away'; // Break, Lunch, Coaching, Meeting

    // Update roster state
    setAuxRoster((prev) => ({
      ...prev,
      [agentId]: { code, seconds: 0 }
    }));

    // Trigger parent app state change
    onAgentStatusChange(agentId, baseStatus);
  };

  // Translate AUX labels
  const getAuxLabel = (code: AuxCode) => {
    if (lang === 'ar') {
      switch (code) {
        case 'Available': return 'متاح (متصل)';
        case 'Break': return 'استراحة قصيرة';
        case 'Lunch': return 'استراحة الغداء';
        case 'Coaching': return 'جلسة توجيه';
        case 'Meeting': return 'اجتماع عمل';
        case 'Offline': return 'خارج العمل (Offline)';
        case 'After Call Work': return 'معالجة ما بعد المكالمة';
        default: return code;
      }
    }
    return code;
  };

  const getStatusDotColor = (code: AuxCode) => {
    switch (code) {
      case 'Available': return 'bg-emerald-500';
      case 'Offline': return 'bg-slate-500';
      case 'After Call Work': return 'bg-red-500';
      default: return 'bg-amber-500';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {agents.map((agent) => {
          const auxData = auxRoster[agent.id] || { code: 'Available' as AuxCode, seconds: 0 };
          const utilization = Math.round((agent.activeChatsCount / agent.maxChatsCount) * 100);
          const isMonitored = supervisedAgent === agent.id;
          
          return (
            <OperationalCard key={agent.id} className="p-5 space-y-4 flex flex-col justify-between">
              {/* Agent info row */}
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0 select-none">
                    <img
                      src={agent.avatarUrl}
                      alt={agent.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-slate-900 rounded-full ${getStatusDotColor(auxData.code)}`} />
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-slate-850 dark:text-white leading-tight truncate">{agent.name}</h4>
                    <span className="text-[9.5px] text-slate-455 font-mono block mt-0.5 truncate">{agent.email}</span>
                  </div>
                </div>

                {/* Aux code selector */}
                <select
                  value={auxData.code}
                  disabled={!canEdit}
                  onChange={(e) => handleAuxChange(agent.id, e.target.value as AuxCode)}
                  className={`bg-slate-900 border border-slate-800 rounded-xl px-2 py-1 text-[9px] font-bold text-slate-300 focus:outline-none hover:border-slate-700 max-w-[130px] font-sans ${!canEdit ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                  title={!canEdit ? "Requires Edit Permission" : undefined}
                >
                  <option value="Available">{getAuxLabel('Available')}</option>
                  <option value="Break">{getAuxLabel('Break')}</option>
                  <option value="Lunch">{getAuxLabel('Lunch')}</option>
                  <option value="Coaching">{getAuxLabel('Coaching')}</option>
                  <option value="Meeting">{getAuxLabel('Meeting')}</option>
                  <option value="After Call Work">{getAuxLabel('After Call Work')}</option>
                  <option value="Offline">{getAuxLabel('Offline')}</option>
                </select>
              </div>

              {/* Ticking Duration Badge */}
              <div className="flex items-center justify-between text-[9px] font-bold font-mono text-slate-450 dark:text-slate-400 select-none bg-slate-50 dark:bg-slate-955 p-2 rounded-xl border border-slate-100 dark:border-slate-850">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-500 animate-spin" style={{ animationDuration: '4s' }} />
                  <span>{isRtl ? 'حالة التواجد الحالية:' : 'Current State Presence:'}</span>
                </div>
                <span className="text-blue-600 dark:text-blue-450 uppercase">
                  {getAuxLabel(auxData.code)} [{formatDuration(auxData.seconds)}]
                </span>
              </div>

              {/* Caseload Utilization Occupancy rate */}
              <div className="pt-2 border-t border-slate-150 dark:border-slate-800/80 text-[10px]">
                <div className="flex justify-between items-center mb-1 font-semibold text-slate-500">
                  <span>{isRtl ? 'معدل إشغال الحالات (Occupancy):' : 'Caseload Occupancy Rate:'}</span>
                  <strong className="font-mono font-bold text-slate-700 dark:text-slate-350">{utilization}%</strong>
                </div>

                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                  <div className={`h-full ${utilization >= 100 ? 'bg-red-500' : utilization > 60 ? 'bg-amber-500' : 'bg-blue-600'}`} style={{ width: `${utilization}%` }} />
                </div>

                <div className="flex justify-between items-center text-[9px] text-slate-455 dark:text-slate-500 font-mono select-none">
                  <span>{isRtl ? `المحادثات: ${agent.activeChatsCount}/${agent.maxChatsCount}` : `Active Slots: ${agent.activeChatsCount}/${agent.maxChatsCount}`}</span>
                  <span className="font-bold text-amber-500">{isRtl ? `CSAT التراكمي: ${agent.csatScore}%` : `CSAT Rating: ${agent.csatScore}%`}</span>
                </div>
              </div>

              {/* Supervisor actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                <span className="text-[9px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider font-mono select-none">
                  {isMonitored && activeSupervisorMode 
                    ? (isRtl ? `تتبع نشط: ${activeSupervisorMode.toUpperCase()}` : `ACTIVE: ${activeSupervisorMode.toUpperCase()}`) 
                    : (isRtl ? 'مراقبة المشرف:' : 'Supervisor Audit:')}
                </span>

                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (!canManage) return;
                      setSupervisedAgent(isMonitored && activeSupervisorMode === 'silent' ? null : agent.id);
                      setActiveSupervisorMode(isMonitored && activeSupervisorMode === 'silent' ? null : 'silent');
                      addAuditLog(`Silent monitored session for Agent: ${agent.name}`, 'success');
                    }}
                    disabled={!canManage}
                    className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                      isMonitored && activeSupervisorMode === 'silent'
                        ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                        : !canManage
                        ? 'border-slate-800 opacity-60 cursor-not-allowed text-slate-455'
                        : 'border-slate-800 hover:bg-slate-800 text-slate-455 hover:text-slate-200'
                    }`}
                    title={!canManage ? "Requires Manage Permission" : "Silent Listen-In"}
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!canManage) return;
                      setSupervisedAgent(isMonitored && activeSupervisorMode === 'whisper' ? null : agent.id);
                      setActiveSupervisorMode(isMonitored && activeSupervisorMode === 'whisper' ? null : 'whisper');
                      addAuditLog(`Initiated supervisor coaching whisper with Agent: ${agent.name}`, 'success');
                    }}
                    disabled={!canManage}
                    className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                      isMonitored && activeSupervisorMode === 'whisper'
                        ? 'bg-amber-600 border-amber-500 text-white shadow-sm'
                        : !canManage
                        ? 'border-slate-800 opacity-60 cursor-not-allowed text-slate-455'
                        : 'border-slate-800 hover:bg-slate-800 text-slate-455 hover:text-slate-200'
                    }`}
                    title={!canManage ? "Requires Manage Permission" : "Whisper Coaching"}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!canManage) return;
                      setSupervisedAgent(isMonitored && activeSupervisorMode === 'barge' ? null : agent.id);
                      setActiveSupervisorMode(isMonitored && activeSupervisorMode === 'barge' ? null : 'barge');
                      addAuditLog(`Supervisor barged directly into live dialogue with Agent: ${agent.name}`, 'success');
                    }}
                    disabled={!canManage}
                    className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                      isMonitored && activeSupervisorMode === 'barge'
                        ? 'bg-red-600 border-red-500 text-white shadow-sm'
                        : !canManage
                        ? 'border-slate-800 opacity-60 cursor-not-allowed text-slate-455'
                        : 'border-slate-800 hover:bg-slate-800 text-slate-455 hover:text-slate-200'
                    }`}
                    title={!canManage ? "Requires Manage Permission" : "Barge-in Confirmed"}
                  >
                    <AlertOctagon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </OperationalCard>
          );
        })}
      </div>
    </div>
  );
}
