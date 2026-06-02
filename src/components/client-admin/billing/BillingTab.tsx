'use client';

import React from 'react';
import { CreditCard, Sparkles, Receipt, HardDrive, BarChart2, ShieldCheck } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';

export function BillingTab() {
  const lang = useUIStore((s) => s.lang);
  const isRtl = lang === 'ar';

  const invoices = [
    { id: 'INV-2026-004', date: '2026-05-01', amount: '$1,499.00', status: 'paid' },
    { id: 'INV-2026-003', date: '2026-04-01', amount: '$1,499.00', status: 'paid' },
    { id: 'INV-2026-002', date: '2026-03-01', amount: '$1,250.00', status: 'paid' }
  ];

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">
          {isRtl ? 'إدارة الفوترة والاشتراكات' : 'Billing & Subscriptions'}
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          {isRtl 
            ? 'تحديث تفاصيل الدفع، مراجعة فواتيرك السابقة، ومراقبة استهلاك الموارد وحزم الخدمات.' 
            : 'Manage payment credentials, download historical invoices, and monitor system resources.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Plan Card */}
        <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-[10px] font-bold tracking-wider uppercase font-mono">
                {isRtl ? 'الخطة الحالية' : 'Active Plan'}
              </span>
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight">Enterprise Pro</h3>
              <p className="text-xs text-slate-400 mt-1">
                {isRtl ? 'ترخيص كامل الصلاحية مع قنوات اتصال مخصصة وسرعات معالجة فائقة.' : 'Fully custom SLA suite with high-throughput speech pipelines.'}
              </p>
            </div>
            <div className="pt-2">
              <span className="text-2xl font-mono font-bold">$1,499</span>
              <span className="text-xs text-slate-400"> / {isRtl ? 'شهرياً' : 'month'}</span>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-4 mt-6 flex justify-between items-center text-xs">
            <span className="text-slate-400">{isRtl ? 'التجديد التلقائي:' : 'Next Renewal:'} May 31, 2026</span>
            <button className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all text-xs">
              {isRtl ? 'ترقية الخطة' : 'Manage Subscription'}
            </button>
          </div>
        </div>

        {/* Resources Usage Meter */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase font-mono">
            {isRtl ? 'استهلاك الموارد' : 'Resource Utilization'}
          </h3>
          <div className="space-y-3.5 text-xs font-semibold">
            {/* LLM Tokens */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>LLM Tokens</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">4.2M / 10M</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '42%' }} />
              </div>
            </div>
            {/* ASR/TTS Audio Minutes */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>Speech Gateway Minutes</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">1,820 / 5,000</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '36.4%' }} />
              </div>
            </div>
            {/* Active Bots */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>Bot Deployments</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">8 / 20</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: '40%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-850">
          <Receipt className="w-4 h-4 text-blue-500" />
          <h3 className="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase font-mono">
            {isRtl ? 'سجل الفواتير السابقة' : 'Billing Invoice History'}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-855 text-slate-400 font-bold">
                <th className="pb-3">{isRtl ? 'رقم الفاتورة' : 'Invoice Reference'}</th>
                <th className="pb-3">{isRtl ? 'التاريخ' : 'Issue Date'}</th>
                <th className="pb-3">{isRtl ? 'المبلغ الإجمالي' : 'Total Billed'}</th>
                <th className="pb-3">{isRtl ? 'الحالة' : 'Status'}</th>
                <th className="pb-3 text-right">{isRtl ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-600 dark:text-slate-300 font-semibold">
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="py-3 font-mono font-bold text-slate-900 dark:text-white">{inv.id}</td>
                  <td className="py-3 font-mono">{inv.date}</td>
                  <td className="py-3 font-mono">{inv.amount}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold font-mono bg-emerald-100 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 uppercase">
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 rounded-xl transition-all font-bold text-[10px]">
                      {isRtl ? 'تحميل PDF' : 'Download PDF'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
export default BillingTab;
