'use client';

import React, { useState } from 'react';
import { useNotificationStore } from '@/stores/notifications/notificationStore';
import { useAlerts, useResolveAlert } from '@/stores/notifications/notificationSelectors';
import { 
  triggerSlaBreach, 
  triggerStaffingShortage, 
  triggerQueueOverflow, 
  triggerEscalationOverload 
} from '@/stores/notifications/notificationEvents';
import { AlertTriangle, Bell, Clock, RefreshCw, X, ShieldAlert, Sparkles } from 'lucide-react';

interface WfmAlertsPanelProps {
  lang: 'en' | 'ar';
}

export function WfmAlertsPanel({ lang }: WfmAlertsPanelProps) {
  const isRtl = lang === 'ar';
  
  // Subscribe to Zustand notification alerts via selectors for RBAC filtering
  const alerts = useAlerts();
  const resolveAlert = useResolveAlert();

  // Filter alerts relevant to Workforce Management & SLAs
  const activeWfmAlerts = alerts.filter(
    (alert) =>
      (alert.category === 'sla' ||
        alert.category === 'routing' ||
        alert.category === 'operations' ||
        alert.category === 'escalation') &&
      alert.lifecycleState !== 'resolved' &&
      !alert.dismissed
  );

  // Handlers for simulated event triggers
  const simulateSlaBreach = () => {
    const queues = [
      { name: 'Tier 1 General Support', nameAr: 'الدعم العام (المستوى الأول)', wait: '4m 12s', limit: '3m' },
      { name: 'Technical Escalations (Tier 2)', nameAr: 'التصعيد الفني (المستوى الثاني)', wait: '7m 45s', limit: '5m' },
      { name: 'VIP Executive Line', nameAr: 'قناة كبار الشخصيات VIP', wait: '2m 15s', limit: '1m' }
    ];
    const pick = queues[Math.floor(Math.random() * queues.length)];
    triggerSlaBreach(isRtl ? pick.nameAr : pick.name, pick.wait, pick.limit);
  };

  const simulateStaffingShortage = () => {
    const queues = [
      { name: 'Arabic Language Specialists', nameAr: 'متخصصي اللغة العربية', count: 1 },
      { name: 'Technical Escalations (Tier 2)', nameAr: 'التصعيد الفني (المستوى الثاني)', count: 0 },
      { name: 'VIP Executive Line', nameAr: 'قناة كبار الشخصيات VIP', count: 1 }
    ];
    const pick = queues[Math.floor(Math.random() * queues.length)];
    triggerStaffingShortage(isRtl ? pick.nameAr : pick.name, pick.count, 2);
  };

  const simulateAbsenteeism = () => {
    const names = ['Liam Bennett', 'Sarah Jenkins', 'Tariq Mansoor', 'Nadia Vance'];
    const shifts = ['Morning Shift', 'Evening Shift', 'Night Roster'];
    const name = names[Math.floor(Math.random() * names.length)];
    const shift = shifts[Math.floor(Math.random() * shifts.length)];
    
    useNotificationStore.getState().addAlert({
      category: 'operations',
      source: 'routing',
      severity: 'warning',
      alertCode: 'ABSENTEEISM_ALERT',
      sourceEntity: name,
      title: isRtl ? `غياب الموظف: ${name}` : `Absenteeism Alert: ${name}`,
      message: isRtl 
        ? `لم يقم الموظف ${name} بتسجيل حضوره لنوبة ${shift}. نسبة انكماش الموارد مرتفعة.` 
        : `${name} did not check into scheduled ${shift}. Roster shrinkage is elevated.`,
      metadata: {
        agentName: name,
        shift,
        sourceSystem: 'Workforce Scheduler'
      },
      allowedRoles: ['SUPER_ADMIN', 'CLIENT_ADMIN', 'SUPERVISOR', 'OPERATIONS_MANAGER'],
      allowedPersonas: ['ADMIN', 'SUPERVISOR', 'OPERATIONS'],
      allowedModules: ['workforce', 'operations'],
      tenantScope: 'global',
      visibilityType: 'global'
    });
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400';
      case 'success':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400';
      default:
        return 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400';
    }
  };

  const handleActionClick = (alertId: string, action: any) => {
    if (action.actionType === 'acknowledge') {
      resolveAlert(alertId);
    } else if (action.actionType === 'resolve') {
      resolveAlert(alertId);
    } else if (action.actionType === 'navigate') {
      const screenId = action.payload?.screenId;
      if (screenId) {
        window.dispatchEvent(new CustomEvent('navigate-to-screen', { detail: { screenId } }));
      }
      resolveAlert(alertId);
    }
  };

  return (
    <div className="space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Alert Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center relative shrink-0">
            <Bell className="w-5 h-5" />
            {activeWfmAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white font-bold font-mono text-[10px] flex items-center justify-center animate-bounce">
                {activeWfmAlerts.length}
              </span>
            )}
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-800 dark:text-white uppercase tracking-wider font-mono">
              {isRtl ? 'مركز الإنذارات التلقائية للعمليات (WFM)' : 'WFM Operations Alerts Engine'}
            </h4>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
              {isRtl 
                ? `مراقبة حية وتنبيهات مستويات الخدمة المهددة بالخطر. عدد الإنذارات النشطة: ${activeWfmAlerts.length}` 
                : `Live triggers and SLA compliance notifications. Active alerts: ${activeWfmAlerts.length}`}
            </span>
          </div>
        </div>

        {/* Simulation Controls */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={simulateSlaBreach}
            className="flex items-center gap-1 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 rounded-xl text-[10px] font-bold transition-all cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{isRtl ? 'محاكاة خرق الـ SLA' : 'SLA Breach'}</span>
          </button>
          
          <button
            onClick={simulateStaffingShortage}
            className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 rounded-xl text-[10px] font-bold transition-all cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{isRtl ? 'محاكاة عجز الموظفين' : 'Staff Deficit'}</span>
          </button>

          <button
            onClick={simulateAbsenteeism}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/20 rounded-xl text-[10px] font-bold transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isRtl ? 'محاكاة غياب مفاجئ' : 'Absenteeism'}</span>
          </button>
        </div>
      </div>

      {/* Warnings view grid */}
      {activeWfmAlerts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {activeWfmAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 border rounded-2xl flex justify-between items-start gap-4 transition-all duration-300 animate-in slide-in-from-top-1 ${getSeverityStyles(
                alert.severity
              )}`}
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-bold font-mono uppercase bg-slate-900 border border-slate-800 text-slate-400 select-none">
                    {alert.alertCode}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold font-mono flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {alert.timestamp.substring(11, 19)}
                  </span>
                </div>
                <h5 className="font-bold text-xs text-slate-800 dark:text-white leading-tight">
                  {alert.title}
                </h5>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal font-normal">
                  {alert.message}
                </p>
                {alert.actions && alert.actions.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {alert.actions.map((act, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleActionClick(alert.id, act)}
                        className="px-2.5 py-1 text-[9px] font-bold bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg transition-all cursor-pointer shadow-xs border border-slate-200 dark:border-slate-800"
                      >
                        {act.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => resolveAlert(alert.id)}
                className="p-1.5 rounded-lg hover:bg-slate-900/10 hover:text-slate-800 dark:hover:bg-slate-955/20 text-slate-400 dark:text-slate-550 transition-colors cursor-pointer shrink-0"
                title="Dismiss warning"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-7 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-950/15">
          <Sparkles className="w-8 h-8 text-blue-500/40 mx-auto animate-pulse" />
          <p className="text-xs font-semibold text-slate-550 dark:text-slate-400 mt-2">
            {isRtl ? 'جميع قنوات الدعم مستقرة' : 'All support channels are performing within limits'}
          </p>
          <span className="text-[10px] text-slate-450 block mt-1 font-mono">
            {isRtl ? 'لا توجد تنبيهات SLA نشطة حالياً.' : 'No active SLA breaching warnings.'}
          </span>
        </div>
      )}
    </div>
  );
}
