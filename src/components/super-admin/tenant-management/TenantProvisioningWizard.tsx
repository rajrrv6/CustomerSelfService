'use client';

import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { translations } from '@/i18n/translations';
import { Tenant, TenantStatus } from '@/types/tenant';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { Building, ShieldCheck, Cpu, Terminal, ArrowRight, ArrowLeft, Loader2, Sparkles } from 'lucide-react';

interface TenantProvisioningWizardProps {
  onClose: () => void;
  onSave: (newTenant: Tenant) => void;
}

export function TenantProvisioningWizard({ onClose, onSave }: TenantProvisioningWizardProps) {
  const lang = useUIStore((s) => s.lang);
  const isRtl = lang === 'ar';
  const t = translations[lang];

  const tmT = (t.superAdmin as any).tenantManagement || {
    wizard: {
      title: 'Provision New Tenant',
      step1: 'Organization Profile',
      step2: 'Resource Quotas',
      step3: 'Default Routing',
      step4: 'Review & Launch',
      fieldOrgName: 'Organization Name',
      fieldOrgDomain: 'Primary Domain',
      fieldQuotaSeats: 'Default Seats Limit',
      fieldQuotaModels: 'Allocated Model Group',
      fieldAdminEmail: 'Primary Administrator Email',
      buttonNext: 'Next Step',
      buttonBack: 'Previous',
      buttonLaunch: 'Deploy Tenant',
      deploySuccess: 'Tenant provisioned successfully.'
    }
  };

  const [step, setStep] = useState(1);
  
  // Step 1: Profile
  const [orgName, setOrgName] = useState('');
  const [orgDomain, setOrgDomain] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  // Step 2: Quotas
  const [seatsLimit, setSeatsLimit] = useState(15);
  const [selectedPlanId, setSelectedPlanId] = useState('plan-growth');

  // Step 3: Security & Custom Domain
  const [customDomain, setCustomDomain] = useState('');
  const [ipWhitelistStr, setIpWhitelistStr] = useState('');

  // Step 4: Launching Simulation
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployLogs, setDeployLogs] = useState<string[]>([]);
  const [logIndex, setLogIndex] = useState(0);

  const logs = [
    isRtl ? 'جاري التحقق من توفر النطاق المخصص...' : 'Validating primary domain availability...',
    isRtl ? 'تخصيص مساحة تخزين قاعدة بيانات المتجهات (Index Cluster)...' : 'Allocating Vector database storage (Index Cluster)...',
    isRtl ? 'إنشاء حساب مستخدم مسؤول المنصة وتعيين أذونات الوصول...' : 'Registering primary admin credentials and permissions...',
    isRtl ? 'توليد وتوقيع شهادة الأمان TLS لموقع المستأجر...' : 'Generating and signing SSL TLS certificates...',
    isRtl ? 'مزامنة القنوات الموحدة ومحركات NLU الافتراضية...' : 'Synchronizing omnichannel defaults and baseline NLU model engines...',
    isRtl ? 'تم الانتهاء بنجاح! جاري تنشيط خادم الاستدلال...' : 'Provisioning completed successfully! Activating inference router...'
  ];

  useEffect(() => {
    if (!isDeploying) return;

    if (logIndex < logs.length) {
      const timer = setTimeout(() => {
        setDeployLogs(prev => [...prev, logs[logIndex]]);
        setLogIndex(logIndex + 1);
      }, 700);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        // Complete the launch
        const mockNewTenant: Tenant = {
          id: `tenant-${orgName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'new'}`,
          name: orgName,
          domain: orgDomain,
          currentPlanId: selectedPlanId,
          status: 'active',
          billingStatus: 'active',
          resourceLoad: 10,
          createdAt: new Date().toISOString().split('T')[0],
          adminEmail,
          ipWhitelist: ipWhitelistStr ? ipWhitelistStr.split(',').map(ip => ip.trim()).filter(ip => ip.length > 0) : [],
          customDomain: customDomain.trim() || undefined,
          activeSeats: 1,
          maxSeats: seatsLimit,
          apiKey: `c1q_live_${orgName.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Math.random().toString(36).substring(2, 12)}`,
          nluVersion: 'v1.0.0'
        };
        onSave(mockNewTenant);
        onClose();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isDeploying, logIndex]);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleDeploy = () => {
    setIsDeploying(true);
    setDeployLogs([logs[0]]);
    setLogIndex(1);
  };

  const stepTitles = [
    tmT.wizard.step1,
    tmT.wizard.step2,
    tmT.wizard.step3,
    tmT.wizard.step4
  ];

  return (
    <ModalWrapper
      isOpen={true}
      onClose={isDeploying ? () => {} : onClose} // Block closing during active deployment simulation
      title={tmT.wizard.title}
      maxWidthClass="max-w-md"
      hideCloseButton={isDeploying}
      preventCloseOnOverlayClick={isDeploying}
      preventCloseOnEsc={isDeploying}
    >
      <div className="space-y-6">
        {/* Step Progress Bar */}
        {!isDeploying && (
          <div className="flex items-center justify-between gap-1 relative py-2">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 z-0" />
            {stepTitles.map((title, index) => {
              const currentNum = index + 1;
              const isPast = step > currentNum;
              const isActive = step === currentNum;
              return (
                <div key={index} className="flex flex-col items-center z-10">
                  <div 
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                      isPast 
                        ? 'bg-blue-600 text-white' 
                        : isActive 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 ring-2 ring-blue-500/20' 
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {currentNum}
                  </div>
                  <span className={`text-[8.5px] font-bold mt-1 tracking-wider uppercase select-none ${
                    isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
                  }`}>
                    {title.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Wizard Forms */}
        {isDeploying ? (
          /* Deployment terminal view */
          <div className="space-y-4">
            <div className="flex flex-col items-center py-6">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <h4 className="text-xs font-bold text-slate-850 dark:text-slate-200 mt-3">
                {isRtl ? 'جاري تهيئة خوادم العميل الجديد...' : 'Deploying tenant infrastructure...'}
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                {orgName} (ID: {orgName.toLowerCase().replace(/[^a-z0-9]/g, '')})
              </p>
            </div>
            
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 font-mono text-[9px] text-slate-300 min-h-36 max-h-48 overflow-y-auto space-y-1.5 leading-relaxed">
              <div className="flex items-center gap-1.5 text-blue-400 border-b border-slate-850 pb-1.5 mb-1.5">
                <Terminal className="w-3.5 h-3.5" />
                <span className="font-bold uppercase tracking-wider">Deploy Logs</span>
              </div>
              {deployLogs.map((log, idx) => (
                <div key={idx} className="flex gap-1.5 items-start">
                  <span className="text-slate-500 shrink-0">$</span>
                  <span className={idx === deployLogs.length - 1 ? "text-white animate-pulse" : "text-slate-300"}>
                    {log}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Normal Step Views */
          <div className="space-y-4">
            {step === 1 && (
              <form onSubmit={handleNext} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 font-mono">
                    {tmT.wizard.fieldOrgName} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Saudi Aramco Corp"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 font-mono">
                    {tmT.wizard.fieldOrgDomain} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. aramco.com"
                    value={orgDomain}
                    onChange={(e) => setOrgDomain(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 font-mono">
                    {tmT.wizard.fieldAdminEmail} *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. administrator@aramco.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    <span>{tmT.wizard.buttonNext}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleNext} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 font-mono">
                    {tmT.wizard.fieldQuotaSeats}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={seatsLimit}
                    onChange={(e) => setSeatsLimit(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 font-mono">
                    {isRtl ? 'مستوى خطة الأسعار والاشتراك' : 'Assigned Subscription Level'}
                  </label>
                  <select
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-750 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="plan-free">{isRtl ? 'تجريبية مجانية (تصل إلى 5 وكلاء)' : 'Free Trial (Max 5 seats)'}</option>
                    <option value="plan-growth">{isRtl ? 'خطة النمو (تصل إلى 30 وكيل)' : 'Growth Plan (Max 30 seats)'}</option>
                    <option value="plan-enterprise">{isRtl ? 'خطة المؤسسات (أكثر من 100 وكيل)' : 'Enterprise Tier (Uncapped limits)'}</option>
                  </select>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-1 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'السابق' : 'Back'}</span>
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    <span>{tmT.wizard.buttonNext}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleNext} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 font-mono">
                    {isRtl ? 'تهيئة نطاق فرعي مخصص (اختياري)' : 'Custom CNAME Mapping (Optional)'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. chat.aramco.com"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 font-mono">
                    {isRtl ? 'عناوين IP المسموح بها للمسؤولين (مفصولة بفاصلة)' : 'Initial IP Whitelist (comma separated)'}
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. 192.168.1.1, 10.0.0.0/8"
                    value={ipWhitelistStr}
                    onChange={(e) => setIpWhitelistStr(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-1 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'السابق' : 'Back'}</span>
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    <span>{tmT.wizard.buttonNext}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {step === 4 && (
              <div className="space-y-5">
                {/* Summary View */}
                <div className="p-4 bg-slate-50/70 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-3">
                  <div className="flex gap-2.5 items-start">
                    <Building className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-400 font-mono">Organization Profile</p>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white mt-0.5">{orgName || 'N/A'}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">{orgDomain || 'N/A'} • {adminEmail || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <Cpu className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-400 font-mono">Resource Allocations</p>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white mt-0.5">
                        {selectedPlanId === 'plan-enterprise' ? 'Enterprise Tier' : selectedPlanId === 'plan-growth' ? 'Growth Tier' : 'Free Trial'}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono">Seats Budget: {seatsLimit} agents</p>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-400 font-mono">Network & Security Routing</p>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white mt-0.5 font-mono">{customDomain || 'No custom domain mapping'}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">
                        IP restriction: {ipWhitelistStr ? ipWhitelistStr.split(',').length : 0} rules mapped
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-1 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'السابق' : 'Back'}</span>
                  </button>
                  <button
                    onClick={handleDeploy}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer shadow-md shadow-blue-500/20"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{tmT.wizard.buttonLaunch}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ModalWrapper>
  );
}
