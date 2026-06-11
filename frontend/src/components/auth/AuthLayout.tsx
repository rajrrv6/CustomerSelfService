'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
  contentMaxWidthClassName?: string;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  badge,
  contentMaxWidthClassName = 'max-w-md',
}: AuthLayoutProps) {
  const { lang, theme, setLang, setTheme } = useApp();
  const isRtl = lang === 'ar';

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#030712] transition-colors"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <header className="flex justify-between items-center px-6 py-5 max-w-6xl w-full mx-auto">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div
            className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow"
            aria-hidden
          >
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
              {isRtl ? 'منصة mPaaS الذكية' : 'AI-Native mPaaS'}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              {isRtl ? 'تجربة العملاء الموحدة' : 'Omnichannel CX'}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3 text-xs font-semibold">
          <div
            className="flex bg-slate-200/80 dark:bg-slate-800/80 rounded-lg p-0.5 border border-slate-300/80 dark:border-slate-700"
            role="group"
            aria-label={isRtl ? 'اللغة' : 'Language'}
          >
            {(['en', 'ar'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  lang === l
                    ? 'bg-white dark:bg-slate-900 shadow-sm text-blue-600 dark:text-blue-400'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {l === 'en' ? 'EN' : 'ع'}
              </button>
            ))}
          </div>

          {mounted ? (
            <div
              className="flex bg-slate-200/80 dark:bg-slate-800/80 rounded-lg p-0.5 border border-slate-300/80 dark:border-slate-700"
              role="group"
              aria-label={isRtl ? 'المظهر' : 'Theme'}
            >
              {(['light', 'dark', 'system'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  className={`px-2.5 py-1.5 rounded-md transition-all ${
                    theme === t
                      ? 'bg-white dark:bg-slate-900 shadow-sm text-blue-600 dark:text-blue-400'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {t === 'light'
                    ? isRtl
                      ? 'فاتح'
                      : 'Light'
                    : t === 'dark'
                      ? isRtl
                        ? 'داكن'
                        : 'Dark'
                      : isRtl
                        ? 'نظام'
                        : 'Auto'}
                </button>
              ))}
            </div>
          ) : (
            <div className="h-9 w-[140px]" />
          )}
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className={`w-full ${contentMaxWidthClassName}`}>
          <div className="text-center mb-8">
            {badge && (
              <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 rounded-full mb-3">
                {badge}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          {children}
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-400 dark:text-slate-600">
        <p>© 2026 AI-Native mPaaS · Enterprise CX Platform</p>
      </footer>
    </div>
  );
}
