'use client';

import React, { useState, useMemo } from 'react';
import { ArrowLeft, ThumbsUp, Search } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';
import { EmptyState } from '@/components/shared/EmptyState';
import { KnowledgeFilters } from './KnowledgeFilters';
import { FOCUS_RING, INTERACTIVE_CARD, INTERACTIVE_BTN_GHOST, SURFACE_PANEL } from '@/design-system/tokens';

interface Article {
  id: string;
  title: string;
  category: string;
  content: string;
  helpfulCount: number;
  tags: string[];
}

interface KbSearchProps {
  kbArticles: Article[];
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  kbCategoryFilter: string;
  setKbCategoryFilter: (val: string) => void;
  setSelectedArticleId: (id: string) => void;
  setActiveSubScreen: (sub: string) => void;
}

const CATEGORIES = [
  { value: 'All', label: 'All Categories', labelAr: 'كل الفئات' },
  { value: 'Returns & Refunds', label: 'Returns & Refunds', labelAr: 'المرتجعات والمبالغ' },
  { value: 'Account & Access', label: 'Account & Access', labelAr: 'الحساب والوصول' },
  { value: 'Developer APIs', label: 'Developer APIs', labelAr: 'واجهات برمجة التطبيقات' }
];

const ALL_TAGS = [
  { value: 'all', label: 'All Tags', labelAr: 'كل الوسوم' },
  { value: 'billing', label: 'Billing', labelAr: 'الفوترة' },
  { value: 'api', label: 'API', labelAr: 'API' },
  { value: 'auth', label: 'Authentication', labelAr: 'المصادقة' },
  { value: 'shipping', label: 'Shipping', labelAr: 'الشحن' }
];

const CATEGORY_COLORS: Record<string, string> = {
  'Returns & Refunds': 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  'Developer APIs': 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  'Account & Access': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  default: 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
};

export function KbSearch({
  kbArticles,
  searchQuery,
  setSearchQuery,
  kbCategoryFilter,
  setKbCategoryFilter,
  setSelectedArticleId,
  setActiveSubScreen
}: KbSearchProps) {
  const { lang } = useApp();
  const t = translations[lang];
  const isRtl = lang === 'ar';

  const [activeTag, setActiveTag] = useState('all');
  const [sortBy, setSortBy] = useState('helpful');

  const categories = CATEGORIES.map(c => ({
    value: c.value,
    label: isRtl ? c.labelAr : c.label
  }));

  const tags = ALL_TAGS.map(t => ({
    value: t.value,
    label: isRtl ? t.labelAr : t.label
  }));

  const filteredArticles = useMemo(() => {
    let results = kbArticles
      .filter((a) => kbCategoryFilter === 'All' || a.category === kbCategoryFilter)
      .filter((a) => searchQuery === '' || a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.content.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter((a) => activeTag === 'all' || a.tags.includes(activeTag));

    if (sortBy === 'helpful') results = [...results].sort((a, b) => b.helpfulCount - a.helpfulCount);
    else if (sortBy === 'title') results = [...results].sort((a, b) => a.title.localeCompare(b.title));
    // 'relevance' keeps original order (simulated AI rank)

    return results;
  }, [kbArticles, kbCategoryFilter, searchQuery, activeTag, sortBy]);

  const catColor = (cat: string) => CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.default;

  return (
    <div className="space-y-5 text-slate-800 dark:text-slate-200" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setActiveSubScreen('customer_home')}
          className={`p-2 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 cursor-pointer ${INTERACTIVE_BTN_GHOST} ${FOCUS_RING}`}
        >
          <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
        </button>
        <div>
          <h2 className="text-xl font-bold">{t.portal.kbSearch.title}</h2>
          <p className="text-xs text-slate-400">{t.portal.kbSearch.subtitle}</p>
        </div>
      </div>

      {/* Search input */}
      <div className="relative">
        <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
        <input
          type="text"
          placeholder={t.portal.kbSearch.filterPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none text-slate-800 dark:text-slate-100 text-sm transition-all ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} ${FOCUS_RING}`}
        />
      </div>

      {/* Advanced Filters bar */}
      <KnowledgeFilters
        isRtl={isRtl}
        category={kbCategoryFilter}
        setCategory={setKbCategoryFilter}
        tag={activeTag}
        setTag={setActiveTag}
        sortBy={sortBy}
        setSortBy={setSortBy}
        categories={categories}
        tags={tags}
      />

      {/* Results count */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono font-bold">
        <span>
          {isRtl
            ? `${filteredArticles.length} نتيجة`
            : `${filteredArticles.length} result${filteredArticles.length !== 1 ? 's' : ''}`}
        </span>
        {(searchQuery || kbCategoryFilter !== 'All' || activeTag !== 'all') && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setKbCategoryFilter('All');
              setActiveTag('all');
              setSortBy('helpful');
            }}
            className="text-blue-500 hover:underline"
          >
            {isRtl ? 'إعادة تعيين' : 'Reset all'}
          </button>
        )}
      </div>

      {/* Results grid */}
      {filteredArticles.length === 0 ? (
        <EmptyState
          title={t.portal.kbSearch.noResults}
          description={
            isRtl
              ? 'يرجى مراجعة معايير التصفية الخاصة بك أو تهجئة البحث والمحاولة مرة أخرى.'
              : 'Please check your filtering criteria or search spelling and try again.'
          }
          action={
            <button
              onClick={() => {
                setSearchQuery('');
                setKbCategoryFilter('All');
                setActiveTag('all');
              }}
              className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-[10px] font-bold transition-all cursor-pointer text-slate-700 dark:text-slate-350"
            >
              {isRtl ? 'إعادة تعيين الفلاتر' : 'Reset Filters & Search'}
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredArticles.map((art) => (
            <div
              key={art.id}
              onClick={() => {
                setSelectedArticleId(art.id);
                setActiveSubScreen('customer_kb_article');
              }}
              className={`group rounded-2xl p-5 shadow-xs space-y-2.5 ${INTERACTIVE_CARD}`}
            >
              <div className="flex justify-between items-start gap-2">
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono ${catColor(art.category)}`}>
                  {art.category}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold font-mono shrink-0">
                  <ThumbsUp className="w-3 h-3" />
                  {art.helpfulCount} {t.portal.kbSearch.helpful}
                </span>
              </div>
              <h4 className="font-bold text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-slate-850 dark:text-white leading-snug">
                {art.title}
              </h4>
              <p className="text-[11px] text-slate-450 dark:text-slate-400 font-normal line-clamp-2 leading-relaxed">
                {art.content}
              </p>
              {/* Tags */}
              {art.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {art.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg text-[9px] font-mono font-bold"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
