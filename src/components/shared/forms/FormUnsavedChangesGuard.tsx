'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface FormUnsavedChangesGuardProps {
  showConfirm: boolean;
  onKeepEditing: () => void;
  onDiscard: () => void;
  lang?: 'en' | 'ar';
}

export function FormUnsavedChangesGuard({
  showConfirm,
  onKeepEditing,
  onDiscard,
  lang = 'en',
}: FormUnsavedChangesGuardProps) {
  if (!showConfirm) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center space-y-4 animate-zoom-in">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 dark:bg-rose-500/20 text-rose-500 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6 animate-pulse" />
        </div>
        
        <div className="space-y-1.5">
          <h3 className="font-bold text-base text-slate-850 dark:text-white">
            {lang === 'ar' ? 'تعديلات غير محفوظة!' : 'Unsaved changes detected!'}
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs leading-relaxed">
            {lang === 'ar' 
              ? 'لديك تعديلات مدخلة لم يتم حفظها. إغلاق النموذج الآن سيؤدي لفقدان كافة البيانات المدخلة نهائياً.'
              : 'You are currently configuring settings. Exiting now will discard all inputs and configurations permanently.'}
          </p>
        </div>

        <div className="flex gap-3 pt-2 w-full">
          <button
            type="button"
            onClick={onKeepEditing}
            className="flex-1 py-2 px-4 border border-slate-200 dark:border-slate-800 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors text-slate-700 dark:text-slate-300 text-xs cursor-pointer focus:outline-none"
          >
            {lang === 'ar' ? 'متابعة التعديل' : 'Keep Editing'}
          </button>
          <button
            type="button"
            onClick={onDiscard}
            className="flex-1 py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition-colors text-xs cursor-pointer focus:outline-none"
          >
            {lang === 'ar' ? 'حذف وإغلاق' : 'Discard & Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
