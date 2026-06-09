'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Plus, Trash2, ShieldCheck, AlertCircle, Save, GitBranch, ArrowRight, UserCheck, Bell, Sparkles } from 'lucide-react';
import { useFeedbackToasts } from '@/components/customer-portal/feedback/PostChatToasts';
import { ModalWrapper } from '@/components/shared/ModalWrapper';

export interface EscalationRule {
  id: string;
  name: string;
  conditionTimeMins: number;
  conditionPriority: 'any' | 'low' | 'medium' | 'high' | 'urgent';
  conditionCategory: 'any' | 'billing' | 'technical' | 'shipping';
  actionTarget: 'supervisor' | 'tier2' | 'hotline';
  actionNotification: 'alert' | 'webhook' | 'email';
  actionUpgradeSla: boolean;
  active: boolean;
}

interface EscalationMatrixProps {
  lang: 'en' | 'ar';
}

export function EscalationMatrix({ lang }: EscalationMatrixProps) {
  const isRtl = lang === 'ar';
  const { addAuditLog } = useApp();
  const { pushToast } = useFeedbackToasts();

  // Seed data local storage simulation
  const [rules, setRules] = useState<EscalationRule[]>([
    {
      id: 'er-1',
      name: 'Urgent Tech Spillover Guard',
      conditionTimeMins: 15,
      conditionPriority: 'urgent',
      conditionCategory: 'technical',
      actionTarget: 'tier2',
      actionNotification: 'webhook',
      actionUpgradeSla: false,
      active: true
    },
    {
      id: 'er-2',
      name: 'Billing Dispute Timeout',
      conditionTimeMins: 30,
      conditionPriority: 'high',
      conditionCategory: 'billing',
      actionTarget: 'supervisor',
      actionNotification: 'alert',
      actionUpgradeSla: true,
      active: true
    }
  ]);

  // Modal & Edit State
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [timeMins, setTimeMins] = useState(15);
  const [priority, setPriority] = useState<EscalationRule['conditionPriority']>('any');
  const [category, setCategory] = useState<EscalationRule['conditionCategory']>('any');
  const [target, setTarget] = useState<EscalationRule['actionTarget']>('supervisor');
  const [notification, setNotification] = useState<EscalationRule['actionNotification']>('alert');
  const [upgradeSla, setUpgradeSla] = useState(false);
  
  // Validation Errors
  const [errors, setErrors] = useState<string[]>([]);

  const handleOpenAdd = () => {
    setName('');
    setTimeMins(15);
    setPriority('any');
    setCategory('any');
    setTarget('supervisor');
    setNotification('alert');
    setUpgradeSla(false);
    setErrors([]);
    setIsOpen(true);
  };

  const handleToggleActive = (id: string) => {
    setRules(prev => prev.map(r => {
      if (r.id === id) {
        const nextState = !r.active;
        addAuditLog(`${nextState ? 'Enabled' : 'Disabled'} escalation rule: ${r.name}`, 'success');
        pushToast('info', isRtl ? 'تم تحديث القاعدة' : 'Rule State Toggled', isRtl ? `تم تغيير حالة تفعيل قاعدة ${r.name}.` : `Changed active status for rule ${r.name}.`);
        return { ...r, active: nextState };
      }
      return r;
    }));
  };

  const handleDeleteRule = (id: string) => {
    const targetRule = rules.find(r => r.id === id);
    if (!targetRule) return;

    setRules(prev => prev.filter(r => r.id !== id));
    addAuditLog(`Deleted ticket escalation rule: ${targetRule.name}`, 'success');
    pushToast('info', isRtl ? 'تم حذف قاعدة التصعيد' : 'Escalation Rule Deleted', isRtl ? `تم إزالة قاعدة تصعيد التذاكر: ${targetRule.name}` : `Removed ticket escalation rule: ${targetRule.name}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors: string[] = [];

    if (!name.trim()) {
      validationErrors.push(isRtl ? 'اسم القاعدة مطلوب.' : 'Rule name is required.');
    }
    if (timeMins <= 0) {
      validationErrors.push(isRtl ? 'زمن الخرق يجب أن يكون أكبر من 0 دقيقة.' : 'Condition time must be greater than 0 mins.');
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    const newRule: EscalationRule = {
      id: `er-${Date.now()}`,
      name: name.trim(),
      conditionTimeMins: Number(timeMins),
      conditionPriority: priority,
      conditionCategory: category,
      actionTarget: target,
      actionNotification: notification,
      actionUpgradeSla: upgradeSla,
      active: true
    };

    setRules(prev => [...prev, newRule]);
    addAuditLog(`Created escalation matrix rule: ${newRule.name}`, 'success');
    pushToast('success', isRtl ? 'تمت إضافة قاعدة التصعيد' : 'Escalation Rule Added', isRtl ? `تم حفظ قاعدة ${newRule.name} بنجاح.` : `Escalation rule ${newRule.name} was successfully registered.`);
    setIsOpen(false);
  };

  return (
    <div className="space-y-6 text-xs font-semibold text-slate-805 dark:text-slate-205" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-blue-500" />
            <span>{isRtl ? 'مصفوفة قواعد التصعيد التلقائي' : 'SLA Ticket Escalation Matrix'}</span>
          </h3>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-normal mt-1 leading-normal max-w-xl">
            {isRtl 
              ? 'قم بتهيئة مسارات التوجيه وإرسال التنبيهات وترقية أولوية التذكرة تلقائياً عند تجاوز مهلة معينة.'
              : 'Design routing cascades, webhook alerts, and priority upgrade criteria triggered when tickets fail SLA thresholds.'}
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-750 text-white rounded-xl text-[10px] uppercase font-bold transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isRtl ? 'إضافة قاعدة تصعيد' : 'Add Escalation Rule'}</span>
        </button>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`border rounded-3xl p-5 space-y-4 bg-white dark:bg-slate-950 transition-all ${
              rule.active
                ? 'border-slate-200 dark:border-slate-850 shadow-sm'
                : 'border-slate-200/50 dark:border-slate-900 opacity-60'
            }`}
          >
            {/* Header info */}
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-xs">{rule.name}</h4>
                <div className="flex gap-2.5 mt-1 text-[8.5px] uppercase font-mono font-bold">
                  <span className="text-blue-500">ID: {rule.id}</span>
                  <span>•</span>
                  <span className={rule.active ? 'text-emerald-500' : 'text-slate-400'}>
                    {rule.active ? (isRtl ? 'نشط' : 'ACTIVE') : (isRtl ? 'موقف' : 'DISABLED')}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleToggleActive(rule.id)}
                  className={`px-2 py-0.5 rounded text-[8.5px] font-bold uppercase transition-all font-mono border ${
                    rule.active
                      ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 border-slate-200 dark:border-slate-800'
                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  }`}
                >
                  {rule.active ? (isRtl ? 'تعطيل' : 'Disable') : (isRtl ? 'تفعيل' : 'Enable')}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteRule(rule.id)}
                  className="p-1 hover:bg-rose-50 dark:hover:bg-slate-900 text-rose-500 border border-transparent hover:border-rose-200/30 rounded-lg transition-colors cursor-pointer"
                  title="Remove Rule"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Conditions Card Block */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-850/70 space-y-2.5">
              <span className="text-[8.5px] font-bold text-slate-450 uppercase font-mono tracking-wider block">IF (Condition Trigger)</span>
              <div className="grid grid-cols-3 gap-2 text-[10.5px]">
                <div className="space-y-0.5">
                  <span className="text-[8px] text-slate-400 font-mono block">ELAPSED TIME</span>
                  <span className="font-extrabold font-mono text-slate-850 dark:text-white">&gt; {rule.conditionTimeMins} mins</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[8px] text-slate-400 font-mono block">PRIORITY</span>
                  <span className="font-extrabold uppercase text-slate-850 dark:text-white">{rule.conditionPriority}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[8px] text-slate-400 font-mono block">CATEGORY</span>
                  <span className="font-extrabold uppercase text-slate-850 dark:text-white">{rule.conditionCategory}</span>
                </div>
              </div>
            </div>

            {/* Actions Card Block */}
            <div className="bg-blue-50/20 dark:bg-blue-950/10 p-3 border border-blue-500/10 rounded-2xl space-y-2.5">
              <span className="text-[8.5px] font-bold text-blue-500 uppercase font-mono tracking-wider block">THEN (Action outputs)</span>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10.5px]">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="text-slate-450 font-normal">Reassign To:</span>
                  <span className="font-extrabold text-slate-850 dark:text-white uppercase font-mono">
                    {rule.actionTarget === 'supervisor' ? (isRtl ? 'المشرف المباشر' : 'Direct Supervisor') : 
                     rule.actionTarget === 'tier2' ? (isRtl ? 'فريق الدعم الفني 2' : 'Tier 2 Support Pool') : 
                     (isRtl ? 'الخط الساخن' : 'Emergency Hotline')}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[10.5px]">
                  <Bell className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="text-slate-450 font-normal">Notification:</span>
                  <span className="font-extrabold text-slate-850 dark:text-white uppercase font-mono">
                    {rule.actionNotification === 'alert' ? (isRtl ? 'تنبيه نظام مشرف' : 'Supervisor Admin Alert') : 
                     rule.actionNotification === 'webhook' ? (isRtl ? 'بث الويب هوك' : 'Ecosystem Webhook') : 
                     (isRtl ? 'بريد إلكتروني طارئ' : 'Emergency Email Notification')}
                  </span>
                </div>

                {rule.actionUpgradeSla && (
                  <div className="flex items-center gap-2 text-[10.5px] text-amber-600 dark:text-amber-400">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>Auto-upgrade SLA priority to Critical status</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {rules.length === 0 && (
          <div className="col-span-2 py-10 text-center border border-dashed border-slate-205 dark:border-slate-800 rounded-3xl space-y-3 font-semibold text-slate-450">
            <GitBranch className="w-8 h-8 text-slate-300 mx-auto" />
            <p>No SLA escalation matrix rules are configured. Add a rule to start routing spillovers.</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <ModalWrapper
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={isRtl ? 'تكوين قاعدة تصعيد جديدة' : 'Add Auto-Escalation Rule'}
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
            <label htmlFor="rule-name" className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase font-mono tracking-wider">
              Rule Identifier Name
            </label>
            <input
              id="rule-name"
              type="text"
              required
              placeholder={isRtl ? 'مثال: حماية طابور الدعم الفني' : 'e.g. Technical Queue Guard'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-205 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 font-sans text-xs text-slate-855 dark:text-white"
            />
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border border-slate-100 dark:border-slate-850 rounded-2xl space-y-3.5">
            <span className="block text-[9px] font-bold text-slate-450 uppercase font-mono tracking-wider">Trigger Condition Bounds</span>
            
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label htmlFor="rule-time-mins" className="block text-[9px] font-bold text-slate-500 mb-1 font-mono uppercase">SLA Time Elapsed</label>
                <div className="relative">
                  <input
                    id="rule-time-mins"
                    type="number"
                    required
                    min={1}
                    value={timeMins}
                    onChange={(e) => setTimeMins(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 font-mono text-xs text-slate-855 dark:text-white"
                  />
                  <span className="absolute right-3.5 top-2 text-[9px] text-slate-400 font-mono">MINS</span>
                </div>
              </div>

              <div>
                <label htmlFor="rule-priority-level" className="block text-[9px] font-bold text-slate-500 mb-1 font-mono uppercase">Ticket Priority</label>
                <select
                  id="rule-priority-level"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none font-sans text-xs text-slate-855 dark:text-white font-bold"
                >
                  <option value="any">Any Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="rule-category" className="block text-[9px] font-bold text-slate-500 mb-1 font-mono uppercase">Intended Category</label>
              <select
                id="rule-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none font-sans text-xs text-slate-855 dark:text-white font-bold"
              >
                <option value="any">Any Category</option>
                <option value="billing">Billing & Payments</option>
                <option value="technical">Technical Issue</option>
                <option value="shipping">Shipping & Orders</option>
              </select>
            </div>
          </div>

          <div className="bg-blue-500/5 dark:bg-blue-950/10 p-4 border border-blue-550/10 rounded-2xl space-y-3.5">
            <span className="block text-[9px] font-bold text-blue-500 uppercase font-mono tracking-wider">Automated Action Output</span>
            
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label htmlFor="rule-action-target" className="block text-[9px] font-bold text-slate-500 mb-1 font-mono uppercase">Reassign Target</label>
                <select
                  id="rule-action-target"
                  value={target}
                  onChange={(e) => setTarget(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none font-sans text-xs text-slate-855 dark:text-white font-bold"
                >
                  <option value="supervisor">Supervisor Consult</option>
                  <option value="tier2">Tier 2 Support Pool</option>
                  <option value="hotline">Emergency Hotline</option>
                </select>
              </div>

              <div>
                <label htmlFor="rule-action-notification" className="block text-[9px] font-bold text-slate-500 mb-1 font-mono uppercase">Notification</label>
                <select
                  id="rule-action-notification"
                  value={notification}
                  onChange={(e) => setNotification(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none font-sans text-xs text-slate-855 dark:text-white font-bold"
                >
                  <option value="alert">Supervisor Admin Alert</option>
                  <option value="webhook">REST Webhook Broadcast</option>
                  <option value="email">Emergency Email SMTP</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between py-1 pt-1.5">
              <div>
                <h5 className="text-[10px] font-bold text-slate-855 dark:text-slate-100">{isRtl ? 'ترقية التذكرة لـ حرجة' : 'Upgrade SLA Priority'}</h5>
                <span className="text-[8.5px] font-normal text-slate-400 block mt-0.5">Forces ticket priority level to critical status automatically.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  aria-label="Upgrade SLA Priority"
                  checked={upgradeSla}
                  onChange={(e) => setUpgradeSla(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-7 h-4 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-3 rtl:peer-checked:after:-translate-x-3 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-400 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white" />
              </label>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 text-xs font-bold">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 border border-slate-205 dark:border-slate-850 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer text-slate-655"
            >
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-650 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isRtl ? 'حفظ القاعدة' : 'Save Escalation Rule'}</span>
            </button>
          </div>
        </form>
      </ModalWrapper>
    </div>
  );
}
