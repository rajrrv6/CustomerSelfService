'use client';

import React from 'react';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';

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

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title={t.portal.callback.modalTitle} maxWidthClass="max-w-sm">
      <form onSubmit={handleScheduleCallback} className="space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
        <div>
          <label className="block text-slate-500 dark:text-slate-400 mb-1.5">{t.portal.callback.phoneLabel}</label>
          <input
            type="text"
            required
            placeholder="+966 50 123 4567"
            value={callbackPhone}
            onChange={(e) => setCallbackPhone(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 font-mono text-slate-800 dark:text-slate-100"
          />
        </div>

        <div>
          <label className="block text-slate-500 dark:text-slate-400 mb-1.5">{t.portal.callback.timeLabel}</label>
          <select
            value={callbackTime}
            onChange={(e) => setCallbackTime(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-350 dark:bg-slate-900"
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
          <button type="submit" className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md focus-visible:ring-2 focus-visible:ring-blue-500 outline-none cursor-pointer">
            {t.portal.callback.book}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
