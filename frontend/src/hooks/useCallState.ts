import { useState, useEffect, useCallback, useRef } from 'react';
import { CallHistoryItem } from '@/data/seed/callHistorySeed';

export type CallStatus = 'idle' | 'ringing' | 'connecting' | 'active' | 'held' | 'disconnected' | 'disposition';

export interface ActiveCall {
  phoneNumber: string;
  contactName: string;
  direction: 'inbound' | 'outbound';
  status: CallStatus;
  isMuted: boolean;
  isHeld: boolean;
  isRecording: boolean;
  duration: number; // in seconds
  quality: 'excellent' | 'good' | 'poor';
  latency: number; // in ms
  packetLoss: number; // in %
  timeline: string[]; // log of call events
}

export function useCallState(onAddCallToHistory: (call: CallHistoryItem) => void) {
  const [call, setCall] = useState<ActiveCall | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const qualityIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // Tracks the latest call value synchronously so callbacks can snapshot it without
  // listing it in their dependency arrays (avoids stale closures).
  const useCallStateRef = useRef<ActiveCall | null>(null);
  useEffect(() => {
    useCallStateRef.current = call;
  }, [call]);
  // Track all pending side-effect timeouts so they can be cleared on unmount
  const pendingTimeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  /** Register a timeout so clearTimers() can cancel it if the component unmounts */
  const registerTimeout = useCallback((fn: () => void, delay: number): ReturnType<typeof setTimeout> => {
    const id = setTimeout(() => {
      pendingTimeoutsRef.current.delete(id);
      fn();
    }, delay);
    pendingTimeoutsRef.current.add(id);
    return id;
  }, []);

  // Clean up all intervals and pending timeouts
  const clearTimers = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    if (qualityIntervalRef.current) {
      clearInterval(qualityIntervalRef.current);
      qualityIntervalRef.current = null;
    }
    // Cancel all pending side-effect timeouts
    pendingTimeoutsRef.current.forEach((id) => clearTimeout(id));
    pendingTimeoutsRef.current.clear();
  }, []);

  // Format helper
  const formatDuration = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }, []);

  // Update timeline
  const addTimelineEvent = useCallback((event: string) => {
    setCall((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        timeline: [...prev.timeline, `[${new Date().toLocaleTimeString()}] ${event}`]
      };
    });
  }, []);

  // Tick duration when active.
  // Cleanup unconditionally clears the interval; the interval body guards against non-active state.
  useEffect(() => {
    if (call?.status === 'active') {
      if (!durationIntervalRef.current) {
        durationIntervalRef.current = setInterval(() => {
          setCall((prev) => {
            if (!prev || prev.status !== 'active') return prev;
            return { ...prev, duration: prev.duration + 1 };
          });
        }, 1000);
      }
    } else {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    }
    return () => {
      // Always clear on cleanup regardless of call state to prevent timer leaks on unmount
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    };
  }, [call?.status]);

  // Tick call quality fluctuation.
  // Cleanup unconditionally clears the interval to prevent timer leaks on unmount.
  useEffect(() => {
    if (call?.status === 'active' || call?.status === 'held') {
      if (!qualityIntervalRef.current) {
        qualityIntervalRef.current = setInterval(() => {
          setCall((prev) => {
            if (!prev) return null;
            // Shifting latency randomly
            const latencyDelta = Math.floor(Math.random() * 40) - 20; // +/- 20ms
            const nextLatency = Math.max(15, Math.min(350, prev.latency + latencyDelta));
            const nextLoss = Math.max(0, Math.min(10, +(prev.packetLoss + (Math.random() * 0.6 - 0.3)).toFixed(1)));
            
            let nextQuality: ActiveCall['quality'] = 'excellent';
            if (nextLatency > 150 || nextLoss > 3) nextQuality = 'poor';
            else if (nextLatency > 80 || nextLoss > 1) nextQuality = 'good';

            return {
              ...prev,
              latency: nextLatency,
              packetLoss: nextLoss,
              quality: nextQuality
            };
          });
        }, 3000);
      }
    } else {
      if (qualityIntervalRef.current) {
        clearInterval(qualityIntervalRef.current);
        qualityIntervalRef.current = null;
      }
    }
    return () => {
      // Always clear on cleanup regardless of call state
      if (qualityIntervalRef.current) {
        clearInterval(qualityIntervalRef.current);
        qualityIntervalRef.current = null;
      }
    };
  }, [call?.status]);

  // Trigger Incoming
  const receiveInbound = useCallback((num: string, name: string) => {
    clearTimers();
    setCall({
      phoneNumber: num,
      contactName: name,
      direction: 'inbound',
      status: 'ringing',
      isMuted: false,
      isHeld: false,
      isRecording: false,
      duration: 0,
      quality: 'excellent',
      latency: 24,
      packetLoss: 0.1,
      timeline: [`[${new Date().toLocaleTimeString()}] Inbound call ringing...`]
    });
  }, [clearTimers]);

  // Trigger Outbound
  const startOutbound = useCallback((num: string, name: string = 'Unknown Destination') => {
    clearTimers();
    setCall({
      phoneNumber: num,
      contactName: name,
      direction: 'outbound',
      status: 'connecting',
      isMuted: false,
      isHeld: false,
      isRecording: false,
      duration: 0,
      quality: 'excellent',
      latency: 28,
      packetLoss: 0.0,
      timeline: [`[${new Date().toLocaleTimeString()}] Connecting SIP gateway path...`]
    });

    // Simulate connection delay — registered so it can be cancelled on unmount
    registerTimeout(() => {
      setCall((prev) => {
        if (!prev || prev.status !== 'connecting') return prev;
        return {
          ...prev,
          status: 'active',
          timeline: [...prev.timeline, `[${new Date().toLocaleTimeString()}] Call answered. Audio stream established.`]
        };
      });
    }, 1800);
  }, [clearTimers, registerTimeout]);

  // Answer Incoming Call
  const answerCall = useCallback(() => {
    setCall((prev) => {
      if (!prev || prev.status !== 'ringing') return prev;
      return {
        ...prev,
        status: 'active',
        timeline: [...prev.timeline, `[${new Date().toLocaleTimeString()}] Call answered. Audio stream established.`]
      };
    });
  }, []);

  // Reject / Decline Call.
  // Side effects (history log, clear-to-idle) are extracted from the state updater
  // and tracked via registerTimeout so they can be cancelled on unmount.
  const rejectCall = useCallback(() => {
    // Snapshot current call before state update
    const currentCall = useCallStateRef.current;
    if (!currentCall || currentCall.status !== 'ringing') return;

    setCall((prev) => {
      if (!prev || prev.status !== 'ringing') return prev;
      return {
        ...prev,
        status: 'disconnected',
        timeline: [...prev.timeline, `[${new Date().toLocaleTimeString()}] Call rejected by agent.`]
      };
    });

    // Log to history — registered so it is cancelled if component unmounts immediately
    registerTimeout(() => {
      onAddCallToHistory({
        id: `call-${Date.now()}`,
        phoneNumber: currentCall.phoneNumber,
        contactName: currentCall.contactName,
        direction: 'inbound',
        timestamp: 'Just now',
        duration: '00:00',
        status: 'missed'
      });
    }, 0);

    // Clear back to idle after short delay
    registerTimeout(() => {
      setCall(null);
    }, 1000);
  }, [onAddCallToHistory, registerTimeout]);

  // Hangup call
  const hangupCall = useCallback(() => {
    setCall((prev) => {
      if (!prev || (prev.status !== 'active' && prev.status !== 'held')) return prev;
      return {
        ...prev,
        status: 'disposition',
        timeline: [...prev.timeline, `[${new Date().toLocaleTimeString()}] Call disconnected. Session in wrap-up disposition mode.`]
      };
    });
    clearTimers();
  }, [clearTimers]);

  // Toggle Mute
  const toggleMute = useCallback(() => {
    setCall((prev) => {
      if (!prev) return null;
      const nextMuted = !prev.isMuted;
      return {
        ...prev,
        isMuted: nextMuted,
        timeline: [...prev.timeline, `[${new Date().toLocaleTimeString()}] Audio input ${nextMuted ? 'muted' : 'unmuted'}.`]
      };
    });
  }, []);

  // Toggle Hold
  const toggleHold = useCallback(() => {
    setCall((prev) => {
      if (!prev || (prev.status !== 'active' && prev.status !== 'held')) return null;
      const nextHeld = !prev.isHeld;
      const nextStatus = nextHeld ? 'held' : 'active';
      return {
        ...prev,
        isHeld: nextHeld,
        status: nextStatus as CallStatus,
        timeline: [...prev.timeline, `[${new Date().toLocaleTimeString()}] Call ${nextHeld ? 'placed on hold' : 'resumed'}.`]
      };
    });
  }, []);

  // Toggle Recording
  const toggleRecording = useCallback(() => {
    setCall((prev) => {
      if (!prev || prev.status !== 'active') return null;
      const nextRecording = !prev.isRecording;
      return {
        ...prev,
        isRecording: nextRecording,
        timeline: [...prev.timeline, `[${new Date().toLocaleTimeString()}] Call recording ${nextRecording ? 'started' : 'stopped'}.`]
      };
    });
  }, []);

  // Submit Disposition Codes.
  // Side effect (history log) is extracted from the state updater and registered
  // via registerTimeout so it can be cancelled cleanly on unmount.
  const submitDisposition = useCallback((code: string, notes: string) => {
    // Snapshot current call before state update
    const currentCall = useCallStateRef.current;
    if (!currentCall) return;

    setCall(() => null); // Go back to idle status

    // Defer side effect outside of state updater
    registerTimeout(() => {
      onAddCallToHistory({
        id: `call-${Date.now()}`,
        phoneNumber: currentCall.phoneNumber,
        contactName: currentCall.contactName,
        direction: currentCall.direction,
        timestamp: 'Just now',
        duration: formatDuration(currentCall.duration),
        status: currentCall.duration > 0 ? 'completed' : 'missed',
        recordingUrl: currentCall.isRecording ? 'https://storage.googleapis.com/mpaas-recordings/sim.wav' : undefined,
        notes,
        disposition: code
      });
    }, 0);
  }, [onAddCallToHistory, registerTimeout, formatDuration]);

  // Clean up on unmount
  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  return {
    call,
    setCall,
    formatDuration,
    receiveInbound,
    startOutbound,
    answerCall,
    rejectCall,
    hangupCall,
    toggleMute,
    toggleHold,
    toggleRecording,
    submitDisposition,
    addTimelineEvent
  };
}
