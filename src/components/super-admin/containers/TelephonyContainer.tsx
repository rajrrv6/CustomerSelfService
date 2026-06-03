'use client';

import React from 'react';
import { useUIStore } from '@/stores/uiStore';
import { translations } from '@/i18n/translations';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Phone, Hash } from 'lucide-react';
import { NotImplementedFallback } from '../shared/SuperAdminLayout';
import { SipTrunkConfigTab } from '../telephony/SipTrunkConfigTab';
import { useTabQueryState } from '@/hooks/useTabQueryState';

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
    { id: 'number_pool', label: lang === 'ar' ? 'حزمة الأرقام DID' : 'DID Number Pool', icon: <Hash className="w-4 h-4" /> }
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
        ) : (
          <NotImplementedFallback />
        )}
      </div>
    </div>
  );
}
