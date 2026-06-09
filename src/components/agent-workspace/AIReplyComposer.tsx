'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, RefreshCcw, FileText, Wand2, Paperclip, Undo2 } from 'lucide-react';
import { useIsDesktopOperational } from '@/hooks/useMediaQuery';
import { MobileSheet } from '@/components/responsive/MobileSheet';
import { translations } from '@/i18n/translations';
import { usePermission } from '@/stores/permissionStore';
import { useConversationStore } from '@/stores/conversationStore';
import { ComposerAttachmentPreview } from './ComposerAttachmentPreview';

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
  draftText: propsDraftText,
  onChangeDraft: propsOnChangeDraft,
  onSend,
  suggestedReplyText,
  lang,
  onSummarize,
  channel = 'web',
  status
}: AIReplyComposerProps) {
  const store = useConversationStore();
  const activeConversationId = store.activeConversationId || '';
  const draftText = propsDraftText !== undefined ? propsDraftText : (store.drafts[activeConversationId] || '');

  const onChangeDraft = (val: string) => {
    if (propsOnChangeDraft) {
      propsOnChangeDraft(val);
    }
    store.saveDraft(activeConversationId, val);
  };
  const isDesktop = useIsDesktopOperational();
  const { canEdit } = usePermission('inbox');

  const composerMode = store.composerModes[activeConversationId] || (channel === 'email' ? 'email_reply' : 'reply');
  const activeTab = composerMode === 'internal_note' ? 'note' : 'customer';

  const setActiveTab = (tab: 'customer' | 'note') => {
    if (tab === 'note') {
      store.setComposerMode(activeConversationId, 'internal_note');
    } else {
      store.setComposerMode(activeConversationId, channel === 'email' ? 'email_reply' : 'reply');
    }
  };

  const selectedTone = store.activeTones[activeConversationId] || 'professional';
  const setSelectedTone = (tone: 'professional' | 'empathetic' | 'concise' | 'escalation-ready') => {
    store.setActiveTone(activeConversationId, tone);
  };

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

  const chatTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const emailTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setToolsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const insertTextAtCursor = (textToInsert: string) => {
    const inputEl = channel === 'email' ? emailTextareaRef.current : chatTextareaRef.current;
    if (inputEl) {
      const start = inputEl.selectionStart ?? 0;
      const end = inputEl.selectionEnd ?? 0;
      const textBefore = draftText.substring(0, start);
      const textAfter = draftText.substring(end);
      const newText = textBefore + textToInsert + textAfter;
      onChangeDraft(newText);
      setTimeout(() => {
        inputEl.focus();
        const newCursorPos = start + textToInsert.length;
        inputEl.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    } else {
      onChangeDraft(draftText ? draftText + ' ' + textToInsert : textToInsert);
    }
  };

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
    store.trackMacroInsertion(activeConversationId, val);
    insertTextAtCursor(val);
  };

  const handleRewriteTone = () => {
    if (!canEdit) return;
    setLoadingSuggestion(true);
    store.setRewriteState(activeConversationId, 'rewriting');
    const runRewrite = () => {
      let result = draftText || suggestedReplyText;
      if (!store.originalDrafts[activeConversationId]) {
        store.saveOriginalDraft(activeConversationId, draftText);
      }

      if (selectedTone === 'empathetic') {
        result = `I truly understand how frustrating this must be. Let me resolve this exception right away: ${result}`;
      } else if (selectedTone === 'concise') {
        result = `Processing exception for ${result.substring(0, 50)}... Done.`;
      } else if (selectedTone === 'escalation-ready') {
        result = `Escalating case INC-99881. Support documentation: ${result}`;
      } else {
        result = `Dear Client, regarding your request, we have initiated standard process: ${result}`;
      }
      setLoadingSuggestion(false);
      store.setRewriteState(activeConversationId, 'success');
      onChangeDraft(result);
    };

    if (process.env.NODE_ENV === 'test') {
      runRewrite();
    } else {
      setTimeout(runRewrite, 500);
    }
  };

  const handleApplyAISuggestion = () => {
    if (!canEdit) return;
    let textToInsert = suggestedReplyText;
    
    // Combined Tone + Suggestion Flow
    if (selectedTone !== 'professional' && selectedTone) {
      if (selectedTone === 'empathetic') {
        textToInsert = `I truly understand how frustrating this must be. Let me resolve this: ${textToInsert}`;
      } else if (selectedTone === 'concise') {
        textToInsert = `Concise response: ${textToInsert}`;
      } else if (selectedTone === 'escalation-ready') {
        textToInsert = `Escalating case details: ${textToInsert}`;
      }
    }

    store.setAppliedSuggestion(activeConversationId, textToInsert);
    insertTextAtCursor(textToInsert);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    Array.from(e.target.files).forEach((file) => {
      const isImg = file.type.startsWith('image/');
      const staged = {
        id: `staged-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        url: isImg ? URL.createObjectURL(file) : '#',
        sizeBytes: file.size,
        type: isImg ? ('image' as const) : file.name.endsWith('.pdf') ? ('pdf' as const) : file.name.endsWith('.doc') || file.name.endsWith('.docx') ? ('doc' as const) : ('generic' as const),
      };
      store.stageAttachment(activeConversationId, staged);
    });
    e.target.value = '';
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
            disabled={!canEdit || store.copilotLoadingStates[activeConversationId]}
            className={`rounded bg-blue-100 px-2 py-1 text-[10px] font-bold text-blue-800 hover:bg-blue-200 dark:bg-blue-950 dark:text-blue-300 ${!canEdit || store.copilotLoadingStates[activeConversationId] ? 'opacity-60 cursor-not-allowed' : ''}`}
            title={!canEdit ? "Requires Edit Permission" : undefined}
          >
            {store.copilotLoadingStates[activeConversationId] ? (
              <span className="flex items-center gap-1">
                <RefreshCcw className="h-3 w-3 animate-spin" />
                <span>Generating...</span>
              </span>
            ) : (
              t.agentWorkspace.aiComposer.applySuggestion
            )}
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
            onChange={(e) => setSelectedTone(e.target.value as any)}
            disabled={!canEdit}
            aria-label={lang === 'ar' ? 'حدد نبرة الرد' : 'Select response tone'}
            className={`rounded-lg border border-slate-300 bg-slate-55 px-2 py-1 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
            title={!canEdit ? "Requires Edit Permission" : undefined}
          >
            <option value="professional">{t.agentWorkspace.aiComposer.professional}</option>
            <option value="empathetic">{t.agentWorkspace.aiComposer.empathetic}</option>
            <option value="concise">{t.agentWorkspace.aiComposer.concise}</option>
            <option value="escalation-ready">{lang === 'ar' ? 'جاهز للتصعيد' : 'Escalation-Ready'}</option>
          </select>
          <button
            type="button"
            onClick={handleRewriteTone}
            disabled={loadingSuggestion || !canEdit}
            aria-label={lang === 'ar' ? 'إعادة صياغة النص' : 'Rewrite response tone'}
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
          aria-label={lang === 'ar' ? 'أدخل رداً جاهزاً' : 'Insert canned reply macro'}
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

  const isInternalNote = activeTab === 'note';

  return (
    <div className={`shrink-0 min-w-0 space-y-3 border-t p-3 text-xs font-semibold sm:p-4 transition-colors duration-200 ${
      isInternalNote
        ? 'border-purple-300 bg-purple-50/90 dark:border-purple-900/50 dark:bg-purple-950/20'
        : 'border-slate-200 bg-slate-50/95 dark:border-slate-800 dark:bg-slate-900/60'
    }`}>
      {/* Staged attachments preview list */}
      {(store.stagedAttachments[activeConversationId] || []).length > 0 && (
        <ComposerAttachmentPreview
          attachments={store.stagedAttachments[activeConversationId] || []}
          onRemove={(id) => store.removeStagedAttachment(activeConversationId, id)}
          lang={lang}
        />
      )}

      {/* Undo Rewrite Banner */}
      {store.originalDrafts[activeConversationId] && (
        <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-xl text-[10px] text-blue-900 dark:text-blue-300 animate-in slide-in-from-top-1 duration-200">
          <span>{lang === 'ar' ? 'تم تطبيق تعديل النبرة بالذكاء الاصطناعي.' : 'AI tone rewrite applied.'}</span>
          <button
            type="button"
            onClick={() => store.restoreOriginalDraft(activeConversationId)}
            className="flex items-center gap-1 rounded bg-blue-100 dark:bg-blue-900 px-2 py-1 text-[9px] font-bold text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-850"
          >
            <Undo2 className="h-3 w-3 animate-pulse" />
            {lang === 'ar' ? 'تراجع عن الصياغة' : 'Undo Rewrite'}
          </button>
        </div>
      )}

      {isDesktop ? (
        advancedToolsBlock
      ) : (
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2 dark:border-slate-800">
          <button
            type="button"
            onClick={handleApplyAISuggestion}
            disabled={!canEdit || store.copilotLoadingStates[activeConversationId]}
            className={`flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-100 px-2 py-2 text-[10px] font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300 ${!canEdit || store.copilotLoadingStates[activeConversationId] ? 'opacity-60 cursor-not-allowed' : ''}`}
            title={!canEdit ? "Requires Edit Permission" : undefined}
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            {store.copilotLoadingStates[activeConversationId] ? 'Generating...' : t.agentWorkspace.aiComposer.applyAi}
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
          <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider font-mono me-1">
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
            ref={emailTextareaRef}
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
            aria-label={activeTab === 'note' ? (lang === 'ar' ? 'ملاحظة داخلية' : 'Internal note draft') : (lang === 'ar' ? 'رد البريد الإلكتروني' : 'Email response draft')}
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
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={!canEdit}
            aria-label={lang === 'ar' ? 'إرفاق ملف' : 'Attach file'}
            className={`shrink-0 rounded-xl p-2.5 border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
            title={!canEdit ? "Requires Edit Permission" : undefined}
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <textarea
            ref={chatTextareaRef}
            rows={1}
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
            aria-label={activeTab === 'note' ? (lang === 'ar' ? 'ملاحظة داخلية' : 'Internal note draft') : (lang === 'ar' ? 'رد المحادثة' : 'Chat response draft')}
            className={`min-w-0 flex-1 rounded-xl border border-slate-300 bg-slate-55 px-3 py-2.5 text-xs font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 resize-none ${
              activeTab === 'note'
                ? 'text-purple-600 dark:text-purple-400'
                : channel === 'whatsapp'
                ? 'focus:border-emerald-500 text-slate-800 dark:text-slate-100'
                : 'text-slate-800 dark:text-slate-100'
            } ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
            title={!canEdit ? "Requires Edit Permission" : undefined}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!canEdit) return;
                const hasStaged = (store.stagedAttachments[activeConversationId] || []).length > 0;
                if (!draftText.trim() && !hasStaged) return;
                onSend(draftText, activeTab === 'customer' ? 'chat' : 'note');
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              if (!canEdit) return;
              const hasStaged = (store.stagedAttachments[activeConversationId] || []).length > 0;
              if (!draftText.trim() && !hasStaged) return;
              onSend(draftText, activeTab === 'customer' ? 'chat' : 'note');
            }}
            disabled={!canEdit || (!draftText.trim() && !(store.stagedAttachments[activeConversationId] || []).length)}
            aria-label={activeTab === 'note' ? (lang === 'ar' ? 'حفظ الملاحظة الداخلية' : 'Save internal note') : (lang === 'ar' ? 'إرسال الرد' : 'Send response')}
            className={`shrink-0 rounded-xl p-2.5 text-white shadow-lg transition-all ${
              activeTab === 'note'
                ? 'bg-purple-600 hover:bg-purple-700'
                : channel === 'whatsapp'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-blue-600 hover:bg-blue-700'
            } ${!canEdit || (!draftText.trim() && !(store.stagedAttachments[activeConversationId] || []).length) ? 'opacity-60 cursor-not-allowed' : ''}`}
            title={!canEdit ? "Requires Edit Permission" : undefined}
          >
            <Sparkles className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
