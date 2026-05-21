'use client';

import React from 'react';
import { ModalWrapper } from '@/components/shared/ModalWrapper';

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
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Schedule Outbound Callback" maxWidthClass="max-w-sm">
      <form onSubmit={handleScheduleCallback} className="space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
        <div>
          <label className="block text-slate-500 dark:text-slate-400 mb-1.5">Callback Line Phone Number</label>
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
          <label className="block text-slate-500 dark:text-slate-400 mb-1.5">Preferred Time Window</label>
          <select
            value={callbackTime}
            onChange={(e) => setCallbackTime(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-350 dark:bg-slate-900"
          >
            <option>As soon as possible (under 15m)</option>
            <option>Morning (09:00 - 12:00 AST)</option>
            <option>Afternoon (12:00 - 15:00 AST)</option>
            <option>Evening (15:00 - 18:00 AST)</option>
          </select>
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button type="submit" className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md focus-visible:ring-2 focus-visible:ring-blue-500 outline-none cursor-pointer">
            Book Callback
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
