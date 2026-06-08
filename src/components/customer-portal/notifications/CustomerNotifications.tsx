'use client';

import React, { useState } from 'react';
import { Bell, ShieldAlert, Sparkles, Inbox, Sliders } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';
import { useNotificationStore } from '@/stores/notifications/notificationStore';
import { NotificationCenter } from './NotificationCenter';
import { NotificationPreferences } from './NotificationPreferences';
import { 
  FOCUS_RING, INTERACTIVE_BTN_GHOST, SURFACE_PANEL, ENTER_PANEL 
} from '@/design-system/tokens';

export function CustomerNotifications() {
  const { lang } = useApp();
  const t = translations[lang];
  const isRtl = lang === 'ar';
  
  const { alerts } = useNotificationStore();
  const unreadCount = alerts.filter(a => !a.read).length;

  const [activeTab, setActiveTab] = useState<'inbox' | 'preferences'>('inbox');

  return (
    <div 
      className={`space-y-6 text-slate-800 dark:text-slate-200 ${ENTER_PANEL}`} 
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Premium Hub Header Banner */}
      <div className={`p-6 rounded-3xl border flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
              {isRtl ? 'مركز الإشعارات والتحكم' : 'Notifications & Preferences Center'}
            </h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-[9px] font-black font-mono">
                {unreadCount} {isRtl ? 'جديد' : 'NEW'}
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 font-semibold block leading-relaxed">
            {isRtl 
              ? 'تتبع تنبيهات النظام، تحديثات التذاكر، واضبط قنوات الاستقبال والتوقيتات.' 
              : 'Track operational warnings, ticket events, and manage communication delivery channels.'}
          </span>
        </div>

        {/* Corporate Status */}
        <div className="px-3.5 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl text-[10px] font-extrabold font-mono flex items-center gap-1.5 shadow-sm border border-blue-500/20 w-fit">
          <Sparkles className="w-3.5 h-3.5" />
          <span>PORTAL MONITOR ACTIVE</span>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold gap-6 pb-0.5">
        <button
          onClick={() => setActiveTab('inbox')}
          className={`pb-2 border-b-2 px-1 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'inbox' 
              ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400 font-extrabold' 
              : 'border-transparent text-slate-500 hover:text-slate-850 dark:hover:text-white'
          } ${FOCUS_RING}`}
          role="tab"
          aria-selected={activeTab === 'inbox'}
        >
          <Inbox className="w-4 h-4" />
          <span>{isRtl ? 'علبة التنبيهات' : 'Notifications Inbox'}</span>
        </button>
        
        <button
          onClick={() => setActiveTab('preferences')}
          className={`pb-2 border-b-2 px-1 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'preferences' 
              ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400 font-extrabold' 
              : 'border-transparent text-slate-500 hover:text-slate-850 dark:hover:text-white'
          } ${FOCUS_RING}`}
          role="tab"
          aria-selected={activeTab === 'preferences'}
        >
          <Sliders className="w-4 h-4" />
          <span>{isRtl ? 'إعدادات الاستقبال' : 'Delivery Preferences'}</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="transition-all duration-300">
        {activeTab === 'inbox' ? (
          <NotificationCenter />
        ) : (
          <NotificationPreferences />
        )}
      </div>

    </div>
  );
}
