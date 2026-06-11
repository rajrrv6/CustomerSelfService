'use client';

import React from 'react';
import { Mic, MicOff } from 'lucide-react';

interface MuteToggleProps {
  isMuted: boolean;
  onToggle: () => void;
  lang?: 'en' | 'ar';
}

export function MuteToggle({ isMuted, onToggle, lang = 'en' }: MuteToggleProps) {
  const isRtl = lang === 'ar';
  const ariaLabel = isMuted
    ? isRtl
      ? 'إلغاء كتم الميكروفون'
      : 'Unmute microphone'
    : isRtl
    ? 'كتم الميكروفون'
    : 'Mute microphone';

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isMuted}
      aria-label={ariaLabel}
      className={`p-2 rounded-xl border transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer ${
        isMuted
          ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/50'
          : 'border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400'
      }`}
    >
      {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
    </button>
  );
}
