'use client';

/**
 * useVoiceState — Composes the 4 telephony hooks used together in AgentWorkspaceLayout.
 *
 * Before this hook, AgentWorkspaceLayout had 50+ lines of hook wiring:
 *   const { call, setCall, receiveInbound, ... } = useCallState(addCallToHistory);
 *   const { isOpen, dialInput, ... } = useDialer();
 *   const { queue, dequeueCall, ... } = useVoiceQueue();
 *   const { mode, whisperHint, ... } = useSupervisorVoice();
 *
 * These 4 hooks are ALWAYS used together in agent workspace voice flows —
 * there is no scenario where one is used without the others.
 * Composing them here reduces the workspace component's hook surface by ~50 lines.
 *
 * All state remains local (ephemeral voice session) — no Zustand involved.
 */

import { useState, useCallback } from 'react';
import { useCallState, type ActiveCall } from '@/hooks/useCallState';
import { useDialer } from '@/hooks/useDialer';
import { useVoiceQueue } from '@/hooks/useVoiceQueue';
import { useSupervisorVoice } from '@/hooks/useSupervisorVoice';
import { type CallHistoryItem } from '@/data/seed/callHistorySeed';

export type PendingCallIntent =
  | { type: 'outbound'; number: string; name: string }
  | { type: 'queue_accept'; phoneNumber: string; name: string }
  | { type: 'restore_held'; heldCall: ActiveCall };

export type { ActiveCall } from '@/hooks/useCallState';

interface UseVoiceStateResult {
  // Call state
  call: ActiveCall | null;
  setCall: React.Dispatch<React.SetStateAction<ActiveCall | null>>;
  receiveInbound: (num: string, name: string) => void;
  startOutbound: (num: string, name: string) => void;
  answerCall: () => void;
  rejectCall: () => void;
  hangupCall: () => void;
  toggleMute: () => void;
  toggleHold: () => void;
  toggleRecording: () => void;
  submitDisposition: (code: string, notes: string) => void;
  formatDuration: (seconds: number) => string;

  // Dialer
  isDialerOpen: boolean;
  dialInput: string;
  setDialInput: React.Dispatch<React.SetStateAction<string>>;
  openDialer: () => void;
  closeDialer: () => void;
  dialPadKeyPress: (key: string) => void;
  backspaceInput: () => void;
  clearDialInput: () => void;
  setDialTarget: (number: string, name: string) => void;

  // Queue
  queue: ReturnType<typeof useVoiceQueue>['queue'];
  dequeueCall: (id: string) => ReturnType<typeof useVoiceQueue>['queue'][number] | null;
  simulateInboundQueuedCall: () => void;

  // Supervisor
  supervisorMode: ReturnType<typeof useSupervisorVoice>['mode'];
  whisperHint: ReturnType<typeof useSupervisorVoice>['whisperHint'];
  silentMonitor: () => void;
  whisperCoach: (hint: string) => void;
  bargeIn: () => void;
  stopMonitoring: () => void;

  // Call history
  callHistory: CallHistoryItem[];
  addCallToHistory: (call: CallHistoryItem) => void;

  // Parked call
  parkedHeldCall: ActiveCall | null;
  setParkedHeldCall: React.Dispatch<React.SetStateAction<ActiveCall | null>>;

  // Derived
  hasConflictingActiveCall: boolean;
  hasActiveVoiceCall: boolean;
}

export function useVoiceState(
  onAuditLog: (action: string, status?: 'success' | 'failed') => void,
  initialCallHistory: CallHistoryItem[]
): UseVoiceStateResult {
  const [callHistory, setCallHistory] = useState<CallHistoryItem[]>(initialCallHistory);
  const [parkedHeldCall, setParkedHeldCall] = useState<ActiveCall | null>(null);

  const addCallToHistory = useCallback((newCall: CallHistoryItem) => {
    setCallHistory((prev) => [newCall, ...prev]);
    onAuditLog(`Saved voice call session to history: ${newCall.phoneNumber}`, 'success');
  }, [onAuditLog]);

  const callState = useCallState(addCallToHistory);
  const dialerState = useDialer();
  const queueState = useVoiceQueue();
  const supervisorState = useSupervisorVoice();

  const hasConflictingActiveCall = Boolean(
    callState.call &&
    (callState.call.status === 'active' ||
      callState.call.status === 'held' ||
      callState.call.status === 'connecting' ||
      callState.call.status === 'ringing')
  );

  const hasActiveVoiceCall = Boolean(
    callState.call &&
    (callState.call.status === 'active' ||
      callState.call.status === 'connecting' ||
      callState.call.status === 'held' ||
      callState.call.status === 'disposition')
  );

  return {
    // Call
    call: callState.call,
    setCall: callState.setCall,
    receiveInbound: callState.receiveInbound,
    startOutbound: callState.startOutbound,
    answerCall: callState.answerCall,
    rejectCall: callState.rejectCall,
    hangupCall: callState.hangupCall,
    toggleMute: callState.toggleMute,
    toggleHold: callState.toggleHold,
    toggleRecording: callState.toggleRecording,
    submitDisposition: callState.submitDisposition,
    formatDuration: callState.formatDuration,

    // Dialer
    isDialerOpen: dialerState.isOpen,
    dialInput: dialerState.dialInput,
    setDialInput: dialerState.setDialInput,
    openDialer: dialerState.openDialer,
    closeDialer: dialerState.closeDialer,
    dialPadKeyPress: dialerState.dialPadKeyPress,
    backspaceInput: dialerState.backspaceInput,
    clearDialInput: dialerState.clearDialInput,
    setDialTarget: dialerState.setDialTarget,

    // Queue
    queue: queueState.queue,
    dequeueCall: queueState.dequeueCall,
    simulateInboundQueuedCall: queueState.simulateInboundQueuedCall,

    // Supervisor
    supervisorMode: supervisorState.mode,
    whisperHint: supervisorState.whisperHint,
    silentMonitor: supervisorState.silentMonitor,
    whisperCoach: supervisorState.whisperCoach,
    bargeIn: supervisorState.bargeIn,
    stopMonitoring: supervisorState.stopMonitoring,

    // History + parked
    callHistory,
    addCallToHistory,
    parkedHeldCall,
    setParkedHeldCall,

    // Derived flags
    hasConflictingActiveCall,
    hasActiveVoiceCall,
  };
}
