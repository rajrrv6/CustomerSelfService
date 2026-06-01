'use client';

import React, { useEffect, useState } from 'react';
import {
  useAlerts,
  useMutedAlertCodes,
  useMuteAlertCode,
  useUnmuteAlertCode,
  useMuteAllAlertCodes,
  useAuditLogs,
  useClearResolvedAlerts,
  useAcknowledgeAll
} from '@/stores/notifications/notificationSelectors';
import { Activity, X, Shield, VolumeX, Volume2, Search, Trash2, CheckCircle2, AlertTriangle, Info, Clock, User, HardDrive } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const alerts = useAlerts();
  const mutedCodes = useMutedAlertCodes();
  const muteCode = useMuteAlertCode();
  const unmuteCode = useUnmuteAlertCode();
  const muteAll = useMuteAllAlertCodes();
  const auditLogs = useAuditLogs();
  const clearResolved = useClearResolvedAlerts();
  const acknowledgeAll = useAcknowledgeAll();
  
  const lang = useUIStore((s) => s.lang);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'alerts' | 'audit'>('alerts');

  const isRtl = lang === 'ar';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Static list of known operational alert codes in the system
  const knownAlertCodes = [
    { code: 'SLA_BREACH', label: 'SLA Breaches', category: 'sla' },
    { code: 'WEBHOOK_LATENCY', label: 'Webhook Latencies', category: 'webhook' },
    { code: 'NLU_CONFIDENCE_DROP', label: 'NLU Model Confidence', category: 'ai' },
    { code: 'VECTOR_COMPACT_FAIL', label: 'Vector DB Index Fails', category: 'sync' },
    { code: 'STAFFING_SHORTAGE', label: 'Staffing Shortages', category: 'routing' },
    { code: 'PII_MASKED', label: 'PII Data Masking Scans', category: 'compliance' },
    { code: 'QUEUE_OVERFLOW', label: 'Queue Volume Spikes', category: 'routing' },
    { code: 'API_TIMEOUT_ERROR', label: 'API Gateway Timeouts', category: 'operations' },
    { code: 'SYNC_COMPLETE', label: 'Confluence Sync Completes', category: 'sync' },
    { code: 'PROVIDER_OUTAGE', label: 'Omnichannel Provider Drops', category: 'operations' },
    { code: 'ESCALATION_SPIKE', label: 'VIP Escalation Overloads', category: 'escalation' },
    { code: 'HALLUCINATION_RISK', label: 'AI Hallucination Risk', category: 'ai' },
    { code: 'GRAPH_VALIDATION_ERROR', label: 'Dialog Graph Failures', category: 'operations' },
    { code: 'INTENT_PUBLISH_SUCCESS', label: 'Model Deploy Complete', category: 'ai' },
  ];

  // Filtering alerts
  const filteredAlerts = alerts.filter((a) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      a.message.toLowerCase().includes(q) ||
      a.alertCode.toLowerCase().includes(q) ||
      a.source.toLowerCase().includes(q)
    );
  });

  // Filtering audit logs
  const filteredAuditLogs = auditLogs.filter((log) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.user.toLowerCase().includes(q) ||
      log.role.toLowerCase().includes(q) ||
      log.ipAddress.includes(q)
    );
  });

  const criticalCount = alerts.filter((a) => a.severity === 'critical' && a.lifecycleState !== 'resolved').length;
  const warningCount = alerts.filter((a) => a.severity === 'warning' && a.lifecycleState !== 'resolved').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Console Frame */}
      <div
        className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-6.5xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-xs z-10"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white leading-tight">
                {isRtl ? 'وحدة التحكم والمراقبة والتدقيق' : 'Enterprise SIEM & Audit Console'}
              </h2>
              <p className="text-[10px] text-slate-400 font-semibold font-mono tracking-wider uppercase mt-0.5">
                {isRtl ? 'المراقبة الفورية للأحداث والتدقيق الأمني' : 'Real-time Operations telemetry & audit trails'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick status badges */}
            <div className="hidden md:flex items-center gap-2">
              {criticalCount > 0 && (
                <span className="px-2 py-1 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 font-bold font-mono text-[9px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  {criticalCount} {isRtl ? 'حرج' : 'Critical'}
                </span>
              )}
              {warningCount > 0 && (
                <span className="px-2 py-1 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold font-mono text-[9px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {warningCount} {isRtl ? 'تحذير' : 'Warnings'}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Close console"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Console Workspace Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          
          {/* Left Panel: Alert Muting Settings */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col overflow-y-auto p-4 shrink-0">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <VolumeX className="w-3.5 h-3.5 text-blue-500" />
                {isRtl ? 'إعدادات كتم التنبيهات' : 'Toast Suppressions'}
              </span>
              <button
                type="button"
                onClick={muteAll}
                className="text-[9px] text-blue-500 hover:text-blue-600 font-semibold"
              >
                {isRtl ? 'كتم الكل' : 'Mute All'}
              </button>
            </div>
            
            <p className="text-[10px] leading-relaxed text-slate-450 dark:text-slate-550 mb-3.5">
              {isRtl
                ? 'كتم تنبيه معين يمنع ظهور البطاقات المنبثقة (Toasts) على الشاشة، ولكنه يستمر في تسجيل التنبيه داخل الجدول والجدول الزمني.'
                : 'Muting an alert code suppresses screen toast popups for that category, while logging details in background telemetry.'}
            </p>

            <div className="space-y-2">
              {knownAlertCodes.map((item) => {
                const isMuted = mutedCodes.includes(item.code);
                return (
                  <div
                    key={item.code}
                    className="flex justify-between items-center p-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="font-bold text-slate-700 dark:text-slate-300 block truncate" title={item.code}>
                        {item.label}
                      </span>
                      <span className="font-mono text-[8px] text-slate-400 uppercase tracking-wide">
                        {item.code}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => (isMuted ? unmuteCode(item.code) : muteCode(item.code))}
                      className={`p-1.5 rounded-lg border transition-all active:scale-95 shrink-0 ${
                        isMuted
                          ? 'border-rose-200 dark:border-rose-900 text-rose-500 bg-rose-50 dark:bg-rose-950/20'
                          : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                      }`}
                      title={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Area: Search, Tabs & Content Panels */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search and Tabs control bar */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col sm:flex-row gap-3 justify-between items-center">
              {/* Tab Selector */}
              <div className="flex bg-slate-200/60 dark:bg-slate-800 rounded-xl p-0.5 shrink-0 border border-slate-350/10">
                <button
                  type="button"
                  onClick={() => setActiveTab('alerts')}
                  className={`px-4 py-1.5 rounded-lg font-bold transition-all text-xs ${
                    activeTab === 'alerts'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {isRtl ? 'الأحداث والتلكمتري' : 'Operational Telemetry'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('audit')}
                  className={`px-4 py-1.5 rounded-lg font-bold transition-all text-xs ${
                    activeTab === 'audit'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {isRtl ? 'سجل التدقيق الأمني' : 'SIEM Security Logs'}
                </button>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-72">
                <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? 'right-3' : 'left-3'}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    activeTab === 'alerts'
                      ? (isRtl ? 'بحث في التنبيهات والأكواد...' : 'Search alerts, codes...')
                      : (isRtl ? 'بحث في سجل التدقيق والمستخدمين...' : 'Search audit records...')
                  }
                  className={`w-full py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs ${
                    isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'
                  }`}
                />
              </div>
            </div>

            {/* Content Tab Panels */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              
              {activeTab === 'alerts' ? (
                /* Alerts View */
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-750 dark:text-slate-200">
                      {isRtl
                        ? `عرض ${filteredAlerts.length} حدث تشغيلي مسجل`
                        : `Viewing ${filteredAlerts.length} logged events`}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={acknowledgeAll}
                        className="px-2.5 py-1.5 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg transition-colors border border-slate-200 dark:border-slate-850"
                      >
                        {isRtl ? 'إقرار بالجميع' : 'Acknowledge All'}
                      </button>
                      <button
                        type="button"
                        onClick={clearResolved}
                        className="flex items-center gap-1 px-2.5 py-1.5 font-bold text-rose-500 hover:bg-rose-500/5 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {isRtl ? 'مسح المحلول' : 'Clear Resolved'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {filteredAlerts.map((alert) => {
                      const isCritical = alert.severity === 'critical';
                      const isWarning = alert.severity === 'warning';
                      const isSuccess = alert.severity === 'success';

                      return (
                        <div
                          key={alert.id}
                          className={`p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-3 ${
                            alert.lifecycleState === 'resolved' ? 'opacity-55' : ''
                          }`}
                        >
                          <div className="flex gap-3 items-start min-w-0">
                            <div className="mt-0.5 shrink-0">
                              {isCritical ? (
                                <AlertTriangle className="w-5 h-5 text-rose-500" />
                              ) : isWarning ? (
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                              ) : isSuccess ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                              ) : (
                                <Info className="w-5 h-5 text-blue-500" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-slate-800 dark:text-white leading-tight">
                                  {alert.title}
                                </h4>
                                {alert.count > 1 && (
                                  <span className="px-1.5 py-0.2 bg-slate-100 dark:bg-slate-850 text-slate-500 dark:text-slate-400 rounded font-mono text-[9px] font-bold">
                                    {alert.count} occurrences
                                  </span>
                                )}
                                <span className={`px-1.5 py-0.2 rounded font-mono text-[8px] font-bold uppercase tracking-wider ${
                                  isCritical
                                    ? 'bg-rose-500/10 text-rose-500'
                                    : isWarning
                                    ? 'bg-amber-500/10 text-amber-500'
                                    : isSuccess
                                    ? 'bg-emerald-500/10 text-emerald-500'
                                    : 'bg-blue-500/10 text-blue-500'
                                }`}>
                                  {alert.severity}
                                </span>
                              </div>

                              <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 mt-1">
                                {alert.message}
                              </p>

                              {/* Metadata chips */}
                              {alert.metadata && Object.keys(alert.metadata).length > 0 && (
                                <div className="flex gap-2 flex-wrap mt-2">
                                  {Object.entries(alert.metadata).map(([key, val]) => (
                                    <span
                                      key={key}
                                      className="px-1.5 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850/50 font-mono text-[8px] text-slate-400 dark:text-slate-500"
                                    >
                                      <strong className="uppercase">{key}:</strong> {String(val)}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Controls / Timing */}
                          <div className="flex sm:flex-col items-end gap-2 shrink-0 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium font-mono">
                              <Clock className="w-3 h-3" />
                              <span>{alert.timestamp}</span>
                            </div>
                            <span className="px-1.5 py-0.2 bg-slate-100 dark:bg-slate-850 text-slate-500 rounded text-[9px] font-bold uppercase tracking-wider">
                              {alert.source}
                            </span>
                            <div className="flex items-center gap-1.5 text-[10px]">
                              <span className="font-semibold text-slate-400 uppercase">{isRtl ? 'الحالة:' : 'State:'}</span>
                              <span className={`font-bold capitalize font-mono ${
                                alert.lifecycleState === 'active'
                                  ? 'text-blue-500'
                                  : alert.lifecycleState === 'acknowledged'
                                  ? 'text-amber-500'
                                  : alert.lifecycleState === 'resolved'
                                  ? 'text-emerald-500'
                                  : 'text-slate-400'
                              }`}>
                                {alert.lifecycleState}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Security Audit Log View */
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-750 dark:text-slate-200">
                      {isRtl
                        ? `عرض ${filteredAuditLogs.length} سجل تدقيق أمني`
                        : `Viewing ${filteredAuditLogs.length} security audit records`}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold font-mono flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-emerald-500" />
                      {isRtl ? 'سجلات تدقيق مشفرة ومحمية من التلاعب' : 'Immutable tamper-proof logs'}
                    </span>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse" dir="ltr">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 font-bold border-b border-slate-200 dark:border-slate-850">
                            <th className="p-3 text-[10px] uppercase font-mono">{isRtl ? 'المستخدم' : 'User'}</th>
                            <th className="p-3 text-[10px] uppercase font-mono">{isRtl ? 'الدور' : 'Role'}</th>
                            <th className="p-3 text-[10px] uppercase font-mono">{isRtl ? 'العملية' : 'Action'}</th>
                            <th className="p-3 text-[10px] uppercase font-mono">IP Address</th>
                            <th className="p-3 text-[10px] uppercase font-mono">{isRtl ? 'الزمن' : 'Timestamp'}</th>
                            <th className="p-3 text-[10px] uppercase font-mono">{isRtl ? 'الحالة' : 'Status'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                          {filteredAuditLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 text-[11px] font-semibold text-slate-650 dark:text-slate-350">
                              <td className="p-3 truncate max-w-[140px] font-mono text-slate-800 dark:text-white" title={log.user}>
                                <div className="flex items-center gap-1.5">
                                  <User className="w-3 h-3 text-slate-450 shrink-0" />
                                  <span>{log.user}</span>
                                </div>
                              </td>
                              <td className="p-3">
                                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400 rounded text-[9px] font-bold font-mono">
                                  {log.role}
                                </span>
                              </td>
                              <td className="p-3 leading-normal max-w-sm break-words select-text">
                                {log.action}
                              </td>
                              <td className="p-3 font-mono text-[10px] text-slate-450">
                                <div className="flex items-center gap-1">
                                  <HardDrive className="w-3 h-3 text-slate-400" />
                                  <span>{log.ipAddress}</span>
                                </div>
                              </td>
                              <td className="p-3 font-mono text-[10px] text-slate-450 whitespace-nowrap">
                                {log.timestamp}
                              </td>
                              <td className="p-3">
                                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold font-mono ${
                                  log.status === 'success' ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'
                                }`}>
                                  {log.status.toUpperCase()}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 text-center text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-widest text-[9px] flex items-center justify-between">
          <span>{isRtl ? 'النظام مسجل بالكامل في خط تدقيق SIEM' : 'Telemetry and Audit pipeline secured with cryptographic chain'}</span>
          <span>SYSTEM UP-TIME: 100%</span>
        </div>
      </div>
    </div>
  );
}
export default NotificationCenter;
