'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ResponsiveDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** `start` = inline-start edge (LTR left, RTL right) */
  anchor?: 'start' | 'bottom';
  className?: string;
}

/**
 * Edge drawer / sheet — use `start` for queue-style panels, `bottom` for tall content.
 * Parent should hide on `lg:` when desktop split-pane shows the same content.
 */
export function ResponsiveDrawer({
  open,
  onClose,
  title,
  children,
  anchor = 'start',
  className = '',
}: ResponsiveDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  if (anchor === 'bottom') {
    return (
      <div className={`fixed inset-0 z-[60] lg:hidden ${className}`} role="dialog" aria-modal="true">
        <button type="button" className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-label="Close" onClick={onClose} />
        <div className="absolute inset-x-0 bottom-0 max-h-[88dvh] rounded-t-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="max-h-[min(80dvh,640px)] overflow-y-auto overscroll-contain">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-[60] lg:hidden ${className}`} role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-label="Close" onClick={onClose} />
      <div className="absolute inset-y-0 start-0 flex w-[min(100%,20rem)] max-w-full flex-col border-e border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-200 px-3 py-3 dark:border-slate-800">
          <h2 className="truncate text-sm font-bold text-slate-900 dark:text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </div>
  );
}
