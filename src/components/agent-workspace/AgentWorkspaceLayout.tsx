import React, { useState, useEffect } from 'react';
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

// Seed imports
import { conversationsSeed } from '@/data/seed/conversationsSeed';
import { customer360Seed } from '@/data/seed/customer360Seed';
import { queueSeed } from '@/data/seed/queueSeed';
import { agentMetricsSeed, shiftScheduleSeed } from '@/data/seed/agentMetricsSeed';

import { Clock, Flame } from 'lucide-react';

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

  // Modal displays
  const [isHold, setIsHold] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showConferenceModal, setShowConferenceModal] = useState(false);
  const [showWrapupModal, setShowWrapupModal] = useState(false);
  const [summaryText, setSummaryText] = useState<string | null>(null);

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
    <div className="flex flex-col h-[calc(100vh-8rem)] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm relative">
      
      {/* Top Auxiliary break toolbar */}
      <div className="h-12 border-b border-slate-200 dark:border-slate-800 px-5 bg-slate-50/80 dark:bg-slate-950/20 flex items-center justify-between text-[11px] font-bold text-slate-650 shrink-0">
        
        {/* Active capacity status */}
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Flame className="w-4 h-4 text-orange-500 shrink-0" />
            <span>Capacity Meter:</span>
            <span className="font-mono text-slate-850 dark:text-slate-200">{conversations.filter(c => c.status === 'active').length}/4 active</span>
          </span>
        </div>

        {/* Break state controls */}
        <div className="flex items-center gap-3">
          <span className="text-slate-450 uppercase font-mono text-[9px]">Break state:</span>
          <div className="flex bg-slate-200 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-250 dark:border-slate-700 text-[10px] font-bold">
            {(['online', 'away', 'break'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => handleAuxStatusChange(st)}
                className={`px-2.5 py-1 rounded transition-all capitalize ${
                  auxStatus === st ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-550'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
          
          <span className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Duration:</span>
            <span className="text-slate-800 dark:text-white font-bold">{formatAuxTime(auxSeconds)}</span>
          </span>
        </div>
      </div>

      {/* Main split-pane content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left pane: Unified Inbox */}
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

        {/* Middle pane: Conversation Panel */}
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

        {/* Right pane: Customer 360 Drawer */}
        <div className="w-72 border-l border-slate-200 dark:border-slate-800 shrink-0 h-full overflow-hidden">
          <Customer360Drawer profile={activeCustomerProfile} />
        </div>
      </div>

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
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-md w-full rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 text-xs font-semibold">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/20">
              <span className="font-bold text-slate-850 dark:text-white">AI Summary Result</span>
              <button onClick={() => setSummaryText(null)} className="text-slate-400 text-lg">×</button>
            </div>
            <div className="p-5 space-y-4">
              <p className="whitespace-pre-line text-slate-700 dark:text-slate-350 leading-relaxed font-mono">
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
