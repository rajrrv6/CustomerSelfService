'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidthClass?: string; // e.g. 'max-w-md' or 'max-w-lg'
  hideCloseButton?: boolean;
  preventCloseOnOverlayClick?: boolean;
  preventCloseOnEsc?: boolean;
}

export function ModalWrapper({
  isOpen,
  onClose,
  title,
  children,
  maxWidthClass = 'max-w-md',
  hideCloseButton = false,
  preventCloseOnOverlayClick = false,
  preventCloseOnEsc = false
}: ModalWrapperProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Focus restoration: capture the active element before modal opens
    const previousActiveElement = document.activeElement as HTMLElement | null;

    // ESC close behavior
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !preventCloseOnEsc) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Focus trapping
    const modalElement = modalRef.current;
    if (!modalElement) return;

    const getFocusableElements = () => {
      return modalElement.querySelectorAll(
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

      modalElement.addEventListener('keydown', handleTab);
      cleanupTab = () => modalElement.removeEventListener('keydown', handleTab);

      // Delay focus slightly to let rendering stabilize
      const timer = setTimeout(() => {
        first.focus();
      }, 50);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        if (cleanupTab) cleanupTab();
        clearTimeout(timer);
        // Restore focus
        if (previousActiveElement) {
          setTimeout(() => {
            previousActiveElement.focus();
          }, 50);
        }
      };
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      // Restore focus
      if (previousActiveElement) {
        setTimeout(() => {
          previousActiveElement.focus();
        }, 50);
      }
    };
  }, [isOpen, onClose, preventCloseOnEsc]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && !preventCloseOnOverlayClick) onClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 w-full ${maxWidthClass} mx-auto rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl animate-zoom-in max-h-[90dvh] flex flex-col`}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/80 dark:bg-slate-900/50">
          <h3 id="modal-title" className="font-bold text-slate-800 dark:text-white text-sm sm:text-base">
            {title}
          </h3>
          {!hideCloseButton && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-150 dark:hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-slate-600 dark:text-slate-350">
          {children}
        </div>
      </div>
    </div>
  );
}

