'use client';

import React from 'react';
import { ShieldCheck, Sliders } from 'lucide-react';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { OperationalCard } from '@/components/shared/OperationalCard';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';

export function GuardrailsTab() {
  const { lang } = useApp();
  const t = translations[lang];

  const piiFilters = [
    { label: t.clientAdmin.guardrails.filterCard, active: true },
    { label: t.clientAdmin.guardrails.filterEmail, active: true },
    { label: t.clientAdmin.guardrails.filterSaudiId, active: true },
    { label: t.clientAdmin.guardrails.filterPhone, active: false }
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t.clientAdmin.guardrails.title}
        description={t.clientAdmin.guardrails.description}
      />

      <OperationalCard hoverEffect={false} className="p-6 space-y-6 shadow-sm">
        {/* PII Masking Section */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-slate-805 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-500" />
            {t.clientAdmin.guardrails.piiTitle}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal font-normal">
            {t.clientAdmin.guardrails.piiDesc}
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {piiFilters.map((pii, idx) => (
              <label
                key={idx}
                className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl cursor-pointer hover:border-slate-200 dark:hover:border-slate-800 transition-colors text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                <input
                  type="checkbox"
                  defaultChecked={pii.active}
                  className="rounded border-slate-350 dark:border-slate-800 text-blue-600 focus:ring-blue-550 bg-transparent"
                />
                <span>{pii.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Toxicity threshold */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-slate-850 dark:text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-purple-500" />
            {t.clientAdmin.guardrails.nluThresholdsTitle}
          </h3>
          
          <div className="space-y-4 max-w-xl">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5 text-slate-655 dark:text-slate-400">
                <span>{t.clientAdmin.guardrails.piiLeaksLimit}</span>
                <span className="font-mono text-slate-850 dark:text-slate-200">0.88 {t.clientAdmin.guardrails.thresholdSuffix}</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                defaultValue="88"
                className="w-full h-1.5 bg-slate-205 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5 text-slate-655 dark:text-slate-400">
                <span>{t.clientAdmin.guardrails.toxicityScore}</span>
                <span className="font-mono text-slate-850 dark:text-slate-200">0.65 {t.clientAdmin.guardrails.thresholdSuffix}</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                defaultValue="65"
                className="w-full h-1.5 bg-slate-205 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      </OperationalCard>
    </div>
  );
}
