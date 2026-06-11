'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { FormUnsavedChangesGuard } from './FormUnsavedChangesGuard';

interface FormContainerBaseProps {
  isOpen: boolean;
  onClose: () => void;
  isDirty?: boolean;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  type: 'drawer' | 'modal';
  maxWidthClass?: string;
  lang?: 'en' | 'ar';
}

export function FormContainerBase({
  isOpen,
  onClose,
  isDirty = false,
  title,
  children,
  footer,
  type,
  maxWidthClass = 'max-w-md',
  lang = 'en',
}: FormContainerBaseProps) {
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isRtl = lang === 'ar';

  const handleCloseAttempt = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const previousActiveElement = document.activeElement as HTMLElement | null;

    // ESC close behavior
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCloseAttempt();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Focus trapping
    const containerElement = containerRef.current;
    if (!containerElement) return;

    const getFocusableElements = () => {
      return containerElement.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
    };

    const focusable = getFocusableElements();
    let cleanupTab: (() => void) | undefined;

    if (focusable.length > 0) {
      const first = focusable[0] as HTMLElement;
      const last = focusable[focusable.length - 1] as HTMLElement;

      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      };

      containerElement.addEventListener('keydown', handleTab);
      cleanupTab = () => containerElement.removeEventListener('keydown', handleTab);

      const timer = setTimeout(() => {
        first.focus();
      }, 50);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        if (cleanupTab) cleanupTab();
        clearTimeout(timer);
        if (previousActiveElement) {
          setTimeout(() => {
            previousActiveElement.focus();
          }, 50);
        }
      };
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (previousActiveElement) {
        setTimeout(() => {
          previousActiveElement.focus();
        }, 50);
      }
    };
  }, [isOpen, isDirty]);

  if (!isOpen) return null;

  // Drawer layouts vs Modal layouts styling
  const wrapperClass =
    type === 'drawer'
      ? `fixed inset-y-0 ${isRtl ? 'left-0 animate-slide-left' : 'right-0 animate-slide-right'} z-50 w-full ${maxWidthClass} bg-white dark:bg-[#111827] border-l dark:border-slate-800 shadow-2xl flex flex-col h-full`
      : `relative w-full ${maxWidthClass} mx-auto bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-zoom-in max-h-[90vh] flex flex-col z-50`;

  const overlayClass =
    type === 'drawer'
      ? 'fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex justify-end'
      : 'fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4';

  return (
    <div
      className={overlayClass}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleCloseAttempt();
        }
      }}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-container-title"
        className={wrapperClass}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/80 dark:bg-slate-900/50">
          <h3
            id="form-container-title"
            className="font-bold text-slate-900 dark:text-white text-sm sm:text-base"
          >
            {title}
          </h3>
          <button
            type="button"
            onClick={handleCloseAttempt}
            aria-label="Close form"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-150 dark:hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200 space-y-6">
          {children}
        </div>

        {/* Footer sticky bar */}
        {footer && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10">
            {footer}
          </div>
        )}

        {/* Dirty guard alert dialog */}
        <FormUnsavedChangesGuard
          showConfirm={showDiscardConfirm}
          onKeepEditing={() => setShowDiscardConfirm(false)}
          onDiscard={() => {
            setShowDiscardConfirm(false);
            onClose();
          }}
          lang={lang}
        />
      </div>
    </div>
  );
}
