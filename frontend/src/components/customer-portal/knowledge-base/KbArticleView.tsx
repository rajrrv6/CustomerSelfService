'use client';

import React from 'react';
import { ArrowLeft, Calendar, Eye, Tag } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';
import { RelatedArticles } from './RelatedArticles';
import { ArticleFeedback } from './ArticleFeedback';
import { FOCUS_RING, INTERACTIVE_BTN_GHOST, SURFACE_PANEL } from '@/design-system/tokens';

interface Article {
  id: string;
  title: string;
  category: string;
  content: string;
  helpfulCount: number;
  tags: string[];
}

interface KbArticleViewProps {
  kbArticles: Article[];
  selectedArticleId: string;
  setSelectedArticleId: (id: string) => void;
  setActiveSubScreen: (sub: string) => void;
  articleFeedbackGiven: Record<string, 'up' | 'down' | null>;
  handleArticleHelpful: (id: string, type: 'up' | 'down') => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Returns & Refunds': 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  'Developer APIs': 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  'Account & Access': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  default: 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
};

const MOCK_ARTICLE_META = {
  readTime: '3 min',
  views: '1.2k',
  lastUpdated: '2026-05-20'
};

export function KbArticleView({
  kbArticles,
  selectedArticleId,
  setSelectedArticleId,
  setActiveSubScreen,
  articleFeedbackGiven,
  handleArticleHelpful
}: KbArticleViewProps) {
  const { lang } = useApp();
  const t = translations[lang];
  const isRtl = lang === 'ar';

  const article = kbArticles.find((a) => a.id === selectedArticleId) || kbArticles[0];
  const catColor = article ? (CATEGORY_COLORS[article.category] ?? CATEGORY_COLORS.default) : CATEGORY_COLORS.default;

  if (!article) {
    return (
      <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setSelectedArticleId('');
              setActiveSubScreen('customer_kb_article');
            }}
            className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
          </button>
          <div>
            <h2 className="text-xl font-bold">{t.portal.kbArticle.title}</h2>
            <p className="text-xs text-slate-400">{t.portal.kbArticle.subtitle}</p>
          </div>
        </div>
        <div className="text-center py-10 text-slate-400">
          <span>{t.portal.kbArticle.articleNotFound}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-200" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Page header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setSelectedArticleId('');
            setActiveSubScreen('customer_kb_article');
          }}
          className={`p-2 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 cursor-pointer ${INTERACTIVE_BTN_GHOST} ${FOCUS_RING}`}
        >
          <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
        </button>
        <div>
          <h2 className="text-xl font-bold">{t.portal.kbArticle.title}</h2>
          <p className="text-xs text-slate-400">{t.portal.kbArticle.subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Article main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Article card */}
          <div className={`rounded-3xl p-6 space-y-5 shadow-xs ${SURFACE_PANEL}`}>
            {/* Article meta header */}
            <div className="space-y-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase font-mono ${catColor}`}>
                {article.category}
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                {article.title}
              </h3>

              {/* Article metadata row */}
              <div className="flex flex-wrap gap-4 text-[10px] text-slate-400 font-mono font-bold">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {isRtl ? `آخر تحديث: ${MOCK_ARTICLE_META.lastUpdated}` : `Updated: ${MOCK_ARTICLE_META.lastUpdated}`}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {isRtl ? `${MOCK_ARTICLE_META.views} مشاهدة` : `${MOCK_ARTICLE_META.views} views`}
                </span>
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {isRtl ? `قراءة ${MOCK_ARTICLE_META.readTime}` : `${MOCK_ARTICLE_META.readTime} read`}
                </span>
              </div>

              {/* Tags */}
              {article.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {article.tags.map((tag) => (
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

            {/* Article body */}
            <div className="prose prose-xs max-w-none">
              <p className="whitespace-pre-line text-xs leading-relaxed font-normal text-slate-650 dark:text-slate-300">
                {article.content}
              </p>
            </div>
          </div>

          {/* Article feedback widget */}
          <ArticleFeedback
            articleId={article.id}
            isRtl={isRtl}
            feedbackGiven={articleFeedbackGiven[article.id]}
            onFeedback={handleArticleHelpful}
          />
        </div>

        {/* Related articles sidebar */}
        <div className="lg:col-span-1">
          <RelatedArticles
            currentArticleId={article.id}
            articles={kbArticles}
            onSelect={(id) => setSelectedArticleId(id)}
            isRtl={isRtl}
          />
        </div>
      </div>
    </div>
  );
}
