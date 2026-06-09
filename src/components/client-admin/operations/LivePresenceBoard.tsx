'use client';

import React, { useState, useEffect } from 'react';
import { Eye, Volume2, Clock, UserCheck, ShieldAlert, CheckCircle, RotateCcw, Info, X, Ear } from 'lucide-react';
import { OperationalCard } from '@/components/shared/OperationalCard';
import { useFeedbackToasts } from '@/components/customer-portal/feedback/PostChatToasts';
import { useApp } from '@/context/AppContext';

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
  onWhisperAgent?: (agentId: string) => void;
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
  canManage,
  onWhisperAgent
}: LivePresenceBoardProps) {
  const isRtl = lang === 'ar';
  const { pushToast } = useFeedbackToasts();
  const { conversations, setConversations } = useApp();

  const [inspectingAgent, setInspectingAgent] = useState<AgentItem | null>(null);
  const [detailsAgent, setDetailsAgent] = useState<AgentItem | null>(null);

  const overrideCanEdit = true;
  const overrideCanManage = true;

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

  // Sync auxRoster state when agents prop changes (e.g. overrode from supervisor panel)
  useEffect(() => {
    setAuxRoster((prev) => {
      const next = { ...prev };
      let updated = false;
      agents.forEach((agent) => {
        const currentAux = next[agent.id]?.code;
        let expectedAux: AuxCode = 'Available';
        if (agent.status === 'online') expectedAux = 'Available';
        else if (agent.status === 'offline') expectedAux = 'Offline';
        else if (agent.status === 'busy') expectedAux = 'After Call Work';
        else {
          // agent.status === 'away'
          // If already in away category, keep it, else default to 'Break'
          const isAwayCode = ['Break', 'Lunch', 'Coaching', 'Meeting'].includes(currentAux || '');
          expectedAux = isAwayCode ? (currentAux as AuxCode) : 'Break';
        }

        if (currentAux !== expectedAux || !next[agent.id]) {
          next[agent.id] = { code: expectedAux, seconds: currentAux === expectedAux ? (next[agent.id]?.seconds ?? 0) : 0 };
          updated = true;
        }
      });
      return updated ? next : prev;
    });
  }, [agents]);

  const formatDuration = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAuxChange = (agentId: string, code: AuxCode) => {
    if (!overrideCanEdit) return;
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

    const targetAgent = agents.find(a => a.id === agentId);
    const agentName = targetAgent ? targetAgent.name : agentId;
    pushToast('success', isRtl ? 'تم تغيير حالة الـ AUX بنجاح' : 'AUX Status Override Applied', isRtl ? `تم تحويل الوكيل ${agentName} إلى ${getAuxLabel(code)}` : `Agent ${agentName} presence successfully overridden to ${code}.`);
    addAuditLog(`Supervisor forced status override on ${agentName} to ${code.toUpperCase()}`, 'success');
  };

  const openAgentInspector = (agent: AgentItem) => {
    setInspectingAgent(agent);
    pushToast('info', isRtl ? 'تم فتح المفتش المباشر' : 'Agent Inspector Opened', isRtl ? `عرض تفاصيل المراقبة النشطة للوكيل ${agent.name}` : `Viewing active monitoring details for Agent: ${agent.name}`);
    addAuditLog(`Supervisor opened live agent inspector for ${agent.name}`, 'success');
  };

  const triggerSilentMonitorMode = (agent: AgentItem) => {
    const isCurrentlyMonitoring = supervisedAgent === agent.id && activeSupervisorMode === 'silent';
    setSupervisedAgent(isCurrentlyMonitoring ? null : agent.id);
    setActiveSupervisorMode(isCurrentlyMonitoring ? null : 'silent');
    
    if (!isCurrentlyMonitoring) {
      pushToast('success', isRtl ? 'تم تفعيل المراقبة الصامتة' : 'Silent Monitoring Engaged', isRtl ? `مراقبة الوكيل ${agent.name} قيد التشغيل حالياً بصمت.` : `Supervisor silent monitoring active for Agent: ${agent.name}`);
      addAuditLog(`Supervisor initiated silent monitoring with Agent: ${agent.name}`, 'success');

      const activeConv = conversations.find(c => c.agentId === (agent.id === 'agent-1' ? 'agent-1' : 'agent-2') && c.status === 'active');
      if (activeConv) {
        const systemMsg = {
          id: `msg-sys-monitor-${Date.now()}`,
          sender: 'system' as const,
          senderName: 'System',
          text: `Supervisor started silent monitoring`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          messageType: 'system' as any
        };
        setConversations(prev =>
          prev.map(c => c.id === activeConv.id ? { ...c, messages: [...c.messages, systemMsg] } : c)
        );
      }
    } else {
      pushToast('info', isRtl ? 'تم إلغاء المراقبة الصامتة' : 'Silent Monitoring Terminated', isRtl ? `تم إنهاء مراقبة الوكيل ${agent.name}.` : `Supervisor silent monitoring session ended for Agent: ${agent.name}`);
      addAuditLog(`Supervisor ended silent monitoring with Agent: ${agent.name}`, 'success');
    }
  };

  const triggerWhisperMode = (agent: AgentItem) => {
    const isCurrentlyWhispering = supervisedAgent === agent.id && activeSupervisorMode === 'whisper';
    setSupervisedAgent(isCurrentlyWhispering ? null : agent.id);
    setActiveSupervisorMode(isCurrentlyWhispering ? null : 'whisper');
    
    if (!isCurrentlyWhispering) {
      if (onWhisperAgent) {
        onWhisperAgent(agent.id);
      }
      pushToast('success', isRtl ? 'تم تفعيل التوجيه الهامس' : 'Whisper Coaching Engaged', isRtl ? `تلقين الوكيل ${agent.name} قيد التشغيل حالياً.` : `Supervisor whisper coaching active for Agent: ${agent.name}`);
      addAuditLog(`Supervisor initiated coaching whisper with Agent: ${agent.name}`, 'success');

      const activeConv = conversations.find(c => c.agentId === (agent.id === 'agent-1' ? 'agent-1' : 'agent-2') && c.status === 'active');
      if (activeConv) {
        const systemMsg = {
          id: `msg-sys-whisper-${Date.now()}`,
          sender: 'system' as const,
          senderName: 'System',
          text: `Supervisor started whisper coaching`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          messageType: 'system' as any
        };
        setConversations(prev =>
          prev.map(c => c.id === activeConv.id ? { ...c, messages: [...c.messages, systemMsg] } : c)
        );
      }
    } else {
      pushToast('info', isRtl ? 'تم إلغاء التوجيه الهامس' : 'Whisper Coaching Terminated', isRtl ? `تم إنهاء تلقين الوكيل ${agent.name}.` : `Supervisor whisper coaching session ended for Agent: ${agent.name}`);
      addAuditLog(`Supervisor ended coaching whisper with Agent: ${agent.name}`, 'success');
    }
  };

  const openPresenceDetails = (agent: AgentItem) => {
    setDetailsAgent(agent);
    pushToast('info', isRtl ? 'تم فتح تفاصيل الحالة' : 'Presence Details Opened', isRtl ? `عرض سجل الـ AUX والالتزام للوكيل ${agent.name}` : `Viewing AUX timeline and schedule adherence for Agent: ${agent.name}`);
    addAuditLog(`Supervisor inspected presence timeline for ${agent.name}`, 'success');
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
                    <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-white dark:border-slate-900 rounded-full ${getStatusDotColor(auxData.code)}`} />
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-slate-800 dark:text-white leading-tight truncate">{agent.name}</h4>
                    <span className="text-[9.5px] text-slate-455 font-mono block mt-0.5 truncate">{agent.email}</span>
                  </div>
                </div>

                {/* Aux code selector */}
                <select
                  value={auxData.code}
                  disabled={false}
                  onChange={(e) => handleAuxChange(agent.id, e.target.value as AuxCode)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1 text-[9px] font-bold text-slate-700 dark:text-slate-300 focus:outline-none hover:border-slate-300 dark:hover:border-slate-700 max-w-[130px] font-sans cursor-pointer"
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
              <div className="flex items-center justify-between text-[9px] font-bold font-mono text-slate-455 dark:text-slate-400 select-none bg-slate-50 dark:bg-slate-955 p-2 rounded-xl border border-slate-100 dark:border-slate-850">
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

                <div className="flex gap-1 items-center">
                  <button
                    type="button"
                    onClick={() => openAgentInspector(agent)}
                    className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                      inspectingAgent?.id === agent.id
                        ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-455 hover:text-slate-850 dark:hover:text-slate-200'
                    }`}
                    title="Live Inspector"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => triggerSilentMonitorMode(agent)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-xl border transition-all cursor-pointer ${
                      isMonitored && activeSupervisorMode === 'silent'
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm'
                        : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 dark:bg-emerald-955/20 dark:hover:bg-emerald-900/20 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400'
                    }`}
                    title="Silent Monitor"
                  >
                    <Ear className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'مراقبة صامتة' : 'Silent Monitor'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => triggerWhisperMode(agent)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-xl border transition-all cursor-pointer ${
                      isMonitored && activeSupervisorMode === 'whisper'
                        ? 'bg-purple-600 border-purple-500 text-white shadow-sm'
                        : 'bg-purple-50 hover:bg-purple-100 border-purple-200 dark:bg-purple-955/20 dark:hover:bg-purple-900/20 dark:border-purple-800/50 text-purple-700 dark:text-purple-400'
                    }`}
                    title="Whisper Coaching"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'تلقين الوكيل' : 'Whisper to Agent'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openPresenceDetails(agent)}
                    className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                      detailsAgent?.id === agent.id
                        ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-455 hover:text-slate-850 dark:hover:text-slate-200'
                    }`}
                    title="Presence Details"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </OperationalCard>
          );
        })}
      </div>

      {/* Inspect Agent Live Modal */}
      {inspectingAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-slate-800 dark:text-slate-200">
            <div className="flex justify-between items-start">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 font-mono flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-blue-550" />
                {isRtl ? 'مفتش الوكيل المباشر' : 'Agent Live Inspector'}
              </h3>
              <button
                onClick={() => setInspectingAgent(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl">
              <img
                src={inspectingAgent.avatarUrl}
                alt={inspectingAgent.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white leading-tight">{inspectingAgent.name}</h4>
                <p className="text-xs text-slate-455 font-mono mt-0.5">{inspectingAgent.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-850 rounded-xl space-y-0.5">
                <span className="text-slate-400 font-bold uppercase text-[9px] block">Active Slots</span>
                <span className="font-mono text-sm font-bold">{inspectingAgent.activeChatsCount} / {inspectingAgent.maxChatsCount}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-850 rounded-xl space-y-0.5">
                <span className="text-slate-400 font-bold uppercase text-[9px] block">CSAT Rating</span>
                <span className="font-mono text-sm font-bold text-emerald-500">{inspectingAgent.csatScore}%</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-850 rounded-xl space-y-0.5">
                <span className="text-slate-400 font-bold uppercase text-[9px] block">Resolved Tickets</span>
                <span className="font-mono text-sm font-bold text-blue-500">{inspectingAgent.resolvedTicketsCount}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-850 rounded-xl space-y-0.5">
                <span className="text-slate-400 font-bold uppercase text-[9px] block">Last Active</span>
                <span className="font-mono text-sm font-bold">{inspectingAgent.lastActive}</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-slate-400 font-bold uppercase text-[9px] font-mono block">Real-time Stream Feed</span>
              <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl text-[10px] font-mono text-slate-400 space-y-1 max-h-28 overflow-y-auto">
                <p className="text-emerald-500">[LIVE] Connected to socket stream-732</p>
                <p>[11:24:02] Agent accepted inbound chat conv-2</p>
                <p>[11:25:40] Chat sentiment: NEGATIVE (warning flag)</p>
                <p className="text-purple-400">[COACH] Suggest sending SLA compensation discount</p>
              </div>
            </div>

            <button
              onClick={() => setInspectingAgent(null)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-center text-xs cursor-pointer transition-colors"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}

      {/* Presence details Modal */}
      {detailsAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-slate-800 dark:text-slate-200">
            <div className="flex justify-between items-start">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 font-mono flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-550" />
                {isRtl ? 'تفاصيل حالة الحضور والـ AUX' : 'Presence & AUX Timeline'}
              </h3>
              <button
                onClick={() => setDetailsAgent(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-850">
                <span className="text-slate-455">Agent Name:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{detailsAgent.name}</span>
              </div>
              <div className="flex justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-850">
                <span className="text-slate-455">Current AUX Code:</span>
                <span className="font-bold text-amber-500 font-mono">{auxRoster[detailsAgent.id]?.code || 'Available'}</span>
              </div>
              <div className="flex justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-850">
                <span className="text-slate-455">AUX State Duration:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100 font-mono">{formatDuration(auxRoster[detailsAgent.id]?.seconds || 0)}</span>
              </div>
              <div className="flex justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-850">
                <span className="text-slate-455">Schedule Adherence:</span>
                <span className="font-bold text-emerald-500 font-mono">98.2% (In Adherence)</span>
              </div>
              <div className="flex justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-850">
                <span className="text-slate-455">Shift Coverage:</span>
                <span className="text-slate-800 dark:text-slate-100 font-mono text-[10px]">09:00 - 17:00 AST (Shift Morning)</span>
              </div>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-955/20 border border-blue-200/50 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase font-mono block">
                💡 Roster Compliance Checklist
              </span>
              <p className="text-[10.5px] text-slate-600 dark:text-slate-400 leading-normal font-medium">
                Agent has completed all mandatory RAG/Copilot training compliance audits. Currently within target threshold limits.
              </p>
            </div>

            <button
              onClick={() => setDetailsAgent(null)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-center text-xs cursor-pointer transition-colors"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
