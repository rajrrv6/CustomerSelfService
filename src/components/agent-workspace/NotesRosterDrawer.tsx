'use client';

import React, { useState } from 'react';
import { X, Sparkles, AlertCircle, Users, CheckCircle2, FileText, Loader2 } from 'lucide-react';
import { NoteComposer } from './NoteComposer';
import { NoteTimelineCard, NoteItem } from './NoteTimelineCard';
import { Collaborator } from './CollaboratorSelector';
import { DrawerWrapper } from '../shared/DrawerWrapper';

interface NotesRosterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'ar';
}

const SEED_COLLABORATORS: Collaborator[] = [
  { id: 'agent-1', name: 'Liam Bennett', role: 'agent', status: 'online' },
  { id: 'agent-4', name: 'Nadia Vance', role: 'supervisor', status: 'online' },
  { id: 'agent-2', name: 'Sarah Jenkins', role: 'agent', status: 'busy' },
];

const INITIAL_NOTES: NoteItem[] = [
  {
    id: 'note-1',
    senderName: 'System (Liam Notes)',
    text: 'Client session initiated. Router resolved location `Dubai Main Gateway`. IP: `194.20.10.15`. Check authentication keys.',
    timestamp: '11:40 AM',
    visibility: 'internal',
  },
  {
    id: 'note-2',
    senderName: 'Nadia Vance (Supervisor)',
    text: 'Spoke with Dubai accounts desk. Invoice wire payment is **cleared** under transaction ID `TX-88991`. We need to verify credit limits.',
    timestamp: '11:42 AM',
    visibility: 'internal',
  },
  {
    id: 'note-3',
    senderName: 'Liam Bennett',
    text: 'Overriding client status manual checks. CRM records updated to **VIP Premium Support** status.',
    timestamp: '11:45 AM',
    visibility: 'public',
  },
];

export function NotesRosterDrawer({ isOpen, onClose, lang }: NotesRosterDrawerProps) {
  const isRtl = lang === 'ar';
  const [notes, setNotes] = useState<NoteItem[]>(INITIAL_NOTES);

  // AI Summary States
  const [summaryStatus, setSummaryStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [summaryText, setSummaryText] = useState('');
  const [summaryError, setSummaryError] = useState('');

  if (!isOpen) return null;

  const handleSendNote = async (text: string, visibility: 'internal' | 'public') => {
    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      senderName: 'Liam Bennett',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      visibility,
    };
    setNotes((prev) => [...prev, newNote]);
  };

  const handleTriggerAISummary = () => {
    setSummaryStatus('loading');
    setSummaryError('');

    const runSummary = () => {
      try {
        const hasFail = notes.some((n) => n.text.toLowerCase().includes('fail'));
        if (hasFail) {
          throw new Error('Simulation Failure: RAG token indexing lock occurred.');
        }

        const summaryResult = `AI Notes Summary:\n- Main issue: Payment audit wire settlement delay.\n- Resolution status: Nadia Vance confirmed bank wire cleared (ID: TX-88991).\n- Action taken: Liam Bennett manually elevated account privileges to VIP.`;
        setSummaryText(summaryResult);
        setSummaryStatus('success');
      } catch (err: any) {
        setSummaryError(err.message || 'Error occurred generating AI summary.');
        setSummaryStatus('error');
      }
    };

    if (process.env.NODE_ENV === 'test') {
      runSummary();
    } else {
      setTimeout(runSummary, 1500);
    }
  };

  return (
    <DrawerWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
          <Users className="w-4 h-4 text-purple-600" />
          <h2 id="roster-drawer-title" className="text-sm font-extrabold text-slate-905 dark:text-white">
            {lang === 'ar' ? 'ملاحظات التعاون الداخلي' : 'Collaboration & Internal Notes'}
          </h2>
        </div>
      }
      isRtl={isRtl}
      maxWidthClass="max-w-md"
      noPadding={true}
    >
      <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-805 dark:text-slate-205" dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Drawer Body container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {/* Active Collaborators list */}
          <div className="space-y-2 bg-white dark:bg-slate-955 p-3 rounded-2xl border border-slate-200 dark:border-slate-850">
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">
              {lang === 'ar' ? 'الزملاء المتصلون حالياً' : 'Active Collaborators Online'}
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {SEED_COLLABORATORS.map((col) => (
                <div
                  key={col.id}
                  className="flex items-center gap-1.5 bg-slate-55 dark:bg-slate-900 px-2 py-1 rounded-xl border border-slate-200/50 dark:border-slate-800/80 text-[10.5px]"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      col.status === 'online'
                        ? 'bg-emerald-500 animate-pulse'
                        : col.status === 'busy'
                        ? 'bg-rose-500'
                        : 'bg-amber-500'
                    }`}
                  />
                  <span>{col.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Notes summary helper panel */}
          <div className="bg-purple-600/5 border border-purple-500/10 rounded-2xl p-3.5 space-y-3 shadow-xs">
            <div className={`flex items-center justify-between gap-3 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className="min-w-0">
                <span className="text-[9px] text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider block font-mono">
                  {lang === 'ar' ? 'مساعد التلخيص' : 'Summary Helper'}
                </span>
                <p className="text-slate-505 dark:text-slate-400 text-[10.5px] leading-snug">
                  {lang === 'ar'
                    ? 'قم بتلخيص جميع الملاحظات الداخلية للحالة بنقرة واحدة.'
                    : 'Compile all logged internal notes into a structured audit summary.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleTriggerAISummary}
                disabled={summaryStatus === 'loading'}
                className="shrink-0 flex items-center justify-center p-2 rounded-xl bg-purple-600 hover:bg-purple-750 text-white shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                title="Summarize Internal Notes"
              >
                {summaryStatus === 'loading' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* AI Summary states */}
            {summaryStatus === 'success' && (
              <div className="p-3 bg-white dark:bg-slate-955 rounded-xl border border-purple-100 dark:border-purple-900/40 text-slate-700 dark:text-slate-355 leading-relaxed font-mono text-[10.5px] whitespace-pre-line relative animate-in fade-in duration-200 select-text">
                <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-bold text-[9px] uppercase tracking-wide mb-1 select-none">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Insight Compiled</span>
                </div>
                {summaryText}
              </div>
            )}

            {summaryStatus === 'error' && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/40 dark:bg-rose-955/20 dark:text-rose-450">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{summaryError}</span>
              </div>
            )}
          </div>

          {/* Notes Timeline feed list */}
          <div className="space-y-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider block">
              {lang === 'ar' ? 'سجل الملاحظات الزمني' : 'Notes Timeline Log'}
            </span>
            <div className="space-y-3">
              {notes.map((note) => (
                <NoteTimelineCard key={note.id} note={note} lang={lang} />
              ))}
            </div>
          </div>
        </div>

        {/* Drawer Footer - NoteComposer */}
        <div className="p-4 bg-white dark:bg-slate-955 border-t border-slate-200 dark:border-slate-800">
          <NoteComposer onSend={handleSendNote} isRtl={isRtl} lang={lang} />
        </div>
      </div>
    </DrawerWrapper>
  );
}
