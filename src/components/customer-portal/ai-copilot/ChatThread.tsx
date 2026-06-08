import React, { useRef, useEffect } from 'react';
import { Brain, Copy, Volume2, RefreshCw, ThumbsUp, ThumbsDown } from 'lucide-react';
import { ChatThreadProps } from './types';
import { ANIMATION_TRANSITIONS } from './constants';

export function ChatThread({
  isRtl,
  activeConv,
  isStreaming,
  streamingText,
  speakingMessageId,
  setSpeakingMessageId,
  isTtsEnabled,
  handleCopyText,
  handleRateResponse,
  simulateAiResponse,
  setSelectedCitation,
  setShowTracePanel,
  chatBottomRef,
  setChatInput,
  textareaRef
}: ChatThreadProps) {
  const threadContainerRef = useRef<HTMLDivElement>(null);

  // Scroll Performance Optimization: Only scroll if the user is already near the bottom
  useEffect(() => {
    const container = threadContainerRef.current;
    if (!container) return;

    const threshold = 150; // pixels
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;

    if (isNearBottom || (isStreaming && streamingText.length <= 10)) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConv?.messages, streamingText, isStreaming, chatBottomRef]);

  return (
    <div 
      ref={threadContainerRef}
      className="flex-1 overflow-y-auto p-5 space-y-5"
    >
      
      {/* Welcome Screen Suggestions if thread is empty */}
      {activeConv?.messages.length <= 1 && !isStreaming && (
        <div className="py-8 space-y-6 max-w-lg mx-auto text-center animate-in fade-in duration-300">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-black tracking-tight">{isRtl ? 'مساعد الذكاء الاصطناعي Farah AI' : 'Farah AI-Native Agent'}</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto rtl:leading-loose">
              {isRtl ? 'مساعدك الذكي المدعوم بمؤشر Pinecone RAG لحل التذاكر والاستعلام الفوري.' : 'Semantic search and NLU client portal orchestrating quick resolution cycles.'}
            </p>
          </div>

          {/* Suggestions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 text-left">
            {[
              {
                title: isRtl ? 'طلب استرداد SaaS' : 'SaaS Subscription Refund',
                desc: isRtl ? 'استرداد الفاتورة INV-2026-7891' : 'Verify refund for ORD-99881',
                prompt: isRtl ? 'أريد استرداد أموال طلبي ORD-99881' : 'I want a refund for my order ORD-99881',
                icon: '💳'
              },
              {
                title: isRtl ? 'أخطاء الموصلات API' : 'Connector Latency 403',
                desc: isRtl ? 'OAuth scopes read:billing' : 'How do I resolve Stripe 403 API errors',
                prompt: isRtl ? 'أحصل على خطأ 403 عند استخدام موصلات Client-Gate' : 'I get a 403 Forbidden error using Client-Gate',
                icon: '🔌'
              },
              {
                title: isRtl ? 'تسجيلات الدخول المغلقة' : 'Registry OTP Locks',
                desc: isRtl ? 'إعادة تعيين السجل المدني' : 'Registry password locked after consecutive failures',
                prompt: isRtl ? 'أواجه مشكلة في تسجيل الدخول المغلق لـ Civil Registry' : 'My password registry authentication locked up',
                icon: '🔒'
              },
              {
                title: isRtl ? 'بوابة الألياف البصرية' : 'Fiber Gateway Shipments',
                desc: isRtl ? 'التحقق من تأخير الشحنات' : 'Tracking delayed gateways inside SAP',
                prompt: isRtl ? 'كيف أستفسر عن شحنة بوابة الألياف ORD-77612' : 'How do I query tracking metrics for fiber gateways',
                icon: '📦'
              }
            ].map((sug, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setChatInput(sug.prompt);
                  textareaRef.current?.focus();
                }}
                className={`p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-left cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-blue-500/20 flex gap-2.5 items-start focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${ANIMATION_TRANSITIONS}`}
                style={{ textAlign: isRtl ? 'right' : 'left' }}
              >
                <span className="text-lg shrink-0 mt-0.5">{sug.icon}</span>
                <div className="space-y-0.5 truncate flex-1 rtl:text-right">
                  <strong className="block text-[11px] text-slate-800 dark:text-white font-extrabold truncate">{sug.title}</strong>
                  <span className="block text-[10px] text-slate-400 dark:text-slate-550 dark:text-slate-500 truncate leading-normal font-normal">{sug.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Regular Chat Bubble List */}
      {(activeConv?.messages.length > 1 || isStreaming) && (
        <div className="space-y-4">
          {activeConv?.messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isSpeaking = speakingMessageId === msg.id;
            return (
              <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in-50 duration-200`}>
                <div className="flex items-start gap-2.5 max-w-[75%]">
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/10">
                      <Brain className="w-4 h-4" />
                    </div>
                  )}
                  <div className={`p-3 rounded-2xl border transition-all space-y-2 ${
                    isUser
                      ? 'bg-blue-600 text-white border-blue-600 rounded-br-none shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800/80 rounded-bl-none text-slate-800 dark:text-slate-200 shadow-xs'
                  }`}>
                    
                    {/* Message body text */}
                    <p className="whitespace-pre-line text-[13px] font-normal leading-relaxed text-slate-800 dark:text-slate-100 rtl:leading-loose rtl:tracking-normal">{msg.text}</p>
                    
                    {/* RAG Citation reference tags */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                        {msg.citations.map((citeId) => (
                          <button
                            key={citeId}
                            onClick={() => {
                              setSelectedCitation(citeId);
                              setShowTracePanel(false);
                            }}
                            className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 font-bold font-mono text-[9px] rounded-md transition-colors cursor-pointer border border-blue-200 dark:border-blue-900/50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            📖 [{citeId === 'art-1' ? (isRtl ? '1: سياسة الاسترداد' : '1: Refund Policy') : (isRtl ? '2: توكنات الوصول' : '2: OAuth Connector')}]
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Action buttons (only for AI assistant responses) */}
                    {!isUser && msg.id !== 'm-init' && (
                      <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500 gap-4">
                        
                        {/* Copy, speaking, and feedback rating */}
                        <div className="flex gap-1.5 items-center shrink-0">
                          <button 
                            onClick={() => handleCopyText(msg.text)} 
                            className="p-1 hover:text-slate-700 dark:hover:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            title={isRtl ? 'نسخ النص' : 'Copy Text'}
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          
                          <button 
                            onClick={() => {
                              if (speakingMessageId === msg.id) {
                                setSpeakingMessageId(null);
                              } else {
                                setSpeakingMessageId(msg.id);
                                setTimeout(() => setSpeakingMessageId(null), 5000);
                              }
                            }} 
                            className={`p-1 rounded transition-colors focus:ring-1 focus:ring-blue-500 focus:outline-none ${isSpeaking ? 'text-emerald-500 bg-emerald-500/10' : 'hover:text-slate-700 dark:hover:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            title={isRtl ? 'قراءة صوتية' : 'Read Out Loud'}
                          >
                            <Volume2 className="w-3 h-3" />
                          </button>

                          <button
                            onClick={() => simulateAiResponse(activeConv.messages[activeConv.messages.length - 2]?.text || 'regenerate')}
                            className="p-1 hover:text-slate-700 dark:hover:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-805 dark:hover:bg-slate-800 rounded transition-colors focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            title={isRtl ? 'إعادة التوليد' : 'Regenerate Response'}
                          >
                            <RefreshCw className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Equalizer speaking indicator animation */}
                        {isSpeaking && (
                          <div className="flex items-center gap-0.5 px-1">
                            <span className="w-0.5 h-2.5 bg-emerald-500 animate-pulse" />
                            <span className="w-0.5 h-4 bg-emerald-500 animate-pulse delay-75" />
                            <span className="w-0.5 h-1.5 bg-emerald-500 animate-pulse delay-150" />
                          </div>
                        )}

                        {/* Rating triggers */}
                        <div className="flex gap-1 items-center shrink-0">
                          <button 
                            onClick={() => handleRateResponse(msg.id, 'up')}
                            className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:ring-1 focus:ring-blue-500 focus:outline-none ${msg.feedback === 'up' ? 'text-emerald-500' : ''}`}
                          >
                            <ThumbsUp className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={() => handleRateResponse(msg.id, 'down')}
                            className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:ring-1 focus:ring-blue-500 focus:outline-none ${msg.feedback === 'down' ? 'text-rose-500' : ''}`}
                          >
                            <ThumbsDown className="w-3 h-3" />
                          </button>
                        </div>

                      </div>
                    )}

                    <div className="flex justify-between items-center text-[7.5px] opacity-60 font-mono tracking-wide pt-0.5">
                      <span>{msg.time}</span>
                      {!isUser && msg.id !== 'm-init' && (
                        <span>Farah Llama-3 • 640ms</span>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            );
          })}

          {/* Generating stream block */}
          {isStreaming && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2.5 max-w-[75%]">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md animate-pulse">
                  <Brain className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-bl-none text-slate-800 dark:text-slate-200 shadow-xs">
                  <p className="text-xs font-semibold text-blue-500 dark:text-blue-400 font-mono leading-relaxed">
                    {streamingText}
                    {streamingText ? (
                      <span className="animate-pulse text-blue-500 font-black ml-0.5">▌</span>
                    ) : (
                      isRtl ? 'جاري جلب سياق Pinecone RAG...' : 'Querying RAG vectors...'
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div ref={chatBottomRef} />
    </div>
  );
}
