'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, Mail } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/hooks/useAuth';
import type { ValidationResult } from '@/types/auth';

export function LoginCard() {
  const router = useRouter();
  const { login, status } = useAuth();
  const { lang } = useApp();
  const isRtl = lang === 'ar';
  const isLoading = status === 'loading';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<ValidationResult['errors']>({});
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setErrors({});

    const result = await login({ email, password });

    if (!result.success) {
      if (result.errors) {
        setErrors(result.errors);
        return;
      }
      setFormError(isRtl ? 'تعذر تسجيل الدخول. حاول مرة أخرى.' : 'Unable to sign in. Please try again.');
      return;
    }

    router.push('/login/mfa');
  };

  return (
    <div className="bg-slate-50/95 dark:bg-slate-900/70 dark:backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            {isRtl ? 'البريد الإلكتروني للمؤسسة' : 'Work email'}
          </label>
          <div className="relative">
            <Mail
              className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? 'right-3' : 'left-3'}`}
              aria-hidden
            />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isRtl ? 'you@company.com' : 'superadmin@mpaas.com'}
              className={`w-full py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-950 text-sm font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 ${
                isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
              } ${errors.email ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'}`}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
          </div>
          {errors.email && (
            <p id="email-error" className="text-xs text-rose-500 font-medium" role="alert">
              {errors.email}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center gap-2">
            <label htmlFor="password" className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {isRtl ? 'كلمة المرور' : 'Password'}
            </label>
            <Link
              href="/login/forgot-password"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              {isRtl ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
            </Link>
          </div>
          <div className="relative">
            <Lock
              className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? 'right-3' : 'left-3'}`}
              aria-hidden
            />
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-950 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 ${
                isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
              } ${errors.password ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'}`}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
          </div>
          {errors.password && (
            <p id="password-error" className="text-xs text-rose-500 font-medium" role="alert">
              {errors.password}
            </p>
          )}
        </div>

        {formError && (
          <p className="text-xs text-rose-500 font-medium text-center" role="alert">
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
              {isRtl ? 'جاري التحقق...' : 'Authenticating...'}
            </>
          ) : (
            isRtl ? 'متابعة إلى التحقق' : 'Continue to verification'
          )}
        </button>
      </form>

      <p className="mt-6 text-[11px] text-center text-slate-400 dark:text-slate-500 leading-relaxed">
        {isRtl ? (
          <>
            تجريبي: <span className="font-mono">superadmin@</span> · <span className="font-mono">clientadmin@</span> ·{' '}
            <span className="font-mono">agent@</span> · <span className="font-mono">customer@</span>
          </>
        ) : (
          <>
            Demo roles: <span className="font-mono">superadmin@</span>, <span className="font-mono">clientadmin@</span>,{' '}
            <span className="font-mono">agent@</span>, <span className="font-mono">customer@</span> — MFA code{' '}
            <span className="font-mono font-semibold">123456</span>
          </>
        )}
      </p>

      <p className="mt-3 text-center text-xs text-slate-400 dark:text-slate-500">
        {isRtl ? 'للاستخدام الداخلي ضمن بيئة الاختبار فقط' : 'For internal testing environment use only'}
      </p>
    </div>
  );
}
