import { SystemService, OperationalJob, SystemException, MigrationRecord } from '@/types/systemOperations';

export const mockServices: SystemService[] = [
  { id: 'svc-gateway', name: 'API Router Gateway', status: 'healthy', uptime: 99.99, latencyMs: 14, region: 'me-central-1a' },
  { id: 'svc-inference', name: 'AI Inference Router', status: 'healthy', uptime: 99.95, latencyMs: 240, region: 'me-central-1b' },
  { id: 'svc-vector', name: 'Pinecone Vector Cluster', status: 'degraded', uptime: 99.90, latencyMs: 45, region: 'me-central-1a' },
  { id: 'svc-telephony', name: 'SIP Trunk Voice Server', status: 'healthy', uptime: 99.98, latencyMs: 8, region: 'me-central-1a' },
  { id: 'svc-jobs', name: 'Backlog Queue Processor', status: 'healthy', uptime: 99.97, latencyMs: 12, region: 'me-central-1b' }
];

export const mockJobs: OperationalJob[] = [
  {
    id: 'job-001',
    name: 'Platform Invoice Generation',
    queueName: 'billing-reports',
    triggeredBy: 'scheduler',
    durationSec: 145,
    retries: 0,
    status: 'completed',
    timestamp: '2026-06-04 08:00:00'
  },
  {
    id: 'job-002',
    name: 'LLM Model Sync (Claude/Gemini)',
    queueName: 'master-data-sync',
    triggeredBy: 'admin@converiq.ai',
    durationSec: 320,
    retries: 1,
    status: 'failed',
    errorDetail: 'Inference Provider API returned rate-limit exhaust timeout code 429.',
    timestamp: '2026-06-04 09:12:00'
  },
  {
    id: 'job-003',
    name: 'Vector Database Reindexing',
    queueName: 'infra-maintenance',
    triggeredBy: 'scheduler',
    durationSec: 1890,
    retries: 0,
    status: 'running',
    timestamp: '2026-06-04 10:30:00'
  },
  {
    id: 'job-004',
    name: 'SIP Voice Trunk Health Probe',
    queueName: 'telephony-monitoring',
    triggeredBy: 'system',
    durationSec: 12,
    retries: 0,
    status: 'completed',
    timestamp: '2026-06-04 10:45:00'
  },
  {
    id: 'job-005',
    name: 'Workspace Ingestion Archive',
    queueName: 'backlog-cleanup',
    triggeredBy: 'system',
    durationSec: 0,
    retries: 0,
    status: 'pending',
    timestamp: '2026-06-04 11:00:00'
  }
];

export const mockExceptions: SystemException[] = [
  {
    id: 'err-001',
    exceptionType: 'InferenceTimeoutException',
    serviceName: 'AI Inference Router',
    message: 'Anthropic Claude-3.5 gateway failed to return payload within 5000ms SLA limit.',
    severity: 'high',
    timestamp: '2026-06-04 10:14:02',
    status: 'active'
  },
  {
    id: 'err-002',
    exceptionType: 'DbConnectionExhausted',
    serviceName: 'API Router Gateway',
    message: 'Connection pool capacity limit 200 exceeded on primary database cluster.',
    severity: 'critical',
    timestamp: '2026-06-04 09:44:11',
    status: 'resolved'
  },
  {
    id: 'err-003',
    exceptionType: 'SIPCodecMismatch',
    serviceName: 'SIP Trunk Voice Server',
    message: 'Audio codec auto-negotiation failed for inbound trunk did_ksa_primary.',
    severity: 'medium',
    timestamp: '2026-06-03 16:22:15',
    status: 'active'
  },
  {
    id: 'err-004',
    exceptionType: 'WebhookDeliveryFailed',
    serviceName: 'Backlog Queue Processor',
    message: 'Failed to deliver customer refund callback event to endpoint: client-deltaretail.co.',
    severity: 'low',
    timestamp: '2026-06-03 12:05:44',
    status: 'resolved'
  }
];

export const mockMigrations: MigrationRecord[] = [
  {
    id: 'mig-001',
    version: '20260501_init',
    description: 'Bootstrap baseline system schema including rbac_permissions, users, and audit tables.',
    executedAt: '2026-05-01 10:14:00',
    durationMs: 450,
    status: 'success'
  },
  {
    id: 'mig-002',
    version: '20260515_did_pool',
    description: 'Add did_number_pool allocation table with primary indexes on status and active tenants.',
    executedAt: '2026-05-15 08:30:00',
    durationMs: 120,
    status: 'success'
  },
  {
    id: 'mig-003',
    version: '20260525_vector_ns',
    description: 'Expand namespace capacity size on vector index tables schema supporting Pinecone compactions.',
    executedAt: '2026-05-25 09:00:00',
    durationMs: 820,
    status: 'success'
  },
  {
    id: 'mig-004',
    version: '20260601_failed_idx',
    description: 'Add indexes to job_queue status to optimize backlog fetching query latencies.',
    executedAt: '2026-06-01 23:45:00',
    durationMs: 2200,
    rollbackVersion: '20260525_vector_ns',
    status: 'rolled_back'
  }
];
