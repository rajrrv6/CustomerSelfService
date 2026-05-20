'use client';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { ForgotPasswordCard } from '@/components/auth/ForgotPasswordCard';
import { useApp } from '@/context/AppContext';

export default function ForgotPasswordPage() {
  const { lang } = useApp();
  const isRtl = lang === 'ar';

  return (
    <AuthLayout
      badge={isRtl ? 'استعادة الوصول' : 'Account recovery'}
      title={isRtl ? 'نسيت كلمة المرور؟' : 'Forgot your password?'}
      subtitle={
        isRtl
          ? 'أدخل بريدك الإلكتروني المرتبط بالحساب. سنرسل لك تعليمات إعادة التعيين (محاكاة واجهة).'
          : 'Enter the email associated with your workspace. We will send reset instructions (UI simulation — no email is sent).'
      }
    >
      <ForgotPasswordCard />
    </AuthLayout>
  );
}
