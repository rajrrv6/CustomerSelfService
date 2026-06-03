'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ShieldAlert, Volume2, Send, Calendar, Users, Eye, HelpCircle, Activity, Shield, Clock } from 'lucide-react';
import { WfmAlertsPanel } from '@/components/client-admin/operations/WfmAlertsPanel';
import { QueueHeatmapDashboard } from '@/components/client-admin/operations/QueueHeatmapDashboard';
import { StaffingEscalationWorkflow } from '@/components/client-admin/operations/StaffingEscalationWorkflow';
import { LivePresenceBoard } from '@/components/client-admin/operations/LivePresenceBoard';
import { usePermission } from '@/stores/permissionStore';

export function SupervisorView({ activeSubScreen }: { activeSubScreen: string }) {
  const { lang, agents, setAgents, conversations, setConversations, addAuditLog } = useApp();
  const isRtl = lang === 'ar';
  
  const { canEdit, canManage } = usePermission('workforce');
  
  const [whisperTargetChatId, setWhisperTargetChatId] = useState('conv-2');
  const [whisperInput, setWhisperInput] = useState('');
  
  // Supervisor monitoring state for presence board integration
  const [supervisedAgent, setSupervisedAgent] = useState<string | null>(null);
  const [activeSupervisorMode, setActiveSupervisorMode] = useState<'silent' | 'whisper' | 'barge' | null>(null);

  // Workforce forecasting mock states
  const forecastData = [
    { hour: '09:00 - 10:00 AST', expectedChats: 45, scheduledAgents: 4, status: 'sufficient' },
    { hour: '10:00 - 11:00 AST', expectedChats: 120, scheduledAgents: 6, status: 'warning' },
    { hour: '11:00 - 12:00 AST', expectedChats: 140, scheduledAgents: 5, status: 'breach_risk' },
    { hour: '12:00 - 13:00 AST', expectedChats: 60, scheduledAgents: 4, status: 'sufficient' }
  ];

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
              <h3 className="font-bold text-xs text-slate-650 dark:text-slate-400 uppercase font-mono">
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
                            className="px-2.5 py-1 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-205 dark:border-slate-700 rounded-xl transition-all cursor-pointer"
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

    default:
      return null;
  }
}

export default SupervisorView;
