'use client';

import React, { useState, useEffect } from 'react';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';
import {
  Tag, AlertCircle, Paperclip, Sparkles, ChevronRight,
  ChevronLeft, CheckCircle2, X, BookOpen, Upload
} from 'lucide-react';

interface SubmitTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketTitle: string;
  setTicketTitle: (val: string) => void;
  ticketCategory: string;
  setTicketCategory: (val: string) => void;
  ticketPriority: 'low' | 'medium' | 'high' | 'urgent';
  setTicketPriority: (val: 'low' | 'medium' | 'high' | 'urgent') => void;
  ticketDesc: string;
  setTicketDesc: (val: string) => void;
  handleTicketSubmit: (e: React.FormEvent) => void;
}

const PRIORITY_CONFIG = {
  low: { label: 'Low', labelAr: 'منخفض', color: 'text-slate-500 border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800' },
  medium: { label: 'Medium', labelAr: 'متوسط', color: 'text-amber-600 border-amber-300 bg-amber-50 dark:border-amber-700/40 dark:bg-amber-900/20' },
  high: { label: 'High', labelAr: 'مرتفع', color: 'text-orange-600 border-orange-300 bg-orange-50 dark:border-orange-700/40 dark:bg-orange-900/20' },
  urgent: { label: 'Urgent', labelAr: 'عاجل', color: 'text-rose-600 border-rose-300 bg-rose-50 dark:border-rose-700/40 dark:bg-rose-900/20' }
} as const;

type Priority = 'low' | 'medium' | 'high' | 'urgent';

const AI_SUGGESTIONS: Record<string, string[]> = {
  'Billing & Payments': [
    'How to Request a SaaS Subscription Refund',
    'Invoice Dispute Resolution Guide',
    'Understanding Your mPaaS Billing Cycle'
  ],
  'User Authentication': [
    'Resetting Locked Civil Registry Logins',
    'MFA Setup for Enterprise Accounts',
    'OAuth 2.0 Connector Configuration'
  ],
  'API Integrations': [
    'Setting Up OAuth for Client-Gate API Connectors',
    'REST API Error Code Reference',
    'Webhook Configuration Best Practices'
  ],
  'Shipments & Delivery': [
    'Handling Fiber Gateway Delivery Delays',
    'Tracking Your Enterprise Hardware Order',
    'Shipping Address Change Policy'
  ]
};

const STEPS = ['Classification', 'Details', 'Attachments'] as const;
type Step = typeof STEPS[number];

export function SubmitTicketModal({
  isOpen,
  onClose,
  ticketTitle,
  setTicketTitle,
  ticketCategory,
  setTicketCategory,
  ticketPriority,
  setTicketPriority,
  ticketDesc,
  setTicketDesc,
  handleTicketSubmit
}: SubmitTicketModalProps) {
  const { lang } = useApp();
  const t = translations[lang];
  const isRtl = lang === 'ar';

  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [draftSaved, setDraftSaved] = useState(false);
  const [showAiSuggestions, setShowAiSuggestions] = useState(true);

  // Auto-save draft indicator
  useEffect(() => {
    if (!isOpen) return;
    if (!ticketTitle && !ticketDesc) return;
    const timer = setTimeout(() => {
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2000);
    }, 1500);
    return () => clearTimeout(timer);
  }, [ticketTitle, ticketDesc, isOpen]);

  // Reset step when closed
  useEffect(() => {
    if (!isOpen) setStep(0);
  }, [isOpen]);

  const aiSuggestions = AI_SUGGESTIONS[ticketCategory] ?? [];

  const canProceedStep0 = ticketCategory !== '';
  const canProceedStep1 = ticketTitle.trim().length >= 5 && ticketDesc.trim().length >= 10;

  const handleFinalSubmit = (e: React.FormEvent) => {
    handleTicketSubmit(e);
    setStep(0);
    setAttachments([]);
  };

  const handleMockAttach = () => {
    const names = ['screenshot.png', 'error-log.txt', 'invoice.pdf', 'trace-dump.json'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    if (!attachments.includes(randomName)) {
      setAttachments(prev => [...prev, randomName]);
    }
  };

  const stepLabels = isRtl
    ? ['التصنيف', 'التفاصيل', 'المرفقات']
    : ['Classification', 'Details', 'Attachments'];

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={
        isRtl
          ? `إرسال تذكرة دعم — ${stepLabels[step]}`
          : `Submit Support Case — ${stepLabels[step]}`
      }
      maxWidthClass="max-w-xl"
    >
      <div className="space-y-5 text-xs font-semibold text-slate-800 dark:text-slate-200" dir={isRtl ? 'rtl' : 'ltr'}>

        {/* Step progress indicator */}
        <div className="flex items-center gap-0">
          {STEPS.map((s, idx) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all border-2 ${
                  idx < step
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : idx === step
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                }`}>
                  {idx < step ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                </div>
                <span className={`text-[9px] font-bold uppercase font-mono ${idx === step ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                  {stepLabels[idx]}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mb-4 transition-all ${idx < step ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-700'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Auto-save indicator */}
        {draftSaved && (
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-bold animate-in fade-in duration-200">
            <CheckCircle2 className="w-3 h-3" />
            {isRtl ? 'تم حفظ المسودة' : 'Draft saved'}
          </div>
        )}

        {/* ====== STEP 0: Classification ====== */}
        {step === 0 && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-200">
            {/* Category */}
            <div>
              <label className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-2">
                <Tag className="w-3.5 h-3.5" />
                {isRtl ? 'فئة الطلب' : 'Request Category'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['Billing & Payments', 'User Authentication', 'API Integrations', 'Shipments & Delivery'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setTicketCategory(cat)}
                    className={`p-3 rounded-xl border-2 text-left text-[11px] font-bold transition-all ${
                      ticketCategory === cat
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {isRtl
                      ? cat === 'Billing & Payments' ? 'الفوترة والمدفوعات'
                        : cat === 'User Authentication' ? 'المصادقة والوصول'
                        : cat === 'API Integrations' ? 'تكاملات API'
                        : 'الشحن والتوصيل'
                      : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-2">
                <AlertCircle className="w-3.5 h-3.5" />
                {isRtl ? 'الأولوية' : 'Priority Level'}
              </label>
              <div className="flex gap-2 flex-wrap">
                {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => {
                  const cfg = PRIORITY_CONFIG[p];
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setTicketPriority(p)}
                      className={`px-3.5 py-1.5 rounded-xl border font-bold text-[11px] transition-all ${
                        ticketPriority === p
                          ? cfg.color + ' ring-2 ring-offset-1 ring-blue-400'
                          : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {isRtl ? cfg.labelAr : cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Article Suggestions based on category */}
            {ticketCategory && showAiSuggestions && aiSuggestions.length > 0 && (
              <div className="p-4 bg-violet-50/60 dark:bg-violet-900/10 border border-violet-200 dark:border-violet-800/40 rounded-2xl space-y-2.5 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                    <span className="text-[10px] font-extrabold text-violet-700 dark:text-violet-400 uppercase font-mono">
                      {isRtl ? 'مقالات مقترحة بالذكاء الاصطناعي' : 'AI-Suggested Articles'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAiSuggestions(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-[10px] text-violet-600 dark:text-violet-400">
                  {isRtl
                    ? 'ربما تجد إجابتك في هذه المقالات قبل إرسال التذكرة:'
                    : 'You may find an answer before submitting:'}
                </p>
                <div className="space-y-1.5">
                  {aiSuggestions.map((sug, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 border border-violet-100 dark:border-violet-800/30 rounded-xl cursor-pointer hover:border-violet-300 dark:hover:border-violet-600 transition-all"
                    >
                      <BookOpen className="w-3 h-3 text-violet-400 shrink-0" />
                      <span className="text-[10px] text-slate-700 dark:text-slate-200 font-semibold line-clamp-1">{sug}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ====== STEP 1: Details ====== */}
        {step === 1 && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-200">
            <div>
              <label htmlFor="ticket-subject-input" className="block text-slate-500 dark:text-slate-400 mb-1.5">
                {isRtl ? 'عنوان المشكلة' : 'Issue Subject'}
                <span className="text-rose-500 ms-0.5">*</span>
              </label>
              <input
                id="ticket-subject-input"
                type="text"
                required
                minLength={5}
                placeholder={t.portal.tickets.subjectPlaceholder}
                value={ticketTitle}
                onChange={(e) => setTicketTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-855 dark:text-white transition-all"
              />
              <span className="text-[9px] text-slate-400 font-mono mt-1 block">
                {ticketTitle.length}/80 {isRtl ? 'حرف' : 'chars'}
              </span>
            </div>

            <div>
              <label htmlFor="ticket-desc-textarea" className="block text-slate-500 dark:text-slate-400 mb-1.5">
                {isRtl ? 'وصف المشكلة التفصيلي' : 'Detailed Issue Description'}
                <span className="text-rose-500 ms-0.5">*</span>
              </label>
              <textarea
                id="ticket-desc-textarea"
                required
                rows={5}
                placeholder={
                  isRtl
                    ? 'اشرح المشكلة بوضوح: ما الذي توقع حدوثه، وما الذي حدث فعلياً؟'
                    : t.portal.tickets.descPlaceholder
                }
                value={ticketDesc}
                onChange={(e) => setTicketDesc(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-855 dark:text-white resize-none transition-all"
              />
              <span className="text-[9px] text-slate-400 font-mono mt-1 block">
                {ticketDesc.length} {isRtl ? 'حرف' : 'chars'} — {isRtl ? 'الحد الأدنى ١٠ أحرف' : 'Minimum 10 required'}
              </span>
            </div>
          </div>
        )}

        {/* ====== STEP 2: Attachments ====== */}
        {step === 2 && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-200">
            {/* Upload area */}
            <div>
              <label className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-2">
                <Paperclip className="w-3.5 h-3.5" />
                {isRtl ? 'المرفقات (اختياري)' : 'Attachments (optional)'}
              </label>
              <button
                type="button"
                onClick={handleMockAttach}
                className="w-full border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 rounded-2xl p-6 flex flex-col items-center gap-2 transition-all group"
              >
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-all">
                  <Upload className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <span className="text-[11px] font-bold text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {isRtl ? 'انقر لإرفاق ملف' : 'Click to attach a file'}
                </span>
                <span className="text-[9px] text-slate-400 font-mono">
                  {isRtl ? 'PNG, PDF, TXT, JSON — الحد الأقصى 10MB' : 'PNG, PDF, TXT, JSON — Max 10MB'}
                </span>
              </button>
            </div>

            {/* Attached files list */}
            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((file) => (
                  <div key={file} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">{file}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachments(prev => prev.filter(f => f !== file))}
                      className="text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Summary review */}
            <div className="p-4 bg-blue-50/60 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/40 rounded-2xl space-y-2 text-[11px]">
              <span className="text-[9px] font-bold uppercase font-mono text-blue-600 dark:text-blue-400 block">
                {isRtl ? 'ملخص التذكرة' : 'Case Summary'}
              </span>
              <div className="flex justify-between items-center gap-2 flex-wrap">
                <span className="text-slate-500 dark:text-slate-400">{isRtl ? 'الفئة:' : 'Category:'}</span>
                <span className="font-bold text-slate-800 dark:text-white">{ticketCategory}</span>
              </div>
              <div className="flex justify-between items-center gap-2 flex-wrap">
                <span className="text-slate-500 dark:text-slate-400">{isRtl ? 'الأولوية:' : 'Priority:'}</span>
                <span className={`px-2 py-0.5 rounded-lg font-bold font-mono text-[10px] ${PRIORITY_CONFIG[ticketPriority].color}`}>
                  {isRtl ? PRIORITY_CONFIG[ticketPriority].labelAr : PRIORITY_CONFIG[ticketPriority].label}
                </span>
              </div>
              <div className="pt-1 border-t border-blue-100 dark:border-blue-800/40">
                <p className="text-slate-600 dark:text-slate-300 font-bold line-clamp-1">{ticketTitle}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => step === 0 ? onClose() : setStep((s) => (s - 1) as 0 | 1 | 2)}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] font-bold transition-all"
          >
            {step === 0 ? (
              isRtl ? 'إلغاء' : 'Cancel'
            ) : (
              <>
                <ChevronLeft className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                {isRtl ? 'السابق' : 'Back'}
              </>
            )}
          </button>

          {step < 2 ? (
            <button
              type="button"
              disabled={step === 0 ? !canProceedStep0 : !canProceedStep1}
              onClick={() => setStep((s) => (s + 1) as 0 | 1 | 2)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-[11px] transition-all shadow-sm"
            >
              {isRtl ? 'التالي' : 'Next'}
              <ChevronRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={!canProceedStep1}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-[11px] transition-all shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isRtl ? 'إرسال التذكرة' : 'Submit Case'}
            </button>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
}
