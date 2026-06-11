'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAlerts, useUnreadCount, useAcknowledgeAll, useClearResolvedAlerts } from '@/stores/notifications/notificationSelectors';
import { NotificationFilters } from './NotificationFilters';
import { NotificationTimeline } from './NotificationTimeline';
import { Activity, X, Play, Square, Settings, RefreshCw, AlertCircle } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCenter: () => void;
  isSimEnabled: boolean;
  onToggleSim: (val: boolean) => void;
}

export function NotificationDrawer({
  isOpen,
  onClose,
  onOpenCenter,
  isSimEnabled,
  onToggleSim,
}: NotificationDrawerProps) {
  const alerts = useAlerts();
  const unreadCount = useUnreadCount();
  const acknowledgeAll = useAcknowledgeAll();
  const clearResolved = useClearResolvedAlerts();
  const lang = useUIStore((s) => s.lang);
  const drawerRef = useRef<HTMLDivElement>(null);

  const isRtl = lang === 'ar';

  // Keyboard trap and Escape key listener
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

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Body */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className={`relative w-[min(100vw,26rem)] sm:w-[28rem] bg-white dark:bg-slate-900 h-full flex flex-col z-10 shadow-2xl transition-transform duration-300 ${
          isRtl ? 'border-r border-slate-200 dark:border-slate-800' : 'border-l border-slate-200 dark:border-slate-800'
        }`}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/80">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500 shrink-0" />
            <div className="min-w-0">
              <h3 id="drawer-title" className="font-bold text-sm text-slate-800 dark:text-white truncate">
                {isRtl ? 'مركز التنبيهات التشغيلية' : 'Operational Alerts Log'}
              </h3>
              <span className="text-[9px] text-slate-400 font-semibold font-mono uppercase tracking-wider block">
                {isRtl ? `${unreadCount} تنبيهات غير مقروءة` : `${unreadCount} Unread Alerts`}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* Simulator Console Controller */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl space-y-2.5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5 font-bold text-[11px] text-slate-700 dark:text-slate-300">
                <AlertCircle className="w-3.5 h-3.5 text-blue-500" />
                <span>{isRtl ? 'محاكي التنبيهات التشغيلية' : 'Operational Event Simulator'}</span>
              </div>
              <span
                className={`px-1.5 py-0.5 rounded text-[8px] font-bold font-mono tracking-wider uppercase ${
                  isSimEnabled
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-850 dark:text-slate-400'
                }`}
              >
                {isSimEnabled ? (isRtl ? 'نشط' : 'Running') : (isRtl ? 'متوقف' : 'Stopped')}
              </span>
            </div>

            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {isRtl
                ? 'ينتج هذا المحاكي أحداث تشغيلية عشوائية (SLA، خطافات ويب، أعطال في الفهرسة) لمحاكاة بيئة إنتاج حية.'
                : 'Generates randomized operational events (SLA breaches, webhook latencies, NLU confidence drops) to simulate live production environments.'}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onToggleSim(!isSimEnabled)}
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all text-[10px] flex-1 active:scale-98 ${
                  isSimEnabled
                    ? 'bg-rose-100 hover:bg-rose-200 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400'
                    : 'bg-blue-600 hover:bg-blue-700 text-white dark:text-white'
                }`}
              >
                {isSimEnabled ? (
                  <>
                    <Square className="w-3 h-3 fill-current" />
                    <span>{isRtl ? 'إيقاف المحاكاة' : 'Stop Simulation'}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-current" />
                    <span>{isRtl ? 'بدء المحاكاة' : 'Start Simulation'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Filters */}
          <NotificationFilters />

          {/* Timeline */}
          <NotificationTimeline />

        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={acknowledgeAll}
              className="px-3 py-1.5 font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 rounded-xl transition-all active:scale-95 border border-slate-200 dark:border-slate-700"
            >
              {isRtl ? 'إقرار بالكل' : 'Acknowledge All'}
            </button>
            <button
              type="button"
              onClick={clearResolved}
              className="px-3 py-1.5 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-xl transition-all active:scale-95"
            >
              {isRtl ? 'تصفية المحلول' : 'Clear Resolved'}
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenCenter}
            className="flex items-center gap-1 px-3 py-1.5 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all active:scale-95"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{isRtl ? 'تكوين متقدم' : 'Full Console'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
export default NotificationDrawer;
