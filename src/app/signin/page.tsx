'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginCard } from '@/components/auth/LoginCard';
import { useAuth } from '@/hooks/useAuth';
import { useApp } from '@/context/AppContext';
import { getHomeRouteForRole } from '@/lib/auth/roleRouting';
import { translations } from '@/i18n/translations';

function SignInPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, isAuthenticated, user } = useAuth();
  const { lang } = useApp();
  const t = translations[lang];

  useEffect(() => {
    if (status === 'loading') return;
    if (isAuthenticated && user) {
      const redirectParam = searchParams ? searchParams.get('redirect') : null;
      // Safety validation: Must start with '/' but reject '//', '/\', and any absolute protocol
      const isValidRedirect = redirectParam && 
        redirectParam.startsWith('/') && 
        !redirectParam.startsWith('//') && 
        !redirectParam.startsWith('/\\') && 
        !redirectParam.includes('://');

      if (isValidRedirect) {
        router.replace(redirectParam);
      } else {
        router.replace(getHomeRouteForRole(user.role));
      }
    }
    if (status === 'pending_mfa') {
      router.replace('/signin/mfa');
    }
  }, [status, isAuthenticated, user, router, searchParams]);

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

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#030712]">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" aria-label="Loading" />
      </div>
    }>
      <SignInPageContent />
    </Suspense>
  );
}
