import React from 'react';
import { Wifi, WifiOff, Activity } from 'lucide-react';

interface CallQualityBadgeProps {
  quality: 'excellent' | 'good' | 'poor';
  latency: number;
  packetLoss: number;
}

export function CallQualityBadge({ quality, latency, packetLoss }: CallQualityBadgeProps) {
  let badgeColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900';
  let qualityLabel = 'Excellent';
  let Icon = Wifi;

  if (quality === 'good') {
    badgeColor = 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900';
    qualityLabel = 'Good';
  } else if (quality === 'poor') {
    badgeColor = 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900';
    qualityLabel = 'Poor Connection';
    Icon = WifiOff;
  }

  return (
    <div className="flex items-center gap-3">
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeColor}`}>
        <Icon className="w-3.5 h-3.5" />
        <span>{qualityLabel}</span>
      </div>

      <div className="flex items-center gap-2.5 text-[10px] text-slate-500 font-mono">
        <span className="flex items-center gap-1">
          <Activity className="w-3 h-3 text-slate-500" />
          <span>RTT:</span>
          <strong className="text-slate-800 dark:text-slate-200">{latency}ms</strong>
        </span>
        <span className="h-2 w-px bg-slate-200 dark:bg-slate-800" />
        <span>Loss:</span>
        <strong className="text-slate-800 dark:text-slate-200">{packetLoss}%</strong>
      </div>
    </div>
  );
}
