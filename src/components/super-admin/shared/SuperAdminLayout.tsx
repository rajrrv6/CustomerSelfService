'use client';

import React, { Suspense, lazy } from 'react';
import { HelpCircle } from 'lucide-react';

// Lightweight tabs imported eagerly
import { LlmRegistryTab } from '../llm-registry/LlmRegistryTab';
import { AsrTtsRegistryTab } from '../speech-providers/AsrTtsRegistryTab';
import { SipTrunkConfigTab } from '../telephony/SipTrunkConfigTab';
import { SuperAdminChannelsTab } from '../channels/SuperAdminChannelsTab';
import { NluGovernanceTab } from '../nlu-governance/NluGovernanceTab';

// Heavy tabs imported lazily
const SuperAdminAnalyticsTab = lazy(() => import('../analytics/SuperAdminAnalyticsTab').then(m => ({ default: m.SuperAdminAnalyticsTab })));
const VectorDbStatusTab = lazy(() => import('../vector-db/VectorDbStatusTab').then(m => ({ default: m.VectorDbStatusTab })));

function TabFallback() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500 animate-pulse">
      <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-3" />
      <span className="text-xs font-semibold font-mono tracking-wider uppercase">Loading module...</span>
    </div>
  );
}

interface SuperAdminLayoutProps {
  activeSubScreen: string;
}

export function SuperAdminLayout({ activeSubScreen }: SuperAdminLayoutProps) {
  switch (activeSubScreen) {
    case 'llm_registry':
      return <LlmRegistryTab />;
    case 'asr_tts_registry':
      return <AsrTtsRegistryTab />;
    case 'nlu_governance':
      return <NluGovernanceTab />;
    case 'cost_benchmarks':
    case 'cross_tenant_analytics':
      return (
        <Suspense fallback={<TabFallback />}>
          <SuperAdminAnalyticsTab activeSubScreen={activeSubScreen} />
        </Suspense>
      );
    case 'vector_db':
      return (
        <Suspense fallback={<TabFallback />}>
          <VectorDbStatusTab />
        </Suspense>
      );
    case 'sip_trunk':
      return <SipTrunkConfigTab />;
    case 'channels':
      return <SuperAdminChannelsTab />;
    default:
      return (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <HelpCircle className="w-10 h-10 mb-2 opacity-50" />
          <span>Screen not implemented</span>
        </div>
      );
  }
}
