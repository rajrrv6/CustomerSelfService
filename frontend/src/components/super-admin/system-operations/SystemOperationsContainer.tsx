'use client';

import React from 'react';
import { useUIStore } from '@/stores/uiStore';
import { translations } from '@/i18n/translations';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Activity, Layers, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { HealthDashboardTab } from './HealthDashboardTab';
import { JobsQueueTab } from './JobsQueueTab';
import { ErrorMonitoringTab } from './ErrorMonitoringTab';
import { MigrationHistoryTab } from './MigrationHistoryTab';
import { useTabQueryState } from '@/hooks/useTabQueryState';

export function SystemOperationsContainer({ activeTab: propActiveTab }: { activeTab?: string }) {
  const lang = useUIStore((s) => s.lang);
  const t = translations[lang];

  const sysOpsT = (t.superAdmin as any).systemOps || {
    title: 'System Operations',
    description: 'Observe platform uptime metrics, monitor background jobs, manage active migrations, and trace diagnostics.',
    tabs: {
      health: 'Health Status',
      jobs: 'Jobs Queue',
      errors: 'Error Monitoring',
      migrations: 'Migrations'
    }
  };

  const [activeTab, setActiveTab] = useTabQueryState(
    'health_dashboard',
    ['health_dashboard', 'jobs_queue', 'error_monitoring', 'migrations'],
    propActiveTab
  );

  const tabs = [
    { id: 'health_dashboard', label: sysOpsT.tabs.health, icon: <Activity className="w-4 h-4" /> },
    { id: 'jobs_queue', label: sysOpsT.tabs.jobs, icon: <Layers className="w-4 h-4" /> },
    { id: 'error_monitoring', label: sysOpsT.tabs.errors, icon: <AlertCircle className="w-4 h-4" /> },
    { id: 'migrations', label: sysOpsT.tabs.migrations, icon: <FileSpreadsheet className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title={sysOpsT.title}
        description={sysOpsT.description}
      />

      {/* Orchestrator Tab Header */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto whitespace-nowrap scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold transition-all -mb-px text-[11px] cursor-pointer shrink-0 ${
                isActive
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="mt-6">
        {activeTab === 'health_dashboard' && <HealthDashboardTab />}
        {activeTab === 'jobs_queue' && <JobsQueueTab />}
        {activeTab === 'error_monitoring' && <ErrorMonitoringTab />}
        {activeTab === 'migrations' && <MigrationHistoryTab />}
      </div>
    </div>
  );
}
