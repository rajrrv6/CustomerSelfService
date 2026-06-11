'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';
import { Star, BookOpen, ArrowUpRight } from 'lucide-react';
import { FavoritesManager } from '../personalization/FavoritesManager';
import { RecentActivityFeed } from '../personalization/RecentActivityFeed';
import { SavedSearches } from '../personalization/SavedSearches';
import { RECOMMENDATIONS } from '../personalization/constants';
import { 
  FOCUS_RING, ENTER_PANEL, SURFACE_PANEL 
} from '@/design-system/tokens';

// ----------------------------------------------------------------------
// 1. Favorites Page Wrapper
// ----------------------------------------------------------------------
export function FavoritesPage({
  onSelectArticle
}: {
  onSelectArticle: (id: string) => void;
}) {
  const { lang, addAuditLog } = useApp();
  const isRtl = lang === 'ar';

  return (
    <div 
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-slate-800 dark:text-slate-200 shadow-sm space-y-6 ${ENTER_PANEL}`} 
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Flagged elements */}
      <FavoritesManager onSelectArticle={onSelectArticle} />

      {/* AI Recommendations */}
      <PersonalizedRecommendations onSelectArticle={onSelectArticle} />
    </div>
  );
}

// ----------------------------------------------------------------------
// 2. Recent Activity Page Wrapper
// ----------------------------------------------------------------------
export function RecentActivityPage() {
  const { lang, addAuditLog } = useApp();
  const isRtl = lang === 'ar';

  const handleRunSearch = (query: string) => {
    addAuditLog(`Re-submitted saved search query from hub: "${query}"`, 'success');
  };

  return (
    <div 
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-slate-800 dark:text-slate-200 shadow-sm space-y-6 ${ENTER_PANEL}`} 
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Saved Searches manager */}
      <SavedSearches onRunSearch={handleRunSearch} />

      {/* Activity Logs timelines */}
      <RecentActivityFeed />
    </div>
  );
}

// ----------------------------------------------------------------------
// 3. Personalized Recommendations Component
// ----------------------------------------------------------------------
export function PersonalizedRecommendations({
  onSelectArticle
}: {
  onSelectArticle: (id: string) => void;
}) {
  const { lang } = useApp();
  const isRtl = lang === 'ar';

  return (
    <div className="space-y-4 pt-5 border-t border-slate-150 dark:border-slate-850">
      <div className="flex items-center gap-2">
        <Star className="w-4.5 h-4.5 text-amber-500 fill-amber-500" />
        <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">
          {isRtl ? 'توصيات فرح المخصصة' : 'Recommended for You'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {RECOMMENDATIONS.map(rec => (
          <button
            key={rec.id}
            onClick={() => onSelectArticle(rec.id)}
            className={`flex items-center justify-between p-4 bg-blue-500/2 hover:bg-blue-500/5 border border-blue-500/10 hover:border-blue-500/40 hover:shadow-md rounded-2xl cursor-pointer transition-all ${FOCUS_RING}`}
            style={{ textAlign: isRtl ? 'right' : 'left' }}
            aria-label={isRtl ? `توصية: ${rec.title}` : `Recommendation: ${rec.title}`}
          >
            <div className="flex items-start gap-3 pr-2 truncate flex-1">
              <div className="p-2 bg-blue-500/10 rounded-xl shrink-0" aria-hidden="true">
                <BookOpen className="w-4.5 h-4.5 text-blue-600" />
              </div>
              <div className="truncate text-xs font-semibold space-y-1">
                <span className="block truncate text-slate-900 dark:text-white leading-tight font-extrabold">
                  {rec.title}
                </span>
                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded text-[7.5px] font-extrabold tracking-wider font-mono uppercase inline-block">
                  {isRtl ? rec.reasonAR : rec.reasonEN}
                </span>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-blue-500 shrink-0" aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}
