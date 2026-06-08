'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, FileQuestion, Lock, Server, Construction, ArrowLeft, RefreshCw, Layers } from 'lucide-react';
import { translations } from '@/i18n/translations';
import { useApp } from '@/context/AppContext';

// ----------------------------------------------------------------------
// 1. Loading Skeletons
// ----------------------------------------------------------------------
export function SkeletonCardGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 animate-shimmer" />
          <div className="w-3/4 h-4 bg-slate-200 dark:bg-slate-800 rounded-md animate-shimmer" />
          <div className="w-full h-10 bg-slate-200 dark:bg-slate-800 rounded-lg animate-shimmer" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-250/20 dark:border-slate-800/80 rounded-2xl">
          <div className="flex items-center gap-3.5 flex-1">
            <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 animate-shimmer shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="w-1/4 h-3 bg-slate-200 dark:bg-slate-800 rounded-md animate-shimmer" />
              <div className="w-1/2 h-2.5 bg-slate-200 dark:bg-slate-800 rounded-md animate-shimmer" />
            </div>
          </div>
          <div className="w-16 h-5 bg-slate-200 dark:bg-slate-800 rounded-full animate-shimmer" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonDetail() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 animate-shimmer" />
          <div className="space-y-2">
            <div className="w-32 h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md animate-shimmer" />
            <div className="w-20 h-2 bg-slate-200 dark:bg-slate-800 rounded-md animate-shimmer" />
          </div>
        </div>
        <div className="w-24 h-6 bg-slate-200 dark:bg-slate-800 rounded-full animate-shimmer" />
      </div>
      <div className="space-y-3 pt-2">
        <div className="w-full h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md animate-shimmer" />
        <div className="w-full h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md animate-shimmer" />
        <div className="w-5/6 h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md animate-shimmer" />
        <div className="w-1/2 h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md animate-shimmer" />
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 2. Empty State
// ----------------------------------------------------------------------
interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  icon = <Layers className="w-10 h-10 text-slate-400 stroke-1" />,
  actionText,
  onAction
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-3xl space-y-4 max-w-lg mx-auto shadow-md transition-all duration-300 hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 flex items-center justify-center">
        {icon}
      </div>
      <div className="space-y-1.5">
        <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">{title}</h4>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">{description}</p>
      </div>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/15 transition-all active:scale-95 cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// 3. Error State with Retry
// ----------------------------------------------------------------------
export function ErrorState({
  message,
  onRetry
}: {
  message?: string;
  onRetry?: () => void;
}) {
  const { lang } = useApp();
  const isRtl = lang === 'ar';

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-red-500/5 border border-red-500/20 rounded-3xl space-y-4 max-w-lg mx-auto shadow-sm transition-all duration-300 hover:border-red-500/35 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
        <AlertCircle className="w-8 h-8" />
      </div>
      <div className="space-y-1.5">
        <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">
          {isRtl ? 'حدث خطأ في النظام' : 'System Error Occurred'}
        </h4>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium max-w-xs mx-auto">
          {message || (isRtl ? 'تعذر جلب البيانات المطلوبة من موصلات mPaaS.' : 'Failed to retrieve data from mPaaS connectors.')}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer bg-white dark:bg-slate-900"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{isRtl ? 'أعد المحاولة' : 'Retry Request'}</span>
        </button>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// 4. HTTP Status Pages (404, 403, 500)
// ----------------------------------------------------------------------
interface HttpPageProps {
  status: '403' | '404' | '500';
  onBack: () => void;
}

export function HttpStatusPage({ status, onBack }: HttpPageProps) {
  const { lang } = useApp();
  const isRtl = lang === 'ar';

  const configs = {
    '403': {
      icon: <Lock className="w-8 h-8 text-amber-500" />,
      bg: 'bg-amber-500/10',
      title: isRtl ? '403 - غير مصرح بالوصول' : '403 - Forbidden Access',
      desc: isRtl 
        ? 'عذراً، لا تمتلك الصلاحيات الكافية للوصول إلى هذه الميزات. يرجى مراجعة إدارة RBAC.' 
        : 'You do not have the required permissions to view this resource. Contact RBAC Admins.'
    },
    '404': {
      icon: <FileQuestion className="w-8 h-8 text-blue-500" />,
      bg: 'bg-blue-500/10',
      title: isRtl ? '404 - لم يتم العثور على الصفحة' : '404 - Page Not Found',
      desc: isRtl 
        ? 'عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.' 
        : 'The page you are looking for does not exist or has been moved.'
    },
    '500': {
      icon: <Server className="w-8 h-8 text-rose-500" />,
      bg: 'bg-rose-500/10',
      title: isRtl ? '500 - خطأ داخلي في الخادم' : '500 - Internal Server Error',
      desc: isRtl 
        ? 'حدثت مشكلة فنية غير متوقعة في خوادمنا. فريق العمل يعمل على إصلاحها.' 
        : 'An unexpected technical issue occurred on our servers. Our team is resolving it.'
    }
  };

  const current = configs[status];

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-4 space-y-6 max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className={`w-20 h-20 rounded-3xl ${current.bg} flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-105`}>
        {current.icon}
      </div>
      
      <div className="space-y-2">
        <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">{current.title}</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed font-medium">
          {current.desc}
        </p>
      </div>

      <button
        onClick={onBack}
        className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
      >
        <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
        <span>{isRtl ? 'العودة للرئيسية' : 'Return to Home'}</span>
      </button>
    </div>
  );
}

// ----------------------------------------------------------------------
// 5. Maintenance Mode Screen
// ----------------------------------------------------------------------
export function MaintenanceModeScreen() {
  const { lang } = useApp();
  const isRtl = lang === 'ar';

  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center py-16 px-4 space-y-6 max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="w-20 h-20 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center animate-bounce shadow-lg transition-transform duration-300 hover:scale-105">
        <Construction className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
          {isRtl ? 'النظام قيد الصيانة المجدولة' : 'Scheduled System Maintenance'}
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed font-medium">
          {isRtl 
            ? 'نقوم بتحسين البنية التحتية لبوابة الدعم لخدمتكم بشكل أفضل. سنعود للعمل قريباً.' 
            : 'We are optimizing our portal databases to provide faster response pipelines. We will be back online soon.'}
        </p>
      </div>

      {/* Countdown Timer */}
      <div className="p-4 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl w-full">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono block mb-1">
          {isRtl ? 'الوقت المتبقي للعودة' : 'Estimated Time Remaining'}
        </span>
        <span className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400 block tracking-widest">
          {formatTime(timeLeft)}
        </span>
      </div>

      <div className="text-[10px] text-slate-500 font-medium">
        {isRtl ? 'هل الأمر عاجل؟ اتصل بالخط الساخن للأعطال: 800-112-9900' : 'Immediate emergency? Contact Hotline support: +966 800-112-9900'}
      </div>
    </div>
  );
}
