'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X, ShieldAlert } from 'lucide-react';
import { SystemAlert } from '@/stores/notifications/notificationTypes';
import { useDismissToast, useAcknowledgeAlert } from '@/stores/notifications/notificationSelectors';
import { ToastActions } from './ToastActions';
import { useUIStore } from '@/stores/uiStore';

interface ToastCardProps {
  alert: SystemAlert;
}

export function ToastCard({ alert }: ToastCardProps) {
  const dismissToast = useDismissToast();
  const acknowledgeAlert = useAcknowledgeAlert();
  const lang = useUIStore((s) => s.lang);
  const [pulse, setPulse] = useState(false);

  const { id, title, message, severity, source, count, actions } = alert;

  // Flash the toast card briefly if count updates (deduplication feedback)
  useEffect(() => {
    if (count > 1) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 500);
      return () => clearTimeout(t);
    }
  }, [count]);

  const getSeverityStyles = () => {
    switch (severity) {
      case 'critical':
        return {
          border: lang === 'ar' ? 'border-r-4 border-r-rose-500' : 'border-l-4 border-l-rose-500',
          bg: 'bg-rose-50 dark:bg-rose-950/20',
          textColor: 'text-rose-800 dark:text-rose-300',
          badgeBg: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300',
          icon: <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />,
          progressBar: 'bg-rose-500',
          duration: 0,
        };
      case 'warning':
        return {
          border: lang === 'ar' ? 'border-r-4 border-r-amber-500' : 'border-l-4 border-l-amber-500',
          bg: 'bg-amber-50 dark:bg-amber-950/20',
          textColor: 'text-amber-800 dark:text-amber-300',
          badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
          icon: <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />,
          progressBar: 'bg-amber-500',
          duration: 8000,
        };
      case 'success':
        return {
          border: lang === 'ar' ? 'border-r-4 border-r-emerald-500' : 'border-l-4 border-l-emerald-500',
          bg: 'bg-emerald-50 dark:bg-emerald-950/20',
          textColor: 'text-emerald-800 dark:text-emerald-300',
          badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
          progressBar: 'bg-emerald-500',
          duration: 5000,
        };
      case 'info':
      default:
        return {
          border: lang === 'ar' ? 'border-r-4 border-r-blue-500' : 'border-l-4 border-l-blue-500',
          bg: 'bg-blue-50 dark:bg-blue-950/20',
          textColor: 'text-blue-800 dark:text-blue-300',
          badgeBg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
          icon: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
          progressBar: 'bg-blue-500',
          duration: 4000,
        };
    }
  };

  const styles = getSeverityStyles();

  return (
    <div
      className={`relative w-80 sm:w-96 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden pointer-events-auto transition-all duration-300 transform ${
        pulse ? 'scale-102 ring-2 ring-blue-500/30' : 'scale-100'
      } ${styles.border}`}
      role="alert"
      aria-live={severity === 'critical' ? 'assertive' : 'polite'}
    >
      <style>{`
        @keyframes shrink-width {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>

      <div className="p-4 flex gap-3 items-start pr-8">
        {styles.icon}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white leading-tight truncate">
              {title}
            </h4>
            {count > 1 && (
              <span className={`px-1.5 py-0.5 rounded font-mono text-[9px] font-bold ${styles.badgeBg}`}>
                {lang === 'ar' ? `${count} تكرار` : `${count}x`}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded text-[8px] font-bold uppercase tracking-wider">
              {source}
            </span>
          </div>

          <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 mt-1.5">
            {message}
          </p>

          {/* Action buttons */}
          <ToastActions alertId={id} actions={actions} isLightBg={true} />
        </div>

        {/* Manual Dismiss */}
        <button
          type="button"
          onClick={() => dismissToast(id)}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="Dismiss alert"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Ephemeral auto-dismiss progress bar */}
      {styles.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className={`h-full ${styles.progressBar}`}
            style={{
              animationName: 'shrink-width',
              animationDuration: `${styles.duration}ms`,
              animationTimingFunction: 'linear',
              animationFillMode: 'forwards',
            }}
          />
        </div>
      )}
    </div>
  );
}
export default ToastCard;
