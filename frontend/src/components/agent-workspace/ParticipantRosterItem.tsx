'use client';

import React from 'react';
import { Play, Pause, Trash2 } from 'lucide-react';
import { Participant } from '@/types';
import { MuteToggle } from './MuteToggle';

interface ParticipantRosterItemProps {
  participant: Participant;
  isMuted: boolean;
  isOnHold: boolean;
  onMuteToggle: () => void;
  onHoldToggle: () => void;
  onRemove: () => void;
  lang: 'en' | 'ar';
}

export function ParticipantRosterItem({
  participant,
  isMuted,
  isOnHold,
  onMuteToggle,
  onHoldToggle,
  onRemove,
  lang,
}: ParticipantRosterItemProps) {
  const isRtl = lang === 'ar';

  return (
    <div
      className={`flex items-center justify-between p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-xs transition-all ${
        isOnHold ? 'opacity-75 bg-amber-500/5 dark:bg-amber-950/5' : ''
      }`}
    >
      {/* Participant profile details */}
      <div className={`flex items-center gap-2.5 min-w-0 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className="w-8.5 h-8.5 rounded-full bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 flex items-center justify-center font-extrabold font-mono shrink-0 select-none">
          {participant.name.charAt(0).toUpperCase()}
        </div>
        <div className={`min-w-0 ${isRtl ? 'text-right' : 'text-left'}`}>
          <h4 className="font-extrabold text-slate-900 dark:text-white text-xs truncate">
            {participant.name}
          </h4>
          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono mt-0.5 block">
            {participant.role === 'supervisor'
              ? isRtl
                ? 'مشرف'
                : 'Supervisor'
              : participant.role === 'agent'
              ? isRtl
                ? 'وكيل'
                : 'Agent'
              : isRtl
              ? 'مستشار خارجي'
              : 'External Expert'}{' '}
            • {participant.joinedAt}
          </span>
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Reusable MuteToggle */}
        <MuteToggle isMuted={isMuted} onToggle={onMuteToggle} lang={lang} />

        {/* Hold Toggle */}
        <button
          type="button"
          onClick={onHoldToggle}
          aria-pressed={isOnHold}
          aria-label={
            isOnHold
              ? isRtl
                ? 'استئناف المشارك'
                : 'Resume participant'
              : isRtl
              ? 'وضع المشارك في الانتظار'
              : 'Hold participant'
          }
          className={`p-2 rounded-xl border transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer ${
            isOnHold
              ? 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/20 dark:border-amber-900/50'
              : 'border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400'
          }`}
        >
          {isOnHold ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
        </button>

        {/* Kick Disconnect button */}
        <button
          type="button"
          onClick={onRemove}
          aria-label={isRtl ? 'إزالة المشترك من المكالمة' : 'Disconnect participant'}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 dark:hover:bg-rose-950/20 dark:hover:border-rose-900/50 transition-all focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
