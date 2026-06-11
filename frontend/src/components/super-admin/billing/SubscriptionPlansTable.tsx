'use client';

import React from 'react';
import { SubscriptionPlan } from '@/types/billing';
import { EnterpriseTable } from '@/components/shared/EnterpriseTable';
import { Edit2, Archive, ToggleLeft, ToggleRight, Plus, DollarSign } from 'lucide-react';
import { BillingStatusBadge } from './BillingStatusBadge';
import { useUIStore } from '@/stores/uiStore';

interface SubscriptionPlansTableProps {
  data: SubscriptionPlan[];
  onEdit: (plan: SubscriptionPlan) => void;
  onToggle: (plan: SubscriptionPlan) => void;
  onArchive: (plan: SubscriptionPlan) => void;
  onAddClick: () => void;
}

export function SubscriptionPlansTable({
  data,
  onEdit,
  onToggle,
  onArchive,
  onAddClick
}: SubscriptionPlansTableProps) {
  const lang = useUIStore((s) => s.lang);
  const isRtl = lang === 'ar';

  const tableHeaders = [
    isRtl ? 'اسم الخطة' : 'Plan Name',
    isRtl ? 'السعر الشهري' : 'Monthly Price',
    isRtl ? 'السعر السنوي' : 'Annual Price',
    isRtl ? 'المقاعد المضمنة' : 'Included Seats',
    isRtl ? 'فئة الاستخدام' : 'Usage Tier',
    isRtl ? 'رموز الذكاء الاصطناعي' : 'AI Credits (Tokens)',
    isRtl ? 'الحالة' : 'Status',
    isRtl ? 'الإجراءات' : 'Actions'
  ];

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center border border-dashed border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-12 rounded-2xl text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/30 mb-4 shadow-sm">
          <DollarSign className="w-8 h-8 animate-pulse" />
        </div>
        <h3 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider font-mono">
          {isRtl ? 'لا توجد خطط أسعار معرفة' : 'No Subscription Plans Configured'}
        </h3>
        <p className="text-[10px] text-slate-400 max-w-sm mt-2 mb-6 font-semibold">
          {isRtl
            ? 'يرجى إنشاء خطة أسعار جديدة لتخصيص حدود Seats ومعدلات استهلاك الرموز للعملاء.'
            : 'Configure client pricing tiers, included agent seats, and standard monthly AI token bounds.'}
        </p>
        <button
          onClick={onAddClick}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer font-mono"
        >
          <Plus className="w-4 h-4" />
          <span>{isRtl ? 'إنشاء خطة أسعار جديدة' : 'Create Billing Plan'}</span>
        </button>
      </div>
    );
  }

  return (
    <EnterpriseTable
      headers={tableHeaders}
      empty={data.length === 0}
      emptyTitle={isRtl ? 'لا توجد خطط أسعار' : 'No Plans Found'}
      emptyDesc={isRtl ? 'لم يتم العثور على خطط اشتراك تطابق معايير التصفية.' : 'No pricing plans match your search and filter criteria.'}
    >
      {data.map((plan) => (
        <tr key={plan.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
          <td className="px-6 py-4">
            <div>
              <div className="font-bold text-slate-900 dark:text-white text-xs">{plan.name}</div>
              {plan.description && (
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate max-w-xs mt-0.5">
                  {plan.description}
                </div>
              )}
            </div>
          </td>
          <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">${plan.monthlyPrice}</td>
          <td className="px-6 py-4 font-mono font-bold text-slate-700 dark:text-slate-400">${plan.annualPrice}</td>
          <td className="px-6 py-4 font-mono font-semibold text-slate-655 dark:text-slate-350">{plan.includedSeats}</td>
          <td className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-450 uppercase text-[10px] tracking-wide">
            {plan.usageTier}
          </td>
          <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">
            {(plan.aiCredits / 1000000).toFixed(1)}M
          </td>
          <td className="px-6 py-4">
            <BillingStatusBadge status={plan.status} />
          </td>
          <td className="px-6 py-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggle(plan)}
                disabled={plan.status === 'archived'}
                className={`p-1 rounded cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                  plan.status === 'disabled'
                    ? 'text-slate-450 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                    : 'text-emerald-500 hover:text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title={plan.status === 'disabled' ? (isRtl ? 'تمكين' : 'Enable') : (isRtl ? 'تعطيل' : 'Disable')}
              >
                {plan.status === 'disabled' ? (
                  <ToggleLeft className="w-4 h-4" />
                ) : (
                  <ToggleRight className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => onEdit(plan)}
                disabled={plan.status === 'archived'}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed rounded cursor-pointer transition-colors"
                title={isRtl ? 'تعديل' : 'Edit'}
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onArchive(plan)}
                disabled={plan.status === 'archived'}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed rounded cursor-pointer transition-colors"
                title={isRtl ? 'أرشفة' : 'Archive'}
              >
                <Archive className="w-3.5 h-3.5" />
              </button>
            </div>
          </td>
        </tr>
      ))}
    </EnterpriseTable>
  );
}
