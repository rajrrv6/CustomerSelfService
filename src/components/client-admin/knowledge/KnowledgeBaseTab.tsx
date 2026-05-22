'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Brain, RefreshCw, AlertCircle } from 'lucide-react';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { OperationalCard } from '@/components/shared/OperationalCard';
import { translations } from '@/i18n/translations';

export function KnowledgeBaseTab() {
  const { lang, knowledgeSources, ingestionLogs, triggerIngestion } = useApp();
  const t = translations[lang];

  // Ingestion Sync Trigger state
  const [syncingId, setSyncingId] = useState<string | null>(null);
  
  const handleSyncSource = (sourceId: string) => {
    setSyncingId(sourceId);
    triggerIngestion(sourceId);
    setTimeout(() => {
      setSyncingId(null);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t.clientAdmin.kb.title}
        description={t.clientAdmin.kb.description}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sources list */}
        <div className="lg:col-span-2 space-y-4">
          <OperationalCard hoverEffect={false} className="p-5 space-y-4">
            <h3 className="font-bold text-xs text-slate-650 dark:text-slate-400 uppercase font-mono">
              {t.clientAdmin.kb.indexingSources}
            </h3>
            <div className="space-y-4">
              {knowledgeSources.map((src) => (
                <div
                  key={src.id}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-2xl hover:border-slate-205 dark:hover:border-slate-800 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                     <div className="w-9 h-9 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                       <Brain className="w-4.5 h-4.5" />
                     </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">{src.name}</h4>
                      <div className="flex gap-3 text-[10px] text-slate-450 mt-1 font-mono">
                        <span>{t.clientAdmin.kb.chunks}: <strong className="text-slate-700 dark:text-slate-350">{src.chunkCount}</strong></span>
                        <span>{t.clientAdmin.kb.type}: <strong className="uppercase">{src.type}</strong></span>
                        {src.sizeBytes ? (
                          <span>{t.clientAdmin.kb.size}: <strong>{(src.sizeBytes / 1000000).toFixed(2)} MB</strong></span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {src.status === 'syncing' ? (
                      <div className="flex items-center gap-1.5 text-blue-500 text-[10px] font-bold font-mono">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>{t.clientAdmin.kb.indexing}</span>
                      </div>
                    ) : src.status === 'error' ? (
                      <div className="flex items-center gap-1.5 text-rose-500 text-[10px] font-bold font-mono">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{t.clientAdmin.kb.error}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-mono">{t.clientAdmin.kb.synced}: {src.lastIngested}</span>
                    )}

                    <button
                      disabled={src.status === 'syncing'}
                      onClick={() => handleSyncSource(src.id)}
                      className="px-3 py-1.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                    >
                      {t.clientAdmin.kb.sync}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </OperationalCard>

          {/* Chunking config */}
          <OperationalCard hoverEffect={false} className="p-5 space-y-4">
            <h3 className="font-bold text-xs text-slate-650 dark:text-slate-400 uppercase font-mono">
              {t.clientAdmin.kb.chunkingConfig}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
              <div>
                <label className="block text-xs font-bold text-slate-450 uppercase font-mono mb-1.5">
                  {t.clientAdmin.kb.embeddingModel}
                </label>
                <select className="w-full px-3 py-2 border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none text-slate-800 dark:text-slate-100">
                  <option>text-embedding-3-small (1536-dim)</option>
                  <option>text-embedding-3-large (3072-dim)</option>
                  <option>Cohere Multilingual v3</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-450 uppercase font-mono mb-1.5">
                  {t.clientAdmin.kb.overlapSize}
                </label>
                <input
                  type="number"
                  defaultValue={128}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
          </OperationalCard>
        </div>

        {/* Ingestion logs timeline */}
        <OperationalCard hoverEffect={false} className="p-5 space-y-4 h-fit">
          <h3 className="font-bold text-xs text-slate-650 dark:text-slate-400 uppercase font-mono">
            {t.clientAdmin.kb.auditTimeline}
          </h3>
          <div className="space-y-3.5">
            {ingestionLogs.map((log) => (
              <div key={log.id} className="border-l-2 border-slate-100 dark:border-slate-800 pl-3.5 space-y-1 relative">
                <div className="absolute -left-1.5 top-1 w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-bold text-slate-800 dark:text-white truncate max-w-[130px]" title={log.sourceName}>
                    {log.sourceName}
                  </span>
                  <span className="font-mono text-slate-400">{log.timestamp.substring(11, 16)}</span>
                </div>
                <div className="flex items-center gap-2 text-[9px] font-semibold">
                  <span className={`px-1.5 py-0.5 rounded font-bold font-mono ${
                    log.status === 'success'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400'
                      : log.status === 'processing'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-400'
                  }`}>
                    {log.status.toUpperCase()}
                  </span>
                  {log.chunksCount > 0 && (
                    <span className="text-slate-450 font-mono">+{log.chunksCount} chunks</span>
                  )}
                </div>
                {log.errorDetail && (
                  <p className="text-[9px] text-rose-500 font-mono mt-1 leading-normal italic bg-rose-505/5 dark:bg-rose-950/20 p-1.5 rounded-lg">
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
