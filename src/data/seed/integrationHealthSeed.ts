export interface LatencyDataPoint {
  time: string;
  latencyMs: number;
}

export interface ConnectorHealthMetrics {
  connectorId: string;
  uptime24h: number; // percentage (e.g. 99.98)
  history24h: LatencyDataPoint[];
  avgLatency: number;
  totalCalls24h: number;
  errorCount24h: number;
}

export const initialHealthMetrics: ConnectorHealthMetrics[] = [
  {
    connectorId: 'salesforce',
    uptime24h: 99.96,
    avgLatency: 122,
    totalCalls24h: 24200,
    errorCount24h: 12,
    history24h: [
      { time: '12:00', latencyMs: 118 },
      { time: '13:00', latencyMs: 122 },
      { time: '14:00', latencyMs: 135 },
      { time: '15:00', latencyMs: 140 },
      { time: '16:00', latencyMs: 120 },
      { time: '17:00', latencyMs: 122 }
    ]
  },
  {
    connectorId: 'hubspot',
    uptime24h: 100.0,
    avgLatency: 95,
    totalCalls24h: 0,
    errorCount24h: 0,
    history24h: [
      { time: '12:00', latencyMs: 90 },
      { time: '13:00', latencyMs: 95 },
      { time: '14:00', latencyMs: 92 },
      { time: '15:00', latencyMs: 98 },
      { time: '16:00', latencyMs: 95 },
      { time: '17:00', latencyMs: 95 }
    ]
  },
  {
    connectorId: 'zendesk',
    uptime24h: 99.85,
    avgLatency: 142,
    totalCalls24h: 11400,
    errorCount24h: 24,
    history24h: [
      { time: '12:00', latencyMs: 135 },
      { time: '13:00', latencyMs: 142 },
      { time: '14:00', latencyMs: 168 },
      { time: '15:00', latencyMs: 150 },
      { time: '16:00', latencyMs: 139 },
      { time: '17:00', latencyMs: 145 }
    ]
  },
  {
    connectorId: 'shopify',
    uptime24h: 99.99,
    avgLatency: 106,
    totalCalls24h: 6200,
    errorCount24h: 3,
    history24h: [
      { time: '12:00', latencyMs: 100 },
      { time: '13:00', latencyMs: 105 },
      { time: '14:00', latencyMs: 112 },
      { time: '15:00', latencyMs: 104 },
      { time: '16:00', latencyMs: 102 },
      { time: '17:00', latencyMs: 105 }
    ]
  },
  {
    connectorId: 'stripe',
    uptime24h: 98.42, // Degraded status
    avgLatency: 485,
    totalCalls24h: 18120,
    errorCount24h: 284, // Higher error count
    history24h: [
      { time: '12:00', latencyMs: 250 },
      { time: '13:00', latencyMs: 380 },
      { time: '14:00', latencyMs: 512 },
      { time: '15:00', latencyMs: 620 },
      { time: '16:00', latencyMs: 440 },
      { time: '17:00', latencyMs: 450 }
    ]
  },
  {
    connectorId: 'saperp',
    uptime24h: 100.0,
    avgLatency: 185,
    totalCalls24h: 0,
    errorCount24h: 0,
    history24h: [
      { time: '12:00', latencyMs: 180 },
      { time: '13:00', latencyMs: 190 },
      { time: '14:00', latencyMs: 185 },
      { time: '15:00', latencyMs: 188 },
      { time: '16:00', latencyMs: 182 },
      { time: '17:00', latencyMs: 190 }
    ]
  }
];
export const auditTrailSeed = [
  {
    id: 'aud-int-1',
    user: 'active.user@mpaas.com',
    role: 'CLIENT ADMIN',
    timestamp: '2026-05-20 17:15:30',
    action: 'Created client credentials for Custom Webhook API Key.',
    ipAddress: '192.168.10.150',
    status: 'success'
  },
  {
    id: 'aud-int-2',
    user: 'active.user@mpaas.com',
    role: 'CLIENT ADMIN',
    timestamp: '2026-05-20 16:10:00',
    action: 'Mapped Salesforce field "Phone" to local profile field "phone".',
    ipAddress: '192.168.10.150',
    status: 'success'
  },
  {
    id: 'aud-int-3',
    user: 'active.user@mpaas.com',
    role: 'CLIENT ADMIN',
    timestamp: '2026-05-20 14:05:00',
    action: 'Authorized OAuth sync link to Shopify Order Connector API.',
    ipAddress: '192.168.10.150',
    status: 'success'
  },
  {
    id: 'aud-int-4',
    user: 'active.user@mpaas.com',
    role: 'active.user@mpaas.com',
    timestamp: '2026-05-20 12:00:22',
    action: 'Failed webhook signature handshake validation on endpoint Slack URL.',
    ipAddress: '192.168.10.150',
    status: 'failed'
  }
];
