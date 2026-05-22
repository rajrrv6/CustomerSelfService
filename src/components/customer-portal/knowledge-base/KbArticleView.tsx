'use client';

import React from 'react';
import { ArrowLeft, CheckCircle, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';

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

  const article = kbArticles.find((a) => a.id === selectedArticleId) || kbArticles[0];

  if (!article) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveSubScreen('customer_kb')}
            className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
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

  const feedback = articleFeedbackGiven[article.id];

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-200">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setActiveSubScreen('customer_kb')}
          className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-xl font-bold">{t.portal.kbArticle.title}</h2>
          <p className="text-xs text-slate-400">{t.portal.kbArticle.subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Article main content body */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="px-2 py-0.5 bg-blue-55 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-[9px] font-bold uppercase font-mono">
                {article.category}
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5">{article.title}</h3>
            </div>
          </div>

          <p className="whitespace-pre-line text-xs leading-relaxed font-normal text-slate-655 dark:text-slate-350">
            {article.content}
          </p>

          {/* Helpfulness check */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-450 font-semibold dark:text-slate-400">{t.portal.kbArticle.helpfulQuestion}</span>
            
            {feedback ? (
              <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                {t.portal.kbArticle.thankYou}
              </span>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => handleArticleHelpful(article.id, 'up')}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-[10px] text-slate-700 dark:text-slate-335"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-slate-450" />
                  <span>{t.portal.kbArticle.helpfulYes}</span>
                </button>
                <button
                  onClick={() => handleArticleHelpful(article.id, 'down')}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-855 hover:bg-slate-55 dark:hover:bg-slate-800 rounded-xl text-[10px] text-slate-700 dark:text-slate-335"
                >
                  <ThumbsDown className="w-3.5 h-3.5 text-slate-450" />
                  <span>{t.portal.kbArticle.helpfulNo}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Related articles sidebar */}
        <div className="bg-slate-50/50 dark:bg-slate-900/50 border border-slate-250 dark:border-slate-850 rounded-3xl p-5 space-y-4 h-fit">
          <h4 className="font-bold text-xs text-slate-400 uppercase font-mono tracking-wider">{t.portal.kbArticle.relatedArticles}</h4>
          <div className="space-y-3.5">
            {kbArticles
              .filter((a) => a.id !== article.id)
              .map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => setSelectedArticleId(rel.id)}
                  className="p-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl hover:border-blue-55 cursor-pointer transition-all space-y-1.5"
                >
                  <h5 className="font-bold text-xs text-slate-800 dark:text-white line-clamp-1 hover:underline">{rel.title}</h5>
                  <p className="text-[10px] text-slate-450 dark:text-slate-400 line-clamp-2 leading-relaxed font-normal">{rel.content}</p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
