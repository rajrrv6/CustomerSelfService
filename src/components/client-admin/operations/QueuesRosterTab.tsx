'use client';

import React, { useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { EnterpriseTable } from '@/components/shared/table/EnterpriseTable';
import { 
  Users, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Edit, 
  Calendar, 
  GitBranch, 
  Sliders, 
  Monitor, 
  UserCheck, 
  Check, 
  X, 
  Eye, 
  Volume2, 
  Globe,
  AlertOctagon
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { OperationalCard } from '@/components/shared/OperationalCard';
import { Badge } from '@/components/shared/BadgeSystem';
import { translations } from '@/i18n/translations';

// Form architecture integrations
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { queueSchema, agentSchema, QueueFormValues, AgentFormValues } from '@/lib/forms/schemas/routingSchemas';
import { defaultQueueConfig, defaultAgentConfig } from '@/lib/forms/formDefaults';
import { FormModal } from '@/components/shared/forms/FormModal';
import { FormShell } from '@/components/shared/forms/FormShell';
import { FormActions } from '@/components/shared/forms/FormActions';
import { TextInputField } from '@/components/shared/forms/TextInputField';
import { SelectField } from '@/components/shared/forms/SelectField';
import { FormValidationSummary } from '@/components/shared/forms/FormValidationSummary';

interface QueueItem {
  id: string;
  nameEn: string;
  nameAr: string;
  maxWaitTimeMins: number;
  slaTargetPercent: number;
  priorityWeight: number;
  overflowRule: 'vip_redirect' | 'trigger_callback' | 'voicemail' | 'secondary_pool';
  activeAgentsCount: number;
  waitingChatsCount: number;
}

interface HolidayItem {
  id: string;
  nameEn: string;
  nameAr: string;
  date: string;
  active: boolean;
}

interface RoutingRule {
  id: string;
  nameEn: string;
  nameAr: string;
  type: 'skill' | 'language' | 'vip';
  ruleDescriptionEn: string;
  ruleDescriptionAr: string;
  enabled: boolean;
}

export function QueuesRosterTab() {
  const { lang, agents, setAgents, addAuditLog } = useApp();
  const t = translations[lang];
  const isRtl = lang === 'ar';

  const [activeTab, setActiveTab] = useState<'queues' | 'routing' | 'roster' | 'presence' | 'hours'>('queues');

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

  // Queue CRUD form states
  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);
  const [editingQueueId, setEditingQueueId] = useState<string | null>(null);

  const queueForm = useForm<QueueFormValues>({
    resolver: zodResolver(queueSchema) as Resolver<QueueFormValues>,
    defaultValues: defaultQueueConfig(),
  });

  // Columns for Queues EnterpriseTable
  const queueColumns = useMemo<ColumnDef<QueueItem>[]>(() => [
    {
      accessorKey: 'name',
      header: isRtl ? 'اسم طابور الخدمة' : 'Queue Name',
      cell: ({ row }) => (
        <div>
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {isRtl ? row.original.nameAr : row.original.nameEn}
          </span>
          <span className="text-[10px] text-slate-450 dark:text-slate-500 font-mono block mt-0.5">
            ID: {row.original.id}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'maxWaitTimeMins',
      header: isRtl ? 'الانتظار الأقصى' : 'Max Wait Limit',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
          {row.original.maxWaitTimeMins}m
        </span>
      ),
    },
    {
      accessorKey: 'slaTargetPercent',
      header: isRtl ? 'هدف الـ SLA' : 'SLA Target',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
          {row.original.slaTargetPercent}%
        </span>
      ),
    },
    {
      accessorKey: 'priorityWeight',
      header: isRtl ? 'وزن الأولوية' : 'Priority Weight',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
          {row.original.priorityWeight}/10
        </span>
      ),
    },
    {
      accessorKey: 'overflowRule',
      header: isRtl ? 'استراتيجية الفائض' : 'Overflow Strategy',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-blue-650 dark:text-blue-400 uppercase text-[10px]">
          {row.original.overflowRule.replace('_', ' ')}
        </span>
      ),
    },
    {
      id: 'actions',
      header: () => <div className="text-right">{isRtl ? 'إجراءات' : 'Actions'}</div>,
      cell: ({ row }) => {
        const q = row.original;
        return (
          <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => handleOpenQueueEdit(q)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-450 hover:text-blue-500 transition-colors cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleDeleteQueue(q.id)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-red-500 hover:text-red-400 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    }
  ], [isRtl]);

  // Columns for Agent Roster EnterpriseTable
  const agentColumns = useMemo<ColumnDef<typeof agents[0]>[]>(() => [
    {
      accessorKey: 'name',
      header: isRtl ? 'الاسم والبريد' : 'Agent Details',
      cell: ({ row }) => {
        const agent = row.original;
        return (
          <div className="flex items-center gap-3">
            <img
              src={agent.avatarUrl}
              alt={agent.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800 shrink-0"
            />
            <div>
              <h4 className="font-bold text-xs text-slate-800 dark:text-white leading-tight">{agent.name}</h4>
              <span className="text-[10px] text-slate-450 font-mono block mt-0.5">{agent.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'maxChatsCount',
      header: isRtl ? 'الحد الأقصى للمحادثات' : 'Max Chats',
      cell: ({ row }) => (
        <span className="font-mono text-slate-700 dark:text-slate-350">
          {row.original.maxChatsCount}
        </span>
      ),
    },
    {
      accessorKey: 'csatScore',
      header: 'CSAT',
      cell: ({ row }) => (
        <span className="font-mono text-slate-700 dark:text-slate-350 font-bold">
          {row.original.csatScore}%
        </span>
      ),
    },
    {
      accessorKey: 'resolvedTicketsCount',
      header: isRtl ? 'التذاكر المحلولة' : 'Resolved',
      cell: ({ row }) => (
        <span className="font-mono text-slate-700 dark:text-slate-350 font-bold">
          {row.original.resolvedTicketsCount}
        </span>
      ),
    },
    {
      id: 'actions',
      header: () => <div className="text-right">{isRtl ? 'إجراءات' : 'Actions'}</div>,
      cell: ({ row }) => {
        const agent = row.original;
        return (
          <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => handleOpenAgentEdit(agent)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-450 hover:text-blue-500 transition-colors cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleDeleteAgent(agent.id)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-red-500 hover:text-red-400 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    }
  ], [isRtl]);

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

  // --- STATE FOR AGENT ROSTER & CRUD ---
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);

  const agentForm = useForm<AgentFormValues>({
    resolver: zodResolver(agentSchema) as Resolver<AgentFormValues>,
    defaultValues: defaultAgentConfig(),
  });
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
  const activeStaffCount = agents.filter(a => a.status !== 'offline').length;
  const avgWaitTimeS = 38;
  const activeItemsCount = queuesList.reduce((acc, q) => acc + q.waitingChatsCount, 0);
  const slaCompliance = 98.4;

  // --- FUNCTIONS: QUEUES CRUD ---
  const handleOpenQueueCreate = () => {
    setEditingQueueId(null);
    queueForm.reset(defaultQueueConfig());
    setIsQueueModalOpen(true);
  };

  const handleOpenQueueEdit = (q: QueueItem) => {
    setEditingQueueId(q.id);
    queueForm.reset({
      nameEn: q.nameEn,
      nameAr: q.nameAr,
      maxWaitTimeMins: q.maxWaitTimeMins,
      slaTargetPercent: q.slaTargetPercent,
      priorityWeight: q.priorityWeight,
      overflowRule: q.overflowRule,
    });
    setIsQueueModalOpen(true);
  };

  const onQueueSubmit = (values: QueueFormValues) => {
    if (editingQueueId) {
      // Edit mode
      setQueuesList(queuesList.map(q => {
        if (q.id === editingQueueId) {
          return {
            ...q,
            nameEn: values.nameEn.trim(),
            nameAr: values.nameAr.trim(),
            maxWaitTimeMins: values.maxWaitTimeMins,
            slaTargetPercent: values.slaTargetPercent,
            priorityWeight: values.priorityWeight,
            overflowRule: values.overflowRule
          };
        }
        return q;
      }));
      addAuditLog(`Updated operations queue: ${values.nameEn}`, 'success');
    } else {
      // Create mode
      const newQueue: QueueItem = {
        id: `q-${Date.now()}`,
        nameEn: values.nameEn.trim(),
        nameAr: values.nameAr.trim(),
        maxWaitTimeMins: values.maxWaitTimeMins,
        slaTargetPercent: values.slaTargetPercent,
        priorityWeight: values.priorityWeight,
        overflowRule: values.overflowRule,
        activeAgentsCount: 0,
        waitingChatsCount: 0
      };
      setQueuesList([...queuesList, newQueue]);
      addAuditLog(`Created new support queue: ${values.nameEn}`, 'success');
    }
    setIsQueueModalOpen(false);
  };

  const handleDeleteQueue = (id: string) => {
    const qName = queuesList.find(q => q.id === id)?.nameEn || 'Queue';
    setQueuesList(queuesList.filter(q => q.id !== id));
    addAuditLog(`Deleted support queue: ${qName}`, 'success');
  };

  // --- FUNCTIONS: ROUTING RULES ---
  const handleToggleRoutingRule = (id: string) => {
    setRoutingRules(routingRules.map(rule => {
      if (rule.id === id) {
        const nextState = !rule.enabled;
        addAuditLog(`${nextState ? 'Activated' : 'Deactivated'} routing policy: ${rule.nameEn}`, 'success');
        return { ...rule, enabled: nextState };
      }
      return rule;
    }));
  };

  // --- FUNCTIONS: AGENT roster CRUD ---
  const handleOpenAgentCreate = () => {
    setEditingAgentId(null);
    agentForm.reset(defaultAgentConfig());
    setIsAgentModalOpen(true);
  };

  const handleOpenAgentEdit = (agent: typeof agents[0]) => {
    setEditingAgentId(agent.id);
    agentForm.reset({
      name: agent.name,
      email: agent.email,
      maxChatsCount: agent.maxChatsCount,
      shift: 'Morning',
    });
    setIsAgentModalOpen(true);
  };

  const onAgentSubmit = (values: AgentFormValues) => {
    if (editingAgentId) {
      // Edit
      setAgents(agents.map(a => {
        if (a.id === editingAgentId) {
          return {
            ...a,
            name: values.name.trim(),
            email: values.email.trim(),
            maxChatsCount: values.maxChatsCount
          };
        }
        return a;
      }));
      addAuditLog(`Updated roster details for agent: ${values.name}`, 'success');
    } else {
      // Create
      const newAgentId = `agent-${Date.now()}`;
      const newAgent = {
        id: newAgentId,
        name: values.name.trim(),
        avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?w=120&h=120&fit=crop&crop=faces`,
        email: values.email.trim(),
        status: 'offline' as const,
        activeChatsCount: 0,
        maxChatsCount: values.maxChatsCount,
        csatScore: 90 + Math.floor(Math.random() * 10),
        resolvedTicketsCount: 0,
        lastActive: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setAgents([...agents, newAgent]);
      setAgentSkillsMap({
        ...agentSkillsMap,
        [newAgentId]: ['Billing'] // default skill
      });
      addAuditLog(`Created new team roster account: ${values.name}`, 'success');
    }
    setIsAgentModalOpen(false);
  };

  const handleDeleteAgent = (id: string) => {
    const aName = agents.find(a => a.id === id)?.name || 'Agent';
    setAgents(agents.filter(a => a.id !== id));
    addAuditLog(`Removed agent from active support roster: ${aName}`, 'success');
  };

  // --- SKILLS ASSIGNMENT MATRIX ---
  const handleToggleAgentSkill = (agentId: string, skill: string) => {
    const currentSkills = agentSkillsMap[agentId] || [];
    let nextSkills: string[];
    if (currentSkills.includes(skill)) {
      nextSkills = currentSkills.filter(s => s !== skill);
    } else {
      nextSkills = [...currentSkills, skill];
    }

    setAgentSkillsMap({
      ...agentSkillsMap,
      [agentId]: nextSkills
    });
    addAuditLog(`Updated skills profile for agent ID: ${agentId}`, 'success');
  };

  // --- MANUAL AGENT STATUS SWITCH ---
  const handleAgentStatusChange = (agentId: string, status: 'online' | 'busy' | 'away' | 'offline') => {
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
    setChannelHours(channelHours.map(ch => {
      if (ch.id === id) {
        return { ...ch, [field]: value, allDay: false };
      }
      return ch;
    }));
  };

  const handleChannelAllDayToggle = (id: string) => {
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
      <div className="flex flex-wrap gap-1 bg-slate-900/60 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-800 max-w-4xl">
        <button
          onClick={() => setActiveTab('queues')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'queues'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/50'
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
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/50'
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
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/50'
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
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/50'
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
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{isRtl ? 'ساعات العمل والعطلات' : 'Hours & Holidays'}</span>
        </button>
      </div>

      {/* --- TAB CONTENT: QUEUES MANAGEMENT (CRUD) --- */}
      {activeTab === 'queues' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center gap-4">
            <h4 className="font-bold text-[11px] text-slate-450 dark:text-slate-500 uppercase tracking-wider font-mono">
              {isRtl ? 'طوابير الخدمة النشطة وتكوينات مستوى الخدمة (SLA)' : 'Active Operations Queues & SLA Specifications'}
            </h4>

            <button
              onClick={handleOpenQueueCreate}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{isRtl ? 'إنشاء طابور دعم جديد' : 'Provision Queue'}</span>
            </button>
          </div>

          <EnterpriseTable
            data={queuesList}
            columns={queueColumns}
            lang={lang}
            enableSearch={true}
            searchPlaceholder={isRtl ? 'البحث عن طابور الخدمة...' : 'Search support queues...'}
            enableColumnVisibility={false}
          />

          <FormModal
            isOpen={isQueueModalOpen}
            onClose={() => setIsQueueModalOpen(false)}
            isDirty={queueForm.formState.isDirty}
            title={editingQueueId ? (isRtl ? 'تعديل إعدادات الطابور' : 'Edit Support Queue') : (isRtl ? 'إنشاء طابور جديد' : 'Configure New Support Queue')}
            maxWidthClass="max-w-lg"
            lang={lang}
            footer={
              <FormActions
                onCancel={() => setIsQueueModalOpen(false)}
                submitLabel={isRtl ? 'حفظ وتأكيد' : 'Save Changes'}
                cancelLabel={isRtl ? 'إلغاء' : 'Cancel'}
                isSubmitting={queueForm.formState.isSubmitting}
                lang={lang}
              />
            }
          >
            <FormShell methods={queueForm} onSubmit={onQueueSubmit} className="space-y-4">
              <FormValidationSummary errors={queueForm.formState.errors} lang={lang} />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextInputField
                  id="queueNameEn"
                  label={isRtl ? 'الاسم الإنجليزي:' : 'Queue Name (EN):'}
                  placeholder="e.g. Risk & Audit Express"
                  required
                  error={queueForm.formState.errors.nameEn?.message}
                  lang={lang}
                  {...queueForm.register('nameEn')}
                />
                <TextInputField
                  id="queueNameAr"
                  label={isRtl ? 'الاسم العربي:' : 'Queue Name (AR):'}
                  placeholder="مثال: طابور المخاطر والتدقيق"
                  required
                  error={queueForm.formState.errors.nameAr?.message}
                  lang={lang}
                  className="text-end"
                  {...queueForm.register('nameAr')}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <TextInputField
                  id="queueMaxWait"
                  type="number"
                  label={isRtl ? 'الانتظار (دقيقة):' : 'Max Wait (Mins):'}
                  required
                  error={queueForm.formState.errors.maxWaitTimeMins?.message}
                  lang={lang}
                  {...queueForm.register('maxWaitTimeMins')}
                />
                <TextInputField
                  id="queueSlaTarget"
                  type="number"
                  label={isRtl ? 'مستهدف الـ SLA %:' : 'SLA Target %:'}
                  required
                  error={queueForm.formState.errors.slaTargetPercent?.message}
                  lang={lang}
                  {...queueForm.register('slaTargetPercent')}
                />
                <TextInputField
                  id="queuePriority"
                  type="number"
                  label={isRtl ? 'الأولوية (1-10):' : 'Priority Weight:'}
                  required
                  error={queueForm.formState.errors.priorityWeight?.message}
                  lang={lang}
                  {...queueForm.register('priorityWeight')}
                />
              </div>

              <SelectField
                id="queueOverflow"
                label={isRtl ? 'قاعدة فائض الحالات:' : 'Overflow Redirection Rule:'}
                required
                options={[
                  { value: 'vip_redirect', label: isRtl ? 'توجيه لقناة كبار العملاء VIP' : 'Forward to VIP Express Line' },
                  { value: 'trigger_callback', label: isRtl ? 'تفعيل جدولة الاتصال التلقائي' : 'Trigger Automated Callback Request' },
                  { value: 'voicemail', label: isRtl ? 'تحويل للبريد الصوتي للشركة' : 'Route to Corporate Voicemail Box' },
                  { value: 'secondary_pool', label: isRtl ? 'تحويل للمجموعة الاحتياطية' : 'Route to Secondary Support Pool' },
                ]}
                error={queueForm.formState.errors.overflowRule?.message}
                lang={lang}
                {...queueForm.register('overflowRule')}
              />
            </FormShell>
          </FormModal>
        </div>
      )}

      {/* --- TAB CONTENT: ROUTING RULES BUILDER --- */}
      {activeTab === 'routing' && (
        <div className="space-y-6 animate-fade-in max-w-4xl">
          <div className="space-y-4">
            <h4 className="font-bold text-[11px] text-slate-450 dark:text-slate-500 uppercase tracking-wider font-mono">
              {isRtl ? 'محرك توجيه المحادثات الذكي' : 'Intelligent Dial & Conversation Routing Criteria Engine'}
            </h4>

            <div className="space-y-4">
              {routingRules.map((rule) => (
                <OperationalCard key={rule.id} className="p-5 flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="p-3 bg-blue-600/10 rounded-2xl shrink-0 h-11 w-11 flex items-center justify-center text-blue-500">
                      <GitBranch className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-slate-800 dark:text-white">
                          {isRtl ? rule.nameAr : rule.nameEn}
                        </h4>
                        <Badge type={rule.type === 'vip' ? 'warning' : rule.type === 'language' ? 'info' : 'success'}>
                          {rule.type.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <p className="text-[11px] text-slate-400 leading-relaxed font-normal">
                        {isRtl ? rule.ruleDescriptionAr : rule.ruleDescriptionEn}
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0 pt-1">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={() => handleToggleRoutingRule(rule.id)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-400 after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white" />
                  </label>
                </OperationalCard>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB CONTENT: AGENT ROSTER & SKILLS MATRIX --- */}
      {activeTab === 'roster' && (
        <div className="space-y-6 animate-fade-in">
          {/* Top CRUD Button */}
          <div className="flex justify-between items-center gap-4">
            <h4 className="font-bold text-[11px] text-slate-450 dark:text-slate-500 uppercase tracking-wider font-mono">
              {isRtl ? 'سجل الموظفين النشطين وجدول نوبات العمل' : 'Support Specialists Shifts & Workforce Roster'}
            </h4>

            <button
              onClick={handleOpenAgentCreate}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{isRtl ? 'إضافة وكيل دعم جديد' : 'Onboard Agent'}</span>
            </button>
          </div>

          {/* Roster & Skills assignment matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Roster list */}
            <div className="lg:col-span-6 space-y-4">
              <EnterpriseTable
                data={agents}
                columns={agentColumns}
                lang={lang}
                enableSearch={true}
                searchPlaceholder={isRtl ? 'البحث في فريق العمل...' : 'Search roster...'}
                enableColumnVisibility={false}
              />
            </div>

            {/* Dynamic Skills matrix table */}
            <div className="lg:col-span-6 space-y-4">
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
                <div>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-white flex items-center gap-2">
                    <Sliders className="w-4.5 h-4.5 text-blue-500" />
                    <span>{isRtl ? 'مصفوفة إسناد المهارات المتخصصة' : 'Skills & Channel Competence Assignment Matrix'}</span>
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    {isRtl
                      ? 'حدد المهارات التقنية الموجهة للوكلاء ليتسنى للنظام فرز وتوجيه المحادثات الذاتية بدقة.'
                      : 'Check capability nodes per agent to dynamically bind context-based routing locks.'}
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-[10px] border-collapse text-start">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-450 uppercase font-mono font-bold">
                        <th className="py-2 text-start font-bold">{isRtl ? 'اسم الوكيل' : 'Agent'}</th>
                        {availableSkills.map((skill) => (
                          <th key={skill} className="py-2 px-1 text-center font-bold font-mono text-[9px] max-w-[80px] break-words">
                            {skill}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {agents.map((agent) => {
                        const skills = agentSkillsMap[agent.id] || [];
                        return (
                          <tr key={agent.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/10">
                            <td className="py-3 font-semibold text-slate-850 dark:text-slate-200">{agent.name}</td>
                            {availableSkills.map((skill) => {
                              const checked = skills.includes(skill);
                              return (
                                <td key={skill} className="py-3 text-center">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => handleToggleAgentSkill(agent.id, skill)}
                                    className="rounded border-slate-350 dark:border-slate-800 text-blue-600 focus:ring-blue-550 bg-transparent h-3.5 w-3.5"
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Agent Create / Edit Modal popup dialog */}
          <FormModal
            isOpen={isAgentModalOpen}
            onClose={() => setIsAgentModalOpen(false)}
            isDirty={agentForm.formState.isDirty}
            title={editingAgentId ? (isRtl ? 'تعديل ملف الوكيل' : 'Edit Agent Profile') : (isRtl ? 'إضافة وكيل دعم فني جديد' : 'Configure New Agent Roster Record')}
            maxWidthClass="max-w-md"
            lang={lang}
            footer={
              <FormActions
                onCancel={() => setIsAgentModalOpen(false)}
                submitLabel={isRtl ? 'حفظ وتثبيت' : 'Save Changes'}
                cancelLabel={isRtl ? 'إلغاء' : 'Cancel'}
                isSubmitting={agentForm.formState.isSubmitting}
                lang={lang}
              />
            }
          >
            <FormShell methods={agentForm} onSubmit={onAgentSubmit} className="space-y-4">
              <FormValidationSummary errors={agentForm.formState.errors} lang={lang} />

              <TextInputField
                id="agentName"
                label={isRtl ? 'الاسم الكامل:' : 'Agent Full Name:'}
                placeholder="e.g. Nadia Vance"
                required
                error={agentForm.formState.errors.name?.message}
                lang={lang}
                {...agentForm.register('name')}
              />

              <TextInputField
                id="agentEmail"
                type="email"
                label={isRtl ? 'البريد الإلكتروني للعمل:' : 'Work Email Address:'}
                placeholder="nadia@company.com"
                required
                error={agentForm.formState.errors.email?.message}
                lang={lang}
                {...agentForm.register('email')}
              />

              <div className="grid grid-cols-2 gap-3">
                <TextInputField
                  id="agentMaxChats"
                  type="number"
                  label={isRtl ? 'الحد الأقصى للمحادثات:' : 'Max Concurrency Limit:'}
                  required
                  error={agentForm.formState.errors.maxChatsCount?.message}
                  lang={lang}
                  {...agentForm.register('maxChatsCount')}
                />

                <SelectField
                  id="agentShift"
                  label={isRtl ? 'نوبة العمل (الوردية):' : 'Active Shift:'}
                  required
                  options={[
                    { value: 'Morning', label: isRtl ? 'الصباحية' : 'Morning Shift' },
                    { value: 'Evening', label: isRtl ? 'المسائية' : 'Evening Shift' },
                    { value: 'Night', label: isRtl ? 'الليلية' : 'Night Shift' },
                  ]}
                  error={agentForm.formState.errors.shift?.message}
                  lang={lang}
                  {...agentForm.register('shift')}
                />
              </div>
            </FormShell>
          </FormModal>
        </div>
      )}

      {/* --- TAB CONTENT: LIVE PRESENCE BOARD & MONITORING --- */}
      {activeTab === 'presence' && (
        <div className="space-y-6 animate-fade-in">
          {/* Real-time Presence Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {agents.map((agent) => {
              const utilization = Math.round((agent.activeChatsCount / agent.maxChatsCount) * 100);
              const isMonitored = supervisedAgent === agent.id;
              
              return (
                <OperationalCard key={agent.id} className="p-5 space-y-4 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <img
                          src={agent.avatarUrl}
                          alt={agent.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-slate-900 rounded-full ${
                          agent.status === 'online' ? 'bg-emerald-500' : agent.status === 'busy' ? 'bg-red-500' : agent.status === 'away' ? 'bg-amber-500' : 'bg-slate-500'
                        }`} />
                      </div>

                      <div>
                        <h4 className="font-bold text-xs text-slate-850 dark:text-white leading-tight">{agent.name}</h4>
                        <span className="text-[10px] text-slate-450 font-mono block mt-0.5">{agent.email}</span>
                      </div>
                    </div>

                    <select
                      value={agent.status}
                      onChange={(e) => handleAgentStatusChange(agent.id, e.target.value as any)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-1.5 py-1 text-[9px] font-bold text-slate-350 focus:outline-none"
                    >
                      <option value="online">{isRtl ? 'متصل' : 'ONLINE'}</option>
                      <option value="away">{isRtl ? 'استراحة (Aux)' : 'AWAY / AUX'}</option>
                      <option value="busy">{isRtl ? 'مشغول' : 'BUSY'}</option>
                      <option value="offline">{isRtl ? 'غير متصل' : 'OFFLINE'}</option>
                    </select>
                  </div>

                  {/* Utilization metrics */}
                  <div className="pt-2 border-t border-slate-150 dark:border-slate-800/80 text-[10px]">
                    <div className="flex justify-between items-center mb-1 font-semibold text-slate-500">
                      <span>{isRtl ? 'معدل الاستخدام (Utilization):' : 'Caseload Utilization:'}</span>
                      <strong className="font-mono font-bold text-slate-700 dark:text-slate-300">{utilization}%</strong>
                    </div>

                    <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                      <div className={`h-full ${utilization >= 100 ? 'bg-red-500' : utilization > 60 ? 'bg-amber-500' : 'bg-blue-600'}`} style={{ width: `${utilization}%` }} />
                    </div>

                    <div className="flex justify-between items-center text-[9px] text-slate-450 dark:text-slate-500 font-mono">
                      <span>{isRtl ? `المحادثات: ${agent.activeChatsCount}/${agent.maxChatsCount}` : `Chats: ${agent.activeChatsCount}/${agent.maxChatsCount}`}</span>
                      <span>{isRtl ? `معدل CSAT: ${agent.csatScore}%` : `CSAT Score: ${agent.csatScore}%`}</span>
                    </div>
                  </div>

                  {/* Supervisor Silent Monitor actions */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                    <span className="text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider font-mono">
                      {isMonitored && activeSupervisorMode 
                        ? (isRtl ? `تتبع نشط: ${activeSupervisorMode.toUpperCase()}` : `ACTIVE: ${activeSupervisorMode.toUpperCase()}`) 
                        : (isRtl ? 'مراقبة المشرف:' : 'Supervisor Audit:')}
                    </span>

                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSupervisedAgent(isMonitored && activeSupervisorMode === 'silent' ? null : agent.id);
                          setActiveSupervisorMode(isMonitored && activeSupervisorMode === 'silent' ? null : 'silent');
                          addAuditLog(`Silent monitored session for Agent: ${agent.name}`, 'success');
                        }}
                        className={`p-1.5 rounded-lg border transition-all ${
                          isMonitored && activeSupervisorMode === 'silent'
                            ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                            : 'border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                        title="Silent Listen-In"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSupervisedAgent(isMonitored && activeSupervisorMode === 'whisper' ? null : agent.id);
                          setActiveSupervisorMode(isMonitored && activeSupervisorMode === 'whisper' ? null : 'whisper');
                          addAuditLog(`Initiated supervisor coaching whisper with Agent: ${agent.name}`, 'success');
                        }}
                        className={`p-1.5 rounded-lg border transition-all ${
                          isMonitored && activeSupervisorMode === 'whisper'
                            ? 'bg-amber-600 border-amber-500 text-white shadow-sm'
                            : 'border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                        title="Whisper Coaching"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSupervisedAgent(isMonitored && activeSupervisorMode === 'barge' ? null : agent.id);
                          setActiveSupervisorMode(isMonitored && activeSupervisorMode === 'barge' ? null : 'barge');
                          addAuditLog(`Supervisor barged directly into live dialogue with Agent: ${agent.name}`, 'success');
                        }}
                        className={`p-1.5 rounded-lg border transition-all ${
                          isMonitored && activeSupervisorMode === 'barge'
                            ? 'bg-red-600 border-red-500 text-white shadow-sm'
                            : 'border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                        title="Barge-in Confirmed"
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
      )}

      {/* --- TAB CONTENT: HOURS & HOLIDAYS MANAGEMENT --- */}
      {activeTab === 'hours' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Business Hours scheduler */}
            <div className="lg:col-span-7 space-y-6">
              <OperationalCard className="p-5 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <h3 className="font-bold text-sm text-slate-850 dark:text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <span>{isRtl ? 'ساعات العمل والتشغيل لقنوات الدعم' : 'Operational Channels Support Business Hours'}</span>
                  </h3>
                  
                  <div className="flex items-center gap-1 bg-slate-950 px-2 py-1.5 rounded-xl border border-slate-850 text-[10px] font-bold text-slate-350">
                    <Globe className="w-3.5 h-3.5 text-blue-500" />
                    <select
                      value={timezone}
                      onChange={(e) => {
                        setTimezone(e.target.value);
                        addAuditLog(`Changed global timezone index to: ${e.target.value}`, 'success');
                      }}
                      className="bg-transparent border-none text-slate-300 focus:outline-none"
                    >
                      <option value="Asia/Riyadh (AST)">{isRtl ? 'آسيا/الرياض (AST)' : 'Asia/Riyadh (AST)'}</option>
                      <option value="Asia/Dubai (GST)">{isRtl ? 'آسيا/دبي (GST)' : 'Asia/Dubai (GST)'}</option>
                      <option value="Europe/London (GMT)">{isRtl ? 'أوروبا/لندن (GMT)' : 'Europe/London (GMT)'}</option>
                    </select>
                  </div>
                </div>

                <div className="divide-y divide-slate-800/80">
                  {channelHours.map((ch) => (
                    <div key={ch.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={ch.enabled}
                            onChange={() => handleToggleChannelHours(ch.id)}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4.5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-3.5 rtl:peer-checked:after:-translate-x-3.5 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-400 after:border-slate-350 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white" />
                        </label>

                        <span className={`font-bold text-xs ${ch.enabled ? 'text-slate-850 dark:text-slate-200' : 'text-slate-500 dark:text-slate-655'}`}>
                          {isRtl ? ch.labelAr : ch.labelEn}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[10px]">
                        <button
                          type="button"
                          disabled={!ch.enabled}
                          onClick={() => handleChannelAllDayToggle(ch.id)}
                          className={`px-2 py-1.5 rounded-lg border text-[9px] font-bold tracking-wide transition-all ${
                            ch.allDay && ch.enabled
                              ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                              : 'border-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-40'
                          }`}
                        >
                          {isRtl ? 'مفتوح 24/7' : '24/7 SCHEDULE'}
                        </button>

                        <div className="flex items-center gap-1.5">
                          <input
                            type="time"
                            disabled={!ch.enabled || ch.allDay}
                            value={ch.start}
                            onChange={(e) => handleChannelTimeChange(ch.id, 'start', e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-250 font-bold focus:outline-none disabled:opacity-40"
                          />
                          <span className="text-slate-600 font-bold font-mono">/</span>
                          <input
                            type="time"
                            disabled={!ch.enabled || ch.allDay}
                            value={ch.end}
                            onChange={(e) => handleChannelTimeChange(ch.id, 'end', e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-250 font-bold focus:outline-none disabled:opacity-40"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </OperationalCard>
            </div>

            {/* Holiday schedule manager */}
            <div className="lg:col-span-5 space-y-6">
              <OperationalCard className="p-5 space-y-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-850 dark:text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <span>{isRtl ? 'جدول العطلات والإغلاق السنوي' : 'Holiday Calendar Exceptions Scheduler'}</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    {isRtl
                      ? 'حدد فترات العطلات الرسمية لتغيير استجابة النظام تلقائياً إلى رسائل الإغلاق خارج أوقات العمل.'
                      : 'Define specific calendar events to automatically routing sessions into voicemail queues.'}
                  </p>
                </div>

                {/* Holiday CRUD creation form */}
                <form onSubmit={handleAddHoliday} className="space-y-3 p-3 bg-slate-950/60 border border-slate-850 rounded-2xl text-[10px]">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400 uppercase font-mono block">{isRtl ? 'اسم العطلة (إنجليزي):' : 'Name (EN):'}</label>
                      <input
                        type="text"
                        required
                        value={newHolidayNameEn}
                        onChange={(e) => setNewHolidayNameEn(e.target.value)}
                        placeholder="National Holiday"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-1 text-slate-200 placeholder-slate-655"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400 uppercase font-mono block">{isRtl ? 'اسم العطلة (عربي):' : 'Name (AR):'}</label>
                      <input
                        type="text"
                        required
                        value={newHolidayNameAr}
                        onChange={(e) => setNewHolidayNameAr(e.target.value)}
                        placeholder="عطلة رسمية"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-1 text-slate-200 placeholder-slate-655 text-end"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 items-end">
                    <div className="flex-1 space-y-1">
                      <label className="font-bold text-slate-400 uppercase font-mono block">{isRtl ? 'التاريخ المحدود:' : 'Holiday Date:'}</label>
                      <input
                        type="date"
                        required
                        value={newHolidayDate}
                        onChange={(e) => setNewHolidayDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-1 text-slate-250 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-xl font-bold flex items-center gap-0.5 cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'جدولة' : 'Schedule'}</span>
                    </button>
                  </div>
                </form>

                {/* Scheduled Holiday items List */}
                <div className="divide-y divide-slate-800/60 max-h-48 overflow-y-auto pr-1">
                  {holidays.map((h) => (
                    <div key={h.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={h.active}
                            onChange={() => handleToggleHoliday(h.id)}
                            className="sr-only peer"
                          />
                          <div className="w-7 h-4 bg-slate-800 rounded-full peer peer-checked:after:translate-x-3 rtl:peer-checked:after:-translate-x-3 after:content-[''] after:absolute after:top-[1px] after:start-[1px] after:bg-slate-400 after:border-slate-350 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white" />
                        </label>

                        <div>
                          <h4 className={`font-bold text-[11px] leading-tight ${h.active ? 'text-slate-850 dark:text-slate-200' : 'text-slate-500'}`}>
                            {isRtl ? h.nameAr : h.nameEn}
                          </h4>
                          <span className="text-[9px] text-slate-450 dark:text-slate-500 font-mono block mt-0.5">{h.date}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteHoliday(h.id)}
                        className="text-red-500 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </OperationalCard>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
