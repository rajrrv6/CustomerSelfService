'use client';

import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { FormFieldWrapper } from './FormFieldWrapper';
import { Badge } from '../BadgeSystem';

interface TagInputFieldProps {
  id: string;
  name: string;
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
  required?: boolean;
  description?: string;
  error?: string;
  lang?: 'en' | 'ar';
  placeholder?: string;
}

export function TagInputField({
  id,
  name,
  value = [],
  onChange,
  label,
  required,
  description,
  error,
  lang = 'en',
  placeholder = 'Add new item...',
}: TagInputFieldProps) {
  const [inputValue, setInputValue] = useState('');
  const isRtl = lang === 'ar';

  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputValue.trim();
    if (trimmed && !value.includes(trimmed)) {
      const nextTags = [...value, trimmed];
      onChange(nextTags);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (tag: string) => {
    const nextTags = value.filter(t => t !== tag);
    onChange(nextTags);
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
      <div className="space-y-2.5">
        <div className={`flex gap-2 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
          <input
            id={id}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`flex-1 px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none rounded-xl text-xs font-medium text-slate-850 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-655 ${
              isRtl ? 'text-right' : 'text-left'
            }`}
            dir={isRtl ? 'rtl' : 'ltr'}
          />
          <button
            type="button"
            onClick={() => handleAdd()}
            className="px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {value.length > 0 && (
          <div className={`flex flex-wrap gap-1.5 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl max-h-36 overflow-y-auto ${
            isRtl ? 'flex-row-reverse' : 'flex-row'
          }`}>
            {value.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 text-[10px] font-bold font-mono bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60 rounded-xl max-w-full"
              >
                <span className="truncate">{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(tag)}
                  className="text-blue-400 hover:text-blue-650 dark:hover:text-blue-300 p-0.5 rounded transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </FormFieldWrapper>
  );
}
