import type { UserRole } from '@/types';
import type { TranslationKeys } from '@/i18n/translations';

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: [
    'llm_registry',
    'asr_tts_registry',
    'channels',
    'nlu_governance',
    'cost_benchmarks',
    'cross_tenant_analytics',
    'vector_db',
    'sip_trunk',
    'analytics_center',
  ],
  client_admin: [
    'bots',
    'intents',
    'dialog_flow',
    'knowledge_base',
    'guardrails',
    'channels',
    'agents',
    'inbox',
    'sla',
    'surveys',
    'deployments',
    'integrations',
    'analytics_center',
    'training',
    'billing',
    'rbac',
    'supervisor_monitor',
    'workforce',
    'qa_queue',
    'coaching',
    'agent_dashboard',
    'tickets'
  ],
  operations_manager: ['inbox', 'agents', 'workforce', 'supervisor_monitor', 'sla', 'surveys', 'integrations', 'analytics_center'],
  qa_manager: ['qa_queue', 'coaching', 'inbox', 'surveys', 'training'],
  support_agent: ['agent_dashboard', 'inbox', 'tickets'],
  supervisor: ['inbox', 'supervisor_monitor', 'workforce', 'sla', 'analytics_center'],
  customer: [
    'customer_home',
    'customer_kb',
    'customer_ticket_submit',
    'customer_my_tickets',
    'customer_kb_article',
    'customer_ticket_detail',
    'customer_order_refund',
    'customer_chat_history',
    'customer_feedback_hub',
  ],
  viewer: ['surveys', 'sla', 'analytics_center'],
};

export const ROLE_DEFAULT_SCREEN: Record<UserRole, string> = {
  super_admin: 'llm_registry',
  client_admin: 'bots',
  operations_manager: 'inbox',
  qa_manager: 'qa_queue',
  support_agent: 'agent_dashboard',
  supervisor: 'inbox',
  customer: 'customer_home',
  viewer: 'surveys',
};

import { canView } from '@/stores/permissionStore';

export const SUPER_ADMIN_SCREENS = [
  'llm_registry',
  'asr_tts_registry',
  'nlu_governance',
  'cost_benchmarks',
  'cross_tenant_analytics',
  'vector_db',
  'sip_trunk'
];

export function canAccessScreen(role: UserRole, screenId: string): boolean {
  if (role === 'super_admin') {
    return SUPER_ADMIN_SCREENS.includes(screenId) || screenId === 'analytics_center';
  }
  if (SUPER_ADMIN_SCREENS.includes(screenId)) {
    return false;
  }
  if (role === 'customer') {
    return ROLE_PERMISSIONS.customer.includes(screenId);
  }
  return canView(screenId, role);
}

export function getScreenTitle(screenId: string, t: TranslationKeys): string {
  const mapping: Record<string, string> = {
    llm_registry: t.llmRegistry,
    asr_tts_registry: t.asrTtsRegistry,
    nlu_governance: t.nluGovernance,
    cost_benchmarks: t.costBenchmarks,
    cross_tenant_analytics: t.crossTenantAnalytics,
    vector_db: t.vectorDbStatus,
    sip_trunk: t.sipTrunkConfig,
    bots: t.botManagement,
    intents: t.intentManagement,
    dialog_flow: t.dialogBuilder,
    knowledge_base: t.knowledgeBase,
    guardrails: t.safetyGuardrails,
    channels: t.omnichannel,
    agents: t.screens.agents,
    inbox: t.unifiedInbox,
    sla: t.screens.sla,
    surveys: t.screens.surveys,
    deployments: t.screens.deployments,
    integrations: t.integrations,
    analytics_center: t.screens.analytics_center,
    qa_queue: t.screens.qa_queue,
    coaching: t.screens.coaching,
    agent_dashboard: t.screens.agent_dashboard,
    tickets: t.screens.tickets,
    supervisor_monitor: t.screens.supervisor_monitor,
    workforce: t.screens.workforce,
    customer_home: t.screens.customer_home,
    customer_kb: t.screens.customer_kb,
    customer_ticket_submit: t.screens.customer_ticket_submit,
    customer_my_tickets: t.screens.customer_my_tickets,
    customer_kb_article: t.screens.customer_kb_article,
    customer_ticket_detail: t.screens.customer_ticket_detail,
    customer_order_refund: t.screens.customer_order_refund,
    customer_chat_history: t.screens.customer_chat_history,
    customer_feedback_hub: t.screens.customer_feedback_hub || 'Feedback Hub',
    training: t.screens.training || 'Training Intelligence Loop',
    billing: 'Billing',
    rbac: 'RBAC Settings'
  };

  return mapping[screenId] ?? t.screens.workspace;
}

