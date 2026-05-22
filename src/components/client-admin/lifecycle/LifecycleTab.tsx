'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { OperationalCard } from '@/components/shared/OperationalCard';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';

export function LifecycleTab() {
  const { lang } = useApp();
  const t = translations[lang];

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t.clientAdmin.deployments.title}
        description={t.clientAdmin.deployments.description}
      />

      <OperationalCard hoverEffect={false} className="p-6 space-y-4">
        <h3 className="font-bold text-sm text-slate-850 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          {t.clientAdmin.deployments.abTrafficConfig}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
          <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-900 rounded-2xl">
            <span className="font-bold text-blue-600 dark:text-blue-400 font-mono block">
              {t.clientAdmin.deployments.variantA}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block font-normal">
              {t.clientAdmin.deployments.variantAWeight}
            </span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-900 rounded-2xl">
            <span className="font-bold text-purple-600 dark:text-purple-400 font-mono block">
              {t.clientAdmin.deployments.variantB}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block font-normal">
              {t.clientAdmin.deployments.variantBWeight}
            </span>
          </div>
        </div>
      </OperationalCard>
    </div>
  );
}
