import React from 'react';
import { Search, MessageSquare, Phone, Mail, Globe, AlertOctagon, User, Pin } from 'lucide-react';
import { Conversation } from '@/types';
import { QueueSwitcher } from './QueueSwitcher';
import { QueueConfig } from '@/data/seed/queueSeed';
import { SentimentBadge } from './SentimentBadge';

import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';

interface UnifiedInboxProps {
  conversations: Conversation[];
  activeChatId: string;
  onSelectChat: (id: string) => void;
  activeTab: 'all' | 'whatsapp' | 'web' | 'email' | 'voice' | 'escalated';
  onChangeTab: (tab: 'all' | 'whatsapp' | 'web' | 'email' | 'voice' | 'escalated') => void;
  selectedQueue: string;
  onChangeQueue: (queueId: string) => void;
  queues: QueueConfig[];
  searchQuery: string;
  onSearchChange: (val: string) => void;
  /** Override width/border when embedded in a mobile sheet */
  className?: string;
}

export function UnifiedInbox({
  conversations,
  activeChatId,
  onSelectChat,
  activeTab,
  onChangeTab,
  selectedQueue,
  onChangeQueue,
  queues,
  searchQuery,
  onSearchChange,
  className
}: UnifiedInboxProps) {
  const { lang } = useApp();
  const t = translations[lang];

  // Tabs config
  const tabs = [
    { id: 'all', label: t.agentWorkspace.inbox.tabs.all, icon: null },
    { id: 'whatsapp', label: t.agentWorkspace.inbox.tabs.whatsapp, icon: MessageSquare },
    { id: 'web', label: t.agentWorkspace.inbox.tabs.web, icon: Globe },
    { id: 'email', label: t.agentWorkspace.inbox.tabs.email, icon: Mail },
    { id: 'voice', label: t.agentWorkspace.inbox.tabs.voice, icon: Phone },
    { id: 'escalated', label: t.agentWorkspace.inbox.tabs.escalated, icon: AlertOctagon }
  ];

  // Filtering
  const filtered = conversations.filter((c) => {
    // Channel check
    if (activeTab !== 'all') {
      if (activeTab === 'escalated') {
        if (c.status !== 'escalated') return false;
      } else if (c.channel !== activeTab) {
        return false;
      }
    }
    // Search check
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchName = c.customerName.toLowerCase().includes(query);
      const matchMsg = c.lastMessage.toLowerCase().includes(query);
      if (!matchName && !matchMsg) return false;
    }
    return true;
  });

  return (
    <div
      className={`flex w-80 min-w-0 shrink-0 flex-col justify-between border-slate-200 bg-slate-50/95 text-xs font-semibold dark:border-slate-800 dark:bg-slate-950/30 ${
        className ?? 'border-r'
      }`}
    >
      
      {/* Search and Queue switcher top header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
        <QueueSwitcher
          queues={queues}
          selectedQueue={selectedQueue}
          onSelectQueue={onChangeQueue}
        />

        <div className="relative">
          <Search className="absolute start-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder={t.agentWorkspace.inbox.searchActive}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 ps-9 pe-4 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto py-1.5 px-3 gap-1 shrink-0 bg-slate-50/80 dark:bg-slate-900/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id as 'all' | 'whatsapp' | 'web' | 'email' | 'voice' | 'escalated')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg whitespace-nowrap text-[10px] font-bold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Conversational sessions queue */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-slate-500 dark:text-slate-400 font-normal">
            {t.agentWorkspace.inbox.emptySearch}
          </div>
        ) : (
          filtered.map((chat) => {
            const isActive = chat.id === activeChatId;

            // SLA Outcomes labels
            const slaColor = {
              within_sla: 'border-emerald-500 bg-emerald-500',
              warning: 'border-amber-500 bg-amber-500 animate-pulse',
              breached: 'border-rose-500 bg-rose-500'
            }[chat.slaStatus] || 'bg-slate-400';

            // Channel style specifications
            const channelStyles: Record<string, { borderActive: string; borderInactive: string; bgActive: string; badgeBg: string }> = {
              whatsapp: {
                borderActive: 'border-emerald-500 dark:border-emerald-400',
                borderInactive: 'border-emerald-500/20 dark:border-emerald-500/10',
                bgActive: 'bg-emerald-500/10 dark:bg-emerald-500/5',
                badgeBg: 'bg-emerald-500'
              },
              email: {
                borderActive: 'border-violet-500 dark:border-violet-400',
                borderInactive: 'border-violet-500/20 dark:border-violet-500/10',
                bgActive: 'bg-violet-500/10 dark:bg-violet-500/5',
                badgeBg: 'bg-violet-500'
              },
              web: {
                borderActive: 'border-sky-500 dark:border-sky-400',
                borderInactive: 'border-sky-500/20 dark:border-sky-500/10',
                bgActive: 'bg-sky-500/10 dark:bg-sky-500/5',
                badgeBg: 'bg-sky-500'
              },
              voice: {
                borderActive: 'border-cyan-500 dark:border-cyan-400',
                borderInactive: 'border-cyan-500/20 dark:border-cyan-500/10',
                bgActive: 'bg-cyan-500/10 dark:bg-cyan-500/5',
                badgeBg: 'bg-cyan-500'
              }
            };

            const escStyle = {
              borderActive: 'border-rose-600 dark:border-rose-500',
              borderInactive: 'border-rose-600/30 dark:border-rose-500/20 animate-pulse',
              bgActive: 'bg-rose-500/10 dark:bg-rose-500/5',
              badgeBg: 'bg-rose-600'
            };

            const channelIcons: Record<string, React.ComponentType<{ className?: string }>> = {
              whatsapp: MessageSquare,
              email: Mail,
              web: Globe,
              voice: Phone
            };

            const isEscalated = chat.status === 'escalated';
            const style = isEscalated ? escStyle : (channelStyles[chat.channel] || channelStyles.web);
            const IconComponent = isEscalated ? AlertOctagon : (channelIcons[chat.channel] || MessageSquare);

            return (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`flex w-full gap-3 border-s-4 p-4 text-start transition-all ${
                  isActive
                    ? `${style.borderActive} ${style.bgActive}`
                    : `${style.borderInactive} hover:bg-slate-100 dark:hover:bg-slate-800/40`
                }`}
              >
                {/* Avatar area */}
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                    {chat.customerAvatar ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={chat.customerAvatar} alt={chat.customerName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  {/* Channel icon badge */}
                  <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${style.badgeBg} text-white flex items-center justify-center p-0.5 shadow-sm`}>
                    <IconComponent className="w-2.5 h-2.5 shrink-0" />
                  </span>
                </div>

                {/* Body details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline text-xs mb-1">
                    <span className="font-bold text-slate-800 dark:text-slate-100 truncate flex items-center gap-1">
                      {chat.customerName}
                      {chat.id === 'conv-102' && <Pin className="w-3 h-3 text-blue-500" />}
                    </span>
                    <span className="font-mono text-slate-500 dark:text-slate-400 text-[9px] shrink-0">{chat.lastMessageTime}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mb-2 leading-normal">{chat.lastMessage}</p>

                  <div className="flex items-center justify-between">
                    <SentimentBadge sentiment={chat.sentiment} />

                    {/* SLA state indicator bar */}
                    <div className="flex items-center gap-1.5 text-[9px] font-bold font-mono">
                      <span className={`w-2 h-2 rounded-full ${slaColor}`} />
                      <span className="text-slate-400">
                        {chat.slaDeadline}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
