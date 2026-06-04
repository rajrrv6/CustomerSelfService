'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useAlerts, useAuditLogs, useAcknowledgeAlert } from '@/stores/notifications/notificationSelectors';
import { useClientAdminStore } from '@/stores/clientAdminPersistenceStore';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Info,
  ShieldAlert,
  Brain,
  Layers,
  GitBranch,
  Globe,
  ShieldCheck,
  User,
  ArrowRight,
  Filter
} from 'lucide-react';
import { translations } from '@/i18n/translations';

interface OperationalActivityFeedProps {
  filterScope?: 'all' | 'bots' | 'knowledge' | 'analytics' | 'channels' | 'guardrails';
  compact?: boolean;
  limit?: number;
}

export function OperationalActivityFeed({
  filterScope = 'all',
  compact = false,
  limit = 8
}: OperationalActivityFeedProps) {
  const alerts = useAlerts();
  const baseAuditLogs = useAuditLogs();
  
  // Read persistent audit logs from clientAdmin store
  const persistentAuditLogs = useClientAdminStore((state) => state.auditLogs);
  const addAuditLog = useClientAdminStore((state) => state.addAuditLog);
  const lang = useClientAdminStore((state) => state.settings.defaultLang);
  
  const acknowledgeAlert = useAcknowledgeAlert();
  const isRtl = lang === 'ar';
  const t = translations[lang];

  // Rolling background log simulation loop
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const interval = setInterval(() => {
      // 30% chance to inject a mock audit log to keep the feed dynamically updated
      if (Math.random() > 0.7) {
        const categories: Array<'security' | 'api' | 'ai' | 'user'> = ['security', 'api', 'ai', 'user'];
        const chosenCategory = categories[Math.floor(Math.random() * categories.length)];

        let action = '';
        let actionAr = '';
        let severity: 'info' | 'warning' | 'critical' = 'info';

        switch (chosenCategory) {
          case 'security':
            action = 'PII Masking Filter triggered: customer email redacted from webhook payload';
            actionAr = 'تفعيل فلتر إخفاء الهوية PII: تم حجب البريد الإلكتروني للعميل من بيانات الويب';
            severity = 'info';
            break;
          case 'api':
            action = 'REST Webhook transaction response synchronized: CRM gateway response at 240ms';
            actionAr = 'مزامنة زمن استجابة الـ Webhook: استجابة بوابة CRM عند ٢٤٠ مللي ثانية';
            severity = 'info';
            break;
          case 'ai':
            action = 'RAG precision scoring index compiled: semantic similarity search stable at 98.2%';
            actionAr = 'تجميع مؤشر دقة RAG: تطابق البحث الدلالي مستقر عند ٩٨.٢٪';
            severity = 'info';
            break;
          case 'user':
            action = 'Telemetry parameters updated by administrative client supervisor';
            actionAr = 'تحديث خيارات جدولة الحملة بواسطة مشرف العميل';
            severity = 'info';
            break;
        }

        addAuditLog({
          id: `log-sim-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          category: chosenCategory,
          action,
          actionAr,
          actor: 'system.telemetry@mpaas.sa',
          ip: '10.0.8.22',
          severity,
          payload: { simulated: true }
        });
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [addAuditLog]);

  // Severity filtering local state
  const [severityFilter, setSeverityFilter] = useState<'all' | 'info' | 'warning' | 'critical' | 'success'>('all');

  const classifyAuditCategory = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('bot') || act.includes('persona')) return 'bots';
    if (act.includes('intent') || act.includes('utterance') || act.includes('discovered')) return 'bots';
    if (act.includes('knowledge') || act.includes('ingest') || act.includes('file') || act.includes('db') || act.includes('connector')) return 'knowledge';
    if (act.includes('channel') || act.includes('webhook') || act.includes('whatsapp') || act.includes('widget') || act.includes('ivr')) return 'channels';
    if (act.includes('guardrail') || act.includes('pii') || act.includes('redact') || act.includes('toxicity')) return 'guardrails';
    if (act.includes('sla') || act.includes('analytics') || act.includes('wait')) return 'analytics';
    return 'general';
  };

  // Combine and normalize Alerts, base Audit Logs and persistent Audit Logs
  const timelineItems = useMemo(() => {
    const items: Array<{
      id: string;
      timestamp: string;
      sourceType: 'alert' | 'audit';
      category: string;
      severity: 'info' | 'warning' | 'critical' | 'success';
      title: string;
      message: string;
      user?: string;
      actions?: any[];
    }> = [];

    // 1. Add Alerts
    alerts.forEach((alert) => {
      let mappedScope = 'general';
      if (alert.category === 'sla' || alert.category === 'analytics') mappedScope = 'analytics';
      else if (alert.category === 'webhook' || alert.category === 'routing') mappedScope = 'channels';
      else if (alert.category === 'ai') mappedScope = 'bots';
      else if (alert.category === 'sync') mappedScope = 'knowledge';
      else if (alert.category === 'compliance') mappedScope = 'guardrails';

      items.push({
        id: alert.id,
        timestamp: alert.lastOccurred || alert.timestamp,
        sourceType: 'alert',
        category: mappedScope,
        severity: alert.severity as any,
        title: alert.title,
        message: alert.message,
        actions: alert.actions
      });
    });

    // 2. Add Base Audit Logs
    baseAuditLogs.forEach((log) => {
      const category = classifyAuditCategory(log.action);
      items.push({
        id: log.id,
        timestamp: log.timestamp,
        sourceType: 'audit',
        category,
        severity: log.status === 'failed' ? 'warning' : 'success',
        title: log.role === 'CLIENT ADMIN' ? (isRtl ? 'إجراء المشرف' : 'Admin Action Logged') : (isRtl ? 'نشاط النظام' : 'System Roster Log'),
        message: log.action,
        user: log.user
      });
    });

    // 3. Add Persistent Audit Logs
    persistentAuditLogs.forEach((log) => {
      const category = classifyAuditCategory(log.action);
      items.push({
        id: log.id,
        timestamp: log.timestamp,
        sourceType: 'audit',
        category,
        severity: log.severity as any,
        title: isRtl ? 'إشعار تدقيق أمني' : 'Audit Event Logged',
        message: isRtl ? log.actionAr : log.action,
        user: log.actor,
      });
    });

    // Sort by timestamp descending
    return items.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [alerts, baseAuditLogs, persistentAuditLogs, isRtl]);

  // Filters timeline items based on scope and severity
  const filteredItems = useMemo(() => {
    return timelineItems
      .filter((item) => {
        const matchScope = filterScope === 'all' || item.category === filterScope;
        const matchSeverity = severityFilter === 'all' || item.severity === severityFilter;
        return matchScope && matchSeverity;
      })
      .slice(0, limit);
  }, [timelineItems, filterScope, severityFilter, limit]);

  const getSeverityIcon = (item: typeof timelineItems[0]) => {
    if (item.sourceType === 'audit') {
      if (item.category === 'knowledge') return <Brain className="w-3.5 h-3.5 text-blue-500" />;
      if (item.category === 'bots') return <Layers className="w-3.5 h-3.5 text-indigo-500" />;
      if (item.category === 'channels') return <Globe className="w-3.5 h-3.5 text-emerald-500" />;
      if (item.category === 'guardrails') return <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />;
      return <User className="w-3.5 h-3.5 text-slate-400" />;
    }

    switch (item.severity) {
      case 'critical':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />;
      case 'warning':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />;
      case 'success':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
      case 'info':
      default:
        return <Info className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  const getSeverityBg = (item: typeof timelineItems[0]) => {
    if (item.sourceType === 'audit') return 'bg-slate-50 dark:bg-slate-900 border-slate-205 dark:border-slate-850';
    switch (item.severity) {
      case 'critical':
        return 'bg-rose-500/10 dark:bg-rose-950/20 border-rose-500/20';
      case 'warning':
        return 'bg-amber-500/10 dark:bg-amber-950/20 border-amber-500/20';
      case 'success':
        return 'bg-emerald-500/10 dark:bg-emerald-950/20 border-emerald-500/20';
      case 'info':
      default:
        return 'bg-blue-500/10 dark:bg-blue-950/20 border-blue-500/20';
    }
  };

  const handleActionClick = (alertId: string, act: any) => {
    if (act.actionType === 'navigate') {
      const screenId = act.payload?.screenId;
      if (screenId) {
        window.dispatchEvent(
          new CustomEvent('navigate-to-screen', { detail: { screenId } })
        );
      }
      acknowledgeAlert(alertId);
    } else if (act.actionType === 'retry') {
      acknowledgeAlert(alertId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Mini severity filter tabs inside activities feed */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-[9px] font-extrabold w-fit">
        <Filter className="w-3 h-3 text-slate-400 mx-1 shrink-0" />
        <button
          onClick={() => setSeverityFilter('all')}
          className={`px-2 py-1 rounded-lg transition-all uppercase ${
            severityFilter === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-250'
          }`}
        >
          {isRtl ? 'الكل' : 'All'}
        </button>
        <button
          onClick={() => setSeverityFilter('critical')}
          className={`px-2 py-1 rounded-lg transition-all uppercase ${
            severityFilter === 'critical' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-500 dark:text-slate-450 hover:text-red-500'
          }`}
        >
          {isRtl ? 'حرج' : 'Critical'}
        </button>
        <button
          onClick={() => setSeverityFilter('warning')}
          className={`px-2 py-1 rounded-lg transition-all uppercase ${
            severityFilter === 'warning' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-500 dark:text-slate-450 hover:text-amber-500'
          }`}
        >
          {isRtl ? 'تحذير' : 'Warning'}
        </button>
        <button
          onClick={() => setSeverityFilter('success')}
          className={`px-2 py-1 rounded-lg transition-all uppercase ${
            severityFilter === 'success' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 dark:text-slate-450 hover:text-emerald-500'
          }`}
        >
          {isRtl ? 'نجاح' : 'Success'}
        </button>
      </div>

      {filteredItems.length === 0 ? (
        <div className="py-8 text-center text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-850 rounded-2xl">
          <Clock className="w-6 h-6 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
          <p className="text-[10px] font-bold">
            {isRtl ? 'لا توجد أنشطة مطابقة' : 'No Matching Activities Logged'}
          </p>
        </div>
      ) : (
        <div className={`space-y-3.5 ${compact ? 'text-[10px]' : 'text-xs font-semibold'}`}>
          <div className="space-y-2.5">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border transition-all duration-200 hover:scale-[1.01] hover:shadow-xs flex gap-3 items-start ${getSeverityBg(
                  item
                )}`}
              >
                {/* Left Icon Badge */}
                <div className="p-2 bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850/80 shadow-xs shrink-0 flex items-center justify-center">
                  {getSeverityIcon(item)}
                </div>

                {/* Content Body */}
                <div className="min-w-0 flex-1 space-y-0.5 select-text">
                  <div className="flex items-center justify-between gap-2.5">
                    <h5 className="font-extrabold text-slate-850 dark:text-slate-150 leading-tight truncate">
                      {item.title}
                    </h5>
                    <span className="font-mono text-[8px] text-slate-450 dark:text-slate-500 shrink-0 font-semibold">
                      {item.timestamp.substring(11, 16)}
                    </span>
                  </div>
                  <p className="text-slate-655 dark:text-slate-405 leading-normal">
                    {item.message}
                  </p>
                  
                  {item.user && (
                    <span className="block text-[8px] font-mono text-slate-400 dark:text-slate-500 pt-0.5">
                      by {item.user.split('@')[0]}
                    </span>
                  )}

                  {item.sourceType === 'alert' && item.actions && item.actions.length > 0 && (
                    <div className="flex gap-1.5 pt-1.5 flex-wrap">
                      {item.actions.map((act: any, idx: number) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleActionClick(item.id, act)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[9px] font-bold bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-blue-600 dark:text-blue-400 shadow-xs transition-all cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
                        >
                          <span>{act.label}</span>
                          <ArrowRight className={`w-2.5 h-2.5 ${isRtl ? 'scale-x-[-1]' : ''}`} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
