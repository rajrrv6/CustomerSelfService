import React from 'react';

export function TypingIndicator({ name }: { name: string }) {
  return (
    <div className="flex justify-start">
      <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl px-4 py-2 flex items-center gap-1.5 font-bold text-blue-500 font-mono text-[10px]">
        <div className="flex gap-1 items-center py-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span className="text-slate-450 font-sans ml-1">{name} is typing...</span>
      </div>
    </div>
  );
}
