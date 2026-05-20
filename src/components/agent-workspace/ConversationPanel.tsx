'use client';

import React, { useRef, useEffect } from 'react';
import { ArrowRightLeft, CheckCircle, Pause, Play, Users } from 'lucide-react';
import { Conversation } from '@/types';
import { ConversationMessage } from './ConversationMessage';
import { ConversationTimeline } from './ConversationTimeline';
import { AIReplyComposer } from './AIReplyComposer';
import { CoachingWidget } from './CoachingWidget';

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat.messages]);

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
        {isHold ? 'Resume' : 'Hold'}
      </button>
      <button
        type="button"
        onClick={onResolveClick}
        disabled={activeChat.status === 'resolved'}
        className="flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-[10px] font-bold text-white shadow-sm transition-all hover:bg-emerald-700 disabled:opacity-40"
      >
        <CheckCircle className="h-3.5 w-3.5" />
        Resolve
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
        Conference
      </button>
      <button
        type="button"
        onClick={onTransferClick}
        className="flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-1.5 text-[10px] font-bold text-slate-700 transition-all hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
      >
        <ArrowRightLeft className="h-3.5 w-3.5" />
        Transfer
      </button>
    </>
  );

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col justify-between bg-slate-50/20 text-xs font-semibold dark:bg-transparent">
      <div className="z-10 flex shrink-0 flex-col gap-2 border-b border-slate-200 bg-slate-50/95 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/90 sm:px-6 sm:py-0 lg:h-14 lg:flex-row lg:items-center lg:justify-between lg:gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="truncate font-bold text-slate-800 dark:text-white">
            Chatting with: {activeChat.customerName}
          </h3>
          {activeChat.language === 'ar' && (
            <span className="shrink-0 rounded bg-blue-500/10 px-1.5 py-0.5 font-mono text-[8px] font-bold text-blue-500">
              ARABIC SOURCE
            </span>
          )}
        </div>

        {/* Desktop: all actions in one row */}
        <div className="hidden items-center gap-2 lg:flex">
          {primaryActions}
          {secondaryActions}
        </div>

        {/* Mobile / tablet: primary row + horizontal overflow for secondary */}
        <div className="flex w-full min-w-0 flex-wrap items-center gap-2 lg:hidden">
          {primaryActions}
          <div className="flex min-w-0 flex-1 justify-end gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {secondaryActions}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
        {isHold && (
          <div className="animate-pulse rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-center font-mono text-[10px] font-bold text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
            * SESSION HAS BEEN PLACED ON HOLD BY AGENT LIAM BENNETT *
          </div>
        )}

        {whisper && (
          <CoachingWidget whisper={whisper} onApplyWhisper={handleApplyWhisper} onClose={onCloseWhisper} />
        )}

        {activeChat.messages.map((msg) => {
          if (msg.sender === 'system') {
            return <ConversationTimeline key={msg.id} text={msg.text} timestamp={msg.timestamp} />;
          }
          return <ConversationMessage key={msg.id} message={msg} lang={lang} />;
        })}

        <div ref={bottomRef} />
      </div>

      <AIReplyComposer
        draftText={draftText}
        onChangeDraft={onChangeDraft}
        onSend={onSend}
        suggestedReplyText={getSuggestedReply()}
        lang={lang}
        onSummarize={onSummarize}
      />
    </div>
  );
}
