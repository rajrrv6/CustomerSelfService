import React from 'react';
import { Layers, ChevronDown } from 'lucide-react';
import { QueueConfig } from '@/data/seed/queueSeed';

interface QueueSwitcherProps {
  queues: QueueConfig[];
  selectedQueue: string;
  onSelectQueue: (id: string) => void;
}

export function QueueSwitcher({ queues, selectedQueue, onSelectQueue }: QueueSwitcherProps) {
  const activeQueue = queues.find(q => q.id === selectedQueue) || queues[0];

  return (
    <div className="relative group text-xs font-semibold">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-slate-800 dark:text-slate-200 truncate max-w-32.5">{activeQueue.name}</span>
          <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full text-[9px] font-bold font-mono text-slate-500 dark:text-slate-400">
            {activeQueue.count}
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 ml-1.5" />
      </div>

      <div className="absolute top-full left-0 right-0 mt-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xl hidden group-hover:block z-30 divide-y divide-slate-100 dark:divide-slate-800">
        {queues.map((q) => (
          <button
            key={q.id}
            onClick={() => onSelectQueue(q.id)}
            className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
              q.id === selectedQueue ? 'bg-blue-50/60 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400 font-bold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <span className="truncate mr-2">{q.name}</span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">({q.count})</span>
          </button>
        ))}
      </div>
    </div>
  );
}
