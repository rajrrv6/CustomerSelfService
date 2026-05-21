'use client';

import React from 'react';
import { Grid, Phone } from 'lucide-react';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { OperationalCard } from '@/components/shared/OperationalCard';
import { Badge } from '@/components/shared/BadgeSystem';

export function ChannelsTab() {
  const templates = [
    { name: 'order_delivery_update', status: 'approved', lang: 'ar/en' },
    { name: 'refund_issued_receipt', status: 'approved', lang: 'ar/en' },
    { name: 'ticket_escalation_alert', status: 'pending', lang: 'en' }
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Omnichannel Customizer"
        description="Enable integration keys, register WhatsApp webhook credentials, and configure Web Chat Widgets."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Widget config widget */}
        <OperationalCard hoverEffect={false} className="p-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
            <Grid className="w-5 h-5 text-blue-500" />
            Web Chat Widget Options
          </h3>
          
          <div className="space-y-3.5 text-xs font-semibold">
            <div>
              <label className="block text-slate-450 dark:text-slate-500 mb-1.5 font-mono text-[10px] uppercase">Widget Primary Color</label>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 border border-white dark:border-slate-800 cursor-pointer shadow-sm" />
                <div className="w-8 h-8 rounded-lg bg-emerald-650 cursor-pointer" />
                <div className="w-8 h-8 rounded-lg bg-violet-600 cursor-pointer" />
                <input
                  type="text"
                  defaultValue="#2563eb"
                  className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg font-mono text-[11px] text-slate-850 dark:text-slate-250 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-450 dark:text-slate-500 mb-1.5 font-mono text-[10px] uppercase">Bot Greeting Message (EN)</label>
              <input
                type="text"
                defaultValue="Hello! I am Farah. How can I help you today?"
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none text-slate-850 dark:text-slate-250"
              />
            </div>
            <div>
              <label className="block text-slate-450 dark:text-slate-500 mb-1.5 font-mono text-[10px] uppercase">Bot Greeting Message (AR)</label>
              <input
                type="text"
                defaultValue="مرحباً! أنا فرح المساعد الذكي. كيف يمكنني مساعدتك؟"
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none text-slate-850 dark:text-slate-250"
              />
            </div>
          </div>
        </OperationalCard>

        {/* WhatsApp templates */}
        <OperationalCard hoverEffect={false} className="p-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
            <Phone className="w-5 h-5 text-emerald-500" />
            WhatsApp Message Templates
          </h3>
          
          <div className="space-y-3">
            {templates.map((tpl, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl text-xs font-semibold"
              >
                <div>
                  <span className="font-mono text-slate-800 dark:text-white font-bold">{tpl.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono ml-2">({tpl.lang})</span>
                </div>
                <Badge type={tpl.status === 'approved' ? 'success' : 'warning'}>
                  {tpl.status}
                </Badge>
              </div>
            ))}
          </div>
        </OperationalCard>
      </div>
    </div>
  );
}
