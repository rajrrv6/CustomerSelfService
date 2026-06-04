'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { 
  HelpCircle, Brain, Radio, Phone, Database, Layers, FileText,
  Activity, ShieldAlert, Cpu, Server, Clock, Play, RotateCcw,
  AlertTriangle, ArrowRight, Download, Users, FileJson, CheckCircle2,
  XCircle, RefreshCw, Plus, Settings, Sparkles, CheckCircle, PhoneCall
} from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { OperationalCard } from '@/components/shared/OperationalCard';
import { mockAuditEvents } from '../audit/mockAuditData';
import { mockServices, mockJobs } from '../system-operations/mockSystemOperationsData';
import { TenantProvisioningWizard } from '../tenant-management/TenantProvisioningWizard';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { useFeedbackToasts } from '@/components/customer-portal/feedback/PostChatToasts';
import { useApp } from '@/context/AppContext';

// Containers imported eagerly
import { MasterDataContainer } from '../containers/MasterDataContainer';
import { AnalyticsContainer } from '../containers/AnalyticsContainer';
import { InfrastructureContainer } from '../containers/InfrastructureContainer';
import { TelephonyContainer } from '../containers/TelephonyContainer';

const BillingOverviewTab = React.lazy(() => import('../billing/BillingOverviewTab').then(m => ({ default: m.BillingOverviewTab })));
const AuditOverviewTab = React.lazy(() => import('../audit/AuditOverviewTab').then(m => ({ default: m.AuditOverviewTab })));
const NotificationsOverviewTab = React.lazy(() => import('../notifications/NotificationsOverviewTab').then(m => ({ default: m.NotificationsOverviewTab })));
const SettingsOverviewTab = React.lazy(() => import('../settings/SettingsOverviewTab').then(m => ({ default: m.SettingsOverviewTab })));
const HelpCenterTab = React.lazy(() => import('../help/HelpCenterTab').then(m => ({ default: m.HelpCenterTab })));
const TenantManagementContainer = React.lazy(() => import('../tenant-management/TenantManagementContainer').then(m => ({ default: m.TenantManagementContainer })));
const SystemOperationsContainer = React.lazy(() => import('../system-operations/SystemOperationsContainer').then(m => ({ default: m.SystemOperationsContainer })));

export function TabFallback() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500 animate-pulse">
      <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-3" />
      <span className="text-xs font-semibold font-mono tracking-wider uppercase">Loading module...</span>
    </div>
  );
}

export function NotImplementedFallback() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
      <HelpCircle className="w-10 h-10 mb-2 opacity-50" />
      <span>Screen not implemented</span>
    </div>
  );
}

export function SuperAdminDashboardOverview() {
  const lang = useUIStore((s) => s.lang);
  const isRtl = lang === 'ar';
  const { addAuditLog } = useApp();
  const { pushToast } = useFeedbackToasts();

  const [showWizard, setShowWizard] = useState(false);
  const [showCompactingModal, setShowCompactingModal] = useState(false);
  const [compactProgress, setCompactProgress] = useState(0);
  const [showDiagnosticsModal, setShowDiagnosticsModal] = useState(false);
  
  // SIP Call simulator state
  const [isDialing, setIsDialing] = useState(false);
  const [dialLogs, setDialLogs] = useState<string[]>([]);
  const [dialNumber, setDialNumber] = useState('');

  const startCompaction = () => {
    setCompactProgress(0);
    setShowCompactingModal(true);
    addAuditLog('Triggered manual Vector database index compaction sweep.', 'success');
  };

  useEffect(() => {
    if (showCompactingModal) {
      const interval = setInterval(() => {
        setCompactProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setShowCompactingModal(false);
              pushToast(
                'success',
                isRtl ? 'اكتمل ضغط قاعدة البيانات' : 'Vector Index Compacted',
                isRtl ? 'تم ضغط وتنظيف فهارس الكلمات المتجهة بنجاح.' : 'Compacted indices partitions and reclaimed vector DB memory.'
              );
            }, 550);
            return 100;
          }
          return prev + 10;
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [showCompactingModal]);

  const startDialTest = () => {
    if (!dialNumber.trim()) return;
    setIsDialing(true);
    setDialLogs([]);
    addAuditLog(`Triggered manual SIP voice diagnostics test dial to ${dialNumber}.`, 'success');
    
    const logs = [
      isRtl ? 'جاري إرسال طلب SIP INVITE إلى البوابة...' : 'SIP INVITE sent to telephony gateway address...',
      isRtl ? 'تم استلام رد SIP 100 (محاولة اتصال).' : 'SIP 100 Trying received from server.',
      isRtl ? 'رنين الهاتف (SIP 180 Ringing). مؤشر MOS المستهدف: 4.4' : 'SIP 180 Ringing. MOS Quality Target: 4.4',
      isRtl ? 'تم الرد (SIP 200 OK). تم إنشاء خط الاتصال الصوتي.' : 'SIP 200 OK. Connection established successfully.',
      isRtl ? 'ترميز الصوت النشط: G.711a (مفاوضات Codec ناجحة).' : 'Audio loopback active: G.711a codec auto-negotiation complete.',
      isRtl ? 'تم إنهاء المكالمة. جودة الصوت MOS: 4.4 (ممتازة).' : 'Call terminated. Verified Voice quality MOS: 4.4 (Excellent).'
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex >= logs.length) {
        clearInterval(interval);
        setIsDialing(false);
        pushToast(
          'success',
          isRtl ? 'اكتمل اختبار خط الاتصال' : 'SIP Diagnostics Passed',
          isRtl ? `تم التحقق من مسار التوجيه بنجاح مع MOS 4.4` : `Voice path loopback test completed successfully with MOS 4.4`
        );
      } else {
        setDialLogs((prev) => [...prev, logs[currentLogIndex]]);
        currentLogIndex++;
      }
    }, 600);
  };

  const handleExportComplianceReport = () => {
    const csvContent = "data:text/csv;charset=utf-8,Compliance Report,Date,Status\nHIPAA Audits,2026-06-04,Pass\nPCI-DSS Controls,2026-06-04,Pass\nVector DB Masking,2026-06-04,Pass";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "super_admin_compliance_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    pushToast(
      'success',
      isRtl ? 'تم تحميل تقرير الامتثال' : 'Compliance Report Exported',
      isRtl ? 'تم تحميل ملف تقرير الامتثال الأمني بنجاح.' : 'Downloaded security controls compliance CSV ledger.'
    );
    addAuditLog('Downloaded security compliance controls checklist.', 'success');
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title={isRtl ? 'لوحة القيادة العامة' : 'Dashboard Overview'}
        description={isRtl ? 'نظرة عامة على مؤشرات النظام والقياسات العامة لمستأجري المنصة.' : 'Global system metrics and telemetry overview for platform tenants.'}
      />
      
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <OperationalCard hoverEffect={false}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {isRtl ? 'نماذج الذكاء الاصطناعي' : 'LLM Models'}
              </p>
              <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mt-0.5">5</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Llama-3, Claude, Gemini</p>
            </div>
          </div>
        </OperationalCard>

        <OperationalCard hoverEffect={false}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {isRtl ? 'محركات الصوت ASR/TTS' : 'Speech Engines'}
              </p>
              <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mt-0.5">3</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">DeepL, ElevenLabs, Azure</p>
            </div>
          </div>
        </OperationalCard>

        <OperationalCard hoverEffect={false}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {isRtl ? 'خطوط الاتصال SIP' : 'SIP Trunks'}
              </p>
              <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mt-0.5">2</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">AST-KSA primary & backup</p>
            </div>
          </div>
        </OperationalCard>

        <OperationalCard hoverEffect={false}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {isRtl ? 'قواعد البيانات المتجهة' : 'Vector DB Clusters'}
              </p>
              <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mt-0.5">1</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Pinecone Index Cluster</p>
            </div>
          </div>
        </OperationalCard>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Health Status and Activity */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Health Status Widget */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <span>{isRtl ? 'الحالة التشغيلية للخدمات الأساسية' : 'Core Services Health Index'}</span>
              </h4>
              <span className="text-[9px] font-mono font-bold text-emerald-650 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-250">
                {isRtl ? 'النظام متصل بشكل كامل' : 'ALL CORE SYSTEMS ONLINE'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mockServices.map((svc) => (
                <div key={svc.id} className="p-3 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-xl flex items-center justify-between">
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-800 dark:text-white block truncate">{svc.name}</span>
                    <span className="text-[9px] font-mono text-slate-400 mt-0.5 block">Uptime: {svc.uptime}%</span>
                  </div>
                  <div className="text-end">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border inline-block ${
                      svc.status === 'healthy' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400' 
                        : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-955/20 dark:text-amber-400'
                    }`}>
                      {svc.status === 'healthy' ? (isRtl ? 'مستقر' : 'ONLINE') : (isRtl ? 'متدهور' : 'DEGRADED')}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 block mt-1">{svc.latencyMs}ms</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Feed Widget */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <FileJson className="w-4 h-4 text-blue-500" />
              <span>{isRtl ? 'آخر سجلات النشاط والتدقيق الأمني' : 'Global Audit Activity Trail'}</span>
            </h4>

            <div className="space-y-3">
              {mockAuditEvents.slice(0, 3).map((evt) => (
                <div key={evt.id} className="p-3 bg-slate-50/40 dark:bg-slate-950/20 border border-slate-100/50 dark:border-slate-850 rounded-xl space-y-1.5">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-800 dark:text-white font-mono">{evt.actionType}</span>
                    <span className={`text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${
                      evt.severity === 'critical' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400' :
                      evt.severity === 'high' ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-955/20 dark:text-orange-400' :
                      'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {evt.severity}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">{evt.details}</p>
                  <div className="flex items-center gap-2 text-[9px] text-slate-400 font-mono">
                    <span>{evt.actor} ({evt.actorRole})</span>
                    <span>•</span>
                    <span>{evt.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Side: Alerts, Quick Actions, Active Jobs */}
        <div className="space-y-6">
          
          {/* Alerts Panel */}
          <div className="bg-red-50/20 dark:bg-red-950/10 border border-red-100 dark:border-red-900/20 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-red-800 dark:text-red-400 uppercase tracking-wider font-mono flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>{isRtl ? 'تنبيهات النظام النشطة' : 'System Anomalies Alerts'}</span>
            </h4>

            <div className="space-y-2">
              <div className="flex gap-2 text-[10px] text-red-700 dark:text-red-300 font-semibold leading-relaxed">
                <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
                <span>+18% latency spike observed on Claude-3.5-Sonnet routing gateway.</span>
              </div>
              <div className="flex gap-2 text-[10px] text-red-700 dark:text-red-300 font-semibold leading-relaxed">
                <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
                <span>Toxicity Safety Score for Riyadh Financial dropped below 0.70 threshold.</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Settings className="w-4 h-4 text-blue-500" />
              <span>{isRtl ? 'إجراءات تشغيلية سريعة' : 'Quick Actions Console'}</span>
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setShowWizard(true)}
                className="p-3 border border-slate-200 hover:border-blue-500 dark:border-slate-800 dark:hover:border-blue-500 rounded-xl hover:bg-blue-50/10 text-start transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-blue-500 mb-1" />
                <span className="text-[10px] font-bold text-slate-800 dark:text-white block">{isRtl ? 'إضافة مستأجر' : 'Provision Tenant'}</span>
                <span className="text-[8px] text-slate-400 block mt-0.5">{isRtl ? 'بدء معالج التهيئة' : 'Launch Setup Wizard'}</span>
              </button>

              <button 
                onClick={() => setShowDiagnosticsModal(true)}
                className="p-3 border border-slate-200 hover:border-blue-500 dark:border-slate-800 dark:hover:border-blue-500 rounded-xl hover:bg-blue-50/10 text-start transition-colors cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 text-blue-500 mb-1" />
                <span className="text-[10px] font-bold text-slate-800 dark:text-white block">{isRtl ? 'فحص شبكة SIP' : 'SIP Dial Test'}</span>
                <span className="text-[8px] text-slate-400 block mt-0.5">{isRtl ? 'تشغيل اختبار اتصال' : 'Dial Test Probe'}</span>
              </button>

              <button 
                onClick={startCompaction}
                className="p-3 border border-slate-200 hover:border-blue-500 dark:border-slate-800 dark:hover:border-blue-500 rounded-xl hover:bg-blue-50/10 text-start transition-colors cursor-pointer"
              >
                <Database className="w-4 h-4 text-blue-500 mb-1" />
                <span className="text-[10px] font-bold text-slate-800 dark:text-white block">{isRtl ? 'تنظيف الفهارس' : 'Vector Compact'}</span>
                <span className="text-[8px] text-slate-400 block mt-0.5">{isRtl ? 'إزالة الفهارس الخاملة' : 'Pinecone Index Compact'}</span>
              </button>

              <button 
                onClick={handleExportComplianceReport}
                className="p-3 border border-slate-200 hover:border-blue-500 dark:border-slate-800 dark:hover:border-blue-500 rounded-xl hover:bg-blue-50/10 text-start transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-blue-500 mb-1" />
                <span className="text-[10px] font-bold text-slate-800 dark:text-white block">{isRtl ? 'تقرير الامتثال' : 'Compliance Export'}</span>
                <span className="text-[8px] text-slate-400 block mt-0.5">{isRtl ? 'تحميل التقرير كـ CSV' : 'Download security CSV'}</span>
              </button>
            </div>
          </div>

          {/* Background Jobs Snapshot */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>{isRtl ? 'حالة وظائف المعالجة النشطة' : 'Active Background Jobs'}</span>
            </h4>

            <div className="space-y-3">
              {mockJobs.filter(j => j.status === 'running' || j.status === 'pending').map((job) => (
                <div key={job.id} className="flex justify-between items-center p-2.5 bg-slate-50/40 dark:bg-slate-950/20 border border-slate-100/50 dark:border-slate-850 rounded-xl">
                  <div>
                    <span className="text-[10.5px] font-bold text-slate-800 dark:text-white block">{job.name}</span>
                    <span className="text-[9px] font-mono text-slate-400 mt-0.5 block">{job.id} • {job.queueName}</span>
                  </div>
                  <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded-full border ${
                    job.status === 'running' ? 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse' : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {job.status === 'running' ? (isRtl ? 'قيد التشغيل' : 'RUNNING') : (isRtl ? 'قيد الانتظار' : 'PENDING')}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Provision Wizard Modal Component */}
      {showWizard && (
        <TenantProvisioningWizard 
          onClose={() => setShowWizard(false)}
          onSave={(newTenant) => {
            pushToast(
              'success',
              isRtl ? 'تم إنشاء المستأجر بنجاح' : 'Tenant Created Successfully',
              isRtl ? `تم تسجيل المستأجر "${newTenant.name}" على المنصة.` : `Successfully provisioned "${newTenant.name}" configurations.`
            );
            addAuditLog(`Provisioned new tenant: ${newTenant.name}`, 'success');
            setShowWizard(false);
          }}
        />
      )}

      {/* Compaction Simulation Modal */}
      <ModalWrapper
        isOpen={showCompactingModal}
        onClose={() => {}}
        title={isRtl ? 'ضغط فهارس الكلمات المتجهة' : 'Vector Database Index Compaction'}
      >
        <div className="py-6 flex flex-col items-center justify-center text-xs font-semibold text-slate-800 dark:text-slate-200 text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
          <div>
            <h4 className="font-extrabold text-slate-900 dark:text-white">{isRtl ? 'جاري ضغط الفهارس الخاملة...' : 'Compacting database partitions...'}</h4>
            <p className="text-[10px] text-slate-400 mt-1">{isRtl ? 'الرجاء الانتظار، يتم تحرير ذاكرة الفهرس.' : 'Reclaiming Pinecone Vector index partition memory footprint.'}</p>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden max-w-xs border border-slate-200 dark:border-slate-750">
            <div className="bg-blue-600 h-full transition-all duration-150" style={{ width: `${compactProgress}%` }} />
          </div>
          <span className="font-mono text-xs font-bold text-blue-600">{compactProgress}%</span>
        </div>
      </ModalWrapper>

      {/* SIP Diagnostics Simulator Modal */}
      <ModalWrapper
        isOpen={showDiagnosticsModal}
        onClose={() => {
          if (!isDialing) setShowDiagnosticsModal(false);
        }}
        title={isRtl ? 'أداة اختبار وفحص شبكة SIP' : 'SIP Telephony Path Diagnostics'}
      >
        <div className="space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase font-mono">
              {isRtl ? 'رقم الهاتف للاختبار' : 'Destination Dial Probe'} *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                disabled={isDialing}
                value={dialNumber}
                onChange={(e) => setDialNumber(e.target.value)}
                placeholder="e.g. +966500000000"
                className="flex-1 px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-xs font-bold font-mono text-slate-900 dark:text-white disabled:opacity-50"
              />
              <button
                onClick={startDialTest}
                disabled={isDialing || !dialNumber.trim()}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                {isDialing ? (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                <span>{isRtl ? 'بدء الفحص' : 'Run Test'}</span>
              </button>
            </div>
          </div>

          {/* Test Logs Screen */}
          <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl font-mono text-[10px] text-emerald-400 min-h-[140px] space-y-1.5 max-h-[220px] overflow-y-auto">
            {dialLogs.length === 0 && (
              <span className="text-slate-550 italic">{isRtl ? 'أدخل الرقم واضغط بدء الفحص لتشغيل اختبار الاتصال الصوتي.' : 'Enter phone number and click run to trace call loopback.'}</span>
            )}
            {dialLogs.map((log, idx) => (
              <div key={idx} className="flex gap-2">
                <span className="text-slate-600 select-none">[{idx + 1}]</span>
                <span className="leading-relaxed whitespace-normal">{log}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              onClick={() => setShowDiagnosticsModal(false)}
              disabled={isDialing}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer"
            >
              {isRtl ? 'إغلاق' : 'Close Console'}
            </button>
          </div>
        </div>
      </ModalWrapper>

    </div>
  );
}

interface SuperAdminLayoutProps {
  activeSubScreen: string;
}

export function SuperAdminLayout({ activeSubScreen }: SuperAdminLayoutProps) {
  switch (activeSubScreen) {
    case 'sa_dashboard':
      return <SuperAdminDashboardOverview />;
      
    case 'sa_master_data':
    case 'llm_registry':
      return <MasterDataContainer activeTab="llm_registry" />;
    case 'asr_tts_registry':
      return <MasterDataContainer activeTab="asr_tts_registry" />;
    case 'channels':
      return <MasterDataContainer activeTab="channels" />;
    case 'nlu_governance':
      return <MasterDataContainer activeTab="nlu_governance" />;
      
    case 'sa_analytics':
    case 'cross_tenant_analytics':
      return <AnalyticsContainer activeTab="cross_tenant_analytics" />;
    case 'cost_benchmarks':
      return <AnalyticsContainer activeTab="cost_benchmarks" />;
      
    case 'sa_infra':
    case 'vector_db':
      return <InfrastructureContainer activeTab="vector_db" />;
      
    case 'sa_telephony':
    case 'sip_trunk':
      return <TelephonyContainer activeTab="sip_trunk" />;

    case 'sa_billing':
      return (
        <Suspense fallback={<TabFallback />}>
          <BillingOverviewTab />
        </Suspense>
      );
      
    case 'sa_audit':
      return (
        <Suspense fallback={<TabFallback />}>
          <AuditOverviewTab />
        </Suspense>
      );

    case 'sa_notifications':
      return (
        <Suspense fallback={<TabFallback />}>
          <NotificationsOverviewTab />
        </Suspense>
      );

    case 'sa_settings':
      return (
        <Suspense fallback={<TabFallback />}>
          <SettingsOverviewTab />
        </Suspense>
      );

    case 'sa_help':
      return (
        <Suspense fallback={<TabFallback />}>
          <HelpCenterTab />
        </Suspense>
      );
      
    case 'sa_tenant_management':
      return (
        <Suspense fallback={<TabFallback />}>
          <TenantManagementContainer />
        </Suspense>
      );
      
    case 'sa_system_ops':
      return (
        <Suspense fallback={<TabFallback />}>
          <SystemOperationsContainer />
        </Suspense>
      );

    default:
      return <NotImplementedFallback />;
  }
}
