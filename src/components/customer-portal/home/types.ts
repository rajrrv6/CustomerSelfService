import type { Ticket } from '@/types';

export interface Article {
  id: string;
  title: string;
  category: string;
  content: string;
  helpfulCount: number;
  tags: string[];
}

export interface SavedSearch {
  query: string;
}

export interface CustomerHomeHeroProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  searchFocused: boolean;
  setSearchFocused: (value: boolean) => void;
  kbArticles: Article[];
  savedSearches: SavedSearch[];
  onOpenKbArticle: (id: string) => void;
  onOpenAiChat: (prompt: string) => void;
}

export interface QuickUtilitiesGridProps {
  onOpenTickets: () => void;
  onOpenChat: () => void;
  onOpenCallback: () => void;
  onOpenCobrowse: () => void;
  onOpenKnowledgeHub: () => void;
  onOpenMyTickets: () => void;
  onOpenCopilot: () => void;
  onOpenSystemStatus: () => void;
}

export interface RecommendationsStripProps {
  onSelectRecommendation: (id: string) => void;
}

export interface SupportStatusRowProps {
  alertCount: number;
  recentTicket?: Ticket;
  onOpenNotifications: () => void;
  onOpenMyTickets: () => void;
}

export interface CustomerDashboardHomeProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  searchFocused: boolean;
  setSearchFocused: (value: boolean) => void;
  kbArticles: Article[];
  savedSearches: SavedSearch[];
  onOpenKbArticle: (id: string) => void;
  onOpenAiChat: (prompt: string) => void;

  onOpenTickets: () => void;
  onOpenChat: () => void;
  onOpenCallback: () => void;
  onOpenCobrowse: () => void;
  onOpenKnowledgeHub: () => void;
  onOpenMyTickets: () => void;
  onOpenCopilot: () => void;
  onOpenSystemStatus: () => void;

  onOpenNotifications: () => void;
  recentTicket?: Ticket;
  alertCount: number;
}
