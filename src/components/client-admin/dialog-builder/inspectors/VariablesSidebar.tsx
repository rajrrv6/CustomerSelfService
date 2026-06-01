'use client';

import React from 'react';
import { useUIStore } from '@/stores/uiStore';
import { VariableItem } from '../types';
import { Badge } from '@/components/shared/BadgeSystem';
import { Layers, User, FileText, Settings, HelpCircle, Copy, Check } from 'lucide-react';

export const variablesRegistry: VariableItem[] = [
  // Customer variables
  { key: 'customer_name', category: 'customer', description: 'Full name of the active customer.', defaultValue: 'Amina Al-Farsi' },
  { key: 'customer_email', category: 'customer', description: 'Primary email of the customer.', defaultValue: 'amina.farsi@company.sa' },
  { key: 'customer_tier', category: 'customer', description: 'Loyalty level (VIP, Gold, Standard).', defaultValue: 'VIP' },
  
  // Order variables
  { key: 'invoice_amount', category: 'order', description: 'Latest invoice charge amount.', defaultValue: '1240.00' },
  { key: 'stripe_connected', category: 'order', description: 'Boolean indicates billing gateway status.', defaultValue: 'true' },
  
  // Session variables
  { key: 'refund_reason', category: 'session', description: 'Reason for return filed in chat.', defaultValue: '' },
  { key: 'preferred_email', category: 'session', description: 'Overridden email for support alerts.', defaultValue: '' },
  { key: 'ledger_lock_verified', category: 'session', description: 'Boolean verification of ledger database sync.', defaultValue: 'false' },
  { key: 'language', category: 'session', description: 'Language of active session (en, ar).', defaultValue: 'en' },
  
  // AI variables
  { key: 'intent_confidence', category: 'ai', description: 'Farah NLU intent classification confidence score.', defaultValue: '0.85' },
  { key: 'ticket_id', category: 'ai', description: 'Auto-generated ticket reference ID.', defaultValue: 'TKT-82739' },
  { key: 'queue_name', category: 'ai', description: 'Target queue determined during flow.', defaultValue: '' }
];

export function VariablesSidebar() {
  const lang = useUIStore((s) => s.lang);
  const isAr = lang === 'ar';

  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const handleCopy = (key: string) => {
    const token = `{{${key}}}`;
    navigator.clipboard.writeText(token);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const groupByCategory = (cat: VariableItem['category']) => {
    return variablesRegistry.filter((v) => v.category === cat);
  };

  const renderCategoryList = (
    categoryName: string,
    categoryLabelAr: string,
    categoryLabelEn: string,
    items: VariableItem[],
    Icon: React.ComponentType<{ className?: string }>,
    badgeType: string
  ) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
          <Icon className="w-3.5 h-3.5" />
          <span>{isAr ? categoryLabelAr : categoryLabelEn}</span>
        </div>

        <div className="space-y-1.5">
          {items.map((item) => (
            <div
              key={item.key}
              onClick={() => handleCopy(item.key)}
              className="group p-2.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:border-blue-500 rounded-xl cursor-pointer transition-all flex flex-col gap-1 text-[10px] min-h-12 shrink-0 relative"
            >
              <div className="flex justify-between items-center pr-4">
                <span className="font-bold font-mono text-blue-600 dark:text-blue-400 select-all">
                  &#123;&#123;{item.key}&#125;&#125;
                </span>
                <button
                  type="button"
                  className="absolute right-2 top-2 text-slate-400 group-hover:opacity-100 opacity-0 transition-opacity"
                >
                  {copiedKey === item.key ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3 h-3 hover:text-slate-700 dark:hover:text-white" />
                  )}
                </button>
              </div>
              <p className="text-[9px] text-slate-400 leading-snug mt-0.5 select-none font-medium">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`w-64 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden shrink-0 ${
        isAr ? 'border-r' : 'border-l'
      }`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <h3 className="text-xs font-black uppercase tracking-wider font-sans text-slate-800 dark:text-slate-200">
          {isAr ? 'سجل متغيرات الحوار' : 'Variable Context Registry'}
        </h3>
        <p className="text-[10px] text-slate-400 mt-1 font-medium leading-normal">
          {isAr
            ? 'انقر لنسخ رمز المتغير وإدراجه في رسائل البوت أو استدعاءات الـ API.'
            : 'Click any variable to copy its token (e.g. {{customer_name}}) to insert into response editors or API payloads.'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {renderCategoryList('customer', 'متغيرات العميل', 'Customer Profile', groupByCategory('customer'), User, 'success')}
        {renderCategoryList('order', 'متغيرات الفاتورة والطلبات', 'Billing & Orders', groupByCategory('order'), FileText, 'info')}
        {renderCategoryList('session', 'متغيرات الجلسة المؤقتة', 'Session Context', groupByCategory('session'), Settings, 'warning')}
        {renderCategoryList('ai', 'متغيرات ذكاء NLU', 'AI & Diagnostic Metadata', groupByCategory('ai'), HelpCircle, 'neutral')}
      </div>
    </div>
  );
}
