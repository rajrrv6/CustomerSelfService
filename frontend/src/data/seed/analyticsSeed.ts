export interface ExecutiveKpis {
  totalInteractions: number;
  deflectionRate: number;
  slaCompliance: number;
  averageCsat: number;
  averageResolutionTimeMins: number;
  activeAgents: number;
  queueSize: number;
}

export interface JourneyStep {
  step: string;
  count: number;
  percentage: number;
}

export interface TimeSeriesData {
  timestamp: string;
  value: number;
  secondaryValue?: number;
}

export const initialExecutiveKpis: ExecutiveKpis = {
  totalInteractions: 14250,
  deflectionRate: 64.8,
  slaCompliance: 98.2,
  averageCsat: 4.72,
  averageResolutionTimeMins: 14.5,
  activeAgents: 42,
  queueSize: 3,
};

export const deflectionTrends: TimeSeriesData[] = [
  { timestamp: 'Mon', value: 61.2 },
  { timestamp: 'Tue', value: 63.5 },
  { timestamp: 'Wed', value: 62.8 },
  { timestamp: 'Thu', value: 65.4 },
  { timestamp: 'Fri', value: 64.1 },
  { timestamp: 'Sat', value: 67.3 },
  { timestamp: 'Sun', value: 69.5 },
];

export const journeyFunnelData: JourneyStep[] = [
  { step: 'Portal Visited', count: 10000, percentage: 100 },
  { step: 'KB / Bot Search', count: 8500, percentage: 85 },
  { step: 'Article Resolved / Bot Deflection', count: 5500, percentage: 55 },
  { step: 'Ticket Form Loaded', count: 1200, percentage: 12 },
  { step: 'Ticket Submitted', count: 420, percentage: 4.2 },
];

export const slaBreachTrends: TimeSeriesData[] = [
  { timestamp: '08:00', value: 0 },
  { timestamp: '10:00', value: 1 },
  { timestamp: '12:00', value: 3 },
  { timestamp: '14:00', value: 2 },
  { timestamp: '16:00', value: 0 },
  { timestamp: '18:00', value: 1 },
  { timestamp: '20:00', value: 0 },
];
