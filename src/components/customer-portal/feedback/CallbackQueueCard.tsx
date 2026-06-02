'use client';

import React, { useState, useEffect } from 'react';
import { PhoneCall, ShieldAlert, BadgeAlert, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
import { OperationalCard } from '@/components/shared/OperationalCard';

interface CallbackQueueCardProps {
  lang: 'en' | 'ar';
  phoneNumber: string;
  initialPosition?: number;
  onToastTrigger?: (type: 'success' | 'error' | 'info', title: string, msg: string) => void;
}

export function CallbackQueueCard({
  lang,
  phoneNumber,
  initialPosition = 4,
  onToastTrigger
}: CallbackQueueCardProps) {
  const isRtl = lang === 'ar';
  
  const [position, setPosition] = useState(initialPosition);
  const [waitTimeMins, setWaitTimeMins] = useState(initialPosition * 1.5);
  const [callbackStatus, setCallbackStatus] = useState<'queued' | 'connecting' | 'active' | 'completed'>('queued');
  const [isEscalated, setIsEscalated] = useState(false);
  const [escalating, setEscalating] = useState(false);

  // Simulate queue movement over time
  useEffect(() => {
    const timer = setInterval(() => {
      setPosition(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setCallbackStatus('connecting');
          setTimeout(() => {
            setCallbackStatus('active');
            if (onToastTrigger) {
              onToastTrigger('info', isRtl ? 'جاري الاتصال بك' : 'Callback Connecting', isRtl ? `الوكيل يتصل بالرقم ${phoneNumber} الآن.` : `Support agent calling line ${phoneNumber} now.`);
            }
          }, 3000);
          return 0;
        }
        const nextPos = prev - 1;
        setWaitTimeMins(nextPos * 1.5);
        if (onToastTrigger) {
          onToastTrigger('info', isRtl ? 'تقدم في الدور' : 'Queue Position Updated', isRtl ? `أنت الآن في المرتبة #${nextPos} في طابور الدعم.` : `You are now position #${nextPos} in callback queue.`);
        }
        return nextPos;
      });
    }, 15000); // Shift every 15 seconds for demonstration realism

    return () => clearInterval(timer);
  }, [phoneNumber, isRtl, onToastTrigger]);

  const handleEscalate = () => {
    setEscalating(true);
    // Simulate escalation logic
    setTimeout(() => {
      setEscalating(false);
      setIsEscalated(true);
      setPosition(1);
      setWaitTimeMins(1);
      if (onToastTrigger) {
        onToastTrigger('success', isRtl ? 'تم التصعيد للأولوية القصوى' : 'Escalated to High Priority', isRtl ? 'تم منح طلب الاتصال أولوية قصوى ونقله لأعلى الطابور.' : 'Callback request granted express priority routing.');
      }
    }, 1200);
  };

  const getStatusBadge = () => {
    switch (callbackStatus) {
      case 'queued':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-mono text-[9px] font-bold uppercase select-none animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
            {isRtl ? 'في الانتظار' : 'Queued'}
          </span>
        );
      case 'connecting':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-mono text-[9px] font-bold uppercase select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" />
            {isRtl ? 'جاري الاتصال' : 'Connecting'}
          </span>
        );
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-mono text-[9px] font-bold uppercase select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {isRtl ? 'نشط / متصل' : 'Active Call'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[9px] font-bold uppercase select-none">
            {isRtl ? 'مكتمل' : 'Completed'}
          </span>
        );
    }
  };

  return (
    <OperationalCard className="p-6 max-w-sm mx-auto space-y-4 border-l-4 border-l-blue-600 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-md text-xs font-semibold">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <PhoneCall className="w-4.5 h-4.5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-850 dark:text-white leading-tight">{isRtl ? 'حالة حجز الاتصال الصوتي' : 'Callback Queue Status'}</h4>
            <span className="text-[9px] text-slate-400 font-mono block mt-0.5">LINE: {phoneNumber}</span>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 grid grid-cols-2 gap-4 text-center font-mono">
        <div className="space-y-1">
          <span className="text-[9px] text-slate-450 uppercase block select-none">{isRtl ? 'الترتيب في الطابور' : 'Queue Position'}</span>
          <span className="text-base font-bold text-slate-850 dark:text-white">
            {position > 0 ? `#${position}` : (isRtl ? 'الحالي' : 'Next Up')}
          </span>
        </div>
        <div className="space-y-1 border-l border-slate-200 dark:border-slate-850">
          <span className="text-[9px] text-slate-450 uppercase block select-none">{isRtl ? 'الانتظار المتوقع' : 'Est. Wait'}</span>
          <span className="text-base font-bold text-blue-600 dark:text-blue-400">
            {position > 0 ? `${waitTimeMins.toFixed(1)}m` : (isRtl ? 'فوري' : 'Instant')}
          </span>
        </div>
      </div>

      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
        {callbackStatus === 'queued' && (
          isRtl
            ? `جميع الوكلاء منشغلون بالرد على المكالمات حالياً. سيتصل بك وكيلنا المتاح التالي على الرقم ${phoneNumber}. يرجى إبقاء خط الهاتف الخاص بك مفتوحاً.`
            : `All specialists are currently busy. An agent will call you from Saudi hotlines to line ${phoneNumber}. Please keep your phone line open.`
        )}
        {callbackStatus === 'connecting' && (isRtl ? 'جاري توجيه المكالمة إلى الوكيل المتاح حالياً... يرجى الاستعداد لتلقي المكالمة.' : 'Routing connection parameter to hotlines... Please prepare to answer.')}
        {callbackStatus === 'active' && (isRtl ? 'المكالمة متصلة الآن بالوكيل بنجاح.' : 'Your line is actively connected to our support agent.')}
      </p>

      {callbackStatus === 'queued' && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center gap-2">
          {isEscalated ? (
            <div className="w-full flex justify-center items-center gap-1 text-[9px] font-bold text-amber-600 font-mono select-none">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>✓ PRIORITY ESCALATED TO LEVEL-2</span>
            </div>
          ) : (
            <button
              onClick={handleEscalate}
              disabled={escalating}
              className="w-full py-2 border border-slate-200 dark:border-slate-800 hover:border-amber-300 hover:bg-amber-500/10 hover:text-amber-650 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              {escalating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{isRtl ? 'جاري المعالجة...' : 'Processing Handoff...'}</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-550" />
                  <span>{isRtl ? 'تصعيد الاستحقاق الفوري' : 'Request Premium Escalation'}</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
    </OperationalCard>
  );
}
