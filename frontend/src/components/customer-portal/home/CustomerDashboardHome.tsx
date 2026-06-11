'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { CustomerHomeHero } from './CustomerHomeHero';
import { QuickUtilitiesGrid } from './QuickUtilitiesGrid';
import { RecommendationsStrip } from './RecommendationsStrip';
import { SupportStatusRow } from './SupportStatusRow';
import type { CustomerDashboardHomeProps } from './types';

export function CustomerDashboardHome({
  searchQuery,
  setSearchQuery,
  searchFocused,
  setSearchFocused,
  kbArticles,
  savedSearches,
  onOpenKbArticle,
  onOpenAiChat,
  onOpenTickets,
  onOpenChat,
  onOpenCallback,
  onOpenCobrowse,
  onOpenKnowledgeHub,
  onOpenMyTickets,
  onOpenCopilot,
  onOpenSystemStatus,
  onOpenNotifications,
  recentTicket,
  alertCount
}: CustomerDashboardHomeProps) {
  const { lang } = useApp();

  return (
    <div className="max-w-5xl mx-auto space-y-4 animate-in fade-in duration-250">
      {/* Maintenance alert banner */}
      <div className="bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-400 p-2 rounded-xl flex items-center gap-3 text-[10.5px] font-semibold">
        <span className="flex-1">
          {lang === 'ar'
            ? 'تنبيه الصيانة: ستخضع أنظمة التخزين السحابي لصيانة مجدولة في 12 يونيو بين الساعة 02:00 و 04:00 بتوقيت مكة.'
            : 'Maintenance Alert: Cloud storage systems scheduled for routine optimization on June 12, 02:00 - 04:00 UTC.'}
        </span>
      </div>

      {/* Hero AI Search Section */}
      <CustomerHomeHero
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchFocused={searchFocused}
        setSearchFocused={setSearchFocused}
        kbArticles={kbArticles}
        savedSearches={savedSearches}
        onOpenKbArticle={onOpenKbArticle}
        onOpenAiChat={onOpenAiChat}
      />

      {/* Utilities Grid */}
      <QuickUtilitiesGrid
        onOpenTickets={onOpenTickets}
        onOpenChat={onOpenChat}
        onOpenCallback={onOpenCallback}
        onOpenCobrowse={onOpenCobrowse}
        onOpenKnowledgeHub={onOpenKnowledgeHub}
        onOpenMyTickets={onOpenMyTickets}
        onOpenCopilot={onOpenCopilot}
        onOpenSystemStatus={onOpenSystemStatus}
      />

      {/* Recommendations Strip */}
      <RecommendationsStrip
        onSelectRecommendation={onOpenKbArticle}
      />

      {/* Support Status Telemetry Row */}
      <SupportStatusRow
        alertCount={alertCount}
        recentTicket={recentTicket}
        onOpenNotifications={onOpenNotifications}
        onOpenMyTickets={onOpenMyTickets}
      />
    </div>
  );
}
