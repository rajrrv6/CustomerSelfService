'use client';

import React, { useState, useMemo } from 'react';
import { 
  Bell, BellOff, Check, Search, Filter, AlertCircle, Info, RefreshCw
} from 'lucide-react';
import { 
  useAlerts, 
  useAcknowledgeAlert, 
  useAcknowledgeAll, 
  useTogglePinAlert 
} from '@/stores/notifications/notificationSelectors';
import { useApp } from '@/context/AppContext';
import { NotificationCard } from './NotificationCard';
import { 
  FOCUS_RING, INTERACTIVE_BTN_PRIMARY, INTERACTIVE_BTN_GHOST, GLASS_LIGHT 
} from '@/design-system/tokens';

export function NotificationCenter() {
  const { lang, addAuditLog } = useApp();
  const isRtl = lang === 'ar';

  const alerts = useAlerts();
  const acknowledgeAlert = useAcknowledgeAlert();
  const acknowledgeAll = useAcknowledgeAll();
  const togglePinAlert = useTogglePinAlert();

  // Local state for deleted and snoozed notifications (sandbox persistence)
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [snoozedIds, setSnoozedIds] = useState<string[]>([]);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // Grouping & Filtering Calculations
  const filteredAlerts = useMemo(() => {
    return alerts
      .filter(a => !deletedIds.includes(a.id))
      .filter(a => !snoozedIds.includes(a.id))
      .filter(a => {
        const cat = a.category as string;
        // Category mapping filter
        if (selectedCategory === 'all') return true;
        if (selectedCategory === 'security') return cat === 'compliance' || cat === 'security';
        if (selectedCategory === 'kb') return cat === 'kb' || cat === 'recommendation';
        return cat === selectedCategory;
      })
      .filter(a => {
        if (showUnreadOnly) return !a.read;
        return true;
      })
      .filter(a => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
          a.title.toLowerCase().includes(query) ||
          a.message.toLowerCase().includes(query) ||
          a.alertCode.toLowerCase().includes(query)
        );
      });
  }, [alerts, deletedIds, snoozedIds, selectedCategory, showUnreadOnly, searchQuery]);

  // Group alerts by Date
  const groupedAlerts = useMemo(() => {
    const groups: { [key: string]: typeof filteredAlerts } = {
      today: [],
      yesterday: [],
      earlier: []
    };

    const todayStr = '2026-06-08'; // Matches the metadata time context
    const yesterdayStr = '2026-06-07';

    filteredAlerts.forEach(alert => {
      if (alert.timestamp.startsWith(todayStr)) {
        groups.today.push(alert);
      } else if (alert.timestamp.startsWith(yesterdayStr)) {
        groups.yesterday.push(alert);
      } else {
        groups.earlier.push(alert);
      }
    });

    return groups;
  }, [filteredAlerts]);

  // Handlers
  const handleSnooze = (id: string, hours: number) => {
    setSnoozedIds(prev => [...prev, id]);
    addAuditLog(`Snoozed notification ${id} for ${hours} hours`, 'success');
  };

  const handleDelete = (id: string) => {
    setDeletedIds(prev => [...prev, id]);
    addAuditLog(`Dismissed notification ${id}`, 'success');
  };

  const handleMarkAllRead = () => {
    acknowledgeAll();
    addAuditLog(`Marked all notifications as read`, 'success');
  };

  // Categories definition
  const categories = [
    { value: 'all', labelEN: 'All Notifications', labelAR: 'كل التنبيهات' },
    { value: 'ticket', labelEN: 'Tickets', labelAR: 'تحديثات التذاكر' },
    { value: 'sla', labelEN: 'SLA Warnings', labelAR: 'تحذيرات الـ SLA' },
    { value: 'ai', labelEN: 'Farah AI', labelAR: 'مساعد فرح' },
    { value: 'security', labelEN: 'Security', labelAR: 'الأمن والحماية' },
    { value: 'kb', labelEN: 'Recommendations', labelAR: 'توصيات المقالات' },
  ];

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-200" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Search and Global Actions Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-xs">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            placeholder={isRtl ? 'ابحث في التنبيهات والأكواد...' : 'Search alerts, codes, or text...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-xs font-semibold focus:outline-none ${FOCUS_RING} ${isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'}`}
          />
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2 flex-wrap text-xs font-semibold">
          {/* Toggle Unread Only */}
          <button
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            className={`px-3 py-2 border rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 ${
              showUnreadOnly
                ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold'
                : 'border-slate-200 dark:border-slate-850 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
            } ${FOCUS_RING}`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{isRtl ? 'غير مقروءة فقط' : 'Unread Only'}</span>
          </button>

          {/* Mark All Read */}
          <button
            onClick={handleMarkAllRead}
            className={`px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-md shadow-blue-500/10 cursor-pointer flex items-center gap-1.5 ${INTERACTIVE_BTN_PRIMARY}`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isRtl ? 'تحديد الكل كمقروء' : 'Mark All Read'}</span>
          </button>
        </div>
      </div>

      {/* Category Horizontal Filter Bar (Sticky) */}
      <div className="sticky top-0 z-10 py-1 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md -mx-4 px-4 overflow-x-auto scrollbar-none flex gap-2">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-4 py-2 text-xs font-bold rounded-2xl whitespace-nowrap transition-all border cursor-pointer ${
              selectedCategory === cat.value
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-sm'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 text-slate-500 hover:border-slate-350 dark:hover:border-slate-700'
            } ${FOCUS_RING}`}
          >
            {isRtl ? cat.labelAR : cat.labelEN}
          </button>
        ))}
      </div>

      {/* Notification Lists Grouped by Date */}
      <div className="space-y-6" role="list">
        
        {/* Today Group */}
        {groupedAlerts.today.length > 0 && (
          <div className="space-y-3">
            <h5 className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              {isRtl ? 'اليوم' : 'Today'}
            </h5>
            <div className="space-y-3">
              {groupedAlerts.today.map(alert => (
                <NotificationCard
                  key={alert.id}
                  alert={alert}
                  onAcknowledge={acknowledgeAlert}
                  onTogglePin={togglePinAlert}
                  onSnooze={handleSnooze}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        )}

        {/* Yesterday Group */}
        {groupedAlerts.yesterday.length > 0 && (
          <div className="space-y-3">
            <h5 className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              {isRtl ? 'أمس' : 'Yesterday'}
            </h5>
            <div className="space-y-3">
              {groupedAlerts.yesterday.map(alert => (
                <NotificationCard
                  key={alert.id}
                  alert={alert}
                  onAcknowledge={acknowledgeAlert}
                  onTogglePin={togglePinAlert}
                  onSnooze={handleSnooze}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        )}

        {/* Earlier Group */}
        {groupedAlerts.earlier.length > 0 && (
          <div className="space-y-3">
            <h5 className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              {isRtl ? 'أقدم' : 'Earlier'}
            </h5>
            <div className="space-y-3">
              {groupedAlerts.earlier.map(alert => (
                <NotificationCard
                  key={alert.id}
                  alert={alert}
                  onAcknowledge={acknowledgeAlert}
                  onTogglePin={togglePinAlert}
                  onSnooze={handleSnooze}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredAlerts.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-full text-slate-400" aria-hidden="true">
              <BellOff className="w-8 h-8 stroke-1" />
            </div>
            <div className="space-y-1">
              <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {isRtl ? 'لا توجد تنبيهات تطابق البحث' : 'No notifications match filters'}
              </h5>
              <p className="text-[11px] text-slate-450 dark:text-slate-500 max-w-xs leading-relaxed">
                {isRtl 
                  ? 'أنت على اطلاع تام بجميع إشعارات الأنظمة وتذاكر الدعم حالياً.' 
                  : 'All operational parameters are stable. Change search terms or filters to check history.'}
              </p>
            </div>
            
            {(searchQuery || selectedCategory !== 'all' || showUnreadOnly) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setShowUnreadOnly(false);
                }}
                className={`py-1.5 px-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold cursor-pointer transition-colors ${FOCUS_RING}`}
              >
                {isRtl ? 'إعادة ضبط الفلاتر' : 'Reset All Filters'}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
