'use client';

import React from 'react';
import { ModalWrapper } from '@/components/shared/ModalWrapper';

interface AccessibilityWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  fontSize: 'sm' | 'base' | 'lg';
  setFontSize: (sz: 'sm' | 'base' | 'lg') => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
}

export function AccessibilityWidget({
  isOpen,
  onClose,
  fontSize,
  setFontSize,
  highContrast,
  setHighContrast
}: AccessibilityWidgetProps) {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Accessibility Toolbox" maxWidthClass="max-w-sm">
      <div className="space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
        {/* High Contrast Toggle */}
        <div className="flex justify-between items-center">
          <span>High Contrast Palette</span>
          <button
            type="button"
            onClick={() => setHighContrast(!highContrast)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              highContrast ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-350'
            }`}
          >
            {highContrast ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {/* Font Size Selector */}
        <div>
          <label className="block text-slate-500 dark:text-slate-400 mb-1.5">Text Magnification Level</label>
          <div className="grid grid-cols-3 gap-2">
            {(['sm', 'base', 'lg'] as const).map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setFontSize(sz)}
                className={`py-1.5 rounded-xl border font-bold capitalize transition-all ${
                  fontSize === sz
                    ? 'border-blue-650 text-blue-600 bg-blue-500/10 dark:border-blue-500 dark:text-blue-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {sz === 'sm' ? 'Small' : sz === 'lg' ? 'Large' : 'Normal'}
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-150 dark:border-slate-850 text-[10px] text-slate-450 dark:text-slate-400 font-normal leading-normal">
          Keyboard Shortcuts: Use Tab to cycle between focus targets, and press Enter to select option buttons.
        </div>
      </div>
    </ModalWrapper>
  );
}
