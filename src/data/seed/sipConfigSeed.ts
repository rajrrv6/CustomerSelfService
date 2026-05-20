export interface SipTrunk {
  id: string;
  name: string;
  gateway: string;
  status: 'connected' | 'disconnected' | 'degraded';
  region: string;
  channels: number;
}

export interface PhoneNumberPoolItem {
  id: string;
  phoneNumber: string;
  status: 'active' | 'reserved' | 'unassigned';
  type: 'local' | 'toll-free';
}

export interface VoicemailItem {
  id: string;
  callerName: string;
  phoneNumber: string;
  timestamp: string;
  duration: string;
  transcription: string;
  isRead: boolean;
}

export const sipTrunksSeed: SipTrunk[] = [
  {
    id: 'sip-1',
    name: 'Twilio US-East SIP Trunk',
    gateway: 'us-east.sip.twilio.com',
    status: 'connected',
    region: 'US East (N. Virginia)',
    channels: 240
  },
  {
    id: 'sip-2',
    name: 'Tata Communications SIP Trunk',
    gateway: 'in-mumbai.sip.tatacomm.com',
    status: 'connected',
    region: 'APAC (Mumbai)',
    channels: 120
  },
  {
    id: 'sip-3',
    name: 'Voxbone Europe SIP Trunk',
    gateway: 'eu-frankfurt.sip.voxbone.com',
    status: 'degraded',
    region: 'EU West (Frankfurt)',
    channels: 80
  }
];

export const phoneNumberPoolSeed: PhoneNumberPoolItem[] = [
  {
    id: 'num-1',
    phoneNumber: '+1 (800) 555-0199',
    status: 'active',
    type: 'toll-free'
  },
  {
    id: 'num-2',
    phoneNumber: '+1 (888) 555-0144',
    status: 'active',
    type: 'toll-free'
  },
  {
    id: 'num-3',
    phoneNumber: '+1 (415) 555-8910',
    status: 'reserved',
    type: 'local'
  },
  {
    id: 'num-4',
    phoneNumber: '+1 (650) 555-3211',
    status: 'unassigned',
    type: 'local'
  }
];

export const voicemailsSeed: VoicemailItem[] = [
  {
    id: 'vm-1',
    callerName: 'Tariq Mansoor',
    phoneNumber: '+966 (50) 123-4567',
    timestamp: 'Today, 08:12 AM',
    duration: '00:45',
    transcription: 'Salam Alaikum. I am calling to inquire about the commercial license subscription status for account MP-776. Please call me back as soon as possible.',
    isRead: false
  },
  {
    id: 'vm-2',
    callerName: 'Jessica Miller',
    phoneNumber: '+1 (555) 765-4321',
    timestamp: 'Yesterday, 02:40 PM',
    duration: '01:12',
    transcription: 'Hi Liam, I noticed a duplicate transaction fee on my credit card statement for last month invoice. The ID was INV-2026-09. Please check on this refund.',
    isRead: true
  }
];
