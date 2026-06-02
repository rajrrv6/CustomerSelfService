'use client';

import React, { useState } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { translations } from '@/i18n/translations';
import {
  Sparkles,
  Globe,
  Bot,
  Brain,
  ShieldCheck,
  Radio,
  FileText,
  Mail,
  Users,
  Shield,
  HelpCircle,
  Play,
  TrendingUp,
  Award,
  Calendar,
  Layers,
  Database,
  Lock,
  Phone,
  BarChart2,
  GitBranch,
  Bell,
  ChevronDown
} from 'lucide-react';
import { UserRole } from '@/types';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export function Sidebar({
  activeScreen,
  setActiveScreen,
  isMobileOpen = false,
  onCloseMobile,
  isRtl = false
}: {
  activeScreen: string;
  setActiveScreen: (screenId: string) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  isRtl?: boolean;
}) {
  const role = useAuthStore((s) => s.role);
  const lang = useUIStore((s) => s.lang);
  const setLang = useUIStore((s) => s.setLang);
  const t = translations[lang];

  const [showSubRoleMenu, setShowSubRoleMenu] = useState(false);

  const clientAdminRoles = [
    { value: 'client_admin', label: lang === 'ar' ? 'مسؤول النظام' : 'Full Administrator' },
    { value: 'supervisor', label: lang === 'ar' ? 'مشرف الفريق' : 'Supervisor' },
    { value: 'qa_manager', label: lang === 'ar' ? 'مدير الجودة' : 'QA Manager' },
    { value: 'operations_manager', label: lang === 'ar' ? 'مدير العمليات' : 'Operations Manager' },
    { value: 'viewer', label: lang === 'ar' ? 'مراقب عام' : 'Viewer' }
  ];

  const endUserRoles = [
    { value: 'customer', label: lang === 'ar' ? 'بوابة العملاء' : 'Customer Portal' },
    { value: 'support_agent', label: lang === 'ar' ? 'وكيل الدعم' : 'Support Agent' }
  ];

  // Helper to compile sidebar options based on role
  const getSidebarItems = (currentRole: UserRole): SidebarItem[] => {
    switch (currentRole) {
      case 'super_admin':
        return [
          { id: 'llm_registry', label: t.llmRegistry, icon: <Brain className="w-4 h-4" /> },
          { id: 'asr_tts_registry', label: t.asrTtsRegistry, icon: <Radio className="w-4 h-4" /> },
          { id: 'channels', label: t.omnichannel, icon: <Layers className="w-4 h-4" /> },
          { id: 'nlu_governance', label: t.nluGovernance, icon: <ShieldCheck className="w-4 h-4" /> },
          { id: 'cost_benchmarks', label: t.costBenchmarks, icon: <BarChart2 className="w-4 h-4" /> },
          { id: 'cross_tenant_analytics', label: t.crossTenantAnalytics, icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'vector_db', label: t.vectorDbStatus, icon: <Database className="w-4 h-4" /> },
          { id: 'sip_trunk', label: t.sipTrunkConfig, icon: <Phone className="w-4 h-4" /> },
          { id: 'analytics_center', label: t.screens.analytics_center, icon: <BarChart2 className="w-4 h-4" /> }
        ];

      case 'client_admin':
        return [
          { id: 'supervisor_monitor', label: isRtl ? 'لوحة تحكم المشرف' : 'Supervisor Dashboard', icon: <Shield className="w-4 h-4" /> },
          { id: 'qa_queue', label: isRtl ? 'مساحة عمل الجودة' : 'QA Workspace', icon: <Award className="w-4 h-4" /> },
          { id: 'agents', label: isRtl ? 'مراقبة العمليات' : 'Operations Monitoring', icon: <Users className="w-4 h-4" /> },
          { id: 'workforce', label: isRtl ? 'تخطيط القوى العاملة' : 'Workforce Planning', icon: <Calendar className="w-4 h-4" /> },
          { id: 'inbox', label: isRtl ? 'مساحة عمل الوكيل' : 'Agent Workspace', icon: <Mail className="w-4 h-4" /> },
          { id: 'sla', label: isRtl ? 'لوحة تحكم اتفاقية الخدمة' : 'SLA Dashboard', icon: <Lock className="w-4 h-4" /> },
          { id: 'analytics_center', label: isRtl ? 'مركز التحليلات والمراقبة' : 'Analytics & Observability Center', icon: <BarChart2 className="w-4 h-4" /> },
          { id: 'knowledge_base', label: t.knowledgeBase, icon: <Brain className="w-4 h-4" /> },
          { id: 'bots', label: isRtl ? 'إدارة البوت' : 'Bot Administration', icon: <Bot className="w-4 h-4" /> },
          { id: 'surveys', label: isRtl ? 'التقارير والاستبيانات' : 'Reports', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'integrations', label: t.integrations, icon: <Database className="w-4 h-4" /> },
          { id: 'billing', label: isRtl ? 'الفوترة والاشتراكات' : 'Billing', icon: <Layers className="w-4 h-4" /> },
          { id: 'rbac', label: isRtl ? 'إدارة الصلاحيات' : 'RBAC', icon: <ShieldCheck className="w-4 h-4" /> }
        ];

      case 'operations_manager':
        return [
          { id: 'inbox', label: isRtl ? 'مساحة عمل الوكيل' : 'Agent Workspace', icon: <Mail className="w-4 h-4" /> },
          { id: 'agents', label: isRtl ? 'مراقبة العمليات' : 'Operations Monitoring', icon: <Users className="w-4 h-4" /> },
          { id: 'sla', label: isRtl ? 'لوحة تحكم اتفاقية الخدمة' : 'SLA Dashboard', icon: <Lock className="w-4 h-4" /> },
          { id: 'surveys', label: isRtl ? 'التقارير والاستبيانات' : 'Reports', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'integrations', label: t.integrations, icon: <Database className="w-4 h-4" /> },
          { id: 'analytics_center', label: isRtl ? 'مركز التحليلات والمراقبة' : 'Analytics & Observability Center', icon: <BarChart2 className="w-4 h-4" /> }
        ];

      case 'qa_manager':
        return [
          { id: 'qa_queue', label: isRtl ? 'مساحة عمل الجودة' : 'QA Workspace', icon: <Award className="w-4 h-4" /> },
          { id: 'coaching', label: isRtl ? 'خطط التدريب والتوجيه' : 'Coaching Plans', icon: <Users className="w-4 h-4" /> },
          { id: 'training', label: t.screens.training || 'Training Loop', icon: <Brain className="w-4 h-4" /> },
          { id: 'inbox', label: isRtl ? 'مساحة عمل الوكيل' : 'Agent Workspace', icon: <Mail className="w-4 h-4" /> },
          { id: 'surveys', label: isRtl ? 'التقارير والاستبيانات' : 'Reports', icon: <TrendingUp className="w-4 h-4" /> }
        ];

      case 'support_agent':
        return [
          { id: 'agent_dashboard', label: t.screens.agent_dashboard, icon: <BarChart2 className="w-4 h-4" /> },
          { id: 'inbox', label: isRtl ? 'مساحة عمل الوكيل' : 'Agent Workspace', icon: <Mail className="w-4 h-4" /> },
          { id: 'tickets', label: t.screens.tickets, icon: <FileText className="w-4 h-4" /> }
        ];

      case 'supervisor':
        return [
          { id: 'inbox', label: isRtl ? 'مساحة عمل الوكيل' : 'Agent Workspace', icon: <Mail className="w-4 h-4" /> },
          { id: 'supervisor_monitor', label: isRtl ? 'لوحة تحكم المشرف' : 'Supervisor Dashboard', icon: <Shield className="w-4 h-4" /> },
          { id: 'workforce', label: isRtl ? 'تخطيط القوى العاملة' : 'Workforce Planning', icon: <Calendar className="w-4 h-4" /> },
          { id: 'sla', label: isRtl ? 'لوحة تحكم اتفاقية الخدمة' : 'SLA Dashboard', icon: <Lock className="w-4 h-4" /> },
          { id: 'analytics_center', label: isRtl ? 'مركز التحليلات والمراقبة' : 'Analytics & Observability Center', icon: <BarChart2 className="w-4 h-4" /> }
        ];

      case 'customer':
        return [
          { id: 'customer_home', label: isRtl ? 'الرئيسية' : 'Dashboard', icon: <HelpCircle className="w-4 h-4" /> },
          { id: 'customer_kb', label: isRtl ? 'مساعد الذكاء الاصطناعي' : 'AI Copilot', icon: <Brain className="w-4 h-4" /> },
          { id: 'customer_notifications', label: isRtl ? 'التنبيهات' : 'Notifications', icon: <Bell className="w-4 h-4" /> },
          { id: 'customer_kb_article', label: isRtl ? 'مركز المساعدة' : 'Help Center', icon: <HelpCircle className="w-4 h-4" /> },
          { id: 'customer_my_tickets', label: isRtl ? 'تذاكري' : 'My Tickets', icon: <Layers className="w-4 h-4" /> }
        ];

      case 'viewer':
        return [
          { id: 'surveys', label: isRtl ? 'التقارير والاستبيانات' : 'Reports', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'sla', label: isRtl ? 'لوحة تحكم اتفاقية الخدمة' : 'SLA Dashboard', icon: <Lock className="w-4 h-4" /> },
          { id: 'analytics_center', label: isRtl ? 'مركز التحليلات والمراقبة' : 'Analytics & Observability Center', icon: <BarChart2 className="w-4 h-4" /> }
        ];

      default:
        return [];
    }
  };

  const menuItems = getSidebarItems(role);

  return (
    <aside
      className={`fixed inset-y-0 ${isRtl ? 'right-0' : 'left-0'} z-50 w-72 max-w-[85vw] bg-white dark:bg-[#03050a] text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 h-screen lg:static lg:w-64 transition-transform duration-300 ${
        isMobileOpen ? 'translate-x-0' : isRtl ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Top Section */}
      <div className="flex flex-col flex-1">
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-200 dark:border-slate-800/80">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-sm text-slate-900 dark:text-white tracking-tight leading-none">AI-Native mPaaS</h2>
            <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest mt-1 block">
              Omnichannel CX
            </span>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70 cursor-pointer"
            aria-label="Close sidebar"
          >
            ×
          </button>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 sm:py-6 space-y-1.5">
          {/* Sub-Role Selector */}
          {(['client_admin', 'supervisor', 'qa_manager', 'operations_manager', 'viewer'].includes(role) || ['customer', 'support_agent'].includes(role)) && (
            <div className="px-3 mb-4 relative">
              <span className="text-[9px] uppercase font-bold text-slate-500 block mb-1">
                {lang === 'ar' ? 'الدور الوظيفي الداخلي:' : 'Internal Sub-Role:'}
              </span>
              <button
                type="button"
                onClick={() => setShowSubRoleMenu(!showSubRoleMenu)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-900/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <span>
                  {['client_admin', 'supervisor', 'qa_manager', 'operations_manager', 'viewer'].includes(role)
                    ? clientAdminRoles.find((r) => r.value === role)?.label || role
                    : endUserRoles.find((r) => r.value === role)?.label || role}
                </span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {showSubRoleMenu && (
                <>
                  <div className="fixed inset-0 z-45" onClick={() => setShowSubRoleMenu(false)} />
                  <div className="absolute left-3 right-3 mt-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 z-50 animate-in fade-in-50 slide-in-from-top-2">
                    {(['client_admin', 'supervisor', 'qa_manager', 'operations_manager', 'viewer'].includes(role) ? clientAdminRoles : endUserRoles).map((subItem) => (
                      <button
                        key={subItem.value}
                        type="button"
                        onClick={() => {
                          useAuthStore.getState().setRole(subItem.value as UserRole);
                          if (subItem.value === 'client_admin') setActiveScreen('bots');
                          else if (subItem.value === 'supervisor') setActiveScreen('supervisor_monitor');
                          else if (subItem.value === 'qa_manager') setActiveScreen('qa_queue');
                          else if (subItem.value === 'operations_manager') setActiveScreen('inbox');
                          else if (subItem.value === 'support_agent') setActiveScreen('agent_dashboard');
                          else if (subItem.value === 'viewer') setActiveScreen('surveys');
                          else if (subItem.value === 'customer') setActiveScreen('customer_home');
                          setShowSubRoleMenu(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                          role === subItem.value
                            ? 'bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-white font-bold'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        <span>{subItem.label}</span>
                        {role === subItem.value && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {role.replace('_', ' ')} Options
          </div>
          {menuItems.map((item) => {
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                data-testid={`sidebar-item-${item.id}`}
                onClick={() => setActiveScreen(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 text-start cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 translate-x-1.5 rtl:-translate-x-1.5'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-100 text-slate-500 dark:text-slate-400 hover:translate-x-1 rtl:hover:-translate-x-1'
                }`}
              >
                <span className={`${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Section */}
      <div className="border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/40 px-4 py-3 text-[10px] text-slate-500 text-center font-semibold">
        <div className="lg:hidden mb-3 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-100 dark:bg-slate-950/70 p-3 text-left">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <Globe className="h-3.5 w-3.5 text-blue-400" />
            <span>{t.language}</span>
          </div>
          <div className="flex items-center gap-2">
            {(['en', 'ar'] as const).map((locale) => {
              const isActive = lang === locale;

              return (
                <button
                  key={locale}
                  type="button"
                  onClick={() => setLang(locale)}
                  className={`flex-1 rounded-xl border px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'border-blue-500 bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                  aria-pressed={isActive}
                >
                  {locale === 'en' ? 'EN' : 'ع'}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 glow-active" />
          <span>Tenant: MP-CORE-PROD</span>
        </div>
      </div>
    </aside>
  );
}
