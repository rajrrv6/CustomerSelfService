'use client';

import React from 'react';
import { Clock, Eye, EyeOff, User } from 'lucide-react';

export interface NoteItem {
  id: string;
  senderName: string;
  text: string;
  timestamp: string;
  visibility: 'internal' | 'public';
}

interface NoteTimelineCardProps {
  note: NoteItem;
  lang: 'en' | 'ar';
}

// A simple local markdown parser helper
function parseMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    // 1. Check for bullet list item
    if (line.trim().startsWith('- ')) {
      const content = line.trim().substring(2);
      return (
        <li key={lineIdx} className="list-disc list-inside ms-2 mt-0.5">
          {parseInlineStyles(content)}
        </li>
      );
    }
    return (
      <p key={lineIdx} className="leading-relaxed">
        {parseInlineStyles(line)}
      </p>
    );
  });
}

function parseInlineStyles(text: string): React.ReactNode[] {
  // Simple regex matching for backticks (`code`) and double asterisks (**bold**)
  const parts = text.split(/(\*\*.*?\*\*|`.*?`|@\w+(?:\s+\w+)?)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-extrabold text-purple-950 dark:text-purple-300">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-[10px]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('@')) {
      return (
        <span
          key={idx}
          className="text-purple-600 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-950/20 px-1 rounded"
        >
          {part}
        </span>
      );
    }
    return part;
  });
}

export function NoteTimelineCard({ note, lang }: NoteTimelineCardProps) {
  const isRtl = lang === 'ar';
  const isInternal = note.visibility === 'internal';

  return (
    <div
      className={`p-3.5 border-2 rounded-2xl shadow-xs transition-colors duration-200 ${
        isInternal
          ? 'border-purple-200 bg-purple-50/40 dark:border-purple-900/40 dark:bg-purple-950/10'
          : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40'
      }`}
    >
      {/* Header Info */}
      <div className={`flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/50 dark:border-slate-850 pb-2 mb-2 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
            <User className="w-3.5 h-3.5" />
          </div>
          <span className="font-extrabold text-slate-900 dark:text-white text-xs">
            {note.senderName}
          </span>
        </div>

        <div className={`flex items-center gap-2 font-mono text-[10px] text-slate-400 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{note.timestamp}</span>
          </span>
          <span className="h-3.5 w-px bg-slate-200 dark:bg-slate-800" />
          <span className="flex items-center gap-1">
            {isInternal ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-purple-500" />
                <span className="text-purple-600 dark:text-purple-400">
                  {lang === 'ar' ? 'داخلي فقط' : 'Internal'}
                </span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>{lang === 'ar' ? 'عام للجميع' : 'Public'}</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Markdown Body */}
      <div className={`text-slate-700 dark:text-slate-300 text-xs font-semibold leading-relaxed space-y-1.5 ${isRtl ? 'text-right' : 'text-left'}`}>
        {parseMarkdown(note.text)}
      </div>
    </div>
  );
}
