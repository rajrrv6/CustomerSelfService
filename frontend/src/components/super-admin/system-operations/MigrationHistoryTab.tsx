'use client';

import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useApp } from '@/context/AppContext';
import { useFeedbackToasts } from '@/components/customer-portal/feedback/PostChatToasts';
import { translations } from '@/i18n/translations';
import { mockMigrations } from './mockSystemOperationsData';
import { SystemOpsStatusBadge } from './SystemOpsStatusBadge';
import { GitCommit, Calendar, Clock, Database, Play, AlertTriangle, ShieldAlert, FileText, X } from 'lucide-react';
import { ModalWrapper } from '@/components/shared/ModalWrapper';

export function MigrationHistoryTab() {
  const lang = useUIStore((s) => s.lang);
  const isRtl = lang === 'ar';
  const t = translations[lang];

  const sysOpsT = (t.superAdmin as any).systemOps || {
    migrations: {
      tableHeaders: ['Migration Version', 'Description', 'Executed At', 'Duration', 'Rollback Target', 'Status'],
      emptyTitle: 'No Migrations Run',
      emptyDesc: 'No platform schema migrations recorded in this cluster environment.'
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US');
  };

  const { addAuditLog } = useApp();
  const { pushToast } = useFeedbackToasts();

  const [migrations, setMigrations] = useState(mockMigrations);
  const [selectedMig, setSelectedMig] = useState<any | null>(null);
  const [showRollbackModal, setShowRollbackModal] = useState(false);
  const [rollbackProgress, setRollbackProgress] = useState(0);
  const [isRollingBack, setIsRollingBack] = useState(false);
  const [targetRollbackMig, setTargetRollbackMig] = useState<any | null>(null);

  const rollbackTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (rollbackTimeoutRef.current) clearTimeout(rollbackTimeoutRef.current);
    };
  }, []);

  const startRollback = (mig: any) => {
    setTargetRollbackMig(mig);
    setRollbackProgress(0);
    setShowRollbackModal(true);
    setIsRollingBack(false);
  };

  const confirmRollback = () => {
    setIsRollingBack(true);
    addAuditLog(`Initiated schema rollback to version ${targetRollbackMig?.version}`, 'success');
  };

  useEffect(() => {
    if (isRollingBack && showRollbackModal) {
      const interval = setInterval(() => {
        setRollbackProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            rollbackTimeoutRef.current = setTimeout(() => {
              setMigrations(prevMigs => prevMigs.map(m => 
                m.id === targetRollbackMig.id ? { ...m, status: 'rolled_back' } : m
              ));
              setShowRollbackModal(false);
              setIsRollingBack(false);
              pushToast(
                'success',
                isRtl ? 'تم التراجع عن الترقية بنجاح' : 'Schema Rollback Completed',
                isRtl 
                  ? `تم التراجع بقاعدة البيانات إلى النسخة المستهدفة: ${targetRollbackMig.version}.`
                  : `Successfully rolled back database schema partitions to target: ${targetRollbackMig.version}.`
              );
            }, 600);
            return 100;
          }
          return prev + 20;
        });
      }, 200);
      return () => {
        clearInterval(interval);
        if (rollbackTimeoutRef.current) clearTimeout(rollbackTimeoutRef.current);
      };
    }
  }, [isRollingBack, showRollbackModal, targetRollbackMig, isRtl, pushToast]);

  return (
    <div className="space-y-6">
      {/* Overview stats info */}
      <div className="p-4 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-white">
            {isRtl ? 'حالة قاعدة البيانات ومخطط الجداول' : 'Database Schema & Cluster Version'}
          </h4>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {isRtl ? 'حالة التوزيع الحالي لترقيات الجداول البرمجية.' : 'Serve clusters database schema versions state.'}
          </p>
        </div>
        <div className="flex gap-2">
          <span className="bg-slate-100 text-slate-650 dark:bg-slate-850 dark:text-slate-350 px-2.5 py-1 rounded-xl text-xs font-bold font-mono">
            {isRtl ? 'الإصدار الحالي: ' : 'Version: '} v2.8.2
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 columns: Timeline trail */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-[11px] text-slate-500 uppercase tracking-wider font-mono px-1 flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{isRtl ? 'الخط الزمني للترقيات' : 'Migration Rollout Timeline'}</span>
          </h3>

          <div className="relative pl-6 border-l border-slate-200 dark:border-slate-800 space-y-4 ml-3 py-1">
            {migrations.map((mig) => (
              <div
                key={mig.id}
                onClick={() => setSelectedMig(mig)}
                className="relative space-y-2 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500/30 dark:hover:border-blue-500/20 hover:shadow-sm cursor-pointer transition-all group"
              >
                
                {/* Timeline Dot icon */}
                <div className="absolute -left-[31px] top-4 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-blue-500 flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                </div>

                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-850 dark:text-white font-mono">
                      {mig.version}
                    </span>
                    <SystemOpsStatusBadge status={mig.status} />
                  </div>
                  {mig.status === 'success' && mig.rollbackVersion && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startRollback(mig);
                      }}
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold text-red-650 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 border border-red-200 rounded-lg cursor-pointer transition-colors"
                    >
                      <AlertTriangle className="w-3 h-3" />
                      <span>{isRtl ? 'تراجع' : 'Rollback'}</span>
                    </button>
                  )}
                </div>

                <p className="text-[10.5px] leading-relaxed text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                  {mig.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-mono pt-0.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-450" />
                    <span>{mig.executedAt}</span>
                  </span>
                  <span>•</span>
                  <span>{isRtl ? 'المدة: ' : 'Duration: '}{formatNumber(mig.durationMs)}ms</span>
                  {mig.rollbackVersion && (
                    <>
                      <span>•</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                        {isRtl ? 'التراجع إلى: ' : 'Rollback target: '}{mig.rollbackVersion}
                      </span>
                    </>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Right column: DB Metadata info card */}
        <div className="space-y-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
            <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider font-mono border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-500" />
              <span>{isRtl ? 'ملخص الجداول الفعالة' : 'DB Engine Specifications'}</span>
            </h4>

            <div className="space-y-3 text-xs leading-normal">
              <div>
                <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase font-mono">{isRtl ? 'محرك قاعدة البيانات' : 'Core DB Engine'}</p>
                <p className="font-bold text-slate-800 dark:text-white mt-0.5">PostgreSQL v16.2</p>
              </div>

              <div>
                <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase font-mono">{isRtl ? 'خادم التوزيع' : 'Residency Hosting'}</p>
                <p className="text-slate-650 dark:text-slate-350 mt-0.5">AWS RDS Multi-AZ Deployment</p>
              </div>

              <div>
                <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase font-mono">{isRtl ? 'تاريخ التحديث الأخير' : 'Last successful schema migration'}</p>
                <p className="text-slate-650 dark:text-slate-350 font-mono mt-0.5">2026-05-25 09:00:00</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-2">
            <h5 className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1.5">
              <GitCommit className="w-4 h-4 text-blue-500" />
              <span>{isRtl ? 'إصدار كود المنصة' : 'Git Commit Metadata'}</span>
            </h5>
            <div className="text-[10px] font-mono text-slate-500 space-y-1">
              <div className="flex justify-between">
                <span>Branch:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">release/v2.8</span>
              </div>
              <div className="flex justify-between">
                <span>Commit SHA:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">8d71b29a103c</span>
              </div>
              <div className="flex justify-between">
                <span>Build Date:</span>
                <span>2026-06-03 18:40</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Migration Details Drawer */}
      <ModalWrapper
        isOpen={!!selectedMig}
        onClose={() => setSelectedMig(null)}
        title={isRtl ? 'تفاصيل ترقية المخطط البرمجي' : 'Migration Schema Metadata & Trace'}
      >
        {selectedMig && (
          <div className="space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">{selectedMig.version}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">{isRtl ? 'تاريخ التنفيذ:' : 'Executed At:'} {selectedMig.executedAt}</p>
              </div>
              <SystemOpsStatusBadge status={selectedMig.status} />
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">{isRtl ? 'الوصف الوظيفي للتحديث' : 'Functional Description'}</span>
              <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-900 leading-relaxed font-normal">
                {selectedMig.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">{isRtl ? 'مدة التنفيذ' : 'Duration'}</span>
                <span className="text-xs font-mono font-bold text-slate-800 dark:text-white mt-1 block">{formatNumber(selectedMig.durationMs)}ms</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-905 rounded-xl">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">{isRtl ? 'السجلات المتأثرة' : 'Rows Affected'}</span>
                <span className="text-xs font-mono font-bold text-slate-800 dark:text-white mt-1 block">~ {formatNumber(1540)} rows</span>
              </div>
            </div>

            {/* SQL Script View */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                <span>{isRtl ? 'نص برمجية SQL المطبقة' : 'Executed DDL SQL Script'}</span>
              </span>
              <pre className="bg-slate-950 text-blue-400 p-4 rounded-xl border border-slate-900 overflow-x-auto text-[10px] font-mono leading-relaxed max-h-48 overflow-y-auto">
                {selectedMig.version === '20260501_init' && (
                  `-- Bootstrap schema\nCREATE TABLE rbac_permissions (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  name VARCHAR(100) UNIQUE NOT NULL,\n  scope VARCHAR(50) NOT NULL\n);\n\nCREATE INDEX idx_rbac_scope ON rbac_permissions(scope);`
                )}
                {selectedMig.version === '20260515_did_pool' && (
                  `-- Add DID pool allocation\nCREATE TABLE did_number_pool (\n  id UUID PRIMARY KEY,\n  did_number VARCHAR(20) UNIQUE NOT NULL,\n  status VARCHAR(20) DEFAULT 'unallocated',\n  tenant_id UUID REFERENCES tenants(id)\n);\n\nCREATE INDEX idx_did_status_tenant ON did_number_pool(status, tenant_id);`
                )}
                {selectedMig.version === '20260525_vector_ns' && (
                  `-- Expand namespace capacity size\nALTER TABLE vector_index_metadata \nALTER COLUMN namespace_capacity_limit TYPE INTEGER;\n\nUPDATE vector_index_metadata SET namespace_capacity_limit = 5000000;\nANALYZE vector_index_metadata;`
                )}
                {selectedMig.version === '20260601_failed_idx' && (
                  `-- Add indexes to job_queue status\nCREATE INDEX CONCURRENTLY idx_job_queue_status_retry \nON job_queue(status, retries) \nWHERE status IN ('failed', 'pending');`
                )}
              </pre>
            </div>

            {/* Rollback metadata block */}
            {selectedMig.rollbackVersion && (
              <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl flex items-center justify-between gap-3">
                <div>
                  <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block font-mono">{isRtl ? 'خيار التراجع البرمجي متوفر' : 'Safe Schema Rollback Target'}</span>
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-mono mt-0.5 block">{selectedMig.rollbackVersion}</span>
                </div>
                {selectedMig.status === 'success' && (
                  <button
                    onClick={() => {
                      setSelectedMig(null);
                      startRollback(selectedMig);
                    }}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[10px] font-bold cursor-pointer transition-colors"
                  >
                    {isRtl ? 'بدء التراجع' : 'Start Rollback'}
                  </button>
                )}
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedMig(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-xs font-bold cursor-pointer"
              >
                {isRtl ? 'إغلاق' : 'Close details'}
              </button>
            </div>
          </div>
        )}
      </ModalWrapper>

      {/* Schema Rollback Modal */}
      <ModalWrapper
        isOpen={showRollbackModal}
        onClose={() => !isRollingBack && setShowRollbackModal(false)}
        title={isRtl ? 'تحذير: تراجع مخطط قاعدة البيانات' : 'WARNING: Database Rollback Sequence'}
      >
        {targetRollbackMig && (
          <div className="space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <div className="flex gap-3 bg-red-50/50 dark:bg-red-955/10 border border-red-200 dark:border-red-900/30 p-3.5 rounded-xl text-[11px] text-red-750 dark:text-red-400">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-bold">{isRtl ? 'انتبه: خطر خسارة جزئية للبيانات' : 'CRITICAL WARNING: Destructive Actions'}</p>
                <p className="leading-relaxed mt-1">
                  {isRtl 
                    ? `التراجع عن الترقية ${targetRollbackMig.version} سيعيد المخطط إلى النسخة ${targetRollbackMig.rollbackVersion}. قد يؤدي هذا إلى إلغاء أي فهارس أو أعمدة تم استحداثها بعد هذا التاريخ.` 
                    : `Rolling back version ${targetRollbackMig.version} restores schema version ${targetRollbackMig.rollbackVersion}. This will drop indexes, column definitions, and might invalidate queued backlog transactions.`
                  }
                </p>
              </div>
            </div>

            {isRollingBack ? (
              <div className="space-y-3 py-2">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 font-mono">
                  <span>{isRtl ? 'جاري تنفيذ أمر التراجع...' : 'Applying DB DDL schema rollback...'}</span>
                  <span>{rollbackProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-red-500 h-full transition-all duration-200 ease-out"
                    style={{ width: `${rollbackProgress}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-mono text-center">
                  {rollbackProgress < 40 && (isRtl ? 'إيقاف عمليات الكتابة النشطة...' : 'Halt active transaction sessions...')}
                  {rollbackProgress >= 40 && rollbackProgress < 80 && (isRtl ? 'سحب المخطط البرمجي وفصل الفهارس...' : 'Executing SQL revert & purging index metadata...')}
                  {rollbackProgress >= 80 && (isRtl ? 'إعادة تشغيل فهارس الفحص الذاتي...' : 'Rebuilding schema catalogs...')}
                </p>
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRollbackModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={confirmRollback}
                  className="px-4 py-2 bg-red-650 hover:bg-red-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  {isRtl ? 'تأكيد التراجع' : 'Confirm Rollback'}
                </button>
              </div>
            )}
          </div>
        )}
      </ModalWrapper>

    </div>
  );
}

