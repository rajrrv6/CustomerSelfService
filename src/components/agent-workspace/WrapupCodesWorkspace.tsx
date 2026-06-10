'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, ShieldCheck, ShieldAlert, BarChart2, CheckCircle2, 
  ChevronRight, X, Clock, HelpCircle, Activity, FileText, 
  Download, Calendar, Search, Filter, AlertTriangle, ArrowRight, 
  RefreshCw, CheckCircle, Info, BookOpen, AlertCircle, ClipboardCheck
} from 'lucide-react';
import { useConversationStore } from '@/stores/conversationStore';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';
import { ModalWrapper } from '../shared/ModalWrapper';
import { DrawerWrapper } from '../shared/DrawerWrapper';
import { WrapupRecommendation } from '@/utils/copilotEngine';

// Default mock registry codes
const DEFAULT_DISPOSITIONS = [
  { code: 'SAP-CRM-101', category: 'Billing Mismatch', severity: 'low', slaAction: 'Auto-Credit', status: 'active', desc: 'Resolved discrepant subscription totals by issuing client-level accounting credit.' },
  { code: 'SAP-CRM-204', category: 'SIP Trunk Dropout', severity: 'critical', slaAction: 'Escalate to Telecom', status: 'active', desc: 'Telephony carrier disconnect. Requires network engineering intervention.' },
  { code: 'SAP-CRM-305', category: 'Vector Compaction Lockout', severity: 'high', slaAction: 'Trigger compaction', status: 'active', desc: 'RAG Pinecone index lock. Requires running index defragmentation.' },
  { code: 'SAP-CRM-401', category: 'Authentication Mismatch', severity: 'medium', slaAction: 'Regenerate token', status: 'active', desc: 'OAuth handshake failure. Client redirected to auth re-verify portal.' },
  { code: 'SAP-CRM-502', category: 'SLA Escalation Breach', severity: 'critical', slaAction: 'Escalate to Manager', status: 'active', desc: 'Queue processing limit breached. Force-assigned to next available supervisor.' },
  { code: 'SAP-CRM-609', category: 'General Inquiry', severity: 'low', slaAction: 'Attach KB Article', status: 'active', desc: 'Standard support informational request resolved with self-service references.' },
  { code: 'SAP-CRM-701', category: 'RTL Layout Bug', severity: 'medium', slaAction: 'Escalate to Frontend Team', status: 'disabled', desc: 'Arabic text mirroring display issue logged for development sprint.' }
];

export function WrapupCodesWorkspace() {
  const { lang, addAuditLog } = useApp();
  const t = translations[lang];
  const isRtl = lang === 'ar';

  const store = useConversationStore();
  const activeConversationId = store.activeConversationId || 'conv-102';

  // State bindings from Zustand store
  const workflow = store.resolutionWorkflows[activeConversationId] || {
    notes: '',
    summary: '',
    explanation: '',
    checklist: { customerVerified: false, complianceReviewed: false, refundConfirmed: false, supervisorApproved: false, kbAttached: false },
    state: 'Pending'
  };

  const compliance = store.complianceValidation[activeConversationId] || {
    pciStatus: 'passed',
    slaBreachWarning: false,
    escalationWarning: false,
    missingFields: ['Resolution Notes', 'Resolution Explanation', 'Customer Verification', 'Compliance Review'],
    validationStatus: 'failed'
  };

  const analytics = store.wrapupAnalytics[activeConversationId] || {
    avgResolutionTime: '4m 12s',
    resolutionConfidence: 94,
    escalationProbability: 12,
    slaCompliance: 98,
    repeatContactRisk: 4
  };

  const auditLogs = store.wrapupAuditEvents[activeConversationId] || [];

  // Local state controls
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [selectedRowCode, setSelectedRowCode] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  
  // Timer Simulation States
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isApplyingAI, setIsApplyingAI] = useState(false);

  // References for unmount timers cleanup
  const summaryTimerRef = useRef<NodeJS.Timeout | null>(null);
  const applyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Run initial compliance check on mount
    store.validateCompliance(activeConversationId);
    return () => {
      // Cleanup all simulation timers to prevent window teardown errors
      if (summaryTimerRef.current) clearTimeout(summaryTimerRef.current);
      if (applyTimerRef.current) clearTimeout(applyTimerRef.current);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [activeConversationId]);

  const showLocalToast = (msg: string) => {
    setToastMessage(msg);
    setAnnouncement(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // 1. Actions Panel handlers
  const handleApplyAIRecommendation = () => {
    if (isApplyingAI) return;
    setIsApplyingAI(true);
    showLocalToast(isRtl ? 'جاري تطبيق توصية الذكاء الاصطناعي...' : 'Applying AI Disposition Code recommendation...');

    const applyAction = () => {
      const rec: WrapupRecommendation = {
        code: 'SAP-CRM-305',
        category: 'Vector Compaction Lockout',
        summary: 'Repeated billing dispute + negative customer sentiment. RAG compaction lockout requires running defragmentation.',
        confidence: 94
      };
      store.applyWrapupRecommendation(activeConversationId, rec);
      setIsApplyingAI(false);
      showLocalToast(isRtl ? 'تم تطبيق التوصية بنجاح!' : 'AI recommended code SAP-CRM-305 applied successfully.');
    };

    if (process.env.NODE_ENV === 'test') {
      applyAction();
    } else {
      applyTimerRef.current = setTimeout(applyAction, 700);
    }
  };

  const handleGenerateSummary = () => {
    if (isSummarizing) return;
    setIsSummarizing(true);
    showLocalToast(isRtl ? 'جاري توليد ملخص الحالة...' : 'Generating resolution summary with AI...');

    const generateAction = () => {
      store.generateResolutionSummary(activeConversationId);
      setIsSummarizing(false);
      showLocalToast(isRtl ? 'تم توليد الملخص بنجاح!' : 'AI Resolution Summary generated.');
    };

    if (process.env.NODE_ENV === 'test') {
      generateAction();
    } else {
      summaryTimerRef.current = setTimeout(generateAction, 850);
    }
  };

  const handleEscalateToSupervisor = () => {
    store.updateResolutionWorkflow(activeConversationId, { state: 'Escalated' });
    store.appendWrapupAuditEvent(activeConversationId, 'Case status escalated to Supervisor queue.');
    showLocalToast(isRtl ? 'تم تصعيد الحالة للمشرف.' : 'Case escalated to Supervisor queue.');
  };

  const handleLaunchCallback = () => {
    store.updateResolutionWorkflow(activeConversationId, { state: 'Requires Callback' });
    store.appendWrapupAuditEvent(activeConversationId, 'Outbound callback scheduled.');
    showLocalToast(isRtl ? 'تم جدولة إعادة الاتصال للعميل.' : 'Outbound callback workflow scheduled.');
  };

  const handleSendConfirmation = () => {
    if (compliance.validationStatus === 'failed') {
      showLocalToast(isRtl ? 'خطأ: لا يمكن إرسال التأكيد. يرجى مراجعة شروط الامتثال.' : 'Error: Cannot send confirmation. Compliance check failed.');
      return;
    }
    store.updateResolutionWorkflow(activeConversationId, { state: 'Resolved' });
    store.appendWrapupAuditEvent(activeConversationId, 'Resolution confirmation email dispatched to customer.');
    showLocalToast(isRtl ? 'تم إرسال تأكيد الحل بنجاح.' : 'Resolution confirmation email sent to customer.');
  };

  // 2. Interactive Form actions
  const handleChecklistChange = (key: keyof typeof workflow.checklist, val: boolean) => {
    const updatedChecklist = { ...workflow.checklist, [key]: val };
    store.updateResolutionWorkflow(activeConversationId, { checklist: updatedChecklist });
  };

  const handleNotesChange = (val: string) => {
    store.updateResolutionWorkflow(activeConversationId, { notes: val });
  };

  const handleExplanationChange = (val: string) => {
    store.updateResolutionWorkflow(activeConversationId, { explanation: val });
  };

  const handleStateChange = (val: typeof workflow.state) => {
    store.updateResolutionWorkflow(activeConversationId, { state: val });
    store.appendWrapupAuditEvent(activeConversationId, `Resolution state changed to: ${val}`);
  };

  // Filters mapping
  const filteredDispositions = DEFAULT_DISPOSITIONS.filter(d => {
    const matchesSearch = d.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.desc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || d.category === categoryFilter;
    const matchesSeverity = severityFilter === 'all' || d.severity === severityFilter;
    return matchesSearch && matchesCategory && matchesSeverity;
  });

  const selectedRowDetails = DEFAULT_DISPOSITIONS.find(d => d.code === selectedRowCode) || null;

  return (
    <div className="space-y-6 text-xs font-semibold text-slate-800 dark:text-slate-200 animate-in fade-in-50 duration-200 max-w-7xl mx-auto pb-10" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Screen Reader Live Announcer */}
      <div className="sr-only" aria-live="polite">{announcement}</div>

      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-blue-500" />
            {isRtl ? 'لوحة إنهاء وإغلاق الحالات الذكية' : 'SAP CRM Wrap-up & Dispositions Console'}
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            {isRtl ? 'تحديد رموز إنهاء الحالات والامتثال لخدمة العملاء' : 'Configure CRM disposition codes, validate PCI compliance, and audit resolution state.'}
          </p>
        </div>

        {/* SLA Status Indicator */}
        <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2 ${
          compliance.slaBreachWarning 
            ? 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400' 
            : 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400'
        }`}>
          <Clock className="w-4 h-4 shrink-0" />
          <span className="font-extrabold font-mono text-[10px]">
            {compliance.slaBreachWarning 
              ? (isRtl ? 'تحذير: تم خرق اتفاقية الخدمة' : 'SLA STATUS: BREACHED') 
              : (isRtl ? 'اتفاقية الخدمة: ضمن النطاق' : 'SLA STATUS: WITHIN TARGET')}
          </span>
        </div>
      </div>

      {/* 2. Wrap-up Analytics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 select-none">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-xs space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">{isRtl ? 'متوسط وقت الحل' : 'Avg Resolution Time'}</span>
          <strong className="text-lg text-slate-900 dark:text-white font-extrabold">{analytics.avgResolutionTime}</strong>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-xs space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">{isRtl ? 'ثقة الحل بالذكاء' : 'AI Confidence'}</span>
          <strong className="text-lg text-emerald-600 dark:text-emerald-400 font-extrabold">{analytics.resolutionConfidence}%</strong>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-xs space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">{isRtl ? 'احتمالية التصعيد' : 'Escalation Prob'}</span>
          <strong className="text-lg text-amber-600 dark:text-amber-400 font-extrabold">{analytics.escalationProbability}%</strong>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-xs space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">{isRtl ? 'الالتزام باتفاقية الخدمة' : 'SLA Compliance'}</span>
          <strong className="text-lg text-blue-600 dark:text-blue-400 font-extrabold">{analytics.slaCompliance}%</strong>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-xs space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">{isRtl ? 'خطر تكرار الاتصال' : 'Repeat Contact Risk'}</span>
          <strong className="text-lg text-rose-600 dark:text-rose-400 font-extrabold">{analytics.repeatContactRisk}%</strong>
        </div>
      </div>

      {/* 3. AI Resolution Assistant Panel */}
      <div className="bg-gradient-to-r from-blue-500/5 to-indigo-500/5 dark:from-blue-950/10 dark:to-indigo-950/10 border border-blue-200/55 dark:border-blue-900/35 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4.5 h-4.5 text-blue-500 shrink-0" />
            <h3 className="font-extrabold text-slate-900 dark:text-white">{isRtl ? 'مساعد الحل الذكي (الذكاء الاصطناعي)' : 'AI Resolution & Disposition Assistant'}</h3>
          </div>
          <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 rounded-lg text-[9px] font-bold font-mono">
            {isRtl ? 'توصية نشطة' : 'ACTIVE RECOMMENDATION'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-start leading-normal">
          <div className="bg-white dark:bg-slate-950 p-3 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-1">
            <span className="text-[9px] text-slate-400 block uppercase font-mono">{isRtl ? 'رمز التوصية المقترح' : 'Recommended Code'}</span>
            <strong className="font-mono text-xs text-blue-600 dark:text-blue-400 font-extrabold block">SAP-CRM-305</strong>
            <span className="text-[10px] text-slate-500 block">Vector Compaction Lockout</span>
          </div>

          <div className="bg-white dark:bg-slate-950 p-3 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-1">
            <span className="text-[9px] text-slate-400 block uppercase font-mono">{isRtl ? 'ثقة التوصية' : 'AI Confidence & Reason'}</span>
            <div className="flex items-center gap-1.5">
              <strong className="text-emerald-600 dark:text-emerald-400 font-bold">94%</strong>
              <span className="text-slate-400 font-bold">•</span>
              <span className="text-[10px] text-slate-500">{isRtl ? 'تكرار نزاع الفواتير' : 'Billing dispute matched with negative sentiment'}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-950 p-3 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-1">
            <span className="text-[9px] text-slate-400 block uppercase font-mono">{isRtl ? 'مخاطر الخروج والامتثال' : 'Compliance Route'}</span>
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-rose-50 border border-rose-100 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400 font-mono font-bold">HIGH RISK</span>
              <span className="text-[10px] text-slate-500">{isRtl ? 'إجراء: جدولة إعادة الفهرسة' : 'Action: Trigger Compaction'}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1.5">
          <button
            type="button"
            onClick={handleApplyAIRecommendation}
            disabled={isApplyingAI}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 transition-all cursor-pointer shadow-md shadow-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isApplyingAI ? (isRtl ? 'جاري التطبيق...' : 'Applying...') : (isRtl ? 'تطبيق التوصية المقترحة' : 'Apply AI Recommendation')}
          </button>
        </div>
      </div>

      {/* 4. Split-Zone Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Case resolution workspace (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Active Case Resolution Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
              <h3 className="font-extrabold text-slate-900 dark:text-white uppercase font-mono tracking-wider">
                {isRtl ? 'مساحة عمل حل القضية' : 'Case Resolution Workspace'}
              </h3>
              
              <div className="flex items-center gap-2 font-mono text-[10px]">
                <span className="text-slate-400">{isRtl ? 'الحالة الحالية:' : 'Current State:'}</span>
                <select
                  value={workflow.state}
                  onChange={(e) => handleStateChange(e.target.value as any)}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-0.5 font-bold cursor-pointer"
                >
                  <option value="Pending">{isRtl ? 'معلق' : 'Pending'}</option>
                  <option value="Resolved">{isRtl ? 'محلول' : 'Resolved'}</option>
                  <option value="Escalated">{isRtl ? 'تم التصعيد' : 'Escalated'}</option>
                  <option value="Requires Callback">{isRtl ? 'مطلوب اتصال' : 'Requires Callback'}</option>
                </select>
              </div>
            </div>

            {/* Resolution Notes Textarea */}
            <div className="space-y-1.5 text-start">
              <label htmlFor="resolution-notes-area" className="block text-[10px] font-bold text-slate-455 uppercase font-mono">
                {isRtl ? 'ملاحظات الإغلاق والحل (قاعدة المعرفة)' : 'Internal Wrap-up Notes'}
              </label>
              <textarea
                id="resolution-notes-area"
                rows={3}
                placeholder={isRtl ? 'أدخل ملاحظات تفصيلية لتوثيق الحل...' : 'Enter internal case summaries or diagnostic findings...'}
                value={workflow.notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent dark:bg-slate-950/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none font-medium leading-relaxed"
              />
              <div className="flex justify-between items-center text-[9px] text-slate-400">
                <span>{isRtl ? 'الأحرف المكتوبة: ' : 'Length: '}{workflow.notes.length}</span>
                <button
                  type="button"
                  onClick={handleGenerateSummary}
                  disabled={isSummarizing}
                  className="text-blue-500 hover:text-blue-600 font-bold flex items-center gap-1 cursor-pointer focus:outline-none"
                >
                  <Sparkles className="w-3 h-3" />
                  {isSummarizing ? (isRtl ? 'جاري التوليد...' : 'Generating...') : (isRtl ? 'توليد ملخص تلقائي' : 'Generate AI Summary')}
                </button>
              </div>
            </div>

            {/* AI Generated Summary Display */}
            {workflow.summary && (
              <div className="bg-slate-50 dark:bg-slate-950 p-3.5 border border-slate-200 dark:border-slate-850 rounded-2xl text-start leading-relaxed animate-in slide-in-from-top-1 duration-200">
                <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 block uppercase font-mono mb-1">
                  ✨ AI Resolution Summary
                </span>
                <p className="font-mono text-[10.5px] italic text-slate-655 dark:text-slate-400">
                  {workflow.summary}
                </p>
              </div>
            )}

            {/* Resolution Explanation */}
            <div className="space-y-1.5 text-start">
              <label htmlFor="resolution-explanation-area" className="block text-[10px] font-bold text-slate-455 uppercase font-mono">
                {isRtl ? 'شرح الحل المعدل للتصدير للعميل' : 'Customer Resolution Explanation'}
              </label>
              <textarea
                id="resolution-explanation-area"
                rows={2}
                placeholder={isRtl ? 'اكتب الشرح الموجه للعميل هنا...' : 'Explain the resolved parameters clearly (sent to customer)...'}
                value={workflow.explanation}
                onChange={(e) => handleExplanationChange(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent dark:bg-slate-950/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none font-medium leading-relaxed"
              />
            </div>

            {/* Checklist */}
            <div className="space-y-2 text-start pt-2 border-t border-slate-100 dark:border-slate-850">
              <span className="text-[10px] font-bold text-slate-455 uppercase font-mono block mb-1">
                {isRtl ? 'قائمة التحقق من إغلاق الحالة' : 'Resolution Checklist'}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-medium select-none">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={workflow.checklist.customerVerified}
                    onChange={(e) => handleChecklistChange('customerVerified', e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                  <span>{isRtl ? 'تم التحقق من هوية العميل' : 'Customer Identity Verified'}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={workflow.checklist.complianceReviewed}
                    onChange={(e) => handleChecklistChange('complianceReviewed', e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                  <span>{isRtl ? 'مراجعة معايير الامتثال' : 'Compliance Policy Reviewed'}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={workflow.checklist.refundConfirmed}
                    onChange={(e) => handleChecklistChange('refundConfirmed', e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                  <span>{isRtl ? 'تأكيد عملية الاسترداد' : 'Refund Status Confirmed'}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={workflow.checklist.supervisorApproved}
                    onChange={(e) => handleChecklistChange('supervisorApproved', e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                  <span>{isRtl ? 'اعتماد موافقة المشرف' : 'Supervisor Signoff Received'}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={workflow.checklist.kbAttached}
                    onChange={(e) => handleChecklistChange('kbAttached', e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                  <span>{isRtl ? 'إرفاق مقال المعرفة المرجعي' : 'Article Attached to CRM'}</span>
                </label>
              </div>
            </div>

            {/* Action buttons strip */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-850">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleEscalateToSupervisor}
                  className="px-3 py-2 border border-rose-250 dark:border-rose-900 bg-rose-50 hover:bg-rose-100 text-rose-800 dark:bg-rose-955/20 dark:text-rose-400 rounded-xl cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  {isRtl ? 'تصعيد للمشرف' : 'Escalate to Supervisor'}
                </button>
                <button
                  type="button"
                  onClick={handleLaunchCallback}
                  className="px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900 rounded-xl cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  {isRtl ? 'جدولة إعادة اتصال' : 'Schedule Callback'}
                </button>
              </div>

              <button
                type="button"
                onClick={handleSendConfirmation}
                className={`px-4.5 py-2 font-extrabold text-white rounded-xl shadow-md transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  compliance.validationStatus === 'failed'
                    ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-600 cursor-not-allowed shadow-none'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/10'
                }`}
              >
                {isRtl ? 'إرسال تأكيد الحل' : 'Send Resolution Confirmation'}
              </button>
            </div>
            
            <p className="text-[10px] text-slate-400 block text-center font-mono">
              ℹ️ {isRtl ? 'يتم تسجيل جميع تغييرات رموز إنهاء الحالات في السجل المالي والأمني.' : 'All disposition changes are logged into the audit timeline.'}
            </p>
          </div>

          {/* Compliance Panel */}
          <div className={`border rounded-3xl p-5 text-start shadow-xs leading-normal space-y-3 ${
            compliance.validationStatus === 'failed'
              ? 'bg-rose-50/50 border-rose-200 dark:bg-rose-950/10 dark:border-rose-900/30'
              : compliance.validationStatus === 'warning'
                ? 'bg-amber-50/50 border-amber-200 dark:bg-amber-955/10 dark:border-amber-900/30'
                : 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/10 dark:border-emerald-900/30'
          }`}>
            <div className="flex items-center gap-2">
              {compliance.validationStatus === 'failed' ? (
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 animate-pulse" />
              ) : compliance.validationStatus === 'warning' ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              )}
              <h4 className="font-extrabold text-[12.5px]">
                {isRtl ? 'فحص الامتثال وحراس الأمان الأمني' : 'Compliance Safeguards & Risk Intelligence'}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-655 dark:text-slate-400 font-medium">
              <div className="space-y-1 bg-white dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[9px] uppercase font-mono text-slate-400 block">{isRtl ? 'فحص PCI/PII' : 'PII/PCI Financial Scan'}</span>
                <strong className={`font-mono text-[10.5px] uppercase ${compliance.pciStatus === 'failed' ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {compliance.pciStatus === 'failed' 
                    ? (isRtl ? 'فشل: تم كشف بطاقة/PII' : 'FAILED: Card Details Detected') 
                    : (isRtl ? 'اجتاز: لا توجد بيانات حساسة' : 'PASSED: No PCI data found')}
                </strong>
              </div>

              <div className="space-y-1 bg-white dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[9px] uppercase font-mono text-slate-400 block">{isRtl ? 'تحذيرات اتفاقية الخدمة' : 'SLA Compliance Warning'}</span>
                <strong className={`font-mono text-[10.5px] uppercase ${compliance.slaBreachWarning ? 'text-rose-600 font-extrabold' : 'text-slate-600 dark:text-slate-300'}`}>
                  {compliance.slaBreachWarning 
                    ? (isRtl ? 'تحذير: تجاوز وقت الخدمة' : 'BREACH WARNING ACTIVE') 
                    : (isRtl ? 'لا توجد خروقات نشطة' : 'NO SLA INCIDENTS')}
                </strong>
              </div>
            </div>

            {compliance.missingFields.length > 0 && (
              <div className="p-3 bg-rose-50 dark:bg-rose-955/20 border border-rose-200/55 dark:border-rose-900/40 rounded-xl space-y-1 animate-in slide-in-from-top-1">
                <span className="text-[9px] font-bold text-rose-700 dark:text-rose-400 block uppercase font-mono">
                  ⚠️ {isRtl ? 'الرجاء ملء الحقول الإلزامية للامتثال:' : 'Missing Mandatory Resolution Fields:'}
                </span>
                <ul className="list-disc list-inside text-[10px] text-rose-800 dark:text-rose-400 space-y-0.5">
                  {compliance.missingFields.map((field, idx) => (
                    <li key={idx}>{field}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Registry lists and details (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Dispositions Registry Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 dark:text-white uppercase font-mono tracking-wider text-start">
              {isRtl ? 'سجل رموز إنهاء الحالات (SAP CRM)' : 'CRM Dispositions Registry'}
            </h3>

            {/* Controls */}
            <div className="space-y-2.5 select-none">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={isRtl ? 'ابحث في الرموز أو الفئات...' : 'Search CRM codes or categories...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 bg-transparent dark:bg-slate-950/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              {/* Filtering layout */}
              <div className="flex gap-2">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  aria-label="Filter category"
                  className="flex-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2.5 py-1.5 font-bold cursor-pointer min-w-0 text-[10.5px]"
                >
                  <option value="all">{isRtl ? 'جميع الفئات' : 'All Categories'}</option>
                  <option value="Billing Mismatch">Billing Mismatch</option>
                  <option value="SIP Trunk Dropout">SIP Trunk Dropout</option>
                  <option value="Vector Compaction Lockout">Vector Compaction Lockout</option>
                  <option value="Authentication Mismatch">Authentication Mismatch</option>
                  <option value="SLA Escalation Breach">SLA Escalation Breach</option>
                  <option value="General Inquiry">General Inquiry</option>
                </select>

                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  aria-label="Filter severity"
                  className="flex-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2.5 py-1.5 font-bold cursor-pointer min-w-0 text-[10.5px]"
                >
                  <option value="all">{isRtl ? 'جميع درجات الأهمية' : 'All Severities'}</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            {/* Registry table */}
            <div className="overflow-x-auto select-none">
              <table className="w-full text-left text-[11px] border-collapse" role="grid">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold">
                    <th className="pb-2 text-start font-mono uppercase tracking-wider text-[9px]">{isRtl ? 'الرمز' : 'Code'}</th>
                    <th className="pb-2 text-start font-mono uppercase tracking-wider text-[9px]">{isRtl ? 'الفئة والأهمية' : 'Category'}</th>
                    <th className="pb-2 text-end font-mono uppercase tracking-wider text-[9px]">{isRtl ? 'الإجراء' : 'Route'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-600 dark:text-slate-350">
                  {filteredDispositions.map((row) => (
                    <tr
                      key={row.code}
                      onClick={() => setSelectedRowCode(row.code)}
                      tabIndex={0}
                      role="row"
                      aria-label={`Disposition code ${row.code}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedRowCode(row.code);
                        }
                      }}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-850/50 cursor-pointer transition-colors ${
                        selectedRowCode === row.code ? 'bg-blue-50/50 dark:bg-blue-950/15' : ''
                      } ${row.status === 'disabled' ? 'opacity-50' : ''}`}
                    >
                      <td className="py-2.5 font-mono font-bold text-blue-600 dark:text-blue-400 text-start">{row.code}</td>
                      <td className="py-2.5 text-start">
                        <div className="font-semibold text-slate-900 dark:text-white leading-normal truncate max-w-[120px]" title={row.category}>
                          {row.category}
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold font-mono uppercase ${
                          row.severity === 'critical' ? 'bg-rose-100 text-rose-800' :
                          row.severity === 'high' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {row.severity}
                        </span>
                      </td>
                      <td className="py-2.5 font-mono text-slate-500 text-end truncate max-w-[100px]" title={row.slaAction}>{row.slaAction}</td>
                    </tr>
                  ))}
                  {filteredDispositions.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-slate-400 italic">
                        {isRtl ? 'لا توجد رموز مطابقة للبحث' : 'No matching disposition codes found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Audit logs timeline */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
        <h3 className="font-extrabold text-slate-900 dark:text-white uppercase font-mono tracking-wider text-start">
          {isRtl ? 'سجل تدقيق إنهاء الحالة والحل' : 'Resolution Audit Trail timeline'}
        </h3>
        
        <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
          {auditLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 text-start leading-normal p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl animate-in slide-in-from-bottom-1 duration-150">
              <Activity className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-slate-700 dark:text-slate-350">{log.message}</p>
                <div className="flex gap-2 text-[9px] text-slate-400 font-mono mt-1 select-none">
                  <span>Actor: {log.actor}</span>
                  <span>•</span>
                  <span>{log.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
          {auditLogs.length === 0 && (
            <div className="py-6 text-center text-slate-400 italic">
              {isRtl ? 'لا توجد سجلات تدقيق حتى الآن.' : 'No wrap-up audit entries logged yet.'}
            </div>
          )}
        </div>
      </div>

      {/* 6. Details Overlay Drawer */}
      <DrawerWrapper
        isOpen={selectedRowCode !== null}
        onClose={() => setSelectedRowCode(null)}
        title={isRtl ? 'تفاصيل الرمز والامتثال' : 'CRM Disposition Details'}
        maxWidthClass="max-w-md"
      >
        {selectedRowDetails && (
          <div className="space-y-4 text-xs font-semibold leading-relaxed text-slate-700 dark:text-slate-300 text-start">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-1">
              <span className="text-[9px] text-slate-400 block uppercase font-mono">Registry CRM Code</span>
              <strong className="font-mono text-xs text-blue-600 dark:text-blue-400 font-extrabold">{selectedRowDetails.code}</strong>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] text-slate-400 block uppercase font-mono">Category &amp; Scope</span>
              <p className="font-bold text-slate-900 dark:text-white text-[12.5px]">{selectedRowDetails.category}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono">
              <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850">
                <span className="text-[8px] text-slate-455 block uppercase">Severity Level</span>
                <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                  selectedRowDetails.severity === 'critical' ? 'bg-rose-100 text-rose-800' :
                  selectedRowDetails.severity === 'high' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                }`}>
                  {selectedRowDetails.severity}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850">
                <span className="text-[8px] text-slate-455 block uppercase">Compliance Route</span>
                <strong className="text-slate-800 dark:text-slate-200">{selectedRowDetails.slaAction}</strong>
              </div>
            </div>

            <div className="space-y-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-850">
              <span className="text-[9px] text-slate-400 block uppercase font-mono">Diagnostic Description</span>
              <p className="font-medium text-slate-655 dark:text-slate-400 leading-normal">
                {selectedRowDetails.desc}
              </p>
            </div>

            <div className="flex gap-2 pt-4 justify-end">
              <button
                type="button"
                onClick={() => setSelectedRowCode(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
              >
                {isRtl ? 'إغلاق' : 'Close Details'}
              </button>
              
              {selectedRowDetails.status === 'active' && (
                <button
                  type="button"
                  onClick={() => {
                    store.applyWrapupRecommendation(activeConversationId, {
                      code: selectedRowDetails.code,
                      category: selectedRowDetails.category,
                      summary: selectedRowDetails.desc,
                      confidence: 100
                    });
                    setSelectedRowCode(null);
                    showLocalToast(isRtl ? 'تم تطبيق الرمز!' : `Applied disposition code: ${selectedRowDetails.code}`);
                  }}
                  className="px-4.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {isRtl ? 'تطبيق هذا الرمز' : 'Apply CRM Code'}
                </button>
              )}
            </div>
          </div>
        )}
      </DrawerWrapper>

      {/* Toast box alert */}
      {toastMessage && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-55 bg-slate-900 border border-slate-700 text-white font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-[10px] font-mono animate-in fade-in slide-in-from-bottom-2 duration-150">
          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
