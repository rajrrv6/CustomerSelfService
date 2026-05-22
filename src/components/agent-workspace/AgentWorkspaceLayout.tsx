import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';
import { UnifiedInbox } from './UnifiedInbox';
import { ConversationPanel } from './ConversationPanel';
import { Customer360Drawer } from './Customer360Drawer';
import { SupervisorPanel } from './SupervisorPanel';
import { ShiftSchedule } from './ShiftSchedule';
import { PerformanceScorecard } from './PerformanceScorecard';
import { TransferModal } from './TransferModal';
import { ConferenceModal } from './ConferenceModal';
import { WrapupModal } from './WrapupModal';

// Telephony Hooks
import { useCallState } from '@/hooks/useCallState';
import type { ActiveCall } from '@/hooks/useCallState';
import { useDialer } from '@/hooks/useDialer';
import { useVoiceQueue } from '@/hooks/useVoiceQueue';
import { useSupervisorVoice } from '@/hooks/useSupervisorVoice';

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
import { callHistorySeed, CallHistoryItem } from '@/data/seed/callHistorySeed';

import { Clock, Flame, PhoneCall, History, Users, MessageSquare, Shield, Inbox, UserCircle } from 'lucide-react';
import { MobileSheet } from '@/components/responsive/MobileSheet';
import { MobileTabs } from '@/components/responsive/MobileTabs';

type PendingCallIntent =
  | { type: 'outbound'; number: string; name: string }
  | { type: 'queue_accept'; phoneNumber: string; name: string }
  | { type: 'restore_held'; heldCall: ActiveCall };

export default function AgentWorkspaceLayout({ activeSubScreen }: { activeSubScreen: string }) {
  const {
    lang,
    addAuditLog,
    agents
  } = useApp();
  const t = translations[lang];

  // Active workspace states
  const [conversations, setConversations] = useState(conversationsSeed);
  const [activeChatId, setActiveChatId] = useState<string>('conv-102');
  const [activeTab, setActiveTab] = useState<'all' | 'whatsapp' | 'web' | 'email' | 'voice' | 'escalated'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQueue, setSelectedQueue] = useState('q-all');

  // AUX state
  const [auxStatus, setAuxStatus] = useState<'online' | 'busy' | 'away' | 'break'>('online');
  const [auxSeconds, setAuxSeconds] = useState(0);

  // Call History Local State
  const [callHistory, setCallHistory] = useState<CallHistoryItem[]>(callHistorySeed);

  const addCallToHistory = (newCall: CallHistoryItem) => {
    setCallHistory((prev) => [newCall, ...prev]);
    addAuditLog(`Saved voice call session to history: ${newCall.phoneNumber}`, 'success');
  };

  // Telephony custom hooks
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
    formatDuration
  } = useCallState(addCallToHistory);

  const {
    isOpen: isDialerOpen,
    dialInput,
    setDialInput,
    openDialer,
    closeDialer,
    dialPadKeyPress,
    backspaceInput,
    clearDialInput,
    setDialTarget
  } = useDialer();

  const {
    queue,
    dequeueCall,
    simulateInboundQueuedCall
  } = useVoiceQueue();

  const {
    mode: supervisorMode,
    whisperHint,
    silentMonitor,
    whisperCoach,
    bargeIn,
    stopMonitoring
  } = useSupervisorVoice();

  // Voice Sub-tabs state
  const [voiceTab, setVoiceTab] = useState<'history' | 'queue' | 'voicemail' | 'supervisor'>('history');
  const [mobileOverlay, setMobileOverlay] = useState<'inbox' | 'customer360' | null>(null);

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

  const hasConflictingActiveCall = Boolean(
    call && (call.status === 'active' || call.status === 'held' || call.status === 'connecting' || call.status === 'ringing')
  );

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
  const [parkedHeldCall, setParkedHeldCall] = useState<ActiveCall | null>(null);
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const activeCallPanelRef = useRef<HTMLDivElement | null>(null);
  const autoFocusActiveCallRef = useRef(false);

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

  // AUX timer tick
  useEffect(() => {
    const interval = setInterval(() => {
      setAuxSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAuxStatusChange = (status: 'online' | 'busy' | 'away' | 'break') => {
    setAuxStatus(status);
    setAuxSeconds(0);
    addAuditLog(`Agent Liam changed AUX status to ${status.toUpperCase()}`, 'success');
  };

  const formatAuxTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Find active chat & customer info
  const activeChat = conversations.find((c) => c.id === activeChatId) || conversations[0];
  const activeCustomerProfile = customer360Seed[activeChat?.id];

  // Send messaging dispatch
  const [draftText, setDraftText] = useState('');

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

  const hasActiveVoiceCall = Boolean(
    call && (call.status === 'active' || call.status === 'connecting' || call.status === 'held' || call.status === 'disposition')
  );
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
          <div className="lg:col-span-2">
            <PerformanceScorecard metrics={agentMetricsSeed} />
          </div>
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
        </div>
      </div>
    );
  }

  if (activeSubScreen === 'tickets') {
    return (
      <div className="space-y-6 animate-in fade-in-50 duration-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white font-mono">{t.agentWorkspace.roster.title}</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">{t.agentWorkspace.roster.description}</p>
        </div>

        <div className="max-w-3xl">
          <ShiftSchedule schedule={shiftScheduleSeed} />
        </div>
      </div>
    );
  }

  // Unified support desk view
  return (
    <div className="relative min-w-0 flex flex-col min-h-[calc(100dvh-8rem)] rounded-3xl border border-slate-200 bg-slate-50/95 shadow-sm overflow-x-hidden dark:border-slate-800 dark:bg-slate-900">
      
      {/* Top Auxiliary break toolbar */}
      <div className="flex min-h-12 shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-slate-200 bg-slate-50/80 px-3 py-2 text-[11px] font-bold text-slate-600 dark:border-slate-800 dark:bg-slate-950/20 dark:text-slate-300 sm:px-5 sm:py-0 sm:h-12 sm:flex-nowrap">
        
        {/* Active capacity status */}
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Flame className="w-4 h-4 text-orange-500 shrink-0" />
            <span>{t.agentWorkspace.aux.capacityMeter}</span>
            <span className="font-mono text-slate-800 dark:text-slate-200">{conversations.filter(c => c.status === 'active').length}/4 {t.agentWorkspace.aux.active}</span>
          </span>
        </div>

        {/* Break state controls */}
        <div className="flex items-center gap-3">
          <span className="text-slate-500 dark:text-slate-400 uppercase font-mono text-[9px]">{t.agentWorkspace.aux.breakState}</span>
          <div className="flex bg-slate-200 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-300 dark:border-slate-700 text-[10px] font-bold">
            {(['online', 'away', 'break'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => handleAuxStatusChange(st)}
                className={`px-2.5 py-1 rounded transition-all capitalize ${
                  auxStatus === st ? 'bg-slate-50 dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {st === 'online' ? t.agentWorkspace.aux.online : st === 'away' ? t.agentWorkspace.aux.away : t.agentWorkspace.aux.break}
              </button>
            ))}
          </div>
          
          <span className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>{t.agentWorkspace.aux.duration}</span>
            <span className="text-slate-800 dark:text-white font-bold">{formatAuxTime(auxSeconds)}</span>
          </span>
        </div>
      </div>

      {/* Main split-pane content — desktop: 3-col; mobile: primary work + sheets */}
      <div className={`flex min-h-0 flex-1 flex-col overflow-x-hidden lg:flex-row ${showReturnToCallDock ? 'pb-28 sm:pb-32 lg:pb-24' : ''}`}>
        {/* Left pane: Unified Inbox (desktop only — mobile uses sheet) */}
        <div className="hidden h-full min-h-0 w-80 shrink-0 lg:block">
          <UnifiedInbox
            conversations={conversations}
            activeChatId={activeChatId}
            onSelectChat={(id) => setActiveChatId(id)}
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            selectedQueue={selectedQueue}
            onChangeQueue={setSelectedQueue}
            queues={queueSeed}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* Middle pane: Conversation Panel or Voice Panel */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
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
                    { id: 'supervisor', label: t.agentWorkspace.voice.supervisor, icon: <Shield className="h-3.5 w-3.5" /> },
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

                {voiceTab === 'supervisor' && (
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
          />
        )}
        </div>

        {/* Right pane: Customer 360 (desktop) */}
        <div className="hidden h-full w-72 min-w-0 shrink-0 overflow-hidden border-slate-200 dark:border-slate-800 lg:block lg:border-s">
          <Customer360Drawer profile={activeCustomerProfile} />
        </div>
      </div>

      {showReturnToCallDock && (
        <div
          className="fixed bottom-3 z-70 w-[calc(100vw-1.5rem)] max-w-md"
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
          conversations={conversations}
          activeChatId={activeChatId}
          onSelectChat={(id) => {
            setActiveChatId(id);
            setMobileOverlay(null);
          }}
          activeTab={activeTab}
          onChangeTab={setActiveTab}
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
        title="Customer 360"
        description={activeChat?.customerName ?? 'Context'}
        bodyClassName="max-h-[min(85dvh,680px)]"
      >
        <div className="min-h-[min(50dvh,400px)]">
          <Customer360Drawer profile={activeCustomerProfile} />
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
