import React, { useState } from 'react';
import { Globe, CheckCheck, FileText, Image as ImageIcon, Play, Pause, Mic, Mail, User } from 'lucide-react';
import { Message } from '@/types';

interface ConversationMessageProps {
  message: Message;
  lang: 'en' | 'ar';
  channel?: 'whatsapp' | 'web' | 'voice' | 'email';
  status?: 'unassigned' | 'active' | 'resolved' | 'escalated';
}

export function ConversationMessage({ message, lang, channel = 'web', status }: ConversationMessageProps) {
  const [showTranslation, setShowTranslation] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const isUser = message.sender === 'customer';
  const isAgent = message.sender === 'agent';
  const isBot = message.sender === 'bot';

  // Attachment simulations
  const hasAttachment = message.text.toLowerCase().includes('invoice') || 
                        message.text.toLowerCase().includes('photo') || 
                        message.text.toLowerCase().includes('file');
  const isImage = message.text.toLowerCase().includes('photo');

  // WhatsApp Voice Note classification
  const isVoiceMsg = message.text.toLowerCase().includes('voice') || 
                     message.text.toLowerCase().includes('audio') || 
                     message.text.includes('تسجيل') ||
                     message.id === 'ym1'; // mock fiber gateway audio clip

  // ----------------------------------------------------
  // WHATSAPP RENDER LOGIC
  // ----------------------------------------------------
  if (channel === 'whatsapp') {
    return (
      <div className={`flex ${isUser ? 'justify-start' : 'justify-end'} animate-in fade-in-50 duration-200 mb-2`}>
        <div
          className={`max-w-[70%] rounded-xl px-3 py-2 leading-relaxed shadow-sm relative text-xs ${
            isUser
              ? 'bg-white text-slate-800 dark:bg-[#202c33] dark:text-slate-100 rounded-tl-none border-none'
              : isAgent
              ? 'bg-[#d9fdd3] text-slate-800 dark:bg-[#005c4b] dark:text-slate-100 rounded-tr-none border-none'
              : 'bg-[#e2ffd9]/90 text-slate-800 dark:bg-[#005c4b]/80 dark:text-slate-100 rounded-tr-none border-none'
          }`}
        >
          {/* Header sender indicator */}
          <div className="flex justify-between items-center gap-4 text-[9px] text-slate-400 dark:text-slate-500 font-bold mb-1">
            <span>{message.senderName}</span>
          </div>

          {/* Voice note simulated player */}
          {isVoiceMsg ? (
            <div className="my-2 p-2 bg-slate-100/50 dark:bg-slate-900/40 rounded-lg flex items-center gap-3 border border-slate-200/20">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 hover:bg-emerald-600 shadow-sm"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
              </button>
              
              {/* Waveform graphic */}
              <div className="flex-1 flex items-end gap-0.5 h-6 select-none">
                {[12, 18, 8, 24, 14, 20, 6, 16, 22, 10, 14, 8, 18, 12, 6, 20, 14, 10].map((h, i) => (
                  <span
                    key={i}
                    className={`w-0.5 rounded-full transition-all duration-300 ${
                      isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                    style={{ height: `${isPlaying ? Math.max(4, h + Math.sin(Date.now() + i) * 6) : h}px` }}
                  />
                ))}
              </div>
              
              <div className="flex flex-col items-end shrink-0 text-[8px] font-mono text-slate-400">
                <Mic className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{isPlaying ? '0:08' : '0:14'}</span>
              </div>
            </div>
          ) : null}

          {/* Message text */}
          <p className="font-normal leading-normal whitespace-pre-line text-slate-800 dark:text-slate-100">
            {message.text}
          </p>

          {/* Simulated WhatsApp Attachment */}
          {hasAttachment && !isVoiceMsg && (
            <div className="mt-2.5 p-2 bg-emerald-500/10 dark:bg-slate-900/50 rounded-lg border border-emerald-500/20 flex items-center gap-2">
              {isImage ? (
                <ImageIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              )}
              <div className="text-[10px] text-left min-w-0">
                <span className="font-bold block truncate text-slate-800 dark:text-slate-200" style={{ maxWidth: '140px' }}>
                  {isImage ? 'attachment_damaged_box.jpg' : 'INV-2026-7891.pdf'}
                </span>
                <span className="opacity-75 block text-[8px] font-mono text-slate-500 dark:text-slate-400">
                  {isImage ? '1.4 MB' : '320 KB'} • WhatsApp Sync
                </span>
              </div>
            </div>
          )}

          {/* Translation Option */}
          {message.translatedText && (
            <div className="mt-2 pt-1 border-t border-slate-200/30 dark:border-slate-700/30 text-[9px] italic flex items-center gap-1">
              <Globe className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <button
                type="button"
                onClick={() => setShowTranslation(!showTranslation)}
                className="underline font-bold text-[8px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"
              >
                {showTranslation ? 'Hide Translation' : 'View Translation'}
              </button>
            </div>
          )}

          {showTranslation && message.translatedText && (
            <p className="mt-1.5 p-1.5 bg-slate-100/50 dark:bg-slate-900/60 rounded text-[9px] leading-relaxed italic border border-slate-200/30 dark:border-slate-700/50 font-mono text-slate-600 dark:text-slate-300">
              &quot;{message.translatedText}&quot;
            </p>
          )}

          {/* Inline Timestamp & Double Ticks inside the bubble */}
          <div className="text-right text-[8px] text-slate-400 dark:text-slate-500 font-mono mt-1 flex justify-end items-center gap-0.5 select-none leading-none">
            <span>{message.timestamp}</span>
            {!isUser && (
              <CheckCheck className="w-3 h-3 text-[#53bdeb]" />
            )}
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // EMAIL RENDER LOGIC
  // ----------------------------------------------------
  if (channel === 'email') {
    const emailFrom = isUser 
      ? `${message.senderName} <client@enterprise.com>` 
      : `${message.senderName} <support@enterprise.com>`;
    const emailTo = isUser 
      ? 'Support Operations <support@enterprise.com>' 
      : `${message.senderName || 'Client'} <client@enterprise.com>`;

    const isThreadedReply = message.id === 'jm3' || message.id === 'jm2';

    return (
      <div className="w-full animate-in fade-in-50 duration-200 mb-4">
        <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800/80 p-5 shadow-sm text-slate-800 dark:text-slate-200">
          
          {/* Email Headers Card */}
          <div className="space-y-1 text-[10px] text-slate-400 dark:text-slate-500 font-normal pb-3.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                From: <span className="font-normal">{emailFrom}</span>
              </span>
              <span className="font-mono text-[9px] text-slate-400 shrink-0">{message.timestamp}</span>
            </div>
            <div>
              To: <span>{emailTo}</span>
            </div>
          </div>

          {/* Email Body Content */}
          <div className="mt-4 text-xs font-normal leading-relaxed text-slate-700 dark:text-slate-300 space-y-3 whitespace-pre-line">
            {message.text}

            {/* Email Signature simulator */}
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-4 border-t border-slate-100 dark:border-slate-800/50 pt-2 font-mono">
              {isUser ? `—\nSent via Vertex CRM portal node` : `—\nBest Regards,\n${message.senderName}\nCustomer Success Tier-1`}
            </p>
          </div>

          {/* Threaded Quoted Email Sections */}
          {isThreadedReply && (
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500 animate-in fade-in duration-300">
              <div className="border-l-2 border-slate-300 pl-3 italic space-y-1">
                <p className="font-bold text-[9px]">On 2026-05-22 at 14:40, Juliana Carter wrote:</p>
                <p>"Hello, our accounts department sent a bank wire transfer confirmation but our workspace says payment pending."</p>
              </div>
            </div>
          )}

          {/* Simulated Attachment card in email */}
          {hasAttachment && (
            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-red-500 shrink-0" />
                <div className="text-left min-w-0">
                  <span className="font-bold block text-[10px] text-slate-800 dark:text-slate-200 truncate" style={{ maxWidth: '200px' }}>
                    INV-2026-7891_payment_receipt.pdf
                  </span>
                  <span className="text-[8px] text-slate-400 block font-mono">320 KB • PDF Document • SAP verified</span>
                </div>
              </div>
              <button type="button" className="text-[10px] text-blue-500 hover:underline font-bold font-mono shrink-0">
                Download
              </button>
            </div>
          )}

          {/* Translation Option */}
          {message.translatedText && (
            <div className="mt-3.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[9px] italic flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              <button
                type="button"
                onClick={() => setShowTranslation(!showTranslation)}
                className="underline font-bold text-[8px] uppercase tracking-wider text-slate-500 hover:text-slate-600"
              >
                {showTranslation ? 'Hide Translation' : 'View Translation'}
              </button>
            </div>
          )}

          {showTranslation && message.translatedText && (
            <p className="mt-2 p-2 bg-slate-50 dark:bg-slate-900 rounded text-[9.5px] leading-relaxed italic border border-slate-200 dark:border-slate-800 font-mono text-slate-600 dark:text-slate-400">
              &quot;{message.translatedText}&quot;
            </p>
          )}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // STANDARD CHAT & ESCALATED RENDER LOGIC
  // ----------------------------------------------------
  const isEscalated = status === 'escalated';

  return (
    <div className={`flex ${isUser ? 'justify-start' : 'justify-end'} animate-in fade-in-50 duration-200`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 leading-relaxed border shadow-sm ${
          isUser
            ? isEscalated
              ? 'bg-rose-50/90 text-slate-900 dark:bg-slate-900 dark:text-slate-200 rounded-bl-none border-rose-300 dark:border-rose-900/50'
              : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 rounded-bl-none border-slate-200 dark:border-slate-800'
            : isAgent
            ? isEscalated 
              ? 'bg-rose-600 text-white rounded-br-none border-rose-500 shadow-rose-200 dark:shadow-none'
              : 'bg-blue-600 text-white rounded-br-none border-blue-500'
            : isEscalated
            ? 'bg-rose-700 text-white rounded-br-none border-rose-600'
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
          <div className="mt-3 p-2 bg-slate-950/20 dark:bg-white/10 rounded-xl border border-slate-200/30 dark:border-white/10 flex items-center gap-2">
            {isImage ? (
              <ImageIcon className="w-5 h-5 text-blue-300 shrink-0" />
            ) : (
              <FileText className="w-5 h-5 text-emerald-300 shrink-0" />
            )}
            <div className="text-[10px] text-left min-w-0">
              <span className="font-bold block truncate" style={{ maxWidth: '150px' }}>
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
          <div className="mt-2.5 pt-2 border-t border-white/10 dark:border-slate-700/50 text-[10px] text-white/80 dark:text-slate-300 italic font-mono flex items-center gap-1.5">
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
          <p className="mt-1.5 p-2 bg-white/10 dark:bg-slate-950/30 rounded-lg text-[10px] leading-relaxed italic border border-white/10 dark:border-slate-700/50 font-mono">
            &quot;{message.translatedText}&quot;
          </p>
        )}

        {/* Message metadata footer: delivery status */}
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
