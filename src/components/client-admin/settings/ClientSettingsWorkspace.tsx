'use client';

import React, { useState, useEffect } from 'react';
import { 
  Save, Paintbrush, Globe, Clock, ShieldCheck, Check, Loader2, RefreshCw, AlertTriangle, X 
} from 'lucide-react';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { OperationalCard } from '@/components/shared/OperationalCard';
import { Badge } from '@/components/shared/BadgeSystem';
import { useClientAdminStore, TenantSettings } from '@/stores/clientAdminPersistenceStore';
import { useNotificationsStore } from '@/stores/notificationsStore';
import { translations } from '@/i18n/translations';

export function ClientSettingsWorkspace() {
  const storeSettings = useClientAdminStore((state) => state.settings);
  const updateSettings = useClientAdminStore((state) => state.updateSettings);
  const resetSettings = useClientAdminStore((state) => state.resetSettings);
  const lang = storeSettings.defaultLang;

  const isAr = lang === 'ar';
  const t = translations[lang];

  // Hydration safety check
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Local form states copy for dirty check logic
  const [localSettings, setLocalSettings] = useState<TenantSettings>(storeSettings);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  useEffect(() => {
    if (isMounted) {
      setLocalSettings(storeSettings);
    }
  }, [storeSettings, isMounted]);

  // Accent color variables live update
  useEffect(() => {
    if (isMounted && storeSettings.accentColor) {
      document.documentElement.style.setProperty('--primary-accent', storeSettings.accentColor);
    }
  }, [storeSettings.accentColor, isMounted]);

  const isDirty = isMounted && JSON.stringify(localSettings) !== JSON.stringify(storeSettings);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    useNotificationsStore.getState().addAuditLog('Started saving tenant configuration updates', 'success');

    setTimeout(() => {
      updateSettings(localSettings);
      setSaving(false);
      const timestamp = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSaved(timestamp);
      
      useNotificationsStore.getState().addAlert({
        category: 'operations',
        source: 'guardrails',
        severity: 'success',
        alertCode: 'SETTINGS_SAVED',
        sourceEntity: 'Settings Manager',
        title: isAr ? 'تم حفظ الإعدادات بنجاح' : 'Settings Saved Successfully',
        message: isAr 
          ? 'تم حفظ تكوينات العلامة التجارية وحدود الخدمة بنجاح.' 
          : 'Tenant visual configurations and SLA wait timers saved.',
        metadata: { savedAt: timestamp }
      });

      useNotificationsStore.getState().addAuditLog(`Tenant branding & settings updated: "${localSettings.tenantName}"`, 'success');
    }, 1200);
  };

  const handleResetClick = () => {
    if (isDirty) {
      setShowDiscardModal(true);
    } else {
      resetSettings();
    }
  };

  const handleConfirmDiscard = () => {
    resetSettings();
    setShowDiscardModal(false);
  };

  if (!isMounted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500 animate-pulse">
        <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-3" />
        <span className="text-xs font-semibold uppercase">Loading Settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-xs font-semibold text-slate-800 dark:text-slate-200" dir={isAr ? 'rtl' : 'ltr'}>
      <form onSubmit={handleSave} className="space-y-6">
        <SectionHeader
          title={isAr ? 'إعدادات المشرف والعميل' : 'Tenant Settings'}
          description={isAr ? 'تحديث الهوية البصرية للعميل، وتعديل حدود اتفاقية الخدمة SLA، وتفعيل خصائص المنصة.' : 'Update tenant branding logo, customize SLA waiting thresholds, and configure system parameters.'}
          action={
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleResetClick}
                className="flex items-center gap-1 px-3.5 py-2 border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-xs font-bold transition-all text-slate-655 dark:text-slate-455 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isAr ? 'إعادة ضبط' : 'Reset'}</span>
              </button>
              <button
                type="submit"
                disabled={saving || !isDirty}
                className="flex items-center gap-1.5 px-4.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-500/10 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{isAr ? 'جاري الحفظ...' : 'Saving...'}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>{isAr ? 'حفظ التغييرات' : 'Save Settings'}</span>
                  </>
                )}
              </button>
            </div>
          }
        />

        {/* Dirty State Warning Banner */}
        {isDirty && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
              <span>
                {t.clientAdmin.persistence.settings.unsavedChangesExist}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section 1: Branding & Visuals */}
          <OperationalCard className="p-5 space-y-4">
            <div>
              <h3 className="text-xs font-black uppercase text-slate-850 dark:text-white flex items-center gap-1.5 font-sans">
                <Paintbrush className="w-4 h-4 text-blue-500" />
                <span>{isAr ? 'الهوية البصرية والعلامة التجارية' : 'Branding & Theme Customization'}</span>
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block font-normal">
                {isAr ? 'تعديل شعار الشركة، والألوان البصرية لمنصة الخدمة الذاتية الخاصة بك.' : 'Personalize the visual identity, colors, and logos displayed on your self-service portal.'}
              </p>
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">{isAr ? 'اسم العلامة التجارية:' : 'Tenant Brand Name:'}</label>
                <input
                  type="text"
                  value={localSettings.tenantName}
                  onChange={(e) => setLocalSettings({ ...localSettings, tenantName: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-805 dark:text-slate-205 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">{isAr ? 'رابط ملف الشعار LOGO (URL):' : 'Branding Logo URL:'}</label>
                <input
                  type="text"
                  value={localSettings.logoUrl}
                  onChange={(e) => setLocalSettings({ ...localSettings, logoUrl: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-655 dark:text-slate-405 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500">{isAr ? 'مظهر واجهة المشرف:' : 'Branding UI Theme:'}</label>
                  <select
                    value={localSettings.themeMode}
                    onChange={(e) => setLocalSettings({ ...localSettings, themeMode: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="system">Match System</option>
                    <option value="dark">Force Dark</option>
                    <option value="light">Force Light</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500">{isAr ? 'لون اللمسات الأساسية HSL:' : 'Primary Accent Color:'}</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={localSettings.accentColor}
                      onChange={(e) => setLocalSettings({ ...localSettings, accentColor: e.target.value })}
                      className="w-10 h-10 border border-slate-250 dark:border-slate-800 rounded-xl cursor-pointer p-0 overflow-hidden"
                    />
                    <input
                      type="text"
                      value={localSettings.accentColor}
                      onChange={(e) => setLocalSettings({ ...localSettings, accentColor: e.target.value })}
                      className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-700 dark:text-slate-350 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </OperationalCard>

          {/* Section 2: SLA Configuration */}
          <OperationalCard className="p-5 space-y-4">
            <div>
              <h3 className="text-xs font-black uppercase text-slate-850 dark:text-white flex items-center gap-1.5 font-sans">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>{isAr ? 'حدود اتفاقية الخدمة SLA والتوقيت' : 'SLA Performance Boundaries'}</span>
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block font-normal">
                {isAr ? 'تعديل الفترات الزمنية المسموح بها للعميل قبل إطلاق تحذيرات تأخر الاستجابة والتصعيد.' : 'Configure chat waiting timeouts, priority queues alarms, and SLA warnings trigger delay.'}
              </p>
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                  <span>{isAr ? 'زمن انتظار العملاء القياسي (ثواني):' : 'Standard Client Queue Timeout:'}</span>
                  <span className="font-mono text-slate-850 dark:text-white">{localSettings.standardWait}s</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="300"
                  step="10"
                  value={localSettings.standardWait}
                  onChange={(e) => setLocalSettings({ ...localSettings, standardWait: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-850 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                  <span>{isAr ? 'زمن انتظار كبار الشخصيات VIP (ثواني):' : 'VIP Client Queue Timeout:'}</span>
                  <span className="font-mono text-slate-850 dark:text-white">{localSettings.vipWait}s</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="120"
                  step="5"
                  value={localSettings.vipWait}
                  onChange={(e) => setLocalSettings({ ...localSettings, vipWait: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-850 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                  <span>{isAr ? 'حد التنبيه المبكر (ثواني):' : 'Warning Timer Trigger threshold:'}</span>
                  <span className="font-mono text-slate-850 dark:text-white">{localSettings.warnTimeout}s before breach</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={localSettings.warnTimeout}
                  onChange={(e) => setLocalSettings({ ...localSettings, warnTimeout: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-850 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>
          </OperationalCard>

          {/* Section 3: Feature Toggles */}
          <OperationalCard className="p-5 space-y-4">
            <div>
              <h3 className="text-xs font-black uppercase text-slate-850 dark:text-white flex items-center gap-1.5 font-sans">
                <ShieldCheck className="w-4 h-4 text-blue-500" />
                <span>{isAr ? 'تنشيط خصائص ومميزات المنصة' : 'Active System Feature Switches'}</span>
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block font-normal">
                {isAr ? 'تفعيل أو تعطيل خيارات الاحتواء الآلي ومزامنة الويب ومصادقات الدعم.' : 'Toggle AI-driven features, vector lookup, retry configurations, and API telemetry logging.'}
              </p>
            </div>

            <div className="space-y-3.5">
              <div className="flex justify-between items-center py-1">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-850 dark:text-slate-100">{isAr ? 'احتواء المحادثات بالذكاء الاصطناعي' : 'AI Intent Deflection'}</h4>
                  <span className="text-[9px] font-semibold text-slate-400 block mt-0.5 font-normal">Let AI resolve simple tickets automatically.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={localSettings.aiDeflection}
                    onChange={(e) => setLocalSettings({ ...localSettings, aiDeflection: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4.5 bg-slate-800 rounded-full peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-blue-600" />
                  <div className={`absolute top-[2px] start-[2px] rounded-full h-3.5 w-3.5 transition-all bg-white border border-slate-300 ${
                    localSettings.aiDeflection ? 'translate-x-3.5 rtl:-translate-x-3.5' : ''
                  }`} />
                </label>
              </div>

              <div className="flex justify-between items-center py-1 border-t border-slate-100 dark:border-slate-850/80 pt-3">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-850 dark:text-slate-100">{isAr ? 'مزامنة البحث الذكي RAG' : 'Vector RAG Policy Search'}</h4>
                  <span className="text-[9px] font-semibold text-slate-400 block mt-0.5 font-normal">Search documents inside KB matching queries.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={localSettings.ragSearch}
                    onChange={(e) => setLocalSettings({ ...localSettings, ragSearch: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4.5 bg-slate-800 rounded-full peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-blue-600" />
                  <div className={`absolute top-[2px] start-[2px] rounded-full h-3.5 w-3.5 transition-all bg-white border border-slate-300 ${
                    localSettings.ragSearch ? 'translate-x-3.5 rtl:-translate-x-3.5' : ''
                  }`} />
                </label>
              </div>

              <div className="flex justify-between items-center py-1 border-t border-slate-100 dark:border-slate-850/80 pt-3">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-850 dark:text-slate-100">{isAr ? 'إعادة محاولة الاتصال بالشبكات' : 'High Reliability API Retry'}</h4>
                  <span className="text-[9px] font-semibold text-slate-400 block mt-0.5 font-normal">Auto-retry failed rest calls dynamically.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={localSettings.autoRetry}
                    onChange={(e) => setLocalSettings({ ...localSettings, autoRetry: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4.5 bg-slate-800 rounded-full peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-blue-600" />
                  <div className={`absolute top-[2px] start-[2px] rounded-full h-3.5 w-3.5 transition-all bg-white border border-slate-300 ${
                    localSettings.autoRetry ? 'translate-x-3.5 rtl:-translate-x-3.5' : ''
                  }`} />
                </label>
              </div>

              <div className="flex justify-between items-center py-1 border-t border-slate-100 dark:border-slate-850/80 pt-3">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-850 dark:text-slate-100">{isAr ? 'تفصيل سجلات الويب للتحليل' : 'Webhook Payload Audits'}</h4>
                  <span className="text-[9px] font-semibold text-slate-400 block mt-0.5 font-normal">Logs full payload metadata inside audit logs.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={localSettings.webhookLog}
                    onChange={(e) => setLocalSettings({ ...localSettings, webhookLog: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4.5 bg-slate-800 rounded-full peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-blue-600" />
                  <div className={`absolute top-[2px] start-[2px] rounded-full h-3.5 w-3.5 transition-all bg-white border border-slate-300 ${
                    localSettings.webhookLog ? 'translate-x-3.5 rtl:-translate-x-3.5' : ''
                  }`} />
                </label>
              </div>
            </div>
          </OperationalCard>

          {/* Section 4: Localization & Default Settings */}
          <OperationalCard className="p-5 space-y-4">
            <div>
              <h3 className="text-xs font-black uppercase text-slate-850 dark:text-white flex items-center gap-1.5 font-sans">
                <Globe className="w-4 h-4 text-blue-500" />
                <span>{isAr ? 'اللغة والبيئة المحلية الافتراضية' : 'Localization & Default Regional Parameters'}</span>
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block font-normal">
                {isAr ? 'تعديل اللغة الافتراضية المطبقة لنظام الخدمة وبوابات العملاء.' : 'Configure default system translation languages and timezone locations.'}
              </p>
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">{isAr ? 'اللغة الافتراضية للمنصة:' : 'Default Portal Language:'}</label>
                <select
                  value={localSettings.defaultLang}
                  onChange={(e) => setLocalSettings({ ...localSettings, defaultLang: e.target.value as any })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
                >
                  <option value="en">English (US)</option>
                  <option value="ar">العربية (Saudi Arabia)</option>
                </select>
              </div>

              <div className="space-y-1 pt-1.5">
                <span className="text-[10px] font-bold text-slate-500 block">{isAr ? 'الامتثال للخصوصية المحلية:' : 'Compliance Standards:'}</span>
                <div className="flex flex-wrap gap-2.5 pt-1 text-[9.5px]">
                  <Badge type="info">Saudi NDMO Compliant</Badge>
                  <Badge type="info">GDPR Compliant</Badge>
                  <Badge type="success">PCI-DSS Level 1</Badge>
                </div>
              </div>

              {lastSaved && (
                <div className="text-[9.5px] text-slate-400 italic pt-2 font-mono">
                  {isAr ? `آخر حفظ للمتغيرات: ${lastSaved}` : `Last configuration sync committed at ${lastSaved}`}
                </div>
              )}
            </div>
          </OperationalCard>
        </div>
      </form>

      {/* Dirty-state Warning Modal dialog */}
      {showDiscardModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 text-amber-500">
                <AlertTriangle className="w-5 h-5" />
                <h4 className="font-bold text-sm text-slate-800 dark:text-white">
                  {t.clientAdmin.persistence.settings.unsavedTitle}
                </h4>
              </div>
              <button 
                onClick={() => setShowDiscardModal(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
              {t.clientAdmin.persistence.settings.discardWarning}
            </p>
            <div className="flex gap-2 justify-end text-xs font-bold">
              <button
                onClick={() => setShowDiscardModal(false)}
                className="px-3.5 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleConfirmDiscard}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl cursor-pointer"
              >
                {t.clientAdmin.persistence.settings.resetConfirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default ClientSettingsWorkspace;
