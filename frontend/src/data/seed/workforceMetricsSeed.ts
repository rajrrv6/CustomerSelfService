export interface AgentPerformance {
  agentName: string;
  avatarLetter: string;
  role: string;
  activeStatus: 'online' | 'busy' | 'break' | 'offline';
  handledTickets: number;
  handledCalls: number;
  csatAvg: number;
  slaAdherence: number; // in %
  utilizationRate: number; // in %
}

export interface SupervisorActivityLog {
  id: string;
  supervisorName: string;
  agentName: string;
  actionType: 'whisper' | 'barge' | 'silent_monitor';
  timestamp: string;
  durationMins: number;
}

export const agentPerformanceRoster: AgentPerformance[] = [
  {
    agentName: 'Amina Mansoor',
    avatarLetter: 'A',
    role: 'Tier-2 Support Specialist',
    activeStatus: 'online',
    handledTickets: 38,
    handledCalls: 14,
    csatAvg: 4.85,
    slaAdherence: 99.2,
    utilizationRate: 85.5
  },
  {
    agentName: 'Sanjay Kumar',
    avatarLetter: 'S',
    role: 'SAP Logistics Coordinator',
    activeStatus: 'busy',
    handledTickets: 25,
    handledCalls: 8,
    csatAvg: 4.60,
    slaAdherence: 96.4,
    utilizationRate: 91.2
  },
  {
    agentName: 'Sarah Jenkins',
    avatarLetter: 'S',
    role: 'Voice / Telecom Specialist',
    activeStatus: 'online',
    handledTickets: 32,
    handledCalls: 22,
    csatAvg: 4.75,
    slaAdherence: 98.5,
    utilizationRate: 88.0
  },
  {
    agentName: 'Yousef Al-Harbi',
    avatarLetter: 'Y',
    role: 'Billing Escalations Lead',
    activeStatus: 'break',
    handledTickets: 15,
    handledCalls: 4,
    csatAvg: 4.90,
    slaAdherence: 100.0,
    utilizationRate: 74.0
  },
  {
    agentName: 'Emma Watson',
    avatarLetter: 'E',
    role: 'Customer Care Rep',
    activeStatus: 'offline',
    handledTickets: 42,
    handledCalls: 18,
    csatAvg: 4.52,
    slaAdherence: 95.0,
    utilizationRate: 0.0
  }
];

export const workforceUtilizationDistribution = [
  { label: 'Direct Call Support', count: 18, color: '#3b82f6' }, // Blue
  { label: 'Idle / Waiting Call', count: 12, color: '#10b981' }, // Green
  { label: 'Scheduled Break / Lunch', count: 5, color: '#eab308' }, // Yellow
  { label: 'Administrative Wrap-up', count: 7, color: '#f97316' }  // Orange
];

export const recentSupervisorLogs: SupervisorActivityLog[] = [
  {
    id: 's-1',
    supervisorName: 'Tariq Mahmood',
    agentName: 'Sanjay Kumar',
    actionType: 'whisper',
    timestamp: 'Just now',
    durationMins: 4.5
  },
  {
    id: 's-2',
    supervisorName: 'Tariq Mahmood',
    agentName: 'Sarah Jenkins',
    actionType: 'silent_monitor',
    timestamp: '18 mins ago',
    durationMins: 12.0
  },
  {
    id: 's-3',
    supervisorName: 'Amani Faris',
    agentName: 'Amina Mansoor',
    actionType: 'barge',
    timestamp: '42 mins ago',
    durationMins: 6.8
  }
];
