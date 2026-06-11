export interface AgentPerformanceMetrics {
  activeChatsCount: number;
  maxChatsCount: number;
  csatScore: number;
  resolvedTicketsCount: number;
  avgResponseMs: number;
  slaComplianceRate: number;
  totalCallsTaken: number;
}

export interface ShiftDay {
  day: string;
  hours: string;
  status: 'work' | 'off' | 'training';
}

export const agentMetricsSeed: AgentPerformanceMetrics = {
  activeChatsCount: 2,
  maxChatsCount: 4,
  csatScore: 94.2,
  resolvedTicketsCount: 164,
  avgResponseMs: 38000, // 38 seconds
  slaComplianceRate: 98.4,
  totalCallsTaken: 42
};

export const shiftScheduleSeed: ShiftDay[] = [
  { day: 'Monday', hours: '08:00 - 17:00 (Arab Standard Time)', status: 'work' },
  { day: 'Tuesday', hours: '08:00 - 17:00 (Arab Standard Time)', status: 'work' },
  { day: 'Wednesday', hours: '08:00 - 17:00 (Arab Standard Time)', status: 'work' },
  { day: 'Thursday', hours: '08:00 - 17:00 (Arab Standard Time)', status: 'work' },
  { day: 'Friday', hours: '09:00 - 13:00 (Half Day Shift)', status: 'training' },
  { day: 'Saturday', hours: 'Weekend Roster Standby', status: 'off' },
  { day: 'Sunday', hours: 'Off Roster', status: 'off' }
];
