'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
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

export function Header({
  activeScreenTitle,
  onLogout,
  onOpenAuditLogs,
  onOpenMenu
}: {
  activeScreenTitle: string;
  onLogout: () => void;
  onOpenAuditLogs: () => void;
  onOpenMenu: () => void;
}) {
  const { role, setRole, lang, setLang, theme, setTheme, auditLogs } = useApp();
  const t = translations[lang];

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const getRoleLabel = (r: UserRole): string => {
    const maps: Record<UserRole, Record<'en' | 'ar', string>> = {
      super_admin: { en: 'Super Admin', ar: 'مشرف عام النظام' },
      client_admin: { en: 'Client Admin', ar: 'مدير العميل' },
      operations_manager: { en: 'Operations Manager', ar: 'مدير العمليات' },
      qa_manager: { en: 'QA Manager', ar: 'مدير جودة الخدمة' },
      supervisor: { en: 'Supervisor', ar: 'مشرف الفريق' },
      support_agent: { en: 'Support Agent', ar: 'وكيل الدعم' },
      customer: { en: 'Customer Portal', ar: 'بوابة العملاء' },
      viewer: { en: 'Viewer', ar: 'مراقب عام' }
    };
    return maps[r]?.[lang] ?? r;
  };

  const rolesList: { value: UserRole; label: string }[] = [
    { value: 'super_admin', label: getRoleLabel('super_admin') },
    { value: 'client_admin', label: getRoleLabel('client_admin') },
    { value: 'operations_manager', label: getRoleLabel('operations_manager') },
    { value: 'qa_manager', label: getRoleLabel('qa_manager') },
    { value: 'supervisor', label: getRoleLabel('supervisor') },
    { value: 'support_agent', label: getRoleLabel('support_agent') },
    { value: 'customer', label: getRoleLabel('customer') },
    { value: 'viewer', label: getRoleLabel('viewer') }
  ];

  // Dummy notification data matching platform events
  const notifications = [
    {
      id: 1,
      text: lang === 'ar' 
        ? 'تحذير SLA: موعد الاستجابة لـ TIC-1022 ينتهي خلال 10 دقائق' 
        : 'SLA Warning: TIC-1022 response deadline is in 10 minutes',
      type: 'warning',
      time: lang === 'ar' ? 'منذ دقيقتين' : '2m ago'
    },
    {
      id: 2,
      text: lang === 'ar' 
        ? 'فرح AI: ارتفع معدل حل الخدمة الذاتية إلى 72.8%' 
        : 'Farah AI: Deflection rate increased to 72.8%',
      type: 'info',
      time: lang === 'ar' ? 'منذ 12 دقيقة' : '12m ago'
    },
    {
      id: 3,
      text: lang === 'ar' 
        ? 'مجموعة Pinecone: تمت إعادة فهرسة ملف سياسة الاسترجاع القياسية PDF' 
        : 'Pinecone Cluster: Reindexed Standard Return Policy PDF',
      type: 'success',
      time: lang === 'ar' ? 'منذ ساعة' : '1h ago'
    }
  ];

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
        {/* Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none max-w-[40vw] sm:max-w-none"
          >
            <Shield className="w-3.5 h-3.5 text-blue-500" />
            <span className="truncate max-w-[18vw] sm:max-w-none">{rolesList.find((r) => r.value === role)?.label}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0" />
          </button>

          {showRoleMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowRoleMenu(false)} />
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in-50 slide-in-from-top-3">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {t.roleSwitcher}
                </div>
                {rolesList.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => {
                      setRole(item.value);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors flex items-center justify-between ${
                      role === item.value
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{item.label}</span>
                    {role === item.value && <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />}
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
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all relative border border-transparent hover:border-slate-200 dark:hover:border-slate-800 shrink-0"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 glow-active" />
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-3 z-50 animate-in fade-in-50 slide-in-from-top-3">
                <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800 dark:text-white">
                    {lang === 'ar' ? 'إشعارات النظام النشطة' : 'Active System Notifications'}
                  </span>
                  <span className="text-[10px] text-blue-500 font-semibold cursor-pointer hover:underline">
                    {lang === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all read'}
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto mt-2">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex gap-3 items-start border-b border-slate-50 dark:border-slate-800/30 last:border-b-0"
                    >
                      {n.type === 'warning' ? (
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal">{n.text}</p>
                        <span className="text-[9px] text-slate-400 mt-1 block font-mono">{n.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
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
