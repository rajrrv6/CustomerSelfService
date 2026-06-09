'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  ChevronDown,
  Sliders,
  BookOpen,
  Heart,
  History,
  MessageSquare,
  Activity,
  Settings
} from 'lucide-react';
import { UserRole } from '@/types';
import { canAccessScreen } from '@/lib/rbac/permissions';
import { usePermissionStore, mapUserRoleToMatrixRole } from '@/stores/permissionStore';
import { superAdminNavSections } from '@/config/superAdminNavigation';
import { clientAdminNavSections } from '@/config/clientAdminNavigation';
import { CENTRALIZED_PERSONAS } from '@/config/personas';

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
  const router = useRouter();

  const [showSubRoleMenu, setShowSubRoleMenu] = useState(false);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    operations_workforce: true,
    ai_knowledge: true,
    channels_automation: true,
    governance_analytics: true,
    system_access: true,
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleNavKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    if (!target) return;

    const nav = e.currentTarget;
    const focusables = Array.from(
      nav.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ) as HTMLElement[];

    const currentIndex = focusables.indexOf(target);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % focusables.length;
      focusables[nextIndex]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + focusables.length) % focusables.length;
      focusables[prevIndex]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      focusables[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      focusables[focusables.length - 1]?.focus();
    } else if (e.key === 'ArrowRight') {
      if (isRtl) {
        if (target.getAttribute('aria-expanded') === 'true') {
          e.preventDefault();
          target.click();
        }
      } else {
        if (target.getAttribute('aria-expanded') === 'false') {
          e.preventDefault();
          target.click();
        }
      }
    } else if (e.key === 'ArrowLeft') {
      if (isRtl) {
        if (target.getAttribute('aria-expanded') === 'false') {
          e.preventDefault();
          target.click();
        }
      } else {
        if (target.getAttribute('aria-expanded') === 'true') {
          e.preventDefault();
          target.click();
        }
      }
    }
  };

  // Master Sidebar Items Registry
  const getMasterSidebarItems = React.useCallback((): Record<string, SidebarItem> => {
    return {
      // Super Admin
      llm_registry: { id: 'llm_registry', label: t.llmRegistry, icon: <Brain className="w-4 h-4" /> },
      asr_tts_registry: { id: 'asr_tts_registry', label: t.asrTtsRegistry, icon: <Radio className="w-4 h-4" /> },
      channels: { id: 'channels', label: t.omnichannel, icon: <Layers className="w-4 h-4" /> },
      nlu_governance: { id: 'nlu_governance', label: t.nluGovernance, icon: <ShieldCheck className="w-4 h-4" /> },
      cost_benchmarks: { id: 'cost_benchmarks', label: t.costBenchmarks, icon: <BarChart2 className="w-4 h-4" /> },
      cross_tenant_analytics: { id: 'cross_tenant_analytics', label: t.crossTenantAnalytics, icon: <TrendingUp className="w-4 h-4" /> },
      vector_db: { id: 'vector_db', label: t.vectorDbStatus, icon: <Database className="w-4 h-4" /> },
      sip_trunk: { id: 'sip_trunk', label: t.sipTrunkConfig, icon: <Phone className="w-4 h-4" /> },
      
      // Client / Workspace
      supervisor_monitor: { id: 'supervisor_monitor', label: isRtl ? 'لوحة تحكم المشرف' : 'Supervisor Dashboard', icon: <Shield className="w-4 h-4" /> },
      qa_queue: { id: 'qa_queue', label: isRtl ? 'مساحة عمل الجودة' : 'QA Workspace', icon: <Award className="w-4 h-4" /> },
      coaching: { id: 'coaching', label: isRtl ? 'خطط التدريب والتوجيه' : 'Coaching Plans', icon: <Users className="w-4 h-4" /> },
      training: { id: 'training', label: t.screens.training || 'Training Loop', icon: <Brain className="w-4 h-4" /> },
      agents: { id: 'agents', label: isRtl ? 'مراقبة العمليات' : 'Operations Monitoring', icon: <Users className="w-4 h-4" /> },
      workforce: { id: 'workforce', label: isRtl ? 'تخطيط القوى العاملة' : 'Workforce Planning', icon: <Calendar className="w-4 h-4" /> },
      inbox: { id: 'inbox', label: isRtl ? 'مساحة عمل الوكيل' : 'Agent Workspace', icon: <Mail className="w-4 h-4" /> },
      tickets: { id: 'tickets', label: t.screens.tickets || (isRtl ? 'التذاكر' : 'Tickets'), icon: <FileText className="w-4 h-4" /> },
      agent_dashboard: { id: 'agent_dashboard', label: t.screens.agent_dashboard || (isRtl ? 'لوحة تحكم الوكيل' : 'Agent Dashboard'), icon: <BarChart2 className="w-4 h-4" /> },
      sla: { id: 'sla', label: isRtl ? 'لوحة تحكم اتفاقية الخدمة' : 'SLA Dashboard', icon: <Lock className="w-4 h-4" /> },
      analytics_center: {
        id: 'analytics_center',
        label: role === 'super_admin'
          ? t.screens.analytics_center
          : (isRtl ? 'مركز التحليلات والمراقبة' : 'Analytics & Observability Center'),
        icon: <BarChart2 className="w-4 h-4" />
      },
      knowledge_base: { id: 'knowledge_base', label: t.knowledgeBase, icon: <Brain className="w-4 h-4" /> },
      bots: { id: 'bots', label: isRtl ? 'إدارة البوت' : 'Bot Administration', icon: <Bot className="w-4 h-4" /> },
      surveys: { id: 'surveys', label: isRtl ? 'التقارير والاستبيانات' : 'Reports', icon: <TrendingUp className="w-4 h-4" /> },
      integrations: { id: 'integrations', label: t.integrations, icon: <Database className="w-4 h-4" /> },
      billing: { id: 'billing', label: isRtl ? 'الفوترة والاشتراكات' : 'Billing', icon: <Layers className="w-4 h-4" /> },
      rbac: { id: 'rbac', label: isRtl ? 'إدارة الصلاحيات' : 'RBAC', icon: <ShieldCheck className="w-4 h-4" /> },

      // Customer Portal
      customer_home: { id: 'customer_home', label: isRtl ? 'الرئيسية' : 'Dashboard', icon: <HelpCircle className="w-4 h-4" /> },
      customer_kb: { id: 'customer_kb', label: isRtl ? 'مساعد الذكاء الاصطناعي' : 'AI Copilot', icon: <Brain className="w-4 h-4" /> },
      customer_kb_article: { id: 'customer_kb_article', label: isRtl ? 'مركز المعرفة' : 'Knowledge Hub', icon: <BookOpen className="w-4 h-4" /> },
      customer_my_tickets: { id: 'customer_my_tickets', label: isRtl ? 'تذاكري' : 'My Tickets', icon: <Layers className="w-4 h-4" /> },
      customer_notifications: { id: 'customer_notifications', label: isRtl ? 'التنبيهات' : 'Notifications', icon: <Bell className="w-4 h-4" /> },
      customer_live_support: { id: 'customer_live_support', label: isRtl ? 'الدعم المباشر' : 'Live Support', icon: <MessageSquare className="w-4 h-4" /> },
      customer_recent_activity: { id: 'customer_recent_activity', label: isRtl ? 'النشاط الأخير' : 'Recent Activity', icon: <History className="w-4 h-4" /> },
      customer_favorites: { id: 'customer_favorites', label: isRtl ? 'المفضلة' : 'Favorites', icon: <Heart className="w-4 h-4" /> },
      customer_system_status: { id: 'customer_system_status', label: isRtl ? 'حالة النظام' : 'System Status', icon: <Activity className="w-4 h-4" /> },
      customer_settings: { id: 'customer_settings', label: isRtl ? 'الإعدادات' : 'Settings', icon: <Settings className="w-4 h-4" /> }
    };
  }, [t, isRtl, role]);

  const matrixRole = mapUserRoleToMatrixRole(role);
  const rolePermissions = usePermissionStore((s) => s.permissions[matrixRole]);
  const apiPermissions = usePermissionStore((s) => s.apiPermissions);

  const menuItems = React.useMemo(() => {
    // For super_admin we use the grouped sections data directly;
    // this flat memo is only used for non-SA roles.
    if (role === 'super_admin') return [];

    // Determine the master list of screen IDs to check based on role category
    let order: string[];
    if (role === 'customer') {
      order = [
        'customer_home',
        'customer_kb',
        'customer_kb_article',
        'customer_my_tickets',
        'customer_notifications',
        'customer_live_support',
        'customer_recent_activity',
        'customer_favorites',
        'customer_system_status',
        'customer_settings'
      ];
    } else {
      order = [
        'supervisor_monitor',
        'qa_queue',
        'coaching',
        'training',
        'agents',
        'workforce',
        'inbox',
        'tickets',
        'agent_dashboard',
        'sla',
        'analytics_center',
        'knowledge_base',
        'bots',
        'surveys',
        'integrations',
        'billing',
        'rbac'
      ];
    }

    const registry = getMasterSidebarItems();

    return order
      .filter((id) => canAccessScreen(role, id))
      .map((id) => registry[id])
      .filter(Boolean);
  }, [role, getMasterSidebarItems, rolePermissions, apiPermissions, t]);

  const supportAgentNavSections = React.useMemo(() => [
    {
      id: 'conversations',
      labelKey: 'conversations',
      items: [
        { id: 'inbox', labelKey: 'unifiedInbox', icon: Mail, permission: 'inbox', route: '/tenant/dashboard' },
        { id: 'tickets', labelKey: 'tickets', icon: FileText, permission: 'tickets', route: '/tenant/dashboard' }
      ]
    },
    {
      id: 'productivity',
      labelKey: 'dashboard',
      items: [
        { id: 'agent_dashboard', labelKey: 'agent_dashboard', icon: BarChart2, permission: 'agent_dashboard', route: '/tenant/dashboard' }
      ]
    },
    {
      id: 'ai_assist',
      labelKey: 'copilot',
      items: [
        { id: 'copilot', labelKey: 'copilot', icon: Brain, permission: 'copilot', route: '/tenant/dashboard' },
        { id: 'suggested_replies', labelKey: 'suggested_replies', icon: Sparkles, permission: 'suggested_replies', route: '/tenant/dashboard' },
        { id: 'wrapup_codes', labelKey: 'wrapup_codes', icon: ShieldCheck, permission: 'wrapup_codes', route: '/tenant/dashboard' }
      ]
    }
  ], []);

  const qaManagerNavSections = React.useMemo(() => [
    {
      id: 'quality_assurance',
      labelKey: 'qa_queue',
      items: [
        { id: 'qa_queue', labelKey: 'qa_queue', icon: Award, permission: 'qa_queue', route: '/tenant/dashboard' },
        { id: 'scorecard_builder', labelKey: 'scorecard_builder', icon: Sliders, permission: 'scorecard_builder', route: '/tenant/dashboard' },
        { id: 'evaluations', labelKey: 'evaluations', icon: FileText, permission: 'evaluations', route: '/tenant/dashboard' },
        { id: 'coaching', labelKey: 'coaching', icon: Users, permission: 'coaching', route: '/tenant/dashboard' }
      ]
    },
    {
      id: 'analytics',
      labelKey: 'qa_analytics',
      items: [
        { id: 'qa_analytics', labelKey: 'qa_analytics', icon: BarChart2, permission: 'qa_analytics', route: '/tenant/dashboard' },
        { id: 'agent_performance', labelKey: 'agent_performance', icon: TrendingUp, permission: 'agent_performance', route: '/tenant/dashboard' }
      ]
    }
  ], []);

  const supervisorNavSections = React.useMemo(() => [
    {
      id: 'ops_monitoring',
      labelKey: 'supervisor_monitor',
      items: [
        { id: 'supervisor_monitor', labelKey: 'supervisor_monitor', icon: Shield, permission: 'supervisor_monitor', route: '/tenant/dashboard' },
        { id: 'live_queues', labelKey: 'live_queues', icon: Layers, permission: 'live_queues', route: '/tenant/dashboard' },
        { id: 'sla', labelKey: 'sla', icon: Lock, permission: 'sla', route: '/tenant/dashboard' }
      ]
    },
    {
      id: 'workforce_mgmt',
      labelKey: 'workforce',
      items: [
        { id: 'workforce', labelKey: 'workforce', icon: Calendar, permission: 'workforce', route: '/tenant/dashboard' },
        { id: 'shift_planning', labelKey: 'shift_planning', icon: Calendar, permission: 'shift_planning', route: '/tenant/dashboard' },
        { id: 'occupancy', labelKey: 'occupancy', icon: BarChart2, permission: 'occupancy', route: '/tenant/dashboard' }
      ]
    },
    {
      id: 'team_ops',
      labelKey: 'agents',
      items: [
        { id: 'agent_presence', labelKey: 'agent_presence', icon: Users, permission: 'agent_presence', route: '/tenant/dashboard' },
        { id: 'queue_distribution', labelKey: 'queue_distribution', icon: GitBranch, permission: 'queue_distribution', route: '/tenant/dashboard' },
        { id: 'escalations', labelKey: 'escalations', icon: ShieldCheck, permission: 'escalations', route: '/tenant/dashboard' }
      ]
    }
  ], []);

  const navSections = React.useMemo(() => {
    if (role === 'support_agent') return supportAgentNavSections;
    if (role === 'qa_manager') return qaManagerNavSections;
    if (role === 'supervisor') return supervisorNavSections;
    return clientAdminNavSections;
  }, [role, supportAgentNavSections, qaManagerNavSections, supervisorNavSections]);

  return (
    <aside
      className={`fixed inset-y-0 ${isRtl ? 'right-0' : 'left-0'} z-50 w-72 max-w-[85vw] bg-white dark:bg-[#03050a] text-slate-600 dark:text-slate-300 ${isRtl ? 'border-l' : 'border-r'} border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 h-screen lg:static lg:w-64 transition-transform duration-300 overflow-y-auto ${
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
            className="lg:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Close sidebar"
          >
            ×
          </button>
        </div>

        {/* Sidebar Nav */}
        <nav
          onKeyDown={handleNavKeyDown}
          className="flex-1 overflow-y-auto px-4 py-4 sm:py-6"
        >
          {/* Workspace Launcher Button */}
          <div className="px-3 mb-4">
            <button
              type="button"
              onClick={() => setActiveScreen('launcher')}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                activeScreen === 'launcher'
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
              }`}
            >
              <Layers className="w-4 h-4 text-blue-500" />
              <span>{lang === 'ar' ? 'مشغل بيئة العمل' : 'Workspace Launcher'}</span>
            </button>
          </div>

          {/* Active Persona Info & Status Panel */}
          <div className="px-5 py-3 mb-4 mx-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1.5 shadow-xs select-none">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">Active Workspace</span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div>
              <strong className="text-xs text-slate-800 dark:text-white block font-extrabold uppercase truncate">
                {(() => {
                  const activeItem = CENTRALIZED_PERSONAS.find((p) => p.value === role);
                  if (activeItem) {
                    return lang === 'ar' ? activeItem.labelAr : activeItem.labelEn;
                  }
                  return role.replace('_', ' ');
                })()}
              </strong>
              <span className="text-[10px] text-slate-450 dark:text-slate-500 truncate block mt-0.5 font-medium">CustomerSelfService Tenant</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/60 mt-1">
              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold font-mono tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 uppercase">
                Production Sandbox
              </span>
              <span className="text-[9px] text-slate-400 font-bold uppercase font-mono">ONLINE</span>
            </div>
          </div>

          {/* ── Super Admin: Grouped Sections ── */}
          {role === 'super_admin' && (
            <div className="space-y-0.5">
              {superAdminNavSections.map((section) => {
                const visibleItems = section.items.filter((item) =>
                  canAccessScreen(role, item.permission)
                );
                if (visibleItems.length === 0) return null;
                return (
                  <div key={section.id}>
                    {/* Section label */}
                    <p className="px-3 pt-4 pb-1 text-[9.5px] font-bold uppercase tracking-widest text-slate-400/70 dark:text-slate-600 select-none">
                      {(t as any)[section.labelKey] || section.id}
                    </p>
                    {/* Section items */}
                    {visibleItems.map((item) => {
                      const isActive = activeScreen === item.id;
                      return (
                        <button
                          key={item.id}
                          data-testid={`sidebar-item-${item.id}`}
                          onClick={() => setActiveScreen(item.id)}
                          aria-current={isActive ? 'page' : undefined}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 text-start cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 translate-x-1.5 rtl:-translate-x-1.5'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-100 text-slate-500 dark:text-slate-400 hover:translate-x-1 rtl:hover:-translate-x-1'
                          }`}
                        >
                          <span className={`${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`}>
                            <item.icon className="w-4 h-4" />
                          </span>
                          <span>{(t as any)[item.labelKey] || item.id}</span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Customer / End User: flat list ── */}
          {role === 'customer' && (
            <>
              <div className="px-3 mb-2 text-[11.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {t.customerPortal}
              </div>
              {menuItems.map((item) => {
                const isActive = activeScreen === item.id;
                return (
                  <button
                    key={item.id}
                    data-testid={`sidebar-item-${item.id}`}
                    onClick={() => setActiveScreen(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 text-start cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 translate-x-1.5 rtl:-translate-x-1.5'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-100 text-slate-500 dark:text-slate-400 hover:translate-x-1 rtl:hover:-translate-x-1'
                    }`}
                  >
                    <span className={`${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </>
          )}

          {/* ── Client Admin & Workspace Roles: Grouped Sections ── */}
          {role !== 'super_admin' && role !== 'customer' && (
            <div className="space-y-3">
              {navSections.map((section) => {
                const visibleItems = section.items.filter((item) =>
                  canAccessScreen(role, item.permission)
                );
                if (visibleItems.length === 0) return null;
                const isExpanded = expandedSections[section.id] !== false; // default to true if not explicitly collapsed
                
                const sectionLabel =
                  section.id === 'conversations' ? (lang === 'ar' ? 'المحادثات' : 'Conversations') :
                  section.id === 'productivity' ? (lang === 'ar' ? 'الإنتاجية' : 'Productivity') :
                  section.id === 'ai_assist' ? (lang === 'ar' ? 'مساعد الذكاء الاصطناعي' : 'AI Assist') :
                  section.id === 'quality_assurance' ? (lang === 'ar' ? 'إدارة الجودة' : 'Quality Assurance') :
                  section.id === 'analytics' ? (lang === 'ar' ? 'التحليلات والمراقبة' : 'Analytics') :
                  section.id === 'ops_monitoring' ? (lang === 'ar' ? 'رقابة العمليات' : 'Operations Monitoring') :
                  section.id === 'workforce_mgmt' ? (lang === 'ar' ? 'تخطيط القوى العاملة' : 'Workforce Management') :
                  section.id === 'team_ops' ? (lang === 'ar' ? 'إدارة الفريق' : 'Team Operations') :
                  (t as any)[section.labelKey] || (t.screens as any)[section.labelKey] || section.id;

                return (
                  <div key={section.id} className="space-y-0.5 border-b border-slate-100/50 dark:border-slate-900/30 pb-2 last:border-b-0">
                    {/* Collapsible Header */}
                    <button
                      type="button"
                      onClick={() => toggleSection(section.id)}
                      aria-expanded={isExpanded}
                      aria-label={`${lang === 'ar' ? 'تبديل قسم' : 'Toggle section'} ${sectionLabel}`}
                      className="w-full px-3 py-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
                    >
                      <span>{sectionLabel}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 opacity-60 ${
                          isExpanded ? 'transform rotate-0' : 'transform -rotate-90 rtl:rotate-90'
                        }`}
                      />
                    </button>

                    {/* Section Items */}
                    {isExpanded && (
                      <div className="space-y-0.5 mt-1 animate-in fade-in-40 duration-250">
                        {visibleItems.map((item) => {
                          const isActive = activeScreen === item.id;
                          
                          const itemLabel =
                            item.id === 'copilot' ? (lang === 'ar' ? 'مساعد الذكاء' : 'AI Copilot') :
                            item.id === 'suggested_replies' ? (lang === 'ar' ? 'الردود المقترحة' : 'Suggested Replies') :
                            item.id === 'wrapup_codes' ? (lang === 'ar' ? 'رموز الإنهاء' : 'Wrap-up Codes') :
                            item.id === 'scorecard_builder' ? (lang === 'ar' ? 'منشئ بطاقات التقييم' : 'Scorecard Builder') :
                            item.id === 'qa_analytics' ? (lang === 'ar' ? 'تحليلات الجودة' : 'QA Analytics') :
                            item.id === 'agent_performance' ? (lang === 'ar' ? 'أداء الوكلاء' : 'Agent Performance') :
                            item.id === 'shift_planning' ? (lang === 'ar' ? 'تخطيط المناوبات' : 'Shift Planning') :
                            item.id === 'occupancy' ? (lang === 'ar' ? 'معدل الإشغال' : 'Occupancy') :
                            item.id === 'agent_presence' ? (lang === 'ar' ? 'حضور الوكلاء' : 'Agent Presence') :
                            item.id === 'queue_distribution' ? (lang === 'ar' ? 'توزيع الطابور' : 'Queue Distribution') :
                            item.id === 'escalations' ? (lang === 'ar' ? 'التصعيد المباشر' : 'Escalations') :
                            (t.screens as any)[item.labelKey] || (t as any)[item.labelKey] || item.id;

                          return (
                            <button
                              key={item.id}
                              data-testid={`sidebar-item-${item.id}`}
                              onClick={() => {
                                setActiveScreen(item.id);
                                if (role === 'support_agent') {
                                  if (item.id === 'tickets') {
                                    router.push('/tickets');
                                  } else if (item.id === 'inbox') {
                                    router.push('/workspace/inbox');
                                  } else {
                                    router.push(`/workspace/inbox?screen=${item.id}`);
                                  }
                                }
                              }}
                              aria-current={isActive ? 'page' : undefined}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 text-start cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                                isActive
                                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 translate-x-1.5 rtl:-translate-x-1.5 font-bold'
                                  : 'hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-100 text-slate-500 dark:text-slate-400 hover:translate-x-1 rtl:hover:-translate-x-1'
                              }`}
                            >
                              <span className={`${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-455'}`}>
                                <item.icon className="w-4 h-4" />
                              </span>
                              <span className="truncate">{itemLabel}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </nav>
      </div>

      {/* Footer Section */}
      <div className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#03050a] px-4 py-3 text-[10px] text-slate-500 text-center font-semibold">
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
                  className={`flex-1 rounded-xl border px-3 py-2 text-xs font-bold transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
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
