import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { ExportJob } from './types';
import { ExportJobCard } from './ExportJobCard';
import { DownloadCloud, Info, Database, Plus, CheckCircle } from 'lucide-react';

export function ExportCenter() {
  const { lang, addAuditLog } = useApp();
  const [jobs, setJobs] = useState<ExportJob[]>([]);
  const [selectedModule, setSelectedModule] = useState('Audit Logs');
  const [selectedFormat, setSelectedFormat] = useState<'CSV' | 'JSON' | 'PDF'>('CSV');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Ref to hold intervals so we can clean them up
  const intervalsRef = useRef<Record<string, NodeJS.Timeout>>({});

  // 1. LocalStorage Persistence initialization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('compliance_export_jobs');
      if (stored) {
        try {
          const parsedJobs = JSON.parse(stored) as ExportJob[];
          setJobs(parsedJobs);

          // Resume any jobs that were compiling (processing/queued) when refreshed
          parsedJobs.forEach(job => {
            if (job.status === 'processing' || job.status === 'queued') {
              startJobSim(job.id, job.progress);
            }
          });
        } catch (e) {
          loadDefaultJobs();
        }
      } else {
        loadDefaultJobs();
      }
    }

    return () => {
      // Clean up all running intervals on unmount
      Object.values(intervalsRef.current).forEach(clearInterval);
    };
  }, []);

  const loadDefaultJobs = () => {
    const defaultJobs: ExportJob[] = [
      {
        id: 'job-901',
        module: 'Compliance Audit Logs',
        format: 'JSON',
        progress: 100,
        status: 'completed',
        sizeBytes: 42410,
        timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
      },
      {
        id: 'job-902',
        module: 'Active User Seats',
        format: 'CSV',
        progress: 100,
        status: 'completed',
        sizeBytes: 1540,
        timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
      },
      {
        id: 'job-903',
        module: 'SSO Federation Setup',
        format: 'PDF',
        progress: 100,
        status: 'failed',
        timestamp: new Date(Date.now() - 48 * 3600000).toISOString(),
        error: 'IdP metadata validation failed during compression signature check.',
      },
    ];
    setJobs(defaultJobs);
    localStorage.setItem('compliance_export_jobs', JSON.stringify(defaultJobs));
  };

  // Helper to update state and sync to localStorage
  const updateJobsAndSync = (updated: ExportJob[]) => {
    setJobs(updated);
    localStorage.setItem('compliance_export_jobs', JSON.stringify(updated));
  };

  // 2. Simulated Background Compiler Timer
  const startJobSim = (id: string, startProgress = 0) => {
    // Clear existing interval if any
    if (intervalsRef.current[id]) {
      clearInterval(intervalsRef.current[id]);
    }

    let currentProgress = startProgress;

    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 15) + 5; // increment progress randomly

      setJobs(prev => {
        const nextJobs = prev.map(job => {
          if (job.id === id) {
            if (currentProgress >= 100) {
              clearInterval(intervalsRef.current[id]);
              delete intervalsRef.current[id];

              // Determine if this job fails (15% failure rate for demoing workflows)
              const isFailure = job.module.toLowerCase().includes('sso') && Math.random() > 0.5;

              addAuditLog(
                isFailure
                  ? `Compliance export compilation failed for job ${id}`
                  : `Compliance export ready for download: ${job.module} (${job.format})`,
                isFailure ? 'failed' : 'success'
              );

              return {
                ...job,
                progress: 100,
                status: isFailure ? ('failed' as const) : ('completed' as const),
                sizeBytes: isFailure ? undefined : Math.floor(Math.random() * 80000) + 5000,
                error: isFailure ? 'SAML encryption certificate verification check failed.' : undefined,
              };
            }
            return {
              ...job,
              status: 'processing' as const,
              progress: currentProgress,
            };
          }
          return job;
        });

        // Sync to localStorage
        localStorage.setItem('compliance_export_jobs', JSON.stringify(nextJobs));
        return nextJobs;
      });
    }, 1000);

    intervalsRef.current[id] = interval;
  };

  // Submit form
  const handleRequestExport = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const jobId = `job-${Math.floor(100 + Math.random() * 900)}`;
    const newJob: ExportJob = {
      id: jobId,
      module: selectedModule,
      format: selectedFormat,
      progress: 0,
      status: 'queued' as const,
      timestamp: new Date().toISOString(),
    };

    const newJobsList = [newJob, ...jobs];
    updateJobsAndSync(newJobsList);
    addAuditLog(`Queued compliance export job ${jobId} for ${selectedModule}`);

    // Trigger simulation
    setTimeout(() => {
      startJobSim(jobId);
    }, 500);

    setSuccessMessage(`Compilation job "${jobId}" has been initialized.`);
    setIsSubmitting(false);

    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  // Retry failed jobs
  const handleRetryJob = (id: string) => {
    const updated = jobs.map(j => {
      if (j.id === id) {
        return {
          ...j,
          status: 'queued' as const,
          progress: 0,
          error: undefined,
        };
      }
      return j;
    });

    updateJobsAndSync(updated);
    addAuditLog(`Retried compilation for export job ${id}`);
    startJobSim(id, 0);
  };

  // Delete jobs
  const handleDeleteJob = (id: string) => {
    // Clear any active running compilation timers
    if (intervalsRef.current[id]) {
      clearInterval(intervalsRef.current[id]);
      delete intervalsRef.current[id];
    }

    const filtered = jobs.filter(j => j.id !== id);
    updateJobsAndSync(filtered);
    addAuditLog(`Deleted compliance export job record ${id}`);
  };

  const t = {
    en: {
      title: 'Compliance & Export Center',
      desc: 'Request encrypted snapshots of access directories, audit feeds, and configuration settings for external governance audits.',
      formTitle: 'Generate Compliance Snapshot',
      selectModule: 'Select Target Scope',
      selectFormat: 'File Format',
      submit: 'Initialize Compilation',
      jobsTitle: 'Download Compilation History',
      disclaimer: 'Generated files are signed and encrypted. Export data complies with ISO 27001 data-access protocols.',
    },
    ar: {
      title: 'مركز التصدير والامتثال',
      desc: 'طلب لقطات مشفرة من سجلات الوصول، والتدقيق، وبيانات التهيئة لعمليات تدقيق الحوكمة الخارجية.',
      formTitle: 'توليد لقطة امتثال',
      selectModule: 'اختر النطاق المستهدف',
      selectFormat: 'صيغة الملف',
      submit: 'بدء تجميع البيانات',
      jobsTitle: 'سجل ملفات التصدير الجاهزة',
      disclaimer: 'الملفات التي يتم إنشاؤها موقعة ومشفرة. تتوافق عمليات التصدير مع بروتوكولات الوصول ISO 27001.',
    },
  }[lang] || {
    title: 'Compliance & Export Center',
    desc: 'Request encrypted snapshots of access directories, audit feeds, and configuration settings for external governance audits.',
    formTitle: 'Generate Compliance Snapshot',
    selectModule: 'Select Target Scope',
    selectFormat: 'File Format',
    submit: 'Initialize Compilation',
    jobsTitle: 'Download Compilation History',
    disclaimer: 'Generated files are signed and encrypted. Export data complies with ISO 27001 data-access protocols.',
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight flex items-center gap-2">
          <DownloadCloud className="w-4.5 h-4.5 text-blue-500" />
          {t.title}
        </h3>
        <p className="text-[10px] text-slate-450 dark:text-slate-400 font-semibold block mt-0.5">
          {t.desc}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Form panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <h4 className="font-bold text-xs text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2.5">
            <Plus className="w-4 h-4 text-blue-500" />
            {t.formTitle}
          </h4>

          <form onSubmit={handleRequestExport} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-350">
            <div className="space-y-1.5">
              <label className="block text-[9.5px] uppercase font-bold text-slate-400 font-mono tracking-wider">
                {t.selectModule}
              </label>
              <select
                value={selectedModule}
                onChange={e => setSelectedModule(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <option value="Compliance Audit Logs">Compliance Audit Logs</option>
                <option value="Active Session Roster">Active Session Roster</option>
                <option value="SSO Federation Setup">SSO Federation Setup</option>
                <option value="Rate Limit Metrics">Rate Limit Metrics</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[9.5px] uppercase font-bold text-slate-400 font-mono tracking-wider">
                {t.selectFormat}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['CSV', 'JSON', 'PDF'] as const).map(fmt => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setSelectedFormat(fmt)}
                    className={`py-2 text-center rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
                      selectedFormat === fmt
                        ? 'bg-blue-500 border-blue-550 text-white shadow-sm shadow-blue-500/15'
                        : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white rounded-xl text-[10.5px] font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Database className="w-4 h-4" />
              <span>{t.submit}</span>
            </button>
          </form>

          <div className="flex gap-2 items-start bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-150 dark:border-slate-850">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-[9px] text-slate-450 dark:text-slate-400 leading-normal font-medium">
              {t.disclaimer}
            </p>
          </div>
        </div>

        {/* History panel */}
        <div className="md:col-span-2 space-y-3.5">
          <span className="block text-[9px] uppercase font-mono font-bold text-slate-400 tracking-wider">
            {t.jobsTitle} ({jobs.length})
          </span>

          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {jobs.length === 0 ? (
              <p className="text-center py-8 text-xs text-slate-400 font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
                No compliance snapshots queued yet.
              </p>
            ) : (
              jobs.map(job => (
                <ExportJobCard
                  key={job.id}
                  job={job}
                  onRetry={handleRetryJob}
                  onDelete={handleDeleteJob}
                  lang={lang}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="fixed bottom-24 right-6 z-50 bg-emerald-650 text-white font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-500 animate-bounce text-xs font-mono">
          <CheckCircle className="w-4 h-4" />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
}
