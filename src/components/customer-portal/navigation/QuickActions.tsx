'use client';

import React from 'react';
import { Plus, MessageSquare, PhoneCall, Layers, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';

interface QuickActionsProps {
  onActionClick: (action: string) => void;
}

export function QuickActions({ onActionClick }: QuickActionsProps) {
  const { lang } = useApp();
  const t = translations[lang];
  const isRtl = lang === 'ar';

  const actions = [
    {
      id: 'ticket',
      title: isRtl ? 'فتح تذكرة' : 'Submit Ticket',
      desc: isRtl ? 'إنشاء تذكرة ومتابعة الحل' : 'Report an incident',
      icon: <Plus className="w-5 h-5 text-purple-500" />,
      bgClass: 'hover:border-purple-500/50 hover:shadow-purple-500/5'
    },
    {
      id: 'chat',
      title: isRtl ? 'دردشة حية' : 'Live Chat',
      desc: isRtl ? 'تحدث مباشرة مع فرح' : 'Talk with Farah AI',
      icon: <MessageSquare className="w-5 h-5 text-blue-500" />,
      bgClass: 'hover:border-blue-500/50 hover:shadow-blue-500/5'
    },
    {
      id: 'callback',
      title: isRtl ? 'حجز اتصال' : 'Voice Callback',
      desc: isRtl ? 'جدولة موعد اتصال هاتفي' : 'Schedule agent call',
      icon: <PhoneCall className="w-5 h-5 text-indigo-500" />,
      bgClass: 'hover:border-indigo-500/50 hover:shadow-indigo-500/5'
    },
    {
      id: 'cobrowse',
      title: isRtl ? 'مشاركة شاشة' : 'Co-Browse',
      desc: isRtl ? 'مشاركة شاشتك مع وكيل' : 'Share screen with agent',
      icon: <Layers className="w-5 h-5 text-emerald-500" />,
      bgClass: 'hover:border-emerald-500/50 hover:shadow-emerald-500/5'
    }
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-450 animate-pulse" />
        <h4 className="font-bold text-xs text-slate-800 dark:text-white uppercase tracking-wider font-mono">
          {isRtl ? 'الحلول السريعة الفورية' : 'Instant Self-Service Utilities'}
        </h4>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((act) => (
          <button
            key={act.id}
            onClick={() => onActionClick(act.id)}
            className={`w-full h-full min-h-[145px] flex flex-col items-start p-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-2xl transition-all duration-300 text-left cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:border-blue-500/35 hover:bg-white dark:hover:bg-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${act.bgClass}`}
            style={{ textAlign: isRtl ? 'right' : 'left' }}
          >
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850/50 mb-3 shadow-xs transition-transform duration-300 group-hover:scale-110">
              {act.icon}
            </div>
            <h5 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
              {act.title}
            </h5>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1 font-medium leading-normal">
              {act.desc}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
