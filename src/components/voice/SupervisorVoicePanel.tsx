import React, { useState } from 'react';
import { Eye, HelpCircle, Users2, ShieldOff, Play } from 'lucide-react';
import { SupervisorVoiceMode } from '@/hooks/useSupervisorVoice';

interface SupervisorVoicePanelProps {
  mode: SupervisorVoiceMode;
  whisperHint: string | null;
  onSilentMonitor: () => void;
  onWhisperCoach: (hint: string) => void;
  onBargeIn: () => void;
  onStopMonitoring: () => void;
}

export function SupervisorVoicePanel({
  mode,
  whisperHint,
  onSilentMonitor,
  onWhisperCoach,
  onBargeIn,
  onStopMonitoring
}: SupervisorVoicePanelProps) {
  const [customHint, setCustomHint] = useState('');

  const hintsSeed = [
    'Remind customer that refunds take 3-5 business days to reflect.',
    'Ask customer for the ORD shipping damages photo confirmation.',
    'Escalate to the Tier 2 Support queue if customer gets frustrated.'
  ];

  return (
    <div className="space-y-4">
      {/* Active mode status */}
      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-3 rounded-2xl flex items-center justify-between">
        <div>
          <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-bold font-mono">Supervisor Console</span>
          <strong className="block text-[11px] text-slate-800 dark:text-white capitalize">
            Mode: {mode === 'none' ? 'Inactive' : mode}
          </strong>
        </div>

        {mode !== 'none' && (
          <button
            onClick={onStopMonitoring}
            className="flex items-center gap-1 px-2 py-1 text-[9px] bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-lg font-bold"
          >
            <ShieldOff className="w-3.5 h-3.5" />
            <span>Stop Monitor</span>
          </button>
        )}
      </div>

      {/* Monitoring Actions Grid */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={onSilentMonitor}
          className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[9px] font-bold gap-1 transition-all ${
            mode === 'silent'
              ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-950/30 dark:border-blue-900 dark:text-blue-400'
              : 'bg-white border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Silent Monitor</span>
        </button>

        <button
          onClick={() => onWhisperCoach('Liam, confirm delivery status via USPS tracker.')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[9px] font-bold gap-1 transition-all ${
            mode === 'whisper'
              ? 'bg-amber-50 border-amber-250 text-amber-600 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-400'
              : 'bg-white border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Whisper Coach</span>
        </button>

        <button
          onClick={onBargeIn}
          className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[9px] font-bold gap-1 transition-all ${
            mode === 'barge'
              ? 'bg-emerald-50 border-emerald-250 text-emerald-600 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-400'
              : 'bg-white border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          <Users2 className="w-4 h-4" />
          <span>Barge In Call</span>
        </button>
      </div>

      {/* Whisper Coaching Trigger simulation templates */}
      {mode === 'whisper' && (
        <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 rounded-2xl space-y-2">
          <span className="block text-[8px] uppercase tracking-wider text-amber-700 dark:text-amber-400 font-bold font-mono">Whisper Hints Trigger:</span>
          
          <div className="space-y-1.5">
            {hintsSeed.map((h, i) => (
              <button
                key={i}
                onClick={() => onWhisperCoach(h)}
                className="w-full text-left p-1.5 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 hover:border-amber-400 text-[9px] text-slate-500 leading-relaxed rounded-lg truncate flex items-center justify-between"
              >
                <span className="truncate flex-1">{h}</span>
                <Play className="w-2.5 h-2.5 text-slate-400 shrink-0 ml-1.5" />
              </button>
            ))}
          </div>

          <div className="flex gap-1.5 mt-2">
            <input
              type="text"
              placeholder="Type custom whisper hint..."
              value={customHint}
              onChange={(e) => setCustomHint(e.target.value)}
              className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-900 text-[10px] px-2.5 py-1.5 rounded-lg outline-none text-slate-800 dark:text-white"
            />
            <button
              onClick={() => {
                if (!customHint) return;
                onWhisperCoach(customHint);
                setCustomHint('');
              }}
              className="px-2.5 py-1 text-[9px] bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold"
            >
              Push
            </button>
          </div>
        </div>
      )}

      {/* Whisper hint notification card */}
      {whisperHint && (
        <div className="p-3 bg-amber-100/50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded-lg text-xs leading-relaxed text-slate-700 dark:text-slate-300">
          <span className="block font-bold text-amber-700 dark:text-amber-400 font-mono text-[9px] uppercase mb-1">
            Incoming Supervisor Whisper Coaching:
          </span>
          <p className="italic font-mono">&quot;{whisperHint}&quot;</p>
        </div>
      )}
    </div>
  );
}
