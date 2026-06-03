'use client';

import React, { forwardRef } from 'react';
import { FormFieldWrapper } from './FormFieldWrapper';

interface SliderFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  id: string;
  name: string;
  min: number;
  max: number;
  step?: number;
  label?: string;
  required?: boolean;
  description?: string;
  error?: string;
  lang?: 'en' | 'ar';
  valueDisplay?: string | number; // e.g. "70%" or "0.7"
}

export const SliderField = forwardRef<HTMLInputElement, SliderFieldProps>(
  (
    {
      id,
      name,
      min,
      max,
      step = 1,
      label,
      required,
      description,
      error,
      lang = 'en',
      valueDisplay,
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
        <div className={`space-y-1.5 ${isRtl ? 'text-right' : 'text-left'} ${className}`}>
          {(label || valueDisplay !== undefined) && (
            <div className={`flex justify-between items-center ${isRtl ? 'flex-row-reverse' : ''}`}>
              {label && (
                <label htmlFor={id} className="block text-[11px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider select-none">
                  {label}
                  {required && <span className="text-rose-500 ml-1 font-bold">*</span>}
                </label>
              )}
              {valueDisplay !== undefined && (
                <span className="font-bold text-blue-600 dark:text-blue-400 font-mono text-xs">
                  {valueDisplay}
                </span>
              )}
            </div>
          )}

          <input
            id={id}
            name={name}
            ref={ref}
            type="range"
            min={min}
            max={max}
            step={step}
            className="w-full accent-blue-600 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer h-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            {...props}
          />

          {description && (
            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
              {description}
            </p>
          )}
        </div>
      </FormFieldWrapper>
    );
  }
);

SliderField.displayName = 'SliderField';
