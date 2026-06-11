'use client';

import React, { useState } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';
import { mockTenantFeatureFlags, mockTenants } from './mockTenantData';
import { TenantFeatureFlag } from '@/types/tenant';
import { useFeedbackToasts } from '@/components/customer-portal/feedback/PostChatToasts';
import { Sliders, ToggleLeft, ShieldAlert, BadgeCheck, CheckCircle } from 'lucide-react';

export function TenantFeatureFlagsTab() {
  const lang = useUIStore((s) => s.lang);
  const isRtl = lang === 'ar';
  const { addAuditLog } = useApp();
  const { pushToast } = useFeedbackToasts();
  const t = translations[lang];

  const tmT = (t.superAdmin as any).tenantManagement || {
    featureFlags: {
      title: 'Feature Gate Control',
      desc: 'Enable or disable enterprise beta capabilities, system overrides, and security policies per tenant.',
      selectTenant: 'Select Tenant',
      flagName: 'Feature Gate',
      flagDesc: 'Description',
      flagStatus: 'Status',
      flagEnabled: 'Enabled',
      flagDisabled: 'Disabled',
      toggleFlag: 'Toggle Feature Gate',
      successToggle: 'Feature gate updated successfully.'
    }
  };

  const [selectedTenantId, setSelectedTenantId] = useState(mockTenants[0].id);
  const [flagsMap, setFlagsMap] = useState<Record<string, TenantFeatureFlag[]>>(mockTenantFeatureFlags);

  const selectedTenant = mockTenants.find(t => t.id === selectedTenantId) || mockTenants[0];
  const currentFlags = flagsMap[selectedTenantId] || [];

  const handleToggleFlag = (flag: TenantFeatureFlag) => {
    const updatedFlags = currentFlags.map(f => {
      if (f.id === flag.id) {
        const nextState = !f.enabled;
        
        pushToast(
          'success',
          isRtl ? 'تم تحديث بوابة الميزة' : 'Feature Gate Updated',
          isRtl
            ? `تم ${nextState ? 'تفعيل' : 'تعطيل'} الميزة "${f.name}" للمستأجر "${selectedTenant.name}".`
            : `Feature "${f.name}" has been ${nextState ? 'enabled' : 'disabled'} for "${selectedTenant.name}".`
        );
        
        addAuditLog(
          `Toggled feature gate: ${f.key} = ${nextState ? 'ON' : 'OFF'} for tenant ${selectedTenant.name}`,
          'success'
        );

        return { ...f, enabled: nextState };
      }
      return f;
    });

    setFlagsMap(prev => ({
      ...prev,
      [selectedTenantId]: updatedFlags
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header and Tenant Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm gap-4">
        <div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-500" />
            <span>{tmT.featureFlags.title}</span>
          </h4>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {tmT.featureFlags.desc}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
          <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 font-mono hidden sm:inline">
            {tmT.featureFlags.selectTenant}
          </label>
          <select
            value={selectedTenantId}
            onChange={(e) => setSelectedTenantId(e.target.value)}
            className="text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl text-slate-650 dark:text-slate-350 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full md:w-64 cursor-pointer"
          >
            {mockTenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.domain})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Feature Flags Grid List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
        
        {currentFlags.length > 0 ? (
          currentFlags.map((flag) => (
            <div 
              key={flag.id} 
              className="p-5 flex items-start sm:items-center justify-between gap-4 hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                    {flag.name}
                  </h4>
                  <span className="text-[9px] font-bold font-mono text-slate-450 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    {flag.key}
                  </span>
                </div>
                <p className="text-[10.5px] leading-relaxed text-slate-500 dark:text-slate-400">
                  {flag.description}
                </p>
              </div>

              {/* Toggle Switch */}
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-[10px] font-bold font-mono hidden sm:inline ${
                  flag.enabled ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
                }`}>
                  {flag.enabled ? tmT.featureFlags.flagEnabled : tmT.featureFlags.flagDisabled}
                </span>
                
                <button
                  type="button"
                  onClick={() => handleToggleFlag(flag)}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    flag.enabled ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                  aria-pressed={flag.enabled}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      flag.enabled 
                        ? (isRtl ? '-translate-x-5' : 'translate-x-5') 
                        : (isRtl ? 'translate-x-0' : 'translate-x-0')
                    }`}
                  />
                </button>
              </div>

            </div>
          ))
        ) : (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-900 text-slate-450 flex items-center justify-center mx-auto mb-3">
              <ToggleLeft className="w-6 h-6" />
            </div>
            <h4 className="text-xs font-bold text-slate-850 dark:text-slate-200">
              {isRtl ? 'لا توجد بوابات ميزات مخصصة' : 'No feature gates found'}
            </h4>
            <p className="text-[10px] text-slate-400 mt-1">
              {isRtl ? 'لا توجد بوابات ميزات مهيأة لهذا المستأجر.' : 'No custom feature gates are available for this specific client.'}
            </p>
          </div>
        )}

      </div>

      {/* Beta Advisory Panel */}
      <div className="p-4 rounded-2xl bg-blue-50/40 dark:bg-blue-950/15 border border-blue-100 dark:border-blue-900/30 flex items-start gap-3">
        <BadgeCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
        <div>
          <h5 className="text-[10px] font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wide font-mono">
            {isRtl ? 'شروط تفعيل الميزات التجريبية' : 'Enterprise Gate Toggles'}
          </h5>
          <p className="text-[10px] text-blue-700 dark:text-blue-300 mt-1 leading-relaxed font-semibold">
            {isRtl
              ? 'تفعيل بوابات الميزات المخصصة يؤثر بشكل فوري على صلاحيات المشتركين ومستوى وصول الوكلاء في بيئة العمل الخاصة بهم. كافة التغييرات يتم تسجيلها لأغراض الامتثال الأمني.'
              : 'Enabling experimental gates updates tenant system profiles in real-time. Action will grant instant access to feature pipelines for client accounts. Changes are logged for compliance.'
            }
          </p>
        </div>
      </div>

    </div>
  );
}
