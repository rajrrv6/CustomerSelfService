'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
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
  GitBranch
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
  const { role, lang, setLang } = useApp();
  const t = translations[lang];

  // Helper to compile sidebar options based on role
  const getSidebarItems = (currentRole: UserRole): SidebarItem[] => {
    switch (currentRole) {
      case 'super_admin':
        return [
          { id: 'llm_registry', label: t.llmRegistry, icon: <Brain className="w-4 h-4" /> },
          { id: 'asr_tts_registry', label: t.asrTtsRegistry, icon: <Radio className="w-4 h-4" /> },
          { id: 'channels', label: t.omnichannel, icon: <Layers className="w-4 h-4" /> },
          { id: 'cost_benchmarks', label: t.costBenchmarks, icon: <BarChart2 className="w-4 h-4" /> },
          { id: 'cross_tenant_analytics', label: t.crossTenantAnalytics, icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'vector_db', label: t.vectorDbStatus, icon: <Database className="w-4 h-4" /> },
          { id: 'sip_trunk', label: t.sipTrunkConfig, icon: <Phone className="w-4 h-4" /> },
          { id: 'analytics_center', label: t.screens.analytics_center, icon: <BarChart2 className="w-4 h-4" /> }
        ];

      case 'client_admin':
        return [
          { id: 'bots', label: t.botManagement, icon: <Bot className="w-4 h-4" /> },
          { id: 'intents', label: t.intentManagement, icon: <HelpCircle className="w-4 h-4" /> },
          { id: 'dialog_flow', label: t.dialogBuilder, icon: <GitBranch className="w-4 h-4" /> },
          { id: 'knowledge_base', label: t.knowledgeBase, icon: <Brain className="w-4 h-4" /> },
          { id: 'guardrails', label: t.safetyGuardrails, icon: <ShieldCheck className="w-4 h-4" /> },
          { id: 'channels', label: t.omnichannel, icon: <Layers className="w-4 h-4" /> },
          { id: 'agents', label: t.screens.agents, icon: <Users className="w-4 h-4" /> },
          { id: 'inbox', label: t.unifiedInbox, icon: <Mail className="w-4 h-4" /> },
          { id: 'sla', label: t.screens.sla, icon: <Lock className="w-4 h-4" /> },
          { id: 'surveys', label: t.screens.surveys, icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'analytics_center', label: t.screens.analytics_center, icon: <BarChart2 className="w-4 h-4" /> },
          { id: 'deployments', label: t.screens.deployments, icon: <Play className="w-4 h-4" /> },
          { id: 'integrations', label: t.integrations, icon: <Database className="w-4 h-4" /> }
        ];

      case 'operations_manager':
        return [
          { id: 'inbox', label: t.unifiedInbox, icon: <Mail className="w-4 h-4" /> },
          { id: 'agents', label: t.screens.agents, icon: <Users className="w-4 h-4" /> },
          { id: 'sla', label: t.screens.sla, icon: <Lock className="w-4 h-4" /> },
          { id: 'surveys', label: t.screens.surveys, icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'integrations', label: t.integrations, icon: <Database className="w-4 h-4" /> },
          { id: 'analytics_center', label: t.screens.analytics_center, icon: <BarChart2 className="w-4 h-4" /> }
        ];

      case 'qa_manager':
        return [
          { id: 'qa_queue', label: t.screens.qa_queue, icon: <Award className="w-4 h-4" /> },
          { id: 'coaching', label: t.screens.coaching, icon: <Users className="w-4 h-4" /> },
          { id: 'inbox', label: t.unifiedInbox, icon: <Mail className="w-4 h-4" /> },
          { id: 'surveys', label: t.screens.surveys, icon: <TrendingUp className="w-4 h-4" /> }
        ];

      case 'support_agent':
        return [
          { id: 'agent_dashboard', label: t.screens.agent_dashboard, icon: <BarChart2 className="w-4 h-4" /> },
          { id: 'inbox', label: t.unifiedInbox, icon: <Mail className="w-4 h-4" /> },
          { id: 'tickets', label: t.screens.tickets, icon: <FileText className="w-4 h-4" /> }
        ];

      case 'supervisor':
        return [
          { id: 'inbox', label: t.unifiedInbox, icon: <Mail className="w-4 h-4" /> },
          { id: 'supervisor_monitor', label: t.screens.supervisor_monitor, icon: <Shield className="w-4 h-4" /> },
          { id: 'workforce', label: t.screens.workforce, icon: <Calendar className="w-4 h-4" /> },
          { id: 'sla', label: t.screens.sla, icon: <Lock className="w-4 h-4" /> },
          { id: 'analytics_center', label: t.screens.analytics_center, icon: <BarChart2 className="w-4 h-4" /> }
        ];

      case 'customer':
        return [
          { id: 'customer_home', label: t.screens.customer_home, icon: <HelpCircle className="w-4 h-4" /> },
          { id: 'customer_kb', label: t.screens.customer_kb, icon: <Brain className="w-4 h-4" /> },
          { id: 'customer_ticket_submit', label: t.screens.customer_ticket_submit, icon: <FileText className="w-4 h-4" /> },
          { id: 'customer_my_tickets', label: t.screens.customer_my_tickets, icon: <Layers className="w-4 h-4" /> }
        ];

      case 'viewer':
        return [
          { id: 'surveys', label: t.screens.surveys, icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'sla', label: t.screens.sla, icon: <Lock className="w-4 h-4" /> },
          { id: 'analytics_center', label: t.screens.analytics_center, icon: <BarChart2 className="w-4 h-4" /> }
        ];

      default:
        return [];
    }
  };

  const menuItems = getSidebarItems(role);

  return (
    <aside
      className={`fixed inset-y-0 ${isRtl ? 'right-0' : 'left-0'} z-50 w-72 max-w-[85vw] bg-[#0b0f19] dark:bg-[#03050a] text-slate-300 flex flex-col justify-between shrink-0 h-screen lg:static lg:w-64 transition-transform duration-300 ${
        isMobileOpen ? 'translate-x-0' : isRtl ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Top Section */}
      <div className="flex flex-col flex-1">
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800/80">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-sm text-white tracking-tight leading-none">AI-Native mPaaS</h2>
            <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest mt-1 block">
              Omnichannel CX
            </span>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/70"
            aria-label="Close sidebar"
          >
            ×
          </button>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 sm:py-6 space-y-1.5">
          <div className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            {role.replace('_', ' ')} Options
          </div>
          {menuItems.map((item) => {
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveScreen(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 text-start ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 translate-x-1.5 rtl:-translate-x-1.5'
                    : 'hover:bg-slate-800/40 hover:text-slate-100 text-slate-400 hover:translate-x-1 rtl:hover:-translate-x-1'
                }`}
              >
                <span className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-100'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Section */}
      <div className="border-t border-slate-800/80 bg-slate-950/40 px-4 py-3 text-[10px] text-slate-500 text-center font-semibold">
        <div className="lg:hidden mb-3 rounded-2xl border border-slate-800/80 bg-slate-950/70 p-3 text-left">
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
                  className={`flex-1 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
                    isActive
                      ? 'border-blue-500 bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
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
