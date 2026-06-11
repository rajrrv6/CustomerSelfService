'use client';

import React, { useState } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';
import { mockExceptions } from './mockSystemOperationsData';
import { SystemException, ExceptionSeverity } from '@/types/systemOperations';
import { SystemOpsStatusBadge } from './SystemOpsStatusBadge';
import { useFeedbackToasts } from '@/components/customer-portal/feedback/PostChatToasts';
import { Search, AlertCircle, AlertTriangle, ShieldCheck, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { OperationalCard } from '@/components/shared/OperationalCard';

export function ErrorMonitoringTab() {
  const lang = useUIStore((s) => s.lang);
  const isRtl = lang === 'ar';
  const { addAuditLog } = useApp();
  const { pushToast } = useFeedbackToasts();
  const t = translations[lang];

  const sysOpsT = (t.superAdmin as any).systemOps || {
    errors: {
      searchPlaceholder: 'Search exceptions or trace logs...',
      tableHeaders: ['Exception Type', 'Affected Service', 'Message', 'Severity', 'Timestamp', 'Status'],
      emptyTitle: 'No Exceptions Found',
      emptyDesc: 'Clean system run. No recent runtime anomalies reported.',
      resolveSuccess: 'Exception resolved and marked in security timeline.'
    }
  };

  const [exceptions, setExceptions] = useState<SystemException[]>(mockExceptions);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [expandedErrorId, setExpandedErrorId] = useState<string | null>(null);

  // Stats calculation
  const totalErrors = exceptions.length;
  const activeErrors = exceptions.filter(e => e.status === 'active').length;
  const criticalErrors = exceptions.filter(e => e.severity === 'critical' && e.status === 'active').length;

  const handleResolveException = (error: SystemException, e: React.MouseEvent) => {
    e.stopPropagation();
    setExceptions(prev => prev.map(ex => 
      ex.id === error.id ? { ...ex, status: 'resolved' } : ex
    ));
    pushToast(
      'success',
      isRtl ? 'تم حل الاستثناء' : 'Exception Resolved',
      isRtl ? `تمت معالجة وحل الاستثناء "${error.exceptionType}".` : `Marked exception trace "${error.exceptionType}" as resolved.`
    );
    addAuditLog(`Marked exception resolved: ${error.exceptionType} (ID: ${error.id})`, 'success');
  };

  const toggleExpandRow = (id: string) => {
    if (expandedErrorId === id) {
      setExpandedErrorId(null);
    } else {
      setExpandedErrorId(id);
    }
  };

  // Filters logic
  const filteredExceptions = exceptions.filter(ex => {
    const matchesSearch = 
      ex.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.exceptionType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.serviceName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = severityFilter === 'all' || ex.severity === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-6">
      {/* Stats summary grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <OperationalCard hoverEffect={false} className="border-l-4 border-l-slate-400">
          <div>
            <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider font-mono">
              {isRtl ? 'إجمالي الاستثناءات المسجلة' : 'Total Exceptions'}
            </span>
            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">{totalErrors}</h3>
          </div>
        </OperationalCard>

        <OperationalCard hoverEffect={false} className="border-l-4 border-l-amber-500">
          <div>
            <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider font-mono">
              {isRtl ? 'الاستثناءات النشطة' : 'Active Traces'}
            </span>
            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">{activeErrors}</h3>
          </div>
        </OperationalCard>

        <OperationalCard hoverEffect={false} className="border-l-4 border-l-red-500">
          <div>
            <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider font-mono">
              {isRtl ? 'المشكلات الحرجة النشطة' : 'Critical Active'}
            </span>
            <h3 className="text-2xl font-extrabold text-red-650 dark:text-red-400 mt-1">{criticalErrors}</h3>
          </div>
        </OperationalCard>
      </div>

      {/* Filter panel */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={sysOpsT.errors.searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl text-slate-650 dark:text-slate-350 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full md:w-48 cursor-pointer shrink-0"
        >
          <option value="all">{isRtl ? 'جميع درجات الخطورة' : 'All Severities'}</option>
          <option value="critical">{isRtl ? 'حرج' : 'Critical'}</option>
          <option value="high">{isRtl ? 'عالي' : 'High'}</option>
          <option value="medium">{isRtl ? 'متوسط' : 'Medium'}</option>
          <option value="low">{isRtl ? 'منخفض' : 'Low'}</option>
        </select>
      </div>

      {/* Exceptions list */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
                <th className="w-6 px-3"></th>
                {sysOpsT.errors.tableHeaders.map((header: string, idx: number) => (
                  <th
                    key={idx}
                    className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-start font-mono"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredExceptions.length > 0 ? (
                filteredExceptions.map((ex) => {
                  const isExpanded = expandedErrorId === ex.id;
                  return (
                    <React.Fragment key={ex.id}>
                      <tr
                        onClick={() => toggleExpandRow(ex.id)}
                        className="border-b border-slate-100/70 dark:border-slate-800/40 hover:bg-slate-50/40 dark:hover:bg-slate-800/20 cursor-pointer transition-colors"
                      >
                        <td className="px-3 text-center">
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800 dark:text-white font-mono">
                              {ex.exceptionType}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                              ID: {ex.id}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-700 dark:text-slate-350">
                          {ex.serviceName}
                        </td>
                        <td className="px-5 py-4 text-xs font-medium text-slate-600 dark:text-slate-400 max-w-[200px] truncate" title={ex.message}>
                          {ex.message}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <SystemOpsStatusBadge status={ex.severity} />
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-xs font-mono text-slate-500 dark:text-slate-400">
                          {ex.timestamp}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <SystemOpsStatusBadge status={ex.status} />
                        </td>
                      </tr>

                      {/* Expanded Details Card Row */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={8} className="px-6 py-4 bg-slate-50/40 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800/60">
                            <div className="space-y-4 max-w-2xl text-xs leading-relaxed">
                              <div>
                                <h5 className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 font-mono">
                                  {isRtl ? 'رسالة الخطأ التفصيلية' : 'Detailed Exception Trace message'}
                                </h5>
                                <p className="text-slate-800 dark:text-slate-200 mt-1 font-semibold">
                                  {ex.message}
                                </p>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h6 className="text-[9px] font-bold uppercase text-slate-400 font-mono">{isRtl ? 'الخدمة المعزولة' : 'Serving Node'}</h6>
                                  <p className="text-slate-755 dark:text-slate-300 font-mono mt-0.5">{ex.serviceName}</p>
                                </div>
                                <div>
                                  <h6 className="text-[9px] font-bold uppercase text-slate-400 font-mono">{isRtl ? 'توقيت الحدث' : 'Timestamp'}</h6>
                                  <p className="text-slate-755 dark:text-slate-300 font-mono mt-0.5">{ex.timestamp}</p>
                                </div>
                              </div>

                              <div className="bg-slate-100 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800 font-mono text-[9px] text-slate-600 dark:text-slate-400 leading-normal">
                                <div className="text-blue-500 dark:text-blue-400 font-bold mb-1">// STACK TRACE CONTEXT (SIMULATED)</div>
                                at {ex.exceptionType}: line 184 in controller.ts<br />
                                at invokeMethod (executor.js:29:12)<br />
                                at routingPipeline (router.ts:401:14)<br />
                                at platformEntry (server.ts:42:19)
                              </div>

                              {ex.status === 'active' && (
                                <div className="flex justify-end pt-1">
                                  <button
                                    onClick={(e) => handleResolveException(ex, e)}
                                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4.5 py-2 rounded-xl transition-colors cursor-pointer"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    <span>{isRtl ? 'تعليم الاستثناء كمحلول' : 'Resolve Diagnostics Exception'}</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center">
                    <div className="max-w-md mx-auto flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-900 text-slate-400 flex items-center justify-center mb-3">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                        {sysOpsT.errors.emptyTitle}
                      </h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        {sysOpsT.errors.emptyDesc}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
