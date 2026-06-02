'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';
import { LoginScreen } from '@/components/dashboard/LoginScreen';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { SuperAdminView } from '@/components/dashboard/SuperAdminView';
import { ClientAdminView } from '@/components/dashboard/ClientAdminView';
import { AgentWorkspaceView } from '@/components/dashboard/AgentWorkspaceView';
import { CustomerPortalView } from '@/components/dashboard/CustomerPortalView';
import { QAManagerView } from '@/components/dashboard/QAManagerView';
import { SupervisorView } from '@/components/dashboard/SupervisorView';
import { PublicBotWidget } from '@/components/dashboard/PublicBotWidget';
import { ShieldAlert, Activity, MessageSquare, X } from 'lucide-react';
import { UserRole } from '@/types';
import { ROLE_DEFAULT_SCREEN, ROLE_PERMISSIONS, canAccessScreen } from '@/lib/rbac/permissions';

export default function DemoSandboxPage() {
  const { role, lang, auditLogs } = useApp();
  const t = translations[lang];

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeScreen, setActiveScreen] = useState('bots');
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [showPublicBotOverlay, setShowPublicBotOverlay] = useState(false);

  // Auto-switch default screen when role changes to match RBAC permissions
  useEffect(() => {
    const roleDefaults: Record<UserRole, string> = {
      super_admin: 'llm_registry',
      client_admin: 'bots',
      operations_manager: 'inbox',
      qa_manager: 'qa_queue',
      support_agent: 'agent_dashboard',
      supervisor: 'inbox',
      customer: 'customer_home',
      viewer: 'surveys'
    };
    
    setActiveScreen(roleDefaults[role]);
  }, [role]);

  // Check role-based route clearance (RBAC enforcement)
  const isAuthorized = (screenId: string, currentRole: UserRole): boolean => {
    return canAccessScreen(currentRole, screenId);
  };

  const getScreenTitle = (screenId: string): string => {
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
      billing: 'Billing',
      rbac: 'RBAC Settings'
    };

    return mapping[screenId] || 'Workspace';
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  const renderedScreen = React.useMemo(() => {
    const isAuth = isAuthorized(activeScreen, role);
    if (isAuth) return activeScreen;

    const defaultScreen = ROLE_DEFAULT_SCREEN[role];
    if (isAuthorized(defaultScreen, role)) {
      return defaultScreen;
    }
    const allowedScreens = ROLE_PERMISSIONS[role];
    if (allowedScreens && allowedScreens.length > 0) {
      return allowedScreens[0];
    }
    return activeScreen;
  }, [role, activeScreen]);

  useEffect(() => {
    if (activeScreen !== renderedScreen) {
      setActiveScreen(renderedScreen);
    }
  }, [activeScreen, renderedScreen]);

  const authorized = isAuthorized(renderedScreen, role);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#030712] transition-colors" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Sidebar Navigation */}
      <Sidebar activeScreen={renderedScreen} setActiveScreen={setActiveScreen} />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header toolbar */}
        <Header
          activeScreenTitle={getScreenTitle(renderedScreen)}
          onLogout={() => setIsLoggedIn(false)}
          onOpenAuditLogs={() => setShowAuditLogs(true)}
          onOpenMenu={() => {}}
          onOpenNotifications={() => {}}
        />

        {/* Content viewport area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50 dark:bg-[#030712] transition-colors">
          {!authorized ? (
            /* ACCESS DENIED STATE (RBAC Enforcement) */
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 max-w-md mx-auto animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Access Denied (RBAC Protected)</h2>
              <p className="text-xs leading-relaxed text-slate-455">
                Your currently selected profile role (<strong className="uppercase">{role.replace('_', ' ')}</strong>) is not granted authorization parameters to query route <strong>/{renderedScreen}</strong>.
              </p>
              <div className="pt-2">
                <span className="text-[10px] text-slate-400 font-semibold italic">Please switch roles in the header toolbar to access this module.</span>
              </div>
            </div>
          ) : (
            /* AUTHORIZED SCREEN DISPATCHER */
            <>
              {/* Super Admin Panel Sub-routing */}
              {role === 'super_admin' && (
                <SuperAdminView activeSubScreen={renderedScreen} />
              )}

              {/* Client Admin Sub-routing (swallows supervisor, QA, operations, and viewer roles) */}
              {(role === 'client_admin' || role === 'operations_manager' || role === 'qa_manager' || role === 'supervisor' || role === 'viewer') && (
                <ClientAdminView activeSubScreen={renderedScreen} />
              )}

              {/* Agent Workspace Sub-routing (under End User app hierarchy) */}
              {role === 'support_agent' && (
                <AgentWorkspaceView activeSubScreen={renderedScreen} />
              )}

              {/* Customer Portal Sub-routing */}
              {role === 'customer' && (
                <CustomerPortalView activeSubScreen={renderedScreen} setActiveSubScreen={setActiveScreen} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Floating preview button for the Public Bot Widget (only visible to admins/agents) */}
      {role !== 'customer' && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setShowPublicBotOverlay(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-full shadow-xl hover:bg-blue-750 active:scale-95 transition-all text-xs"
            title="Launch Public Bot Widget Preview"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Launch Bot Widget</span>
          </button>
        </div>
      )}

      {/* Floating Public Bot Widget modal overlay */}
      {showPublicBotOverlay && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative max-w-md w-full animate-in zoom-in-95">
            <button
              onClick={() => setShowPublicBotOverlay(false)}
              className="absolute -top-10 right-0 p-2 text-white bg-slate-800 hover:bg-slate-700 rounded-full focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>
            <PublicBotWidget />
          </div>
        </div>
      )}

      {/* Audit Logs Sidebar Drawer Panel */}
      {showAuditLogs && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowAuditLogs(false)} />
          
          {/* Drawer content */}
          <div className="relative w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full flex flex-col justify-between z-10 shadow-2xl animate-in slide-in-from-right duration-250 text-xs">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-sm text-slate-800 dark:text-white">Tenant System Audit Logs</h3>
              </div>
              <button onClick={() => setShowAuditLogs(false)} className="text-slate-400 hover:text-slate-600 text-lg">×</button>
            </div>

            {/* List log items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-2xl space-y-1.5 hover:border-slate-200 transition-all font-semibold">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 dark:text-white truncate max-w-37.5" style={{ maxWidth: '150px' }} title={log.user}>
                      {log.user}
                    </span>
                    <span className="font-mono text-slate-400 text-[10px]">{log.timestamp}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded font-bold uppercase font-mono text-[8px]">{log.role}</span>
                    <span className="font-mono text-slate-400">IP: {log.ipAddress}</span>
                  </div>

                  <p className="text-[11px] text-slate-655 dark:text-slate-350 leading-relaxed pt-1 font-medium">
                    {log.action}
                  </p>

                  <div className="flex justify-end pt-1">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                      log.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {log.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center text-slate-450 font-medium">
              Connected to SIEM pipeline. Logs are immutable.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
