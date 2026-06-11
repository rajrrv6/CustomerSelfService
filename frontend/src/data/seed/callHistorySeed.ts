export interface CallHistoryItem {
  id: string;
  phoneNumber: string;
  contactName: string;
  direction: 'inbound' | 'outbound';
  timestamp: string;
  duration: string; // formatted duration e.g., '02:45'
  status: 'completed' | 'missed' | 'voicemail' | 'transferred';
  recordingUrl?: string;
  notes?: string;
  disposition?: string;
}

export const callHistorySeed: CallHistoryItem[] = [
  {
    id: 'call-1',
    phoneNumber: '+1 (555) 321-7890',
    contactName: 'Amina Al-Masri',
    direction: 'inbound',
    timestamp: 'Today, 10:14 AM',
    duration: '04:12',
    status: 'completed',
    recordingUrl: 'https://storage.googleapis.com/mpaas-recordings/call-1.wav',
    notes: 'Inquired about order exception ORD-998. Refund processed successfully.',
    disposition: 'Refund Approved'
  },
  {
    id: 'call-2',
    phoneNumber: '+1 (555) 987-6543',
    contactName: 'John Doe',
    direction: 'inbound',
    timestamp: 'Today, 09:30 AM',
    duration: '01:45',
    status: 'missed',
  },
  {
    id: 'call-3',
    phoneNumber: '+1 (555) 456-7890',
    contactName: 'Sarah Jenkins',
    direction: 'outbound',
    timestamp: 'Yesterday, 04:15 PM',
    duration: '05:30',
    status: 'completed',
    recordingUrl: 'https://storage.googleapis.com/mpaas-recordings/call-3.wav',
    notes: 'Follow-up regarding broken item replacement. Shipment details shared.',
    disposition: 'Replacement Shipped'
  },
  {
    id: 'call-4',
    phoneNumber: '+1 (555) 123-4567',
    contactName: 'Michael Chang',
    direction: 'inbound',
    timestamp: 'Yesterday, 11:20 AM',
    duration: '03:10',
    status: 'voicemail',
    notes: 'Left message regarding invoice discrepancy. Needs urgent return call.',
    disposition: 'Callback Scheduled'
  }
];
