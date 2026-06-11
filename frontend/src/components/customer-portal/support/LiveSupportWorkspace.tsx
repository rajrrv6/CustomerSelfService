'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, User, Clock, ShieldCheck, Send, Star, X, 
  HelpCircle, ChevronRight, AlertCircle, PhoneCall, CheckCircle, 
  Menu, Info, Paperclip, Smile, ArrowRight, ArrowLeft, RefreshCw, 
  FileText, ShieldAlert, Award, Tag, Sparkles
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';
import { SupportMessage, SupportAgent } from './types';
import { MOCK_AGENTS, SUPPORT_ANIMATION_TRANSITIONS } from './constants';

export function LiveSupportWorkspace() {
  const { lang, addAuditLog } = useApp();
  const t = translations[lang];
  const isRtl = lang === 'ar';

  // State Management
  const [queueState, setQueueState] = useState<'idle' | 'connecting' | 'queued' | 'active' | 'feedback' | 'completed' | 'offline'>('idle');
  const [isSystemOnline, setIsSystemOnline] = useState(true);
  const [queuePos, setQueuePos] = useState(3);
  const [chatMessages, setChatMessages] = useState<SupportMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [csatRating, setCsatRating] = useState(0);
  const [npsRating, setNpsRating] = useState(0);
  const [comments, setComments] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);

  // SLA State (Countdown from 20 minutes)
  const [slaTime, setSlaTime] = useState(1200); // 20 mins in seconds
  const [slaBreached, setSlaBreached] = useState(false);

  // Mobile panels toggle states
  const [mobileLeftPanelOpen, setMobileLeftPanelOpen] = useState(false);
  const [mobileRightPanelOpen, setMobileRightPanelOpen] = useState(false);

  // File Upload State
  const [attachedFiles, setAttachedFiles] = useState<Array<{ name: string; size: string }>>([]);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAgentTyping]);

  // SLA Timer Countdown Loop
  useEffect(() => {
    if (queueState !== 'active') return;

    const timer = setInterval(() => {
      setSlaTime(prev => {
        if (prev <= 1) {
          setSlaBreached(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [queueState]);

  // Queue Position Simulator
  useEffect(() => {
    if (queueState !== 'queued') return;

    const interval = setInterval(() => {
      setQueuePos(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          connectToAgent();
          return 0;
        }
        return prev - 1;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [queueState]);

  // Helper formatting for SLA
  const formatSlaTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const startEscalation = () => {
    if (!isSystemOnline) {
      setQueueState('offline');
      return;
    }
    setQueueState('connecting');
    addAuditLog('Customer requested human support desk escalation', 'success');
    setTimeout(() => {
      setQueueState('queued');
      setQueuePos(3);
    }, 1200);
  };

  const connectToAgent = () => {
    setQueueState('active');
    setSlaTime(1200);
    setSlaBreached(false);
    setChatMessages([
      { id: 'sm-1', sender: 'system', text: isRtl ? 'تم الاتصال بالوكيل. انضمت ناديا فانس إلى المحادثة.' : 'Connected to live support. Agent Nadia Vance joined the chat.', time: '11:05', status: 'read' },
      { id: 'sm-2', sender: 'agent', text: isRtl ? 'مرحباً ديفيد! أنا ناديا من مكتب الدعم الفني. كيف يمكنني مساعدتك اليوم؟' : 'Hi David! I am Nadia Vance from the Support Desk. I see your escalation request. How can I help you today?', time: '11:05', status: 'read' }
    ]);
    addAuditLog('Live Support chat established with Nadia Vance', 'success');
  };

  const handleSendMessage = (customText?: string) => {
    const textToSend = customText || chatInput;
    if (!textToSend.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: SupportMessage = {
      id: `sm-user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: timeStr,
      status: 'sent',
      attachments: attachedFiles.map(f => ({ name: f.name, size: f.size, url: '#' }))
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setAttachedFiles([]);
    setShowEmojiPicker(false);
    setShowQuickReplies(false);

    // Update message status
    setTimeout(() => {
      setChatMessages(prev => prev.map(m => m.id === userMsg.id ? { ...m, status: 'delivered' } : m));
    }, 800);

    setTimeout(() => {
      setChatMessages(prev => prev.map(m => m.id === userMsg.id ? { ...m, status: 'read' } : m));
    }, 1500);

    // Simulated Agent Typing & Response
    setIsAgentTyping(true);
    setTimeout(() => {
      setIsAgentTyping(false);
      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      let agentReply = isRtl
        ? 'لقد قمت بفتح ملف الحالة الخاصة بك. قمت بالموافقة على استرداد الطلب ORD-99881. ستتلقى بريداً إلكترونياً بالتأكيد قريباً.'
        : 'I have pulled up your case details. I went ahead and approved the refund exception for ORD-99881. You should receive a confirmation email shortly.';

      if (textToSend.includes('/status') || textToSend.includes('حالة')) {
        agentReply = isRtl
          ? 'تظهر لوحة المراقبة لدينا أن جميع الموصلات وربط البوابات تعمل بنسبة 100% وبدون مشاكل حالياً.'
          : 'Our monitoring systems show all ERP connectors and Stripe integrations are operating at 100% efficiency.';
      } else if (textToSend.includes('/help') || textToSend.includes('مساعدة')) {
        agentReply = isRtl
          ? 'بالتأكيد. يمكنني مساعدتك في معالجة المدفوعات، استرداد الأموال، مشكلات حسابات المطورين، وتذاكر الدعم الفني.'
          : 'Sure! I can assist you with processing refund claims, auth lockouts, or developer endpoint queries.';
      }

      setChatMessages(prev => [...prev, {
        id: `sm-agent-${Date.now()}`,
        sender: 'agent',
        text: agentReply,
        time: replyTime,
        status: 'read'
      }]);
    }, 2200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setAttachedFiles(prev => [...prev, { name: file.name, size: `${(file.size / 1024).toFixed(1)} KB` }]);
    addAuditLog(`Uploaded attachment ${file.name} to live support session`, 'success');
  };

  const triggerQuickReply = (val: string) => {
    handleSendMessage(val);
  };

  const submitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    setQueueState('completed');
    addAuditLog(`Live Support CSAT Feedback logged. rating: ${csatRating}/5`, 'success');
  };

  const handleQuickAction = (actionText: string) => {
    setChatInput(actionText);
    textareaRefFocus();
  };

  const textareaRefFocus = () => {
    const el = document.getElementById('support-chat-input');
    el?.focus();
  };

  const emojis = ['😊', '👍', '❓', '💻', '💡', '⚠️', '💼', '🚀'];

  return (
    <div 
      className="bg-slate-50 dark:bg-[#030712] border border-slate-200 dark:border-slate-800 rounded-3xl h-[650px] flex overflow-hidden text-slate-800 dark:text-slate-200 shadow-xl relative" 
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      
      {/* Mobile Left Drawer Backdrop */}
      {mobileLeftPanelOpen && (
        <div 
          onClick={() => setMobileLeftPanelOpen(false)}
          className="md:hidden absolute inset-0 bg-slate-900/50 backdrop-blur-xs z-25 animate-in fade-in duration-200 cursor-pointer"
        />
      )}

      {/* Mobile Right Drawer Backdrop */}
      {mobileRightPanelOpen && (
        <div 
          onClick={() => setMobileRightPanelOpen(false)}
          className="md:hidden absolute inset-0 bg-slate-900/50 backdrop-blur-xs z-25 animate-in fade-in duration-200 cursor-pointer"
        />
      )}

      {/* 1. LEFT PANEL: Queue + Recent Sessions */}
      <div className={`transition-all duration-300 ease-in-out bg-white dark:bg-[#0b0f19] flex flex-col justify-between shrink-0 z-30 absolute md:relative h-full ${
        mobileLeftPanelOpen 
          ? 'translate-x-0 w-64 opacity-100' 
          : `${isRtl ? 'translate-x-full' : '-translate-x-full'} md:translate-x-0 md:w-64 opacity-100 overflow-hidden`
      } ${
        isRtl 
          ? 'right-0 border-l border-slate-200 dark:border-slate-800' 
          : 'left-0 border-r border-slate-200 dark:border-slate-800'
      }`}>
        <div className="p-4 flex-1 flex flex-col min-h-0 space-y-4">
          
          <div className="flex justify-between items-center">
            <h5 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider font-mono">
              {isRtl ? 'حالة طابور الدعم' : 'Support Queue Status'}
            </h5>
            <button
              onClick={() => setMobileLeftPanelOpen(false)}
              className="md:hidden p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Active Support Queue Card */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl space-y-3 shadow-xs">
            <div className="flex justify-between items-center">
              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 font-mono text-[9px] font-bold">
                {isRtl ? 'أولوية قصوى' : 'PRIORITY HIGH'}
              </span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div>
                <span className="text-[8px] text-slate-400 font-semibold block">{isRtl ? 'الترتيب في الصف' : 'Queue Pos'}</span>
                <strong className="text-lg font-black text-slate-800 dark:text-white font-mono block mt-0.5">
                  {queueState === 'queued' ? queuePos : '-'}
                </strong>
              </div>
              <div>
                <span className="text-[8px] text-slate-400 font-semibold block">{isRtl ? 'وقت الانتظار' : 'Est. Wait'}</span>
                <strong className="text-lg font-black text-slate-800 dark:text-white font-mono block mt-0.5">
                  {queueState === 'queued' ? `${queuePos * 1.5}m` : '-'}
                </strong>
              </div>
            </div>
          </div>

          {/* Availability state switch for testing */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex justify-between items-center text-xs">
            <span className="text-slate-400 font-semibold">{isRtl ? 'حالة البوابة الفنية' : 'Gateway Status'}</span>
            <button
              onClick={() => {
                setIsSystemOnline(!isSystemOnline);
                if (isSystemOnline) {
                  setQueueState('offline');
                } else {
                  setQueueState('idle');
                }
              }}
              className={`px-2 py-1 rounded-lg font-bold text-[9px] font-mono transition-colors ${
                isSystemOnline ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
              }`}
            >
              {isSystemOnline ? (isRtl ? 'متاحة' : 'ONLINE') : (isRtl ? 'مغلقة' : 'OFFLINE')}
            </button>
          </div>

          {/* Active Conversations list */}
          <div className="flex-1 overflow-y-auto space-y-2">
            <span className="text-[8.5px] uppercase font-bold text-slate-400 font-mono tracking-wider block mb-1">
              💬 {isRtl ? 'جلسات المحادثة الأخيرة' : 'Recent Support Sessions'}
            </span>

            {/* Mock Session 1 */}
            <div className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
              queueState === 'active' 
                ? 'bg-blue-500/5 border-blue-500/15 text-blue-600 dark:bg-blue-950/20' 
                : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/30 text-slate-600 dark:text-slate-400'
            }`}>
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="truncate max-w-[100px]">{isRtl ? 'محادثة ناديا فانس' : 'Session with Nadia'}</span>
                <span className="text-[8px] opacity-65 font-mono">11:05</span>
              </div>
              <p className="text-[9px] truncate opacity-80 mt-1">
                {queueState === 'active' ? (isRtl ? 'نشطة حالياً...' : 'Chat is active...') : (isRtl ? 'تم إنهاء المحادثة' : 'Session closed')}
              </p>
            </div>

            {/* Mock Session 2 */}
            <div className="p-2.5 rounded-xl border border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/30 text-left text-slate-500">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="truncate max-w-[100px]">{isRtl ? 'محادثة ليام بينيت' : 'Session with Liam'}</span>
                <span className="text-[8px] opacity-65 font-mono">Yesterday</span>
              </div>
              <p className="text-[9px] truncate opacity-80 mt-1">
                {isRtl ? 'تم حل مشكلة الـ API بنجاح' : 'OAuth scopes verified.'}
              </p>
            </div>
          </div>
        </div>

        {/* Left footer agent status indicator */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20 text-[10px] space-y-1.5 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-semibold">{isRtl ? 'موظفي الدعم المتاحين' : 'Agents Availability'}</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold font-mono text-[8px]">
              {isRtl ? 'ناديا وليام متاحين' : 'NADIA & LIAM ONLINE'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. CENTER PANEL: Support Chat Engine */}
      <div className="flex-1 flex flex-col justify-between bg-slate-50/50 dark:bg-[#030712] min-w-0">
        
        {/* Workspace Header */}
        <div className="bg-white dark:bg-slate-900 px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileLeftPanelOpen(!mobileLeftPanelOpen)}
              className="md:hidden p-2 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer text-slate-500"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="font-extrabold text-xs truncate max-w-[200px]">
                {queueState === 'active' ? (isRtl ? 'اتصال مباشر مع ناديا فانس' : 'Live Session: Nadia Vance') : (isRtl ? 'الاتصال بموظف الدعم' : 'Support Desk Gateway')}
              </h4>
              <span className="text-[9px] text-slate-400 font-semibold block mt-0.5 font-mono">
                {queueState === 'active' ? 'CHANNEL: EN-WEB-LIVE' : 'STATUS: DISCONNECTED'}
              </span>
            </div>
          </div>

          <div className="flex gap-1.5 items-center">
            {queueState === 'active' && (
              <button
                onClick={() => setQueueState('feedback')}
                className="px-2.5 py-1.5 border border-rose-500 text-rose-500 hover:bg-rose-500/5 font-extrabold rounded-xl text-[9px] cursor-pointer transition-all active:scale-95"
              >
                {isRtl ? 'إنهاء الجلسة' : 'End Session'}
              </button>
            )}
            
            <button
              onClick={() => setMobileRightPanelOpen(!mobileRightPanelOpen)}
              className="md:hidden p-2 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer text-slate-500"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Screen Routing */}
        <div className="flex-1 min-h-0 flex flex-col justify-between">
          
          {/* IDLE state */}
          {queueState === 'idle' && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 max-w-sm mx-auto animate-in fade-in duration-300">
              <div className="w-14 h-14 bg-gradient-to-tr from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 text-white">
                <MessageSquare className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-black tracking-tight">{isRtl ? 'بوابة المحادثة البشرية المباشرة' : 'Omnichannel Human Handoff'}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  {isRtl 
                    ? 'هل تواجه مشكلة لم يتمكن مساعد الذكاء الاصطناعي من حلها؟ اتصل بممثلي الدعم البشري لمراجعة سجلاتك وتأكيد المعاملات.' 
                    : 'Connect directly with representative Nadia Vance for diagnostic review or specialized invoice credit exceptions.'}
                </p>
              </div>
              <button
                onClick={startEscalation}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-all active:scale-95"
              >
                {isRtl ? 'طلب محادثة مع موظف دعم' : 'Request Human Support Handoff'}
              </button>
            </div>
          )}

          {/* Connecting portal state */}
          {queueState === 'connecting' && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <Clock className="w-8 h-8 text-blue-500 animate-spin" />
              <h5 className="font-bold text-xs">{isRtl ? 'جاري تهيئة البوابة الفنية...' : 'Acquiring active chat slot...'}</h5>
            </div>
          )}

          {/* Queued Waiting state */}
          {queueState === 'queued' && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-5 max-w-sm mx-auto animate-in fade-in duration-300">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto animate-pulse">
                <Clock className="w-6 h-6" />
              </div>
              
              <div className="space-y-1.5 w-full">
                <h4 className="font-extrabold text-sm">{isRtl ? 'طلبك قيد الانتظار' : 'Handoff in Queue'}</h4>
                <p className="text-[11px] text-slate-400 font-medium">
                  {isRtl ? 'جميع وكلائنا منشغلون بالرد على عملاء آخرين حالياً.' : 'Agents are currently processing telemetry logs for prior exceptions.'}
                </p>
                <div className="p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full grid grid-cols-2 gap-2 text-center text-xs mt-2">
                  <div>
                    <span className="text-[8px] text-slate-400 font-bold uppercase font-mono">{isRtl ? 'الموقع في الصف' : 'Position'}</span>
                    <strong className="text-lg font-black text-slate-800 dark:text-white font-mono block mt-0.5">{queuePos}</strong>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-400 font-bold uppercase font-mono">{isRtl ? 'الانتظار المقدر' : 'Wait Time'}</span>
                    <strong className="text-lg font-black text-slate-800 dark:text-white font-mono block mt-0.5">{queuePos * 1.5}m</strong>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-450 dark:text-slate-400 leading-normal font-medium bg-blue-500/5 p-3 rounded-xl border border-blue-500/10">
                {isRtl 
                  ? '📌 يمكنك حجز موعد اتصال صوتي بدلاً من الانتظار، وسنتصل بك في غضون ساعة.' 
                  : '📌 Rather not wait? You can close this view and submit a support case ticket instead.'}
              </div>

              <button
                onClick={() => setQueueState('idle')}
                className="w-full py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer bg-white dark:bg-slate-900"
              >
                {isRtl ? 'إلغاء الطلب' : 'Cancel Queue Request'}
              </button>
            </div>
          )}

          {/* System offline state */}
          {queueState === 'offline' && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 max-w-sm mx-auto animate-in zoom-in-95 duration-200">
              <AlertCircle className="w-12 h-12 text-rose-500 animate-bounce" />
              <div className="space-y-1.5">
                <h4 className="font-extrabold text-sm">{isRtl ? 'مكتب الدعم المباشر مغلق حالياً' : 'Live Support Desk Offline'}</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                  {isRtl 
                    ? 'أنت خارج أوقات العمل الرسمية لمكتب الدعم البشري. يمكنك رفع تذكرة دعم وسيقوم موظفونا بالرد عليك باليوم التالي.' 
                    : 'Human agents are currently offline. Please utilize our submit ticket portal for billing or configuration queries.'}
                </p>
              </div>
              <button
                onClick={() => setQueueState('idle')}
                className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs cursor-pointer"
              >
                {isRtl ? 'العودة لبوابة الانتظار' : 'Back to Gateway'}
              </button>
            </div>
          )}

          {/* Active Chat Conversation Panel */}
          {queueState === 'active' && (
            <div className="flex-1 min-h-0 flex flex-col justify-between">
              
              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {chatMessages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  const isSystem = msg.sender === 'system';
                  return (
                    <div key={msg.id} className={`flex ${isUser ? 'justify-end' : isSystem ? 'justify-center' : 'justify-start'}`}>
                      <div className={`p-3 rounded-2xl max-w-[80%] border ${
                        isUser 
                          ? 'bg-blue-600 border-blue-600 text-white rounded-br-none shadow-sm' 
                          : isSystem 
                          ? 'bg-purple-900/10 border-purple-500/10 text-purple-600 dark:text-purple-300 font-mono text-[9px] px-4 py-1.5 rounded-lg' 
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-bl-none text-slate-800 dark:text-slate-200 shadow-xs'
                      }`}>
                        <p className="text-xs font-normal leading-relaxed whitespace-pre-line">{msg.text}</p>
                        
                        {/* Attachments preview */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-2 space-y-1 pt-1.5 border-t border-slate-100/10">
                            {msg.attachments.map((file, fIdx) => (
                              <div key={fIdx} className="flex items-center gap-1.5 text-[9px] opacity-90">
                                <FileText className="w-3.5 h-3.5" />
                                <span className="truncate max-w-[120px]">{file.name}</span>
                                <span>({file.size})</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Metadata block */}
                        {!isSystem && (
                          <div className="flex justify-between items-center text-[7.5px] opacity-65 font-mono mt-1.5 gap-2.5">
                            <span>{msg.time}</span>
                            {isUser && (
                              <span>
                                {msg.status === 'read' ? '✓✓ Read' : msg.status === 'delivered' ? '✓✓ Delivered' : '✓ Sent'}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {isAgentTyping && (
                  <div className="flex justify-start">
                    <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-bl-none text-[10px] text-slate-400 flex items-center gap-1.5 animate-pulse">
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      <span>Nadia Vance is typing...</span>
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Attachments pending upload banner */}
              {attachedFiles.length > 0 && (
                <div className="px-5 py-2.5 bg-slate-100/80 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-2 items-center">
                  <span className="text-[8px] uppercase font-bold text-slate-400 font-mono tracking-wider">{isRtl ? 'ملفات جاهزة للإرسال:' : 'Files to attach:'}</span>
                  {attachedFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[9px] font-semibold">
                      <Paperclip className="w-3 h-3 text-slate-400" />
                      <span className="truncate max-w-[120px]">{f.name}</span>
                      <button onClick={() => setAttachedFiles(prev => prev.filter(file => file.name !== f.name))} className="text-slate-400 hover:text-rose-500 cursor-pointer">×</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Composer */}
              <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
                <div className="flex gap-2.5 items-end">
                  
                  {/* Attachment Button */}
                  <div className="flex gap-1 pb-1">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer text-slate-500 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      title={isRtl ? 'إرفاق ملف' : 'Attach file'}
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <input 
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                    />

                    {/* Quick Replies trigger */}
                    <button
                      onClick={() => setShowQuickReplies(!showQuickReplies)}
                      className={`p-2.5 border rounded-xl cursor-pointer transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                        showQuickReplies ? 'border-blue-500 bg-blue-500/5 text-blue-500' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500'
                      }`}
                      title={isRtl ? 'ردود سريعة' : 'Quick replies'}
                    >
                      <Smile className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Input field */}
                  <div className="flex-1 relative min-w-0">
                    <input
                      id="support-chat-input"
                      type="text"
                      placeholder={isRtl ? 'اكتب ردك للوكيل...' : 'Type a reply back to Nadia...'}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="w-full pl-3 pr-12 py-3 border border-slate-200 dark:border-slate-800 bg-transparent rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 text-xs font-semibold text-slate-850 dark:text-white"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendMessage();
                      }}
                    />

                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={`absolute right-3.5 bottom-3.5 p-0.5 rounded transition-colors text-slate-400 hover:text-slate-600 ${
                        showEmojiPicker ? 'text-blue-500' : ''
                      }`}
                    >
                      <Smile className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleSendMessage()}
                    className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl cursor-pointer transition-all active:scale-95 shadow-md shadow-blue-500/10 shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

                {/* Emoji panel */}
                {showEmojiPicker && (
                  <div className="mt-2.5 p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex gap-3 justify-center animate-in slide-in-from-bottom-2 duration-150">
                    {emojis.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setChatInput(prev => prev + emoji)}
                        className="text-lg hover:scale-125 transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                {/* Quick replies suggestion list */}
                {showQuickReplies && (
                  <div className="mt-2.5 p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5 animate-in slide-in-from-bottom-2 duration-150 text-xs">
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-1">
                      {isRtl ? 'الردود السريعة المتوفرة' : 'Quick reply templates'}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: isRtl ? 'التحقق من حالة الموصل' : '/status', text: '/status check gateway latency' },
                        { label: isRtl ? 'طلب مساعدة' : '/help', text: '/help options' },
                        { label: isRtl ? 'شكر وكيل الدعم' : 'Thank you', text: 'Thank you Nadia, that resolved my issue!' }
                      ].map((qr, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => triggerQuickReply(qr.text)}
                          className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-blue-500 transition-colors font-semibold"
                        >
                          {qr.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Feedback Rating view */}
          {queueState === 'feedback' && (
            <form onSubmit={submitFeedback} className="flex-1 overflow-y-auto p-6 space-y-4 max-w-md mx-auto w-full animate-in fade-in duration-300">
              <h4 className="font-extrabold text-sm text-center">{isRtl ? 'كيف كانت تجربة الدعم المباشر؟' : 'Rate Your Live Support Interaction'}</h4>
              
              <div className="space-y-1.5 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-2xl text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">{isRtl ? '1. رضا العملاء (CSAT)' : '1. Customer Satisfaction (CSAT)'}</span>
                <div className="flex justify-center gap-2 pt-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setCsatRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star className={`w-6 h-6 ${csatRating >= star ? 'text-amber-500 fill-amber-500' : 'text-slate-300 dark:text-slate-700'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">{isRtl ? '2. مؤشر الترويج (NPS)' : '2. Net Promoter Score (NPS)'}</span>
                <div className="flex justify-between gap-1 pt-1.5">
                  {Array.from({ length: 11 }).map((_, n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setNpsRating(n)}
                      className={`w-7 h-7 rounded-lg text-[10px] font-bold font-mono border transition-all cursor-pointer ${
                        npsRating === n 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                          : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-105 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-[8px] text-slate-450 font-bold px-1 pt-1 font-mono uppercase">
                  <span>{isRtl ? 'غير محتمل' : 'Not Likely'}</span>
                  <span>{isRtl ? 'محتمل جداً' : 'Extremely Likely'}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">{isRtl ? '3. ملاحظات إضافية' : '3. Additional Comments'}</label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder={isRtl ? 'اكتب انطباعك هنا...' : 'Outline any feedback on the resolution...'}
                  className="w-full p-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none text-xs h-16 text-slate-850 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={csatRating === 0}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-md shadow-blue-500/10"
              >
                {isRtl ? 'إرسال التقييم' : 'Submit Feedback'}
              </button>
            </form>
          )}

          {/* Feedback Success completed state */}
          {queueState === 'completed' && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 max-w-sm mx-auto animate-in zoom-in-95 duration-200">
              <CheckCircle className="w-12 h-12 text-emerald-500 animate-bounce" />
              <div className="space-y-1.5">
                <h4 className="font-extrabold text-sm">{isRtl ? 'شكراً لتقييمك!' : 'Thank You!'}</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium leading-relaxed">
                  {isRtl ? 'تم تسجيل تقييمك بنجاح. يساعدنا في تحسين جودة قنوات الدعم.' : 'Your chat feedback has been logged in our CSAT/NPS analytics logs.'}
                </p>
              </div>
              <button
                onClick={() => {
                  setQueueState('idle');
                  setChatMessages([]);
                  setCsatRating(0);
                  setNpsRating(0);
                  setComments('');
                }}
                className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs cursor-pointer"
              >
                {isRtl ? 'بدء اتصال جديد' : 'Start New Connection'}
              </button>
            </div>
          )}

        </div>
      </div>

      {/* 3. RIGHT PANEL: Support Details */}
      <div className={`transition-all duration-300 ease-in-out bg-white dark:bg-[#0b0f19] flex flex-col justify-between shrink-0 z-30 absolute md:relative h-full ${
        mobileRightPanelOpen 
          ? 'translate-x-0 w-64 opacity-100' 
          : `${isRtl ? '-translate-x-full' : 'translate-x-full'} md:translate-x-0 md:w-64 opacity-100 overflow-hidden`
      } ${
        isRtl 
          ? 'left-0 border-r border-slate-200 dark:border-slate-800' 
          : 'right-0 border-l border-slate-200 dark:border-slate-800'
      }`}>
        <div className="p-4 flex-1 flex flex-col min-h-0 space-y-4">
          
          <div className="flex justify-between items-center">
            <h5 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider font-mono">
              {isRtl ? 'تفاصيل الجلسة' : 'Support Metadata'}
            </h5>
            <button
              onClick={() => setMobileRightPanelOpen(false)}
              className="md:hidden p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-505"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Assigned Agent Profile Card */}
          {queueState === 'active' ? (
            <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-lg flex items-center justify-center shrink-0">
                  {MOCK_AGENTS.nadia.avatar}
                </div>
                <div className="min-w-0">
                  <h6 className="font-bold text-xs truncate">{MOCK_AGENTS.nadia.name}</h6>
                  <span className="text-[8.5px] text-slate-400 font-semibold block truncate">{MOCK_AGENTS.nadia.role}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] text-emerald-500 font-bold font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>ONLINE & ACTIVE</span>
              </div>
            </div>
          ) : (
            <div className="p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center text-slate-400 text-xs font-semibold">
              {isRtl ? 'لم يتم تعيين وكيل بعد' : 'No Agent Assigned Yet'}
            </div>
          )}

          {/* SLA Countdown bar */}
          {queueState === 'active' && (
            <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-2xl space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold font-mono">
                <span className="text-slate-400">{isRtl ? 'اتفاقية مستوى الخدمة:' : 'SLA Target:'}</span>
                <span className={slaBreached ? 'text-rose-500' : slaTime < 300 ? 'text-amber-500 animate-pulse' : 'text-emerald-500'}>
                  {formatSlaTime(slaTime)}
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    slaBreached ? 'bg-rose-500' : slaTime < 300 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${(slaTime / 1200) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Suggested KB Articles */}
          <div className="space-y-2 flex-1 overflow-y-auto">
            <span className="text-[8px] uppercase font-bold text-slate-400 font-mono tracking-wider block">
              💡 {isRtl ? 'مقالات مساعدة مقترحة' : 'Suggested RAG Context'}
            </span>
            <div className="space-y-2">
              {[
                { title: isRtl ? 'كيفية طلب استرداد SaaS' : 'SaaS Subscription Refund Policy', id: 'art-1' },
                { title: isRtl ? 'صلاحيات مفاتيح الـ API موصل' : 'OAuth API Gate Permissions', id: 'art-2' }
              ].map(art => (
                <div key={art.id} className="p-2.5 bg-slate-50/50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-900 rounded-xl space-y-1">
                  <strong className="block text-[10px] text-slate-800 dark:text-white truncate font-bold">{art.title}</strong>
                  <span className="text-[8px] text-blue-500 font-mono font-bold block">{isRtl ? 'مستند RAG فوري' : 'Pinecone ks-1 RAG'}</span>
                </div>
              ))}
            </div>

            {/* Conversation tags */}
            {queueState === 'active' && (
              <div className="pt-2">
                <span className="text-[8px] uppercase font-bold text-slate-400 font-mono tracking-wider block mb-1">
                  🏷️ {isRtl ? 'أوسمة الجلسة' : 'Session Tags'}
                </span>
                <div className="flex flex-wrap gap-1">
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-900 text-[9px] font-mono rounded font-semibold">Stripe</span>
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-900 text-[9px] font-mono rounded font-semibold">Refund</span>
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-900 text-[9px] font-mono rounded font-semibold">ERP-Dubai</span>
                </div>
              </div>
            )}

            {/* Suggested AI Actions */}
            {queueState === 'active' && (
              <div className="pt-2">
                <span className="text-[8px] uppercase font-bold text-slate-400 font-mono tracking-wider block mb-1 flex items-center gap-1 text-purple-500">
                  <Sparkles className="w-3 h-3 animate-spin" />
                  <span>{isRtl ? 'إجراءات ذكاء مقترحة' : 'Suggested AI Prompts'}</span>
                </span>
                <div className="space-y-1.5">
                  <button 
                    onClick={() => handleQuickAction(isRtl ? 'ما هي الخطوة التالية لاسترداد أموالي؟' : 'What is the status of my refund ORD-99881?')}
                    className="w-full text-left p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-purple-500 hover:bg-purple-500/5 text-[9px] leading-tight font-semibold"
                  >
                    🔍 {isRtl ? 'الاستعلام عن حالة طلب الاسترداد' : 'Ask about ORD-99881 status'}
                  </button>
                  <button
                    onClick={() => handleQuickAction(isRtl ? 'أحصل على خطأ 403 عند استخدام الموصلات' : 'How do I resolve API 403 authorization locks?')}
                    className="w-full text-left p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-purple-500 hover:bg-purple-500/5 text-[9px] leading-tight font-semibold"
                  >
                    🔌 {isRtl ? 'الاستعلام عن أخطاء API 403' : 'Ask about API auth scope locks'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
export default LiveSupportWorkspace;
