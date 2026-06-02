'use client';

import { useState, useMemo } from 'react';
import type { Conversation } from '@/types';

export type InboxTab =
  | 'all'
  | 'whatsapp'
  | 'web'
  | 'email'
  | 'voice'
  | 'instagram'
  | 'messenger'
  | 'escalated';

export type StatusFilter = 'all' | 'open' | 'pending' | 'escalated' | 'resolved';

interface UseInboxFiltersResult {
  activeTab: InboxTab;
  setActiveTab: (tab: InboxTab) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (status: StatusFilter) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedQueue: string;
  setSelectedQueue: (q: string) => void;
  filteredConversations: Conversation[];
}

export function useInboxFilters(
  conversations: Conversation[],
  initialTab: InboxTab = 'all',
  initialQueue = 'q-all',
  initialStatus: StatusFilter = 'all'
): UseInboxFiltersResult {
  const [activeTab, setActiveTab] = useState<InboxTab>(initialTab);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatus);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQueue, setSelectedQueue] = useState(initialQueue);

  const filteredConversations = useMemo(() => {
    let result = conversations;

    // Filter by channel tab
    if (activeTab !== 'all') {
      if (activeTab === 'escalated') {
        result = result.filter((c) => c.status === 'escalated');
      } else {
        result = result.filter((c) => c.channel === activeTab);
      }
    }

    // Filter by status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'open') {
        result = result.filter((c) => c.status === 'active' || c.status === 'unassigned');
      } else if (statusFilter === 'pending') {
        // Pending state can be represented by active chats with unread messages or unassigned active status
        result = result.filter((c) => c.status === 'active' && (c.unreadCount || 0) > 0);
      } else if (statusFilter === 'escalated') {
        result = result.filter((c) => c.status === 'escalated');
      } else if (statusFilter === 'resolved') {
        result = result.filter((c) => c.status === 'resolved');
      }
    }

    // Filter by queue
    if (selectedQueue !== 'q-all') {
      // In a real DB we would check queue routing. We can mock it by checking priority or conversation ID
      if (selectedQueue === 'q-vip') {
        result = result.filter((c) => c.priority === 'urgent' || c.priority === 'high');
      } else if (selectedQueue === 'q-billing') {
        result = result.filter((c) => c.channel === 'email' || c.id === 'conv-106');
      } else if (selectedQueue === 'q-tech') {
        result = result.filter((c) => c.channel === 'web' || c.channel === 'voice');
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.customerName.toLowerCase().includes(q) ||
          c.lastMessage.toLowerCase().includes(q) ||
          c.customerPhone?.includes(q) ||
          c.customerEmail?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [conversations, activeTab, statusFilter, selectedQueue, searchQuery]);

  return {
    activeTab,
    setActiveTab,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    selectedQueue,
    setSelectedQueue,
    filteredConversations,
  };
}
