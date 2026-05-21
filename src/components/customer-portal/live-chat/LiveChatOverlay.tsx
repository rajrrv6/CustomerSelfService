'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Brain, Clock, Send, Star, X, CheckCircle } from 'lucide-react';

interface ChatMessage {
  sender: 'bot' | 'user' | 'agent' | 'system';
  text: string;
  time: string;
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
  const [showSurveyThankYou, setShowSurveyThankYou] = React.useState(false);
  const [showTranscriptSent, setShowTranscriptSent] = React.useState(false);
  const [isHighContrast, setIsHighContrast] = React.useState(false);
  
  // Detect high contrast mode
  React.useEffect(() => {
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

  return (
    <div className={`fixed bottom-6 ${lang === 'ar' ? 'left-6' : 'right-6'} z-40`}>
      {chatOpen ? (
        /* Opened chat screen */
        <div className="bg-[#0b0f19] text-white rounded-3xl w-80 max-w-[calc(100vw-2rem)] shadow-2xl flex flex-col justify-between border border-slate-800 animate-in zoom-in-95 text-xs font-semibold" style={{ height: '450px' }}>
          {/* Chat header */}
          <div className="bg-blue-600 px-4 py-3 text-white flex justify-between items-center rounded-t-3xl shrink-0">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-250" />
              <div>
                <h4 className="font-bold text-xs">Farah AI Support</h4>
                <span className="text-[9px] opacity-75 block font-mono">Omnichannel Bot Portal</span>
              </div>
            </div>
            
            <div className="flex gap-1">
              <button
                onClick={() => setChatLanguage(chatLanguage === 'en' ? 'ar' : 'en')}
                className="text-[9px] px-1.5 py-0.5 bg-white/20 rounded font-mono font-bold"
                title="Toggle translation locale"
              >
                {chatLanguage.toUpperCase()}
              </button>
              <button onClick={() => setChatOpen(false)} className="text-white hover:text-slate-250 text-sm">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat messages */}
          <div 
            className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-950/20"
            aria-live="polite"
            aria-atomic="false"
          >

            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : msg.sender === 'system'
                      ? 'bg-purple-900/40 text-purple-200 font-mono text-[9px] text-center mx-auto rounded-lg'
                      : 'bg-slate-800 text-slate-202 rounded-bl-none border border-slate-700/50'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  {msg.time && <span className="text-[8px] opacity-50 block mt-1 text-right">{msg.time}</span>}
                </div>
              </div>
            ))}

            {/* Bot typing state simulation */}
            {chatStatus === 'typing' && (
              <div className="flex justify-start">
                <div className="bg-slate-800 border border-slate-700/50 rounded-2xl px-3 py-2 flex items-center gap-1.5 text-blue-400 font-mono text-[9px]">
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>Farah typing...</span>
                </div>
              </div>
            )}

            {/* Handoff queue intermediate position state */}
            {chatStatus === 'queue' && (
              <div className="text-center py-4 bg-slate-900/50 border border-slate-800 rounded-xl space-y-2">
                <span className="text-amber-500 font-bold block animate-pulse">Routing to Live Agent...</span>
                <div className="text-[10px] text-slate-450">
                  <p>Current Queue Position: <strong>{queuePos}</strong></p>
                  <p>Estimated wait: <strong>{queuePos * 1.5} mins</strong></p>
                </div>
              </div>
            )}

            {/* Survey state */}
            {chatStatus === 'survey' && (
              showSurveyThankYou ? (
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center space-y-3 flex flex-col items-center justify-center min-h-[200px]">
                  <CheckCircle className="w-10 h-10 text-emerald-550 animate-bounce" />
                  <span className="font-bold text-sm text-white">Thank You!</span>
                  <p className="text-[10px] text-slate-400">Your chat feedback has been logged.</p>
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl space-y-3.5">
                  <div className="text-center space-y-1">
                    <span className="font-bold text-xs">CSAT Satisfaction Survey</span>
                    <p className="text-[10px] text-slate-450 font-normal">How was your interaction with Agent Nadia Vance?</p>
                  </div>
                  
                  {/* Stars input */}
                  <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setSurveyCsat(st)}
                        className={`p-1 ${surveyCsat >= st ? 'text-amber-505' : 'text-slate-600 hover:text-amber-450'}`}
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    ))}
                  </div>

                  {/* NPS score selector */}
                  <div className="pt-2 border-t border-slate-800 space-y-1 text-center">
                    <span className="text-[10px] text-slate-400 font-bold">Net Promoter Score (NPS)</span>
                    <p className="text-[9px] text-slate-450 font-normal">Scale 1 (Low) to 10 (High)</p>
                    <div className="flex flex-wrap justify-center gap-1 mt-1">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSurveyNps(i + 1)}
                          className={`w-6 h-6 rounded flex items-center justify-center font-mono text-[9px] ${
                            surveyNps === i + 1 ? 'bg-purple-650 text-white' : 'bg-slate-800 hover:bg-slate-700'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      addAuditLog(`CSAT logged (${surveyCsat}/5) & NPS logged (${surveyNps}/10)`, 'success');
                      setShowSurveyThankYou(true);
                      setTimeout(() => {
                        setShowSurveyThankYou(false);
                        setChatStatus('email_transcript');
                      }, 1500);
                    }}
                    className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-[10px] text-center font-bold"
                  >
                    Submit Survey Metrics
                  </button>
                </div>
              )
            )}

            {/* Email Transcript Modal */}
            {chatStatus === 'email_transcript' && (
              showTranscriptSent ? (
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center space-y-3 flex flex-col items-center justify-center min-h-[200px]">
                  <CheckCircle className="w-10 h-10 text-emerald-550 animate-bounce" />
                  <span className="font-bold text-sm text-white">Transcript Sent!</span>
                  <p className="text-[10px] text-slate-400 font-mono font-normal">Dispatched to {transcriptEmail}</p>
                </div>
              ) : (
                <div className="bg-slate-905 border border-slate-808 p-3 rounded-xl space-y-3">
                  <span className="font-bold text-[10px] uppercase font-mono block text-center text-blue-500">Email Chat Transcript</span>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="david.miller@yahoo.com"
                      value={transcriptEmail}
                      onChange={(e) => setTranscriptEmail(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-800 bg-slate-950 rounded-xl text-xs focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      addAuditLog(`Dispatched chat transcript to email: ${transcriptEmail}`, 'success');
                      setShowTranscriptSent(true);
                      setTimeout(() => {
                        setShowTranscriptSent(false);
                        setChatStatus('idle');
                        setChatOpen(false);
                        setTranscriptEmail('');
                        setChatMessages([{ sender: 'bot', text: 'Hi! I am Farah. How can I help you today?\n\nأهلاً! أنا فرح المساعد الذكي. كيف يمكنني مساعدتك؟', time: '15:00' }]);
                        setSurveyCsat(0);
                        setSurveyNps(0);
                      }, 1500);
                    }}
                    className="w-full py-1.5 bg-blue-600 rounded-xl text-[10px] text-center font-bold"
                  >
                    Send Transcript Log
                  </button>
                </div>
              )
            )}
          </div>

          {/* Input Composer */}
          {chatStatus !== 'survey' && chatStatus !== 'email_transcript' && (
            <div className="p-3 border-t border-slate-800 flex gap-2 bg-[#0b0f19] rounded-b-3xl shrink-0">
              <input
                type="text"
                placeholder="Type a message or press 'agent'..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-800 bg-transparent rounded-xl focus:outline-none text-xs text-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendChatMessage(chatInput);
                }}
              />
              
              {chatStatus === 'human_chat' ? (
                <button
                  type="button"
                  onClick={() => setChatStatus('survey')}
                  className="px-2 bg-rose-600 hover:bg-rose-700 rounded-xl text-[9px] font-bold"
                  title="End Conversation and Survey"
                >
                  Close
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setChatStatus('queue');
                    setQueuePos(3);
                  }}
                  className="px-2 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 rounded-xl text-[9px] font-bold"
                  title="Consult Human Desk"
                >
                  Agent
                </button>
              )}

              <button
                onClick={() => handleSendChatMessage(chatInput)}
                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
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
    </div>
  );
}
