'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PhoneCall, ShieldAlert, Sparkles, RefreshCw, CheckCircle } from 'lucide-react';
import { OperationalCard } from '@/components/shared/OperationalCard';

interface CallbackQueueCardProps {
  lang: 'en' | 'ar';
  phoneNumber: string;
  initialPosition?: number;
  onToastTrigger?: (type: 'success' | 'error' | 'info', title: string, msg: string) => void;
  onDismiss?: () => void;
  onClose?: () => void;
  onStatusChange?: (status: 'queued' | 'connecting' | 'active' | 'completed') => void;
}

export function CallbackQueueCard({
  lang,
  phoneNumber,
  initialPosition = 4,
  onToastTrigger,
  onDismiss,
  onClose,
  onStatusChange
}: CallbackQueueCardProps) {
  const isRtl = lang === 'ar';
  
  const [position, setPosition] = useState(initialPosition);
  const [waitTimeMins, setWaitTimeMins] = useState(initialPosition * 1.5);
  const [callbackStatus, setCallbackStatus] = useState<'queued' | 'connecting' | 'active' | 'completed'>('queued');
  const [isEscalated, setIsEscalated] = useState(false);
  const [escalating, setEscalating] = useState(false);
  const [countdown, setCountdown] = useState(10);

  const lastNotifiedPos = useRef<number>(initialPosition);
  const activeToastTriggered = useRef(false);
  const onDismissRef = useRef(onDismiss);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onDismissRef.current = onDismiss;
    onCloseRef.current = onClose;
  });

  // Sync wait time with position
  useEffect(() => {
    setWaitTimeMins(position * 1.5);
  }, [position]);

  // Notify parent of status changes
  useEffect(() => {
    if (onStatusChange) {
      onStatusChange(callbackStatus);
    }
  }, [callbackStatus, onStatusChange]);

  // Simulate queue movement over time
  useEffect(() => {
    if (callbackStatus !== 'queued') return;

    const timer = setInterval(() => {
      setPosition((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 15000); // Shift every 15 seconds for demonstration realism

    return () => clearInterval(timer);
  }, [callbackStatus]);

  // Handle position-based notifications and status transitions
  useEffect(() => {
    if (position === lastNotifiedPos.current) return;

    const nextPos = position;
    lastNotifiedPos.current = nextPos;

    if (nextPos === 0) {
      setCallbackStatus('connecting');
    } else {
      if (onToastTrigger) {
        onToastTrigger(
          'info',
          isRtl ? 'تقدم في الدور' : 'Queue Position Updated',
          isRtl
            ? `أنت الآن في المرتبة #${nextPos} في طابور الدعم.`
            : `You are now position #${nextPos} in callback queue.`
        );
      }
    }
  }, [position, isRtl, onToastTrigger]);

  // Handle connecting status transition to active and trigger connection toast
  useEffect(() => {
    if (callbackStatus === 'connecting') {
      const timer = setTimeout(() => {
        setCallbackStatus('active');
        if (onToastTrigger && !activeToastTriggered.current) {
          activeToastTriggered.current = true;
          onToastTrigger(
            'info',
            isRtl ? 'جاري الاتصال بك' : 'Callback Connecting',
            isRtl
              ? `الوكيل يتصل بالرقم ${phoneNumber} الآن.`
              : `Support agent calling line ${phoneNumber} now.`
          );
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [callbackStatus, phoneNumber, isRtl, onToastTrigger]);

  // Transition from active to completed and trigger completion/dismissal
  useEffect(() => {
    if (callbackStatus === 'active') {
      const timer = setTimeout(() => {
        setCallbackStatus('completed');
        if (onToastTrigger) {
          onToastTrigger(
            'success',
            isRtl ? 'الدعم الصوتي متصل' : 'Support Agent Ready',
            isRtl
              ? 'الوكيل في انتظارك الآن.'
              : 'Our support agent is now ready to assist you.'
          );
        }
      }, 5000); // 5 seconds in active call, then transition
      return () => clearTimeout(timer);
    }
  }, [callbackStatus, isRtl, onToastTrigger]);

  // Countdown timer for completed state auto-dismissal
  useEffect(() => {
    if (callbackStatus !== 'completed') return;

    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [callbackStatus]);

  // Completion timeout effect inside CallbackQueueCard.tsx
  useEffect(() => {
    if (callbackStatus === 'completed') {
      const timeout = window.setTimeout(() => {
        onCloseRef.current?.();
        onDismissRef.current?.();
      }, 10000);

      return () => window.clearTimeout(timeout);
    }
  }, [callbackStatus]);

  const handleEscalate = () => {
    setEscalating(true);
    // Simulate escalation logic
    setTimeout(() => {
      setEscalating(false);
      setIsEscalated(true);

      // Update ref to prevent position effect from firing a duplicate queue-position toast
      lastNotifiedPos.current = 1;
      setPosition(1);

      if (onToastTrigger) {
        onToastTrigger(
          'success',
          isRtl ? 'تم التصعيد للأولوية القصوى' : 'Escalated to High Priority',
          isRtl
            ? 'تم منح طلب الاتصال أولوية قصوى ونقله لأعلى الطابور.'
            : 'Callback request granted express priority routing.'
        );
      }
    }, 1200);
  };

  const getStatusBadge = () => {
    switch (callbackStatus) {
      case 'queued':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-mono text-[8px] font-bold uppercase select-none transition-all duration-300 ease-in-out">
            <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
            {isRtl ? 'في الانتظار' : 'Queued'}
          </span>
        );
      case 'connecting':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-mono text-[8px] font-bold uppercase select-none transition-all duration-300 ease-in-out">
            <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
            {isRtl ? 'جاري الاتصال' : 'Connecting'}
          </span>
        );
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-mono text-[8px] font-bold uppercase select-none transition-all duration-300 ease-in-out">
            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
            {isRtl ? 'نشط / متصل' : 'Active Call'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-mono text-[8px] font-bold uppercase select-none transition-all duration-300 ease-in-out">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {isRtl ? 'مكتمل' : 'Completed'}
          </span>
        );
    }
  };

  const getBorderColor = () => {
    switch (callbackStatus) {
      case 'queued':
        return 'border-l-blue-500';
      case 'connecting':
        return 'border-l-amber-500';
      case 'active':
        return 'border-l-emerald-500';
      case 'completed':
        return 'border-l-emerald-500';
      default:
        return 'border-l-blue-500';
    }
  };

  return (
    <OperationalCard className={`w-full max-w-3xl mx-auto !p-3.5 !space-y-3 border-l-4 ${getBorderColor()} bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 text-[11px] font-semibold`}>
      <div className="flex justify-between items-center transition-all duration-300">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-full bg-gradient-to-tr transition-all duration-300 ${
            callbackStatus === 'queued' ? 'from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400' :
            callbackStatus === 'connecting' ? 'from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 animate-pulse' :
            'from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400'
          } flex items-center justify-center shrink-0`}>
            {callbackStatus === 'completed' ? (
              <CheckCircle className="w-4 h-4 transition-all duration-300" />
            ) : (
              <PhoneCall className="w-4 h-4 transition-all duration-300" />
            )}
          </div>
          <div>
            <h4 className="font-extrabold text-[11px] text-slate-855 dark:text-white leading-tight transition-all duration-300">
              {callbackStatus === 'completed'
                ? (isRtl ? 'تم الاتصال بالدعم' : 'Support Session Connected')
                : (isRtl ? 'حالة حجز الاتصال الصوتي' : 'Callback Queue Status')}
            </h4>
            <span className="text-[8px] text-slate-400 dark:text-slate-500 font-mono block mt-0.5">LINE: {phoneNumber}</span>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {callbackStatus !== 'completed' ? (
        <div className="space-y-3 transition-all duration-300 opacity-100">
          <div className="bg-slate-50/50 dark:bg-slate-950/40 p-2 rounded-xl border border-slate-100 dark:border-slate-850/80 grid grid-cols-2 gap-2 text-center font-mono transition-all duration-300">
            <div className="space-y-0.5">
              <span className="text-[8px] text-slate-400 dark:text-slate-500 uppercase tracking-wider block select-none">
                {isRtl ? 'الترتيب في الطابور' : 'Queue Position'}
              </span>
              <span className="text-xs font-extrabold text-slate-850 dark:text-white transition-all duration-300">
                {position > 0 ? `#${position}` : (isRtl ? 'الحالي' : 'Next Up')}
              </span>
            </div>
            <div className="space-y-0.5 border-l border-slate-200 dark:border-slate-850">
              <span className="text-[8px] text-slate-400 dark:text-slate-500 uppercase tracking-wider block select-none">
                {isRtl ? 'الانتظار المتوقع' : 'Est. Wait'}
              </span>
              <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 transition-all duration-300">
                {position > 0 ? `${waitTimeMins.toFixed(1)}m` : (isRtl ? 'فوري' : 'Instant')}
              </span>
            </div>
          </div>

          <p className="text-[9px] text-slate-450 dark:text-slate-400 leading-relaxed font-normal transition-all duration-300">
            {callbackStatus === 'queued' && (
              isRtl
                ? `جميع الوكلاء منشغلون بالرد على المكالمات حالياً. سيتصل بك وكيلنا المتاح التالي على الرقم ${phoneNumber}. يرجى إبقاء خط الهاتف الخاص بك مفتوحاً.`
                : `All specialists are currently busy. An agent will call you from Saudi hotlines to line ${phoneNumber}. Please keep your phone line open.`
            )}
            {callbackStatus === 'connecting' && (
              isRtl
                ? 'جاري توجيه المكالمة إلى الوكيل المتاح حالياً... يرجى الاستعداد لتلقي المكالمة.'
                : 'Routing connection parameter to hotlines... Please prepare to answer.'
            )}
            {callbackStatus === 'active' && (
              isRtl
                ? 'المكالمة متصلة الآن بالوكيل بنجاح.'
                : 'Your line is actively connected to our support agent.'
            )}
          </p>

          {callbackStatus === 'queued' && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex justify-between items-center gap-2 transition-all duration-300">
              {isEscalated ? (
                <div className="w-full flex justify-center items-center gap-1 text-[8.5px] font-extrabold text-amber-600 dark:text-amber-400 font-mono select-none tracking-wide transition-all duration-300">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  <span>✓ PRIORITY ESCALATED TO LEVEL-2</span>
                </div>
              ) : (
                <button
                  onClick={handleEscalate}
                  disabled={escalating}
                  className="w-full py-1 border border-slate-200 dark:border-slate-800 hover:border-amber-400/40 hover:bg-amber-500/5 hover:text-amber-650 rounded-xl text-[9px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {escalating ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>{isRtl ? 'جاري المعالجة...' : 'Processing Handoff...'}</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-3 h-3 text-amber-550" />
                      <span>{isRtl ? 'تصعيد الاستحقاق الفوري' : 'Request Premium Escalation'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2.5 transition-all duration-300 opacity-100 animate-in fade-in">
          <p className="text-[9.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
            {isRtl
              ? `الوكيل في انتظارك الآن. تم إنشاء جلسة الدعم الصوتي بنجاح. سيتم إغلاق هذه النافذة تلقائياً خلال ${countdown} ثوانٍ.`
              : `Our support agent is now ready to assist you. Voice callback session established. This widget will close automatically in ${countdown} seconds.`}
          </p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-1000 ease-linear"
              style={{ width: `${(countdown / 10) * 100}%` }}
            />
          </div>
        </div>
      )}
    </OperationalCard>
  );
}
