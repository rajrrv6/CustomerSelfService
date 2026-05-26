'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/hooks/useAuth';
import { getHomeRouteForRole } from '@/lib/auth/roleRouting';
import { translations } from '@/i18n/translations';
import { useRegisterSession } from '@/features/auth/register/hooks/useRegisterSession';
import { RegisterSuccess } from '@/features/auth/register/RegisterSuccess';

export default function RegisterSuccessPage() {
  const router = useRouter();
  const { status, isAuthenticated, user } = useAuth();
  const { lang } = useApp();
  const t = translations[lang];
  const { successState } = useRegisterSession();

  useEffect(() => {
    if (status === 'loading') return;

    if (isAuthenticated && user && (user.role !== 'customer' || !successState)) {
      router.replace(getHomeRouteForRole(user.role));
      return;
    }

    if (!successState) {
      router.replace('/register');
    }
  }, [isAuthenticated, router, status, successState, user]);

  return (
    <AuthLayout badge={t.auth.register.successTitle} title={t.auth.register.successHeading} subtitle={t.auth.register.successSubtitle} contentMaxWidthClassName="max-w-4xl">
      <RegisterSuccess />
    </AuthLayout>
  );
}