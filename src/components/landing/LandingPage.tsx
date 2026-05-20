'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Bot,
  Headphones,
  Shield,
  BarChart3,
  Globe,
  ArrowRight,
  Moon,
  Sun,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function LandingPage() {
  const { lang, theme, setLang, setTheme } = useApp();
  const isRtl = lang === 'ar';

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 start-1/4 w-[480px] h-[480px] rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 end-1/4 w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/50 backdrop-blur-md">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4" aria-label="Main">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold tracking-tight">AI-Native mPaaS</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center gap-1 text-sm font-medium text-slate-500">
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-lg shadow-blue-500/20 transition-colors"
            >
              {isRtl ? 'تسجيل الدخول' : 'Sign In'}
              <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </Link>
          </div>
        </nav>
      </header>

      <main className="relative z-10 flex-1">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 mb-6">
              <Globe className="w-3.5 h-3.5" />
              {isRtl ? 'منصة تجربة عملاء مدعومة بالذكاء الاصطناعي' : 'AI-native omnichannel CX platform'}
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
              {isRtl ? (
                <>
                  أتمتة الدعم، وتمكين الوكلاء،{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-l from-blue-600 to-indigo-500">
                    وقياس كل تفاعل
                  </span>
                </>
              ) : (
                <>
                  Orchestrate AI bots, agent workspaces, and{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
                    customer self-service
                  </span>{' '}
                  in one control plane
                </>
              )}
            </h1>
            <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
              {isRtl
                ? 'منصة mPaaS موحدة لبناء مسارات الحوار، إدارة قواعد المعرفة RAG، مراقبة SLA، وتشغيل مراكز الاتصال متعددة القنوات — مع حوكمة أمنية على مستوى المؤسسة.'
                : 'Deploy dialog flows, RAG knowledge bases, unified agent inboxes, voice queues, and tenant guardrails from a single enterprise mPaaS — with RBAC, audit trails, and bilingual RTL-ready experiences.'}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="/login"
                className="inline-flex justify-center items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xl shadow-blue-500/25 transition-all"
              >
                {isRtl ? 'الدخول إلى مساحة العمل' : 'Enter secure workspace'}
                <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Bot,
                title: isRtl ? 'روبوتات ومسارات ذكية' : 'AI bots & dialog flows',
                desc: isRtl
                  ? 'منشئ مسارات مرئي، نوايا، وحراس أمان للمحتوى.'
                  : 'Visual workflow builder, intents, and content guardrails.',
              },
              {
                icon: Headphones,
                title: isRtl ? 'مساحة عمل موحدة' : 'Unified agent workspace',
                desc: isRtl
                  ? 'صندوق وارد، رد ذكي، صوت SIP، ولوحة مشرف.'
                  : 'Inbox, AI reply, SIP voice, and supervisor monitoring.',
              },
              {
                icon: Shield,
                title: isRtl ? 'حوكمة المستأجر' : 'Tenant governance',
                desc: isRtl
                  ? 'RBAC، سجلات تدقيق، وعزل بيانات متعدد المستأجرين.'
                  : 'RBAC, immutable audit logs, and multi-tenant isolation.',
              },
              {
                icon: BarChart3,
                title: isRtl ? 'تحليلات وتكلفة' : 'Analytics & cost control',
                desc: isRtl
                  ? 'مقارنة نماذج LLM، CSAT، ومؤشرات SLA عبر القنوات.'
                  : 'LLM cost benchmarks, CSAT, and SLA dashboards.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <article
                key={title}
                className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h2 className="font-bold text-slate-900 dark:text-white">{title}</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-900 dark:to-indigo-950 p-8 sm:p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.15),transparent_60%)]" aria-hidden />
            <h2 className="relative text-2xl sm:text-3xl font-bold">
              {isRtl ? 'جاهز لتشغيل تجربة العملاء الذكية؟' : 'Ready to operate your AI-native CX stack?'}
            </h2>
            <p className="relative mt-3 text-slate-300 max-w-xl mx-auto text-sm sm:text-base">
              {isRtl
                ? 'سجّل الدخول بحساب مؤسستك. يدعم النظام المصادقة متعددة العوامل والتوجيه حسب الدور.'
                : 'Sign in with your organization account. MFA and role-based routing are built into the platform experience.'}
            </p>
            <Link
              href="/login"
              className="relative inline-flex mt-8 items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-100 transition-colors"
            >
              {isRtl ? 'ابدأ الآن' : 'Get started'}
              <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-slate-200 dark:border-slate-800 py-8 text-center text-xs text-slate-500">
        © 2026 AI-Native mPaaS · Omnichannel Customer Self-Service
      </footer>
    </div>
  );
}
