export interface QueueConfig {
  id: string;
  name: string;
  count: number;
  avgWaitMins: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export const queueSeed: QueueConfig[] = [
  { id: 'q-all', name: 'All Queued Cases', count: 6, avgWaitMins: 4, priority: 'medium' },
  { id: 'q-vip', name: 'VIP Priority Escalations', count: 2, avgWaitMins: 1, priority: 'urgent' },
  { id: 'q-telco', name: 'Telco Voice IVR Routing', count: 1, avgWaitMins: 3, priority: 'high' },
  { id: 'q-default', name: 'Standard General Support', count: 3, avgWaitMins: 8, priority: 'low' }
];
