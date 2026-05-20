import React, { useState, useEffect } from 'react';
import { Play, Pause, Trash2, Mail, MailOpen } from 'lucide-react';
import { VoicemailItem, voicemailsSeed } from '@/data/seed/sipConfigSeed';

export function VoicemailPanel() {
  const [voicemails, setVoicemails] = useState<VoicemailItem[]>(voicemailsSeed);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Play progress bar tick simulator
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (playingId) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setPlayingId(null);
            return 0;
          }
          return prev + 5;
        });
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [playingId]);

  const togglePlay = (id: string) => {
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
      setProgress(0);
      
      // Mark as read
      setVoicemails((prev) =>
        prev.map((v) => (v.id === id ? { ...v, isRead: true } : v))
      );
    }
  };

  const deleteVoicemail = (id: string) => {
    setVoicemails((prev) => prev.filter((v) => v.id !== id));
    if (playingId === id) {
      setPlayingId(null);
    }
  };

  return (
    <div className="space-y-3 h-full overflow-y-auto pr-1">
      {voicemails.map((vm) => (
        <div
          key={vm.id}
          className={`p-3 bg-slate-50 dark:bg-slate-950 border rounded-2xl flex flex-col gap-2 transition-all ${
            playingId === vm.id
              ? 'border-blue-500 shadow-sm'
              : vm.isRead
              ? 'border-slate-100 dark:border-slate-850'
              : 'border-blue-200 dark:border-blue-900 border-l-4'
          }`}
        >
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              {vm.isRead ? (
                <MailOpen className="w-4 h-4 text-slate-400" />
              ) : (
                <Mail className="w-4 h-4 text-blue-500" />
              )}
              <div>
                <strong className="block text-slate-850 dark:text-white text-xs">{vm.callerName}</strong>
                <span className="text-[10px] text-slate-450 font-mono">{vm.phoneNumber}</span>
              </div>
            </div>
            
            <div className="text-right">
              <span className="block text-[9px] text-slate-400 font-mono">{vm.timestamp}</span>
              <span className="text-[9px] text-slate-450 font-mono">({vm.duration})</span>
            </div>
          </div>

          {/* Transcription */}
          <div className="bg-white dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850">
            <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold font-mono mb-1">
              AI Speech-To-Text:
            </span>
            <p className="text-[10px] text-slate-450 leading-relaxed font-normal italic">
              &quot;{vm.transcription}&quot;
            </p>
          </div>

          {/* Audio Player simulation */}
          {playingId === vm.id && (
            <div className="space-y-1 bg-slate-200/50 dark:bg-slate-900/80 p-2 rounded-xl border border-slate-250 dark:border-slate-800">
              <div className="h-1.5 w-full bg-slate-300 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-[8px] text-slate-400 font-mono">
                <span>00:00</span>
                <span>{vm.duration}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-1 border-t border-slate-100 dark:border-slate-850">
            <button
              onClick={() => deleteVoicemail(vm.id)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-rose-500 rounded-lg"
              title="Delete voicemail"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => togglePlay(vm.id)}
              className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[9px] font-bold"
            >
              {playingId === vm.id ? (
                <>
                  <Pause className="w-3 h-3" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3" />
                  <span>Listen Voicemail</span>
                </>
              )}
            </button>
          </div>
        </div>
      ))}

      {voicemails.length === 0 && (
        <div className="text-center text-slate-500 italic py-10">Voicemail box is empty.</div>
      )}
    </div>
  );
}
