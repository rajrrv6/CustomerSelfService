'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';
import { LlmRegistryTab } from '../llm-registry/LlmRegistryTab';
import { AsrTtsRegistryTab } from '../speech-providers/AsrTtsRegistryTab';
import { SuperAdminAnalyticsTab } from '../analytics/SuperAdminAnalyticsTab';
import { VectorDbStatusTab } from '../vector-db/VectorDbStatusTab';
import { SipTrunkConfigTab } from '../telephony/SipTrunkConfigTab';
import { SuperAdminChannelsTab } from '../channels/SuperAdminChannelsTab';

interface SuperAdminLayoutProps {
  activeSubScreen: string;
}

export function SuperAdminLayout({ activeSubScreen }: SuperAdminLayoutProps) {
  switch (activeSubScreen) {
    case 'llm_registry':
      return <LlmRegistryTab />;
    case 'asr_tts_registry':
      return <AsrTtsRegistryTab />;
    case 'cost_benchmarks':
    case 'cross_tenant_analytics':
      return <SuperAdminAnalyticsTab activeSubScreen={activeSubScreen} />;
    case 'vector_db':
      return <VectorDbStatusTab />;
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
