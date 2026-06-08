'use client';

import React, { useState, useEffect } from 'react';
import { Heart, BookOpen, Tag, MessageSquare, Trash2, ArrowUpRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { 
  FOCUS_RING, INTERACTIVE_CARD, INTERACTIVE_BTN_GHOST, GLASS_LIGHT 
} from '@/design-system/tokens';
import { FavoriteItem } from './types';
import { INITIAL_FAVORITES } from './constants';

interface FavoritesManagerProps {
  onSelectArticle: (id: string) => void;
  onSelectTicket?: (id: string) => void;
  onSelectChat?: (id: string) => void;
}

export function FavoritesManager({
  onSelectArticle,
  onSelectTicket,
  onSelectChat
}: FavoritesManagerProps) {
  const { lang, addAuditLog } = useApp();
  const isRtl = lang === 'ar';

  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  // Load from localStorage or seed
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('user-favorites');
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (err) {
        console.error('Failed to parse favorites data', err);
      }
    } else {
      setFavorites(INITIAL_FAVORITES);
      localStorage.setItem('user-favorites', JSON.stringify(INITIAL_FAVORITES));
    }
  }, []);

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextFavorites = favorites.filter(fav => fav.id !== id);
    setFavorites(nextFavorites);
    localStorage.setItem('user-favorites', JSON.stringify(nextFavorites));
    addAuditLog(`Removed item ${id} from bookmarks`, 'success');
  };

  const handleSelect = (item: FavoriteItem) => {
    if (item.type === 'article') {
      onSelectArticle(item.id);
    } else if (item.type === 'ticket' && onSelectTicket) {
      onSelectTicket(item.id);
    } else if (item.type === 'ai-chat' && onSelectChat) {
      onSelectChat(item.id);
    }
  };

  const getIcon = (type: FavoriteItem['type']) => {
    switch (type) {
      case 'article':
        return <BookOpen className="w-4.5 h-4.5 text-blue-500 shrink-0" />;
      case 'ticket':
        return <Tag className="w-4.5 h-4.5 text-amber-500 shrink-0" />;
      case 'ai-chat':
        return <MessageSquare className="w-4.5 h-4.5 text-purple-500 shrink-0" />;
    }
  };

  const getBadge = (type: FavoriteItem['type']) => {
    switch (type) {
      case 'article':
        return isRtl ? 'مقالة معرفية' : 'Knowledge Article';
      case 'ticket':
        return isRtl ? 'تذكرة دعم' : 'Support Incident';
      case 'ai-chat':
        return isRtl ? 'مساعد Farah AI' : 'Farah Assist Chat';
    }
  };

  return (
    <div className="space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
      <div>
        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
          {isRtl ? 'المحفوظات والمفضلة' : 'My Flagged Favorites'}
        </h4>
        <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
          {isRtl 
            ? 'الوصول السريع للمقالات، التذاكر، والمحادثات الذكية التي قمت بتمييزها.' 
            : 'Flagged knowledge base pages, active tickets, and AI conversations.'}
        </span>
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
          <Heart className="w-8 h-8 text-slate-400 stroke-1" aria-hidden="true" />
          <h5 className="font-extrabold text-xs text-slate-700 dark:text-slate-350">
            {isRtl ? 'لا توجد عناصر مفضلة' : 'No favorites saved'}
          </h5>
          <p className="text-[10px] text-slate-450 dark:text-slate-500 leading-relaxed max-w-xs">
            {isRtl 
              ? 'انقر على رمز المفضلة أسفل صفحات الدعم أو التذاكر لحفظها هنا.' 
              : 'Bookmark help resources or ticket timeline items to view them inside this hub.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {favorites.map(fav => (
            <div
              key={fav.id}
              onClick={() => handleSelect(fav)}
              className={`group p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex justify-between items-start cursor-pointer hover:shadow-md transition-all ${INTERACTIVE_CARD} ${FOCUS_RING}`}
              role="button"
              tabIndex={0}
              aria-label={`${getBadge(fav.type)}: ${fav.title}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleSelect(fav);
                }
              }}
            >
              <div className="flex items-start gap-3 truncate pr-2 flex-1">
                <div className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl" aria-hidden="true">
                  {getIcon(fav.type)}
                </div>
                <div className="truncate text-xs font-semibold space-y-1">
                  <span className="block truncate text-slate-900 dark:text-white leading-tight font-extrabold">
                    {fav.title}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-slate-400 font-bold uppercase font-mono tracking-wider">
                      {fav.category}
                    </span>
                    <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded text-[7.5px] font-bold">
                      {getBadge(fav.type)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={(e) => handleRemove(fav.id, e)}
                  className={`p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer ${INTERACTIVE_BTN_GHOST} ${FOCUS_RING}`}
                  title={isRtl ? 'إزالة من المفضلة' : 'Remove favorite'}
                  aria-label={isRtl ? 'إزالة من المفضلة' : 'Remove favorite'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" aria-hidden="true" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
