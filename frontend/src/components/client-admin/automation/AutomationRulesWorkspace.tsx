'use client';

import React, { useState, useEffect } from 'react';
import { 
  Zap, ArrowRight, ShieldCheck, Mail, Play, Trash2, Plus, Sliders, ToggleLeft, ToggleRight, Eye, Activity, Search, RefreshCw 
} from 'lucide-react';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { OperationalCard } from '@/components/shared/OperationalCard';
import { Badge } from '@/components/shared/BadgeSystem';
import { EnterpriseTable } from '@/components/shared/EnterpriseTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { OperationalActivityFeed } from '@/components/client-admin/shared/OperationalActivityFeed';
import { useClientAdminStore, AutomationRule, AutomationLog } from '@/stores/clientAdminPersistenceStore';
import { useNotificationsStore } from '@/stores/notificationsStore';

export function AutomationRulesWorkspace() {
  const rules = useClientAdminStore((state) => state.rules);
  const automationLogs = useClientAdminStore((state) => state.automationLogs);
  
  const addAutomationRule = useClientAdminStore((state) => state.addAutomationRule);
  const toggleAutomationRule = useClientAdminStore((state) => state.toggleAutomationRule);
  const deleteAutomationRule = useClientAdminStore((state) => state.deleteAutomationRule);
  const triggerAutomationLog = useClientAdminStore((state) => state.triggerAutomationLog);
  const incrementAutomationTrigger = useClientAdminStore((state) => state.incrementAutomationTrigger);
  const clearRules = useClientAdminStore((state) => state.clearRules);
  const lang = useClientAdminStore((state) => state.settings.defaultLang);

  const isAr = lang === 'ar';

  // Component hydration guard
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Form builder inputs
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleTrigger, setNewRuleTrigger] = useState('Customer Sent Message');
  const [newRuleAction, setNewRuleAction] = useState('Escalate to Live Agent');
  const [newRuleCategory, setNewRuleCategory] = useState<'security' | 'routing' | 'billing' | 'system'>('system');
  const [newRuleSeverity, setNewRuleSeverity] = useState<'info' | 'warning' | 'critical'>('info');

  // Search & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  // Simulator states
  const [selectedSimRuleId, setSelectedSimRuleId] = useState<string>('');
  const [simRunning, setSimRunning] = useState(false);
  const [simSteps, setSimSteps] = useState<string[]>([]);

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim()) return;

    const newRule: AutomationRule = {
      id: `rule-${Date.now()}`,
      name: newRuleName.trim(),
      triggerEvent: newRuleTrigger,
      triggerEventAr: isAr ? 'حدث تفعيل مخصص' : newRuleTrigger,
      conditions: 'Always evaluated',
      conditionsAr: 'يتم فحصها دائماً',
      action: newRuleAction,
      actionAr: isAr ? 'اتخاذ الإجراء التشغيلي المبرمج' : newRuleAction,
      enabled: true,
      category: newRuleCategory,
      severity: newRuleSeverity,
      triggerCount: 0,
      lastExecuted: null
    };

    addAutomationRule(newRule);
    setNewRuleName('');
    
    useNotificationsStore.getState().addAlert({
      category: 'operations',
      source: 'guardrails',
      severity: 'success',
      alertCode: 'RULE_CREATED',
      sourceEntity: newRule.name,
      title: isAr ? 'تم حفظ قاعدة الأتمتة' : 'Automation Rule Created',
      message: isAr 
        ? `تم بنجاح حفظ وتفعيل قاعدة "${newRule.name}" في مصفوفة النظام.` 
        : `Successfully registered rule "${newRule.name}" to triggers list.`,
      metadata: { ruleId: newRule.id }
    });
  };

  const handleFireSimRule = () => {
    const targetRule = rules.find(r => r.id === selectedSimRuleId);
    if (!targetRule) return;

    setSimRunning(true);
    setSimSteps([isAr ? `تنبيه: تم التقاط إشارة الزناد: ${targetRule.triggerEvent}` : `System trigger intercepted: ${targetRule.triggerEvent}`]);

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const stages = [
      isAr ? `مقارنة الشروط: "${targetRule.conditions}"` : `Evaluating rule condition checks: "${targetRule.conditions}"`,
      isAr ? 'الشروط متطابقة ➔ تحضير الإجراء' : 'Validation PASSED ➔ queueing target action pipeline',
      isAr ? `تم تنفيذ الإجراء: ${targetRule.action}` : `Enforcing action handler: ${targetRule.action}`
    ];

    stages.forEach((step, idx) => {
      setTimeout(() => {
        setSimSteps(prev => [...prev, step]);

        if (idx === stages.length - 1) {
          setSimRunning(false);
          incrementAutomationTrigger(targetRule.id, timestamp.substring(0, 16));
          
          // Log automation event
          const newLog: AutomationLog = {
            id: `autolog-${Date.now()}`,
            timestamp,
            ruleName: targetRule.name,
            eventTriggered: targetRule.triggerEvent,
            status: 'success',
            details: `Successfully evaluated conditions: "${targetRule.conditions}" and executed action: "${targetRule.action}"`
          };
          triggerAutomationLog(newLog);

          useNotificationsStore.getState().addAlert({
            category: 'ai',
            source: 'guardrails',
            severity: targetRule.severity,
            alertCode: 'RULE_FIRED',
            sourceEntity: targetRule.name,
            title: isAr ? 'تنبيه أتمتة مستخدم' : 'Automation Rule Triggered',
            message: isAr 
              ? `تم بنجاح تنفيذ قاعدة أتمتة "${targetRule.name}".` 
              : `Automation rule "${targetRule.name}" executed successfully.`,
            metadata: { ruleId: targetRule.id }
          });
        }
      }, (idx + 1) * 1000);
    });
  };

  const handleToggleRule = (id: string) => {
    toggleAutomationRule(id);
  };

  const handleDeleteRule = (id: string) => {
    deleteAutomationRule(id);
  };

  if (!isMounted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500 animate-pulse">
        <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-3" />
        <span className="text-xs font-semibold uppercase">Loading Automation...</span>
      </div>
    );
  }

  // Filters logic
  const filteredRules = rules.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = filterCategory === 'all' || r.category === filterCategory;
    const matchSev = filterSeverity === 'all' || r.severity === filterSeverity;
    return matchSearch && matchCat && matchSev;
  });

  const activeRulesCount = rules.filter(r => r.enabled).length;

  return (
    <div className="space-y-6 animate-fade-in" dir={isAr ? 'rtl' : 'ltr'}>
      <SectionHeader
        title={isAr ? 'قواعد الأتمتة والزناد' : 'Workflow Automation Rules'}
        description={isAr ? 'برمجة ردود أفعال النظام التلقائية بناءً على أحداث المحادثات، وتصنيف العملاء، ونتائج الأمان.' : 'Define event-driven logic rules, automatic client escalations, and system safety responses.'}
      />

      {/* Metrics board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <OperationalCard className="p-4 flex items-center justify-between border-l-4 border-blue-500">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              {isAr ? 'القواعد النشطة' : 'Active Rules'}
            </span>
            <span className="text-xl font-bold text-slate-800 dark:text-white font-mono">
              {activeRulesCount} / {rules.length}
            </span>
          </div>
          <Zap className="w-5 h-5 text-blue-600" />
        </OperationalCard>

        <OperationalCard className="p-4 flex items-center justify-between border-l-4 border-indigo-500">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              {isAr ? 'إجمالي مرات التفعيل' : 'Total Evaluated Rules'}
            </span>
            <span className="text-xl font-bold text-slate-800 dark:text-white font-mono">
              {rules.reduce((acc, r) => acc + r.triggerCount, 0).toLocaleString()}
            </span>
          </div>
          <Activity className="w-5 h-5 text-indigo-600" />
        </OperationalCard>

        <OperationalCard className="p-4 flex items-center justify-between border-l-4 border-emerald-500">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              {isAr ? 'نسبة الدقة والنجاح' : 'Automation Efficiency'}
            </span>
            <span className="text-xl font-bold text-emerald-500 dark:text-emerald-400 font-mono">
              98.7%
            </span>
          </div>
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
        </OperationalCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main automation board */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
              <div className="relative flex-1">
                <Search className={`w-4 h-4 text-slate-450 absolute top-2.5 ${isAr ? 'right-3' : 'left-3'}`} />
                <input
                  type="text"
                  placeholder={isAr ? 'البحث عن طريق اسم القاعدة...' : 'Search automation rules...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 ${
                    isAr ? 'pr-9 pl-4' : 'pl-9 pr-4'
                  } text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100`}
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-250 focus:outline-none"
                >
                  <option value="all">{isAr ? 'جميع الفئات' : 'All Categories'}</option>
                  <option value="security">{isAr ? 'أمن' : 'Security'}</option>
                  <option value="routing">{isAr ? 'توجيه' : 'Routing'}</option>
                  <option value="billing">{isAr ? 'فوترة' : 'Billing'}</option>
                  <option value="system">{isAr ? 'نظام' : 'System'}</option>
                </select>

                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-250 focus:outline-none"
                >
                  <option value="all">{isAr ? 'جميع المستويات' : 'All Severities'}</option>
                  <option value="info">{isAr ? 'معلومات' : 'Info'}</option>
                  <option value="warning">{isAr ? 'تنبيه' : 'Warning'}</option>
                  <option value="critical">{isAr ? 'حرج' : 'Critical'}</option>
                </select>

                {rules.length > 0 && (
                  <button
                    onClick={clearRules}
                    className="text-xs font-bold text-red-500 border border-red-500/20 hover:bg-red-500/5 rounded-xl px-3 py-2 cursor-pointer transition-all"
                  >
                    {isAr ? 'حذف الكل' : 'Clear All'}
                  </button>
                )}
              </div>
            </div>

            <EnterpriseTable
              headers={[
                isAr ? 'اسم القاعدة' : 'Rule Name',
                isAr ? 'الحدث المفعل' : 'Trigger Event',
                isAr ? 'الإجراء التشغيلي' : 'Action Target',
                isAr ? 'النشاط / التفعيل' : 'Evaluations',
                isAr ? 'الحالة' : 'Status',
                isAr ? 'إجراء' : 'Actions'
              ]}
              empty={filteredRules.length === 0}
              emptyTitle={isAr ? 'لا توجد قواعد أتمتة' : 'No Automation Rules Defined'}
              emptyDesc={isAr ? 'لم نجد أي قاعدة تطابق مدخلات الفلترة المعطاة.' : 'Fill the sidebar rule creator or adjust filters to search trigger rules.'}
            >
              {filteredRules.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors text-xs font-semibold">
                  <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">
                    <div className="space-y-0.5">
                      <span>{r.name}</span>
                      <div className="flex gap-2 text-[9px] font-bold font-mono uppercase">
                        <span className="text-slate-400">{r.category}</span>
                        <span className="text-slate-300">•</span>
                        <span className={r.severity === 'critical' ? 'text-red-500 animate-pulse' : r.severity === 'warning' ? 'text-amber-500' : 'text-blue-500'}>
                          {r.severity}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-[10px] text-slate-550 dark:text-slate-400 font-semibold max-w-[120px] truncate">
                    {isAr ? r.triggerEventAr : r.triggerEvent}
                  </td>
                  <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400 max-w-[150px] truncate">
                    {isAr ? r.actionAr : r.action}
                  </td>
                  <td className="px-6 py-4 font-mono text-[10px] text-slate-500">
                    <div className="space-y-0.5">
                      <span>{r.triggerCount} runs</span>
                      <span className="block text-[8.5px] text-slate-400 italic">
                        {r.lastExecuted ? `Last: ${r.lastExecuted}` : 'Never run'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleRule(r.id)}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-850 rounded transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      title={r.enabled ? 'Disable' : 'Enable'}
                    >
                      {r.enabled ? (
                        <ToggleRight className="w-6 h-6 text-blue-600" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-slate-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDeleteRule(r.id)}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-red-500 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </EnterpriseTable>
          </div>

          {/* Expandable execution logs */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold font-mono uppercase text-slate-450 dark:text-slate-500 tracking-wider">
              {isAr ? 'سجل العمليات الأوتوماتيكية والتفعيل' : 'Automation Rules Execution Logs'}
            </h4>
            {automationLogs.length === 0 ? (
              <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-slate-400 text-xs text-center">
                {isAr ? 'لا توجد تفعيلات مسجلة بعد. قم بتشغيل المحاكي في الشريط الجانبي.' : 'No evaluations logged yet. Use the Simulator to fire events.'}
              </div>
            ) : (
              <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-850 max-h-48 overflow-y-auto">
                {automationLogs.map((log) => (
                  <div key={log.id} className="p-3 text-[10px] flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-all">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{log.ruleName}</span>
                        <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 px-1.5 py-0.5 rounded font-mono font-bold uppercase">{log.eventTriggered}</span>
                      </div>
                      <p className="text-[9.5px] text-slate-500 font-semibold">{log.details}</p>
                    </div>
                    <span className="font-mono text-[9px] text-slate-400 whitespace-nowrap">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Rule Builder & Rule Simulator sidebars */}
        <div className="space-y-6">
          {/* Rule simulator panel */}
          {rules.length > 0 && (
            <OperationalCard className="p-5 space-y-4">
              <div>
                <h3 className="font-bold text-xs text-slate-800 dark:text-white flex items-center gap-1.5 uppercase font-sans">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <span>{isAr ? 'محاكي أحداث الأتمتة' : 'Automation Event Simulator'}</span>
                </h3>
                <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-1 block">
                  {isAr ? 'تفعيل حدث وهمي لاختبار أداء القواعد وسجل العمليات.' : 'Dispatch a test trigger event to execute automation checks.'}
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500">{isAr ? 'اختر قاعدة الأتمتة للتجربة:' : 'Select Target Rule:'}</label>
                  <select
                    value={selectedSimRuleId}
                    onChange={(e) => setSelectedSimRuleId(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-700 dark:text-slate-350 focus:outline-none"
                  >
                    <option value="">-- Choose Rule --</option>
                    {rules.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  disabled={!selectedSimRuleId || simRunning}
                  onClick={handleFireSimRule}
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/10 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  {simRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{simRunning ? (isAr ? 'جاري الفحص...' : 'Evaluating...') : (isAr ? 'إطلاق حدث الاختبار' : 'Fire Test Event')}</span>
                </button>

                {simSteps.length > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 p-2.5 rounded-xl max-h-36 overflow-y-auto space-y-1 font-mono text-[9px] text-slate-700 dark:text-slate-350 leading-relaxed">
                    {simSteps.map((step, idx) => (
                      <div key={idx} className={idx === simSteps.length - 1 && simRunning ? 'text-amber-600 dark:text-amber-400 animate-pulse font-bold' : ''}>
                        {step}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </OperationalCard>
          )}

          {/* Rule Builder panel */}
          <OperationalCard className="p-5 space-y-4">
            <div>
              <h3 className="font-bold text-xs text-slate-800 dark:text-white flex items-center gap-1.5 uppercase font-sans">
                <Sliders className="w-4 h-4 text-blue-500" />
                <span>{isAr ? 'منشئ القواعد السريع' : 'Quick Rule Builder'}</span>
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                {isAr ? 'إنشاء قاعدة شرطية جديدة بنقرة واحدة للتحقق.' : 'Register simple trigger-action rules for active system events.'}
              </p>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">{isAr ? 'اسم القاعدة:' : 'Rule Name:'}</label>
                <input
                  type="text"
                  placeholder={isAr ? 'مثال: إرسال بريد إلكتروني ترحيبي' : 'e.g. Outage SMS Alert'}
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500">{isAr ? 'الفئة:' : 'Category:'}</label>
                  <select
                    value={newRuleCategory}
                    onChange={(e) => setNewRuleCategory(e.target.value as any)}
                    className="w-full bg-white dark:bg-slate-905 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-2 text-[10px] text-slate-700 dark:text-slate-300 focus:outline-none"
                  >
                    <option value="system">System</option>
                    <option value="security">Security</option>
                    <option value="routing">Routing</option>
                    <option value="billing">Billing</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500">{isAr ? 'الخطورة:' : 'Severity:'}</label>
                  <select
                    value={newRuleSeverity}
                    onChange={(e) => setNewRuleSeverity(e.target.value as any)}
                    className="w-full bg-white dark:bg-slate-905 border border-slate-205 dark:border-slate-805 rounded-xl px-2 py-2 text-[10px] text-slate-700 dark:text-slate-350 focus:outline-none"
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">{isAr ? 'الحدث المشغل (الزناد):' : 'Triggering Event:'}</label>
                <select
                  value={newRuleTrigger}
                  onChange={(e) => setNewRuleTrigger(e.target.value)}
                  className="w-full bg-white dark:bg-slate-905 border border-slate-205 dark:border-slate-805 rounded-xl px-2.5 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Customer Sent Message">Customer Sent Message</option>
                  <option value="Toxicity Score Detected">Toxicity Score Detected</option>
                  <option value="SLA Threshold Breached">SLA Threshold Breached</option>
                  <option value="API Latency High">API Latency High</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">{isAr ? 'الإجراء التشغيلي المطبق:' : 'Enforced Action:'}</label>
                <select
                  value={newRuleAction}
                  onChange={(e) => setNewRuleAction(e.target.value)}
                  className="w-full bg-white dark:bg-slate-905 border border-slate-205 dark:border-slate-805 rounded-xl px-2.5 py-2 text-xs text-slate-700 dark:text-slate-305 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Escalate to Live Agent">Escalate to Live Agent</option>
                  <option value="Redact Payload PII">Redact Payload PII</option>
                  <option value="Send Outbound Email Alert">Send Outbound Email Alert</option>
                  <option value="Close Active Chat Session">Close Active Chat Session</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow shadow-blue-500/10 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAr ? 'إدراج قاعدة الأتمتة' : 'Add Automation Rule'}</span>
              </button>
            </form>
          </OperationalCard>

          <div className="space-y-3">
            <h4 className="text-[11px] font-bold font-mono uppercase text-slate-450 dark:text-slate-500 tracking-wider">
              {isAr ? 'سجل العمليات والتدقيق التلقائي' : 'Automation Rule Log Feed'}
            </h4>
            <OperationalActivityFeed filterScope="guardrails" limit={5} />
          </div>
        </div>
      </div>
    </div>
  );
}
export default AutomationRulesWorkspace;
