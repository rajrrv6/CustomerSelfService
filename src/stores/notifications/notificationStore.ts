'use client';

import { create } from 'zustand';
import { SystemAlert, FilterOptions, NotificationCategory, NotificationSourceType, AlertLifecycleState } from './notificationTypes';
import type { AuditLog } from '@/types';
import { mockAuditLogs } from '@/data/mockData';

interface NotificationState {
  // Alert state
  alerts: SystemAlert[];
  filters: FilterOptions;
  mutedAlertCodes: string[];

  // Audit Logs (backward compatibility)
  auditLogs: AuditLog[];

  // Actions - System Alerts
  addAlert: (
    alert: Omit<SystemAlert, 'id' | 'timestamp' | 'read' | 'pinned' | 'acknowledged' | 'dismissed' | 'lifecycleState' | 'count' | 'lastOccurred'> & {
      autoDismiss?: boolean;
      duration?: number;
    }
  ) => void;
  dismissToast: (id: string) => void;
  acknowledgeAlert: (id: string) => void;
  resolveAlert: (id: string) => void;
  muteAlertCode: (alertCode: string) => void;
  unmuteAlertCode: (alertCode: string) => void;
  muteAllAlertCodes: () => void;
  acknowledgeAll: () => void;
  togglePinAlert: (id: string) => void;
  clearResolvedAlerts: () => void;
  setFilters: (filters: Partial<FilterOptions>) => void;
  resetFilters: () => void;

  // Actions - Audit Logs
  addAuditLog: (action: string, status?: 'success' | 'failed', roleOverride?: string) => void;
}

const AUDIT_USER = 'active.user@mpaas.com';
const AUDIT_IP = '192.168.10.150';

const initialFilters: FilterOptions = {
  category: 'all',
  source: 'all',
  severity: 'all',
  unreadOnly: false,
};

// Initial Seed Alerts matching the updated schema
const seedAlerts: SystemAlert[] = [
  {
    id: 'alert-sla-breach',
    timestamp: '2026-06-01 21:45:10',
    lastOccurred: '2026-06-01 21:45:10',
    category: 'sla',
    source: 'SLA',
    severity: 'critical',
    alertCode: 'SLA_BREACH',
    sourceEntity: 'Billing Escalation Queue',
    title: 'Billing Queue SLA Breach',
    message: 'Average wait time in Billing Escalation Queue exceeded the 15m maximum policy threshold.',
    read: false,
    pinned: true,
    lifecycleState: 'active',
    dismissed: false, // Show in toast stack since it is critical and pinned
    count: 1,
    metadata: {
      queueName: 'Billing Escalation Queue',
      slaThreshold: '15m',
      waitTime: '18m 42s',
      sourceSystem: 'SIEM SLA Monitor',
    },
    actions: [
      { label: 'View Queue', actionType: 'navigate', payload: { screenId: 'live_queues' } },
      { label: 'Acknowledge', actionType: 'acknowledge' }
    ]
  },
  {
    id: 'alert-webhook-latency',
    timestamp: '2026-06-01 22:05:32',
    lastOccurred: '2026-06-01 22:05:32',
    category: 'webhook',
    source: 'omnichannel',
    severity: 'warning',
    alertCode: 'WEBHOOK_LATENCY',
    sourceEntity: 'https://graph.facebook.com/v19.0/messages',
    title: 'WhatsApp Webhook Latency Spiked',
    message: 'Response times from Meta Graph API endpoints averaged 1450ms, exceeding the 1200ms tolerance bound.',
    read: false,
    pinned: false,
    lifecycleState: 'active',
    dismissed: true, // Dismissed visually from toast but in history
    count: 1,
    metadata: {
      apiEndpoint: 'https://graph.facebook.com/v19.0/messages',
      waitTime: '1450ms',
      webhookUrl: '/api/v1/webhooks/whatsapp',
      sourceSystem: 'Twilio Connector',
    },
    actions: [
      { label: 'Retry Ping', actionType: 'retry', payload: { endpoint: 'whatsapp' } },
      { label: 'View Routing', actionType: 'navigate', payload: { screenId: 'channels' } }
    ]
  },
  {
    id: 'alert-nlu-confidence',
    timestamp: '2026-06-01 22:10:14',
    lastOccurred: '2026-06-01 22:10:14',
    category: 'ai',
    source: 'AI-training',
    severity: 'warning',
    alertCode: 'NLU_CONFIDENCE_DROP',
    sourceEntity: 'Farah AI Engine',
    title: 'NLU Model Confidence Degradation',
    message: 'Speech intent confidence dropped below the 0.70 threshold on active training query sets.',
    read: false,
    pinned: false,
    lifecycleState: 'active',
    dismissed: true,
    count: 1,
    metadata: {
      confidenceScore: 0.54,
      sourceSystem: 'Farah AI Engine',
    },
    actions: [
      { label: 'Tune Intent', actionType: 'navigate', payload: { screenId: 'training' } }
    ]
  },
  {
    id: 'alert-vector-indexing',
    timestamp: '2026-06-01 22:15:22',
    lastOccurred: '2026-06-01 22:15:22',
    category: 'sync',
    source: 'integrations',
    severity: 'critical',
    alertCode: 'VECTOR_COMPACT_FAIL',
    sourceEntity: 'Pinecone Vector DB',
    title: 'Pinecone Indexing Compact Failure',
    message: 'Vector compact index partition rebalance failed due to database shard locks.',
    read: false,
    pinned: true,
    lifecycleState: 'active',
    dismissed: false, // Critical auto-pins and shows in toast
    count: 1,
    metadata: {
      sourceSystem: 'Pinecone Vector DB Broker',
    },
    actions: [
      { label: 'Retry compacting', actionType: 'retry', payload: { dbPartition: 'pinecone-compact' } }
    ]
  },
  {
    id: 'alert-staffing',
    timestamp: '2026-06-01 22:18:45',
    lastOccurred: '2026-06-01 22:18:45',
    category: 'routing',
    source: 'routing',
    severity: 'warning',
    alertCode: 'STAFFING_SHORTAGE',
    sourceEntity: 'Arabic Language Queue',
    title: 'Arabic Queue Staffing Critical',
    message: 'Specialist roster coverage fell below the minimum compliance threshold of 2 active agents.',
    read: false,
    pinned: false,
    lifecycleState: 'active',
    dismissed: true,
    count: 1,
    metadata: {
      queueName: 'Arabic Language Queue',
      sourceSystem: 'Workforce Planner',
    },
    actions: [
      { label: 'View Roster', actionType: 'navigate', payload: { screenId: 'agent_presence' } }
    ]
  },
  {
    id: 'alert-compliance-masking',
    timestamp: '2026-06-01 21:30:00',
    lastOccurred: '2026-06-01 21:30:00',
    category: 'compliance',
    source: 'guardrails',
    severity: 'info',
    alertCode: 'PII_MASKED',
    sourceEntity: 'Safety Guardrails Scanner',
    title: 'PII Masking Audit Scan',
    message: 'Strict policy regex masked 16 credit card digits from incoming WhatsApp transaction text.',
    read: true,
    pinned: false,
    lifecycleState: 'acknowledged',
    dismissed: true,
    count: 1,
    metadata: {
      sourceSystem: 'Safety Guardrails',
    },
    actions: [
      { label: 'View Guardrails', actionType: 'navigate', payload: { screenId: 'guardrails' } }
    ]
  },
  {
    id: 'alert-analytics-deflection',
    timestamp: '2026-06-01 21:00:00',
    lastOccurred: '2026-06-01 21:00:00',
    category: 'analytics',
    source: 'analytics',
    severity: 'success',
    alertCode: 'DEFLECTION_TARGET_MET',
    sourceEntity: 'Portal Deflection',
    title: 'Portal Deflection Target Met',
    message: 'Deflection rate spiked to 74.2%, passing the sprint operations benchmark of 70.0%.',
    read: true,
    pinned: false,
    lifecycleState: 'resolved',
    dismissed: true,
    count: 1,
    metadata: {
      sourceSystem: 'Analytics Engine',
    },
    actions: [
      { label: 'View Analytics', actionType: 'navigate', payload: { screenId: 'analytics_center' } }
    ]
  }
];

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  alerts: seedAlerts,
  filters: initialFilters,
  mutedAlertCodes: [],
  auditLogs: mockAuditLogs,

  addAlert: (alert) => {
    const { alerts, mutedAlertCodes } = get();
    
    // If the alert code is muted, suppress the toast popup but STILL log in history/timeline.
    // The muted state means we create the alert in a muted/suppressed lifecycleState, and dismissed = true.
    const isMuted = mutedAlertCodes.includes(alert.alertCode);
    const initialLifecycle: AlertLifecycleState = isMuted ? 'muted' : 'active';
    const isDismissed = isMuted;

    // Deduplication logic: match active alerts with same category, severity, sourceEntity, and alertCode
    const existingIndex = alerts.findIndex(
      (a) =>
        a.lifecycleState !== 'resolved' &&
        a.category === alert.category &&
        a.severity === alert.severity &&
        a.sourceEntity === alert.sourceEntity &&
        a.alertCode === alert.alertCode
    );

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    if (existingIndex > -1) {
      // Duplicate alert found. Increment counter and update lastOccurred.
      const updatedAlerts = [...alerts];
      const prev = updatedAlerts[existingIndex];
      
      const newCount = prev.count + 1;
      
      updatedAlerts[existingIndex] = {
        ...prev,
        message: alert.message, // update message dynamically
        title: alert.title,
        metadata: { ...prev.metadata, ...alert.metadata },
        actions: alert.actions || prev.actions,
        count: newCount,
        lastOccurred: nowStr,
        read: false,
        pinned: alert.severity === 'critical' ? true : prev.pinned,
        dismissed: isDismissed ? true : false, // Bring it back to toast if not muted
        lifecycleState: isMuted ? 'muted' : prev.lifecycleState === 'acknowledged' ? 'active' : prev.lifecycleState // reactivate if it was acknowledged but has new occurrences
      };

      // Put the updated alert at the top of the stack
      const [moved] = updatedAlerts.splice(existingIndex, 1);
      set({ alerts: [moved, ...updatedAlerts] });

      // Audit log the repetition
      get().addAuditLog(`Operational Alert [${alert.alertCode}] repeated (Count: ${newCount}) for entity [${alert.sourceEntity}]`, 'success');

      // Setup automatic dismiss timer for non-critical alerts
      if (!isMuted && alert.severity !== 'critical') {
        const autoDismiss = alert.autoDismiss ?? true;
        
        let duration = alert.duration ?? 5000;
        if (alert.severity === 'info') duration = 4000;
        else if (alert.severity === 'success') duration = 5000;
        else if (alert.severity === 'warning') duration = 8000;

        if (autoDismiss) {
          setTimeout(() => {
            // Verify it hasn't occurred again since this timer started
            const currentAlert = get().alerts.find((a) => a.id === moved.id);
            if (currentAlert && currentAlert.lastOccurred === nowStr) {
              get().dismissToast(moved.id);
            }
          }, duration);
        }
      }
    } else {
      // New unique alert
      const id = `alert-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const isCritical = alert.severity === 'critical';

      const newAlert: SystemAlert = {
        ...alert,
        id,
        timestamp: nowStr,
        lastOccurred: nowStr,
        read: false,
        pinned: isCritical, // auto-pin criticals
        lifecycleState: initialLifecycle,
        dismissed: isDismissed ? true : false,
        count: 1,
      };

      set((state) => ({
        alerts: [newAlert, ...state.alerts]
      }));

      get().addAuditLog(`Created Operational Alert [${alert.alertCode}] from source [${alert.source}]`, 'success');

      // Setup automatic dismiss timer for non-critical alerts
      if (!isMuted && alert.severity !== 'critical') {
        const autoDismiss = alert.autoDismiss ?? true;

        let duration = alert.duration ?? 5000;
        if (alert.severity === 'info') duration = 4000;
        else if (alert.severity === 'success') duration = 5000;
        else if (alert.severity === 'warning') duration = 8000;

        if (autoDismiss) {
          setTimeout(() => {
            const currentAlert = get().alerts.find((a) => a.id === id);
            if (currentAlert && currentAlert.lastOccurred === nowStr) {
              get().dismissToast(id);
            }
          }, duration);
        }
      }
    }
  },

  dismissToast: (id) => {
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, dismissed: true } : a))
    }));
  },

  acknowledgeAlert: (id) => {
    const alert = get().alerts.find((a) => a.id === id);
    if (!alert) return;

    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === id ? { ...a, read: true, lifecycleState: 'acknowledged', dismissed: true } : a
      )
    }));

    get().addAuditLog(`Operational Alert [${alert.alertCode}] acknowledged.`, 'success');
  },

  resolveAlert: (id) => {
    const alert = get().alerts.find((a) => a.id === id);
    if (!alert) return;

    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === id ? { ...a, read: true, lifecycleState: 'resolved', dismissed: true, pinned: false } : a
      )
    }));

    get().addAuditLog(`Operational Alert [${alert.alertCode}] marked as resolved. Auto-collapsed into history.`, 'success');
  },

  muteAlertCode: (alertCode) => {
    set((state) => ({
      mutedAlertCodes: [...state.mutedAlertCodes, alertCode],
      // Transition all active/acknowledged alerts of this code to 'muted'
      alerts: state.alerts.map((a) =>
        a.alertCode === alertCode && a.lifecycleState !== 'resolved'
          ? { ...a, lifecycleState: 'muted', dismissed: true }
          : a
      )
    }));

    get().addAuditLog(`Alert category [${alertCode}] muted. Future toasts suppressed.`, 'success');
  },

  unmuteAlertCode: (alertCode) => {
    set((state) => ({
      mutedAlertCodes: state.mutedAlertCodes.filter((c) => c !== alertCode),
      alerts: state.alerts.map((a) =>
        a.alertCode === alertCode && a.lifecycleState === 'muted'
          ? { ...a, lifecycleState: 'active', dismissed: false }
          : a
      )
    }));

    get().addAuditLog(`Alert category [${alertCode}] unmuted. Toasts restored.`, 'success');
  },

  muteAllAlertCodes: () => {
    const codes = Array.from(new Set(get().alerts.map((a) => a.alertCode)));
    set((state) => ({
      mutedAlertCodes: codes,
      alerts: state.alerts.map((a) =>
        a.lifecycleState !== 'resolved' ? { ...a, lifecycleState: 'muted', dismissed: true } : a
      )
    }));
    get().addAuditLog(`All alert types muted. Toasts suppressed.`, 'success');
  },

  acknowledgeAll: () => {
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.lifecycleState !== 'resolved'
          ? { ...a, read: true, lifecycleState: 'acknowledged', dismissed: true }
          : a
      )
    }));

    get().addAuditLog(`All operational alerts acknowledged.`, 'success');
  },

  togglePinAlert: (id) => {
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, pinned: !a.pinned } : a))
    }));
  },

  clearResolvedAlerts: () => {
    set((state) => ({
      alerts: state.alerts.filter((a) => a.lifecycleState !== 'resolved' || a.pinned)
    }));
    get().addAuditLog(`Cleared resolved alerts history.`, 'success');
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters }
    }));
  },

  resetFilters: () => {
    set({ filters: initialFilters });
  },

  // Audit Logs (backward compatibility implementation)
  addAuditLog: (action, status = 'success', roleOverride) => {
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
