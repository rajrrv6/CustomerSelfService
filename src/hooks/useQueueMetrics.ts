'use client';

/**
 * useQueueMetrics — Extracts AUX timer and active conversation count logic.
 *
 * Before: this logic lived inline in AgentWorkspaceLayout (a 1,023-line file),
 * interleaved with voice telephony and conversation state.
 *
 * This hook owns:
 * - AUX status (online/busy/away/break)
 * - AUX timer tick (seconds counter)
 * - Active conversation count (derived from conversations list)
 *
 * All state here is ephemeral UI state local to the agent workspace session.
 * No Zustand — this is a clean extraction of existing useState + useEffect logic.
 */

import { useState, useEffect, useCallback } from 'react';
import type { Conversation } from '@/types';

export type AuxStatus = 'online' | 'busy' | 'away' | 'break';

interface UseQueueMetricsResult {
  auxStatus: AuxStatus;
  auxSeconds: number;
  setAuxStatus: (status: AuxStatus) => void;
  handleAuxStatusChange: (
    status: AuxStatus,
    onAuditLog?: (action: string, status?: 'success' | 'failed') => void
  ) => void;
  formatAuxTime: (sec: number) => string;
  activeConversationCount: (conversations: Conversation[]) => number;
}

export function useQueueMetrics(): UseQueueMetricsResult {
  const [auxStatus, setAuxStatusState] = useState<AuxStatus>('online');
  const [auxSeconds, setAuxSeconds] = useState(0);

  // AUX timer tick
  useEffect(() => {
    const interval = setInterval(() => {
      setAuxSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const setAuxStatus = useCallback((status: AuxStatus) => {
    setAuxStatusState(status);
    setAuxSeconds(0);
  }, []);

  const handleAuxStatusChange = useCallback(
    (
      status: AuxStatus,
      onAuditLog?: (action: string, status?: 'success' | 'failed') => void
    ) => {
      setAuxStatus(status);
      onAuditLog?.(`Agent Liam changed AUX status to ${status.toUpperCase()}`, 'success');
    },
    [setAuxStatus]
  );

  const formatAuxTime = useCallback((sec: number): string => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const activeConversationCount = useCallback(
    (conversations: Conversation[]): number =>
      conversations.filter((c) => c.status === 'active').length,
    []
  );

  return {
    auxStatus,
    auxSeconds,
    setAuxStatus,
    handleAuxStatusChange,
    formatAuxTime,
    activeConversationCount,
  };
}
