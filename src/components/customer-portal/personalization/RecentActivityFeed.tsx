'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  History, Search, Activity, Trash2, Shield, Ticket, Globe, BookOpen, 
  Settings, MessageSquare, ChevronDown 
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { 
  FOCUS_RING, INTERACTIVE_BTN_GHOST, SURFACE_PANEL, GLASS_LIGHT 
} from '@/design-system/tokens';
import { ActivityItem } from './types';
import { INITIAL_ACTIVITIES } from './constants';

export function RecentActivityFeed() {
  const { lang, addAuditLog } = useApp();
  const isRtl = lang === 'ar';

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState(4); // pagination limit

  // Load from localStorage or seed
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('user-activity-logs');
    if (stored) {
      try {
        setActivities(JSON.parse(stored));
      } catch (err) {
        console.error('Failed to parse activity logs', err);
      }
    } else {
      setActivities(INITIAL_ACTIVITIES);
      localStorage.setItem('user-activity-logs', JSON.stringify(INITIAL_ACTIVITIES));
    }
  }, []);

  const handleClear = () => {
    setActivities([]);
    localStorage.setItem('user-activity-logs', JSON.stringify([]));
    addAuditLog('Customer cleared recent portal activity logs', 'success');
  };

  const getCategoryIcon = (category: ActivityItem['category']) => {
    switch (category) {
      case 'auth':
        return <Shield className="w-4 h-4 text-emerald-500" />;
      case 'ticket':
        return <Ticket className="w-4 h-4 text-amber-500" />;
      case 'search':
        return <Search className="w-4 h-4 text-blue-500" />;
      case 'article':
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'settings':
        return <Settings className="w-4 h-4 text-slate-500" />;
      case 'ai-chat':
        return <MessageSquare className="w-4 h-4 text-purple-500" />;
      default:
        return <Activity className="w-4 h-4 text-slate-500" />;
    }
  };

  // Filter activities
  const filteredActivities = useMemo(() => {
    return activities
      .filter(act => {
        if (selectedCategory === 'all') return true;
        return act.category === selectedCategory;
      })
      .filter(act => {
        if (!searchQuery) return true;
        return act.action.toLowerCase().includes(searchQuery.toLowerCase());
      });
  }, [activities, selectedCategory, searchQuery]);

  // Group by Date
  const groupedActivities = useMemo(() => {
    const groups: { [key: string]: ActivityItem[] } = {
      today: [],
      yesterday: [],
      earlier: []
    };

    const todayStr = '2026-06-08';
    const yesterdayStr = '2026-06-07';

    filteredActivities.slice(0, visibleCount).forEach(act => {
      if (act.timestamp.startsWith(todayStr)) {
        groups.today.push(act);
      } else if (act.timestamp.startsWith(yesterdayStr)) {
        groups.yesterday.push(act);
      } else {
        groups.earlier.push(act);
      }
    });

    return groups;
  }, [filteredActivities, visibleCount]);

  const categories = [
    { value: 'all', labelEN: 'All Activity', labelAR: 'كل الأنشطة' },
    { value: 'auth', labelEN: 'Auth Sessions', labelAR: 'تسجيل الدخول' },
    { value: 'ticket', labelEN: 'Tickets', labelAR: 'التذاكر' },
    { value: 'search', labelEN: 'Searches', labelAR: 'عمليات البحث' },
    { value: 'article', labelEN: 'Articles Read', labelAR: 'المقالات المقروءة' },
    { value: 'settings', labelEN: 'Preferences', labelAR: 'التفضيلات' },
    { value: 'ai-chat', labelEN: 'AI Assist', labelAR: 'مساعد Farah AI' },
  ];

  return (
    <div className="space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
            {isRtl ? 'سجل العمليات والأنشطة' : 'Recent Activity Feed'}
          </h4>
          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
            {isRtl 
              ? 'تتبع عمليات التصفح، البحث عن الكلمات المفتاحية، وتحديثات الجلسات.' 
              : 'Audit history of page views, searches, settings changes, and API transactions.'}
          </span>
        </div>
        
        {activities.length > 0 && (
          <button
            onClick={handleClear}
            className={`py-1.5 px-3 border border-slate-200 dark:border-slate-800 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30 rounded-xl text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${FOCUS_RING}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isRtl ? 'مسح السجلات' : 'Clear Audit Log'}</span>
          </button>
        )}
      </div>

      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
          <History className="w-8 h-8 text-slate-400 stroke-1" aria-hidden="true" />
          <h5 className="font-extrabold text-xs text-slate-700 dark:text-slate-350">
            {isRtl ? 'السجل فارغ حالياً' : 'Activity history empty'}
          </h5>
          <p className="text-[10px] text-slate-450 dark:text-slate-500 leading-relaxed max-w-xs">
            {isRtl ? 'لم يتم تسجيل أي نشاط للبوابة بعد.' : 'No audit event logs recorded for this account.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Filters Panel */}
          <div className="flex flex-col sm:flex-row gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-850">
            {/* Search */}
            <div className="relative flex-1">
              <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? 'right-3' : 'left-3'}`} />
              <input
                type="text"
                placeholder={isRtl ? 'تصفية الأنشطة...' : 'Filter activity logs...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none ${FOCUS_RING} ${isRtl ? 'pr-8 pl-3' : 'pl-8 pr-3'}`}
              />
            </div>
            {/* Category Select */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none cursor-pointer ${FOCUS_RING}`}
              aria-label={isRtl ? 'تصفية الفئة' : 'Filter by category'}
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{isRtl ? cat.labelAR : cat.labelEN}</option>
              ))}
            </select>
          </div>

          {/* Timeline Feed */}
          <div className="space-y-4 relative border-s border-slate-200 dark:border-slate-800 ms-3 text-xs">
            
            {/* Group: Today */}
            {groupedActivities.today.length > 0 && (
              <div className="space-y-3 ps-4 relative">
                <div className={`absolute -start-1.5 top-1 w-3 h-3 rounded-full bg-blue-500 border border-white dark:border-slate-900`} />
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block font-mono">
                  {isRtl ? 'اليوم' : 'Today'}
                </span>
                
                {groupedActivities.today.map(act => (
                  <div key={act.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl flex justify-between items-start gap-4 hover:shadow-xs transition-shadow">
                    <div className="flex gap-2.5 items-start">
                      <div className="p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-lg shrink-0">
                        {getCategoryIcon(act.category)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700 dark:text-slate-300">{act.action}</p>
                        <span className="text-[9px] text-slate-400 font-mono font-semibold block mt-1">{act.timestamp}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[9px] font-bold text-slate-500 shrink-0">
                      IP: {act.ip}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Group: Yesterday */}
            {groupedActivities.yesterday.length > 0 && (
              <div className="space-y-3 ps-4 relative">
                <div className={`absolute -start-1.5 top-1 w-3 h-3 rounded-full bg-slate-400 border border-white dark:border-slate-900`} />
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block font-mono">
                  {isRtl ? 'أمس' : 'Yesterday'}
                </span>
                
                {groupedActivities.yesterday.map(act => (
                  <div key={act.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl flex justify-between items-start gap-4 hover:shadow-xs transition-shadow">
                    <div className="flex gap-2.5 items-start">
                      <div className="p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-lg shrink-0">
                        {getCategoryIcon(act.category)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700 dark:text-slate-300">{act.action}</p>
                        <span className="text-[9px] text-slate-400 font-mono font-semibold block mt-1">{act.timestamp}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[9px] font-bold text-slate-500 shrink-0">
                      IP: {act.ip}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Group: Earlier */}
            {groupedActivities.earlier.length > 0 && (
              <div className="space-y-3 ps-4 relative">
                <div className={`absolute -start-1.5 top-1 w-3 h-3 rounded-full bg-slate-300 border border-white dark:border-slate-900`} />
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block font-mono">
                  {isRtl ? 'أقدم' : 'Earlier'}
                </span>
                
                {groupedActivities.earlier.map(act => (
                  <div key={act.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl flex justify-between items-start gap-4 hover:shadow-xs transition-shadow">
                    <div className="flex gap-2.5 items-start">
                      <div className="p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-lg shrink-0">
                        {getCategoryIcon(act.category)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700 dark:text-slate-300">{act.action}</p>
                        <span className="text-[9px] text-slate-400 font-mono font-semibold block mt-1">{act.timestamp}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[9px] font-bold text-slate-500 shrink-0">
                      IP: {act.ip}
                    </span>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* Load More Pagination */}
          {filteredActivities.length > visibleCount && (
            <div className="flex justify-center pt-2">
              <button
                onClick={() => setVisibleCount(prev => prev + 4)}
                className={`py-2 px-4 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-2xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${INTERACTIVE_BTN_GHOST} ${FOCUS_RING}`}
              >
                <span>{isRtl ? 'تحميل المزيد من الأنشطة' : 'Load More Activity'}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Empty filtered state */}
          {filteredActivities.length === 0 && (
            <div className="text-center py-6 text-slate-450 dark:text-slate-500 font-semibold text-xs">
              {isRtl ? 'لا توجد أنشطة تطابق الفلتر' : 'No activity matches your filters.'}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
