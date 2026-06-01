'use client';

import React, { forwardRef } from 'react';
import { FormFieldWrapper } from './FormFieldWrapper';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  name: string;
  options: SelectOption[];
  label?: string;
  required?: boolean;
  description?: string;
  error?: string;
  lang?: 'en' | 'ar';
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  (
    {
      id,
      name,
      options,
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
        <select
          id={id}
          name={name}
          ref={ref}
          className={`w-full px-4 py-2 bg-white dark:bg-slate-950 border ${
            error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500/20'
          } focus:ring-2 focus:outline-none rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-350 transition-all ${
            isRtl ? 'text-right' : 'text-left'
          } ${className}`}
          dir={isRtl ? 'rtl' : 'ltr'}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
              {opt.label}
            </option>
          ))}
        </select>
      </FormFieldWrapper>
    );
  }
);

SelectField.displayName = 'SelectField';
