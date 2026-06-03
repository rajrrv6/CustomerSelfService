'use client';

import React, { Suspense } from 'react';
import { HelpCircle, Brain, Radio, Phone, Database, Layers, FileText } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { OperationalCard } from '@/components/shared/OperationalCard';

// Containers imported eagerly
import { MasterDataContainer } from '../containers/MasterDataContainer';
import { AnalyticsContainer } from '../containers/AnalyticsContainer';
import { InfrastructureContainer } from '../containers/InfrastructureContainer';
import { TelephonyContainer } from '../containers/TelephonyContainer';

const BillingOverviewTab = React.lazy(() => import('../billing/BillingOverviewTab').then(m => ({ default: m.BillingOverviewTab })));
const AuditOverviewTab = React.lazy(() => import('../audit/AuditOverviewTab').then(m => ({ default: m.AuditOverviewTab })));

export function TabFallback() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500 animate-pulse">
      <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-3" />
      <span className="text-xs font-semibold font-mono tracking-wider uppercase">Loading module...</span>
    </div>
  );
}

export function NotImplementedFallback() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
      <HelpCircle className="w-10 h-10 mb-2 opacity-50" />
      <span>Screen not implemented</span>
    </div>
  );
}

export function SuperAdminDashboardOverview() {
  const lang = useUIStore((s) => s.lang);
  const isRtl = lang === 'ar';
  
  return (
    <div className="space-y-6">
      <SectionHeader
        title={isRtl ? 'لوحة القيادة العامة' : 'Dashboard Overview'}
        description={isRtl ? 'نظرة عامة على مؤشرات النظام والقياسات العامة لمستأجري المنصة.' : 'Global system metrics and telemetry overview for platform tenants.'}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <OperationalCard hoverEffect={false}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {isRtl ? 'نماذج الذكاء الاصطناعي' : 'LLM Models'}
              </p>
              <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mt-0.5">5</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Llama-3, Claude, Gemini</p>
            </div>
          </div>
        </OperationalCard>

        <OperationalCard hoverEffect={false}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {isRtl ? 'محركات الصوت ASR/TTS' : 'Speech Engines'}
              </p>
              <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mt-0.5">3</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">DeepL, ElevenLabs, Azure</p>
            </div>
          </div>
        </OperationalCard>

        <OperationalCard hoverEffect={false}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {isRtl ? 'خطوط الاتصال SIP' : 'SIP Trunks'}
              </p>
              <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mt-0.5">2</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">AST-KSA primary & backup</p>
            </div>
          </div>
        </OperationalCard>

        <OperationalCard hoverEffect={false}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {isRtl ? 'قواعد البيانات المتجهة' : 'Vector DB Clusters'}
              </p>
              <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mt-0.5">1</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Pinecone Index Cluster</p>
            </div>
          </div>
        </OperationalCard>
      </div>
    </div>
  );
}

interface SuperAdminLayoutProps {
  activeSubScreen: string;
}

export function SuperAdminLayout({ activeSubScreen }: SuperAdminLayoutProps) {
  switch (activeSubScreen) {
    case 'sa_dashboard':
      return <SuperAdminDashboardOverview />;
      
    case 'sa_master_data':
    case 'llm_registry':
      return <MasterDataContainer activeTab="llm_registry" />;
    case 'asr_tts_registry':
      return <MasterDataContainer activeTab="asr_tts_registry" />;
    case 'channels':
      return <MasterDataContainer activeTab="channels" />;
    case 'nlu_governance':
      return <MasterDataContainer activeTab="nlu_governance" />;
      
    case 'sa_analytics':
    case 'cross_tenant_analytics':
      return <AnalyticsContainer activeTab="cross_tenant_analytics" />;
    case 'cost_benchmarks':
      return <AnalyticsContainer activeTab="cost_benchmarks" />;
      
    case 'sa_infra':
    case 'vector_db':
      return <InfrastructureContainer activeTab="vector_db" />;
      
    case 'sa_telephony':
    case 'sip_trunk':
      return <TelephonyContainer activeTab="sip_trunk" />;

    case 'sa_billing':
      return (
        <Suspense fallback={<TabFallback />}>
          <BillingOverviewTab />
        </Suspense>
      );
      
    case 'sa_audit':
      return (
        <Suspense fallback={<TabFallback />}>
          <AuditOverviewTab />
        </Suspense>
      );
      
    default:
      return <NotImplementedFallback />;
  }
}
