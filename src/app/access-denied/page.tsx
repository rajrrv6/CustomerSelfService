'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/hooks/useAuth';
import { getHomeRouteForRole } from '@/lib/auth/roleRouting';

export default function AccessDeniedPage() {
  const router = useRouter();
  const { lang } = useApp();
  const { user } = useAuth();
  const isRtl = lang === 'ar';

  const homeRoute = user ? getHomeRouteForRole(user.role) : '/';

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-slate-50 dark:bg-[#030712]"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="max-w-md w-full text-center p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-6">
          <ShieldAlert className="w-8 h-8" aria-hidden />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {isRtl ? 'الوصول مقيّد' : 'Access restricted'}
        </h1>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {isRtl ? (
            <>
              حسابك (<strong>{user?.email ?? '—'}</strong>) لا يملك صلاحية الوصول إلى هذا المسار. تواصل مع مسؤول
              المستأجر إذا كنت تعتقد أن هذا خطأ.
            </>
          ) : (
            <>
              Your account (<strong>{user?.email ?? '—'}</strong>) does not have permission to access this route.
              Contact your tenant administrator if you believe this is an error.
            </>
          )}
        </p>
        {user && (
          <p className="mt-2 text-xs font-mono text-slate-400 uppercase tracking-wider">
            {isRtl ? 'الدور:' : 'Role:'} {user.role.replace(/_/g, ' ')}
          </p>
        )}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            {isRtl ? 'رجوع' : 'Go back'}
          </button>
          <Link
            href={homeRoute}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold"
          >
            {isRtl ? 'مساحة عملي' : 'My workspace'}
          </Link>
        </div>
      </div>
    </div>
  );
}
