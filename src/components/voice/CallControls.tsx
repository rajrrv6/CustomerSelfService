import React from 'react';
import { Mic, MicOff, Play, Pause, Disc, PhoneOff, Share2, Users } from 'lucide-react';

interface CallControlsProps {
  isMuted: boolean;
  isHeld: boolean;
  isRecording: boolean;
  onToggleMute: () => void;
  onToggleHold: () => void;
  onToggleRecording: () => void;
  onTransfer: () => void;
  onConference: () => void;
  onHangup: () => void;
  disabled?: boolean;
}

export function CallControls({
  isMuted,
  isHeld,
  isRecording,
  onToggleMute,
  onToggleHold,
  onToggleRecording,
  onTransfer,
  onConference,
  onHangup,
  disabled
}: CallControlsProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* 2x2 grid for hold, mute, recording, conference */}
      <div className="grid grid-cols-2 gap-3 text-[10px] font-bold">
        {/* Mute button */}
        <button
          onClick={onToggleMute}
          disabled={disabled}
          className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border transition-all ${
            isMuted
              ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900 dark:text-rose-400'
              : 'bg-white border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          {isMuted ? <MicOff className="w-4 h-4 text-rose-500" /> : <Mic className="w-4 h-4 text-slate-500" />}
          <span>{isMuted ? 'Muted' : 'Mute'}</span>
        </button>

        {/* Hold button */}
        <button
          onClick={onToggleHold}
          disabled={disabled}
          className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border transition-all ${
            isHeld
              ? 'bg-amber-50 border-amber-250 text-amber-600 dark:bg-amber-950/20 dark:border-amber-900 dark:text-amber-400'
              : 'bg-white border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          {isHeld ? <Play className="w-4 h-4 text-amber-500 animate-pulse" /> : <Pause className="w-4 h-4 text-slate-500" />}
          <span>{isHeld ? 'Held' : 'Hold'}</span>
        </button>

        {/* Record button */}
        <button
          onClick={onToggleRecording}
          disabled={disabled}
          className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border transition-all ${
            isRecording
              ? 'bg-red-50 border-red-250 text-red-600 dark:bg-red-950/20 dark:border-red-900 dark:text-red-400 font-bold'
              : 'bg-white border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Disc className={`w-4 h-4 ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-500'}`} />
          <span>{isRecording ? 'Recording' : 'Record'}</span>
        </button>

        {/* Conference button */}
        <button
          onClick={onConference}
          disabled={disabled}
          className="flex items-center justify-center gap-2 p-2.5 bg-white border border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
        >
          <Users className="w-4 h-4 text-slate-500" />
          <span>Conference</span>
        </button>
      </div>

      {/* Transfer & Hangup rows */}
      <div className="flex gap-3 text-[10px] font-bold">
        {/* Transfer Call */}
        <button
          onClick={onTransfer}
          disabled={disabled}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
        >
          <Share2 className="w-4 h-4 text-slate-500" />
          <span>Transfer Call</span>
        </button>

        {/* Hang up call */}
        <button
          onClick={onHangup}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl active:scale-98 transition-all"
        >
          <PhoneOff className="w-4 h-4" />
          <span>Hang Up</span>
        </button>
      </div>
    </div>
  );
}
