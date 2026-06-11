'use client';

import React, { forwardRef } from 'react';
import { FormFieldWrapper } from './FormFieldWrapper';

interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  name: string;
  label?: string;
  required?: boolean;
  description?: string;
  error?: string;
  lang?: 'en' | 'ar';
}

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
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
      rows = 3,
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
        <textarea
          id={id}
          name={name}
          ref={ref}
          rows={rows}
          className={`w-full px-4 py-2 bg-white dark:bg-slate-950 border ${
            error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500/20'
          } focus:ring-2 focus:outline-none rounded-xl text-xs font-medium text-slate-850 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 transition-all ${
            isRtl ? 'text-right' : 'text-left'
          } ${className}`}
          dir={isRtl ? 'rtl' : 'ltr'}
          {...props}
        />
      </FormFieldWrapper>
    );
  }
);

TextAreaField.displayName = 'TextAreaField';
