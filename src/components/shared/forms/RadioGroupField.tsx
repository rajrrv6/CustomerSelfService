'use client';

import React, { forwardRef } from 'react';
import { FormFieldWrapper } from './FormFieldWrapper';

interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioGroupFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  id: string;
  name: string;
  options: RadioOption[];
  label?: string;
  required?: boolean;
  description?: string;
  error?: string;
  lang?: 'en' | 'ar';
}

export const RadioGroupField = forwardRef<HTMLInputElement, RadioGroupFieldProps>(
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
        <div className={`grid grid-cols-1 gap-2.5 ${className}`}>
          {options.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-start gap-3 p-3 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer transition-colors ${
                isRtl ? 'flex-row-reverse text-right' : 'flex-row text-left'
              }`}
            >
              <input
                type="radio"
                name={name}
                ref={ref}
                value={opt.value}
                className="w-4 h-4 text-blue-600 border-slate-350 focus:ring-blue-500 mt-0.5"
                {...props}
              />
              <div className="space-y-0.5 select-none">
                <span className="font-bold text-xs text-slate-800 dark:text-white">
                  {opt.label}
                </span>
                {opt.description && (
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
                    {opt.description}
                  </p>
                )}
              </div>
            </label>
          ))}
        </div>
      </FormFieldWrapper>
    );
  }
);

RadioGroupField.displayName = 'RadioGroupField';
