'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Search, PhoneCall, MessageSquare, Loader2, AlertTriangle, ShieldCheck, ArrowRightLeft, User } from 'lucide-react';
import { Collaborator } from './CollaboratorSelector';
import { useFeedbackToasts } from '@/components/customer-portal/feedback/PostChatToasts';
import { DrawerWrapper } from '../shared/DrawerWrapper';

interface ConsultDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'ar';
  onTransferSuccess: (agentName: string, queueId: string) => void;
}

const CONSULT_AGENTS: Collaborator[] = [
  { id: 'agent-4', name: 'Nadia Vance', role: 'supervisor', status: 'online' },
  { id: 'agent-2', name: 'Sarah Jenkins', role: 'agent', status: 'busy' },
  { id: 'agent-3', name: 'Tariq Mansoor', role: 'agent', status: 'away' },
  { id: 'agent-5', name: 'Ahmed Tariq', role: 'agent', status: 'offline' },
];

interface ChatMsg {
  sender: 'self' | 'peer';
  text: string;
  time: string;
}

export function ConsultDrawer({ isOpen, onClose, lang, onTransferSuccess }: ConsultDrawerProps) {
  const isRtl = lang === 'ar';
  const { pushToast } = useFeedbackToasts();

  // Search filter state
  const [searchQuery, setSearchQuery] = useState('');

  // Workflow states
  const [selectedAgent, setSelectedAgent] = useState<Collaborator | null>(null);
  const [workflowState, setWorkflowState] = useState<'directory' | 'calling' | 'chat' | 'transferring' | 'done'>('directory');
  const [dialLogs, setDialLogs] = useState<string[]>([]);
  
  // Private consult chat messages state
  const [consultChat, setConsultChat] = useState<ChatMsg[]>([]);
  const [draftMessage, setDraftMessage] = useState('');
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (chatEndRef.current && typeof chatEndRef.current.scrollIntoView === 'function') {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consultChat, dialLogs]);

  if (!isOpen) return null;

  const filtered = CONSULT_AGENTS.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startConsultation = (agent: Collaborator) => {
    if (agent.status === 'offline') {
      pushToast(
        'error',
        isRtl ? 'الوكيل غير متصل' : 'Agent Offline',
        isRtl ? 'لا يمكن الاستشارة مع وكيل غير متصل بالشبكة.' : 'Cannot consult with an offline agent.'
      );
      return;
    }

    setSelectedAgent(agent);
    setWorkflowState('calling');
    setDialLogs([]);

    // Dialing sequence simulation
    const logs = [
      isRtl ? `طلب اتصال استشاري مع ${agent.name}...` : `Dialing consult bridge with ${agent.name}...`,
      isRtl ? 'إرسال طلب SIP INVITE إلى خادم الاتصالات...' : 'Sending SIP INVITE headers to PBX...',
      isRtl ? 'في انتظار استجابة الوكيل...' : 'Awaiting agent handshake response...',
    ];

    logs.forEach((log, index) => {
      setTimeout(() => {
        setDialLogs((prev) => [...prev, log]);
      }, 500 * (index + 1));
    });

    setTimeout(() => {
      // Simulate answer and enter consultation chat room
      setWorkflowState('chat');
      setConsultChat([
        {
          sender: 'peer',
          text: isRtl
            ? `أهلاً ليام. رأيت ملاحظتك بخصوص الحالة. كيف يمكنني المساعدة؟`
            : `Hi Liam. I see the CRM context notes. How can I help you resolve this exception?`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 2000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftMessage.trim() || !selectedAgent) return;

    const newMsg: ChatMsg = {
      sender: 'self',
      text: draftMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setConsultChat((prev) => [...prev, newMsg]);
    const sentText = draftMessage.toLowerCase();
    setDraftMessage('');

    // Simulated response from peer
    setTimeout(() => {
      let replyText = isRtl
        ? 'حسناً، يمكننا تحويل الحالة إليّ وسأقوم باعتماد الدفع فوراً.'
        : 'Understood. Initiate the warm transfer and I will override the database billing lock.';
      
      if (sentText.includes('refund') || sentText.includes('pay')) {
        replyText = isRtl
          ? 'تأكدت من المعاملات. قم بالتحويل وسأفعل حساب الاستثناء الخاص بـ SAP.'
          : 'Verified wire audit logs. Warm transfer the ticket and I will bypass SAP guardrails.';
      } else if (sentText.includes('escalate') || sentText.includes('p1')) {
        replyText = isRtl
          ? 'موافق، هذا تصعيد من الفئة الأولى. سأستلم البطاقة فوراً.'
          : 'Agreed, this qualifies as a P1 escalation. Transfer now to route to priority queue.';
      }

      setConsultChat((prev) => [
        ...prev,
        {
          sender: 'peer',
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1000);
  };

  const handleConfirmWarmTransfer = () => {
    if (!selectedAgent) return;
    setWorkflowState('transferring');

    setTimeout(() => {
      setWorkflowState('done');
      setTimeout(() => {
        onTransferSuccess(selectedAgent.name, 'q-vip');
        setWorkflowState('directory');
        setSelectedAgent(null);
        onClose();
      }, 1500);
    }, 1500);
  };

  const handleCancel = () => {
    setWorkflowState('directory');
    setSelectedAgent(null);
  };

  return (
    <DrawerWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
          <ArrowRightLeft className="w-4 h-4 text-blue-600" />
          <h2 id="consult-drawer-title" className="text-sm font-extrabold text-slate-905 dark:text-white">
            {lang === 'ar' ? 'الاستشارة والتحويل الثنائي' : 'Consult & Warm Transfer'}
          </h2>
        </div>
      }
      isRtl={isRtl}
      maxWidthClass="max-w-md"
      noPadding={true}
    >
      <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-805 dark:text-slate-205" dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Directory View */}
        {workflowState === 'directory' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Search Input */}
            <div className="p-4 border-b border-slate-200/50 dark:border-slate-850 bg-white dark:bg-slate-955/20">
              <div className="relative">
                <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? 'right-3' : 'left-3'}`} />
                <input
                  type="text"
                  placeholder={isRtl ? 'البحث عن وكيل أو مشرف...' : 'Search agent directory...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full py-2 bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white placeholder-slate-400 ${
                    isRtl ? 'pl-3 pr-9' : 'pl-9 pr-3'
                  }`}
                />
              </div>
            </div>

            {/* Directory List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {filtered.map((agent) => {
                const statusColors = {
                  online: 'bg-emerald-500',
                  busy: 'bg-rose-500',
                  away: 'bg-amber-500',
                  offline: 'bg-slate-400',
                };

                return (
                  <div
                    key={agent.id}
                    className={`p-3 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-2xl flex items-center justify-between gap-3 shadow-xs hover:border-blue-500/30 transition-all ${
                      agent.status === 'offline' ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0 select-none">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                          <User className="w-4.5 h-4.5 text-slate-400" />
                        </div>
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-950 ${
                            statusColors[agent.status]
                          }`}
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-xs truncate">
                          {agent.name}
                        </h4>
                        <span className="text-[9px] text-slate-400 uppercase font-mono font-bold block mt-0.5">
                          {agent.role === 'supervisor' ? (isRtl ? 'مشرف' : 'Supervisor') : (isRtl ? 'وكيل' : 'Support Agent')}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => startConsultation(agent)}
                      disabled={agent.status === 'offline'}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-750 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-sm shadow-blue-500/10 cursor-pointer"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'بدء استشارة' : 'Consult'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Dialing Dial Logs View */}
        {workflowState === 'calling' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <span className="font-extrabold text-slate-900 dark:text-white text-sm">
              {isRtl ? 'جاري الاتصال الاستشاري...' : 'Connecting Consultation Line...'}
            </span>

            <div className="w-full bg-slate-950 text-slate-350 font-mono text-[9px] p-3.5 border border-slate-850 rounded-2xl h-40 overflow-y-auto space-y-1.5 leading-normal">
              {dialLogs.map((log, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-slate-600 font-bold">SIP:</span>
                  <span className="break-all">{log}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Consultation Chat Workspace */}
        {workflowState === 'chat' && selectedAgent && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Consultation Banner Header */}
            <div className={`px-4 py-3 bg-blue-600/5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-slate-905 dark:text-slate-200 font-bold">
                  {isRtl ? `خط استشاري نشط مع ${selectedAgent.name}` : `Consultation session with ${selectedAgent.name}`}
                </span>
              </div>
              <span className="rounded bg-blue-105 border border-blue-200/50 text-blue-600 text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-wider font-mono">
                SECURE
              </span>
            </div>

            {/* Chat message viewport */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              {consultChat.map((msg, idx) => {
                const isSelf = msg.sender === 'self';
                return (
                  <div
                    key={idx}
                    className={`flex ${isSelf ? 'justify-end' : 'justify-start'} animate-in fade-in-50 duration-200`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-3 py-2 border shadow-xs relative text-xs ${
                        isSelf
                          ? 'bg-blue-600 text-white border-blue-500 rounded-br-none'
                          : 'bg-white dark:bg-slate-955 text-slate-800 dark:text-slate-250 border-slate-200 dark:border-slate-850 rounded-bl-none'
                      }`}
                    >
                      <p className="font-semibold leading-normal">{msg.text}</p>
                      <span className="text-[8px] opacity-60 font-mono block mt-1 text-end">
                        {msg.time}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Action Decision buttons */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-955/40">
              {/* Transfer Gate Trigger */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl font-bold cursor-pointer"
                >
                  {isRtl ? 'إلغاء الاستشارة' : 'Cancel Session'}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmWarmTransfer}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-md cursor-pointer"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>{isRtl ? 'تحويل دافئ الآن' : 'Warm Transfer'}</span>
                </button>
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  placeholder={isRtl ? 'اسأل الوكيل الاستشاري...' : 'Consult with supervisor...'}
                  value={draftMessage}
                  onChange={(e) => setDraftMessage(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-xs"
                />
                <button
                  type="submit"
                  disabled={!draftMessage.trim()}
                  className="px-3.5 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Transferring progress loader */}
        {workflowState === 'transferring' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
            <span className="font-extrabold text-slate-900 dark:text-white text-sm">
              {isRtl ? 'جاري تحويل مسار التذكرة والبيانات...' : 'Reassigning queue ticket routing...'}
            </span>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full animate-[loading_1.5s_ease-in-out_infinite]" style={{ width: '60%' }} />
            </div>
          </div>
        )}

        {/* Done / Success State screen */}
        {workflowState === 'done' && selectedAgent && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
            <ShieldCheck className="w-12 h-12 text-emerald-500 animate-bounce" />
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm text-center">
              {isRtl ? 'تم التحويل الدافئ بنجاح!' : 'Warm Transfer Success!'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-[10.5px] text-center max-w-xs">
              {isRtl
                ? `تم نقل ملكية التذكرة وجميع سجلات التدقيق إلى ${selectedAgent.name}.`
                : `Ownership of ticket routing and audit log history transferred to ${selectedAgent.name}.`}
            </p>
          </div>
        )}
      </div>
    </DrawerWrapper>
  );
}
