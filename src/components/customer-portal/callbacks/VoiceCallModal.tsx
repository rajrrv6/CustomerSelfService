'use client';

import React from 'react';
import { PhoneCall } from 'lucide-react';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';

interface VoiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VoiceCallModal({ isOpen, onClose }: VoiceCallModalProps) {
  const { lang } = useApp();
  const t = translations[lang];

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title={t.portal.voiceCall.modalTitle} maxWidthClass="max-w-xs">
      <div className="space-y-4 text-center py-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
        <PhoneCall className="w-10 h-10 text-blue-500 mx-auto mb-2 animate-bounce" />
        <p className="text-[11px] text-slate-450 dark:text-slate-400 font-normal leading-relaxed">
          {t.portal.voiceCall.instructions}
        </p>
        <span className="text-lg font-bold font-mono text-slate-850 dark:text-white block tracking-wider">
          +966 11 412 8891
        </span>
        <span className="text-[9px] uppercase font-bold text-emerald-500 font-mono block">
          CARRIER: STC VOIP TRUNK
        </span>
      </div>
    </ModalWrapper>
  );
}
