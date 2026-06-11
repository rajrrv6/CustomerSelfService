'use client';

import React, { useState, useEffect } from 'react';
import { ToggleLeft, ToggleRight, CheckCircle, HelpCircle, Eye, ShieldAlert } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { 
  FOCUS_RING, INTERACTIVE_BTN_PRIMARY, INTERACTIVE_BTN_GHOST, SURFACE_PANEL 
} from '@/design-system/tokens';

export function AccessibilitySettings() {
  const { lang, addAuditLog } = useApp();
  const isRtl = lang === 'ar';

  const [highContrast, setHighContrast] = useState(false);
  const [keyboardHints, setKeyboardHints] = useState(true);
  const [screenReaderOpt, setScreenReaderOpt] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const contrastPref = localStorage.getItem('accessibility-high-contrast') === 'true';
    const hintsPref = localStorage.getItem('accessibility-keyboard-hints') !== 'false';
    const screenReaderPref = localStorage.getItem('accessibility-screen-reader') === 'true';
    const motionPref = localStorage.getItem('accessibility-reduced-motion') === 'true';

    setHighContrast(contrastPref);
    setKeyboardHints(hintsPref);
    setScreenReaderOpt(screenReaderPref);
    setIsReducedMotion(motionPref);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggle = (
    field: 'highContrast' | 'keyboardHints' | 'screenReaderOpt' | 'isReducedMotion'
  ) => {
    if (field === 'highContrast') {
      const nextVal = !highContrast;
      setHighContrast(nextVal);
      localStorage.setItem('accessibility-high-contrast', String(nextVal));
      if (nextVal) {
        document.documentElement.classList.add('high-contrast');
        document.body.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
        document.body.classList.remove('high-contrast');
      }
      addAuditLog(`Toggled high contrast accessibility mode: ${nextVal}`, 'success');
    } else if (field === 'keyboardHints') {
      const nextVal = !keyboardHints;
      setKeyboardHints(nextVal);
      localStorage.setItem('accessibility-keyboard-hints', String(nextVal));
      if (nextVal) {
        document.body.classList.add('show-keyboard-hints');
      } else {
        document.body.classList.remove('show-keyboard-hints');
      }
      addAuditLog(`Toggled accessibility keyboard hints: ${nextVal}`, 'success');
    } else if (field === 'screenReaderOpt') {
      const nextVal = !screenReaderOpt;
      setScreenReaderOpt(nextVal);
      localStorage.setItem('accessibility-screen-reader', String(nextVal));
      addAuditLog(`Toggled screen reader assistance mode: ${nextVal}`, 'success');
    } else if (field === 'isReducedMotion') {
      const nextVal = !isReducedMotion;
      setIsReducedMotion(nextVal);
      localStorage.setItem('accessibility-reduced-motion', String(nextVal));
      if (nextVal) {
        document.documentElement.classList.add('motion-reduce');
        document.body.classList.add('motion-reduce');
      } else {
        document.documentElement.classList.remove('motion-reduce');
        document.body.classList.remove('motion-reduce');
      }
      addAuditLog(`Toggled accessibility reduced motion: ${nextVal}`, 'success');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast(isRtl ? 'تم حفظ تفضيلات سهولة الوصول.' : 'Accessibility overrides saved.');
  };

  // Switch element helper
  const SwitchRow = ({
    checked,
    onChange,
    title,
    desc
  }: {
    checked: boolean;
    onChange: () => void;
    title: string;
    desc: string;
  }) => (
    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 flex items-center justify-between">
      <div className="space-y-0.5 max-w-[80%]">
        <span className="block text-slate-900 dark:text-white text-xs font-extrabold">{title}</span>
        <span className="block text-[10px] text-slate-400 font-normal leading-relaxed">{desc}</span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`cursor-pointer ${INTERACTIVE_BTN_GHOST} ${FOCUS_RING}`}
        aria-label={title}
      >
        {checked ? (
          <ToggleRight className="w-10 h-10 text-blue-600" />
        ) : (
          <ToggleLeft className="w-10 h-10 text-slate-350 dark:text-slate-700" />
        )}
      </button>
    </div>
  );

  return (
    <form 
      onSubmit={handleSave}
      className={`p-6 rounded-3xl border text-slate-800 dark:text-slate-200 space-y-6 ${SURFACE_PANEL}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Title */}
      <div>
        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
          {isRtl ? 'إعدادات الوصول الرقمي (Accessibility)' : 'Accessibility Compliance Settings'}
        </h4>
        <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
          {isRtl 
            ? 'تفعيل خيارات التباين العالي، مؤشرات الاختصارات والميزات المتوافقة مع قارئات الشاشة.' 
            : 'Configure high contrast, reduced motion, focus indicators, and screen reader markup adjustments.'}
        </span>
      </div>

      {/* Switches list */}
      <div className="space-y-4 font-semibold text-xs">
        {/* High Contrast */}
        <SwitchRow
          checked={highContrast}
          onChange={() => handleToggle('highContrast')}
          title={isRtl ? 'تباين ألوان عالٍ (High Contrast)' : 'High Contrast Borders & Text'}
          desc={isRtl 
            ? 'يزيد من تباين الألوان وعرض حدود عناصر الواجهة لتسهيل القراءة.' 
            : 'Enhances container border definitions and text opacity thresholds for high readability.'}
        />

        {/* Reduced Motion */}
        <SwitchRow
          checked={isReducedMotion}
          onChange={() => handleToggle('isReducedMotion')}
          title={isRtl ? 'تقليل تأثيرات الحركة' : 'Reduced Motion Override'}
          desc={isRtl 
            ? 'يقوم بتعطيل الحركات والانتقالات في جميع عناصر البوابة.' 
            : 'Overrides and silences all micro-animations and transition durations globally.'}
        />

        {/* Keyboard Hints */}
        <SwitchRow
          checked={keyboardHints}
          onChange={() => handleToggle('keyboardHints')}
          title={isRtl ? 'تلميحات اختصارات لوحة المفاتيح' : 'Keyboard Shortcut Hints'}
          desc={isRtl 
            ? 'إظهار مفاتيح الاختصار المرئية بجانب الأزرار لتبسيط التصفح.' 
            : 'Render small shortcut badges next to interactive tabs and callback modals.'}
        />

        {/* Screen Reader Optimization */}
        <SwitchRow
          checked={screenReaderOpt}
          onChange={() => handleToggle('screenReaderOpt')}
          title={isRtl ? 'تحسينات قارئ الشاشة' : 'Screen Reader Optimizations'}
          desc={isRtl 
            ? 'تضمين علامات ARIA إضافية وتحويل أرقام الـ IP والتذاكر لنطق أوضح.' 
            : 'Forces descriptive text labels on pure icons and formats system codes for optimal reading.'}
        />
      </div>

      {/* Keyboard Shortcuts Quick Guide */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 rounded-2xl space-y-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-blue-500" />
          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">
            {isRtl ? 'اختصارات لوحة المفاتيح السريعة' : 'Global Keyboard Navigation Guide'}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-[10.5px] text-slate-600 dark:text-slate-400 font-mono font-medium">
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-200/40 dark:border-slate-800/45">
            <span>{isRtl ? 'فتح مركز المساعدة' : 'KB Hub Search'}</span>
            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-850 rounded border border-slate-300 dark:border-slate-700 text-[9px] font-bold">Alt + K</kbd>
          </div>
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-200/40 dark:border-slate-800/45">
            <span>{isRtl ? 'تقديم تذكرة دعم' : 'Submit Ticket'}</span>
            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-850 rounded border border-slate-300 dark:border-slate-700 text-[9px] font-bold">Alt + N</kbd>
          </div>
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-200/40 dark:border-slate-800/45">
            <span>{isRtl ? 'مساعد فرح الذكي' : 'Farah AI Assist'}</span>
            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-850 rounded border border-slate-300 dark:border-slate-700 text-[9px] font-bold">Alt + A</kbd>
          </div>
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-200/40 dark:border-slate-800/45">
            <span>{isRtl ? 'طلب اتصال صوتي' : 'Request Callback'}</span>
            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-850 rounded border border-slate-300 dark:border-slate-700 text-[9px] font-bold">Alt + C</kbd>
          </div>
        </div>
      </div>

      {/* Submit button */}
      <div className="pt-2">
        <button
          type="submit"
          className={`w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-lg shadow-blue-500/15 text-center cursor-pointer transition-all ${INTERACTIVE_BTN_PRIMARY}`}
        >
          {isRtl ? 'حفظ تفضيلات سهولة الوصول' : 'Save Accessibility Settings'}
        </button>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-950 border border-slate-800 text-white font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-[10px] font-mono animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </form>
  );
}
