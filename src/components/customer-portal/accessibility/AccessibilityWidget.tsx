'use client';

import React, { useState, useEffect } from 'react';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';
import { Keyboard, HelpCircle, Eye, Info, VolumeX, EyeOff } from 'lucide-react';

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
  const { lang } = useApp();
  const t = translations[lang];
  const isRtl = lang === 'ar';

  const [reducedMotion, setReducedMotion] = useState(false);
  const [sepiaMode, setSepiaMode] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Load accessibility preferences
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const motionPref = localStorage.getItem('accessibility-reduced-motion') === 'true';
    const sepiaPref = localStorage.getItem('accessibility-sepia-mode') === 'true';
    setReducedMotion(motionPref);
    setSepiaMode(sepiaPref);
  }, []);

  // Sync reduced motion preference
  const toggleReducedMotion = () => {
    const newVal = !reducedMotion;
    setReducedMotion(newVal);
    localStorage.setItem('accessibility-reduced-motion', String(newVal));
    if (newVal) {
      document.documentElement.classList.add('motion-reduce');
      document.body.classList.add('motion-reduce');
    } else {
      document.documentElement.classList.remove('motion-reduce');
      document.body.classList.remove('motion-reduce');
    }
  };

  // Sync sepia mode
  const toggleSepiaMode = () => {
    const newVal = !sepiaMode;
    setSepiaMode(newVal);
    localStorage.setItem('accessibility-sepia-mode', String(newVal));
    if (newVal) {
      document.body.classList.add('sepia-mode');
      setHighContrast(false); // disable high contrast if sepia is enabled
    } else {
      document.body.classList.remove('sepia-mode');
    }
  };

  // Ensure style blocks exist in DOM for reduced motion and sepia mode
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Inject style tag if not exists
    let styleTag = document.getElementById('accessibility-global-styles');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'accessibility-global-styles';
      styleTag.innerHTML = `
        .motion-reduce, .motion-reduce * {
          transition-delay: 0s !important;
          transition-duration: 0s !important;
          animation-delay: 0s !important;
          animation-duration: 0s !important;
          animation-iteration-count: 1 !important;
          scroll-behavior: auto !important;
        }
        .sepia-mode {
          background-color: #f4ecd8 !important;
          color: #5b4636 !important;
        }
        .sepia-mode * {
          background-color: transparent !important;
          color: #5b4636 !important;
          border-color: #d3c2a0 !important;
        }
        .sepia-mode button, .sepia-mode input, .sepia-mode select, .sepia-mode textarea {
          background-color: #fcf8ee !important;
          border: 1px solid #5b4636 !important;
        }
        .sepia-mode hover-lift:hover {
          transform: none !important;
        }
      `;
      document.head.appendChild(styleTag);
    }
  }, []);

  const shortcutKeys = [
    { keys: ['⌘ / ⌃', 'K'], desc: isRtl ? 'فتح البحث الذكي العام' : 'Open Global Search Palette' },
    { keys: ['⌥ / Alt', 'A'], desc: isRtl ? 'فتح أدوات الوصول والتحكم' : 'Open Accessibility Toolbox' },
    { keys: ['⌥ / Alt', 'C'], desc: isRtl ? 'الانتقال إلى مساعد الذكاء الاصطناعي' : 'Navigate to AI Copilot' },
    { keys: ['⌥ / Alt', 'T'], desc: isRtl ? 'عرض تذاكري المفتوحة' : 'View Support Tickets' },
    { keys: ['⌥ / Alt', 'S'], desc: isRtl ? 'الانتقال إلى الإعدادات العامة' : 'Open System Settings' },
    { keys: ['ESC'], desc: isRtl ? 'إغلاق النوافذ المنبثقة والدرج' : 'Close modals and drawers' }
  ];

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title={t.portal.accessibility.modalTitle} maxWidthClass="max-w-md">
      <div className="space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
        
        {/* Toggle Option Groups */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* High Contrast Toggle */}
          <div className="flex flex-col justify-between p-3.5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2 transition-all duration-200 hover:border-blue-500/25 hover:bg-slate-50 dark:hover:bg-slate-900">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-500" />
              <span>{t.portal.accessibility.highContrast}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setHighContrast(!highContrast);
                if (!highContrast) setSepiaMode(false); // disable sepia if high contrast is enabled
              }}
              data-testid="high-contrast-toggle"
              className={`w-full py-2 rounded-xl font-bold transition-all cursor-pointer ${
                highContrast ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-300 dark:hover:bg-slate-755'
              }`}
            >
              {highContrast ? t.portal.accessibility.enabled : t.portal.accessibility.disabled}
            </button>
          </div>

          {/* Sepia Contrast Toggle */}
          <div className="flex flex-col justify-between p-3.5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2 transition-all duration-200 hover:border-amber-500/25 hover:bg-slate-50 dark:hover:bg-slate-900">
            <div className="flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-amber-500" />
              <span>{isRtl ? 'وضع السيبيا (الكلاسيكي)' : 'Sepia Contrast Mode'}</span>
            </div>
            <button
              type="button"
              onClick={toggleSepiaMode}
              className={`w-full py-2 rounded-xl font-bold transition-all cursor-pointer ${
                sepiaMode ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-300 dark:hover:bg-slate-755'
              }`}
            >
              {sepiaMode ? t.portal.accessibility.enabled : t.portal.accessibility.disabled}
            </button>
          </div>

          {/* Reduced Motion Toggle */}
          <div className="flex flex-col justify-between p-3.5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2 sm:col-span-2 transition-all duration-200 hover:border-rose-500/25 hover:bg-slate-50 dark:hover:bg-slate-900">
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-2">
                <VolumeX className="w-4 h-4 text-rose-500" />
                <span>{isRtl ? 'تقليل الحركة البصرية' : 'Reduced Motion Effect'}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-normal">{isRtl ? 'إيقاف التحركات والانتقالات' : 'Turns off transitions'}</span>
            </div>
            <button
              type="button"
              onClick={toggleReducedMotion}
              className={`w-full py-2 rounded-xl font-bold transition-all cursor-pointer ${
                reducedMotion ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-300 dark:hover:bg-slate-755'
              }`}
            >
              {reducedMotion ? t.portal.accessibility.enabled : t.portal.accessibility.disabled}
            </button>
          </div>

        </div>

        {/* Font Size Selector */}
        <div className="p-3.5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2 transition-all duration-200 hover:border-blue-500/25 hover:bg-slate-50 dark:hover:bg-slate-900">
          <label className="block text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[9px] font-mono">{t.portal.accessibility.fontSizeLabel}</label>
          <div className="grid grid-cols-3 gap-2">
            {(['sm', 'base', 'lg'] as const).map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setFontSize(sz)}
                data-testid={`font-size-${sz}`}
                className={`py-2 rounded-xl border font-bold capitalize transition-all cursor-pointer ${
                  fontSize === sz
                    ? 'border-blue-600 text-blue-600 bg-blue-500/10 dark:border-blue-500 dark:text-blue-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {sz === 'sm' ? t.portal.accessibility.fontSmall : sz === 'lg' ? t.portal.accessibility.fontLarge : t.portal.accessibility.fontNormal}
              </button>
            ))}
          </div>
        </div>

        {/* Keyboard Shortcuts Cheatsheet Toggle */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="w-full flex items-center justify-between p-3.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all font-bold cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-slate-500" />
              <span>{isRtl ? 'اختصارات لوحة المفاتيح' : 'Keyboard Shortcut Overlay'}</span>
            </div>
            <HelpCircle className="w-4 h-4 text-slate-400" />
          </button>

          {showShortcuts && (
            <div className="p-3 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 space-y-2 max-h-48 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
              {shortcutKeys.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-900 last:border-b-0 text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400">{item.desc}</span>
                  <div className="flex gap-1">
                    {item.keys.map((k, kIdx) => (
                      <kbd key={kIdx} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded text-[9px] font-mono text-slate-500 font-bold select-none">
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 bg-blue-500/5 dark:bg-blue-500/2 rounded-xl border border-blue-500/10 text-[10px] text-slate-450 dark:text-slate-400 font-normal leading-normal flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <span>{t.portal.accessibility.keyboardHint}</span>
        </div>
      </div>
    </ModalWrapper>
  );
}
