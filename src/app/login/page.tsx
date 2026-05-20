'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginCard } from '@/components/auth/LoginCard';
import { useAuth } from '@/hooks/useAuth';
import { useApp } from '@/context/AppContext';
import { getHomeRouteForRole } from '@/lib/auth/roleRouting';

export default function LoginPage() {
  const router = useRouter();
  const { status, isAuthenticated, user } = useAuth();
  const { lang } = useApp();
  const isRtl = lang === 'ar';

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
      badge={isRtl ? 'وصول آمن للمؤسسة' : 'Enterprise secure access'}
      title={isRtl ? 'تسجيل الدخول' : 'Sign in to your workspace'}
      subtitle={
        isRtl
          ? 'استخدم بريد مؤسستك للمتابعة إلى التحقق متعدد العوامل.'
          : 'Use your organization email to continue to multi-factor verification.'
      }
    >
      <LoginCard />
    </AuthLayout>
  );
}
