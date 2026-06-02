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

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const Facebook = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const SidebarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M15 3v18" />
  </svg>
);

const MoreVertical = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);

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
  onEscalateClick?: () => void;
  onAssignClick?: () => void;
  rightPanelExpanded?: boolean;
  onToggleRightPanel?: () => void;
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
  onSummarize,
  onEscalateClick,
  onAssignClick,
  rightPanelExpanded,
  onToggleRightPanel
}: ConversationPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const t = translations[lang];
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [isCustomerTyping, setIsCustomerTyping] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat.messages, isCustomerTyping]);

  useEffect(() => {
    if (activeChat.status === 'resolved') {
      setIsCustomerTyping(false);
      return;
    }
    const isChat =
      activeChat.channel === 'whatsapp' ||
      activeChat.channel === 'web' ||
      activeChat.channel === 'instagram' ||
      activeChat.channel === 'messenger';
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
    if (activeChat.id === 'conv-105') {
      return 'Hi Layla. I see the checkout discount voucher failed because of a mismatch with policy exclusions. I can override this manually for you.';
    }
    if (activeChat.id === 'conv-106') {
      return 'Hello Alex, I apologize for the duplicate charge on subscription sub-99881. I will log a refund exception right away.';
    }
    return 'Thank you for calling support. Let me check the database system to confirm your active service key.';
  };

  const handleApplyWhisper = (txt: string) => {
    onChangeDraft(txt);
  };

  const primaryActions = (
    <div className="flex items-center gap-1.5 flex-wrap">
      {activeChat.status !== 'resolved' && onAssignClick && (
        <button
          type="button"
          onClick={onAssignClick}
          className="flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 px-3 py-1.5 text-[10px] font-bold"
        >
          <User className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">
            {activeChat.status === 'unassigned'
              ? (lang === 'ar' ? 'تعيين لي' : 'Assign to Me')
              : (lang === 'ar' ? 'إلغاء التعيين' : 'Unassign')}
          </span>
        </button>
      )}
      {activeChat.status !== 'escalated' && activeChat.status !== 'resolved' && onEscalateClick && (
        <button
          type="button"
          onClick={onEscalateClick}
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-1.5 text-[10px] font-bold text-white shadow-sm transition-all hover:bg-rose-700 animate-pulse"
        >
          <AlertOctagon className="h-3.5 w-3.5" />
          <span>{lang === 'ar' ? 'تصعيد' : 'Escalate'}</span>
        </button>
      )}
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
        <span>{isHold ? t.agentWorkspace.conversation.resume : t.agentWorkspace.conversation.hold}</span>
      </button>
      <button
        type="button"
        onClick={onResolveClick}
        disabled={activeChat.status === 'resolved'}
        className="flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-[10px] font-bold text-white shadow-sm transition-all hover:bg-emerald-700 disabled:opacity-40"
      >
        <CheckCircle className="h-3.5 w-3.5" />
        <span>{t.agentWorkspace.conversation.resolve}</span>
      </button>
    </div>
  );

  const secondaryActions = (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={onConferenceClick}
        className="flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-1.5 text-[10px] font-bold text-slate-700 transition-all hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
      >
        <Users className="h-3.5 w-3.5" />
        <span>{t.agentWorkspace.conversation.conference}</span>
      </button>
      <button
        type="button"
        onClick={onTransferClick}
        className="flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-1.5 text-[10px] font-bold text-slate-700 transition-all hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
      >
        <ArrowRightLeft className="h-3.5 w-3.5" />
        <span>{t.agentWorkspace.conversation.transfer}</span>
      </button>
    </div>
  );

  const overflowActions = (
    <div className="relative shrink-0 select-none">
      <button
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex shrink-0 items-center justify-center p-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        title="More Actions"
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
          <div className={`absolute ${lang === 'ar' ? 'left-0' : 'right-0'} mt-1.5 w-36 rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 z-40 p-1.5 space-y-1`}>
            <button
              type="button"
              onClick={() => {
                onConferenceClick();
                setMenuOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-start text-[10px] font-bold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Users className="h-3.5 w-3.5 text-slate-500" />
              <span>{t.agentWorkspace.conversation.conference}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onTransferClick();
                setMenuOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-start text-[10px] font-bold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ArrowRightLeft className="h-3.5 w-3.5 text-slate-500" />
              <span>{t.agentWorkspace.conversation.transfer}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );

  const renderHeaderContent = () => {
    const isEscalated = activeChat.status === 'escalated';

    if (isEscalated) {
      return (
        <div className="flex items-center gap-3 py-1.5 min-w-0">
          <div className="relative shrink-0 select-none">
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center animate-pulse">
              {activeChat.customerAvatar ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={activeChat.customerAvatar} alt={activeChat.customerName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 bg-rose-500" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5 text-xs truncate">
              <span className="truncate">{activeChat.customerName}</span>
              <span className="shrink-0 rounded bg-rose-500/10 px-1.5 py-0.5 font-bold text-[8px] text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                ESCALATION
              </span>
            </h3>
            <p className="text-[10px] font-normal text-rose-500 dark:text-rose-400 font-mono mt-0.5 truncate">
              P1 • SLA {activeChat.slaDeadline}
            </p>
          </div>
        </div>
      );
    }

    if (activeChat.channel === 'whatsapp') {
      return (
        <div className="flex items-center gap-3 py-1.5 min-w-0">
          <div className="relative shrink-0 select-none">
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
              <span className="truncate">{activeChat.customerName}</span>
              <span className="shrink-0 rounded bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[8px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                WHATSAPP
              </span>
            </h3>
            <p className="text-[11.5px] font-normal text-slate-400 mt-0.5 flex items-center gap-1 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="truncate">Online • {activeChat.lastMessageTime}</span>
            </p>
          </div>
        </div>
      );
    }

    if (activeChat.channel === 'instagram') {
      return (
        <div className="flex items-center gap-3 py-1.5 min-w-0">
          <div className="relative shrink-0 select-none">
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center">
              {activeChat.customerAvatar ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={activeChat.customerAvatar} alt={activeChat.customerName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 bg-pink-500" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5 text-xs truncate">
              <span className="truncate">{activeChat.customerName}</span>
              <span className="shrink-0 rounded bg-pink-500/10 px-1.5 py-0.5 font-mono text-[8px] font-bold text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-900">
                INSTAGRAM
              </span>
            </h3>
            <p className="text-[11.5px] font-normal text-slate-400 mt-0.5 truncate">
              Direct Message thread
            </p>
          </div>
        </div>
      );
    }

    if (activeChat.channel === 'messenger') {
      return (
        <div className="flex items-center gap-3 py-1.5 min-w-0">
          <div className="relative shrink-0 select-none">
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center">
              {activeChat.customerAvatar ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={activeChat.customerAvatar} alt={activeChat.customerName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 bg-blue-500" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5 text-xs truncate">
              <span className="truncate">{activeChat.customerName}</span>
              <span className="shrink-0 rounded bg-blue-500/10 px-1.5 py-0.5 font-mono text-[8px] font-bold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                MESSENGER
              </span>
            </h3>
            <p className="text-[11.5px] font-normal text-slate-400 mt-0.5 truncate">
              Facebook Messenger thread
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
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-slate-500 dark:text-slate-400 font-normal">
            <span className="truncate"><strong>From:</strong> {activeChat.customerName} &lt;{activeChat.customerEmail || 'juliana.c@vertex-logistics.com'}&gt;</span>
            <span className="truncate"><strong>To:</strong> Care &lt;support@enterprise.com&gt;</span>
            <button
              type="button"
              onClick={() => setShowCcBcc(!showCcBcc)}
              className="text-blue-500 hover:underline font-bold text-[10px] uppercase tracking-wider ml-1 whitespace-nowrap"
            >
              {showCcBcc ? '[Hide CC/BCC]' : '[Show CC/BCC]'}
            </button>
          </div>
          {showCcBcc && (
            <div className="mt-1.5 p-2 bg-slate-100 dark:bg-slate-900 rounded-lg text-[10.5px] text-slate-500 dark:text-slate-400 font-mono border border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2 duration-200 w-full">
              <strong>CC:</strong> accounts-audit@vertex-logistics.com; dispatch-ops@vertex-logistics.com
            </div>
          )}
        </div>
      );
    }

    // Default Web Chat
    return (
      <div className="flex items-center gap-3 py-1.5 min-w-0">
        <div className="relative shrink-0 select-none">
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
            <span className="truncate">{activeChat.customerName}</span>
            <span className="shrink-0 rounded bg-sky-500/10 px-1.5 py-0.5 font-mono text-[8px] font-bold text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-900">
              WEB CHAT
            </span>
          </h3>
          <p className="text-[11.5px] font-normal text-slate-400 mt-0.5 truncate">
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
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-rose-500 block">Incident Context</span>
          <h4 className="font-extrabold text-slate-800 dark:text-white text-[13.5px]">Incident Case INC-99881</h4>
        </div>

        <div className="space-y-2.5">
          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
            <span className="text-[9.5px] text-slate-400 dark:text-slate-500 block uppercase font-mono font-bold">Severity Level</span>
            <div className="flex items-center gap-1 text-rose-600 font-extrabold text-xs">
              <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
              <span>P1 - Critical Priority</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
            <span className="text-[9.5px] text-slate-400 dark:text-slate-500 block uppercase font-mono font-bold">SLA Performance</span>
            <div className="text-rose-600 font-extrabold text-xs animate-pulse">
              BREACHED (Deadline {activeChat.slaDeadline})
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-2">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Supervisor Consultation</span>
          <div className="bg-amber-500/10 border border-amber-300/30 rounded-xl p-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            <span className="font-extrabold block text-amber-600 dark:text-amber-400 text-[10px] mb-1">Supervisor Notes (Nadia V.)</span>
            "OAuth token mismatch resolved in Dubai ERP registry. Ensure client re-authenticates to trigger RAG index lookup."
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-2">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Incident Audit Trail</span>
          <div className="space-y-3 font-mono text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
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
    <div className="relative flex h-full min-h-0 flex-1 flex-col justify-between bg-slate-50/20 text-xs font-semibold dark:bg-transparent min-w-0">
      {/* Top Header Row */}
      <div className="z-10 flex shrink-0 flex-col gap-2 border-b border-slate-200 bg-slate-50/95 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/90 sm:px-6 sm:py-0 lg:h-14 lg:flex-row lg:items-center lg:justify-between lg:gap-3">
        <div className="flex-1 min-w-0">
          {renderHeaderContent()}
        </div>

        {/* Desktop: all actions in one row */}
        <div className="hidden items-center gap-2 lg:flex shrink-0">
          {primaryActions}
          {/* Inline secondary actions only on wide monitors, dropdown menu on laptops */}
          <div className="hidden xl:flex items-center gap-2">
            {secondaryActions}
          </div>
          <div className="flex xl:hidden items-center gap-2">
            {overflowActions}
          </div>
          {onToggleRightPanel && (
            <button
              type="button"
              onClick={onToggleRightPanel}
              className={`flex shrink-0 items-center justify-center p-2 rounded-xl border transition-all ${
                rightPanelExpanded
                  ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-blue-400'
                  : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
              title={rightPanelExpanded ? 'Hide Sidebar' : 'Show Sidebar'}
            >
              <SidebarIcon className="w-4 h-4" />
            </button>
          )}
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
      <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden min-w-0">
        {/* Timeline Message Log */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 min-w-0">
          {/* Escalation Warning Sticky Banner */}
          {isEscalated && (
            <div className="border border-rose-300 bg-rose-50/80 dark:border-rose-900 dark:bg-rose-950/30 rounded-2xl p-4 flex items-start gap-3 text-rose-900 dark:text-rose-300 shadow-sm animate-in slide-in-from-top-2 duration-300">
              <AlertOctagon className="w-5 h-5 text-rose-600 dark:text-rose-500 shrink-0 mt-0.5 animate-bounce" />
              <div className="space-y-1 text-xs">
                <p className="font-extrabold uppercase tracking-wider text-[11.5px] text-rose-700 dark:text-rose-400">
                  Critical SLA Breach Alert
                </p>
                <p className="font-normal text-xs leading-relaxed">
                  This conversation is currently flagged as <strong>ESCALATED (Level-2 Engineering Desk)</strong>. The SLA response deadline ({activeChat.slaDeadline}) is in a <strong>{activeChat.slaStatus.toUpperCase()}</strong> status.
                </p>
                <p className="text-[11px] opacity-75 font-mono">
                  Operational status: Monitored by Supervisor Nadia Vance • Internal logs recommended
                </p>
              </div>
            </div>
          )}

          {/* Web Chat Session Welcome Banner */}
          {activeChat.channel === 'web' && !isEscalated && (
            <div className="border border-sky-200 bg-sky-50 dark:border-sky-950 dark:bg-sky-950/20 rounded-xl p-3 flex items-center gap-2.5 text-sky-950 dark:text-sky-300 text-xs font-medium font-sans">
              <Globe className="w-4 h-4 text-sky-500 shrink-0" />
              <div className="truncate">
                <strong>Live Chat Widget Hooked:</strong> Conversational handoff complete. Connection ID: <code>wc-3901-live</code>.
              </div>
            </div>
          )}

          {/* Instagram Web Greeting */}
          {activeChat.channel === 'instagram' && (
            <div className="border border-pink-200 bg-pink-50 dark:border-pink-950 dark:bg-pink-950/20 rounded-xl p-3 flex items-center gap-2.5 text-pink-950 dark:text-pink-300 text-xs font-medium font-sans">
              <Instagram className="w-4 h-4 text-pink-500 shrink-0" />
              <div className="truncate">
                <strong>Instagram Direct Link:</strong> Chatting directly with customer Layla Hassan.
              </div>
            </div>
          )}

          {/* Messenger Greeting */}
          {activeChat.channel === 'messenger' && (
            <div className="border border-blue-200 bg-blue-50 dark:border-blue-950 dark:bg-blue-950/20 rounded-xl p-3 flex items-center gap-2.5 text-blue-950 dark:text-blue-300 text-xs font-medium font-sans">
              <Facebook className="w-4 h-4 text-blue-500 shrink-0" />
              <div className="truncate">
                <strong>Facebook Messenger Session:</strong> Authenticated account integration active.
              </div>
            </div>
          )}

          {/* WhatsApp Security Encryption Banner */}
          {activeChat.channel === 'whatsapp' && (
            <div className="mx-auto my-1 bg-amber-50 dark:bg-slate-800/80 border border-amber-200/50 dark:border-slate-700/50 rounded-xl px-3 py-1.5 text-center text-[11px] font-normal text-slate-600 dark:text-slate-300 max-w-sm leading-normal shadow-sm">
              🔒 Messages are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.
            </div>
          )}

          {isHold && (
            <div className="animate-pulse rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-center font-mono text-xs font-bold text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
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
