import React, { useState, useEffect } from 'react';
import { User, ShieldAlert } from 'lucide-react';
import { ActiveCall } from '@/hooks/useCallState';
import { CallQualityBadge } from './CallQualityBadge';
import { CallControls } from './CallControls';
import { CallTimeline } from './CallTimeline';
import { CallNotes } from './CallNotes';

interface ActiveCallPanelProps {
  call: ActiveCall;
  formatDuration: (sec: number) => string;
  onToggleMute: () => void;
  onToggleHold: () => void;
  onToggleRecording: () => void;
  onTransfer: () => void;
  onConference: () => void;
  onHangup: () => void;
}

export function ActiveCallPanel({
  call,
  formatDuration,
  onToggleMute,
  onToggleHold,
  onToggleRecording,
  onTransfer,
  onConference,
  onHangup
}: ActiveCallPanelProps) {
  const [notesText, setNotesText] = useState('');
  const [waveHeights, setWaveHeights] = useState<number[]>([12, 24, 18, 32, 16, 28, 20, 36, 14, 30, 22]);

  // Audio stream visualizer animation simulation
  useEffect(() => {
    if (call.status !== 'active' || call.isHeld) return;

    const interval = setInterval(() => {
      setWaveHeights((prev) =>
        prev.map(() => Math.floor(Math.random() * 32) + 6)
      );
    }, 150);

    return () => clearInterval(interval);
  }, [call.status, call.isHeld]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-5 text-xs text-slate-800 dark:text-slate-200 shadow-sm relative">
      
      {/* Call Header info */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold relative">
            <User className="w-5 h-5" />
            <span className={`absolute right-0 bottom-0 w-2.5 h-2.5 rounded-full border border-white dark:border-slate-900 ${
              call.status === 'held' ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'
            }`} />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <strong className="text-slate-800 dark:text-white text-[13px]">{call.contactName}</strong>
              <span className="text-[9px] uppercase tracking-wider px-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded font-bold font-mono">
                {call.direction}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono block leading-none mt-0.5">{call.phoneNumber}</span>
          </div>
        </div>

        {/* Call Timer duration indicator */}
        <div className="text-start sm:text-end">
          <span className="block text-[9px] text-slate-400 uppercase tracking-widest font-bold font-mono">
            {call.status === 'held' ? 'Call Held' : 'Live duration'}
          </span>
          <span className="text-xl font-black font-mono text-slate-900 dark:text-white leading-none">
            {formatDuration(call.duration)}
          </span>
        </div>
      </div>

      {/* Realtime voice soundwave simulation visualization */}
      {call.status === 'active' && !call.isHeld && (
        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center gap-2">
          <div className="flex items-end justify-center gap-1 h-12 w-full" style={{ maxWidth: '200px' }}>
            {waveHeights.map((h, i) => (
              <div
                key={i}
                className="w-1.5 bg-blue-500 rounded-full transition-all duration-150"
                style={{ height: `${h}px` }}
              />
            ))}
          </div>
          <span className="text-[8px] uppercase tracking-widest text-slate-400 font-mono font-bold animate-pulse">
            Realtime Voice Stream Active
          </span>
        </div>
      )}

      {call.status === 'held' && (
        <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-250 dark:border-amber-900/60 rounded-2xl p-4 text-center text-amber-700 dark:text-amber-400 space-y-1">
          <ShieldAlert className="w-5 h-5 mx-auto text-amber-500" />
          <strong className="block text-[11px]">Audio Stream Placed on Hold</strong>
          <p className="text-[9px] text-slate-500 font-normal">Customer is hearing hold music stream.</p>
        </div>
      )}

      {/* Call Quality parameters */}
      <CallQualityBadge quality={call.quality} latency={call.latency} packetLoss={call.packetLoss} />

      {/* live note typing */}
      <CallNotes value={notesText} onChange={setNotesText} />

      {/* dynamic audit timeline session trace logs */}
      <CallTimeline timeline={call.timeline} />

      {/* Action controls buttons row */}
      <CallControls
        isMuted={call.isMuted}
        isHeld={call.isHeld}
        isRecording={call.isRecording}
        onToggleMute={onToggleMute}
        onToggleHold={onToggleHold}
        onToggleRecording={onToggleRecording}
        onTransfer={onTransfer}
        onConference={onConference}
        onHangup={onHangup}
      />
    </div>
  );
}
