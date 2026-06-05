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

  // Clean intervals
  const clearTimers = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    if (qualityIntervalRef.current) {
      clearInterval(qualityIntervalRef.current);
      qualityIntervalRef.current = null;
    }
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

  // Tick duration when active
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
      if (durationIntervalRef.current && (!call || call.status !== 'active')) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    };
  }, [call?.status]);

  // Tick call quality fluctuation
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
      if (qualityIntervalRef.current && (!call || (call.status !== 'active' && call.status !== 'held'))) {
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

    // Simulate connection delay
    setTimeout(() => {
      setCall((prev) => {
        if (!prev || prev.status !== 'connecting') return prev;
        return {
          ...prev,
          status: 'active',
          timeline: [...prev.timeline, `[${new Date().toLocaleTimeString()}] Call answered. Audio stream established.`]
        };
      });
    }, 1800);
  }, [clearTimers]);

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

  // Reject / Decline Call
  const rejectCall = useCallback(() => {
    setCall((prev) => {
      if (!prev || prev.status !== 'ringing') return prev;
      
      const callSnapshot = { ...prev };
      // Defer side effect to the next tick to avoid render-phase state updates
      setTimeout(() => {
        onAddCallToHistory({
          id: `call-${Date.now()}`,
          phoneNumber: callSnapshot.phoneNumber,
          contactName: callSnapshot.contactName,
          direction: 'inbound',
          timestamp: 'Just now',
          duration: '00:00',
          status: 'missed'
        });
      }, 0);

      return {
        ...prev,
        status: 'disconnected',
        timeline: [...prev.timeline, `[${new Date().toLocaleTimeString()}] Call rejected by agent.`]
      };
    });
    
    // Clear back to idle after short delay
    setTimeout(() => {
      setCall(null);
    }, 1000);
  }, [onAddCallToHistory]);

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

  // Submit Disposition Codes
  const submitDisposition = useCallback((code: string, notes: string) => {
    setCall((prev) => {
      if (!prev) return null;
      
      const callSnapshot = { ...prev };
      // Defer side effect to the next tick to avoid render-phase state updates
      setTimeout(() => {
        onAddCallToHistory({
          id: `call-${Date.now()}`,
          phoneNumber: callSnapshot.phoneNumber,
          contactName: callSnapshot.contactName,
          direction: callSnapshot.direction,
          timestamp: 'Just now',
          duration: formatDuration(callSnapshot.duration),
          status: callSnapshot.duration > 0 ? 'completed' : 'missed',
          recordingUrl: callSnapshot.isRecording ? 'https://storage.googleapis.com/mpaas-recordings/sim.wav' : undefined,
          notes,
          disposition: code
        });
      }, 0);

      return null; // Go back to idle status
    });
  }, [onAddCallToHistory, formatDuration]);

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
