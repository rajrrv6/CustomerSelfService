'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface DrawerWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  isRtl?: boolean;
  maxWidthClass?: string;
  noPadding?: boolean;
}

export function DrawerWrapper({
  isOpen,
  onClose,
  title,
  children,
  isRtl = false,
  maxWidthClass = 'max-w-md',
  noPadding = false
}: DrawerWrapperProps) {

  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Capture focused element for restoration
    const previousActiveElement = document.activeElement as HTMLElement | null;

    // Background scroll lock
    const activeOverlayCount = (window as any).__activeOverlayCount || 0;
    (window as any).__activeOverlayCount = activeOverlayCount + 1;
    if ((window as any).__activeOverlayCount === 1) {
      document.body.style.overflow = 'hidden';
    }

    // Escape to close
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Focus trapping
    const drawerElement = drawerRef.current;
    if (!drawerElement) return;

    const getFocusableElements = () => {
      return drawerElement.querySelectorAll(
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

      drawerElement.addEventListener('keydown', handleTab);
      cleanupTab = () => drawerElement.removeEventListener('keydown', handleTab);
      
      const timer = setTimeout(() => {
        first.focus();
      }, 50);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        if (cleanupTab) cleanupTab();
        clearTimeout(timer);

        // Decrement scroll lock counter
        (window as any).__activeOverlayCount = Math.max(0, ((window as any).__activeOverlayCount || 1) - 1);
        if ((window as any).__activeOverlayCount === 0) {
          document.body.style.overflow = '';
        }

        if (previousActiveElement) {
          setTimeout(() => {
            previousActiveElement.focus();
          }, 50);
        }
      };
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);

      // Decrement scroll lock counter
      (window as any).__activeOverlayCount = Math.max(0, ((window as any).__activeOverlayCount || 1) - 1);
      if ((window as any).__activeOverlayCount === 0) {
        document.body.style.overflow = '';
      }

      if (previousActiveElement) {
        setTimeout(() => {
          previousActiveElement.focus();
        }, 50);
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Mirror slide position based on RTL state
  const positionClass = isRtl
    ? 'left-0 border-r border-slate-200 dark:border-slate-800 animate-slide-in-left'
    : 'right-0 border-l border-slate-200 dark:border-slate-800 animate-slide-in-right';

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-fade-in"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className={`fixed inset-y-0 ${positionClass} flex w-full ${maxWidthClass} flex-col bg-white dark:bg-[#111827] shadow-2xl h-full overflow-hidden`}
      >
        {/* Drawer Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50/80 dark:bg-slate-900/50">
          {typeof title === 'string' ? (
            <h2 id="drawer-title" className="text-sm sm:text-base font-bold text-slate-800 dark:text-white truncate">
              {title}
            </h2>
          ) : (
            <div id="drawer-title" className="flex-1 min-w-0">
              {title}
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="rounded-lg p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className={`flex-1 min-h-0 text-slate-600 dark:text-slate-350 overscroll-contain ${noPadding ? 'flex flex-col' : 'p-6 overflow-y-auto'}`}>
          {children}
        </div>
      </div>
    </div>
  );
}

