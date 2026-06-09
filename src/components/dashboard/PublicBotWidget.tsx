'use client';

import React, { useState } from 'react';
import { Bot, Sparkles, Send, RefreshCw, KeyRound } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';
import { CsatSurveyWidget } from '../customer-portal/feedback/CsatSurveyWidget';
import { NpsSurveyWidget } from '../customer-portal/feedback/NpsSurveyWidget';
import { TranscriptEmailModal } from '../customer-portal/feedback/TranscriptEmailModal';
import { useFeedbackToasts } from '../customer-portal/feedback/PostChatToasts';

export function PublicBotWidget() {
  const { lang, addAuditLog } = useApp();
  const t = translations[lang];
  const { pushToast } = useFeedbackToasts();

  const [messages, setMessages] = useState<Array<{ sender: string; text: string; time: string }>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem('mPaaS_guest_chat_history');
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (err) {
        console.error('Failed to load guest chat history:', err);
      }
    }
    return [
      { sender: 'bot', text: 'مرحباً! أنا فرح المساعد الذكي. كيف يمكنني مساعدتك اليوم؟\n\nHi! I am Farah. How can I help you today?', time: '14:30' }
    ];
  });

  // Save guest chat messages to sessionStorage on updates
  React.useEffect(() => {
    try {
      sessionStorage.setItem('mPaaS_guest_chat_history', JSON.stringify(messages));
    } catch (err) {
      console.error('Failed to save guest chat history:', err);
    }
  }, [messages]);

  const handleEscalateToTicket = () => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('mPaaS_guest_chat_escalated', 'true');
        window.location.href = `/login?redirect=${encodeURIComponent('/portal/home?action=submit_ticket')}`;
      } catch (err) {
        console.error('Failed to initiate escalation:', err);
      }
    }
  };

  const [composer, setComposer] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP State
  const [otpStep, setOtpStep] = useState<'none' | 'order' | 'code' | 'verified'>('none');
  const [orderNumber, setOrderNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // Bot Feedback status
  const [botStatus, setBotStatus] = useState<'chat' | 'survey' | 'transcript'>('chat');
  const [surveyStep, setSurveyStep] = useState<'csat' | 'nps'>('csat');
  const [surveyCsat, setSurveyCsat] = useState(0);
  const [surveyNps, setSurveyNps] = useState(0);

  const handleSend = (text: string) => {
    if (!text) return;
    const newMsg = { sender: 'user', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, newMsg]);
    setComposer('');
    setLoading(true);

    setTimeout(() => {
      let reply = 'I have queried our RAG knowledge database, but I could not find a clear match. Let me transfer you to a live support representative.';
      const lower = text.toLowerCase();
      
      if (lower.includes('price') || lower.includes('cost') || lower.includes('pricing') || lower.includes('سعر')) {
        reply = 'The standard SaaS package is $49/month, and the Enterprise package is $99/month. We offer standard volume discounts.';
      } else if (lower.includes('refund') || lower.includes('return') || lower.includes('استرجاع')) {
        reply = 'Under our Return Policy (ks-1), refunds are allowed within 30 days of purchase. Please supply your Order ID to initiate the refund process.';
      } else if (lower.includes('hi') || lower.includes('hello') || lower.includes('مرحبا')) {
        reply = 'Hello! I am Farah AI, your self-service assistant. Would you like to check order status or ask a product question?';
      }

      setMessages(prev => [...prev, { sender: 'bot', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      setLoading(false);
    }, 1000);
  };

  const handleOtpLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpStep === 'order') {
      if (!orderNumber.startsWith('ORD-')) {
        alert('Please enter a valid order number starting with ORD- (e.g. ORD-99881)');
        return;
      }
      setLoading(true);
      setTimeout(() => {
        setOtpStep('code');
        setMessages(prev => [...prev, 
          { sender: 'user', text: `Lookup Order: ${orderNumber}`, time: '14:31' },
          { sender: 'bot', text: 'We found order ' + orderNumber + '. For security, we sent a 4-digit code to your registered email. Please enter the verification code below.', time: '14:31' }
        ]);
        setLoading(false);
      }, 1000);
    } else if (otpStep === 'code') {
      if (otpCode !== '1234') {
        alert('Incorrect code. Use code 1234 to verify.');
        return;
      }
      setLoading(true);
      setTimeout(() => {
        setOtpStep('verified');
        setMessages(prev => [...prev, 
          { sender: 'user', text: `Verify Code: ${otpCode}`, time: '14:32' },
          { sender: 'bot', text: `Verification successful!\n\nOrder Status: SHIPPED\nCarrier: SAP Logistic Trunk Express\nEst. Delivery: May 22, 2026\n\nLet me know if you need to schedule a voice callback or change delivery times.`, time: '14:32' }
        ]);
        setLoading(false);
      }, 1000);
    }
  };

  const handleCsatComplete = (rating: number, comment: string, tags: string[]) => {
    setSurveyCsat(rating);
    addAuditLog(`Guest Bot CSAT Rating: ${rating}/5, tags: ${tags.join(',')}`, 'success');
    setTimeout(() => {
      setSurveyStep('nps');
    }, 1500);
  };

  const handleNpsComplete = (score: number, comment: string) => {
    setSurveyNps(score);
    addAuditLog(`Guest Bot NPS Score: ${score}/10`, 'success');
    setTimeout(() => {
      setBotStatus('transcript');
    }, 1500);
  };

  const handleTranscriptClose = () => {
    setBotStatus('chat');
    setSurveyStep('csat');
    setOtpStep('none');
    setMessages([
      { sender: 'bot', text: 'مرحباً! أنا فرح المساعد الذكي. كيف يمكنني مساعدتك اليوم؟\n\nHi! I am Farah. How can I help you today?', time: '14:30' }
    ]);
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between h-[520px] text-xs font-semibold">
      {/* Widget Header */}
      <div className="bg-blue-600 px-5 py-4 text-white flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
            <Bot className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="font-bold text-xs">Farah AI Support</h3>
            <span className="text-[9px] opacity-75 font-semibold">Omnichannel Bot widget</span>
          </div>
        </div>
        {botStatus === 'chat' ? (
          <button
            onClick={() => setBotStatus('survey')}
            className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-[9px] font-bold transition-all active:scale-95 cursor-pointer"
          >
            {lang === 'ar' ? 'إنهاء الجلسة' : 'End Session'}
          </button>
        ) : (
          <Sparkles className="w-4.5 h-4.5 text-blue-205 glow-active" />
        )}
      </div>

      {/* Messages area or Survey layout */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3.5 bg-slate-50/50 dark:bg-slate-950/20">
        {botStatus === 'chat' && (
          <>
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white dark:bg-slate-800 border border-slate-250 dark:border-slate-700/50 text-slate-855 dark:text-slate-200 rounded-bl-none shadow-sm'
                }`}>
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-850 border border-slate-250 dark:border-slate-800 rounded-2xl px-3 py-2 flex items-center gap-1.5 font-bold text-blue-500 font-mono text-[10px]">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Typing...</span>
                </div>
              </div>
            )}
          </>
        )}

        {botStatus === 'survey' && (
          <div className="space-y-4 py-2">
            {surveyStep === 'csat' ? (
              <CsatSurveyWidget
                lang={lang}
                onComplete={handleCsatComplete}
                onToastTrigger={pushToast}
              />
            ) : (
              <NpsSurveyWidget
                lang={lang}
                onComplete={handleNpsComplete}
                onToastTrigger={pushToast}
              />
            )}
          </div>
        )}

        {botStatus === 'transcript' && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-3 p-4">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
            <span className="font-bold text-slate-400">Opening Transcript Email Dialog...</span>
          </div>
        )}
      </div>

      {/* OTP tracking form overlay if active */}
      {botStatus === 'chat' && otpStep !== 'none' && otpStep !== 'verified' && (
        <form onSubmit={handleOtpLookup} className="bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 p-4 space-y-3 shrink-0">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-blue-500 font-mono">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Verify Order Tracking</span>
          </div>

          {otpStep === 'order' ? (
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Order Number (e.g. ORD-99881)"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-855 bg-white dark:bg-slate-900 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-100 font-semibold"
              />
              <button type="submit" className="px-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 cursor-pointer">
                Next
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                required
                maxLength={4}
                placeholder="Enter 4-digit code (use 1234)"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-855 bg-white dark:bg-slate-900 rounded-xl text-xs focus:outline-none font-mono text-slate-850 dark:text-slate-100 font-semibold"
              />
              <button type="submit" className="px-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 cursor-pointer">
                Verify
              </button>
            </div>
          )}
        </form>
      )}

      {/* Quick shortcuts buttons */}
      {botStatus === 'chat' && otpStep === 'none' && (
        <div className="px-5 py-2 flex gap-1.5 overflow-x-auto bg-slate-50 dark:bg-slate-950/40 shrink-0 border-t border-slate-200/50 dark:border-slate-850 select-none">
          <button
            onClick={handleEscalateToTicket}
            className="px-3 py-1 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-805 rounded-full hover:border-blue-500 whitespace-nowrap text-[10px] text-blue-600 dark:text-blue-400 cursor-pointer font-bold animate-pulse"
          >
            File Support Ticket
          </button>
          <button
            onClick={() => setOtpStep('order')}
            className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full hover:border-blue-500 whitespace-nowrap text-[10px] cursor-pointer"
          >
            Order Tracking
          </button>
          <button
            onClick={() => handleSend('What is the price of standard subscription?')}
            className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full hover:border-blue-500 whitespace-nowrap text-[10px] cursor-pointer"
          >
            Check SaaS Pricing
          </button>
          <button
            onClick={() => handleSend('What is the return policy?')}
            className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full hover:border-blue-500 whitespace-nowrap text-[10px] cursor-pointer"
          >
            Refund Policies
          </button>
        </div>
      )}

      {/* Composer Input */}
      {botStatus === 'chat' && otpStep === 'none' && (
        <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 flex gap-2 bg-white dark:bg-slate-900 shrink-0">
          <input
            type="text"
            placeholder="Type a message..."
            value={composer}
            onChange={(e) => setComposer(e.target.value)}
            className="flex-1 px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-550 text-slate-850 dark:text-slate-100 font-semibold"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend(composer);
            }}
          />
          <button
            onClick={() => handleSend(composer)}
            className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Transcript email overlay */}
      <TranscriptEmailModal
        isOpen={botStatus === 'transcript'}
        onClose={handleTranscriptClose}
        lang={lang}
        agentName="Farah AI Bot Gateway"
        chatDuration="3m 15s"
        messageCount={messages.length + 2}
        messagesPreview={messages.map(m => ({ sender: m.sender === 'user' ? 'user' : 'bot', text: m.text }))}
        onToastTrigger={pushToast}
      />
    </div>
  );
}
