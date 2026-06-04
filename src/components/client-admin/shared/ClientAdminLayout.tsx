'use client';

import React, { Suspense, lazy } from 'react';
import { AlertTriangle } from 'lucide-react';
import dynamic from 'next/dynamic';

// Lightweight tabs imported eagerly
import { IntentsList } from '../nlu/IntentsList';
import { KnowledgeBaseTab } from '../knowledge/KnowledgeBaseTab';
import { GuardrailsTab } from '../safety/GuardrailsTab';
import { ChannelsTab } from '../channels/ChannelsTab';
import { QueuesRosterTab } from '../operations/QueuesRosterTab';
import { SlaAnalytics } from '@/components/analytics/SlaAnalytics';
import { LifecycleTab } from '../lifecycle/LifecycleTab';
import { SurveysTab } from '../operations/SurveysTab';
import AgentWorkspaceLayout from '@/components/agent-workspace/AgentWorkspaceLayout';

// Direct layouts for nested Client Admin sub-role dashboard support
import { SupervisorView } from '@/components/dashboard/SupervisorView';
import { QAManagerView } from '@/components/dashboard/QAManagerView';
import { AgentWorkspaceView } from '@/components/dashboard/AgentWorkspaceView';
import { BillingTab } from '../billing/BillingTab';
import { RbacTab } from '../rbac/RbacTab';

// Heavy tabs imported lazily or dynamically (client-only for ReactFlow)
const BotsTab = lazy(() => import('../bots/BotsTab').then(m => ({ default: m.BotsTab })));
const DialogFlowLayout = dynamic(
  () => import('../dialog-builder/DialogFlowLayout').then(m => m.DialogFlowLayout),
  { ssr: false, loading: () => <TabFallback /> }
);
const IntegrationsDashboard = lazy(() => import('@/components/integrations/IntegrationsDashboard').then(m => ({ default: m.IntegrationsDashboard })));
const TrainingTab = lazy(() => import('../training/TrainingTab').then(m => ({ default: m.TrainingTab })));

const CampaignsWorkspace = lazy(() => import('../campaigns/CampaignsWorkspace').then(m => ({ default: m.CampaignsWorkspace })));
const VoiceIvrWorkspace = lazy(() => import('../voice/VoiceIvrWorkspace').then(m => ({ default: m.VoiceIvrWorkspace })));
const AutomationRulesWorkspace = lazy(() => import('../automation/AutomationRulesWorkspace').then(m => ({ default: m.AutomationRulesWorkspace })));
const ReportsWorkspace = lazy(() => import('../reports/ReportsWorkspace').then(m => ({ default: m.ReportsWorkspace })));
const ClientAuditLogsWorkspace = lazy(() => import('../audit/ClientAuditLogsWorkspace').then(m => ({ default: m.ClientAuditLogsWorkspace })));
const ClientNotificationsWorkspace = lazy(() => import('../notifications/ClientNotificationsWorkspace').then(m => ({ default: m.ClientNotificationsWorkspace })));
const ClientSettingsWorkspace = lazy(() => import('../settings/ClientSettingsWorkspace').then(m => ({ default: m.ClientSettingsWorkspace })));

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
      return <SlaAnalytics />;
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
    case 'campaigns':
      return (
        <Suspense fallback={<TabFallback />}>
          <CampaignsWorkspace />
        </Suspense>
      );
    case 'voice_ivr':
      return (
        <Suspense fallback={<TabFallback />}>
          <VoiceIvrWorkspace />
        </Suspense>
      );
    case 'automation_rules':
      return (
        <Suspense fallback={<TabFallback />}>
          <AutomationRulesWorkspace />
        </Suspense>
      );
    case 'reports':
      return (
        <Suspense fallback={<TabFallback />}>
          <ReportsWorkspace />
        </Suspense>
      );
    case 'audit_logs':
      return (
        <Suspense fallback={<TabFallback />}>
          <ClientAuditLogsWorkspace />
        </Suspense>
      );
    case 'notifications':
      return (
        <Suspense fallback={<TabFallback />}>
          <ClientNotificationsWorkspace />
        </Suspense>
      );
    case 'settings':
      return (
        <Suspense fallback={<TabFallback />}>
          <ClientSettingsWorkspace />
        </Suspense>
      );
    case 'supervisor_monitor':
    case 'workforce':
      return <SupervisorView activeSubScreen={activeSubScreen} />;
    case 'qa_queue':
    case 'coaching':
      return <QAManagerView activeSubScreen={activeSubScreen} />;
    case 'agent_dashboard':
    case 'tickets':
      return <AgentWorkspaceView activeSubScreen={activeSubScreen} />;
    case 'billing':
      return <BillingTab />;
    case 'rbac':
      return <RbacTab />;
    default:
      return (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <AlertTriangle className="w-10 h-10 mb-2 opacity-50" />
          <span>Section not implemented</span>
        </div>
      );
  }
}
export default ClientAdminLayout;
