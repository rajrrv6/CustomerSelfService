'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/hooks/useAuth';
import { getHomeRouteForRole } from '@/lib/auth/roleRouting';
import { translations } from '@/i18n/translations';
import { useRegisterSession } from '@/features/auth/register/hooks/useRegisterSession';
import { RegisterForm } from '@/features/auth/register/RegisterForm';

export default function RegisterPage() {
  const router = useRouter();
  const { status, isAuthenticated, user } = useAuth();
  const { lang } = useApp();
  const t = translations[lang];
  const { otpSession, successState } = useRegisterSession();

  useEffect(() => {
    if (status === 'loading') return;

    if (isAuthenticated && user) {
      router.replace(getHomeRouteForRole(user.role));
      return;
    }

    if (successState) {
      router.replace('/register/success');
      return;
    }

    if (otpSession) {
      router.replace('/register/verify-otp');
    }
  }, [isAuthenticated, otpSession, router, status, successState, user]);

  return (
    <AuthLayout badge={t.auth.register.badge} title={t.auth.register.title} subtitle={t.auth.register.subtitle} contentMaxWidthClassName="max-w-6xl">
      <RegisterForm />
    </AuthLayout>
  );
}