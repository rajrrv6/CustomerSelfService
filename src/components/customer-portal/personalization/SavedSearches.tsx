'use client';

import React, { useState, useEffect } from 'react';
import { Search, Trash2, ArrowRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { 
  FOCUS_RING, INTERACTIVE_BTN_GHOST, GLASS_LIGHT 
} from '@/design-system/tokens';
import { SavedSearch } from './types';
import { INITIAL_SAVED_SEARCHES } from './constants';

interface SavedSearchesProps {
  onRunSearch: (query: string) => void;
}

export function SavedSearches({
  onRunSearch
}: SavedSearchesProps) {
  const { lang, addAuditLog } = useApp();
  const isRtl = lang === 'ar';

  const [saved, setSaved] = useState<SavedSearch[]>([]);

  // Load from localStorage or seed
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('user-saved-searches');
    if (stored) {
      try {
        setSaved(JSON.parse(stored));
      } catch (err) {
        console.error('Failed to parse saved searches', err);
      }
    } else {
      setSaved(INITIAL_SAVED_SEARCHES);
      localStorage.setItem('user-saved-searches', JSON.stringify(INITIAL_SAVED_SEARCHES));
    }
  }, []);

  const handleDelete = (query: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextSaved = saved.filter(s => s.query !== query);
    setSaved(nextSaved);
    localStorage.setItem('user-saved-searches', JSON.stringify(nextSaved));
    addAuditLog(`Deleted saved search parameters: "${query}"`, 'success');
  };

  if (saved.length === 0) return null;

  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl space-y-3" dir={isRtl ? 'rtl' : 'ltr'}>
      <span className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider block">
        {isRtl ? 'عمليات البحث المحفوظة (RAG)' : 'Saved RAG Searches'}
      </span>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold">
        {saved.map((item, idx) => (
          <div 
            key={idx} 
            onClick={() => onRunSearch(item.query)}
            className={`flex justify-between items-center px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-500/50 hover:shadow-xs cursor-pointer transition-all ${FOCUS_RING}`}
            role="button"
            tabIndex={0}
            aria-label={isRtl ? `تشغيل البحث: ${item.query}` : `Run search: ${item.query}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onRunSearch(item.query);
              }
            }}
          >
            <div className="flex items-center gap-2 truncate pr-2">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
              <span className="truncate text-slate-700 dark:text-slate-350 font-mono text-[10.5px]">
                {item.query}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {item.count && (
                <span className="text-[8px] bg-slate-100 dark:bg-slate-800 text-slate-400 font-mono px-1.5 py-0.5 rounded font-black">
                  {item.count}x
                </span>
              )}
              <button
                type="button"
                onClick={(e) => handleDelete(item.query, e)}
                className={`text-slate-400 hover:text-rose-500 transition-colors p-1 rounded-md ${FOCUS_RING}`}
                aria-label={isRtl ? `حذف البحث المحفوظ ${item.query}` : `Delete saved search ${item.query}`}
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
