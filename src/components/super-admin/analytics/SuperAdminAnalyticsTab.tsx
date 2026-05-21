'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { SVGBarChart } from '@/components/dashboard/Charts';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { OperationalCard } from '@/components/shared/OperationalCard';
import { EnterpriseTable } from '@/components/shared/EnterpriseTable';

interface SuperAdminAnalyticsTabProps {
  activeSubScreen: string;
}

export function SuperAdminAnalyticsTab({ activeSubScreen }: SuperAdminAnalyticsTabProps) {
  const { llmModels } = useApp();

  if (activeSubScreen === 'cost_benchmarks') {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Model Cost Benchmarks"
          description="Benchmark real-world API costs per 1,000,000 tokens for comparative pricing analysis."
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SVGBarChart
            data={llmModels.map((m) => m.costInput * 1000)}
            labels={llmModels.map((m) => m.name.substring(0, 8))}
            title="Input Tokens Cost ($ per 1M tokens)"
            barColor="#3b82f6"
          />
          <SVGBarChart
            data={llmModels.map((m) => m.costOutput * 1000)}
            labels={llmModels.map((m) => m.name.substring(0, 8))}
            title="Output Tokens Cost ($ per 1M tokens)"
            barColor="#f43f5e"
          />
        </div>

        <OperationalCard hoverEffect={false} className="bg-slate-100 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase font-mono mb-2">Cost Optimization Recommendation</h4>
          <p className="text-xs leading-relaxed text-slate-500">
            By automatically routing simple standard queries (e.g. greetings, returns lookup) to <span className="font-semibold text-blue-500">Gemini 1.5 Flash</span> and reserving advanced dialogues for <span className="font-semibold text-emerald-500">Claude 3.5 Sonnet</span>, the platform has achieved an average cost reduction of <span className="font-bold text-slate-800 dark:text-white">43.8%</span> over the past 30 days.
          </p>
        </OperationalCard>
      </div>
    );
  }

  // Cross tenant analytics view
  const tenantHeaders = [
    'Client Identifier',
    'Monthly Tokens',
    'Active Bots',
    'SLA Compliance',
    'Endpoint Load'
  ];

  const tenantRows = [
    { id: 'saudi-telecom-corp', tokens: '14.8M', bots: 8, sla: '99.2%', load: '14.2 req/sec' },
    { id: 'al-rajhi-retail', tokens: '22.1M', bots: 12, sla: '98.5%', load: '22.8 req/sec' },
    { id: 'emirates-airlines', tokens: '8.4M', bots: 4, sla: '99.8%', load: '8.1 req/sec' },
    { id: 'gulf-fintech-hub', tokens: '1.2M', bots: 2, sla: '94.0%', load: '1.1 req/sec' }
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Cross-Tenant Analytics"
        description="Infrastructure loads, tokens consumed, and API concurrency counts across enterprise client tenants."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { title: 'Aggregate API Calls', value: '45.2M', desc: '+12.4% over last 30d' },
          { title: 'Active Tenant Clusters', value: '18 Tenant DBs', desc: 'All healthy status' },
          { title: 'Platform Latency (p95)', value: '240ms', desc: 'ASR+LLM orchestration pipeline' }
        ].map((card, i) => (
          <OperationalCard key={i} className="flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">{card.title}</span>
              <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1 font-mono">{card.value}</p>
            </div>
            <span className="text-[10px] text-slate-500 mt-2 block">{card.desc}</span>
          </OperationalCard>
        ))}
      </div>

      {/* Tenants list */}
      <div className="space-y-4">
        <h3 className="font-bold text-xs text-slate-600 dark:text-slate-400 uppercase font-mono">Active Enterprise Clients</h3>
        <EnterpriseTable headers={tenantHeaders}>
          {tenantRows.map((row, idx) => (
            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-850">
              <td className="px-6 py-4 font-bold text-slate-900 dark:text-white font-mono">{row.id}</td>
              <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">{row.tokens}</td>
              <td className="px-6 py-4 text-slate-650 dark:text-slate-350">{row.bots}</td>
              <td className="px-6 py-4 text-emerald-500 font-bold">{row.sla}</td>
              <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">{row.load}</td>
            </tr>
          ))}
        </EnterpriseTable>
      </div>
    </div>
  );
}
