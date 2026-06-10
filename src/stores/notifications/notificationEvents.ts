import { useNotificationStore } from './notificationStore';
import { NotificationCategory, NotificationSourceType, NotificationSeverity, NotificationAction } from './notificationTypes';

// Reusable payload creator helper to push alerts in a decoupled, future-proof manner
const dispatchAlert = (payload: {
  category: NotificationCategory;
  source: NotificationSourceType;
  severity: NotificationSeverity;
  alertCode: string;
  sourceEntity: string;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  actions?: NotificationAction[];
  
  // RBAC and Persona Metadata
  allowedRoles?: string[];
  allowedPersonas?: string[];
  allowedModules?: string[];
  allowedScreens?: string[];
  targetScreen?: string;
  targetModule?: string;
  tenantScope?: string;
  visibilityType?: string;
}) => {
  // Use store's imperative state fetching to fire alert from non-React environments
  useNotificationStore.getState().addAlert(payload);
};

// Event Dispatchers
export const triggerSlaBreach = (queueName: string, waitTime: string, threshold: string) => {
  dispatchAlert({
    category: 'sla',
    source: 'SLA',
    severity: 'critical',
    alertCode: 'SLA_BREACH',
    sourceEntity: queueName,
    title: `${queueName} SLA Breach`,
    message: `Average wait time in ${queueName} reached ${waitTime}, breaching the policy ceiling of ${threshold}.`,
    metadata: {
      queueName,
      slaThreshold: threshold,
      waitTime,
      sourceSystem: 'SIEM SLA Monitor',
    },
    actions: [
      { label: 'View Queue', actionType: 'navigate', payload: { screenId: 'live_queues' } },
      { label: 'Acknowledge', actionType: 'acknowledge' }
    ],
    allowedRoles: ['SUPER_ADMIN', 'CLIENT_ADMIN', 'SUPERVISOR', 'OPERATIONS_MANAGER'],
    allowedPersonas: ['ADMIN', 'SUPERVISOR', 'OPERATIONS'],
    allowedModules: ['billing', 'operations', 'sla'],
    targetScreen: 'live_queues',
    allowedScreens: ['live_queues'],
    targetModule: 'operations',
    tenantScope: 'global',
    visibilityType: 'global'
  });
};

export const triggerWebhookFailure = (endpoint: string, url: string, waitTime: string) => {
  dispatchAlert({
    category: 'webhook',
    source: 'omnichannel',
    severity: 'warning',
    alertCode: 'WEBHOOK_LATENCY',
    sourceEntity: url,
    title: `${endpoint} Webhook Latency Spiked`,
    message: `Webhook processing latency for ${endpoint} exceeded bounds at ${waitTime}.`,
    metadata: {
      apiEndpoint: endpoint,
      webhookUrl: url,
      waitTime,
      sourceSystem: 'Meta Graph Webhook Monitor',
    },
    actions: [
      { label: 'Retry Ping', actionType: 'retry', payload: { endpoint } },
      { label: 'View Routing', actionType: 'navigate', payload: { screenId: 'channels' } }
    ],
    allowedRoles: ['SUPER_ADMIN', 'CLIENT_ADMIN'],
    allowedPersonas: ['ADMIN'],
    allowedModules: ['bot', 'integrations'],
    targetScreen: 'channels',
    allowedScreens: ['channels'],
    targetModule: 'integrations',
    tenantScope: 'global',
    visibilityType: 'global'
  });
};

export const triggerAiDegradation = (confidenceScore: number, sourceSystem = 'Farah AI Engine') => {
  dispatchAlert({
    category: 'ai',
    source: 'AI-training',
    severity: 'warning',
    alertCode: 'NLU_CONFIDENCE_DROP',
    sourceEntity: sourceSystem,
    title: 'NLU Model Confidence Drop',
    message: `Intent matched confidence dropped to ${confidenceScore.toFixed(2)}, falling below the 0.70 threshold.`,
    metadata: {
      confidenceScore,
      sourceSystem,
    },
    actions: [
      { label: 'Tune Intent', actionType: 'navigate', payload: { screenId: 'training' } }
    ],
    allowedRoles: ['SUPER_ADMIN', 'CLIENT_ADMIN', 'SUPERVISOR'],
    allowedPersonas: ['ADMIN', 'SUPERVISOR'],
    allowedModules: ['bot', 'ai-copilot'],
    targetScreen: 'training',
    allowedScreens: ['training'],
    targetModule: 'bot',
    tenantScope: 'global',
    visibilityType: 'global'
  });
};

export const triggerVectorDBIndexFailure = (partition: string) => {
  dispatchAlert({
    category: 'sync',
    source: 'integrations',
    severity: 'critical',
    alertCode: 'VECTOR_COMPACT_FAIL',
    sourceEntity: partition,
    title: 'Vector Compaction Failure',
    message: `Pinecone vector partition compaction failed for [${partition}] due to shard resource lockouts.`,
    metadata: {
      dbPartition: partition,
      sourceSystem: 'Pinecone Cluster Orchestrator',
    },
    actions: [
      { label: 'Retry compacting', actionType: 'retry', payload: { dbPartition: partition } }
    ],
    allowedRoles: ['SUPER_ADMIN', 'CLIENT_ADMIN', 'AI_ADMIN', 'INFRA_ADMIN'],
    allowedPersonas: ['ADMIN'],
    allowedModules: ['ai-copilot', 'infrastructure', 'integrations'],
    targetScreen: 'vector_db',
    allowedScreens: ['vector_db'],
    targetModule: 'infrastructure',
    tenantScope: 'global',
    visibilityType: 'global'
  });
};

export const triggerDialogValidationError = (nodeId: string, message: string) => {
  dispatchAlert({
    category: 'operations',
    source: 'dialog-builder',
    severity: 'warning',
    alertCode: 'GRAPH_VALIDATION_ERROR',
    sourceEntity: nodeId,
    title: 'Graph Validation Failure',
    message: `Dialog graph contains structural flaws near Node ${nodeId}: ${message}`,
    metadata: {
      nodeId,
      sourceSystem: 'ReactFlow Validator',
    },
    actions: [
      { label: 'Inspect Node', actionType: 'navigate', payload: { screenId: 'dialog_flow', selectNode: nodeId } }
    ],
    allowedRoles: ['SUPER_ADMIN', 'CLIENT_ADMIN'],
    allowedPersonas: ['ADMIN'],
    allowedModules: ['bot'],
    targetScreen: 'dialog_flow',
    allowedScreens: ['dialog_flow'],
    targetModule: 'bot',
    tenantScope: 'global',
    visibilityType: 'global'
  });
};

export const triggerStaffingShortage = (queueName: string, activeCount: number, threshold = 2) => {
  dispatchAlert({
    category: 'routing',
    source: 'routing',
    severity: 'warning',
    alertCode: 'STAFFING_SHORTAGE',
    sourceEntity: queueName,
    title: `${queueName} Staffing Shortage`,
    message: `Roster coverage in ${queueName} fell to ${activeCount} active agents (compliance threshold is ${threshold}).`,
    metadata: {
      queueName,
      activeCount,
      minThreshold: threshold,
      sourceSystem: 'Workforce Scheduler',
    },
    actions: [
      { label: 'View Roster', actionType: 'navigate', payload: { screenId: 'agent_presence' } }
    ],
    allowedRoles: ['SUPER_ADMIN', 'CLIENT_ADMIN', 'SUPERVISOR', 'OPERATIONS_MANAGER'],
    allowedPersonas: ['ADMIN', 'SUPERVISOR', 'OPERATIONS'],
    allowedModules: ['workforce', 'operations'],
    targetScreen: 'agent_presence',
    allowedScreens: ['agent_presence'],
    targetModule: 'workforce',
    tenantScope: 'global',
    visibilityType: 'global'
  });
};

export const triggerSafetyIntercept = (phrase: string, policy = 'Strict PII Masking') => {
  dispatchAlert({
    category: 'compliance',
    source: 'guardrails',
    severity: 'info',
    alertCode: 'PII_MASKED',
    sourceEntity: 'Safety Guardrails Scanner',
    title: 'PII Masking Triggered',
    message: `Safety policy [${policy}] intercepted and masked potential sensitive token: "${phrase.substring(0, 3)}***".`,
    metadata: {
      policyName: policy,
      interceptedToken: phrase,
      sourceSystem: 'LlamaGuard Agent',
    },
    actions: [
      { label: 'View Guardrails', actionType: 'navigate', payload: { screenId: 'guardrails' } }
    ],
    allowedRoles: ['SUPER_ADMIN', 'CLIENT_ADMIN', 'SUPERVISOR'],
    allowedPersonas: ['ADMIN', 'SUPERVISOR'],
    allowedModules: ['bot', 'audit', 'compliance'],
    targetScreen: 'guardrails',
    allowedScreens: ['guardrails'],
    targetModule: 'bot',
    tenantScope: 'global',
    visibilityType: 'global'
  });
};

export const triggerQueueOverflow = (queueName: string, size: number) => {
  dispatchAlert({
    category: 'routing',
    source: 'routing',
    severity: 'warning',
    alertCode: 'QUEUE_OVERFLOW',
    sourceEntity: queueName,
    title: `Queue Volume Spike: ${queueName}`,
    message: `Queue [${queueName}] reached ${size} waiting conversations, exceeding target threshold.`,
    metadata: {
      queueName,
      queueSize: size,
      sourceSystem: 'Routing Dispatcher',
    },
    actions: [
      { label: 'Open Workspace', actionType: 'navigate', payload: { screenId: 'inbox' } }
    ],
    allowedRoles: ['SUPER_ADMIN', 'CLIENT_ADMIN', 'SUPERVISOR', 'OPERATIONS_MANAGER'],
    allowedPersonas: ['ADMIN', 'SUPERVISOR', 'OPERATIONS'],
    allowedModules: ['workforce', 'operations'],
    targetScreen: 'inbox',
    allowedScreens: ['inbox'],
    targetModule: 'workforce',
    tenantScope: 'global',
    visibilityType: 'global'
  });
};

export const triggerApiTimeout = (apiEndpoint: string, waitTime: string) => {
  dispatchAlert({
    category: 'operations',
    source: 'integrations',
    severity: 'critical',
    alertCode: 'API_TIMEOUT_ERROR',
    sourceEntity: apiEndpoint,
    title: 'External API Gateway Timeout',
    message: `Outbound gateway request to endpoint [${apiEndpoint}] timed out after ${waitTime}.`,
    metadata: {
      apiEndpoint,
      responseTime: waitTime,
      sourceSystem: 'Integration Middleware',
    },
    actions: [
      { label: 'Retry Endpoint', actionType: 'retry', payload: { apiEndpoint } }
    ],
    allowedRoles: ['SUPER_ADMIN', 'CLIENT_ADMIN'],
    allowedPersonas: ['ADMIN'],
    allowedModules: ['bot', 'integrations'],
    targetScreen: 'integrations',
    allowedScreens: ['integrations'],
    targetModule: 'integrations',
    tenantScope: 'global',
    visibilityType: 'global'
  });
};

export const triggerSyncCompleted = (sourceSystem: string, recordsSynced: number) => {
  dispatchAlert({
    category: 'sync',
    source: 'integrations',
    severity: 'success',
    alertCode: 'SYNC_COMPLETE',
    sourceEntity: sourceSystem,
    title: 'Database Synchronization Complete',
    message: `Successfully synchronized and indexed ${recordsSynced} customer record updates from Confluence.`,
    metadata: {
      sourceSystem,
      recordsSynced,
    },
    allowedRoles: ['SUPER_ADMIN', 'CLIENT_ADMIN'],
    allowedPersonas: ['ADMIN'],
    allowedModules: ['rag', 'sync'],
    tenantScope: 'global',
    visibilityType: 'global'
  });
};

export const triggerOmnichannelOutage = (provider: string, statusText: string) => {
  dispatchAlert({
    category: 'operations',
    source: 'omnichannel',
    severity: 'critical',
    alertCode: 'PROVIDER_OUTAGE',
    sourceEntity: provider,
    title: `${provider} Service Interruption`,
    message: `Critical communications channel warning: ${provider} reports connection drops (${statusText}).`,
    metadata: {
      provider,
      statusText,
      sourceSystem: 'Omnichannel Channel Manager',
    },
    actions: [
      { label: 'View Channels', actionType: 'navigate', payload: { screenId: 'channels' } }
    ],
    allowedRoles: ['SUPER_ADMIN', 'CLIENT_ADMIN'],
    allowedPersonas: ['ADMIN'],
    allowedModules: ['operations'],
    targetScreen: 'channels',
    allowedScreens: ['channels'],
    targetModule: 'operations',
    tenantScope: 'global',
    visibilityType: 'global'
  });
};

export const triggerEscalationOverload = (unresolvedCount: number) => {
  dispatchAlert({
    category: 'escalation',
    source: 'SLA',
    severity: 'critical',
    alertCode: 'ESCALATION_SPIKE',
    sourceEntity: 'VIP Escalation Queue',
    title: 'Escalation Volume Overload',
    message: `Operational Queue Warning: ${unresolvedCount} VIP escalation tickets are currently pending agent wrapup.`,
    metadata: {
      unresolvedCount,
      sourceSystem: 'SLA Broker',
    },
    actions: [
      { label: 'View Inbox', actionType: 'navigate', payload: { screenId: 'inbox' } }
    ],
    allowedRoles: ['SUPER_ADMIN', 'CLIENT_ADMIN', 'SUPERVISOR', 'OPERATIONS_MANAGER'],
    allowedPersonas: ['ADMIN', 'SUPERVISOR', 'OPERATIONS'],
    allowedModules: ['workforce', 'operations'],
    targetScreen: 'inbox',
    allowedScreens: ['inbox'],
    targetModule: 'workforce',
    tenantScope: 'global',
    visibilityType: 'global'
  });
};

export const triggerHallucinationRisk = (confidence: number, query: string) => {
  dispatchAlert({
    category: 'ai',
    source: 'AI-training',
    severity: 'warning',
    alertCode: 'HALLUCINATION_RISK',
    sourceEntity: 'RAG Knowledge Retriever',
    title: 'Hallucination Risk Detected',
    message: `RAG search engine flagged potential hallucination response for query: "${query.substring(0, 30)}..."`,
    metadata: {
      confidenceScore: confidence,
      originalQuery: query,
      sourceSystem: 'Farah AI Evaluator',
    },
    actions: [
      { label: 'Manage KB', actionType: 'navigate', payload: { screenId: 'knowledge_base' } }
    ],
    allowedRoles: ['SUPER_ADMIN', 'CLIENT_ADMIN', 'SUPERVISOR'],
    allowedPersonas: ['ADMIN', 'SUPERVISOR'],
    allowedModules: ['ai-copilot'],
    targetScreen: 'knowledge_base',
    allowedScreens: ['knowledge_base'],
    targetModule: 'ai-copilot',
    tenantScope: 'global',
    visibilityType: 'global'
  });
};

export const triggerIntentPublish = (intentName: string, version: string) => {
  dispatchAlert({
    category: 'operations',
    source: 'AI-training',
    severity: 'success',
    alertCode: 'INTENT_PUBLISH_SUCCESS',
    sourceEntity: intentName,
    title: 'NLU Intent Published',
    message: `Successfully registered and deployed training phrases for intent [${intentName}] on active model (${version}).`,
    metadata: {
      intentName,
      version,
      sourceSystem: 'Training Intelligence Loop',
    },
    allowedRoles: ['SUPER_ADMIN', 'CLIENT_ADMIN', 'SUPERVISOR'],
    allowedPersonas: ['ADMIN', 'SUPERVISOR'],
    allowedModules: ['bot'],
    tenantScope: 'global',
    visibilityType: 'global'
  });
};
