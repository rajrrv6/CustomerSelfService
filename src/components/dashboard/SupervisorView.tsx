'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  ShieldAlert, 
  Volume2, 
  Send, 
  Calendar, 
  Users, 
  Eye, 
  HelpCircle, 
  Activity, 
  Shield, 
  Clock, 
  Layers, 
  Check, 
  X, 
  Sliders, 
  AlertTriangle, 
  Sparkles, 
  TrendingUp, 
  UserCheck, 
  RefreshCw, 
  ArrowUpRight, 
  ShieldCheck, 
  Mail, 
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { WfmAlertsPanel } from '@/components/client-admin/operations/WfmAlertsPanel';
import { QueueHeatmapDashboard } from '@/components/client-admin/operations/QueueHeatmapDashboard';
import { StaffingEscalationWorkflow } from '@/components/client-admin/operations/StaffingEscalationWorkflow';
import { LivePresenceBoard } from '@/components/client-admin/operations/LivePresenceBoard';
import { usePermission } from '@/stores/permissionStore';
import { SlaAnalytics } from '@/components/analytics/SlaAnalytics';
import type { QueueItem } from '@/components/client-admin/operations/QueueManagement';
import { LiveQueuesDashboard } from '@/components/dashboard/supervisor/LiveQueuesDashboard';

export function SupervisorView({ activeSubScreen }: { activeSubScreen: string }) {
  const { lang, agents, setAgents, conversations, setConversations, addAuditLog } = useApp();
  const isRtl = lang === 'ar';
  
  const { canEdit, canManage } = usePermission('workforce');
  
  const [whisperTargetChatId, setWhisperTargetChatId] = useState('conv-2');
  const [whisperInput, setWhisperInput] = useState('');
  
  // Supervisor monitoring state for presence board integration
  const [supervisedAgent, setSupervisedAgent] = useState<string | null>(null);
  const [activeSupervisorMode, setActiveSupervisorMode] = useState<'silent' | 'whisper' | 'barge' | null>(null);

  // ─── Local Multi-Language Dictionary ───
  const localT = {
    en: {
      shiftPlanning: 'Shift Planning & Rosters',
      shiftPlanningDesc: 'Schedule calendar shifts and approve schedule change requests.',
      weeklySchedule: 'Weekly Schedule Overview',
      shiftRequests: 'Schedule Shift Requests',
      occupancy: 'Occupancy & Load Settings',
      occupancyDesc: 'Configure concurrent limits, SLA levels, and warning thresholds.',
      agentPresence: 'Agent Presence & Aux Overrides',
      agentPresenceDesc: 'View presence codes, AUX times, and trigger supervisor state overrides.',
      queueDistribution: 'Queue Traffic Splits & Distribution',
      queueDistributionDesc: 'Adjust inbound routing weights and rebalance live call loads.',
      escalations: 'Priority Customer Escalations',
      escalationsDesc: 'Manage negative sentiment chats and override agent assignments.',
      reason: 'Reason',
      status: 'Status',
      actions: 'Actions',
      approve: 'Approve',
      reject: 'Reject',
      save: 'Save Parameters',
      saving: 'Saving Changes...',
      forceOverride: 'Force Status Override',
      rebalance: 'Rebalance Queue splits',
      rebalancing: 'Rebalancing Live Queues...',
      reassign: 'Reassign Agent',
      escalatePriority: 'Boost Priority',
      markResolved: 'Mark Resolved',
      chatTranscript: 'Live Chat Snippet',
      assign: 'Assign',
      boost: 'Boost',
      closeEscalation: 'Resolve Escalation',
      currentAuxState: 'Current Aux State',
      duration: 'Duration',
      selectAgent: 'Select Agent',
      targetAux: 'Target Aux State',
      applyOverride: 'Apply Override',
      chatsCount: 'Chats Active'
    },
    ar: {
      shiftPlanning: 'تخطيط المناوبات والجدولة',
      shiftPlanningDesc: 'جدولة مواعيد العمل والموافقة على طلبات تغيير جدول المناوبات.',
      weeklySchedule: 'جدول العمل الأسبوعي الموحد',
      shiftRequests: 'طلبات تعديل جدول المناوبات المرفوعة',
      occupancy: 'إعدادات نسبة الإشغال والتحميل',
      occupancyDesc: 'تكوين الحدود المتزامنة للمحادثات، ومستويات التحذير والـ SLA.',
      agentPresence: 'حالة الوكلاء وتجاوزات الـ Aux',
      agentPresenceDesc: 'متابعة رموز التواجد وزمن الـ AUX وتجاوز الحالات من المشرف.',
      queueDistribution: 'توزيع وتدفق طوابير الخدمة الموحدة',
      queueDistributionDesc: 'تعديل أوزان التوجيه الوارد وإعادة موازنة أحمال القنوات.',
      escalations: 'إدارة وتصعيد محادثات العملاء',
      escalationsDesc: 'التعامل مع المحادثات ذات المشاعر السلبية وتعديل توجيه الوكلاء.',
      reason: 'السبب',
      status: 'الحالة',
      actions: 'الإجراءات',
      approve: 'موافقة',
      reject: 'رفض',
      save: 'حفظ الإعدادات',
      saving: 'جاري الحفظ...',
      forceOverride: 'فرض تجاوز الحالة يدوياً',
      rebalance: 'إعادة موازنة طوابير الاتصال',
      rebalancing: 'جاري إعادة موازنة الطوابير...',
      reassign: 'إعادة تعيين الوكيل',
      escalatePriority: 'رفع الأولوية',
      markResolved: 'تحديد كمكتمل',
      chatTranscript: 'مقتطف المحادثة المباشرة',
      assign: 'تعيين',
      boost: 'تصعيد',
      closeEscalation: 'إنهاء التصعيد',
      currentAuxState: 'رمز الـ Aux الحالي',
      duration: 'المدة الزمنية',
      selectAgent: 'اختر الوكيل',
      targetAux: 'حالة الـ Aux المستهدفة',
      applyOverride: 'تطبيق التجاوز',
      chatsCount: 'المحادثات النشطة'
    }
  }[lang === 'ar' ? 'ar' : 'en'];

  // ─── Shift Planning States ───
  const [shiftRequests, setShiftRequests] = useState([
    { id: 'sr-1', agent: 'Liam Bennett', currentShift: '09:00 - 17:00 AST', requestedShift: '17:00 - 01:00 AST', date: '2026-06-10', reason: 'Doctor appointment', status: 'pending' },
    { id: 'sr-2', agent: 'Tariq Mansoor', currentShift: '17:00 - 01:00 AST', requestedShift: 'Off Duty', date: '2026-06-12', reason: 'Family graduation ceremony', status: 'pending' }
  ]);

  const [shiftSwaps, setShiftSwaps] = useState([
    { id: 'sw-1', agentRequesting: 'Liam Bennett', agentTarget: 'Nadia Vance', shiftOffered: '09:00 - 17:00 AST', shiftRequested: '17:00 - 01:00 AST', date: '2026-06-15', status: 'pending' },
    { id: 'sw-2', agentRequesting: 'Tariq Mansoor', agentTarget: 'Amira Ghadbi', shiftOffered: '17:00 - 01:00 AST', shiftRequested: '09:00 - 17:00 AST', date: '2026-06-16', status: 'pending' }
  ]);

  // ─── Occupancy Thresholds State ───
  const [occupancySettings, setOccupancySettings] = useState({
    maxConcurrentChats: 4,
    slaWarningThreshold: 120,
    autoEscalateToxicity: 75
  });
  const [isSavingOccupancy, setIsSavingOccupancy] = useState(false);

  const [occupancyAlerts, setOccupancyAlerts] = useState([
    { id: 'al-1', queue: 'Technical Escalations', trigger: 'Concurrency Limit Breach', current: '5 chats / agent', limit: '4 max', level: 'warning', action: 'Suggested queue traffic redistribution', status: 'active' },
    { id: 'al-2', queue: 'VIP Executive Line', trigger: 'SLA Warning Pacing', current: '135 seconds wait', limit: '120s max', level: 'critical', action: 'Forced status override triggered', status: 'active' },
    { id: 'al-3', queue: 'Tier 1 General Support', trigger: 'Toxicity Auto-Escalate', current: '82% Toxicity detected', limit: '75% threshold', level: 'escalated', action: 'Transferred chat to Supervisor Workspace', status: 'active' },
    { id: 'al-4', queue: 'Emails Backlog', trigger: 'No Trigger', current: '35% capacity', limit: '80% warn', level: 'stable', action: 'None required', status: 'active' }
  ]);

  // ─── Agent Presence Override States ───
  const [selectedAgentForOverride, setSelectedAgentForOverride] = useState<string>('agent-1');
  const [targetAuxCode, setTargetAuxCode] = useState<string>('Available');

  // ─── Queue Distribution States ───
  const [trafficWeights, setTrafficWeights] = useState({
    whatsapp: 40,
    webchat: 30,
    voice: 20,
    email: 10
  });
  const [isRebalancing, setIsRebalancing] = useState(false);

  // ─── Escalations state ───
  const [selectedEscalationId, setSelectedEscalationId] = useState<string | null>('conv-2');
  const [reassignAgentId, setReassignAgentId] = useState<string>('agent-1');

  const [interventionLogs, setInterventionLogs] = useState([
    { id: 'conv-2', customer: 'Oliver Queen', agent: 'Nadia Vance', reason: 'Toxicity Score: 78% (Angry waiting)', action: 'Sent Live Coaching Whisper instructions', status: 'resolved_in_sla' },
    { id: 'conv-1', customer: 'Bruce Wayne', agent: 'Liam Bennett', reason: 'VIP SLA Breached (2 mins overdue)', action: 'Reassigned interaction to Nadia Vance', status: 'resolved_in_sla' },
    { id: 'conv-3', customer: 'Clark Kent', agent: 'Liam Bennett', reason: 'Negative Feedback Rating received', action: 'Initiated supervisory check and follow up', status: 'escalation_boosted' }
  ]);

  // Workforce forecasting mock states
  const forecastData = [
    { hour: '09:00 - 10:00 AST', expectedChats: 45, scheduledAgents: 4, status: 'sufficient' },
    { hour: '10:00 - 11:00 AST', expectedChats: 120, scheduledAgents: 6, status: 'warning' },
    { hour: '11:00 - 12:00 AST', expectedChats: 140, scheduledAgents: 5, status: 'breach_risk' },
    { hour: '12:00 - 13:00 AST', expectedChats: 60, scheduledAgents: 4, status: 'sufficient' }
  ];

  // Live support queues mock state
  const [queuesList, setQueuesList] = useState<QueueItem[]>([
    {
      id: 'q-1',
      nameEn: 'Tier 1 General Support',
      nameAr: 'الدعم العام (المستوى الأول)',
      maxWaitTimeMins: 3,
      slaTargetPercent: 85,
      priorityWeight: 1,
      overflowRule: 'trigger_callback' as const,
      activeAgentsCount: 4,
      waitingChatsCount: 2
    },
    {
      id: 'q-2',
      nameEn: 'Technical Escalations (Tier 2)',
      nameAr: 'التصعيد الفني (المستوى الثاني)',
      maxWaitTimeMins: 5,
      slaTargetPercent: 90,
      priorityWeight: 5,
      overflowRule: 'vip_redirect' as const,
      activeAgentsCount: 2,
      waitingChatsCount: 1
    },
    {
      id: 'q-3',
      nameEn: 'VIP Executive Line',
      nameAr: 'قناة كبار الشخصيات VIP',
      maxWaitTimeMins: 1,
      slaTargetPercent: 98,
      priorityWeight: 10,
      overflowRule: 'secondary_pool' as const,
      activeAgentsCount: 2,
      waitingChatsCount: 0
    }
  ]);

  // Dynamic Aux ticker durations
  const [auxDurations, setAuxDurations] = useState<Record<string, number>>({
    'agent-1': 320,
    'agent-2': 145,
    'agent-3': 840,
    'agent-4': 75,
    'agent-5': 480
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setAuxDurations(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(k => {
          next[k] = next[k] + 1;
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleResolveShiftRequest = (requestId: string, status: 'approved' | 'rejected') => {
    if (!canManage) return;
    setShiftRequests(prev =>
      prev.map(r => r.id === requestId ? { ...r, status } : r)
    );
    const request = shiftRequests.find(r => r.id === requestId);
    if (request) {
      addAuditLog(`Supervisor ${status} shift change request for ${request.agent} on ${request.date}`, 'success');
    }
  };

  const handleResolveShiftSwap = (swapId: string, status: 'approved' | 'rejected') => {
    if (!canManage) return;
    setShiftSwaps(prev =>
      prev.map(s => s.id === swapId ? { ...s, status } : s)
    );
    const swap = shiftSwaps.find(s => s.id === swapId);
    if (swap) {
      addAuditLog(`Supervisor ${status} shift swap between ${swap.agentRequesting} and ${swap.agentTarget} on ${swap.date}`, 'success');
    }
  };

  const handleSaveOccupancySettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    setIsSavingOccupancy(true);
    setTimeout(() => {
      setIsSavingOccupancy(false);
      addAuditLog(`Supervisor updated operational occupancy thresholds: Max Chats ${occupancySettings.maxConcurrentChats}, SLA Warn ${occupancySettings.slaWarningThreshold}s`, 'success');
    }, 1200);
  };

  const handleMitigateAlert = (alertId: string) => {
    if (!canManage) return;
    setOccupancyAlerts(prev =>
      prev.map(a => a.id === alertId ? { ...a, status: 'mitigated', action: 'Mitigated by Supervisor' } : a)
    );
    const alert = occupancyAlerts.find(a => a.id === alertId);
    if (alert) {
      addAuditLog(`Supervisor mitigated occupancy alert for ${alert.queue}: ${alert.trigger}`, 'success');
    }
  };

  const handleForcePresenceOverride = () => {
    if (!canEdit) return;
    const targetAgent = agents.find(a => a.id === selectedAgentForOverride);
    if (!targetAgent) return;

    let baseStatus: 'online' | 'busy' | 'away' | 'offline' = 'online';
    if (targetAuxCode === 'Available') baseStatus = 'online';
    else if (targetAuxCode === 'Offline') baseStatus = 'offline';
    else if (targetAuxCode === 'After Call Work') baseStatus = 'busy';
    else baseStatus = 'away';

    setAgents(prev =>
      prev.map(a => a.id === selectedAgentForOverride ? { ...a, status: baseStatus } : a)
    );
    
    // Reset secondary timer
    setAuxDurations(prev => ({
      ...prev,
      [selectedAgentForOverride]: 0
    }));

    addAuditLog(`Supervisor forced status override on ${targetAgent.name} to ${targetAuxCode.toUpperCase()}`, 'success');
  };

  const handleInlinePresenceOverride = (agentId: string, auxCode: string) => {
    if (!canEdit) return;
    const targetAgent = agents.find(a => a.id === agentId);
    if (!targetAgent) return;

    let baseStatus: 'online' | 'busy' | 'away' | 'offline' = 'online';
    if (auxCode === 'Available') baseStatus = 'online';
    else if (auxCode === 'Offline') baseStatus = 'offline';
    else if (auxCode === 'After Call Work') baseStatus = 'busy';
    else baseStatus = 'away';

    setAgents(prev =>
      prev.map(a => a.id === agentId ? { ...a, status: baseStatus } : a)
    );
    
    // Reset secondary timer
    setAuxDurations(prev => ({
      ...prev,
      [agentId]: 0
    }));

    addAuditLog(`Supervisor forced inline status override on ${targetAgent.name} to ${auxCode.toUpperCase()}`, 'success');
  };

  const handleTriggerQueueRebalance = () => {
    if (!canManage) return;
    setIsRebalancing(true);
    setTimeout(() => {
      setIsRebalancing(false);
      addAuditLog(`Queue routing weights rebalanced successfully. Current splits: WA ${trafficWeights.whatsapp}%, Web ${trafficWeights.webchat}%, Voice ${trafficWeights.voice}%, Email ${trafficWeights.email}%`, 'success');
    }, 1200);
  };

  const handleApplyEscalationAction = (convId: string, actionType: 'reassign' | 'escalate_priority' | 'resolve') => {
    if (!canManage) return;
    setConversations(prev =>
      prev.map(c => {
        if (c.id === convId) {
          if (actionType === 'reassign') {
            return { ...c, agentId: reassignAgentId };
          }
          if (actionType === 'escalate_priority') {
            return { ...c, slaStatus: 'warning' };
          }
          if (actionType === 'resolve') {
            return { ...c, status: 'resolved' };
          }
        }
        return c;
      })
    );

    const chat = conversations.find(c => c.id === convId);
    if (chat) {
      if (actionType === 'reassign') {
        const agentName = reassignAgentId === 'agent-1' ? 'Liam Bennett' : 'Nadia Vance';
        addAuditLog(`Reassigned escalated conversation ${convId} to ${agentName}`, 'success');
      } else if (actionType === 'escalate_priority') {
        addAuditLog(`Boosted priority of conversation ${convId} to critical alert`, 'success');
      } else if (actionType === 'resolve') {
        addAuditLog(`Resolved escalation alert for conversation ${convId}`, 'success');
      }
    }
  };

  const handleSendWhisper = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whisperInput) return;

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === whisperTargetChatId) {
          return {
            ...c,
            status: 'escalated' // Escalated status renders the supervisor whisper bar
          };
        }
        return c;
      })
    );

    addAuditLog(`Supervisor sent coaching whisper to interaction ${whisperTargetChatId}: "${whisperInput}"`, 'success');
    setWhisperInput('');
  };

  const handleOverrideSla = (id: string) => {
    if (!canManage) return;
    setInterventionLogs(prev =>
      prev.map(log => log.id === id ? { ...log, status: 'sla_overridden', action: 'SLA Breach Overridden by Supervisor' } : log)
    );
    addAuditLog(`Supervisor overrode SLA targets for interaction ${id}`, 'success');
  };

  const handleAgentStatusChange = (agentId: string, status: 'online' | 'busy' | 'away' | 'offline') => {
    setAgents(agents.map(a => {
      if (a.id === agentId) {
        addAuditLog(`Supervisor manually overrode status of ${a.name} to ${status.toUpperCase()}`, 'success');
        return { ...a, status };
      }
      return a;
    }));
  };

  const getOccupancyRate = () => {
    const totalActive = agents.reduce((acc, a) => acc + a.activeChatsCount, 0);
    const totalMax = agents.reduce((acc, a) => acc + a.maxChatsCount, 0);
    return totalMax > 0 ? Math.round((totalActive / totalMax) * 100) : 0;
  };

  // Agent schedule profiles for shift planning
  const agentSchedules = [
    { name: 'Liam Bennett', shift: 'Monday - Friday: 09:00 - 17:00 AST', role: 'Support Agent', tag: 'Morning' },
    { name: 'Nadia Vance', shift: 'Monday - Friday: 17:00 - 01:00 AST', role: 'Support Agent', tag: 'Evening' },
    { name: 'Tariq Mansoor', shift: 'Monday - Thursday: 09:00 - 17:00 AST, Sat - Sun: 17:00 - 01:00 AST', role: 'Support Agent', tag: 'Split Shift' },
    { name: 'Amira Ghadbi', shift: 'Thursday - Sunday: 09:00 - 17:00 AST', role: 'Support Agent', tag: 'Weekend' }
  ];

  switch (activeSubScreen) {
    case 'supervisor_monitor':
      return (
        <div className="space-y-6 min-w-0" dir={isRtl ? 'rtl' : 'ltr'}>
          {/* Header */}
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              {isRtl ? 'منصة مراقبة المشرف والتحكم بالـ Aux' : 'Supervisor Monitoring Workspace'}
            </h2>
            <p className="text-xs text-slate-455">
              {isRtl 
                ? 'مراقبة المحادثات النشطة، والتدخل بالاتصالات الجارية، وتتبع وكلاء خدمة العملاء في الوقت الفعلي.' 
                : 'Monitor active conversations, review agent sentiment flags, and whisper coaching guidelines in real-time.'}
            </p>
          </div>

          {/* 1. Workforce Alerts Panel integration */}
          <WfmAlertsPanel lang={lang} />

          {/* 2. Roster dashboard indicators */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <span className="text-[9px] uppercase font-bold text-slate-400 font-mono block">
                {isRtl ? 'نسبة الإشغال الإجمالية' : 'Roster Occupancy Rate'}
              </span>
              <strong className="text-lg font-bold text-slate-800 dark:text-white font-mono block mt-1">
                {getOccupancyRate()}%
              </strong>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <span className="text-[9px] uppercase font-bold text-slate-400 font-mono block">
                {isRtl ? 'وكلاء في الاستراحة' : 'Agents in Break/Aux'}
              </span>
              <strong className="text-lg font-bold text-slate-800 dark:text-white font-mono block mt-1">
                {agents.filter(a => a.status === 'away').length} {isRtl ? 'وكلاء' : 'agents'}
              </strong>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <span className="text-[9px] uppercase font-bold text-slate-400 font-mono block">
                {isRtl ? 'المحادثات المصعدة' : 'Escalated Interactions'}
              </span>
              <strong className="text-lg font-bold text-slate-800 dark:text-white font-mono block mt-1">
                {conversations.filter(c => c.status === 'escalated').length} {isRtl ? 'حالات' : 'cases'}
              </strong>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <span className="text-[9px] uppercase font-bold text-slate-400 font-mono block">
                {isRtl ? 'متوسط نقاط CSAT الحالية' : 'Average Live CSAT'}
              </span>
              <strong className="text-lg font-bold text-emerald-500 font-mono block mt-1">
                94.2%
              </strong>
            </div>
          </div>

          {/* 3. Live Presence Board Enhancements */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs text-slate-655 dark:text-slate-400 uppercase font-mono tracking-wider">
              {isRtl ? 'الموظفين المتصلين وحالة الـ Aux' : 'Team Presence Roster & Aux Tracker'}
            </h3>
            <LivePresenceBoard
              lang={lang}
              agents={agents}
              onAgentStatusChange={handleAgentStatusChange}
              supervisedAgent={supervisedAgent}
              setSupervisedAgent={setSupervisedAgent}
              activeSupervisorMode={activeSupervisorMode}
              setActiveSupervisorMode={setActiveSupervisorMode}
              addAuditLog={addAuditLog}
              canEdit={canEdit}
              canManage={canManage}
            />
          </div>

          {/* 4. Live Agent Monitoring Table */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monitor roster */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 min-w-0">
              <h3 className="font-bold text-xs text-slate-655 dark:text-slate-400 uppercase font-mono">
                {isRtl ? 'طابور المحادثات الجارية للمراقبة' : 'Live Interaction Monitoring Roster'}
              </h3>
              <div className="overflow-x-auto min-w-0">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-455 font-bold">
                      <th className="pb-3">{isRtl ? 'العميل' : 'Customer'}</th>
                      <th className="pb-3">{isRtl ? 'الموظف المسؤول' : 'Agent Assigned'}</th>
                      <th className="pb-3">{isRtl ? 'تحليل المشاعر' : 'Sentiment'}</th>
                      <th className="pb-3">{isRtl ? 'حالة الـ SLA' : 'SLA Status'}</th>
                      <th className="pb-3 text-right">{isRtl ? 'إجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-600 dark:text-slate-350">
                    {conversations.filter(c => c.status === 'active' || c.status === 'escalated').map((chat) => (
                      <tr key={chat.id} className={chat.id === whisperTargetChatId ? 'bg-slate-50 dark:bg-slate-850/40' : ''}>
                        <td className="py-3.5">
                          <span className="font-bold text-slate-900 dark:text-white block">{chat.customerName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Channel: {chat.channel.toUpperCase()}</span>
                        </td>
                        <td className="py-3.5 font-medium">{chat.agentId === 'agent-1' ? 'Liam Bennett' : 'Nadia Vance'}</td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${
                            chat.sentiment === 'negative'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-455'
                              : 'bg-emerald-100 text-emerald-850'
                          }`}>
                            {chat.sentiment}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                            chat.slaStatus === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {chat.slaStatus.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => setWhisperTargetChatId(chat.id)}
                            className="px-2.5 py-1 text-[10px] font-bold bg-slate-100 hover:bg-slate-205 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-205 dark:border-slate-700 rounded-xl transition-all cursor-pointer"
                          >
                            {isRtl ? 'استماع' : 'Listen'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Live Whisper composer panel */}
            <div className="bg-slate-50 dark:bg-slate-900/55 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 h-fit space-y-4 text-xs font-semibold min-w-0">
              <h3 className="font-bold text-xs text-slate-650 dark:text-slate-400 uppercase font-mono flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-purple-500" />
                {isRtl ? 'تلقين الوكيل المباشر' : 'Live Agent Whisper Coaching'}
              </h3>
              
              <form onSubmit={handleSendWhisper} className="space-y-4">
                <div>
                  <label className="block text-slate-500 mb-1.5">{isRtl ? 'المستلم للملاحظة' : 'Coaching Recipient'}</label>
                  <select
                    value={whisperTargetChatId}
                    onChange={(e) => setWhisperTargetChatId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-900 rounded-xl focus:outline-none focus:border-blue-500 text-slate-300"
                  >
                    {conversations.filter(c => c.status === 'active' || c.status === 'escalated').map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.customerName} ({c.agentId === 'agent-1' ? 'Liam' : 'Nadia'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 mb-1.5">{isRtl ? 'ملاحظة التلقين الهامسة' : 'Whispering Instruction'}</label>
                  <textarea
                    required
                    rows={3}
                    placeholder={isRtl ? 'أدخل تعليمات التوجيه للوكيل...' : 'e.g. Propose checking customer API logs scopes...'}
                    value={whisperInput}
                    onChange={(e) => setWhisperInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-550 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-purple-650 hover:bg-purple-700 text-white font-bold rounded-xl text-center cursor-pointer shadow-md active:scale-95 transition-all"
                >
                  {isRtl ? 'إرسال ملاحظة همس' : 'Whisper to Agent'}
                </button>
              </form>
            </div>
          </div>
        </div>
      );

    case 'live_queues':
      return (
        <LiveQueuesDashboard
          lang={lang}
          queuesList={queuesList}
          setQueuesList={setQueuesList}
          agents={agents}
          conversations={conversations}
          addAuditLog={addAuditLog}
          canEdit={canEdit}
          canManage={canManage}
        />
      );

    case 'workforce':
      return (
        <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
          {/* Header */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              {isRtl ? 'تخطيط الموظفين والجدولة الذكية' : 'Forecasting & Operations Management'}
            </h2>
            <p className="text-xs text-slate-455">
              {isRtl 
                ? 'تحليل ازدحام طوابير الدعم الفني، ووضع جداول العمل وتحقيق التوازن للمناوبات.' 
                : 'Analyze forecasted contact center queues and optimize agent shift schedules.'}
            </p>
          </div>

          {/* 1. Queue Heatmap Dashboard */}
          <QueueHeatmapDashboard lang={lang} />

          {/* 2. Staffing Escalation Workflow */}
          <StaffingEscalationWorkflow lang={lang} />

          {/* 3. Traffic Forecast Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-xs text-slate-655 dark:text-slate-400 uppercase font-mono">
              {isRtl ? 'توقعات حجم المحادثات اليومية' : "Today's Traffic Forecast Metrics"}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-450 font-bold">
                    <th className="pb-3">{isRtl ? 'ساعة المناوبة' : 'Shift Hour'}</th>
                    <th className="pb-3">{isRtl ? 'حجم الجلسات المتوقع' : 'Expected Inbound Chats'}</th>
                    <th className="pb-3">{isRtl ? 'عدد الوكلاء المجدولين' : 'Scheduled Agents'}</th>
                    <th className="pb-3">{isRtl ? 'تقييم كفاية القوى العاملة' : 'Status Assessment'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-600 dark:text-slate-350">
                  {forecastData.map((row, idx) => (
                    <tr key={idx}>
                      <td className="py-3.5 font-semibold font-mono">{row.hour}</td>
                      <td className="py-3.5 font-bold font-mono">{row.expectedChats} sessions</td>
                      <td className="py-3.5 font-mono">{row.scheduledAgents} agents</td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${
                          row.status === 'sufficient'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400'
                            : row.status === 'warning'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-955/20 dark:text-rose-455'
                        }`}>
                          {row.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );

    case 'sla':
      return (
        <div className="space-y-6">
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              {isRtl ? 'لوحة تحكم اتفاقية الخدمة (SLA)' : 'SLA Analytics Dashboard'}
            </h2>
            <p className="text-xs text-slate-455">
              {isRtl 
                ? 'تحليل وتحسين شروط الالتزام بالـ SLA لخدمات الدعم وقنوات الدردشة.' 
                : 'Monitor response rate breaches and channel specific SLA metrics.'}
            </p>
          </div>
          <SlaAnalytics />
        </div>
      );
           case 'shift_planning':
      return (
        <div className="w-full min-w-0 flex-1 space-y-6 animate-in fade-in-50 duration-200" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              {localT.shiftPlanning}
            </h2>
            <p className="text-xs text-slate-455">
              {localT.shiftPlanningDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* KPI Cards / Roster Stats Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-xs text-slate-655 dark:text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-indigo-500" />
                {isRtl ? 'مؤشرات الالتزام بالجدول' : 'Roster & Adherence Telemetry'}
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-955 border border-slate-105 dark:border-slate-850 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">
                    {isRtl ? 'معدل الالتزام الكلي' : 'Adherence Rate'}
                  </span>
                  <strong className="text-xl font-bold text-emerald-500 font-mono block mt-1">
                    96.4%
                  </strong>
                  <span className="text-[9px] text-slate-400 block mt-0.5">{isRtl ? 'ضمن النطاق المسموح' : 'Target: >95.0%'}</span>
                </div>
                
                <div className="p-3 bg-slate-50 dark:bg-slate-955 border border-slate-105 dark:border-slate-850 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">
                    {isRtl ? 'ساعات إضافية' : 'Overtime Alert'}
                  </span>
                  <strong className="text-xl font-bold text-amber-500 font-mono block mt-1">
                    4.0 hrs
                  </strong>
                  <span className="text-[9px] text-amber-600 dark:text-amber-400 block mt-0.5">{isRtl ? 'موافقة مطلوبة' : '2 Pending Audits'}</span>
                </div>
                
                <div className="p-3 bg-slate-50 dark:bg-slate-955 border border-slate-105 dark:border-slate-850 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">
                    {isRtl ? 'تعديلات الجدول' : 'Roster Requests'}
                  </span>
                  <strong className="text-xl font-bold text-blue-500 font-mono block mt-1">
                    {shiftRequests.filter(r => r.status === 'pending').length}
                  </strong>
                  <span className="text-[9px] text-slate-400 block mt-0.5">{isRtl ? 'في الانتظار' : 'Requires Sign-off'}</span>
                </div>
                
                <div className="p-3 bg-slate-50 dark:bg-slate-955 border border-slate-105 dark:border-slate-850 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">
                    {isRtl ? 'تبادلات معلقة' : 'Swap Requests'}
                  </span>
                  <strong className="text-xl font-bold text-purple-500 font-mono block mt-1">
                    {shiftSwaps.filter(s => s.status === 'pending').length}
                  </strong>
                  <span className="text-[9px] text-slate-400 block mt-0.5">{isRtl ? 'موافقة ثنائية' : 'Requires Review'}</span>
                </div>
              </div>

              {/* Overtime Warnings Banner */}
              <div className="p-3 bg-amber-50 dark:bg-amber-955/20 border border-amber-200/50 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase font-mono block">
                  ⚠️ Overtime Limit Warnings
                </span>
                <p className="text-[10.5px] text-slate-600 dark:text-slate-400 leading-normal font-medium">
                  Liam Bennett is currently on track to exceed scheduled weekly hours (+2.5 hrs projected). Audit pending.
                </p>
              </div>
            </div>

            {/* Calendar Roster Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-xs text-slate-655 dark:text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-500" />
                {localT.weeklySchedule}
              </h3>
              
              <div className="space-y-3">
                {agentSchedules.map((profile, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-900 rounded-2xl gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center font-bold text-xs text-blue-600 dark:text-blue-400">
                        {profile.name.substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-850 dark:text-white">{profile.name}</h4>
                        <span className="text-[10px] text-slate-455 block">{profile.role}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold font-mono bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 uppercase">
                        {profile.tag}
                      </span>
                      <span className="font-mono text-xs text-slate-600 dark:text-slate-300">
                        {profile.shift}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shift Request & Swaps Queue */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
              {/* Normal Shift Requests */}
              <div className="space-y-4">
                <h3 className="font-bold text-xs text-slate-655 dark:text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-850">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  {localT.shiftRequests}
                </h3>

                <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                  {shiftRequests.map((req) => (
                    <div key={req.id} className="p-3 bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-850 rounded-xl space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <strong className="text-xs text-slate-850 dark:text-white block font-bold">{req.agent}</strong>
                          <span className="text-[9px] text-slate-400 font-mono block mt-0.5">{req.date}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold font-mono uppercase ${
                          req.status === 'pending'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400'
                            : req.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-955/20 dark:text-rose-455'
                        }`}>
                          {req.status}
                        </span>
                      </div>

                      <div className="text-[10px] space-y-1 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-850">
                        <div><span className="text-slate-455 font-medium">From:</span> <span className="font-mono text-slate-700 dark:text-slate-300">{req.currentShift}</span></div>
                        <div><span className="text-slate-455 font-medium">To:</span> <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{req.requestedShift}</span></div>
                      </div>

                      {req.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleResolveShiftRequest(req.id, 'approved')}
                            disabled={!canManage}
                            className="flex-1 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                          >
                            <Check className="w-3 h-3" />
                            {localT.approve}
                          </button>
                          <button
                            onClick={() => handleResolveShiftRequest(req.id, 'rejected')}
                            disabled={!canManage}
                            className="flex-1 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                          >
                            <X className="w-3 h-3" />
                            {localT.reject}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Shift Swap Requests */}
              <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-850">
                <h3 className="font-bold text-xs text-slate-655 dark:text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4 text-purple-500" />
                  {isRtl ? 'طلبات تبادل المناوبات' : 'Shift Swap Approvals'}
                </h3>

                <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                  {shiftSwaps.map((swap) => (
                    <div key={swap.id} className="p-3 bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-850 rounded-xl space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <strong className="text-xs text-slate-850 dark:text-white block font-bold">
                            {swap.agentRequesting} ⇄ {swap.agentTarget}
                          </strong>
                          <span className="text-[9px] text-slate-400 font-mono block mt-0.5">{swap.date}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold font-mono uppercase ${
                          swap.status === 'pending'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400'
                            : swap.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-955/20 dark:text-emerald-400'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-955/20 dark:text-rose-455'
                        }`}>
                          {swap.status}
                        </span>
                      </div>

                      <div className="text-[10px] space-y-1 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-850">
                        <div><span className="text-slate-455 font-medium">{swap.agentRequesting}:</span> <span className="font-mono text-slate-700 dark:text-slate-350">{swap.shiftOffered}</span></div>
                        <div><span className="text-slate-455 font-medium">{swap.agentTarget}:</span> <span className="font-mono text-slate-700 dark:text-slate-350 font-bold">{swap.shiftRequested}</span></div>
                      </div>

                      {swap.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleResolveShiftSwap(swap.id, 'approved')}
                            disabled={!canManage}
                            className="flex-1 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                          >
                            <Check className="w-3 h-3" />
                            {localT.approve}
                          </button>
                          <button
                            onClick={() => handleResolveShiftSwap(swap.id, 'rejected')}
                            disabled={!canManage}
                            className="flex-1 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                          >
                            <X className="w-3 h-3" />
                            {localT.reject}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Shift Compliance & Roster Adherence Audit */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 w-full">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <h3 className="font-bold text-xs text-slate-655 dark:text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-blue-500" />
                {isRtl ? 'سجل امتثال وتغطية الجداول الزمنية' : 'Shift Compliance & Roster Adherence Audit'}
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-100 dark:bg-emerald-955/20 text-emerald-800 dark:text-emerald-400 uppercase self-start">
                {isRtl ? 'معدل الالتزام الكلي: 96.4٪' : 'Adherence Rate: 96.4%'}
              </span>
            </div>
            
            <div className="overflow-x-auto min-w-0">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-105 dark:border-slate-800 text-slate-455 font-bold">
                    <th className="pb-3 pr-2">{isRtl ? 'الوكيل' : 'Agent'}</th>
                    <th className="pb-3 pr-2">{isRtl ? 'الوردية المقررة' : 'Scheduled Shift'}</th>
                    <th className="pb-3 pr-2">{isRtl ? 'ساعات الحضور' : 'Logged Hours'}</th>
                    <th className="pb-3 pr-2">{isRtl ? 'الانحراف' : 'Variance'}</th>
                    <th className="pb-3 pr-2">{isRtl ? 'نسبة الالتزام' : 'Adherence %'}</th>
                    <th className="pb-3 pr-2">{isRtl ? 'حالة الالتزام' : 'Compliance'}</th>
                    <th className="pb-3 pr-2">{isRtl ? 'العمل الإضافي' : 'Overtime Warning'}</th>
                    <th className="pb-3 text-right">{isRtl ? 'مستوى المخاطر' : 'Risk'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-600 dark:text-slate-350">
                  {[
                    { agent: 'Liam Bennett', shift: '09:00 - 17:00 AST', logged: '10.5 hrs', variance: '+2.5 hrs', adherence: '98.5%', status: 'compliant', overtime: 'Overtime Warning', risk: 'medium' },
                    { agent: 'Nadia Vance', shift: '17:00 - 01:00 AST', logged: '7.8 hrs', variance: '-0.2 hrs', adherence: '95.2%', status: 'compliant', overtime: 'None', risk: 'low' },
                    { agent: 'Tariq Mansoor', shift: '09:00 - 17:00 AST', logged: '6.5 hrs', variance: '-1.5 hrs', adherence: '84.0%', status: 'under_hours', overtime: 'None', risk: 'medium' },
                    { agent: 'Amira Ghadbi', shift: '09:00 - 17:00 AST', logged: '0.0 hrs', variance: '-8.0 hrs', adherence: '0.0%', status: 'no_show', overtime: 'None', risk: 'critical' }
                  ].map((row, idx) => (
                    <tr key={idx}>
                      <td className="py-3 font-semibold text-slate-900 dark:text-white pr-2">{row.agent}</td>
                      <td className="py-3 font-mono pr-2">{row.shift}</td>
                      <td className="py-3 font-mono pr-2">{row.logged}</td>
                      <td className={`py-3 font-mono pr-2 ${row.variance.startsWith('-') && row.variance !== '0.0 hrs' ? 'text-rose-500' : row.variance.startsWith('+') ? 'text-emerald-500 font-bold' : 'text-slate-500'}`}>{row.variance}</td>
                      <td className="py-3 font-mono pr-2 font-bold text-slate-700 dark:text-slate-300">{row.adherence}</td>
                      <td className="py-3 pr-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${
                          row.status === 'compliant'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-955/20 dark:text-emerald-400'
                            : row.status === 'under_hours'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-955/20 dark:text-amber-400'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-955/20 dark:text-rose-455'
                        }`}>
                          {row.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 pr-2">
                        {row.overtime !== 'None' ? (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold font-mono bg-amber-100 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 animate-pulse">
                            ⚠️ OVERTIME ALERT
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono text-[10px]">-</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${
                          row.risk === 'low'
                            ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            : row.risk === 'medium'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-955/20 dark:text-amber-400'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-955/20 dark:text-rose-455 animate-pulse'
                        }`}>
                          {row.risk}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );

    case 'occupancy':
      return (
        <div className="w-full min-w-0 flex-1 space-y-6 animate-in fade-in-50 duration-200" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              {localT.occupancy}
            </h2>
            <p className="text-xs text-slate-455">
              {localT.occupancyDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Concurrent Load Metrics & Queue Pressure Indicators */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-xs text-slate-655 dark:text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-purple-500" />
                {isRtl ? 'قياسات الإشغال الفوري وضغط الطوابير' : 'Load Concurrency & Queue Pressure'}
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-955 border border-slate-105 dark:border-slate-850 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">
                    {isRtl ? 'نسبة الإشغال الكلي' : 'Active Load Concurrency'}
                  </span>
                  <strong className="text-lg font-bold text-blue-600 dark:text-blue-400 font-mono block mt-1">
                    11 / 20 slots
                  </strong>
                  <span className="text-[9px] text-slate-455 block mt-0.5">55% utilization</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-955 border border-slate-105 dark:border-slate-850 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">
                    {isRtl ? 'مؤشر ضغط الطوابير' : 'Queue Pressure Index'}
                  </span>
                  <strong className="text-lg font-bold text-amber-500 font-mono block mt-1">
                    1.45x Load
                  </strong>
                  <span className="text-[9px] text-amber-600 dark:text-amber-400 block mt-0.5">Moderate load pacing</span>
                </div>
              </div>

              {/* Queue Pressure Progress list */}
              <div className="space-y-3 pt-2">
                <h4 className="text-[10.5px] uppercase font-bold text-slate-500 font-mono tracking-wider">
                  Queue Pressure Multipliers
                </h4>
                
                {[
                  { name: 'WhatsApp Queue', load: '1.8x', percent: 80, level: 'High Pressure', color: 'bg-amber-500' },
                  { name: 'Web Chat Queue', load: '1.1x', percent: 45, level: 'Normal', color: 'bg-blue-500' },
                  { name: 'Voice SIP Trunk', load: '1.5x', percent: 65, level: 'Moderate', color: 'bg-indigo-500' },
                  { name: 'Email Dispatcher', load: '0.8x', percent: 25, level: 'Stable', color: 'bg-emerald-500' }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                      <span className="font-mono text-slate-500">{item.load} ({item.level})</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div style={{ width: `${item.percent}%` }} className={`h-full rounded-full ${item.color}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Config Sliders */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
              <h3 className="font-bold text-xs text-slate-655 dark:text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1.5 border-b border-slate-105 dark:border-slate-850 pb-2">
                <Sliders className="w-4 h-4 text-blue-500" />
                Operational Calibration Thresholds
              </h3>

              <form onSubmit={handleSaveOccupancySettings} className="space-y-5 text-xs font-semibold">
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-700 dark:text-slate-350">
                    <span>Max Concurrent Chats per Agent</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400">{occupancySettings.maxConcurrentChats} active slots</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    disabled={!canEdit}
                    value={occupancySettings.maxConcurrentChats}
                    onChange={(e) => setOccupancySettings({...occupancySettings, maxConcurrentChats: Number(e.target.value)})}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-700 dark:text-slate-350">
                    <span>SLA Warning Pacing Threshold</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400">{occupancySettings.slaWarningThreshold} seconds</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="300"
                    step="10"
                    disabled={!canEdit}
                    value={occupancySettings.slaWarningThreshold}
                    onChange={(e) => setOccupancySettings({...occupancySettings, slaWarningThreshold: Number(e.target.value)})}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-700 dark:text-slate-350">
                    <span>Toxicity Auto-Escalate Score</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400">{occupancySettings.autoEscalateToxicity}% sensitivity</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="95"
                    disabled={!canEdit}
                    value={occupancySettings.autoEscalateToxicity}
                    onChange={(e) => setOccupancySettings({...occupancySettings, autoEscalateToxicity: Number(e.target.value)})}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!canEdit || isSavingOccupancy}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl font-bold text-center cursor-pointer transition-colors shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 text-[11px]"
                >
                  {isSavingOccupancy ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{localT.saving}</span>
                    </>
                  ) : (
                    <span>{localT.save}</span>
                  )}
                </button>
              </form>
            </div>

            {/* Channels load card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-xs text-slate-655 dark:text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Live Channel Occupancy Loads
              </h3>

              <div className="space-y-4">
                {[
                  { name: 'WhatsApp Inbound', usage: 75, bg: 'bg-emerald-500' },
                  { name: 'Web Widget Live', usage: 60, bg: 'bg-blue-500' },
                  { name: 'Voice SIP Gateway', usage: 45, bg: 'bg-indigo-500' },
                  { name: 'Emails Backlog', usage: 35, bg: 'bg-purple-500' }
                ].map((channel, idx) => (
                  <div key={idx} className="space-y-1.5 text-xs font-semibold">
                    <div className="flex justify-between">
                      <span className="text-slate-700 dark:text-slate-350">{channel.name}</span>
                      <span className="font-mono text-slate-500">{channel.usage}% capacity</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div style={{ width: `${channel.usage}%` }} className={`h-full rounded-full ${channel.bg}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Real-time Occupancy Alerts & SLA Threat Log */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 w-full">
            <h3 className="font-bold text-xs text-slate-655 dark:text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              {isRtl ? 'سجل تجاوز حدود الإشغال وحالة التنبيهات' : 'Real-time Occupancy Alerts & SLA Threat Log'}
            </h3>
            
            <div className="overflow-x-auto min-w-0">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-105 dark:border-slate-800 text-slate-455 font-bold">
                    <th className="pb-3 pr-2">{isRtl ? 'القناة' : 'Queue Name'}</th>
                    <th className="pb-3 pr-2">{isRtl ? 'نوع التجاوز' : 'Alert Trigger'}</th>
                    <th className="pb-3 pr-2">{isRtl ? 'القيمة الفعلية' : 'Current Value'}</th>
                    <th className="pb-3 pr-2">{isRtl ? 'الحد المسموح' : 'Limit'}</th>
                    <th className="pb-3 pr-2">{isRtl ? 'حالة التهديد' : 'Threat Level'}</th>
                    <th className="pb-3 pr-2">{isRtl ? 'الإجراء المتخذ' : 'Action Mitigation'}</th>
                    <th className="pb-3 text-right">{isRtl ? 'الإجراء' : 'Mitigate Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-600 dark:text-slate-350">
                  {occupancyAlerts.map((row) => (
                    <tr key={row.id}>
                      <td className="py-3 font-semibold text-slate-900 dark:text-white pr-2">{row.queue}</td>
                      <td className="py-3 pr-2">{row.trigger}</td>
                      <td className="py-3 font-mono pr-2">{row.current}</td>
                      <td className="py-3 font-mono pr-2">{row.limit}</td>
                      <td className="py-3 pr-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${
                          row.status === 'mitigated'
                            ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            : row.level === 'stable'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400'
                            : row.level === 'warning'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-955/20 dark:text-amber-400'
                            : row.level === 'critical'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-955/20 dark:text-rose-455 animate-pulse'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-955/20 dark:text-purple-400'
                        }`}>
                          {row.status === 'mitigated' ? 'Mitigated' : row.level}
                        </span>
                      </td>
                      <td className="py-3 pr-2 text-slate-500 font-medium">{row.action}</td>
                      <td className="py-3 text-right">
                        {row.status === 'active' && row.level !== 'stable' ? (
                          <button
                            onClick={() => handleMitigateAlert(row.id)}
                            disabled={!canManage}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[9px] rounded-lg cursor-pointer transition-colors disabled:opacity-50 uppercase font-mono"
                          >
                            Mitigate
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic font-mono">
                            {row.status === 'mitigated' ? 'Resolved' : 'No Action'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );

    case 'agent_presence':
      return (
        <div className="w-full min-w-0 flex-1 space-y-6 animate-in fade-in-50 duration-200" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              {localT.agentPresence}
            </h2>
            <p className="text-xs text-slate-455">
              {localT.agentPresenceDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
            {/* Main Presence Board Table */}
            <div className="lg:col-span-1 xl:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-xs text-slate-655 dark:text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-500" />
                Live Agent AUX Metrics
              </h3>

              <div className="overflow-x-auto min-w-0">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-105 dark:border-slate-800 text-slate-455 font-bold">
                      <th className="pb-3 pr-2">{isRtl ? 'الوكيل' : 'Agent'}</th>
                      <th className="pb-3 pr-2">{isRtl ? 'حالة التواجد' : 'Status'}</th>
                      <th className="pb-3 pr-2">{isRtl ? 'نسبة الالتزام' : 'Adherence'}</th>
                      <th className="pb-3 pr-2">{localT.currentAuxState}</th>
                      <th className="pb-3 pr-2">{localT.duration}</th>
                      <th className="pb-3 text-right">{isRtl ? 'إجراء سريع' : 'Inline Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-105 dark:divide-slate-850 text-slate-600 dark:text-slate-350">
                    {agents.map((agent) => {
                      const durationVal = auxDurations[agent.id] || 0;
                      
                      let displayAux = 'Available';
                      if (agent.status === 'away') displayAux = 'Break';
                      else if (agent.status === 'offline') displayAux = 'Offline';
                      else if (agent.status === 'busy') displayAux = 'After Call Work';

                      // Mock adherence indicators
                      let adherenceVal = '98%';
                      let adherenceColor = 'text-emerald-500 bg-emerald-100/20';
                      if (agent.name.includes('Tariq')) {
                        adherenceVal = '84%';
                        adherenceColor = 'text-amber-600 bg-amber-100/20';
                      } else if (agent.name.includes('Amira')) {
                        adherenceVal = '72%';
                        adherenceColor = 'text-rose-600 bg-rose-100/20';
                      } else if (agent.name.includes('Nadia')) {
                        adherenceVal = '95%';
                        adherenceColor = 'text-emerald-500 bg-emerald-100/20';
                      }

                      // Overrun warning check (e.g. if durationVal is over 15 mins for break or 5 mins for ACW)
                      const isOverrun = (displayAux === 'Break' && durationVal > 15) || (displayAux === 'After Call Work' && durationVal > 8);
                      const overrunSec = displayAux === 'Break' ? durationVal - 15 : durationVal - 8;

                      return (
                        <tr key={agent.id} className={agent.id === selectedAgentForOverride ? 'bg-slate-50 dark:bg-slate-850/45' : ''}>
                          <td className="py-3 pr-2">
                            <button
                              type="button"
                              onClick={() => setSelectedAgentForOverride(agent.id)}
                              className="text-left font-bold text-slate-900 dark:text-white flex items-center gap-2 hover:underline cursor-pointer"
                            >
                              <div className="w-7 h-7 rounded-full bg-slate-105 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                {agent.name.substring(0,2).toUpperCase()}
                              </div>
                              <span>{agent.name}</span>
                            </button>
                          </td>
                          <td className="py-3 pr-2">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold font-mono uppercase ${
                              agent.status === 'online'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400'
                                : agent.status === 'busy'
                                ? 'bg-rose-105 text-rose-800 dark:bg-rose-955/20 dark:text-rose-455'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-955/20 dark:text-amber-400'
                            }`}>
                              {agent.status}
                            </span>
                          </td>
                          <td className="py-3 pr-2">
                            <span className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold font-mono ${adherenceColor}`}>
                              {adherenceVal}
                            </span>
                          </td>
                          <td className="py-3 pr-2 font-semibold text-slate-700 dark:text-slate-300">
                            {displayAux}
                          </td>
                          <td className="py-3 pr-2">
                            <div className="flex flex-col">
                              <span className={`font-mono ${isOverrun ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-500'}`}>
                                {formatDuration(durationVal)}
                              </span>
                              {isOverrun && (
                                <span className="text-[8px] text-rose-500 font-mono font-bold uppercase animate-pulse">
                                  ⚠️ Overrun +{formatDuration(overrunSec)}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 text-right">
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleInlinePresenceOverride(agent.id, e.target.value);
                                  e.target.value = '';
                                }
                              }}
                              disabled={!canEdit}
                              className="px-2 py-1 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-lg text-[10px] text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer font-bold focus:border-purple-500"
                            >
                              <option value="">Override...</option>
                              <option value="Available">Available</option>
                              <option value="Break">Break</option>
                              <option value="Lunch">Lunch</option>
                              <option value="Coaching">Coaching</option>
                              <option value="After Call Work">ACW</option>
                              <option value="Offline">Offline</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Override Controls Panel */}
            <div className="bg-slate-50 dark:bg-slate-900/55 p-5 rounded-2xl border border-slate-205 dark:border-slate-800 space-y-4 text-xs font-semibold">
              <h3 className="font-bold text-xs text-slate-655 dark:text-slate-400 uppercase font-mono flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
                <UserCheck className="w-4 h-4 text-purple-500" />
                {localT.forceOverride}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-slate-500 mb-1.5">{localT.selectAgent}</label>
                  <select
                    value={selectedAgentForOverride}
                    onChange={(e) => setSelectedAgentForOverride(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 dark:text-slate-300 font-semibold"
                  >
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>{agent.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 mb-1.5">{localT.targetAux}</label>
                  <select
                    value={targetAuxCode}
                    onChange={(e) => setTargetAuxCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 dark:text-slate-300 font-semibold"
                  >
                    <option value="Available">Available (Online)</option>
                    <option value="Break">Break</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Coaching">Coaching</option>
                    <option value="Meeting">Meeting</option>
                    <option value="After Call Work">After Call Work (Busy)</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>

                <button
                  onClick={handleForcePresenceOverride}
                  disabled={!canEdit}
                  className="w-full py-2.5 bg-purple-650 hover:bg-purple-700 disabled:bg-purple-300 text-white font-bold rounded-xl text-center cursor-pointer transition-colors shadow-md active:scale-95 flex items-center justify-center gap-1.5 text-[11px]"
                >
                  <Shield className="w-3.5 h-3.5" />
                  {localT.applyOverride}
                </button>
              </div>
            </div>
          </div>

          {/* 3. AUX State Outliers & Adherence Violations Log */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 w-full">
            <h3 className="font-bold text-xs text-slate-655 dark:text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-purple-500" />
              {isRtl ? 'مخالفات وتجاوزات الـ Aux للوكلاء' : 'AUX State Outliers & Adherence Violations Log'}
            </h3>
            
            <div className="overflow-x-auto min-w-0">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-105 dark:border-slate-800 text-slate-455 font-bold">
                    <th className="pb-3 pr-2">{isRtl ? 'الوكيل' : 'Agent'}</th>
                    <th className="pb-3 pr-2">{isRtl ? 'حالة الـ AUX' : 'AUX Code'}</th>
                    <th className="pb-3 pr-2">{isRtl ? 'الوقت المنقضي' : 'Elapsed Time'}</th>
                    <th className="pb-3 pr-2">{isRtl ? 'الحد الأقصى' : 'Allowed Limit'}</th>
                    <th className="pb-3 pr-2">{isRtl ? 'المستوى المتجاوز' : 'Over-run Duration'}</th>
                    <th className="pb-3 text-right">{isRtl ? 'حالة التنبيه' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-600 dark:text-slate-350">
                  {[
                    { agent: 'Tariq Mansoor', code: 'Lunch Break', elapsed: '45 mins', limit: '30 mins', overrun: '+15 mins', status: 'overrun_breach' },
                    { agent: 'Liam Bennett', code: 'Coaching Session', elapsed: '18 mins', limit: '15 mins', overrun: '+3 mins', status: 'warning' },
                    { agent: 'Nadia Vance', code: 'After Call Work', elapsed: '8 mins', limit: '5 mins', overrun: '+3 mins', status: 'warning' },
                    { agent: 'Amira Ghadbi', code: 'Break', elapsed: '9 mins', limit: '10 mins', overrun: '0 mins', status: 'compliant' }
                  ].map((row, idx) => (
                    <tr key={idx}>
                      <td className="py-3 font-semibold text-slate-900 dark:text-white pr-2">{row.agent}</td>
                      <td className="py-3 font-semibold text-slate-700 dark:text-slate-300 pr-2">{row.code}</td>
                      <td className="py-3 font-mono pr-2">{row.elapsed}</td>
                      <td className="py-3 font-mono pr-2">{row.limit}</td>
                      <td className="py-3 font-mono text-rose-500 pr-2">{row.overrun}</td>
                      <td className="py-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${
                          row.status === 'compliant'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400'
                            : row.status === 'warning'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-955/20 dark:text-amber-400'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-955/20 dark:text-rose-455 animate-pulse'
                        }`}>
                          {row.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );

    case 'queue_distribution':
      return (
        <div className="w-full min-w-0 flex-1 space-y-6 animate-in fade-in-50 duration-200" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              {localT.queueDistribution}
            </h2>
            <p className="text-xs text-slate-455">
              {localT.queueDistributionDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Sliders for split */}
            <div className="lg:col-span-1 xl:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
              <h3 className="font-bold text-xs text-slate-655 dark:text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1.5 border-b border-slate-105 dark:border-slate-850 pb-2">
                <Sliders className="w-4 h-4 text-blue-500" />
                Active Omnichannel Split Configurations
              </h3>

              <div className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-700 dark:text-slate-350">
                    <span>WhatsApp Routing Coefficient</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400">{trafficWeights.whatsapp}% share</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    disabled={!canEdit}
                    value={trafficWeights.whatsapp}
                    onChange={(e) => setTrafficWeights({...trafficWeights, whatsapp: Number(e.target.value)})}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-slate-700 dark:text-slate-350">
                    <span>Web Chat Routing Weight</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400">{trafficWeights.webchat}% share</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    disabled={!canEdit}
                    value={trafficWeights.webchat}
                    onChange={(e) => setTrafficWeights({...trafficWeights, webchat: Number(e.target.value)})}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-slate-700 dark:text-slate-350">
                    <span>Voice SIP Trunk splits</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400">{trafficWeights.voice}% share</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    disabled={!canEdit}
                    value={trafficWeights.voice}
                    onChange={(e) => setTrafficWeights({...trafficWeights, voice: Number(e.target.value)})}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-slate-700 dark:text-slate-350">
                    <span>Customer Email Split coefficient</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400">{trafficWeights.email}% share</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    disabled={!canEdit}
                    value={trafficWeights.email}
                    onChange={(e) => setTrafficWeights({...trafficWeights, email: Number(e.target.value)})}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-50"
                  />
                </div>

                <div className="pt-3 border-t border-slate-105 dark:border-slate-850">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-2 font-mono">
                    <span>ROUTING COEFFICIENTS SUM (Must equal 100%):</span>
                    <span className={trafficWeights.whatsapp + trafficWeights.webchat + trafficWeights.voice + trafficWeights.email === 100 ? 'text-emerald-500' : 'text-rose-500'}>
                      {trafficWeights.whatsapp + trafficWeights.webchat + trafficWeights.voice + trafficWeights.email}%
                    </span>
                  </div>

                  <div className="w-full h-3.5 bg-slate-105 dark:bg-slate-800 rounded-full flex overflow-hidden">
                    <div style={{ width: `${trafficWeights.whatsapp}%` }} className="bg-emerald-500 h-full" title="WhatsApp" />
                    <div style={{ width: `${trafficWeights.webchat}%` }} className="bg-blue-500 h-full" title="Web" />
                    <div style={{ width: `${trafficWeights.voice}%` }} className="bg-indigo-500 h-full" title="Voice" />
                    <div style={{ width: `${trafficWeights.email}%` }} className="bg-purple-500 h-full" title="Email" />
                  </div>
                </div>

                <button
                  onClick={handleTriggerQueueRebalance}
                  disabled={!canManage || isRebalancing || (trafficWeights.whatsapp + trafficWeights.webchat + trafficWeights.voice + trafficWeights.email !== 100)}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl font-bold text-center cursor-pointer transition-colors shadow-md flex items-center justify-center gap-2 text-[11px]"
                >
                  {isRebalancing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{localT.rebalancing}</span>
                    </>
                  ) : (
                    <span>{localT.rebalance}</span>
                  )}
                </button>
              </div>
            </div>

            {/* Waiting items preview */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-xs text-slate-655 dark:text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-505" />
                Active Queue Distributions
              </h3>

              <div className="space-y-3">
                {queuesList.map((queue) => (
                  <div key={queue.id} className="p-3 bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-900 rounded-xl flex justify-between items-center text-xs font-semibold">
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 dark:text-white">{isRtl ? queue.nameAr : queue.nameEn}</h4>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Waiting: {queue.waitingChatsCount} chats</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-[10px] text-slate-500 font-bold block">Priority Weight</span>
                      <strong className="text-blue-505 font-mono text-sm">{queue.priorityWeight}x</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Real-time Traffic Routing Logs & Node Heartbeats */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 w-full">
            <h3 className="font-bold text-xs text-slate-655 dark:text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-500" />
              {isRtl ? 'سجل توزيع قنوات الاتصال وصحة الموزع' : 'Real-time Traffic Routing Logs & Node Heartbeats'}
            </h3>
            
            <div className="overflow-x-auto min-w-0">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-105 dark:border-slate-800 text-slate-455 font-bold">
                    <th className="pb-3 pr-2">{isRtl ? 'القناة' : 'Omnichannel Layer'}</th>
                    <th className="pb-3 pr-2">{isRtl ? 'تخصيص الأوزان' : 'Traffic Allocation'}</th>
                    <th className="pb-3 pr-2">{isRtl ? 'حجم الطلبات الفعلي' : 'Inbound Rate'}</th>
                    <th className="pb-3 pr-2">{isRtl ? 'عقد المعالجة' : 'Active Routing Nodes'}</th>
                    <th className="pb-3 pr-2">{isRtl ? 'حالة التوازن' : 'Load Assessment'}</th>
                    <th className="pb-3 text-right">{isRtl ? 'آخر مزامنة للبوابات' : 'Gateway Sync'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-600 dark:text-slate-350">
                  {[
                    { layer: 'WhatsApp Connector', alloc: `${trafficWeights.whatsapp}%`, rate: '45 req/sec', nodes: '3 cluster nodes', load: 'optimal', sync: 'Synced 12s ago' },
                    { layer: 'Web Chat Widget', alloc: `${trafficWeights.webchat}%`, rate: '32 req/sec', nodes: '2 cluster nodes', load: 'optimal', sync: 'Synced 8s ago' },
                    { layer: 'Voice SIP Gateway', alloc: `${trafficWeights.voice}%`, rate: '12 req/sec', nodes: '4 cluster nodes', load: 'high_load', sync: 'Synced 2s ago' },
                    { layer: 'Email Router', alloc: `${trafficWeights.email}%`, rate: '5 req/sec', nodes: '1 cluster node', load: 'stable', sync: 'Synced 1m ago' }
                  ].map((row, idx) => (
                    <tr key={idx}>
                      <td className="py-3 font-semibold text-slate-900 dark:text-white pr-2">{row.layer}</td>
                      <td className="py-3 font-bold font-mono text-blue-600 dark:text-blue-400 pr-2">{row.alloc}</td>
                      <td className="py-3 font-mono pr-2">{row.rate}</td>
                      <td className="py-3 pr-2">{row.nodes}</td>
                      <td className="py-3 pr-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${
                          row.load === 'optimal' || row.load === 'stable'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-955/20 dark:text-amber-400'
                        }`}>
                          {row.load.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono text-slate-505">{row.sync}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Terminal-style Dispatcher Sync Logs */}
            <div className="space-y-2 pt-2">
              <h4 className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider">
                Dispatcher Daemon Sync Stream
              </h4>
              <div className="bg-slate-955 text-slate-400 font-mono text-[10px] rounded-xl p-4 border border-slate-900 space-y-1 h-32 overflow-y-auto w-full">
                <div className="text-emerald-500 font-bold">[INFO] 2026-06-05 05:07:11 - Dispatcher connection established on node-us-east-1</div>
                <div className="text-slate-500">[DEBUG] 2026-06-05 05:07:12 - WhatsApp socket pool heartbeat ack (12 agents online)</div>
                <div className="text-slate-500">{`[DEBUG] 2026-06-05 05:07:15 - Rebalancing weights applied: WA=${trafficWeights.whatsapp}%, Web=${trafficWeights.webchat}%, Voice=${trafficWeights.voice}%, Email=${trafficWeights.email}%`}</div>
                <div className="text-amber-505 font-bold">{`[WARN] 2026-06-05 05:07:18 - High message volume on WhatsApp queue; latency threshold 1.8s`}</div>
                <div className="text-emerald-500 font-bold">[INFO] 2026-06-05 05:07:20 - Syncing gateway router configuration... SUCCESS</div>
                <div className="text-slate-500">[DEBUG] 2026-06-05 05:07:25 - Voice SIP Gateway load state optimal - 4 active nodes</div>
                <div className="text-slate-500">[DEBUG] 2026-06-05 05:07:30 - Heartbeat check: 4/4 nodes reporting healthy</div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'escalations':
      const escalatedChats = conversations.filter(c => c.status === 'escalated' || c.sentiment === 'negative');
      const selectedChat = escalatedChats.find(c => c.id === selectedEscalationId) || escalatedChats[0];

      return (
        <div className="w-full min-w-0 flex-1 space-y-6 animate-in fade-in-50 duration-200" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              {localT.escalations}
            </h2>
            <p className="text-xs text-slate-455">
              {localT.escalationsDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Toxicity Analytics & Sentiment Summary Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-xs text-slate-655 dark:text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1.5 border-b border-slate-105 dark:border-slate-850 pb-2">
                <TrendingUp className="w-4 h-4 text-rose-500" />
                {isRtl ? 'ملخص السمية وتحليل المشاعر' : 'Toxicity & Sentiment Summary'}
              </h3>
              
              <div className="space-y-4">
                <div className="p-3 bg-slate-55 dark:bg-slate-955 border border-slate-105 dark:border-slate-850 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">
                    Live Avg Toxicity Index
                  </span>
                  <strong className="text-lg font-bold text-emerald-500 font-mono block mt-1">
                    24% (Low Threat)
                  </strong>
                  <span className="text-[9px] text-slate-455 block mt-0.5">Threshold set at 75%</span>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-505 font-mono block">
                    Queue Sentiment Spread
                  </span>
                  
                  {[
                    { label: 'Positive Feedbacks', pct: 68, color: 'bg-emerald-500' },
                    { label: 'Neutral Inquiries', pct: 22, color: 'bg-blue-500' },
                    { label: 'Toxicity Alert / Neg', pct: 10, color: 'bg-rose-500 animate-pulse' }
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1 text-xs font-semibold">
                      <div className="flex justify-between">
                        <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                        <span className="font-mono text-slate-505">{item.pct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-105 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div style={{ width: `${item.pct}%` }} className={`h-full rounded-full ${item.color}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Escalations List */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-xs text-slate-650 dark:text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
                Pending Active Escalations
              </h3>

              <div className="overflow-x-auto min-w-0">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-105 dark:border-slate-800 text-slate-455 font-bold">
                      <th className="pb-3 pr-2">{isRtl ? 'العميل' : 'Customer'}</th>
                      <th className="pb-3 pr-2">{isRtl ? 'تحليل المشاعر' : 'Sentiment'}</th>
                      <th className="pb-3 pr-2">{isRtl ? 'القناة' : 'Channel'}</th>
                      <th className="pb-3 text-right">{localT.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-600 dark:text-slate-350">
                    {escalatedChats.map((chat) => (
                      <tr key={chat.id} className={selectedChat?.id === chat.id ? 'bg-slate-50 dark:bg-slate-850/45' : ''}>
                        <td className="py-3.5 pr-2">
                          <strong className="text-slate-900 dark:text-white block font-bold">{chat.customerName}</strong>
                          <span className="text-[10px] text-slate-400 font-mono">{chat.id}</span>
                        </td>
                        <td className="py-3.5 pr-2">
                          <span className="px-2 py-0.5 rounded text-[8px] font-bold font-mono bg-rose-100 text-rose-800 dark:bg-rose-955/20 dark:text-rose-455 uppercase">
                            {chat.sentiment}
                          </span>
                        </td>
                        <td className="py-3.5 uppercase font-mono text-[10px] text-slate-505 pr-2">{chat.channel}</td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => setSelectedEscalationId(chat.id)}
                            className="px-2.5 py-1 text-[10px] font-bold bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl transition-all cursor-pointer"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                    {escalatedChats.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400 italic">
                          No pending escalated interactions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Detailed Escalation Inspector Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-xs text-slate-655 dark:text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1.5 border-b border-slate-105 dark:border-slate-850 pb-2">
                <Eye className="w-4 h-4 text-blue-505" />
                Escalation Inspector
              </h3>

              {selectedChat ? (
                <div className="space-y-4 text-xs font-semibold">
                  <div className="pb-2 border-b border-slate-100 dark:border-slate-850 flex justify-between items-center">
                    <div>
                      <strong className="text-sm font-bold text-slate-900 dark:text-white block">{selectedChat.customerName}</strong>
                      <span className="text-[10px] text-slate-400 font-mono">Channel: {selectedChat.channel.toUpperCase()}</span>
                    </div>
                    <span className="px-2.5 py-0.5 text-[9px] font-bold font-mono uppercase bg-rose-50 dark:bg-rose-955/20 text-rose-600 dark:text-rose-450 border border-rose-200/50">
                      Escalated
                    </span>
                  </div>

                  {/* Chat Snippet */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-955 rounded-xl border border-slate-100 dark:border-slate-850 space-y-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase font-mono block">
                      {localT.chatTranscript}
                    </span>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                      {selectedChat.messages.slice(-3).map((m, idx) => (
                        <div key={idx} className="text-[11px] leading-relaxed">
                          <strong className="text-slate-700 dark:text-slate-350">{m.senderName}:</strong>{' '}
                          <span className="text-slate-500 dark:text-slate-400 font-normal">{m.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions Form */}
                  <div className="space-y-4 pt-3 border-t border-slate-105 dark:border-slate-850">
                    <div className="space-y-2">
                      <label className="block text-slate-500 font-semibold">{localT.reassign}</label>
                      <div className="flex gap-2">
                        <select
                          value={reassignAgentId}
                          onChange={(e) => setReassignAgentId(e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none text-slate-700 dark:text-slate-300 font-bold"
                        >
                          <option value="agent-1">Liam Bennett</option>
                          <option value="agent-2">Nadia Vance</option>
                        </select>
                        <button
                          onClick={() => handleApplyEscalationAction(selectedChat.id, 'reassign')}
                          disabled={!canManage}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-305 text-white rounded-xl font-bold cursor-pointer transition-colors text-[10px]"
                        >
                          {localT.assign}
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleApplyEscalationAction(selectedChat.id, 'escalate_priority')}
                        disabled={!canManage}
                        className="flex-1 py-2 border border-rose-205 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-955/20 text-rose-600 dark:text-rose-450 font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors text-[10px]"
                      >
                        <AlertCircle className="w-4 h-4 text-rose-505" />
                        {localT.boost}
                      </button>

                      <button
                        onClick={() => handleApplyEscalationAction(selectedChat.id, 'resolve')}
                        disabled={!canManage}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-350 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors text-[10px]"
                      >
                        <Check className="w-4 h-4" />
                        {localT.closeEscalation}
                      </button>
                    </div>
                  </div>

                  {/* Whisper Coaching Intervention Input */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!whisperInput) return;
                      setConversations((prev) =>
                        prev.map((c) => {
                          if (c.id === selectedChat.id) {
                            return { ...c, status: 'escalated' };
                          }
                          return c;
                        })
                      );
                      addAuditLog(`Supervisor sent coaching whisper to interaction ${selectedChat.id}: "${whisperInput}"`, 'success');
                      setWhisperInput('');
                    }}
                    className="space-y-2 pt-3 border-t border-slate-105 dark:border-slate-850"
                  >
                    <label className="block text-slate-500 font-semibold">Live Whisper Coaching</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type coaching instructions..."
                        value={whisperInput}
                        onChange={(e) => setWhisperInput(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none text-slate-700 dark:text-slate-350 text-xs font-semibold"
                      />
                      <button
                        type="submit"
                        disabled={!canEdit || !whisperInput}
                        className="px-3 py-1.5 bg-purple-650 hover:bg-purple-700 disabled:bg-purple-300 text-white font-bold rounded-xl cursor-pointer text-[10px]"
                      >
                        Send
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="p-5 text-center text-slate-400 italic bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  Select an escalation item to inspect.
                </div>
              )}
            </div>

            {/* Supervisor Intervention History & Resolution SLA Log */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-xs text-slate-655 dark:text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1.5 border-b border-slate-105 dark:border-slate-850 pb-2">
                <ShieldAlert className="w-4 h-4 text-rose-505" />
                {isRtl ? 'سجل تدخلات المشرف وتاريخ موازنة الخدمة' : 'Supervisor Intervention History & Resolution SLA Log'}
              </h3>
              
              <div className="overflow-x-auto min-w-0">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-105 dark:border-slate-800 text-slate-455 font-bold">
                      <th className="pb-3 pr-2">{isRtl ? 'معرف الجلسة' : 'Interaction ID'}</th>
                      <th className="pb-3 pr-2">{isRtl ? 'العميل' : 'Customer'}</th>
                      <th className="pb-3 pr-2">{isRtl ? 'الوكيل المسؤول' : 'Responsible Agent'}</th>
                      <th className="pb-3 pr-2">{isRtl ? 'سبب التصعيد' : 'Reason / Sentiment'}</th>
                      <th className="pb-3 pr-2">{isRtl ? 'إجراء المشرف' : 'Intervention Action'}</th>
                      <th className="pb-3 pr-2">{isRtl ? 'حالة الحل' : 'SLA Target'}</th>
                      <th className="pb-3 text-right">{isRtl ? 'الإجراء' : 'Intervention Override'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-600 dark:text-slate-350">
                    {interventionLogs.map((row) => (
                      <tr key={row.id}>
                        <td className="py-3 font-mono font-semibold text-slate-900 dark:text-white pr-2">{row.id}</td>
                        <td className="py-3 font-semibold text-slate-700 dark:text-slate-300 pr-2">{row.customer}</td>
                        <td className="py-3 pr-2">{row.agent}</td>
                        <td className="py-3 pr-2">
                          <span className="text-[11px] text-rose-500 font-semibold">{row.reason}</span>
                        </td>
                        <td className="py-3 text-slate-500 font-medium pr-2">{row.action}</td>
                        <td className="py-3 pr-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${
                            row.status === 'resolved_in_sla' || row.status === 'sla_overridden'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-955/20 dark:text-rose-455 animate-pulse'
                          }`}>
                            {row.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          {row.status !== 'resolved_in_sla' && row.status !== 'sla_overridden' ? (
                            <button
                              onClick={() => handleOverrideSla(row.id)}
                              disabled={!canManage}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[9px] rounded-lg cursor-pointer transition-colors disabled:opacity-50 uppercase font-mono"
                            >
                              Override SLA
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic font-mono">
                              {row.status === 'sla_overridden' ? 'Overridden' : 'Resolved'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}

export default SupervisorView;
