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

  // AI suggested responses draft based on context
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

  return (
    <div className="flex-1 flex flex-col justify-between bg-slate-50/20 dark:bg-transparent h-full text-xs font-semibold relative">
      
      {/* Top action header bar */}
      <div className="h-14 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900 z-10">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-850 dark:text-white truncate" style={{ maxWidth: '180px' }}>
            Chatting with: {activeChat.customerName}
          </h3>
          {activeChat.language === 'ar' && (
            <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-500 text-[8px] rounded font-bold font-mono">
              ARABIC SOURCE
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Hold toggle */}
          <button
            onClick={onToggleHold}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-xl transition-all border ${
              isHold
                ? 'bg-rose-500 border-rose-600 text-white hover:bg-rose-600'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-350'
            }`}
          >
            {isHold ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            {isHold ? 'Resume Call' : 'Hold Session'}
          </button>

          {/* Conference */}
          <button
            onClick={onConferenceClick}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-750 text-[10px] font-bold text-slate-700 dark:text-slate-350 rounded-xl transition-all"
          >
            <Users className="w-3.5 h-3.5" />
            Conference
          </button>

          {/* Transfer */}
          <button
            onClick={onTransferClick}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-750 text-[10px] font-bold text-slate-700 dark:text-slate-350 rounded-xl transition-all"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            Transfer
          </button>

          {/* Resolve */}
          <button
            onClick={onResolveClick}
            disabled={activeChat.status === 'resolved'}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-650 hover:bg-emerald-700 disabled:opacity-40 text-[10px] font-bold text-white rounded-xl transition-all shadow-sm"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Resolve
          </button>
        </div>
      </div>

      {/* Messaging thread panel */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Hold Banner */}
        {isHold && (
          <div className="bg-amber-100 dark:bg-amber-950/20 border border-amber-250 dark:border-amber-900 rounded-xl p-3.5 text-amber-800 dark:text-amber-400 text-center font-bold font-mono text-[10px] animate-pulse">
            * SESSION HAS BEEN PLACED ON HOLD BY AGENT LIAM BENNETT *
          </div>
        )}

        {/* Live whisper banner */}
        {whisper && (
          <CoachingWidget whisper={whisper} onApplyWhisper={handleApplyWhisper} onClose={onCloseWhisper} />
        )}

        {/* Dialogue history map */}
        {activeChat.messages.map((msg) => {
          if (msg.sender === 'system') {
            return <ConversationTimeline key={msg.id} text={msg.text} timestamp={msg.timestamp} />;
          }
          return <ConversationMessage key={msg.id} message={msg} lang={lang} />;
        })}

        <div ref={bottomRef} />
      </div>

      {/* Compose Form */}
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
