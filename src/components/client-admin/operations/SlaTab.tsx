'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { EnterpriseTable } from '@/components/shared/EnterpriseTable';
import { Badge } from '@/components/shared/BadgeSystem';
import { translations } from '@/i18n/translations';
import { AlertCircle, TrendingDown, TrendingUp, Plus, Edit, Trash2, Save } from 'lucide-react';
import { triggerSlaBreach } from '@/stores/notifications/notificationEvents';
import { useFeedbackToasts } from '@/components/customer-portal/feedback/PostChatToasts';
import { ModalWrapper } from '@/components/shared/ModalWrapper';

interface SLARule {
  id: string;
  name: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  responseTimeMins: number;
  resolutionTimeMins: number;
  active: boolean;
}

export function SlaTab() {
  const { lang, slaRules, setSlaRules, addAuditLog } = useApp();
  const t = translations[lang];
  const isRtl = lang === 'ar';
  const { pushToast } = useFeedbackToasts();

  // CRUD & Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<SLARule | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [responseTime, setResponseTime] = useState(60);
  const [resolutionTime, setResolutionTime] = useState(360);
  const [active, setActive] = useState(true);

  // Form Validation
  const [errors, setErrors] = useState<string[]>([]);

  // Delete Confirm State
  const [deleteRuleId, setDeleteRuleId] = useState<string | null>(null);

  // Extend headers with operational analytics and actions columns
  const tableHeaders = [
    ...t.clientAdmin.sla.headers,
    isRtl ? 'الأداء الفعلي (30 يوم)' : 'Adherence (30d)',
    isRtl ? 'الإجراءات' : 'Actions'
  ];

  // Enrich SLA rules with compliance analytics simulation
  const enrichedRules = slaRules.map(rule => {
    let adherence = 99.9;
    let trend = 'stable';
    let breachRisk = false;

    if (rule.priority === 'urgent') {
      adherence = 94.2;
      trend = 'down';
      breachRisk = true;
    } else if (rule.priority === 'high') {
      adherence = 97.8;
      trend = 'down';
    } else if (rule.priority === 'medium') {
      adherence = 99.1;
      trend = 'up';
    } else {
      adherence = 99.9;
      trend = 'up';
    }

    return { ...rule, adherence, trend, breachRisk };
  });

  // Open modal for adding a new rule
  const handleOpenAdd = () => {
    setEditingRule(null);
    setName('');
    setPriority('medium');
    setResponseTime(60);
    setResolutionTime(360);
    setActive(true);
    setErrors([]);
    setIsOpen(true);
  };

  // Open modal for editing an existing rule
  const handleOpenEdit = (rule: SLARule) => {
    setEditingRule(rule);
    setName(rule.name);
    setPriority(rule.priority);
    setResponseTime(rule.responseTimeMins);
    setResolutionTime(rule.resolutionTimeMins);
    setActive(rule.active);
    setErrors([]);
    setIsOpen(true);
  };

  // Handle Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors: string[] = [];

    if (!name.trim()) {
      validationErrors.push(isRtl ? 'اسم السياسة مطلوب.' : 'Policy Name is required.');
    }
    if (responseTime <= 0) {
      validationErrors.push(isRtl ? 'زمن الاستجابة يجب أن يكون أكبر من 0 دقيقة.' : 'Response time must be greater than 0 mins.');
    }
    if (resolutionTime <= 0) {
      validationErrors.push(isRtl ? 'زمن الحل يجب أن يكون أكبر من 0 دقيقة.' : 'Resolution time must be greater than 0 mins.');
    }
    if (resolutionTime < responseTime) {
      validationErrors.push(isRtl ? 'زمن الحل لا يمكن أن يكون أقل من زمن الاستجابة.' : 'Resolution limit cannot be lower than response limit.');
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      pushToast('error', isRtl ? 'خطأ في التحقق' : 'Validation Error', isRtl ? 'يرجى مراجعة الحقول وإدخال بيانات صحيحة.' : 'Please fix form fields errors before saving.');
      return;
    }

    if (editingRule) {
      // Update rule
      setSlaRules(prev => prev.map(r => r.id === editingRule.id ? {
        id: editingRule.id,
        name,
        priority,
        responseTimeMins: Number(responseTime),
        resolutionTimeMins: Number(resolutionTime),
        active
      } : r));

      addAuditLog(`Updated SLA Policy Rule: ${name} (${priority.toUpperCase()})`, 'success');
      pushToast('success', isRtl ? 'تم تحديث اتفاقية مستوى الخدمة' : 'SLA Rule Updated', isRtl ? `تم حفظ تعديلات سياسة ${name} بنجاح.` : `SLA rule policy ${name} saved successfully.`);
    } else {
      // Create new rule
      const newRule: SLARule = {
        id: `sla-${Date.now()}`,
        name,
        priority,
        responseTimeMins: Number(responseTime),
        resolutionTimeMins: Number(resolutionTime),
        active
      };

      setSlaRules(prev => [...prev, newRule]);
      addAuditLog(`Created new SLA Policy Rule: ${name} (${priority.toUpperCase()})`, 'success');
      pushToast('success', isRtl ? 'تم إضافة اتفاقية مستوى الخدمة' : 'SLA Rule Added', isRtl ? `تم تسجيل سياسة مستوى الخدمة ${name} بنجاح.` : `SLA rule policy ${name} has been added.`);
    }

    setIsOpen(false);
  };

  // Handle Delete Confirmation
  const handleDelete = (id: string) => {
    const target = slaRules.find(r => r.id === id);
    if (!target) return;

    setSlaRules(prev => prev.filter(r => r.id !== id));
    addAuditLog(`Deleted SLA Policy Rule: ${target.name}`, 'success');
    pushToast('info', isRtl ? 'تم حذف اتفاقية الخدمة' : 'SLA Rule Deleted', isRtl ? `تم إزالة سياسة مستوى الخدمة ${target.name}.` : `SLA rule policy ${target.name} has been deleted.`);
    setDeleteRuleId(null);
  };

  const priorityColors = {
    urgent: 'text-red-650 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40',
    high: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40',
    medium: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40',
    low: 'text-slate-655 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
  };

  return (
    <div className="space-y-6 text-xs font-semibold text-slate-805 dark:text-slate-205">
      <SectionHeader
        title={t.clientAdmin.sla.title}
        description={t.clientAdmin.sla.description}
        action={
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-750 text-white rounded-xl text-[10px] uppercase font-bold transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isRtl ? 'إضافة سياسة جديدة' : 'Add Policy Rule'}</span>
          </button>
        }
      />

      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <h3 className="font-bold text-[11px] text-slate-655 dark:text-slate-400 uppercase tracking-wider font-mono">
            {t.clientAdmin.sla.configuredSla}
          </h3>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => triggerSlaBreach('VIP Support Queue', '19m 15s', '15m')}
              className="px-2.5 py-1 text-[10px] font-bold text-rose-500 bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 rounded-xl transition-all active:scale-95 cursor-pointer"
            >
              {isRtl ? 'محاكاة خرق الاتفاقية' : 'Simulate SLA Breach'}
            </button>
            <span className="text-[10px] text-slate-500 font-mono">Last synced: 2 mins ago</span>
          </div>
        </div>
        
        <EnterpriseTable headers={tableHeaders}>
          {enrichedRules.map((rule) => (
            <tr key={rule.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 group transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-lg border text-[10px] uppercase font-mono font-extrabold ${priorityColors[rule.priority]}`}>
                    {rule.priority}
                  </span>
                  {rule.breachRisk && (
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-650 dark:text-red-400 animate-pulse" title="High Breach Risk">
                      <AlertCircle className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <span className="font-bold text-slate-850 dark:text-white ml-2 block leading-none">{rule.name}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                  {rule.responseTimeMins} {t.clientAdmin.sla.mins}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                  {rule.resolutionTimeMins} {t.clientAdmin.sla.mins}
                </span>
              </td>
              <td className="px-6 py-4">
                <Badge type={rule.active ? 'success' : 'inactive'}>
                  {rule.active ? t.clientAdmin.sla.active : t.clientAdmin.sla.inactive}
                </Badge>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-baseline gap-1.5 w-16">
                    <span className={`font-bold font-mono ${
                      rule.adherence < 95 ? 'text-red-600 dark:text-red-400' : 
                      rule.adherence < 98 ? 'text-amber-600 dark:text-amber-400' : 
                      'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {rule.adherence}%
                    </span>
                  </div>
                  
                  {/* Visual adherence bar */}
                  <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                    <div className={`h-full ${
                      rule.adherence < 95 ? 'bg-red-500' : 
                      rule.adherence < 98 ? 'bg-amber-500' : 
                      'bg-emerald-500'
                    }`} style={{ width: `${rule.adherence}%` }} />
                  </div>

                  {rule.trend === 'up' ? (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(rule)}
                    className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                    title={isRtl ? 'تعديل السياسة' : 'Edit Policy'}
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteRuleId(rule.id)}
                    className="p-1 text-rose-500 hover:bg-rose-50/50 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                    title={isRtl ? 'حذف السياسة' : 'Delete Policy'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </EnterpriseTable>
      </div>

      {/* CRUD Add/Edit Modal */}
      <ModalWrapper
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={editingRule ? (isRtl ? 'تعديل سياسة اتفاقية الخدمة' : 'Edit SLA Policy Target') : (isRtl ? 'إضافة سياسة اتفاقية خدمة جديدة' : 'Create SLA Policy Target')}
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.length > 0 && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/40 rounded-xl space-y-1 text-rose-600 dark:text-rose-400 font-mono text-[9.5px]">
              {errors.map((err, i) => (
                <div key={i} className="flex gap-1">
                  <span>•</span>
                  <span>{err}</span>
                </div>
              ))}
            </div>
          )}

          <div>
            <label htmlFor="policy-name" className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase font-mono tracking-wider">
              {isRtl ? 'اسم السياسة:' : 'Policy Name'}
            </label>
            <input
              id="policy-name"
              type="text"
              required
              placeholder={isRtl ? 'مثال: سياسة الدعم الهام' : 'e.g. VIP Urgent Tier'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-205 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 font-sans text-xs text-slate-855 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="policy-priority" className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase font-mono tracking-wider">
                {isRtl ? 'مستوى الأولوية:' : 'Priority Level'}
              </label>
              <select
                id="policy-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none font-sans text-xs text-slate-855 dark:text-white font-bold"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent Priority</option>
              </select>
            </div>

            <div className="flex items-center justify-between h-9 px-3 mt-5 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-850 rounded-xl select-none">
              <span className="text-[10px] font-bold text-slate-550 uppercase font-mono">{isRtl ? 'مفعلة' : 'Active Status'}</span>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  aria-label={isRtl ? 'حالة التفعيل' : 'Active Status checkbox'}
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-7 h-4 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-3 rtl:peer-checked:after:-translate-x-3 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-400 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white" />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="policy-response-time" className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase font-mono tracking-wider">
                {isRtl ? 'زمن الاستجابة (دقيقة):' : 'Response Target (mins)'}
              </label>
              <input
                id="policy-response-time"
                type="number"
                required
                min={1}
                value={responseTime}
                onChange={(e) => setResponseTime(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-205 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 font-mono text-xs text-slate-855 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="policy-resolution-time" className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase font-mono tracking-wider">
                {isRtl ? 'زمن الحل (دقيقة):' : 'Resolution Target (mins)'}
              </label>
              <input
                id="policy-resolution-time"
                type="number"
                required
                min={1}
                value={resolutionTime}
                onChange={(e) => setResolutionTime(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-205 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 font-mono text-xs text-slate-855 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 text-xs font-bold">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 border border-slate-205 dark:border-slate-850 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer text-slate-655 dark:text-slate-400"
            >
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-650 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isRtl ? 'حفظ السياسة' : 'Save Policy'}</span>
            </button>
          </div>
        </form>
      </ModalWrapper>

      {/* Delete Confirmation Alert */}
      {deleteRuleId && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-850 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl text-xs font-semibold">
            <div className="flex items-center gap-2.5 text-rose-500">
              <AlertCircle className="w-5 h-5" />
              <h4 className="font-bold text-sm text-slate-855 dark:text-white">
                {isRtl ? 'تأكيد الحذف' : 'Confirm Policy Deletion'}
              </h4>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
              {isRtl
                ? 'هل أنت متأكد من رغبتك في حذف سياسة اتفاقية مستوى الخدمة هذه بشكل نهائي؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure you want to permanently delete this SLA policy rule? All historical compliance benchmarks will be archived.'}
            </p>
            <div className="flex gap-2 justify-end text-xs font-bold pt-2">
              <button
                onClick={() => setDeleteRuleId(null)}
                className="px-3.5 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl cursor-pointer text-slate-655"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={() => handleDelete(deleteRuleId)}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl cursor-pointer"
              >
                {isRtl ? 'حذف السياسة' : 'Delete Rule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
