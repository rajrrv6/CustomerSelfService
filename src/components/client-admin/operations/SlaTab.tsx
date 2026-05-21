'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { EnterpriseTable } from '@/components/shared/EnterpriseTable';
import { Badge } from '@/components/shared/BadgeSystem';

export function SlaTab() {
  const { slaRules } = useApp();

  const tableHeaders = [
    'Policy Priority',
    'Response Limit',
    'Resolution Limit',
    'Targets Status'
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="SLA Dashboard Policies"
        description="Configure corporate response SLAs, resolution deadline limits, and email notification paths."
      />

      <div className="space-y-4">
        <h3 className="font-bold text-xs text-slate-650 dark:text-slate-400 uppercase font-mono">Configured SLA Targets</h3>
        <EnterpriseTable headers={tableHeaders}>
          {slaRules.map((rule) => (
            <tr key={rule.id}>
              <td className="px-6 py-4 font-bold uppercase text-slate-900 dark:text-white font-mono">{rule.priority}</td>
              <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-450">{rule.responseTimeMins} mins</td>
              <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-450">{rule.resolutionTimeMins} mins</td>
              <td className="px-6 py-4">
                <Badge type={rule.active ? 'success' : 'inactive'}>
                  {rule.active ? 'ACTIVE' : 'INACTIVE'}
                </Badge>
              </td>
            </tr>
          ))}
        </EnterpriseTable>
      </div>
    </div>
  );
}
