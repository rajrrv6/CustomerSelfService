export interface SupportMessage {
  id: string;
  sender: 'system' | 'agent' | 'user';
  text: string;
  time: string;
  attachments?: Array<{ name: string; size: string; url: string }>;
  status?: 'sent' | 'delivered' | 'read';
}

export interface SupportAgent {
  name: string;
  avatar?: string;
  role: string;
  status: 'online' | 'offline' | 'away';
}

export interface SlaTimer {
  limitMinutes: number;
  timeRemainingSeconds: number;
  isBreached: boolean;
}

export interface TicketTimelineStep {
  id: string;
  label: string;
  timestamp?: string;
  status: 'pending' | 'completed' | 'current';
  description?: string;
}

export interface Article {
  id: string;
  title: string;
  category: string;
  content: string;
  helpfulCount: number;
  tags: string[];
}

export interface ChangelogItem {
  id: string;
  version: string;
  title: string;
  desc: string;
  tag: 'feature' | 'improvement' | 'bugfix';
  date: string;
  read: boolean;
}
