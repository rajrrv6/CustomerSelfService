import React from 'react';

interface StatusIndicatorProps {
  status: 'online' | 'busy' | 'break' | 'offline' | 'success' | 'warning' | 'critical' | 'info';
  label?: string;
  className?: string;
}

export function StatusIndicator({ status, label, className = '' }: StatusIndicatorProps) {
  const getStyles = () => {
    switch (status) {
      case 'online':
      case 'success':
        return {
          dot: 'bg-emerald-500',
          pulse: 'bg-emerald-400',
          text: 'text-emerald-700 dark:text-emerald-400'
        };
      case 'busy':
      case 'warning':
        return {
          dot: 'bg-amber-500',
          pulse: 'bg-amber-400',
          text: 'text-amber-700 dark:text-amber-400'
        };
      case 'break':
      case 'critical':
        return {
          dot: 'bg-rose-500',
          pulse: 'bg-rose-400',
          text: 'text-rose-750 dark:text-rose-450'
        };
      case 'offline':
      case 'info':
      default:
        return {
          dot: 'bg-slate-400 dark:bg-slate-600',
          pulse: 'bg-slate-300 dark:bg-slate-500',
          text: 'text-slate-500 dark:text-slate-400'
        };
    }
  };

  const styles = getStyles();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="relative flex h-2 w-2 shrink-0">
        {status !== 'offline' && (
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${styles.pulse}`} />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${styles.dot}`} />
      </span>
      {label && <span className={`text-[11px] font-bold font-mono tracking-wider uppercase ${styles.text}`}>{label}</span>}
    </div>
  );
}
