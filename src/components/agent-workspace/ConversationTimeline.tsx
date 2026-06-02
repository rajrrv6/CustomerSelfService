import React from 'react';
import { Clock } from 'lucide-react';

interface ConversationTimelineProps {
  text: string;
  timestamp: string;
}

export function ConversationTimeline({ text, timestamp }: ConversationTimelineProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-400 font-mono tracking-wide">
      <Clock className="w-3.5 h-3.5 text-blue-500" />
      <span>{timestamp}</span>
      <span className="text-slate-500 dark:text-slate-400 font-sans italic font-normal">
        * {text}
      </span>
    </div>
  );
}
