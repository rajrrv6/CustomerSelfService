'use client';

import React from 'react';
import { ArrowLeft, ThumbsUp } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';
import { EmptyState } from '@/components/shared/EmptyState';

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

  const filteredArticles = kbArticles
    .filter((a) => kbCategoryFilter === 'All' || a.category === kbCategoryFilter)
    .filter((a) => searchQuery === '' || a.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const getCatLabel = (cat: string) => {
    if (cat === 'All') return t.portal.kbSearch.catAll;
    if (cat === 'Returns & Refunds') return t.portal.kbSearch.catReturns;
    if (cat === 'Account & Access') return t.portal.kbSearch.catAccount;
    if (cat === 'Developer APIs') return t.portal.kbSearch.catDev;
    return cat;
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-200">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setActiveSubScreen('customer_home')}
          className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-xl font-bold">{t.portal.kbSearch.title}</h2>
          <p className="text-xs text-slate-400">{t.portal.kbSearch.subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Category filters */}
        <div className="space-y-2.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">{t.portal.kbSearch.categoriesLabel}</span>
          {['All', 'Returns & Refunds', 'Account & Access', 'Developer APIs'].map((cat) => (
            <button
              key={cat}
              onClick={() => setKbCategoryFilter(cat)}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                kbCategoryFilter === cat
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-450 dark:text-slate-400'
              }`}
            >
              {getCatLabel(cat)}
            </button>
          ))}
        </div>

        {/* Search Results list */}
        <div className="md:col-span-3 space-y-4">
          <input
            type="text"
            placeholder={t.portal.kbSearch.filterPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:border-blue-505 text-slate-800 dark:text-slate-100"
          />

          <div className="space-y-3.5">
            {filteredArticles.length === 0 ? (
              <EmptyState
                title={t.portal.kbSearch.noResults}
                description={
                  lang === 'ar'
                    ? 'يرجى مراجعة معايير التصفية الخاصة بك أو تهجئة البحث والمحاولة مرة أخرى.'
                    : 'Please check your filtering criteria or search spelling and try again.'
                }
                action={
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setKbCategoryFilter('All');
                    }}
                    className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-[10px] font-bold transition-all cursor-pointer text-slate-700 dark:text-slate-350"
                  >
                    {lang === 'ar' ? 'إعادة تعيين الفلاتر والبحث' : 'Reset Filters & Search'}
                  </button>
                }
              />
            ) : (
              filteredArticles.map((art) => (
                <div
                  key={art.id}
                  onClick={() => {
                    setSelectedArticleId(art.id);
                    setActiveSubScreen('customer_kb_article');
                  }}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-blue-500 cursor-pointer transition-all space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="px-2 py-0.5 bg-blue-55 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-[9px] font-bold uppercase font-mono">
                      {art.category}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold font-mono">
                      <ThumbsUp className="w-3 h-3" />
                      {art.helpfulCount} {t.portal.kbSearch.helpful}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm hover:underline text-slate-850 dark:text-white">{art.title}</h4>
                  <p className="text-[11px] text-slate-450 dark:text-slate-400 font-normal line-clamp-2 leading-relaxed">
                    {art.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
