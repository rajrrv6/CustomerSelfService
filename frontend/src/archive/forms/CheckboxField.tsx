'use client';

import React, { forwardRef } from 'react';
import { FormFieldWrapper } from './FormFieldWrapper';

interface CheckboxFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  name: string;
  label?: string;
  required?: boolean;
  description?: string;
  error?: string;
  lang?: 'en' | 'ar';
}

export const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(
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
        <label className={`flex items-start gap-2.5 p-3 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer transition-colors ${
          isRtl ? 'flex-row-reverse text-right' : 'flex-row text-left'
        } ${className}`}>
          <input
            id={id}
            name={name}
            ref={ref}
            type="checkbox"
            className="w-4 h-4 rounded text-blue-600 border-slate-350 focus:ring-blue-500 focus:outline-none mt-0.5"
            {...props}
          />
          <div className="space-y-0.5 select-none">
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
        </label>
      </FormFieldWrapper>
    );
  }
);

CheckboxField.displayName = 'CheckboxField';
