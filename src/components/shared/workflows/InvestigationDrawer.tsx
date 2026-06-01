'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface InvestigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  titleAr?: string;
  isRtl?: boolean;
  tabs: {
    id: string;
    labelEn: string;
    labelAr: string;
    content: React.ReactNode;
  }[];
  activeTabId: string;
  setActiveTabId: (id: string) => void;
}

export function InvestigationDrawer({
  isOpen,
  onClose,
  title,
  titleAr,
  isRtl = false,
  tabs,
  activeTabId,
  setActiveTabId,
}: InvestigationDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Esc key down listener for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Trap focus within the drawer when open
  useEffect(() => {
    if (!isOpen) return;
    const focusableElementsString =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const drawer = drawerRef.current;
    if (!drawer) return;

    const focusableElements = drawer.querySelectorAll<HTMLElement>(focusableElementsString);
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];

    const handleFocusTrap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusableElement) {
          lastFocusableElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusableElement) {
          firstFocusableElement?.focus();
          e.preventDefault();
        }
      }
    };

    drawer.addEventListener('keydown', handleFocusTrap);
    firstFocusableElement?.focus();

    return () => {
      drawer.removeEventListener('keydown', handleFocusTrap);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm transition-opacity" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Backdrop area click to close */}
      <div className="absolute inset-0 cursor-default" onClick={onClose} />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        className={`relative w-full max-w-xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-out border-l border-slate-200 dark:border-slate-800 ${
          isRtl ? 'left-0 border-r border-l-0' : 'right-0'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={isRtl && titleAr ? titleAr : title}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {isRtl && titleAr ? titleAr : title}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
            aria-label={isRtl ? 'إغلاق' : 'Close drawer'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 bg-slate-50 dark:bg-slate-950">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all relative outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 ${
                  isActive
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {isRtl ? tab.labelAr : tab.labelEn}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {tabs.find((tab) => tab.id === activeTabId)?.content}
        </div>
      </div>
    </div>
  );
}

export default InvestigationDrawer;
