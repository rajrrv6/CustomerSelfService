'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';
import { Brain, Clock, Send, X } from 'lucide-react';
import { CsatSurveyWidget } from '../feedback/CsatSurveyWidget';
import { NpsSurveyWidget } from '../feedback/NpsSurveyWidget';
import { TranscriptEmailModal } from '../feedback/TranscriptEmailModal';
import { useFeedbackToasts } from '../feedback/PostChatToasts';

interface ChatMessage {
  sender: 'bot' | 'user' | 'agent' | 'system';
  text: string;
  time: string;
  isGuestHistory?: boolean;
}

interface LiveChatOverlayProps {
  chatOpen: boolean;
  setChatOpen: (val: boolean) => void;
  chatInput: string;
  setChatInput: (val: string) => void;
  chatLanguage: 'en' | 'ar';
  setChatLanguage: (val: 'en' | 'ar') => void;
  chatMessages: ChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  chatStatus: 'idle' | 'typing' | 'queue' | 'human_chat' | 'survey' | 'email_transcript';
  setChatStatus: (val: 'idle' | 'typing' | 'queue' | 'human_chat' | 'survey' | 'email_transcript') => void;
  queuePos: number;
  setQueuePos: React.Dispatch<React.SetStateAction<number>>;
  surveyCsat: number;
  setSurveyCsat: (val: number) => void;
  surveyNps: number;
  setSurveyNps: (val: number) => void;
  transcriptEmail: string;
  setTranscriptEmail: (val: string) => void;
  handleSendChatMessage: (text: string) => void;
}

export function LiveChatOverlay({
  chatOpen,
  setChatOpen,
  chatInput,
  setChatInput,
  chatLanguage,
  setChatLanguage,
  chatMessages,
  setChatMessages,
  chatStatus,
  setChatStatus,
  queuePos,
  setQueuePos,
  surveyCsat,
  setSurveyCsat,
  surveyNps,
  setSurveyNps,
  transcriptEmail,
  setTranscriptEmail,
  handleSendChatMessage
}: LiveChatOverlayProps) {
  const { lang, addAuditLog } = useApp();
  const t = translations[lang];
  const { pushToast } = useFeedbackToasts();
  
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [surveyStep, setSurveyStep] = useState<'csat' | 'nps'>('csat');

  // Detect high contrast mode
  useEffect(() => {
    const checkHighContrast = () => {
      const root = document.documentElement;
      const hasHighContrast = root.classList.contains('high-contrast-mode');
      setIsHighContrast(hasHighContrast);
    };
    
    checkHighContrast();
    const observer = new MutationObserver(checkHighContrast);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Merge guest chat history on mount if available
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem('mPaaS_guest_chat_history');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          setChatMessages((prev) => {
            const systemMsg: ChatMessage = {
              sender: 'system',
              text: lang === 'ar' 
                ? '--- محادثة الزائر السابقة ---' 
                : '--- Previous Guest Session History ---',
              time: ''
            };
            
            const filteredCached = parsed.map((msg: any) => ({
              sender: msg.sender as 'bot' | 'user' | 'agent' | 'system',
              text: msg.text,
              time: msg.time || '',
              isGuestHistory: true
            }));
            
            // Prepend guest conversation logs to existing chat state, omitting the default authenticated greeting
            return [
              ...filteredCached,
              systemMsg,
              ...prev.filter(msg => msg.text !== prev[0]?.text)
            ];
          });
        }
        sessionStorage.removeItem('mPaaS_guest_chat_history');
      }
    } catch (err) {
      console.error('Failed to merge guest chat history:', err);
    }
  }, [lang, setChatMessages]);

  const handleCsatComplete = (rating: number, comment: string, tags: string[]) => {
    setSurveyCsat(rating);
    addAuditLog(`LiveChat CSAT: ${rating}/5, Tags: ${tags.join(',')}`, 'success');
    setTimeout(() => {
      setSurveyStep('nps');
    }, 1500);
  };

  const handleNpsComplete = (score: number, comment: string) => {
    setSurveyNps(score);
    addAuditLog(`LiveChat NPS: ${score}/10, Comment: ${comment}`, 'success');
    setTimeout(() => {
      setChatStatus('email_transcript');
    }, 1500);
  };

  const handleTranscriptClose = () => {
    setChatStatus('idle');
    setChatOpen(false);
    setSurveyStep('csat');
    setChatMessages([
      { sender: 'bot', text: 'Hi! I am Farah. How can I help you today?\n\nأهلاً! أنا فرح المساعد الذكي. كيف يمكنني مساعدتك؟', time: '15:00' }
    ]);
  };

  return (
    <div className={`fixed bottom-6 ${lang === 'ar' ? 'left-6' : 'right-6'} z-40`}>
      {chatOpen ? (
        /* Opened chat screen */
        <div className="bg-[#0b0f19] text-white rounded-3xl w-80 max-w-[calc(100vw-2rem)] shadow-2xl flex flex-col justify-between border border-slate-800/80 animate-in zoom-in-95 text-xs font-semibold" style={{ height: '460px' }}>
          {/* Chat header */}
          <div className="bg-slate-900 px-4 py-3.5 text-white flex justify-between items-center rounded-t-3xl shrink-0 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <Brain className="w-5 h-5 text-blue-400 animate-pulse" />
              <div>
                <h4 className="font-bold text-xs tracking-tight">{t.portal.liveChat.botName}</h4>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] text-slate-400 font-semibold">{t.portal.liveChat.botSubtitle}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-1.5 items-center">
              <button
                onClick={() => setChatLanguage(chatLanguage === 'en' ? 'ar' : 'en')}
                className="text-[9px] px-2 py-0.5 bg-slate-800 hover:bg-slate-750 border border-slate-700/50 rounded font-mono font-bold cursor-pointer transition-colors"
                title="Toggle translation locale"
              >
                {chatLanguage.toUpperCase()}
              </button>
              <button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat messages */}
          <div 
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/20"
            aria-live="polite"
            aria-atomic="false"
          >
            {chatStatus !== 'survey' && chatStatus !== 'email_transcript' && (
              <>
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed transition-all duration-200 relative ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-sm shadow-blue-500/10'
                          : msg.sender === 'system'
                          ? 'bg-purple-950/40 text-purple-300 border border-purple-900/35 font-mono text-[9.5px] text-center mx-auto rounded-lg px-3 py-1.5'
                          : 'bg-slate-805 text-slate-200 rounded-bl-sm border border-slate-700/60'
                      } ${msg.isGuestHistory ? 'opacity-75 border border-dashed border-slate-600 bg-slate-800/80' : ''}`}
                    >
                      {msg.isGuestHistory && msg.sender !== 'system' && (
                        <span className="text-[8px] uppercase tracking-wider font-extrabold text-blue-400 block mb-1 select-none">
                          Guest Session History
                        </span>
                      )}
                      <p className="whitespace-pre-line text-xs font-medium">{msg.text}</p>
                      {msg.time && <span className="text-[9px] opacity-40 block mt-1.5 text-right">{msg.time}</span>}
                    </div>
                  </div>
                ))}

                {/* Bot typing state simulation */}
                {chatStatus === 'typing' && (
                  <div className="flex justify-start">
                    <div className="bg-slate-800 border border-slate-700/50 rounded-2xl px-3.5 py-2 flex items-center gap-2 text-blue-400 font-mono text-[10px]">
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      <span>{t.portal.liveChat.farahTyping}</span>
                    </div>
                  </div>
                )}

                {/* Handoff queue intermediate position state */}
                {chatStatus === 'queue' && (
                  <div className="text-center py-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3 shadow-inner">
                    <span className="text-amber-500 font-bold block animate-pulse text-xs">{t.portal.liveChat.routingToAgent}</span>
                    <div className="text-[10px] text-slate-400 font-mono space-y-0.5">
                      <p>{t.portal.liveChat.queuePosition} <strong>{queuePos}</strong></p>
                      <p>{t.portal.liveChat.estimatedWait} <strong>{queuePos * 1.5} {t.portal.liveChat.mins}</strong></p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Survey state */}
            {chatStatus === 'survey' && (
              <div className="space-y-4">
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

            {/* Email Transcript Loading Panel */}
            {chatStatus === 'email_transcript' && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 p-4">
                <Clock className="w-8 h-8 text-blue-500 animate-spin" />
                <span className="font-bold text-slate-200">Opening Email Transcript Wizard...</span>
              </div>
            )}
          </div>

          {/* Input Composer */}
          {chatStatus !== 'survey' && chatStatus !== 'email_transcript' && (
            <div className="p-3 border-t border-slate-800 flex gap-2 bg-[#0b0f19] rounded-b-3xl shrink-0">
              <input
                type="text"
                placeholder={t.portal.liveChat.inputPlaceholder}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-3.5 py-2 border border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-xs text-white font-semibold"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendChatMessage(chatInput);
                }}
              />
              
              {chatStatus === 'human_chat' ? (
                <button
                  type="button"
                  onClick={() => setChatStatus('survey')}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-bold cursor-pointer transition-colors shadow-sm"
                  title="End Conversation and Survey"
                >
                  {t.portal.liveChat.closeChat}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setChatStatus('queue');
                    setQueuePos(3);
                  }}
                  className="px-3.5 py-2 bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-200 rounded-xl text-[10px] font-bold cursor-pointer transition-colors shadow-sm animate-pulse"
                  title="Consult Human Desk"
                >
                  {t.portal.liveChat.agentButton}
                </button>
              )}

              <button
                onClick={() => handleSendChatMessage(chatInput)}
                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl cursor-pointer transition-colors shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Closed chat bubble icon */
        <button
          onClick={() => setChatOpen(true)}
          aria-label="Open Farah AI support chat"
          style={{
            backgroundColor: isHighContrast ? '#000000' : '#2563eb',
            color: isHighContrast ? '#ffff00' : '#ffffff',
            width: '56px',
            height: '56px',
            borderRadius: '9999px',
            boxShadow: isHighContrast ? 'none' : '0 20px 25px -5px rgba(37, 99, 235, 0.3)',
            border: isHighContrast ? '3px solid #ffff00' : '2px solid white',
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            if (isHighContrast) {
              e.currentTarget.style.backgroundColor = '#ffff00';
              e.currentTarget.style.color = '#000000';
            } else {
              e.currentTarget.style.backgroundColor = '#1d4ed8';
              e.currentTarget.style.boxShadow = '0 25px 30px -5px rgba(37, 99, 235, 0.4)';
            }
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            if (isHighContrast) {
              e.currentTarget.style.backgroundColor = '#000000';
              e.currentTarget.style.color = '#ffff00';
            } else {
              e.currentTarget.style.backgroundColor = '#2563eb';
              e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(37, 99, 235, 0.3)';
            }
            e.currentTarget.style.transform = 'scale(1)';
          }}
          onFocus={(e) => {
            e.currentTarget.style.outline = isHighContrast ? '2px solid #ffff00' : '2px solid #3b82f6';
            e.currentTarget.style.outlineOffset = '2px';
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = 'none';
          }}
        >
          <Brain className="w-7 h-7" style={{ color: 'currentColor' }} />
        </button>
      )}

      {/* Transcript Email Modal overlay */}
      <TranscriptEmailModal
        isOpen={chatStatus === 'email_transcript'}
        onClose={handleTranscriptClose}
        lang={lang}
        agentName="Nadia Vance (Support Desk)"
        chatDuration="5m 12s"
        messageCount={chatMessages.length + 3}
        messagesPreview={chatMessages.map(m => ({ sender: m.sender === 'user' ? 'user' : 'bot', text: m.text }))}
        onToastTrigger={pushToast}
      />
    </div>
  );
}
