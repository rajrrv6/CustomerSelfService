'use client';

import React from 'react';
import { Database } from 'lucide-react';

interface TableEmptyStateProps {
  message?: string;
  subMessage?: string;
  lang: 'en' | 'ar';
}

export function TableEmptyState({ message, subMessage, lang }: TableEmptyStateProps) {
  const isRtl = lang === 'ar';
  
  const defaultMessage = isRtl 
    ? 'لم يتم العثور على سجلات' 
    : 'No records found';
    
  const defaultSubMessage = isRtl
    ? 'جرب تعديل معايير البحث أو التصفية لعرض السجلات.'
    : 'Try adjusting your search query or active filters to find matching records.';

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center select-none animate-in fade-in duration-300">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-850/50 text-slate-400 dark:text-slate-500 mb-4 border border-slate-100 dark:border-slate-800">
        <Database className="w-6 h-6 stroke-[1.5]" />
      </div>
      <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
        {message || defaultMessage}
      </h3>
      <p className="text-[11px] font-semibold text-slate-450 dark:text-slate-500 max-w-sm mt-1 leading-relaxed">
        {subMessage || defaultSubMessage}
      </p>
    </div>
  );
}
