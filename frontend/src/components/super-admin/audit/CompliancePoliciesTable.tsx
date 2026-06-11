'use client';

import React from 'react';
import { useUIStore } from '@/stores/uiStore';
import { CompliancePolicy } from '@/types/audit';
import { AuditStatusBadge } from './AuditStatusBadge';
import { ToggleLeft, ToggleRight, Archive, Info, Plus, HelpCircle } from 'lucide-react';

interface CompliancePoliciesTableProps {
  data: CompliancePolicy[];
  onToggle: (policy: CompliancePolicy) => void;
  onArchive: (policy: CompliancePolicy) => void;
  onAddClick: () => void;
}

export function CompliancePoliciesTable({ data, onToggle, onArchive, onAddClick }: CompliancePoliciesTableProps) {
  const lang = useUIStore((s) => s.lang);
  const isRtl = lang === 'ar';

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center max-w-xl mx-auto space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-900 text-slate-400 flex items-center justify-center border border-slate-100 dark:border-slate-800/80">
          <HelpCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider font-mono">
            {isRtl ? 'لا توجد سياسات امتثال' : 'No Compliance Policies Configured'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed max-w-sm mx-auto">
            {isRtl
              ? 'لم يتم تهيئة أي سياسات أمنية للمنصة حتى الآن. ابدأ بتسجيل سياسة مراقبة جديدة.'
              : 'There are no active security rules, sensitivity thresholds, or data compliance policies configured in the directory.'}
          </p>
        </div>
        <button
          onClick={onAddClick}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md transition-all active:scale-95 cursor-pointer font-mono"
        >
          <Plus className="w-4 h-4" />
          <span>{isRtl ? 'إنشاء سياسة امتثال' : 'Create Compliance Policy'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-wider font-mono">
              <th className={`px-4 py-3 ${isRtl ? 'text-right' : 'text-left'}`}>
                {isRtl ? 'اسم السياسة والتفاصيل' : 'Policy Name / Description'}
              </th>
              <th className={`px-4 py-3 ${isRtl ? 'text-right' : 'text-left'}`}>
                {isRtl ? 'فئة السياسة' : 'Category'}
              </th>
              <th className={`px-4 py-3 ${isRtl ? 'text-right' : 'text-left'}`}>
                {isRtl ? 'نطاق التطبيق' : 'Assigned Scope'}
              </th>
              <th className={`px-4 py-3 ${isRtl ? 'text-right' : 'text-left'}`}>
                {isRtl ? 'آخر تحديث' : 'Last Updated'}
              </th>
              <th className="px-4 py-3 text-center">
                {isRtl ? 'حالة التوافق' : 'Compliance State'}
              </th>
              <th className="px-4 py-3 text-center">
                {isRtl ? 'حالة التشغيل' : 'Enforcement'}
              </th>
              <th className="px-4 py-3 text-center">
                {isRtl ? 'الإجراءات' : 'Actions'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold text-slate-700 dark:text-slate-350">
            {data.map((policy) => (
              <tr
                key={policy.id}
                className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors"
              >
                <td className="px-4 py-3 max-w-[280px]">
                  <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    {policy.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium leading-relaxed mt-1">
                    {policy.description}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-450 uppercase font-mono">
                    {policy.category}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono">{policy.assignedScope}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-slate-500 dark:text-slate-400">{policy.lastUpdated}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <AuditStatusBadge type="compliance" value={policy.status === 'disabled' ? 'disabled' : policy.complianceState} />
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => onToggle(policy)}
                    className="cursor-pointer focus:outline-none transition-all duration-200 inline-flex items-center"
                    title={policy.status === 'enabled' ? (isRtl ? 'تعطيل السياسة' : 'Disable Policy') : (isRtl ? 'تفعيل السياسة' : 'Enable Policy')}
                  >
                    {policy.status === 'enabled' ? (
                      <ToggleRight className="w-7 h-7 text-blue-600 dark:text-blue-500" />
                    ) : (
                      <ToggleLeft className="w-7 h-7 text-slate-400 dark:text-slate-600" />
                    )}
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => onArchive(policy)}
                      title={isRtl ? 'أرشفة السياسة' : 'Archive Policy'}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/20 text-slate-550 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all cursor-pointer border border-transparent hover:border-rose-100 dark:hover:border-rose-900/30"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
