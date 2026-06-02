'use client';

import React, { useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { EnterpriseTable } from '@/components/shared/table/EnterpriseTable';
import { Plus, Edit, Trash2, Calendar, AlertTriangle, RefreshCw, Sliders } from 'lucide-react';
import { Badge } from '@/components/shared/BadgeSystem';
import { OperationalCard } from '@/components/shared/OperationalCard';
import { OperationalBanner } from '@/components/shared/workflows/OperationalBanner';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { agentSchema, AgentFormValues } from '@/lib/forms/schemas/routingSchemas';
import { defaultAgentConfig } from '@/lib/forms/formDefaults';
import { FormModal } from '@/components/shared/forms/FormModal';
import { FormShell } from '@/components/shared/forms/FormShell';
import { FormActions } from '@/components/shared/forms/FormActions';
import { TextInputField } from '@/components/shared/forms/TextInputField';
import { SelectField } from '@/components/shared/forms/SelectField';
import { FormValidationSummary } from '@/components/shared/forms/FormValidationSummary';
import { SkillsMatrix } from './SkillsMatrix';

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

interface AgentRosterProps {
  lang: 'en' | 'ar';
  agents: AgentItem[];
  setAgents: React.Dispatch<React.SetStateAction<AgentItem[]>>;
  addAuditLog: (msg: string, type: 'success' | 'failed') => void;
  absenteeismActive: boolean;
  setAbsenteeismActive: (val: boolean) => void;
  routingRealigned: boolean;
  setRoutingRealigned: (val: boolean) => void;
  isSimulating: boolean;
  setIsSimulating: (val: boolean) => void;
  shrinkageRate: number;
  agentSkillsMap: Record<string, string[]>;
  setAgentSkillsMap: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  availableSkills: string[];
}

export function AgentRoster({
  lang,
  agents,
  setAgents,
  addAuditLog,
  absenteeismActive,
  setAbsenteeismActive,
  routingRealigned,
  setRoutingRealigned,
  isSimulating,
  setIsSimulating,
  shrinkageRate,
  agentSkillsMap,
  setAgentSkillsMap,
  availableSkills
}: AgentRosterProps) {
  const isRtl = lang === 'ar';

  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);

  const agentForm = useForm<AgentFormValues>({
    resolver: zodResolver(agentSchema) as Resolver<AgentFormValues>,
    defaultValues: defaultAgentConfig(),
  });

  const handleOpenAgentCreate = () => {
    setEditingAgentId(null);
    agentForm.reset(defaultAgentConfig());
    setIsAgentModalOpen(true);
  };

  const handleOpenAgentEdit = (agent: AgentItem) => {
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
      const newAgentId = `agent-${Date.now()}`;
      const newAgent: AgentItem = {
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
        [newAgentId]: ['Billing']
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

  const agentColumns = useMemo<ColumnDef<AgentItem>[]>(() => [
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
              className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800 shrink-0 animate-fade-in"
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
        <span className="font-mono text-slate-700 dark:text-slate-355 font-semibold">
          {row.original.maxChatsCount}
        </span>
      ),
    },
    {
      accessorKey: 'csatScore',
      header: 'CSAT',
      cell: ({ row }) => (
        <span className="font-mono text-slate-700 dark:text-slate-355 font-bold">
          {row.original.csatScore}%
        </span>
      ),
    },
    {
      accessorKey: 'resolvedTicketsCount',
      header: isRtl ? 'التذاكر المحلولة' : 'Resolved',
      cell: ({ row }) => (
        <span className="font-mono text-slate-700 dark:text-slate-355 font-bold">
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
  ], [isRtl, agents]);

  return (
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

      {/* Workforce Management (WFM) Intelligence Suite */}
      <div className="bg-slate-50/50 dark:bg-slate-900/20 p-5 border border-slate-205 dark:border-slate-800 rounded-3xl space-y-4">
        
        {/* Warning / Success Alerts */}
        {absenteeismActive && (
          <div className="animate-in slide-in-from-top-1">
            {routingRealigned ? (
              <OperationalBanner
                type="success"
                messageEn="Workforce Stabilized: VIP Specialist Liam Bennett has been temporarily re-routed to cover the Arabic Language queue. Wait times are normalizing."
                messageAr="تم استقرار القوى الحملية: تم توجيه أخصائي VIP ليم بينيت مؤقتاً لتغطية طابور اللغة العربية. أوقات الانتظار بدأت تعود لطبيعتها."
                isRtl={isRtl}
              />
            ) : (
              <OperationalBanner
                type="error"
                messageEn="Critical Coverage Alert: High absenteeism has breached SLA limits. Arabic Language Specialist coverage is at 0. Core response times are spiking."
                messageAr="تنبيه تغطية حرج: أدى غياب الموظفين المرتفع إلى خرق حدود اتفاقية الخدمة. أخصائيو اللغة العربية يبلغ عددهم 0 حالياً."
                isRtl={isRtl}
                actionTextEn="Solve Staffing Gap"
                actionTextAr="حل فجوة التغطية"
                onAction={() => {
                  setRoutingRealigned(true);
                  addAuditLog("Applied staffing recommendation: Re-routed VIP Specialist to Arabic queue.", "success");
                }}
              />
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Occupancy Heatmap (Col span 8) */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>{isRtl ? 'خريطة استخدام الموظفين ومعدل الإشغال' : 'Agent Occupancy & Shrinkage Heatmap'}</span>
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {isRtl ? 'عرض إشغال الوكلاء بالساعة ومعدلات انكماش الخدمة.' : 'Hourly agent caseload load and support shrinkage forecasting.'}
                </p>
              </div>

              <div className="flex gap-4 text-[10px] font-bold font-mono">
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">Shrinkage:</span>
                  <span className={`px-2 py-0.5 rounded-lg ${absenteeismActive ? 'bg-red-100 text-red-700 dark:bg-red-950/20' : 'bg-slate-100 text-slate-650'}`}>
                    {shrinkageRate}%
                  </span>
                </div>
              </div>
            </div>

            {/* Heatmap grid */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-4 rounded-2xl overflow-x-auto">
              <div className="min-w-[480px] space-y-2 text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                <div className="grid grid-cols-8 gap-1.5 text-center font-bold font-mono uppercase text-[9px] tracking-wider text-slate-400 pb-1 border-b border-slate-100 dark:border-slate-850">
                  <div className="text-start">Day</div>
                  {['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'].map(h => (
                    <div key={h}>{h}</div>
                  ))}
                </div>

                {[
                  { en: 'Sunday', ar: 'الأحد' },
                  { en: 'Monday', ar: 'الاثنين' },
                  { en: 'Tuesday', ar: 'الثلاثاء' },
                  { en: 'Wednesday', ar: 'الأربعاء' },
                  { en: 'Thursday', ar: 'الخميس' }
                ].map((day, dayIdx) => (
                  <div key={day.en} className="grid grid-cols-8 gap-1.5 items-center">
                    <div className="font-bold text-slate-700 dark:text-slate-300 truncate">
                      {isRtl ? day.ar : day.en}
                    </div>
                    {Array.from({ length: 7 }).map((_, hourIdx) => {
                      const baseOccupancy = [
                        [70, 85, 90, 80, 75, 70, 65], // Sun
                        [75, 88, 92, 85, 80, 72, 60], // Mon
                        [72, 82, 88, 80, 78, 70, 62], // Tue
                        [78, 86, 91, 84, 82, 75, 68], // Wed
                        [65, 78, 84, 75, 70, 65, 55], // Thu
                      ];
                      let val = baseOccupancy[dayIdx]?.[hourIdx] || 75;
                      if (absenteeismActive) {
                        val += 12;
                        if (routingRealigned) val -= 4;
                      }
                      const occupancy = Math.min(100, val);

                      let cellStyle = 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-850 text-slate-400';
                      if (occupancy >= 90) {
                        cellStyle = 'bg-rose-100 dark:bg-rose-955/40 text-rose-700 dark:text-rose-400 border-rose-250 dark:border-rose-900/30';
                      } else if (occupancy >= 70) {
                        cellStyle = 'bg-blue-50 dark:bg-blue-955/30 text-blue-700 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/20';
                      }

                      return (
                        <div
                          key={hourIdx}
                          className={`p-2 text-center rounded-lg border font-mono font-bold transition-all hover:scale-105 select-none ${cellStyle}`}
                        >
                          {occupancy}%
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Heatmap Legend */}
              <div className="flex flex-wrap items-center gap-4 text-[9px] font-bold font-mono text-slate-450 uppercase pt-3 border-t border-slate-100 dark:border-slate-850 mt-3 select-none">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded bg-rose-100 dark:bg-rose-955/45 border border-rose-250" />
                  <span>Overload (&gt;90%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded bg-blue-50 dark:bg-blue-955/30 border border-blue-200" />
                  <span>Optimal (70%-90%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-100" />
                  <span>Underutilized (&lt;70%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Absenteeism Simulator (Col span 4) */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-4">
            <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-850 p-4 rounded-2xl space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h5 className="font-bold text-xs text-slate-800 dark:text-white flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>{isRtl ? 'محاكي غياب الموظفين المفاجئ' : 'Absenteeism Simulator'}</span>
                </h5>
                <p className="text-[10px] text-slate-450 mt-1 font-normal leading-relaxed">
                  {isRtl 
                    ? 'محاكاة غياب مفاجئ لاثنين من وكلاء الدعم لاختبار قوة استقرار التوجيه التلقائي.'
                    : 'Simulate sudden sick leave for 2 agents to stress-test layout limits and queue routing rules.'}
                </p>
              </div>

              <button
                onClick={() => {
                  if (absenteeismActive) {
                    setAbsenteeismActive(false);
                    setRoutingRealigned(false);
                    setAgents(prev => prev.map(a => a.id === 'agent-3' ? { ...a, status: 'away' } : a));
                    addAuditLog("WFM Simulator: Absenteeism simulation ended. Agents returned online.", "success");
                  } else {
                    setIsSimulating(true);
                    setTimeout(() => {
                      setIsSimulating(false);
                      setAbsenteeismActive(true);
                      setAgents(prev => prev.map(a => a.id === 'agent-3' ? { ...a, status: 'offline' } : a));
                      addAuditLog("WFM Simulator: Absenteeism triggered. 2 specialists offline, shrinkage spiked to 32.5%", "failed");
                    }, 1200);
                  }
                }}
                disabled={isSimulating}
                className={`w-full py-2.5 rounded-xl text-[10px] uppercase tracking-wider font-bold transition-all select-none border cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50 ${
                  absenteeismActive
                    ? 'bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-900 dark:bg-amber-900/20 dark:hover:bg-amber-900/40 dark:text-amber-400 dark:border-amber-800'
                    : 'bg-rose-600 hover:bg-rose-700 border-rose-600 text-white shadow-sm shadow-rose-600/10'
                }`}
              >
                {isSimulating ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Simulating Callout...</span>
                  </span>
                ) : absenteeismActive ? (
                  <span>Resolve Absenteeism (Reset)</span>
                ) : (
                  <span>Simulate Sudden Absenteeism</span>
                )}
              </button>
            </div>

            {/* Staffing Recommendation Console */}
            {absenteeismActive && (
              <div className="bg-blue-50/50 dark:bg-blue-955/10 p-4 border border-blue-250 dark:border-blue-900/35 rounded-2xl space-y-3 animate-in zoom-in-95">
                <h5 className="font-bold text-xs text-blue-900 dark:text-blue-400 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4" />
                  <span>{isRtl ? 'وحدة توصيات التوجيه التلقائي' : 'Staffing Advisor Console'}</span>
                </h5>
                <p className="text-[10px] text-slate-550 dark:text-slate-400 leading-normal font-normal">
                  Recommendation: Temporary routing override suggested. Shift <strong>Liam Bennett</strong> from VIP support to staff the depleted <strong>Arabic Language queue</strong>.
                </p>
                
                {!routingRealigned ? (
                  <button
                    onClick={() => {
                      setRoutingRealigned(true);
                      addAuditLog("Applied staffing recommendation: Re-routed VIP Specialist to Arabic queue.", "success");
                    }}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-750 text-white rounded-xl text-[10px] uppercase tracking-wider font-bold transition-all shadow-sm shadow-blue-500/15 cursor-pointer"
                  >
                    Execute Routing Override
                  </button>
                ) : (
                  <div className="text-center text-[10px] font-bold text-emerald-650 dark:text-emerald-400 font-mono py-1">
                    ✓ Recommendation Executed
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Roster & Skills assignment matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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

        <div className="lg:col-span-6 space-y-4">
          <SkillsMatrix
            lang={lang}
            agents={agents}
            agentSkillsMap={agentSkillsMap}
            availableSkills={availableSkills}
            onToggleAgentSkill={handleToggleAgentSkill}
          />
        </div>
      </div>

      {/* Agent Onboard / Edit modal dialog */}
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
  );
}
