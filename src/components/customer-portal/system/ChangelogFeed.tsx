'use client';

import React, { useState } from 'react';
import { Zap, Bug, TrendingUp, Search, ExternalLink, Tag, GitBranch } from 'lucide-react';
import { MOCK_CHANGELOG } from '../support/constants';
import { ChangelogItem } from '../support/types';

interface ChangelogFeedProps {
  isRtl?: boolean;
  maxItems?: number;
  showSearch?: boolean;
}

const TAG_CONFIG = {
  feature: {
    label: 'Feature',
    labelAr: 'ميزة جديدة',
    Icon: Zap,
    badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40',
    node: 'bg-blue-500/10 text-blue-500 border-2 border-blue-200 dark:border-blue-800'
  },
  improvement: {
    label: 'Improvement',
    labelAr: 'تحسين',
    Icon: TrendingUp,
    badge: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-200/60 dark:border-violet-800/40',
    node: 'bg-violet-500/10 text-violet-500 border-2 border-violet-200 dark:border-violet-800'
  },
  bugfix: {
    label: 'Bug Fix',
    labelAr: 'إصلاح خطأ',
    Icon: Bug,
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40',
    node: 'bg-amber-500/10 text-amber-500 border-2 border-amber-200 dark:border-amber-800'
  }
} as const;

type FilterType = 'all' | 'feature' | 'improvement' | 'bugfix';

export function ChangelogFeed({ isRtl = false, maxItems, showSearch = true }: ChangelogFeedProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const allItems: ChangelogItem[] = MOCK_CHANGELOG;

  const filtered = allItems
    .filter((item) => activeFilter === 'all' || item.tag === activeFilter)
    .filter((item) =>
      searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, maxItems);

  const filterLabels: Record<FilterType, string> = {
    all: isRtl ? 'الكل' : 'All',
    feature: isRtl ? 'ميزات' : 'Features',
    improvement: isRtl ? 'تحسينات' : 'Improvements',
    bugfix: isRtl ? 'إصلاحات' : 'Bug Fixes'
  };

  return (
    <div className="space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>

      {/* Search + filter bar */}
      {showSearch && (
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search input */}
          <div className="relative flex-1 min-w-0">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none ${isRtl ? 'right-3' : 'left-3'}`} />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRtl ? 'البحث في سجل التغييرات...' : 'Search release notes...'}
              className={`w-full py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-all ${isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
            />
          </div>

          {/* Filter chips */}
          <div className="flex gap-1.5 flex-wrap shrink-0" role="group" aria-label={isRtl ? 'تصفية حسب النوع' : 'Filter by type'}>
            {(Object.keys(filterLabels) as FilterType[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setActiveFilter(f)}
                aria-pressed={activeFilter === f}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-150 border
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 ${
                  activeFilter === f
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/25'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {filterLabels[f]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Result count */}
      <p className="text-[9px] text-slate-400 font-mono font-bold">
        {isRtl ? `${filtered.length} إصدار` : `${filtered.length} release${filtered.length !== 1 ? 's' : ''}`}
      </p>

      {/* Timeline entries */}
      {filtered.length === 0 ? (
        <div className="py-10 text-center space-y-2">
          <Tag className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
          <p className="text-xs text-slate-400 font-semibold">
            {isRtl ? 'لا توجد نتائج مطابقة' : 'No matching release notes found'}
          </p>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-[10px] text-blue-500 hover:underline font-bold"
            >
              {isRtl ? 'مسح البحث' : 'Clear search'}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-0">
          {filtered.map((item, idx) => {
            const cfg = TAG_CONFIG[item.tag];
            const TagIcon = cfg.Icon;
            const isLast = idx === filtered.length - 1;

            return (
              <div key={item.id} className="flex gap-4 relative" style={{ paddingBottom: isLast ? 0 : '24px' }}>
                {/* Vertical connector */}
                {!isLast && (
                  <div
                    className={`absolute top-9 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800 ${isRtl ? 'right-[15px]' : 'left-[15px]'}`}
                  />
                )}

                {/* Node */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 mt-0.5 ${cfg.node}`}>
                  <GitBranch className="w-3.5 h-3.5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2 pt-0.5">
                  {/* Header badges row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-600 text-white font-mono font-extrabold rounded-md text-[9px] tracking-wider uppercase shrink-0">
                      {item.version}
                    </span>
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[9px] font-mono shrink-0 ${cfg.badge}`}>
                      <TagIcon className="w-2.5 h-2.5" />
                      {isRtl ? cfg.labelAr : cfg.label}
                    </span>
                    {!item.read && (
                      <span className="px-1.5 py-0.5 bg-blue-500 text-white rounded font-extrabold text-[8px] font-mono uppercase animate-pulse shrink-0">
                        {isRtl ? 'جديد' : 'NEW'}
                      </span>
                    )}
                    <span className="text-[9px] text-slate-400 font-mono">({item.date})</span>
                  </div>

                  {/* Title */}
                  <h5 className="font-extrabold text-[12px] text-slate-900 dark:text-white leading-snug">
                    {item.title}
                  </h5>

                  {/* Description */}
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                    {item.desc}
                  </p>

                  {/* View release notes link */}
                  <button
                    type="button"
                    className="flex items-center gap-1 text-[10px] text-blue-500 dark:text-blue-400 font-bold hover:underline focus-visible:outline-none focus-visible:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {isRtl ? 'اقرأ المزيد' : 'View full release notes'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ChangelogFeed;
