'use client';

import React, { useState, useEffect } from 'react';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';
import { CallbackQueueCard } from '../feedback/CallbackQueueCard';
import { useFeedbackToasts } from '../feedback/PostChatToasts';

interface CallbackRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  callbackPhone: string;
  setCallbackPhone: (val: string) => void;
  callbackTime: string;
  setCallbackTime: (val: string) => void;
  handleScheduleCallback: (e: React.FormEvent) => void;
}

export function CallbackRequestModal({
  isOpen,
  onClose,
  callbackPhone,
  setCallbackPhone,
  callbackTime,
  setCallbackTime,
  handleScheduleCallback
}: CallbackRequestModalProps) {
  const { lang } = useApp();
  const t = translations[lang];
  const { pushToast } = useFeedbackToasts();
  const [submittedPhone, setSubmittedPhone] = useState<string | null>(null);

  // Reset submitted phone state when modal is closed or reopened
  useEffect(() => {
    if (!isOpen) {
      setSubmittedPhone(null);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callbackPhone) return;
    setSubmittedPhone(callbackPhone);
    handleScheduleCallback(e);
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={submittedPhone ? (lang === 'ar' ? 'حالة حجز الاتصال الصوتي' : 'Callback Queue Status') : t.portal.callback.modalTitle}
      maxWidthClass="max-w-sm"
    >
      {submittedPhone ? (
        <div className="py-2">
          <CallbackQueueCard
            lang={lang}
            phoneNumber={submittedPhone}
            onToastTrigger={pushToast}
          />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
          <div>
            <label htmlFor="callback-phone-input" className="block text-slate-500 dark:text-slate-400 mb-1.5">{t.portal.callback.phoneLabel}</label>
            <input
              id="callback-phone-input"
              type="text"
              required
              placeholder="+966 50 123 4567"
              value={callbackPhone}
              onChange={(e) => setCallbackPhone(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none font-mono text-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label htmlFor="callback-time-select" className="block text-slate-500 dark:text-slate-400 mb-1.5">{t.portal.callback.timeLabel}</label>
            <select
              id="callback-time-select"
              value={callbackTime}
              onChange={(e) => setCallbackTime(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none text-slate-800 dark:text-slate-355 dark:bg-slate-900"
            >
              <option value="As soon as possible">{t.portal.callback.timeSoonest}</option>
              <option value="Morning">{t.portal.callback.timeMorning}</option>
              <option value="Afternoon">{t.portal.callback.timeAfternoon}</option>
              <option value="Evening">{t.portal.callback.timeEvening}</option>
            </select>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              {t.portal.callback.cancel}
            </button>
            <button type="submit" className="px-4 py-2.5 bg-blue-650 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md focus-visible:ring-2 focus-visible:ring-blue-500 outline-none cursor-pointer">
              {t.portal.callback.book}
            </button>
          </div>
        </form>
      )}
    </ModalWrapper>
  );
}
