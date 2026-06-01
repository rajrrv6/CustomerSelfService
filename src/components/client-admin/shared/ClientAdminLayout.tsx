'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { BotsTab } from '../bots/BotsTab';
import { IntentsList } from '../nlu/IntentsList';
import { DialogFlowLayout } from '@/components/dialog-builder/DialogFlowLayout';
import { KnowledgeBaseTab } from '../knowledge/KnowledgeBaseTab';
import { GuardrailsTab } from '../safety/GuardrailsTab';
import { ChannelsTab } from '../channels/ChannelsTab';
import { QueuesRosterTab } from '../operations/QueuesRosterTab';
import { SlaTab } from '../operations/SlaTab';
import { LifecycleTab } from '../lifecycle/LifecycleTab';
import { IntegrationsDashboard } from '@/components/integrations/IntegrationsDashboard';
import { SurveysTab } from '../operations/SurveysTab';
import AgentWorkspaceLayout from '@/components/agent-workspace/AgentWorkspaceLayout';
import { TrainingTab } from '../training/TrainingTab';

interface ClientAdminLayoutProps {
  activeSubScreen: string;
}

export function ClientAdminLayout({ activeSubScreen }: ClientAdminLayoutProps) {
  switch (activeSubScreen) {
    case 'bots':
      return <BotsTab />;
    case 'intents':
      return <IntentsList />;
    case 'dialog_flow':
      return <DialogFlowLayout />;
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
      return <IntegrationsDashboard />;
    case 'surveys':
      return <SurveysTab />;
    case 'training':
      return <TrainingTab />;
    default:
      return (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <AlertTriangle className="w-10 h-10 mb-2 opacity-50" />
          <span>Section not implemented</span>
        </div>
      );
  }
}
