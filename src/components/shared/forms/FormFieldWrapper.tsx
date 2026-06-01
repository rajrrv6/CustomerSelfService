'use client';

import React from 'react';

interface FormFieldWrapperProps {
  id: string;
  label?: string;
  required?: boolean;
  description?: string;
  error?: string;
  children: React.ReactNode;
  lang?: 'en' | 'ar';
}

export function FormFieldWrapper({
  id,
  label,
  required,
  description,
  error,
  children,
  lang = 'en',
}: FormFieldWrapperProps) {
  const isRtl = lang === 'ar';

  return (
    <div className={`space-y-1.5 w-full text-slate-800 dark:text-slate-200 ${isRtl ? 'text-right' : 'text-left'}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label
            htmlFor={id}
            className="block text-[11px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider select-none"
          >
            {label}
            {required && <span className="text-rose-500 ml-1 font-bold">*</span>}
          </label>
        </div>
      )}
      
      <div className="relative w-full">
        {children}
      </div>

      {description && (
        <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
          {description}
        </p>
      )}

      {error && (
        <p
          id={`${id}-error`}
          className="text-[10.5px] font-bold text-rose-500 flex items-center gap-1.5 animate-pulse"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
