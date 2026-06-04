'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Brain, RefreshCw, AlertCircle, Calendar, Sliders, Clock, Database, Save, Settings, ShieldAlert, Search, Plus, Trash2, Globe, FileText } from 'lucide-react';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { usePermission } from '@/stores/permissionStore';
import { OperationalCard } from '@/components/shared/OperationalCard';
import { translations } from '@/i18n/translations';
import { RetryPanel } from '@/components/shared/workflows/RetryPanel';
import { OperationalBanner } from '@/components/shared/workflows/OperationalBanner';
import { StatusIndicator } from '@/components/shared/workflows/StatusIndicator';
import { KnowledgeSource } from '@/types';

// Import newly implemented modals
import { FileUploadModal } from './FileUploadModal';
import { UrlCrawlModal } from './UrlCrawlModal';
import { DatabaseConnectorModal } from './DatabaseConnectorModal';
import { ReindexConfirmationModal } from './ReindexConfirmationModal';
import { OperationalActivityFeed } from '../shared/OperationalActivityFeed';

export function KnowledgeBaseTab() {
  const { lang, knowledgeSources, setKnowledgeSources, ingestionLogs, setIngestionLogs, addAuditLog } = useApp();
  const t = translations[lang];
  const { canEdit, canManage } = usePermission('knowledge_base');
  const [timelineTab, setTimelineTab] = useState<'rag_activities' | 'session_logs'>('rag_activities');

  // Local state for tracking retries
  const [retryingSourceId, setRetryingSourceId] = useState<string | null>(null);
  const [retryAttempts, setRetryAttempts] = useState<Record<string, number>>({
    'ks-4': 1,
  });

  // Local state for schedule config
  const [selectedSourceId, setSelectedSourceId] = useState<string>('ks-1');
  const [syncSchedule, setSyncSchedule] = useState<string>('daily');
  const [chunkSize, setChunkSize] = useState<number>(512);
  const [overlapSize, setOverlapSize] = useState<number>(128);
  const [crawlerDepth, setCrawlerDepth] = useState<number>(3);
  const [exclusions, setExclusions] = useState<string>('/admin/*, /api/auth/*');

  // Modals visibility states
  const [showUpload, setShowUpload] = useState(false);
  const [showCrawl, setShowCrawl] = useState(false);
  const [showDb, setShowDb] = useState(false);
  const [showReindex, setShowReindex] = useState(false);

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'files' | 'sites' | 'databases'>('all');

  const isRtl = lang === 'ar';

  const handleSyncSource = (sourceId: string) => {
    if (!canEdit) return;
    // Modify status to syncing
    setKnowledgeSources((prev) =>
      prev.map((src) => {
        if (src.id === sourceId) {
          return { ...src, status: 'syncing' };
        }
        return src;
      })
    );

    const targetSrc = knowledgeSources.find((s) => s.id === sourceId);
    const srcName = targetSrc?.name || 'Knowledge Source';

    // Add ingestion log
    const logId = `log-${Date.now()}`;
    const newLog = {
      id: logId,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      sourceName: srcName,
      status: 'processing' as const,
      chunksCount: 0,
      durationMs: 0,
    };
    setIngestionLogs((prev) => [newLog, ...prev]);

    setTimeout(() => {
      const generatedChunks = Math.floor(60 + Math.random() * 140);
      const duration = Math.floor(1500 + Math.random() * 3000);

      setKnowledgeSources((prev) =>
        prev.map((src) => {
          if (src.id === sourceId) {
            return {
              ...src,
              status: 'ready',
              chunkCount: src.chunkCount + generatedChunks,
              lastIngested: new Date().toISOString().replace('T', ' ').substring(0, 16),
              isStale: false,
            };
          }
          return src;
        })
      );

      setIngestionLogs((prev) =>
        prev.map((log) => {
          if (log.id === logId) {
            return {
              ...log,
              status: 'success',
              chunksCount: generatedChunks,
              durationMs: duration,
            };
          }
          return log;
        })
      );

      addAuditLog(`Synchronized knowledge source: ${srcName}. Ingested ${generatedChunks} chunks.`, 'success');
    }, 2000);
  };

  const handleRetrySource = (sourceId: string) => {
    if (!canEdit) return;
    setRetryingSourceId(sourceId);

    // Increment attempt count
    setRetryAttempts((prev) => ({
      ...prev,
      [sourceId]: (prev[sourceId] || 0) + 1,
    }));

    setTimeout(() => {
      setRetryingSourceId(null);
      
      // Update source status to ready
      setKnowledgeSources((prev) =>
        prev.map((src) => {
          if (src.id === sourceId) {
            return {
              ...src,
              status: 'ready',
              chunkCount: 284,
              lastIngested: new Date().toISOString().replace('T', ' ').substring(0, 16),
            };
          }
          return src;
        })
      );

      // Add success log
      const logId = `log-retry-success-${Date.now()}`;
      const srcName = knowledgeSources.find((s) => s.id === sourceId)?.name || 'Knowledge Source';
      
      setIngestionLogs((prev) => [
        {
          id: logId,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          sourceName: srcName,
          status: 'success',
          chunksCount: 284,
          durationMs: 4200,
        },
        ...prev,
      ]);

      addAuditLog(`Successfully resolved crawler sync for ${srcName} after retry attempt.`, 'success');
    }, 1600);
  };

  const handleSaveSchedulerSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    setKnowledgeSources((prev) =>
      prev.map((src) => {
        if (src.id === selectedSourceId) {
          return {
            ...src,
            syncSchedule: syncSchedule,
          };
        }
        return src;
      })
    );

    const srcName = knowledgeSources.find((s) => s.id === selectedSourceId)?.name || 'Source';
    addAuditLog(`Updated Sync Schedule to "${syncSchedule}" and chunking parameters for ${srcName}`, 'success');
  };

  // Handlers for adding new sources from the modals
  const handleAddFileSource = (name: string, sizeBytes: number, type: 'pdf') => {
    if (!canEdit) return;
    const newSource: KnowledgeSource = {
      id: `ks-file-${Date.now()}`,
      name,
      type,
      status: 'ready',
      chunkCount: Math.floor(45 + Math.random() * 105),
      lastIngested: new Date().toISOString().replace('T', ' ').substring(0, 16),
      sizeBytes,
      syncSchedule: 'manual',
    };
    setKnowledgeSources((prev) => [...prev, newSource]);
    addAuditLog(`Uploaded document "${name}" (${(sizeBytes / 1024).toFixed(1)} KB) and generated embeddings.`, 'success');
  };

  const handleAddUrlSource = (url: string, urlCount: number, depthLimit: number) => {
    if (!canEdit) return;
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
    const newSource: KnowledgeSource = {
      id: `ks-url-${Date.now()}`,
      name: cleanUrl,
      type: 'url',
      status: 'ready',
      chunkCount: urlCount * Math.floor(12 + Math.random() * 8),
      lastIngested: new Date().toISOString().replace('T', ' ').substring(0, 16),
      sizeBytes: urlCount * 9200,
      syncSchedule: 'daily',
      crawlerDetails: {
        urlCount,
        depthLimit,
        lastSyncBytes: urlCount * 9200,
      },
    };
    setKnowledgeSources((prev) => [...prev, newSource]);
    addAuditLog(`Successfully crawled website ${cleanUrl} (depth ${depthLimit}, indexed ${urlCount} pages).`, 'success');
  };

  const handleAddConnectorSource = (name: string, syncSchedule: string, type: 'database' | 'confluence') => {
    if (!canEdit) return;
    const newSource: KnowledgeSource = {
      id: `ks-db-${Date.now()}`,
      name,
      type,
      status: 'ready',
      chunkCount: Math.floor(600 + Math.random() * 800),
      lastIngested: new Date().toISOString().replace('T', ' ').substring(0, 16),
      sizeBytes: Math.floor(2500000 + Math.random() * 4000000),
      syncSchedule,
    };
    setKnowledgeSources((prev) => [...prev, newSource]);
    addAuditLog(`Connected DB integration "${name}" with scheduler configured to "${syncSchedule}".`, 'success');
  };

  const handleConfirmReindex = () => {
    if (!canManage) return;
    setKnowledgeSources((prev) => prev.map((src) => ({ ...src, status: 'syncing' })));
    
    const logId = `log-reindex-${Date.now()}`;
    setIngestionLogs((prev) => [
      {
        id: logId,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        sourceName: 'Global Re-Index Pipeline',
        status: 'success',
        chunksCount: 2020,
        durationMs: 270000,
      },
      ...prev,
    ]);

    setTimeout(() => {
      setKnowledgeSources((prev) =>
        prev.map((src) => ({
          ...src,
          status: 'ready',
          chunkCount: src.chunkCount + Math.floor(10 + Math.random() * 30),
          lastIngested: new Date().toISOString().replace('T', ' ').substring(0, 16),
          isStale: false,
        }))
      );
      addAuditLog('Completed full re-indexing of all vectorized content pools.', 'success');
    }, 1000);
  };

  const handleDeleteSource = (sourceId: string) => {
    if (!canManage) return;
    const targetSrc = knowledgeSources.find((s) => s.id === sourceId);
    const srcName = targetSrc?.name || 'Knowledge Source';
    setKnowledgeSources((prev) => prev.filter((src) => src.id !== sourceId));
    addAuditLog(`Deleted knowledge source: ${srcName}`, 'success');
  };

  // Find if any source has isStale warning
  const staleSource = knowledgeSources.find((src) => src.isStale || src.id === 'ks-3'); // Confluence is stale by default simulation
  const failedSource = knowledgeSources.find((src) => src.status === 'error');

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'database':
        return <Database className="w-4.5 h-4.5" />;
      case 'confluence':
        return <Brain className="w-4.5 h-4.5" />;
      case 'pdf':
        return <FileText className="w-4.5 h-4.5" />;
      case 'url':
        return <Globe className="w-4.5 h-4.5" />;
      default:
        return <Brain className="w-4.5 h-4.5" />;
    }
  };

  // Filter sources based on search query and active tab
  const filteredSources = knowledgeSources.filter((src) => {
    const matchesSearch =
      src.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      src.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (activeFilterTab === 'all') return true;
    if (activeFilterTab === 'files') return src.type === 'pdf';
    if (activeFilterTab === 'sites') return src.type === 'url';
    if (activeFilterTab === 'databases') return src.type === 'database' || src.type === 'confluence';
    return true;
  });

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2 select-none">
      <button
        onClick={() => setShowUpload(true)}
        disabled={!canEdit}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-wider font-bold transition-all shadow-sm ${
          !canEdit
            ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-655 cursor-not-allowed border border-transparent'
            : 'bg-blue-600 hover:bg-blue-750 text-white shadow-blue-550/15'
        }`}
        title={!canEdit ? "Requires Edit Permission" : undefined}
      >
        <Plus className="w-3.5 h-3.5" />
        <span>{isRtl ? 'رفع ملف' : 'Upload Document'}</span>
      </button>
      
      <button
        onClick={() => setShowCrawl(true)}
        disabled={!canEdit}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-wider font-bold transition-all ${
          !canEdit
            ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-655 cursor-not-allowed border border-transparent'
            : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
        }`}
        title={!canEdit ? "Requires Edit Permission" : undefined}
      >
        <Globe className="w-3.5 h-3.5" />
        <span>{isRtl ? 'زحف رابط' : 'Crawl URL'}</span>
      </button>

      <button
        onClick={() => setShowDb(true)}
        disabled={!canEdit}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-wider font-bold transition-all ${
          !canEdit
            ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-655 cursor-not-allowed border border-transparent'
            : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
        }`}
        title={!canEdit ? "Requires Edit Permission" : undefined}
      >
        <Database className="w-3.5 h-3.5" />
        <span>{isRtl ? 'إضافة موصل' : 'Add Connector'}</span>
      </button>

      <button
        onClick={() => setShowReindex(true)}
        disabled={!canManage}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-wider font-bold transition-all ${
          !canManage
            ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-655 cursor-not-allowed border border-transparent'
            : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20'
        }`}
        title={!canManage ? "Requires Manage Permission" : undefined}
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>{isRtl ? 'إعادة فهرسة الكل' : 'Re-index All'}</span>
      </button>
    </div>
  );

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <SectionHeader
        title={t.clientAdmin.kb.title}
        description={t.clientAdmin.kb.description}
        action={headerActions}
      />

      {/* Stale Knowledge Vector Warning Banner */}
      {staleSource && (
        <OperationalBanner
          type="warning"
          messageEn={`Vector Index Warning: Ingestion for "${staleSource.name}" was marked stale. The index embeddings have not been updated for 48 hours.`}
          messageAr={`تحذير فهرس المتجهات: تم وضع علامة على مصدر "${staleSource.name}" كـ قديم. لم يتم تحديث متجهات الفهرسة خلال آخر 48 ساعة.`}
          isRtl={isRtl}
          actionTextEn="Re-Index Now"
          actionTextAr="أعد الفهرسة الآن"
          onAction={() => handleSyncSource(staleSource.id)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Indexing Sources List & Config Panels */}
        <div className="lg:col-span-2 space-y-5">
          <OperationalCard hoverEffect={false} className="p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-850 pb-3">
              <h3 className="font-bold text-xs text-slate-655 dark:text-slate-400 uppercase font-mono tracking-wider">
                {t.clientAdmin.kb.indexingSources}
              </h3>
              
              {/* Search & Tabs filter */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 max-w-lg w-full md:w-auto font-sans">
                {/* Search field */}
                <div className="relative flex-1 sm:max-w-xs">
                  <input
                    type="text"
                    placeholder={isRtl ? 'بحث في المصادر...' : 'Search sources...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-205 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                  <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
                </div>

                {/* Filter Tab buttons */}
                <div className="flex bg-slate-100 dark:bg-slate-950 p-0.5 rounded-xl border border-slate-200/40 dark:border-slate-850/60 font-mono text-[9px] font-bold">
                  {[
                    { id: 'all', label: isRtl ? 'الكل' : 'All' },
                    { id: 'files', label: isRtl ? 'ملفات' : 'Files' },
                    { id: 'sites', label: isRtl ? 'مواقع' : 'Sites' },
                    { id: 'databases', label: isRtl ? 'موصلات' : 'DBs' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveFilterTab(tab.id as any)}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        activeFilterTab === tab.id
                          ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/50 dark:border-slate-800/55'
                          : 'text-slate-655 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {filteredSources.length === 0 ? (
                <div className="py-10 px-6 text-center border border-dashed border-slate-205 dark:border-slate-800 rounded-3xl bg-slate-50/40 dark:bg-slate-950/20 space-y-5 animate-fade-in text-xs font-semibold">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                    <Brain className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1.5">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                      {isRtl ? 'ابدأ في إعداد مستودع معرفة RAG' : 'Get Started with RAG Vector Embeddings'}
                    </h4>
                    <p className="text-[11.5px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                      {isRtl
                        ? 'قم برفع ملفاتك، أو زحف إلى موقع ويب، أو اربط قواعد البيانات لتزويد روبوتات الخدمة الذاتية بالمعلومات الدقيقة.'
                        : 'Upload documents, crawl websites, or connect databases to begin powering retrieval workflows.'}
                    </p>
                  </div>
                  
                  {/* Guided CTA stack */}
                  <div className="flex flex-wrap items-center justify-center gap-3 select-none">
                    <button
                      onClick={() => setShowUpload(true)}
                      disabled={!canEdit}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] uppercase tracking-wider font-bold transition-all shadow-sm ${
                        !canEdit
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-transparent'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/15 cursor-pointer'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'رفع ملف' : 'Upload File'}</span>
                    </button>
                    
                    <button
                      onClick={() => setShowCrawl(true)}
                      disabled={!canEdit}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] uppercase tracking-wider font-bold transition-all ${
                        !canEdit
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-transparent'
                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 cursor-pointer'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'زحف رابط' : 'Crawl URL'}</span>
                    </button>

                    <button
                      onClick={() => setShowDb(true)}
                      disabled={!canEdit}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] uppercase tracking-wider font-bold transition-all ${
                        !canEdit
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-transparent'
                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 cursor-pointer'
                      }`}
                    >
                      <Database className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'ربط موصل' : 'Connect Database'}</span>
                    </button>
                  </div>

                  <div className="pt-2">
                    <a
                      href="#docs-rag"
                      onClick={(e) => {
                        e.preventDefault();
                        alert(isRtl ? 'تعليمات الإعداد: تصفح مستندات الموصلات لإعداد خوارزمية التقطيع المثلى.' : 'Setup guides: Check clientAdmin.kb for optimal chunking and embeddings configurations.');
                      }}
                      className="text-blue-500 hover:text-blue-600 text-[10px] font-bold underline"
                    >
                      {isRtl ? 'تعرف على المزيد حول إعدادات الفهرسة والـ Chunking' : 'Learn more about indexing & chunking configuration'}
                    </a>
                  </div>
                </div>
              ) : (
                filteredSources.map((src) => {
                  const isSelectedForSched = src.id === selectedSourceId;
                  const scheduleLabel = src.syncSchedule || (src.type === 'confluence' ? 'hourly' : src.type === 'database' ? 'daily' : 'manual');
                  
                  return (
                    <div key={src.id} className="space-y-3">
                      <div
                        className={`flex flex-col gap-3 p-4 bg-slate-50 dark:bg-slate-950 border rounded-2xl transition-all duration-200 cursor-pointer ${
                          isSelectedForSched
                            ? 'border-blue-500 bg-blue-500/5 dark:bg-blue-955/10 ring-2 ring-blue-500/10'
                            : 'border-slate-100 dark:border-slate-900 hover:border-slate-205 dark:hover:border-slate-800'
                        }`}
                        onClick={() => {
                          setSelectedSourceId(src.id);
                          setSyncSchedule(src.syncSchedule || 'daily');
                        }}
                      >
                        {/* Content Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                              {getSourceIcon(src.type)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-xs text-slate-900 dark:text-white">{src.name}</h4>
                                {src.id === 'ks-3' && (
                                  <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 text-[8px] font-bold px-1.5 py-0.2 rounded uppercase">
                                    Stale
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-450 mt-1 font-mono">
                                <span>{t.clientAdmin.kb.chunks}: <strong className="text-slate-700 dark:text-slate-350">{src.chunkCount}</strong></span>
                                <span>{t.clientAdmin.kb.type}: <strong className="uppercase">{src.type}</strong></span>
                                <span>Schedule: <strong className="uppercase text-blue-500">{scheduleLabel}</strong></span>
                                {src.sizeBytes ? (
                                  <span>{t.clientAdmin.kb.size}: <strong>{(src.sizeBytes / 1000000).toFixed(2)} MB</strong></span>
                                ) : null}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/50 dark:border-slate-800/55">
                            <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold">
                              {src.status === 'syncing' ? (
                                <span className="flex items-center gap-1.5 text-blue-500">
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  <span>{t.clientAdmin.kb.indexing}</span>
                                </span>
                              ) : src.status === 'error' ? (
                                <span className="flex items-center gap-1.5 text-rose-500 animate-pulse">
                                  <AlertCircle className="w-3.5 h-3.5" />
                                  <span>{t.clientAdmin.kb.error}</span>
                                </span>
                              ) : (
                                <span className="text-slate-400 font-semibold">{t.clientAdmin.kb.synced}: {src.lastIngested}</span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                disabled={src.status === 'syncing' || !canEdit}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSyncSource(src.id);
                                }}
                                className={`px-3 py-1.5 text-[10px] font-bold rounded-xl transition-all select-none outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 ${
                                  src.status === 'syncing' || !canEdit
                                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50'
                                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer'
                                }`}
                                title={!canEdit ? "Requires Edit Permission" : undefined}
                              >
                                {t.clientAdmin.kb.sync}
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSource(src.id);
                                }}
                                disabled={!canManage}
                                className={`p-1.5 rounded-xl transition-all outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50 ${
                                  !canManage
                                    ? 'text-slate-600 dark:text-slate-655 cursor-not-allowed opacity-40'
                                    : 'text-slate-400 hover:text-rose-500 hover:bg-rose-500/5 cursor-pointer'
                                }`}
                                title={!canManage ? "Requires Manage Permission" : "Delete Source"}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Syncing Progress Bar */}
                        {src.status === 'syncing' && (
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-900 mt-1 space-y-1.5 font-mono text-[9px] animate-in slide-in-from-top-1">
                            <div className="flex justify-between font-bold text-blue-555">
                              <span className="flex items-center gap-1">
                                <RefreshCw className="w-3 h-3 animate-spin" />
                                <span>{isRtl ? 'جاري الفهرسة وحساب الترميز المتجه...' : 'Computing vector embeddings & cluster index partitioning...'}</span>
                              </span>
                              <span>65%</span>
                            </div>
                            <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 animate-[shimmer_1.5s_infinite]" style={{ width: '65%' }} />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Integrated Retry Panel for Crawler Sync Failures */}
                      {src.status === 'error' && (
                        <div className="pl-4 border-l-2 border-rose-500/55 animate-in slide-in-from-top-1">
                          <RetryPanel
                             errorDetail={src.id === 'ks-4' ? 'Connection timeout. Host: erp-prod.internal.local. Code: ETIMEDOUT.' : 'Sync failed'}
                             errorDetailAr={src.id === 'ks-4' ? 'انتهت مهلة الاتصال. المضيف: erp-prod.internal.local. الرمز: ETIMEDOUT.' : 'فشلت المزامنة'}
                             attempts={retryAttempts[src.id] || 1}
                             maxAttempts={3}
                             isRetrying={retryingSourceId === src.id}
                             onRetry={() => handleRetrySource(src.id)}
                             isRtl={isRtl}
                             disabled={!canEdit}
                           />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </OperationalCard>

          {/* Sync Scheduling Configuration Panel */}
          <OperationalCard hoverEffect={false} className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2.5">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-500" />
                <h3 className="font-bold text-xs text-slate-655 dark:text-slate-400 uppercase font-mono tracking-wider">
                  Crawler Sync Scheduler
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Configure auto-sync and credentials for selected connector
              </span>
            </div>

            <form onSubmit={handleSaveSchedulerSettings} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase font-mono mb-1.5">
                    Sync Execution Frequency
                  </label>
                  <select
                    value={syncSchedule}
                    disabled={!canEdit}
                    onChange={(e) => setSyncSchedule(e.target.value)}
                    className={`w-full px-3 py-2 border border-slate-205 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold ${
                      !canEdit
                        ? 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 cursor-not-allowed opacity-60'
                        : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100'
                    }`}
                  >
                    <option value="manual">Manual (No Schedule)</option>
                    <option value="hourly">Hourly (Real-time webhook spikes)</option>
                    <option value="daily">Daily (Nightly automated cron)</option>
                    <option value="weekly">Weekly (Standard policy updates)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase font-mono mb-1.5">
                    Max Link Crawl Depth
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={crawlerDepth}
                    disabled={!canEdit}
                    onChange={(e) => setCrawlerDepth(Number(e.target.value))}
                    className={`w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold ${
                      !canEdit
                        ? 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 cursor-not-allowed opacity-60'
                        : 'bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-100'
                    }`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-455 uppercase font-mono mb-1.5">
                    Crawl Filter Exclusions (URL/Regex paths)
                  </label>
                  <input
                    type="text"
                    value={exclusions}
                    disabled={!canEdit}
                    onChange={(e) => setExclusions(e.target.value)}
                    className={`w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold ${
                      !canEdit
                        ? 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 cursor-not-allowed opacity-60'
                        : 'bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-100'
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={!canEdit}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] uppercase tracking-wider font-bold transition-all shadow-sm ${
                    !canEdit
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-655 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-750 text-white shadow-blue-550/15'
                  }`}
                  title={!canEdit ? "Requires Edit Permission" : undefined}
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Crawler Schedule
                </button>
              </div>
            </form>
          </OperationalCard>

          {/* Chunking & Vector Config */}
          <OperationalCard hoverEffect={false} className="p-5 space-y-4">
            <h3 className="font-bold text-xs text-slate-655 dark:text-slate-400 uppercase font-mono tracking-wider">
              {t.clientAdmin.kb.chunkingConfig}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
              <div>
                <label className="block text-xs font-bold text-slate-450 uppercase font-mono mb-1.5">
                  {t.clientAdmin.kb.embeddingModel}
                </label>
                <select 
                  disabled={!canEdit}
                  className={`w-full px-3 py-2 border border-slate-205 dark:border-slate-800 rounded-xl focus:outline-none font-semibold ${
                    !canEdit
                      ? 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 cursor-not-allowed opacity-60'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100'
                  }`}
                >
                  <option>text-embedding-3-small (1536-dim)</option>
                  <option>text-embedding-3-large (3072-dim)</option>
                  <option>Cohere Multilingual v3</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-455 uppercase font-mono mb-1.5">
                  Chunk Size Token limit
                </label>
                <input
                  type="number"
                  value={chunkSize}
                  disabled={!canEdit}
                  onChange={(e) => setChunkSize(Number(e.target.value))}
                  className={`w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none font-semibold ${
                    !canEdit
                      ? 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 cursor-not-allowed opacity-60'
                      : 'bg-white dark:bg-slate-900 text-slate-805 dark:text-slate-100'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-455 uppercase font-mono mb-1.5">
                  {t.clientAdmin.kb.overlapSize}
                </label>
                <input
                  type="number"
                  value={overlapSize}
                  disabled={!canEdit}
                  onChange={(e) => setOverlapSize(Number(e.target.value))}
                  className={`w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none font-semibold ${
                    !canEdit
                      ? 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 cursor-not-allowed opacity-60'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100'
                  }`}
                />
              </div>
            </div>
          </OperationalCard>

          {/* Related RAG Workflows Card */}
          <OperationalCard hoverEffect={false} className="p-5 space-y-4 animate-fade-in">
            <h3 className="font-bold text-xs text-slate-655 dark:text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-blue-500" />
              <span>{isRtl ? 'سير العمل المتصل' : 'Related RAG Workflows'}</span>
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
              {isRtl
                ? 'الوصول إلى أدوات التشخيص والتحليل لنموذج المعرفة المستند على البيانات المستوردة.'
                : 'Directly transition to vector diagnostic charts, AI intent scores, or model evaluation logs.'}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('navigate-to-screen', { detail: { screenId: 'analytics_center' } }));
                }}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-500/5 dark:hover:bg-blue-500/10 text-slate-700 dark:text-slate-350 text-[10px] font-bold rounded-xl transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {isRtl ? 'تحليل تقسيم المعرفة' : 'View Chunk Analytics'}
              </button>
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('navigate-to-screen', { detail: { screenId: 'analytics_center' } }));
                }}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-500/5 dark:hover:bg-blue-500/10 text-slate-700 dark:text-slate-350 text-[10px] font-bold rounded-xl transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {isRtl ? 'سجلات استرجاع الـ RAG' : 'Open Retrieval Logs'}
              </button>
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('navigate-to-screen', { detail: { screenId: 'training' } }));
                }}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-500/5 dark:hover:bg-blue-500/10 text-slate-700 dark:text-slate-350 text-[10px] font-bold rounded-xl transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {isRtl ? 'تدريب تضمينات المعرفة' : 'Train Knowledge Embeddings'}
              </button>
            </div>
          </OperationalCard>
        </div>

        {/* Tabbed Ingestion / RAG Activities Card */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850/65 rounded-3xl p-5 shadow-sm space-y-4 h-fit w-full lg:w-auto">
          <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-xl border border-slate-200/40 dark:border-slate-800/80 font-mono text-[9px] font-bold w-fit">
            <button
              type="button"
              onClick={() => setTimelineTab('rag_activities')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                timelineTab === 'rag_activities'
                  ? 'bg-white dark:bg-slate-950 text-blue-650 dark:text-blue-400 shadow-sm border border-slate-200/50 dark:border-slate-800'
                  : 'text-slate-500 dark:text-slate-450 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isRtl ? 'أحداث المتجهات النشطة' : 'RAG Activity Feed'}
            </button>
            <button
              type="button"
              onClick={() => setTimelineTab('session_logs')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                timelineTab === 'session_logs'
                  ? 'bg-white dark:bg-slate-950 text-blue-655 dark:text-blue-400 shadow-sm border border-slate-200/50 dark:border-slate-800'
                  : 'text-slate-500 dark:text-slate-450 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isRtl ? 'سجل العمليات المحلي' : 'Session Ingestion Logs'}
            </button>
          </div>

          {timelineTab === 'rag_activities' ? (
            <OperationalActivityFeed filterScope="knowledge" limit={5} compact={true} />
          ) : (
            <div className="space-y-3.5">
              {ingestionLogs.map((log) => (
                <div key={log.id} className="border-l-2 border-slate-200 dark:border-slate-800 pl-3.5 space-y-1 relative">
                  <div className="absolute -left-1.5 top-1 w-2.5 h-2.5 rounded-full bg-slate-350 dark:bg-slate-700" />
                  <div className="flex justify-between items-center text-[10px] gap-2">
                    <span className="font-bold text-slate-800 dark:text-white truncate max-w-[130px]" title={log.sourceName}>
                      {log.sourceName}
                    </span>
                    <span className="font-mono text-slate-400 shrink-0">{log.timestamp.substring(11, 16)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-bold">
                    <span className={`px-1.5 py-0.5 rounded font-bold font-mono text-[8px] tracking-wide uppercase ${
                      log.status === 'success'
                        ? 'bg-emerald-55 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
                        : log.status === 'processing'
                        ? 'bg-blue-50 dark:bg-blue-955/20 text-blue-700 dark:text-blue-450'
                        : 'bg-rose-55 dark:bg-rose-955/20 text-rose-700 dark:text-rose-455'
                    }`}>
                      {log.status.toUpperCase()}
                    </span>
                    {log.chunksCount > 0 && (
                      <span className="text-slate-450 font-mono">+{log.chunksCount} chunks</span>
                    )}
                  </div>
                  {log.errorDetail && (
                    <p className="text-[9px] text-rose-500 font-mono mt-1.5 leading-normal italic bg-rose-50/50 dark:bg-rose-950/20 p-1.5 border border-rose-200/30 rounded-lg">
                      {log.errorDetail}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <FileUploadModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        lang={lang}
        onAddSource={handleAddFileSource}
      />
      <UrlCrawlModal
        isOpen={showCrawl}
        onClose={() => setShowCrawl(false)}
        lang={lang}
        onAddSource={handleAddUrlSource}
      />
      <DatabaseConnectorModal
        isOpen={showDb}
        onClose={() => setShowDb(false)}
        lang={lang}
        onAddSource={handleAddConnectorSource}
      />
      <ReindexConfirmationModal
        isOpen={showReindex}
        onClose={() => setShowReindex(false)}
        lang={lang}
        onConfirmReindex={handleConfirmReindex}
      />
    </div>
  );
}

export default KnowledgeBaseTab;
