'use client';

import React, { forwardRef } from 'react';
import { FormFieldWrapper } from './FormFieldWrapper';

interface SwitchFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  name: string;
  label?: string;
  required?: boolean;
  description?: string;
  error?: string;
  lang?: 'en' | 'ar';
}

export const SwitchField = forwardRef<HTMLInputElement, SwitchFieldProps>(
  (
    {
      id,
      name,
      label,
      required,
      description,
      error,
      lang = 'en',
      className = '',
      ...props
    },
    ref
  ) => {
    const isRtl = lang === 'ar';

    return (
      <FormFieldWrapper
        id={id}
        error={error}
        lang={lang}
      >
        <div className={`flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl transition-all ${className}`}>
          <div className={`${isRtl ? 'order-2 text-right' : 'order-1 text-left'} space-y-0.5 max-w-[80%]`}>
            {label && (
              <span className="font-bold text-xs text-slate-800 dark:text-white">
                {label}
                {required && <span className="text-rose-500 ml-1 font-bold">*</span>}
              </span>
            )}
            {description && (
              <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
                {description}
              </p>
            )}
          </div>

          <label className={`relative inline-flex items-center cursor-pointer select-none ${isRtl ? 'order-1' : 'order-2'}`}>
            <input
              id={id}
              name={name}
              ref={ref}
              type="checkbox"
              className="sr-only peer"
              {...props}
            />
            <div className="w-8 h-4.5 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:bg-blue-600 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:after:translate-x-3.5 rtl:peer-checked:after:-translate-x-3.5"></div>
          </label>
        </div>
      </FormFieldWrapper>
    );
  }
);

SwitchField.displayName = 'SwitchField';
