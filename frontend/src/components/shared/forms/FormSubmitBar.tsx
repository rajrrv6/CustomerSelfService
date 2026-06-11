'use client';

import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { FormActions } from './FormActions';

interface FormSubmitBarProps {
  onCancel: () => void;
  onSubmit?: () => void;
  isDirty?: boolean;
  isSubmitting?: boolean;
  disabled?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  lang?: 'en' | 'ar';
}

export function FormSubmitBar({
  onCancel,
  onSubmit,
  isDirty = false,
  isSubmitting = false,
  disabled = false,
  submitLabel = 'Save Changes',
  cancelLabel = 'Cancel',
  lang = 'en',
}: FormSubmitBarProps) {
  const isRtl = lang === 'ar';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between shadow-lg transition-all animate-slide-up">
      <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
        {isDirty ? (
          <span className="flex items-center gap-1.5 text-[10.5px] font-bold text-amber-600 dark:text-amber-500 animate-pulse bg-amber-500/10 px-2.5 py-1 rounded-lg">
            <AlertCircle className="w-3.5 h-3.5" />
            {lang === 'ar' ? 'لديك تعديلات غير محفوظة' : 'Unsaved modifications'}
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-[10.5px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-850 px-2.5 py-1 rounded-lg">
            <CheckCircle className="w-3.5 h-3.5" />
            {lang === 'ar' ? 'تم حفظ التعديلات' : 'Configurations synced'}
          </span>
        )}
      </div>

      <div className="w-auto">
        <FormActions
          onCancel={onCancel}
          onSubmit={onSubmit}
          submitLabel={submitLabel}
          cancelLabel={cancelLabel}
          isSubmitting={isSubmitting}
          disabled={disabled || !isDirty}
          lang={lang}
        />
      </div>
    </div>
  );
}
