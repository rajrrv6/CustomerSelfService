import { UserProfile, NotificationPreference, SavedSearch, ActivityItem, FavoriteItem } from './types';

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'David Miller',
  email: 'david.miller@yahoo.com',
  phone: '+966 50 882 1993',
  language: 'en',
  timezone: 'Asia/Riyadh',
  avatar: '',
};

export const DEFAULT_NOTIFICATION_PREFERENCE: NotificationPreference = {
  email: true,
  sms: false,
  push: true,
  inApp: true,
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '07:00',
  },
  priorityOnly: false,
};

export const INITIAL_SAVED_SEARCHES: SavedSearch[] = [
  { query: 'refund ORD-99881', date: '2026-06-08', count: 3 },
  { query: 'Stripe 403 Forbidden scopes', date: '2026-06-05', count: 1 },
  { query: 'SLA priority matrix', date: '2026-06-02', count: 2 },
  { query: 'civil registry database connection error', date: '2026-05-28', count: 5 },
];

export const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    action: 'Successfully authenticated login session to mPaaS Portal via OAuth',
    timestamp: '2026-06-08 14:15:32',
    category: 'auth',
    ip: '192.168.10.150',
  },
  {
    id: 'act-2',
    action: 'Submitted support incident request case TIC-9912',
    timestamp: '2026-06-08 13:42:10',
    category: 'ticket',
    ip: '192.168.10.150',
  },
  {
    id: 'act-3',
    action: 'Searched RAG index for keyword "refund policy"',
    timestamp: '2026-06-08 11:20:45',
    category: 'search',
    ip: '192.168.10.150',
  },
  {
    id: 'act-4',
    action: 'Read knowledge hub article "How to Request a SaaS Subscription Refund"',
    timestamp: '2026-06-08 11:05:00',
    category: 'article',
    ip: '192.168.10.150',
  },
  {
    id: 'act-5',
    action: 'Toggled standard high-contrast accessibility mode to active',
    timestamp: '2026-06-07 16:30:12',
    category: 'settings',
    ip: '147.28.112.5',
  },
  {
    id: 'act-6',
    action: 'Concluded AI copilot conversation thread "Farah Assist Session #31"',
    timestamp: '2026-06-06 09:12:00',
    category: 'ai-chat',
    ip: '147.28.112.5',
  },
];

export const INITIAL_FAVORITES: FavoriteItem[] = [
  {
    id: 'art-1',
    title: 'How to Request a SaaS Subscription Refund',
    category: 'Returns & Refunds',
    type: 'article',
    dateAdded: '2026-06-07',
  },
  {
    id: 'art-3',
    title: 'Resetting Locked Civil Registry Logins',
    category: 'Account & Access',
    type: 'article',
    dateAdded: '2026-06-06',
  },
  {
    id: 'tic-9912',
    title: 'Billing Shard Latency Issues',
    category: 'SLA Priority 1 - Critical',
    type: 'ticket',
    dateAdded: '2026-06-08',
  },
  {
    id: 'chat-assist-31',
    title: 'Farah AI Assist: Sandbox OAuth configuration walkthrough',
    category: 'AI Chat History',
    type: 'ai-chat',
    dateAdded: '2026-06-06',
  },
];

export const TIMEZONES = [
  { value: 'Asia/Riyadh', label: 'Saudi Arabia Standard Time (UTC+3)' },
  { value: 'Asia/Dubai', label: 'Gulf Standard Time (UTC+4)' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (UTC+0)' },
  { value: 'Europe/Paris', label: 'Central European Time (UTC+1)' },
  { value: 'America/New_York', label: 'Eastern Standard Time (UTC-5)' },
  { value: 'America/Los_Angeles', label: 'Pacific Standard Time (UTC-8)' },
];

export const ACCENT_COLORS = [
  { value: 'blue', label: 'Corporate Blue', colorClass: 'bg-blue-600' },
  { value: 'emerald', label: 'Eco Emerald', colorClass: 'bg-emerald-600' },
  { value: 'indigo', label: 'Royal Indigo', colorClass: 'bg-indigo-600' },
  { value: 'violet', label: 'Deep Violet', colorClass: 'bg-violet-600' },
];

export const RECOMMENDATIONS = [
  {
    id: 'art-2',
    title: 'Setting Up OAuth for Client-Gate API Connectors',
    reasonEN: 'Based on "Stripe 403" activity',
    reasonAR: 'بناءً على نشاط "Stripe 403"',
    category: 'Developer APIs',
  },
  {
    id: 'art-4',
    title: 'Handling Fiber Gateway Delivery Delays',
    reasonEN: 'Based on recent shipment ticket',
    reasonAR: 'بناءً على تذكرة الشحن الأخيرة',
    category: 'Returns & Refunds',
  },
];
