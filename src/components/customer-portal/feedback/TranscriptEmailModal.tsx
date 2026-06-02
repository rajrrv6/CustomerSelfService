'use client';

import React, { useState } from 'react';
import { Mail, Clock, Calendar, MessageSquare, AlertCircle, CheckCircle2, X, RefreshCw } from 'lucide-react';
import { ModalWrapper } from '@/components/shared/ModalWrapper';

interface MessagePreview {
  sender: 'bot' | 'user' | 'agent';
  text: string;
}

interface TranscriptEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'ar';
  agentName?: string;
  chatDuration?: string;
  messageCount?: number;
  messagesPreview?: MessagePreview[];
  onToastTrigger?: (type: 'success' | 'error' | 'info', title: string, msg: string) => void;
}

export function TranscriptEmailModal({
  isOpen,
  onClose,
  lang,
  agentName = 'Farah AI Assistant',
  chatDuration = '4m 32s',
  messageCount = 8,
  messagesPreview = [
    { sender: 'bot', text: 'مرحباً! كيف يمكنني مساعدتك؟ | Hello! How can I help you?' },
    { sender: 'user', text: 'I want to check return policy.' },
    { sender: 'bot', text: 'Under policy ks-1, refunds are allowed within 30 days.' }
  ],
  onToastTrigger
}: TranscriptEmailModalProps) {
  const isRtl = lang === 'ar';
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [sendState, setSendState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [simulateTimeout, setSimulateTimeout] = useState(false);

  const validateEmail = (val: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(val);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (!validateEmail(email)) {
      setEmailError(isRtl ? 'البريد الإلكتروني المدخل غير صالح' : 'Invalid email address format.');
      if (onToastTrigger) {
        onToastTrigger('error', isRtl ? 'صيغة البريد خاطئة' : 'Invalid Email Format', isRtl ? 'يرجى إدخال عنوان بريد إلكتروني صالح.' : 'Please enter a properly formatted email.');
      }
      return;
    }

    setEmailError(null);
    setSendState('sending');

    // Simulate sending transcript over network
    setTimeout(() => {
      if (simulateTimeout) {
        setSendState('error');
        if (onToastTrigger) {
          onToastTrigger('error', isRtl ? 'خطأ في إرسال السجل' : 'Send Failed', isRtl ? 'انتهت مهلة خادم الإرسال.' : 'A simulated SMTP transmission timeout occurred.');
        }
      } else {
        setSendState('success');
        if (onToastTrigger) {
          onToastTrigger('success', isRtl ? 'تم إرسال المحادثة بنجاح' : 'Transcript Sent', isRtl ? `تم إرسال سجل المحادثة إلى ${email}` : `Chat transcript successfully exported to ${email}.`);
        }
        setTimeout(() => {
          onClose();
          setSendState('idle');
          setEmail('');
        }, 1800);
      }
    }, 1500);
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={isRtl ? 'تصدير سجل المحادثة بالبريد' : 'Email Chat Transcript'}
      maxWidthClass="max-w-md"
    >
      <div className="space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
        {sendState === 'success' ? (
          <div className="py-6 text-center space-y-3.5 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-650 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                {isRtl ? 'تم إرسال السجل بنجاح!' : 'Transcript Sent Successfully!'}
              </h4>
              <p className="text-[10px] text-slate-450 dark:text-slate-400 leading-normal font-normal">
                {isRtl 
                  ? `أرسلنا نسخة كاملة من المحادثة إلى ${email}. يرجى التحقق من صندوق الوارد.` 
                  : `A complete transcript of your support session has been dispatched to ${email}.`}
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-4">
            
            {/* Metadata layout */}
            <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-100 dark:border-slate-850 rounded-2xl p-3.5 space-y-2.5 font-mono text-[9px] text-slate-450 uppercase select-none">
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/50 dark:border-slate-850">
                <span className="font-bold text-slate-500">{isRtl ? 'تفاصيل المحادثة' : 'Session Metadata'}</span>
                <span className="text-blue-500 font-bold">Farah-IVR-V2</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isRtl ? `المدة: ${chatDuration}` : `Duration: ${chatDuration}`}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isRtl ? `الرسائل: ${messageCount}` : `Total Msgs: ${messageCount}`}</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isRtl ? 'التاريخ: 2 يونيو 2026' : 'Date: June 2, 2026'}</span>
                </div>
              </div>
            </div>

            {/* Transcript preview */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider block">
                {isRtl ? 'معاينة سجل المحادثة:' : 'Transcript Dialogue Preview:'}
              </span>
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-950/30 max-h-24 overflow-y-auto space-y-2 text-[10px] font-normal leading-relaxed">
                {messagesPreview.map((msg, i) => (
                  <div key={i} className="flex gap-1">
                    <strong className={`shrink-0 font-bold ${msg.sender === 'user' ? 'text-blue-500' : 'text-emerald-500'}`}>
                      {msg.sender === 'user' ? 'Customer:' : 'Farah AI:'}
                    </strong>
                    <span className="text-slate-600 dark:text-slate-350">{msg.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Input field */}
            <div className="space-y-1.5">
              <label htmlFor="transcript-email" className="block text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider">
                {isRtl ? 'البريد الإلكتروني المستلم:' : 'Recipient Email Address:'}
              </label>
              <div className="relative">
                <input
                  id="transcript-email"
                  type="email"
                  required
                  placeholder="e.g. user@domain.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  className={`w-full pl-9 pr-3.5 py-2.5 border rounded-xl bg-transparent focus:outline-none focus:border-blue-500 text-xs font-semibold ${
                    emailError ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
                  } text-slate-900 dark:text-white`}
                />
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              </div>
              {emailError && (
                <span className="text-[10px] text-rose-500 font-bold mt-1 block flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{emailError}</span>
                </span>
              )}
            </div>

            {/* Simulated Error Toggler */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 select-none">
              <span className="text-[9px] text-slate-450 font-mono font-medium">SIMULATE TRANSMISSION FAILURE</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox"
                  checked={simulateTimeout}
                  onChange={() => setSimulateTimeout(!simulateTimeout)}
                  className="sr-only peer"
                />
                <div className="w-7 h-4 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-3 rtl:peer-checked:after:-translate-x-3 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-400 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white" />
              </label>
            </div>

            {sendState === 'error' && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center gap-2 text-[10px]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <div className="flex-1 leading-normal font-semibold">
                  {isRtl ? 'فشل إرسال سجل المحادثة. انتهت مهلة الإرسال.' : 'Could not dispatch SMTP transcript packet. SMTP timeout.'}
                </div>
                <button
                  type="button"
                  onClick={() => setSendState('idle')}
                  className="px-2 py-0.5 bg-rose-500 text-white rounded font-bold uppercase hover:bg-rose-650"
                >
                  Reset
                </button>
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-850"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={sendState === 'sending'}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                {sendState === 'sending' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{isRtl ? 'جاري الإرسال...' : 'Sending...'}</span>
                  </>
                ) : (
                  <span>{isRtl ? 'إرسال السجل' : 'Send Transcript'}</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </ModalWrapper>
  );
}
