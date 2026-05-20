'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { MFAInput } from '@/components/auth/MFAInput';
import { useAuth } from '@/hooks/useAuth';
import { useApp } from '@/context/AppContext';

const RESEND_COOLDOWN_SEC = 30;

export default function MfaPage() {
  const router = useRouter();
  const { status, pendingLogin, verifyMfa, resendMfaCode, isAuthenticated, user } = useAuth();
  const { lang } = useApp();
  const isRtl = lang === 'ar';

  const [error, setError] = useState<string | null>(null);
  const [resendSeconds, setResendSeconds] = useState(RESEND_COOLDOWN_SEC);
  const [isResending, setIsResending] = useState(false);

  const isLoading = status === 'loading';

  useEffect(() => {
    if (status === 'loading') return;
    if (isAuthenticated && user) return;
    if (status !== 'pending_mfa' || !pendingLogin) {
      router.replace('/login');
    }
  }, [status, pendingLogin, isAuthenticated, user, router]);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = setInterval(() => setResendSeconds((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [resendSeconds]);

  const handleComplete = useCallback(
    async (code: string) => {
      setError(null);
      const result = await verifyMfa(code);
      if (result.success && result.redirectTo) {
        router.replace(result.redirectTo);
      } else if (!result.success) {
        setError(result.error ?? (isRtl ? 'رمز غير صالح' : 'Invalid code'));
      }
    },
    [verifyMfa, router, isRtl]
  );

  const handleResend = async () => {
    if (resendSeconds > 0) return;
    setIsResending(true);
    await resendMfaCode();
    setResendSeconds(RESEND_COOLDOWN_SEC);
    setIsResending(false);
  };

  const maskedEmail = pendingLogin?.email
    ? pendingLogin.email.replace(/(.{2})(.*)(@.*)/, '$1••••$3')
    : '';

  return (
    <AuthLayout
      badge={isRtl ? 'التحقق متعدد العوامل' : 'Multi-factor authentication'}
      title={isRtl ? 'أدخل رمز التحقق' : 'Enter verification code'}
      subtitle={
        isRtl
          ? `أرسلنا رمزاً إلى ${maskedEmail}. صالح لمدة 10 دقائق.`
          : `We sent a 6-digit code to ${maskedEmail}. Valid for 10 minutes.`
      }
    >
      <div className="bg-white dark:bg-slate-900/70 dark:backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6 sm:p-8">
        <MFAInput onComplete={handleComplete} isLoading={isLoading} error={error} />

        <div className="mt-6 flex flex-col items-center gap-3 text-sm">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendSeconds > 0 || isResending}
            className="font-semibold text-blue-600 dark:text-blue-400 disabled:text-slate-400 disabled:cursor-not-allowed hover:underline"
          >
            {resendSeconds > 0
              ? isRtl
                ? `إعادة الإرسال خلال ${resendSeconds}ث`
                : `Resend code in ${resendSeconds}s`
              : isRtl
                ? 'إعادة إرسال الرمز'
                : 'Resend code'}
          </button>
          <Link href="/login" className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs">
            {isRtl ? 'العودة لتسجيل الدخول' : 'Back to sign in'}
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
