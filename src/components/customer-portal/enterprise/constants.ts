import { Organization, ActiveSession, SsoProvider, QuotaMetric, AuditRecord } from './types';

export const MOCK_ORGANIZATIONS: Organization[] = [
  {
    name: 'Acme Corp Production',
    tenantId: 'tnt-acme-prod-8812',
    environment: 'Production',
    role: 'Administrator',
    region: 'us-east-1 (N. Virginia)',
    slaTier: 'Platinum Enterprise',
  },
  {
    name: 'Acme Corp Staging',
    tenantId: 'tnt-acme-stage-9921',
    environment: 'Staging',
    role: 'Developer',
    region: 'us-east-1 (N. Virginia)',
    slaTier: 'Gold Premier',
  },
  {
    name: 'Acme Corp Sandbox',
    tenantId: 'tnt-acme-dev-1102',
    environment: 'Development',
    role: 'Developer',
    region: 'us-west-2 (Oregon)',
    slaTier: 'Silver Standard',
  },
  {
    name: 'Globex Corp Sandbox',
    tenantId: 'tnt-globex-dev-3344',
    environment: 'Development',
    role: 'Read-Only',
    region: 'eu-central-1 (Frankfurt)',
    slaTier: 'Silver Standard',
  },
];

export const MOCK_SESSIONS: ActiveSession[] = [
  {
    id: 'sess-001',
    device: 'MacBook Pro 16"',
    browser: 'Chrome 125.0',
    location: 'Riyadh, Saudi Arabia',
    ip: '82.165.12.90',
    lastActive: 'Just now',
    current: true,
  },
  {
    id: 'sess-002',
    device: 'iPhone 15 Pro Max',
    browser: 'Mobile Safari 17.2',
    location: 'Dubai, UAE',
    ip: '194.254.102.1',
    lastActive: '3 minutes ago',
    current: false,
  },
  {
    id: 'sess-003',
    device: 'Windows Desktop PC',
    browser: 'Firefox 126.0',
    location: 'London, UK',
    ip: '91.80.220.45',
    lastActive: '2 hours ago',
    current: false,
  },
];

export const MOCK_SSO_PROVIDERS: SsoProvider[] = [
  {
    name: 'Okta Enterprise IdP',
    status: 'active',
    lastSync: new Date(Date.now() - 5 * 60000).toISOString(), // 5 mins ago
    successRate: 99.98,
    certExpiry: new Date(Date.now() + 25 * 24 * 3600000).toISOString(), // 25 days warning
    latencyMs: 42,
  },
  {
    name: 'Azure AD (Entra ID)',
    status: 'active',
    lastSync: new Date(Date.now() - 12 * 60000).toISOString(), // 12 mins ago
    successRate: 99.85,
    certExpiry: new Date(Date.now() + 5 * 24 * 3600000).toISOString(), // 5 days critical
    latencyMs: 68,
  },
  {
    name: 'Ping Identity Federation',
    status: 'degraded',
    lastSync: new Date(Date.now() - 60 * 60000).toISOString(), // 1 hr ago
    successRate: 92.4,
    certExpiry: new Date(Date.now() - 2 * 24 * 3600000).toISOString(), // -2 days expired
    latencyMs: 410,
  },
];

export const MOCK_QUOTA_METRICS: QuotaMetric[] = [
  {
    name: 'API Calls (Monthly)',
    limit: 10000,
    used: 9650,
    unit: 'requests',
    status: 'critical',
  },
  {
    name: 'Concurrent AI Tasks',
    limit: 50,
    used: 42,
    unit: 'tasks',
    status: 'warning',
  },
  {
    name: 'Knowledge Index Storage',
    limit: 1024,
    used: 720,
    unit: 'MB',
    status: 'normal',
  },
  {
    name: 'SaaS User Seats',
    limit: 100,
    used: 85,
    unit: 'users',
    status: 'warning',
  },
  {
    name: 'Daily Compliance Exports',
    limit: 10,
    used: 2,
    unit: 'exports',
    status: 'normal',
  },
];

// Helper to generate static list of 100+ audit log items
export function generateMockAuditLogs(): AuditRecord[] {
  const actions = [
    { action: 'User login initiated', module: 'Auth', severity: 'info' },
    { action: 'API Token generated', module: 'Access Keys', severity: 'warning' },
    { action: 'Webhook endpoint updated', module: 'Integrations', severity: 'info' },
    { action: 'Compliance data export requested', module: 'Compliance', severity: 'warning' },
    { action: 'SLA priority ticket submitted', module: 'Support Tickets', severity: 'info' },
    { action: 'SSO configuration updated', module: 'Federation', severity: 'critical' },
    { action: 'Active user session terminated', module: 'Session Mgmt', severity: 'warning' },
    { action: 'MFA requirement enforced', module: 'Security Policies', severity: 'critical' },
    { action: 'Knowledge base article edited', module: 'KB Admin', severity: 'info' },
    { action: 'Organization billing updated', module: 'Billing', severity: 'info' },
  ] as const;

  const actors = [
    'david.miller@yahoo.com',
    'admin.supervisor@acme.com',
    'security.scanner@acme.com',
    'system-daemon',
    'support.nadia@converiqo.ai',
  ];

  const ips = ['82.165.12.90', '194.254.102.1', '91.80.220.45', '127.0.0.1', '10.0.4.155'];
  const locations = ['Riyadh, SA', 'Dubai, AE', 'London, UK', 'Internal Network', 'San Jose, US'];
  const browsers = [
    'Chrome 125.0 / macOS',
    'Safari 17.2 / iOS',
    'Firefox 126.0 / Windows',
    'Axios Client / Linux',
    'Edge 124.0 / Windows',
  ];

  const logs: AuditRecord[] = [];
  const baseTime = Date.now();

  for (let i = 0; i < 110; i++) {
    const actIdx = i % actions.length;
    const actorIdx = (i * 3) % actors.length;
    const ipIdx = (i * 7) % ips.length;
    const selectedAction = actions[actIdx];

    // Build unique differences for critical operations
    let diff: AuditRecord['diff'] = undefined;
    if (selectedAction.severity === 'critical') {
      diff = {
        before: { mfaEnabled: false, syncIntervalMinutes: 60 },
        after: { mfaEnabled: true, syncIntervalMinutes: 15 },
      };
    } else if (selectedAction.severity === 'warning') {
      diff = {
        before: { allowedIpRanges: ['82.165.12.0/24'] },
        after: { allowedIpRanges: ['82.165.12.0/24', '194.254.102.0/24'] },
      };
    }

    logs.push({
      id: `aud-log-${1000 + i}`,
      timestamp: new Date(baseTime - i * 25 * 60000).toISOString(), // spaced out by ~25 mins
      actor: actors[actorIdx],
      ip: ips[ipIdx],
      userAgent: browsers[ipIdx],
      action: selectedAction.action,
      module: selectedAction.module,
      severity: selectedAction.severity,
      details: `Execution of ${selectedAction.action} in ${selectedAction.module} was recorded.`,
      region: locations[ipIdx],
      sessionId: `sess-act-tok-${20000 + i}`,
      diff,
    });
  }

  return logs;
}
export const INITIAL_AUDIT_LOGS = generateMockAuditLogs();
