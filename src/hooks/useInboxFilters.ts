'use client';

/**
 * useInboxFilters — Extracts conversation filter logic from AgentWorkspaceLayout.
 *
 * This hook owns the active tab, queue, and search state plus the derived
 * filtered conversation list. Previously this logic was inline in the 1,023-line
 * AgentWorkspaceLayout component.
 *
 * This is a genuine deduplication — the filter predicate was duplicated between
 * the desktop layout (UnifiedInbox) and the mobile overlay rendering.
 */

import { useState, useMemo } from 'react';
import type { Conversation } from '@/types';

export type InboxTab = 'all' | 'whatsapp' | 'web' | 'email' | 'voice' | 'escalated';

interface UseInboxFiltersResult {
  activeTab: InboxTab;
  setActiveTab: (tab: InboxTab) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedQueue: string;
  setSelectedQueue: (q: string) => void;
  filteredConversations: Conversation[];
}

export function useInboxFilters(
  conversations: Conversation[],
  initialTab: InboxTab = 'all',
  initialQueue = 'q-all'
): UseInboxFiltersResult {
  const [activeTab, setActiveTab] = useState<InboxTab>(initialTab);
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
  }, [conversations, activeTab, searchQuery]);

  return {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    selectedQueue,
    setSelectedQueue,
    filteredConversations,
  };
}
