'use client';

/**
 * notificationsStore — Zustand store for the cross-feature audit log.
 *
 * Owns: auditLogs, addAuditLog
 *
 * `addAuditLog` is called by 15+ features across all portals (bot creation,
 * agent actions, knowledge ingestion, channel updates, etc.) and the audit
 * log view reads the entire array. This makes it genuine cross-feature shared
 * state — every feature writes, one dashboard reads.
 *
 * Keeping it in AppContext meant any audit log write re-rendered all ~40
 * AppContext consumers. Moving it here isolates re-renders to components
 * that actually subscribe to auditLogs.
 *
 * The addAuditLog action mirrors the existing AppContext implementation exactly
 * to preserve existing behavior.
 */

import { create } from 'zustand';
import type { AuditLog } from '@/types';
import { mockAuditLogs } from '@/data/mockData';

interface NotificationsState {
  auditLogs: AuditLog[];
  /**
   * Add a new audit log entry to the top of the list.
   * @param action - Human-readable action description
   * @param status - 'success' (default) or 'failed'
   * @param roleOverride - Optional role label to use in the log entry.
   *   Pass the current role from useAuthStore when calling from components.
   */
  addAuditLog: (action: string, status?: 'success' | 'failed', roleOverride?: string) => void;
}

const AUDIT_USER = 'active.user@mpaas.com';
const AUDIT_IP = '192.168.10.150';

export const useNotificationsStore = create<NotificationsState>()((set) => ({
  auditLogs: mockAuditLogs,

  addAuditLog: (action: string, status: 'success' | 'failed' = 'success', roleOverride?: string) => {
    const roleLabel = roleOverride ?? 'CLIENT ADMIN';

    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: AUDIT_USER,
      role: roleLabel,
      action,
      ipAddress: AUDIT_IP,
      status,
    };

    set((state) => ({ auditLogs: [newLog, ...state.auditLogs] }));
  },
}));
