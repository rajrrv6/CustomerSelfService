'use client';

import React from 'react';
import { useUIStore } from '@/stores/uiStore';
import { translations } from '@/i18n/translations';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Brain, Radio, Layers, ShieldCheck } from 'lucide-react';
import { LlmRegistryTab } from '../llm-registry/LlmRegistryTab';
import { AsrTtsRegistryTab } from '../speech-providers/AsrTtsRegistryTab';
import { SuperAdminChannelsTab } from '../channels/SuperAdminChannelsTab';
import { NluGovernanceTab } from '../nlu-governance/NluGovernanceTab';
import { useTabQueryState } from '@/hooks/useTabQueryState';

export function MasterDataContainer({ activeTab: propActiveTab }: { activeTab?: string }) {
  const lang = useUIStore((s) => s.lang);
  const t = translations[lang];

  const [activeTab, setActiveTab] = useTabQueryState(
    'llm_registry',
    ['llm_registry', 'asr_tts_registry', 'channels', 'nlu_governance'],
    propActiveTab
  );

  const tabs = [
    { id: 'llm_registry', label: t.llmRegistry, icon: <Brain className="w-4 h-4" /> },
    { id: 'asr_tts_registry', label: t.asrTtsRegistry, icon: <Radio className="w-4 h-4" /> },
    { id: 'channels', label: t.omnichannel, icon: <Layers className="w-4 h-4" /> },
    { id: 'nlu_governance', label: t.nluGovernance, icon: <ShieldCheck className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t.saMasterDataTitle}
        description={t.saMasterDataDesc}
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
        {activeTab === 'llm_registry' && <LlmRegistryTab />}
        {activeTab === 'asr_tts_registry' && <AsrTtsRegistryTab />}
        {activeTab === 'channels' && <SuperAdminChannelsTab />}
        {activeTab === 'nlu_governance' && <NluGovernanceTab />}
      </div>
    </div>
  );
}
