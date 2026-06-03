'use client';

import React, { forwardRef } from 'react';
import { FormFieldWrapper } from './FormFieldWrapper';

interface DateTimeFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  id: string;
  name: string;
  type?: 'date' | 'time' | 'datetime-local';
  label?: string;
  required?: boolean;
  description?: string;
  error?: string;
  lang?: 'en' | 'ar';
}

export const DateTimeField = forwardRef<HTMLInputElement, DateTimeFieldProps>(
  (
    {
      id,
      name,
      type = 'datetime-local',
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
        label={label}
        required={required}
        description={description}
        error={error}
        lang={lang}
      >
        <input
          id={id}
          name={name}
          ref={ref}
          type={type}
          className={`w-full px-4 py-2 bg-white dark:bg-slate-950 border ${
            error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500/20'
          } focus:ring-2 focus:outline-none rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-350 transition-all ${
            isRtl ? 'text-right' : 'text-left'
          } ${className}`}
          dir={isRtl ? 'rtl' : 'ltr'}
          {...props}
        />
      </FormFieldWrapper>
    );
  }
);

DateTimeField.displayName = 'DateTimeField';
