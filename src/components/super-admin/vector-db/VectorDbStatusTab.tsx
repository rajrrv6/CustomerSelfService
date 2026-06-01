'use client';

import React, { useState } from 'react';
import { Database, RefreshCw } from 'lucide-react';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { OperationalCard } from '@/components/shared/OperationalCard';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';
import { triggerVectorDBIndexFailure, triggerSyncCompleted } from '@/stores/notifications/notificationEvents';

export function VectorDbStatusTab() {
  const { lang, addAuditLog } = useApp();
  const t = translations[lang];
  const isRtl = lang === 'ar';

  const [expandedCluster, setExpandedCluster] = useState<string | null>(null);
  
  // Rebalancing simulation state
  const [rebalanceState, setRebalanceState] = useState<'idle' | 'analyzing' | 'shifting' | 'compacting' | 'failed' | 'success'>('idle');
  const [rebalanceProgress, setRebalanceProgress] = useState(0);

  const startRebalance = () => {
    addAuditLog('Triggered vector DB nodes rebalance sequence', 'success');
    setRebalanceState('analyzing');
    setRebalanceProgress(10);
    
    setTimeout(() => {
      setRebalanceState('shifting');
      setRebalanceProgress(40);
      
      setTimeout(() => {
        setRebalanceState('compacting');
        setRebalanceProgress(70);
        
        setTimeout(() => {
          // Simulate a partial compaction timeout/failure to test retry
          setRebalanceState('failed');
          addAuditLog('Rebalance compaction stage failed on pinecone-us-east-1: ShardLockException', 'failed');
          triggerVectorDBIndexFailure('pinecone-us-east-1-shard-3');
        }, 1200);
      }, 1205);
    }, 1205);
  };

  const retryRebalance = () => {
    setRebalanceState('compacting');
    setRebalanceProgress(85);
    addAuditLog('Retrying vector DB compaction sequence', 'success');
    
    setTimeout(() => {
      setRebalanceState('success');
      setRebalanceProgress(100);
      addAuditLog('Vector DB nodes rebalanced successfully', 'success');
      triggerSyncCompleted('Pinecone DB Shard Relocator', 4120);
    }, 1205);
  };

  const closeRebalanceBanner = () => {
    setRebalanceState('idle');
    setRebalanceProgress(0);
  };

  const headerAction = (
    <button
      onClick={startRebalance}
      disabled={rebalanceState !== 'idle' && rebalanceState !== 'success' && rebalanceState !== 'failed'}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors disabled:opacity-50 cursor-pointer"
    >
      <RefreshCw className={`w-3.5 h-3.5 ${['analyzing', 'shifting', 'compacting'].includes(rebalanceState) ? 'animate-spin' : ''}`} />
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

      {/* Interactive Rebalance Console */}
      {rebalanceState !== 'idle' && (
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-205 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bold text-xs text-slate-800 dark:text-white uppercase tracking-wider font-mono">
                {isRtl ? 'محاكاة إعادة توازن العقد' : 'Vector Node Rebalance Console'}
              </h4>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Task ID: job-vdb-rebalance-{lang}</p>
            </div>
            {rebalanceState === 'success' || rebalanceState === 'failed' ? (
              <button
                onClick={closeRebalanceBanner}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-[10px] font-bold underline cursor-pointer"
              >
                {isRtl ? 'إغلاق' : 'Dismiss'}
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-mono font-bold animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                {isRtl ? 'جاري التنفيذ...' : 'Running Job...'}
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>{isRtl ? 'تقدم العملية' : 'Job Progress'}</span>
              <span>{rebalanceProgress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  rebalanceState === 'failed' ? 'bg-red-500' :
                  rebalanceState === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                }`}
                style={{ width: `${rebalanceProgress}%` }}
              />
            </div>
          </div>

          {/* Detailed step tracker */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] border-t border-slate-100 dark:border-slate-850 pt-3">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                rebalanceState === 'analyzing' ? 'bg-blue-500 animate-ping' : 'bg-emerald-500'
              }`} />
              <span className={rebalanceState === 'analyzing' ? 'font-bold text-slate-800 dark:text-white' : 'text-slate-500'}>
                1. {isRtl ? 'تحليل توزيع النقاط' : 'Analyzing Node Weights'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                rebalanceState === 'shifting' ? 'bg-blue-500 animate-ping' :
                ['compacting', 'failed', 'success'].includes(rebalanceState) ? 'bg-emerald-500' : 'bg-slate-300'
              }`} />
              <span className={rebalanceState === 'shifting' ? 'font-bold text-slate-800 dark:text-white' : 'text-slate-500'}>
                2. {isRtl ? 'ترحيل فهارس الشظايا' : 'Relocating Index Shards'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                rebalanceState === 'compacting' ? 'bg-blue-500 animate-ping' :
                rebalanceState === 'failed' ? 'bg-red-500' :
                rebalanceState === 'success' ? 'bg-emerald-500' : 'bg-slate-300'
              }`} />
              <span className={rebalanceState === 'compacting' || rebalanceState === 'failed' ? 'font-bold text-slate-800 dark:text-white' : 'text-slate-500'}>
                3. {isRtl ? 'ضغط مساحات الأسماء' : 'Compacting Namespaces'}
              </span>
            </div>
          </div>

          {/* Conditional failure warning with retry action */}
          {rebalanceState === 'failed' && (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl">
              <div className="text-[11px] text-red-800 dark:text-red-300">
                <span className="font-bold block">{isRtl ? 'فشل جزئي في العملية' : 'Compaction Timeout Exception'}</span>
                <span className="font-mono text-[10px] mt-0.5 block opacity-90">ShardLockException: Resource temporarily locked by index compaction.</span>
              </div>
              <button
                onClick={retryRebalance}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 dark:bg-red-900/40 text-white dark:hover:bg-red-900/60 text-[11px] font-bold rounded-xl shadow-sm transition-all cursor-pointer"
              >
                {isRtl ? 'إعادة المحاولة' : 'Retry Compaction'}
              </button>
            </div>
          )}

          {/* Success Banner */}
          {rebalanceState === 'success' && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl text-[11px] text-emerald-800 dark:text-emerald-300">
              <span className="font-bold block">{isRtl ? 'اكتملت العملية بنجاح' : 'Rebalance Succeeded'}</span>
              <span className="mt-0.5 block opacity-90">{isRtl ? 'تم نقل 3 شظايا بنجاح وضغط مساحات الأسماء بالكامل.' : 'All vector shards were relocated and namespaces compacted successfully.'}</span>
            </div>
          )}
        </div>
      )}

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
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full" style={{ width: '41.2%' }} />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-850">
            <button
              onClick={() => setExpandedCluster(expandedCluster === 'pinecone' ? null : 'pinecone')}
              className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline tracking-wide uppercase font-mono flex items-center gap-1.5 cursor-pointer"
            >
              {expandedCluster === 'pinecone' 
                ? (isRtl ? 'إخفاء مساحات الأسماء' : 'Hide Cluster Namespaces') 
                : (isRtl ? 'عرض مساحات الأسماء' : 'Show Cluster Namespaces')}
            </button>

            {expandedCluster === 'pinecone' && (
              <div className="mt-3 space-y-2 border-t border-dashed border-slate-200 dark:border-slate-800 pt-3 animate-in fade-in duration-200">
                <span className="text-[9px] uppercase text-slate-400 font-mono tracking-wider block">Namespace Vectors Distribution:</span>
                <div className="space-y-1.5 font-mono text-[10px]">
                  <div className="flex justify-between bg-slate-50 dark:bg-slate-950/40 p-2 rounded-xl border border-slate-100 dark:border-slate-850">
                    <span className="font-bold text-slate-700 dark:text-slate-300">kb-customer-portal</span>
                    <span className="text-slate-500">1,500,000 vectors | p95: 45ms</span>
                  </div>
                  <div className="flex justify-between bg-slate-50 dark:bg-slate-950/40 p-2 rounded-xl border border-slate-100 dark:border-slate-850">
                    <span className="font-bold text-slate-700 dark:text-slate-300">kb-billing-docs</span>
                    <span className="text-slate-500">900,000 vectors | p95: 32ms</span>
                  </div>
                  <div className="flex justify-between bg-slate-50 dark:bg-slate-950/40 p-2 rounded-xl border border-slate-100 dark:border-slate-850">
                    <span className="font-bold text-slate-700 dark:text-slate-300">kb-agent-handbook</span>
                    <span className="text-slate-500">1,720,412 vectors | p95: 38ms</span>
                  </div>
                </div>
              </div>
            )}
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
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
              <div className="bg-purple-500 h-full" style={{ width: '14.8%' }} />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-850">
            <button
              onClick={() => setExpandedCluster(expandedCluster === 'pgvector' ? null : 'pgvector')}
              className="text-[10px] text-purple-600 dark:text-purple-400 font-bold hover:underline tracking-wide uppercase font-mono flex items-center gap-1.5 cursor-pointer"
            >
              {expandedCluster === 'pgvector' 
                ? (isRtl ? 'إخفاء مساحات الأسماء' : 'Hide Cluster Namespaces') 
                : (isRtl ? 'عرض مساحات الأسماء' : 'Show Cluster Namespaces')}
            </button>

            {expandedCluster === 'pgvector' && (
              <div className="mt-3 space-y-2 border-t border-dashed border-slate-200 dark:border-slate-800 pt-3 animate-in fade-in duration-200">
                <span className="text-[9px] uppercase text-slate-400 font-mono tracking-wider block">Namespace Vectors Distribution:</span>
                <div className="space-y-1.5 font-mono text-[10px]">
                  <div className="flex justify-between bg-slate-50 dark:bg-slate-950/40 p-2 rounded-xl border border-slate-100 dark:border-slate-850">
                    <span className="font-bold text-slate-700 dark:text-slate-300">kb-compliance-reg</span>
                    <span className="text-slate-500">400,000 vectors | p95: 15ms</span>
                  </div>
                  <div className="flex justify-between bg-slate-50 dark:bg-slate-950/40 p-2 rounded-xl border border-slate-100 dark:border-slate-850">
                    <span className="font-bold text-slate-700 dark:text-slate-300">kb-eu-legal</span>
                    <span className="text-slate-500">412,410 vectors | p95: 12ms</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </OperationalCard>
      </div>
    </div>
  );
}
