'use client';

import React from 'react';
import { Bot as BotIcon } from 'lucide-react';
import { Badge } from '@/components/shared/BadgeSystem';

interface BotCardProps {
  bot: {
    id: string;
    name: string;
    createdAt: string;
    status: 'active' | 'inactive' | 'draft' | string;
    persona: string;
    language: string[];
    deflectionRate: number;
    activeSessions: number;
    tone?: string;
  };
  lang: 'en' | 'ar';
  t: any;
  onEditPersona: () => void;
}

export function BotCard({ bot, lang, t, onEditPersona }: BotCardProps) {
  const handleNavigateFlows = () => {
    const ev = new CustomEvent('navigate-to-screen', { detail: { screenId: 'dialog_flow', botId: bot.id } });
    window.dispatchEvent(ev);
  };

  return (
    <div 
      className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
    >
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BotIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-850 dark:text-white">{bot.name}</h3>
              <span className="text-[10px] text-slate-450 dark:text-slate-500 font-medium">
                {lang === 'ar' ? 'تم الإنشاء:' : 'Created:'} {bot.createdAt}
              </span>
            </div>
          </div>
          <Badge type={bot.status}>
            {bot.status}
          </Badge>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal min-h-12">
          {bot.persona}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {bot.language.map((l) => (
            <span 
              key={l} 
              className="px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[9px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500"
            >
              {l}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
        <div className="grid grid-cols-2 gap-2 text-center text-xs">
          <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-100 dark:border-slate-900/50">
            <span className="text-[9px] text-slate-450 dark:text-slate-500 uppercase font-mono block">{t.clientAdmin.bots.deflection}</span>
            <span className="font-bold text-slate-850 dark:text-white font-mono">{bot.deflectionRate}%</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-100 dark:border-slate-900/50">
            <span className="text-[9px] text-slate-450 dark:text-slate-500 uppercase font-mono block">{t.clientAdmin.bots.activeChats}</span>
            <span className="font-bold text-slate-850 dark:text-white font-mono">{bot.activeSessions}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onEditPersona}
            className="flex-1 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-350 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {t.clientAdmin.bots.editPersona}
          </button>
          <button
            onClick={handleNavigateFlows}
            className="px-3 py-2 text-xs bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {t.clientAdmin.bots.flows}
          </button>
        </div>
      </div>
    </div>
  );
}
