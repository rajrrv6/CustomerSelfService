'use client';

import React from 'react';
import { FieldErrors } from 'react-hook-form';
import { ShieldAlert } from 'lucide-react';
import { getErrorMessage } from '@/lib/forms/formErrorMapper';

interface FormValidationSummaryProps {
  errors: FieldErrors;
  lang?: 'en' | 'ar';
}

export function FormValidationSummary({ errors, lang = 'en' }: FormValidationSummaryProps) {
  const isRtl = lang === 'ar';
  const errorKeys = Object.keys(errors);

  if (errorKeys.length === 0) return null;

  return (
    <div className={`p-4 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-2xl flex gap-3 text-xs ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
      <ShieldAlert className="w-5 h-5 shrink-0 text-amber-500 mt-0.5 animate-bounce" />
      <div className="space-y-1 w-full">
        <h5 className="font-bold">
          {lang === 'ar'
            ? `يرجى تصحيح عدد (${errorKeys.length}) حقول غير صالحة:`
            : `Please correct ${errorKeys.length} validation errors:`}
        </h5>
        <ul className={`list-disc list-inside space-y-0.5 opacity-90 ${isRtl ? 'pr-2' : 'pl-2'}`}>
          {errorKeys.map((key) => {
            const err = errors[key];
            const message = getErrorMessage(err as any, lang);
            if (!message) return null;
            return (
              <li key={key} className="font-mono text-[10.5px]">
                <span className="font-bold capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span> {message}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
