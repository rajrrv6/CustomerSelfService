import React from 'react';
import { Search, MessageSquare, Phone, Mail, Globe, AlertOctagon, User, Pin } from 'lucide-react';
import { Conversation } from '@/types';
import { QueueSwitcher } from './QueueSwitcher';
import { QueueConfig } from '@/data/seed/queueSeed';
import { SentimentBadge } from './SentimentBadge';

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
  onSearchChange
}: UnifiedInboxProps) {
  // Tabs config
  const tabs = [
    { id: 'all', label: 'All', icon: null },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
    { id: 'web', label: 'Chat', icon: Globe },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'voice', label: 'Voice', icon: Phone },
    { id: 'escalated', label: 'Escalated', icon: AlertOctagon }
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
    <div className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 bg-slate-50/50 dark:bg-slate-950/30 text-xs font-semibold">
      
      {/* Search and Queue switcher top header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
        <QueueSwitcher
          queues={queues}
          selectedQueue={selectedQueue}
          onSelectQueue={onChangeQueue}
        />

        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search active chats..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-xs focus:outline-none focus:border-blue-500 font-semibold"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto py-1.5 px-3 gap-1 shrink-0 bg-white/40 dark:bg-slate-900/10">
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
                  : 'bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'
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
          <div className="p-6 text-center text-slate-400 font-normal">
            No active conversations match criteria.
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

            return (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full p-4 text-left flex gap-3 transition-all border-l-4 ${
                  isActive
                    ? 'bg-blue-50/40 dark:bg-blue-900/10 border-blue-600'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-850 border-transparent'
                }`}
              >
                {/* Avatar area */}
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-850 overflow-hidden border border-slate-250 dark:border-slate-800 flex items-center justify-center">
                    {chat.customerAvatar ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={chat.customerAvatar} alt={chat.customerName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  {/* Channel icon badge */}
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 bg-blue-500 text-white flex items-center justify-center text-[7px] font-extrabold uppercase">
                    {chat.channel.substring(0, 2)}
                  </span>
                </div>

                {/* Body details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline text-xs mb-1">
                    <span className="font-bold text-slate-850 dark:text-slate-100 truncate flex items-center gap-1">
                      {chat.customerName}
                      {chat.id === 'conv-102' && <Pin className="w-3 h-3 text-blue-500" />}
                    </span>
                    <span className="font-mono text-slate-450 text-[9px] shrink-0">{chat.lastMessageTime}</span>
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
