'use client';

import React, { Suspense, lazy } from 'react';
import { AlertTriangle } from 'lucide-react';

// Lightweight tabs imported eagerly
import { IntentsList } from '../nlu/IntentsList';
import { KnowledgeBaseTab } from '../knowledge/KnowledgeBaseTab';
import { GuardrailsTab } from '../safety/GuardrailsTab';
import { ChannelsTab } from '../channels/ChannelsTab';
import { QueuesRosterTab } from '../operations/QueuesRosterTab';
import { SlaTab } from '../operations/SlaTab';
import { LifecycleTab } from '../lifecycle/LifecycleTab';
import { SurveysTab } from '../operations/SurveysTab';
import AgentWorkspaceLayout from '@/components/agent-workspace/AgentWorkspaceLayout';

// Heavy tabs imported lazily
const BotsTab = lazy(() => import('../bots/BotsTab').then(m => ({ default: m.BotsTab })));
const DialogFlowLayout = lazy(() => import('@/components/dialog-builder/DialogFlowLayout').then(m => ({ default: m.DialogFlowLayout })));
const IntegrationsDashboard = lazy(() => import('@/components/integrations/IntegrationsDashboard').then(m => ({ default: m.IntegrationsDashboard })));
const TrainingTab = lazy(() => import('../training/TrainingTab').then(m => ({ default: m.TrainingTab })));

function TabFallback() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500 animate-pulse">
      <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-3" />
      <span className="text-xs font-semibold font-mono tracking-wider uppercase">Loading module...</span>
    </div>
  );
}

interface ClientAdminLayoutProps {
  activeSubScreen: string;
}

export function ClientAdminLayout({ activeSubScreen }: ClientAdminLayoutProps) {
  switch (activeSubScreen) {
    case 'bots':
      return (
        <Suspense fallback={<TabFallback />}>
          <BotsTab />
        </Suspense>
      );
    case 'intents':
      return <IntentsList />;
    case 'dialog_flow':
      return (
        <Suspense fallback={<TabFallback />}>
          <DialogFlowLayout />
        </Suspense>
      );
    case 'knowledge_base':
      return <KnowledgeBaseTab />;
    case 'guardrails':
      return <GuardrailsTab />;
    case 'channels':
      return <ChannelsTab />;
    case 'agents':
      return <QueuesRosterTab />;
    case 'inbox':
      return <AgentWorkspaceLayout activeSubScreen={activeSubScreen} />;
    case 'sla':
      return <SlaTab />;
    case 'deployments':
      return <LifecycleTab />;
    case 'integrations':
      return (
        <Suspense fallback={<TabFallback />}>
          <IntegrationsDashboard />
        </Suspense>
      );
    case 'surveys':
      return <SurveysTab />;
    case 'training':
      return (
        <Suspense fallback={<TabFallback />}>
          <TrainingTab />
        </Suspense>
      );
    default:
      return (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <AlertTriangle className="w-10 h-10 mb-2 opacity-50" />
          <span>Section not implemented</span>
        </div>
      );
  }
}
