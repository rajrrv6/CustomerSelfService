'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { validateForgotPasswordEmail } from '@/lib/auth/authValidation';
import { createPendingPasswordReset } from '@/lib/auth/passwordResetStorage';

const MOCK_SUBMIT_MS = 1100;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function ForgotPasswordCard() {
  const router = useRouter();
  const { lang } = useApp();
  const isRtl = lang === 'ar';

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [phase, setPhase] = useState<'form' | 'success'>('form');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { valid, error: validationError } = validateForgotPasswordEmail(email);
    if (!valid) {
      setError(
        isRtl
          ? validationError === 'Email is required.'
            ? 'البريد الإلكتروني مطلوب.'
            : validationError === 'Enter a valid email address.'
              ? 'أدخل بريداً إلكترونياً صالحاً.'
              : validationError ?? ''
          : validationError ?? ''
      );
      return;
    }

    setIsLoading(true);
    await delay(MOCK_SUBMIT_MS);
    createPendingPasswordReset(email);
    setIsLoading(false);
    setPhase('success');
  };

  if (phase === 'success') {
    return (
      <div className="bg-white dark:bg-slate-900/70 dark:backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6 sm:p-8 text-center space-y-5">
        <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7" aria-hidden />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {isRtl ? 'تم إرسال التعليمات' : 'Check your inbox'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {isRtl ? (
              <>
                إذا كان الحساب موجوداً، ستصلك رسالة تحتوي على رابط إعادة التعيين. في بيئة العرض التوضيحي، يمكنك
                المتابعة لتعيين كلمة مرور جديدة.
              </>
            ) : (
              <>
                If an account exists for that email, you will receive reset instructions. In this demo environment, you
                can continue to set a new password immediately.
              </>
            )}
          </p>
        </div>
        <div className="flex flex-col gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push('/login/reset-password')}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-lg shadow-blue-500/25 transition-all"
          >
            {isRtl ? 'تعيين كلمة مرور جديدة' : 'Set new password'}
          </button>
          <Link
            href="/login"
            className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            {isRtl ? 'العودة إلى تسجيل الدخول' : 'Back to sign in'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900/70 dark:backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="space-y-1.5">
          <label htmlFor="forgot-email" className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            {isRtl ? 'البريد الإلكتروني للمؤسسة' : 'Work email'}
          </label>
          <div className="relative">
            <Mail
              className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? 'right-3' : 'left-3'}`}
              aria-hidden
            />
            <input
              id="forgot-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isRtl ? 'you@company.com' : 'you@company.com'}
              className={`w-full py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-950 text-sm font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 ${
                isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
              } ${error ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'}`}
              aria-invalid={!!error}
              aria-describedby={error ? 'forgot-email-error' : undefined}
            />
          </div>
          {error && (
            <p id="forgot-email-error" className="text-xs text-rose-500 font-medium" role="alert">
              {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
              {isRtl ? 'جاري الإرسال...' : 'Sending instructions...'}
            </>
          ) : (
            isRtl ? 'إرسال رابط إعادة التعيين' : 'Send reset instructions'
          )}
        </button>

        <p className="text-center">
          <Link href="/login" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            {isRtl ? 'العودة إلى تسجيل الدخول' : 'Back to sign in'}
          </Link>
        </p>
      </form>
    </div>
  );
}
