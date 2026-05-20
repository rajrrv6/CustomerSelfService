import type { UserRole } from '@/types';
import type { TranslationKeys } from '@/i18n/translations';

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: [
    'llm_registry',
    'asr_tts_registry',
    'channels',
    'cost_benchmarks',
    'cross_tenant_analytics',
    'vector_db',
    'sip_trunk',
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
  ],
  operations_manager: ['inbox', 'agents', 'sla', 'surveys', 'integrations'],
  qa_manager: ['qa_queue', 'coaching', 'inbox', 'surveys'],
  support_agent: ['agent_dashboard', 'inbox', 'tickets'],
  supervisor: ['inbox', 'supervisor_monitor', 'workforce', 'sla'],
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
  viewer: ['surveys', 'sla'],
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
    agents: 'Queues & Roster',
    inbox: t.unifiedInbox,
    sla: 'SLA Dashboard',
    surveys: 'Voice of Customer & CSAT',
    deployments: 'Release Pipeline & A/B',
    integrations: t.integrations,
    qa_queue: 'QA Review Queue',
    coaching: 'Agent Training Plans',
    agent_dashboard: 'Agent Dashboard',
    tickets: 'Incident Tickets',
    supervisor_monitor: 'Supervisor Monitoring',
    workforce: 'Workforce Planning',
    customer_home: 'Helpdesk Home',
    customer_kb: 'RAG Knowledge Search',
    customer_ticket_submit: 'Submit Ticket',
    customer_my_tickets: 'My Active Cases',
    customer_kb_article: 'Knowledge Base Article',
    customer_ticket_detail: 'Ticket Thread & Resolution',
    customer_order_refund: 'Order Lookup & Return Portal',
    customer_chat_history: 'Resolved Chat History',
  };

  return mapping[screenId] ?? 'Workspace';
}
