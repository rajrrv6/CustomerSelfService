'use client';

import React, { useState } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';
import { mockJobs } from './mockSystemOperationsData';
import { OperationalJob, JobStatus } from '@/types/systemOperations';
import { SystemOpsStatusBadge } from './SystemOpsStatusBadge';
import { useFeedbackToasts } from '@/components/customer-portal/feedback/PostChatToasts';
import { Search, RotateCcw, XOctagon, RefreshCw, Layers, ServerCrash, Terminal, X, Copy, Play, ShieldAlert } from 'lucide-react';
import { ModalWrapper } from '@/components/shared/ModalWrapper';

export function JobsQueueTab() {
  const lang = useUIStore((s) => s.lang);
  const isRtl = lang === 'ar';
  const { addAuditLog } = useApp();
  const { pushToast } = useFeedbackToasts();
  const t = translations[lang];

  const sysOpsT = (t.superAdmin as any).systemOps || {
    jobs: {
      searchPlaceholder: 'Search jobs by ID or name...',
      tableHeaders: ['Job ID / Name', 'Source Queue', 'Triggered By', 'Duration', 'Retries', 'Status', 'Actions'],
      emptyTitle: 'No Queue Jobs Found',
      emptyDesc: 'There are no active or pending background jobs in the queue.',
      abortSuccess: 'Job execution aborted successfully.',
      retrySuccess: 'Successfully triggered job retry.',
      requeueSuccess: 'Job re-queued to backlog.'
    }
  };
  const [jobs, setJobs] = useState<OperationalJob[]>(mockJobs);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Action confirmations state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'retry' | 'abort' | 'requeue' | null>(null);
  const [activeJob, setActiveJob] = useState<OperationalJob | null>(null);
  const [selectedJobForDetails, setSelectedJobForDetails] = useState<OperationalJob | null>(null);

  // Stats calculation
  const totalJobs = jobs.length;
  const runningJobs = jobs.filter(j => j.status === 'running').length;
  const failedJobs = jobs.filter(j => j.status === 'failed').length;
  const pendingJobs = jobs.filter(j => j.status === 'pending').length;

  const triggerAction = (job: OperationalJob, action: 'retry' | 'abort' | 'requeue') => {
    setActiveJob(job);
    setConfirmAction(action);
    setShowConfirmModal(true);
  };

  const confirmJobAction = () => {
    if (!activeJob || !confirmAction) return;

    if (confirmAction === 'retry') {
      setJobs(prev => prev.map(j => 
        j.id === activeJob.id 
          ? { ...j, status: 'running', retries: j.retries + 1, errorDetail: undefined } 
          : j
      ));
      pushToast(
        'success',
        isRtl ? 'تمت إعادة محاولة تشغيل الوظيفة' : 'Retry Triggered',
        isRtl ? `جاري محاولة تشغيل "${activeJob.name}" مجدداً في الخلفية.` : `Initiated execution retry script for "${activeJob.name}".`
      );
      addAuditLog(`Triggered job execution retry: ${activeJob.name} (ID: ${activeJob.id})`, 'success');
    } else if (confirmAction === 'abort') {
      setJobs(prev => prev.map(j => 
        j.id === activeJob.id 
          ? { ...j, status: 'failed', errorDetail: 'Aborted manually by administrator.' } 
          : j
      ));
      pushToast(
        'success',
        isRtl ? 'تم إلغاء الوظيفة' : 'Job Aborted',
        isRtl ? `تم إلغاء تشغيل الوظيفة "${activeJob.name}" بنجاح.` : `Manually aborted task execution parameters for "${activeJob.name}".`
      );
      addAuditLog(`Manually aborted active job: ${activeJob.name} (ID: ${activeJob.id})`, 'success');
    } else if (confirmAction === 'requeue') {
      setJobs(prev => prev.map(j => 
        j.id === activeJob.id 
          ? { ...j, status: 'pending', retries: 0, errorDetail: undefined } 
          : j
      ));
      pushToast(
        'success',
        isRtl ? 'تمت إعادة إدراج الوظيفة في الطابور' : 'Job Re-queued',
        isRtl ? `تمت إعادة جدولة الوظيفة "${activeJob.name}" في طابور المعالجة.` : `Successfully reset retries and re-queued "${activeJob.name}".`
      );
      addAuditLog(`Re-queued backlog job: ${activeJob.name} (ID: ${activeJob.id})`, 'success');
    }

    setShowConfirmModal(false);
    setActiveJob(null);
    setConfirmAction(null);
  };

  // Filters logic
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.queueName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Stats summary grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-inner">
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-400 font-mono">
            {isRtl ? 'إجمالي وظائف الطابور' : 'Queue Backlog Size'}
          </p>
          <p className="text-xl font-bold text-slate-850 dark:text-white mt-0.5">{totalJobs}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-400 font-mono">
            {isRtl ? 'وظائف قيد التشغيل' : 'Active Execution'}
          </p>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">{runningJobs}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-400 font-mono">
            {isRtl ? 'الوظائف المعلقة' : 'Pending Scheduler'}
          </p>
          <p className="text-xl font-bold text-slate-500 mt-0.5">{pendingJobs}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-400 font-mono">
            {isRtl ? 'الوظائف الفاشلة' : 'Failed Logs'}
          </p>
          <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-0.5">{failedJobs}</p>
        </div>
      </div>

      {/* Filter panel */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={sysOpsT.jobs.searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl text-slate-650 dark:text-slate-350 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full md:w-48 cursor-pointer shrink-0"
        >
          <option value="all">{isRtl ? 'جميع حالات طابور الوظائف' : 'All Job States'}</option>
          <option value="pending">{isRtl ? 'معلق' : 'Pending'}</option>
          <option value="running">{isRtl ? 'قيد التشغيل' : 'Running'}</option>
          <option value="completed">{isRtl ? 'مكتمل' : 'Completed'}</option>
          <option value="failed">{isRtl ? 'فاشل' : 'Failed'}</option>
        </select>
      </div>

      {/* Jobs table list */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
                {sysOpsT.jobs.tableHeaders.map((header: string, idx: number) => (
                  <th
                    key={idx}
                    className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-start font-mono"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <tr
                    key={job.id}
                    onClick={() => setSelectedJobForDetails(job)}
                    className="border-b border-slate-100/70 dark:border-slate-800/40 hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-850 dark:text-white">
                          {job.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                          {job.id}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs font-mono text-slate-500 dark:text-slate-400">
                      {job.queueName}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-700 dark:text-slate-300 font-semibold">
                      {job.triggeredBy}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs font-mono text-slate-500 dark:text-slate-400">
                      {job.durationSec > 0 ? `${job.durationSec}s` : '-'}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                      {job.retries}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1 items-start">
                        <SystemOpsStatusBadge status={job.status} />
                        {job.errorDetail && (
                          <span className="text-[9px] text-red-500 font-semibold leading-relaxed max-w-[200px] whitespace-normal block truncate">
                            {job.errorDetail}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs">
                      <div className="flex items-center gap-2">
                        {/* Retry failed job */}
                        {job.status === 'failed' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerAction(job, 'retry');
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
                            title={isRtl ? 'إعادة المحاولة' : 'Retry job'}
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {/* Abort running job */}
                        {(job.status === 'running' || job.status === 'pending') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerAction(job, 'abort');
                            }}
                            className="p-1.5 rounded-lg border border-red-200 bg-red-50/20 text-red-655 hover:bg-red-55/40 cursor-pointer"
                            title={isRtl ? 'إلغاء التشغيل' : 'Abort job'}
                          >
                            <XOctagon className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {/* Requeue job */}
                        {(job.status === 'completed' || job.status === 'failed') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerAction(job, 'requeue');
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-655 dark:text-slate-400 hover:text-indigo-650 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
                            title={isRtl ? 'إعادة الجدولة' : 'Requeue job'}
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <div className="max-w-md mx-auto flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-900 text-slate-400 flex items-center justify-center mb-3">
                        <Layers className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                        {sysOpsT.jobs.emptyTitle}
                      </h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        {sysOpsT.jobs.emptyDesc}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ModalWrapper
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title={
          confirmAction === 'retry' ? (isRtl ? 'إعادة محاولة تشغيل الوظيفة' : 'Retry Job Execution') :
          confirmAction === 'abort' ? (isRtl ? 'إلغاء تشغيل الوظيفة' : 'Abort Active Job') :
          (isRtl ? 'إعادة جدولة الوظيفة في الطابور' : 'Re-queue Backlog Job')
        }
      >
        {activeJob && (
          <div className="space-y-4 text-xs font-semibold text-slate-855 dark:text-slate-200">
            <div className="flex gap-3 bg-blue-50/50 dark:bg-blue-955/10 border border-blue-200 dark:border-blue-900/30 p-3.5 rounded-xl text-[11px] text-blue-700 dark:text-blue-400">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <p className="leading-relaxed">
                {confirmAction === 'retry' && (isRtl ? `هل أنت متأكد من إعادة محاولة تشغيل وظيفة "${activeJob.name}"؟` : `Are you sure you want to trigger a manual retry for "${activeJob.name}"?`)}
                {confirmAction === 'abort' && (isRtl ? `هل أنت متأكد من إلغاء تشغيل وظيفة "${activeJob.name}" فوراً؟` : `CAUTION: Aborting "${activeJob.name}" will terminate processing thread workers immediately.`)}
                {confirmAction === 'requeue' && (isRtl ? `هل أنت متأكد من إعادة جدولة وظيفة "${activeJob.name}" وإعادتها إلى طابور الانتظار؟` : `This will reset the retries counter and move "${activeJob.name}" back to pending queue state.`)}
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-805 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={confirmJobAction}
                className={`px-4 py-2 text-white rounded-xl font-bold cursor-pointer ${
                  confirmAction === 'abort' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isRtl ? 'تأكيد' : 'Confirm'}
              </button>
            </div>
          </div>
        )}
      </ModalWrapper>

      {/* Job Details Drawer Modal */}
      <ModalWrapper
        isOpen={!!selectedJobForDetails}
        onClose={() => setSelectedJobForDetails(null)}
        title={isRtl ? 'تفاصيل حالة وظيفة الطابور' : 'Job Execution Telemetry Details'}
      >
        {selectedJobForDetails && (
          <div className="space-y-4 text-xs font-semibold text-slate-855 dark:text-slate-200">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{selectedJobForDetails.name}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 font-mono">ID: {selectedJobForDetails.id}</p>
              </div>
              <SystemOpsStatusBadge status={selectedJobForDetails.status} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-xl">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">{isRtl ? 'طابور المعالجة' : 'Source Queue'}</span>
                <span className="text-xs font-mono font-bold text-slate-800 dark:text-white mt-1 block">{selectedJobForDetails.queueName}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-xl">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">{isRtl ? 'المشغل الموجب' : 'Triggered By'}</span>
                <span className="text-xs font-bold text-slate-855 dark:text-white mt-1 block">{selectedJobForDetails.triggeredBy}</span>
              </div>
            </div>

            {/* Simulated Payload */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">{isRtl ? 'معاملات التشغيل المستلمة (Payload)' : 'Active Ingestion Payload JSON'}</span>
              <pre className="bg-slate-950 text-blue-400 p-3.5 rounded-xl border border-slate-900 overflow-x-auto text-[9.5px] font-mono leading-relaxed">
                {JSON.stringify({
                  jobId: selectedJobForDetails.id,
                  queue: selectedJobForDetails.queueName,
                  triggeredBy: selectedJobForDetails.triggeredBy,
                  active_worker_threads: 4,
                  params: {
                    dry_run: false,
                    ingestion_batch_size: 250,
                    retries_allowed: 5,
                    alert_on_failure: true
                  }
                }, null, 2)}
              </pre>
            </div>

            {/* Trace Logs Console */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5" />
                <span>{isRtl ? 'سجل تتبع التنفيذ البرمجي' : 'Trace logs console output'}</span>
              </span>
              <div className="bg-slate-950 text-emerald-400 p-3.5 rounded-xl border border-slate-900 overflow-x-auto text-[9.5px] font-mono space-y-1 max-h-36 overflow-y-auto leading-relaxed">
                <div>[0.0s] Worker thread mapped to CPU execution node.</div>
                <div>[0.2s] Ingestion handshake completed for target schema payload.</div>
                {selectedJobForDetails.status === 'completed' && (
                  <>
                    <div>[1.4s] Batch processor initialized: read 142 client nodes.</div>
                    <div>[2.2s] Processed records data streams successfully.</div>
                    <div className="text-emerald-500 font-bold">[2.3s] Job execution finished (Status: COMPLETED).</div>
                  </>
                )}
                {selectedJobForDetails.status === 'failed' && (
                  <>
                    <div>[0.4s] Attempted server request handshake.</div>
                    <div className="text-red-500 font-bold">[0.9s] EXCEPTION: {selectedJobForDetails.errorDetail || 'Connection timeout.'}</div>
                    <div className="text-red-500 font-bold">[1.0s] Job execution halted (Status: FAILED).</div>
                  </>
                )}
                {selectedJobForDetails.status === 'running' && (
                  <>
                    <div>[1.2s] Batch queue loading partitions. Ingesting index chunk 12/25...</div>
                    <div className="animate-pulse text-blue-400">[1.5s] Processing active... (Status: RUNNING)</div>
                  </>
                )}
                {selectedJobForDetails.status === 'pending' && (
                  <div className="text-slate-500 italic">[0.0s] Waiting for idle backlog worker thread... (Status: PENDING)</div>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedJobForDetails(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 rounded-xl text-xs font-bold cursor-pointer"
              >
                {isRtl ? 'إغلاق' : 'Close details'}
              </button>
            </div>
          </div>
        )}
      </ModalWrapper>

    </div>
  );
}
