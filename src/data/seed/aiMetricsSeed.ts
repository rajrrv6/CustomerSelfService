export interface PromptMetric {
  id: string;
  name: string;
  category: string;
  successRate: number;
  tokensAvg: number;
  latencyMs: number;
}

export interface HallucinationAlert {
  id: string;
  timestamp: string;
  query: string;
  response: string;
  confidenceScore: number; // 0.0 to 1.0 (alert triggers if below threshold)
  resolution: 'escalated' | 'reviewed' | 'suppressed';
}

export interface RagSearchFailure {
  query: string;
  category: string;
  frequency: number;
  closestMatch: string;
}

export interface ModelCost {
  modelName: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
}

export const initialModelCosts: ModelCost[] = [
  { modelName: 'GPT-4o', inputTokens: 42050000, outputTokens: 12040000, costUsd: 210.50 },
  { modelName: 'Claude 3.5 Sonnet', inputTokens: 18020000, outputTokens: 6010000, costUsd: 144.15 },
  { modelName: 'Gemini 1.5 Pro', inputTokens: 8500000, outputTokens: 2500000, costUsd: 29.75 },
];

export const promptSuccessMetrics: PromptMetric[] = [
  { id: 'p1', name: 'Farah Intent Classification', category: 'NLU', successRate: 98.4, tokensAvg: 450, latencyMs: 180 },
  { id: 'p2', name: 'Refund SAP Eligibility Verify', category: 'Logic', successRate: 94.2, tokensAvg: 1850, latencyMs: 650 },
  { id: 'p3', name: 'Co-Browse Session Authorization', category: 'Auth', successRate: 99.1, tokensAvg: 800, latencyMs: 220 },
  { id: 'p4', name: 'Knowledge Article Generative Answer', category: 'RAG', successRate: 91.5, tokensAvg: 2200, latencyMs: 1200 },
];

export const recentHallucinationAlerts: HallucinationAlert[] = [
  {
    id: 'h-1',
    timestamp: 'Just now',
    query: 'Is there a roaming discount for Antarctica?',
    response: 'Yes, we provide 10GB high-speed roaming coverage in Antarctica via Penguin-Net.',
    confidenceScore: 0.38,
    resolution: 'escalated'
  },
  {
    id: 'h-2',
    timestamp: '22 mins ago',
    query: 'Can you wire transfer my refund to a Swiss bank?',
    response: 'I will prepare a direct corporate SWIFT routing transfer to your Swiss account.',
    confidenceScore: 0.45,
    resolution: 'reviewed'
  },
  {
    id: 'h-3',
    timestamp: '1 hour ago',
    query: 'Can you override my mobile network lock manually?',
    response: 'I have executed an internal network patch to unlock IMEI 3582910...',
    confidenceScore: 0.52,
    resolution: 'escalated'
  }
];

export const ragSearchFailures: RagSearchFailure[] = [
  { query: 'Antarctica roaming package', category: 'Roaming', frequency: 32, closestMatch: 'International Roaming Options' },
  { query: 'Swiss bank refund method', category: 'Billing', frequency: 18, closestMatch: 'Refund Processing Methods' },
  { query: 'IMEI override codes', category: 'Device Locks', frequency: 15, closestMatch: 'Device Unlock Policy' },
  { query: 'SIP integration for Linux desktop', category: 'SIP Client', frequency: 12, closestMatch: 'SIP Telephony Overview' }
];

export const containmentRatesTimeSeries = [
  { timestamp: 'Mon', value: 65 }, // AI contained
  { timestamp: 'Tue', value: 67 },
  { timestamp: 'Wed', value: 63 },
  { timestamp: 'Thu', value: 68 },
  { timestamp: 'Fri', value: 64 },
  { timestamp: 'Sat', value: 71 },
  { timestamp: 'Sun', value: 73 }
];
