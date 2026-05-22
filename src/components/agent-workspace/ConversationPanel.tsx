'use client';

import React, { useRef, useEffect, useState } from 'react';
import { ArrowRightLeft, CheckCircle, Pause, Play, Users, Mail, Globe, MessageSquare, AlertOctagon, User, Clock, FileText } from 'lucide-react';
import { Conversation } from '@/types';
import { ConversationMessage } from './ConversationMessage';
import { ConversationTimeline } from './ConversationTimeline';
import { AIReplyComposer } from './AIReplyComposer';
import { CoachingWidget } from './CoachingWidget';
import { TypingIndicator } from './TypingIndicator';
import { translations } from '@/i18n/translations';

interface ConversationPanelProps {
  activeChat: Conversation;
  draftText: string;
  onChangeDraft: (val: string) => void;
  onSend: (text: string, type: 'chat' | 'note') => void;
  onTransferClick: () => void;
  onConferenceClick: () => void;
  onResolveClick: () => void;
  onToggleHold: () => void;
  isHold: boolean;
  whisper: string;
  onCloseWhisper: () => void;
  lang: 'en' | 'ar';
  onSummarize: () => void;
}

export function ConversationPanel({
  activeChat,
  draftText,
  onChangeDraft,
  onSend,
  onTransferClick,
  onConferenceClick,
  onResolveClick,
  onToggleHold,
  isHold,
  whisper,
  onCloseWhisper,
  lang,
  onSummarize
}: ConversationPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const t = translations[lang];
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [isCustomerTyping, setIsCustomerTyping] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat.messages, isCustomerTyping]);

  useEffect(() => {
    if (activeChat.status === 'resolved') {
      setIsCustomerTyping(false);
      return;
    }
    const isChat = activeChat.channel === 'whatsapp' || activeChat.channel === 'web';
    if (!isChat) {
      setIsCustomerTyping(false);
      return;
    }

    setIsCustomerTyping(true);
    const interval = setInterval(() => {
      setIsCustomerTyping((prev) => !prev);
    }, 6000);

    return () => clearInterval(interval);
  }, [activeChat.id, activeChat.channel, activeChat.status]);

  const getSuggestedReply = () => {
    if (activeChat.id === 'conv-102') {
      return 'Under Return Policy (ks-1), refunds are allowed within 30 days. I have logged a damages exception on ORD-99881 and initiated a credit.';
    }
    if (activeChat.id === 'conv-101') {
      return 'أهلاً بك أمينة. قمت بتحديث رقم الهوية الضريبية وتعديل عنوان التوصيل للطلبية رقم ORD-77612.';
    }
    return 'Thank you for calling support. Let me check the database system to confirm your active service key.';
  };

  const handleApplyWhisper = (txt: string) => {
    onChangeDraft(txt);
  };

  const primaryActions = (
    <>
      <button
        type="button"
        onClick={onToggleHold}
        className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[10px] font-bold transition-all ${
          isHold
            ? 'border-rose-600 bg-rose-500 text-white hover:bg-rose-600'
            : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
        }`}
      >
        {isHold ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
        {isHold ? t.agentWorkspace.conversation.resume : t.agentWorkspace.conversation.hold}
      </button>
      <button
        type="button"
        onClick={onResolveClick}
        disabled={activeChat.status === 'resolved'}
        className="flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-[10px] font-bold text-white shadow-sm transition-all hover:bg-emerald-700 disabled:opacity-40"
      >
        <CheckCircle className="h-3.5 w-3.5" />
        {t.agentWorkspace.conversation.resolve}
      </button>
    </>
  );

  const secondaryActions = (
    <>
      <button
        type="button"
        onClick={onConferenceClick}
        className="flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-1.5 text-[10px] font-bold text-slate-700 transition-all hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
      >
        <Users className="h-3.5 w-3.5" />
        {t.agentWorkspace.conversation.conference}
      </button>
      <button
        type="button"
        onClick={onTransferClick}
        className="flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-1.5 text-[10px] font-bold text-slate-700 transition-all hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
      >
        <ArrowRightLeft className="h-3.5 w-3.5" />
        {t.agentWorkspace.conversation.transfer}
      </button>
    </>
  );

  const renderHeaderContent = () => {
    const isEscalated = activeChat.status === 'escalated';
    
    if (isEscalated) {
      return (
        <div className="flex items-center gap-3 py-1.5 min-w-0">
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center">
              {activeChat.customerAvatar ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={activeChat.customerAvatar} alt={activeChat.customerName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 bg-rose-500 animate-pulse" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5 text-xs truncate">
              {activeChat.customerName}
              <span className="shrink-0 rounded bg-rose-500/10 px-1.5 py-0.5 font-bold text-[8px] text-rose-600 dark:text-rose-400 animate-pulse border border-rose-200 dark:border-rose-900">
                CRITICAL ESCALATION
              </span>
            </h3>
            <p className="text-[10px] font-normal text-rose-500 dark:text-rose-400 font-mono mt-0.5 truncate">
              P1 Incident • SLA Target {activeChat.slaDeadline}
            </p>
          </div>
        </div>
      );
    }

    if (activeChat.channel === 'whatsapp') {
      return (
        <div className="flex items-center gap-3 py-1.5 min-w-0">
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center">
              {activeChat.customerAvatar ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={activeChat.customerAvatar} alt={activeChat.customerName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-500" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5 text-xs truncate">
              {activeChat.customerName}
              <span className="shrink-0 rounded bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[8px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                WHATSAPP
              </span>
            </h3>
            <p className="text-[10px] font-normal text-slate-400 mt-0.5 flex items-center gap-1 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Online • Last seen today at {activeChat.lastMessageTime}</span>
            </p>
          </div>
        </div>
      );
    }

    if (activeChat.channel === 'email') {
      return (
        <div className="flex flex-col py-2 w-full max-w-full">
          <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800 pb-1.5 mb-1.5 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Mail className="w-4 h-4 text-violet-500 shrink-0" />
              <h3 className="font-extrabold text-slate-800 dark:text-white text-xs truncate">
                {activeChat.id === 'conv-103' ? 'Subject: Inquiry regarding payment audit for INV-2026-7891' : `Subject: Support Case inquiry ticket - #${activeChat.id}`}
              </h3>
            </div>
            <span className="shrink-0 rounded bg-violet-500/10 px-1.5 py-0.5 font-mono text-[8px] font-bold text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-900">
              EMAIL THREAD
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-500 dark:text-slate-400 font-normal">
            <span><strong>From:</strong> {activeChat.customerName} &lt;{activeChat.customerEmail || 'juliana.c@vertex-logistics.com'}&gt;</span>
            <span><strong>To:</strong> Customer Care &lt;support@enterprise.com&gt;</span>
            <button 
              type="button" 
              onClick={() => setShowCcBcc(!showCcBcc)}
              className="text-blue-500 hover:underline font-bold text-[9px] uppercase tracking-wider ml-1"
            >
              {showCcBcc ? '[Hide CC/BCC]' : '[Show CC/BCC]'}
            </button>
          </div>
          {showCcBcc && (
            <div className="mt-1.5 p-2 bg-slate-100 dark:bg-slate-900 rounded-lg text-[9px] text-slate-500 dark:text-slate-400 font-mono border border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2 duration-200 w-full">
              <strong>CC:</strong> accounts-audit@vertex-logistics.com; dispatch-ops@vertex-logistics.com
            </div>
          )}
        </div>
      );
    }

    // Default Web Chat
    return (
      <div className="flex items-center gap-3 py-1.5 min-w-0">
        <div className="relative shrink-0">
          <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center">
            {activeChat.customerAvatar ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={activeChat.customerAvatar} alt={activeChat.customerName} className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5 text-xs truncate">
            {activeChat.customerName}
            <span className="shrink-0 rounded bg-sky-500/10 px-1.5 py-0.5 font-mono text-[8px] font-bold text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-900">
              WEB CHAT
            </span>
          </h3>
          <p className="text-[10px] font-normal text-slate-400 mt-0.5 truncate">
            Active browser-chat widget session
          </p>
        </div>
      </div>
    );
  };

  const renderEscalationSidebar = () => {
    return (
      <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 bg-rose-500/5 p-4 space-y-4 overflow-y-auto shrink-0 animate-in slide-in-from-right-5 duration-300 md:h-full">
        <div className="space-y-1">
          <span className="text-[9px] font-bold uppercase tracking-wider text-rose-500 block">Incident Context</span>
          <h4 className="font-extrabold text-slate-800 dark:text-white text-xs">Incident Case INC-99881</h4>
        </div>
        
        <div className="space-y-2.5">
          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
            <span className="text-[8px] text-slate-400 dark:text-slate-500 block uppercase font-mono font-bold">Severity Level</span>
            <div className="flex items-center gap-1 text-rose-600 font-extrabold text-[10px]">
              <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
              <span>P1 - Critical Priority</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
            <span className="text-[8px] text-slate-400 dark:text-slate-500 block uppercase font-mono font-bold">SLA Performance</span>
            <div className="text-rose-600 font-extrabold text-[10px] animate-pulse">
              BREACHED (Deadline {activeChat.slaDeadline})
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-2">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Supervisor Consultation</span>
          <div className="bg-amber-500/10 border border-amber-300/30 rounded-xl p-2.5 text-[10px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            <span className="font-extrabold block text-amber-600 dark:text-amber-400 text-[9px] mb-1">Supervisor Notes (Nadia V.)</span>
            "OAuth token mismatch resolved in Dubai ERP registry. Ensure client re-authenticates to trigger RAG index lookup."
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-2">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Incident Audit Trail</span>
          <div className="space-y-3 font-mono text-[9px] text-slate-500 dark:text-slate-400 leading-tight">
            <div className="flex gap-2">
              <span className="text-slate-400 font-bold shrink-0">14:15</span>
              <span>Incident created by customer</span>
            </div>
            <div className="flex gap-2">
              <span className="text-slate-400 font-bold shrink-0">14:18</span>
              <span>Bot classified as oauth-guardrail-breach</span>
            </div>
            <div className="flex gap-2">
              <span className="text-slate-400 font-bold shrink-0">14:19</span>
              <span>Allocated to queue Tier 2</span>
            </div>
            <div className="flex gap-2 text-rose-500 font-bold">
              <span className="shrink-0">14:45</span>
              <span>SLA Resolution deadline breached</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const isEscalated = activeChat.status === 'escalated';

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col justify-between bg-slate-50/20 text-xs font-semibold dark:bg-transparent">
      {/* Top Header Row */}
      <div className="z-10 flex shrink-0 flex-col gap-2 border-b border-slate-200 bg-slate-50/95 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/90 sm:px-6 sm:py-0 lg:h-14 lg:flex-row lg:items-center lg:justify-between lg:gap-3">
        <div className="flex-1 min-w-0">
          {renderHeaderContent()}
        </div>

        {/* Desktop: all actions in one row */}
        <div className="hidden items-center gap-2 lg:flex shrink-0">
          {primaryActions}
          {secondaryActions}
        </div>

        {/* Mobile / tablet: primary row + horizontal overflow for secondary */}
        <div className="flex w-full min-w-0 flex-wrap items-center gap-2 lg:hidden shrink-0">
          {primaryActions}
          <div className="flex min-w-0 flex-1 justify-end gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden">
            {secondaryActions}
          </div>
        </div>
      </div>

      {/* Workspace Split Pane: Timeline + Incident Sidebar */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
        {/* Timeline Message Log */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* Escalation Warning Sticky Banner */}
          {isEscalated && (
            <div className="border border-rose-300 bg-rose-50/80 dark:border-rose-900 dark:bg-rose-950/30 rounded-2xl p-4 flex items-start gap-3 text-rose-900 dark:text-rose-300 shadow-sm animate-in slide-in-from-top-2 duration-300">
              <AlertOctagon className="w-5 h-5 text-rose-600 dark:text-rose-500 shrink-0 mt-0.5 animate-bounce" />
              <div className="space-y-1 text-xs">
                <p className="font-extrabold uppercase tracking-wider text-[10px] text-rose-700 dark:text-rose-400">
                  Critical SLA Breach Alert
                </p>
                <p className="font-normal">
                  This conversation is currently flagged as <strong>ESCALATED (Level-2 Engineering Desk)</strong>. The SLA response deadline ({activeChat.slaDeadline}) is in a <strong>{activeChat.slaStatus.toUpperCase()}</strong> status.
                </p>
                <p className="text-[10px] opacity-75 font-mono">
                  Operational status: Monitored by Supervisor Nadia Vance • Internal logs recommended
                </p>
              </div>
            </div>
          )}

          {/* Web Chat Session Welcome Banner */}
          {activeChat.channel === 'web' && !isEscalated && (
            <div className="border border-sky-200 bg-sky-50 dark:border-sky-950 dark:bg-sky-950/20 rounded-xl p-3 flex items-center gap-2.5 text-sky-950 dark:text-sky-300 text-[10px] font-medium font-sans">
              <Globe className="w-4 h-4 text-sky-500 shrink-0" />
              <div>
                <strong>Live Chat Widget Hooked:</strong> Conversational handoff from Farah AI bot complete. Connection ID: <code>wc-3901-live</code>.
              </div>
            </div>
          )}

          {/* WhatsApp Security Encryption Banner */}
          {activeChat.channel === 'whatsapp' && (
            <div className="mx-auto my-1 bg-amber-50 dark:bg-slate-800/80 border border-amber-200/50 dark:border-slate-700/50 rounded-xl px-3 py-1.5 text-center text-[10px] font-normal text-slate-600 dark:text-slate-300 max-w-sm leading-normal shadow-sm">
              🔒 Messages are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.
            </div>
          )}

          {isHold && (
            <div className="animate-pulse rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-center font-mono text-[10px] font-bold text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
              {t.agentWorkspace.conversation.sessionOnHold}
            </div>
          )}

          {whisper && (
            <CoachingWidget whisper={whisper} onApplyWhisper={handleApplyWhisper} onClose={onCloseWhisper} />
          )}

          {activeChat.messages.map((msg) => {
            if (msg.sender === 'system') {
              return <ConversationTimeline key={msg.id} text={msg.text} timestamp={msg.timestamp} />;
            }
            return (
              <ConversationMessage 
                key={msg.id} 
                message={msg} 
                lang={lang} 
                channel={activeChat.channel}
                status={activeChat.status}
              />
            );
          })}

          {isCustomerTyping && (
            <TypingIndicator name={activeChat.customerName} />
          )}

          <div ref={bottomRef} />
        </div>

        {/* Incident sidebar for Escalated case */}
        {isEscalated && renderEscalationSidebar()}
      </div>

      {/* Agent Textarea Input / AI Reply Assistant */}
      <AIReplyComposer
        draftText={draftText}
        onChangeDraft={onChangeDraft}
        onSend={onSend}
        suggestedReplyText={getSuggestedReply()}
        lang={lang}
        onSummarize={onSummarize}
        channel={activeChat.channel}
        status={activeChat.status}
      />
    </div>
  );
}
