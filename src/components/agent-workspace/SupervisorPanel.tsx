import React from 'react';
import { Shield, Radio } from 'lucide-react';

interface SupervisorPanelProps {
  onTriggerWhisper: (text: string) => void;
  onJoinSession: () => void;
}

export function SupervisorPanel({ onTriggerWhisper, onJoinSession }: SupervisorPanelProps) {
  const whisperPrompts = [
    'Liam, verify user\'s API credentials mapping on ORD-998. Key validation logs showed authentication credentials mismatch.',
    'Ask for the Stripe gateway invoice reference ID INV-2026.',
    'Customer is Gold Corporate. Offer standard 10% contract renewal discount code.'
  ];

  return (
    <div className="bg-slate-50/95 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm text-xs font-semibold">
      <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Shield className="w-4.5 h-4.5 text-purple-600" />
          <h3 className="font-bold text-slate-800 dark:text-white">Supervisor Live Portal</h3>
        </div>
        <span className="flex items-center gap-1 text-[9px] text-emerald-500 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          LIVE MONITORING ACTIVE
        </span>
      </div>

      {/* Telemetry metrics */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Deflection Rate', val: '72.8%', sub: 'AI managed' },
          { label: 'Avg Wait Speed', val: '2.4 min', sub: 'Target < 3m' },
          { label: 'Active Supervisors', val: '2 Online', sub: 'Marc, Nadia' }
        ].map((met, idx) => (
          <div key={idx} className="p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 rounded-xl text-center">
            <span className="text-[9px] text-slate-400 font-bold uppercase font-mono block leading-tight">{met.label}</span>
            <span className="text-sm font-bold text-slate-800 dark:text-white block mt-1 font-mono">{met.val}</span>
            <span className="text-[8px] text-slate-500 dark:text-slate-400 block font-normal mt-0.5">{met.sub}</span>
          </div>
        ))}
      </div>

      {/* Whisper action logs */}
      <div className="space-y-2 pt-2">
        <span className="text-[10px] text-slate-400 font-bold uppercase font-mono block">Send Whisper Suggestion</span>
        <div className="space-y-2">
          {whisperPrompts.map((w, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onTriggerWhisper(w)}
              className="w-full text-left p-3 bg-purple-50/20 hover:bg-purple-50/50 dark:bg-purple-950/5 dark:hover:bg-purple-950/20 border border-purple-100 dark:border-purple-900/35 rounded-xl transition-all block text-[10px] leading-relaxed text-purple-750 dark:text-purple-400"
            >
              &quot;{w}&quot;
            </button>
          ))}
        </div>
      </div>

      {/* Handoff Join simulator */}
      <div className="pt-2">
        <button
          onClick={onJoinSession}
          className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-purple-600/20 text-xs"
        >
          <Radio className="w-4 h-4" />
          Join Active Session (Three-Way Chat)
        </button>
      </div>
    </div>
  );
}
