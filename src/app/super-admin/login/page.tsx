'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { useAuth } from '@/hooks/useAuth';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';
import { Mail, Lock, Loader2 } from 'lucide-react';

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const { status, isAuthenticated, user, login } = useAuth();
  const { lang } = useApp();
  const t = translations[lang];
  const isRtl = lang === 'ar';
  const isLoading = status === 'loading';

  const [email, setEmail] = useState('superadmin@mpaas.com');
  const [password, setPassword] = useState('••••••••');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (isAuthenticated && user?.role === 'super_admin') {
      router.replace('/admin/infrastructure');
    }
    if (status === 'pending_mfa') {
      router.replace('/login/mfa');
    }
  }, [status, isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Enforce super_admin domain or structure
    if (!email.includes('superadmin')) {
      setError(isRtl ? 'البريد الإلكتروني المدخل غير مصرح به لبوابة المشرف العام' : 'Only super admin credentials are authorized for this portal.');
      return;
    }

    const result = await login({ email, password: 'password123' });
    if (!result.success) {
      setError(isRtl ? 'حدث خطأ أثناء تسجيل الدخول' : 'Authentication failed.');
    } else {
      router.push('/login/mfa');
    }
  };

  return (
    <AuthLayout
      badge={isRtl ? 'بوابة البنية التحتية للمشرف العام' : 'Super Admin Infrastructure Portal'}
      title={isRtl ? 'تسجيل دخول المشرف العام' : 'Super Admin Sign In'}
      subtitle={isRtl ? 'أدخل بيانات الاعتماد الخاصة بك للوصول إلى وحدة التحكم العامة' : 'Enter your infrastructure credentials to manage global nodes.'}
    >
      <div className="bg-slate-50/95 dark:bg-slate-900/70 dark:backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-semibold text-slate-650 dark:text-slate-300">
              {t.auth.workEmail}
            </label>
            <div className="relative">
              <Mail className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? 'right-3' : 'left-3'}`} />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-950 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                  isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
                } border-slate-205 dark:border-slate-800`}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-semibold text-slate-650 dark:text-slate-300">
              {t.auth.password}
            </label>
            <div className="relative">
              <Lock className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? 'right-3' : 'left-3'}`} />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                  isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
                } border-slate-205 dark:border-slate-800`}
              />
            </div>
          </div>

          {error && <p className="text-xs text-rose-500 font-medium text-center">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-650 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98]"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isRtl ? 'الاستمرار للتحقق' : 'Continue to Verification')}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
