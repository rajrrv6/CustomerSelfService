'use client';

import React from 'react';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { OperationalCard } from '@/components/shared/OperationalCard';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';

export function SipTrunkConfigTab() {
  const { lang } = useApp();
  const t = translations[lang];

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t.superAdmin.sipTrunk.configTitle}
        description={t.superAdmin.sipTrunk.configDesc}
      />

      <OperationalCard hoverEffect={false} className="p-6 space-y-4">
        <h3 className="font-bold text-sm text-slate-800 dark:text-white">{t.superAdmin.sipTrunk.carrierRegistry}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase font-mono mb-1.5">{t.superAdmin.sipTrunk.primaryVoipGate}</label>
            <input
              type="text"
              readOnly
              value="sip.ksa-trunk.stc.com.sa:5060"
              className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 font-mono text-slate-650 dark:text-slate-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase font-mono mb-1.5">{t.superAdmin.sipTrunk.secondaryVoipGate}</label>
            <input
              type="text"
              readOnly
              value="sip.du-trunk.dubai.ae:5060"
              className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 font-mono text-slate-650 dark:text-slate-400 focus:outline-none"
            />
          </div>
        </div>
        
        <div className="pt-4 border-t border-slate-100 dark:border-slate-850">
          <h4 className="font-bold text-xs text-slate-850 dark:text-slate-200 mb-2">{t.superAdmin.sipTrunk.loadBalancing}</h4>
          <div className="flex flex-col sm:flex-row gap-4">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-450 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-slate-350 dark:border-slate-800 text-blue-600 focus:ring-blue-500 bg-transparent" />
              {t.superAdmin.sipTrunk.enableTls}
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-450 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-slate-350 dark:border-slate-800 text-blue-600 focus:ring-blue-500 bg-transparent" />
              {t.superAdmin.sipTrunk.codecAutoNegotiate}
            </label>
          </div>
        </div>
      </OperationalCard>
    </div>
  );
}
