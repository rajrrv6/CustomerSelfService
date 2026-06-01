'use client';

import React from 'react';
import { Flame, Clock } from 'lucide-react';
import { translations } from '@/i18n/translations';

interface WorkspaceAuxToolbarProps {
  auxStatus: 'online' | 'busy' | 'away' | 'break';
  onAuxStatusChange: (status: 'online' | 'busy' | 'away' | 'break') => void;
  auxSeconds: number;
  formatAuxTime: (sec: number) => string;
  activeConversationCount: (conversations: any[]) => number;
  conversations: any[];
  lang: 'en' | 'ar';
}

export function WorkspaceAuxToolbar({
  auxStatus,
  onAuxStatusChange,
  auxSeconds,
  formatAuxTime,
  activeConversationCount,
  conversations,
  lang,
}: WorkspaceAuxToolbarProps) {
  const t = translations[lang];

  return (
    <div className="flex min-h-12 shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-slate-200 bg-slate-50/80 px-3 py-2 text-[11px] font-bold text-slate-600 dark:border-slate-800 dark:bg-slate-950/20 dark:text-slate-300 sm:px-5 sm:py-0 sm:h-12 sm:flex-nowrap">
      {/* Active capacity status */}
      <div className="flex items-center gap-3">
        <span data-testid="capacity-meter" className="flex items-center gap-1">
          <Flame className="w-4 h-4 text-orange-500 shrink-0" />
          <span>{t.agentWorkspace.aux.capacityMeter}</span>
          <span className="font-mono text-slate-800 dark:text-slate-200">
            {activeConversationCount(conversations)}/4 {t.agentWorkspace.aux.active}
          </span>
        </span>
      </div>

      {/* Break state controls */}
      <div className="flex items-center gap-3">
        <span className="text-slate-500 dark:text-slate-400 uppercase font-mono text-[9px]">{t.agentWorkspace.aux.breakState}</span>
        <div className="flex bg-slate-200 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-300 dark:border-slate-700 text-[10px] font-bold">
          {(['online', 'away', 'break'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => onAuxStatusChange(st)}
              className={`px-2.5 py-1 rounded transition-all capitalize cursor-pointer ${
                auxStatus === st ? 'bg-slate-55 bg-slate-50 dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {st === 'online' ? t.agentWorkspace.aux.online : st === 'away' ? t.agentWorkspace.aux.away : t.agentWorkspace.aux.break}
            </button>
          ))}
        </div>
        
        <span className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
          <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>{t.agentWorkspace.aux.duration}</span>
          <span className="text-slate-800 dark:text-white font-bold">{formatAuxTime(auxSeconds)}</span>
        </span>
      </div>
    </div>
  );
}
