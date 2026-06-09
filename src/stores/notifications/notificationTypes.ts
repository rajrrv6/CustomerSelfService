export type NotificationSeverity = 'info' | 'success' | 'warning' | 'critical';

export type NotificationCategory =
  | 'operations'
  | 'ai'
  | 'routing'
  | 'webhook'
  | 'sla'
  | 'escalation'
  | 'sync'
  | 'compliance'
  | 'analytics';

export type NotificationSourceType =
  | 'operations'
  | 'dialog-builder'
  | 'AI-training'
  | 'guardrails'
  | 'omnichannel'
  | 'analytics'
  | 'voice'
  | 'integrations'
  | 'SLA'
  | 'routing';

export type AlertLifecycleState = 'active' | 'acknowledged' | 'resolved' | 'muted';

export interface NotificationAction {
  label: string;
  actionType: 'retry' | 'view_details' | 'acknowledge' | 'resolve' | 'navigate';
  payload?: Record<string, any>;
}

export interface SystemAlert {
  id: string;
  timestamp: string; // ISO string or formatted date of first occurrence
  lastOccurred: string; // ISO string of last occurrence
  category: NotificationCategory;
  source: NotificationSourceType;
  severity: NotificationSeverity;
  alertCode: string; // e.g. SLA_WARN, WEBHOOK_LATENCY
  sourceEntity: string; // e.g. queue name, API endpoint
  title: string;
  message: string;
  read: boolean;
  pinned: boolean;
  lifecycleState: AlertLifecycleState;
  dismissed: boolean; // Controls visual visibility in the Toast active stack
  count: number; // Number of times this alert has repeated
  metadata?: {
    queueName?: string;
    slaThreshold?: string;
    waitTime?: string;
    apiEndpoint?: string;
    confidenceScore?: number;
    webhookUrl?: string;
    sourceSystem?: string;
    [key: string]: any;
  };
  actions?: NotificationAction[];
  allowedRoles?: string[];
  allowedPersonas?: string[];
  allowedModules?: string[];
  tenantScope?: string;
  visibilityType?: string;
}

export interface FilterOptions {
  category: NotificationCategory | 'all';
  source: NotificationSourceType | 'all';
  severity: NotificationSeverity | 'all';
  unreadOnly: boolean;
}
