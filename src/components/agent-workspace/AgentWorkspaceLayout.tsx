import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { useUIStore } from '@/stores/uiStore';
import { useNotificationsStore } from '@/stores/notificationsStore';
import { translations } from '@/i18n/translations';
import { useAuthStore } from '@/stores/authStore';
import { UnifiedInbox } from './UnifiedInbox';
import { ConversationPanel } from './ConversationPanel';
import { RightWorkspacePanel } from './RightWorkspacePanel';
import { SupervisorPanel } from './SupervisorPanel';
import { ShiftSchedule } from './ShiftSchedule';
import { PerformanceScorecard } from './PerformanceScorecard';
import { TransferModal } from './TransferModal';
import { ConferenceModal } from './ConferenceModal';
import { WrapupModal } from './WrapupModal';
import { AICopilotPanel } from './AICopilotPanel';
import { AIReplyComposer } from './AIReplyComposer';

// Composed hooks
import { useVoiceState, type PendingCallIntent, type ActiveCall } from '@/hooks/useVoiceState';
import { useQueueMetrics } from '@/hooks/useQueueMetrics';
import { useInboxFilters } from '@/hooks/useInboxFilters';
import { useRenderProfiler } from '@/hooks/useRenderProfiler';
import { WorkspaceAuxToolbar } from './WorkspaceAuxToolbar';

// Telephony Components
import { VoiceDialer } from '../voice/VoiceDialer';
import { IncomingCallModal } from '../voice/IncomingCallModal';
import { CallDispositionModal } from '../voice/CallDispositionModal';
import { ActiveCallPanel } from '../voice/ActiveCallPanel';
import { CallHistory } from '../voice/CallHistory';
import { VoiceQueuePanel } from '../voice/VoiceQueuePanel';
import { SupervisorVoicePanel } from '../voice/SupervisorVoicePanel';
import { VoicemailPanel } from '../voice/VoicemailPanel';

// Seed imports
import { conversationsSeed } from '@/data/seed/conversationsSeed';
import { customer360Seed } from '@/data/seed/customer360Seed';
import { queueSeed } from '@/data/seed/queueSeed';
import { agentMetricsSeed, shiftScheduleSeed } from '@/data/seed/agentMetricsSeed';
import { callHistorySeed } from '@/data/seed/callHistorySeed';

import { Clock, Flame, PhoneCall, History, Users, MessageSquare, Shield, Inbox, UserCircle, Search, Filter, User, Eye, Check } from 'lucide-react';
import { MobileSheet } from '@/components/responsive/MobileSheet';
import { MobileTabs } from '@/components/responsive/MobileTabs';

export default function AgentWorkspaceLayout({ activeSubScreen }: { activeSubScreen: string }) {
  useRenderProfiler('AgentWorkspaceLayout');
  // Narrow Zustand selectors
  const lang = useUIStore((s) => s.lang);
  const role = useAuthStore((s) => s.role);
  const isSupportAgent = role === 'support_agent';
  const isInboxScreen = activeSubScreen === 'inbox';
  const addAuditLog = useNotificationsStore((s) => s.addAuditLog);

  // Feature-scoped state still from AppContext (agents only used in TransferModal)
  const { agents } = useApp();
  const t = translations[lang];

  // Active workspace states (local state scoped to AgentWorkspaceLayout)
  const [conversations, setConversations] = useState(conversationsSeed);
  const [activeChatId, setActiveChatId] = useState<string>('conv-102');

  // Incident tickets list state
  const [ticketSearch, setTicketSearch] = useState('');
  const [tktStatusFilter, setTktStatusFilter] = useState('all');
  const [tktPriorityFilter, setTktPriorityFilter] = useState('all');
  const [ticketsList, setTicketsList] = useState([
    { id: 'TIC-2033', customerName: 'Alex Mercer', title: 'Double charge dispute billing error', status: 'open', priority: 'high', date: '2026-05-20' },
    { id: 'TIC-1145', customerName: 'Amina Al-Fayed', title: 'Duplicate billing verification query', status: 'open', priority: 'medium', date: '2026-05-19' },
    { id: 'TIC-1022', customerName: 'Marcus Aurelius', title: 'Arabic STT latency spikes', status: 'pending', priority: 'urgent', date: '2026-05-19' },
    { id: 'TIC-0881', customerName: 'Yasser Al-Shahrani', title: 'Fiber connection stability check', status: 'solved', priority: 'medium', date: '2026-05-12' },
    { id: 'TIC-1102', customerName: 'Amina Al-Fayed', title: 'OAuth Domain Whitelist Update', status: 'solved', priority: 'high', date: '2026-04-14' },
    { id: 'TIC-0992', customerName: 'Marcus Aurelius', title: 'Stripe API webhook failures', status: 'closed', priority: 'high', date: '2026-05-10' }
  ]);

  // Inbox filters (tab, search, queue, status) — extracted hook
  const {
    activeTab,
    setActiveTab,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    selectedQueue,
    setSelectedQueue,
    filteredConversations,
  } = useInboxFilters(conversations);

  // AUX timer + queue metrics — extracted hook
  const {
    auxStatus,
    auxSeconds,
    handleAuxStatusChange,
    formatAuxTime,
    activeConversationCount,
  } = useQueueMetrics();

  // All 4 telephony hooks composed — extracted hook
  const {
    call,
    setCall,
    receiveInbound,
    startOutbound,
    answerCall,
    rejectCall,
    hangupCall,
    toggleMute,
    toggleHold,
    toggleRecording,
    submitDisposition,
    formatDuration,
    isDialerOpen,
    dialInput,
    setDialInput,
    openDialer,
    closeDialer,
    dialPadKeyPress,
    backspaceInput,
    clearDialInput,
    setDialTarget,
    queue,
    dequeueCall,
    simulateInboundQueuedCall,
    supervisorMode,
    whisperHint,
    silentMonitor,
    whisperCoach,
    bargeIn,
    stopMonitoring,
    callHistory,
    addCallToHistory,
    parkedHeldCall,
    setParkedHeldCall,
    hasConflictingActiveCall,
    hasActiveVoiceCall,
  } = useVoiceState(addAuditLog, callHistorySeed);

  // Voice Sub-tabs state
  const [voiceTab, setVoiceTab] = useState<'history' | 'queue' | 'voicemail' | 'supervisor'>('history');
  const [mobileOverlay, setMobileOverlay] = useState<'inbox' | 'customer360' | null>(null);

  // Normalize voice tab state if it becomes supervisor when user is support agent
  useEffect(() => {
    if (isSupportAgent && voiceTab === 'supervisor') {
      setVoiceTab('history');
    }
  }, [isSupportAgent, voiceTab]);

  // Simulate incoming call from queue automatically after a delay if agent is online and idle
  useEffect(() => {
    if (auxStatus !== 'online' || call) return;

    // Trigger random inbound call after 15 seconds of idle time
    const timer = setTimeout(() => {
      if (queue.length > 0 && Math.random() > 0.3) {
        const nextCaller = queue[0];
        // Remove from queue first
        dequeueCall(nextCaller.id);
        // Trigger ringing overlay
        receiveInbound(nextCaller.phoneNumber, nextCaller.customerName);
        addAuditLog(`Simulating Inbound voice call from queue: ${nextCaller.customerName}`, 'success');
      }
    }, 15000);

    return () => clearTimeout(timer);
  }, [auxStatus, call, queue, receiveInbound, dequeueCall, addAuditLog]);



  const executePendingCallIntent = (intent: PendingCallIntent) => {
    autoFocusActiveCallRef.current = true;

    if (intent.type === 'outbound') {
      startOutbound(intent.number, intent.name);
      addAuditLog(`Initiated outbound SIP call to ${intent.number}`, 'success');
      return;
    }

    if (intent.type === 'restore_held') {
      setCall({
        ...intent.heldCall,
        status: 'active',
        isHeld: false,
        timeline: [
          ...intent.heldCall.timeline,
          `[${new Date().toLocaleTimeString()}] Held session restored after secondary call ended.`
        ]
      });
      setParkedHeldCall(null);
      addAuditLog(`Restored held session with ${intent.heldCall.contactName}`, 'success');
      return;
    }

    const matched = queue.find(c => c.phoneNumber === intent.phoneNumber);
    if (matched) {
      dequeueCall(matched.id);
    }
    receiveInbound(intent.phoneNumber, intent.name);
    addAuditLog(`Picked up queued call from ${intent.name}`, 'success');
  };

  const requestNewCallIntent = (intent: PendingCallIntent) => {
    if (!hasConflictingActiveCall) {
      executePendingCallIntent(intent);
      return;
    }

    setPendingCallIntent(intent);
    setShowCallConflictModal(true);
  };

  const handleDialOutbound = (number: string, name: string) => {
    requestNewCallIntent({ type: 'outbound', number, name });
  };

  const handleAnswerQueueCaller = (phoneNumber: string, name: string) => {
    requestNewCallIntent({ type: 'queue_accept', phoneNumber, name });
  };

  const continuePendingIntent = () => {
    if (!pendingCallIntent) return;
    const intent = pendingCallIntent;
    setPendingCallIntent(null);
    setShowCallConflictModal(false);
    executePendingCallIntent(intent);
  };

  const handleConflictCancel = () => {
    setPendingCallIntent(null);
    setShowCallConflictModal(false);
  };

  const handleHoldCurrentAndContinue = () => {
    if (call) {
      const heldSnapshot: ActiveCall = {
        ...call,
        isHeld: true,
        status: 'held',
        timeline: [...call.timeline, `[${new Date().toLocaleTimeString()}] Call parked on hold for parallel session.`],
      };
      setParkedHeldCall(heldSnapshot);

      if (call.status === 'active' && !call.isHeld) {
        toggleHold();
      }
      addAuditLog('Placed current call on hold before starting a new session', 'success');
    }
    window.setTimeout(() => {
      continuePendingIntent();
    }, 50);
  };

  const handleRestoreHeldCall = () => {
    if (!parkedHeldCall) return;
    requestNewCallIntent({ type: 'restore_held', heldCall: parkedHeldCall });
  };

  const handleEndHeldCall = () => {
    if (!parkedHeldCall) return;
    addAuditLog(`Cleared held session for ${parkedHeldCall.contactName}`, 'success');
    setParkedHeldCall(null);
  };

  const handleEndCurrentAndContinue = () => {
    if (call) {
      setCall(null);
      addAuditLog('Ended current call before starting a new session', 'success');
    }
    window.setTimeout(() => {
      continuePendingIntent();
    }, 50);
  };

  // Modal displays
  const [isHold, setIsHold] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showConferenceModal, setShowConferenceModal] = useState(false);
  const [showWrapupModal, setShowWrapupModal] = useState(false);
  const [showCallConflictModal, setShowCallConflictModal] = useState(false);
  const [pendingCallIntent, setPendingCallIntent] = useState<PendingCallIntent | null>(null);
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const activeCallPanelRef = useRef<HTMLDivElement | null>(null);
  const autoFocusActiveCallRef = useRef(false);
  const [rightPanelExpanded, setRightPanelExpanded] = useState(true);

  const focusActiveCallPanel = () => {
    const panel = activeCallPanelRef.current;
    if (!panel) return;

    try {
      panel.focus({ preventScroll: true });
    } catch {
      panel.focus();
    }

    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Whisper / Live simulated supervisors
  const [activeWhisper, setActiveWhisper] = useState<string>(
    'Liam, verify user\'s API credentials mapping on ORD-998. Key validation logs showed authentication credentials mismatch.'
  );



  // Find active chat & customer info
  const activeChat = conversations.find((c) => c.id === activeChatId) || conversations[0];
  const activeCustomerProfile = customer360Seed[activeChat?.id];

  // Send messaging dispatch
  const [draftText, setDraftText] = useState('');

  const handleEscalateChat = () => {
    setConversations(prev => prev.map(c => {
      if (c.id === activeChat.id) {
        return {
          ...c,
          status: 'escalated',
          slaStatus: 'warning',
          slaDeadline: '15m'
        };
      }
      return c;
    }));
    addAuditLog(`Escalated chat session ${activeChat.id}`, 'failed');
  };

  const handleAssignToggle = () => {
    setConversations(prev => prev.map(c => {
      if (c.id === activeChat.id) {
        const isUnassigned = c.status === 'unassigned';
        return {
          ...c,
          status: isUnassigned ? 'active' : 'unassigned',
          agentId: isUnassigned ? 'agent-1' : undefined
        };
      }
      return c;
    }));
    addAuditLog(
      activeChat.status === 'unassigned'
        ? `Assigned chat ${activeChat.id} to Liam Bennett`
        : `Unassigned chat ${activeChat.id}`,
      'success'
    );
  };

  const handleSendMessage = (text: string, type: 'chat' | 'note') => {
    if (!text) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isNote = type === 'note';

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: isNote ? 'system' as const : 'agent' as const,
      senderName: isNote ? 'System (Liam Notes)' : 'Liam Bennett',
      text: isNote ? `[Internal Note]: ${text}` : text,
      timestamp
    };

    setConversations(prev => prev.map((c) => {
      if (c.id === activeChat.id) {
        return {
          ...c,
          lastMessage: isNote ? `Note: ${text}` : text,
          lastMessageTime: timestamp,
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    }));

    addAuditLog(`Sent ${isNote ? 'internal note' : 'customer response'} to conversation: ${activeChat.id}`, 'success');
    setDraftText('');
  };

  // Conference Submit call handler
  const handleDialConference = (name: string, dialDest: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const systemMsg = {
      id: `msg-sys-${Date.now()}`,
      sender: 'system' as const,
      senderName: 'System',
      text: `Liam Bennett dialed in participant ${name} (${dialDest}) for a 3-way conference.`,
      timestamp
    };

    setConversations(prev => prev.map((c) => {
      if (c.id === activeChat.id) {
        return {
          ...c,
          messages: [...c.messages, systemMsg]
        };
      }
      return c;
    }));

    addAuditLog(`Started conference call with ${name} on chat ${activeChat.id}`, 'success');
    setShowConferenceModal(false);
  };

  // Transfer Submit agent handler
  const handleTransferAgentSubmit = (agentId: string, notes: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const targetAgentName = agents.find(a => a.id === agentId)?.name || 'Agent';

    const systemMsg = {
      id: `msg-sys-${Date.now()}`,
      sender: 'system' as const,
      senderName: 'System',
      text: `Liam Bennett transferred case to ${targetAgentName}. Consult details: "${notes}"`,
      timestamp
    };

    setConversations(prev => prev.map((c) => {
      if (c.id === activeChat.id) {
        return {
          ...c,
          status: 'resolved',
          messages: [...c.messages, systemMsg]
        };
      }
      return c;
    }));

    addAuditLog(`Transferred chat ${activeChat.id} to ${targetAgentName}`, 'success');
    setShowTransferModal(false);
  };

  // Wrapup close submit handler
  const handleResolveCase = (code: string, notes: string, followUpDate?: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const systemMsg = {
      id: `msg-sys-${Date.now()}`,
      sender: 'system' as const,
      senderName: 'System',
      text: `Case closed with resolution code: ${code}. Notes: ${notes}. ${
        followUpDate ? `Scheduled follow-up on ${followUpDate}` : ''
      }`,
      timestamp
    };

    setConversations(prev => prev.map((c) => {
      if (c.id === activeChat.id) {
        return {
          ...c,
          status: 'resolved',
          messages: [...c.messages, systemMsg]
        };
      }
      return c;
    }));

    addAuditLog(`Case resolved successfully: ${activeChat.id} under code ${code}`, 'success');
    setShowWrapupModal(false);
  };

  // RAG summary calculator
  const handleTriggerSummary = () => {
    setSummaryText(
      `AI CONVERSATION SUMMARY (Confidence Score: 96%):\n\n` +
      `The customer (${activeChat.customerName}) reported an issue with their endpoint connection or refund status. ` +
      `Farah AI provided initial RAG guidelines. Agent Liam joined, processed a damages exception, and sync status updates. ` +
      `The overall customer sentiment started Negative and shifted to Neutral.`
    );
  };


  const showReturnToCallDock = (hasActiveVoiceCall || Boolean(parkedHeldCall)) && activeTab !== 'voice';

  const handleReturnToActiveCall = () => {
    setActiveTab('voice');
    setMobileOverlay(null);
    closeDialer();
    window.setTimeout(() => {
      focusActiveCallPanel();
    }, 50);
  };

  useEffect(() => {
    if (!call) return;
    if (!autoFocusActiveCallRef.current) return;

    const eligibleStatuses: Array<typeof call.status> = ['ringing', 'connecting', 'active', 'held', 'disposition'];
    if (!eligibleStatuses.includes(call.status)) return;

    const frame = window.requestAnimationFrame(() => {
      setActiveTab('voice');
      setMobileOverlay(null);
      closeDialer();
      const panel = activeCallPanelRef.current;

      if (panel) {
        focusActiveCallPanel();
        autoFocusActiveCallRef.current = false;
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [call?.status, closeDialer]);

  // Sub-screens routing
  if (activeSubScreen === 'agent_dashboard') {
    return (
      <div className="space-y-6 animate-in fade-in-50 duration-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">{t.agentWorkspace.dashboard.title}</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">{t.agentWorkspace.dashboard.welcomeLiam}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={isSupportAgent ? "lg:col-span-3" : "lg:col-span-2"}>
            <PerformanceScorecard metrics={agentMetricsSeed} />
          </div>
          {!isSupportAgent && (
            <div>
              <SupervisorPanel
                onTriggerWhisper={(w) => {
                  setActiveWhisper(w);
                  addAuditLog(`Received whisper hint: "${w}"`, 'success');
                }}
                onJoinSession={() => {
                  addAuditLog(`Supervisor joined the active session ${activeChatId}`, 'success');
                  alert(`Supervisor joined active session. 3-Way dialog initialized.`);
                }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activeSubScreen === 'tickets') {
    const isAr = lang === 'ar';
    const statusLabels: Record<string, string> = {
      all: isAr ? 'الكل' : 'All',
      open: isAr ? 'مفتوح' : 'Open',
      pending: isAr ? 'معلق' : 'Pending',
      solved: isAr ? 'تم الحل' : 'Solved',
      closed: isAr ? 'مغلق' : 'Closed',
    };
    const priorityLabels: Record<string, string> = {
      all: isAr ? 'كل الأولويات' : 'All Priorities',
      urgent: isAr ? 'عاجل' : 'Urgent',
      high: isAr ? 'عالي' : 'High',
      medium: isAr ? 'متوسط' : 'Medium',
      low: isAr ? 'منخفض' : 'Low',
    };

    const filteredTickets = ticketsList.filter((tkt) => {
      const matchesSearch =
        tkt.id.toLowerCase().includes(ticketSearch.toLowerCase()) ||
        tkt.customerName.toLowerCase().includes(ticketSearch.toLowerCase()) ||
        tkt.title.toLowerCase().includes(ticketSearch.toLowerCase());
      const matchesStatus = tktStatusFilter === 'all' || tkt.status === tktStatusFilter;
      const matchesPriority = tktPriorityFilter === 'all' || tkt.priority === tktPriorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });

    return (
      <div className="space-y-6 animate-in fade-in-50 duration-200">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white font-mono">
              {t.agentWorkspace.dashboard.headers.activeTickets}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {isAr
                ? 'مراجعة وحل تذاكر البلاغات والشكاوى المسجلة للعملاء'
                : 'Review, assign, and resolve incident support tickets and active escalations.'}
            </p>
          </div>
          {/* Quick Stats */}
          <div className="flex gap-2">
            <div className="px-3 py-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-2xl text-center">
              <span className="text-[10px] uppercase font-bold block">{isAr ? 'عاجل' : 'Urgent'}</span>
              <strong className="text-sm font-bold font-mono">
                {ticketsList.filter(t => t.priority === 'urgent' && t.status !== 'closed').length}
              </strong>
            </div>
            <div className="px-3 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-2xl text-center">
              <span className="text-[10px] uppercase font-bold block">{isAr ? 'مفتوح/معلق' : 'Open/Pending'}</span>
              <strong className="text-sm font-bold font-mono">
                {ticketsList.filter(t => (t.status === 'open' || t.status === 'pending')).length}
              </strong>
            </div>
          </div>
        </div>

        {/* Filters and Search toolbar */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          {/* Search bar */}
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={ticketSearch}
              onChange={(e) => setTicketSearch(e.target.value)}
              placeholder={isAr ? 'البحث بالرمز، العميل، العنوان...' : 'Search by ID, customer, title...'}
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-slate-200"
            />
          </div>

          {/* Pill Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Status Pills */}
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-800/80">
              {['all', 'open', 'pending', 'solved', 'closed'].map((status) => {
                const isActive = tktStatusFilter === status;
                return (
                  <button
                    key={status}
                    onClick={() => setTktStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                      isActive
                        ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-xs font-extrabold'
                        : 'text-slate-450 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    {statusLabels[status]}
                  </button>
                );
              })}
            </div>

            {/* Priority Selector */}
            <div className="relative">
              <select
                value={tktPriorityFilter}
                onChange={(e) => setTktPriorityFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-[10px] font-bold border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-slate-250 cursor-pointer"
              >
                {['all', 'urgent', 'high', 'medium', 'low'].map((prio) => (
                  <option key={prio} value={prio}>
                    {priorityLabels[prio]}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono w-24">ID</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">{isAr ? 'العميل' : 'Customer'}</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">{isAr ? 'العنوان / الموضوع' : 'Subject'}</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center w-28">{isAr ? 'الأولوية' : 'Priority'}</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center w-28">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 w-32">{isAr ? 'التاريخ' : 'Created At'}</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 w-24 text-center">{isAr ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-xs text-slate-400 italic">
                      {isAr ? 'لا توجد تذاكر تطابق معايير البحث والفرز.' : 'No incident tickets found matching the filters.'}
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((tkt) => {
                    const statusColors: Record<string, string> = {
                      open: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
                      pending: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-455 border border-yellow-500/20',
                      solved: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20',
                      closed: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20',
                    };

                    const priorityColors: Record<string, string> = {
                      urgent: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25',
                      high: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25',
                      medium: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/25',
                      low: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/25',
                    };

                    return (
                      <tr
                        key={tkt.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors text-xs text-slate-600 dark:text-slate-350"
                      >
                        <td className="px-4 py-3.5 font-bold font-mono text-slate-900 dark:text-white select-all">
                          {tkt.id}
                        </td>
                        <td className="px-4 py-3.5 font-medium text-slate-800 dark:text-white">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-950 flex items-center justify-center border border-slate-200 dark:border-slate-800">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                            </div>
                            <span>{tkt.customerName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-normal max-w-xs truncate" title={tkt.title}>
                          {tkt.title}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${priorityColors[tkt.priority]}`}>
                            {priorityLabels[tkt.priority]}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 ${statusColors[tkt.status]}`}>
                            {tkt.status === 'open' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                            {tkt.status === 'pending' && <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />}
                            <span>{statusLabels[tkt.status]}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-400">
                          {tkt.date}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                addAuditLog(`Agent viewed incident details for ${tkt.id}`, 'success');
                                alert(`${isAr ? 'عرض تفاصيل التذكرة:' : 'View details for'} ${tkt.id}\n${tkt.title}`);
                              }}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-450 hover:text-slate-900 dark:hover:text-white transition-colors"
                              title={isAr ? 'عرض التفاصيل' : 'View Details'}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {tkt.status !== 'closed' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setTicketsList(prev => prev.map(t => t.id === tkt.id ? { ...t, status: t.status === 'solved' ? 'closed' : 'solved' } : t));
                                  const nextStatus = tkt.status === 'solved' ? 'closed' : 'solved';
                                  addAuditLog(`Updated ticket status of ${tkt.id} to ${nextStatus.toUpperCase()}`, 'success');
                                }}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-450 hover:text-blue-500 transition-colors"
                                title={tkt.status === 'solved' ? (isAr ? 'إغلاق التذكرة' : 'Close Ticket') : (isAr ? 'تحديد كمحلولة' : 'Mark Solved')}
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (activeSubScreen === 'copilot') {
    return (
      <div className="space-y-6 animate-in fade-in-50 duration-200 max-w-4xl mx-auto">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">{lang === 'ar' ? 'مساعد الذكاء الاصطناعي' : 'AI Copilot Center'}</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">Real-time smart recommendations and context intelligence</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <AICopilotPanel
            activeChat={conversations[0]}
            lang={lang}
            onApplySuggestedReply={(text) => {
              addAuditLog(`Applied suggestion: "${text}"`, 'success');
              alert(`Applied reply: ${text}`);
            }}
            onSummarize={() => addAuditLog('Manual RAG summary requested via Copilot screen', 'success')}
          />
        </div>
      </div>
    );
  }

  if (activeSubScreen === 'suggested_replies') {
    return (
      <div className="space-y-6 animate-in fade-in-50 duration-200 max-w-4xl mx-auto">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">{lang === 'ar' ? 'منشئ الردود بالذكاء الاصطناعي' : 'AI Smart Response Composer'}</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">Test NLU matched macros and rewrite message tones dynamically</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Sandbox Context</span>
            <p className="mt-1 text-slate-700 dark:text-slate-300">Mocking conversation response composer tab.</p>
          </div>
          <AIReplyComposer
            draftText={draftText}
            onChangeDraft={setDraftText}
            onSend={(txt, type) => {
              addAuditLog(`Sent sandbox response: "${txt}" (${type})`, 'success');
              alert(`Sent: ${txt} as ${type}`);
            }}
            suggestedReplyText="Under standard return policy checks (ks-1), refunds are allowed within 30 days. Let me process a manual exemption."
            lang={lang}
            onSummarize={handleTriggerSummary}
          />
        </div>
      </div>
    );
  }

  if (activeSubScreen === 'wrapup_codes') {
    const wrapupCodes = [
      { code: 'SAP-CRM-101', category: 'Billing Mismatch', severity: 'low', slaAction: 'Auto-Credit' },
      { code: 'SAP-CRM-204', category: 'SIP Trunk Dropout', severity: 'critical', slaAction: 'Escalate to Telecom' },
      { code: 'SAP-CRM-305', category: 'Vector Compaction Lockout', severity: 'high', slaAction: 'Trigger compaction' },
      { code: 'SAP-CRM-401', category: 'Authentication Mismatch', severity: 'medium', slaAction: 'Regenerate token' }
    ];

    return (
      <div className="space-y-6 animate-in fade-in-50 duration-200 max-w-4xl mx-auto">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">{lang === 'ar' ? 'رموز إنهاء الحالات (SAP CRM)' : 'SAP CRM Wrap-up & Dispositions'}</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">Configure standard wrap-up codes and resolution compliance actions</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-xs text-slate-650 dark:text-slate-400 uppercase font-mono">Dispositions Registry</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-455 font-bold">
                  <th className="pb-3">CRM Diagnostic Code</th>
                  <th className="pb-3">Category Name</th>
                  <th className="pb-3">Severity Level</th>
                  <th className="pb-3">Compliance Route Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-600 dark:text-slate-350">
                {wrapupCodes.map((row) => (
                  <tr key={row.code}>
                    <td className="py-3 font-mono font-bold text-blue-600 dark:text-blue-400">{row.code}</td>
                    <td className="py-3 font-semibold text-slate-900 dark:text-white">{row.category}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold font-mono uppercase ${
                        row.severity === 'critical' ? 'bg-rose-100 text-rose-800' :
                        row.severity === 'high' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {row.severity}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-slate-500">{row.slaAction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Unified support desk view
  return (
    <div className={`relative min-w-0 flex flex-col rounded-3xl border border-slate-200 bg-slate-50/95 shadow-sm overflow-x-hidden dark:border-slate-800 dark:bg-slate-900 ${isInboxScreen ? 'h-full' : 'min-h-[calc(100dvh-8rem)]'}`}>
      
      {/* Top Auxiliary break toolbar */}
      <WorkspaceAuxToolbar
        auxStatus={auxStatus}
        onAuxStatusChange={(status) => handleAuxStatusChange(status, addAuditLog)}
        auxSeconds={auxSeconds}
        formatAuxTime={formatAuxTime}
        activeConversationCount={activeConversationCount}
        conversations={conversations}
        lang={lang}
      />

      {/* Main split-pane content — desktop: 3-col; mobile: primary work + sheets */}
      <div className={`flex min-h-0 flex-1 flex-col overflow-x-hidden lg:flex-row ${showReturnToCallDock ? 'pb-28 sm:pb-32 lg:pb-24' : ''}`}>
        {/* Left pane: Unified Inbox (desktop only — mobile uses sheet) */}
        <section
          aria-label={lang === 'ar' ? 'طوابير المحادثات' : 'Conversation queues'}
          className="hidden h-full min-h-0 w-64 xl:w-72 2xl:w-80 min-w-0 shrink-0 lg:block"
        >
          <UnifiedInbox
            conversations={filteredConversations}
            activeChatId={activeChatId}
            onSelectChat={(id) => setActiveChatId(id)}
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            statusFilter={statusFilter}
            onChangeStatusFilter={setStatusFilter}
            selectedQueue={selectedQueue}
            onChangeQueue={setSelectedQueue}
            queues={queueSeed}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </section>

        {/* Middle pane: Conversation Panel or Voice Panel */}
        <section
          aria-label={lang === 'ar' ? 'مساحة المحادثة النشطة' : 'Active conversation workspace'}
          className="flex-1 min-w-0 min-h-0 flex flex-col"
        >
          <div className="flex shrink-0 items-center gap-2 border-b border-slate-200 bg-slate-50/95 px-2 py-2 dark:border-slate-800 dark:bg-slate-950/40 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileOverlay('inbox')}
              className="flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 py-2 text-[10px] font-bold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <Inbox className="h-4 w-4 shrink-0 text-blue-600" />
              <span className="truncate">Queues</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileOverlay('customer360')}
              className="flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 py-2 text-[10px] font-bold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <UserCircle className="h-4 w-4 shrink-0 text-indigo-600" />
              <span className="truncate">360°</span>
            </button>
          </div>

        {activeTab === 'voice' ? (
          <div className="flex min-h-0 min-w-0 flex-1 flex-col space-y-4 overflow-x-hidden bg-slate-50 p-3 dark:bg-slate-950 sm:p-5">
            
            {/* If call is active, connecting, held, or disposition, show active call panel */}
            {call && (call.status === 'active' || call.status === 'connecting' || call.status === 'held' || call.status === 'disposition') ? (
              <div ref={activeCallPanelRef} tabIndex={-1} className="scroll-mt-24 outline-none">
                <ActiveCallPanel
                  call={call}
                  formatDuration={formatDuration}
                  onToggleMute={toggleMute}
                  onToggleHold={toggleHold}
                  onToggleRecording={toggleRecording}
                  onTransfer={() => setDialTarget('', 'Transfer Target')}
                  onConference={() => setDialTarget('', 'Conference Target')}
                  onHangup={hangupCall}
                />
              </div>
            ) : (
              // Idle state / Voice dashboard summary
              <div className="space-y-4 shrink-0">
                {parkedHeldCall && (
                  <div className="rounded-3xl border border-amber-200 bg-amber-50/80 p-5 text-xs font-semibold text-amber-900 shadow-sm dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-200">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                          Held Call Available
                        </p>
                        <h3 className="truncate text-base font-extrabold text-slate-900 dark:text-white">
                          Resume previous call?
                        </h3>
                        <p className="mt-1 truncate font-mono text-[10px] text-amber-700/80 dark:text-amber-300/80">
                          {parkedHeldCall.contactName} · {parkedHeldCall.phoneNumber}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full bg-white/70 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-amber-700 dark:bg-slate-900/70 dark:text-amber-300">
                        {formatDuration(parkedHeldCall.duration)}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={handleRestoreHeldCall}
                        className="flex min-h-11 flex-1 items-center justify-center rounded-xl bg-amber-600 px-3 py-2 text-[10px] font-bold text-white transition-all hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      >
                        Resume Call
                      </button>
                      <button
                        type="button"
                        onClick={handleEndHeldCall}
                        className="flex min-h-11 flex-1 items-center justify-center rounded-xl border border-amber-300 bg-white px-3 py-2 text-[10px] font-bold text-amber-800 transition-all hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30 dark:border-amber-900 dark:bg-slate-900 dark:text-amber-200 dark:hover:bg-slate-800"
                      >
                        End Held Call
                      </button>
                    </div>
                  </div>
                )}

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-sm shrink-0">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="text-base font-extrabold leading-tight text-slate-900 dark:text-white">{t.agentWorkspace.voice.terminalTitle}</h3>
                      <p className="font-mono text-[10px] text-slate-400">{t.agentWorkspace.voice.terminalDesc}</p>
                    </div>

                    <button
                      type="button"
                      onClick={openDialer}
                      data-testid="open-dialer-btn"
                      className="flex shrink-0 items-center justify-center gap-1.5 self-stretch rounded-xl bg-blue-600 px-4 py-2.5 font-bold text-white shadow-sm hover:bg-blue-700 sm:self-auto"
                    >
                      <PhoneCall className="h-4 w-4 animate-bounce" />
                      <span>{t.agentWorkspace.voice.openDialer}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono font-bold block">{t.agentWorkspace.voice.capacity}</span>
                      <strong className="text-lg font-black font-mono text-slate-800 dark:text-white">{t.agentWorkspace.voice.capacityLimit}</strong>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono font-bold block">{t.agentWorkspace.voice.queueStatus}</span>
                      <strong className="text-lg font-black font-mono text-slate-800 dark:text-white">{queue.length} {t.agentWorkspace.voice.waiters}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Voice sub-tabs — scrollable strip on mobile, equal tabs on desktop */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-slate-50/95 dark:border-slate-800 dark:bg-slate-900">
              <div className="lg:hidden">
                <MobileTabs
                  items={[
                    { id: 'history', label: t.agentWorkspace.voice.history, icon: <History className="h-3.5 w-3.5" /> },
                    { id: 'queue', label: `${t.agentWorkspace.voice.queue} (${queue.length})`, icon: <Users className="h-3.5 w-3.5" /> },
                    { id: 'voicemail', label: t.agentWorkspace.voice.vm, icon: <MessageSquare className="h-3.5 w-3.5" /> },
                    ...(!isSupportAgent ? [{ id: 'supervisor', label: t.agentWorkspace.voice.supervisor, icon: <Shield className="h-3.5 w-3.5" /> }] : []),
                  ]}
                  activeId={voiceTab}
                  onChange={(id) => setVoiceTab(id as typeof voiceTab)}
                />
              </div>
              <div className="hidden shrink-0 border-b border-slate-200 bg-slate-50/50 text-center text-[10px] font-bold uppercase dark:border-slate-800 dark:bg-slate-950/20 lg:flex">
                <button
                  type="button"
                  onClick={() => setVoiceTab('history')}
                  className={`flex flex-1 items-center justify-center gap-1 border-b-2 py-3 transition-colors ${
                    voiceTab === 'history'
                      ? 'border-blue-600 bg-slate-50 font-bold text-blue-600 dark:bg-slate-900 dark:text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  <History className="h-3.5 w-3.5" />
                  <span>{t.agentWorkspace.voice.callHistory}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVoiceTab('queue')}
                  className={`relative flex flex-1 items-center justify-center gap-1 border-b-2 py-3 transition-colors ${
                    voiceTab === 'queue'
                      ? 'border-blue-600 bg-slate-50 font-bold text-blue-600 dark:bg-slate-900 dark:text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>{t.agentWorkspace.voice.voiceQueue} ({queue.length})</span>
                  {queue.length > 0 && (
                    <span className="absolute inset-e-1.5 top-1.5 h-2 w-2 animate-pulse rounded-full bg-rose-500" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setVoiceTab('voicemail')}
                  className={`flex flex-1 items-center justify-center gap-1 border-b-2 py-3 transition-colors ${
                    voiceTab === 'voicemail'
                      ? 'border-blue-600 bg-slate-50 font-bold text-blue-600 dark:bg-slate-900 dark:text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{t.agentWorkspace.voice.voicemails}</span>
                </button>

                {!isSupportAgent && (
                  <button
                    type="button"
                    onClick={() => setVoiceTab('supervisor')}
                    className={`flex flex-1 items-center justify-center gap-1 border-b-2 py-3 transition-colors ${
                      voiceTab === 'supervisor'
                        ? 'border-blue-600 bg-slate-50 font-bold text-blue-600 dark:bg-slate-900 dark:text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    <Shield className="h-3.5 w-3.5" />
                    <span>{t.agentWorkspace.voice.supervisorConsole}</span>
                  </button>
                )}
              </div>

              {/* Sub-tab container content */}
              <div className="flex-1 p-4 overflow-y-auto min-h-0 scrollbar-thin">
                {voiceTab === 'history' && (
                  <CallHistory
                    history={callHistory}
                    onDial={handleDialOutbound}
                    disableActions={showCallConflictModal}
                  />
                )}
                
                {voiceTab === 'queue' && (
                  <VoiceQueuePanel
                    queue={queue}
                    onAnswerCaller={handleAnswerQueueCaller}
                    onSimulateInbound={simulateInboundQueuedCall}
                    disableActions={showCallConflictModal}
                  />
                )}

                {voiceTab === 'voicemail' && (
                  <VoicemailPanel />
                )}

                {voiceTab === 'supervisor' && !isSupportAgent && (
                  <SupervisorVoicePanel
                    mode={supervisorMode}
                    whisperHint={whisperHint}
                    onSilentMonitor={silentMonitor}
                    onWhisperCoach={whisperCoach}
                    onBargeIn={bargeIn}
                    onStopMonitoring={stopMonitoring}
                  />
                )}
              </div>
            </div>
          </div>
        ) : (
          <ConversationPanel
            activeChat={activeChat}
            draftText={draftText}
            onChangeDraft={setDraftText}
            onSend={handleSendMessage}
            onTransferClick={() => setShowTransferModal(true)}
            onConferenceClick={() => setShowConferenceModal(true)}
            onResolveClick={() => setShowWrapupModal(true)}
            onToggleHold={() => {
              setIsHold(!isHold);
              addAuditLog(`Liam Bennett ${!isHold ? 'placed session on hold' : 'resumed session'}`, 'success');
            }}
            isHold={isHold}
            whisper={activeWhisper}
            onCloseWhisper={() => setActiveWhisper('')}
            lang={lang}
            onSummarize={handleTriggerSummary}
            onEscalateClick={handleEscalateChat}
            onAssignClick={handleAssignToggle}
            rightPanelExpanded={rightPanelExpanded}
            onToggleRightPanel={() => setRightPanelExpanded(!rightPanelExpanded)}
          />
        )}
        </section>

        {/* Right pane: Customer 360 & AI Copilot */}
        <section
          aria-label={lang === 'ar' ? 'تفاصيل العميل والردود الذكية بالذكاء الاصطناعي' : 'Customer 360 & AI Copilot details'}
          className={`hidden h-full min-w-0 shrink-0 overflow-hidden border-slate-200 dark:border-slate-800 lg:block lg:border-s transition-all duration-300 ${rightPanelExpanded ? 'w-64 xl:w-72' : 'w-0 border-none'}`}
        >
          {rightPanelExpanded && (
            <RightWorkspacePanel
              profile={activeCustomerProfile}
              activeChat={activeChat}
              lang={lang}
              onApplySuggestedReply={(text) => setDraftText(text)}
              onSummarize={handleTriggerSummary}
            />
          )}
        </section>
      </div>

      {showReturnToCallDock && (
        <div
          role="status"
          aria-label={lang === 'ar' ? 'شريط المكالمة الجارية العائم' : 'Active Call Floating Dock'}
          className="fixed bottom-3 z-[45] w-[calc(100vw-1.5rem)] max-w-md"
          style={{ [lang === 'ar' ? 'left' : 'right']: '0.75rem' }}
        >
          <div className="rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur-md transition-all duration-200 dark:border-slate-700 dark:bg-slate-900/95 sm:p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  {call ? 'Active Voice Session' : 'Held Voice Session Available'}
                </p>
                <p className="truncate text-sm font-extrabold text-slate-900 dark:text-white">
                  {call?.contactName || parkedHeldCall?.contactName || 'Current caller'}
                </p>
                <p className="mt-0.5 truncate text-[10px] text-slate-500 dark:text-slate-400">
                  {call
                    ? `${call.phoneNumber} · ${call.status === 'held' ? 'On hold' : 'Live'}`
                    : `${parkedHeldCall?.phoneNumber || '—'} · On hold`}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                {formatDuration(call?.duration || parkedHeldCall?.duration || 0)}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              {call && (
                <button
                  type="button"
                  onClick={handleReturnToActiveCall}
                  className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-[10px] font-bold text-blue-700 transition-all hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300 dark:hover:bg-blue-950/50"
                >
                  <span>Tap to Return to Call</span>
                </button>
              )}
              {parkedHeldCall && (
                <button
                  type="button"
                  onClick={handleRestoreHeldCall}
                  className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] font-bold text-amber-700 transition-all hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300 dark:hover:bg-amber-950/50"
                >
                  <span>Return to Held Call</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <MobileSheet
        open={mobileOverlay === 'inbox'}
        onClose={() => setMobileOverlay(null)}
        title="Conversation queues"
        description="Switch channels, queues, and active sessions."
        bodyClassName="max-h-[min(82dvh,640px)]"
      >
        <UnifiedInbox
          conversations={filteredConversations}
          activeChatId={activeChatId}
          onSelectChat={(id) => {
            setActiveChatId(id);
            setMobileOverlay(null);
          }}
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          statusFilter={statusFilter}
          onChangeStatusFilter={setStatusFilter}
          selectedQueue={selectedQueue}
          onChangeQueue={setSelectedQueue}
          queues={queueSeed}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          className="h-full min-h-[min(60dvh,480px)] w-full max-w-full border-0"
        />
      </MobileSheet>

      <MobileSheet
        open={mobileOverlay === 'customer360'}
        onClose={() => setMobileOverlay(null)}
        title={lang === 'ar' ? 'ملف العميل والمساعد' : 'Customer 360 & AI Copilot'}
        description={activeChat?.customerName ?? 'Context'}
        bodyClassName="max-h-[min(85dvh,680px)]"
      >
        <div className="min-h-[min(50dvh,400px)]">
          <RightWorkspacePanel
            profile={activeCustomerProfile}
            activeChat={activeChat}
            lang={lang}
            onApplySuggestedReply={(text) => {
              setDraftText(text);
              setMobileOverlay(null);
            }}
            onSummarize={handleTriggerSummary}
          />
        </div>
      </MobileSheet>

      {/* Voice Modals */}
      <IncomingCallModal
        isOpen={call?.status === 'ringing'}
        contactName={call?.contactName || ''}
        phoneNumber={call?.phoneNumber || ''}
        onAccept={answerCall}
        onReject={rejectCall}
      />

      <CallDispositionModal
        isOpen={call?.status === 'disposition'}
        contactName={call?.contactName || ''}
        phoneNumber={call?.phoneNumber || ''}
        duration={formatDuration(call?.duration || 0)}
        onSubmit={submitDisposition}
      />

      <VoiceDialer
        isOpen={isDialerOpen}
        onClose={closeDialer}
        dialInput={dialInput}
        onDialInputChange={setDialInput}
        onDialKeyPress={dialPadKeyPress}
        onBackspace={backspaceInput}
        onClearInput={clearDialInput}
        onCall={handleDialOutbound}
        activeCallStatus={call?.status}
      />

      {showCallConflictModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="call-conflict-title"
            aria-describedby="call-conflict-description"
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <h3 id="call-conflict-title" className="text-sm font-extrabold text-slate-900 dark:text-white">
                Active Call In Progress
              </h3>
              <p id="call-conflict-description" className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                You already have an active voice session.
              </p>
            </div>

            <div className="space-y-2 p-5 text-xs font-semibold">
              <button
                type="button"
                onClick={handleHoldCurrentAndContinue}
                className="flex w-full items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-amber-700 transition-all hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300 dark:hover:bg-amber-950/50"
              >
                Hold Current Call &amp; Continue
              </button>

              <button
                type="button"
                onClick={handleEndCurrentAndContinue}
                className="flex w-full items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-rose-700 transition-all hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-500/40 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300 dark:hover:bg-rose-950/50"
              >
                End Current Call &amp; Continue
              </button>

              <button
                type="button"
                onClick={handleConflictCancel}
                className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-slate-700 transition-all hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals overlay */}
      <TransferModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        agents={agents}
        onTransfer={handleTransferAgentSubmit}
      />

      <ConferenceModal
        isOpen={showConferenceModal}
        onClose={() => setShowConferenceModal(false)}
        onConference={handleDialConference}
      />

      <WrapupModal
        isOpen={showWrapupModal}
        onClose={() => setShowWrapupModal(false)}
        onResolve={handleResolveCase}
        slaStatus={activeChat.slaStatus}
      />

      {/* Summary Output popup */}
      {summaryText && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-50/95 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-md w-full rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 text-xs font-semibold">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-100/70 dark:bg-slate-950/20">
              <span className="font-bold text-slate-800 dark:text-white">AI Summary Result</span>
              <button onClick={() => setSummaryText(null)} className="text-slate-500 dark:text-slate-400 text-lg">×</button>
            </div>
            <div className="p-5 space-y-4">
              <p className="whitespace-pre-line text-slate-700 dark:text-slate-300 leading-relaxed font-mono">
                {summaryText}
              </p>
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSummaryText(null)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
                >
                  Close Summary
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
