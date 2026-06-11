import React from 'react';
import { Search, MessageSquare, Phone, Mail, Globe, AlertOctagon, User, Pin } from 'lucide-react';

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const Facebook = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
import { Conversation } from '@/types';
import { QueueSwitcher } from './QueueSwitcher';
import { QueueConfig } from '@/data/seed/queueSeed';
import { SentimentBadge } from './SentimentBadge';

import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';
import { InboxTab, StatusFilter } from '@/hooks/useInboxFilters';
import { useConversationStore } from '@/stores/conversationStore';

interface UnifiedInboxProps {
  conversations?: Conversation[];
  activeChatId?: string;
  onSelectChat?: (id: string | null) => void;
  activeTab?: InboxTab;
  onChangeTab?: (tab: InboxTab) => void;
  statusFilter?: StatusFilter;
  onChangeStatusFilter?: (status: StatusFilter) => void;
  selectedQueue?: string;
  onChangeQueue?: (queueId: string) => void;
  queues: QueueConfig[];
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  /** Override width/border when embedded in a mobile sheet */
  className?: string;
}

export function UnifiedInbox({
  conversations: propsConversations,
  activeChatId: propsActiveChatId,
  onSelectChat: propsOnSelectChat,
  activeTab: propsActiveTab,
  onChangeTab: propsOnChangeTab,
  statusFilter: propsStatusFilter,
  onChangeStatusFilter: propsOnChangeStatusFilter,
  selectedQueue: propsSelectedQueue,
  onChangeQueue: propsOnChangeQueue,
  queues,
  searchQuery: propsSearchQuery,
  onSearchChange: propsOnSearchChange,
  className
}: UnifiedInboxProps) {
  const { lang } = useApp();
  const t = translations[lang];

  const store = useConversationStore();
  const activeChatId = propsActiveChatId !== undefined ? propsActiveChatId : (store.activeConversationId ?? '');
  const onSelectChat = propsOnSelectChat !== undefined ? propsOnSelectChat : store.setActiveConversation;
  
  const activeTab = propsActiveTab !== undefined ? propsActiveTab : store.queueFilters.activeTab;
  const onChangeTab = propsOnChangeTab !== undefined ? propsOnChangeTab : store.setActiveTab;
  const statusFilter = propsStatusFilter !== undefined ? propsStatusFilter : store.queueFilters.statusFilter;
  const onChangeStatusFilter = propsOnChangeStatusFilter !== undefined ? propsOnChangeStatusFilter : store.setStatusFilter;
  const selectedQueue = propsSelectedQueue !== undefined ? propsSelectedQueue : store.queueFilters.selectedQueue;
  const onChangeQueue = propsOnChangeQueue !== undefined ? propsOnChangeQueue : store.setSelectedQueue;
  const searchQuery = propsSearchQuery !== undefined ? propsSearchQuery : store.queueFilters.searchQuery;
  const onSearchChange = propsOnSearchChange !== undefined ? propsOnSearchChange : store.setSearchQuery;

  const conversations = propsConversations !== undefined ? propsConversations : Object.values(store.conversations);

  // Tabs config
  const tabs = [
    { id: 'all', label: t.agentWorkspace.inbox.tabs.all, icon: null },
    { id: 'whatsapp', label: t.agentWorkspace.inbox.tabs.whatsapp, icon: MessageSquare },
    { id: 'web', label: t.agentWorkspace.inbox.tabs.web, icon: Globe },
    { id: 'email', label: t.agentWorkspace.inbox.tabs.email, icon: Mail },
    { id: 'voice', label: t.agentWorkspace.inbox.tabs.voice, icon: Phone },
    { id: 'instagram', label: 'Instagram', icon: Instagram },
    { id: 'messenger', label: 'Messenger', icon: Facebook },
    { id: 'escalated', label: t.agentWorkspace.inbox.tabs.escalated, icon: AlertOctagon }
  ];

  // Status Filter options
  const statusOptions: Array<{ id: StatusFilter; label: string }> = [
    { id: 'all', label: lang === 'ar' ? 'الكل' : 'All Status' },
    { id: 'open', label: lang === 'ar' ? 'مفتوحة' : 'Open' },
    { id: 'pending', label: lang === 'ar' ? 'معلقة' : 'Pending' },
    { id: 'escalated', label: lang === 'ar' ? 'مصعّدة' : 'Escalated' },
    { id: 'resolved', label: lang === 'ar' ? 'محلولة' : 'Resolved' },
  ];

  return (
    <div
      className={`flex min-w-0 shrink-0 h-full flex-col justify-between bg-slate-50/95 text-sm font-semibold dark:bg-slate-950/30 ${
        className 
          ? className 
          : 'w-64 xl:w-72 2xl:w-80 border-r border-slate-200 dark:border-slate-800'
      }`}
    >
      {/* Search and Queue switcher top header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3 shrink-0">
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

        {/* Status filters pills */}
        <div
          role="tablist"
          aria-label={lang === 'ar' ? 'حالات المحادثة' : 'Conversation statuses'}
          className="flex gap-1 overflow-x-auto pb-1 scrollbar-none select-none"
        >
          {statusOptions.map((opt) => (
            <button
              key={opt.id}
              role="tab"
              aria-selected={statusFilter === opt.id}
              onClick={() => onChangeStatusFilter(opt.id)}
              className={`px-2 py-0.5 rounded-full text-[10.5px] font-extrabold border transition-all whitespace-nowrap ${
                statusFilter === opt.id
                  ? 'bg-slate-800 text-white border-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 dark:hover:border-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Channels Tabs */}
      <div
        role="tablist"
        aria-label={lang === 'ar' ? 'قنوات المحادثة' : 'Conversation channels'}
        className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto py-1.5 px-3 gap-1 shrink-0 bg-slate-50/80 dark:bg-slate-900/10 scrollbar-none"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              data-testid={`inbox-tab-${tab.id}`}
              role="tab"
              aria-selected={isActive}
              aria-controls="inbox-conversation-list"
              onClick={() => onChangeTab(tab.id as InboxTab)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg whitespace-nowrap text-xs font-bold transition-all ${
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

      {/* Conversational sessions list */}
      <div
        id="inbox-conversation-list"
        className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40"
      >
        {conversations.length === 0 ? (
          <div className="p-6 text-center text-slate-500 dark:text-slate-400 font-normal">
            {t.agentWorkspace.inbox.emptySearch}
          </div>
        ) : (
          conversations.map((chat) => {
            const isActive = chat.id === activeChatId;

            // SLA Outcomes labels
            const slaState = store.slaStates[chat.id];
            const slaStatus = slaState ? slaState.status : chat.slaStatus;
            const slaTimeLeft = slaState ? slaState.timeLeft : chat.slaDeadline;

            const slaColor = {
              within_sla: 'border-emerald-500 bg-emerald-500',
              warning: 'border-amber-500 bg-amber-500 animate-pulse',
              breached: 'border-rose-500 bg-rose-500'
            }[slaStatus] || 'bg-slate-400';

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
                badgeBg: 'bg-cyan-50'
              },
              instagram: {
                borderActive: 'border-pink-500 dark:border-pink-400',
                borderInactive: 'border-pink-500/20 dark:border-pink-500/10',
                bgActive: 'bg-pink-500/10 dark:bg-pink-500/5',
                badgeBg: 'bg-pink-500'
              },
              messenger: {
                borderActive: 'border-blue-500 dark:border-blue-400',
                borderInactive: 'border-blue-500/20 dark:border-blue-500/10',
                bgActive: 'bg-blue-500/10 dark:bg-blue-500/5',
                badgeBg: 'bg-blue-500'
              }
            };

            const escStyle = {
              borderActive: 'border-rose-600 dark:border-rose-500',
              borderInactive: 'border-rose-600/30 dark:border-rose-500/20',
              bgActive: 'bg-rose-500/10 dark:bg-rose-500/5',
              badgeBg: 'bg-rose-600'
            };

            const channelIcons: Record<string, React.ComponentType<{ className?: string }>> = {
              whatsapp: MessageSquare,
              email: Mail,
              web: Globe,
              voice: Phone,
              instagram: Instagram,
              messenger: Facebook
            };

            const isEscalated = chat.status === 'escalated';
            const style = isEscalated ? escStyle : (channelStyles[chat.channel] || channelStyles.web);
            const IconComponent = isEscalated ? AlertOctagon : (channelIcons[chat.channel] || MessageSquare);

            const priorityColors = {
              low: 'text-slate-500 bg-slate-100 border-slate-200 dark:text-slate-400 dark:bg-slate-900/50 dark:border-slate-800',
              medium: 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/20 dark:border-blue-900/30',
              high: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-500 dark:bg-amber-950/20 dark:border-amber-900/30',
              urgent: 'text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/20 dark:border-rose-900/30 animate-pulse'
            };

            const presence = store.presenceStates[chat.id] || 'offline';
            const presenceColor = {
              online: 'bg-emerald-500',
              away: 'bg-amber-500',
              busy: 'bg-rose-500',
              offline: 'bg-slate-400'
            }[presence];

             const unreadCount = store.unreadCounts[chat.id] !== undefined ? store.unreadCounts[chat.id] : (chat.unreadCount ?? 0);

             const queueAssignment = store.queueAssignments[chat.id] || (chat.priority === 'urgent' ? 'q-vip' : 'q-default');
             const queueLabel = {
               'q-vip': lang === 'ar' ? 'VIP' : 'VIP',
               'q-telco': lang === 'ar' ? 'اتصالات' : 'Telco',
               'q-default': lang === 'ar' ? 'افتراضي' : 'Default',
               'q-billing': lang === 'ar' ? 'فواتير' : 'Billing'
             }[queueAssignment] || queueAssignment;

             const conferenceState = store.conferenceStates[chat.id];
             const hasActiveConference = conferenceState?.status === 'active';
             const participantCount = conferenceState?.participants.length || 0;

             return (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`flex w-full gap-2 xl:gap-3 border-s-4 p-3 xl:p-4 text-start transition-all ${
                  isActive
                    ? `${style.borderActive} ${style.bgActive}`
                    : `${style.borderInactive} hover:bg-slate-100 dark:hover:bg-slate-800/40`
                }`}
              >
                {/* Avatar area */}
                <div className="relative shrink-0 select-none">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                    {chat.customerAvatar ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={chat.customerAvatar} alt={chat.customerName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  {/* Presence dot */}
                  <span
                    data-testid={`presence-dot-${chat.id}`}
                    className={`absolute top-0 end-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${presenceColor}`}
                    title={`Presence: ${presence}`}
                  />
                  <span className="sr-only">{`Presence: ${presence}`}</span>

                  {/* Channel icon badge */}
                  <span className={`absolute -bottom-1 -end-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${style.badgeBg} text-white flex items-center justify-center p-0.5 shadow-sm`}>
                    <IconComponent className="w-2.5 h-2.5 shrink-0" />
                  </span>
                  {/* Active Conference participant counter badge */}
                  {hasActiveConference && (
                    <span
                      data-testid={`conf-counter-${chat.id}`}
                      className="absolute -bottom-2 start-1 bg-purple-650 border border-white dark:border-slate-900 text-white rounded-full px-1.5 py-0.2 text-[8px] font-black flex items-center justify-center shadow-sm select-none"
                    >
                      👥 {participantCount}
                    </span>
                  )}
                  {/* Unread indicator */}
                  {unreadCount > 0 ? (
                    <>
                      <span className="absolute -top-1 -start-1 min-w-4 h-4 px-1 rounded-full bg-blue-600 text-white font-mono text-[9.5px] font-extrabold flex items-center justify-center shadow-sm select-none animate-pulse">
                        {unreadCount}
                      </span>
                      <span className="sr-only">
                        {lang === 'ar'
                          ? `${unreadCount} رسائل غير مقروءة`
                          : `${unreadCount} unread messages`}
                      </span>
                    </>
                  ) : null}
                </div>

                {/* Body details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate flex items-center gap-1">
                      {chat.customerName}
                      {chat.id === 'conv-102' && <Pin className="w-3 h-3 text-blue-500 shrink-0" />}
                    </span>
                    <span className="font-mono text-slate-500 dark:text-slate-400 text-[10.5px] shrink-0">{chat.lastMessageTime}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-2 leading-normal">{chat.lastMessage}</p>

                  <div className="flex items-center justify-between gap-1.5 flex-wrap">
                    <div className="flex items-center gap-1 flex-wrap">
                      <SentimentBadge sentiment={chat.sentiment} />
                      {chat.priority && (
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase border tracking-wider leading-none select-none ${priorityColors[chat.priority]}`}>
                          {chat.priority}
                        </span>
                      )}
                      {/* Transferred queue indicator badge */}
                      <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-slate-150 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 select-none">
                        {queueLabel}
                      </span>
                    </div>

                    {/* Assignment & SLA status indicator */}
                    <div className="flex items-center gap-1.5 text-[10.5px] font-bold font-mono">
                      {chat.status === 'unassigned' ? (
                        <span className="text-amber-600 dark:text-amber-500 bg-amber-500/10 px-1 rounded text-[9px] uppercase select-none">
                          Unassigned
                        </span>
                      ) : (
                        <span className="text-slate-400 select-none">
                          {chat.agentId ? 'Assigned' : 'Unassigned'}
                        </span>
                      )}
                      <span className={`w-2 h-2 rounded-full shrink-0 ${slaColor}`} />
                      <span className="text-slate-400">
                        {slaTimeLeft}
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
