'use client';

import React from 'react';
import { Bell, Activity, ShieldCheck, ClipboardList } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SURFACE_PANEL } from '@/design-system/tokens';
import type { SupportStatusRowProps } from './types';

export const SupportStatusRow = React.memo(function SupportStatusRow({
  alertCount,
  recentTicket,
  onOpenNotifications,
  onOpenMyTickets
}: SupportStatusRowProps) {
  const { lang } = useApp();

  return (
    <div className="space-y-2 animate-in fade-in duration-200">
      <div className="flex items-center gap-2 px-1 py-0.5">
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shrink-0" />
        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
          {lang === 'ar' ? 'مؤشرات الدعم النشطة' : 'Active Support Telemetry'}
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        
        {/* Active Alerts */}
        <div className={`flex items-center justify-between p-2.5 rounded-2xl bg-blue-500/[0.04] dark:bg-blue-500/[0.08] border border-blue-500/10 dark:border-blue-500/20 text-[10.5px] font-semibold min-h-[50px] transition-all hover:bg-blue-500/[0.08] dark:hover:bg-blue-500/[0.12]`}>
          <div className="flex items-center gap-2 truncate">
            <div className="p-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
              <Bell className="w-3.5 h-3.5 shrink-0" />
            </div>
            <div className="truncate space-y-0.5">
              <span className="block text-[7px] text-slate-400 dark:text-slate-500 font-bold uppercase font-mono leading-none">
                {lang === 'ar' ? 'التنبيهات' : 'Alerts'}
              </span>
              <span className="font-extrabold text-[10px] text-slate-850 dark:text-white leading-tight">
                {alertCount} {lang === 'ar' ? 'نشط' : 'Active'}
              </span>
            </div>
          </div>
          <button
            onClick={onOpenNotifications}
            className="text-[8.5px] text-blue-500 hover:text-blue-600 font-bold cursor-pointer shrink-0 ml-1.5 transition-colors"
          >
            {lang === 'ar' ? 'عرض' : 'View'}
          </button>
        </div>

        {/* Live Support */}
        <div className={`flex items-center gap-2 p-2.5 rounded-2xl bg-emerald-500/[0.04] dark:bg-emerald-500/[0.08] border border-emerald-500/10 dark:border-emerald-500/20 text-[10.5px] font-semibold truncate min-h-[50px] transition-all hover:bg-emerald-500/[0.08] dark:hover:bg-emerald-500/[0.12]`}>
          <div className="p-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0 animate-pulse">
            <Activity className="w-3.5 h-3.5 shrink-0" />
          </div>
          <div className="truncate space-y-0.5">
            <span className="block text-[7px] text-slate-400 dark:text-slate-500 font-bold uppercase font-mono leading-none">
              {lang === 'ar' ? 'الدعم المباشر' : 'Live Help'}
            </span>
            <span className="font-extrabold text-[10px] text-slate-850 dark:text-white leading-tight">
              {lang === 'ar' ? 'متصل (<2د)' : 'ONLINE (<2m Wait)'}
            </span>
          </div>
        </div>

        {/* SLA Target */}
        <div className={`flex items-center justify-between p-2.5 rounded-2xl bg-teal-500/[0.04] dark:bg-teal-500/[0.08] border border-teal-500/10 dark:border-teal-500/20 text-[10.5px] font-semibold min-h-[50px] transition-all hover:bg-teal-500/[0.08] dark:hover:bg-teal-500/[0.12]`}>
          <div className="flex items-center gap-2 truncate">
            <div className="p-1 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-lg shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            </div>
            <div className="truncate space-y-0.5">
              <span className="block text-[7px] text-slate-400 dark:text-slate-500 font-bold uppercase font-mono leading-none">
                {lang === 'ar' ? 'الالتزام بـ SLA' : 'SLA Target'}
              </span>
              <span className="font-mono font-extrabold text-[10px] text-emerald-600 dark:text-emerald-400 leading-tight">
                99.98% OK
              </span>
            </div>
          </div>
          <span className="px-1 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded text-[6.5px] font-bold shrink-0">
            {lang === 'ar' ? 'مستقر' : 'OK'}
          </span>
        </div>

        {/* Last Case */}
        <div className={`flex items-center justify-between p-2.5 rounded-2xl bg-pink-500/[0.04] dark:bg-pink-500/[0.08] border border-pink-500/10 dark:border-pink-500/20 text-[10.5px] font-semibold min-h-[50px] transition-all hover:bg-pink-500/[0.08] dark:hover:bg-pink-500/[0.12]`}>
          <div className="flex items-center gap-2 truncate">
            <div className="p-1 bg-pink-500/10 text-pink-600 dark:text-pink-400 rounded-lg shrink-0">
              <ClipboardList className="w-3.5 h-3.5 shrink-0" />
            </div>
            <div className="truncate space-y-0.5">
              <span className="block text-[7px] text-slate-400 dark:text-slate-500 font-bold uppercase font-mono leading-none">
                {lang === 'ar' ? 'آخر تذكرة' : 'Last Case'}
              </span>
              <span className="font-extrabold text-[10px] text-slate-850 dark:text-white leading-tight truncate block max-w-[90px]">
                {recentTicket?.title || (lang === 'ar' ? 'لا يوجد' : 'None')}
              </span>
            </div>
          </div>
          <button
            onClick={onOpenMyTickets}
            className="text-[8.5px] text-blue-500 hover:text-blue-600 font-bold shrink-0 cursor-pointer ml-1.5 transition-colors"
          >
            {lang === 'ar' ? 'الكل' : 'All'}
          </button>
        </div>
      </div>
    </div>
  );
});
