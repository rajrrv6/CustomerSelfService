'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon, Laptop, Eye, CheckCircle, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useUIStore } from '@/stores/uiStore';
import { 
  FOCUS_RING, INTERACTIVE_BTN_PRIMARY, INTERACTIVE_BTN_GHOST, SURFACE_PANEL 
} from '@/design-system/tokens';
import { ACCENT_COLORS } from '../personalization/constants';

export function AppearanceSettings() {
  const { lang, addAuditLog } = useApp();
  const { theme, setTheme } = useUIStore();
  const isRtl = lang === 'ar';

  const [fontSize, setFontSizeState] = useState<'sm' | 'base' | 'lg'>('base');
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [accent, setAccent] = useState('blue');
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize states on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sizePref = (localStorage.getItem('accessibility-font-size') as any) ?? 'base';
    const motionPref = localStorage.getItem('accessibility-reduced-motion') === 'true';
    const accentPref = localStorage.getItem('appearance-accent-color') ?? 'blue';
    const densityPref = (localStorage.getItem('appearance-display-density') as any) ?? 'comfortable';

    setFontSizeState(sizePref);
    setIsReducedMotion(motionPref);
    setAccent(accentPref);
    setDensity(densityPref);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Font size configuration change
  const handleFontSizeChange = (sz: 'sm' | 'base' | 'lg') => {
    setFontSizeState(sz);
    localStorage.setItem('accessibility-font-size', sz);
    document.body.classList.remove('portal-scale-sm', 'portal-scale-lg', 'accessibility-font-sm', 'accessibility-font-lg');
    if (sz === 'sm') {
      document.body.classList.add('portal-scale-sm', 'accessibility-font-sm');
    } else if (sz === 'lg') {
      document.body.classList.add('portal-scale-lg', 'accessibility-font-lg');
    }
    addAuditLog(`Changed font size scaling to: ${sz}`, 'success');
  };

  // Reduced motion toggle
  const handleMotionChange = () => {
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
    addAuditLog(`Toggled reduced motion setting: ${nextVal}`, 'success');
  };

  const handleSaveAppearance = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('appearance-accent-color', accent);
    localStorage.setItem('appearance-display-density', density);
    
    // Apply visual classes for display density
    if (density === 'compact') {
      document.body.classList.add('portal-density-compact');
    } else {
      document.body.classList.remove('portal-density-compact');
    }

    addAuditLog(`Updated appearance configuration: Accent=${accent}, Density=${density}`, 'success');
    triggerToast(isRtl ? 'تم حفظ التفضيلات المرئية بنجاح.' : 'Visual appearance settings saved.');
  };

  return (
    <form 
      onSubmit={handleSaveAppearance}
      className={`p-6 rounded-3xl border text-slate-800 dark:text-slate-200 space-y-6 ${SURFACE_PANEL}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Title */}
      <div>
        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
          {isRtl ? 'تفضيلات المظهر والسمات المرئية' : 'Visual Preferences & Themes'}
        </h4>
        <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
          {isRtl 
            ? 'اضبط مظهر شاشتك، ألوان التمييز، حجم الخط ومستويات الكثافة البصرية للمنصة.' 
            : 'Customize visual theme modes, color accents, display densities, and motion parameters.'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Theme mode cards */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl space-y-3 sm:col-span-2">
          <label className="block text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider">
            {isRtl ? 'وضع المظهر العام' : 'Interface Theme Mode'}
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { val: 'light', labelEN: 'Light', labelAR: 'مضيء', icon: <Sun className="w-4 h-4" /> },
              { val: 'dark', labelEN: 'Dark', labelAR: 'داكن', icon: <Moon className="w-4 h-4" /> },
              { val: 'system', labelEN: 'System', labelAR: 'النظام', icon: <Laptop className="w-4 h-4" /> }
            ].map(item => (
              <button
                key={item.val}
                type="button"
                onClick={() => setTheme(item.val as any)}
                className={`py-3 border rounded-xl font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  theme === item.val
                    ? 'border-blue-600 bg-blue-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                } ${FOCUS_RING}`}
              >
                {item.icon}
                <span className="text-[10px]">{isRtl ? item.labelAR : item.labelEN}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Accent color tiles */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl space-y-3">
          <label className="block text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider">
            {isRtl ? 'لون التمييز النشط' : 'Accent Accent Color'}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {ACCENT_COLORS.map(col => (
              <button
                key={col.value}
                type="button"
                onClick={() => setAccent(col.value)}
                className={`w-full h-10 rounded-xl relative flex items-center justify-center transition-all ${col.colorClass} border border-black/15 dark:border-white/10 hover:scale-105 cursor-pointer ${FOCUS_RING}`}
                title={col.label}
              >
                {accent === col.value && (
                  <span className="w-2.5 h-2.5 bg-white rounded-full shadow-sm" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Display Density */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl space-y-3">
          <label className="block text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider">
            {isRtl ? 'الكثافة البصرية' : 'Display Density'}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { val: 'comfortable', labelEN: 'Comfortable', labelAR: 'مريح' },
              { val: 'compact', labelEN: 'Compact', labelAR: 'مدمج' }
            ].map(item => (
              <button
                key={item.val}
                type="button"
                onClick={() => setDensity(item.val as any)}
                className={`py-2 border rounded-xl font-bold transition-all cursor-pointer text-xs ${
                  density === item.val
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100'
                } ${FOCUS_RING}`}
              >
                {isRtl ? item.labelAR : item.labelEN}
              </button>
            ))}
          </div>
        </div>

        {/* Font Scaling Buttons */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl space-y-3 sm:col-span-2">
          <label className="block text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider">
            {isRtl ? 'تدرج حجم الخط' : 'Typography Scale'}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { val: 'sm', labelEN: 'Small', labelAR: 'صغير' },
              { val: 'base', labelEN: 'Normal', labelAR: 'افتراضي' },
              { val: 'lg', labelEN: 'Large', labelAR: 'كبير' }
            ].map(item => (
              <button
                key={item.val}
                type="button"
                onClick={() => handleFontSizeChange(item.val as any)}
                className={`py-2 border rounded-xl font-bold transition-all cursor-pointer text-xs ${
                  fontSize === item.val
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100'
                } ${FOCUS_RING}`}
              >
                {isRtl ? item.labelAR : item.labelEN}
              </button>
            ))}
          </div>
        </div>

        {/* Motion Preference Toggle */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl flex items-center justify-between sm:col-span-2">
          <div className="space-y-0.5">
            <h5 className="font-extrabold text-[12px] text-slate-800 dark:text-slate-200">
              {isRtl ? 'تقليل الحركة البصرية للمتصفح' : 'Reduced Motion'}
            </h5>
            <span className="text-[10px] text-slate-400 font-normal block">
              {isRtl 
                ? 'تعطيل الحركات المعقدة وتأثيرات التحميل للمتصفحات البطيئة.' 
                : 'Disables complex micro-animations and transition delays.'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleMotionChange}
            className={`cursor-pointer ${INTERACTIVE_BTN_GHOST} ${FOCUS_RING}`}
            aria-label={isRtl ? 'تبديل تقليل الحركة' : 'Toggle reduced motion'}
          >
            {isReducedMotion ? (
              <ToggleRight className="w-10 h-10 text-blue-600" />
            ) : (
              <ToggleLeft className="w-10 h-10 text-slate-300 dark:text-slate-700" />
            )}
          </button>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2">
        <button
          type="submit"
          className={`w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-lg shadow-blue-500/15 text-center cursor-pointer transition-all ${INTERACTIVE_BTN_PRIMARY}`}
        >
          {isRtl ? 'حفظ تفضيلات المظهر' : 'Save Appearance Customizations'}
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
