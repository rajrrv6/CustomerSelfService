import React, { useState, useEffect } from 'react';
import { Clock, ShieldAlert, ShieldCheck } from 'lucide-react';

interface TicketSLAWidgetProps {
  isRtl: boolean;
  limitMinutes: number;
  initialSecondsRemaining: number;
}

export function TicketSLAWidget({
  isRtl,
  limitMinutes,
  initialSecondsRemaining
}: TicketSLAWidgetProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSecondsRemaining);
  const totalLimitSeconds = limitMinutes * 60;

  useEffect(() => {
    setSecondsLeft(initialSecondsRemaining);
  }, [initialSecondsRemaining]);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft]);

  const isBreached = secondsLeft <= 0;
  const isNearBreach = !isBreached && secondsLeft < 600; // < 10 minutes
  const percentage = Math.min(100, Math.max(0, (secondsLeft / totalLimitSeconds) * 100));

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const stateColor = isBreached
    ? 'text-rose-500'
    : isNearBreach
    ? 'text-amber-500'
    : 'text-emerald-500';

  const barColor = isBreached
    ? 'bg-rose-500'
    : isNearBreach
    ? 'bg-amber-500'
    : 'bg-emerald-500';

  const containerBg = isBreached
    ? 'bg-rose-500/5 border-rose-500/20 dark:border-rose-500/15'
    : isNearBreach
    ? 'bg-amber-500/5 border-amber-500/20 dark:border-amber-500/15'
    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800';

  return (
    <div
      className={`p-4 border rounded-2xl space-y-3 transition-colors duration-500 ${containerBg}`}
      dir={isRtl ? 'rtl' : 'ltr'}
      role="status"
      aria-live="polite"
      aria-label={isRtl ? 'مؤشر مستوى الخدمة' : 'SLA Indicator'}
    >
      {/* Header row */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <Clock className={`w-3.5 h-3.5 ${stateColor}`} />
          <span className="text-[10px] font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider font-mono">
            {isRtl ? 'هدف مستوى الخدمة' : 'SLA Target'}
          </span>
        </div>
        <span className={`text-sm font-extrabold font-mono tabular-nums ${stateColor} ${isNearBreach && !isBreached ? 'animate-pulse' : ''}`}>
          {isBreached ? (isRtl ? 'تم التجاوز' : 'BREACHED') : formatTime(secondsLeft)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${barColor} ${isBreached ? 'w-full opacity-60' : ''}`}
          style={{ width: isBreached ? '100%' : `${percentage}%` }}
        />
      </div>

      {/* Status footer */}
      <div className="flex items-center justify-between text-[9px] font-semibold">
        <div className={`flex items-center gap-1 ${stateColor}`}>
          {isBreached ? (
            <>
              <ShieldAlert className="w-3 h-3 shrink-0" />
              <span>{isRtl ? 'تجاوز الحد الزمني المحدد' : 'Response exceeds target metrics'}</span>
            </>
          ) : isNearBreach ? (
            <>
              <ShieldAlert className="w-3 h-3 shrink-0" />
              <span>{isRtl ? 'تحذير: يقترب من خرق الاتفاقية' : 'Warning: Nearing SLA target limits'}</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-3 h-3 shrink-0" />
              <span>{isRtl ? 'ضمن الحدود الآمنة للخدمة' : 'SLA parameters fully respected'}</span>
            </>
          )}
        </div>
        <span className="text-slate-400 font-mono">
          {isRtl ? `الحد: ${limitMinutes}د` : `Limit: ${limitMinutes}m`}
        </span>
      </div>
    </div>
  );
}
export default TicketSLAWidget;
