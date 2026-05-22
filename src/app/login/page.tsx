'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginCard } from '@/components/auth/LoginCard';
import { useAuth } from '@/hooks/useAuth';
import { useApp } from '@/context/AppContext';
import { getHomeRouteForRole } from '@/lib/auth/roleRouting';
import { translations } from '@/i18n/translations';

export default function LoginPage() {
  const router = useRouter();
  const { status, isAuthenticated, user } = useAuth();
  const { lang } = useApp();
  const t = translations[lang];

  useEffect(() => {
    if (status === 'loading') return;
    if (isAuthenticated && user) {
      router.replace(getHomeRouteForRole(user.role));
    }
    if (status === 'pending_mfa') {
      router.replace('/login/mfa');
    }
  }, [status, isAuthenticated, user, router]);

  return (
    <AuthLayout
      badge={t.auth.secureAccess}
      title={t.auth.loginTitle}
      subtitle={t.auth.loginSubtitle}
    >
      <LoginCard />
    </AuthLayout>
  );
}
