import React from 'react';
import { Award, Clock, CheckCircle2, Zap } from 'lucide-react';
import { AgentPerformanceMetrics } from '@/data/seed/agentMetricsSeed';

interface PerformanceScorecardProps {
  metrics: AgentPerformanceMetrics;
}

export function PerformanceScorecard({ metrics }: PerformanceScorecardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-5 shadow-sm text-xs font-semibold">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-sm text-slate-850 dark:text-white">Personal Performance Scorecard</h3>
          <p className="text-[10px] text-slate-400 font-normal">Track your monthly support quality & SLA alignment metrics.</p>
        </div>
        <Award className="w-5 h-5 text-amber-500" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          {
            title: 'Average CSAT Score',
            value: `${metrics.csatScore}%`,
            desc: 'Target: >90% CSAT',
            icon: Award,
            color: 'text-amber-500'
          },
          {
            title: 'SLA Compliance Rate',
            value: `${metrics.slaComplianceRate}%`,
            desc: 'Target: >95% compliance',
            icon: CheckCircle2,
            color: 'text-emerald-500'
          },
          {
            title: 'Avg Speed of Response',
            value: `${metrics.avgResponseMs / 1000} sec`,
            desc: 'Target: under 60 sec',
            icon: Clock,
            color: 'text-blue-500'
          },
          {
            title: 'Cases Resolved (Month)',
            value: metrics.resolvedTicketsCount,
            desc: 'Target: 150 resolved',
            icon: Zap,
            color: 'text-purple-500'
          }
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="p-3.5 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">{kpi.title}</span>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <p className="text-xl font-bold font-mono text-slate-850 dark:text-white mt-1">{kpi.value}</p>
              <span className="text-[10px] text-slate-450 block font-normal">{kpi.desc}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
