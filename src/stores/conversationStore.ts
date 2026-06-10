'use client';

import { create } from 'zustand';
import {
  Conversation,
  Message,
  TransferState,
  Participant,
  ConferenceState,
  ConsultationState,
  EscalationState,
  AuditEvent,
  SupervisorRecommendation,
  CopilotVariant,
  OrchestrationEvent,
  ResolutionWorkflow,
  ComplianceValidation,
  WrapupAnalytics
} from '@/types';
import { conversationsSeed } from '@/data/seed/conversationsSeed';
import { InboxTab, StatusFilter } from '@/hooks/useInboxFilters';
import {
  CopilotSuggestion,
  KnowledgeArticle,
  DetectedIntent,
  WrapupRecommendation,
  EscalationRecommendation,
  analyzeConversation
} from '@/utils/copilotEngine';

// ─── Singleton Realtime Ticker ────────────────────────────────────────────────
// A file-level singleton timer and reference counter that ensures only one
// setInterval ever executes tickRealtimeSystems at a time, even if the
// AgentWorkspaceLayout mounts multiple times during navigation.
let _tickerIntervalId: ReturnType<typeof setInterval> | null = null;
let _tickerRefCount = 0;
// Lazily populated once the store is created (set at bottom of file).
let _tickFn: (() => void) | null = null;

/**
 * Register the tick function. Called once when the store is first created.
 * Using a lazy registration avoids circular module-level references.
 */
export function _registerTickFn(fn: () => void): void {
  _tickFn = fn;
}

/**
 * Start the global realtime ticker.
 * Safe to call multiple times — uses a ref counter so only one interval runs.
 */
export function startRealtimeTicker(): void {
  _tickerRefCount++;
  if (_tickerIntervalId !== null) return; // Already running
  _tickerIntervalId = setInterval(() => {
    _tickFn?.();
  }, 1000);
}

/**
 * Stop the global realtime ticker.
 * Only tears down the interval when the last consumer unmounts.
 */
export function stopRealtimeTicker(): void {
  _tickerRefCount = Math.max(0, _tickerRefCount - 1);
  if (_tickerRefCount === 0 && _tickerIntervalId !== null) {
    clearInterval(_tickerIntervalId);
    _tickerIntervalId = null;
  }
}
// ─────────────────────────────────────────────────────────────────────────────


export interface StagedAttachment {
  id: string;
  name: string;
  url: string;
  sizeBytes: number;
  type: 'image' | 'pdf' | 'doc' | 'generic';
}

export interface QueueFilters {
  activeTab: InboxTab;
  statusFilter: StatusFilter;
  selectedQueue: string;
  searchQuery: string;
}

export interface SlaState {
  timeLeft: string;
  status: 'within_sla' | 'breached' | 'warning';
}

export interface QueueActivityMetric {
  count: number;
  activeAgentCount: number;
  avgWaitMins: number;
  status: 'stable' | 'congested' | 'critical';
}

export interface LiveInteractionState {
  viewerCount: number;
  activeAgents: string[];
}

interface ConversationState {
  // State Domains
  activeConversationId: string | null;
  conversations: Record<string, Conversation>;
  drafts: Record<string, string>;
  typingStates: Record<string, boolean>;
  presenceStates: Record<string, 'online' | 'away' | 'busy' | 'offline'>;
  unreadCounts: Record<string, number>;
  queueFilters: QueueFilters;

  // Phase 3 extensions
  composerModes: Record<string, 'reply' | 'internal_note' | 'email_reply' | 'wrapup_note'>;
  stagedAttachments: Record<string, StagedAttachment[]>;
  activeTones: Record<string, 'professional' | 'empathetic' | 'concise' | 'escalation-ready'>;
  rewriteStates: Record<string, 'idle' | 'rewriting' | 'success' | 'error'>;
  originalDrafts: Record<string, string>;
  macroInsertions: Record<string, string[]>;
  appliedSuggestions: Record<string, string[]>;

  // Phase 4 extensions
  slaStates: Record<string, SlaState>;
  slaSeconds: Record<string, number>;
  activityStates: Record<string, { lastActivityTimestamp: number }>;
  idleStates: Record<string, boolean>;
  queueActivity: Record<string, QueueActivityMetric>;
  liveInteractionStates: Record<string, LiveInteractionState>;

  // Phase 5 extensions
  copilotSuggestions: Record<string, CopilotSuggestion[]>;
  knowledgeArticles: Record<string, KnowledgeArticle[]>;
  intentStates: Record<string, DetectedIntent>;
  sentimentStates: Record<string, 'positive' | 'neutral' | 'negative'>;
  copilotLoadingStates: Record<string, boolean>;
  wrapupRecommendations: Record<string, WrapupRecommendation[]>;
  escalationRecommendations: Record<string, EscalationRecommendation[]>;
  suggestionStreams: Record<string, { streaming: boolean; completed: boolean }>;
  orchestrationEvents: Record<string, OrchestrationEvent[]>;
  copilotVariants: Record<string, CopilotVariant[]>;
  activeVariantIndex: Record<string, number>;

  // Phase 6 extensions
  transferStates: Record<string, TransferState>;
  conferenceStates: Record<string, ConferenceState>;
  consultationStates: Record<string, ConsultationState>;
  escalationStates: Record<string, EscalationState>;
  activeParticipants: Record<string, Participant[]>;
  queueAssignments: Record<string, string>;
  auditEvents: Record<string, AuditEvent[]>;
  supervisorRecommendations: Record<string, SupervisorRecommendation[]>;

  // Wrap-up Completion State Domains
  wrapupAuditEvents: Record<string, AuditEvent[]>;
  resolutionWorkflows: Record<string, ResolutionWorkflow>;
  complianceValidation: Record<string, ComplianceValidation>;
  wrapupAnalytics: Record<string, WrapupAnalytics>;

  // Actions
  setActiveConversation: (id: string | null) => void;
  appendOptimisticMessage: (
    conversationId: string,
    text: string,
    sender: 'customer' | 'agent' | 'bot' | 'system',
    senderName: string,
    attachments?: StagedAttachment[]
  ) => string; // Returns tempId
  commitMessage: (conversationId: string, tempId: string, finalMessage: Message) => void;
  failMessage: (conversationId: string, tempId: string) => void;
  retryMessage: (
    conversationId: string,
    tempId: string,
    sendFn: (text: string) => Promise<Message>
  ) => Promise<void>;
  saveDraft: (conversationId: string, text: string) => void;
  restoreDraft: (conversationId: string) => string;
  setTypingState: (conversationId: string, isTyping: boolean) => void;
  clearTypingState: (conversationId: string) => void;
  markConversationRead: (conversationId: string) => void;
  setConversations: (
    conversations: Record<string, Conversation> | ((prev: Record<string, Conversation>) => Record<string, Conversation>)
  ) => void;

  // Phase 3 actions
  setComposerMode: (conversationId: string, mode: 'reply' | 'internal_note' | 'email_reply' | 'wrapup_note') => void;
  stageAttachment: (conversationId: string, attachment: StagedAttachment) => void;
  removeStagedAttachment: (conversationId: string, attachmentId: string) => void;
  clearStagedAttachments: (conversationId: string) => void;
  setActiveTone: (conversationId: string, tone: 'professional' | 'empathetic' | 'concise' | 'escalation-ready') => void;
  setRewriteState: (conversationId: string, state: 'idle' | 'rewriting' | 'success' | 'error') => void;
  saveOriginalDraft: (conversationId: string, draftText: string) => void;
  restoreOriginalDraft: (conversationId: string) => void;
  clearOriginalDraft: (conversationId: string) => void;
  trackMacroInsertion: (conversationId: string, macroValue: string) => void;
  setAppliedSuggestion: (conversationId: string, suggestion: string) => void;

  // Phase 4 actions
  setPresenceState: (conversationId: string, presence: 'online' | 'away' | 'busy' | 'offline') => void;
  setConversationActivity: (conversationId: string) => void;
  tickRealtimeSystems: () => void;
  setIdleState: (conversationId: string, isIdle: boolean) => void;
  clearIdleState: (conversationId: string) => void;
  updateQueueActivity: (queueId: string, count: number, activeAgentCount: number) => void;
  simulateIncomingMessage: (conversationId: string, text: string) => void;
  simulateTypingEvent: (conversationId: string, isTyping: boolean) => void;

  // Phase 5 actions
  generateCopilotSuggestions: (conversationId: string) => void;
  streamSuggestionChunk: (conversationId: string, chunk: CopilotSuggestion) => void;
  completeSuggestionStream: (conversationId: string) => void;
  detectConversationIntent: (conversationId: string) => void;
  generateWrapupRecommendations: (conversationId: string) => void;
  generateEscalationRecommendations: (conversationId: string) => void;
  clearConversationRecommendations: (conversationId: string) => void;
  applySuggestion: (conversationId: string, suggestionId: string) => void;
  dismissSuggestion: (conversationId: string, suggestionId: string) => void;
  setActiveVariantIndex: (conversationId: string, index: number) => void;

  // Phase 6 actions
  startTransfer: (conversationId: string, targetQueue: string, assignee?: string, notes?: string) => void;
  completeTransfer: (conversationId: string) => void;
  cancelTransfer: (conversationId: string) => void;
  startConference: (conversationId: string, participants: Participant[]) => void;
  removeConferenceParticipant: (conversationId: string, participantId: string) => void;
  endConference: (conversationId: string) => void;
  startSupervisorConsult: (conversationId: string, supervisorId: string, notes?: string) => void;
  endSupervisorConsult: (conversationId: string) => void;
  triggerEscalation: (conversationId: string, escalationType: EscalationState['type']) => void;
  resolveEscalation: (conversationId: string) => void;
  appendAuditEvent: (conversationId: string, event: AuditEvent) => void;
  updateQueueAssignment: (conversationId: string, queueId: string) => void;

  // Queue Filter Actions
  setActiveTab: (tab: InboxTab) => void;
  setStatusFilter: (status: StatusFilter) => void;
  setSelectedQueue: (queueId: string) => void;
  setSearchQuery: (query: string) => void;

  // Wrap-up Completion Actions
  updateResolutionWorkflow: (conversationId: string, workflow: Partial<ResolutionWorkflow>) => void;
  validateCompliance: (conversationId: string) => void;
  applyWrapupRecommendation: (conversationId: string, recommendation: WrapupRecommendation) => void;
  generateResolutionSummary: (conversationId: string) => void;
  appendWrapupAuditEvent: (conversationId: string, message: string) => void;
  clearWrapupTimers: (conversationId: string) => void;
}

// Simulated active timeouts map for typing state
const typingTimeouts: Record<string, NodeJS.Timeout> = {};
const copilotTimeouts: Record<string, NodeJS.Timeout[]> = {};

function clearCopilotTimeouts(conversationId: string) {
  const timeouts = copilotTimeouts[conversationId];
  if (timeouts) {
    timeouts.forEach((t) => clearTimeout(t));
    delete copilotTimeouts[conversationId];
  }
}

// Temporal de-duplication cache for audit events
const lastAuditEvents: Record<string, { type: string; message: string; timeMs: number }> = {};

function isDuplicateAudit(conversationId: string, type: string, message: string): boolean {
  const key = `${conversationId}:${type}:${message}`;
  const now = Date.now();
  const last = lastAuditEvents[key];
  if (last && now - last.timeMs < 1500) {
    return true;
  }
  lastAuditEvents[key] = { type, message, timeMs: now };
  return false;
}

// Cache for customer message texts to prevent redundant copilot streaming updates
const lastAnalyzedText: Record<string, string> = {};

// Initialize conversations from seed
const initialConversations = conversationsSeed.reduce((acc, conv) => {
  acc[conv.id] = conv;
  return acc;
}, {} as Record<string, Conversation>);

// Initialize unread counts
const initialUnreadCounts = conversationsSeed.reduce((acc, conv) => {
  acc[conv.id] = conv.unreadCount ?? 0;
  return acc;
}, {} as Record<string, number>);

// Initialize presence states
const initialPresenceStates = conversationsSeed.reduce((acc, conv) => {
  const isOnlineChannel =
    conv.channel === 'whatsapp' ||
    conv.channel === 'web' ||
    conv.channel === 'instagram' ||
    conv.channel === 'messenger';
  acc[conv.id] = isOnlineChannel ? ('online' as const) : ('offline' as const);
  return acc;
}, {} as Record<string, 'online' | 'away' | 'busy' | 'offline'>);

export const useConversationStore = create<ConversationState>()((set, get) => {
  // Lazily restore drafts from sessionStorage on client-side
  const getInitialDrafts = (): Record<string, string> => {
    if (typeof window === 'undefined') return {};
    const restored: Record<string, string> = {};
    try {
      conversationsSeed.forEach((conv) => {
        const val = sessionStorage.getItem(`drafts:${conv.id}`);
        if (val) {
          restored[conv.id] = val;
        }
      });
    } catch (e) {
      console.error('Failed to access sessionStorage for drafts', e);
    }
    return restored;
  };

  return {
    // State
    activeConversationId: 'conv-102', // Default active conversation
    conversations: initialConversations,
    drafts: getInitialDrafts(),
    typingStates: {},
    presenceStates: initialPresenceStates,
    unreadCounts: initialUnreadCounts,
    queueFilters: {
      activeTab: 'all',
      statusFilter: 'all',
      selectedQueue: 'q-all',
      searchQuery: '',
    },

    // Phase 3 extensions initial state
    composerModes: conversationsSeed.reduce((acc, conv) => {
      acc[conv.id] = conv.channel === 'email' ? 'email_reply' : 'reply';
      return acc;
    }, {} as Record<string, 'reply' | 'internal_note' | 'email_reply' | 'wrapup_note'>),
    stagedAttachments: {},
    activeTones: {},
    rewriteStates: {},
    originalDrafts: {},
    macroInsertions: {},
    appliedSuggestions: {},

    // Phase 4 extensions initial state
    slaSeconds: conversationsSeed.reduce((acc, conv) => {
      acc[conv.id] = conv.slaStatus === 'breached' ? 0 : conv.slaStatus === 'warning' ? 225 : 1692;
      return acc;
    }, {} as Record<string, number>),

    slaStates: conversationsSeed.reduce((acc, conv) => {
      const seconds = conv.slaStatus === 'breached' ? 0 : conv.slaStatus === 'warning' ? 225 : 1692;
      const formatTime = (sec: number) => {
        if (sec <= 0) return '00:00';
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      };
      acc[conv.id] = {
        timeLeft: formatTime(seconds),
        status: conv.slaStatus,
      };
      return acc;
    }, {} as Record<string, SlaState>),

    activityStates: conversationsSeed.reduce((acc, conv) => {
      acc[conv.id] = { lastActivityTimestamp: Date.now() };
      return acc;
    }, {} as Record<string, { lastActivityTimestamp: number }>),

    idleStates: {},

    queueActivity: {
      'q-all': { count: 6, activeAgentCount: 4, avgWaitMins: 4, status: 'stable' },
      'q-vip': { count: 2, activeAgentCount: 1, avgWaitMins: 1, status: 'critical' },
      'q-telco': { count: 1, activeAgentCount: 2, avgWaitMins: 3, status: 'stable' },
      'q-default': { count: 3, activeAgentCount: 3, avgWaitMins: 8, status: 'stable' }
    },

    liveInteractionStates: conversationsSeed.reduce((acc, conv) => {
      acc[conv.id] = { viewerCount: 1, activeAgents: ['Liam Bennett'] };
      return acc;
    }, {} as Record<string, LiveInteractionState>),

    copilotSuggestions: {},
    knowledgeArticles: {},
    intentStates: {},
    sentimentStates: {},
    copilotLoadingStates: {},
    wrapupRecommendations: {},
    escalationRecommendations: {},
    suggestionStreams: {},
    orchestrationEvents: {},
    copilotVariants: {},
    activeVariantIndex: {},

    // Phase 6 extensions
    transferStates: {},
    conferenceStates: {},
    consultationStates: {},
    escalationStates: {},
    activeParticipants: {},
    queueAssignments: conversationsSeed.reduce((acc, conv) => {
      acc[conv.id] = conv.priority === 'urgent' ? 'q-vip' : 'q-default';
      return acc;
    }, {} as Record<string, string>),
    auditEvents: {},
    supervisorRecommendations: {},

    // Wrap-up Completion initial state
    wrapupAuditEvents: {},
    resolutionWorkflows: {},
    complianceValidation: {},
    wrapupAnalytics: {},

    // Actions
    setActiveConversation: (id) => {
      set({ activeConversationId: id });
      if (id) {
        get().markConversationRead(id);
      }
    },

    appendOptimisticMessage: (conversationId, text, sender, senderName, attachments) => {
      const tempId = `temp-${Date.now()}`;
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const staged = attachments || get().stagedAttachments[conversationId] || [];

      const optimisticMessage: Message = {
        id: tempId,
        sender,
        senderName,
        text,
        timestamp,
        status: 'sending', // Optimistic status
        attachments: staged.length > 0 ? staged : undefined,
      };

      set((state) => {
        const conversations = { ...state.conversations };
        const conv = conversations[conversationId];
        if (conv) {
          conversations[conversationId] = {
            ...conv,
            lastMessage: text,
            lastMessageTime: timestamp,
            messages: [...conv.messages, optimisticMessage],
          };
        }
        return { conversations };
      });

      return tempId;
    },

    commitMessage: (conversationId, tempId, finalMessage) => {
      set((state) => {
        const conversations = { ...state.conversations };
        const conv = conversations[conversationId];
        if (conv) {
          const messages = conv.messages.map((m) =>
            m.id === tempId
              ? {
                  ...finalMessage,
                  attachments: finalMessage.attachments || m.attachments,
                  status: 'sent' as const,
                }
              : m
          );
          conversations[conversationId] = {
            ...conv,
            messages,
          };
        }
        return { conversations };
      });
    },

    failMessage: (conversationId, tempId) => {
      set((state) => {
        const conversations = { ...state.conversations };
        const conv = conversations[conversationId];
        if (conv) {
          const messages = conv.messages.map((m) =>
            m.id === tempId ? { ...m, status: 'failed' as const } : m
          );
          conversations[conversationId] = {
            ...conv,
            messages,
          };
        }
        return { conversations };
      });
    },

    retryMessage: async (conversationId, tempId, sendFn) => {
      // Transition message back to sending
      set((state) => {
        const conversations = { ...state.conversations };
        const conv = conversations[conversationId];
        if (conv) {
          const messages = conv.messages.map((m) =>
            m.id === tempId ? { ...m, status: 'sending' as const } : m
          );
          conversations[conversationId] = {
            ...conv,
            messages,
          };
        }
        return { conversations };
      });

      const messageToRetry = get().conversations[conversationId]?.messages.find(
        (m) => m.id === tempId
      );

      if (!messageToRetry) return;

      try {
        const finalMessage = await sendFn(messageToRetry.text);
        get().commitMessage(conversationId, tempId, finalMessage);
      } catch (error) {
        get().failMessage(conversationId, tempId);
      }
    },

    saveDraft: (conversationId, text) => {
      set((state) => ({
        drafts: {
          ...state.drafts,
          [conversationId]: text,
        },
      }));

      if (typeof window !== 'undefined') {
        try {
          if (text) {
            sessionStorage.setItem(`drafts:${conversationId}`, text);
          } else {
            sessionStorage.removeItem(`drafts:${conversationId}`);
          }
        } catch (e) {
          console.error('Failed to write draft to sessionStorage', e);
        }
      }
    },

    restoreDraft: (conversationId) => {
      const cached = get().drafts[conversationId];
      if (cached !== undefined) return cached;

      if (typeof window !== 'undefined') {
        try {
          return sessionStorage.getItem(`drafts:${conversationId}`) ?? '';
        } catch (e) {
          console.error('Failed to restore draft from sessionStorage', e);
        }
      }
      return '';
    },

    setTypingState: (conversationId, isTyping) => {
      // Clear any existing timeout for this conversation
      if (typingTimeouts[conversationId]) {
        clearTimeout(typingTimeouts[conversationId]);
        delete typingTimeouts[conversationId];
      }

      set((state) => ({
        typingStates: {
          ...state.typingStates,
          [conversationId]: isTyping,
        },
      }));

      // Setup 6-second automatic idle cleanup
      if (isTyping) {
        typingTimeouts[conversationId] = setTimeout(() => {
          get().clearTypingState(conversationId);
        }, 6000);
      }
    },

    clearTypingState: (conversationId) => {
      if (typingTimeouts[conversationId]) {
        clearTimeout(typingTimeouts[conversationId]);
        delete typingTimeouts[conversationId];
      }

      set((state) => ({
        typingStates: {
          ...state.typingStates,
          [conversationId]: false,
        },
      }));
    },

    markConversationRead: (conversationId) => {
      set((state) => {
        const conversations = { ...state.conversations };
        const conv = conversations[conversationId];
        const unreadCounts = { ...state.unreadCounts };

        if (conv) {
          conversations[conversationId] = {
            ...conv,
            unreadCount: 0,
          };
        }
        unreadCounts[conversationId] = 0;

        return { conversations, unreadCounts };
      });
    },

    setConversations: (update) => {
      set((state) => {
        const newConversations = typeof update === 'function' ? update(state.conversations) : update;
        
        // Keep unread counts in sync
        const newUnreadCounts = { ...state.unreadCounts };
        Object.keys(newConversations).forEach((id) => {
          newUnreadCounts[id] = newConversations[id].unreadCount ?? 0;
        });

        return { conversations: newConversations, unreadCounts: newUnreadCounts };
      });
    },

    // Phase 3 actions
    setComposerMode: (conversationId, mode) => {
      set((state) => ({
        composerModes: {
          ...state.composerModes,
          [conversationId]: mode,
        },
      }));
    },

    stageAttachment: (conversationId, attachment) => {
      set((state) => {
        const current = state.stagedAttachments[conversationId] || [];
        return {
          stagedAttachments: {
            ...state.stagedAttachments,
            [conversationId]: [...current, attachment],
          },
        };
      });
    },

    removeStagedAttachment: (conversationId, attachmentId) => {
      set((state) => {
        const current = state.stagedAttachments[conversationId] || [];
        const toRemove = current.find((a) => a.id === attachmentId);
        if (toRemove && toRemove.url && toRemove.url.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(toRemove.url);
          } catch (err) {
            console.error('Failed to revoke object URL', err);
          }
        }
        return {
          stagedAttachments: {
            ...state.stagedAttachments,
            [conversationId]: current.filter((a) => a.id !== attachmentId),
          },
        };
      });
    },

    clearStagedAttachments: (conversationId) => {
      set((state) => {
        const current = state.stagedAttachments[conversationId] || [];
        current.forEach((a) => {
          if (a.url && a.url.startsWith('blob:')) {
            try {
              URL.revokeObjectURL(a.url);
            } catch (err) {
              console.error('Failed to revoke object URL', err);
            }
          }
        });
        return {
          stagedAttachments: {
            ...state.stagedAttachments,
            [conversationId]: [],
          },
        };
      });
    },

    setActiveTone: (conversationId, tone) => {
      set((state) => ({
        activeTones: {
          ...state.activeTones,
          [conversationId]: tone,
        },
      }));
    },

    setRewriteState: (conversationId, rewriteState) => {
      set((state) => ({
        rewriteStates: {
          ...state.rewriteStates,
          [conversationId]: rewriteState,
        },
      }));
    },

    saveOriginalDraft: (conversationId, draftText) => {
      set((state) => ({
        originalDrafts: {
          ...state.originalDrafts,
          [conversationId]: draftText,
        },
      }));
    },

    restoreOriginalDraft: (conversationId) => {
      const original = get().originalDrafts[conversationId];
      if (original !== undefined) {
        get().saveDraft(conversationId, original);
        get().clearOriginalDraft(conversationId);
      }
    },

    clearOriginalDraft: (conversationId) => {
      set((state) => {
        const next = { ...state.originalDrafts };
        delete next[conversationId];
        return { originalDrafts: next };
      });
    },

    trackMacroInsertion: (conversationId, macroValue) => {
      set((state) => {
        const current = state.macroInsertions[conversationId] || [];
        return {
          macroInsertions: {
            ...state.macroInsertions,
            [conversationId]: [...current, macroValue],
          },
        };
      });
    },

    setAppliedSuggestion: (conversationId, suggestion) => {
      set((state) => {
        const current = state.appliedSuggestions[conversationId] || [];
        return {
          appliedSuggestions: {
            ...state.appliedSuggestions,
            [conversationId]: [...current, suggestion],
          },
        };
      });
    },

    // Phase 4 actions
    setPresenceState: (conversationId, presence) => {
      set((state) => ({
        presenceStates: {
          ...state.presenceStates,
          [conversationId]: presence,
        },
      }));
    },

    setConversationActivity: (conversationId) => {
      set((state) => ({
        activityStates: {
          ...state.activityStates,
          [conversationId]: { lastActivityTimestamp: Date.now() },
        },
        idleStates: {
          ...state.idleStates,
          [conversationId]: false,
        },
      }));
    },

    tickRealtimeSystems: () => {
      const now = Date.now();
      set((state) => {
        const slaSeconds = { ...state.slaSeconds };
        const slaStates = { ...state.slaStates };
        const idleStates = { ...state.idleStates };
        const conversations = { ...state.conversations };
        const queueActivity = { ...state.queueActivity };

        const formatTime = (sec: number) => {
          if (sec <= 0) return '00:00';
          const m = Math.floor(sec / 60);
          const s = sec % 60;
          return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        };

        // 1. Tick SLA countdowns
        Object.keys(slaSeconds).forEach((id) => {
          const conv = conversations[id];
          if (conv && conv.status !== 'resolved') {
            let sec = slaSeconds[id];
            if (sec > 0) {
              sec -= 1;
              slaSeconds[id] = sec;
            }

            let status: 'within_sla' | 'warning' | 'breached' = 'within_sla';
            if (sec <= 0) {
              status = 'breached';
            } else if (sec <= 300) {
              status = 'warning';
            }

            slaStates[id] = {
              timeLeft: formatTime(sec),
              status,
            };

            if (conv.slaStatus !== status) {
              conversations[id] = {
                ...conv,
                slaStatus: status,
              };
            }
          }
        });

        // 2. Tick Inactivity sweeps (idle banner trigger at 30 seconds)
        Object.keys(state.activityStates).forEach((id) => {
          const lastActivity = state.activityStates[id]?.lastActivityTimestamp || now;
          const elapsed = now - lastActivity;
          const conv = conversations[id];

          if (conv && conv.status !== 'resolved') {
            if (elapsed >= 30000) {
              idleStates[id] = true;
            } else {
              idleStates[id] = false;
            }
          }
        });

        // 3. Queue Activity shifts (every 10 seconds)
        const secTicker = Math.floor(now / 1000);
        if (secTicker % 10 === 0) {
          Object.keys(queueActivity).forEach((qId) => {
            const queue = queueActivity[qId];
            if (queue) {
              const change = Math.random() > 0.5 ? 1 : -1;
              const newCount = Math.max(1, Math.min(10, queue.count + change));
              queueActivity[qId] = {
                ...queue,
                count: newCount,
              };
            }
          });
        }

        return {
          slaSeconds,
          slaStates,
          conversations,
          idleStates,
          queueActivity,
        };
      });
    },

    setIdleState: (conversationId, isIdle) => {
      set((state) => ({
        idleStates: {
          ...state.idleStates,
          [conversationId]: isIdle,
        },
      }));
    },

    clearIdleState: (conversationId) => {
      get().setConversationActivity(conversationId);
    },

    updateQueueActivity: (queueId, count, activeAgentCount) => {
      set((state) => {
        const queue = state.queueActivity[queueId];
        if (!queue) return {};
        return {
          queueActivity: {
            ...state.queueActivity,
            [queueId]: {
              ...queue,
              count,
              activeAgentCount,
            },
          },
        };
      });
    },

    simulateIncomingMessage: (conversationId, text) => {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const incomingMessage: Message = {
        id: `sim-${Date.now()}`,
        sender: 'customer',
        senderName: get().conversations[conversationId]?.customerName || 'Customer',
        text,
        timestamp,
      };

      set((state) => {
        const conversations = { ...state.conversations };
        const conv = conversations[conversationId];
        const unreadCounts = { ...state.unreadCounts };

        if (conv) {
          conversations[conversationId] = {
            ...conv,
            lastMessage: text,
            lastMessageTime: timestamp,
            messages: [...conv.messages, incomingMessage],
            unreadCount: (conv.unreadCount || 0) + 1,
          };
          unreadCounts[conversationId] = (unreadCounts[conversationId] || 0) + 1;
        }

        return {
          conversations,
          unreadCounts,
          typingStates: {
            ...state.typingStates,
            [conversationId]: false,
          },
          presenceStates: {
            ...state.presenceStates,
            [conversationId]: 'online',
          },
        };
      });

      get().setConversationActivity(conversationId);
    },

    simulateTypingEvent: (conversationId, isTyping) => {
      get().setTypingState(conversationId, isTyping);
      if (isTyping) {
        get().setPresenceState(conversationId, 'online');
      }
    },

    generateCopilotSuggestions: (conversationId) => {
      const conv = get().conversations[conversationId];
      const messages = conv ? conv.messages : [];
      const customerMessages = messages.filter(m => m.sender === 'customer');
      const fullText = customerMessages.map(m => m.text).join(' ').toLowerCase();

      // Prevent redundant streaming updates if customer messages have not changed
      if (lastAnalyzedText[conversationId] === fullText) {
        return;
      }
      lastAnalyzedText[conversationId] = fullText;

      clearCopilotTimeouts(conversationId);
      copilotTimeouts[conversationId] = [];

      const addTimeout = (fn: () => void, delay: number) => {
        const t = setTimeout(fn, Math.max(1, delay));
        if (!copilotTimeouts[conversationId]) {
          copilotTimeouts[conversationId] = [];
        }
        copilotTimeouts[conversationId].push(t);
      };

      set((state) => ({
        copilotLoadingStates: {
          ...state.copilotLoadingStates,
          [conversationId]: true
        },
        suggestionStreams: {
          ...state.suggestionStreams,
          [conversationId]: { streaming: true, completed: false }
        },
        copilotSuggestions: {
          ...state.copilotSuggestions,
          [conversationId]: []
        },
        copilotVariants: {
          ...state.copilotVariants,
          [conversationId]: []
        },
        activeVariantIndex: {
          ...state.activeVariantIndex,
          [conversationId]: 0
        },
        orchestrationEvents: {
          ...state.orchestrationEvents,
          [conversationId]: [
            { id: 'evt-1', event: 'Intent classified', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), status: 'pending' },
            { id: 'evt-2', event: 'Sentiment recalculated', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), status: 'pending' },
            { id: 'evt-3', event: 'Compliance scan complete', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), status: 'pending' },
            { id: 'evt-4', event: 'Knowledge articles matched', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), status: 'pending' },
            { id: 'evt-5', event: 'Escalation recommendation generated', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), status: 'pending' },
            { id: 'evt-6', event: 'Supervisor notification triggered', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), status: 'pending' }
          ]
        }
      }));

      const slaState = get().slaStates[conversationId];
      const result = analyzeConversation(messages, slaState?.status || conv?.slaStatus);
      const intentName = result.intent.name;

      // Auto-escalation/routing trigger: shift to VIP Queue when sentiment is negative and SLA is warning/breached
      const currentSeconds = get().slaSeconds[conversationId];
      const isLowSla = currentSeconds !== undefined && currentSeconds <= 300; // warning threshold (under 5 mins)
      const isNegative = result.sentiment === 'negative';
      const isAlreadyVip = get().queueAssignments[conversationId] === 'q-vip';

      if (isNegative && isLowSla && !isAlreadyVip && conv && conv.status !== 'resolved') {
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        set((state) => {
          const conversations = { ...state.conversations };
          const targetConv = conversations[conversationId];
          if (targetConv) {
            const systemMsg: Message = {
              id: `msg-sys-auto-${Date.now()}`,
              sender: 'system',
              senderName: 'System',
              text: 'Conversation automatically routed to VIP Queue (SLA & Sentiment Warning)',
              timestamp,
              messageType: 'system'
            };
            conversations[conversationId] = {
              ...targetConv,
              status: 'escalated',
              priority: 'urgent',
              messages: [...targetConv.messages, systemMsg]
            };
          }

          const currentAudits = state.auditEvents[conversationId] || [];
          const auditMsg = 'Auto-routed to VIP Queue due to negative sentiment and SLA warning threshold.';
          const newAudits = isDuplicateAudit(conversationId, 'escalation_triggered', auditMsg)
            ? currentAudits
            : [...currentAudits, {
                id: `audit-${Date.now()}`,
                type: 'escalation_triggered',
                message: auditMsg,
                timestamp,
                actor: 'System/Copilot'
              }];

          const recs: SupervisorRecommendation[] = [
            { id: 'rec-1', title: 'Schedule Tier-2 Supervisor Callback', description: 'Due to severe refund dispute sentiment risk.', actionType: 'consult', confidence: 94 },
            { id: 'rec-2', title: 'Reroute to Escalation Desk', description: 'Urgent queue assignment bypass requested.', actionType: 'transfer', confidence: 88 }
          ];

          return {
            conversations,
            queueAssignments: {
              ...state.queueAssignments,
              [conversationId]: 'q-vip'
            },
            escalationStates: {
              ...state.escalationStates,
              [conversationId]: {
                status: 'escalated',
                type: 'sentiment_risk',
                escalatedAt: timestamp
              }
            },
            supervisorRecommendations: {
              ...state.supervisorRecommendations,
              [conversationId]: recs
            },
            auditEvents: {
              ...state.auditEvents,
              [conversationId]: newAudits
            }
          };
        });
      }

      set((state) => ({
        intentStates: {
          ...state.intentStates,
          [conversationId]: result.intent
        },
        sentimentStates: {
          ...state.sentimentStates,
          [conversationId]: result.sentiment
        },
        knowledgeArticles: {
          ...state.knowledgeArticles,
          [conversationId]: result.articles
        },
        wrapupRecommendations: {
          ...state.wrapupRecommendations,
          [conversationId]: result.wrapup
        },
        escalationRecommendations: {
          ...state.escalationRecommendations,
          [conversationId]: result.escalations
        }
      }));

      // Stream the 6 orchestration timeline events in staggered steps
      const baseEvents = [
        'Intent classified',
        'Sentiment recalculated',
        'Compliance scan complete',
        'Knowledge articles matched',
        'Escalation recommendation generated',
        'Supervisor notification triggered'
      ];

      baseEvents.forEach((evtName, index) => {
        addTimeout(() => {
          set((state) => {
            const currentEvents = state.orchestrationEvents[conversationId] || [];
            const updated = currentEvents.map((evt) =>
              evt.event === evtName ? { ...evt, status: 'completed' as const } : evt
            );
            return {
              orchestrationEvents: {
                ...state.orchestrationEvents,
                [conversationId]: updated
              }
            };
          });
        }, (index + 1) * 150);
      });

      // Construct tone variants
      const variants: CopilotVariant[] = [
        {
          tone: 'professional',
          text: intentName === 'refund_request' 
            ? 'Under standard Return & Exchange policy ks-1, refunds are limited to 30 days. However, since the unit was received damaged, we can process a full exception for you.'
            : intentName === 'payment_failure'
            ? 'Checking Stripe logs for transaction errors. Let me retry the subscription capture manually.'
            : 'Thank you for reaching out. Let me check the database system to confirm your active service key.',
          confidence: 94,
          hallucinationRisk: 'low',
          complianceConfidence: 99,
          toneAlignmentScore: 98,
          readability: 'Grade 8 (Standard)',
          empathyScore: 85,
          professionalismScore: 95,
          resolutionLikelihood: 90,
          citations: [
            { source: 'refund_policy.pdf', kbId: 'KB-8821', similarity: 99, chunk: 'Section 4.2: Customer refunds are permitted within 30 days.' }
          ]
        },
        {
          tone: 'empathetic',
          text: intentName === 'refund_request'
            ? 'I truly understand how frustrating a damaged delivery can be. Let me resolve this exception right away under return policy ks-1 and process a full refund.'
            : intentName === 'payment_failure'
            ? 'I apologize for the transaction issue you experienced. Let me check the payment logs right away.'
            : 'I understand you need assistance. I am happy to search the records to check your active service key status.',
          confidence: 92,
          hallucinationRisk: 'low',
          complianceConfidence: 98,
          toneAlignmentScore: 99,
          readability: 'Grade 6 (Easy)',
          empathyScore: 98,
          professionalismScore: 88,
          resolutionLikelihood: 92,
          citations: [
            { source: 'refund_policy.pdf', kbId: 'KB-8821', similarity: 99, chunk: 'Section 4.2: Customer refunds are permitted within 30 days.' }
          ]
        },
        {
          tone: 'executive',
          text: intentName === 'refund_request'
            ? 'We have authorized a standard policy exception for refund request INV-2026-7891 under the damaged item provision.'
            : intentName === 'payment_failure'
            ? 'We are retrying subscription capture manually via Stripe gateway to address the payment decline.'
            : 'We are verifying your active service key against our database registry.',
          confidence: 90,
          hallucinationRisk: 'low',
          complianceConfidence: 99,
          toneAlignmentScore: 95,
          readability: 'Grade 11 (Advanced)',
          empathyScore: 70,
          professionalismScore: 99,
          resolutionLikelihood: 85,
          citations: [
            { source: 'refund_policy.pdf', kbId: 'KB-8821', similarity: 99, chunk: 'Section 4.2: Customer refunds are permitted within 30 days.' }
          ]
        },
        {
          tone: 'concise',
          text: intentName === 'refund_request'
            ? 'Processing full refund exception under return policy ks-1 for damaged unit.'
            : intentName === 'payment_failure'
            ? 'Checking billing decline and retrying payment.'
            : 'Checking active service key in system.',
          confidence: 96,
          hallucinationRisk: 'low',
          complianceConfidence: 99,
          toneAlignmentScore: 97,
          readability: 'Grade 4 (Very Easy)',
          empathyScore: 75,
          professionalismScore: 90,
          resolutionLikelihood: 88,
          citations: [
            { source: 'refund_policy.pdf', kbId: 'KB-8821', similarity: 99, chunk: 'Section 4.2: Customer refunds are permitted within 30 days.' }
          ]
        },
        {
          tone: 'escalation-safe',
          text: intentName === 'refund_request'
            ? 'I have logged a priority escalation ticket with billing operations regarding return policy ks-1 refund exception.'
            : intentName === 'payment_failure'
            ? 'Escalating billing decline and Stripe auth token token-9981 to billing infrastructure.'
            : 'Escalating service key lookup to regional system operations.',
          confidence: 95,
          hallucinationRisk: 'low',
          complianceConfidence: 99,
          toneAlignmentScore: 96,
          readability: 'Grade 9 (Standard)',
          empathyScore: 80,
          professionalismScore: 95,
          resolutionLikelihood: 94,
          citations: [
            { source: 'refund_policy.pdf', kbId: 'KB-8821', similarity: 99, chunk: 'Section 4.2: Customer refunds are permitted within 30 days.' }
          ]
        }
      ];

      set((state) => ({
        copilotVariants: {
          ...state.copilotVariants,
          [conversationId]: variants
        }
      }));

      // Stream suggestion chunks
      const suggestionsToStream = result.suggestions;
      let currentIndex = 0;

      const streamNext = () => {
        if (currentIndex < suggestionsToStream.length) {
          get().streamSuggestionChunk(conversationId, suggestionsToStream[currentIndex]);
          currentIndex++;
          addTimeout(streamNext, 300);
        } else {
          get().completeSuggestionStream(conversationId);
        }
      };

      addTimeout(streamNext, 200);
    },

    streamSuggestionChunk: (conversationId, chunk) => {
      set((state) => {
        const current = state.copilotSuggestions[conversationId] || [];
        if (current.some((c) => c.id === chunk.id)) return {};
        return {
          copilotSuggestions: {
            ...state.copilotSuggestions,
            [conversationId]: [...current, chunk]
          }
        };
      });
    },

    completeSuggestionStream: (conversationId) => {
      set((state) => ({
        suggestionStreams: {
          ...state.suggestionStreams,
          [conversationId]: { streaming: false, completed: true }
        },
        copilotLoadingStates: {
          ...state.copilotLoadingStates,
          [conversationId]: false
        }
      }));
    },

    detectConversationIntent: (conversationId) => {
      const conv = get().conversations[conversationId];
      if (!conv) return;
      const slaState = get().slaStates[conversationId];
      const result = analyzeConversation(conv.messages, slaState?.status || conv.slaStatus);
      set((state) => ({
        intentStates: {
          ...state.intentStates,
          [conversationId]: result.intent
        }
      }));
    },

    generateWrapupRecommendations: (conversationId) => {
      const conv = get().conversations[conversationId];
      if (!conv) return;
      const slaState = get().slaStates[conversationId];
      const result = analyzeConversation(conv.messages, slaState?.status || conv.slaStatus);
      set((state) => ({
        wrapupRecommendations: {
          ...state.wrapupRecommendations,
          [conversationId]: result.wrapup
        }
      }));
    },

    generateEscalationRecommendations: (conversationId) => {
      const conv = get().conversations[conversationId];
      if (!conv) return;
      const slaState = get().slaStates[conversationId];
      const result = analyzeConversation(conv.messages, slaState?.status || conv.slaStatus);
      set((state) => ({
        escalationRecommendations: {
          ...state.escalationRecommendations,
          [conversationId]: result.escalations
        }
      }));
    },

    clearConversationRecommendations: (conversationId) => {
      clearCopilotTimeouts(conversationId);
      delete lastAnalyzedText[conversationId];
      set((state) => {
        const copilotSuggestions = { ...state.copilotSuggestions };
        const knowledgeArticles = { ...state.knowledgeArticles };
        const intentStates = { ...state.intentStates };
        const sentimentStates = { ...state.sentimentStates };
        const copilotLoadingStates = { ...state.copilotLoadingStates };
        const wrapupRecommendations = { ...state.wrapupRecommendations };
        const escalationRecommendations = { ...state.escalationRecommendations };
        const suggestionStreams = { ...state.suggestionStreams };
        const orchestrationEvents = { ...state.orchestrationEvents };
        const copilotVariants = { ...state.copilotVariants };
        const activeVariantIndex = { ...state.activeVariantIndex };

        delete copilotSuggestions[conversationId];
        delete knowledgeArticles[conversationId];
        delete intentStates[conversationId];
        delete sentimentStates[conversationId];
        delete copilotLoadingStates[conversationId];
        delete wrapupRecommendations[conversationId];
        delete escalationRecommendations[conversationId];
        delete suggestionStreams[conversationId];
        delete orchestrationEvents[conversationId];
        delete copilotVariants[conversationId];
        delete activeVariantIndex[conversationId];

        return {
          copilotSuggestions,
          knowledgeArticles,
          intentStates,
          sentimentStates,
          copilotLoadingStates,
          wrapupRecommendations,
          escalationRecommendations,
          suggestionStreams,
          orchestrationEvents,
          copilotVariants,
          activeVariantIndex
        };
      });
    },

    applySuggestion: (conversationId, suggestionId) => {
      set((state) => {
        const current = state.appliedSuggestions[conversationId] || [];
        const sugg = state.copilotSuggestions[conversationId]?.find((s) => s.id === suggestionId);
        if (!sugg) return {};
        return {
          appliedSuggestions: {
            ...state.appliedSuggestions,
            [conversationId]: [...current, sugg.text]
          }
        };
      });
    },

    dismissSuggestion: (conversationId, suggestionId) => {
      set((state) => {
        const current = state.copilotSuggestions[conversationId] || [];
        return {
          copilotSuggestions: {
            ...state.copilotSuggestions,
            [conversationId]: current.filter((s) => s.id !== suggestionId)
          }
        };
      });
    },

    setActiveVariantIndex: (conversationId, index) => {
      set((state) => ({
        activeVariantIndex: {
          ...state.activeVariantIndex,
          [conversationId]: index
        }
      }));
    },

    startTransfer: (conversationId, targetQueue, assignee, notes) => {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      set((state) => {
        const conversations = { ...state.conversations };
        const conv = conversations[conversationId];
        if (conv) {
          const systemMsg: Message = {
            id: `msg-sys-${Date.now()}`,
            sender: 'system',
            senderName: 'System',
            text: `Conversation transferred to ${targetQueue === 'q-vip' ? 'VIP Queue' : targetQueue === 'q-telco' ? 'Telco Queue' : 'Billing Queue'}`,
            timestamp,
            messageType: 'system'
          };
          conversations[conversationId] = {
            ...conv,
            status: 'resolved',
            messages: [...conv.messages, systemMsg]
          };
        }

        const currentAudits = state.auditEvents[conversationId] || [];
        const msgText = `Transfer initiated to ${targetQueue}. Notes: "${notes || ''}"`;
        const newAudits = isDuplicateAudit(conversationId, 'transfer_started', msgText)
          ? currentAudits
          : [...currentAudits, {
              id: `audit-${Date.now()}`,
              type: 'transfer_started',
              message: msgText,
              timestamp,
              actor: 'Liam Bennett'
            }];

        return {
          conversations,
          transferStates: {
            ...state.transferStates,
            [conversationId]: {
              targetQueue,
              assigneeId: assignee,
              notes,
              status: 'pending'
            }
          },
          queueAssignments: {
            ...state.queueAssignments,
            [conversationId]: targetQueue
          },
          auditEvents: {
            ...state.auditEvents,
            [conversationId]: newAudits
          }
        };
      });
    },

    completeTransfer: (conversationId) => {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      set((state) => {
        const currentAudits = state.auditEvents[conversationId] || [];
        const msgText = `Transfer completed successfully.`;
        const newAudits = isDuplicateAudit(conversationId, 'transfer_completed', msgText)
          ? currentAudits
          : [...currentAudits, {
              id: `audit-${Date.now()}`,
              type: 'transfer_completed',
              message: msgText,
              timestamp,
              actor: 'System'
            }];

        const currentTransfer = state.transferStates[conversationId];

        return {
          transferStates: {
            ...state.transferStates,
            [conversationId]: currentTransfer ? { ...currentTransfer, status: 'completed' } : { targetQueue: 'q-default', status: 'completed' }
          },
          auditEvents: {
            ...state.auditEvents,
            [conversationId]: newAudits
          }
        };
      });
    },

    cancelTransfer: (conversationId) => {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      set((state) => {
        const currentAudits = state.auditEvents[conversationId] || [];
        const msgText = `Transfer request cancelled.`;
        const newAudits = isDuplicateAudit(conversationId, 'transfer_cancelled', msgText)
          ? currentAudits
          : [...currentAudits, {
              id: `audit-${Date.now()}`,
              type: 'transfer_cancelled',
              message: msgText,
              timestamp,
              actor: 'Liam Bennett'
            }];

        const currentTransfer = state.transferStates[conversationId];

        return {
          transferStates: {
            ...state.transferStates,
            [conversationId]: currentTransfer ? { ...currentTransfer, status: 'cancelled' } : { targetQueue: 'q-default', status: 'cancelled' }
          },
          auditEvents: {
            ...state.auditEvents,
            [conversationId]: newAudits
          }
        };
      });
    },

    startConference: (conversationId, participants) => {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      set((state) => {
        const conversations = { ...state.conversations };
        const conv = conversations[conversationId];
        if (conv) {
          const names = participants.map(p => p.name).join(', ');
          const systemMsg: Message = {
            id: `msg-sys-${Date.now()}`,
            sender: 'system',
            senderName: 'System',
            text: `Conference participant added: ${names}`,
            timestamp,
            messageType: 'system'
          };
          conversations[conversationId] = {
            ...conv,
            messages: [...conv.messages, systemMsg]
          };
        }

        const currentAudits = state.auditEvents[conversationId] || [];
        const msgText = `Conference started with ${participants.length} external participants.`;
        const newAudits = isDuplicateAudit(conversationId, 'conference_started', msgText)
          ? currentAudits
          : [...currentAudits, {
              id: `audit-${Date.now()}`,
              type: 'conference_started',
              message: msgText,
              timestamp,
              actor: 'Liam Bennett'
            }];

        return {
          conversations,
          conferenceStates: {
            ...state.conferenceStates,
            [conversationId]: {
              status: 'active',
              participants
            }
          },
          activeParticipants: {
            ...state.activeParticipants,
            [conversationId]: participants
          },
          auditEvents: {
            ...state.auditEvents,
            [conversationId]: newAudits
          }
        };
      });
    },

    removeConferenceParticipant: (conversationId, participantId) => {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      set((state) => {
        const currentConf = state.conferenceStates[conversationId];
        const participant = currentConf?.participants.find(p => p.id === participantId);
        const nextParticipants = currentConf?.participants.filter(p => p.id !== participantId) || [];

        const conversations = { ...state.conversations };
        const conv = conversations[conversationId];
        if (conv && participant) {
          const systemMsg: Message = {
            id: `msg-sys-${Date.now()}`,
            sender: 'system',
            senderName: 'System',
            text: `${participant.name} left the conference.`,
            timestamp,
            messageType: 'system'
          };
          conversations[conversationId] = {
            ...conv,
            messages: [...conv.messages, systemMsg]
          };
        }

        const currentAudits = state.auditEvents[conversationId] || [];
        const msgText = `${participant?.name || 'Participant'} removed from conference.`;
        const newAudits = isDuplicateAudit(conversationId, 'conference_participant_removed', msgText)
          ? currentAudits
          : [...currentAudits, {
              id: `audit-${Date.now()}`,
              type: 'conference_participant_removed',
              message: msgText,
              timestamp,
              actor: 'Liam Bennett'
            }];

        return {
          conversations,
          conferenceStates: {
            ...state.conferenceStates,
            [conversationId]: {
              status: nextParticipants.length === 0 ? 'ended' : 'active',
              participants: nextParticipants
            }
          },
          activeParticipants: {
            ...state.activeParticipants,
            [conversationId]: nextParticipants
          },
          auditEvents: {
            ...state.auditEvents,
            [conversationId]: newAudits
          }
        };
      });
    },

    endConference: (conversationId) => {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      set((state) => {
        const currentAudits = state.auditEvents[conversationId] || [];
        const msgText = `Conference call terminated.`;
        const newAudits = isDuplicateAudit(conversationId, 'conference_ended', msgText)
          ? currentAudits
          : [...currentAudits, {
              id: `audit-${Date.now()}`,
              type: 'conference_ended',
              message: msgText,
              timestamp,
              actor: 'Liam Bennett'
            }];

        return {
          conferenceStates: {
            ...state.conferenceStates,
            [conversationId]: {
              status: 'ended',
              participants: []
            }
          },
          activeParticipants: {
            ...state.activeParticipants,
            [conversationId]: []
          },
          auditEvents: {
            ...state.auditEvents,
            [conversationId]: newAudits
          }
        };
      });
    },

    startSupervisorConsult: (conversationId, supervisorId, notes) => {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      set((state) => {
        const conversations = { ...state.conversations };
        const conv = conversations[conversationId];
        if (conv) {
          const systemMsg: Message = {
            id: `msg-sys-${Date.now()}`,
            sender: 'system',
            senderName: 'System',
            text: `Supervisor joined consultation`,
            timestamp,
            messageType: 'system'
          };
          conversations[conversationId] = {
            ...conv,
            messages: [...conv.messages, systemMsg]
          };
        }

        const currentAudits = state.auditEvents[conversationId] || [];
        const msgText = `Supervisor consultation initiated with supervisorId ${supervisorId}. Notes: "${notes || ''}"`;
        const newAudits = isDuplicateAudit(conversationId, 'consultation_started', msgText)
          ? currentAudits
          : [...currentAudits, {
              id: `audit-${Date.now()}`,
              type: 'consultation_started',
              message: msgText,
              timestamp,
              actor: 'Liam Bennett'
            }];

        return {
          conversations,
          consultationStates: {
            ...state.consultationStates,
            [conversationId]: {
              supervisorId,
              status: 'consulting',
              notes
            }
          },
          auditEvents: {
            ...state.auditEvents,
            [conversationId]: newAudits
          }
        };
      });
    },

    endSupervisorConsult: (conversationId) => {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      set((state) => {
        const currentAudits = state.auditEvents[conversationId] || [];
        const msgText = `Supervisor consultation completed.`;
        const newAudits = isDuplicateAudit(conversationId, 'consultation_ended', msgText)
          ? currentAudits
          : [...currentAudits, {
              id: `audit-${Date.now()}`,
              type: 'consultation_ended',
              message: msgText,
              timestamp,
              actor: 'Liam Bennett'
            }];

        const currentConsult = state.consultationStates[conversationId];

        return {
          consultationStates: {
            ...state.consultationStates,
            [conversationId]: currentConsult ? { ...currentConsult, status: 'ended' } : { supervisorId: 'super-1', status: 'ended' }
          },
          auditEvents: {
            ...state.auditEvents,
            [conversationId]: newAudits
          }
        };
      });
    },

    triggerEscalation: (conversationId, escalationType) => {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      set((state) => {
        const conversations = { ...state.conversations };
        const conv = conversations[conversationId];
        if (conv) {
          const systemMsg: Message = {
            id: `msg-sys-${Date.now()}`,
            sender: 'system',
            senderName: 'System',
            text: `Conversation escalated due to ${escalationType || 'escalation trigger'}`,
            timestamp,
            messageType: 'escalation'
          };
          conversations[conversationId] = {
            ...conv,
            status: 'escalated',
            messages: [...conv.messages, systemMsg]
          };
        }

        const currentAudits = state.auditEvents[conversationId] || [];
        const msgText = `Case escalated under reason: ${escalationType}.`;
        const newAudits = isDuplicateAudit(conversationId, 'escalation_triggered', msgText)
          ? currentAudits
          : [...currentAudits, {
              id: `audit-${Date.now()}`,
              type: 'escalation_triggered',
              message: msgText,
              timestamp,
              actor: 'System/Copilot'
            }];

        const recs: SupervisorRecommendation[] = [
          { id: 'rec-1', title: 'Schedule Tier-2 Supervisor Callback', description: 'Due to severe refund dispute sentiment risk.', actionType: 'consult', confidence: 94 },
          { id: 'rec-2', title: 'Reroute to Escalation Desk', description: 'Urgent queue assignment bypass requested.', actionType: 'transfer', confidence: 88 }
        ];

        return {
          conversations,
          escalationStates: {
            ...state.escalationStates,
            [conversationId]: {
              status: 'escalated',
              type: escalationType,
              escalatedAt: timestamp
            }
          },
          supervisorRecommendations: {
            ...state.supervisorRecommendations,
            [conversationId]: recs
          },
          auditEvents: {
            ...state.auditEvents,
            [conversationId]: newAudits
          }
        };
      });
    },

    resolveEscalation: (conversationId) => {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      set((state) => {
        const conversations = { ...state.conversations };
        const conv = conversations[conversationId];
        if (conv) {
          const systemMsg: Message = {
            id: `msg-sys-${Date.now()}`,
            sender: 'system',
            senderName: 'System',
            text: `Escalation resolved`,
            timestamp,
            messageType: 'system'
          };
          conversations[conversationId] = {
            ...conv,
            status: 'active',
            messages: [...conv.messages, systemMsg]
          };
        }

        const currentAudits = state.auditEvents[conversationId] || [];
        const msgText = `Escalation resolved and returned to standard active queue.`;
        const newAudits = isDuplicateAudit(conversationId, 'escalation_resolved', msgText)
          ? currentAudits
          : [...currentAudits, {
              id: `audit-${Date.now()}`,
              type: 'escalation_resolved',
              message: msgText,
              timestamp,
              actor: 'Liam Bennett'
            }];

        return {
          conversations,
          escalationStates: {
            ...state.escalationStates,
            [conversationId]: {
              status: 'resolved',
              escalatedAt: undefined
            }
          },
          supervisorRecommendations: {
            ...state.supervisorRecommendations,
            [conversationId]: []
          },
          auditEvents: {
            ...state.auditEvents,
            [conversationId]: newAudits
          }
        };
      });
    },

    appendAuditEvent: (conversationId, event) => {
      if (isDuplicateAudit(conversationId, event.type, event.message)) {
        return;
      }
      set((state) => {
        const current = state.auditEvents[conversationId] || [];
        return {
          auditEvents: {
            ...state.auditEvents,
            [conversationId]: [...current, event]
          }
        };
      });
    },

    updateQueueAssignment: (conversationId, queueId) => {
      set((state) => ({
        queueAssignments: {
          ...state.queueAssignments,
          [conversationId]: queueId
        }
      }));
    },

    // Queue Filter Actions
    setActiveTab: (activeTab) => {
      set((state) => ({
        queueFilters: {
          ...state.queueFilters,
          activeTab,
        },
      }));
    },

    setStatusFilter: (statusFilter) => {
      set((state) => ({
        queueFilters: {
          ...state.queueFilters,
          statusFilter,
        },
      }));
    },

    setSelectedQueue: (selectedQueue) => {
      set((state) => ({
        queueFilters: {
          ...state.queueFilters,
          selectedQueue,
        },
      }));
    },

    setSearchQuery: (searchQuery) => {
      set((state) => ({
        queueFilters: {
          ...state.queueFilters,
          searchQuery,
        },
      }));
    },

    // Wrap-up Completion Actions
    updateResolutionWorkflow: (conversationId, workflow) => {
      set((state) => {
        const current = state.resolutionWorkflows[conversationId] || {
          notes: '',
          summary: '',
          explanation: '',
          checklist: { customerVerified: false, complianceReviewed: false, refundConfirmed: false, supervisorApproved: false, kbAttached: false },
          state: 'Pending'
        };
        const updated = {
          ...current,
          ...workflow,
          checklist: {
            ...current.checklist,
            ...(workflow.checklist || {})
          }
        };
        return {
          resolutionWorkflows: {
            ...state.resolutionWorkflows,
            [conversationId]: updated
          }
        };
      });
      // Trigger compliance validation reactively
      get().validateCompliance(conversationId);
    },

    validateCompliance: (conversationId) => {
      set((state) => {
        const workflow = state.resolutionWorkflows[conversationId] || {
          notes: '',
          summary: '',
          explanation: '',
          checklist: { customerVerified: false, complianceReviewed: false, refundConfirmed: false, supervisorApproved: false, kbAttached: false },
          state: 'Pending'
        };
        
        // Scan for PCI/PII in notes and explanation
        const ccRegex = /\b(?:\d[ -]*?){13,16}\b/;
        const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b/;
        const textToScan = `${workflow.notes} ${workflow.explanation}`;
        const pciStatus = (ccRegex.test(textToScan) || ssnRegex.test(textToScan)) ? 'failed' : 'passed';

        // Check missing mandatory fields
        const missingFields: string[] = [];
        if (!workflow.notes.trim()) missingFields.push('Resolution Notes');
        if (!workflow.explanation.trim()) missingFields.push('Resolution Explanation');
        if (!workflow.checklist.customerVerified) missingFields.push('Customer Verification');
        if (!workflow.checklist.complianceReviewed) missingFields.push('Compliance Review');

        // Warnings
        const slaBreachWarning = state.slaSeconds[conversationId] !== undefined && state.slaSeconds[conversationId] <= 0;
        const escalationWarning = state.escalationStates[conversationId]?.status === 'escalated';

        const validationStatus = (pciStatus === 'failed' || missingFields.length > 0)
          ? 'failed'
          : (slaBreachWarning || escalationWarning)
            ? 'warning'
            : 'passed';

        return {
          complianceValidation: {
            ...state.complianceValidation,
            [conversationId]: {
              pciStatus,
              slaBreachWarning,
              escalationWarning,
              missingFields,
              validationStatus
            }
          }
        };
      });
    },

    applyWrapupRecommendation: (conversationId, recommendation) => {
      // 1. Update workflow resolution state/code explanation
      set((state) => {
        const current = state.resolutionWorkflows[conversationId] || {
          notes: '',
          summary: '',
          explanation: '',
          checklist: { customerVerified: false, complianceReviewed: false, refundConfirmed: false, supervisorApproved: false, kbAttached: false },
          state: 'Pending'
        };
        const updated = {
          ...current,
          explanation: `Applied recommended disposition code: ${recommendation.code} (${recommendation.category}). Summary: ${recommendation.summary}`,
          checklist: {
            ...current.checklist,
            complianceReviewed: true // Auto-review compliance as part of AI application
          }
        };
        return {
          resolutionWorkflows: {
            ...state.resolutionWorkflows,
            [conversationId]: updated
          }
        };
      });

      // 2. Append wrap-up audit event
      get().appendWrapupAuditEvent(conversationId, `AI Recommendation applied: code ${recommendation.code}`);
      get().validateCompliance(conversationId);
    },

    generateResolutionSummary: (conversationId) => {
      // Prevent multiple parallel triggers
      set((state) => {
        const workflow = state.resolutionWorkflows[conversationId] || {
          notes: '',
          summary: '',
          explanation: '',
          checklist: { customerVerified: false, complianceReviewed: false, refundConfirmed: false, supervisorApproved: false, kbAttached: false },
          state: 'Pending'
        };
        
        // Generate mock AI summary
        const summary = workflow.notes.trim()
          ? `AI Summary: ${workflow.notes.substring(0, 100)}... Case resolved successfully under CRM classification.`
          : `AI Summary: Customer query regarding support operations resolved in compliance with service SLA parameters.`;

        return {
          resolutionWorkflows: {
            ...state.resolutionWorkflows,
            [conversationId]: {
              ...workflow,
              summary
            }
          }
        };
      });

      get().appendWrapupAuditEvent(conversationId, `Generated AI resolution summary.`);
    },

    appendWrapupAuditEvent: (conversationId, message) => {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      // Reuse de-duplication cache logic with wrap_audit key
      if (isDuplicateAudit(conversationId, 'wrapup_audit', message)) {
        return;
      }
      set((state) => {
        const current = state.wrapupAuditEvents[conversationId] || [];
        const newEvent: AuditEvent = {
          id: `wrap-audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          type: 'wrapup_audit',
          message,
          timestamp,
          actor: 'Liam Bennett'
        };
        return {
          wrapupAuditEvents: {
            ...state.wrapupAuditEvents,
            [conversationId]: [...current, newEvent]
          }
        };
      });
    },

    clearWrapupTimers: (conversationId) => {
      // Clean up any simulation intervals if they exist (safe-timer ref guard)
      // This is a no-op if no timers exist, but ensures unmount cleanup
    },
  };
});

// Wire up the singleton ticker's tick function to the store's tickRealtimeSystems action.
// This is done after store creation to avoid circular module-level references.
_registerTickFn(() => {
  useConversationStore.getState().tickRealtimeSystems();
});
