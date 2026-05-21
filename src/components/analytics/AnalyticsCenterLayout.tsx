'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/hooks/useAuth';
import { ExecutiveDashboard } from './ExecutiveDashboard';
import { SlaAnalytics } from './SlaAnalytics';
import { QueueHeatmap } from './QueueHeatmap';
import { AIContainmentMetrics } from './AIContainmentMetrics';
import { TokenCostAnalytics } from './TokenCostAnalytics';
import { IntegrationAnalytics } from './IntegrationAnalytics';
import { LiveWallboard } from './LiveWallboard';
import { 
  Activity, 
  Clock, 
  Users, 
  Cpu, 
  Link2, 
  ShieldAlert, 
  LayoutDashboard,
  ShieldClose
} from 'lucide-react';

type MainTabId = 'executive' | 'sla' | 'workforce' | 'ai' | 'integrations';

export default function AnalyticsCenterLayout() {
  const { lang } = useApp();
  const isRtl = lang === 'ar';
  const { user } = useAuth();
  
  const userRole = user?.role || 'viewer';

  // Determine allowed tabs based on user role (RBAC)
  const isAllowedTab = (tabId: MainTabId): boolean => {
    switch (userRole) {
      case 'super_admin':
      case 'client_admin':
      case 'operations_manager':
        return true;
      case 'supervisor':
        return tabId !== 'integrations'; // supervisors can see everything except infra integrations
      case 'viewer':
        return tabId === 'executive' || tabId === 'sla'; // view-only role is restricted to SLA and Executive
      case 'qa_manager':
      case 'support_agent':
      default:
        // Support agents or QA managers aren't generally allowed here, but if they get access:
        return tabId === 'executive' || tabId === 'sla';
    }
  };

  // Set the first allowed tab as the initial tab
  const getInitialTab = (): MainTabId => {
    if (isAllowedTab('executive')) return 'executive';
    if (isAllowedTab('sla')) return 'sla';
    return 'executive';
  };

  const [activeTab, setActiveTab] = useState<MainTabId>(getInitialTab());

  // Workforce sub-tab state
  const [workforceSubTab, setWorkforceSubTab] = useState<'wallboard' | 'performance'>('wallboard');

  // AI sub-tab state
  const [aiSubTab, setAiSubTab] = useState<'guardrails' | 'costs'>('guardrails');

  // Main Tabs array
  const mainTabs = [
    { 
      id: 'executive' as MainTabId, 
      label: isRtl ? 'لوحة التحكم التنفيذية' : 'Executive Overview', 
      icon: <LayoutDashboard className="w-4 h-4" /> 
    },
    { 
      id: 'sla' as MainTabId, 
      label: isRtl ? 'اتفاقيات مستوى الخدمة (SLA)' : 'SLA & CSAT/NPS', 
      icon: <Clock className="w-4 h-4" /> 
    },
    { 
      id: 'workforce' as MainTabId, 
      label: isRtl ? 'الموظفين وقنوات الانتظار' : 'Workforce & Queues', 
      icon: <Users className="w-4 h-4" /> 
    },
    { 
      id: 'ai' as MainTabId, 
      label: isRtl ? 'مراقبة الذكاء الاصطناعي' : 'AI Observability', 
      icon: <Cpu className="w-4 h-4" /> 
    },
    { 
      id: 'integrations' as MainTabId, 
      label: isRtl ? 'ربط الأنظمة والتكامل' : 'Integrations Observability', 
      icon: <Link2 className="w-4 h-4" /> 
    }
  ].filter(tab => isAllowedTab(tab.id));

  // Render the view corresponding to active tab
  const renderActiveView = () => {
    switch (activeTab) {
      case 'executive':
        return <ExecutiveDashboard />;
      case 'sla':
        return <SlaAnalytics />;
      case 'workforce':
        return (
          <div className="space-y-4">
            {/* Sub-tab switcher */}
            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-950/80 rounded-2xl w-fit border border-slate-200/50 dark:border-slate-850">
              <button
                onClick={() => setWorkforceSubTab('wallboard')}
                className={`px-4 py-1.5 rounded-xl font-bold transition-all text-[10px] uppercase tracking-wider outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  workforceSubTab === 'wallboard'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                role="tab"
                aria-selected={workforceSubTab === 'wallboard'}
              >
                {isRtl ? 'شاشة الاتصالات المباشرة' : 'Live Call Wallboard'}
              </button>
              <button
                onClick={() => setWorkforceSubTab('performance')}
                className={`px-4 py-1.5 rounded-xl font-bold transition-all text-[10px] uppercase tracking-wider outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  workforceSubTab === 'performance'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                role="tab"
                aria-selected={workforceSubTab === 'performance'}
              >
                {isRtl ? 'أداء الموظفين والحرارة' : 'Workforce Performance & Heatmap'}
              </button>
            </div>
            <div>
              {workforceSubTab === 'wallboard' ? <LiveWallboard /> : <QueueHeatmap />}
            </div>
          </div>
        );
      case 'ai':
        return (
          <div className="space-y-4">
            {/* Sub-tab switcher */}
            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-950/80 rounded-2xl w-fit border border-slate-200/50 dark:border-slate-850">
              <button
                onClick={() => setAiSubTab('guardrails')}
                className={`px-4 py-1.5 rounded-xl font-bold transition-all text-[10px] uppercase tracking-wider outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  aiSubTab === 'guardrails'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                role="tab"
                aria-selected={aiSubTab === 'guardrails'}
              >
                {isRtl ? 'حواجز الحماية والموجهات' : 'Generative Guardrails & Prompts'}
              </button>
              <button
                onClick={() => setAiSubTab('costs')}
                className={`px-4 py-1.5 rounded-xl font-bold transition-all text-[10px] uppercase tracking-wider outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  aiSubTab === 'costs'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                role="tab"
                aria-selected={aiSubTab === 'costs'}
              >
                {isRtl ? 'تكاليف الرموز والبحث' : 'Token Costs & RAG Failures'}
              </button>
            </div>
            <div>
              {aiSubTab === 'guardrails' ? <AIContainmentMetrics /> : <TokenCostAnalytics />}
            </div>
          </div>
        );
      case 'integrations':
        return <IntegrationAnalytics />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-850 pb-5">
        <div className="space-y-1">
          <h2 className="text-lg font-black text-slate-900 dark:text-white leading-none">
            {isRtl ? 'مركز التحليلات والمراقبة الشاملة' : 'Analytics & Observability Center'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isRtl
              ? 'مراقبة أداء محادثات الذكاء الاصطناعي، المكالمات الهاتفية المباشرة، تكامل الأنظمة الخارجية، ومستوى الخدمة.'
              : 'Real-time telemetry, agent queues capacity, generative guardrail logs, and API connector performance metrics.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-emerald-600 dark:text-emerald-400">
            {isRtl ? 'اتصال القياس المباشر نشط' : 'LIVE TELEMETRY STREAM ACTIVE'}
          </span>
        </div>
      </div>

      {/* Navigation sub-tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none">
        {mainTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold transition-all -mb-px text-[11px] outline-none whitespace-nowrap focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isActive
                  ? 'border-blue-600 text-blue-600 dark:text-blue-500'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              role="tab"
              aria-selected={isActive}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Content */}
      <div className="pt-2">
        {renderActiveView()}
      </div>

    </div>
  );
}
