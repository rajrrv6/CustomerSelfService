'use client';

import React from 'react';
import { PublicBotWidget } from '@/components/dashboard/PublicBotWidget';
import { ArrowLeft, Sparkles, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';

export default function PublicBotPage() {
  const { lang, theme, setLang, setTheme } = useApp();
  const isRtl = lang === 'ar';

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 transition-colors duration-200"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4" aria-label="Guest Bot Navbar">
          <div className="flex items-center gap-3">
            <Link href="/portal/public" className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200">
              <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold tracking-tight text-xs sm:text-sm">Farah AI Support Bot</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-500">
              <button type="button" onClick={() => setLang('en')} className={lang === 'en' ? 'text-blue-600' : 'hover:text-slate-800 dark:hover:text-white'}>
                EN
              </button>
              <span className="text-slate-300">|</span>
              <button type="button" onClick={() => setLang('ar')} className={lang === 'ar' ? 'text-blue-600' : 'hover:text-slate-800 dark:hover:text-white'}>
                ع
              </button>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label={isRtl ? 'تبديل المظهر' : 'Toggle theme'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </nav>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <PublicBotWidget />
        </div>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-[10px] text-slate-500">
        © 2026 AI-Native mPaaS · Guest Self-Service Center
      </footer>
    </div>
  );
}
