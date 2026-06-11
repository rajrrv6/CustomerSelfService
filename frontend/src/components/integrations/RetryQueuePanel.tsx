import React from 'react';
import { AlertCircle, RefreshCw, CheckCircle2, History } from 'lucide-react';
import { RetryQueueItem } from '@/hooks/useIntegrationState';

interface RetryQueuePanelProps {
  queue: RetryQueueItem[];
  onRetry: (id: string) => void;
  isRtl?: boolean;
}

export function RetryQueuePanel({ queue, onRetry, isRtl = false }: RetryQueuePanelProps) {
  const activeErrors = queue.filter(q => q.status === 'failed').length;
  const successItems = queue.filter(q => q.status === 'succeeded').length;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 space-y-5 text-xs font-semibold shadow-sm">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-red-500" />
            {isRtl ? 'مراقب طابور إعادة المحاولة' : 'Failed Sync & Retry Queue'}
          </h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Observe and recover failed integration sync pipelines</p>
        </div>

        <div className="flex gap-3 text-[10px] uppercase tracking-wider font-bold">
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 px-3 py-1.5 rounded-xl">
            {activeErrors} {isRtl ? 'أخطاء نشطة' : 'Active Errors'}
          </div>
          <div className="bg-emerald-100 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-xl">
            {successItems} {isRtl ? 'تم إصلاحها' : 'Recovered'}
          </div>
        </div>
      </div>

      {/* Queue list */}
      {queue.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 dark:bg-slate-950/50 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 dark:text-slate-500">
          {isRtl ? 'طابور إعادة المحاولة فارغ! لا توجد أخطاء مزامنة معلقة.' : 'Retry queue is empty! All operations synced successfully.'}
        </div>
      ) : (
        <div className="space-y-3.5">
          {queue.map(item => {
            const isProcessing = item.status === 'retrying';
            const isSuccess = item.status === 'succeeded';

            return (
              <div 
                key={item.id}
                className={`border rounded-xl p-4 transition-all space-y-3 ${
                  isSuccess 
                    ? 'bg-emerald-50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/30' 
                    : isProcessing
                    ? 'bg-blue-50 dark:bg-blue-950/10 border-blue-200 dark:border-blue-900/30'
                    : 'bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-800 dark:text-white text-[11px]">{item.recordName}</span>
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 text-[9px] uppercase tracking-wide rounded-md font-bold">
                        {item.entityType}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">• Failed {item.failedAt}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                      <span className="font-semibold">{item.connectorName}</span>
                      <span>({isRtl ? 'محاولات المزامنة' : 'Attempts'}: {item.retryCount}/{item.maxRetries})</span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-100 dark:border-slate-800 pt-2 sm:pt-0">
                    <span className="flex items-center gap-1.5 font-mono text-[9px]">
                      {isSuccess ? (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 uppercase font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {isRtl ? 'تمت بنجاح' : 'SYNCED'}
                        </span>
                      ) : isProcessing ? (
                        <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 uppercase font-bold">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          {isRtl ? 'جاري الاسترداد' : 'RETRYING...'}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600 dark:text-red-400 uppercase font-bold">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {isRtl ? 'فشلت' : 'FAILED'}
                        </span>
                      )}
                    </span>

                    {!isSuccess && (
                      <button
                        onClick={() => onRetry(item.id)}
                        disabled={isProcessing}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all ${
                          isProcessing
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed'
                            : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <RefreshCw className={`w-3 h-3 ${isProcessing ? 'animate-spin' : ''}`} />
                        {isRtl ? 'إعادة تشغيل المزامنة' : 'Force Sync'}
                      </button>
                    )}
                  </div>
                </div>

                {!isSuccess && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 font-mono text-[9.5px] leading-relaxed break-all font-normal">
                    <span className="font-bold text-red-600 dark:text-red-500 mr-1.5">ERR:</span>
                    {item.errorMessage}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
