import React from 'react';
import { CornerDownRight } from 'lucide-react';

interface CallTimelineProps {
  timeline: string[];
}

export function CallTimeline({ timeline }: CallTimelineProps) {
  return (
    <div className="space-y-2">
      <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-mono">SIP Session Trace:</span>
      <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 h-32 overflow-y-auto space-y-1.5 font-mono text-[9px] text-slate-400 leading-relaxed scrollbar-thin">
        {timeline.map((event, idx) => (
          <div key={idx} className="flex gap-1.5 border-b border-slate-900/40 pb-1">
            <CornerDownRight className="w-3 h-3 text-blue-500 shrink-0 mt-0.5" />
            <span className="break-all">{event}</span>
          </div>
        ))}
        {timeline.length === 0 && (
          <div className="text-center text-slate-600 italic py-6">No call sessions events recorded.</div>
        )}
      </div>
    </div>
  );
}
