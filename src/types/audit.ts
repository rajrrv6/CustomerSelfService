export type AuditEventSeverity = 'low' | 'medium' | 'high' | 'critical';

export type AuditEventStatus = 'open' | 'reviewed' | 'escalated' | 'archived';

export type ComplianceState = 'compliant' | 'warning' | 'violated' | 'disabled';

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  actionType: string;
  targetResource: string;
  severity: AuditEventSeverity;
  tenantId: string;
  tenantName: string;
  status: AuditEventStatus;
  details: string;
  ipAddress: string;
  complianceImpact?: string;
}

export interface CompliancePolicy {
  id: string;
  name: string;
  category: string;
  status: 'enabled' | 'disabled' | 'archived';
  lastUpdated: string;
  assignedScope: string;
  complianceState: ComplianceState;
  description: string;
}
