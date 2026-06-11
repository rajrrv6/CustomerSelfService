'use client';

import React from 'react';
import { TenantBillingRecord, SubscriptionPlan } from '@/types/billing';
import { EnterpriseTable } from '@/components/shared/EnterpriseTable';
import { Eye, Check, Pause, Play, Plus, CreditCard } from 'lucide-react';
import { BillingStatusBadge } from './BillingStatusBadge';
import { Badge } from '@/components/shared/BadgeSystem';
import { useUIStore } from '@/stores/uiStore';

interface TenantBillingTableProps {
  data: TenantBillingRecord[];
  plans: SubscriptionPlan[];
  onViewDetails: (record: TenantBillingRecord) => void;
  onSuspend: (record: TenantBillingRecord) => void;
  onResume: (record: TenantBillingRecord) => void;
  onMarkPaid: (record: TenantBillingRecord) => void;
  onAddClick: () => void;
}

export function TenantBillingTable({
  data,
  plans,
  onViewDetails,
  onSuspend,
  onResume,
  onMarkPaid,
  onAddClick
}: TenantBillingTableProps) {
  const lang = useUIStore((s) => s.lang);
  const isRtl = lang === 'ar';

  const planMap = React.useMemo(() => {
    return new Map(plans.map(p => [p.id, p.name]));
  }, [plans]);

  const tableHeaders = [
    isRtl ? 'اسم الجهة / المستأجر' : 'Tenant Name',
    isRtl ? 'الخطة الحالية' : 'Current Plan',
    isRtl ? 'تاريخ التجديد' : 'Renewal Date',
    isRtl ? 'حالة الفاتورة' : 'Invoice Status',
    isRtl ? 'الإنفاق الشهري' : 'Monthly Spend',
    isRtl ? 'فئة الاستخدام' : 'Usage Tier',
    isRtl ? 'حالة الفوترة' : 'Billing Status',
    isRtl ? 'الإجراءات' : 'Actions'
  ];

  const invoiceBadgeTypes = {
    paid: 'success' as const,
    overdue: 'error' as const,
    unpaid: 'warning' as const,
    pending: 'default' as const
  };

  const getInvoiceLabel = (status: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      paid: { en: 'Paid', ar: 'مدفوعة' },
      overdue: { en: 'Overdue', ar: 'متأخرة' },
      unpaid: { en: 'Unpaid', ar: 'غير مدفوعة' },
      pending: { en: 'Pending', ar: 'معلقة' }
    };
    const current = labels[status] || { en: status, ar: status };
    return isRtl ? current.ar : current.en;
  };

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center border border-dashed border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-12 rounded-2xl text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/30 mb-4 shadow-sm">
          <CreditCard className="w-8 h-8 animate-pulse" />
        </div>
        <h3 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider font-mono">
          {isRtl ? 'لا توجد سجلات فوترة للمستأجرين' : 'No Tenant Billing Records'}
        </h3>
        <p className="text-[10px] text-slate-400 max-w-sm mt-2 mb-6 font-semibold">
          {isRtl
            ? 'يرجى تسجيل وتعيين خطة أسعار لأول مستأجر للبدء في تتبع الفواتير.'
            : 'Link enterprise client organizations to price tiers to begin tracking renewal timelines and token costs.'}
        </p>
        <button
          onClick={onAddClick}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer font-mono"
        >
          <Plus className="w-4 h-4" />
          <span>{isRtl ? 'إضافة سجل فوترة للمستأجر' : 'Add Tenant Billing Record'}</span>
        </button>
      </div>
    );
  }

  return (
    <EnterpriseTable
      headers={tableHeaders}
      empty={data.length === 0}
      emptyTitle={isRtl ? 'لا توجد سجلات فوترة' : 'No Records Found'}
      emptyDesc={isRtl ? 'لم يتم العثور على سجلات فوترة للمستأجرين تطابق معايير التصفية.' : 'No tenant billing accounts match your search and filter criteria.'}
    >
      {data.map((record) => (
        <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
          <td className="px-6 py-4 font-bold text-slate-900 dark:text-white text-xs">{record.tenantName}</td>
          <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-350">
            {planMap.get(record.currentPlanId) || record.currentPlanId}
          </td>
          <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">{record.renewalDate}</td>
          <td className="px-6 py-4">
            <Badge type={invoiceBadgeTypes[record.invoiceStatus] || 'default'}>
              {getInvoiceLabel(record.invoiceStatus)}
            </Badge>
          </td>
          <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">${record.monthlySpend}/mo</td>
          <td className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-450 uppercase text-[10px] tracking-wide">
            {record.usageTier}
          </td>
          <td className="px-6 py-4">
            <BillingStatusBadge status={record.billingStatus} />
          </td>
          <td className="px-6 py-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onViewDetails(record)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-600 rounded cursor-pointer transition-colors"
                title={isRtl ? 'عرض التفاصيل' : 'View Billing Details'}
              >
                <Eye className="w-3.5 h-3.5" />
              </button>

              {record.invoiceStatus !== 'paid' && (
                <button
                  onClick={() => onMarkPaid(record)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-emerald-600 rounded cursor-pointer transition-colors"
                  title={isRtl ? 'تسجيل كمدفوع' : 'Mark Invoice Paid'}
                >
                  <Check className="w-4 h-4" />
                </button>
              )}

              {record.billingStatus === 'suspended' ? (
                <button
                  onClick={() => onResume(record)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-emerald-500 rounded cursor-pointer transition-colors"
                  title={isRtl ? 'استئناف الفوترة' : 'Resume Billing'}
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
              ) : (
                (record.billingStatus === 'active' || record.billingStatus === 'overdue') && (
                  <button
                    onClick={() => onSuspend(record)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-amber-600 rounded cursor-pointer transition-colors"
                    title={isRtl ? 'إيقاف الفوترة مؤقتاً' : 'Suspend Billing'}
                  >
                    <Pause className="w-3.5 h-3.5" />
                  </button>
                )
              )}
            </div>
          </td>
        </tr>
      ))}
    </EnterpriseTable>
  );
}
