import React from 'react';
import { SsoProvider } from './types';
import { ShieldAlert, ShieldCheck, RefreshCw, Calendar, Wifi } from 'lucide-react';

interface FederationHealthCardProps {
  provider: SsoProvider;
  onSync: () => void;
  lang: 'en' | 'ar';
}

export function FederationHealthCard({ provider, onSync, lang }: FederationHealthCardProps) {
  // Expiry level logic
  const certExpiryDate = new Date(provider.certExpiry);
  const diffTime = certExpiryDate.getTime() - Date.now();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let expiryStatus: 'good' | 'warning' | 'critical' | 'expired' = 'good';
  if (diffDays <= 0) {
    expiryStatus = 'expired';
  } else if (diffDays <= 7) {
    expiryStatus = 'critical';
  } else if (diffDays <= 30) {
    expiryStatus = 'warning';
  }

  const certWarningConfig = {
    good: {
      text: lang === 'ar' ? `نشط (${diffDays} يوم متبقي)` : `Active (${diffDays} days remaining)`,
      style: 'text-emerald-600 bg-emerald-50 border-emerald-250 dark:bg-emerald-950/20 dark:border-emerald-900/60 dark:text-emerald-400',
    },
    warning: {
      text: lang === 'ar' ? `تنبيه: تنتهي الصلاحية قريباً (${diffDays} يوم)` : `Warning: Expiry approaching (${diffDays} days)`,
      style: 'text-amber-600 bg-amber-50 border-amber-250 dark:bg-amber-955/20 dark:border-amber-900/60 dark:text-amber-400 animate-pulse',
    },
    critical: {
      text: lang === 'ar' ? `حرج: شهادة على وشك الانتهاء (${diffDays} يوم!)` : `Critical: Expiring very soon (${diffDays} days!)`,
      style: 'text-rose-650 bg-rose-50 border-rose-250 dark:bg-rose-955/20 dark:border-rose-900/60 dark:text-rose-400 font-extrabold animate-bounce',
    },
    expired: {
      text: lang === 'ar' ? 'منتهية الصلاحية! يجب التجديد فورا' : 'Expired! Immediate renewal required',
      style: 'text-white bg-rose-600 border-rose-700 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-200 font-black',
    },
  }[expiryStatus];

  const statusColor = {
    active: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    degraded: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    inactive: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
  }[provider.status];

  const t = {
    en: {
      lastSync: 'Last sync:',
      rate: 'Success Rate',
      latency: 'Latency',
      cert: 'Identity Certificate Status',
      action: 'Trigger Sync',
    },
    ar: {
      lastSync: 'آخر مزامنة:',
      rate: 'نسبة النجاح',
      latency: 'زمن الاستجابة',
      cert: 'حالة شهادة التعريف الرقمية',
      action: 'مزامنة الاتصال',
    },
  }[lang] || {
    lastSync: 'Last sync:',
    rate: 'Success Rate',
    latency: 'Latency',
    cert: 'Identity Certificate Status',
    action: 'Trigger Sync',
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div style={{ textAlign: lang === 'ar' ? 'right' : 'left' }}>
          <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
            {provider.name}
          </h4>
          <span className="text-[9px] text-slate-400 font-semibold font-mono block mt-0.5">
            {t.lastSync} {new Date(provider.lastSync).toLocaleTimeString()}
          </span>
        </div>
        <span className={`text-[8.5px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${statusColor}`}>
          {provider.status}
        </span>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3 bg-slate-50/50 dark:bg-slate-950 p-3.5 border border-slate-150 dark:border-slate-850 rounded-2xl">
        <div className="space-y-1">
          <span className="block text-[8.5px] uppercase font-bold text-slate-400 font-mono tracking-wider">
            {t.rate}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-black text-slate-800 dark:text-white text-sm">
              {provider.successRate}%
            </span>
            <span className="text-[8px] text-slate-400 font-bold">24h average</span>
          </div>
        </div>
        <div className="space-y-1">
          <span className="block text-[8.5px] uppercase font-bold text-slate-400 font-mono tracking-wider">
            {t.latency}
          </span>
          <div className="flex items-center gap-1.5 font-black text-slate-850 dark:text-slate-150 text-sm">
            <Wifi className="w-3.5 h-3.5 text-blue-500" />
            <span>{provider.latencyMs} ms</span>
          </div>
        </div>
      </div>

      {/* Cert Warning Area */}
      <div className="space-y-1.5">
        <span className="block text-[8.5px] uppercase font-bold text-slate-400 font-mono tracking-wider flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {t.cert}
        </span>
        <div className={`p-2.5 rounded-xl border text-[10px] font-bold flex items-center gap-2 ${certWarningConfig.style}`}>
          {expiryStatus === 'expired' || expiryStatus === 'critical' ? (
            <ShieldAlert className="w-4 h-4 shrink-0" />
          ) : (
            <ShieldCheck className="w-4 h-4 shrink-0" />
          )}
          <span>{certWarningConfig.text}</span>
        </div>
      </div>

      {/* Sync trigger */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={onSync}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-slate-600 dark:text-slate-400 hover:text-blue-500 rounded-xl text-[10px] font-bold transition-all cursor-pointer bg-slate-50/20"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{t.action}</span>
        </button>
      </div>
    </div>
  );
}
