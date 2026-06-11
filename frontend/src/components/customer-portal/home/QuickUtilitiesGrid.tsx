'use client';
 
import React from 'react';
import { Plus, MessageSquare, PhoneCall, ShieldCheck, BookOpen, ClipboardList, Bot, Activity, ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SURFACE_PANEL, INTERACTIVE_CARD, SUPPORT_MICRO_TRANSITION } from '@/design-system/tokens';
import type { QuickUtilitiesGridProps } from './types';
 
export const QuickUtilitiesGrid = React.memo(function QuickUtilitiesGrid({
  onOpenTickets,
  onOpenChat,
  onOpenCallback,
  onOpenCobrowse,
  onOpenKnowledgeHub,
  onOpenMyTickets,
  onOpenCopilot,
  onOpenSystemStatus
}: QuickUtilitiesGridProps) {
  const { lang } = useApp();
 
  const items = [
    {
      id: 'ticket',
      title: lang === 'ar' ? 'تقديم تذكرة دعم' : 'Submit Ticket',
      desc: lang === 'ar' ? 'إنشاء بلاغ دعم فني' : 'File a support case',
      icon: <Plus className="w-4.5 h-4.5 text-purple-500" />,
      onClick: onOpenTickets
    },
    {
      id: 'chat',
      title: lang === 'ar' ? 'المحادثة الفورية' : 'Live Chat',
      desc: lang === 'ar' ? 'تواصل مع الدعم الذكي' : 'Consult Farah AI',
      icon: <MessageSquare className="w-4.5 h-4.5 text-blue-500" />,
      onClick: onOpenChat
    },
    {
      id: 'callback',
      title: lang === 'ar' ? 'طلب مكالمة هاتفية' : 'Voice Callback',
      desc: lang === 'ar' ? 'جدولة اتصال الدعم الفني' : 'Schedule callback',
      icon: <PhoneCall className="w-4.5 h-4.5 text-indigo-500" />,
      onClick: onOpenCallback
    },
    {
      id: 'cobrowse',
      title: lang === 'ar' ? 'تصفح مشترك' : 'Co-Browse',
      desc: lang === 'ar' ? 'مشاركة شاشة آمنة' : 'Secure screen share',
      icon: <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />,
      onClick: onOpenCobrowse
    },
    {
      id: 'kb_hub',
      title: lang === 'ar' ? 'مركز المعرفة' : 'Knowledge Hub',
      desc: lang === 'ar' ? 'تصفح مقالات الدعم والمساعدة' : 'Browse setup guides',
      icon: <BookOpen className="w-4.5 h-4.5 text-amber-500" />,
      onClick: onOpenKnowledgeHub
    },
    {
      id: 'track',
      title: lang === 'ar' ? 'متابعة التذاكر' : 'Track Tickets',
      desc: lang === 'ar' ? 'حالة البلاغات النشطة' : 'View active cases',
      icon: <ClipboardList className="w-4.5 h-4.5 text-pink-500" />,
      onClick: onOpenMyTickets
    },
    {
      id: 'copilot',
      title: lang === 'ar' ? 'مساعد فرح الذكي' : 'AI Copilot',
      desc: lang === 'ar' ? 'مساحة العمل الذكية' : 'AI workspace engine',
      icon: <Bot className="w-4.5 h-4.5 text-teal-500" />,
      onClick: onOpenCopilot
    },
    {
      id: 'status',
      title: lang === 'ar' ? 'حالة النظام' : 'System Status',
      desc: lang === 'ar' ? 'استقرار وجودة الخدمات' : 'Monitor platform systems',
      icon: <Activity className="w-4.5 h-4.5 text-rose-500" />,
      onClick: onOpenSystemStatus
    }
  ];
 
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
      {items.map(item => (
        <button
          key={item.id}
          onClick={item.onClick}
          className={`group flex items-center gap-3 p-3 rounded-2xl text-left transition-all active:scale-[0.98] min-h-[76px] border border-slate-200/60 dark:border-slate-800/40 hover:border-blue-400/50 dark:hover:border-blue-500/30 hover:shadow-md hover:-translate-y-0.5 ${SURFACE_PANEL} ${INTERACTIVE_CARD} ${SUPPORT_MICRO_TRANSITION}`}
          style={{ textAlign: lang === 'ar' ? 'right' : 'left' }}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-100/80 to-slate-200/40 dark:from-slate-950 dark:to-slate-900/80 border border-slate-200/50 dark:border-slate-800/60 flex items-center justify-center group-hover:scale-105 group-hover:shadow-sm transition-all shrink-0">
            {item.icon}
          </div>
          <div className="space-y-0.5 min-w-0 flex-1">
            <h5 className="font-extrabold text-[11px] text-slate-855 dark:text-white leading-tight truncate">
              {item.title}
            </h5>
            <p className="text-[9px] text-slate-400 dark:text-slate-455 leading-none truncate">
              {item.desc}
            </p>
          </div>
          <ChevronRight className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-all shrink-0 self-center ${lang === 'ar' ? 'mr-auto rotate-180 group-hover:-translate-x-0.5' : 'ml-auto group-hover:translate-x-0.5'}`} />
        </button>
      ))}
    </div>
  );
});
