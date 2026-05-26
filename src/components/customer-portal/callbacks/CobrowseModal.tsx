'use client';

import React from 'react';
import { Tv } from 'lucide-react';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';

interface CobrowseModalProps {
  isOpen: boolean;
  onClose: () => void;
  cobrowsePin: string;
  setCobrowsePin: (val: string) => void;
  cobrowseConnected: boolean;
  handleJoinCobrowse: (e: React.FormEvent) => void;
}

export function CobrowseModal({
  isOpen,
  onClose,
  cobrowsePin,
  setCobrowsePin,
  cobrowseConnected,
  handleJoinCobrowse
}: CobrowseModalProps) {
  const { lang } = useApp();
  const t = translations[lang];

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title={t.portal.cobrowse.modalTitle} maxWidthClass="max-w-sm">
      <form onSubmit={handleJoinCobrowse} className="space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
        <p className="text-[11px] text-slate-450 dark:text-slate-455 font-normal leading-relaxed">
          {t.portal.cobrowse.instructions}
        </p>

        {cobrowseConnected ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Tv className="w-5 h-5" />
            </div>
            <span className="text-emerald-500 font-bold block">{t.portal.cobrowse.sessionActive}</span>
          </div>
        ) : (
          <>
            <div>
              <label htmlFor="cobrowse-pin-input" className="block text-slate-500 dark:text-slate-400 mb-1.5">{t.portal.cobrowse.pinLabel}</label>
              <input
                id="cobrowse-pin-input"
                type="text"
                required
                placeholder="982-114"
                value={cobrowsePin}
                onChange={(e) => setCobrowsePin(e.target.value)}
                className="w-full px-3 py-2 border border-slate-250 dark:border-slate-800 bg-transparent rounded-xl text-center text-lg font-mono tracking-widest focus:outline-none focus:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none text-slate-800 dark:text-slate-100"
              />
            </div>
            <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md focus-visible:ring-2 focus-visible:ring-blue-500 outline-none cursor-pointer">
              {t.portal.cobrowse.connect}
            </button>
          </>
        )}
      </form>
    </ModalWrapper>
  );
}
