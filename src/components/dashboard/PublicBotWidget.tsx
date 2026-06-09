'use client';

import React, { useState } from 'react';
import { Bot, Sparkles, Send, RefreshCw, KeyRound, BookOpen } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';
import { CsatSurveyWidget } from '../customer-portal/feedback/CsatSurveyWidget';
import { NpsSurveyWidget } from '../customer-portal/feedback/NpsSurveyWidget';
import { TranscriptEmailModal } from '../customer-portal/feedback/TranscriptEmailModal';
import { useFeedbackToasts } from '../customer-portal/feedback/PostChatToasts';
import { kbArticles } from '../customer-portal/shared/constants';

interface Suggestion {
  type: 'kb' | 'action';
  label: string;
  articleId?: string;
  actionType?: 'callback' | 'ticket' | 'live_chat' | 'pricing';
}

const getBotResponse = (lowerText: string): { reply: string; suggestions?: Suggestion[] } => {
  if (lowerText.includes('price') || lowerText.includes('cost') || lowerText.includes('pricing') || lowerText.includes('سعر')) {
    return {
      reply: 'The standard SaaS package is $49/month, and the Enterprise package is $99/month. We offer standard volume discounts.',
      suggestions: [
        { type: 'kb', label: 'Refund Policies', articleId: 'art-1' },
        { type: 'action', label: 'Book Voice Callback', actionType: 'callback' },
        { type: 'action', label: 'File Support Case', actionType: 'ticket' }
      ]
    };
  }
  
  if (lowerText.includes('refund') || lowerText.includes('return') || lowerText.includes('استرجاع')) {
    return {
      reply: 'Under our Return Policy (ks-1), refunds are allowed within 30 days of purchase. Please supply your Order ID to initiate the refund process.',
      suggestions: [
        { type: 'kb', label: 'How to Request Refund', articleId: 'art-1' },
        { type: 'kb', label: 'Gateway Delivery Delays', articleId: 'art-4' },
        { type: 'action', label: 'File Support Case', actionType: 'ticket' }
      ]
    };
  }

  if (lowerText.includes('cancel') || lowerText.includes('delete') || lowerText.includes('unsubscribe') || lowerText.includes('إلغاء')) {
    return {
      reply: 'To cancel your subscription, client admins can manage active subscriptions inside the settings portal. Standard subscriptions remain active until the end of the billing period.',
      suggestions: [
        { type: 'kb', label: 'Refund Policies', articleId: 'art-1' },
        { type: 'action', label: 'Request Callback', actionType: 'callback' },
        { type: 'action', label: 'Submit Ticket', actionType: 'ticket' }
      ]
    };
  }

  if (lowerText.includes('oauth') || lowerText.includes('api') || lowerText.includes('connector') || lowerText.includes('integration')) {
    return {
      reply: 'We support OAuth 2.0 client credentials flows for secure integrations with CRM and ERP hubs.',
      suggestions: [
        { type: 'kb', label: 'Setup API OAuth Client', articleId: 'art-2' },
        { type: 'action', label: 'Continue with Live Support', actionType: 'live_chat' }
      ]
    };
  }

  if (lowerText.includes('login') || lowerText.includes('lock') || lowerText.includes('auth') || lowerText.includes('password') || lowerText.includes('دخول')) {
    return {
      reply: 'If your registry account access is locked, you can trigger a secure OTP code reset using your registered corporate email.',
      suggestions: [
        { type: 'kb', label: 'Unlock Login Credentials', articleId: 'art-3' },
        { type: 'action', label: 'Connect to Live Agent', actionType: 'live_chat' }
      ]
    };
  }

  if (lowerText.includes('hi') || lowerText.includes('hello') || lowerText.includes('مرحبا')) {
    return {
      reply: 'Hello! I am Farah AI, your self-service assistant. Would you like to check order status, look up billing questions, or ask a product integration question?',
      suggestions: [
        { type: 'action', label: 'Check SaaS Pricing', actionType: 'pricing' },
        { type: 'kb', label: 'Refund Policies', articleId: 'art-1' }
      ]
    };
  }

  // Default fallback:
  return {
    reply: 'I searched our RAG database but couldn\'t find a perfect article match. Would you like to check our direct support options below?',
    suggestions: [
      { type: 'action', label: 'Request Callback', actionType: 'callback' },
      { type: 'action', label: 'File Support Case', actionType: 'ticket' },
      { type: 'action', label: 'Connect to Live Desk', actionType: 'live_chat' }
    ]
  };
};

export function PublicBotWidget() {
  const { lang, addAuditLog } = useApp();
  const t = translations[lang];
  const { pushToast } = useFeedbackToasts();

  const [messages, setMessages] = useState<Array<{
    sender: string;
    text: string;
    time: string;
    suggestions?: Suggestion[];
    isSystem?: boolean;
    isError?: boolean;
    isGuestHistory?: boolean;
  }>>(() => {
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
      {
        sender: 'bot',
        text: 'مرحباً! أنا فرح المساعد الذكي. كيف يمكنني مساعدتك اليوم؟\n\nHi! I am Farah. How can I help you today?',
        time: '14:30',
        suggestions: [
          { type: 'action', label: 'Check SaaS Pricing', actionType: 'pricing' },
          { type: 'kb', label: 'Refund Policies', articleId: 'art-1' },
          { type: 'action', label: 'Order Status search', actionType: 'pricing' }
        ]
      }
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

  const handleSuggestionClick = (sug: Suggestion) => {
    const getCurrentTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (sug.type === 'kb' && sug.articleId) {
      const art = kbArticles.find(a => a.id === sug.articleId);
      if (art) {
        addAuditLog(`Guest clicked KB deflection: ${art.title}`, 'success');
        
        setMessages(prev => [
          ...prev,
          { sender: 'user', text: `Read article: ${art.title}`, time: getCurrentTime() }
        ]);
        
        setLoading(true);
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              sender: 'bot',
              text: `Here is the article summary for **${art.title}**:\n\n${art.content.substring(0, 250)}...\n\n_Log in to read the full article._`,
              time: getCurrentTime(),
              suggestions: [
                { type: 'action', label: 'File Support Case', actionType: 'ticket' },
                { type: 'action', label: 'Connect to Live Desk', actionType: 'live_chat' }
              ]
            }
          ]);
          setLoading(false);
        }, 600);
      }
    } else if (sug.type === 'action' && sug.actionType) {
      if (sug.actionType === 'callback') {
        setMessages(prev => [
          ...prev,
          { sender: 'user', text: 'Schedule Callback', time: getCurrentTime() },
          {
            sender: 'bot',
            text: 'Your callback request will continue after login redirection.',
            time: getCurrentTime()
          }
        ]);
        setTimeout(() => {
          window.location.href = '/callback';
        }, 1200);
      } else if (sug.actionType === 'ticket') {
        handleEscalateToTicket();
      } else if (sug.actionType === 'live_chat') {
        window.location.href = `/login?redirect=${encodeURIComponent('/portal/home?action=open_chat')}`;
      } else if (sug.actionType === 'pricing') {
        handleSend('Check SaaS Pricing');
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
      const lower = text.toLowerCase();
      
      if (lower.includes('offline') || lower.includes('trigger error')) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'system',
            text: '⚠️ Network connection weak. AI response failed to generate.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSystem: true,
            isError: true
          }
        ]);
        setLoading(false);
        return;
      }

      const result = getBotResponse(lower);
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: result.reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions: result.suggestions
        }
      ]);
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
    <div className="max-w-md w-full mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between h-[540px] text-xs font-semibold transition-all">
      {/* Widget Header */}
      <div className="bg-slate-900 dark:bg-slate-950 px-5 py-4 text-white flex justify-between items-center shrink-0 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-xs sm:text-sm tracking-tight">Farah AI Support</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-slate-400 font-semibold">{lang === 'ar' ? 'نشط الآن' : 'Active Now'}</span>
            </div>
          </div>
        </div>
        {botStatus === 'chat' ? (
          <button
            onClick={() => setBotStatus('survey')}
            className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-700/50 rounded-lg text-[10px] font-bold transition-all active:scale-95 cursor-pointer"
          >
            {lang === 'ar' ? 'إنهاء الجلسة' : 'End Session'}
          </button>
        ) : (
          <Sparkles className="w-4.5 h-4.5 text-blue-400 glow-active" />
        )}
      </div>

      {/* Messages area or Survey layout */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/30 dark:bg-slate-955/20">
        {botStatus === 'chat' && (
          <>
            {messages.map((msg, idx) => {
              const isSystem = msg.isSystem;
              const isUser = msg.sender === 'user';
              const isEscalation = msg.text.includes('login redirection') || msg.text.includes('التحويل');
              const isHistory = msg.isGuestHistory;

              return (
                <div key={idx} className={`flex ${isSystem ? 'justify-center w-full' : isUser ? 'justify-end' : 'justify-start'}`}>
                  {isSystem ? (
                    <div className={`text-center py-3 px-4 rounded-xl font-mono text-[10px] w-full max-w-[90%] ${msg.isError ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 border border-rose-200/50 dark:border-rose-900/30' : 'bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border border-slate-200/30'}`}>
                      <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                      {msg.isError && (
                        <button
                          onClick={() => handleSend(messages[idx - 1]?.text || 'Hi')}
                          className="mt-2 px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-50 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-450 rounded-lg text-[9px] font-bold cursor-pointer transition-colors shadow-xs"
                        >
                          Retry Query
                        </button>
                      )}
                    </div>
                  ) : isEscalation ? (
                    <div className="max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed shadow-sm bg-amber-50 dark:bg-amber-950/15 border border-amber-200/80 dark:border-amber-900/30 text-amber-850 dark:text-amber-300 rounded-bl-none flex gap-2">
                      <Sparkles className="w-4 h-4 text-amber-550 shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-amber-600 dark:text-amber-500 block mb-0.5">
                          {lang === 'ar' ? 'تنبيه التحويل' : 'Escalation Notice'}
                        </span>
                        <p className="whitespace-pre-line text-xs font-semibold">{msg.text}</p>
                      </div>
                    </div>
                  ) : (
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed shadow-sm transition-all relative ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-br-sm shadow-blue-500/10'
                        : 'bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-750 text-slate-850 dark:text-slate-250 rounded-bl-sm'
                    } ${isHistory ? 'opacity-75 border-dashed border-slate-450 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/60' : ''}`}>
                      {isHistory && (
                        <span className="text-[8px] uppercase tracking-wider font-extrabold text-blue-500 dark:text-blue-400 block mb-1 select-none">
                          {lang === 'ar' ? 'سجل محادثة الزائر' : 'Guest Session History'}
                        </span>
                      )}
                      <p className="whitespace-pre-line text-xs font-medium">{msg.text}</p>
                      {msg.time && <span className="text-[9px] opacity-40 block mt-1.5 text-right">{msg.time}</span>}
                      
                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-700/50">
                          {msg.suggestions.map((sug, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => handleSuggestionClick(sug)}
                              className="px-2.5 py-1.5 bg-slate-50 hover:bg-blue-50 dark:bg-slate-900/80 dark:hover:bg-blue-950/25 border border-slate-200 hover:border-blue-300 dark:border-slate-750 dark:hover:border-blue-800/60 text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-450 rounded-xl text-[10px] font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-xs"
                            >
                              {sug.type === 'kb' ? <BookOpen className="w-3 h-3 text-blue-500" /> : <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                              <span>{sug.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 flex items-center gap-2 font-bold text-blue-500 font-mono text-[10px]">
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
        <form onSubmit={handleOtpLookup} className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800/80 p-4 space-y-3 shrink-0">
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
                className="flex-1 px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-850 dark:text-slate-100 font-semibold"
              />
              <button type="submit" className="px-4 py-2 bg-blue-650 text-white font-bold rounded-xl hover:bg-blue-700 cursor-pointer shadow-sm">
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
                className="flex-1 px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-mono text-slate-850 dark:text-slate-100 font-semibold"
              />
              <button type="submit" className="px-4 py-2 bg-blue-650 text-white font-bold rounded-xl hover:bg-blue-700 cursor-pointer shadow-sm">
                Verify
              </button>
            </div>
          )}
        </form>
      )}

      {/* Quick shortcuts buttons */}
      {botStatus === 'chat' && otpStep === 'none' && (
        <div className="px-5 py-2.5 flex gap-2 overflow-x-auto bg-slate-50 dark:bg-slate-950/40 shrink-0 border-t border-slate-200/60 dark:border-slate-800/60 select-none">
          <button
            onClick={handleEscalateToTicket}
            className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800/80 rounded-full whitespace-nowrap text-[10px] text-blue-600 dark:text-blue-450 cursor-pointer font-bold transition-all shadow-xs"
          >
            File Support Ticket
          </button>
          <button
            onClick={() => setOtpStep('order')}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-full whitespace-nowrap text-[10px] text-slate-655 dark:text-slate-350 cursor-pointer transition-colors shadow-xs"
          >
            Order Tracking
          </button>
          <button
            onClick={() => handleSend('What is the price of standard subscription?')}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-full whitespace-nowrap text-[10px] text-slate-655 dark:text-slate-350 cursor-pointer transition-colors shadow-xs"
          >
            Check SaaS Pricing
          </button>
          <button
            onClick={() => handleSend('What is the return policy?')}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-full whitespace-nowrap text-[10px] text-slate-655 dark:text-slate-350 cursor-pointer transition-colors shadow-xs"
          >
            Refund Policies
          </button>
        </div>
      )}

      {/* Composer Input */}
      {botStatus === 'chat' && otpStep === 'none' && (
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/85 flex gap-2 bg-white dark:bg-slate-900 shrink-0">
          <input
            type="text"
            placeholder="Type a message..."
            value={composer}
            onChange={(e) => setComposer(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs text-slate-850 dark:text-slate-100 font-semibold"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend(composer);
            }}
          />
          <button
            onClick={() => handleSend(composer)}
            className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md cursor-pointer transition-colors"
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
