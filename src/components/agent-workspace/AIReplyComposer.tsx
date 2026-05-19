import React, { useState } from 'react';
import { Sparkles, RefreshCcw, FileText } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'customer' | 'note'>('customer');
  const [selectedTone, setSelectedTone] = useState<'professional' | 'empathetic' | 'concise'>('professional');
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);

  // Canned Macros
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

  return (
    <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 shrink-0 text-xs font-semibold space-y-3">
      
      {/* Top action row: AI Assistant suggest or Summarize */}
      <div className="flex flex-wrap justify-between items-center gap-2 pb-2.5 border-b border-slate-200 dark:border-slate-850">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">AI Suggested Answer:</span>
          <button
            onClick={handleApplyAISuggestion}
            className="px-2 py-1 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 rounded font-bold hover:bg-blue-200 text-[10px]"
          >
            Apply Default Suggestion
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onSummarize}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-200 hover:bg-slate-350 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[10px]"
          >
            <FileText className="w-3.5 h-3.5" />
            Summarize Context
          </button>
        </div>
      </div>

      {/* Tone selection tools */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex bg-slate-200 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-250 dark:border-slate-700 text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('customer')}
            className={`px-3 py-1 rounded transition-all ${activeTab === 'customer' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-550'}`}
          >
            Send Customer
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('note')}
            className={`px-3 py-1 rounded transition-all ${activeTab === 'note' ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-sm' : 'text-slate-550'}`}
          >
            Internal Note
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-[10px]">
          <span className="text-slate-400 font-bold uppercase font-mono">Tone:</span>
          <select
            value={selectedTone}
            onChange={(e) => setSelectedTone(e.target.value as 'professional' | 'empathetic' | 'concise')}
            className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg"
          >
            <option value="professional">Professional</option>
            <option value="empathetic">Empathetic</option>
            <option value="concise">Concise</option>
          </select>
          <button
            onClick={handleRewriteTone}
            disabled={loadingSuggestion}
            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1 font-bold"
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${loadingSuggestion ? 'animate-spin' : ''}`} />
            Rewrite
          </button>
        </div>
      </div>

      {/* Macros dropdown and compose wrapper */}
      <div className="flex gap-2">
        <select
          onChange={(e) => handleApplyMacro(e.target.value)}
          defaultValue=""
          className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl max-w-[200px] text-[10px] text-slate-650"
        >
          <option value="" disabled>Insert Canned Reply...</option>
          {macros.map((m, idx) => (
            <option key={idx} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      {/* Core composer layout */}
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={draftText}
          onChange={(e) => onChangeDraft(e.target.value)}
          placeholder={
            activeTab === 'note'
              ? 'Write internal team note (hidden from customer)...'
              : 'Write response back to customer...'
          }
          className={`flex-1 bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 font-semibold ${
            activeTab === 'note' ? 'text-purple-600 dark:text-purple-400' : 'text-slate-800 dark:text-slate-100'
          }`}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSend(draftText, activeTab === 'customer' ? 'chat' : 'note');
            }
          }}
        />
        <button
          onClick={() => onSend(draftText, activeTab === 'customer' ? 'chat' : 'note')}
          className={`p-2.5 text-white rounded-xl shadow-lg transition-all ${
            activeTab === 'note' ? 'bg-purple-650 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          <Sparkles className="w-4.5 h-4.5" />
        </button>
      </div>
    </div>
  );
}
