'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { useApp } from '@/context/AppContext';

const ResetPasswordCard = dynamic(
  () => import('@/components/auth/ResetPasswordCard').then((mod) => ({ default: mod.ResetPasswordCard })),
  {
    ssr: false,
    loading: () => (
      <div className="bg-slate-50/95 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" aria-hidden />
      </div>
    ),
  }
);

export default function SignInResetPasswordPage() {
  const { lang } = useApp();
  const isRtl = lang === 'ar';

  return (
    <AuthLayout
      badge={isRtl ? 'إعادة تعيين آمنة' : 'Secure reset'}
      title={isRtl ? 'تعيين كلمة مرور جديدة' : 'Create a new password'}
      subtitle={
        isRtl
          ? 'اختر كلمة مرور قوية لا تستخدمها في مواقع أخرى. يتم التحقق محلياً في بيئة العرض التوضيحي.'
          : 'Choose a strong password you do not reuse elsewhere. Validation runs locally in this demo environment.'
      }
    >
      <ResetPasswordCard />
    </AuthLayout>
  );
}
