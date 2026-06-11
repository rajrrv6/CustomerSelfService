import React, { useEffect, useRef, useState } from 'react';
import { ShieldAlert, LogOut, RefreshCw } from 'lucide-react';

interface SessionTimeoutModalProps {
  isOpen: boolean;
  timeLeftSeconds: number; // e.g. 120 seconds
  onExtend: () => void;
  onLogout: () => void;
  lang: 'en' | 'ar';
}

export function SessionTimeoutModal({
  isOpen,
  timeLeftSeconds,
  onExtend,
  onLogout,
  lang,
}: SessionTimeoutModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [announcementText, setAnnouncementText] = useState('');

  // 1. Throttled ARIA Live announcements to prevent excessive voice reading
  useEffect(() => {
    if (!isOpen) return;

    const announcements: Record<number, string> = {
      120: lang === 'ar' ? 'جلسة العمل ستنتهي خلال دقيقتين.' : 'Session expires in 2 minutes.',
      90: lang === 'ar' ? 'جلسة العمل ستنتهي خلال دقيقة وثلاثين ثانية.' : 'Session expires in 1 minute and 30 seconds.',
      60: lang === 'ar' ? 'جلسة العمل ستنتهي خلال دقيقة واحدة.' : 'Session expires in 1 minute.',
      30: lang === 'ar' ? 'جلسة العمل ستنتهي خلال ثلاثين ثانية.' : 'Session expires in 30 seconds.',
      15: lang === 'ar' ? 'تحذير، ستنتهي الجلسة خلال خمسة عشر ثانية.' : 'Warning: Session expires in 15 seconds.',
      5: lang === 'ar' ? 'خمسة ثوانٍ متبقية.' : '5 seconds remaining.',
    };

    if (announcements[timeLeftSeconds]) {
      setAnnouncementText(announcements[timeLeftSeconds]);
      // Clear after a brief period to allow re-announcement
      const t = setTimeout(() => setAnnouncementText(''), 2000);
      return () => clearTimeout(t);
    }
  }, [timeLeftSeconds, isOpen, lang]);

  // 2. Keyboard Focus Trap
  useEffect(() => {
    if (!isOpen) return;

    const modal = modalRef.current;
    if (!modal) return;

    // Save previous active element
    const previousActive = document.activeElement;

    // Find all focusable elements
    const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = modal.querySelectorAll<HTMLElement>(focusableSelectors);

    if (focusableElements.length > 0) {
      // Focus first element
      focusableElements[0].focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExtend(); // Treat escape as extending for user safety, or keep open
        return;
      }

      if (e.key === 'Tab') {
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          // Tab
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      // Restore focus
      if (previousActive instanceof HTMLElement) {
        previousActive.focus();
      }
    };
  }, [isOpen, onExtend]);

  if (!isOpen) return null;

  const totalTime = 120; // Default warning start threshold
  const progressPercent = Math.max(0, Math.min(100, (timeLeftSeconds / totalTime) * 100));

  // Human friendly display
  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const timeString = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const t = {
    en: {
      alertTitle: 'Security Session Timeout',
      alertDesc: 'You have been inactive for a while. For your security, this session will expire automatically.',
      timeLeft: 'Time remaining:',
      extend: 'Keep Session Open',
      logout: 'Log Out Now',
    },
    ar: {
      alertTitle: 'انتهاء وقت الجلسة الأمني',
      alertDesc: 'لقد كنت غير نشط لفترة من الوقت. لحماية حسابك، ستنتهي هذه الجلسة تلقائياً.',
      timeLeft: 'الوقت المتبقي:',
      extend: 'إبقاء الجلسة نشطة',
      logout: 'تسجيل الخروج الآن',
    },
  }[lang] || {
    alertTitle: 'Security Session Timeout',
    alertDesc: 'You have been inactive for a while. For your security, this session will expire automatically.',
    timeLeft: 'Time remaining:',
    extend: 'Keep Session Open',
    logout: 'Log Out Now',
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/70 dark:bg-slate-950/85 backdrop-blur-xs z-50 transition-opacity animate-in fade-in duration-200" />

      {/* Screen Reader Announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcementText}
      </div>

      {/* Modal Dialog */}
      <div
        ref={modalRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="timeout-modal-title"
        aria-describedby="timeout-modal-desc"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-2xl z-50 space-y-5 animate-in zoom-in-95 duration-200"
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 bg-rose-500/15 text-rose-500 border border-rose-500/25 rounded-2xl flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 id="timeout-modal-title" className="font-extrabold text-sm text-slate-900 dark:text-white">
              {t.alertTitle}
            </h3>
            <p id="timeout-modal-desc" className="text-[10.5px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
              {t.alertDesc}
            </p>
          </div>
        </div>

        {/* Visual Progress Countdown */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 dark:text-slate-400 font-mono">
            <span>{t.timeLeft}</span>
            <span className="text-rose-500 text-xs font-black tracking-wider animate-pulse">{timeString}</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/40 dark:border-slate-700/50">
            <div
              className={`h-full transition-all duration-1000 rounded-full ${
                timeLeftSeconds <= 30
                  ? 'bg-rose-500 shadow-sm shadow-rose-500/40'
                  : timeLeftSeconds <= 60
                  ? 'bg-amber-500'
                  : 'bg-blue-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            type="button"
            onClick={onLogout}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 border border-slate-200 dark:border-slate-800 hover:border-rose-500 hover:text-rose-500 text-slate-550 dark:text-slate-400 rounded-xl text-xs font-bold transition-all cursor-pointer bg-slate-50/20"
          >
            <LogOut className="w-4 h-4" />
            <span>{t.logout}</span>
          </button>
          <button
            type="button"
            onClick={onExtend}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{t.extend}</span>
          </button>
        </div>
      </div>
    </>
  );
}
