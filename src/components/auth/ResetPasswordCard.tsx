'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import {
  evaluatePasswordStrength,
  RESET_PASSWORD_MIN_LENGTH,
  validateResetPasswordForm,
} from '@/lib/auth/authValidation';
import {
  clearPendingPasswordReset,
  readPendingPasswordReset,
} from '@/lib/auth/passwordResetStorage';
import type { PasswordStrengthLevel } from '@/types/auth';

const MOCK_SUBMIT_MS = 1000;
const REDIRECT_MS = 2200;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function strengthLabel(level: PasswordStrengthLevel, isRtl: boolean): string {
  if (isRtl) {
    const map: Record<PasswordStrengthLevel, string> = {
      weak: 'ضعيفة',
      fair: 'مقبولة',
      good: 'جيدة',
      strong: 'قوية',
    };
    return map[level];
  }
  const map: Record<PasswordStrengthLevel, string> = {
    weak: 'Weak',
    fair: 'Fair',
    good: 'Good',
    strong: 'Strong',
  };
  return map[level];
}

function strengthBarClass(level: PasswordStrengthLevel): string {
  switch (level) {
    case 'weak':
      return 'bg-rose-500';
    case 'fair':
      return 'bg-amber-500';
    case 'good':
      return 'bg-blue-500';
    case 'strong':
      return 'bg-emerald-500';
    default:
      return 'bg-slate-300';
  }
}

export function ResetPasswordCard() {
  const router = useRouter();
  const { lang } = useApp();
  const isRtl = lang === 'ar';

  const [hasPendingSession] = useState(() => !!readPendingPasswordReset());
  const [sessionInvalid, setSessionInvalid] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [phase, setPhase] = useState<'form' | 'success'>('form');

  const strength = useMemo(() => evaluatePasswordStrength(newPassword), [newPassword]);

  const mapError = (msg: string | undefined, field: 'new' | 'confirm'): string | undefined => {
    if (!msg || !isRtl) return msg;
    if (field === 'new') {
      if (msg.startsWith('Use at least')) return `استخدم ${RESET_PASSWORD_MIN_LENGTH} أحرف على الأقل.`;
      if (msg === 'Password is required.') return 'كلمة المرور مطلوبة.';
      if (msg.startsWith('Choose a stronger'))
        return 'اختر كلمة مرور أقوى (أحرف كبيرة وصغيرة، رقم، ورمز).';
    }
    if (msg === 'Confirm your password.') return 'أكد كلمة المرور.';
    if (msg === 'Passwords do not match.') return 'كلمتا المرور غير متطابقتين.';
    return msg;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!readPendingPasswordReset()) {
      setSessionInvalid(true);
      return;
    }

    const { valid, errors: formErrors } = validateResetPasswordForm(newPassword, confirmPassword);
    if (!valid) {
      setErrors({
        newPassword: mapError(formErrors.newPassword, 'new'),
        confirmPassword: mapError(formErrors.confirmPassword, 'confirm'),
      });
      return;
    }

    setIsLoading(true);
    await delay(MOCK_SUBMIT_MS);
    clearPendingPasswordReset();
    setIsLoading(false);
    setPhase('success');
  };

  useEffect(() => {
    if (phase !== 'success') return;
    const t = setTimeout(() => {
      router.replace('/login');
    }, REDIRECT_MS);
    return () => clearTimeout(t);
  }, [phase, router]);

  if (!hasPendingSession || sessionInvalid) {
    return (
      <div className="bg-slate-50/95 dark:bg-slate-900/70 dark:backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6 sm:p-8 text-center space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {isRtl
            ? 'انتهت صلاحية جلسة إعادة التعيين أو لم تبدأ من صفحة نسيت كلمة المرور. اطلب رابطاً جديداً.'
            : 'This reset session is missing or has expired. Start again from forgot password.'}
        </p>
        <Link
          href="/login/forgot-password"
          className="inline-block w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold text-center"
        >
          {isRtl ? 'طلب إعادة التعيين' : 'Request password reset'}
        </Link>
        <Link href="/login" className="block text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
          {isRtl ? 'العودة إلى تسجيل الدخول' : 'Back to sign in'}
        </Link>
      </div>
    );
  }

  if (phase === 'success') {
    return (
      <div className="bg-slate-50/95 dark:bg-slate-900/70 dark:backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6 sm:p-8 text-center space-y-4">
        <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7" aria-hidden />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {isRtl ? 'تم تحديث كلمة المرور' : 'Password updated'}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {isRtl ? 'إعادة التوجيه إلى تسجيل الدخول...' : 'Redirecting to sign in...'}
        </p>
        <Loader2 className="w-5 h-5 animate-spin text-blue-600 mx-auto" aria-hidden />
      </div>
    );
  }

  return (
    <div className="bg-slate-50/95 dark:bg-slate-900/70 dark:backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="space-y-1.5">
          <label htmlFor="new-password" className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            {isRtl ? 'كلمة المرور الجديدة' : 'New password'}
          </label>
          <div className="relative">
            <Lock
              className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? 'right-3' : 'left-3'}`}
              aria-hidden
            />
            <input
              id="new-password"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={`w-full py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-950 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 ${
                isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
              } ${errors.newPassword ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'}`}
              aria-invalid={!!errors.newPassword}
              aria-describedby="password-strength-meter"
            />
          </div>
          {newPassword.length > 0 && (
            <div id="password-strength-meter" className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                <span>{isRtl ? 'القوة' : 'Strength'}</span>
                <span>{strengthLabel(strength.level, isRtl)}</span>
              </div>
              <div
                className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden"
                role="progressbar"
                aria-valuenow={Math.round(strength.percent)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={isRtl ? 'قوة كلمة المرور' : 'Password strength'}
              >
                <div
                  className={`h-full rounded-full transition-all duration-300 ${strengthBarClass(strength.level)}`}
                  style={{ width: `${strength.percent}%` }}
                />
              </div>
            </div>
          )}
          {errors.newPassword && (
            <p className="text-xs text-rose-500 font-medium" role="alert">
              {errors.newPassword}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirm-password" className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            {isRtl ? 'تأكيد كلمة المرور' : 'Confirm password'}
          </label>
          <div className="relative">
            <Lock
              className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? 'right-3' : 'left-3'}`}
              aria-hidden
            />
            <input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-950 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 ${
                isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
              } ${errors.confirmPassword ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'}`}
              aria-invalid={!!errors.confirmPassword}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-rose-500 font-medium" role="alert">
              {errors.confirmPassword}
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
              {isRtl ? 'جاري الحفظ...' : 'Saving...'}
            </>
          ) : (
            isRtl ? 'تحديث كلمة المرور' : 'Update password'
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
