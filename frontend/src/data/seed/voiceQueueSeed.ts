export interface QueuedCall {
  id: string;
  phoneNumber: string;
  customerName: string;
  waitTime: number; // in seconds
  priority: 'VIP' | 'High' | 'Normal';
  queueName: string;
}

export const voiceQueueSeed: QueuedCall[] = [
  {
    id: 'q-call-1',
    phoneNumber: '+1 (555) 888-9999',
    customerName: 'Fatima Al-Sudais',
    waitTime: 142,
    priority: 'VIP',
    queueName: 'Enterprise VIP Queue'
  },
  {
    id: 'q-call-2',
    phoneNumber: '+1 (555) 444-2222',
    customerName: 'George Henderson',
    waitTime: 85,
    priority: 'High',
    queueName: 'Billing & Invoices'
  },
  {
    id: 'q-call-3',
    phoneNumber: '+1 (555) 111-3333',
    customerName: 'Dina Shore',
    waitTime: 30,
    priority: 'Normal',
    queueName: 'General Support'
  }
];
