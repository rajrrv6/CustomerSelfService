'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Loader2, RefreshCcw, ShieldCheck, Smartphone } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';
import { useRegisterSession } from './hooks/useRegisterSession';
import { useToastQueue } from './hooks/useToastQueue';
import { validateOtpCode } from './validation/registerValidation';
import { OtpDigitInput } from './components/OtpDigitInput';
import { ToastStack } from './components/ToastStack';

export function OTPVerificationForm() {
  const router = useRouter();
  const { lang } = useApp();
  const t = translations[lang];
  const isRtl = lang === 'ar';
  const { otpSession, verifyOtp, resendOtp, acknowledgeOtpFlash } = useRegisterSession();
  const { toasts, pushToast, removeToast } = useToastQueue();

  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const validationMessages = useMemo(() => t.auth.register.validation, [t.auth.register.validation]);

  useEffect(() => {
    if (!otpSession) {
      router.replace('/register');
    }
  }, [otpSession, router]);

  useEffect(() => {
    if (!otpSession) return;

    const updateCountdown = () => {
      const remaining = Math.max(0, Math.ceil((new Date(otpSession.resendAvailableAt).getTime() - Date.now()) / 1000));
      setResendCountdown(remaining);
    };

    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timer);
  }, [otpSession?.resendAvailableAt]);

  useEffect(() => {
    if (!otpSession?.flashMessage) return;

    if (otpSession.flashMessage === 'sent') {
      pushToast('success', isRtl ? 'تم إرسال الرمز' : 'Code sent', isRtl ? 'تم إرسال رمز التحقق إلى قناة الاتصال المسجلة.' : 'The verification code has been sent to the registered contact channel.');
    } else if (otpSession.flashMessage === 'resent') {
      pushToast('info', isRtl ? 'أعيد إرسال الرمز' : 'Code resent', isRtl ? 'أعدنا إرسال رمز التحقق بنجاح.' : 'We have resent the verification code.');
    }

    acknowledgeOtpFlash();
  }, [acknowledgeOtpFlash, isRtl, otpSession?.flashMessage, pushToast]);

  if (!otpSession) {
    return null;
  }

  const handleVerify = async () => {
    const validation = validateOtpCode(otp, validationMessages);
    if (!validation.valid) {
      setError(validation.error ?? t.auth.register.invalidOtp);
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const result = await verifyOtp(otp);
      if (result.success) {
        router.replace('/register/success');
        return;
      }

      setError(result.error ?? t.auth.register.invalidOtp);
    } catch {
      setError(t.auth.register.invalidOtp);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCountdown > 0) return;

    setIsResending(true);
    try {
      const result = await resendOtp();
      if (result.success) {
        setOtp('');
        setError(null);
      }
    } finally {
      setIsResending(false);
    }
  };

  const maskedContact = otpSession.email.replace(/(.{2})(.*)(@.*)/, '$1••••$3');

  return (
    <div className="space-y-4">
      <ToastStack toasts={toasts} onDismiss={removeToast} />

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] items-stretch">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/70 backdrop-blur-xl shadow-2xl shadow-slate-200/40 dark:shadow-none p-6 sm:p-8 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <Smartphone className="w-3.5 h-3.5" aria-hidden />
            <span>{t.auth.register.otpTitle}</span>
          </div>

          <div className="space-y-3">
            <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{t.auth.register.otpSubtitle}</h3>
            <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {isRtl
                ? `الرمز مرتبط بـ ${maskedContact} وصالح لمدة 10 دقائق.`
                : `We sent the code to ${maskedContact}. It remains valid for 10 minutes.`}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">{isRtl ? 'الحساب' : 'Account'}</div>
              <div className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{otpSession.fullName}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{otpSession.country}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">{isRtl ? 'الوضع' : 'Status'}</div>
              <div className="mt-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">{isRtl ? 'بانتظار التحقق' : 'Awaiting verification'}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{isRtl ? 'رمز مكون من 6 أرقام' : '6-digit code required'}</div>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/50 p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" aria-hidden />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">{isRtl ? 'تحقق آمن' : 'Secure verification'}</p>
              <p className="text-xs leading-relaxed text-blue-800/90 dark:text-blue-200/90">
                {isRtl
                  ? 'نستخدم رمز تحقق محاكياً مكوناً من 6 أرقام لتأكيد التسجيل قبل منح الوصول.'
                  : 'A simulated 6-digit OTP confirms the registration before access is granted.'}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/70 backdrop-blur-xl shadow-2xl shadow-slate-200/40 dark:shadow-none p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">{t.auth.register.otpLabel}</h3>
            <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {isRtl ? 'أدخل الرمز المرسل إلى قناة الاتصال المسجلة.' : 'Enter the code sent to your registered contact channel.'}
            </p>
          </div>

          <OtpDigitInput
            value={otp}
            onChange={setOtp}
            disabled={isVerifying || isResending}
            error={error}
            label={t.auth.register.otpLabel}
            isRtl={isRtl}
          />

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCountdown > 0 || isResending}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-100 dark:hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isResending ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <RefreshCcw className="w-4 h-4" aria-hidden />}
              <span>
                {resendCountdown > 0
                  ? t.auth.register.resendIn.replace('{seconds}', String(resendCountdown))
                  : t.auth.register.resendOtp}
              </span>
            </button>

            <button
              type="button"
              onClick={handleVerify}
              disabled={isVerifying || otp.length < 6}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <CheckCircle2 className="w-4 h-4" aria-hidden />}
              <span>{isVerifying ? t.auth.register.verifyingOtp : t.auth.register.verifyOtp}</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 text-sm">
            <Link href="/register" className="inline-flex items-center gap-2 font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} aria-hidden />
              <span>{t.auth.register.backToRegister}</span>
            </Link>
            <Link href="/login" className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs font-medium">
              {t.auth.register.backToLogin}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}