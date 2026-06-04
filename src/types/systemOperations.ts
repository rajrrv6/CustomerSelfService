export type ServiceStatus = 'healthy' | 'degraded' | 'offline' | 'unknown';
export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';
export type ExceptionSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ExceptionStatus = 'active' | 'resolved';
export type MigrationStatus = 'success' | 'failed' | 'rolled_back';

export interface SystemService {
  id: string;
  name: string;
  status: ServiceStatus;
  uptime: number; // percentage e.g., 99.98
  latencyMs: number;
  region: string;
}

export interface OperationalJob {
  id: string;
  name: string;
  queueName: string;
  triggeredBy: string;
  durationSec: number;
  retries: number;
  status: JobStatus;
  errorDetail?: string;
  timestamp: string;
}

export interface SystemException {
  id: string;
  exceptionType: string;
  serviceName: string;
  message: string;
  severity: ExceptionSeverity;
  timestamp: string;
  status: ExceptionStatus;
}

export interface MigrationRecord {
  id: string;
  version: string;
  description: string;
  executedAt: string;
  durationMs: number;
  rollbackVersion?: string;
  status: MigrationStatus;
}
