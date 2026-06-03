'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { FormFieldWrapper } from './FormFieldWrapper';

interface JsonEditorFieldProps {
  id: string;
  name: string;
  value: any; // Can be string or object
  onChange: (value: any) => void;
  label?: string;
  required?: boolean;
  description?: string;
  error?: string;
  lang?: 'en' | 'ar';
  rows?: number;
}

export function JsonEditorField({
  id,
  name,
  value,
  onChange,
  label,
  required,
  description,
  error: propError,
  lang = 'en',
  rows = 6,
}: JsonEditorFieldProps) {
  const [text, setText] = useState('');
  const [localError, setLocalError] = useState<string | undefined>(undefined);
  const isRtl = lang === 'ar';

  // Sync initial object/value to text on open/load
  useEffect(() => {
    if (value === undefined || value === null) {
      setText('');
      return;
    }
    if (typeof value === 'string') {
      setText(value);
    } else {
      try {
        setText(JSON.stringify(value, null, 2));
      } catch {
        setText('');
      }
    }
  }, [value]);

  const handleChange = (rawText: string) => {
    setText(rawText);
    if (!rawText.trim()) {
      setLocalError(undefined);
      onChange(null);
      return;
    }

    try {
      const parsed = JSON.parse(rawText);
      setLocalError(undefined);
      onChange(parsed);
    } catch (e: any) {
      setLocalError(lang === 'ar' ? 'صيغة JSON غير صالحة' : 'Invalid JSON syntax');
    }
  };

  const handlePrettify = () => {
    try {
      const parsed = JSON.parse(text);
      setText(JSON.stringify(parsed, null, 2));
      setLocalError(undefined);
    } catch {
      // Ignore if currently invalid
    }
  };

  const displayError = propError || localError;

  return (
    <FormFieldWrapper
      id={id}
      label={label}
      required={required}
      description={description}
      error={displayError}
      lang={lang}
    >
      <div className="relative space-y-1.5 w-full">
        <textarea
          id={id}
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          rows={rows}
          className={`w-full p-3 bg-slate-900 border ${
            displayError ? 'border-rose-500' : 'border-slate-800 focus:border-blue-500'
          } rounded-xl text-[11px] font-mono text-emerald-400 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10`}
          dir="ltr"
        />
        
        <div className={`flex justify-end ${isRtl ? 'flex-row-reverse' : ''}`}>
          <button
            type="button"
            onClick={handlePrettify}
            disabled={!!localError || !text.trim()}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 rounded-lg text-[9.5px] font-bold text-slate-700 dark:text-slate-350 disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>{lang === 'ar' ? 'تنسيق النص' : 'Format JSON'}</span>
          </button>
        </div>
      </div>
    </FormFieldWrapper>
  );
}
