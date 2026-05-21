import React, { useState } from 'react';
import { WebhookDeliveryLog } from '@/data/seed/webhookEventsSeed';
import { CheckCircle, AlertTriangle, ChevronDown, ChevronUp, Clock, FileJson, RefreshCw } from 'lucide-react';

interface EventLogTableProps {
  logs: WebhookDeliveryLog[];
  onRetryLog?: (eventType: string, targetEndpointUrl: string) => void;
  isRtl?: boolean;
}

export function EventLogTable({ logs, onRetryLog, isRtl = false }: EventLogTableProps) {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedLogId(prev => (prev === id ? null : id));
  };

  return (
    <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm text-xs font-semibold">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold bg-slate-50 dark:bg-slate-950">
              <th className="p-4 w-8"></th>
              <th className="p-4">{isRtl ? 'الحدث' : 'Event Type'}</th>
              <th className="p-4">{isRtl ? 'الرابط المتلقي' : 'Endpoint Receiver URL'}</th>
              <th className="p-4">{isRtl ? 'الحالة' : 'HTTP Status'}</th>
              <th className="p-4">{isRtl ? 'الاستجابة' : 'Latency'}</th>
              <th className="p-4">{isRtl ? 'الوقت' : 'Timestamp'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            {logs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              const is200 = log.statusCode === 200;
              const isPending = log.statusCode === 0;

              return (
                <React.Fragment key={log.id}>
                  {/* Row */}
                  <tr 
                    onClick={() => toggleExpand(log.id)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-900/10 cursor-pointer transition-colors"
                  >
                    <td className="p-4 text-center">
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-slate-800 dark:text-white text-[10.5px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        {log.eventType}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]" title={log.endpointUrl}>
                      {log.endpointUrl}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold ${
                        is200 
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : isPending 
                          ? 'text-blue-600 dark:text-blue-400 animate-pulse' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {isPending ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>PENDING</span>
                          </>
                        ) : (
                          <>
                            {is200 ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                            <span>{log.statusCode}</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-[10.5px] text-slate-600 dark:text-slate-400">
                      {isPending ? '---' : `${log.latencyMs}ms`}
                    </td>
                    <td className="p-4 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                      {log.timestamp}
                    </td>
                  </tr>

                  {/* Expandable JSON Inspector */}
                  {isExpanded && (
                    <tr className="bg-slate-50 dark:bg-slate-950/50">
                      <td colSpan={6} className="p-5 border-t border-slate-100 dark:border-slate-800">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {/* Request Payload */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                              <span className="flex items-center gap-1.5">
                                <FileJson className="w-3.5 h-3.5 text-blue-500" />
                                {isRtl ? 'حمولة الطلب الصادر (Payload JSON)' : 'Request Payload (JSON)'}
                              </span>
                            </div>
                            <pre className="p-3.5 bg-slate-900 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-300 font-mono text-[9px] leading-relaxed overflow-x-auto select-all max-h-56">
                              {log.payload}
                            </pre>
                          </div>

                          {/* Response */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-blue-500" />
                                {isRtl ? 'استجابة الخادم المتلقي (Response Body)' : 'Listener Server Response Body'}
                              </span>
                              {onRetryLog && !isPending && !is200 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRetryLog(log.eventType, log.endpointUrl);
                                  }}
                                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white rounded-lg flex items-center gap-1 text-[9px] transition-all hover:border-slate-300 dark:hover:border-slate-600"
                                >
                                  <RefreshCw className="w-3 h-3" />
                                  {isRtl ? 'إعادة الإرسال' : 'Re-send'}
                                </button>
                              )}
                            </div>
                            <pre className={`p-3.5 bg-slate-900 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-[9.5px] leading-relaxed overflow-x-auto max-h-56 ${
                              is200 ? 'text-slate-400' : 'text-red-400 dark:text-red-400'
                            }`}>
                              {log.responseBody}
                            </pre>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}

            {logs.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-10 text-slate-400 dark:text-slate-500">
                  {isRtl ? 'لا توجد سجلات تسليم ويب هوك.' : 'No webhook delivery logs present.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
