'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  LLMModel,
  ASRTTSProvider,
  Channel,
  Bot,
  Intent,
  KnowledgeSource,
  IngestionLog,
  Conversation,
  Ticket,
  Agent,
  QAReview,
  SLARule,
  AuditLog,
  CallLog,
  Message
} from '../types';
import {
  mockLLMModels,
  mockASRTTSProviders,
  mockChannels,
  mockBots,
  mockIntents,
  mockKnowledgeSources,
  mockIngestionLogs,
  mockConversations,
  mockTickets,
  mockAgents,
  mockQAReviews,
  mockSLARules,
  mockAuditLogs,
  mockCallLogs
} from '../data/mockData';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  lang: 'en' | 'ar';
  setLang: (lang: 'en' | 'ar') => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  // Stateful Data
  llmModels: LLMModel[];
  setLlmModels: React.Dispatch<React.SetStateAction<LLMModel[]>>;
  asrProviders: ASRTTSProvider[];
  setAsrProviders: React.Dispatch<React.SetStateAction<ASRTTSProvider[]>>;
  channels: Channel[];
  setChannels: React.Dispatch<React.SetStateAction<Channel[]>>;
  bots: Bot[];
  setBots: React.Dispatch<React.SetStateAction<Bot[]>>;
  intents: Intent[];
  setIntents: React.Dispatch<React.SetStateAction<Intent[]>>;
  knowledgeSources: KnowledgeSource[];
  setKnowledgeSources: React.Dispatch<React.SetStateAction<KnowledgeSource[]>>;
  ingestionLogs: IngestionLog[];
  setIngestionLogs: React.Dispatch<React.SetStateAction<IngestionLog[]>>;
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  agents: Agent[];
  setAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
  qaReviews: QAReview[];
  setQaReviews: React.Dispatch<React.SetStateAction<QAReview[]>>;
  slaRules: SLARule[];
  setSlaRules: React.Dispatch<React.SetStateAction<SLARule[]>>;
  auditLogs: AuditLog[];
  setAuditLogs: React.Dispatch<React.SetStateAction<AuditLog[]>>;
  callLogs: CallLog[];
  setCallLogs: React.Dispatch<React.SetStateAction<CallLog[]>>;

  // Actions
  sendMessage: (conversationId: string, text: string, sender: 'customer' | 'agent' | 'bot' | 'system', name: string) => void;
  createBot: (bot: Omit<Bot, 'id' | 'createdAt' | 'activeSessions' | 'deflectionRate'>) => void;
  createTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'slaBreachTime' | 'messages'>) => void;
  addAuditLog: (action: string, status: 'success' | 'failed') => void;
  triggerBotResponse: (conversationId: string, userText: string) => void;
  triggerIngestion: (sourceId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>('client_admin');
  const [lang, setLangState] = useState<'en' | 'ar'>('en');
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>('dark');

  // Load state from localStorage on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('role') as UserRole;
      if (storedRole) setRoleState(storedRole);

      const storedLang = localStorage.getItem('lang') as 'en' | 'ar';
      if (storedLang) {
        setLangState(storedLang);
        document.documentElement.dir = storedLang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = storedLang;
      }

      const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system';
      if (storedTheme) {
        setThemeState(storedTheme);
      }
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem('role', newRole);
  };

  const setLang = (newLang: 'en' | 'ar') => {
    setLangState(newLang);
    localStorage.setItem('lang', newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // State for all entity lists
  const [llmModels, setLlmModels] = useState<LLMModel[]>(mockLLMModels);
  const [asrProviders, setAsrProviders] = useState<ASRTTSProvider[]>(mockASRTTSProviders);
  const [channels, setChannels] = useState<Channel[]>(mockChannels);
  const [bots, setBots] = useState<Bot[]>(mockBots);
  const [intents, setIntents] = useState<Intent[]>(mockIntents);
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>(mockKnowledgeSources);
  const [ingestionLogs, setIngestionLogs] = useState<IngestionLog[]>(mockIngestionLogs);
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [agents, setAgents] = useState<Agent[]>(mockAgents);
  const [qaReviews, setQaReviews] = useState<QAReview[]>(mockQAReviews);
  const [slaRules, setSlaRules] = useState<SLARule[]>(mockSLARules);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(mockAuditLogs);
  const [callLogs, setCallLogs] = useState<CallLog[]>(mockCallLogs);

  // Sync tailwind dark mode class
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  // Actions implementations
  const addAuditLog = (action: string, status: 'success' | 'failed' = 'success') => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: 'active.user@mpaas.com',
      role: role.toUpperCase().replace('_', ' '),
      action,
      ipAddress: '192.168.10.150',
      status
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const sendMessage = (conversationId: string, text: string, sender: 'customer' | 'agent' | 'bot' | 'system', name: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      sender,
      senderName: name,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sentiment: sender === 'customer' ? 'neutral' : undefined
    };

    setConversations((prevConversations) =>
      prevConversations.map((conv) => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            lastMessage: text,
            lastMessageTime: newMessage.timestamp,
            messages: [...conv.messages, newMessage]
          };
        }
        return conv;
      })
    );
  };

  const triggerBotResponse = (conversationId: string, userText: string) => {
    // Determine sentiment of user text
    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    const lower = userText.toLowerCase();
    if (lower.includes('angry') || lower.includes('bad') || lower.includes('broken') || lower.includes('error') || lower.includes('double charge') || lower.includes('لا يعمل') || lower.includes('سيء')) {
      sentiment = 'negative';
    } else if (lower.includes('thanks') || lower.includes('perfect') || lower.includes('great') || lower.includes('شكرا') || lower.includes('ممتاز')) {
      sentiment = 'positive';
    }

    // Set conversation sentiment
    setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, sentiment } : c));

    // Simulated RAG and LLM Delay
    setTimeout(() => {
      let responseText = '';
      if (lang === 'ar') {
        if (lower.includes('سعر') || lower.includes('تكلفة')) {
          responseText = 'بناءً على معلومات RAG: تبلغ رسوم الاشتراك الشهري 49 دولاراً شهرياً للباقة الأساسية، و 99 دولاراً للباقة الممتازة. هل ترغب في ترقية حسابك؟';
        } else if (lower.includes('مشكلة') || lower.includes('خطأ')) {
          responseText = 'يؤسفني سماع ذلك. لقد قمت بالتحقق من سجلات الخدمة الخاصة بك. سأقوم بتمرير المحادثة إلى وكيل دعم مباشر الآن لحل المشكلة فوراً.';
          setTimeout(() => {
            // Auto transfer to Liam
            setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, status: 'active', agentId: 'agent-1' } : c));
            sendMessage(conversationId, 'Farah AI transferred the chat to Agent Liam Bennett.', 'system', 'System');
          }, 1500);
        } else {
          responseText = 'مرحباً! أنا فرح المساعد الذكي. لقد تلقيت رسالتك: "' + userText + '". كيف يمكنني مساعدتك اليوم في شحن أو استرجاع أو الدعم الفني؟';
        }
      } else {
        if (lower.includes('price') || lower.includes('cost') || lower.includes('pricing')) {
          responseText = 'Based on our RAG Knowledge Base: The standard SaaS tier is $49/month, and the Enterprise tier is $99/month. We also offer standard volume discounts for API requests.';
        } else if (lower.includes('refund') || lower.includes('return')) {
          responseText = 'I can help with refunds! According to our Refund Policy (ks-1), refunds are allowed within 30 days of purchase. Please supply your Order ID to initiate.';
        } else if (lower.includes('broken') || lower.includes('issue') || lower.includes('fail')) {
          responseText = 'I apologize for the issue. Let me route you to a live support representative immediately.';
          setTimeout(() => {
            // Auto transfer to Liam
            setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, status: 'active', agentId: 'agent-1' } : c));
            sendMessage(conversationId, 'Farah AI transferred the chat to Agent Liam Bennett.', 'system', 'System');
          }, 1500);
        } else {
          responseText = 'Hi! I am Farah, your AI Copilot. I have matched your query to our knowledge store. Is there anything specific about orders, API integrations, or billing I can help with?';
        }
      }

      sendMessage(conversationId, responseText, 'bot', 'Farah AI');
    }, 1000);
  };

  const createBot = (newBotData: Omit<Bot, 'id' | 'createdAt' | 'activeSessions' | 'deflectionRate'>) => {
    const newBot: Bot = {
      ...newBotData,
      id: `bot-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      activeSessions: 0,
      deflectionRate: 0
    };
    setBots((prev) => [...prev, newBot]);
    addAuditLog(`Created new AI bot persona: ${newBot.name}`, 'success');
  };

  const createTicket = (newTicketData: Omit<Ticket, 'id' | 'createdAt' | 'slaBreachTime' | 'messages'>) => {
    const id = `TIC-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket: Ticket = {
      ...newTicketData,
      id,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      slaBreachTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 16),
      messages: []
    };
    setTickets((prev) => [newTicket, ...prev]);
    addAuditLog(`Created support ticket: ${id} - ${newTicket.title}`, 'success');
  };

  const triggerIngestion = (sourceId: string) => {
    setKnowledgeSources((prev) =>
      prev.map((src) => {
        if (src.id === sourceId) {
          return { ...src, status: 'syncing' };
        }
        return src;
      })
    );

    const logId = `log-${Date.now()}`;
    const srcName = knowledgeSources.find((s) => s.id === sourceId)?.name || 'Knowledge Source';
    
    // Add pending log
    const newLog: IngestionLog = {
      id: logId,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      sourceName: srcName,
      status: 'processing',
      chunksCount: 0,
      durationMs: 0
    };
    setIngestionLogs((prev) => [newLog, ...prev]);

    // Finish after 3 seconds
    setTimeout(() => {
      const generatedChunks = Math.floor(50 + Math.random() * 150);
      const duration = Math.floor(2000 + Math.random() * 5000);

      setKnowledgeSources((prev) =>
        prev.map((src) => {
          if (src.id === sourceId) {
            return {
              ...src,
              status: 'ready',
              chunkCount: src.chunkCount + generatedChunks,
              lastIngested: new Date().toISOString().replace('T', ' ').substring(0, 16)
            };
          }
          return src;
        })
      );

      setIngestionLogs((prev) =>
        prev.map((log) => {
          if (log.id === logId) {
            return {
              ...log,
              status: 'success',
              chunksCount: generatedChunks,
              durationMs: duration
            };
          }
          return log;
        })
      );
      addAuditLog(`Ingestion completed for ${srcName}. Indexed ${generatedChunks} chunks.`, 'success');
    }, 3000);
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        lang,
        setLang,
        theme,
        setTheme,
        llmModels,
        setLlmModels,
        asrProviders,
        setAsrProviders,
        channels,
        setChannels,
        bots,
        setBots,
        intents,
        setIntents,
        knowledgeSources,
        setKnowledgeSources,
        ingestionLogs,
        setIngestionLogs,
        conversations,
        setConversations,
        tickets,
        setTickets,
        agents,
        setAgents,
        qaReviews,
        setQaReviews,
        slaRules,
        setSlaRules,
        auditLogs,
        setAuditLogs,
        callLogs,
        setCallLogs,
        sendMessage,
        createBot,
        createTicket,
        addAuditLog,
        triggerBotResponse,
        triggerIngestion
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
