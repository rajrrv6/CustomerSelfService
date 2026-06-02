'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationsStore } from '@/stores/notificationsStore';
import { useUnreadCount } from '@/stores/notifications/notificationSelectors';
import { translations } from '@/i18n/translations';
import {
  Bell,
  Globe,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  Activity,
  User,
  Shield,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { UserRole } from '@/types';

export type TopApp = 'super_admin' | 'client_admin' | 'end_user' | 'public_bot';

export const getTopAppForRole = (r: UserRole): TopApp => {
  if (r === 'super_admin') return 'super_admin';
  if (r === 'customer' || r === 'support_agent') return 'end_user';
  return 'client_admin';
};

export function Header({
  activeScreenTitle,
  onLogout,
  onOpenAuditLogs,
  onOpenMenu,
  onOpenNotifications
}: {
  activeScreenTitle: string;
  onLogout: () => void;
  onOpenAuditLogs: () => void;
  onOpenMenu: () => void;
  onOpenNotifications: () => void;
}) {
  const router = useRouter();
  const role = useAuthStore((s) => s.role);
  const setRole = useAuthStore((s) => s.setRole);
  const lang = useUIStore((s) => s.lang);
  const setLang = useUIStore((s) => s.setLang);
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const auditLogs = useNotificationsStore((s) => s.auditLogs);
  const unreadCount = useUnreadCount();
  const t = translations[lang];

  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const topAppList: { value: TopApp; label: string }[] = [
    { value: 'super_admin', label: lang === 'ar' ? 'مشرف عام النظام' : 'Super Admin' },
    { value: 'client_admin', label: lang === 'ar' ? 'مدير العميل' : 'Client Admin' },
    { value: 'end_user', label: lang === 'ar' ? 'بوابة المستخدمين' : 'End User' },
    { value: 'public_bot', label: lang === 'ar' ? 'البوت العام' : 'Public / Bot' }
  ];

  const currentTopApp = getTopAppForRole(role);



  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 sm:px-6 flex items-center justify-between gap-3 sticky top-0 z-40 transition-colors min-w-0">
      {/* Left side: Breadcrumb & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMenu}
          className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
          aria-label="Open navigation"
        >
          <span className="flex flex-col gap-1">
            <span className="block w-4 h-0.5 rounded-full bg-current" />
            <span className="block w-4 h-0.5 rounded-full bg-current" />
            <span className="block w-4 h-0.5 rounded-full bg-current" />
          </span>
        </button>
        <div className="hidden sm:flex w-8 h-8 rounded-lg bg-blue-600/10 dark:bg-blue-500/10 items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
          <Sparkles className="w-4.5 h-4.5" />
        </div>
        <div className="flex items-center gap-1.5 text-sm min-w-0">
          <span className="hidden sm:inline text-slate-400 dark:text-slate-500 font-medium">{t.appName}</span>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[42vw] sm:max-w-none">{activeScreenTitle}</span>
        </div>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* App Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none max-w-[40vw] sm:max-w-none"
          >
            <Shield className="w-3.5 h-3.5 text-blue-500" />
            <span className="truncate max-w-[18vw] sm:max-w-none">{topAppList.find((r) => r.value === currentTopApp)?.label}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0" />
          </button>

          {showRoleMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowRoleMenu(false)} />
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in-50 slide-in-from-top-3">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {lang === 'ar' ? 'التبديل بين التطبيقات' : 'Application Switcher'}
                </div>
                {topAppList.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => {
                      setShowRoleMenu(false);
                      if (item.value === 'public_bot') {
                        router.push('/portal/public');
                      } else if (item.value === 'super_admin') {
                        setRole('super_admin');
                        router.push('/admin/infrastructure');
                      } else if (item.value === 'end_user') {
                        setRole('customer');
                        router.push('/portal/home');
                      } else if (item.value === 'client_admin') {
                        setRole('client_admin');
                        router.push('/tenant/dashboard');
                      }
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors flex items-center justify-between ${
                      currentTopApp === item.value
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{item.label}</span>
                    {currentTopApp === item.value && <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Audit Logs Trigger */}
        <button
          onClick={onOpenAuditLogs}
          title={lang === 'ar' ? 'سجلات تدقيق النظام' : 'System Audit Logs'}
          className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all relative border border-transparent hover:border-slate-200 dark:hover:border-slate-800 shrink-0"
        >
          <Activity className="w-4.5 h-4.5" />
          {auditLogs.length > 0 && (
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-blue-500" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={onOpenNotifications}
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all relative border border-transparent hover:border-slate-200 dark:hover:border-slate-800 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            title={lang === 'ar' ? 'التنبيهات التشغيلية' : 'Operational Alerts'}
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Language Switcher */}
        <button
          onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
          className="hidden sm:flex p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-800 items-center gap-1.5 text-xs font-bold shrink-0"
        >
          <Globe className="w-4.5 h-4.5" />
          <span className="uppercase font-mono">{lang === 'en' ? 'AR' : 'EN'}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-800 shrink-0"
        >
          {theme === 'light' ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5" />}
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* User Account / Logout */}
        <button
          onClick={onLogout}
          className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-800 shrink-0"
          title={t.logout}
        >
          <div className="w-7 h-7 rounded-lg bg-blue-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            U
          </div>
          <LogOut className="w-4 h-4 text-slate-400 dark:text-slate-500 hover:text-red-500" />
        </button>
      </div>
    </header>
  );
}
