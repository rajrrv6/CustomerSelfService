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
  ],
  operations_manager: ['inbox', 'agents', 'sla', 'surveys', 'integrations', 'analytics_center'],
  qa_manager: ['qa_queue', 'coaching', 'inbox', 'surveys'],
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

export function canAccessScreen(role: UserRole, screenId: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(screenId) ?? false;
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
  };

  return mapping[screenId] ?? t.screens.workspace;
}

