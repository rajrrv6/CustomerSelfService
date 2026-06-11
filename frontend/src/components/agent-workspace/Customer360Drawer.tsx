import React from 'react';
import { User, FileText, ShoppingBag } from 'lucide-react';
import { CustomerProfile360 } from '@/data/seed/customer360Seed';

import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';

interface Customer360DrawerProps {
  profile?: CustomerProfile360;
}

export function Customer360Drawer({ profile }: Customer360DrawerProps) {
  const { lang } = useApp();
  const t = translations[lang];

  if (!profile) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-500 dark:text-slate-400">
        <User className="w-12 h-12 text-slate-300 dark:text-slate-700 animate-pulse mb-3" />
        <p className="text-xs font-semibold">{t.agentWorkspace.customer360.selectActive}</p>
      </div>
    );
  }

  const riskColors = {
    Low: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400',
    Medium: 'bg-amber-100 text-amber-800 dark:bg-amber-955 dark:text-amber-400',
    High: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400 border border-rose-200'
  };

  return (
    <div className="h-full flex flex-col justify-between overflow-y-auto p-5 space-y-5 bg-slate-50/90 dark:bg-slate-950/20 text-xs font-semibold text-slate-700 dark:text-slate-200">
      {/* Header */}
      <div>
        <h3 className="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase font-mono tracking-wider">{t.agentWorkspace.customer360.title}</h3>
      </div>

      {/* Avatar details card */}
      <div className="text-center space-y-2 pb-4 border-b border-slate-200 dark:border-slate-800/80">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden mx-auto flex items-center justify-center shadow-sm">
          <User className="w-8 h-8 text-slate-400 dark:text-slate-500" />
        </div>
        <div>
          <h4 className="font-bold text-[15px] text-slate-800 dark:text-white leading-tight">{profile.customerName}</h4>
          <span className="text-xs text-slate-500 dark:text-slate-400 block font-mono mt-1">{t.agentWorkspace.customer360.email}: {profile.email}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 block font-mono">{t.agentWorkspace.customer360.phone}: {profile.phone}</span>
        </div>
      </div>

      {/* SLA Metrics grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-left">
          <span className="text-slate-500 dark:text-slate-400 font-bold block uppercase font-mono text-[9.5px]">{t.agentWorkspace.customer360.npsScore}</span>
          <span className="text-sm font-bold text-slate-800 dark:text-white mt-0.5 block font-mono">{profile.npsScore}/10</span>
        </div>
        <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-left">
          <span className="text-slate-500 dark:text-slate-400 font-bold block uppercase font-mono text-[9.5px]">{t.agentWorkspace.customer360.churnRisk}</span>
          <span className={`px-1.5 py-0.5 mt-1 rounded font-bold font-mono inline-block text-[9.5px] ${riskColors[profile.churnRisk]}`}>
            {profile.churnRisk.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Billing Stats */}
      <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800/80">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500 dark:text-slate-400">{t.agentWorkspace.customer360.vipTier}</span>
          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10.5px] font-mono">
            {profile.tier}
          </span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500 dark:text-slate-400">{t.agentWorkspace.customer360.totalSpend}</span>
          <span className="font-bold text-slate-800 dark:text-white font-mono">${profile.totalSpent.toLocaleString()} USD</span>
        </div>
      </div>

      {/* SAP Orders Sync */}
      <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-slate-400 uppercase font-mono">
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{t.agentWorkspace.customer360.orderHistorySap}</span>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {profile.orders.map((ord) => (
            <div key={ord.id} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
              <div className="flex justify-between items-center font-mono">
                <span className="font-bold text-slate-800 dark:text-white">{ord.id}</span>
                <span className={`px-1.5 py-0.2 rounded text-[9.5px] font-bold ${
                  ord.status === 'DELIVERED' ? 'text-emerald-500' : 'text-blue-500 animate-pulse'
                }`}>{ord.status}</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-normal truncate max-w-50">{ord.itemName}</p>
              <div className="flex justify-between items-center text-[9px] text-slate-500 dark:text-slate-400 font-mono">
                <span>{t.agentWorkspace.customer360.date} {ord.date}</span>
                <span className="font-bold">${ord.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Salesforce Prior Tickets */}
      <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-slate-400 uppercase font-mono">
          <FileText className="w-3.5 h-3.5" />
          <span>{t.agentWorkspace.customer360.priorTicketsSf}</span>
        </div>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {profile.tickets.length === 0 ? (
            <span className="text-xs text-slate-400 italic font-normal block py-1">{t.agentWorkspace.customer360.noPriorTickets}</span>
          ) : (
            profile.tickets.map((tkt) => (
              <div key={tkt.id} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                <div className="flex justify-between items-center font-mono">
                  <span className="font-bold text-slate-800 dark:text-white">{tkt.id}</span>
                  <span className="capitalize text-slate-500"> {tkt.status}</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-normal truncate max-w-50">{tkt.title}</p>
                <div className="flex justify-between items-center text-[9px] text-slate-500 dark:text-slate-400 font-mono">
                  <span>{t.agentWorkspace.customer360.date} {tkt.date}</span>
                  <span className={`uppercase px-1 rounded ${
                    tkt.priority === 'urgent' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`}>{tkt.priority}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
