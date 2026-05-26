'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { EnterpriseTable } from '@/components/shared/EnterpriseTable';
import { Badge } from '@/components/shared/BadgeSystem';
import { translations } from '@/i18n/translations';
import { AlertCircle, TrendingDown, TrendingUp } from 'lucide-react';

export function SlaTab() {
  const { lang, slaRules } = useApp();
  const t = translations[lang];
  const isRtl = lang === 'ar';

  // Extend headers with operational analytics column
  const tableHeaders = [...t.clientAdmin.sla.headers, isRtl ? 'الأداء الفعلي (30 يوم)' : 'Adherence (30d)'];

  // Add realistic operational metrics to existing seeded data
  const enrichedRules = slaRules.map(rule => {
    // Generate realistic mock adherence based on priority
    let adherence = 99.9;
    let trend = 'stable';
    let breachRisk = false;

    if (rule.priority === 'urgent') {
      adherence = 94.2;
      trend = 'down';
      breachRisk = true; // High risk of breach for urgent
    } else if (rule.priority === 'high') {
      adherence = 97.8;
      trend = 'down';
    } else if (rule.priority === 'medium') {
      adherence = 99.1;
      trend = 'up';
    } else {
      adherence = 99.9;
      trend = 'up';
    }

    return { ...rule, adherence, trend, breachRisk };
  });

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t.clientAdmin.sla.title}
        description={t.clientAdmin.sla.description}
      />

      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <h3 className="font-bold text-[11px] text-slate-655 dark:text-slate-400 uppercase tracking-wider font-mono">
            {t.clientAdmin.sla.configuredSla}
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">Last synced: 2 mins ago</span>
        </div>
        
        <EnterpriseTable headers={tableHeaders}>
          {enrichedRules.map((rule) => (
            <tr key={rule.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 group transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className={`font-bold uppercase font-mono ${
                    rule.priority === 'urgent' ? 'text-red-600 dark:text-red-400' :
                    rule.priority === 'high' ? 'text-amber-600 dark:text-amber-400' :
                    'text-slate-900 dark:text-white'
                  }`}>
                    {rule.priority}
                  </span>
                  {rule.breachRisk && (
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse" title="High Breach Risk">
                      <AlertCircle className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                  {rule.responseTimeMins} {t.clientAdmin.sla.mins}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                  {rule.resolutionTimeMins} {t.clientAdmin.sla.mins}
                </span>
              </td>
              <td className="px-6 py-4">
                <Badge type={rule.active ? 'success' : 'inactive'}>
                  {rule.active ? t.clientAdmin.sla.active : t.clientAdmin.sla.inactive}
                </Badge>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-baseline gap-1.5 w-16">
                    <span className={`font-bold font-mono ${
                      rule.adherence < 95 ? 'text-red-600 dark:text-red-400' : 
                      rule.adherence < 98 ? 'text-amber-600 dark:text-amber-400' : 
                      'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {rule.adherence}%
                    </span>
                  </div>
                  
                  {/* Visual adherence bar */}
                  <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                    <div className={`h-full ${
                      rule.adherence < 95 ? 'bg-red-500' : 
                      rule.adherence < 98 ? 'bg-amber-500' : 
                      'bg-emerald-500'
                    }`} style={{ width: `${rule.adherence}%` }} />
                  </div>

                  {rule.trend === 'up' ? (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </EnterpriseTable>
      </div>
    </div>
  );
}

