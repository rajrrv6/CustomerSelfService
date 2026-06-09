'use client';

import React, { useState } from 'react';
import { ArrowLeft, Sparkles, PhoneCall, CheckCircle, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';
import { CallbackQueueCard } from '@/components/customer-portal/feedback/CallbackQueueCard';
import { useFeedbackToasts } from '@/components/customer-portal/feedback/PostChatToasts';

export default function PublicCallbackPage() {
  const { lang, theme, setLang, setTheme, addAuditLog } = useApp();
  const t = translations[lang];
  const isRtl = lang === 'ar';
  const { pushToast } = useFeedbackToasts();

  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackTime, setCallbackTime] = useState('As soon as possible');
  const [submittedPhone, setSubmittedPhone] = useState<string | null>(null);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('mPaaS_active_callback');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.phoneNumber && parsed.createdTimestamp) {
          const isExpired = Date.now() - parsed.createdTimestamp > 2 * 60 * 60 * 1000;
          if (isExpired) {
            localStorage.removeItem('mPaaS_active_callback');
          } else {
            setSubmittedPhone(parsed.phoneNumber);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load active callback from localStorage:', err);
    }
  }, []);

  const handleScheduleCallback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callbackPhone) return;

    addAuditLog(`Guest voice callback scheduled to line ${callbackPhone}`, 'success');
    setSubmittedPhone(callbackPhone);
    pushToast(
      'success',
      isRtl ? 'تم جدولة الاتصال' : 'Callback Scheduled',
      isRtl
        ? `سيتصل بك الوكيل على الرقم ${callbackPhone} في أقرب وقت ممكن.`
        : `An agent will call you at ${callbackPhone} soon.`
    );
    setCallbackPhone('');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 transition-colors duration-200"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4" aria-label="Guest Callback Navbar">
          <div className="flex items-center gap-3">
            <Link href="/portal/public" className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200">
              <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold tracking-tight text-xs sm:text-sm">{t.portal.callback.modalTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-500">
              <button type="button" onClick={() => setLang('en')} className={lang === 'en' ? 'text-blue-650' : 'hover:text-slate-800 dark:hover:text-white'}>
                EN
              </button>
              <span className="text-slate-300">|</span>
              <button type="button" onClick={() => setLang('ar')} className={lang === 'ar' ? 'text-blue-650' : 'hover:text-slate-800 dark:hover:text-white'}>
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
        {submittedPhone ? (
          <div className="w-full max-w-sm">
            <CallbackQueueCard
              lang={lang}
              phoneNumber={submittedPhone}
              onToastTrigger={pushToast}
              onDismiss={() => {
                setSubmittedPhone(null);
                localStorage.removeItem('mPaaS_active_callback');
              }}
              onClose={() => {
                setSubmittedPhone(null);
                localStorage.removeItem('mPaaS_active_callback');
              }}
            />
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-md max-w-sm w-full space-y-6">
            <div className="text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                <PhoneCall className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isRtl ? 'طلب اتصال صوتي سريع' : 'Schedule a Voice Callback'}
              </h2>
              <p className="text-[10px] text-slate-450 dark:text-slate-400 leading-relaxed">
                {isRtl
                  ? 'اترك رقم هاتفك وسيقوم وكيلنا التالي المتاح بالاتصال بك فوراً.'
                  : 'Leave your phone number and our next available support agent will call you back directly.'}
              </p>
            </div>

            <form onSubmit={handleScheduleCallback} className="space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <div>
                <label htmlFor="callback-phone" className="block text-slate-500 dark:text-slate-400 mb-1.5">{t.portal.callback.phoneLabel}</label>
                <input
                  id="callback-phone"
                  type="tel"
                  required
                  placeholder="+966 50 123 4567"
                  value={callbackPhone}
                  onChange={(e) => setCallbackPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 outline-none font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="callback-time" className="block text-slate-500 dark:text-slate-400 mb-1.5">{t.portal.callback.timeLabel}</label>
                <select
                  id="callback-time"
                  value={callbackTime}
                  onChange={(e) => setCallbackTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 outline-none text-slate-850 dark:text-slate-300 dark:bg-slate-900"
                >
                  <option value="As soon as possible">{t.portal.callback.timeSoonest}</option>
                  <option value="Morning">{t.portal.callback.timeMorning}</option>
                  <option value="Afternoon">{t.portal.callback.timeAfternoon}</option>
                  <option value="Evening">{t.portal.callback.timeEvening}</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-650 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
              >
                {t.portal.callback.book}
              </button>
            </form>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-[10px] text-slate-500">
        © 2026 AI-Native mPaaS · Guest Self-Service Center
      </footer>
    </div>
  );
}
