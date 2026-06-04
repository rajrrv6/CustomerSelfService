'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Sliders, 
  Monitor, 
  UserCheck, 
  Calendar, 
  GitBranch 
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { OperationalCard } from '@/components/shared/OperationalCard';
import { translations } from '@/i18n/translations';
import { usePermission } from '@/stores/permissionStore';

// Import subcomponents
import { QueueManagement, QueueItem } from './QueueManagement';
import { RoutingRules, RoutingRule } from './RoutingRules';
import { AgentRoster } from './AgentRoster';
import { LivePresenceBoard } from './LivePresenceBoard';
import { BusinessHours, HolidayItem } from './BusinessHours';

export function QueuesRosterTab() {
  const { lang, agents, setAgents, addAuditLog } = useApp();
  const t = translations[lang];
  const isRtl = lang === 'ar';
  const { canEdit, canManage } = usePermission('workforce');

  const [activeTab, setActiveTab] = useState<'queues' | 'routing' | 'roster' | 'presence' | 'hours'>('queues');

  // --- STATE FOR WFM SIMULATOR & OVERLAYS ---
  const [absenteeismActive, setAbsenteeismActive] = useState(false);
  const [routingRealigned, setRoutingRealigned] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // --- STATE FOR QUEUE MANAGEMENT ---
  const [queuesList, setQueuesList] = useState<QueueItem[]>([
    {
      id: 'q-1',
      nameEn: 'Tier 1 General Support',
      nameAr: 'الدعم العام (المستوى الأول)',
      maxWaitTimeMins: 3,
      slaTargetPercent: 85,
      priorityWeight: 1,
      overflowRule: 'trigger_callback',
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
      overflowRule: 'vip_redirect',
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
      overflowRule: 'secondary_pool',
      activeAgentsCount: 2,
      waitingChatsCount: 0
    },
    {
      id: 'q-4',
      nameEn: 'Arabic Language Specialists',
      nameAr: 'متخصصي اللغة العربية',
      maxWaitTimeMins: 2,
      slaTargetPercent: 90,
      priorityWeight: 4,
      overflowRule: 'trigger_callback',
      activeAgentsCount: 3,
      waitingChatsCount: 0
    }
  ]);

  // --- STATE FOR ROUTING RULES ---
  const [routingRules, setRoutingRules] = useState<RoutingRule[]>([
    {
      id: 'rr-1',
      nameEn: 'Skill-Based Dialog Matching',
      nameAr: 'التوجيه بناءً على المهارات الفنية',
      type: 'skill',
      ruleDescriptionEn: 'Examines intent classification labels from Farah NLU and maps them directly to specialists matching "Billing" or "Tech Support" profiles.',
      ruleDescriptionAr: 'يفحص تصنيفات النوايا من NLU ويوجهها مباشرة للوكلاء الذين يطابقون ملفات "الفوترة" أو "الدعم الفني".',
      enabled: true
    },
    {
      id: 'rr-2',
      nameEn: 'Arabic Automatic Language Routing',
      nameAr: 'التوجيه التلقائي للغة العربية',
      type: 'language',
      ruleDescriptionEn: 'Detects chat context containing Arabic characters, overriding general queues to route directly to Arabic Specialists.',
      ruleDescriptionAr: 'يكتشف الحروف العربية في المحادثة ويتجاوز الطوابير العامة للتوجيه مباشرة لمتخصصي اللغة العربية.',
      enabled: true
    },
    {
      id: 'rr-3',
      nameEn: 'VIP Corporate Priority Handoff',
      nameAr: 'الأولوية القصوى لعملاء الشركات VIP',
      type: 'vip',
      ruleDescriptionEn: 'Validates CRM loyalty tags on customer email. If customer is rated "gold" or "VIP", routes them directly to VIP Executive Line with +5 weight.',
      ruleDescriptionAr: 'يتحقق من وسام الولاء في الـ CRM للعميل. إذا كان العميل "ذهبي" أو "VIP"، يتم توجيهه لقناة كبار الشخصيات مع زيادة وزن الأولوية +5.',
      enabled: true
    }
  ]);

  // Agent skills assignments state maps agent.id -> list of skills
  const [agentSkillsMap, setAgentSkillsMap] = useState<Record<string, string[]>>({
    'agent-1': ['Billing', 'Arabic Language'],
    'agent-2': ['Technical Support', 'VIP Support'],
    'agent-3': ['Billing', 'VIP Support'],
    'agent-4': ['Technical Support', 'Arabic Language'],
    'agent-5': ['Technical Support', 'VIP Support', 'Arabic Language']
  });

  const availableSkills = ['Billing', 'Technical Support', 'VIP Support', 'Arabic Language'];

  // --- STATE FOR BUSINESS HOURS ---
  const [timezone, setTimezone] = useState('Asia/Riyadh (AST)');
  const [channelHours, setChannelHours] = useState([
    { id: 'web', labelEn: 'Web Chat Widget', labelAr: 'أداة المحادثة على الويب', enabled: true, start: '00:00', end: '23:59', allDay: true },
    { id: 'wa', labelEn: 'WhatsApp Business', labelAr: 'واتساب للأعمال', enabled: true, start: '08:00', end: '18:00', allDay: false },
    { id: 'voice', labelEn: 'Voice Hotline (SIP)', labelAr: 'الخط الهاتفي الساخن SIP', enabled: true, start: '09:00', end: '17:00', allDay: false }
  ]);

  const [holidays, setHolidays] = useState<HolidayItem[]>([
    { id: 'h-1', nameEn: 'Eid Al-Fitr Break', nameAr: 'إجازة عيد الفطر المبارك', date: '2026-10-12', active: true },
    { id: 'h-2', nameEn: 'Saudi National Day', nameAr: 'اليوم الوطني السعودي', date: '2026-09-23', active: true },
    { id: 'h-3', nameEn: 'New Year Holiday', nameAr: 'عطلة رأس السنة الميلادية', date: '2026-01-01', active: false }
  ]);
  const [newHolidayNameEn, setNewHolidayNameEn] = useState('');
  const [newHolidayNameAr, setNewHolidayNameAr] = useState('');
  const [newHolidayDate, setNewHolidayDate] = useState('');

  // --- SUPERVISOR ACTIONS STATE ---
  const [supervisedAgent, setSupervisedAgent] = useState<string | null>(null);
  const [activeSupervisorMode, setActiveSupervisorMode] = useState<'silent' | 'whisper' | 'barge' | null>(null);

  // --- DYNAMIC CALCULATIONS FOR HUD ---
  const activeStaffCount = Math.max(0, agents.filter(a => a.status !== 'offline').length - (absenteeismActive ? 2 : 0));
  const avgWaitTimeS = absenteeismActive ? (routingRealigned ? 52 : 215) : 38;
  const activeItemsCount = queuesList.reduce((acc, q) => acc + q.waitingChatsCount, 0) + (absenteeismActive ? (routingRealigned ? 1 : 9) : 0);
  const slaCompliance = absenteeismActive ? (routingRealigned ? 92.4 : 68.1) : 98.4;
  const shrinkageRate = absenteeismActive ? 32.5 : 12.0;

  // --- FUNCTIONS: ROUTING RULES ---
  const handleToggleRoutingRule = (id: string) => {
    if (!canEdit) return;
    setRoutingRules(routingRules.map(rule => {
      if (rule.id === id) {
        const nextState = !rule.enabled;
        addAuditLog(`${nextState ? 'Activated' : 'Deactivated'} routing policy: ${rule.nameEn}`, 'success');
        return { ...rule, enabled: nextState };
      }
      return rule;
    }));
  };

  // --- MANUAL AGENT STATUS SWITCH ---
  const handleAgentStatusChange = (agentId: string, status: 'online' | 'busy' | 'away' | 'offline') => {
    if (!canEdit) return;
    setAgents(agents.map(a => {
      if (a.id === agentId) {
        addAuditLog(`Manually set agent ${a.name} status to ${status.toUpperCase()} (Aux override)`, 'success');
        return { ...a, status };
      }
      return a;
    }));
  };

  // --- BUSINESS HOURS & HOLIDAYS ---
  const handleToggleChannelHours = (id: string) => {
    if (!canEdit) return;
    setChannelHours(channelHours.map(ch => {
      if (ch.id === id) {
        const nextState = !ch.enabled;
        addAuditLog(`${nextState ? 'Enabled' : 'Disabled'} business hours logic for channel: ${ch.id}`, 'success');
        return { ...ch, enabled: nextState };
      }
      return ch;
    }));
  };

  const handleChannelTimeChange = (id: string, field: 'start' | 'end', value: string) => {
    if (!canEdit) return;
    setChannelHours(channelHours.map(ch => {
      if (ch.id === id) {
        return { ...ch, [field]: value, allDay: false };
      }
      return ch;
    }));
  };

  const handleChannelAllDayToggle = (id: string) => {
    if (!canEdit) return;
    setChannelHours(channelHours.map(ch => {
      if (ch.id === id) {
        const nextState = !ch.allDay;
        return { ...ch, allDay: nextState, start: nextState ? '00:00' : '08:00', end: nextState ? '23:59' : '17:00' };
      }
      return ch;
    }));
  };

  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    if (!newHolidayNameEn.trim() || !newHolidayNameAr.trim() || !newHolidayDate) return;

    const newHoliday: HolidayItem = {
      id: `h-${Date.now()}`,
      nameEn: newHolidayNameEn.trim(),
      nameAr: newHolidayNameAr.trim(),
      date: newHolidayDate,
      active: true
    };

    setHolidays([...holidays, newHoliday]);
    setNewHolidayNameEn('');
    setNewHolidayNameAr('');
    setNewHolidayDate('');
    addAuditLog(`Scheduled corporate holiday: ${newHoliday.nameEn}`, 'success');
  };

  const handleToggleHoliday = (id: string) => {
    if (!canEdit) return;
    setHolidays(holidays.map(h => {
      if (h.id === id) {
        const nextState = !h.active;
        addAuditLog(`${nextState ? 'Activated' : 'Deactivated'} holiday blockout: ${h.nameEn}`, 'success');
        return { ...h, active: nextState };
      }
      return h;
    }));
  };

  const handleDeleteHoliday = (id: string) => {
    if (!canManage) return;
    const hName = holidays.find(h => h.id === id)?.nameEn || 'Holiday';
    setHolidays(holidays.filter(h => h.id !== id));
    addAuditLog(`Cancelled holiday schedule: ${hName}`, 'success');
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title={isRtl ? 'إدارة العمليات والجدولة وقنوات التوجيه' : 'Operations & Queues Workspace'}
        description={isRtl ? 'تخطيط القوى العاملة، وجدولة نوبات الدعم الفني، وتهيئة مهارات الوكلاء، وقنوات التوجيه، وإدارة العطلات الرسمية.' : 'Configure per-channel business hours, design routing criteria, control team staffing CRUD, and monitor real-time presence.'}
      />

      {/* Real-time Health metrics HUD */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <OperationalCard className="p-4 flex items-center gap-4 bg-white dark:bg-slate-900 border-l-4 border-l-blue-500">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">{isRtl ? 'حضور نوبة العمل' : 'Active Staffing'}</span>
            <p className="text-lg font-bold text-slate-800 dark:text-white font-mono leading-none mt-1">{activeStaffCount}/{agents.length}</p>
          </div>
        </OperationalCard>
        
        <OperationalCard className="p-4 flex items-center gap-4 bg-white dark:bg-slate-900 border-l-4 border-l-amber-500">
          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">{isRtl ? 'متوسط سرعة الاستجابة' : 'Avg Wait Time'}</span>
            <p className="text-lg font-bold text-slate-800 dark:text-white font-mono leading-none mt-1">{avgWaitTimeS}s</p>
          </div>
        </OperationalCard>
        
        <OperationalCard className="p-4 flex items-center gap-4 bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30 border-l-4 border-l-red-500">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-red-800/70 dark:text-red-400 font-mono block">{isRtl ? 'المعلقين في طابور الانتظار' : 'Waiters in Queue'}</span>
            <p className="text-lg font-bold text-red-700 dark:text-red-300 font-mono leading-none mt-1">{activeItemsCount}</p>
          </div>
        </OperationalCard>
        
        <OperationalCard className="p-4 flex items-center gap-4 bg-white dark:bg-slate-900 border-l-4 border-l-emerald-500">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">{isRtl ? 'نسبة الالتزام بالـ SLA' : 'SLA Compliance'}</span>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono leading-none mt-1">{slaCompliance}%</p>
          </div>
        </OperationalCard>
      </div>

      {/* Navigation Sub-Tabs bar */}
      <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-955 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-4xl">
        <button
          onClick={() => setActiveTab('queues')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'queues'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-850/50'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>{isRtl ? 'طوابير الخدمة والانتظار' : 'Queue Management'}</span>
        </button>

        <button
          onClick={() => setActiveTab('routing')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'routing'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-855/50'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>{isRtl ? 'قواعد التوجيه والتحويل' : 'Routing Rules'}</span>
        </button>

        <button
          onClick={() => setActiveTab('roster')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'roster'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-855/50'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>{isRtl ? 'فريق العمل والمهارات' : 'Agent Roster & Skills'}</span>
        </button>

        <button
          onClick={() => setActiveTab('presence')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'presence'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-855/50'
          }`}
        >
          <Monitor className="w-4 h-4" />
          <span>{isRtl ? 'لوحة المراقبة الحية والـ Aux' : 'Live Presence Board'}</span>
        </button>

        <button
          onClick={() => setActiveTab('hours')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'hours'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-855/50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{isRtl ? 'ساعات العمل والعطلات' : 'Hours & Holidays'}</span>
        </button>
      </div>

      {/* --- TAB CONTENT: QUEUES MANAGEMENT (CRUD) --- */}
      {activeTab === 'queues' && (
        <QueueManagement
          lang={lang}
          queuesList={queuesList}
          setQueuesList={setQueuesList}
          addAuditLog={addAuditLog}
          canEdit={canEdit}
          canManage={canManage}
        />
      )}

      {/* --- TAB CONTENT: ROUTING RULES BUILDER --- */}
      {activeTab === 'routing' && (
        <RoutingRules
          lang={lang}
          routingRules={routingRules}
          onToggleRule={handleToggleRoutingRule}
          canEdit={canEdit}
          canManage={canManage}
        />
      )}

      {/* --- TAB CONTENT: AGENT ROSTER & SKILLS MATRIX --- */}
      {activeTab === 'roster' && (
        <AgentRoster
          lang={lang}
          agents={agents}
          setAgents={setAgents}
          addAuditLog={addAuditLog}
          absenteeismActive={absenteeismActive}
          setAbsenteeismActive={setAbsenteeismActive}
          routingRealigned={routingRealigned}
          setRoutingRealigned={setRoutingRealigned}
          isSimulating={isSimulating}
          setIsSimulating={setIsSimulating}
          shrinkageRate={shrinkageRate}
          agentSkillsMap={agentSkillsMap}
          setAgentSkillsMap={setAgentSkillsMap}
          availableSkills={availableSkills}
          canEdit={canEdit}
          canManage={canManage}
        />
      )}

      {/* --- TAB CONTENT: LIVE PRESENCE BOARD & MONITORING --- */}
      {activeTab === 'presence' && (
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
      )}

      {/* --- TAB CONTENT: HOURS & HOLIDAYS MANAGEMENT --- */}
      {activeTab === 'hours' && (
        <BusinessHours
          lang={lang}
          timezone={timezone}
          setTimezone={setTimezone}
          channelHours={channelHours}
          onToggleChannelHours={handleToggleChannelHours}
          onChannelTimeChange={handleChannelTimeChange}
          onChannelAllDayToggle={handleChannelAllDayToggle}
          holidays={holidays}
          newHolidayNameEn={newHolidayNameEn}
          setNewHolidayNameEn={setNewHolidayNameEn}
          newHolidayNameAr={newHolidayNameAr}
          setNewHolidayNameAr={setNewHolidayNameAr}
          newHolidayDate={newHolidayDate}
          setNewHolidayDate={setNewHolidayDate}
          onAddHoliday={handleAddHoliday}
          onToggleHoliday={handleToggleHoliday}
          onDeleteHoliday={handleDeleteHoliday}
          addAuditLog={addAuditLog}
          canEdit={canEdit}
          canManage={canManage}
        />
      )}
    </div>
  );
}
