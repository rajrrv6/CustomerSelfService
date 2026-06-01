'use client';

import React, { useState, useMemo } from 'react';
import { Archive, AlertTriangle, MessageCircle, FileText, X, Plus, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/components/shared/BadgeSystem';
import { EnterpriseTable } from '@/components/shared/table/EnterpriseTable';
import { ColumnDef } from '@tanstack/react-table';
import { BulkAction } from '@/components/shared/table/TableBulkActions';

export interface UnansweredQuery {
  id: string;
  text: string;
  lang: 'en' | 'ar';
  frequency: number;
  lastSeen: string;
  confidence: number;
  suggestedCluster: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  status: 'New' | 'Reviewed' | 'Clustered' | 'Intent Created' | 'Published';
  conversationTranscript: { sender: string; text: string; timestamp: string }[];
  previousFallbackResponse: string;
  similarOccurrences: string[];
}

interface UnansweredQueriesTabProps {
  queries: UnansweredQuery[];
  setQueries: React.Dispatch<React.SetStateAction<UnansweredQuery[]>>;
  onOpenWizard: (intentName: string, phrases: string[], category: string) => void;
  isReadOnly?: boolean;
}

export function UnansweredQueriesTab({
  queries,
  setQueries,
  onOpenWizard,
  isReadOnly = false
}: UnansweredQueriesTabProps) {
  const { lang, intents, setIntents, addAuditLog } = useApp();
  const [selectedQuery, setSelectedQuery] = useState<UnansweredQuery | null>(null);
  const [selectedIntentForAdd, setSelectedIntentForAdd] = useState<string | null>(null);

  // Single Action: Ignore
  const handleIgnore = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isReadOnly) return;
    setQueries(prev => prev.map(q => q.id === id ? { ...q, status: 'Reviewed' as const } : q));
    addAuditLog(`Ignored unmatched query ID: ${id}`, 'success');
  };

  // Single Action: Archive
  const handleArchive = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isReadOnly) return;
    setQueries(prev => prev.filter(q => q.id !== id));
    addAuditLog(`Archived unmatched query ID: ${id}`, 'success');
    if (selectedQuery?.id === id) setSelectedQuery(null);
  };

  // Single Action: Escalate
  const handleEscalate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isReadOnly) return;
    setQueries(prev => prev.map(q => q.id === id ? { ...q, status: 'Reviewed' as const } : q));
    addAuditLog(`Escalated unmatched query ID: ${id} to L2 support operations`, 'success');
  };

  // Action: Add utterance to existing NLU Intent
  const handleAddToExistingIntent = (queryText: string, intentId: string) => {
    if (isReadOnly) return;
    
    // Add utterance to AppContext intents list
    setIntents(prev => prev.map(intent => {
      if (intent.id === intentId || intent.name === intentId) {
        return {
          ...intent,
          utterances: [...new Set([...intent.utterances, queryText])]
        };
      }
      return intent;
    }));

    // Update status to Intent Created
    setQueries(prev => prev.map(q => q.text === queryText ? { ...q, status: 'Intent Created' as const } : q));
    addAuditLog(`Added utterance "${queryText}" to existing NLU intent: ${intentId}`, 'success');
    setSelectedIntentForAdd(null);
    if (selectedQuery?.text === queryText) {
      setSelectedQuery(prev => prev ? { ...prev, status: 'Intent Created' } : null);
    }
  };

  // 1. Column definitions for EnterpriseTable
  const columns = useMemo<ColumnDef<UnansweredQuery>[]>(() => [
    {
      accessorKey: 'text',
      header: lang === 'ar' ? 'نص الاستفسار' : 'Query Text',
      cell: ({ row }) => (
        <span className="font-semibold text-slate-800 dark:text-white max-w-xs truncate block" title={row.original.text}>
          {row.original.text}
        </span>
      ),
    },
    {
      accessorKey: 'lang',
      header: lang === 'ar' ? 'اللغة' : 'Language',
      cell: ({ row }) => (
        <div className="text-center font-bold text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">
          {row.original.lang}
        </div>
      ),
    },
    {
      accessorKey: 'frequency',
      header: lang === 'ar' ? 'التكرار' : 'Freq',
      cell: ({ row }) => (
        <div className="text-center font-mono font-bold text-slate-700 dark:text-slate-350">
          {row.original.frequency}
        </div>
      ),
    },
    {
      accessorKey: 'lastSeen',
      header: lang === 'ar' ? 'آخر ظهور' : 'Last Seen',
      cell: ({ row }) => (
        <span className="font-mono text-[10px] text-slate-500 dark:text-slate-450">
          {row.original.lastSeen}
        </span>
      ),
    },
    {
      accessorKey: 'confidence',
      header: lang === 'ar' ? 'مؤشر الثقة' : 'Confidence',
      cell: ({ row }) => {
        const val = row.original.confidence;
        const color = val < 0.5
          ? 'text-rose-500 bg-rose-500/10 font-bold'
          : val < 0.8
            ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 font-bold'
            : 'text-emerald-500 bg-emerald-500/10 font-bold';
        return (
          <div className="text-center">
            <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] ${color}`}>
              {Math.round(val * 100)}%
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'suggestedCluster',
      header: lang === 'ar' ? 'المجموعة المقترحة' : 'Cluster',
      cell: ({ row }) => (
        <span className="font-mono text-[11px] text-slate-550 dark:text-slate-450">
          #{row.original.suggestedCluster}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: lang === 'ar' ? 'الحالة' : 'Status',
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge type={
            row.original.status === 'Published' ? 'success' :
            row.original.status === 'Intent Created' ? 'billing' :
            row.original.status === 'Clustered' ? 'info' :
            row.original.status === 'Reviewed' ? 'warning' : 'neutral'
          }>
            {row.original.status}
          </Badge>
        </div>
      ),
    },
    {
      id: 'actions',
      header: () => <div className="text-right">{lang === 'ar' ? 'إجراءات' : 'Actions'}</div>,
      cell: ({ row }) => {
        const q = row.original;
        return (
          <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onOpenWizard(q.suggestedCluster, [q.text], 'billing')}
              disabled={isReadOnly || q.status === 'Published'}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent rounded-lg text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors cursor-pointer"
              title={lang === 'ar' ? 'إنشاء نية' : 'Create Intent'}
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => handleIgnore(q.id, e)}
              disabled={isReadOnly || q.status === 'Published'}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent rounded-lg text-slate-400 hover:text-slate-650 dark:hover:text-slate-350 transition-colors cursor-pointer"
              title={lang === 'ar' ? 'تجاهل' : 'Ignore'}
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => handleArchive(q.id, e)}
              disabled={isReadOnly}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent rounded-lg text-slate-400 hover:text-slate-650 dark:hover:text-slate-300 transition-colors cursor-pointer"
              title={lang === 'ar' ? 'أرشفة' : 'Archive'}
            >
              <Archive className="w-4 h-4" />
            </button>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    }
  ], [lang, isReadOnly, onOpenWizard]);

  // 2. Select filter configurations
  const filterOptions = useMemo(() => [
    {
      columnId: 'status',
      label: lang === 'ar' ? 'الحالة' : 'Status',
      options: [
        { label: lang === 'ar' ? 'كل الحالات' : 'All Statuses', value: '' },
        { label: 'New', value: 'New' },
        { label: 'Reviewed', value: 'Reviewed' },
        { label: 'Clustered', value: 'Clustered' },
        { label: 'Intent Created', value: 'Intent Created' },
        { label: 'Published', value: 'Published' },
      ],
    },
  ], [lang]);

  // 3. Bulk actions configurations
  const bulkActions = useMemo<BulkAction<UnansweredQuery>[]>(() => [
    {
      id: 'merge',
      label: lang === 'ar' ? 'إنشاء نية مدمجة' : 'Merge & Create Intent',
      icon: Sparkles,
      variant: 'primary',
      onClick: (selectedRows) => {
        if (selectedRows.length < 2) return;
        const primary = selectedRows[0];
        const clusterName = primary.suggestedCluster || 'merged_intent_cluster';
        const mergedUtterances = selectedRows.map(r => r.text);
        onOpenWizard(clusterName, mergedUtterances, 'billing');
      },
    },
    {
      id: 'archive',
      label: lang === 'ar' ? 'أرشفة المحدد' : 'Bulk Archive',
      icon: Archive,
      variant: 'danger',
      requiresConfirmation: true,
      confirmTitle: lang === 'ar' ? 'تأكيد الأرشفة الجماعية' : 'Confirm Bulk Archive',
      confirmMessage: lang === 'ar'
        ? 'هل أنت متأكد من أرشفة كل الاستفسارات المحددة؟'
        : 'Are you sure you want to archive all selected unanswered queries?',
      onClick: (selectedRows) => {
        const ids = selectedRows.map(r => r.id);
        setQueries(prev => prev.filter(q => !ids.includes(q.id)));
        addAuditLog(`Bulk archived ${ids.length} unmatched queries`, 'success');
        if (selectedQuery && ids.includes(selectedQuery.id)) {
          setSelectedQuery(null);
        }
      },
    }
  ], [lang, onOpenWizard, setQueries, addAuditLog, selectedQuery]);

  return (
    <div className="space-y-4">
      {/* EnterpriseTable orchestration */}
      <EnterpriseTable
        data={queries}
        columns={columns}
        lang={lang}
        enableSelection={true}
        bulkActions={bulkActions}
        filterOptions={filterOptions}
        onRowClick={setSelectedQuery}
        searchPlaceholder={lang === 'ar' ? 'بحث عن استفسار أو مجموعة...' : 'Search unanswered queries or clusters...'}
      />

      {/* Context Details Drawer */}
      {selectedQuery && (
        <div className="fixed inset-y-0 right-0 z-40 w-full max-w-lg bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-y-auto flex flex-col justify-between animate-slide-in">
          <div className="space-y-6">
            {/* Drawer Header */}
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white font-mono leading-snug">
                  "{selectedQuery.text}"
                </h3>
                <div className="flex gap-2 items-center mt-2">
                  <Badge type="neutral">
                    Unmatched Utterance
                  </Badge>
                  <span className="text-[10px] text-slate-500 font-mono">ID: {selectedQuery.id}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedQuery(null);
                  setSelectedIntentForAdd(null);
                }}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-850 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conversation transcript snippet */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>{lang === 'ar' ? 'سياق المحادثة المباشرة' : 'Original Conversation Transcript Context'}</span>
              </h4>
              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-2xl space-y-3 max-h-56 overflow-y-auto">
                {selectedQuery.conversationTranscript.map((msg, idx) => (
                  <div key={idx} className={`flex flex-col ${msg.sender === 'customer' ? 'items-start' : 'items-end'}`}>
                    <div className="flex gap-1.5 items-center text-[9px] text-slate-500 dark:text-slate-500 mb-0.5 font-mono">
                      <span>{msg.sender === 'customer' ? 'Customer' : 'Bot Agent'}</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <div className={`px-3 py-2 rounded-2xl text-[11px] font-mono leading-relaxed max-w-xs ${
                      msg.sender === 'customer'
                        ? 'bg-white dark:bg-slate-800 text-slate-850 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-750'
                        : 'bg-blue-600/10 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-tr-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Previous Fallback response */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-550 dark:text-amber-400" />
                <span>{lang === 'ar' ? 'رد البوت البديل السابق' : 'Previous Bot Fallback Output'}</span>
              </h4>
              <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-xl text-[11px] font-mono text-slate-600 dark:text-slate-400 italic">
                "{selectedQuery.previousFallbackResponse}"
              </div>
            </div>

            {/* Similar occurrences list */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>{lang === 'ar' ? 'العبارات المشابهة المكتشفة' : 'Similar Utterances Detected'}</span>
              </h4>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {selectedQuery.similarOccurrences.map((phrase, idx) => (
                  <div key={idx} className="px-3 py-2 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-xl text-[10px] font-mono text-slate-600 dark:text-slate-400">
                    "{phrase}"
                  </div>
                ))}
              </div>
            </div>

            {/* Link to existing NLU intent */}
            {!isReadOnly && selectedQuery.status !== 'Published' && (
              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-350">{lang === 'ar' ? 'إضافة إلى نية NLU حالية' : 'Add to Existing NLU Intent'}</h4>
                <div className="flex gap-2">
                  <select
                    value={selectedIntentForAdd || ''}
                    onChange={(e) => setSelectedIntentForAdd(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-850 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="">{lang === 'ar' ? '-- حدد النية المستهدفة --' : '-- Select target intent --'}</option>
                    {intents.map(intent => (
                      <option key={intent.id} value={intent.id}>#{intent.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => selectedIntentForAdd && handleAddToExistingIntent(selectedQuery.text, selectedIntentForAdd)}
                    disabled={!selectedIntentForAdd}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-750 disabled:opacity-40 disabled:hover:bg-blue-600 text-white font-bold rounded-xl text-[10px] cursor-pointer transition-colors"
                  >
                    {lang === 'ar' ? 'إدراج' : 'Add'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-850 mt-6 flex justify-end gap-2">
            <button
              onClick={() => {
                setSelectedQuery(null);
                setSelectedIntentForAdd(null);
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-250 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs cursor-pointer transition-colors"
            >
              {lang === 'ar' ? 'إغلاق' : 'Close'}
            </button>
            <button
              onClick={(e) => handleEscalate(selectedQuery.id, e)}
              disabled={isReadOnly || selectedQuery.status === 'Published'}
              className="px-4 py-2 bg-amber-600/10 hover:bg-amber-600/20 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-bold rounded-xl text-xs cursor-pointer transition-all"
            >
              {lang === 'ar' ? 'تصعيد' : 'Escalate'}
            </button>
            <button
              onClick={() => {
                if (isReadOnly) return;
                onOpenWizard(selectedQuery.suggestedCluster, [selectedQuery.text], 'billing');
                setSelectedQuery(null);
              }}
              disabled={isReadOnly || selectedQuery.status === 'Published'}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-750 disabled:bg-slate-250 disabled:text-slate-450 text-white font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'ar' ? 'إنشاء نية جديدة' : 'Create New Intent'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
