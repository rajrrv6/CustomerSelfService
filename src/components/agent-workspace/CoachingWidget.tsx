import React from 'react';
import { ShieldAlert, Send } from 'lucide-react';

interface CoachingWidgetProps {
  whisper: string;
  onApplyWhisper?: (text: string) => void;
  onClose?: () => void;
}

export function CoachingWidget({ whisper, onApplyWhisper, onClose }: CoachingWidgetProps) {
  if (!whisper) return null;

  return (
    <div className="bg-purple-100 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded-2xl p-4 flex gap-3 text-purple-700 dark:text-purple-400 animate-in slide-in-from-top-4 duration-250">
      <div className="w-8 h-8 rounded-lg bg-purple-200 dark:bg-purple-900/40 flex items-center justify-center text-purple-700 dark:text-purple-300 shrink-0">
        <ShieldAlert className="w-4.5 h-4.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Supervisor Live Whisper:</span>
          {onClose && (
            <button onClick={onClose} className="text-purple-400 hover:text-purple-600 font-bold text-xs leading-none">
              ×
            </button>
          )}
        </div>
        <p className="mt-1 leading-normal font-normal text-xs">
          &quot;{whisper}&quot;
        </p>
        {onApplyWhisper && (
          <div className="mt-2.5 flex gap-2">
            <button
              onClick={() => onApplyWhisper(whisper)}
              className="flex items-center gap-1 px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[9px] font-bold transition-all shadow-sm"
            >
              <Send className="w-3 h-3" />
              Copy Whisper to Composer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
