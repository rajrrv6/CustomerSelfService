import { SystemAlert } from '@/stores/notifications/notificationTypes';

export interface UserProfile {
  avatar?: string; // base64 or url
  name: string;
  email: string;
  phone: string;
  language: 'en' | 'ar';
  timezone: string;
}

export interface QuietHours {
  enabled: boolean;
  start: string; // e.g. "22:00"
  end: string;   // e.g. "07:00"
}

export interface NotificationPreference {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
  quietHours: QuietHours;
  priorityOnly: boolean;
}

export interface SavedSearch {
  query: string;
  date: string;
  count?: number;
}

export interface ActivityItem {
  id: string;
  action: string;
  timestamp: string; // formatted or ISO
  category: 'auth' | 'ticket' | 'search' | 'article' | 'settings' | 'ai-chat';
  ip: string;
}

export interface FavoriteItem {
  id: string; // art-1, tic-1234, chat-abc
  title: string;
  category: string;
  type: 'article' | 'ticket' | 'ai-chat';
  dateAdded?: string;
}
