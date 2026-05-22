'use client';

import React from 'react';
import { Database, RefreshCw } from 'lucide-react';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { OperationalCard } from '@/components/shared/OperationalCard';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';

export function VectorDbStatusTab() {
  const { lang } = useApp();
  const t = translations[lang];

  const headerAction = (
    <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors">
      <RefreshCw className="w-3.5 h-3.5" />
      {t.superAdmin.vectorDb.rebalanceNodes}
    </button>
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t.superAdmin.vectorDb.title}
        description={t.superAdmin.vectorDb.description}
        action={headerAction}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cluster 1 */}
        <OperationalCard hoverEffect={true} className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-500" />
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-white">Cluster pinecone-us-east-1</h3>
                <span className="text-[10px] text-slate-400 font-mono">Host: api-p1.us-east.pinecone.io</span>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-bold">{t.superAdmin.vectorDb.healthy}</span>
          </div>
          <div className="grid grid-cols-1 gap-2 py-3 text-center border-t border-b border-slate-100 dark:border-slate-850 sm:grid-cols-3">
            <div>
              <span className="text-[9px] text-slate-400 uppercase font-mono block">{t.superAdmin.vectorDb.dimensions}</span>
              <span className="text-sm font-bold font-mono text-slate-800 dark:text-slate-100">1,536</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 uppercase font-mono block">{t.superAdmin.vectorDb.tableHeaders[4]}</span>
              <span className="text-sm font-bold font-mono text-slate-800 dark:text-slate-100">4,120,412</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 uppercase font-mono block">{t.superAdmin.vectorDb.activeIndexes}</span>
              <span className="text-sm font-bold font-mono text-slate-800 dark:text-slate-100">18</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
              <span>{t.superAdmin.vectorDb.storageLimit}</span>
              <span className="text-slate-800 dark:text-slate-200">41.2% {t.superAdmin.vectorDb.used}</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full" style={{ width: '41.2%' }} />
            </div>
          </div>
        </OperationalCard>

        {/* Cluster 2 */}
        <OperationalCard hoverEffect={true} className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-500" />
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-white">Cluster pgvector-fra-core</h3>
                <span className="text-[10px] text-slate-400 font-mono">Host: pg-vector.internal.fra.aws</span>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-bold">{t.superAdmin.vectorDb.healthy}</span>
          </div>
          <div className="grid grid-cols-1 gap-2 py-3 text-center border-t border-b border-slate-100 dark:border-slate-850 sm:grid-cols-3">
            <div>
              <span className="text-[9px] text-slate-400 uppercase font-mono block">{t.superAdmin.vectorDb.dimensions}</span>
              <span className="text-sm font-bold font-mono text-slate-800 dark:text-slate-100">3,072</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 uppercase font-mono block">{t.superAdmin.vectorDb.tableHeaders[4]}</span>
              <span className="text-sm font-bold font-mono text-slate-800 dark:text-slate-100">812,410</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 uppercase font-mono block">{t.superAdmin.vectorDb.activeIndexes}</span>
              <span className="text-sm font-bold font-mono text-slate-800 dark:text-slate-100">4</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
              <span>{t.superAdmin.vectorDb.storageLimit}</span>
              <span className="text-slate-800 dark:text-slate-200">14.8% {t.superAdmin.vectorDb.used}</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
              <div className="bg-purple-500 h-full" style={{ width: '14.8%' }} />
            </div>
          </div>
        </OperationalCard>
      </div>
    </div>
  );
}
