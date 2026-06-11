import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { MOCK_SSO_PROVIDERS } from './constants';
import { SsoProvider } from './types';
import { FederationHealthCard } from './FederationHealthCard';
import { KeyRound, ShieldAlert, CheckCircle, RefreshCw, AlertTriangle } from 'lucide-react';

export function SsoStatusPanel() {
  const { lang, addAuditLog } = useApp();
  const [providers, setProviders] = useState<SsoProvider[]>(MOCK_SSO_PROVIDERS);
  const [syncingProviderName, setSyncingProviderName] = useState<string | null>(null);
  const [confirmingProviderName, setConfirmingProviderName] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleTriggerSync = (name: string) => {
    setConfirmingProviderName(null);
    setSyncingProviderName(name);

    addAuditLog(`SSO synchronization check initiated manually for ${name}`);

    // Simulate connection ping
    setTimeout(() => {
      setSyncingProviderName(null);
      setProviders(prev =>
        prev.map(prov => {
          if (prov.name === name) {
            return {
              ...prov,
              lastSync: new Date().toISOString(),
              latencyMs: Math.floor(Math.random() * 50) + 30,
            };
          }
          return prov;
        })
      );
      addAuditLog(`SSO connection check succeeded for ${name}`, 'success');
      setToastMessage(`SSO sync check successfully completed for ${name}`);
      setTimeout(() => setToastMessage(null), 4000);
    }, 1500);
  };

  const t = {
    en: {
      title: 'Federation Status & SSO Governance',
      desc: 'Verify connection latency, directory synchronization records, and security certificate validation statuses.',
      syncConfirmTitle: 'Initiate Directory Sync?',
      syncConfirmDesc: 'This triggers a live LDAP/SAML check. It will refresh user attributes across all Active Directory nodes.',
      cancel: 'Cancel',
      confirm: 'Sync Directory',
      syncing: 'Syncing Connection...',
    },
    ar: {
      title: 'حالة الاتحاد وحوكمة SSO',
      desc: 'التحقق من زمن استجابة الاتصال، وسجلات مزامنة الدليل، وحالة التحقق من صحة شهادة الأمان.',
      syncConfirmTitle: 'هل تريد بدء مزامنة الدليل؟',
      syncConfirmDesc: 'سيؤدي هذا إلى بدء فحص LDAP/SAML المباشر. وسيقوم بتحديث سمات المستخدم عبر جميع العقد النشطة.',
      cancel: 'إلغاء',
      confirm: 'مزامنة الدليل',
      syncing: 'جاري المزامنة...',
    },
  }[lang] || {
    title: 'Federation Status & SSO Governance',
    desc: 'Verify connection latency, directory synchronization records, and security certificate validation statuses.',
    syncConfirmTitle: 'Initiate Directory Sync?',
    syncConfirmDesc: 'This triggers a live LDAP/SAML check. It will refresh user attributes across all Active Directory nodes.',
    cancel: 'Cancel',
    confirm: 'Sync Directory',
    syncing: 'Syncing Connection...',
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div>
        <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight flex items-center gap-2">
          <KeyRound className="w-4.5 h-4.5 text-blue-500" />
          {t.title}
        </h3>
        <p className="text-[10px] text-slate-450 dark:text-slate-400 font-semibold block mt-0.5">
          {t.desc}
        </p>
      </div>

      {/* Health Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {providers.map(prov => (
          <FederationHealthCard
            key={prov.name}
            provider={prov}
            onSync={() => setConfirmingProviderName(prov.name)}
            lang={lang}
          />
        ))}
      </div>

      {/* Sync Confirmation dialog Overlay */}
      {confirmingProviderName && (
        <div className="fixed inset-0 bg-slate-950/40 dark:bg-slate-950/65 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl max-w-sm w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  {t.syncConfirmTitle}
                </h4>
                <p className="text-[10px] text-slate-450 dark:text-slate-400 font-semibold leading-relaxed">
                  {t.syncConfirmDesc}
                </p>
                <span className="block text-[9px] font-bold text-blue-500 font-mono mt-1">
                  Target: {confirmingProviderName}
                </span>
              </div>
            </div>

            <div className="flex gap-2 justify-end text-xs font-bold pt-2 border-t border-slate-100 dark:border-slate-850">
              <button
                type="button"
                onClick={() => setConfirmingProviderName(null)}
                className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950 transition-all cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={() => handleTriggerSync(confirmingProviderName)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer"
              >
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Syncing State Overlay */}
      {syncingProviderName && (
        <div className="fixed inset-0 bg-slate-950/20 dark:bg-slate-950/45 backdrop-blur-xs z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-2xl border-blue-500/20 font-bold text-xs text-slate-850 dark:text-white">
            <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
            <span>{t.syncing}</span>
          </div>
        </div>
      )}

      {/* Success toast */}
      {toastMessage && (
        <div className="fixed bottom-24 right-6 z-50 bg-emerald-650 text-white font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-500 animate-bounce text-xs font-mono">
          <CheckCircle className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
