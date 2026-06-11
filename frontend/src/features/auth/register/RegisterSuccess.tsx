'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';
import { useRegisterSession } from './hooks/useRegisterSession';

export function RegisterSuccess() {
  const router = useRouter();
  const { lang } = useApp();
  const t = translations[lang];
  const isRtl = lang === 'ar';
  const { successState } = useRegisterSession();

  useEffect(() => {
    if (!successState) {
      router.replace('/register');
    }
  }, [router, successState]);

  if (!successState) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/70 backdrop-blur-xl shadow-2xl shadow-slate-200/40 dark:shadow-none p-6 sm:p-8 text-center space-y-6">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 shadow-inner">
        <CheckCircle2 className="w-10 h-10" aria-hidden />
      </div>

      <div className="space-y-3 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-950/60 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300">
          <Sparkles className="w-3.5 h-3.5" aria-hidden />
          <span>{t.auth.register.successTitle}</span>
        </div>
        <h3 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{t.auth.register.successHeading}</h3>
        <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {isRtl
            ? `تم إنشاء حساب دعم العملاء لـ ${successState.fullName} بنجاح. أصبح بإمكانك الآن الدخول إلى بوابة الخدمة الذاتية.`
            : `The customer support account for ${successState.fullName} (${successState.email}) is verified and ready to use.`}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 max-w-2xl mx-auto text-left">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">{isRtl ? 'البريد' : 'Email'}</div>
          <div className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{successState.email}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">{isRtl ? 'الإرشاد' : 'Onboarding hint'}</div>
          <div className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{t.auth.register.onboardingHint}</div>
        </div>
      </div>

      <div className="space-y-3 max-w-2xl mx-auto">
        <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {isRtl
            ? 'يمكنك الآن فتح البوابة ومتابعة طلبات الدعم والدردشة والطلبات ضمن حسابك الجديد.'
            : 'You can now open the portal and continue with tickets, chat, and order support inside your new customer account.'}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/portal/home"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-colors hover:bg-blue-700"
          >
            {t.auth.register.loginNow}
          </Link>
          <Link
            href="/signin"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900"
          >
            {t.auth.register.backToLogin}
          </Link>
        </div>
      </div>
    </div>
  );
}