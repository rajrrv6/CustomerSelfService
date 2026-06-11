import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test-utils';
import { TicketTimeline } from '@/components/customer-portal/tickets/TicketTimeline';
import { TicketSLAWidget } from '@/components/customer-portal/tickets/TicketSLAWidget';
import { RelatedArticles } from '@/components/customer-portal/knowledge-base/RelatedArticles';
import { ArticleFeedback } from '@/components/customer-portal/knowledge-base/ArticleFeedback';
import { KnowledgeFilters } from '@/components/customer-portal/knowledge-base/KnowledgeFilters';
import { ChangelogFeed } from '@/components/customer-portal/system/ChangelogFeed';

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_ARTICLES = [
  {
    id: 'art-1',
    title: 'How to Request a SaaS Subscription Refund',
    category: 'Returns & Refunds',
    content: 'Under the standard guidelines, customers are eligible for a full refund within 30 days.',
    helpfulCount: 154,
    tags: ['refund', 'billing']
  },
  {
    id: 'art-2',
    title: 'Setting Up OAuth for Client-Gate API Connectors',
    category: 'Developer APIs',
    content: 'Our client-gate connectors support OAuth 2.0 authorization.',
    helpfulCount: 92,
    tags: ['oauth', 'api']
  },
  {
    id: 'art-3',
    title: 'Resetting Locked Civil Registry Logins',
    category: 'Account & Access',
    content: 'If your credentials fail 3 consecutive times, your user ID will be locked.',
    helpfulCount: 210,
    tags: ['login', 'auth']
  }
];

const MOCK_TIMELINE_STEPS = [
  { id: 'step-1', label: 'Case Submitted', timestamp: '2026-06-01 09:12', status: 'completed' as const },
  { id: 'step-2', label: 'Under Review', timestamp: '2026-06-01 10:00', status: 'current' as const },
  { id: 'step-3', label: 'Resolution', status: 'pending' as const }
];

// ─────────────────────────────────────────────────────────────────────────────
// TicketTimeline Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('TicketTimeline Component', () => {
  it('renders all timeline step labels', () => {
    render(<TicketTimeline steps={MOCK_TIMELINE_STEPS} isRtl={false} />);
    expect(screen.getByText('Case Submitted')).toBeInTheDocument();
    expect(screen.getByText('Under Review')).toBeInTheDocument();
    expect(screen.getByText('Resolution')).toBeInTheDocument();
  });

  it('renders timestamps for completed and current steps', () => {
    render(<TicketTimeline steps={MOCK_TIMELINE_STEPS} isRtl={false} />);
    expect(screen.getByText('2026-06-01 09:12')).toBeInTheDocument();
    expect(screen.getByText('2026-06-01 10:00')).toBeInTheDocument();
  });

  it('renders in RTL mode without errors', () => {
    render(<TicketTimeline steps={MOCK_TIMELINE_STEPS} isRtl={true} />);
    expect(screen.getByText('Case Submitted')).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TicketSLAWidget Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('TicketSLAWidget Component', () => {
  it('renders SLA label and target text', () => {
    render(
      <TicketSLAWidget
        limitMinutes={60}
        initialSecondsRemaining={1800}
        isRtl={false}
      />
    );
    // "SLA Target" label is always present
    expect(screen.getByText('SLA Target')).toBeInTheDocument();
    // Should be in healthy state — green status text
    expect(screen.getByText('SLA parameters fully respected')).toBeInTheDocument();
  });

  it('shows breached state visually when initialSecondsRemaining=0', () => {
    render(
      <TicketSLAWidget
        limitMinutes={60}
        initialSecondsRemaining={0}
        isRtl={false}
      />
    );
    // Specific "BREACHED" text appears when countdown hits zero
    expect(screen.getByText('BREACHED')).toBeInTheDocument();
    expect(screen.getByText('Response exceeds target metrics')).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RelatedArticles Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('RelatedArticles Component', () => {
  it('renders articles excluding the current one', () => {
    const onSelect = vi.fn();
    render(
      <RelatedArticles
        currentArticleId="art-1"
        articles={MOCK_ARTICLES}
        onSelect={onSelect}
        isRtl={false}
      />
    );
    // art-1 should not appear in related
    expect(screen.queryByText('How to Request a SaaS Subscription Refund')).not.toBeInTheDocument();
    // art-2 and art-3 should appear
    expect(screen.getByText('Setting Up OAuth for Client-Gate API Connectors')).toBeInTheDocument();
    expect(screen.getByText('Resetting Locked Civil Registry Logins')).toBeInTheDocument();
  });

  it('calls onSelect with correct id when related article clicked', () => {
    const onSelect = vi.fn();
    render(
      <RelatedArticles
        currentArticleId="art-1"
        articles={MOCK_ARTICLES}
        onSelect={onSelect}
        isRtl={false}
      />
    );
    fireEvent.click(screen.getByText('Setting Up OAuth for Client-Gate API Connectors'));
    expect(onSelect).toHaveBeenCalledWith('art-2');
  });

  it('shows AI recommendation header', () => {
    render(
      <RelatedArticles
        currentArticleId="art-1"
        articles={MOCK_ARTICLES}
        onSelect={vi.fn()}
        isRtl={false}
      />
    );
    expect(screen.getByText('AI-Recommended')).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ArticleFeedback Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('ArticleFeedback Component', () => {
  it('renders helpfulness question and thumbs buttons', () => {
    render(
      <ArticleFeedback
        articleId="art-1"
        isRtl={false}
        feedbackGiven={null}
        onFeedback={vi.fn()}
      />
    );
    expect(screen.getByText(/Was this article helpful/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Yes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /No/i })).toBeInTheDocument();
  });

  it('calls onFeedback with "up" when Yes is clicked', () => {
    const onFeedback = vi.fn();
    render(
      <ArticleFeedback
        articleId="art-1"
        isRtl={false}
        feedbackGiven={null}
        onFeedback={onFeedback}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /Yes/i }));
    expect(onFeedback).toHaveBeenCalledWith('art-1', 'up');
  });

  it('calls onFeedback with "down" and shows comment box when No clicked', () => {
    const onFeedback = vi.fn();
    render(
      <ArticleFeedback
        articleId="art-1"
        isRtl={false}
        feedbackGiven={null}
        onFeedback={onFeedback}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /No/i }));
    expect(onFeedback).toHaveBeenCalledWith('art-1', 'down');
    expect(screen.getByText(/Tell us what could be improved/i)).toBeInTheDocument();
  });

  it('shows thank-you confirmation when feedbackGiven and comment submitted', () => {
    render(
      <ArticleFeedback
        articleId="art-1"
        isRtl={false}
        feedbackGiven="up"
        onFeedback={vi.fn()}
      />
    );
    // When feedbackGiven is set without showCommentBox, shows "Feedback recorded!" 
    expect(screen.getByText(/Feedback recorded|Thank you/i)).toBeInTheDocument();
  });

  it('renders star rating buttons', () => {
    render(
      <ArticleFeedback
        articleId="art-1"
        isRtl={false}
        feedbackGiven={null}
        onFeedback={vi.fn()}
      />
    );
    const stars = screen.getAllByRole('button', { name: /star/i });
    expect(stars).toHaveLength(5);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// KnowledgeFilters Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('KnowledgeFilters Component', () => {
  const CATS = [
    { value: 'All', label: 'All Categories' },
    { value: 'Returns & Refunds', label: 'Returns & Refunds' }
  ];
  const TAGS = [
    { value: 'all', label: 'All Tags' },
    { value: 'billing', label: 'Billing' }
  ];

  it('renders category and tag selects', () => {
    render(
      <KnowledgeFilters
        isRtl={false}
        category="All"
        setCategory={vi.fn()}
        tag="all"
        setTag={vi.fn()}
        sortBy="helpful"
        setSortBy={vi.fn()}
        categories={CATS}
        tags={TAGS}
      />
    );
    expect(screen.getByText('Advanced Search Filters')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Tag')).toBeInTheDocument();
    expect(screen.getByText('Sort By')).toBeInTheDocument();
  });

  it('calls setCategory when category select changes', () => {
    const setCategory = vi.fn();
    render(
      <KnowledgeFilters
        isRtl={false}
        category="All"
        setCategory={setCategory}
        tag="all"
        setTag={vi.fn()}
        sortBy="helpful"
        setSortBy={vi.fn()}
        categories={CATS}
        tags={TAGS}
      />
    );
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'Returns & Refunds' } });
    expect(setCategory).toHaveBeenCalledWith('Returns & Refunds');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ChangelogFeed Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('ChangelogFeed Component', () => {
  it('renders changelog entries from mock data', () => {
    render(<ChangelogFeed isRtl={false} showSearch />);
    // Should show at least the version tags
    expect(screen.getByText('v2.4.0')).toBeInTheDocument();
    expect(screen.getByText('v2.3.5')).toBeInTheDocument();
  });

  it('renders search input when showSearch=true', () => {
    render(<ChangelogFeed isRtl={false} showSearch />);
    expect(screen.getByPlaceholderText(/Search release notes/i)).toBeInTheDocument();
  });

  it('filters entries by search query', () => {
    render(<ChangelogFeed isRtl={false} showSearch />);
    const searchInput = screen.getByPlaceholderText(/Search release notes/i);
    fireEvent.change(searchInput, { target: { value: 'Arabic' } });
    // Only the Arabic input bugfix should appear
    expect(screen.getByText('v2.3.1')).toBeInTheDocument();
    // The v2.4.0 should no longer appear
    expect(screen.queryByText('Omnichannel Voice Callback & CSAT Dashboard')).not.toBeInTheDocument();
  });

  it('filters by tag type', () => {
    render(<ChangelogFeed isRtl={false} showSearch />);
    fireEvent.click(screen.getByRole('button', { name: /Bug Fixes/i }));
    expect(screen.getByText(/Fixed Arabic Input/i)).toBeInTheDocument();
    // Feature entries should not appear
    expect(screen.queryByText('Omnichannel Voice Callback & CSAT Dashboard')).not.toBeInTheDocument();
  });

  it('shows NEW badge for unread items', () => {
    render(<ChangelogFeed isRtl={false} showSearch />);
    expect(screen.getByText('NEW')).toBeInTheDocument();
  });

  it('renders without search bar when showSearch=false', () => {
    render(<ChangelogFeed isRtl={false} showSearch={false} />);
    expect(screen.queryByPlaceholderText(/Search release notes/i)).not.toBeInTheDocument();
  });

  it('respects maxItems limit', () => {
    render(<ChangelogFeed isRtl={false} showSearch maxItems={1} />);
    expect(screen.getByText('v2.4.0')).toBeInTheDocument();
    expect(screen.queryByText('v2.3.5')).not.toBeInTheDocument();
  });
});
