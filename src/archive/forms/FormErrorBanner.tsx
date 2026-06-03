'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FormErrorBannerProps {
  message: string;
  lang?: 'en' | 'ar';
}

export function FormErrorBanner({ message, lang = 'en' }: FormErrorBannerProps) {
  const isRtl = lang === 'ar';

  return (
    <div className={`p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl flex gap-3 text-xs font-semibold ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
      <div className="space-y-1">
        <h5 className="font-bold">
          {lang === 'ar' ? 'حدث خطأ أثناء المعالجة' : 'Form Submission Failure'}
        </h5>
        <p className="opacity-90">{message}</p>
      </div>
    </div>
  );
}
