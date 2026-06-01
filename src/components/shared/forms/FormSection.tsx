'use client';

import React from 'react';

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  lang?: 'en' | 'ar';
}

export function FormSection({ title, description, children, lang = 'en' }: FormSectionProps) {
  const isRtl = lang === 'ar';

  return (
    <div className={`space-y-4 pt-3 ${isRtl ? 'text-right' : 'text-left'}`}>
      <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
        <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
          {title}
        </h4>
        {description && (
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4">
        {children}
      </div>
    </div>
  );
}
