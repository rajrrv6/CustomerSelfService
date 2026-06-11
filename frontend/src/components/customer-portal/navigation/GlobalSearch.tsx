'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, FileText, BookOpen, Sparkles, X, ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveSubScreen: (screen: string) => void;
  setSelectedArticleId: (id: string) => void;
  setSelectedTicketId: (id: string) => void;
  onTriggerAction: (action: string) => void;
}

export function GlobalSearch({
  isOpen,
  onClose,
  setActiveSubScreen,
  setSelectedArticleId,
  setSelectedTicketId,
  onTriggerAction
}: GlobalSearchProps) {
  const { tickets, lang } = useApp();
  const t = translations[lang];
  const isRtl = lang === 'ar';

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Mock static articles for search (consistent with CustomerPortalLayout)
  const kbArticles = [
    { id: 'art-1', title: isRtl ? 'كيفية طلب استرداد اشتراك SaaS' : 'How to Request a SaaS Subscription Refund', category: 'Returns & Refunds' },
    { id: 'art-2', title: isRtl ? 'إعداد OAuth لموصلات Client-Gate API' : 'Setting Up OAuth for Client-Gate API Connectors', category: 'Developer APIs' },
    { id: 'art-3', title: isRtl ? 'إعادة تعيين تسجيلات الدخول المغلقة للسجل المدني' : 'Resetting Locked Civil Registry Logins', category: 'Account & Access' },
    { id: 'art-4', title: isRtl ? 'التعامل مع تأخيرات تسليم بوابة الألياف' : 'Handling Fiber Gateway Delivery Delays', category: 'Returns & Refunds' }
  ];

  const quickActions = [
    { id: 'ticket_submit', title: isRtl ? 'إنشاء تذكرة دعم جديدة' : 'Submit a Support Ticket', type: 'action', action: 'ticket' },
    { id: 'live_chat', title: isRtl ? 'بدء دردشة دعم حية' : 'Start Live Support Chat', type: 'action', action: 'chat' },
    { id: 'callback', title: isRtl ? 'حجز موعد اتصال هاتفي' : 'Schedule Voice Callback', type: 'action', action: 'callback' },
    { id: 'cobrowse', title: isRtl ? 'بدء مشاركة الشاشة (Co-Browse)' : 'Start Co-Browse Session', type: 'action', action: 'cobrowse' }
  ];

  // Filter items
  const filteredActions = quickActions.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase())
  );

  const filteredArticles = kbArticles.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) || 
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  const filteredTickets = tickets.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) || 
    item.id.toLowerCase().includes(query.toLowerCase())
  );

  const allResults = [
    ...filteredActions.map(x => ({ ...x, group: 'actions' })),
    ...filteredArticles.map(x => ({ ...x, group: 'articles' })),
    ...filteredTickets.map(x => ({ ...x, group: 'tickets' }))
  ];

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle global keydowns for Cmd+K and closing modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onTriggerAction('open_search');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onTriggerAction]);

  // Handle local keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (allResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % allResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allResults.length) % allResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelect(allResults[selectedIndex]);
    }
  };

  const handleSelect = (item: any) => {
    if (!item) return;

    if (item.group === 'actions') {
      onTriggerAction(item.action);
    } else if (item.group === 'articles') {
      setSelectedArticleId(item.id);
      setActiveSubScreen('customer_kb_article');
    } else if (item.group === 'tickets') {
      setSelectedTicketId(item.id);
      setActiveSubScreen('customer_ticket_detail');
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div 
        ref={modalRef}
        onKeyDown={handleKeyDown}
        className="relative bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-800 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-200"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder={isRtl ? 'ابحث في المقالات والتذاكر والحلول السريعة...' : 'Search articles, tickets, and quick actions...'}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent border-none outline-none text-xs focus:ring-0 placeholder-slate-400 font-semibold"
          />
          <kbd className="px-2 py-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[9px] font-mono text-slate-400 font-bold tracking-wider select-none uppercase">
            ESC
          </kbd>
          <button 
            type="button" 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-250 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Scroll Area */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-2">
          {allResults.length === 0 ? (
            <div className="text-center py-8 text-slate-400 space-y-1">
              <Search className="w-8 h-8 mx-auto text-slate-500/50 stroke-1" />
              <p className="text-xs font-semibold">{isRtl ? 'لا توجد نتائج مطابقة' : 'No matching results found'}</p>
              <p className="text-[10px] text-slate-500">{isRtl ? 'جرب البحث عن كلمات بديلة مثل "استرجاع" أو "تذكرة"' : 'Try searching for words like "refund", "ticket", or "co-browse"'}</p>
            </div>
          ) : (
            <>
              {/* Actions Section */}
              {filteredActions.length > 0 && (
                <div className="space-y-1">
                  <span className="px-3 pt-2 pb-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
                    {isRtl ? 'الحلول السريعة' : 'Quick Actions'}
                  </span>
                  {allResults.filter(r => r.group === 'actions').map((item, idx) => {
                    const globalIdx = allResults.indexOf(item);
                    const isSelected = selectedIndex === globalIdx;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                            : 'hover:bg-slate-100 dark:hover:bg-slate-900/50'
                        }`}
                        style={{ textAlign: isRtl ? 'right' : 'left' }}
                      >
                        <div className="flex items-center gap-2.5">
                          <Sparkles className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-blue-500'}`} />
                          <span>{item.title}</span>
                        </div>
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isRtl ? 'rotate-180' : ''} ${isSelected ? 'opacity-100' : 'opacity-30'}`} />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Articles Section */}
              {filteredArticles.length > 0 && (
                <div className="space-y-1 mt-2">
                  <span className="px-3 pt-2 pb-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
                    {isRtl ? 'قاعدة المعرفة' : 'Knowledge Articles'}
                  </span>
                  {allResults.filter(r => r.group === 'articles').map((item, idx) => {
                    const globalIdx = allResults.indexOf(item);
                    const isSelected = selectedIndex === globalIdx;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                            : 'hover:bg-slate-100 dark:hover:bg-slate-900/50'
                        }`}
                        style={{ textAlign: isRtl ? 'right' : 'left' }}
                      >
                        <div className="flex items-center gap-2.5">
                          <BookOpen className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-emerald-500'}`} />
                          <div className="flex-1 min-w-0">
                            <span className="block truncate">{item.title}</span>
                            <span className={`text-[9px] font-normal block ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                              {(item as any).category}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isRtl ? 'rotate-180' : ''} ${isSelected ? 'opacity-100' : 'opacity-30'}`} />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Tickets Section */}
              {filteredTickets.length > 0 && (
                <div className="space-y-1 mt-2">
                  <span className="px-3 pt-2 pb-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
                    {isRtl ? 'تذاكر الدعم الخاصة بك' : 'Your Tickets'}
                  </span>
                  {allResults.filter(r => r.group === 'tickets').map((item, idx) => {
                    const globalIdx = allResults.indexOf(item);
                    const isSelected = selectedIndex === globalIdx;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                            : 'hover:bg-slate-100 dark:hover:bg-slate-900/50'
                        }`}
                        style={{ textAlign: isRtl ? 'right' : 'left' }}
                      >
                        <div className="flex items-center gap-2.5">
                          <FileText className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-purple-500'}`} />
                          <div className="flex-1 min-w-0">
                            <span className="block truncate">{item.title}</span>
                            <span className={`text-[9px] font-mono font-bold block ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                              {item.id} • {(item as any).status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isRtl ? 'rotate-180' : ''} ${isSelected ? 'opacity-100' : 'opacity-30'}`} />
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Keyboard hints footer */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between font-mono font-bold select-none">
          <div className="flex gap-2">
            <span>↑↓ {isRtl ? 'للتنقل' : 'Navigate'}</span>
            <span>↵ {isRtl ? 'للتأكيد' : 'Select'}</span>
          </div>
          <span>{isRtl ? 'بحث ذكي mPaaS' : 'mPaaS Smart Search'}</span>
        </div>
      </div>
    </div>
  );
}
