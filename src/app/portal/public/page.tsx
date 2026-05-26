'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, BookOpen, MessageSquare, PhoneCall, ArrowLeft, Sun, Moon } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';

export default function PublicPortalPage() {
  const { lang, theme, setLang, setTheme } = useApp();
  const t = translations[lang];
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
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4" aria-label="Guest Navbar">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200">
              <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold tracking-tight text-xs sm:text-sm">Guest Helpdesk Portal</span>
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
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 text-xs font-bold transition-all"
            >
              {isRtl ? 'تسجيل الدخول' : 'Sign In'}
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 space-y-8">
        <div className="bg-linear-to-r from-blue-600 to-indigo-750 text-white rounded-3xl p-8 text-center space-y-3.5 shadow-lg shadow-blue-500/10">
          <span className="px-3 py-1 bg-white/15 rounded-full text-[10px] font-bold backdrop-blur-md font-mono">
            {isRtl ? 'الخدمة الذاتية للزوار' : 'Guest Self-Service'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {isRtl ? 'كيف يمكننا مساعدتك اليوم؟' : 'How can we help you today?'}
          </h2>
          <p className="text-xs text-blue-100 max-w-md mx-auto leading-relaxed">
            {isRtl 
              ? 'تصفح مقالات المعرفة، وتواصل مع مساعدنا الذكي، أو اطلب مكالمة هاتفية فورية دون الحاجة إلى إنشاء حساب.'
              : 'Browse knowledge articles, chat with our AI assistant, or request a phone callback immediately without creating an account.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Link
            href="/kb"
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-blue-500 transition-all text-left space-y-2.5 shadow-sm block group"
          >
            <BookOpen className="w-6 h-6 text-blue-500 group-hover:scale-110 transition-transform" />
            <h4 className="font-bold text-xs text-slate-850 dark:text-white">{t.portal.homeHero.knowledgeHubTitle}</h4>
            <p className="text-[10px] text-slate-450 dark:text-slate-400 font-normal leading-relaxed">{t.portal.homeHero.knowledgeHubDesc}</p>
          </Link>

          <Link
            href="/bot"
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-blue-500 transition-all text-left space-y-2.5 shadow-sm block group"
          >
            <MessageSquare className="w-6 h-6 text-emerald-500 group-hover:scale-110 transition-transform" />
            <h4 className="font-bold text-xs text-slate-850 dark:text-white">Farah AI Support Chat</h4>
            <p className="text-[10px] text-slate-455 dark:text-slate-400 font-normal leading-relaxed">
              {isRtl ? 'اطرح الأسئلة وتتبع طلباتك عبر ويدجت الذكاء الاصطناعي.' : 'Ask product Q&A, find resources, or lookup orders using our AI chatbot.'}
            </p>
          </Link>

          <Link
            href="/callback"
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-blue-500 transition-all text-left space-y-2.5 shadow-sm block group"
          >
            <PhoneCall className="w-6 h-6 text-indigo-500 group-hover:scale-110 transition-transform" />
            <h4 className="font-bold text-xs text-slate-855 dark:text-white">{t.portal.homeHero.voiceSchedulingTitle}</h4>
            <p className="text-[10px] text-slate-450 dark:text-slate-400 font-normal leading-relaxed">{t.portal.homeHero.voiceSchedulingDesc}</p>
          </Link>
        </div>

        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/10 p-5 text-center space-y-3">
          <h4 className="text-xs font-bold">{isRtl ? 'هل تحتاج إلى تتبع التذاكر السابقة؟' : 'Need to track support tickets?'}</h4>
          <p className="text-[10px] text-slate-400 max-w-sm mx-auto leading-relaxed">
            {isRtl
              ? 'قم بتسجيل الدخول إلى حسابك الخاص للاطلاع على التذاكر النشطة وسجلات المحادثات الكاملة.'
              : 'Sign in to your customer support account to manage active cases, review history, and submit tickets.'}
          </p>
          <div className="pt-1.5 flex justify-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 bg-blue-650 hover:bg-blue-700 text-white rounded-xl text-[10px] font-bold shadow-md transition-all active:scale-95"
            >
              {isRtl ? 'تسجيل الدخول الدعم' : 'Sign In to Helpdesk'}
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl text-[10px] font-bold transition-all"
            >
              {isRtl ? 'إنشاء حساب جديد' : 'Register Account'}
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-[10px] text-slate-500">
        © 2026 AI-Native mPaaS · Guest Self-Service Center
      </footer>
    </div>
  );
}
