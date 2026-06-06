'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { EnterpriseTable } from '@/components/shared/table/EnterpriseTable';
import { Plus, Edit, Trash2, AlertTriangle, ShieldCheck, Play, Pause } from 'lucide-react';
import { triggerStaffingShortage, triggerQueueOverflow } from '@/stores/notifications/notificationEvents';
import { useFeedbackToasts } from '@/components/customer-portal/feedback/PostChatToasts';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { queueSchema, QueueFormValues } from '@/lib/forms/schemas/routingSchemas';
import { defaultQueueConfig } from '@/lib/forms/formDefaults';
import { FormModal } from '@/components/shared/forms/FormModal';
import { FormShell } from '@/components/shared/forms/FormShell';
import { FormActions } from '@/components/shared/forms/FormActions';
import { TextInputField } from '@/components/shared/forms/TextInputField';
import { SelectField } from '@/components/shared/forms/SelectField';
import { FormValidationSummary } from '@/components/shared/forms/FormValidationSummary';

export interface QueueItem {
  id: string;
  nameEn: string;
  nameAr: string;
  maxWaitTimeMins: number;
  slaTargetPercent: number;
  priorityWeight: number;
  overflowRule: 'vip_redirect' | 'trigger_callback' | 'voicemail' | 'secondary_pool';
  activeAgentsCount: number;
  waitingChatsCount: number;
  status?: 'active' | 'paused';
}

interface QueueManagementProps {
  lang: 'en' | 'ar';
  queuesList: QueueItem[];
  setQueuesList: React.Dispatch<React.SetStateAction<QueueItem[]>>;
  addAuditLog: (msg: string, type: 'success' | 'failed') => void;
  canEdit: boolean;
  canManage: boolean;
}

export function QueueManagement({
  lang,
  queuesList,
  setQueuesList,
  addAuditLog,
  canEdit,
  canManage
}: QueueManagementProps) {
  const isRtl = lang === 'ar';
  const { pushToast } = useFeedbackToasts();

  const handleUpdatePriority = (id: string, delta: number) => {
    if (!canEdit) return;
    setQueuesList(prev => prev.map(q => {
      if (q.id === id) {
        const nextVal = Math.max(1, Math.min(10, q.priorityWeight + delta));
        if (nextVal !== q.priorityWeight) {
          addAuditLog(`Updated priority weight for queue ${q.nameEn} to ${nextVal}`, 'success');
          pushToast('success', isRtl ? 'تم تحديث الوزن' : 'Priority Updated', isRtl ? `تم تغيير وزن الأولوية للطابور إلى ${nextVal}` : `Priority weight updated to ${nextVal}.`);
        }
        return { ...q, priorityWeight: nextVal };
      }
      return q;
    }));
  };

  const handleUpdateAgents = (id: string, delta: number) => {
    if (!canEdit) return;
    setQueuesList(prev => prev.map(q => {
      if (q.id === id) {
        const nextVal = Math.max(0, q.activeAgentsCount + delta);
        if (nextVal !== q.activeAgentsCount) {
          addAuditLog(`Adjusted active agents roster for queue ${q.nameEn} to ${nextVal}`, 'success');
          pushToast('info', isRtl ? 'تم تحديث الوكلاء' : 'Active Agents Adjusted', isRtl ? `تم ضبط الوكلاء المتصلين إلى ${nextVal}` : `Active agents set to ${nextVal} for ${q.nameEn}.`);
        }
        return { ...q, activeAgentsCount: nextVal };
      }
      return q;
    }));
  };

  const handleUpdateChats = (id: string, delta: number) => {
    if (!canEdit) return;
    setQueuesList(prev => prev.map(q => {
      if (q.id === id) {
        const nextVal = Math.max(0, q.waitingChatsCount + delta);
        if (nextVal !== q.waitingChatsCount) {
          addAuditLog(`Simulated waiting chats traffic on queue ${q.nameEn} to ${nextVal}`, 'success');
          pushToast('info', isRtl ? 'تم تحديث الدردشات' : 'Waiting Chats Adjusted', isRtl ? `تم ضبط المحادثات المنتظرة إلى ${nextVal}` : `Waiting chats set to ${nextVal} for ${q.nameEn}.`);
        }
        return { ...q, waitingChatsCount: nextVal };
      }
      return q;
    }));
  };

  const handleTogglePauseQueue = (q: QueueItem) => {
    if (!canManage) return;
    const nextStatus = q.status === 'paused' ? 'active' : 'paused';
    setQueuesList(prev => prev.map(item => {
      if (item.id === q.id) {
        return { ...item, status: nextStatus };
      }
      return item;
    }));
    addAuditLog(`Supervisor ${nextStatus === 'paused' ? 'paused' : 'resumed'} queue ${q.nameEn}`, 'success');
    pushToast(
      nextStatus === 'paused' ? 'info' : 'success',
      nextStatus === 'paused' ? (isRtl ? 'تم إيقاف الطابور' : 'Queue Paused') : (isRtl ? 'تم استئناف الطابور' : 'Queue Resumed'),
      nextStatus === 'paused'
        ? (isRtl ? `تم إيقاف مؤقت لطابور ${q.nameEn}.` : `Support queue ${q.nameEn} is now paused.`)
        : (isRtl ? `تم استئناف العمل في طابور ${q.nameEn}.` : `Support queue ${q.nameEn} is now active.`)
    );
  };

  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);
  const [editingQueueId, setEditingQueueId] = useState<string | null>(null);

  const editingQueue = useMemo(() => {
    return queuesList.find(q => q.id === editingQueueId) || null;
  }, [editingQueueId, queuesList]);

  const queueForm = useForm<QueueFormValues>({
    resolver: zodResolver(queueSchema) as Resolver<QueueFormValues>,
    defaultValues: defaultQueueConfig(),
  });

  useEffect(() => {
    if (isQueueModalOpen) {
      if (editingQueue) {
        queueForm.reset({
          nameEn: editingQueue.nameEn,
          nameAr: editingQueue.nameAr,
          maxWaitTimeMins: editingQueue.maxWaitTimeMins,
          slaTargetPercent: editingQueue.slaTargetPercent,
          priorityWeight: editingQueue.priorityWeight,
          overflowRule: editingQueue.overflowRule,
        });
      } else {
        queueForm.reset(defaultQueueConfig());
      }
    }
  }, [editingQueue, isQueueModalOpen, queueForm]);

  const handleOpenQueueCreate = () => {
    if (!canEdit) return;
    setEditingQueueId(null);
    setIsQueueModalOpen(true);
  };

  const handleOpenQueueEdit = (q: QueueItem) => {
    if (!canEdit) return;
    setEditingQueueId(q.id);
    setIsQueueModalOpen(true);
  };

  const onQueueSubmit = (values: QueueFormValues) => {
    if (!canEdit) return;
    if (editingQueueId) {
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
      pushToast(
        'success',
        isRtl ? 'تم تحديث طابور الخدمة' : 'Queue Updated',
        isRtl ? `تم حفظ تغييرات طابور ${values.nameEn} بنجاح.` : `Changes to queue ${values.nameEn} saved successfully.`
      );
    } else {
      const newQueue: QueueItem = {
        id: `q-${Date.now()}`,
        nameEn: values.nameEn.trim(),
        nameAr: values.nameAr.trim(),
        maxWaitTimeMins: values.maxWaitTimeMins,
        slaTargetPercent: values.slaTargetPercent,
        priorityWeight: values.priorityWeight,
        overflowRule: values.overflowRule,
        activeAgentsCount: 0,
        waitingChatsCount: 0,
        status: 'active'
      };
      setQueuesList([...queuesList, newQueue]);
      addAuditLog(`Created new support queue: ${values.nameEn}`, 'success');
      pushToast(
        'success',
        isRtl ? 'تم إنشاء طابور الخدمة' : 'Queue Provisioned',
        isRtl ? `تم إنشاء طابور ${values.nameEn} بنجاح.` : `Support queue ${values.nameEn} provisioned successfully.`
      );
      
      triggerStaffingShortage(values.nameEn, 0);
      if (values.priorityWeight > 7) {
        triggerQueueOverflow(values.nameEn, Math.floor(Math.random() * 15) + 20);
      }
    }
    setIsQueueModalOpen(false);
  };

  const handleDeleteQueue = (id: string) => {
    if (!canManage) return;
    const qName = queuesList.find(q => q.id === id)?.nameEn || 'Queue';
    setQueuesList(queuesList.filter(q => q.id !== id));
    addAuditLog(`Deleted support queue: ${qName}`, 'success');
  };

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
      id: 'status',
      header: isRtl ? 'الحالة' : 'Status',
      cell: ({ row }) => {
        const q = row.original;
        const isPaused = q.status === 'paused';
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-bold font-mono uppercase ${
            isPaused 
              ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' 
              : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/25'
          }`}>
            {isPaused ? (isRtl ? 'موقوف' : 'PAUSED') : (isRtl ? 'نشط' : 'ACTIVE')}
          </span>
        );
      }
    },
    {
      accessorKey: 'maxWaitTimeMins',
      header: isRtl ? 'الانتظار الأقصى' : 'Max Wait Limit',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-slate-700 dark:text-slate-355">
          {row.original.maxWaitTimeMins}m
        </span>
      ),
    },
    {
      accessorKey: 'slaTargetPercent',
      header: isRtl ? 'هدف الـ SLA' : 'SLA Target',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-slate-700 dark:text-slate-355">
          {row.original.slaTargetPercent}%
        </span>
      ),
    },
    {
      accessorKey: 'priorityWeight',
      header: isRtl ? 'وزن الأولوية' : 'Priority Weight',
      cell: ({ row }) => {
        const q = row.original;
        return (
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
            <button
              onClick={() => handleUpdatePriority(q.id, -1)}
              disabled={!canEdit || q.priorityWeight <= 1}
              className="w-5 h-5 flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded transition-colors disabled:opacity-40 cursor-pointer font-bold text-sm"
            >
              -
            </button>
            <span>{q.priorityWeight}/10</span>
            <button
              onClick={() => handleUpdatePriority(q.id, 1)}
              disabled={!canEdit || q.priorityWeight >= 10}
              className="w-5 h-5 flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded transition-colors disabled:opacity-40 cursor-pointer font-bold text-sm"
            >
              +
            </button>
          </div>
        );
      }
    },
    {
      id: 'activeAgents',
      header: isRtl ? 'الوكلاء النشطين' : 'Active Agents',
      cell: ({ row }) => {
        const q = row.original;
        return (
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
            <button
              onClick={() => handleUpdateAgents(q.id, -1)}
              disabled={!canEdit || q.activeAgentsCount <= 0}
              className="w-5 h-5 flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded transition-colors disabled:opacity-40 cursor-pointer font-bold text-sm"
            >
              -
            </button>
            <span>{q.activeAgentsCount}</span>
            <button
              onClick={() => handleUpdateAgents(q.id, 1)}
              disabled={!canEdit}
              className="w-5 h-5 flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded transition-colors disabled:opacity-40 cursor-pointer font-bold text-sm"
            >
              +
            </button>
          </div>
        );
      }
    },
    {
      id: 'waitingChats',
      header: isRtl ? 'الانتظار' : 'Waiting Chats',
      cell: ({ row }) => {
        const q = row.original;
        return (
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
            <button
              onClick={() => handleUpdateChats(q.id, -1)}
              disabled={!canEdit || q.waitingChatsCount <= 0}
              className="w-5 h-5 flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded transition-colors disabled:opacity-40 cursor-pointer font-bold text-sm"
            >
              -
            </button>
            <span>{q.waitingChatsCount}</span>
            <button
              onClick={() => handleUpdateChats(q.id, 1)}
              disabled={!canEdit}
              className="w-5 h-5 flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded transition-colors disabled:opacity-40 cursor-pointer font-bold text-sm"
            >
              +
            </button>
          </div>
        );
      }
    },
    {
      id: 'slaStatus',
      header: isRtl ? 'حالة مستوى الخدمة' : 'SLA Compliance',
      cell: ({ row }) => {
        const q = row.original;
        // Simple logic for breach risk
        const isBreached = q.waitingChatsCount > 0 && q.activeAgentsCount === 0;
        const isWarning = q.waitingChatsCount > 0 && q.waitingChatsCount >= q.activeAgentsCount;
        
        if (isBreached) {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold font-mono bg-rose-500/10 text-rose-500 animate-pulse border border-rose-500/25">
              <AlertTriangle className="w-3 h-3" />
              <span>{isRtl ? 'خرق حرج' : 'CRITICAL BREACH'}</span>
            </span>
          );
        }
        
        if (isWarning) {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold font-mono bg-amber-500/10 text-amber-500 border border-amber-500/25">
              <AlertTriangle className="w-3 h-3" />
              <span>{isRtl ? 'خطر الخرق' : 'BREACH WARNING'}</span>
            </span>
          );
        }

        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/25">
            <ShieldCheck className="w-3 h-3" />
            <span>{isRtl ? 'سليم' : 'COMPLIANT'}</span>
          </span>
        );
      }
    },
    {
      accessorKey: 'overflowRule',
      header: isRtl ? 'استراتيجية الفائض' : 'Overflow Strategy',
      cell: ({ row }) => {
        const q = row.original;
        return (
          <select
            value={q.overflowRule}
            disabled={!canEdit}
            onChange={(e) => {
              const nextVal = e.target.value as any;
              setQueuesList(prev => prev.map(item => item.id === q.id ? { ...item, overflowRule: nextVal } : item));
              addAuditLog(`Updated overflow strategy for queue ${q.nameEn} to ${nextVal.replace('_', ' ').toUpperCase()}`, 'success');
              pushToast('success', isRtl ? 'تم تحديث قاعدة الفائض' : 'Overflow Strategy Updated', isRtl ? `تم تغيير الاستراتيجية إلى ${nextVal}` : `Strategy for ${q.nameEn} updated to ${nextVal}.`);
            }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-lg text-[10px] p-1 font-bold text-blue-600 dark:text-blue-400 focus:outline-none cursor-pointer focus:border-blue-500 font-mono"
          >
            <option value="vip_redirect">VIP REDIRECT</option>
            <option value="trigger_callback">TRIGGER CALLBACK</option>
            <option value="voicemail">VOICEMAIL</option>
            <option value="secondary_pool">SECONDARY POOL</option>
          </select>
        );
      }
    },
    {
      id: 'actions',
      header: () => <div className="text-right">{isRtl ? 'إجراءات' : 'Actions'}</div>,
      cell: ({ row }) => {
        const q = row.original;
        const isPaused = q.status === 'paused';
        return (
          <div className="flex justify-end items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => handleTogglePauseQueue(q)}
              disabled={!canManage}
              className={`p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer ${
                isPaused 
                  ? 'text-emerald-500 hover:text-emerald-600' 
                  : 'text-amber-500 hover:text-amber-600'
              } ${!canManage ? 'opacity-60 cursor-not-allowed' : ''}`}
              title={
                !canManage 
                  ? "Requires Manage Permission" 
                  : isPaused ? (isRtl ? "استئناف" : "Resume Queue") : (isRtl ? "إيقاف مؤقت" : "Pause Queue")
              }
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => handleOpenQueueEdit(q)}
              disabled={!canEdit}
              className={`p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-450 hover:text-blue-500 transition-colors cursor-pointer ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
              title={!canEdit ? "Requires Edit Permission" : undefined}
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleDeleteQueue(q.id)}
              disabled={!canManage}
              className={`p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-red-500 hover:text-red-400 transition-colors cursor-pointer ${!canManage ? 'opacity-60 cursor-not-allowed' : ''}`}
              title={!canManage ? "Requires Manage Permission" : undefined}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    }
  ], [isRtl, queuesList, canEdit, canManage]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center gap-4">
        <h4 className="font-bold text-[11px] text-slate-450 dark:text-slate-500 uppercase tracking-wider font-mono">
          {isRtl ? 'طوابير الخدمة النشطة وتكوينات مستوى الخدمة (SLA)' : 'Active Operations Queues & SLA Specifications'}
        </h4>

        <button
          onClick={handleOpenQueueCreate}
          disabled={!canEdit}
          className={`bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
          title={!canEdit ? "Requires Edit Permission" : undefined}
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
            onSubmit={queueForm.handleSubmit(onQueueSubmit)}
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
  );
}
