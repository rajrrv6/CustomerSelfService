import React, { useState } from 'react';
import { Globe, CheckCheck, Play, Pause, Mic, Mail, User, Clock, AlertCircle } from 'lucide-react';
import { Message } from '@/types';
import { AttachmentViewer } from './AttachmentViewer';

interface ConversationMessageProps {
  message: Message;
  lang: 'en' | 'ar';
  channel?: 'whatsapp' | 'web' | 'voice' | 'email' | 'instagram' | 'messenger';
  status?: 'unassigned' | 'active' | 'resolved' | 'escalated';
  onRetry?: () => void;
  showAvatar?: boolean;
  showName?: boolean;
}

export function ConversationMessage({
  message,
  lang,
  channel = 'web',
  status,
  onRetry,
  showAvatar = true,
  showName = true,
}: ConversationMessageProps) {
  const [showTranslation, setShowTranslation] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [emailExpanded, setEmailExpanded] = useState(false);

  const isUser = message.sender === 'customer';
  const isAgent = message.sender === 'agent';
  const isBot = message.sender === 'bot';

  // Attachment simulations
  const hasAttachment =
    message.text.toLowerCase().includes('invoice') ||
    message.text.toLowerCase().includes('photo') ||
    message.text.toLowerCase().includes('file');
  const isImage = message.text.toLowerCase().includes('photo');

  let displayAttachments = message.attachments;
  if ((!displayAttachments || displayAttachments.length === 0) && hasAttachment) {
    displayAttachments = [
      {
        id: `mock-att-${message.id}`,
        name: isImage ? 'attachment_damaged_box.jpg' : 'INV-2026-7891.pdf',
        url: '#',
        sizeBytes: isImage ? 1468000 : 327680,
        type: isImage ? 'image' : 'pdf',
      },
    ];
  }

  // Voice Note classification
  const isVoiceMsg =
    channel === 'voice' ||
    message.messageType === 'voice_note' ||
    message.text.toLowerCase().includes('voice') ||
    message.text.toLowerCase().includes('audio') ||
    message.text.includes('تسجيل') ||
    message.id === 'ym1';

  // Internal Notes check
  const isInternalNote =
    message.messageType === 'internal_note' ||
    message.text.startsWith('[Internal Note]:') ||
    message.senderName.includes('Notes');

  if (isInternalNote) {
    return (
      <div className="flex justify-end animate-in fade-in-50 duration-200 mb-2 w-full">
        <div className="max-w-[75%] rounded-2xl px-4 py-3 border-2 border-purple-500 bg-purple-50 dark:bg-purple-950/20 text-purple-900 dark:text-purple-300 shadow-sm relative">
          <div className="flex justify-between items-center gap-4 text-[10px] opacity-75 mb-1.5 font-bold font-mono">
            <span className="text-purple-700 dark:text-purple-400">🔒 [Internal Note] • {message.senderName}</span>
            <span aria-label={lang === 'ar' ? `أُرسلت في ${message.timestamp}` : `Sent at ${message.timestamp}`}>{message.timestamp}</span>
          </div>
          <p className="font-semibold text-[13px] whitespace-pre-line break-words text-purple-800 dark:text-purple-200">
            {message.text.replace(/^\[Internal Note\]:\s*/, '')}
          </p>
        </div>
      </div>
    );
  }

  // System alert check
  const isSystem = message.sender === 'system';
  if (isSystem) {
    const isEscalation =
      message.messageType === 'escalation' ||
      message.text.toLowerCase().includes('escalated') ||
      message.text.includes('Escalation');
    const bgClass = isEscalation
      ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-450'
      : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/50 dark:text-amber-400';

    return (
      <div className="flex justify-center w-full my-2 animate-in fade-in-50 duration-200">
        <div className={`px-4 py-2 rounded-xl border text-[11px] font-bold text-center max-w-md ${bgClass}`}>
          <div className="font-mono text-[9px] opacity-75 mb-0.5">{message.timestamp}</div>
          <div>{message.text}</div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // WHATSAPP RENDER LOGIC
  // ----------------------------------------------------
  if (channel === 'whatsapp') {
    const isSending = message.status === 'sending';
    const isFailed = message.status === 'failed';
    return (
      <div className={`flex ${isUser ? 'justify-start' : 'justify-end'} animate-in fade-in-50 duration-200 mb-2`}>
        <div
          className={`max-w-[70%] rounded-xl px-3 py-2 leading-relaxed shadow-sm relative text-[13px] ${
            isSending ? 'opacity-65' : ''
          } ${isFailed ? 'border border-rose-500' : ''} ${
            isUser
              ? 'bg-white text-slate-800 dark:bg-[#202c33] dark:text-slate-100 rounded-tl-none border-none'
              : isAgent
              ? 'bg-[#d9fdd3] text-slate-800 dark:bg-[#005c4b] dark:text-slate-100 rounded-tr-none border-none'
              : 'bg-[#e2ffd9]/90 text-slate-800 dark:bg-[#005c4b]/80 dark:text-slate-100 rounded-tr-none border-none'
          }`}
        >
          {/* Header sender indicator */}
          {showName && (
            <div className="flex justify-between items-center gap-4 text-[10.5px] text-slate-400 dark:text-slate-500 font-bold mb-1">
              <span>{message.senderName}</span>
            </div>
          )}

          {/* Voice note simulated player */}
          {isVoiceMsg ? (
            <div 
              className="my-2 p-2 bg-slate-100/50 dark:bg-slate-900/40 rounded-lg flex items-center gap-3 border border-slate-200/20"
              role="region"
              aria-label={lang === 'ar' ? 'تشغيل الرسالة الصوتية' : 'Voice note player'}
            >
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                aria-label={isPlaying ? (lang === 'ar' ? 'إيقاف مؤقت' : 'Pause voice note') : (lang === 'ar' ? 'تشغيل' : 'Play voice note')}
                className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 hover:bg-emerald-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
              </button>

              {/* Waveform graphic */}
              <div className="flex-1 flex items-end gap-0.5 h-6 select-none" aria-hidden="true">
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
          <p className="font-normal leading-normal whitespace-pre-line break-words text-slate-800 dark:text-slate-100">
            {message.text}
          </p>

          {/* Unified Attachment Previews */}
          {displayAttachments && displayAttachments.length > 0 && (
            <AttachmentViewer attachments={displayAttachments} lang={lang} />
          )}

          {/* Translation Option */}
          {message.translatedText && (
            <div className="mt-2 pt-1 border-t border-slate-200/30 dark:border-slate-700/30 text-[10.5px] italic flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <button
                type="button"
                onClick={() => setShowTranslation(!showTranslation)}
                className="underline font-bold text-[9px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 focus:outline-none"
              >
                {showTranslation ? 'Hide Translation' : 'View Translation'}
              </button>
            </div>
          )}

          {showTranslation && message.translatedText && (
            <p className="mt-1.5 p-1.5 bg-slate-100/50 dark:bg-slate-900/60 rounded text-[10.5px] leading-relaxed italic border border-slate-200/30 dark:border-slate-700/50 font-mono text-slate-600 dark:text-slate-300">
              &quot;{message.translatedText}&quot;
            </p>
          )}

          {/* Inline Timestamp & Double Ticks inside the bubble */}
          <div className="text-end text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-1 flex justify-end items-center gap-0.5 select-none leading-none">
            <span aria-label={lang === 'ar' ? `أُرسلت في ${message.timestamp}` : `Sent at ${message.timestamp}`}>{message.timestamp}</span>
            {!isUser && (
              message.status === 'sending' ? (
                <Clock className="w-3 h-3 text-slate-400 animate-spin" />
              ) : message.status === 'failed' ? (
                <button
                  type="button"
                  onClick={onRetry}
                  aria-label={lang === 'ar' ? 'إعادة الإرسال' : 'Retry sending message'}
                  className="text-rose-500 text-[10px] font-bold flex items-center gap-0.5 cursor-pointer bg-transparent border-none p-0 focus:outline-none"
                >
                  <AlertCircle className="w-3 h-3 text-rose-500" />
                  <span>Retry</span>
                </button>
              ) : (
                <CheckCheck className="w-3 h-3 text-[#53bdeb]" />
              )
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
        <div className={`bg-white dark:bg-slate-950 rounded-xl border p-5 shadow-sm text-slate-800 dark:text-slate-200 ${
          message.status === 'sending' ? 'opacity-65 border-slate-200 dark:border-slate-800/80' : 
          message.status === 'failed' ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800/80'
        }`}>
          {/* Email Headers Card */}
          <div className="space-y-1.5 text-[11.5px] text-slate-500 dark:text-slate-400 font-normal pb-3.5 border-b border-slate-100 dark:border-slate-850">
            <div className="flex justify-between items-baseline gap-4">
              <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200 truncate">
                From: <span className="font-normal">{emailFrom}</span>
              </span>
              <div className="flex items-center gap-2 shrink-0">
                {message.status === 'sending' && <span className="text-slate-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5 animate-spin" /> Sending...</span>}
                {message.status === 'failed' && (
                  <button 
                    type="button" 
                    onClick={onRetry} 
                    aria-label={lang === 'ar' ? 'إعادة إرسال البريد الإلكتروني' : 'Retry sending email'}
                    className="text-rose-500 font-bold hover:underline flex items-center gap-1 bg-transparent border-none p-0 focus:outline-none"
                  >
                    <AlertCircle className="w-3.5 h-3.5" /> Failed to Send (Retry)
                  </button>
                )}
                <span aria-label={lang === 'ar' ? `أُرسلت في ${message.timestamp}` : `Sent at ${message.timestamp}`} className="font-mono text-[10.5px] text-slate-400">{message.timestamp}</span>
              </div>
            </div>

            {/* Collapsible toggle */}
            <div className="flex items-center justify-between mt-1">
              <button
                type="button"
                aria-expanded={emailExpanded}
                onClick={() => setEmailExpanded(!emailExpanded)}
                className="text-blue-500 hover:underline font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
              >
                {emailExpanded ? (lang === 'ar' ? 'إخفاء التفاصيل' : 'Hide Details') : (lang === 'ar' ? 'عرض التفاصيل' : 'Show Details')}
              </button>
            </div>

            {/* Collapsible Metadata Content */}
            {emailExpanded && (
              <div className="mt-2 space-y-1.5 p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200/50 dark:border-slate-800/50 animate-in slide-in-from-top-1 duration-200">
                <div><strong>To:</strong> {emailTo}</div>
                <div><strong>CC:</strong> accounts-audit@vertex-logistics.com; dispatch-ops@vertex-logistics.com</div>
                <div><strong>Subject:</strong> {message.emailHeaders?.subject || `Inquiry regarding payment audit - #${message.id}`}</div>
              </div>
            )}
          </div>

          {/* Email Body Content */}
          <div className="mt-4 text-[13px] font-normal leading-relaxed break-words text-slate-755 dark:text-slate-300 space-y-3 whitespace-pre-line">
            {message.text}

            {/* Email Signature simulator */}
            <p className="text-[11.5px] text-slate-400 dark:text-slate-500 mt-4 border-t border-slate-100 dark:border-slate-80/50 pt-2 font-mono">
              {isUser ? `—\nSent via Vertex CRM portal node` : `—\nBest Regards,\n${message.senderName}\nCustomer Success Tier-1`}
            </p>
          </div>

          {/* Threaded Quoted Email Sections */}
          {isThreadedReply && (
            <div className="mt-4 pt-3 border-t border-slate-105 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500 animate-in fade-in duration-300">
              <div className="border-s-2 border-slate-300 ps-3 italic space-y-1">
                <p className="font-bold text-[10px]">On 2026-05-22 at 14:40, Juliana Carter wrote:</p>
                <p>"Hello, our accounts department sent a bank wire transfer confirmation but our workspace says payment pending."</p>
              </div>
            </div>
          )}

          {/* Unified Attachment Previews */}
          {displayAttachments && displayAttachments.length > 0 && (
            <AttachmentViewer attachments={displayAttachments} lang={lang} />
          )}

          {/* Translation Option */}
          {message.translatedText && (
            <div className="mt-3.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10.5px] italic flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              <button
                type="button"
                onClick={() => setShowTranslation(!showTranslation)}
                className="underline font-bold text-[9px] uppercase tracking-wider text-slate-500 hover:text-slate-655 focus:outline-none"
              >
                {showTranslation ? 'Hide Translation' : 'View Translation'}
              </button>
            </div>
          )}

          {showTranslation && message.translatedText && (
            <p className="mt-2 p-2 bg-slate-50 dark:bg-slate-900 rounded text-[11px] leading-relaxed italic border border-slate-200 dark:border-slate-800 font-mono text-slate-600 dark:text-slate-400">
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
  const isSending = message.status === 'sending';
  const isFailed = message.status === 'failed';

  return (
    <div className={`flex ${isUser ? 'justify-start' : 'justify-end'} animate-in fade-in-50 duration-200`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 leading-relaxed border shadow-sm relative ${
          isSending ? 'opacity-65' : ''
        } ${isFailed ? 'border-rose-500' : ''} ${
          isUser
            ? isEscalated
              ? 'bg-rose-50/90 text-slate-900 dark:bg-slate-900 dark:text-slate-200 rounded-bl-none border-rose-300 dark:border-rose-900/50'
              : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 rounded-bl-none border-slate-200 dark:border-slate-800'
            : isAgent
            ? isEscalated
              ? 'bg-rose-600 text-white rounded-br-none border-rose-500 shadow-rose-200 dark:shadow-none'
              : channel === 'instagram'
              ? 'bg-gradient-to-tr from-yellow-500 via-pink-600 to-purple-600 text-white rounded-br-none border-pink-500'
              : channel === 'messenger'
              ? 'bg-blue-600 text-white rounded-br-none border-blue-500'
              : 'bg-blue-600 text-white rounded-br-none border-blue-500'
            : isEscalated
            ? 'bg-rose-700 text-white rounded-br-none border-rose-600'
            : 'bg-purple-600 text-white rounded-br-none border-purple-500'
        }`}
      >
        {/* Sender details and timestamp */}
        <div className="flex justify-between items-center gap-4 text-[10px] opacity-60 mb-1.5 font-bold">
          {showName ? <span>{message.senderName}</span> : <span />}
          <span aria-label={lang === 'ar' ? `أُرسلت في ${message.timestamp}` : `Sent at ${message.timestamp}`} className="font-mono">{message.timestamp}</span>
        </div>

        {/* Message body */}
        <p className="font-medium text-[13px] whitespace-pre-line break-words">{message.text}</p>

        {/* Unified Attachment Previews */}
        {displayAttachments && displayAttachments.length > 0 && (
          <AttachmentViewer attachments={displayAttachments} lang={lang} />
        )}

        {/* Translation Overlay */}
        {message.translatedText && (
          <div className="mt-2.5 pt-2 border-t border-white/10 dark:border-slate-700/50 text-[11.5px] text-white/80 dark:text-slate-300 italic font-mono flex items-center gap-1.5">
            <Globe className="w-3 h-3 shrink-0" />
            <button
              type="button"
              onClick={() => setShowTranslation(!showTranslation)}
              className="underline font-bold text-[10px] uppercase tracking-wider text-white focus:outline-none"
            >
              {showTranslation ? 'Hide Translate' : 'Translate Response'}
            </button>
          </div>
        )}

        {showTranslation && message.translatedText && (
          <p className="mt-1.5 p-2 bg-white/10 dark:bg-slate-950/30 rounded-lg text-[11px] leading-relaxed italic border border-white/10 dark:border-slate-700/50 font-mono">
            &quot;{message.translatedText}&quot;
          </p>
        )}

        {/* Message metadata footer: delivery status checkmarks */}
        {!isUser && (
          <div className="mt-1.5 flex justify-end items-center gap-1 select-none leading-none">
            {message.status === 'sending' ? (
              <Clock className="w-3.5 h-3.5 text-white/60 animate-spin" />
            ) : message.status === 'failed' ? (
              <button
                type="button"
                onClick={onRetry}
                aria-label={lang === 'ar' ? 'إعادة المحاولة لإرسال الرسالة' : 'Retry sending message'}
                className="text-rose-300 hover:text-rose-100 text-[10px] font-bold flex items-center gap-1 cursor-pointer bg-transparent border-none p-0 focus:outline-none font-sans"
              >
                <AlertCircle className="w-3 h-3 text-rose-300" />
                <span>Retry</span>
              </button>
            ) : (
              <CheckCheck className={`w-3.5 h-3.5 ${
                channel === 'instagram' || channel === 'messenger' || isEscalated ? 'text-white' : 'text-blue-200'
              }`} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
