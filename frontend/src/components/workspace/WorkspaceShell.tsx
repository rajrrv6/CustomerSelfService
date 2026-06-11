'use client';

import React, { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationsStore } from '@/stores/notificationsStore';
import { useAuth } from '@/hooks/useAuth';
import { translations } from '@/i18n/translations';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { SuperAdminView } from '@/components/dashboard/SuperAdminView';
import { ClientAdminView } from '@/components/dashboard/ClientAdminView';
import { CustomerPortalView } from '@/components/dashboard/CustomerPortalView';
import { QAManagerView } from '@/components/dashboard/QAManagerView';
import { SupervisorView } from '@/components/dashboard/SupervisorView';
import { SupportAgentView } from '@/components/dashboard/SupportAgentView';
import { PublicBotWidget } from '@/components/dashboard/PublicBotWidget';
import AnalyticsCenterLayout from '@/components/analytics/AnalyticsCenterLayout';
import { ShieldAlert, Activity, MessageSquare, X, User, Cpu, Shield, Settings, HeartHandshake, Bot, LayoutGrid } from 'lucide-react';
import { ToastProvider } from '@/components/shared/notifications/ToastProvider';
import { NotificationDrawer } from '@/components/shared/notifications/NotificationDrawer';
import { NotificationCenter } from '@/components/shared/notifications/NotificationCenter';
import { useNotificationSimulator } from '@/stores/notifications/notificationSimulator';
import {
  canAccessScreen,
  getScreenTitle,
  ROLE_DEFAULT_SCREEN,
  ROLE_PERMISSIONS,
  isValidScreen,
} from '@/lib/rbac/permissions';
import {
  usePermissionStore,
  mapUserRoleToMatrixRole,
  LEVEL_RANKS,
  SCREEN_TO_MODULE_MAP,
  type RolePermissions
} from '@/stores/permissionStore';
import type { AuditLog } from '@/types';
import type { TranslationKeys } from '@/i18n/translations';
import type { UserRole } from '@/types';

interface WorkspaceShellProps {
  initialScreen?: string;
}

export function WorkspaceShell({ initialScreen }: WorkspaceShellProps) {
  const role = useAuthStore((s) => s.role);
  const lang = useUIStore((s) => s.lang);
  const auditLogs = useNotificationsStore((s) => s.auditLogs);
  const { logout, user } = useAuth();
  const roleDefaultScreen = ROLE_DEFAULT_SCREEN[role];
  const defaultScreen = initialScreen && canAccessScreen(role, initialScreen) ? initialScreen : roleDefaultScreen;

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
  const activeScreen = useUIStore((s) => s.activeScreen);
  const isViewportLocked = activeScreen === 'inbox';
  const setActiveScreen = useUIStore((s) => s.setActiveScreen);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t: TranslationKeys = translations[lang];
  const previousRoleRef = React.useRef<UserRole | null>(null);
  const mountedRef = React.useRef(false);
  const lastUrlRef = React.useRef('');
  const isSyncingRef = React.useRef(false);
  const { logout, user, status } = useAuth();

  const currentScreenParam = searchParams?.get('screen');
  const isAuthHydrating = status === 'loading' || (user && role !== user.role);

  React.useEffect(() => {
    if (isAuthHydrating) return;
    if (isSyncingRef.current) return;

    let targetScreen = initialScreen;

    if (pathname === '/tickets') {
      targetScreen = 'tickets';
    } else {
      if (currentScreenParam && isValidScreen(currentScreenParam)) {
        targetScreen = currentScreenParam;
      } else if (initialScreen && isValidScreen(initialScreen)) {
        targetScreen = initialScreen;
      } else {
        targetScreen = ROLE_DEFAULT_SCREEN[role];
      }
    }

    if (targetScreen && !isValidScreen(targetScreen)) {
      targetScreen = ROLE_DEFAULT_SCREEN[role];
    }

    if (activeScreen !== targetScreen && targetScreen) {
      const urlKey = `${pathname}?${searchParams?.toString() || ''}`;
      if (!mountedRef.current || urlKey !== lastUrlRef.current) {
        isSyncingRef.current = true;
        setActiveScreen(targetScreen);
        lastUrlRef.current = urlKey;
        setTimeout(() => {
          isSyncingRef.current = false;
        }, 0);
      }
    }
    mountedRef.current = true;
  }, [role, pathname, currentScreenParam, initialScreen, isAuthHydrating]);

  // Synchronize activeScreen state back to the URL screen query param or route pathname
  React.useEffect(() => {
    if (!mountedRef.current || isAuthHydrating) return;
    if (isSyncingRef.current) return;

    // Determine target path based on activeScreen/role
    let targetPath = pathname;
    if (role === 'support_agent') {
      if (activeScreen === 'tickets' && pathname !== '/tickets') {
        targetPath = '/tickets';
      } else if (activeScreen !== 'tickets' && pathname === '/tickets') {
        targetPath = '/workspace/inbox';
      }
    }

    const needsParamSync = (activeScreen !== currentScreenParam) && !(activeScreen === initialScreen && !currentScreenParam);
    const needsPathSync = (targetPath !== pathname);

    if (needsParamSync || needsPathSync) {
      const params = new URLSearchParams(searchParams?.toString() || '');
      if (activeScreen === initialScreen || activeScreen === 'tickets') {
        params.delete('screen');
      } else {
        params.set('screen', activeScreen);
      }
      
      const newQuery = params.toString();
      const newUrl = newQuery ? `${targetPath}?${newQuery}` : targetPath;
      
      isSyncingRef.current = true;
      router.replace(newUrl, { scroll: false });
      
      setTimeout(() => {
        isSyncingRef.current = false;
      }, 0);
    }
  }, [activeScreen, pathname, currentScreenParam, router, initialScreen, role, isAuthHydrating]);

  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [showPublicBotOverlay, setShowPublicBotOverlay] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Notification UI & Simulator states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCenterOpen, setIsCenterOpen] = useState(false);
  const [isSimEnabled, setIsSimEnabled] = useState(false);

  // Run the operational simulation loop in the background when enabled
  useNotificationSimulator(isSimEnabled, 15000);

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

  const [roleToSwitch, setRoleToSwitch] = useState<UserRole | null>(null);

  const handleSwitchRole = (targetRole: UserRole) => {
    if (targetRole === role) return;
    setRoleToSwitch(targetRole);
  };

  const confirmRoleSwitch = async () => {
    setRoleToSwitch(null);
    await logout();
  };

  const authorized = canAccessScreen(role, activeScreen);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ToastProvider>
      <div
        className="flex h-screen min-h-screen overflow-hidden bg-slate-50 dark:bg-[#030712] transition-colors"
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
          onOpenNotifications={() => setIsDrawerOpen(true)}
          onOpenLauncher={() => setActiveScreen('launcher')}
          onSwitchRole={handleSwitchRole}
        />

        <main
          aria-label={lang === 'ar' ? 'مساحة العمل الرئيسية' : 'Main Workspace'}
          className={`flex-1 min-h-0 px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-8 bg-slate-50 dark:bg-[#030712] transition-colors min-w-0 ${isViewportLocked ? 'overflow-hidden flex flex-col h-full' : 'overflow-y-auto overflow-x-hidden'}`}
        >
          {activeScreen === 'launcher' ? (
            <WorkspaceLauncher
              lang={lang}
              currentRole={role}
              onSelectRole={(selectedRole) => {
                handleSwitchRole(selectedRole);
              }}
              onLaunchBotWidget={() => setShowPublicBotOverlay(true)}
            />
          ) : !authorized ? (
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
              {(role === 'client_admin' || role === 'operations_manager' || role === 'viewer') && (
                <ClientAdminView activeSubScreen={activeScreen} />
              )}
              {role === 'qa_manager' && <QAManagerView activeSubScreen={activeScreen} />}
              {role === 'supervisor' && <SupervisorView activeSubScreen={activeScreen} />}
              {role === 'support_agent' && <SupportAgentView activeSubScreen={activeScreen} />}
              {role === 'customer' && (
                <CustomerPortalView activeSubScreen={activeScreen} setActiveSubScreen={setActiveScreen} />
              )}
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

      {showAuditLogs && role !== 'support_agent' && (
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

      {/* Notification Drawer and Full Center Console overlays */}
      <NotificationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onOpenCenter={() => {
          setIsDrawerOpen(false);
          setIsCenterOpen(true);
        }}
        isSimEnabled={isSimEnabled}
        onToggleSim={setIsSimEnabled}
      />

      <NotificationCenter
        isOpen={isCenterOpen}
        onClose={() => setIsCenterOpen(false)}
      />

      {roleToSwitch && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-6 animate-in fade-in-50 zoom-in-95 duration-200 text-left rtl:text-right">
            <div className="flex items-center gap-4 text-rose-600 dark:text-rose-455">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-800 dark:text-white text-base">
                  {lang === 'ar' ? 'تأكيد تبديل بيئة العمل' : 'Confirm Workspace Switch'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {lang === 'ar' ? 'يتطلب إعادة المصادقة' : 'Re-authentication required'}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
              {lang === 'ar' 
                ? 'تبديل بيئات العمل يتطلب منك تسجيل الخروج من جلستك الحالية وإعادة التحقق. هل ترغب في المتابعة؟'
                : 'Switching workspaces requires you to sign out of your current session and re-authenticate. Would you like to proceed?'}
            </p>
            <div className="flex justify-end items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRoleToSwitch(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors cursor-pointer"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={confirmRoleSwitch}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg shadow-rose-500/25 transition-all cursor-pointer"
              >
                {lang === 'ar' ? 'تأكيد التبديل وتسجيل الخروج' : 'Confirm Switch & Logout'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </ToastProvider>
  );
}

interface WorkspaceLauncherProps {
  lang: 'en' | 'ar';
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  onLaunchBotWidget: () => void;
}

function WorkspaceLauncher({ lang, currentRole, onSelectRole, onLaunchBotWidget }: WorkspaceLauncherProps) {
  const isRtl = lang === 'ar';

  const cards = [
    {
      role: 'support_agent' as UserRole,
      defaultScreen: 'agent_dashboard',
      nameEn: 'Liam (Support Agent)',
      nameAr: 'ليام (وكيل الدعم)',
      descEn: 'Access the unified agent inbox workspace with AI Smart Reply, customer 360, macros, and ticket queues.',
      descAr: 'الوصول إلى مساحة عمل الوكيل الموحدة مع ميزة الرد الذكي المساعد، وعرض ملف العميل 360 درجة.',
      icon: <User className="w-6 h-6 text-sky-500" />,
      bgClass: 'from-sky-500/10 to-cyan-500/10 hover:border-sky-500/50 text-sky-500',
      telemetry: [
        { labelEn: 'Active Chats', labelAr: 'محادثات نشطة', value: '4' },
        { labelEn: 'CSAT Rate', labelAr: 'تقييم العملاء', value: '98%' },
        { labelEn: 'SLA Adherence', labelAr: 'الالتزام بالـ SLA', value: '99.2%' }
      ]
    },
    {
      role: 'qa_manager' as UserRole,
      defaultScreen: 'qa_queue',
      nameEn: 'Marc (QA Manager)',
      nameAr: 'مارك (مدير الجودة)',
      descEn: 'Audit conversation transcripts, grade call scorecards, resolve agent disputes, and draft coaching plans.',
      descAr: 'تدقيق محادثات العملاء وتعبئة نموذج تقييم المكالمات، ومعالجة اعتراضات الوكلاء وتصميم برامج التدريب.',
      icon: <Cpu className="w-6 h-6 text-purple-500" />,
      bgClass: 'from-purple-500/10 to-pink-500/10 hover:border-purple-500/50 text-purple-500',
      telemetry: [
        { labelEn: 'Pending Audits', labelAr: 'عمليات معلقة', value: '12' },
        { labelEn: 'Avg QA Score', labelAr: 'متوسط الدرجات', value: '87.5%' },
        { labelEn: 'Active Coaching', labelAr: 'خطط تدريب نشطة', value: '3' }
      ]
    },
    {
      role: 'supervisor' as UserRole,
      defaultScreen: 'supervisor_monitor',
      nameEn: 'Sarah (Supervisor)',
      nameAr: 'سارة (مشرف الفريق)',
      descEn: 'Real-time agent roster monitoring, manual status overrides, whisper coaching, and live queue analytics.',
      descAr: 'مراقبة الموظفين المتصلين وتغيير حالاتهم يدوياً، واستخدام التوجيه الهامس، وتحليل طوابير الخدمة.',
      icon: <Shield className="w-6 h-6 text-amber-500" />,
      bgClass: 'from-amber-500/10 to-yellow-500/10 hover:border-amber-500/50 text-amber-500',
      telemetry: [
        { labelEn: 'Active Agents', labelAr: 'وكلاء متصلين', value: '14' },
        { labelEn: 'Queue Wait', labelAr: 'انتظار الطابور', value: '45s' },
        { labelEn: 'Barge-In Ready', labelAr: 'التدخل المباشر', value: 'Live' }
      ]
    },
    {
      role: 'super_admin' as UserRole,
      defaultScreen: 'sa_dashboard',
      nameEn: 'Richard (Super Admin)',
      nameAr: 'ريتشارد (المشرف العام)',
      descEn: 'Register LLMs and Speech engines, monitor SIP trunks, check vector DB compactions, and track infrastructure costs.',
      descAr: 'تسجيل نماذج الذكاء الاصطناعي ومحركات الصوت، ومراقبة قنوات SIP، ومراجعة حالة قواعد البيانات المتجهة.',
      icon: <ShieldAlert className="w-6 h-6 text-red-500" />,
      bgClass: 'from-red-500/10 to-orange-500/10 hover:border-red-500/50 text-red-500',
      telemetry: [
        { labelEn: 'AI Gateways', labelAr: 'بوابات الذكاء', value: '3 Active' },
        { labelEn: 'ASR Latency', labelAr: 'استجابة الصوت', value: '120ms' },
        { labelEn: 'SIP Trunk', labelAr: 'قناة VoIP', value: 'Connected' }
      ]
    },
    {
      role: 'client_admin' as UserRole,
      defaultScreen: 'bots',
      nameEn: 'Saud (Client Admin)',
      nameAr: 'سعود (مسؤول العميل)',
      descEn: 'Orchestrate dialog builders, safety toxicity thresholds, omnichannel templates, and custom forbidden filters.',
      descAr: 'إدارة بناء مسارات البوت ونوايا Farah AI، ووضع حراس الأمان لتصفية النصوص وتكوين القنوات الموحدة.',
      icon: <Settings className="w-6 h-6 text-blue-500" />,
      bgClass: 'from-blue-500/10 to-indigo-500/10 hover:border-blue-500/50 text-blue-550',
      telemetry: [
        { labelEn: 'Active Bots', labelAr: 'روبوتات نشطة', value: '2' },
        { labelEn: 'NLU Confidence', labelAr: 'دقة الـ NLU', value: '94.2%' },
        { labelEn: 'Toxicity Slider', labelAr: 'حساسية النصوص', value: 'Medium' }
      ]
    },
    {
      role: 'customer' as UserRole,
      defaultScreen: 'customer_home',
      nameEn: 'David (Customer Portal)',
      nameAr: 'ديفيد (بوابة المستخدمين)',
      descEn: 'Access the guest self-service helpdesk: RAG search, ticket submissions, and refund OTP workflows.',
      descAr: 'خدمة الدعم الذاتي للمستفيدين: البحث المباشر في قاعدة المعرفة، وإرسال التذاكر، واسترداد الأموال مع التحقق.',
      icon: <HeartHandshake className="w-6 h-6 text-violet-500" />,
      bgClass: 'from-violet-500/10 to-fuchsia-500/10 hover:border-violet-500/50 text-violet-500',
      telemetry: [
        { labelEn: 'Knowledge Base', labelAr: 'قاعدة المعرفة', value: '128 Items' },
        { labelEn: 'Open Tickets', labelAr: 'تذاكر نشطة', value: '1' },
        { labelEn: 'Live Chat Status', labelAr: 'دردشة حية', value: 'Online' }
      ]
    },
    {
      role: 'public_bot' as UserRole,
      defaultScreen: 'public',
      nameEn: 'Public / Bot Widget',
      nameAr: 'مشغل البوت العام',
      descEn: 'Preview the public visitor chat widget with simulated intent matching, RAG search, and live logs.',
      descAr: 'معاينة مشغل محادثات الزوار الخارجي ومحاكاة مطابقة النوايا مع RAG.',
      icon: <Bot className="w-6 h-6 text-emerald-500" />,
      bgClass: 'from-emerald-500/10 to-teal-500/10 hover:border-emerald-500/50 text-emerald-500',
      telemetry: [
        { labelEn: 'Visitor Matches', labelAr: 'تطابقات الزوار', value: '96%' },
        { labelEn: 'Avg Response', labelAr: 'سرعة الرد', value: '<1s' },
        { labelEn: 'Sandbox SDK', labelAr: 'حزمة التجربة', value: 'V1.4' }
      ],
      isSpecialAction: true
    }
  ];

  const isSupportAgent = currentRole === 'support_agent';
  const visibleCards = cards.filter(card => {
    if (isSupportAgent) {
      return card.role === 'support_agent' || card.role === 'customer' || (card.role as string) === 'public_bot';
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      <div className="text-center md:text-left">
        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
          {isRtl ? 'مشغل بيئة العمل الموحد' : 'Unified Workspace Launcher'}
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xl">
          {isRtl
            ? 'حدد مساحة عمل وظيفية أدناه للوصول السريع إلى الشاشات المخصصة وحراس الوصول واللوحات المعتمدة.'
            : 'Select an operational workspace below to access customized dashboards, role-based toolings, and metrics.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {visibleCards.map((card) => {
          const isCurrent = currentRole === card.role;
          return (
            <div
              key={card.role}
              onClick={() => {
                if (card.isSpecialAction) {
                  onLaunchBotWidget();
                } else {
                  onSelectRole(card.role);
                }
              }}
              className={`group relative flex flex-col justify-between p-6 border border-slate-200 dark:border-slate-800/80 rounded-2xl bg-gradient-to-br ${card.bgClass} cursor-pointer transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:outline-none`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (card.isSpecialAction) {
                    onLaunchBotWidget();
                  } else {
                    onSelectRole(card.role);
                  }
                }
              }}
            >
              <div>
                <div className="flex justify-between items-center">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 shadow-sm shrink-0">
                    {card.icon}
                  </div>
                  {isCurrent && (
                    <span className="px-2 py-0.5 text-[8px] font-bold font-mono tracking-wider bg-blue-600 text-white rounded-full uppercase">
                      {isRtl ? 'نشط حالياً' : 'Active Role'}
                    </span>
                  )}
                </div>

                <div className="mt-4 space-y-1">
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {isRtl ? card.nameAr : card.nameEn}
                  </h3>
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500 leading-relaxed pt-1">
                    {isRtl ? card.descAr : card.descEn}
                  </p>
                </div>
              </div>

              {/* Hover Telemetry Card overlay */}
              <div className="mt-5 pt-4 border-t border-slate-200/50 dark:border-slate-800/50 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider block mb-2">
                  {isRtl ? 'إحصائيات فورية (محاكاة)' : 'Telemetry Metrics (Simulated)'}
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {card.telemetry.map((tItem, idx) => (
                    <div key={idx} className="bg-white/60 dark:bg-slate-950/40 p-1.5 rounded-lg border border-slate-100/50 dark:border-slate-900/20 text-center">
                      <span className="text-[8px] text-slate-400 dark:text-slate-500 font-medium block truncate">
                        {isRtl ? tItem.labelAr : tItem.labelEn}
                      </span>
                      <strong className="text-[10px] font-black text-slate-700 dark:text-slate-200 font-mono block mt-0.5">
                        {tItem.value}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
