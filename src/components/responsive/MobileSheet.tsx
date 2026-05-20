'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface MobileSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  /** Max height of sheet body (Tailwind class) */
  bodyClassName?: string;
}

/**
 * Bottom sheet for mobile progressive disclosure.
 * Desktop: typically not rendered (parent gates with `lg:hidden` + open state).
 */
export function MobileSheet({
  open,
  onClose,
  title,
  description,
  children,
  bodyClassName = 'max-h-[min(85dvh,720px)]',
}: MobileSheetProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-labelledby="mobile-sheet-title">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-label="Close panel"
        onClick={onClose}
      />
      <div className="absolute inset-x-0 bottom-0 flex max-h-[90dvh] flex-col rounded-t-3xl border border-slate-200 border-b-0 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <div className="min-w-0">
            <h2 id="mobile-sheet-title" className="truncate text-sm font-bold text-slate-900 dark:text-white">
              {title}
            </h2>
            {description && (
              <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-500 dark:text-slate-400">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className={`min-h-0 flex-1 overflow-y-auto overscroll-contain ${bodyClassName}`}>{children}</div>
      </div>
    </div>
  );
}
