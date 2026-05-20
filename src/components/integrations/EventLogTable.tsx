import React, { useState } from 'react';
import { WebhookDeliveryLog } from '@/data/seed/webhookEventsSeed';
import { CheckCircle, AlertTriangle, Play, ChevronDown, ChevronUp, Clock, FileJson, RefreshCw } from 'lucide-react';

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
    <div className="border border-slate-850 bg-slate-950/20 rounded-2xl overflow-hidden text-xs font-semibold text-slate-350">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-850 text-slate-500 font-bold bg-slate-900/10">
              <th className="p-4 w-8"></th>
              <th className="p-4">{isRtl ? 'الحدث' : 'Event Type'}</th>
              <th className="p-4">{isRtl ? 'الرابط المتلقي' : 'Endpoint Receiver URL'}</th>
              <th className="p-4">{isRtl ? 'الحالة' : 'HTTP Status'}</th>
              <th className="p-4">{isRtl ? 'الاستجابة' : 'Latency'}</th>
              <th className="p-4">{isRtl ? 'الوقت' : 'Timestamp'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850 text-slate-400">
            {logs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              const is200 = log.statusCode === 200;
              const isPending = log.statusCode === 0;
              const is5xx = log.statusCode >= 500 || log.statusCode === 504;

              return (
                <React.Fragment key={log.id}>
                  {/* Row Summary */}
                  <tr 
                    onClick={() => toggleExpand(log.id)}
                    className="hover:bg-slate-900/15 cursor-pointer transition-colors"
                  >
                    <td className="p-4 text-center">
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-white text-[10.5px] font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {log.eventType}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-[10px] text-slate-500 truncate max-w-[200px]" title={log.endpointUrl}>
                      {log.endpointUrl}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold ${
                        is200 
                          ? 'text-emerald-450' 
                          : isPending 
                          ? 'text-blue-450 animate-pulse' 
                          : 'text-rose-450'
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
                    <td className="p-4 font-mono text-[10.5px]">
                      {isPending ? '---' : `${log.latencyMs}ms`}
                    </td>
                    <td className="p-4 font-mono text-[10px] text-slate-500">
                      {log.timestamp}
                    </td>
                  </tr>

                  {/* Expandable JSON Inspector */}
                  {isExpanded && (
                    <tr className="bg-slate-950/40 border-slate-850">
                      <td colSpan={6} className="p-5 border-t border-slate-850">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {/* Request Payload JSON */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                              <span className="flex items-center gap-1.5">
                                <FileJson className="w-3.5 h-3.5 text-blue-400" />
                                {isRtl ? 'حمولة الطلب الصادر (Payload JSON)' : 'Request Payload (JSON)'}
                              </span>
                            </div>
                            <pre className="p-3.5 bg-slate-950 border border-slate-850 rounded-2xl text-slate-300 font-mono text-[9px] leading-relaxed overflow-x-auto select-all max-h-56">
                              {log.payload}
                            </pre>
                          </div>

                          {/* Response Payload */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-blue-400" />
                                {isRtl ? 'استجابة الخادم المتلقي (Response Body)' : 'Listener Server Response Body'}
                              </span>
                              {onRetryLog && !isPending && !is200 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRetryLog(log.eventType, log.endpointUrl);
                                  }}
                                  className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-350 hover:text-white rounded-lg flex items-center gap-1 text-[9px] transition-all hover:border-slate-700"
                                >
                                  <RefreshCw className="w-3 h-3" />
                                  {isRtl ? 'إعادة الإرسال' : 'Re-send'}
                                </button>
                              )}
                            </div>
                            <pre className={`p-3.5 bg-slate-950 border border-slate-850 rounded-2xl font-mono text-[9.5px] leading-relaxed overflow-x-auto max-h-56 ${
                              is200 ? 'text-slate-400' : 'text-rose-450'
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
                <td colSpan={6} className="text-center py-10 text-slate-500">
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
