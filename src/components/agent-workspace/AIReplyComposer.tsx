'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, RefreshCcw, FileText, Wand2, Paperclip, Undo2, ShieldAlert, ShieldCheck, Lock, Unlock, BookOpen, BarChart2, ChevronDown, ChevronUp } from 'lucide-react';
import { useIsDesktopOperational } from '@/hooks/useMediaQuery';
import { MobileSheet } from '@/components/responsive/MobileSheet';
import { translations } from '@/i18n/translations';
import { usePermission } from '@/stores/permissionStore';
import { useConversationStore } from '@/stores/conversationStore';
import { ComposerAttachmentPreview } from './ComposerAttachmentPreview';
import { CopilotVariant } from '@/types';

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
  suggestedReplyText: rawSuggestedReplyText,
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

  // Advanced AI Copilot Interactive States
  const [streamSpeed, setStreamSpeed] = useState<'fast' | 'normal' | 'safe'>('fast');
  const [isLocked, setIsLocked] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [simulatedError, setSimulatedError] = useState('');
  const [streamedSuggestionText, setStreamedSuggestionText] = useState('');

  // Expandable Drawer States
  const [citationsOpen, setCitationsOpen] = useState(false);
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(true);

  // Local PII Masking Scan Result
  const [complianceResult, setComplianceResult] = useState<{ status: 'passed' | 'failed'; message: string }>({
    status: 'passed',
    message: 'PCI/PII Scan: PASSED'
  });

  const variants = store.copilotVariants[activeConversationId] || [];
  const activeVariantIdx = store.activeVariantIndex[activeConversationId] || 0;
  const currentVariant = variants[activeVariantIdx] || null;

  // Auto-generate suggestions on load if empty
  useEffect(() => {
    if (activeConversationId && (!store.copilotVariants[activeConversationId] || store.copilotVariants[activeConversationId].length === 0)) {
      store.generateCopilotSuggestions(activeConversationId);
    }
  }, [activeConversationId]);

  useEffect(() => {
    if (status === 'escalated') {
      setActiveTab('note');
    } else {
      setActiveTab('customer');
    }
  }, [status]);

  useEffect(() => {
    const fullText = getFormattedReplyText();
    if (process.env.NODE_ENV === 'test') {
      setStreamedSuggestionText(fullText);
      return;
    }
    setStreamedSuggestionText('');
    let current = '';
    let index = 0;
    const interval = 10;
    const timer = setInterval(() => {
      if (index < fullText.length) {
        current += fullText[index];
        setStreamedSuggestionText(current);
        index++;
      } else {
        clearInterval(timer);
      }
    }, interval);
    return () => clearInterval(timer);
  }, [activeConversationId, rawSuggestedReplyText, loadingSuggestion, selectedTone, activeVariantIdx, variants.length]);

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

  // Continuous compliance scan on draft text changes (PII/PCI rules)
  useEffect(() => {
    const ccRegex = /\b(?:\d[ -]*?){13,16}\b/; // Credit Card PCI check
    const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b/;   // US SSN PII check
    const saudiIdRegex = /\b[12]\d{9}\b/;       // Saudi National ID check
    const tokenRegex = /\b(?:sec_|token-)[a-zA-Z0-9_-]{12,}\b/; // API Token/Secrets check
    
    if (ccRegex.test(draftText) || ssnRegex.test(draftText) || saudiIdRegex.test(draftText) || tokenRegex.test(draftText)) {
      setComplianceResult({
        status: 'failed',
        message: lang === 'ar' ? 'تحذير: تم الكشف عن بيانات حساسة (PII/Card)' : 'PII Warning: Sensitive Card/SSN detected!'
      });
    } else {
      setComplianceResult({
        status: 'passed',
        message: lang === 'ar' ? 'فحص الامتثال: آمن' : 'PCI/PII Scan: PASSED'
      });
    }
  }, [draftText, lang]);

  // Channel-Aware Formatting Wrapper
  const getFormattedReplyText = (): string => {
    let baseText = rawSuggestedReplyText;
    if (variants.length > 0) {
      if (activeVariantIdx !== 0) {
        baseText = currentVariant.text;
      } else if (!rawSuggestedReplyText || variants.some(v => v.text === rawSuggestedReplyText)) {
        baseText = currentVariant.text;
      }
    }
    
    // Check channel
    if (channel === 'whatsapp') {
      // Concise, bulleted, emojis
      return `💬 *Update:* ${baseText.replace(/policy\s+[a-z0-9-]+/gi, 'policy *ks-1*')} ✅`;
    }
    if (channel === 'email') {
      // Structured formal letter
      return `Dear Customer,\n\nRegarding your inquiry, ${baseText}\n\nRespectfully,\nLiam Bennett\nCustomer Success Team`;
    }
    if (channel === 'voice') {
      // Compact, speech-friendly summary
      return `I can confirm refunds are allowed within 30 days. I have logged a refund exception.`;
    }
    
    return baseText;
  };

  const getSuggestedReply = () => {
    return getFormattedReplyText();
  };

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

  // Upgraded Streaming Generation with Speed Controls
  const streamText = (text: string) => {
    if (!canEdit || isLocked) return;
    if (process.env.NODE_ENV === 'test') {
      onChangeDraft(text);
      setAnnouncement('AI suggestion applied to editor.');
      return;
    }
    if (timerRef.current) clearInterval(timerRef.current);
    
    setAnnouncement('Streaming AI suggestions...');
    
    let current = '';
    let index = 0;
    
    // Speed Mapping
    const speedMap = {
      fast: 10,
      normal: 30,
      safe: 60
    };
    const interval = speedMap[streamSpeed];

    timerRef.current = setInterval(() => {
      if (index < text.length) {
        current += text[index];
        onChangeDraft(current);
        index++;
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        setAnnouncement('AI suggestion stream completed.');
      }
    }, interval);
  };

  const macros = [
    { label: 'Refund Policy Warning', value: 'Under standard Return & Exchange policy ks-1, refunds are limited to 30 days. However, since the unit was received damaged, we can process a full exception for you.' },
    { label: 'Escalation Alert', value: 'I have logged a priority escalation ticket with our tier 2 security infrastructure team. The SLA target is 2 hours. I will update you as soon as they report back.' },
    { label: 'Payment Sync Complete', value: 'We confirmed payment INV-2026-7891 wire settlement. Your workspace subscription has been refilled successfully.' }
  ];

  const handleApplyMacro = (val: string) => {
    if (!canEdit || isLocked) return;
    store.trackMacroInsertion(activeConversationId, val);
    insertTextAtCursor(val);
  };

  const handleRewriteTone = () => {
    if (!canEdit || isLocked) return;
    setLoadingSuggestion(true);
    setSimulatedError('');
    store.setRewriteState(activeConversationId, 'rewriting');
    
    const runRewrite = () => {
      let result = draftText || getFormattedReplyText();
      
      if (result.toLowerCase().includes('fail')) {
        setSimulatedError('Failed to contact LLM provider. Server returned status 503.');
        setLoadingSuggestion(false);
        store.setRewriteState(activeConversationId, 'error');
        setAnnouncement('AI rewrite failed.');
        return;
      }

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
      setAnnouncement('AI rewrite applied.');
      onChangeDraft(result);
    };

    if (process.env.NODE_ENV === 'test') {
      runRewrite();
    } else {
      setTimeout(runRewrite, 500);
    }
  };

  const handleApplyAISuggestion = () => {
    if (!canEdit || isLocked) return;
    let textToInsert = getFormattedReplyText();
    
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

  const handleRetrySuggestion = () => {
    setLoadingSuggestion(true);
    setSimulatedError('');
    setAnnouncement('Retrying AI generation...');

    const delay = process.env.NODE_ENV === 'test' ? 1 : 800;
    setTimeout(() => {
      store.generateCopilotSuggestions(activeConversationId);
      setLoadingSuggestion(false);
      setAnnouncement('AI suggestions regenerated.');
    }, delay);
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

  // Mask PII/PCI helper
  const handleMaskPII = () => {
    const masked = draftText
      .replace(/\b(?:\d[ -]*?){12}(\d{4})\b/g, '****-****-****-$1')
      .replace(/\b\d{3}-\d{2}-(\d{4})\b/g, '***-**-$1')
      .replace(/\b[12]\d{5}(\d{4})\b/g, 'ID-******-$1')
      .replace(/\b(sec_|token-)[a-zA-Z0-9_-]{10,}\b/g, 'SECRET-REF-MASKED');
    onChangeDraft(masked);
    setAnnouncement('PII data masked successfully.');
  };

  const handleVariantSelect = (idx: number, varText: string) => {
    if (!canEdit || isLocked) return;
    store.setActiveVariantIndex(activeConversationId, idx);
    onChangeDraft(varText);
    const toneMap: Record<string, any> = {
      professional: 'professional',
      empathetic: 'empathetic',
      concise: 'concise',
      'escalation-safe': 'escalation-ready'
    };
    const correspondingTone = toneMap[variants[idx]?.tone] || 'professional';
    setSelectedTone(correspondingTone);
  };

  const toneLabel = (tone: string) => {
    const labels: Record<string, string> = {
      professional: lang === 'ar' ? 'مهني' : 'Professional',
      empathetic: lang === 'ar' ? 'تعاطفي' : 'Empathetic',
      executive: lang === 'ar' ? 'تنفيذي' : 'Executive',
      concise: lang === 'ar' ? 'موجز' : 'Concise',
      'escalation-safe': lang === 'ar' ? 'تصعيد آمن' : 'Escalation-Safe'
    };
    return labels[tone] || tone;
  };

  const advancedToolsBlock = (
    <>
      {/* Live Accessibility Screen-Reader Announcer Box */}
      <div className="sr-only" aria-live="polite">{announcement}</div>

      <div className="flex flex-col gap-2.5 border-b border-slate-200 pb-2.5 dark:border-slate-800">
        
        {/* Variant Tabs Selectors */}
        <div className="flex flex-col gap-1 text-start select-none">
          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Suggested Reply Variants</span>
          <div className="flex flex-wrap gap-1 bg-slate-200 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-300 dark:border-slate-700">
            {variants.map((v, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleVariantSelect(idx, v.text)}
                disabled={!canEdit || isLocked}
                className={`flex-1 rounded px-2.5 py-1 text-[10px] font-extrabold capitalize transition-all cursor-pointer ${
                  activeVariantIdx === idx
                    ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
              >
                {toneLabel(v.tone)}
              </button>
            ))}
            {variants.length === 0 && (
              <span className="text-slate-500 italic p-1 text-[10px]">Loading Copilot variants...</span>
            )}
          </div>
        </div>

        {/* Suggestion header and Skeletons/Error block */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 shrink-0 text-blue-500" />
            <span className="text-slate-600 dark:text-slate-400 font-bold">{t.agentWorkspace.aiComposer.aiSuggestedAnswer}</span>
            
            <button
              type="button"
              onClick={handleApplyAISuggestion}
              disabled={!canEdit || (store.copilotLoadingStates[activeConversationId] && !rawSuggestedReplyText) || loadingSuggestion || isLocked}
              className={`rounded bg-blue-100 px-2 py-1 text-[10px] font-bold text-blue-800 hover:bg-blue-200 dark:bg-blue-950 dark:text-blue-300 transition-all cursor-pointer ${!canEdit || (store.copilotLoadingStates[activeConversationId] && !rawSuggestedReplyText) || loadingSuggestion || isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {t.agentWorkspace.aiComposer.applySuggestion}
            </button>
            
            {/* Retry / Regenerate button */}
            <button
              type="button"
              onClick={handleRetrySuggestion}
              title="Regenerate/Shuffle suggestions"
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500 dark:text-slate-400 cursor-pointer"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Speed controls */}
          <div className="flex items-center gap-1.5 text-[10px] font-bold select-none">
            <span className="text-slate-400 uppercase font-mono">{lang === 'ar' ? 'السرعة' : 'Speed'}</span>
            <select
              value={streamSpeed}
              onChange={(e) => setStreamSpeed(e.target.value as any)}
              aria-label={lang === 'ar' ? 'سرعة البث' : 'Streaming speed'}
              className="rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-slate-700 dark:border-slate-850 dark:bg-slate-900 dark:text-slate-200 font-bold"
            >
              <option value="fast">{lang === 'ar' ? 'سريع' : 'Fast (10ms)'}</option>
              <option value="normal">{lang === 'ar' ? 'عادي' : 'Normal (30ms)'}</option>
              <option value="safe">{lang === 'ar' ? 'آمن' : 'Safe (60ms)'}</option>
            </select>
          </div>
        </div>

        {/* Loading Skeletons */}
        {(store.copilotLoadingStates[activeConversationId] || loadingSuggestion) ? (
          <div className="space-y-1.5 py-1.5 select-none animate-pulse">
            <div className="h-3 bg-slate-200 dark:bg-slate-850 rounded w-11/12" />
            <div className="h-3 bg-slate-200 dark:bg-slate-850 rounded w-5/6" />
          </div>
        ) : simulatedError ? (
          /* Error banner */
          <div className="flex items-center gap-2 p-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400 text-start">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{simulatedError}</span>
          </div>
        ) : (
          /* Answer Text preview */
          <div className="text-slate-700 dark:text-slate-300 leading-relaxed pt-0.5 space-y-2 text-start">
            <p className="bg-blue-500/5 dark:bg-blue-950/10 p-2 border border-blue-500/10 rounded-xl leading-normal text-[11.5px] italic">
              &quot;{streamedSuggestionText || getFormattedReplyText()}&quot;
            </p>
          </div>
        )}

        {/* Expandable Citation Drawer Widget */}
        {currentVariant && (
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950/20 shadow-xs">
            <button
              type="button"
              onClick={() => setCitationsOpen(!citationsOpen)}
              className="w-full flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900 text-[10px] font-bold text-slate-600 dark:text-slate-400 border-b border-slate-150 dark:border-slate-800 focus:outline-none"
              aria-expanded={citationsOpen}
            >
              <span className="flex items-center gap-1.5 uppercase font-mono">
                <BookOpen className="w-3.5 h-3.5 text-purple-500" />
                Citation Source Drawer
              </span>
              {citationsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {citationsOpen && (
              <div className="p-3 space-y-2 text-start leading-normal">
                {currentVariant.citations.map((cit, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-200 dark:border-slate-850 space-y-1">
                    <div className="flex justify-between items-center text-[9px] font-mono select-none">
                      <span className="font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-900">
                        📄 {cit.source}
                      </span>
                      <span className="text-slate-400">Similarity: {cit.similarity}% • KB-ID: {cit.kbId}</span>
                    </div>
                    <p className="text-[10px] font-mono text-slate-600 dark:text-slate-400 italic bg-white dark:bg-slate-900 p-1.5 rounded border border-slate-100 dark:border-slate-800">
                      &quot;{cit.chunk}&quot;
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AI Confidence & Diagnostics Panel */}
        {currentVariant && (
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950/20 shadow-xs">
            <button
              type="button"
              onClick={() => setDiagnosticsOpen(!diagnosticsOpen)}
              className="w-full flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900 text-[10px] font-bold text-slate-600 dark:text-slate-400 border-b border-slate-150 dark:border-slate-800 focus:outline-none"
              aria-expanded={diagnosticsOpen}
            >
              <span className="flex items-center gap-1.5 uppercase font-mono">
                <BarChart2 className="w-3.5 h-3.5 text-blue-500" />
                AI Response Diagnostics &amp; Confidence Scores
              </span>
              {diagnosticsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {diagnosticsOpen && (
              <div className="p-3 text-start leading-normal space-y-3">
                {/* Confidence Metric Strip */}
                <div className="grid grid-cols-4 gap-1.5 text-center font-mono select-none">
                  <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-850">
                    <span className="text-[8px] text-slate-400 block uppercase">Confidence</span>
                    <strong className="text-[11px] text-emerald-600 dark:text-emerald-400">{currentVariant.confidence}%</strong>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-850">
                    <span className="text-[8px] text-slate-400 block uppercase">Hallucination</span>
                    <strong className={`text-[11px] uppercase ${currentVariant.hallucinationRisk === 'high' ? 'text-rose-600' : 'text-slate-800 dark:text-white'}`}>{currentVariant.hallucinationRisk}</strong>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-850">
                    <span className="text-[8px] text-slate-400 block uppercase">Compliance</span>
                    <strong className="text-[11px] text-slate-800 dark:text-white">{currentVariant.complianceConfidence}%</strong>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-850">
                    <span className="text-[8px] text-slate-400 block uppercase">Tone Align</span>
                    <strong className="text-[11px] text-slate-800 dark:text-white">{currentVariant.toneAlignmentScore}%</strong>
                  </div>
                </div>

                {/* Response Quality Metrics details */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono leading-normal select-none">
                  <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-150 dark:border-slate-850 flex justify-between">
                    <span className="text-slate-400">Readability:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{currentVariant.readability}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-150 dark:border-slate-850 flex justify-between">
                    <span className="text-slate-400">Empathy Score:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{currentVariant.empathyScore}%</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-150 dark:border-slate-850 flex justify-between">
                    <span className="text-slate-400">Professionalism:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{currentVariant.professionalismScore}%</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-150 dark:border-slate-850 flex justify-between">
                    <span className="text-slate-400">Resolution Rate:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{currentVariant.resolutionLikelihood}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex rounded-lg border border-slate-300 bg-slate-200 p-0.5 text-[10px] font-bold dark:border-slate-700 dark:bg-slate-800 select-none">
          <button
            type="button"
            onClick={() => setActiveTab('customer')}
            className={`rounded px-3 py-1 transition-all cursor-pointer ${activeTab === 'customer' ? 'bg-slate-50 text-blue-600 shadow-sm dark:bg-slate-900' : 'text-slate-500 dark:text-slate-400'}`}
          >
            {t.agentWorkspace.aiComposer.customer}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('note')}
            className={`rounded px-3 py-1 transition-all cursor-pointer ${activeTab === 'note' ? 'bg-slate-50 text-purple-600 shadow-sm dark:bg-slate-900' : 'text-slate-500 dark:text-slate-400'}`}
          >
            {t.agentWorkspace.aiComposer.internalNote}
          </button>
        </div>

        {/* Lock mode and Tone select */}
        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold select-none">
          {/* Lock mode toggle */}
          <button
            type="button"
            onClick={() => {
              setIsLocked(!isLocked);
              setAnnouncement(isLocked ? 'Draft unlocked.' : 'Draft locked to prevent manual modifications.');
            }}
            className={`p-1 border rounded-lg flex items-center justify-center cursor-pointer ${
              isLocked
                ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/20'
                : 'border-slate-200 bg-white text-slate-550 dark:border-slate-850 dark:bg-slate-900'
            }`}
            title={isLocked ? 'Unlock Editor' : 'Lock Editor (PCI/Compliance Mode)'}
          >
            {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>

          <span className="font-mono font-bold uppercase text-slate-400">{t.agentWorkspace.aiComposer.tone}</span>
          <select
            value={selectedTone}
            onChange={(e) => setSelectedTone(e.target.value as any)}
            disabled={!canEdit || isLocked}
            aria-label={lang === 'ar' ? 'حدد نبرة الرد' : 'Select response tone'}
            className={`rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 cursor-pointer ${!canEdit || isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
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
            disabled={loadingSuggestion || !canEdit || isLocked}
            aria-label={lang === 'ar' ? 'إعادة صياغة النص' : 'Rewrite response tone'}
            className={`flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 font-bold text-white hover:bg-blue-700 cursor-pointer ${!canEdit || isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <RefreshCcw className={`h-3.5 w-3.5 ${loadingSuggestion ? 'animate-spin' : ''}`} />
            {t.agentWorkspace.aiComposer.rewrite}
          </button>
        </div>
      </div>

      {/* Compliance scan status indicator */}
      <div className={`flex items-center justify-between gap-3 p-2 border rounded-xl leading-normal text-[10.5px] bg-slate-50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-850`}>
        <div className="flex items-center gap-1.5 font-bold text-start">
          {complianceResult.status === 'passed' ? (
            <>
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-emerald-700 dark:text-emerald-400">{complianceResult.message}</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-4 h-4 text-rose-605 shrink-0 animate-bounce" />
              <span className="text-rose-700 dark:text-rose-400">{complianceResult.message}</span>
            </>
          )}
        </div>
        
        {complianceResult.status === 'failed' && (
          <button
            type="button"
            onClick={handleMaskPII}
            className="rounded bg-rose-100 dark:bg-rose-950 px-2.5 py-0.5 text-[9px] font-bold text-rose-700 dark:text-rose-300 border border-rose-250 cursor-pointer shrink-0"
          >
            {lang === 'ar' ? 'تشفير فوري للامتثال' : 'Mask PII Data'}
          </button>
        )}
      </div>

      <div className="flex gap-2 min-w-0 select-none">
        <select
          onChange={(e) => handleApplyMacro(e.target.value)}
          defaultValue=""
          disabled={!canEdit || isLocked}
          aria-label={lang === 'ar' ? 'أدخل رداً جاهزاً' : 'Insert canned reply macro'}
          className={`max-w-full min-w-0 flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-[10px] text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 cursor-pointer ${!canEdit || isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
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
            className="flex items-center gap-1 rounded bg-blue-100 dark:bg-blue-900 px-2 py-1 text-[9px] font-bold text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-855 cursor-pointer animate-pulse"
          >
            <Undo2 className="h-3 w-3" />
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
            disabled={!canEdit || (store.copilotLoadingStates[activeConversationId] && !rawSuggestedReplyText) || isLocked}
            className={`flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-100 px-2 py-2 text-[10px] font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300 cursor-pointer ${!canEdit || (store.copilotLoadingStates[activeConversationId] && !rawSuggestedReplyText) || isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            {store.copilotLoadingStates[activeConversationId] ? 'Generating...' : t.agentWorkspace.aiComposer.applyAi}
          </button>
          <button
            type="button"
            onClick={onSummarize}
            className="flex min-h-10 flex-1 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-2 text-[10px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5 shrink-0" />
            {t.agentWorkspace.aiComposer.summary}
          </button>
          <button
            type="button"
            onClick={() => setToolsOpen(true)}
            className="flex min-h-10 shrink-0 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 cursor-pointer"
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
            className={`flex-1 rounded px-2 py-1.5 cursor-pointer ${activeTab === 'customer' ? 'bg-slate-50 text-blue-600 shadow-sm dark:bg-slate-900' : 'text-slate-550'}`}
          >
            {t.agentWorkspace.aiComposer.customer}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('note')}
            className={`flex-1 rounded px-2 py-1.5 cursor-pointer ${activeTab === 'note' ? 'bg-slate-50 text-purple-600 shadow-sm dark:bg-slate-900' : 'text-slate-550'}`}
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
          <p className="font-normal leading-normal opacity-90 text-start">
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
                if (!canEdit || isLocked) return;
                streamText(qr.value);
              }}
              disabled={!canEdit || isLocked}
              className={`border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-955/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 px-2.5 py-0.5 rounded-full text-[10px] cursor-pointer font-bold transition-all shadow-xs ${!canEdit || isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {qr.label}
            </button>
          ))}
        </div>
      )}

      {channel === 'email' ? (
        <div className="flex flex-col gap-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs w-full">
          <div className="flex flex-col gap-1 border-b border-slate-100 dark:border-slate-800 pb-2 text-[10px] text-slate-500 dark:text-slate-405 font-mono text-start">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-400 font-mono font-bold">To:</span>
              <span className="text-slate-700 dark:text-slate-300 font-bold">client@vertex-logistics.com</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-400 font-mono font-bold">CC:</span>
              <span className="text-slate-700 dark:text-slate-300 font-bold">accounts-audit@vertex-logistics.com; dispatch-ops@vertex-logistics.com</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-400 font-mono font-bold">Subject:</span>
              <span className="text-slate-700 dark:text-slate-300 truncate font-bold">
                Re: Inquiry regarding payment audit for INV-2026-7891
              </span>
            </div>
          </div>
          <textarea
            ref={emailTextareaRef}
            value={draftText}
            onChange={(e) => {
              if (!canEdit || isLocked) return;
              onChangeDraft(e.target.value);
            }}
            disabled={!canEdit}
            readOnly={isLocked}
            placeholder={
              activeTab === 'note'
                ? t.agentWorkspace.aiComposer.writeInternalNote
                : 'Write structured formal response back to customer...'
            }
            aria-label={activeTab === 'note' ? (lang === 'ar' ? 'ملاحظة داخلية' : 'Internal note draft') : (lang === 'ar' ? 'رد البريد الإلكتروني' : 'Email response draft')}
            rows={5}
            className={`min-w-0 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-xs font-semibold focus:border-violet-500 focus:outline-none dark:border-slate-800 dark:bg-slate-955/40 resize-y ${
              activeTab === 'note' ? 'text-purple-600 dark:text-purple-400' : 'text-slate-800 dark:text-slate-100'
            } ${!canEdit || isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
          />
          <div className="flex items-center justify-between pt-1 select-none">
            <div className="flex gap-1.5 text-[9px] text-slate-500">
              <span>✍️ HTML editor • signature automatically appended</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!canEdit || isLocked) return;
                  onChangeDraft('');
                }}
                disabled={!canEdit || isLocked}
                className={`px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-[10px] text-slate-650 dark:text-slate-400 font-bold transition-all ${!canEdit || isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!canEdit) return;
                  onSend(draftText, activeTab === 'customer' ? 'chat' : 'note');
                }}
                disabled={!canEdit || (!draftText.trim() && !(store.stagedAttachments[activeConversationId] || []).length)}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-[10px] font-bold text-white shadow-sm transition-all ${
                  activeTab === 'note' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-violet-600 hover:bg-violet-700'
                } ${!canEdit || (!draftText.trim() && !(store.stagedAttachments[activeConversationId] || []).length) ? 'opacity-60 cursor-not-allowed' : ''}`}
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
            disabled={!canEdit || isLocked}
            aria-label={lang === 'ar' ? 'إرفاق ملف' : 'Attach file'}
            className={`shrink-0 rounded-xl p-2.5 border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${!canEdit || isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <Paperclip className="h-4 w-4" />
          </button>
          
          <textarea
            ref={chatTextareaRef}
            rows={1}
            value={draftText}
            onChange={(e) => {
              if (!canEdit || isLocked) return;
              onChangeDraft(e.target.value);
            }}
            disabled={!canEdit}
            readOnly={isLocked}
            placeholder={
              activeTab === 'note'
                ? t.agentWorkspace.aiComposer.writeInternalNote
                : t.agentWorkspace.aiComposer.writeResponse
            }
            aria-label={activeTab === 'note' ? (lang === 'ar' ? 'ملاحظة داخلية' : 'Internal note draft') : (lang === 'ar' ? 'رد المحادثة' : 'Chat response draft')}
            className={`min-w-0 flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-xs font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 resize-none ${
              activeTab === 'note'
                ? 'text-purple-650 dark:text-purple-400'
                : channel === 'whatsapp'
                ? 'focus:border-emerald-500 text-slate-800 dark:text-slate-100'
                : 'text-slate-800 dark:text-slate-100'
            } ${!canEdit || isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!canEdit || isLocked) return;
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
          >
            <Sparkles className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
