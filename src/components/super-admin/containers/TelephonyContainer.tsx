'use client';

import React, { Suspense } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { translations } from '@/i18n/translations';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Phone, Hash } from 'lucide-react';
import { NotImplementedFallback } from '../shared/SuperAdminLayout';
import { SipTrunkConfigTab } from '../telephony/SipTrunkConfigTab';
import { useTabQueryState } from '@/hooks/useTabQueryState';

const NumberPoolTab = React.lazy(() => import('../telephony/NumberPoolTab').then(m => ({ default: m.NumberPoolTab })));

function TabFallback() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500 animate-pulse">
      <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-3" />
      <span className="text-xs font-semibold font-mono tracking-wider uppercase">Loading module...</span>
    </div>
  );
}

export function TelephonyContainer({ activeTab: propActiveTab }: { activeTab?: string }) {
  const lang = useUIStore((s) => s.lang);
  const t = translations[lang];

  const [activeTab, setActiveTab] = useTabQueryState(
    'sip_trunk',
    ['sip_trunk', 'number_pool'],
    propActiveTab
  );

  const tabs = [
    { id: 'sip_trunk', label: t.superAdmin.sipTrunk.configTitle || 'SIP Trunk Config', icon: <Phone className="w-4 h-4" /> },
    { id: 'number_pool', label: (t.superAdmin as any).didPool?.title || (lang === 'ar' ? 'حزمة الأرقام DID' : 'DID Number Pool'), icon: <Hash className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t.saTelephonyTitle}
        description={t.saTelephonyDesc}
      />

      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto whitespace-nowrap scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold transition-all -mb-px text-[11px] cursor-pointer shrink-0 ${
                isActive
                  ? 'border-blue-600 text-blue-600 dark:text-blue-600'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {activeTab === 'sip_trunk' ? (
          <SipTrunkConfigTab />
        ) : activeTab === 'number_pool' ? (
          <Suspense fallback={<TabFallback />}>
            <NumberPoolTab />
          </Suspense>
        ) : (
          <NotImplementedFallback />
        )}
      </div>
    </div>
  );
}
