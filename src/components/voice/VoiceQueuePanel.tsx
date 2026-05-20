import React from 'react';
import { Users, Clock, Zap, Volume2 } from 'lucide-react';
import { QueuedCall } from '@/data/seed/voiceQueueSeed';

interface VoiceQueuePanelProps {
  queue: QueuedCall[];
  onAnswerCaller: (phoneNumber: string, name: string) => void;
  onSimulateInbound: () => void;
}

export function VoiceQueuePanel({ queue, onAnswerCaller, onSimulateInbound }: VoiceQueuePanelProps) {
  
  // Format seconds -> mm:ss
  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPriorityColor = (p: QueuedCall['priority']) => {
    if (p === 'VIP') return 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900';
    if (p === 'High') return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900';
    return 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-400 border border-slate-200 dark:border-slate-800';
  };

  // Stats calculation
  const totalWaiting = queue.length;
  const longestWait = queue.length > 0 ? Math.max(...queue.map((c) => c.waitTime)) : 0;
  const avgWait = queue.length > 0 ? Math.round(queue.reduce((acc, curr) => acc + curr.waitTime, 0) / queue.length) : 0;

  return (
    <div className="space-y-4">
      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-2.5 rounded-2xl text-center">
          <span className="block text-[8px] uppercase font-bold text-slate-450 tracking-wider">Active Queue</span>
          <div className="flex items-center justify-center gap-1.5 mt-0.5 text-slate-800 dark:text-white font-mono text-base font-bold">
            <Users className="w-3.5 h-3.5 text-blue-500" />
            <span>{totalWaiting}</span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-2.5 rounded-2xl text-center">
          <span className="block text-[8px] uppercase font-bold text-slate-450 tracking-wider">Max Wait</span>
          <div className="flex items-center justify-center gap-1.5 mt-0.5 text-slate-800 dark:text-white font-mono text-base font-bold">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>{formatTime(longestWait)}</span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-2.5 rounded-2xl text-center">
          <span className="block text-[8px] uppercase font-bold text-slate-450 tracking-wider">Avg Wait</span>
          <div className="flex items-center justify-center gap-1.5 mt-0.5 text-slate-800 dark:text-white font-mono text-base font-bold">
            <Zap className="w-3.5 h-3.5 text-emerald-500" />
            <span>{formatTime(avgWait)}</span>
          </div>
        </div>
      </div>

      {/* Simulator Trigger */}
      <button
        onClick={onSimulateInbound}
        className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 border border-slate-200 dark:border-slate-800 text-[10px] rounded-xl flex items-center justify-center gap-1.5 font-bold"
      >
        <Volume2 className="w-4 h-4 text-blue-500 shrink-0" />
        <span>Trigger Simulated Queue Inbound</span>
      </button>

      {/* Waiting Callers List */}
      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {queue.map((c) => (
          <div
            key={c.id}
            className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl flex justify-between items-center text-xs text-slate-800 dark:text-slate-200"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${getPriorityColor(c.priority)}`}>
                  {c.priority}
                </span>
                <strong className="text-slate-850 dark:text-white">{c.customerName}</strong>
              </div>
              <span className="block text-[9px] text-slate-450 font-mono leading-none">{c.phoneNumber}</span>
              <span className="block text-[9px] text-slate-400 font-mono">Queue: {c.queueName}</span>
            </div>

            <div className="text-right space-y-1.5">
              <span className="block text-[10px] font-mono text-slate-500 leading-none">
                Wait: {formatTime(c.waitTime)}
              </span>
              <button
                onClick={() => onAnswerCaller(c.phoneNumber, c.customerName)}
                className="px-2.5 py-1 text-[9px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
              >
                Pickup
              </button>
            </div>
          </div>
        ))}

        {queue.length === 0 && (
          <div className="text-center text-slate-500 italic py-6">All queues cleared. Agent capacity available.</div>
        )}
      </div>
    </div>
  );
}
