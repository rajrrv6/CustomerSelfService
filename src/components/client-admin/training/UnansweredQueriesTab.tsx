'use client';

import React, { useState } from 'react';
import { Search, Archive, AlertTriangle, MessageCircle, FileText, X, Plus, Sparkles, CheckSquare, Square } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/components/shared/BadgeSystem';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedQuery, setSelectedQuery] = useState<UnansweredQuery | null>(null);
  
  // Bulk selection state
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [selectedIntentForAdd, setSelectedIntentForAdd] = useState<string | null>(null);

  // Filters logic
  const filteredQueries = queries.filter(q => {
    const matchesSearch = q.text.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          q.suggestedCluster.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Action: Single Ignore
  const handleIgnore = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isReadOnly) return;
    setQueries(prev => prev.map(q => q.id === id ? { ...q, status: 'Reviewed' as const } : q));
    addAuditLog(`Ignored unmatched query ID: ${id}`, 'success');
  };

  // Action: Single Archive
  const handleArchive = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isReadOnly) return;
    setQueries(prev => prev.filter(q => q.id !== id));
    addAuditLog(`Archived unmatched query ID: ${id}`, 'success');
    if (selectedQuery?.id === id) setSelectedQuery(null);
  };

  // Action: Single Escalate
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

  // Bulk actions
  const handleToggleCheckAll = () => {
    if (checkedIds.length === filteredQueries.length) {
      setCheckedIds([]);
    } else {
      setCheckedIds(filteredQueries.map(q => q.id));
    }
  };

  const handleToggleCheck = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (checkedIds.includes(id)) {
      setCheckedIds(checkedIds.filter(item => item !== id));
    } else {
      setCheckedIds([...checkedIds, id]);
    }
  };

  const handleBulkArchive = () => {
    if (isReadOnly || checkedIds.length === 0) return;
    setQueries(prev => prev.filter(q => !checkedIds.includes(q.id)));
    addAuditLog(`Bulk archived ${checkedIds.length} unmatched queries`, 'success');
    setCheckedIds([]);
  };

  const handleBulkMerge = () => {
    if (isReadOnly || checkedIds.length < 2) return;
    // Find checking items
    const items = queries.filter(q => checkedIds.includes(q.id));
    const primary = items[0];
    
    // Create new merged cluster name
    const clusterName = primary.suggestedCluster || 'merged_intent_cluster';
    const mergedUtterances = items.map(i => i.text);

    onOpenWizard(clusterName, mergedUtterances, 'billing');
    setCheckedIds([]);
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Header */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-center bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400 dark:text-slate-500 rtl:right-3.5 rtl:left-auto" />
          <input
            type="text"
            placeholder={lang === 'ar' ? 'بحث عن استفسار أو مجموعة...' : 'Search unmatched query or cluster...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-transparent border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rtl:pr-10 rtl:pl-4 transition-colors"
          />
        </div>

        <div className="flex gap-2.5 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-transparent border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:outline-none rounded-xl text-xs text-slate-700 dark:text-slate-300 w-full md:w-40"
          >
            <option value="all">{lang === 'ar' ? 'كل الحالات' : 'All Statuses'}</option>
            <option value="New">New</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Clustered">Clustered</option>
            <option value="Intent Created">Intent Created</option>
            <option value="Published">Published</option>
          </select>
        </div>
      </div>

      {/* Bulk Control Bar */}
      {checkedIds.length > 0 && (
        <div className="flex justify-between items-center bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl animate-fade-in">
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold font-mono">
            {checkedIds.length} {lang === 'ar' ? 'استفسارات محددة' : 'queries selected'}
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleBulkMerge}
              disabled={isReadOnly || checkedIds.length < 2}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white font-bold rounded-xl text-[10px] cursor-pointer transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'إنشاء نية مدمجة' : 'Merge & Create Intent'}</span>
            </button>
            <button
              onClick={handleBulkArchive}
              disabled={isReadOnly}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-[10px] cursor-pointer transition-colors flex items-center gap-1"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'أرشفة المحدد' : 'Bulk Archive'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Table Data Grid */}
      <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm">
        <table className="w-full text-start text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 text-slate-550 dark:text-slate-400 font-bold uppercase text-[9px] font-mono">
              <th className="p-3 text-start w-10">
                <button onClick={handleToggleCheckAll} className="text-slate-400 hover:text-slate-650 cursor-pointer">
                  {checkedIds.length === filteredQueries.length && filteredQueries.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="p-3.5 text-start">{lang === 'ar' ? 'نص الاستفسار' : 'Query Text'}</th>
              <th className="p-3.5 text-center">{lang === 'ar' ? 'اللغة' : 'Language'}</th>
              <th className="p-3.5 text-center">{lang === 'ar' ? 'التكرار' : 'Freq'}</th>
              <th className="p-3.5 text-start">{lang === 'ar' ? 'آخر ظهور' : 'Last Seen'}</th>
              <th className="p-3.5 text-center">{lang === 'ar' ? 'مؤشر الثقة' : 'Confidence'}</th>
              <th className="p-3.5 text-start">{lang === 'ar' ? 'المجموعة المقترحة' : 'Cluster'}</th>
              <th className="p-3.5 text-center">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
              <th className="p-3.5 text-end">{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredQueries.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-12 text-center text-slate-500 font-medium italic">
                  {lang === 'ar' ? 'لا يوجد استفسارات تطابق البحث والفلترة حالياً.' : 'No unanswered queries matched your current filters.'}
                </td>
              </tr>
            ) : (
              filteredQueries.map((q) => {
                const isChecked = checkedIds.includes(q.id);
                const scoreColor =
                  q.confidence < 0.5
                    ? 'text-rose-500 font-bold bg-rose-500/10'
                    : q.confidence < 0.8
                      ? 'text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10'
                      : 'text-emerald-500 font-bold bg-emerald-500/10';

                return (
                  <tr
                    key={q.id}
                    onClick={() => setSelectedQuery(q)}
                    className={`hover:bg-slate-50/50 dark:hover:bg-slate-950/40 cursor-pointer transition-colors ${
                      isChecked ? 'bg-blue-500/10 dark:bg-blue-950/20' : ''
                    } ${selectedQuery?.id === q.id ? 'bg-slate-100/50 dark:bg-slate-850/50' : ''}`}
                  >
                    <td className="p-3 text-center" onClick={(e) => handleToggleCheck(q.id, e)}>
                      <button className="text-slate-400 hover:text-slate-650 cursor-pointer">
                        {isChecked ? <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" /> : <Square className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="p-3.5 font-medium text-slate-800 dark:text-white max-w-xs truncate" title={q.text}>
                      {q.text}
                    </td>
                    <td className="p-3.5 text-center text-slate-500 dark:text-slate-450 uppercase font-bold text-[10px] font-mono">
                      {q.lang}
                    </td>
                    <td className="p-3.5 text-center font-bold text-slate-700 dark:text-slate-350 font-mono">
                      {q.frequency}
                    </td>
                    <td className="p-3.5 text-slate-500 dark:text-slate-450 font-mono text-[10px]">
                      {q.lastSeen}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] ${scoreColor}`}>
                        {Math.round(q.confidence * 100)}%
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-550 dark:text-slate-450 font-mono text-[11px]">
                      #{q.suggestedCluster}
                    </td>
                    <td className="p-3.5 text-center">
                      <Badge type={
                        q.status === 'Published' ? 'success' :
                        q.status === 'Intent Created' ? 'billing' :
                        q.status === 'Clustered' ? 'info' :
                        q.status === 'Reviewed' ? 'warning' : 'neutral'
                      }>
                        {q.status}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-end flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
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
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                        title={lang === 'ar' ? 'تجاهل' : 'Ignore'}
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleArchive(q.id, e)}
                        disabled={isReadOnly}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                        title={lang === 'ar' ? 'أرشفة' : 'Archive'}
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

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
