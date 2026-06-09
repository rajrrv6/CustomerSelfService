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
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

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
              {mounted ? (
                theme === 'dark' ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )
              ) : (
                <div className="w-4 h-4" />
              )}
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

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-10 space-y-10">
        {/* Modernized Hero Section with Bright Enterprise Gradient */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white rounded-3xl p-8 sm:p-10 text-center space-y-4 shadow-xl border border-white/10">
          {/* Subtle Ambient Glow Orbs */}
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-indigo-400/20 blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          
          {/* Soft Technical Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />
          
          <div className="relative z-10 space-y-4">
            <span className="inline-flex items-center px-3 py-1 bg-white/15 text-white border border-white/20 rounded-full text-[10px] font-bold tracking-wider uppercase backdrop-blur-md">
              {isRtl ? 'الخدمة الذاتية للزوار' : 'Guest Self-Service'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-b from-white to-blue-50 bg-clip-text text-transparent leading-tight">
              {isRtl ? 'كيف يمكننا مساعدتك اليوم؟' : 'How can we help you today?'}
            </h2>
            <p className="text-xs sm:text-sm text-blue-50/90 max-w-lg mx-auto leading-relaxed font-medium">
              {isRtl 
                ? 'تصفح مقالات المعرفة، وتواصل مع مساعدنا الذكي، أو اطلب مكالمة هاتفية فورية دون الحاجة إلى إنشاء حساب.'
                : 'Browse knowledge articles, chat with our AI assistant, or request a phone callback immediately without creating an account.'}
            </p>
          </div>
        </div>

        {/* Support Cards Modernization */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link
            href="/kb"
            className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/85 rounded-2xl p-6 hover:shadow-lg hover:shadow-slate-100 dark:hover:shadow-none hover:-translate-y-0.5 hover:border-blue-500 dark:hover:border-blue-500/80 transition-all duration-300 block text-start group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-105 transition-transform duration-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {t.portal.homeHero.knowledgeHubTitle}
            </h4>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed mt-2">
              {t.portal.homeHero.knowledgeHubDesc}
            </p>
            <div className="pt-3 flex items-center gap-1.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
              <span>{isRtl ? 'تصفح المقالات' : 'Browse Articles'}</span>
              <span className={`transition-transform duration-200 group-hover:translate-x-1 ${isRtl ? 'rotate-180' : ''}`}>→</span>
            </div>
          </Link>

          <Link
            href="/bot"
            className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/85 rounded-2xl p-6 hover:shadow-lg hover:shadow-slate-100 dark:hover:shadow-none hover:-translate-y-0.5 hover:border-emerald-500 dark:hover:border-emerald-500/80 transition-all duration-300 block text-start group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-105 transition-transform duration-300">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              Farah AI Support Chat
            </h4>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed mt-2">
              {isRtl ? 'اطرح الأسئلة وتتبع طلباتك عبر ويدجت الذكاء الاصطناعي.' : 'Ask product Q&A, find resources, or lookup orders using our AI chatbot.'}
            </p>
            <div className="pt-3 flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              <span>{isRtl ? 'ابدأ المحادثة' : 'Start Chat'}</span>
              <span className={`transition-transform duration-200 group-hover:translate-x-1 ${isRtl ? 'rotate-180' : ''}`}>→</span>
            </div>
          </Link>

          <Link
            href="/callback"
            className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/85 rounded-2xl p-6 hover:shadow-lg hover:shadow-slate-100 dark:hover:shadow-none hover:-translate-y-0.5 hover:border-indigo-500 dark:hover:border-indigo-500/80 transition-all duration-300 block text-start group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 group-hover:scale-105 transition-transform duration-300">
              <PhoneCall className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {t.portal.homeHero.voiceSchedulingTitle}
            </h4>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed mt-2">
              {t.portal.homeHero.voiceSchedulingDesc}
            </p>
            <div className="pt-3 flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
              <span>{isRtl ? 'حجز اتصال صوتي' : 'Schedule Call'}</span>
              <span className={`transition-transform duration-200 group-hover:translate-x-1 ${isRtl ? 'rotate-180' : ''}`}>→</span>
            </div>
          </Link>
        </div>

        {/* Polished Guest -> Auth transition CTA box */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 text-center space-y-4 shadow-sm">
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
            {isRtl ? 'هل تحتاج إلى تتبع التذاكر السابقة؟' : 'Need to track support tickets?'}
          </h4>
          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            {isRtl
              ? 'قم بتسجيل الدخول إلى حسابك الخاص للاطلاع على التذاكر النشطة وسجلات المحادثات الكاملة.'
              : 'Sign in to your customer support account to manage active cases, review history, and submit tickets.'}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/login"
              className="px-5 py-2.5 bg-blue-650 hover:bg-blue-700 text-white rounded-xl text-[10px] font-bold shadow-md shadow-blue-500/10 transition-all active:scale-95"
            >
              {isRtl ? 'تسجيل الدخول الدعم' : 'Sign In to Helpdesk'}
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 border border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-[10px] font-bold transition-all text-slate-700 dark:text-slate-350"
            >
              {isRtl ? 'إنشاء حساب جديد' : 'Register Account'}
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200/60 dark:border-slate-800/80 py-6 text-center text-[10px] text-slate-500 dark:text-slate-500">
        © 2026 AI-Native mPaaS · Guest Self-Service Center
      </footer>
    </div>
  );
}
