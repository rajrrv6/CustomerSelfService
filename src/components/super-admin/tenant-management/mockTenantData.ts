import { Tenant, TenantMetering, TenantFeatureFlag } from '@/types/tenant';

export const mockTenants: Tenant[] = [
  {
    id: 'tenant-acme',
    name: 'Acme Global Corp',
    domain: 'acme.com',
    currentPlanId: 'plan-growth',
    status: 'active',
    billingStatus: 'active',
    resourceLoad: 68,
    createdAt: '2025-10-12',
    adminEmail: 'admin@acme.com',
    ipWhitelist: ['192.168.1.1', '10.20.30.0/24'],
    customDomain: 'support.acme.com',
    activeSeats: 15,
    maxSeats: 20,
    apiKey: 'c1q_live_acme_83726a8d71',
    nluVersion: 'v2.4.1'
  },
  {
    id: 'tenant-globelink',
    name: 'GlobeLink Logistics',
    domain: 'globelink.org',
    currentPlanId: 'plan-enterprise',
    status: 'active',
    billingStatus: 'active',
    resourceLoad: 88,
    createdAt: '2025-11-01',
    adminEmail: 'ops-admin@globelink.org',
    ipWhitelist: ['82.165.4.19'],
    customDomain: 'helpdesk.globelink.org',
    activeSeats: 48,
    maxSeats: 100,
    apiKey: 'c1q_live_globelink_29910d8a11',
    nluVersion: 'v3.0.0-rc2'
  },
  {
    id: 'tenant-snt',
    name: 'Saudi National Trade Co.',
    domain: 'snt.com.sa',
    currentPlanId: 'plan-enterprise',
    status: 'active',
    billingStatus: 'active',
    resourceLoad: 42,
    createdAt: '2026-01-15',
    adminEmail: 'support-manager@snt.com.sa',
    ipWhitelist: ['10.0.0.0/8', '192.168.10.25'],
    customDomain: 'portal.snt.com.sa',
    activeSeats: 82,
    maxSeats: 150,
    apiKey: 'c1q_live_snt_04729f8f2b',
    nluVersion: 'v2.8.2'
  },
  {
    id: 'tenant-deltaretail',
    name: 'Delta Retail Group',
    domain: 'deltaretail.co',
    currentPlanId: 'plan-growth',
    status: 'suspended',
    billingStatus: 'suspended',
    resourceLoad: 0,
    createdAt: '2025-08-20',
    adminEmail: 'it-ops@deltaretail.co',
    ipWhitelist: [],
    customDomain: 'support.deltaretail.co',
    activeSeats: 0,
    maxSeats: 30,
    apiKey: 'c1q_live_delta_71092e1b4a',
    nluVersion: 'v2.1.0'
  },
  {
    id: 'tenant-techvibe',
    name: 'TechVibe Startup',
    domain: 'techvibe.io',
    currentPlanId: 'plan-free',
    status: 'trial',
    billingStatus: 'trial',
    resourceLoad: 12,
    createdAt: '2026-05-28',
    adminEmail: 'ceo@techvibe.io',
    ipWhitelist: ['192.168.1.100'],
    customDomain: undefined,
    activeSeats: 3,
    maxSeats: 5,
    apiKey: 'c1q_live_techvibe_99011f0a2d',
    nluVersion: 'v1.0.0'
  }
];

export const mockTenantMetering: TenantMetering[] = [
  {
    tenantId: 'tenant-acme',
    tenantName: 'Acme Global Corp',
    dbRowsCount: 14500,
    dbRowsLimit: 50000,
    apiCallsLimit: 100000,
    tokensLimit: 5000000,
    history: [
      { date: '05-28', apiRequests: 4200, tokenUsage: 210000, cpuUsage: 45 },
      { date: '05-29', apiRequests: 4800, tokenUsage: 240000, cpuUsage: 50 },
      { date: '05-30', apiRequests: 5100, tokenUsage: 255000, cpuUsage: 52 },
      { date: '05-31', apiRequests: 3200, tokenUsage: 160000, cpuUsage: 35 },
      { date: '06-01', apiRequests: 2800, tokenUsage: 140000, cpuUsage: 30 },
      { date: '06-02', apiRequests: 6200, tokenUsage: 310000, cpuUsage: 62 },
      { date: '06-03', apiRequests: 6800, tokenUsage: 340000, cpuUsage: 68 }
    ]
  },
  {
    tenantId: 'tenant-globelink',
    tenantName: 'GlobeLink Logistics',
    dbRowsCount: 44200,
    dbRowsLimit: 50000,
    apiCallsLimit: 500000,
    tokensLimit: 20000000,
    history: [
      { date: '05-28', apiRequests: 18000, tokenUsage: 920000, cpuUsage: 78 },
      { date: '05-29', apiRequests: 19500, tokenUsage: 990000, cpuUsage: 82 },
      { date: '05-30', apiRequests: 21000, tokenUsage: 1100000, cpuUsage: 88 },
      { date: '05-31', apiRequests: 12000, tokenUsage: 610000, cpuUsage: 55 },
      { date: '06-01', apiRequests: 10500, tokenUsage: 520000, cpuUsage: 48 },
      { date: '06-02', apiRequests: 22000, tokenUsage: 1150000, cpuUsage: 89 },
      { date: '06-03', apiRequests: 23500, tokenUsage: 1250000, cpuUsage: 92 }
    ]
  },
  {
    tenantId: 'tenant-snt',
    tenantName: 'Saudi National Trade Co.',
    dbRowsCount: 18900,
    dbRowsLimit: 100000,
    apiCallsLimit: 500000,
    tokensLimit: 20000000,
    history: [
      { date: '05-28', apiRequests: 6200, tokenUsage: 310000, cpuUsage: 32 },
      { date: '05-29', apiRequests: 6800, tokenUsage: 340000, cpuUsage: 35 },
      { date: '05-30', apiRequests: 7100, tokenUsage: 355000, cpuUsage: 38 },
      { date: '05-31', apiRequests: 4500, tokenUsage: 225000, cpuUsage: 28 },
      { date: '06-01', apiRequests: 3900, tokenUsage: 195000, cpuUsage: 25 },
      { date: '06-02', apiRequests: 7800, tokenUsage: 390000, cpuUsage: 40 },
      { date: '06-03', apiRequests: 8200, tokenUsage: 410000, cpuUsage: 42 }
    ]
  },
  {
    tenantId: 'tenant-deltaretail',
    tenantName: 'Delta Retail Group',
    dbRowsCount: 8200,
    dbRowsLimit: 50000,
    apiCallsLimit: 100000,
    tokensLimit: 5000000,
    history: [
      { date: '05-28', apiRequests: 3100, tokenUsage: 155000, cpuUsage: 32 },
      { date: '05-29', apiRequests: 3400, tokenUsage: 170000, cpuUsage: 36 },
      { date: '05-30', apiRequests: 2800, tokenUsage: 140000, cpuUsage: 30 },
      { date: '05-31', apiRequests: 0, tokenUsage: 0, cpuUsage: 0 },
      { date: '06-01', apiRequests: 0, tokenUsage: 0, cpuUsage: 0 },
      { date: '06-02', apiRequests: 0, tokenUsage: 0, cpuUsage: 0 },
      { date: '06-03', apiRequests: 0, tokenUsage: 0, cpuUsage: 0 }
    ]
  },
  {
    tenantId: 'tenant-techvibe',
    tenantName: 'TechVibe Startup',
    dbRowsCount: 1200,
    dbRowsLimit: 10000,
    apiCallsLimit: 25000,
    tokensLimit: 1000000,
    history: [
      { date: '05-28', apiRequests: 350, tokenUsage: 17500, cpuUsage: 8 },
      { date: '05-29', apiRequests: 420, tokenUsage: 21000, cpuUsage: 10 },
      { date: '05-30', apiRequests: 480, tokenUsage: 24000, cpuUsage: 11 },
      { date: '05-31', apiRequests: 210, tokenUsage: 10500, cpuUsage: 5 },
      { date: '06-01', apiRequests: 180, tokenUsage: 9000, cpuUsage: 4 },
      { date: '06-02', apiRequests: 510, tokenUsage: 25500, cpuUsage: 12 },
      { date: '06-03', apiRequests: 580, tokenUsage: 29000, cpuUsage: 12 }
    ]
  }
];

export const defaultFeatureFlags: TenantFeatureFlag[] = [
  { id: 'flag-copilot', name: 'AI Co-pilot Suggestion Panel', key: 'enable_copilot_panel', description: 'Surfaces smart suggestions and canned macros directly in the agent omnichannel inbox.', enabled: true },
  { id: 'flag-multilingual', name: 'Arabic Native RTL Support', key: 'enable_arabic_rtl', description: 'Enables Arabic language selection and automatically flips layout rendering to RTL rules.', enabled: true },
  { id: 'flag-voice-ivr', name: 'Farah AI Voice Designer', key: 'enable_voice_ivr', description: 'Enables high-fidelity interactive voice response nodes builder with keypad simulators.', enabled: true },
  { id: 'flag-custom-theme', name: 'White-Label Branding System', key: 'enable_white_label', description: 'Allows tenant client-admins to upload custom logos and apply corporate palette CSS injections.', enabled: false },
  { id: 'flag-siem-audit', name: 'SIEM Compliant Audit Export', key: 'enable_siem_audit', description: 'Enables automatic streaming of workspace security events to external SIEM connectors.', enabled: false }
];

export const mockTenantFeatureFlags: Record<string, TenantFeatureFlag[]> = {
  'tenant-acme': [
    { ...defaultFeatureFlags[0], enabled: true },
    { ...defaultFeatureFlags[1], enabled: true },
    { ...defaultFeatureFlags[2], enabled: true },
    { ...defaultFeatureFlags[3], enabled: true },
    { ...defaultFeatureFlags[4], enabled: false }
  ],
  'tenant-globelink': [
    { ...defaultFeatureFlags[0], enabled: true },
    { ...defaultFeatureFlags[1], enabled: false },
    { ...defaultFeatureFlags[2], enabled: true },
    { ...defaultFeatureFlags[3], enabled: true },
    { ...defaultFeatureFlags[4], enabled: true }
  ],
  'tenant-snt': [
    { ...defaultFeatureFlags[0], enabled: true },
    { ...defaultFeatureFlags[1], enabled: true },
    { ...defaultFeatureFlags[2], enabled: false },
    { ...defaultFeatureFlags[3], enabled: false },
    { ...defaultFeatureFlags[4], enabled: false }
  ],
  'tenant-deltaretail': [
    { ...defaultFeatureFlags[0], enabled: false },
    { ...defaultFeatureFlags[1], enabled: false },
    { ...defaultFeatureFlags[2], enabled: false },
    { ...defaultFeatureFlags[3], enabled: false },
    { ...defaultFeatureFlags[4], enabled: false }
  ],
  'tenant-techvibe': [
    { ...defaultFeatureFlags[0], enabled: true },
    { ...defaultFeatureFlags[1], enabled: true },
    { ...defaultFeatureFlags[2], enabled: false },
    { ...defaultFeatureFlags[3], enabled: false },
    { ...defaultFeatureFlags[4], enabled: false }
  ]
};

export interface TenantAuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  ipAddress: string;
  status: 'success' | 'failed';
}

export const mockTenantAuditLogs: Record<string, TenantAuditLog[]> = {
  'tenant-acme': [
    { id: 'log-1', timestamp: '2026-06-04 10:15:30', user: 'admin@acme.com', action: 'API Key Re-generation', ipAddress: '192.168.1.1', status: 'success' },
    { id: 'log-2', timestamp: '2026-06-03 14:22:11', user: 'admin@acme.com', action: 'IP Whitelist update', ipAddress: '192.168.1.1', status: 'success' },
    { id: 'log-3', timestamp: '2026-06-02 09:05:44', user: 'system', action: 'Automatic database compaction', ipAddress: '127.0.0.1', status: 'success' }
  ],
  'tenant-globelink': [
    { id: 'log-4', timestamp: '2026-06-04 08:30:00', user: 'ops-admin@globelink.org', action: 'Enable Feature Gate: SIEM Audit', ipAddress: '82.165.4.19', status: 'success' },
    { id: 'log-5', timestamp: '2026-06-01 11:14:02', user: 'ops-admin@globelink.org', action: 'Increase seats limit to 100', ipAddress: '82.165.4.19', status: 'success' }
  ],
  'tenant-snt': [
    { id: 'log-6', timestamp: '2026-06-03 16:45:10', user: 'support-manager@snt.com.sa', action: 'Update Custom Domain: portal.snt.com.sa', ipAddress: '192.168.10.25', status: 'success' },
    { id: 'log-7', timestamp: '2026-06-02 12:20:00', user: 'support-manager@snt.com.sa', action: 'Workspace Configuration Sync', ipAddress: '192.168.10.25', status: 'success' }
  ],
  'tenant-deltaretail': [
    { id: 'log-8', timestamp: '2026-05-31 00:01:00', user: 'system', action: 'Tenant Suspension due to overdue invoice', ipAddress: '127.0.0.1', status: 'success' },
    { id: 'log-9', timestamp: '2026-05-30 18:22:15', user: 'it-ops@deltaretail.co', action: 'Failed login attempt', ipAddress: '172.56.9.11', status: 'failed' }
  ],
  'tenant-techvibe': [
    { id: 'log-10', timestamp: '2026-06-04 10:00:22', user: 'ceo@techvibe.io', action: 'Initial Workspace provisioning', ipAddress: '192.168.1.100', status: 'success' }
  ]
};
