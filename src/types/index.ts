export type UserRole =
  | 'super_admin'
  | 'client_admin'
  | 'operations_manager'
  | 'qa_manager'
  | 'support_agent'
  | 'supervisor'
  | 'customer'
  | 'viewer';

export interface LLMModel {
  id: string;
  name: string;
  provider: string;
  costInput: number; // per 1k tokens in USD
  costOutput: number; // per 1k tokens in USD
  latencyMs: number;
  status: 'active' | 'deprecated' | 'testing';
  contextWindow: number;
  accuracyScore: number; // percentage
}

export interface ASRTTSProvider {
  id: string;
  name: string;
  type: 'ASR' | 'TTS' | 'both';
  languages: string[];
  latencyMs: number;
  costPerMin: number;
  status: 'online' | 'offline' | 'degraded';
}

export interface Channel {
  id: string;
  name: string;
  type: 'whatsapp' | 'web' | 'voice' | 'email' | 'messenger' | 'sms';
  icon: string;
  connectedBots: string[];
  status: 'active' | 'inactive';
  rateLimit: string;
}

export interface Bot {
  id: string;
  name: string;
  persona: string;
  status: 'live' | 'draft' | 'training';
  language: string[];
  deflectionRate: number; // percentage
  intentCount: number;
  knowledgeBaseId: string;
  createdAt: string;
  activeSessions: number;
  avatarUrl?: string;
}

export interface Intent {
  id: string;
  name: string;
  utterances: string[];
  slots: Slot[];
  confidenceThreshold: number;
  fulfillmentType: 'dialog' | 'webhook' | 'text';
  fulfillmentValue: string;
  status: 'active' | 'suggested';
  hitCount: number;
}

export interface Slot {
  name: string;
  type: string;
  required: boolean;
  prompt: string;
}

export interface KnowledgeSource {
  id: string;
  name: string;
  type: 'pdf' | 'url' | 'confluence' | 'database';
  status: 'ready' | 'syncing' | 'error';
  chunkCount: number;
  lastIngested: string;
  sizeBytes?: number;
  isStale?: boolean;
  syncSchedule?: string;
  crawlerDetails?: {
    urlCount?: number;
    depthLimit?: number;
    lastSyncBytes?: number;
  };
}

export interface IngestionLog {
  id: string;
  timestamp: string;
  sourceName: string;
  status: 'success' | 'failed' | 'processing';
  chunksCount: number;
  durationMs: number;
  errorDetail?: string;
}

export interface Message {
  id: string;
  sender: 'customer' | 'agent' | 'bot' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
  translatedText?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface Conversation {
  id: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAvatar?: string;
  channel: 'whatsapp' | 'web' | 'voice' | 'email' | 'instagram' | 'messenger';
  lastMessage: string;
  lastMessageTime: string;
  status: 'unassigned' | 'active' | 'resolved' | 'escalated';
  agentId?: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  messages: Message[];
  slaStatus: 'within_sla' | 'breached' | 'warning';
  slaDeadline: string;
  language: 'en' | 'ar';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  unreadCount?: number;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  customerName: string;
  customerEmail: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'pending' | 'solved' | 'closed';
  assignedAgentId?: string;
  category: string;
  createdAt: string;
  slaBreachTime: string;
  messages: Message[];
}

export interface Agent {
  id: string;
  name: string;
  avatarUrl: string;
  email: string;
  status: 'online' | 'offline' | 'busy' | 'away';
  activeChatsCount: number;
  maxChatsCount: number;
  csatScore: number; // percentage
  resolvedTicketsCount: number;
  lastActive: string;
}

export type QAStatus =
  | 'pending'
  | 'in_calibration'
  | 'disputed'
  | 'approved'
  | 'escalated'
  | 'coaching_assigned'
  | 'completed';

export interface QAReviewHistoryItem {
  status: QAStatus;
  date: string;
  updatedBy: string;
  notes?: string;
}

export interface QAReview {
  id: string;
  conversationId: string;
  agentName: string;
  supervisorName: string;
  score: number; // out of 100
  status: QAStatus;
  date: string;
  positives: string[];
  negatives: string[];
  coachingPoints: string[];
  
  // Extended properties for Sprint 6 workflow depth
  scorecardMetrics?: {
    compliance: number;
    empathy: number;
    technical: number;
    resolution: number;
  };
  disputeReason?: string;
  disputeResponse?: string;
  supervisorNotes?: string;
  sentimentBreakdown?: {
    positive: number;
    neutral: number;
    negative: number;
  };
  resolutionQuality?: 'resolved' | 'unresolved' | 'partially_resolved';
  slaContext?: {
    met: boolean;
    actualDuration: string;
    targetLimit: string;
  };
  historyTimeline?: QAReviewHistoryItem[];
}

export interface SLARule {
  id: string;
  name: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  responseTimeMins: number;
  resolutionTimeMins: number;
  active: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  ipAddress: string;
  status: 'success' | 'failed';
}

export interface CallLog {
  id: string;
  customerName: string;
  phoneNumber: string;
  durationSec: number;
  direction: 'inbound' | 'outbound';
  status: 'completed' | 'missed' | 'voicemail';
  recordingUrl?: string;
  transcript: string;
  aiSummary: string;
  timestamp: string;
}
