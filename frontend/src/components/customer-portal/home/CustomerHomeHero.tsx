'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, BookOpen, Sparkles, Bot } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';
import { getAiPrompts, getQuickPrompts } from './constants';
import type { CustomerHomeHeroProps } from './types';

export function CustomerHomeHero({
  searchQuery,
  setSearchQuery,
  searchFocused,
  setSearchFocused,
  kbArticles,
  savedSearches,
  onOpenKbArticle,
  onOpenAiChat
}: CustomerHomeHeroProps) {
  const { lang } = useApp();
  const t = translations[lang];

  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [searchFocusIndex, setSearchFocusIndex] = useState(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setSearchFocusIndex(-1);
    }, 150);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setSearchFocused]);

  const aiPrompts = getAiPrompts(lang);
  const quickPrompts = getQuickPrompts(lang);

  const filteredKbArticles = debouncedSearchQuery.trim() === ''
    ? []
    : kbArticles.filter(art => 
        art.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        art.tags.some(tag => tag.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
      ).slice(0, 5);

  const dropdownItems: Array<{
    type: 'kb' | 'prompt' | 'action';
    id: string;
    label: string;
    onClick: () => void;
  }> = [];

  filteredKbArticles.forEach(art => {
    dropdownItems.push({
      type: 'kb',
      id: art.id,
      label: art.title,
      onClick: () => {
        onOpenKbArticle(art.id);
        setSearchFocused(false);
      }
    });
  });

  aiPrompts.forEach((prompt, idx) => {
    dropdownItems.push({
      type: 'prompt',
      id: `prompt-${idx}`,
      label: prompt.text,
      onClick: () => {
        setSearchQuery(prompt.query);
        setDebouncedSearchQuery(prompt.query);
      }
    });
  });

  if (searchQuery.trim() !== '') {
    dropdownItems.push({
      type: 'action',
      id: 'ask-farah',
      label: lang === 'ar' ? `اسأل فرح AI عن "${searchQuery}"` : `Ask Farah AI about "${searchQuery}"`,
      onClick: () => {
        onOpenAiChat(searchQuery);
        setSearchFocused(false);
      }
    });
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!searchFocused) {
      if (e.key === 'ArrowDown') {
        setSearchFocused(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSearchFocusIndex(prev => (prev + 1) % dropdownItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSearchFocusIndex(prev => (prev - 1 + dropdownItems.length) % dropdownItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchFocusIndex >= 0 && searchFocusIndex < dropdownItems.length) {
        dropdownItems[searchFocusIndex].onClick();
      } else {
        // default search triggers search page
        onOpenKbArticle('');
        setSearchFocused(false);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setSearchFocused(false);
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return <span>{text}</span>;
    const regex = new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) => 
          regex.test(part) 
            ? <mark key={i} className="bg-amber-100 dark:bg-amber-950/85 text-amber-900 dark:text-amber-250 font-bold px-0.5 rounded">{part}</mark>
            : part
        )}
      </span>
    );
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-750 text-white rounded-3xl py-3 px-5 text-center space-y-2.5 shadow-md shadow-blue-500/5 relative overflow-visible animate-in fade-in duration-200">
      <span className="inline-block px-2 py-0.5 bg-white/15 rounded-full text-[8.5px] font-bold backdrop-blur-md font-mono">
        {t.portal.homeHero.badge}
      </span>
      <h2 className="text-2xl font-black tracking-tight leading-none">{t.portal.homeHero.heroTitle}</h2>
      <p className="text-[10.5px] text-slate-100/90 max-w-md mx-auto leading-normal">
        {t.portal.homeHero.heroDesc}
      </p>

      <div className="max-w-[420px] mx-auto relative pt-0.5" ref={searchContainerRef}>
        <Search className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400" />
        <input
          type="text"
          data-testid="portal-search-input"
          placeholder={t.portal.homeHero.searchPlaceholder}
          value={searchQuery}
          onFocus={() => setSearchFocused(true)}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setSearchFocused(true);
          }}
          onKeyDown={handleSearchKeyDown}
          className="w-full pl-8.5 pr-4 py-2 rounded-xl bg-white text-slate-850 text-[11px] focus:outline-none shadow-sm hover:shadow focus:shadow-xl focus:shadow-blue-500/10 border border-slate-350 dark:border-slate-700/60 focus:ring-2 focus:ring-blue-400/60 font-semibold transition-all"
        />

        {/* Search suggestion dropdown */}
        {searchFocused && (dropdownItems.length > 0 || savedSearches.length > 0) && (
          <div className="absolute left-0 right-0 mt-0.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 text-left space-y-2 animate-in fade-in slide-in-from-top-1.5 duration-100">
            
            {/* Saved Searches */}
            {savedSearches.length > 0 && (
              <div className="space-y-0.5">
                <span className="block text-[7.5px] uppercase font-bold text-slate-400 font-mono tracking-wider px-1">
                  {lang === 'ar' ? 'عمليات البحث المحفوظة' : 'Saved Searches'}
                </span>
                <div className="flex flex-wrap gap-1 px-1">
                  {savedSearches.map((search, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSearchQuery(search.query);
                        setDebouncedSearchQuery(search.query);
                      }}
                      className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[9px] font-semibold text-slate-700 dark:text-slate-300 rounded-md cursor-pointer transition-colors"
                    >
                      {search.query}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* KB Matches */}
            {filteredKbArticles.length > 0 && (
              <div className="space-y-0.5">
                <span className="block text-[7.5px] uppercase font-bold text-slate-400 font-mono tracking-wider px-1 mb-0.5">
                  {lang === 'ar' ? 'مقالات المعرفة المطابقة' : 'Instant Knowledge Matches'}
                </span>
                <div className="space-y-0.5">
                  {filteredKbArticles.map((art) => {
                    const itemIndex = dropdownItems.findIndex(item => item.type === 'kb' && item.id === art.id);
                    const isHighlighted = itemIndex === searchFocusIndex;
                    return (
                      <button
                        key={art.id}
                        onClick={() => {
                          onOpenKbArticle(art.id);
                          setSearchFocused(false);
                        }}
                        className={`w-full flex items-center gap-2 px-1.5 py-0.5 rounded-lg text-left cursor-pointer transition-colors ${
                          isHighlighted 
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                            : 'hover:bg-blue-500/5 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <BookOpen className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="text-[10px] font-semibold truncate">
                          {highlightMatch(art.title, searchQuery)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* AI Prompts */}
            <div className="space-y-0.5">
              <span className="block text-[7.5px] uppercase font-bold text-slate-400 font-mono tracking-wider px-1 mb-0.5">
                {lang === 'ar' ? 'اقتراحات فرح الذكية' : 'AI Assistant Suggestions'}
              </span>
              <div className="space-y-0.5">
                {aiPrompts.map((prompt, idx) => {
                  const itemIndex = dropdownItems.findIndex(item => item.type === 'prompt' && item.id === `prompt-${idx}`);
                  const isHighlighted = itemIndex === searchFocusIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setSearchQuery(prompt.query);
                        setDebouncedSearchQuery(prompt.query);
                      }}
                      className={`w-full flex items-center gap-2 px-1.5 py-0.75 rounded-lg text-left cursor-pointer transition-colors ${
                        isHighlighted 
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                          : 'hover:bg-blue-500/5 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                      <span className="text-[10px] font-medium truncate">{prompt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ask Farah Action */}
            {searchQuery.trim() !== '' && (
              <div className="pt-1 border-t border-slate-100 dark:border-slate-800/60">
                {(() => {
                  const itemIndex = dropdownItems.findIndex(item => item.type === 'action' && item.id === 'ask-farah');
                  const isHighlighted = itemIndex === searchFocusIndex;
                  return (
                    <button
                      onClick={() => {
                        onOpenAiChat(searchQuery);
                        setSearchFocused(false);
                      }}
                      className={`w-full flex items-center justify-between px-1.5 py-0.75 rounded-lg text-left cursor-pointer transition-colors ${
                        isHighlighted 
                          ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400' 
                          : 'bg-blue-500/5 hover:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Bot className="w-3 h-3 shrink-0 text-blue-500" />
                        <span className="text-[10px] font-bold truncate">
                          {lang === 'ar' ? `اسأل فرح الذكية عن "${searchQuery}"` : `Ask Farah AI about "${searchQuery}"`}
                        </span>
                      </div>
                      <span className="text-[8px] font-bold bg-blue-500 text-white px-1.5 py-0.5 rounded shrink-0">
                        {lang === 'ar' ? 'تشغيل' : 'Ask'}
                      </span>
                    </button>
                  );
                })()}
              </div>
            )}

            {/* Footer instructions hint */}
            <div className="pt-1 border-t border-slate-100 dark:border-slate-800/80 text-[8px] text-slate-400 dark:text-slate-500 font-mono font-bold text-center">
              ↑↓ {lang === 'ar' ? 'للتنقل' : 'navigate'}  •  Enter {lang === 'ar' ? 'للاختيار' : 'select'}  •  Esc {lang === 'ar' ? 'للإغلاق' : 'close'}
            </div>

          </div>
        )}
      </div>

      {/* Instant Search Recommendation Chips */}
      <div className="flex flex-wrap justify-center items-center gap-2 pt-1.5 text-[9.5px]">
        <span className="text-blue-200 font-semibold tracking-wide">
          {lang === 'ar' ? 'اقتراحات سريعة:' : 'Quick Prompts:'}
        </span>
        {quickPrompts.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => {
              setSearchQuery(chip.query);
              setDebouncedSearchQuery(chip.query);
              onOpenKbArticle('');
            }}
            className="px-2.5 py-0.75 bg-white/10 hover:bg-white/20 hover:scale-105 active:scale-95 rounded-full text-white font-bold tracking-wide transition-all shadow-sm hover:shadow cursor-pointer"
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
}

