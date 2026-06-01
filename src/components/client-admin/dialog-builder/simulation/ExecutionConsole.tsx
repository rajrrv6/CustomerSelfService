'use client';

import React, { useRef, useEffect } from 'react';
import { useDialogStore } from '../store/useDialogStore';
import { useUIStore } from '@/stores/uiStore';
import { Terminal, ShieldAlert } from 'lucide-react';

export function ExecutionConsole() {
  const lang = useUIStore((s) => s.lang);
  const isAr = lang === 'ar';

  const logs = useDialogStore((s) => s.simLogs);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when logs arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const logStyles = {
    info: 'text-blue-500',
    success: 'text-emerald-500',
    warning: 'text-amber-500',
    error: 'text-red-500'
  };

  return (
    <div
      className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col h-44 overflow-hidden shrink-0 font-mono text-[9px]"
      dir="ltr"
    >
      <div className="flex items-center gap-1.5 border-b border-slate-800 pb-1.5 text-slate-400 font-bold shrink-0">
        <Terminal className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
        <span className="uppercase tracking-wider">Developer Execution Console Logs</span>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto mt-2 space-y-1.5 text-[9px] font-semibold leading-normal pr-1 text-slate-300"
      >
        {logs.length === 0 ? (
          <p className="text-slate-600 italic">
            Console idle. Trigger &quot;Simulate&quot; to begin session tracing...
          </p>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="flex gap-1.5 items-start">
              <span className="text-slate-650 shrink-0 select-none">
                [{log.timestamp}]
              </span>
              <span className={`font-extrabold shrink-0 uppercase select-none ${logStyles[log.type] || 'text-slate-300'}`}>
                [{log.type}]
              </span>
              <span className="text-slate-400 shrink-0 font-bold max-w-28 truncate select-none">
                ({log.nodeName})
              </span>
              <span className="break-all font-medium">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
