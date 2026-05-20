import React from 'react';
import { PhoneIncoming, PhoneOutgoing, PhoneMissed, Voicemail, Play } from 'lucide-react';
import { CallHistoryItem } from '@/data/seed/callHistorySeed';

interface CallHistoryProps {
  history: CallHistoryItem[];
  onDial: (num: string, name: string) => void;
}

export function CallHistory({ history, onDial }: CallHistoryProps) {
  const getStatusIcon = (item: CallHistoryItem) => {
    if (item.status === 'missed') return <PhoneMissed className="w-4 h-4 text-rose-500" />;
    if (item.status === 'voicemail') return <Voicemail className="w-4 h-4 text-purple-500" />;
    return item.direction === 'inbound' 
      ? <PhoneIncoming className="w-4 h-4 text-emerald-500" />
      : <PhoneOutgoing className="w-4 h-4 text-blue-500" />;
  };

  return (
    <div className="space-y-3 h-full overflow-y-auto pr-1">
      {history.map((c) => (
        <div
          key={c.id}
          className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl flex flex-col gap-2 hover:border-blue-500 dark:hover:border-blue-500 transition-all text-xs text-slate-800 dark:text-slate-200"
        >
          {/* Row 1: Header */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {getStatusIcon(c)}
              <div>
                <strong className="block text-slate-850 dark:text-white">{c.contactName}</strong>
                <span className="text-[10px] text-slate-450 font-mono">{c.phoneNumber}</span>
              </div>
            </div>
            
            <div className="text-right">
              <span className="block text-[10px] text-slate-400 font-mono">{c.timestamp}</span>
              {c.duration && c.status !== 'missed' && (
                <span className="text-[10px] text-slate-450 font-mono">({c.duration})</span>
              )}
            </div>
          </div>

          {/* Row 2: Notes / Code */}
          {(c.disposition || c.notes) && (
            <div className="bg-white dark:bg-slate-900/40 p-2 rounded-xl border border-slate-100 dark:border-slate-850 space-y-1">
              {c.disposition && (
                <span className="inline-block px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 text-[9px] font-bold">
                  {c.disposition}
                </span>
              )}
              {c.notes && (
                <p className="text-[10px] text-slate-450 leading-relaxed font-normal">{c.notes}</p>
              )}
            </div>
          )}

          {/* Call Actions */}
          <div className="flex gap-2 justify-end pt-1 border-t border-slate-100 dark:border-slate-850">
            {c.recordingUrl && (
              <button
                onClick={() => alert(`Simulating play audio: ${c.recordingUrl}`)}
                className="flex items-center gap-1 px-2.5 py-1 text-[9px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 rounded-lg"
              >
                <Play className="w-3 h-3 text-slate-500" />
                <span>Play Rec</span>
              </button>
            )}
            <button
              onClick={() => onDial(c.phoneNumber, c.contactName)}
              className="px-2.5 py-1 text-[9px] bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
            >
              Call Back
            </button>
          </div>
        </div>
      ))}

      {history.length === 0 && (
        <div className="text-center text-slate-500 italic py-10">No recent calls recorded.</div>
      )}
    </div>
  );
}
