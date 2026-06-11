'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';
import { usePermission } from '@/stores/permissionStore';
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
  
  const canViewExecutive = usePermission('analytics_center').canView;
  const canViewSla = usePermission('sla').canView;
  const canViewWorkforce = usePermission('workforce').canView;
  const canViewAi = usePermission('copilot').canView;
  const canViewIntegrations = usePermission('integrations').canView;

  const isAllowedTab = (tabId: MainTabId): boolean => {
    switch (tabId) {
      case 'executive':
        return canViewExecutive;
      case 'sla':
        return canViewSla;
      case 'workforce':
        return canViewWorkforce;
      case 'ai':
        return canViewAi;
      case 'integrations':
        return canViewIntegrations;
      default:
        return false;
    }
  };

  const getFirstAllowedTab = (): MainTabId => {
    if (canViewExecutive) return 'executive';
    if (canViewSla) return 'sla';
    if (canViewWorkforce) return 'workforce';
    if (canViewAi) return 'ai';
    if (canViewIntegrations) return 'integrations';
    return 'executive';
  };

  const [activeTab, setActiveTab] = useState<MainTabId>('executive');

  React.useEffect(() => {
    if (!isAllowedTab(activeTab)) {
      setActiveTab(getFirstAllowedTab());
    }
  }, [canViewExecutive, canViewSla, canViewWorkforce, canViewAi, canViewIntegrations, activeTab]);

  // Workforce sub-tab state
  const [workforceSubTab, setWorkforceSubTab] = useState<'wallboard' | 'performance'>('wallboard');

  // AI sub-tab state
  const [aiSubTab, setAiSubTab] = useState<'guardrails' | 'costs'>('guardrails');

  const t = translations[lang];

  // Main Tabs array
  const mainTabs = [
    { 
      id: 'executive' as MainTabId, 
      label: t.analyticsCenter.layout.tabExecutive, 
      icon: <LayoutDashboard className="w-4 h-4" /> 
    },
    { 
      id: 'sla' as MainTabId, 
      label: t.analyticsCenter.layout.tabSla, 
      icon: <Clock className="w-4 h-4" /> 
    },
    { 
      id: 'workforce' as MainTabId, 
      label: t.analyticsCenter.layout.tabWorkforce, 
      icon: <Users className="w-4 h-4" /> 
    },
    { 
      id: 'ai' as MainTabId, 
      label: t.analyticsCenter.layout.tabAi, 
      icon: <Cpu className="w-4 h-4" /> 
    },
    { 
      id: 'integrations' as MainTabId, 
      label: t.analyticsCenter.layout.tabIntegrations, 
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
                {t.analyticsCenter.layout.subWallboard}
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
                {t.analyticsCenter.layout.subPerformance}
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
                {t.analyticsCenter.layout.subGuardrails}
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
                {t.analyticsCenter.layout.subCosts}
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
            {t.analyticsCenter.layout.title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.analyticsCenter.layout.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-emerald-600 dark:text-emerald-400">
            {t.analyticsCenter.layout.liveStream}
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
