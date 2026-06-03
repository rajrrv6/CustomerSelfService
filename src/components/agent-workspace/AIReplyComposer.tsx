'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, RefreshCcw, FileText, Wand2 } from 'lucide-react';
import { useIsDesktopOperational } from '@/hooks/useMediaQuery';
import { MobileSheet } from '@/components/responsive/MobileSheet';
import { translations } from '@/i18n/translations';
import { usePermission } from '@/stores/permissionStore';

interface AIReplyComposerProps {
  draftText: string;
  onChangeDraft: (val: string) => void;
  onSend: (text: string, type: 'chat' | 'note') => void;
  suggestedReplyText: string;
  lang: 'en' | 'ar';
  onSummarize: () => void;
  channel?: 'whatsapp' | 'web' | 'voice' | 'email' | 'instagram' | 'messenger';
  status?: 'unassigned' | 'active' | 'resolved' | 'escalated';
}

export function AIReplyComposer({
  draftText,
  onChangeDraft,
  onSend,
  suggestedReplyText,
  lang,
  onSummarize,
  channel = 'web',
  status
}: AIReplyComposerProps) {
  const isDesktop = useIsDesktopOperational();
  const { canEdit } = usePermission('inbox');
  const [activeTab, setActiveTab] = useState<'customer' | 'note'>('customer');
  const [selectedTone, setSelectedTone] = useState<'professional' | 'empathetic' | 'concise'>('professional');
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  useEffect(() => {
    if (status === 'escalated') {
      setActiveTab('note');
    } else {
      setActiveTab('customer');
    }
  }, [status]);

  const t = translations[lang];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const streamText = (text: string) => {
    if (!canEdit) return;
    if (process.env.NODE_ENV === 'test') {
      onChangeDraft(text);
      return;
    }
    if (timerRef.current) clearInterval(timerRef.current);
    let current = '';
    let index = 0;
    const interval = 10; // 10ms per char for snappy yet realistic streaming
    timerRef.current = setInterval(() => {
      if (index < text.length) {
        current += text[index];
        onChangeDraft(current);
        index++;
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }, interval);
  };

  const macros = [
    { label: 'Refund Policy Warning', value: 'Under standard Return & Exchange policy ks-1, refunds are limited to 30 days. However, since the unit was received damaged, we can process a full exception for you.' },
    { label: 'Escalation Alert', value: 'I have logged a priority escalation ticket with our tier 2 security infrastructure team. The SLA target is 2 hours. I will update you as soon as they report back.' },
    { label: 'Payment Sync Complete', value: 'We confirmed payment INV-2026-7891 wire settlement. Your workspace subscription has been refilled successfully.' }
  ];

  const handleApplyMacro = (val: string) => {
    if (!canEdit) return;
    streamText(val);
  };

  const handleRewriteTone = () => {
    if (!canEdit) return;
    setLoadingSuggestion(true);
    const runRewrite = () => {
      let result = draftText || suggestedReplyText;
      if (selectedTone === 'empathetic') {
        result = `I truly understand how frustrating this must be. Let me resolve this exception right away: ${result}`;
      } else if (selectedTone === 'concise') {
        result = `Processing exception for ${result.substring(0, 50)}... Done.`;
      } else {
        result = `Dear Client, regarding your request, we have initiated standard process: ${result}`;
      }
      setLoadingSuggestion(false);
      streamText(result);
    };

    if (process.env.NODE_ENV === 'test') {
      runRewrite();
    } else {
      setTimeout(runRewrite, 500);
    }
  };

  const handleApplyAISuggestion = () => {
    if (!canEdit) return;
    streamText(suggestedReplyText);
  };

  const advancedToolsBlock = (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 shrink-0 text-blue-500" />
          <span className="text-slate-600 dark:text-slate-400">{t.agentWorkspace.aiComposer.aiSuggestedAnswer}</span>
          <button
            type="button"
            onClick={handleApplyAISuggestion}
            disabled={!canEdit}
            className={`rounded bg-blue-100 px-2 py-1 text-[10px] font-bold text-blue-800 hover:bg-blue-200 dark:bg-blue-950 dark:text-blue-300 ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
            title={!canEdit ? "Requires Edit Permission" : undefined}
          >
            {t.agentWorkspace.aiComposer.applySuggestion}
          </button>
        </div>
        <button
          type="button"
          onClick={onSummarize}
          className="flex items-center gap-1 rounded-lg bg-slate-200 px-2.5 py-1 text-[10px] text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <FileText className="h-3.5 w-3.5" />
          {t.agentWorkspace.aiComposer.summarize}
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex rounded-lg border border-slate-300 bg-slate-200 p-0.5 text-[10px] font-bold dark:border-slate-700 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('customer')}
            className={`rounded px-3 py-1 transition-all ${activeTab === 'customer' ? 'bg-slate-50 text-blue-600 shadow-sm dark:bg-slate-900' : 'text-slate-500 dark:text-slate-400'}`}
          >
            {t.agentWorkspace.aiComposer.customer}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('note')}
            className={`rounded px-3 py-1 transition-all ${activeTab === 'note' ? 'bg-slate-50 text-purple-600 shadow-sm dark:bg-slate-900' : 'text-slate-500 dark:text-slate-400'}`}
          >
            {t.agentWorkspace.aiComposer.internalNote}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
          <span className="font-mono font-bold uppercase text-slate-400">{t.agentWorkspace.aiComposer.tone}</span>
          <select
            value={selectedTone}
            onChange={(e) => setSelectedTone(e.target.value as 'professional' | 'empathetic' | 'concise')}
            disabled={!canEdit}
            className={`rounded-lg border border-slate-300 bg-slate-55 px-2 py-1 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
            title={!canEdit ? "Requires Edit Permission" : undefined}
          >
            <option value="professional">{t.agentWorkspace.aiComposer.professional}</option>
            <option value="empathetic">{t.agentWorkspace.aiComposer.empathetic}</option>
            <option value="concise">{t.agentWorkspace.aiComposer.concise}</option>
          </select>
          <button
            type="button"
            onClick={handleRewriteTone}
            disabled={loadingSuggestion || !canEdit}
            className={`flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 font-bold text-white hover:bg-blue-700 ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
            title={!canEdit ? "Requires Edit Permission" : undefined}
          >
            <RefreshCcw className={`h-3.5 w-3.5 ${loadingSuggestion ? 'animate-spin' : ''}`} />
            {t.agentWorkspace.aiComposer.rewrite}
          </button>
        </div>
      </div>

      <div className="flex gap-2 min-w-0">
        <select
          onChange={(e) => handleApplyMacro(e.target.value)}
          defaultValue=""
          disabled={!canEdit}
          className={`max-w-full min-w-0 flex-1 rounded-xl border border-slate-300 bg-slate-55 px-3 py-2 text-[10px] text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
          title={!canEdit ? "Requires Edit Permission" : undefined}
        >
          <option value="" disabled>
            {t.agentWorkspace.aiComposer.insertCannedReply}
          </option>
          {macros.map((m, idx) => (
            <option key={idx} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
    </>
  );

  return (
    <div className="shrink-0 min-w-0 space-y-3 border-t border-slate-200 bg-slate-50/95 p-3 text-xs font-semibold dark:border-slate-800 dark:bg-slate-900/60 sm:p-4">
      {isDesktop ? (
        advancedToolsBlock
      ) : (
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2 dark:border-slate-800">
          <button
            type="button"
            onClick={handleApplyAISuggestion}
            disabled={!canEdit}
            className={`flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-100 px-2 py-2 text-[10px] font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300 ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
            title={!canEdit ? "Requires Edit Permission" : undefined}
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            {t.agentWorkspace.aiComposer.applyAi}
          </button>
          <button
            type="button"
            onClick={onSummarize}
            className="flex min-h-10 flex-1 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-2 text-[10px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <FileText className="h-3.5 w-3.5 shrink-0" />
            {t.agentWorkspace.aiComposer.summary}
          </button>
          <button
            type="button"
            onClick={() => setToolsOpen(true)}
            className="flex min-h-10 shrink-0 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <Wand2 className="h-3.5 w-3.5" />
            {t.agentWorkspace.aiComposer.tools}
          </button>
        </div>
      )}

      {!isDesktop && (
        <div className="flex rounded-lg border border-slate-300 bg-slate-200 p-0.5 text-[10px] font-bold dark:border-slate-700 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('customer')}
            className={`flex-1 rounded px-2 py-1.5 ${activeTab === 'customer' ? 'bg-slate-50 text-blue-600 shadow-sm dark:bg-slate-900' : 'text-slate-500'}`}
          >
            {t.agentWorkspace.aiComposer.customer}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('note')}
            className={`flex-1 rounded px-2 py-1.5 ${activeTab === 'note' ? 'bg-slate-50 text-purple-600 shadow-sm dark:bg-slate-900' : 'text-slate-500'}`}
          >
            {t.agentWorkspace.aiComposer.internalNote}
          </button>
        </div>
      )}

      {!isDesktop && (
        <MobileSheet
          open={toolsOpen}
          onClose={() => setToolsOpen(false)}
          title={t.agentWorkspace.aiComposer.aiReplyWorkspace}
          description={t.agentWorkspace.aiComposer.toneMacrosSendMode}
          bodyClassName="max-h-[min(80dvh,560px)]"
        >
          <div className="space-y-4 p-4">{advancedToolsBlock}</div>
        </MobileSheet>
      )}

      {status === 'escalated' && (
        <div className="p-2.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl space-y-2 text-[10px] text-rose-900 dark:text-rose-300 animate-in slide-in-from-top-1 duration-250">
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
            <span>⚠️</span>
            <span>{lang === 'ar' ? 'ملاحظة داخلية للمشرف فقط' : 'Supervisor-Monitored Note Draft'}</span>
          </div>
          <p className="font-normal leading-normal opacity-90">
            {lang === 'ar' 
              ? 'هذه المحادثة مصنفة كحالة مصعدة. يرجى توثيق خطوات الدعم الفني لمراجعتها من قبل المشرفين.' 
              : 'This case is currently escalated. Team notes are logged directly to the audit timeline.'}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 font-mono text-[9px] text-slate-500 dark:text-slate-400 select-none">
            <label className="flex items-center gap-1 cursor-not-allowed">
              <input type="checkbox" defaultChecked disabled className="rounded border-rose-300 text-rose-600 focus:ring-rose-500" />
              <span>Verify OAuth credentials</span>
            </label>
            <label className="flex items-center gap-1 cursor-not-allowed">
              <input type="checkbox" defaultChecked disabled className="rounded border-rose-300 text-rose-600 focus:ring-rose-500" />
              <span>Consult supervisor note</span>
            </label>
            <label className="flex items-center gap-1 cursor-not-allowed">
              <input type="checkbox" defaultChecked disabled className="rounded border-rose-300 text-rose-600 focus:ring-rose-500" />
              <span>Audit SAP logs</span>
            </label>
          </div>
        </div>
      )}

      {channel === 'whatsapp' && (
        <div className="flex flex-wrap gap-1.5 pb-1 select-none items-center">
          <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider font-mono mr-1">
            {lang === 'ar' ? 'ردود سريعة:' : 'Quick Replies:'}
          </span>
          {[
            lang === 'ar'
              ? { label: 'تم الاستلام، جاري التحقق!', value: 'تم الاستلام، جاري التحقق من التفاصيل وسأعود إليك حالاً.' }
              : { label: 'Got it, checking!', value: 'Got it, checking the details in our system right now.' },
            lang === 'ar'
              ? { label: 'تأكيد التفاصيل...', value: 'يرجى تأكيد رقم الطلب أو الحساب لمتابعة طلبك.' }
              : { label: 'Confirming details...', value: 'Please confirm your order number or account ID to proceed.' },
            lang === 'ar'
              ? { label: 'الرجاء الانتظار لحظة.', value: 'جاري مراجعة النظام، الرجاء الانتظار لحظة فضلاً.' }
              : { label: 'Please wait a moment.', value: 'Checking the database. Please wait a moment.' }
          ].map((qr, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (!canEdit) return;
                streamText(qr.value);
              }}
              disabled={!canEdit}
              className={`border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 px-2.5 py-0.5 rounded-full text-[10px] cursor-pointer font-bold transition-all shadow-xs ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
              title={!canEdit ? "Requires Edit Permission" : undefined}
            >
              {qr.label}
            </button>
          ))}
        </div>
      )}

      {channel === 'email' ? (
        <div className="flex flex-col gap-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs w-full">
          <div className="flex flex-col gap-1 border-b border-slate-100 dark:border-slate-800 pb-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-400">To:</span>
              <span className="text-slate-700 dark:text-slate-300">client@vertex-logistics.com</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-400">CC:</span>
              <span className="text-slate-700 dark:text-slate-300">accounts-audit@vertex-logistics.com; dispatch-ops@vertex-logistics.com</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-400">Subject:</span>
              <span className="text-slate-700 dark:text-slate-300 truncate">
                Re: Inquiry regarding payment audit for INV-2026-7891
              </span>
            </div>
          </div>
          <textarea
            value={draftText}
            onChange={(e) => {
              if (!canEdit) return;
              onChangeDraft(e.target.value);
            }}
            disabled={!canEdit}
            placeholder={
              activeTab === 'note'
                ? t.agentWorkspace.aiComposer.writeInternalNote
                : 'Write structured formal response back to customer...'
            }
            rows={5}
            className={`min-w-0 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-xs font-semibold focus:border-violet-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950/40 resize-y ${
              activeTab === 'note' ? 'text-purple-600 dark:text-purple-400' : 'text-slate-800 dark:text-slate-100'
            } ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
            title={!canEdit ? "Requires Edit Permission" : undefined}
          />
          <div className="flex items-center justify-between pt-1">
            <div className="flex gap-1.5 text-[9px] text-slate-400 select-none">
              <span>✍️ HTML editor • signature automatically appended</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!canEdit) return;
                  onChangeDraft('');
                }}
                disabled={!canEdit}
                className={`px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-[10px] text-slate-600 dark:text-slate-400 font-bold transition-all ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
                title={!canEdit ? "Requires Edit Permission" : undefined}
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!canEdit) return;
                  onSend(draftText, activeTab === 'customer' ? 'chat' : 'note');
                }}
                disabled={!canEdit}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-[10px] font-bold text-white shadow-sm transition-all ${
                  activeTab === 'note' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-violet-600 hover:bg-violet-700'
                } ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
                title={!canEdit ? "Requires Edit Permission" : undefined}
              >
                <Sparkles className="h-3.5 w-3.5" />
                {activeTab === 'note' ? 'Log Note' : 'Send Email'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={draftText}
            onChange={(e) => {
              if (!canEdit) return;
              onChangeDraft(e.target.value);
            }}
            disabled={!canEdit}
            placeholder={
              activeTab === 'note'
                ? t.agentWorkspace.aiComposer.writeInternalNote
                : t.agentWorkspace.aiComposer.writeResponse
            }
            className={`min-w-0 flex-1 rounded-xl border border-slate-300 bg-slate-55 px-3 py-2.5 text-xs font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 ${
              activeTab === 'note'
                ? 'text-purple-600 dark:text-purple-400'
                : channel === 'whatsapp'
                ? 'focus:border-emerald-500 text-slate-800 dark:text-slate-100'
                : 'text-slate-800 dark:text-slate-100'
            } ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
            title={!canEdit ? "Requires Edit Permission" : undefined}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (!canEdit) return;
                onSend(draftText, activeTab === 'customer' ? 'chat' : 'note');
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              if (!canEdit) return;
              onSend(draftText, activeTab === 'customer' ? 'chat' : 'note');
            }}
            disabled={!canEdit}
            className={`shrink-0 rounded-xl p-2.5 text-white shadow-lg transition-all ${
              activeTab === 'note'
                ? 'bg-purple-600 hover:bg-purple-700'
                : channel === 'whatsapp'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-blue-600 hover:bg-blue-700'
            } ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
            title={!canEdit ? "Requires Edit Permission" : undefined}
          >
            <Sparkles className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
