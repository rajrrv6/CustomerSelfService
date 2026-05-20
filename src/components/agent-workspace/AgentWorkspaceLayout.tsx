import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
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

export default function AgentWorkspaceLayout({ activeSubScreen }: { activeSubScreen: string }) {
  const {
    lang,
    addAuditLog,
    agents
  } = useApp();

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

  const handleDialOutbound = (number: string, name: string) => {
    startOutbound(number, name);
    addAuditLog(`Initiated outbound SIP call to ${number}`, 'success');
  };

  const handleAnswerQueueCaller = (phoneNumber: string, name: string) => {
    const matched = queue.find(c => c.phoneNumber === phoneNumber);
    if (matched) {
      dequeueCall(matched.id);
    }
    receiveInbound(phoneNumber, name);
    addAuditLog(`Picked up queued call from ${name}`, 'success');
  };

  // Modal displays
  const [isHold, setIsHold] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showConferenceModal, setShowConferenceModal] = useState(false);
  const [showWrapupModal, setShowWrapupModal] = useState(false);
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const activeCallPanelRef = useRef<HTMLDivElement | null>(null);

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

  const hasMobileActiveCall = call && (call.status === 'active' || call.status === 'connecting' || call.status === 'held');

  const handleReturnToActiveCall = () => {
    setMobileOverlay(null);
    closeDialer();
    activeCallPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Sub-screens routing
  if (activeSubScreen === 'agent_dashboard') {
    return (
      <div className="space-y-6 animate-in fade-in-50 duration-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Agent Dashboard Workspace</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">Welcome back, Liam Bennett. Track your active queues and performance metrics.</p>
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
          <h2 className="text-xl font-bold text-slate-800 dark:text-white font-mono">Shift & Roster Planner</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">Manage shift schedules and training calendar allocations.</p>
        </div>

        <div className="max-w-3xl">
          <ShiftSchedule schedule={shiftScheduleSeed} />
        </div>
      </div>
    );
  }

  // Unified support desk view
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden bg-slate-50/95 dark:bg-slate-900 shadow-sm relative min-w-0">
      
      {/* Top Auxiliary break toolbar */}
      <div className="flex min-h-12 shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-slate-200 bg-slate-50/80 px-3 py-2 text-[11px] font-bold text-slate-600 dark:border-slate-800 dark:bg-slate-950/20 dark:text-slate-300 sm:px-5 sm:py-0 sm:h-12 sm:flex-nowrap">
        
        {/* Active capacity status */}
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Flame className="w-4 h-4 text-orange-500 shrink-0" />
            <span>Capacity Meter:</span>
            <span className="font-mono text-slate-800 dark:text-slate-200">{conversations.filter(c => c.status === 'active').length}/4 active</span>
          </span>
        </div>

        {/* Break state controls */}
        <div className="flex items-center gap-3">
          <span className="text-slate-500 dark:text-slate-400 uppercase font-mono text-[9px]">Break state:</span>
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
                {st}
              </button>
            ))}
          </div>
          
          <span className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Duration:</span>
            <span className="text-slate-800 dark:text-white font-bold">{formatAuxTime(auxSeconds)}</span>
          </span>
        </div>
      </div>

      {/* Main split-pane content — desktop: 3-col; mobile: primary work + sheets */}
      <div className={`flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row ${hasMobileActiveCall ? 'pb-28 lg:pb-0' : ''}`}>
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
          <div className="flex min-h-0 min-w-0 flex-1 flex-col space-y-4 overflow-hidden bg-slate-50 p-3 dark:bg-slate-950 sm:p-5">
            
            {/* If call is active, connecting, held, or disposition, show active call panel */}
            {call && (call.status === 'active' || call.status === 'connecting' || call.status === 'held' || call.status === 'disposition') ? (
              <div ref={activeCallPanelRef} className="scroll-mt-24">
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
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-sm shrink-0">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="text-base font-extrabold leading-tight text-slate-900 dark:text-white">SIP Voice Terminal</h3>
                    <p className="font-mono text-[10px] text-slate-400">Agent status is online. Awaiting inbound audio sessions.</p>
                  </div>

                  <button
                    type="button"
                    onClick={openDialer}
                    className="flex shrink-0 items-center justify-center gap-1.5 self-stretch rounded-xl bg-blue-600 px-4 py-2.5 font-bold text-white shadow-sm hover:bg-blue-700 sm:self-auto"
                  >
                    <PhoneCall className="h-4 w-4 animate-bounce" />
                    <span>Open Dialer Pad</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono font-bold block">Capacity</span>
                    <strong className="text-lg font-black font-mono text-slate-800 dark:text-white">1 Call Active Limit</strong>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono font-bold block">Voice Queue Status</span>
                    <strong className="text-lg font-black font-mono text-slate-800 dark:text-white">{queue.length} Waiters</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Voice sub-tabs — scrollable strip on mobile, equal tabs on desktop */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-slate-50/95 dark:border-slate-800 dark:bg-slate-900">
              <div className="lg:hidden">
                <MobileTabs
                  items={[
                    { id: 'history', label: 'History', icon: <History className="h-3.5 w-3.5" /> },
                    { id: 'queue', label: `Queue (${queue.length})`, icon: <Users className="h-3.5 w-3.5" /> },
                    { id: 'voicemail', label: 'VM', icon: <MessageSquare className="h-3.5 w-3.5" /> },
                    { id: 'supervisor', label: 'Supervisor', icon: <Shield className="h-3.5 w-3.5" /> },
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
                  <span>Call History</span>
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
                  <span>Voice Queue ({queue.length})</span>
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
                  <span>Voicemails</span>
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
                  <span>Supervisor Console</span>
                </button>
              </div>

              {/* Sub-tab container content */}
              <div className="flex-1 p-4 overflow-y-auto min-h-0 scrollbar-thin">
                {voiceTab === 'history' && (
                  <CallHistory history={callHistory} onDial={handleDialOutbound} />
                )}
                
                {voiceTab === 'queue' && (
                  <VoiceQueuePanel
                    queue={queue}
                    onAnswerCaller={handleAnswerQueueCaller}
                    onSimulateInbound={simulateInboundQueuedCall}
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

      {hasMobileActiveCall && (
        <div className="fixed inset-x-3 bottom-3 z-70 lg:hidden">
          <div className="rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/95">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Active Voice Session
                </p>
                <p className="truncate text-sm font-extrabold text-slate-900 dark:text-white">
                  {call?.contactName || 'Current caller'}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                {call ? formatDuration(call.duration) : '00:00'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
              <button
                type="button"
                onClick={handleReturnToActiveCall}
                className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-blue-700 transition-all hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300 dark:hover:bg-blue-950/50"
              >
                <span>Return to Active Call</span>
              </button>
              <button
                type="button"
                onClick={hangupCall}
                disabled={call?.status !== 'active' && call?.status !== 'held'}
                className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-3 py-2 text-white transition-all hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>Hang Up</span>
              </button>
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
