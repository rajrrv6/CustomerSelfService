'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';
import { FormFieldWrapper } from './FormFieldWrapper';

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectFieldProps {
  id: string;
  name: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
  required?: boolean;
  description?: string;
  error?: string;
  lang?: 'en' | 'ar';
  placeholder?: string;
}

export function MultiSelectField({
  id,
  name,
  options = [],
  value = [],
  onChange,
  label,
  required,
  description,
  error,
  lang = 'en',
  placeholder = 'Select options...',
}: MultiSelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isRtl = lang === 'ar';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleOption = (val: string) => {
    const nextVal = value.includes(val)
      ? value.filter(v => v !== val)
      : [...value, val];
    onChange(nextVal);
  };

  const getTriggerText = () => {
    if (value.length === 0) return placeholder;
    if (value.length === 1) {
      const match = options.find(o => o.value === value[0]);
      return match ? match.label : placeholder;
    }
    return lang === 'ar'
      ? `تم تحديد ${value.length} خيارات`
      : `${value.length} items selected`;
  };

  return (
    <FormFieldWrapper
      id={id}
      label={label}
      required={required}
      description={description}
      error={error}
      lang={lang}
    >
      <div ref={wrapperRef} className="relative w-full">
        {/* Trigger Button */}
        <button
          id={id}
          type="button"
          onClick={() => setIsOpen(prev => !prev)}
          className={`w-full px-4 py-2 bg-white dark:bg-slate-950 border ${
            error ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
          } rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-350 flex items-center justify-between transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
        >
          <span className="truncate">{getTriggerText()}</span>
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        </button>

        {/* Options popover list */}
        {isOpen && (
          <div className={`absolute z-50 mt-1.5 w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 animate-fade-in ${
            isRtl ? 'right-0 text-right' : 'left-0 text-left'
          }`}>
            <div className="max-h-48 overflow-y-auto space-y-0.5 scrollbar-thin">
              {options.map((opt) => {
                const isSelected = value.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleToggleOption(opt.value)}
                    className={`w-full px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-500/5 text-blue-600 dark:text-blue-400 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                    } ${isRtl ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-blue-650 border-blue-500 text-white' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </FormFieldWrapper>
  );
}
