'use client';

import React, { useState, useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight, Activity, Cpu, GitMerge, Scissors, Sparkles, X, LayoutGrid, Table as TableIcon } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/components/shared/BadgeSystem';
import { EnterpriseTable } from '@/components/shared/table/EnterpriseTable';
import { ColumnDef } from '@tanstack/react-table';

export interface Cluster {
  id: string;
  name: string;
  frequency: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  examplePhrases: string[];
  keywords: string[];
  suggestedEntities: string[];
  suggestedSlots: { name: string; type: string; required: boolean; prompt: string }[];
  suggestedResponseEn: string;
  suggestedResponseAr: string;
  status: 'New' | 'Reviewed' | 'Clustered' | 'Intent Created' | 'Published';
}

interface SuggestedClustersTabProps {
  clusters: Cluster[];
  setClusters: React.Dispatch<React.SetStateAction<Cluster[]>>;
  onOpenWizard: (intentName: string, phrases: string[], category: string) => void;
  isReadOnly?: boolean;
}

export function SuggestedClustersTab({
  clusters,
  setClusters,
  onOpenWizard,
  isReadOnly = false
}: SuggestedClustersTabProps) {
  const { lang, addAuditLog } = useApp();
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Split Cluster simulation
  const handleSplitCluster = (cluster: Cluster, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isReadOnly) return;

    const mid = Math.ceil(cluster.examplePhrases.length / 2);
    const set1 = cluster.examplePhrases.slice(0, mid);
    const set2 = cluster.examplePhrases.slice(mid);

    const c1: Cluster = {
      ...cluster,
      id: `${cluster.id}-split-1`,
      name: `${cluster.name}_A`,
      frequency: Math.round(cluster.frequency * 0.6),
      examplePhrases: set1,
      status: 'Reviewed'
    };

    const c2: Cluster = {
      ...cluster,
      id: `${cluster.id}-split-2`,
      name: `${cluster.name}_B`,
      frequency: Math.round(cluster.frequency * 0.4),
      examplePhrases: set2,
      status: 'New'
    };

    setClusters(prev => prev.filter(c => c.id !== cluster.id).concat([c1, c2]));
    addAuditLog(`Split suggested cluster #${cluster.name} into two separate clusters`, 'success');
    if (selectedCluster?.id === cluster.id) {
      setSelectedCluster(null);
    }
  };

  // Merge Clusters simulation
  const handleMergeCluster = (cluster: Cluster, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isReadOnly) return;

    // Find another cluster to merge into
    const other = clusters.find(c => c.id !== cluster.id);
    if (!other) return;

    const merged: Cluster = {
      ...other,
      frequency: other.frequency + cluster.frequency,
      examplePhrases: [...other.examplePhrases, ...cluster.examplePhrases],
      status: 'Reviewed'
    };

    setClusters(prev => prev.filter(c => c.id !== cluster.id && c.id !== other.id).concat([merged]));
    addAuditLog(`Merged cluster #${cluster.name} into cluster #${other.name}`, 'success');
    if (selectedCluster?.id === cluster.id || selectedCluster?.id === other.id) {
      setSelectedCluster(null);
    }
  };

  // 1. Column configuration for table mode
  const columns = useMemo<ColumnDef<Cluster>[]>(() => [
    {
      accessorKey: 'name',
      header: lang === 'ar' ? 'المجموعة' : 'Cluster Name',
      cell: ({ row }) => (
        <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
          #{row.original.name}
        </span>
      ),
    },
    {
      accessorKey: 'frequency',
      header: lang === 'ar' ? 'التكرار' : 'Freq',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-slate-700 dark:text-slate-350">
          {row.original.frequency} {lang === 'ar' ? 'استفسار' : 'queries'}
        </span>
      ),
    },
    {
      accessorKey: 'confidence',
      header: lang === 'ar' ? 'مؤشر الثقة' : 'Confidence',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 font-mono text-[10.5px] font-bold text-blue-600 dark:text-blue-400">
          <Cpu className="w-3.5 h-3.5 text-blue-600 dark:text-blue-450" />
          <span>{Math.round(row.original.confidence * 100)}%</span>
        </div>
      ),
    },
    {
      accessorKey: 'trend',
      header: lang === 'ar' ? 'الاتجاه' : 'Trend',
      cell: ({ row }) => {
        const trend = row.original.trend;
        const trendIcon =
          trend === 'up' ? (
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
          ) : trend === 'down' ? (
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
          ) : (
            <Activity className="w-3.5 h-3.5 text-slate-400" />
          );
        return (
          <div className="flex items-center gap-1.5 font-mono text-[10.5px] font-bold text-slate-650 dark:text-slate-400 capitalize">
            {trendIcon}
            <span>{trend}</span>
          </div>
        );
      },
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
      accessorKey: 'keywords',
      header: lang === 'ar' ? 'الكلمات الدلالية' : 'Keywords',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {row.original.keywords.slice(0, 3).map((kw) => (
            <span key={kw} className="px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[9px] font-mono text-slate-600 dark:text-slate-400">
              {kw}
            </span>
          ))}
          {row.original.keywords.length > 3 && (
            <span className="text-[9px] font-semibold text-slate-400 font-mono">...</span>
          )}
        </div>
      ),
    },
    {
      id: 'actions',
      header: () => <div className="text-right">{lang === 'ar' ? 'إجراءات' : 'Actions'}</div>,
      cell: ({ row }) => {
        const cluster = row.original;
        return (
          <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => handleSplitCluster(cluster, e)}
              disabled={isReadOnly || cluster.status === 'Published'}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-450 dark:hover:text-slate-200 transition-colors cursor-pointer"
              title={lang === 'ar' ? 'تقسيم' : 'Split'}
            >
              <Scissors className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => handleMergeCluster(cluster, e)}
              disabled={isReadOnly || cluster.status === 'Published'}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-450 dark:hover:text-slate-200 transition-colors cursor-pointer"
              title={lang === 'ar' ? 'دمج' : 'Merge'}
            >
              <GitMerge className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isReadOnly) return;
                onOpenWizard(cluster.name, cluster.examplePhrases, 'billing');
              }}
              disabled={isReadOnly || cluster.status === 'Published'}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent rounded-lg text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors cursor-pointer"
              title={lang === 'ar' ? 'تحويل' : 'Convert'}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    }
  ], [lang, isReadOnly]);

  // Status Filter options
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

  return (
    <div className="space-y-6">
      {/* View Mode Toggle Header */}
      <div className="flex justify-end bg-white dark:bg-slate-900 p-2.5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-750 dark:hover:text-slate-200 transition-all cursor-pointer text-xs font-bold ${
              viewMode === 'grid' ? 'bg-white dark:bg-slate-900 shadow-sm text-blue-600 dark:text-blue-500 border border-slate-200/50 dark:border-slate-800/50 font-black scale-[1.02]' : 'opacity-80'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'شبكة الكروت' : 'Card Grid'}</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-750 dark:hover:text-slate-200 transition-all cursor-pointer text-xs font-bold ${
              viewMode === 'table' ? 'bg-white dark:bg-slate-900 shadow-sm text-blue-600 dark:text-blue-500 border border-slate-200/50 dark:border-slate-800/50 font-black scale-[1.02]' : 'opacity-80'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'جدول البيانات' : 'Table View'}</span>
          </button>
        </div>
      </div>

      {/* Grid or Table Renderer */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in duration-200">
          {clusters.map((cluster) => {
            const trendIcon =
              cluster.trend === 'up' ? (
                <ArrowUpRight className="w-4 h-4 text-emerald-500" />
              ) : cluster.trend === 'down' ? (
                <ArrowDownRight className="w-4 h-4 text-rose-500" />
              ) : (
                <Activity className="w-4 h-4 text-slate-400" />
              );

            return (
              <div
                key={cluster.id}
                onClick={() => setSelectedCluster(cluster)}
                className={`p-5 bg-white dark:bg-slate-900 border hover:border-slate-350 dark:hover:border-slate-700 rounded-2xl cursor-pointer transition-all flex flex-col justify-between ${
                  selectedCluster?.id === cluster.id ? 'border-blue-600 ring-1 ring-blue-600' : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100 font-mono">#{cluster.name}</span>
                        <Badge type={
                          cluster.status === 'Published' ? 'success' :
                          cluster.status === 'Intent Created' ? 'billing' :
                          cluster.status === 'Clustered' ? 'info' :
                          cluster.status === 'Reviewed' ? 'warning' : 'neutral'
                        }>
                          {cluster.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          {cluster.frequency} {lang === 'ar' ? 'استفسار' : 'queries'}
                        </span>
                        <div className="flex items-center gap-0.5">
                          {trendIcon}
                          <span className="text-[9px] text-slate-500 dark:text-slate-450 capitalize">{cluster.trend}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 px-2 py-1 rounded-xl border border-slate-150 dark:border-slate-850">
                      <Cpu className="w-3.5 h-3.5 text-blue-600 dark:text-blue-450" />
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 font-mono">
                        {Math.round(cluster.confidence * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Example utterances */}
                  <div className="space-y-1.5 pt-2">
                    <p className="text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
                      {lang === 'ar' ? 'عبارات معبرة للمجموعة' : 'Sample Cluster Utterances'}
                    </p>
                    <div className="space-y-1 max-h-24 overflow-hidden">
                      {cluster.examplePhrases.slice(0, 3).map((phrase, idx) => (
                        <p key={idx} className="text-[11px] text-slate-700 dark:text-slate-350 font-mono truncate bg-slate-50 dark:bg-slate-950/40 px-2 py-1 rounded border border-slate-150 dark:border-slate-900">
                          "{phrase}"
                        </p>
                      ))}
                      {cluster.examplePhrases.length > 3 && (
                        <p className="text-[9px] text-slate-500 dark:text-slate-450 italic px-1">
                          + {cluster.examplePhrases.length - 3} {lang === 'ar' ? 'أخرى...' : 'more...'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-5 pt-3 border-t border-slate-100 dark:border-slate-955 justify-end">
                  <button
                    onClick={(e) => handleSplitCluster(cluster, e)}
                    disabled={isReadOnly || cluster.status === 'Published'}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-100 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-350 font-bold rounded-xl text-[10px] cursor-pointer transition-all flex items-center gap-1"
                    title={lang === 'ar' ? 'تقسيم المجموعة' : 'Split Cluster'}
                  >
                    <Scissors className="w-3 h-3" />
                    <span>{lang === 'ar' ? 'تقسيم' : 'Split'}</span>
                  </button>
                  <button
                    onClick={(e) => handleMergeCluster(cluster, e)}
                    disabled={isReadOnly || cluster.status === 'Published'}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-100 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-350 font-bold rounded-xl text-[10px] cursor-pointer transition-all flex items-center gap-1"
                    title={lang === 'ar' ? 'دمج مع مجموعة مجاورة' : 'Merge with adjacent'}
                  >
                    <GitMerge className="w-3 h-3" />
                    <span>{lang === 'ar' ? 'دمج' : 'Merge'}</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isReadOnly) return;
                      onOpenWizard(cluster.name, cluster.examplePhrases, 'billing');
                    }}
                    disabled={isReadOnly || cluster.status === 'Published'}
                    className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500 text-white font-bold rounded-xl text-[10px] cursor-pointer transition-all flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{lang === 'ar' ? 'تحويل لنوايا' : 'Convert'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="animate-in fade-in duration-200">
          <EnterpriseTable
            data={clusters}
            columns={columns}
            lang={lang}
            filterOptions={filterOptions}
            onRowClick={setSelectedCluster}
            searchPlaceholder={lang === 'ar' ? 'البحث عن مجموعة مقترحة...' : 'Search suggested clusters...'}
          />
        </div>
      )}

      {/* Cluster Details Drawer */}
      {selectedCluster && (
        <div className="fixed inset-y-0 right-0 z-40 w-full max-w-lg bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-y-auto flex flex-col justify-between animate-slide-in">
          <div className="space-y-6">
            {/* Drawer Header */}
            <div className="flex justify-between items-start border-b border-slate-150 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800 dark:text-white font-mono">#{selectedCluster.name}</span>
                  <Badge type="info">
                    Suggested Cluster
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {lang === 'ar' ? 'تفاصيل ومعلمات الكشف للمجموعة المقترحة' : 'Deep parameters for AI intent generation suggestion'}
                </p>
              </div>
              <button
                onClick={() => setSelectedCluster(null)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-850 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Diagnostics Card */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>{lang === 'ar' ? 'معامل تشخيص التجميع' : 'Cluster Clustering Diagnostics'}</span>
              </h4>
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-500">{lang === 'ar' ? 'الثقة النسبية:' : 'Group Confidence:'}</span>
                  <p className="text-slate-900 dark:text-white font-bold mt-0.5">{Math.round(selectedCluster.confidence * 100)}%</p>
                </div>
                <div>
                  <span className="text-slate-500">{lang === 'ar' ? 'التكرار الكلي:' : 'Total Occurrences:'}</span>
                  <p className="text-slate-900 dark:text-white font-bold mt-0.5">{selectedCluster.frequency} calls</p>
                </div>
              </div>
            </div>

            {/* Extracted Keywords */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wide">
                {lang === 'ar' ? 'الكلمات الدلالية المكتشفة' : 'Extracted Top Keywords'}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedCluster.keywords.map((kw) => (
                  <span key={kw} className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-750 dark:text-slate-350">
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Similar Phrases / Utterances */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wide">
                {lang === 'ar' ? 'كل العبارات المكتشفة' : 'Identified Core Phrases'}
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {selectedCluster.examplePhrases.map((phrase, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-xl text-[11px] font-mono text-slate-700 dark:text-slate-350">
                    "{phrase}"
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Slots & Parameters */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wide">
                {lang === 'ar' ? 'الكيانات والفتحات المقترحة' : 'Suggested Parameters & Slots'}
              </h4>
              <div className="space-y-2">
                {selectedCluster.suggestedSlots.map((slot) => (
                  <div key={slot.name} className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-xl flex justify-between items-center text-xs font-mono">
                    <div>
                      <span className="text-blue-600 dark:text-blue-400 font-bold">@{slot.name}</span>
                      <p className="text-[10px] text-slate-500 italic mt-0.5">Prompt: "{slot.prompt}"</p>
                    </div>
                    <Badge type={slot.required ? 'error' : 'neutral'}>
                      {slot.required ? 'Required' : 'Optional'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Response */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-455 dark:text-slate-400 uppercase tracking-wide">
                {lang === 'ar' ? 'رد البوت المقترح' : 'AI Suggested Responses'}
              </h4>
              <div className="space-y-2.5 text-xs font-mono">
                <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-xl">
                  <span className="text-[9px] bg-slate-150 dark:bg-slate-900 text-slate-500 dark:text-slate-450 px-1.5 py-0.5 rounded uppercase font-bold">EN</span>
                  <p className="text-slate-700 dark:text-slate-300 mt-1.5">"{selectedCluster.suggestedResponseEn}"</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-xl" dir="rtl">
                  <span className="text-[9px] bg-slate-150 dark:bg-slate-900 text-slate-500 dark:text-slate-450 px-1.5 py-0.5 rounded uppercase font-bold">AR</span>
                  <p className="text-slate-700 dark:text-slate-300 mt-1.5 text-right">"{selectedCluster.suggestedResponseAr}"</p>
                </div>
              </div>
            </div>
          </div>

          {/* Convert action inside Drawer */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-6 flex justify-end gap-2">
            <button
              onClick={() => setSelectedCluster(null)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-250 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs cursor-pointer transition-colors"
            >
              {lang === 'ar' ? 'إغلاق التفاصيل' : 'Close Details'}
            </button>
            <button
              onClick={() => {
                if (isReadOnly) return;
                onOpenWizard(selectedCluster.name, selectedCluster.examplePhrases, 'billing');
                setSelectedCluster(null);
              }}
              disabled={isReadOnly || selectedCluster.status === 'Published'}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-750 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-455 text-white font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{lang === 'ar' ? 'تحويل لنوايا NLU' : 'Launch Generator Wizard'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
