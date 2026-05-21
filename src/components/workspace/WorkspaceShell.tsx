'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/hooks/useAuth';
import { translations } from '@/i18n/translations';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { SuperAdminView } from '@/components/dashboard/SuperAdminView';
import { ClientAdminView } from '@/components/dashboard/ClientAdminView';
import { AgentWorkspaceView } from '@/components/dashboard/AgentWorkspaceView';
import { CustomerPortalView } from '@/components/dashboard/CustomerPortalView';
import { QAManagerView } from '@/components/dashboard/QAManagerView';
import { SupervisorView } from '@/components/dashboard/SupervisorView';
import { PublicBotWidget } from '@/components/dashboard/PublicBotWidget';
import AnalyticsCenterLayout from '@/components/analytics/AnalyticsCenterLayout';
import { ShieldAlert, Activity, MessageSquare, X } from 'lucide-react';
import {
  canAccessScreen,
  getScreenTitle,
  ROLE_DEFAULT_SCREEN,
} from '@/lib/rbac/permissions';
import type { AuditLog } from '@/types';
import type { TranslationKeys } from '@/i18n/translations';
import type { UserRole } from '@/types';

interface WorkspaceShellProps {
  initialScreen?: string;
}

export function WorkspaceShell({ initialScreen }: WorkspaceShellProps) {
  const { role, lang, auditLogs } = useApp();
  const { logout, user } = useAuth();
  const defaultScreen = initialScreen ?? ROLE_DEFAULT_SCREEN[role];

  return (
    <WorkspaceShellInner
      key={`${role}-${defaultScreen}`}
      role={role}
      lang={lang}
      auditLogs={auditLogs}
      userEmail={user?.email}
      initialScreen={defaultScreen}
      onLogout={() => {
        logout();
      }}
    />
  );
}

function WorkspaceShellInner({
  role,
  lang,
  auditLogs,
  userEmail,
  initialScreen,
  onLogout,
}: {
  role: UserRole;
  lang: 'en' | 'ar';
  auditLogs: AuditLog[];
  userEmail?: string;
  initialScreen: string;
  onLogout: () => void;
}) {
  const router = useRouter();
  const t: TranslationKeys = translations[lang];
  const [activeScreen, setActiveScreen] = useState(initialScreen);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [showPublicBotOverlay, setShowPublicBotOverlay] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Listen for custom navigation events from child components (e.g., BotsTab 'Flows' button)
  React.useEffect(() => {
    const handler = (ev: Event) => {
      const custom = ev as CustomEvent<any>;
      const screen = custom?.detail?.screenId;
      if (screen) {
        setActiveScreen(screen);
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('navigate-to-screen', handler as EventListener);
    return () => window.removeEventListener('navigate-to-screen', handler as EventListener);
  }, []);

  const authorized = canAccessScreen(role, activeScreen);

  const handleLogout = () => {
    onLogout();
    router.push('/login');
  };

  return (
    <div
      className="flex h-screen min-h-dvh overflow-hidden bg-slate-50 dark:bg-[#030712] transition-colors"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {isSidebarOpen && <button type="button" aria-label="Close navigation drawer" onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 z-40 bg-black/50 lg:hidden" />}

      <Sidebar
        activeScreen={activeScreen}
        setActiveScreen={(screenId) => {
          setActiveScreen(screenId);
          setIsSidebarOpen(false);
        }}
        isMobileOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
        isRtl={lang === 'ar'}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          activeScreenTitle={getScreenTitle(activeScreen, t)}
          onLogout={handleLogout}
          onOpenAuditLogs={() => setShowAuditLogs(true)}
          onOpenMenu={() => setIsSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-8 bg-slate-50 dark:bg-[#030712] transition-colors min-w-0">
          {!authorized ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center space-y-4 max-w-md mx-auto px-2">
              <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                {lang === 'ar' ? 'رفض الوصول (RBAC)' : 'Access Denied (RBAC Protected)'}
              </h2>
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {lang === 'ar' ? (
                  <>
                    دورك الحالي (<strong className="uppercase">{role.replace('_', ' ')}</strong>) غير مصرح له
                    بالوصول إلى <strong>/{activeScreen}</strong>.
                  </>
                ) : (
                  <>
                    Your role (<strong className="uppercase">{role.replace('_', ' ')}</strong>) is not authorized for{' '}
                    <strong>/{activeScreen}</strong>.
                    {userEmail && <span className="block mt-2 text-slate-400">Signed in as {userEmail}</span>}
                  </>
                )}
              </p>
            </div>
          ) : activeScreen === 'analytics_center' ? (
            <AnalyticsCenterLayout />
          ) : (
            <>
              {role === 'super_admin' && <SuperAdminView activeSubScreen={activeScreen} />}
              {(role === 'client_admin' || role === 'operations_manager') && (
                <ClientAdminView activeSubScreen={activeScreen} />
              )}
              {role === 'support_agent' && <AgentWorkspaceView activeSubScreen={activeScreen} />}
              {role === 'customer' && (
                <CustomerPortalView activeSubScreen={activeScreen} setActiveSubScreen={setActiveScreen} />
              )}
              {role === 'qa_manager' && <QAManagerView activeSubScreen={activeScreen} />}
              {role === 'supervisor' && <SupervisorView activeSubScreen={activeScreen} />}
              {role === 'viewer' && <ClientAdminView activeSubScreen={activeScreen} />}
            </>
          )}
        </main>
      </div>

      {role !== 'customer' && (
        <div
          className="fixed bottom-4 sm:bottom-6 z-50"
          style={{ [lang === 'ar' ? 'left' : 'right']: '1rem', maxWidth: 'calc(100vw - 2rem)' }}
        >
          <button
            type="button"
            onClick={() => setShowPublicBotOverlay(true)}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 bg-blue-600 text-white font-bold rounded-full shadow-xl hover:bg-blue-700 active:scale-95 transition-all text-xs max-w-[calc(100vw-2rem)]"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{lang === 'ar' ? 'معاينة البوت' : 'Launch Bot Widget'}</span>
          </button>
        </div>
      )}

      {showPublicBotOverlay && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-3 sm:p-4">
          <div className="relative max-w-md w-full max-h-[90dvh]">
            <button
              type="button"
              onClick={() => setShowPublicBotOverlay(false)}
              className={`absolute -top-10 p-2 text-white bg-slate-800 hover:bg-slate-700 rounded-full ${lang === 'ar' ? 'left-0' : 'right-0'}`}
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <PublicBotWidget />
          </div>
        </div>
      )}

      {showAuditLogs && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setShowAuditLogs(false)}
            aria-hidden
          />
          <div
            className={`relative w-[min(100vw,24rem)] sm:w-96 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-full flex flex-col z-10 shadow-2xl text-xs ${
              lang === 'ar' ? 'border-r' : 'border-l'
            }`}
          >
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-sm text-slate-800 dark:text-white">Tenant System Audit Logs</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAuditLogs(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-2xl space-y-1.5"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 dark:text-white truncate" style={{ maxWidth: '150px' }} title={log.user}>
                      {log.user}
                    </span>
                    <span className="font-mono text-slate-400 text-[10px]">{log.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded font-bold uppercase font-mono text-[8px]">
                      {log.role}
                    </span>
                    <span className="font-mono text-slate-400">IP: {log.ipAddress}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed pt-1">{log.action}</p>
                  <div className="flex justify-end pt-1">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                        log.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {log.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center text-slate-500 font-medium">
              Connected to SIEM pipeline. Logs are immutable.
            </div>
          </div>
        </div>
      )}

      {/* navigation events handled in React useEffect above */}
    </div>
  );
}
