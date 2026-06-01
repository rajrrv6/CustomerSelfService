'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Brain, RefreshCw, AlertCircle, Calendar, Sliders, Clock, Database, Save, Settings, ShieldAlert } from 'lucide-react';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { OperationalCard } from '@/components/shared/OperationalCard';
import { translations } from '@/i18n/translations';
import { RetryPanel } from '@/components/shared/workflows/RetryPanel';
import { OperationalBanner } from '@/components/shared/workflows/OperationalBanner';
import { StatusIndicator } from '@/components/shared/workflows/StatusIndicator';

export function KnowledgeBaseTab() {
  const { lang, knowledgeSources, setKnowledgeSources, ingestionLogs, setIngestionLogs, addAuditLog } = useApp();
  const t = translations[lang];

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

  const isRtl = lang === 'ar';

  const handleSyncSource = (sourceId: string) => {
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

  // Find if any source has isStale warning
  const staleSource = knowledgeSources.find((src) => src.isStale || src.id === 'ks-3'); // Confluence is stale by default simulation
  const failedSource = knowledgeSources.find((src) => src.status === 'error');

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'database':
        return <Database className="w-4.5 h-4.5" />;
      case 'confluence':
        return <Brain className="w-4.5 h-4.5" />;
      default:
        return <Brain className="w-4.5 h-4.5" />;
    }
  };

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <SectionHeader
        title={t.clientAdmin.kb.title}
        description={t.clientAdmin.kb.description}
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
            <h3 className="font-bold text-xs text-slate-655 dark:text-slate-400 uppercase font-mono tracking-wider">
              {t.clientAdmin.kb.indexingSources}
            </h3>
            
            <div className="space-y-4">
              {knowledgeSources.map((src) => {
                const isSelectedForSched = src.id === selectedSourceId;
                const scheduleLabel = src.syncSchedule || (src.type === 'confluence' ? 'hourly' : src.type === 'database' ? 'daily' : 'manual');
                
                return (
                  <div key={src.id} className="space-y-3">
                    <div
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-950 border rounded-2xl transition-all duration-200 cursor-pointer ${
                        isSelectedForSched
                          ? 'border-blue-500 bg-blue-500/5 dark:bg-blue-955/10 ring-2 ring-blue-500/10'
                          : 'border-slate-100 dark:border-slate-900 hover:border-slate-205 dark:hover:border-slate-800'
                      }`}
                      onClick={() => {
                        setSelectedSourceId(src.id);
                        setSyncSchedule(src.syncSchedule || 'daily');
                      }}
                    >
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

                      <div className="flex items-center justify-between sm:justify-end gap-3.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/50 dark:border-slate-800/55">
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

                        <button
                          disabled={src.status === 'syncing'}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSyncSource(src.id);
                          }}
                          className="px-3 py-1.5 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-all disabled:opacity-50 select-none outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
                        >
                          {t.clientAdmin.kb.sync}
                        </button>
                      </div>
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
                        />
                      </div>
                    )}
                  </div>
                );
              })}
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
                  <label className="block text-[10px] font-bold text-slate-450 uppercase font-mono mb-1.5">
                    Sync Execution Frequency
                  </label>
                  <select
                    value={syncSchedule}
                    onChange={(e) => setSyncSchedule(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-100 font-semibold"
                  >
                    <option value="manual">Manual (No Schedule)</option>
                    <option value="hourly">Hourly (Real-time webhook spikes)</option>
                    <option value="daily">Daily (Nightly automated cron)</option>
                    <option value="weekly">Weekly (Standard policy updates)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase font-mono mb-1.5">
                    Max Link Crawl Depth
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={crawlerDepth}
                    onChange={(e) => setCrawlerDepth(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-850 dark:text-slate-100 font-semibold"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-455 uppercase font-mono mb-1.5">
                    Crawl Filter Exclusions (URL/Regex paths)
                  </label>
                  <input
                    type="text"
                    value={exclusions}
                    onChange={(e) => setExclusions(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-850 dark:text-slate-100 font-semibold"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-750 text-white rounded-xl text-[10px] uppercase tracking-wider font-bold transition-all shadow-sm shadow-blue-550/15"
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
                <select className="w-full px-3 py-2 border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none text-slate-800 dark:text-slate-100 font-semibold">
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
                  onChange={(e) => setChunkSize(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none text-slate-805 dark:text-slate-100 font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-450 uppercase font-mono mb-1.5">
                  {t.clientAdmin.kb.overlapSize}
                </label>
                <input
                  type="number"
                  value={overlapSize}
                  onChange={(e) => setOverlapSize(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none text-slate-800 dark:text-slate-100 font-semibold"
                />
              </div>
            </div>
          </OperationalCard>
        </div>

        {/* Ingestion audit timeline logs */}
        <OperationalCard hoverEffect={false} className="p-5 space-y-4 h-fit">
          <h3 className="font-bold text-xs text-slate-655 dark:text-slate-400 uppercase font-mono tracking-wider">
            {t.clientAdmin.kb.auditTimeline}
          </h3>
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
                      ? 'bg-blue-55 dark:bg-blue-950/20 text-blue-700 dark:text-blue-450'
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
        </OperationalCard>
      </div>
    </div>
  );
}

export default KnowledgeBaseTab;
