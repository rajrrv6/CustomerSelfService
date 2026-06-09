import { describe, it, expect } from 'vitest';
import { filterAlertsForUser } from '@/stores/notifications/notificationSelectors';
import { SystemAlert } from '@/stores/notifications/notificationTypes';

describe('Notifications RBAC & Persona Filtering Logic', () => {
  const mockAlerts: SystemAlert[] = [
    {
      id: 'alert-1',
      timestamp: '2026-06-01 21:00:00',
      lastOccurred: '2026-06-01 21:00:00',
      category: 'sla',
      source: 'SLA',
      severity: 'critical',
      alertCode: 'SLA_BREACH',
      sourceEntity: 'Billing Queue',
      title: 'Billing Queue SLA Breach',
      message: 'SLA Breach occurred',
      read: false,
      pinned: false,
      lifecycleState: 'active',
      dismissed: false,
      count: 1,
      allowedRoles: ['SUPER_ADMIN', 'CLIENT_ADMIN', 'SUPERVISOR'],
      allowedModules: ['billing', 'operations']
    },
    {
      id: 'alert-2',
      timestamp: '2026-06-01 21:00:00',
      lastOccurred: '2026-06-01 21:00:00',
      category: 'sync',
      source: 'integrations',
      severity: 'critical',
      alertCode: 'VECTOR_COMPACT_FAIL',
      sourceEntity: 'Pinecone',
      title: 'Pinecone failure',
      message: 'Compaction failure',
      read: false,
      pinned: false,
      lifecycleState: 'active',
      dismissed: false,
      count: 1,
      allowedRoles: ['SUPER_ADMIN', 'AI_ADMIN', 'INFRA_ADMIN'],
      allowedModules: ['ai-copilot', 'infrastructure', 'integrations']
    },
    {
      id: 'alert-3',
      timestamp: '2026-06-01 21:00:00',
      lastOccurred: '2026-06-01 21:00:00',
      category: 'sla',
      source: 'SLA',
      severity: 'warning',
      alertCode: 'SLA_WARN',
      sourceEntity: 'Standard Queue',
      title: 'Queue Warning',
      message: 'Queue Warning occurred',
      read: false,
      pinned: false,
      lifecycleState: 'active',
      dismissed: false,
      count: 1,
    }
  ];

  it('allows Super Admin to see all alerts', () => {
    const result = filterAlertsForUser(mockAlerts, 'super_admin');
    expect(result.map(r => r.id)).toContain('alert-1');
    expect(result.map(r => r.id)).toContain('alert-2');
    expect(result.map(r => r.id)).toContain('alert-3');
  });

  it('allows Client Admin to see billing SLA breach but not Pinecone failure', () => {
    const result = filterAlertsForUser(mockAlerts, 'client_admin');
    expect(result.map(r => r.id)).toContain('alert-1');
    expect(result.map(r => r.id)).not.toContain('alert-2');
    expect(result.map(r => r.id)).toContain('alert-3');
  });

  it('blocks End User (customer) from seeing system/infrastructure/billing alerts', () => {
    const result = filterAlertsForUser(mockAlerts, 'customer');
    expect(result).toHaveLength(0); // Should not see any of these alerts
  });

  it('allows Support Agent to see operational alerts (SLA warn fallback) but blocks tech alerts (Pinecone/Billing SLA)', () => {
    const result = filterAlertsForUser(mockAlerts, 'support_agent');
    // alert-3 has category 'sla' and no allowedRoles, so it falls back to visible for agent
    expect(result.map(r => r.id)).toContain('alert-3');
    // alert-1 specifies allowedRoles which support_agent is not part of, so it is hidden
    expect(result.map(r => r.id)).not.toContain('alert-1');
    // alert-2 specifies allowedRoles which support_agent is not part of, so it is hidden
    expect(result.map(r => r.id)).not.toContain('alert-2');
  });
});
