'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useApp } from '@/context/AppContext';
import { useAuthRoleSync } from '@/context/AuthContext';
interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { status, isAuthenticated, user, canAccessPath } = useAuth();
  const { setRole } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useAuthRoleSync(setRole, user?.role);

  useEffect(() => {
    if (!mounted || status === 'loading') return;

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (user && !canAccessPath(pathname)) {
      router.replace('/access-denied');
    }
  }, [mounted, status, isAuthenticated, user, canAccessPath, pathname, router]);

  if (!mounted || status === 'loading' || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#030712]">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" aria-label="Loading" />
      </div>
    );
  }

  if (user && !canAccessPath(pathname)) {
    return null;
  }

  return <>{children}</>;
}
