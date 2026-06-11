'use client';

import React from 'react';
import { ShieldCheck, PhoneOff, Activity } from 'lucide-react';

interface ConferenceStatusCardProps {
  status: 'active' | 'ended';
  participantCount: number;
  onEnd: () => void;
  lang: 'en' | 'ar';
}

export function ConferenceStatusCard({
  status,
  participantCount,
  onEnd,
  lang,
}: ConferenceStatusCardProps) {
  const isRtl = lang === 'ar';

  return (
    <div
      className={`p-3.5 bg-purple-600/5 border border-purple-500/10 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5 shadow-xs`}
    >
      <div className={`flex items-start gap-3 min-w-0 ${isRtl ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
        <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 shrink-0 select-none">
          <Activity className="w-5 h-5 animate-pulse" />
        </div>
        <div className="min-w-0">
          <h4 className="font-extrabold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
            <span>{isRtl ? 'جسر المؤتمر الصوتي نشط' : 'SIP Conference Bridge Active'}</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </h4>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5 leading-relaxed">
            {isRtl
              ? `قنوات مدمجة: 3-Way Voip • ترميز Opus HD • ${participantCount} جهات اتصال`
              : `VoIP lines merged: 3-Way Bridge • Codec: Opus HD • ${participantCount} Active`}
          </p>
        </div>
      </div>

      <div className={`flex items-center gap-2 shrink-0 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className="flex items-center gap-1 text-[9px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-2 py-1 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{isRtl ? 'آمن' : 'Secured'}</span>
        </div>

        <button
          type="button"
          onClick={onEnd}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-750 text-white rounded-xl font-bold transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <PhoneOff className="w-3.5 h-3.5" />
          <span>{isRtl ? 'إنهاء جسر الاتصال' : 'Tear Down Bridge'}</span>
        </button>
      </div>
    </div>
  );
}
