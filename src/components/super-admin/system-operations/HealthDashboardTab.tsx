'use client';

import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useApp } from '@/context/AppContext';
import { useFeedbackToasts } from '@/components/customer-portal/feedback/PostChatToasts';
import { translations } from '@/i18n/translations';
import { mockServices } from './mockSystemOperationsData';
import { SystemOpsStatusBadge } from './SystemOpsStatusBadge';
import { SVGLineChart, SVGBarChart } from '@/components/dashboard/Charts';
import { OperationalCard } from '@/components/shared/OperationalCard';
import { Server, Activity, Clock, ShieldAlert, Cpu, Terminal, RefreshCw, X } from 'lucide-react';
import { ModalWrapper } from '@/components/shared/ModalWrapper';

export function HealthDashboardTab() {
  const lang = useUIStore((s) => s.lang);
  const isRtl = lang === 'ar';
  const t = translations[lang];

  const sysOpsT = (t.superAdmin as any).systemOps || {
    health: {
      serviceStatus: 'Core Services Status',
      cpuUtilization: 'API Gateway CPU Load',
      memoryUtilization: 'Memory Allocation',
      latencyIndex: 'Network Latency Index',
      uptime: 'Overall Platform Uptime',
      healthy: 'OPERATIONAL',
      degraded: 'DEGRADED',
      offline: 'OUTAGE'
    }
  };

  const { addAuditLog } = useApp();
  const { pushToast } = useFeedbackToasts();

  const [services, setServices] = useState(mockServices);
  const [selectedSvc, setSelectedSvc] = useState<any | null>(null);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [restartProgress, setRestartProgress] = useState(0);

  // Math formatting helpers
  const formatNumber = (num: number) => {
    return num.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US');
  };

  const triggerRestart = () => {
    setShowRestartConfirm(true);
  };

  const confirmRestart = () => {
    setShowRestartConfirm(false);
    setIsRestarting(true);
    setRestartProgress(0);
    addAuditLog(`Triggered restart of service instance: ${selectedSvc?.name} (${selectedSvc?.id})`, 'success');
  };

  useEffect(() => {
    if (isRestarting) {
      const interval = setInterval(() => {
        setRestartProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              // Update services state to healthy/rebooted
              setServices(prevSvcs => prevSvcs.map(s => 
                s.id === selectedSvc.id ? { ...s, status: 'healthy', latencyMs: 12 } : s
              ));
              // Update local drawer view status
              setSelectedSvc((prevSvc: any) => prevSvc ? { ...prevSvc, status: 'healthy', latencyMs: 12 } : null);
              setIsRestarting(false);
              pushToast(
                'success',
                isRtl ? 'تم إعادة تشغيل الخدمة بنجاح' : 'Service Restarted',
                isRtl 
                  ? `تم إعادة تشغيل الخدمة "${selectedSvc.name}" وتنشيط حزم المعالجة.`
                  : `Successfully restarted process thread and memory containers for "${selectedSvc.name}".`
              );
            }, 500);
            return 100;
          }
          return prev + 25;
        });
      }, 300);
      return () => clearInterval(interval);
    }
  }, [isRestarting, selectedSvc, isRtl, pushToast]);

  return (
    <div className="space-y-6">
      {/* Platform Uptime & Load cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <OperationalCard hoverEffect={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {sysOpsT.health.uptime}
              </p>
              <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">99.98%</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </OperationalCard>

        <OperationalCard hoverEffect={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {sysOpsT.health.latencyIndex}
              </p>
              <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">14ms</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5" />
            </div>
          </div>
        </OperationalCard>

        <OperationalCard hoverEffect={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {isRtl ? 'المعالج الـ CPU المتوسط' : 'Average CPU Utilization'}
              </p>
              <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">38.4%</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
        </OperationalCard>

        <OperationalCard hoverEffect={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {isRtl ? 'نطاق الحوسبة الفعال' : 'Active Region Zone'}
              </p>
              <h3 className="text-xl font-bold text-slate-850 dark:text-white mt-1.5 font-mono">me-central-1</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-355 flex items-center justify-center shrink-0">
              <Server className="w-5 h-5" />
            </div>
          </div>
        </OperationalCard>
      </div>

      {/* Observability Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SVGLineChart
          data={[12, 18, 22, 14, 28, 38, 32]}
          labels={['05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00']}
          title={sysOpsT.health.cpuUtilization}
          gradientColor="#3b82f6"
        />

        <SVGBarChart
          data={[62, 63, 62, 64, 65, 68, 67]}
          labels={['05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00']}
          title={`${sysOpsT.health.memoryUtilization} (GB)`}
          barColor="#8b5cf6"
        />
      </div>

      {/* Service Status table */}
      <div className="space-y-4 pt-2">
        <h3 className="font-bold text-[11px] text-slate-500 uppercase tracking-wider font-mono">
          {sysOpsT.health.serviceStatus}
        </h3>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
                  <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-start font-mono">
                    {isRtl ? 'اسم الخدمة' : 'Service Component'}
                  </th>
                  <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-start font-mono">
                    {isRtl ? 'المنطقة الجغرافية' : 'Zone Region'}
                  </th>
                  <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-start font-mono">
                    {isRtl ? 'وقت التشغيل Uptime' : 'Uptime Uptime'}
                  </th>
                  <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-start font-mono">
                    {isRtl ? 'زمن الاستجابة' : 'Response Latency'}
                  </th>
                  <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-start font-mono">
                    {isRtl ? 'الحالة التشغيلية' : 'Status State'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {services.map((svc) => (
                  <tr 
                    key={svc.id}
                    onClick={() => setSelectedSvc(svc)}
                    className="border-b border-slate-100/70 dark:border-slate-800/40 hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800 dark:text-white">
                          {svc.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                          {svc.id}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs font-mono text-slate-500 dark:text-slate-400">
                      {svc.region}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs font-mono font-bold text-slate-650 dark:text-slate-355">
                      {formatNumber(svc.uptime)}%
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs font-mono text-slate-600 dark:text-slate-400">
                      {formatNumber(svc.latencyMs)} ms
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <SystemOpsStatusBadge status={svc.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Service Details Overlay Drawer */}
      <ModalWrapper
        isOpen={!!selectedSvc}
        onClose={() => !isRestarting && setSelectedSvc(null)}
        title={isRtl ? 'تفاصيل مكون الخدمة' : 'Service Component Telemetry'}
      >
        {selectedSvc && (
          <div className="space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{selectedSvc.name}</h4>
                <p className="text-[10px] text-slate-450 mt-0.5 font-mono">ID: {selectedSvc.id}</p>
              </div>
              <SystemOpsStatusBadge status={isRestarting ? 'pending' : selectedSvc.status} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl">
                <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block font-mono">{isRtl ? 'المنطقة الجغرافية' : 'Host Region'}</span>
                <span className="text-xs font-bold text-slate-800 dark:text-white mt-1 block font-mono">{selectedSvc.region}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-850 rounded-xl">
                <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block font-mono">{isRtl ? 'معدل وقت التشغيل' : 'SLA Uptime'}</span>
                <span className="text-xs font-bold text-slate-800 dark:text-white mt-1 block font-mono">{formatNumber(selectedSvc.uptime)}%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-850 rounded-xl">
                <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block font-mono">{isRtl ? 'زمن الاستجابة' : 'Network Latency'}</span>
                <span className="text-xs font-bold text-slate-850 dark:text-white mt-1 block font-mono">{formatNumber(selectedSvc.latencyMs)}ms</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-855 rounded-xl">
                <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block font-mono">{isRtl ? 'إصدار البرنامج' : 'Container Version'}</span>
                <span className="text-xs font-bold text-slate-850 dark:text-white mt-1 block font-mono">v2.8.2-build39</span>
              </div>
            </div>

            {/* Performance metric simulations */}
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">{isRtl ? 'مؤشرات تحميل الموارد الحالية' : 'Live Resource Allocation Stats'}</span>
              <div className="p-3 bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-900 rounded-xl space-y-3 font-mono text-[10.5px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">CPU Load:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-350">34.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Memory Allocation:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-350">4.12 GB / 8.00 GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Active HTTP Handshakes:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-350">214 req/sec</span>
                </div>
              </div>
            </div>

            {/* Simulated log console */}
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-blue-500" />
                <span>{isRtl ? 'سجل تشغيل النظام الأخير' : 'Container stdout execution logs'}</span>
              </span>
              <div className="bg-slate-955 text-emerald-450 p-3 rounded-xl border border-slate-900 overflow-x-auto text-[9.5px] font-mono space-y-1 max-h-32 overflow-y-auto leading-relaxed">
                <div>[2026-06-04 11:30:14] INF starting telemetry polling daemon...</div>
                <div>[2026-06-04 11:30:15] INF configuration reload successful (env: production).</div>
                <div>[2026-06-04 11:32:00] DBG healthcheck ping returned 200 OK (latency: {selectedSvc.latencyMs}ms).</div>
                {selectedSvc.status === 'degraded' && (
                  <div className="text-amber-500 font-bold">[2026-06-04 11:35:12] WRN connection pool capacity has exceeded warning threshold 85%.</div>
                )}
                {isRestarting && (
                  <div className="text-blue-400 animate-pulse font-bold">[2026-06-04 11:51:20] INF reboot command received. container shutting down threads...</div>
                )}
              </div>
            </div>

            {/* Actions Panel */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                {isRestarting ? (
                  <div className="flex items-center gap-2 text-blue-650 dark:text-blue-400 font-mono text-[10px]">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{isRtl ? `جاري إعادة التشغيل... ${restartProgress}%` : `Rebooting... ${restartProgress}%`}</span>
                  </div>
                ) : (
                  <button
                    onClick={triggerRestart}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-855 hover:bg-red-50 dark:hover:bg-red-955/30 hover:text-red-655 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-red-200 rounded-xl font-bold cursor-pointer transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'إعادة تشغيل المكون' : 'Restart Instance'}</span>
                  </button>
                )}
              </div>
              <button
                type="button"
                disabled={isRestarting}
                onClick={() => setSelectedSvc(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-655 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-855 cursor-pointer disabled:opacity-50"
              >
                {isRtl ? 'إغلاق' : 'Close details'}
              </button>
            </div>
          </div>
        )}
      </ModalWrapper>

      {/* Restart Confirmation Modal */}
      <ModalWrapper
        isOpen={showRestartConfirm}
        onClose={() => setShowRestartConfirm(false)}
        title={isRtl ? 'تأكيد إعادة تشغيل الخدمة' : 'Confirm Service Instance Reboot'}
      >
        {selectedSvc && (
          <div className="space-y-4 text-xs font-semibold text-slate-855 dark:text-slate-200">
            <div className="flex gap-3 bg-blue-50/50 dark:bg-blue-955/10 border border-blue-200 dark:border-blue-900/30 p-3.5 rounded-xl text-[11px] text-blue-700 dark:text-blue-400">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <p className="leading-relaxed">
                {isRtl 
                  ? `هل أنت متأكد من رغبتك في إعادة تشغيل "${selectedSvc.name}"؟ سيؤدي هذا إلى فصل مؤقت لحزم اتصالات العملاء النشطة أثناء عملية إعادة التمهيد.` 
                  : `Are you sure you want to trigger a hot restart for "${selectedSvc.name}"? Active worker threads will be drained, causing brief request queuing.`
                }
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRestartConfirm(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-855 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={confirmRestart}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer"
              >
                {isRtl ? 'تأكيد إعادة التشغيل' : 'Reboot Instance'}
              </button>
            </div>
          </div>
        )}
      </ModalWrapper>
    </div>
  );
}

