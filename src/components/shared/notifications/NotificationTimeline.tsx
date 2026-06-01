'use client';

import React from 'react';
import { useAlerts, useFilters, useAcknowledgeAlert, useResolveAlert, useTogglePinAlert } from '@/stores/notifications/notificationSelectors';
import { SystemAlert } from '@/stores/notifications/notificationTypes';
import { ToastActions } from './ToastActions';
import { AlertCircle, CheckCircle2, Info, Pin, Check, RotateCcw, ShieldAlert, Archive } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';

export function NotificationTimeline() {
  const alerts = useAlerts();
  const filters = useFilters();
  const acknowledgeAlert = useAcknowledgeAlert();
  const resolveAlert = useResolveAlert();
  const togglePin = useTogglePinAlert();
  const lang = useUIStore((s) => s.lang);

  const isRtl = lang === 'ar';

  const filteredAlerts = alerts.filter((a) => {
    if (filters.unreadOnly && a.read) return false;
    if (filters.severity !== 'all' && a.severity !== filters.severity) return false;
    if (filters.category !== 'all' && a.category !== filters.category) return false;
    if (filters.source !== 'all' && a.source !== filters.source) return false;
    return true;
  });

  const getSeverityTheme = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          border: 'border-l-rose-500 dark:border-l-rose-500',
          borderRtl: 'border-r-rose-500 dark:border-r-rose-500',
          bg: 'bg-rose-500/5 dark:bg-rose-950/10',
          badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
          icon: <ShieldAlert className="w-4 h-4 text-rose-500" />,
        };
      case 'warning':
        return {
          border: 'border-l-amber-500 dark:border-l-amber-500',
          borderRtl: 'border-r-amber-500 dark:border-r-amber-500',
          bg: 'bg-amber-500/5 dark:bg-amber-950/10',
          badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
          icon: <AlertCircle className="w-4 h-4 text-amber-500" />,
        };
      case 'success':
        return {
          border: 'border-l-emerald-500 dark:border-l-emerald-500',
          borderRtl: 'border-r-emerald-500 dark:border-r-emerald-500',
          bg: 'bg-emerald-500/5 dark:bg-emerald-950/10',
          badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
        };
      case 'info':
      default:
        return {
          border: 'border-l-blue-500 dark:border-l-blue-500',
          borderRtl: 'border-r-blue-500 dark:border-r-blue-500',
          bg: 'bg-blue-500/5 dark:bg-blue-950/10',
          badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
          icon: <Info className="w-4 h-4 text-blue-500" />,
        };
    }
  };

  // Group alerts by day
  const groupAlertsByDay = (items: SystemAlert[]) => {
    const groups: Record<string, SystemAlert[]> = {};
    items.forEach((a) => {
      const dateStr = a.timestamp.substring(0, 10); // "YYYY-MM-DD"
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(a);
    });
    return groups;
  };

  const dayGroups = groupAlertsByDay(filteredAlerts);
  const sortedDays = Object.keys(dayGroups).sort((a, b) => b.localeCompare(a));

  const formatDayLabel = (dateStr: string) => {
    const today = new Date().toISOString().substring(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().substring(0, 10);

    if (dateStr === today) {
      return isRtl ? 'اليوم' : 'Today';
    } else if (dateStr === yesterday) {
      return isRtl ? 'الأمس' : 'Yesterday';
    }
    return dateStr; // fallback to date format
  };

  if (filteredAlerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500 space-y-2">
        <Archive className="w-8 h-8 opacity-40" />
        <p className="text-xs font-semibold">
          {isRtl ? 'لا توجد إشعارات تطابق التصفية' : 'No matching operational alerts found'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-xs">
      {sortedDays.map((day) => (
        <div key={day} className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400 dark:text-slate-500 font-mono tracking-wider uppercase text-[10px]">
              {formatDayLabel(day)}
            </span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
          </div>

          <div className="space-y-2.5">
            {dayGroups[day].map((alert) => {
              const theme = getSeverityTheme(alert.severity);
              const borderStyle = isRtl ? theme.borderRtl : theme.border;
              const isResolved = alert.lifecycleState === 'resolved';

              return (
                <div
                  key={alert.id}
                  className={`p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 transition-all ${borderStyle} ${
                    isResolved ? 'opacity-60 bg-slate-50/50 dark:bg-slate-950/20' : theme.bg
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex gap-2 items-start min-w-0">
                      <div className="mt-0.5 shrink-0">{theme.icon}</div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h5 className={`font-bold text-slate-800 dark:text-white leading-tight ${isResolved ? 'line-through' : ''}`}>
                            {alert.title}
                          </h5>
                          {alert.count > 1 && (
                            <span className={`px-1.5 py-0.2 rounded font-mono text-[9px] font-bold ${theme.badge}`}>
                              {alert.count}x
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-slate-400 font-medium">
                          <span className="px-1 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded font-bold uppercase tracking-wider">
                            {alert.source}
                          </span>
                          <span>•</span>
                          <span className="font-mono">{alert.timestamp.substring(11, 16)}</span>
                          {alert.lifecycleState === 'muted' && (
                            <>
                              <span>•</span>
                              <span className="text-slate-400 font-bold bg-slate-100 dark:bg-slate-850 px-1 py-0.2 rounded">{isRtl ? 'مكتوم' : 'Muted'}</span>
                            </>
                          )}
                          {isResolved && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-100/50 dark:bg-emerald-950/20 px-1 py-0.2 rounded">{isRtl ? 'محلول' : 'Resolved'}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Timeline Controls */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => togglePin(alert.id)}
                        className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                          alert.pinned ? 'text-blue-500' : 'text-slate-350 dark:text-slate-650'
                        }`}
                        title={isRtl ? 'تثبيت' : 'Pin Alert'}
                      >
                        <Pin className="w-3 h-3 fill-current" />
                      </button>

                      {!isResolved && (
                        <>
                          <button
                            type="button"
                            onClick={() => acknowledgeAlert(alert.id)}
                            className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                              alert.lifecycleState === 'acknowledged' ? 'text-emerald-500' : 'text-slate-400'
                            }`}
                            title={isRtl ? 'إقرار' : 'Acknowledge'}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => resolveAlert(alert.id)}
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400"
                            title={isRtl ? 'حل المشكلة' : 'Mark Resolved'}
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 mt-2">
                    {alert.message}
                  </p>

                  {/* Render Metadata if present */}
                  {alert.metadata && Object.keys(alert.metadata).length > 0 && (
                    <div className="mt-2.5 p-2 bg-slate-100/55 dark:bg-slate-950/40 rounded-xl font-mono text-[9px] text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800/40 space-y-1">
                      {Object.entries(alert.metadata).map(([key, val]) => (
                        <div key={key} className="flex justify-between gap-4">
                          <span className="font-semibold text-slate-400 dark:text-slate-500 uppercase">{key}:</span>
                          <span className="text-right select-all font-semibold text-slate-600 dark:text-slate-300 truncate max-w-[200px]" title={String(val)}>
                            {String(val)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Operational actions */}
                  {!isResolved && (
                    <ToastActions alertId={alert.id} actions={alert.actions} isLightBg={true} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
export default NotificationTimeline;
