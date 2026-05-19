import React from 'react';
import { Smile, Meh, Frown } from 'lucide-react';

interface SentimentBadgeProps {
  sentiment: 'positive' | 'neutral' | 'negative';
}

export function SentimentBadge({ sentiment }: SentimentBadgeProps) {
  const configs = {
    positive: {
      bg: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-850 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50',
      label: 'POSITIVE',
      icon: Smile
    },
    neutral: {
      bg: 'bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      label: 'NEUTRAL',
      icon: Meh
    },
    negative: {
      bg: 'bg-rose-100 dark:bg-rose-950/30 text-rose-800 dark:text-rose-450 border-rose-200 dark:border-rose-900/50',
      label: 'NEGATIVE',
      icon: Frown
    }
  };

  const current = configs[sentiment] || configs.neutral;
  const Icon = current.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[9px] font-bold font-mono tracking-wide ${current.bg}`}>
      <Icon className="w-3 h-3" />
      <span>{current.label}</span>
    </span>
  );
}
