import React from 'react';
import { AlertCircle, RefreshCw, CheckCircle2, History, XCircle, ArrowUpRight } from 'lucide-react';
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
    <div className="bg-[#0b0f19]/35 border border-slate-850 rounded-3xl p-5 md:p-6 space-y-5 text-xs font-semibold text-slate-350">
      {/* Header and Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-850 pb-4">
        <div>
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <History className="w-5 h-5 text-rose-500" />
            {isRtl ? 'مراقب طابور إعادة المحاولة' : 'Failed Sync & Retry Queue'}
          </h3>
          <p className="text-[10px] text-slate-500 font-medium">Observe and recover failed integration sync pipelines</p>
        </div>

        <div className="flex gap-3 text-[10px] uppercase tracking-wider font-bold">
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-3 py-1.5 rounded-xl">
            {activeErrors} {isRtl ? 'أخطاء نشطة' : 'Active Errors'}
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-xl">
            {successItems} {isRtl ? 'تم إصلاحها' : 'Recovered'}
          </div>
        </div>
      </div>

      {/* Table / List */}
      {queue.length === 0 ? (
        <div className="text-center py-10 bg-slate-900/10 border border-dashed border-slate-850 rounded-2xl text-slate-500">
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
                className={`border rounded-2xl p-4.5 transition-all space-y-3 ${
                  isSuccess 
                    ? 'bg-emerald-950/10 border-emerald-500/20' 
                    : isProcessing
                    ? 'bg-blue-950/10 border-blue-500/20'
                    : 'bg-slate-900/25 border-slate-850 hover:border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white text-[11px]">{item.recordName}</span>
                      <span className="px-2 py-0.5 bg-slate-850 text-slate-400 border border-slate-750 text-[9px] uppercase tracking-wide rounded-md">
                        {item.entityType}
                      </span>
                      <span className="text-[10px] text-slate-500">• Failed {item.failedAt}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <span className="font-semibold">{item.connectorName}</span>
                      <span>({isRtl ? 'محاولات المزامنة' : 'Attempts'}: {item.retryCount}/{item.maxRetries})</span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-850 pt-2 sm:pt-0">
                    <span className="flex items-center gap-1.5 font-mono text-[9px]">
                      {isSuccess ? (
                        <span className="flex items-center gap-1 text-emerald-400 uppercase font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {isRtl ? 'تمت بنجاح' : 'SYNCED'}
                        </span>
                      ) : isProcessing ? (
                        <span className="flex items-center gap-1 text-blue-400 uppercase font-bold">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          {isRtl ? 'جاري الاسترداد' : 'RETRYING...'}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-rose-450 uppercase font-bold">
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
                            ? 'bg-slate-900 text-slate-500 border border-slate-850 cursor-not-allowed'
                            : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        <RefreshCw className={`w-3 h-3 ${isProcessing ? 'animate-spin' : ''}`} />
                        {isRtl ? 'إعادة تشغيل المزامنة' : 'Force Sync'}
                      </button>
                    )}
                  </div>
                </div>

                {!isSuccess && (
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850 text-rose-400/90 font-mono text-[9.5px] leading-relaxed break-all font-normal">
                    <span className="font-bold text-rose-500 mr-1.5">ERR:</span>
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
