import React, { useState, useRef, useEffect } from 'react';
import { Layers, ChevronDown } from 'lucide-react';
import { QueueConfig } from '@/data/seed/queueSeed';
import { useConversationStore } from '@/stores/conversationStore';

interface QueueSwitcherProps {
  queues: QueueConfig[];
  selectedQueue: string;
  onSelectQueue: (id: string) => void;
}

export function QueueSwitcher({ queues, selectedQueue: propsSelectedQueue, onSelectQueue: propsOnSelectQueue }: QueueSwitcherProps) {
  const store = useConversationStore();
  const selectedQueue = propsSelectedQueue !== undefined ? propsSelectedQueue : store.queueFilters.selectedQueue;
  const onSelectQueue = propsOnSelectQueue !== undefined ? propsOnSelectQueue : store.setSelectedQueue;

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeQueue = queues.find(q => q.id === selectedQueue) || queues[0];
  const activeQueueCount = store.queueActivity[activeQueue.id]?.count ?? activeQueue.count;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className="relative text-xs font-semibold"
    >
      <button
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls="queue-listbox"
        aria-label="Select conversation queue"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-slate-800 dark:text-slate-200 truncate max-w-32.5">{activeQueue.name}</span>
          <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full text-[9px] font-bold font-mono text-slate-500 dark:text-slate-400">
            {activeQueueCount}
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 ms-1.5" />
      </button>

      <div
        id="queue-listbox"
        role="listbox"
        className={`absolute top-full left-0 right-0 mt-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xl z-30 divide-y divide-slate-100 dark:divide-slate-880 ${
          isOpen ? 'block' : 'hidden'
        }`}
      >
        {queues.map((q) => {
          const metric = store.queueActivity[q.id];
          const count = metric ? metric.count : q.count;
          const activeAgentCount = metric ? metric.activeAgentCount : 0;
          const avgWaitMins = metric ? metric.avgWaitMins : 0;

          return (
            <button
              key={q.id}
              role="option"
              aria-selected={q.id === selectedQueue}
              onClick={() => {
                onSelectQueue(q.id);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-start flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:bg-slate-100 dark:focus:bg-slate-800 ${
                q.id === selectedQueue ? 'bg-blue-50/60 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400 font-bold' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <div className="flex flex-col text-start min-w-0">
                <span className="truncate">{q.name}</span>
                {metric && (
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono font-medium">
                    {activeAgentCount} agents • {avgWaitMins}m avg wait
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-bold">({count})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
