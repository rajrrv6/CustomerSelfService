import React, { useState } from 'react';
import { Globe, CheckCheck, FileText, Image as ImageIcon } from 'lucide-react';
import { Message } from '@/types';

interface ConversationMessageProps {
  message: Message;
  lang: 'en' | 'ar';
}

export function ConversationMessage({ message, lang }: ConversationMessageProps) {
  const [showTranslation, setShowTranslation] = useState(false);

  const isUser = message.sender === 'customer';
  const isAgent = message.sender === 'agent';

  // Attachment simulations
  const hasAttachment = message.text.toLowerCase().includes('invoice') || message.text.toLowerCase().includes('photo') || message.text.toLowerCase().includes('file');
  const isImage = message.text.toLowerCase().includes('photo');

  return (
    <div className={`flex ${isUser ? 'justify-start' : 'justify-end'} animate-in fade-in-50 duration-200`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 leading-relaxed border shadow-sm ${
          isUser
            ? 'bg-slate-100 text-slate-800 dark:bg-slate-850 dark:text-slate-200 rounded-bl-none border-slate-200 dark:border-slate-800'
            : isAgent
            ? 'bg-blue-600 text-white rounded-br-none border-blue-500'
            : 'bg-purple-600 text-white rounded-br-none border-purple-500'
        }`}
      >
        {/* Sender details and timestamp */}
        <div className="flex justify-between items-center gap-4 text-[9px] opacity-60 mb-1.5 font-bold">
          <span>{message.senderName}</span>
          <span className="font-mono">{message.timestamp}</span>
        </div>

        {/* Message body */}
        <p className="font-medium text-xs whitespace-pre-line">{message.text}</p>

        {/* Simulated Attachment Preview */}
        {hasAttachment && (
          <div className="mt-3 p-2 bg-white/10 rounded-xl border border-white/20 flex items-center gap-2">
            {isImage ? (
              <ImageIcon className="w-5 h-5 text-blue-300" />
            ) : (
              <FileText className="w-5 h-5 text-emerald-300" />
            )}
            <div className="text-[10px] text-left">
              <span className="font-bold block truncate max-w-[150px]">
                {isImage ? 'attachment_damaged_box.jpg' : 'INV-2026-7891.pdf'}
              </span>
              <span className="opacity-75 block text-[8px] font-mono">
                {isImage ? '1.4 MB' : '320 KB'} • SAP Synced
              </span>
            </div>
          </div>
        )}

        {/* Translation Overlay */}
        {message.translatedText && (
          <div className="mt-2.5 pt-2 border-t border-white/10 dark:border-slate-700/50 text-[10px] opacity-80 italic font-mono flex items-center gap-1.5">
            <Globe className="w-3 h-3 shrink-0" />
            <button
              type="button"
              onClick={() => setShowTranslation(!showTranslation)}
              className="underline font-bold text-[9px] uppercase tracking-wider"
            >
              {showTranslation ? 'Hide Translate' : 'Translate Response'}
            </button>
          </div>
        )}

        {showTranslation && message.translatedText && (
          <p className="mt-1.5 p-2 bg-black/10 dark:bg-black/20 rounded-lg text-[10px] leading-relaxed italic border border-white/5 font-mono">
            &quot;{message.translatedText}&quot;
          </p>
        )}

        {/* Message metadata footer: delivery status / sentiment */}
        <div className="mt-1.5 flex justify-end items-center gap-1 opacity-70">
          {!isUser && (
            <span className="text-[9px]">
              <CheckCheck className="w-3.5 h-3.5 text-blue-200" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
