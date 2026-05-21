'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { OperationalCard } from '@/components/shared/OperationalCard';

export function LifecycleTab() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Pipelines & A/B Testing"
        description="Deploy bot revisions to staging environments and configure client traffic splitting."
      />

      <OperationalCard hoverEffect={false} className="p-6 space-y-4">
        <h3 className="font-bold text-sm text-slate-850 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          A/B Traffic Configurations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
          <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-900 rounded-2xl">
            <span className="font-bold text-blue-600 dark:text-blue-400 font-mono block">Variant A (Control): Farah AI v2.2</span>
            <span className="text-[10px] text-slate-400 mt-1 block font-normal">Traffic Weight: 80%</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-900 rounded-2xl">
            <span className="font-bold text-purple-600 dark:text-purple-400 font-mono block">Variant B (Challenger): Farah-DeepSeek Core</span>
            <span className="text-[10px] text-slate-400 mt-1 block font-normal">Traffic Weight: 20%</span>
          </div>
        </div>
      </OperationalCard>
    </div>
  );
}
