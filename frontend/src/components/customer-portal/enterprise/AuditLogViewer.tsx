import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { INITIAL_AUDIT_LOGS } from './constants';
import { AuditRecord } from './types';
import { AuditLogFilters } from './AuditLogFilters';
import { AuditLogDetailDrawer } from './AuditLogDetailDrawer';
import { ArrowLeft, Download, ShieldCheck, Eye, Keyboard } from 'lucide-react';

interface AuditLogViewerProps {
  onBack: () => void;
  onNavigateToExports?: () => void;
}

export function AuditLogViewer({ onBack, onNavigateToExports }: AuditLogViewerProps) {
  const { lang } = useApp();
  const [query, setQuery] = useState('');
  const [severity, setSeverity] = useState('all');
  const [selectedModule, setSelectedModule] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState<AuditRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Virtual Scroll States
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const rowHeight = 60; // Estimated height per table row
  const viewportHeight = 420; // Height of scroll container

  // Track focused row for keyboard navigation
  const [focusedRowIndex, setFocusedRowIndex] = useState(-1);

  // Memoize all unique modules in the dataset
  const modulesList = useMemo(() => {
    const set = new Set(INITIAL_AUDIT_LOGS.map((log) => log.module));
    return Array.from(set).sort();
  }, []);

  // Memoize filtered logs to avoid expensive re-renders
  const filteredLogs = useMemo(() => {
    return INITIAL_AUDIT_LOGS.filter((log) => {
      const queryMatch =
        log.action.toLowerCase().includes(query.toLowerCase()) ||
        log.actor.toLowerCase().includes(query.toLowerCase()) ||
        log.id.toLowerCase().includes(query.toLowerCase()) ||
        log.region.toLowerCase().includes(query.toLowerCase());

      const severityMatch = severity === 'all' || log.severity === severity;
      const moduleMatch = selectedModule === 'all' || log.module === selectedModule;

      return queryMatch && severityMatch && moduleMatch;
    });
  }, [query, severity, selectedModule]);

  // Virtualization slicing math
  const totalHeight = filteredLogs.length * rowHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - 2); // 2 rows buffer
  const endIndex = Math.min(filteredLogs.length, Math.ceil((scrollTop + viewportHeight) / rowHeight) + 2);

  const visibleLogs = useMemo(() => {
    return filteredLogs.slice(startIndex, endIndex).map((log, index) => ({
      log,
      actualIndex: startIndex + index,
    }));
  }, [filteredLogs, startIndex, endIndex]);

  const offsetY = startIndex * rowHeight;

  // Handle scroll events
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const handleRowClick = (record: AuditRecord) => {
    setSelectedRecord(record);
    setIsDrawerOpen(true);
  };

  // Reset filters
  const handleResetFilters = () => {
    setQuery('');
    setSeverity('all');
    setSelectedModule('all');
    setScrollTop(0);
    if (viewportRef.current) {
      viewportRef.current.scrollTop = 0;
    }
  };

  // Keyboard navigation on the virtual list container
  const handleTableKeyDown = (e: React.KeyboardEvent) => {
    if (filteredLogs.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedRowIndex((prev) => {
        const next = prev < filteredLogs.length - 1 ? prev + 1 : 0;
        // Scroll into view if virtualized
        const targetScrollTop = next * rowHeight - viewportHeight / 2;
        if (viewportRef.current) {
          viewportRef.current.scrollTop = Math.max(0, targetScrollTop);
        }
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedRowIndex((prev) => {
        const next = prev > 0 ? prev - 1 : filteredLogs.length - 1;
        // Scroll into view if virtualized
        const targetScrollTop = next * rowHeight - viewportHeight / 2;
        if (viewportRef.current) {
          viewportRef.current.scrollTop = Math.max(0, targetScrollTop);
        }
        return next;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedRowIndex >= 0 && focusedRowIndex < filteredLogs.length) {
        handleRowClick(filteredLogs[focusedRowIndex]);
      }
    }
  };

  const severityBadge = (sev: AuditRecord['severity']) => {
    const colors = {
      critical: 'bg-rose-500/10 text-rose-600 border-rose-200 dark:text-rose-400 dark:border-rose-900',
      warning: 'bg-amber-500/10 text-amber-600 border-amber-200 dark:text-amber-400 dark:border-amber-900',
      info: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-900',
    }[sev];
    return <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase font-mono ${colors}`}>{sev}</span>;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <ArrowLeft className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
          </button>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              {lang === 'ar' ? 'سجلات تدقيق الامتثال' : 'Compliance Audit Logs'}
            </h2>
            <span className="text-[10px] text-slate-450 dark:text-slate-450 font-semibold block mt-0.5">
              {lang === 'ar'
                ? 'مراجعة إجراءات الوصول إلى الحساب، التوثيق، والتغييرات الأمنية.'
                : 'Review immutable account operations, SSO authentications, and policy updates.'}
            </span>
          </div>
        </div>

        {onNavigateToExports && (
          <button
            type="button"
            onClick={onNavigateToExports}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer w-fit"
          >
            <Download className="w-4 h-4" />
            <span>{lang === 'ar' ? 'تصدير السجلات' : 'Export Center'}</span>
          </button>
        )}
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="flex items-center gap-2 text-[10px] text-slate-450 bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850">
        <Keyboard className="w-4 h-4 text-blue-500 shrink-0" />
        <span>
          {lang === 'ar'
            ? 'تلميح إمكانية الوصول: استخدم الأسهم (↑ / ↓) للتنقل في السطور، واضغط Enter لفتح التفاصيل.'
            : 'Keyboard Tip: Focus table, use arrows (↑ / ↓) to navigate log rows, and press Enter to view details.'}
        </span>
      </div>

      {/* Filters */}
      <AuditLogFilters
        query={query}
        setQuery={setQuery}
        severity={severity}
        setSeverity={setSeverity}
        selectedModule={selectedModule}
        setSelectedModule={setSelectedModule}
        modules={modulesList}
        lang={lang}
        onReset={handleResetFilters}
      />

      {/* Table Container */}
      <div
        tabIndex={0}
        onKeyDown={handleTableKeyDown}
        className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 select-none shadow-sm"
      >
        <div className="overflow-x-auto w-full">
          {/* Virtual scroll container */}
          <div
            ref={viewportRef}
            onScroll={handleScroll}
            style={{ height: viewportHeight, overflowY: 'auto', position: 'relative' }}
          >
            <table className="w-full text-left border-collapse" style={{ minWidth: 720 }}>
              {/* Sticky Header */}
              <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[10px] font-extrabold uppercase text-slate-400 font-mono tracking-wider">
                <tr>
                  <th className="p-3 w-32">{lang === 'ar' ? 'المعرف' : 'Log ID'}</th>
                  <th className="p-3 w-40">{lang === 'ar' ? 'الوقت' : 'Timestamp'}</th>
                  <th className="p-3 w-28">{lang === 'ar' ? 'الوحدة' : 'Module'}</th>
                  <th className="p-3">{lang === 'ar' ? 'الإجراء' : 'Action'}</th>
                  <th className="p-3 w-28">{lang === 'ar' ? 'المنفذ' : 'Actor'}</th>
                  <th className="p-3 w-20 text-center">{lang === 'ar' ? 'الخطورة' : 'Severity'}</th>
                  <th className="p-3 w-16 text-center">{lang === 'ar' ? 'تفاصيل' : 'View'}</th>
                </tr>
              </thead>

              {/* Body containing offset spacer and visible elements */}
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-slate-450 dark:text-slate-400 font-medium">
                      {lang === 'ar' ? 'لا توجد سجلات تدقيق تطابق التصفية.' : 'No audit records match the current filters.'}
                    </td>
                  </tr>
                ) : (
                  <>
                    {/* Top spacing element */}
                    {offsetY > 0 && (
                      <tr>
                        <td colSpan={7} style={{ height: offsetY, padding: 0 }} />
                      </tr>
                    )}

                    {/* Active rows */}
                    {visibleLogs.map(({ log, actualIndex }) => {
                      const isFocused = actualIndex === focusedRowIndex;
                      return (
                        <tr
                          key={log.id}
                          onClick={() => handleRowClick(log)}
                          onMouseEnter={() => setFocusedRowIndex(actualIndex)}
                          className={`group text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 text-[11px] transition-all cursor-pointer font-medium ${
                            isFocused
                              ? 'bg-slate-100/70 dark:bg-slate-800/60 font-bold ring-2 ring-inset ring-blue-500/40'
                              : ''
                          }`}
                          style={{ height: rowHeight }}
                        >
                          <td className="p-3 font-mono font-bold text-slate-450 dark:text-slate-400">{log.id}</td>
                          <td className="p-3 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} •{' '}
                            {new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: '2-digit' })}
                          </td>
                          <td className="p-3">
                            <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono">
                              {log.module}
                            </span>
                          </td>
                          <td className="p-3 truncate max-w-xs font-semibold text-slate-900 dark:text-white" title={log.action}>
                            {log.action}
                          </td>
                          <td className="p-3 truncate max-w-[120px] font-mono text-[10px]" title={log.actor}>
                            {log.actor.split('@')[0]}
                          </td>
                          <td className="p-3 text-center shrink-0">{severityBadge(log.severity)}</td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRowClick(log);
                              }}
                              className="p-1 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-blue-500 hover:text-blue-600 dark:text-blue-400 rounded-lg transition-all"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {/* Bottom spacing element */}
                    {totalHeight - offsetY - visibleLogs.length * rowHeight > 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          style={{
                            height: totalHeight - offsetY - visibleLogs.length * rowHeight,
                            padding: 0,
                          }}
                        />
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Drawer */}
      <AuditLogDetailDrawer
        record={selectedRecord}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedRecord(null);
        }}
        lang={lang}
      />
    </div>
  );
}
