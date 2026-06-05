import type { UserRole } from '@/types';
import type { TranslationKeys } from '@/i18n/translations';

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: [
    'sa_dashboard',
    'sa_master_data',
    'sa_analytics',
    'sa_infra',
    'sa_telephony',
    'sa_billing',
    'sa_audit',
    'sa_notifications',
    'sa_settings',
    'sa_help',
    'sa_tenant_management',
    'sa_system_ops',
    // Compatibility aliases:
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
    'surveys',
    'deployments',
    'integrations',
    'analytics_center',
    'training',
    'billing',
    'rbac',
    'campaigns',
    'voice_ivr',
    'automation_rules',
    'reports',
    'audit_logs',
    'notifications',
    'settings'
  ],
  operations_manager: ['inbox', 'agents', 'workforce', 'supervisor_monitor', 'sla', 'surveys', 'integrations', 'analytics_center'],
  qa_manager: ['qa_queue', 'scorecard_builder', 'evaluations', 'coaching', 'qa_analytics', 'agent_performance', 'launcher'],
  support_agent: ['agent_dashboard', 'inbox', 'tickets', 'copilot', 'suggested_replies', 'wrapup_codes', 'launcher'],
  supervisor: [
    'supervisor_monitor',
    'workforce',
    'sla',
    'live_queues',
    'shift_planning',
    'occupancy',
    'agent_presence',
    'queue_distribution',
    'escalations',
    'launcher'
  ],
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
  super_admin: 'sa_dashboard',
  client_admin: 'bots',
  operations_manager: 'inbox',
  qa_manager: 'qa_queue',
  support_agent: 'agent_dashboard',
  supervisor: 'supervisor_monitor',
  customer: 'customer_home',
  viewer: 'surveys',
};

import { canView } from '@/stores/permissionStore';

export const SUPER_ADMIN_SCREENS = [
  'sa_dashboard',
  'sa_master_data',
  'sa_analytics',
  'sa_infra',
  'sa_telephony',
  'sa_billing',
  'sa_audit',
  'sa_notifications',
  'sa_settings',
  'sa_help',
  'sa_tenant_management',
  'sa_system_ops',
  // Compatibility aliases:
  'llm_registry',
  'asr_tts_registry',
  'nlu_governance',
  'cost_benchmarks',
  'cross_tenant_analytics',
  'vector_db',
  'sip_trunk',
  'channels',
  'analytics_center'
];

export function canAccessScreen(role: UserRole, screenId: string): boolean {
  console.log({
    role,
    screen: screenId,
    permissions: ROLE_PERMISSIONS[role]
  });

  if (screenId === 'launcher') {
    return true;
  }
  if (role === 'super_admin') {
    return SUPER_ADMIN_SCREENS.includes(screenId) || screenId === 'analytics_center';
  }
  if (SUPER_ADMIN_SCREENS.includes(screenId)) {
    return false;
  }
  if (role === 'customer') {
    return ROLE_PERMISSIONS.customer.includes(screenId);
  }
  const allowed = ROLE_PERMISSIONS[role];
  if (allowed && allowed.includes(screenId)) {
    return true;
  }
  return canView(screenId, role);
}

export function getScreenTitle(screenId: string, t: TranslationKeys): string {
  const isAr = t.language === 'اللغة';
  const mapping: Record<string, string> = {
    sa_dashboard: t.saDashboard,
    sa_master_data: t.saMasterData,
    sa_analytics: t.saAnalytics,
    sa_infra: t.saInfrastructure,
    sa_telephony: t.saTelephony,
    sa_billing: t.saBilling,
    sa_audit: t.saAudit,
    sa_notifications: t.saNotifications,
    sa_settings: t.saSettings,
    sa_help: t.saHelp,
    sa_tenant_management: (t as any).saTenantManagement || 'Tenant Management',
    sa_system_ops: (t as any).saSystemOps || 'System Operations',
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
    rbac: 'RBAC Settings',
    campaigns: (t.screens as any).campaigns || 'Campaigns',
    voice_ivr: (t.screens as any).voice_ivr || 'Voice / IVR',
    automation_rules: (t.screens as any).automation_rules || 'Automation Rules',
    reports: (t.screens as any).reports || 'Reports',
    audit_logs: (t.screens as any).audit_logs || 'Audit Logs',
    notifications: (t.screens as any).notifications || 'Notifications',
    settings: (t.screens as any).settings || 'Settings',
    scorecard_builder: isAr ? 'منشئ بطاقات التقييم' : 'Scorecard Builder',
    copilot: (t.screens as any).copilot || (isAr ? 'مساعد الذكاء الاصطناعي' : 'AI Copilot'),
    suggested_replies: isAr ? 'الردود المقترحة' : 'Suggested Replies',
    wrapup_codes: isAr ? 'رموز الإنهاء والتلخيص' : 'Wrap-up Codes',
    qa_analytics: isAr ? 'تحليلات الجودة' : 'QA Analytics',
    agent_performance: isAr ? 'أداء الوكلاء' : 'Agent Performance',
    shift_planning: isAr ? 'تخطيط المناوبات' : 'Shift Planning',
    occupancy: isAr ? 'معدل الإشغال' : 'Occupancy',
    agent_presence: isAr ? 'حالة الحضور الموظفين' : 'Agent Presence',
    queue_distribution: isAr ? 'توزيع الطوابير' : 'Queue Distribution',
    escalations: isAr ? 'حالات التصعيد' : 'Escalations',
  };

  return mapping[screenId] ?? t.screens.workspace;
}

