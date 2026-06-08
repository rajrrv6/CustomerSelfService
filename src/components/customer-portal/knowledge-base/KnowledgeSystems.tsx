'use client';

import React, { useState } from 'react';
import { Search, Filter, BookOpen, Heart, ThumbsUp, ThumbsDown, CheckCircle, ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';

interface Article {
  id: string;
  title: string;
  category: string;
  tags: string[];
  helpfulCount: number;
  content?: string;
}

// ----------------------------------------------------------------------
// 1. Advanced Search Filters Toolbar
// ----------------------------------------------------------------------
interface SearchFiltersProps {
  onFilterChange: (filters: { category: string; tag: string; sortBy: string }) => void;
}

export function AdvancedSearchFilters({ onFilterChange }: SearchFiltersProps) {
  const { lang } = useApp();
  const isRtl = lang === 'ar';

  const [category, setCategory] = useState('All');
  const [tag, setTag] = useState('All');
  const [sortBy, setSortBy] = useState('helpful');

  const categories = [
    { value: 'All', label: isRtl ? 'الكل' : 'All Categories' },
    { value: 'Returns & Refunds', label: isRtl ? 'المرتجعات والاسترداد' : 'Returns & Refunds' },
    { value: 'Account & Access', label: isRtl ? 'الحساب والصلاحيات' : 'Account & Access' },
    { value: 'Developer APIs', label: isRtl ? 'واجهات المطورين' : 'Developer APIs' }
  ];

  const tags = [
    { value: 'All', label: isRtl ? 'جميع الأوسمة' : 'All Tags' },
    { value: 'refund', label: 'refund' },
    { value: 'oauth', label: 'oauth' },
    { value: 'login', label: 'login' },
    { value: 'billing', label: 'billing' }
  ];

  const handleUpdate = (cat: string, tg: string, sort: string) => {
    onFilterChange({ category: cat, tag: tg, sortBy: sort });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs space-y-3" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2">
        <Filter className="w-4 h-4 text-blue-500" />
        <span className="text-xs font-extrabold">{isRtl ? 'تصفية البحث المتقدم' : 'Advanced Search Filters'}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs font-semibold">
        {/* Category select */}
        <div>
          <label className="block text-[10px] text-slate-400 font-bold uppercase font-mono mb-1">{isRtl ? 'الفئة' : 'Category'}</label>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              handleUpdate(e.target.value, tag, sortBy);
            }}
            className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none"
          >
            {categories.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Tag select */}
        <div>
          <label className="block text-[10px] text-slate-400 font-bold uppercase font-mono mb-1">{isRtl ? 'الوسم' : 'Tag'}</label>
          <select
            value={tag}
            onChange={(e) => {
              setTag(e.target.value);
              handleUpdate(category, e.target.value, sortBy);
            }}
            className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none"
          >
            {tags.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Sorting */}
        <div>
          <label className="block text-[10px] text-slate-400 font-bold uppercase font-mono mb-1">{isRtl ? 'ترتيب حسب' : 'Sort By'}</label>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              handleUpdate(category, tag, e.target.value);
            }}
            className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none"
          >
            <option value="helpful">{isRtl ? 'الأكثر فائدة' : 'Most Helpful'}</option>
            <option value="title">{isRtl ? 'العنوان' : 'Title Alphabetical'}</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 2. Article Feedback comment widget
// ----------------------------------------------------------------------
export function ArticleFeedbackWidget({ articleId }: { articleId: string }) {
  const { lang, addAuditLog } = useApp();
  const isRtl = lang === 'ar';

  const [feedback, setFeedback] = useState<'yes' | 'no' | null>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleFeedback = (type: 'yes' | 'no') => {
    setFeedback(type);
    addAuditLog(`Helpfulness feedback logged for article ${articleId} (${type})`, 'success');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    addAuditLog(`Helpfulness comments logged for article ${articleId}: "${comment}"`, 'success');
  };

  if (submitted) {
    return (
      <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-400 font-bold">
        <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
        <span>{isRtl ? 'نشكرك على ملاحظاتك القيمة!' : 'Thank you for your valuable feedback!'}</span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center text-xs font-semibold">
        <span>{isRtl ? 'هل كانت هذه المقالة مفيدة؟' : 'Was this article helpful?'}</span>
        <div className="flex gap-2">
          <button
            onClick={() => handleFeedback('yes')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 border rounded-xl cursor-pointer transition-all ${
              feedback === 'yes' ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950'
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{isRtl ? 'نعم' : 'Yes'}</span>
          </button>
          <button
            onClick={() => handleFeedback('no')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 border rounded-xl cursor-pointer transition-all ${
              feedback === 'no' ? 'bg-rose-600 text-white border-rose-600' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950'
            }`}
          >
            <ThumbsDown className="w-3.5 h-3.5" />
            <span>{isRtl ? 'لا' : 'No'}</span>
          </button>
        </div>
      </div>

      {feedback && (
        <form onSubmit={handleSubmit} className="space-y-3.5 pt-3 border-t border-slate-100 dark:border-slate-850 animate-in slide-in-from-top-2 duration-150 text-xs">
          <label className="block text-[10px] text-slate-400 font-bold uppercase font-mono">
            {isRtl ? 'ساعدنا في التحسين (اختياري)' : 'Help us improve (Optional)'}
          </label>
          <textarea
            required
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={isRtl ? 'اكتب تعليقك هنا...' : 'Provide details on how we can improve this article...'}
            className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-slate-850 dark:text-white"
          />
          <button
            type="submit"
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer"
          >
            {isRtl ? 'إرسال الملاحظات' : 'Submit Feedback'}
          </button>
        </form>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// 3. Related Content Engine recommendations
// ----------------------------------------------------------------------
export function RelatedContentEngine({
  currentArticle,
  allArticles,
  onSelectArticle
}: {
  currentArticle: Article;
  allArticles: Article[];
  onSelectArticle: (id: string) => void;
}) {
  const { lang } = useApp();
  const isRtl = lang === 'ar';

  // Filter articles with same category or tag intersections
  const related = allArticles
    .filter(art => art.id !== currentArticle.id && (art.category === currentArticle.category || art.tags.some(t => currentArticle.tags.includes(t))))
    .slice(0, 2);

  if (related.length === 0) return null;

  return (
    <div className="space-y-3" dir={isRtl ? 'rtl' : 'ltr'}>
      <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider block">
        {isRtl ? 'مقالات ذات صلة' : 'Related Documentation'}
      </span>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {related.map(art => (
          <button
            key={art.id}
            onClick={() => onSelectArticle(art.id)}
            className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:shadow-lg rounded-2xl text-left cursor-pointer transition-all"
            style={{ textAlign: isRtl ? 'right' : 'left' }}
          >
            <div className="flex items-center gap-3 pr-2 truncate">
              <BookOpen className="w-5 h-5 text-blue-500 shrink-0" />
              <div className="truncate text-xs font-semibold space-y-0.5">
                <span className="block truncate text-slate-850 dark:text-white">{art.title}</span>
                <span className="block text-[9px] text-slate-400 font-normal">{art.category}</span>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 text-slate-400 shrink-0 ${isRtl ? 'rotate-180' : ''}`} />
          </button>
        ))}
      </div>
    </div>
  );
}
