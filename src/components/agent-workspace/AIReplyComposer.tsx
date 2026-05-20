'use client';

import React, { useState } from 'react';
import { Sparkles, RefreshCcw, FileText, Wand2 } from 'lucide-react';
import { useIsDesktopOperational } from '@/hooks/useMediaQuery';
import { MobileSheet } from '@/components/responsive/MobileSheet';

interface AIReplyComposerProps {
  draftText: string;
  onChangeDraft: (val: string) => void;
  onSend: (text: string, type: 'chat' | 'note') => void;
  suggestedReplyText: string;
  lang: 'en' | 'ar';
  onSummarize: () => void;
}

export function AIReplyComposer({
  draftText,
  onChangeDraft,
  onSend,
  suggestedReplyText,
  lang,
  onSummarize
}: AIReplyComposerProps) {
  const isDesktop = useIsDesktopOperational();
  const [activeTab, setActiveTab] = useState<'customer' | 'note'>('customer');
  const [selectedTone, setSelectedTone] = useState<'professional' | 'empathetic' | 'concise'>('professional');
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  const isRtl = lang === 'ar';

  const macros = [
    { label: 'Refund Policy Warning', value: 'Under standard Return & Exchange policy ks-1, refunds are limited to 30 days. However, since the unit was received damaged, we can process a full exception for you.' },
    { label: 'Escalation Alert', value: 'I have logged a priority escalation ticket with our tier 2 security infrastructure team. The SLA target is 2 hours. I will update you as soon as they report back.' },
    { label: 'Payment Sync Complete', value: 'We confirmed payment INV-2026-7891 wire settlement. Your workspace subscription has been refilled successfully.' }
  ];

  const handleApplyMacro = (val: string) => {
    onChangeDraft(val);
  };

  const handleRewriteTone = () => {
    setLoadingSuggestion(true);
    setTimeout(() => {
      let result = draftText || suggestedReplyText;
      if (selectedTone === 'empathetic') {
        result = `I truly understand how frustrating this must be. Let me resolve this exception right away: ${result}`;
      } else if (selectedTone === 'concise') {
        result = `Processing exception for ${result.substring(0, 50)}... Done.`;
      } else {
        result = `Dear Client, regarding your request, we have initiated standard process: ${result}`;
      }
      onChangeDraft(result);
      setLoadingSuggestion(false);
    }, 500);
  };

  const handleApplyAISuggestion = () => {
    onChangeDraft(suggestedReplyText);
  };

  const advancedToolsBlock = (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 shrink-0 text-blue-500" />
          <span className="text-slate-600 dark:text-slate-400">{isRtl ? 'اقتراح الذكاء الاصطناعي' : 'AI suggested answer'}</span>
          <button
            type="button"
            onClick={handleApplyAISuggestion}
            className="rounded bg-blue-100 px-2 py-1 text-[10px] font-bold text-blue-800 hover:bg-blue-200 dark:bg-blue-950 dark:text-blue-300"
          >
            {isRtl ? 'تطبيق' : 'Apply suggestion'}
          </button>
        </div>
        <button
          type="button"
          onClick={onSummarize}
          className="flex items-center gap-1 rounded-lg bg-slate-200 px-2.5 py-1 text-[10px] text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <FileText className="h-3.5 w-3.5" />
          {isRtl ? 'تلخيص' : 'Summarize'}
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex rounded-lg border border-slate-300 bg-slate-200 p-0.5 text-[10px] font-bold dark:border-slate-700 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('customer')}
            className={`rounded px-3 py-1 transition-all ${activeTab === 'customer' ? 'bg-slate-50 text-blue-600 shadow-sm dark:bg-slate-900' : 'text-slate-500 dark:text-slate-400'}`}
          >
            {isRtl ? 'للعميل' : 'Customer'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('note')}
            className={`rounded px-3 py-1 transition-all ${activeTab === 'note' ? 'bg-slate-50 text-purple-600 shadow-sm dark:bg-slate-900' : 'text-slate-500 dark:text-slate-400'}`}
          >
            {isRtl ? 'ملاحظة' : 'Internal note'}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
          <span className="font-mono font-bold uppercase text-slate-400">{isRtl ? 'النبرة' : 'Tone'}</span>
          <select
            value={selectedTone}
            onChange={(e) => setSelectedTone(e.target.value as 'professional' | 'empathetic' | 'concise')}
            className="rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="professional">Professional</option>
            <option value="empathetic">Empathetic</option>
            <option value="concise">Concise</option>
          </select>
          <button
            type="button"
            onClick={handleRewriteTone}
            disabled={loadingSuggestion}
            className="flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 font-bold text-white hover:bg-blue-700"
          >
            <RefreshCcw className={`h-3.5 w-3.5 ${loadingSuggestion ? 'animate-spin' : ''}`} />
            {isRtl ? 'إعادة صياغة' : 'Rewrite'}
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <select
          onChange={(e) => handleApplyMacro(e.target.value)}
          defaultValue=""
          className="max-w-full flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-[10px] text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          <option value="" disabled>
            {isRtl ? 'رد جاهز...' : 'Insert canned reply...'}
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
    <div className="shrink-0 space-y-3 border-t border-slate-200 bg-slate-50/95 p-3 text-xs font-semibold dark:border-slate-800 dark:bg-slate-900/60 sm:p-4">
      {isDesktop ? (
        advancedToolsBlock
      ) : (
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2 dark:border-slate-800">
          <button
            type="button"
            onClick={handleApplyAISuggestion}
            className="flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-100 px-2 py-2 text-[10px] font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300"
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            {isRtl ? 'اقتراح' : 'Apply AI'}
          </button>
          <button
            type="button"
            onClick={onSummarize}
            className="flex min-h-10 flex-1 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-2 text-[10px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <FileText className="h-3.5 w-3.5 shrink-0" />
            {isRtl ? 'ملخص' : 'Summary'}
          </button>
          <button
            type="button"
            onClick={() => setToolsOpen(true)}
            className="flex min-h-10 shrink-0 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <Wand2 className="h-3.5 w-3.5" />
            {isRtl ? 'أدوات' : 'Tools'}
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
            {isRtl ? 'عميل' : 'Customer'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('note')}
            className={`flex-1 rounded px-2 py-1.5 ${activeTab === 'note' ? 'bg-slate-50 text-purple-600 shadow-sm dark:bg-slate-900' : 'text-slate-500'}`}
          >
            {isRtl ? 'داخلي' : 'Note'}
          </button>
        </div>
      )}

      {!isDesktop && (
        <MobileSheet
          open={toolsOpen}
          onClose={() => setToolsOpen(false)}
          title={isRtl ? 'أدوات الرد الذكي' : 'AI reply workspace'}
          description={isRtl ? 'النبرة، الماكروز، ونوع الإرسال' : 'Tone, macros, and send mode'}
          bodyClassName="max-h-[min(80dvh,560px)]"
        >
          <div className="space-y-4 p-4">{advancedToolsBlock}</div>
        </MobileSheet>
      )}

      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={draftText}
          onChange={(e) => onChangeDraft(e.target.value)}
          placeholder={
            activeTab === 'note'
              ? isRtl
                ? 'ملاحظة داخلية...'
                : 'Write internal team note (hidden from customer)...'
              : isRtl
                ? 'اكتب رد العميل...'
                : 'Write response back to customer...'
          }
          className={`min-w-0 flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-xs font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 ${
            activeTab === 'note' ? 'text-purple-600 dark:text-purple-400' : 'text-slate-800 dark:text-slate-100'
          }`}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSend(draftText, activeTab === 'customer' ? 'chat' : 'note');
            }
          }}
        />
        <button
          type="button"
          onClick={() => onSend(draftText, activeTab === 'customer' ? 'chat' : 'note')}
          className={`shrink-0 rounded-xl p-2.5 text-white shadow-lg transition-all ${
            activeTab === 'note' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          <Sparkles className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
