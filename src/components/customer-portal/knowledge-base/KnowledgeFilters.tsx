import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { 
  FOCUS_RING, 
  DRAWER_ENTER_LTR, 
  DRAWER_ENTER_RTL, 
  DRAWER_BACKDROP, 
  SURFACE_PANEL,
  TRANSITION_STANDARD
} from '@/design-system/tokens';

interface KnowledgeFiltersProps {
  isRtl: boolean;
  category: string;
  setCategory: (c: string) => void;
  tag: string;
  setTag: (t: string) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
  categories: Array<{ value: string; label: string }>;
  tags: Array<{ value: string; label: string }>;
}

export function KnowledgeFilters({
  isRtl,
  category,
  setCategory,
  tag,
  setTag,
  sortBy,
  setSortBy,
  categories,
  tags
}: KnowledgeFiltersProps) {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const filterContent = (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs font-semibold">
      {/* Category select */}
      <div>
        <label className="block text-[10px] text-slate-400 font-bold uppercase font-mono mb-1">{isRtl ? 'الفئة' : 'Category'}</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={`w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none cursor-pointer ${FOCUS_RING}`}
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
          onChange={(e) => setTag(e.target.value)}
          className={`w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none cursor-pointer ${FOCUS_RING}`}
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
          onChange={(e) => setSortBy(e.target.value)}
          className={`w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none cursor-pointer ${FOCUS_RING}`}
        >
          <option value="helpful">{isRtl ? 'الأكثر فائدة' : 'Most Helpful'}</option>
          <option value="title">{isRtl ? 'العنوان أبجدياً' : 'Title Alphabetical'}</option>
          <option value="relevance">{isRtl ? 'الأكثر ملاءمة للذكاء' : 'AI Relevance Sorting'}</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className={`p-4 rounded-2xl shadow-xs space-y-3 ${SURFACE_PANEL}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Desktop filters bar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-500" />
          <span className="text-xs font-extrabold">{isRtl ? 'تصفية البحث المتقدم' : 'Advanced Search Filters'}</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          className={`sm:hidden px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 text-[10px] font-bold cursor-pointer ${FOCUS_RING}`}
        >
          {isRtl ? 'خيارات التصفية' : 'Toggle Filters'}
        </button>
      </div>

      {/* Render filters on desktop inline */}
      <div className="hidden sm:block">
        {filterContent}
      </div>

      {/* Mobile Drawer Slide-over Overlay */}
      {mobileFilterOpen && (
        <>
          <div 
            onClick={() => setMobileFilterOpen(false)}
            className={`sm:hidden fixed inset-0 z-35 ${DRAWER_BACKDROP}`}
          />
          <div className={`sm:hidden w-72 z-40 p-5 flex flex-col justify-between shrink-0 shadow-2xl ${SURFACE_PANEL} ${
            isRtl ? DRAWER_ENTER_RTL : DRAWER_ENTER_LTR
          } fixed h-full top-0 ${isRtl ? 'right-0' : 'left-0'}`}>

            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-xs font-extrabold">{isRtl ? 'خيارات تصفية المستندات' : 'Filter Options'}</span>
                <button onClick={() => setMobileFilterOpen(false)} className="text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {filterContent}
            </div>
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs mt-4"
            >
              {isRtl ? 'تطبيق الفلاتر' : 'Apply Filters'}
            </button>
          </div>
        </>
      )}

    </div>
  );
}
export default KnowledgeFilters;
