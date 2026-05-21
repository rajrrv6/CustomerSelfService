export interface CallVolumeHour {
  hour: string;
  volume: number;
  qualityAlerts: number;
}

export interface CallQualitySample {
  codec: string;
  packetLossAvg: number;
  jitterMs: number;
  mosScore: number; // Mean Opinion Score: 1-5 (excellent is >4)
}

export const initialVoiceKpis = {
  totalCalls: 1250,
  averageDurationSeconds: 198,
  activeCallsCount: 5,
  poorQualityAlerts: 2,
};

export const callQualityBreakdown: CallQualitySample[] = [
  { codec: 'G.711 PCMU', packetLossAvg: 0.1, jitterMs: 2.4, mosScore: 4.4 },
  { codec: 'Opus (HD Voice)', packetLossAvg: 0.05, jitterMs: 1.8, mosScore: 4.7 },
  { codec: 'G.729 (Compressed)', packetLossAvg: 0.8, jitterMs: 8.5, mosScore: 3.9 }
];

export const callVolumeTrends: CallVolumeHour[] = [
  { hour: '08:00', volume: 45, qualityAlerts: 0 },
  { hour: '10:00', volume: 110, qualityAlerts: 1 },
  { hour: '12:00', volume: 145, qualityAlerts: 4 },
  { hour: '14:00', volume: 130, qualityAlerts: 2 },
  { hour: '16:00', volume: 95, qualityAlerts: 1 },
  { hour: '18:00', volume: 60, qualityAlerts: 0 },
  { hour: '20:00', volume: 30, qualityAlerts: 0 }
];

// 12-hour x 7-day volume density matrix (representing hours 8 AM to 8 PM across Mon-Sun)
// Values range from 0 (empty) to 100 (saturated peak)
export const voiceHeatmapMatrix: number[][] = [
  // Mon, Tue, Wed, Thu, Fri, Sat, Sun
  [12, 14, 15, 10, 18, 5, 2],   // 08:00
  [35, 42, 38, 45, 40, 10, 4],  // 09:00
  [75, 80, 72, 85, 78, 25, 8],  // 10:00
  [85, 92, 89, 90, 84, 30, 12], // 11:00
  [95, 98, 94, 96, 92, 45, 15], // 12:00
  [60, 65, 58, 62, 70, 40, 10], // 13:00
  [80, 85, 82, 88, 81, 35, 14], // 14:00
  [90, 95, 91, 93, 89, 28, 11], // 15:00
  [70, 74, 68, 72, 76, 20, 8],  // 16:00
  [45, 50, 48, 52, 55, 15, 5],  // 17:00
  [30, 35, 32, 28, 40, 8, 3],   // 18:00
  [15, 18, 20, 14, 25, 4, 1]    // 19:00
];

export const heatmapHours = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
  '06:00 PM', '07:00 PM'
];

export const heatmapDays = [
  'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'
];
