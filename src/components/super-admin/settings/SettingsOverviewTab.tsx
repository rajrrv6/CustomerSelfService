'use client';

import React, { useState } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { translations } from '@/i18n/translations';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { OperationalCard } from '@/components/shared/OperationalCard';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { useFeedbackToasts } from '@/components/customer-portal/feedback/PostChatToasts';
import { useApp } from '@/context/AppContext';
import {
  Globe,
  Palette,
  Sliders,
  ToggleRight,
  ShieldCheck,
  Zap,
  ArrowRight,
  Save,
  Monitor,
  CheckCircle,
  Activity,
  Server,
  Lock,
  Cpu
} from 'lucide-react';

interface SettingsCategory {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
}

export function SettingsOverviewTab() {
  const lang = useUIStore((s) => s.lang);
  const t = translations[lang];
  const isRtl = lang === 'ar';
  const ns = t.superAdmin.settings;
  const { addAuditLog } = useApp();
  const { pushToast } = useFeedbackToasts();

  const [activeModalId, setActiveModalId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Saved/Persisted States
  const [prefTheme, setPrefTheme] = useState('system');
  const [prefDashboard, setPrefDashboard] = useState('sa_dashboard');
  
  const [timeZone, setTimeZone] = useState('Asia/Riyadh');
  const [allowArRtl, setAllowArRtl] = useState(true);
  
  const [primaryHue, setPrimaryHue] = useState(220); // HSL Primary Hue
  const [customCss, setCustomCss] = useState('/* Custom layout CSS overrides */\n.sa-container {\n  border-radius: 12px;\n}');
  
  const [toggles, setToggles] = useState({
    copilot: true,
    siemForwarding: true,
    autoDunning: false,
    diagnosticsPing: true,
  });

  const [securityRegion, setSecurityRegion] = useState('ksa_east');
  const [sessionTimeout, setSessionTimeout] = useState(30); // minutes
  const [enforceMfa, setEnforceMfa] = useState(true);

  const [limits, setLimits] = useState({
    gemini: 450,
    claude: 300,
    llama: 600,
  });

  // 2. Draft/Temporary States for editing inside Modals (discarded on cancel)
  const [draftTheme, setDraftTheme] = useState(prefTheme);
  const [draftDashboard, setDraftDashboard] = useState(prefDashboard);
  const [draftTimeZone, setDraftTimeZone] = useState(timeZone);
  const [draftAllowArRtl, setDraftAllowArRtl] = useState(allowArRtl);
  const [draftPrimaryHue, setDraftPrimaryHue] = useState(primaryHue);
  const [draftCustomCss, setDraftCustomCss] = useState(customCss);
  const [draftToggles, setDraftToggles] = useState({ ...toggles });
  const [draftSecurityRegion, setDraftSecurityRegion] = useState(securityRegion);
  const [draftSessionTimeout, setDraftSessionTimeout] = useState(sessionTimeout);
  const [draftEnforceMfa, setDraftEnforceMfa] = useState(enforceMfa);
  const [draftLimits, setDraftLimits] = useState({ ...limits });

  // Open Modal and initialize Draft States
  const handleOpenModal = (id: string) => {
    if (id === 'localization') {
      setDraftTimeZone(timeZone);
      setDraftAllowArRtl(allowArRtl);
    } else if (id === 'branding') {
      setDraftPrimaryHue(primaryHue);
      setDraftCustomCss(customCss);
    } else if (id === 'preferences') {
      setDraftTheme(prefTheme);
      setDraftDashboard(prefDashboard);
    } else if (id === 'feature_toggles') {
      setDraftToggles({ ...toggles });
    } else if (id === 'security') {
      setDraftSecurityRegion(securityRegion);
      setDraftSessionTimeout(sessionTimeout);
      setDraftEnforceMfa(enforceMfa);
    } else if (id === 'api_limits') {
      setDraftLimits({ ...limits });
    }
    setActiveModalId(id);
  };

  // Commit Draft -> Saved on optimistic save
  const handleSaveSettings = (id: string) => {
    setIsSaving(true);
    
    // Simulate compilation delay
    setTimeout(() => {
      setIsSaving(false);
      
      if (id === 'localization') {
        setTimeZone(draftTimeZone);
        setAllowArRtl(draftAllowArRtl);
      } else if (id === 'branding') {
        setPrimaryHue(draftPrimaryHue);
        setCustomCss(draftCustomCss);
      } else if (id === 'preferences') {
        setPrefTheme(draftTheme);
        setPrefDashboard(draftDashboard);
      } else if (id === 'feature_toggles') {
        setToggles({ ...draftToggles });
      } else if (id === 'security') {
        setSecurityRegion(draftSecurityRegion);
        setSessionTimeout(draftSessionTimeout);
        setEnforceMfa(draftEnforceMfa);
      } else if (id === 'api_limits') {
        setLimits({ ...draftLimits });
      }
      
      setActiveModalId(null);
      pushToast(
        'success',
        isRtl ? 'تم حفظ التكوين بنجاح' : 'Configuration Applied Successfully',
        isRtl 
          ? `تم تحديث ونشر خيارات إعدادات "${id}" وتطبيقها على المستأجرين.` 
          : `Successfully updated and applied "${id}" settings configuration.`
      );
      addAuditLog(`Applied global settings override: ${id}`, 'success');
    }, 900);
  };

  const handleToggleDraftState = (key: keyof typeof toggles) => {
    setDraftToggles(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Dynamic Settings Descriptions for Cards
  const getCardDescription = (id: string) => {
    switch (id) {
      case 'localization':
        return isRtl 
          ? `المنطقة الزمنية النشطة: ${timeZone} | اتجاه RTL التلقائي: ${allowArRtl ? 'مفعّل' : 'معطّل'}`
          : `Active Timezone: ${timeZone} | Auto-RTL support: ${allowArRtl ? 'Enabled' : 'Disabled'}`;
      case 'branding':
        return isRtl
          ? `لون المظهر الأساسي: HSL ${primaryHue}° | تخصيص CSS مفعّل`
          : `Theme HSL Hue: ${primaryHue}° | Layout CSS style overrides applied`;
      case 'preferences':
        return isRtl
          ? `المظهر الافتراضي: ${prefTheme.toUpperCase()} | واجهة الهبوط: ${prefDashboard === 'sa_dashboard' ? 'لوحة القيادة' : 'المستأجرين'}`
          : `UI Mode: ${prefTheme.toUpperCase()} | Primary Workspace: ${prefDashboard === 'sa_dashboard' ? 'Dashboard Overview' : 'Tenant Registry'}`;
      case 'feature_toggles':
        const activeCount = Object.values(toggles).filter(Boolean).length;
        return isRtl
          ? `الخدمات النشطة: ${activeCount} من 4 ميزات | بوابة المساعد الذكي مفعّلة`
          : `Active Gates: ${activeCount} of 4 features (AI Co-pilot & SIEM forwarders online)`;
      case 'security':
        return isRtl
          ? `تخزين البيانات: ${securityRegion.replace('_', ' ').toUpperCase()} | المهلة: ${sessionTimeout} دقيقة | فرض تحقق ثنائي: نعم`
          : `Residency Cluster: ${securityRegion.replace('_', ' ').toUpperCase()} | Session Timeout: ${sessionTimeout}m | MFA: Enforced`;
      case 'api_limits':
        return isRtl
          ? `الحدود القصوى: Gemini [${limits.gemini} RPS] | Claude [${limits.claude} RPS] | Llama [${limits.llama} RPS]`
          : `Concurrent bounds: Gemini [${limits.gemini} RPS] | Claude [${limits.claude} RPS] | Llama [${limits.llama} RPS]`;
      default:
        return '';
    }
  };

  const categories: SettingsCategory[] = [
    {
      id: 'localization',
      icon: <Globe className="w-5 h-5" />,
      iconBg: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      title: ns.localizationTitle,
    },
    {
      id: 'branding',
      icon: <Palette className="w-5 h-5" />,
      iconBg: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      title: ns.brandingTitle,
    },
    {
      id: 'preferences',
      icon: <Sliders className="w-5 h-5" />,
      iconBg: 'bg-slate-50 dark:bg-slate-800/60',
      iconColor: 'text-slate-600 dark:text-slate-400',
      title: ns.preferencesTitle,
    },
    {
      id: 'feature_toggles',
      icon: <ToggleRight className="w-5 h-5" />,
      iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      title: ns.featureTogglesTitle,
    },
    {
      id: 'security',
      icon: <ShieldCheck className="w-5 h-5" />,
      iconBg: 'bg-amber-50 dark:bg-amber-900/20',
      iconColor: 'text-amber-600 dark:text-amber-400',
      title: ns.securityTitle,
    },
    {
      id: 'api_limits',
      icon: <Zap className="w-5 h-5" />,
      iconBg: 'bg-rose-50 dark:bg-rose-900/20',
      iconColor: 'text-rose-600 dark:text-rose-400',
      title: ns.apiLimitsTitle,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <SectionHeader
        title={ns.title}
        description={ns.description}
      />

      {/* Settings Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => handleOpenModal(cat.id)}
            className="cursor-pointer group select-none"
          >
            <OperationalCard hoverEffect>
              <div className="flex flex-col h-full space-y-3">
                {/* Icon + Title */}
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${cat.iconBg} ${cat.iconColor} flex items-center justify-center shrink-0`}>
                    {cat.icon}
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {cat.title}
                  </h3>
                </div>

                {/* Dynamic Summary Description */}
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed flex-1 font-semibold">
                  {getCardDescription(cat.id)}
                </p>

                {/* Configure Action */}
                <div className={`flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <span>{ns.configureCta}</span>
                  <ArrowRight className={`w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform ${isRtl ? 'rotate-180 group-hover:-translate-x-0.5' : ''}`} />
                </div>
              </div>
            </OperationalCard>
          </div>
        ))}
      </div>

      {/* 1. Localization Modal Configuration */}
      {activeModalId === 'localization' && (
        <ModalWrapper
          isOpen={activeModalId === 'localization'}
          onClose={() => setActiveModalId(null)}
          title={ns.localizationTitle}
        >
          <div className="space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 font-mono">
                {isRtl ? 'المنطقة الزمنية الافتراضية للمنصة' : 'Default System Timezone'}
              </label>
              <select
                value={draftTimeZone}
                onChange={(e) => setDraftTimeZone(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-850 rounded-xl bg-transparent focus:outline-none focus:border-blue-500 font-bold"
              >
                <option value="Asia/Riyadh">{isRtl ? 'آسيا / الرياض (AST)' : 'Asia/Riyadh (AST)'}</option>
                <option value="Asia/Dubai">{isRtl ? 'آسيا / دبي (GST)' : 'Asia/Dubai (GST)'}</option>
                <option value="UTC">{isRtl ? 'التوقيت العالمي الموحد (UTC)' : 'Coordinated Universal Time (UTC)'}</option>
              </select>
            </div>

            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-xl">
              <div>
                <span className="font-bold block">{isRtl ? 'دعم المرآة لـ RTL' : 'Auto RTL Mirroring Support'}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{isRtl ? 'تمكين عكس الاتجاه للغة العربية تلقائياً.' : 'Automatically mirrors grids and menus when English changes to Arabic.'}</span>
              </div>
              <input
                type="checkbox"
                checked={draftAllowArRtl}
                onChange={(e) => setDraftAllowArRtl(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveModalId(null)}
                className="px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-850 rounded-xl transition-colors cursor-pointer"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => handleSaveSettings('localization')}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {isSaving ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>{isRtl ? 'حفظ التغييرات' : 'Save Config'}</span>
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* 2. Branding Modal Configuration */}
      {activeModalId === 'branding' && (
        <ModalWrapper
          isOpen={activeModalId === 'branding'}
          onClose={() => setActiveModalId(null)}
          title={ns.brandingTitle}
        >
          <div className="space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono">
                  {isRtl ? 'تدرج لون الماركة الأساسي (HSL Primary Hue)' : 'Brand Primary Color (HSL Hue)'}
                </label>
                <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{draftPrimaryHue}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={draftPrimaryHue}
                onChange={(e) => setDraftPrimaryHue(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:bg-slate-800"
              />
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] text-slate-400">{isRtl ? 'معاينة اللون:' : 'Live Preview:'}</span>
                <span
                  className="w-5 h-5 rounded border border-slate-250 dark:border-slate-850 inline-block"
                  style={{ backgroundColor: `hsl(${draftPrimaryHue}, 70%, 50%)` }}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 font-mono">
                {isRtl ? 'تخصيص ملفات التنسيق CSS التراكمي' : 'Global CSS Style Overrides'} (ID 130)
              </label>
              <textarea
                value={draftCustomCss}
                onChange={(e) => setDraftCustomCss(e.target.value)}
                rows={4}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-850 rounded-xl bg-slate-950 font-mono text-[10px] text-emerald-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveModalId(null)}
                className="px-4 py-2 text-slate-500 rounded-xl transition-colors cursor-pointer"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => handleSaveSettings('branding')}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {isSaving ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>{isRtl ? 'تطبيق CSS' : 'Apply CSS'}</span>
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* 3. Preferences Configuration */}
      {activeModalId === 'preferences' && (
        <ModalWrapper
          isOpen={activeModalId === 'preferences'}
          onClose={() => setActiveModalId(null)}
          title={ns.preferencesTitle}
        >
          <div className="space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 font-mono">
                {isRtl ? 'سمة المظهر الافتراضي للمنصة' : 'Default UI Theme Mode'}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['light', 'dark', 'system'].map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => setDraftTheme(theme)}
                    className={`p-3 border rounded-xl flex flex-col items-center justify-center gap-1.5 font-bold cursor-pointer transition-all ${
                      draftTheme === theme
                        ? 'border-blue-500 bg-blue-50/20 text-blue-600 border-solid'
                        : 'border-slate-200 hover:border-slate-350 dark:border-slate-800'
                    }`}
                  >
                    <Monitor className="w-4 h-4 text-slate-450" />
                    <span className="capitalize text-[10px]">{theme}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 font-mono">
                {isRtl ? 'لوحة الهبوط الافتراضية' : 'Default Entry Workspace'}
              </label>
              <select
                value={draftDashboard}
                onChange={(e) => setDraftDashboard(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-850 rounded-xl bg-transparent focus:outline-none focus:border-blue-500 font-bold"
              >
                <option value="sa_dashboard">{isRtl ? 'لوحة القيادة العامة للرئيسي' : 'Global Dashboard Overview'}</option>
                <option value="sa_tenant_management">{isRtl ? 'إدارة المستأجرين والتراخيص' : 'Tenant Management Suite'}</option>
                <option value="sa_system_ops">{isRtl ? 'العمليات ونظم المراقبة' : 'System Operations'}</option>
              </select>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveModalId(null)}
                className="px-4 py-2 text-slate-505 rounded-xl transition-colors cursor-pointer"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => handleSaveSettings('preferences')}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {isSaving ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>{isRtl ? 'حفظ الخيارات' : 'Save Preferences'}</span>
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* 4. Feature Toggles Modal */}
      {activeModalId === 'feature_toggles' && (
        <ModalWrapper
          isOpen={activeModalId === 'feature_toggles'}
          onClose={() => setActiveModalId(null)}
          title={ns.featureTogglesTitle}
        >
          <div className="space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
              {isRtl ? 'مصفوفة التحكم بالميزات العامة للمنصة' : 'Global System Flags Matrix'}
            </span>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-xl">
                <div>
                  <span className="font-bold block">{isRtl ? 'بوابة الذكاء الاصطناعي التفاعلي Co-pilot' : 'AI Co-pilot Chat Gateway'}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{isRtl ? 'تمكين مساعد الرد الذكي لفرق الدعم والعملاء.' : 'Enables AI copilot sidebar for agent workflows.'}</span>
                </div>
                <input
                  type="checkbox"
                  checked={draftToggles.copilot}
                  onChange={() => handleToggleDraftState('copilot')}
                  className="w-4 h-4 text-blue-600 cursor-pointer rounded"
                />
              </div>

              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-xl">
                <div>
                  <span className="font-bold block">{isRtl ? 'قنوات ترحيل سجلات SIEM للتدقيق' : 'SIEM Syslog Forwarder (Splunk)'}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{isRtl ? 'تمكين التوجيه التلقائي للمصادقة للمدراء.' : 'Automatically sync audit trail entries to Splunk indexers.'}</span>
                </div>
                <input
                  type="checkbox"
                  checked={draftToggles.siemForwarding}
                  onChange={() => handleToggleDraftState('siemForwarding')}
                  className="w-4 h-4 text-blue-600 cursor-pointer rounded"
                />
              </div>

              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-xl">
                <div>
                  <span className="font-bold block">{isRtl ? 'سياسات الفوترة التلقائية والمطالبة Dunning' : 'Automated Dunning Policies'}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{isRtl ? 'إرسال تنبيهات بريدية آلياً عند الفشل.' : 'Executes automated warning mail for past-due balances.'}</span>
                </div>
                <input
                  type="checkbox"
                  checked={draftToggles.autoDunning}
                  onChange={() => handleToggleDraftState('autoDunning')}
                  className="w-4 h-4 text-blue-600 cursor-pointer rounded"
                />
              </div>

              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-xl">
                <div>
                  <span className="font-bold block">{isRtl ? 'اختبار خادم الصوت التلقائي Option Ping' : 'Speech Engine Option Ping Probes'}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{isRtl ? 'تشغيل حزم الفحص المستمر تلقائياً.' : 'Periodically pings ASR/TTS gateways to monitor packet loss.'}</span>
                </div>
                <input
                  type="checkbox"
                  checked={draftToggles.diagnosticsPing}
                  onChange={() => handleToggleDraftState('diagnosticsPing')}
                  className="w-4 h-4 text-blue-600 cursor-pointer rounded"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveModalId(null)}
                className="px-4 py-2 text-slate-505 rounded-xl cursor-pointer"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => handleSaveSettings('feature_toggles')}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {isSaving ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>{isRtl ? 'حفظ الأعلام' : 'Save Feature Matrix'}</span>
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* 5. Security & Region Pinning Configuration */}
      {activeModalId === 'security' && (
        <ModalWrapper
          isOpen={activeModalId === 'security'}
          onClose={() => setActiveModalId(null)}
          title={ns.securityTitle}
        >
          <div className="space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 font-mono">
                {isRtl ? 'نطاق استضافة وتخزين البيانات السيادية' : 'Data Residency Sovereign Cluster'} (ID 168)
              </label>
              <select
                value={draftSecurityRegion}
                onChange={(e) => setDraftSecurityRegion(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-850 rounded-xl bg-transparent focus:outline-none focus:border-blue-500 font-bold"
              >
                <option value="ksa_east">{isRtl ? 'سحابة شرق المملكة العربية السعودية (المفضلة)' : 'Sovereign Saudi East Cloud (Primary)'}</option>
                <option value="ksa_west">{isRtl ? 'سحابة غرب المملكة العربية السعودية' : 'Sovereign Saudi West Cloud'}</option>
                <option value="eu_central">{isRtl ? 'منطقة الاتحاد الأوروبي المركزي' : 'EU Central Region (Non-Sovereign backup)'}</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono">
                  {isRtl ? 'المهلة الزمنية لإغلاق جلسات المشرفين' : 'Admin Session Expiration Limit'}
                </label>
                <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{draftSessionTimeout} {isRtl ? 'دقيقة' : 'mins'}</span>
              </div>
              <input
                type="range"
                min="15"
                max="120"
                step="15"
                value={draftSessionTimeout}
                onChange={(e) => setDraftSessionTimeout(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:bg-slate-800"
              />
            </div>

            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-xl">
              <div>
                <span className="font-bold block">{isRtl ? 'فرض التحقق الثنائي MFA للمدراء' : 'Enforce Admin MFA Policy'}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{isRtl ? 'منع الوصول لغير المسجلين بالتحقق الثنائي.' : 'Blocks access if login lacks hardware token/TOTP code verification.'}</span>
              </div>
              <input
                type="checkbox"
                checked={draftEnforceMfa}
                onChange={(e) => setDraftEnforceMfa(e.target.checked)}
                className="w-4 h-4 text-blue-600 cursor-pointer rounded"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveModalId(null)}
                className="px-4 py-2 text-slate-505 rounded-xl cursor-pointer"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => handleSaveSettings('security')}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {isSaving ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>{isRtl ? 'حفظ السياسة' : 'Save Security'}</span>
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* 6. API Limits configuration */}
      {activeModalId === 'api_limits' && (
        <ModalWrapper
          isOpen={activeModalId === 'api_limits'}
          onClose={() => setActiveModalId(null)}
          title={ns.apiLimitsTitle}
        >
          <div className="space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
              {isRtl ? 'حدود الطلبات المتزامنة للنماذج (Req/sec)' : 'Model Rate-Limit Boundaries'} (ID 328)
            </span>

            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold block">Gemini 1.5 Pro</span>
                  <span className="font-mono text-xs text-blue-600">{draftLimits.gemini} RPS</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="50"
                  value={draftLimits.gemini}
                  onChange={(e) => setDraftLimits(prev => ({ ...prev, gemini: parseInt(e.target.value) }))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:bg-slate-800"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold block">Claude 3.5 Sonnet</span>
                  <span className="font-mono text-xs text-blue-600">{draftLimits.claude} RPS</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="50"
                  value={draftLimits.claude}
                  onChange={(e) => setDraftLimits(prev => ({ ...prev, claude: parseInt(e.target.value) }))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:bg-slate-800"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold block">Llama 3 70B</span>
                  <span className="font-mono text-xs text-blue-600">{draftLimits.llama} RPS</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="50"
                  value={draftLimits.llama}
                  onChange={(e) => setDraftLimits(prev => ({ ...prev, llama: parseInt(e.target.value) }))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveModalId(null)}
                className="px-4 py-2 text-slate-505 rounded-xl cursor-pointer"
              >
                {isRtl ? 'إغلاق' : 'Close'}
              </button>
              <button
                type="button"
                onClick={() => handleSaveSettings('api_limits')}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {isSaving ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>{isRtl ? 'حفظ الحدود' : 'Update Boundaries'}</span>
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
}
