'use client';

import React from 'react';
import { useUIStore } from '@/stores/uiStore';
import { translations } from '@/i18n/translations';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Users, BarChart3, Sliders } from 'lucide-react';
import { TenantListTab } from './TenantListTab';
import { TenantMeteringTab } from './TenantMeteringTab';
import { TenantFeatureFlagsTab } from './TenantFeatureFlagsTab';
import { useTabQueryState } from '@/hooks/useTabQueryState';

export function TenantManagementContainer({ activeTab: propActiveTab }: { activeTab?: string }) {
  const lang = useUIStore((s) => s.lang);
  const t = translations[lang];

  const tmT = (t.superAdmin as any).tenantManagement || {
    title: 'Tenant Management',
    description: 'Manage platform tenant accounts, subscription tiers, resource limits, and lifecycle states.',
    tabs: {
      tenantList: 'Tenant Registry',
      metering: 'Consumption Metering',
      featureFlags: 'Feature Toggles'
    }
  };

  const [activeTab, setActiveTab] = useTabQueryState(
    'tenant_list',
    ['tenant_list', 'metering', 'feature_flags'],
    propActiveTab
  );

  const tabs = [
    { id: 'tenant_list', label: tmT.tabs.tenantList, icon: <Users className="w-4 h-4" /> },
    { id: 'metering', label: tmT.tabs.metering, icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'feature_flags', label: tmT.tabs.featureFlags, icon: <Sliders className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title={tmT.title}
        description={tmT.description}
      />

      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto whitespace-nowrap scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold transition-all -mb-px text-[11px] cursor-pointer shrink-0 ${
                isActive
                  ? 'border-blue-600 text-blue-600 dark:text-blue-600'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {activeTab === 'tenant_list' && <TenantListTab />}
        {activeTab === 'metering' && <TenantMeteringTab />}
        {activeTab === 'feature_flags' && <TenantFeatureFlagsTab />}
      </div>
    </div>
  );
}
