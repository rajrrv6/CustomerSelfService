'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { EnterpriseTable } from '@/components/shared/EnterpriseTable';
import { Badge } from '@/components/shared/BadgeSystem';
import { translations } from '@/i18n/translations';

export function SlaTab() {
  const { lang, slaRules } = useApp();
  const t = translations[lang];

  const tableHeaders = [...t.clientAdmin.sla.headers];

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t.clientAdmin.sla.title}
        description={t.clientAdmin.sla.description}
      />

      <div className="space-y-4">
        <h3 className="font-bold text-xs text-slate-655 dark:text-slate-400 uppercase font-mono">
          {t.clientAdmin.sla.configuredSla}
        </h3>
        <EnterpriseTable headers={tableHeaders}>
          {slaRules.map((rule) => (
            <tr key={rule.id}>
              <td className="px-6 py-4 font-bold uppercase text-slate-900 dark:text-white font-mono">{rule.priority}</td>
              <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-450">{rule.responseTimeMins} {t.clientAdmin.sla.mins}</td>
              <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-450">{rule.resolutionTimeMins} {t.clientAdmin.sla.mins}</td>
              <td className="px-6 py-4">
                <Badge type={rule.active ? 'success' : 'inactive'}>
                  {rule.active ? t.clientAdmin.sla.active : t.clientAdmin.sla.inactive}
                </Badge>
              </td>
            </tr>
          ))}
        </EnterpriseTable>
      </div>
    </div>
  );
}
