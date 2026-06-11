'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, Sparkles, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { CollaboratorSelector, Collaborator } from './CollaboratorSelector';

interface NoteComposerProps {
  onSend: (text: string, visibility: 'internal' | 'public') => Promise<void>;
  isRtl: boolean;
  lang: 'en' | 'ar';
}

const SEED_COLLABORATORS: Collaborator[] = [
  { id: 'agent-1', name: 'Liam Bennett', role: 'agent', status: 'online' },
  { id: 'agent-2', name: 'Sarah Jenkins', role: 'agent', status: 'busy' },
  { id: 'agent-3', name: 'Tariq Mansoor', role: 'agent', status: 'away' },
  { id: 'agent-4', name: 'Nadia Vance', role: 'supervisor', status: 'online' },
  { id: 'agent-5', name: 'Ahmed Tariq', role: 'agent', status: 'offline' },
];

export function NoteComposer({ onSend, isRtl, lang }: NoteComposerProps) {
  const [text, setText] = useState('');
  const [visibility, setVisibility] = useState<'internal' | 'public'>('internal');
  
  // States for @mention dropdown
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionIndex, setMentionIndex] = useState(0);
  const [mentionTriggerIndex, setMentionTriggerIndex] = useState(-1);

  // States for action feedback
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const statusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
    };
  }, []);

  const filteredCollaborators = SEED_COLLABORATORS.filter((c) =>
    c.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentions && filteredCollaborators.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIndex((prev) => (prev + 1) % filteredCollaborators.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex(
          (prev) => (prev - 1 + filteredCollaborators.length) % filteredCollaborators.length
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        insertMention(filteredCollaborators[mentionIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowMentions(false);
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);

    const selectionStart = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, selectionStart);
    const lastAtPos = textBeforeCursor.lastIndexOf('@');

    if (lastAtPos !== -1 && lastAtPos >= textBeforeCursor.lastIndexOf(' ')) {
      const query = textBeforeCursor.slice(lastAtPos + 1);
      setMentionQuery(query);
      setMentionTriggerIndex(lastAtPos);
      setShowMentions(true);
      setMentionIndex(0);
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (collaborator: Collaborator) => {
    if (mentionTriggerIndex === -1 || !textareaRef.current) return;
    const textStart = text.slice(0, mentionTriggerIndex);
    const textEnd = text.slice(textareaRef.current.selectionStart);
    const completedText = `${textStart}@${collaborator.name} ${textEnd}`;
    setText(completedText);
    setShowMentions(false);

    // Reposition cursor
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const cursorPosition = mentionTriggerIndex + collaborator.name.length + 2; // +2 for @ and space
        textareaRef.current.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 0);
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setStatus('loading');
    setErrorMessage('');

    try {
      if (text.toLowerCase().includes('fail')) {
        throw new Error('Simulated network dropout during collaboration handshake.');
      }
      await onSend(text, visibility);
      setText('');
      if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
      statusTimeoutRef.current = setTimeout(() => setStatus('idle'), 2500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dispatch note.');
      setStatus('error');
    }
  };

  return (
    <div className="space-y-2.5 relative text-xs font-semibold">
      {/* Mentions dropdown popup */}
      {showMentions && (
        <CollaboratorSelector
          collaborators={SEED_COLLABORATORS}
          searchQuery={mentionQuery}
          selectedIndex={mentionIndex}
          onSelect={insertMention}
          isRtl={isRtl}
        />
      )}

      {/* Composer Textarea wrapper */}
      <div className="relative border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950 p-2.5 shadow-sm space-y-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={
            lang === 'ar'
              ? 'سجل ملاحظة للمجموعة... (استخدم @ للإشارة لزملاء العمل)'
              : 'Log note for team... (Type @ to mention team members)'
          }
          aria-expanded={showMentions}
          aria-controls={showMentions ? 'collaborator-listbox' : undefined}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          rows={3}
          className="w-full bg-transparent border-none resize-none focus:outline-none focus:ring-0 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-xs font-medium leading-relaxed"
        />

        {/* Composer Toolbar */}
        <div className={`flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-900 pt-2 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* Visibility Toggle Switch */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setVisibility(visibility === 'internal' ? 'public' : 'internal')}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 transition-colors cursor-pointer ${
                visibility === 'internal'
                  ? 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/50 dark:bg-purple-950/20 dark:text-purple-300'
                  : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-450'
              }`}
            >
              {visibility === 'internal' ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'ملاحظة سرية' : 'Internal Only'}</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'الجدول العام' : 'Public Timeline'}</span>
                </>
              )}
            </button>
            <span className="text-[9px] text-slate-400 font-mono hidden md:inline">
              {lang === 'ar' ? 'تنسيق Markdown مدعوم' : 'Markdown formatting supported'}
            </span>
          </div>

          {/* Submit action button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={status === 'loading' || !text.trim()}
            className="flex items-center gap-1.5 px-4.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-750 text-white font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {status === 'loading' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{lang === 'ar' ? 'جاري الحفظ...' : 'Saving...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'تسجيل الملاحظة' : 'Save Note'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Action feedback banners */}
      {status === 'success' && (
        <div className={`flex items-center gap-2 p-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-400 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{lang === 'ar' ? 'تمت إضافة الملاحظة للمخطط الزمني!' : 'Note logged successfully!'}</span>
        </div>
      )}

      {status === 'error' && (
        <div className={`flex items-center gap-2 p-2.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="truncate">{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
