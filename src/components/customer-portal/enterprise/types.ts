export interface Organization {
  name: string;
  tenantId: string;
  environment: 'Production' | 'Staging' | 'Development';
  role: 'Administrator' | 'Developer' | 'Read-Only';
  region: string;
  slaTier: 'Platinum Enterprise' | 'Gold Premier' | 'Silver Standard';
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  actor: string;
  ip: string;
  userAgent: string;
  action: string;
  module: string;
  severity: 'info' | 'warning' | 'critical';
  details: string;
  region: string;
  sessionId: string;
  diff?: {
    before: Record<string, any>;
    after: Record<string, any>;
  };
}

export interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActive: string;
  current: boolean;
}

export interface ExportJob {
  id: string;
  module: string;
  format: 'CSV' | 'JSON' | 'PDF';
  progress: number; // 0 - 100
  status: 'queued' | 'processing' | 'completed' | 'failed';
  sizeBytes?: number;
  timestamp: string;
  error?: string;
}

export interface SsoProvider {
  name: string;
  status: 'active' | 'degraded' | 'inactive';
  lastSync: string;
  successRate: number; // percentage, e.g. 99.8
  certExpiry: string; // ISO String
  latencyMs: number;
}

export interface QuotaMetric {
  name: string;
  limit: number;
  used: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
}
