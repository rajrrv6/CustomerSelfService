import React, { useState } from 'react';
import { ExportJob } from './types';
import { Download, AlertCircle, RefreshCw, Trash2, CheckCircle2, Clock } from 'lucide-react';

interface ExportJobCardProps {
  job: ExportJob;
  onRetry: (id: string) => void;
  onDelete: (id: string) => void;
  lang: 'en' | 'ar';
}

export function ExportJobCard({ job, onRetry, onDelete, lang }: ExportJobCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatSize = (bytes?: number) => {
    if (!bytes) return '---';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusBadge = (status: ExportJob['status']) => {
    const configs = {
      queued: {
        text: lang === 'ar' ? 'في الانتظار' : 'Queued',
        style: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-350 dark:border-slate-700',
        icon: <Clock className="w-3.5 h-3.5" />,
      },
      processing: {
        text: lang === 'ar' ? 'جاري المعالجة' : 'Compiling',
        style: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-900',
        icon: <RefreshCw className="w-3.5 h-3.5 animate-spin" />,
      },
      completed: {
        text: lang === 'ar' ? 'اكتمل' : 'Ready',
        style: 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:text-emerald-400 dark:border-emerald-900',
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      },
      failed: {
        text: lang === 'ar' ? 'فشل' : 'Failed',
        style: 'bg-rose-500/10 text-rose-600 border-rose-200 dark:text-rose-400 dark:border-rose-900',
        icon: <AlertCircle className="w-3.5 h-3.5" />,
      },
    }[status];

    return (
      <span className={`flex items-center gap-1 text-[9.5px] font-bold px-2 py-0.5 rounded-full border ${configs.style}`}>
        {configs.icon}
        {configs.text}
      </span>
    );
  };

  // Triggers mock client-side file download
  const handleDownload = () => {
    if (job.status !== 'completed') return;

    const data = [
      { id: 'REC-01', timestamp: job.timestamp, module: job.module, format: job.format, status: 'Exported Compliance Record' }
    ];
    const stringData = job.format === 'JSON' 
      ? JSON.stringify(data, null, 2)
      : 'ID,Timestamp,Module,Format,Status\nREC-01,' + job.timestamp + ',' + job.module + ',' + job.format + ',Exported Compliance Record';
      
    const mimeType = job.format === 'JSON' ? 'application/json' : 'text/csv';
    const blob = new Blob([stringData], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `compliance_export_${job.module.toLowerCase()}_${job.id}.${job.format.toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const t = {
    en: {
      bytes: 'Size',
      download: 'Download File',
      retry: 'Retry compilation',
      delete: 'Delete job',
      confirmDelete: 'Are you sure?',
      yes: 'Yes',
      no: 'No',
    },
    ar: {
      bytes: 'الحجم',
      download: 'تحميل الملف',
      retry: 'إعادة المحاولة',
      delete: 'حذف المهمة',
      confirmDelete: 'هل أنت متأكد؟',
      yes: 'نعم',
      no: 'لا',
    },
  }[lang] || {
    bytes: 'Size',
    download: 'Download File',
    retry: 'Retry compilation',
    delete: 'Delete job',
    confirmDelete: 'Are you sure?',
    yes: 'Yes',
    no: 'No',
  };

  return (
    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-3 hover:border-slate-300 dark:hover:border-slate-750">
      <div className="space-y-1" style={{ textAlign: lang === 'ar' ? 'right' : 'left' }}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-xs text-slate-900 dark:text-white">
            {job.module} ({job.format})
          </span>
          {getStatusBadge(job.status)}
        </div>
        <span className="block text-[9px] text-slate-400 font-mono">
          ID: {job.id} • {new Date(job.timestamp).toLocaleString()}
        </span>
        
        {job.status === 'processing' && (
          <div className="w-48 pt-1.5">
            <div className="flex justify-between items-center text-[8.5px] font-bold text-slate-400 font-mono mb-1">
              <span>Progressing</span>
              <span>{job.progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${job.progress}%` }} />
            </div>
          </div>
        )}

        {job.error && (
          <span className="block text-[9px] text-rose-500 font-semibold mt-1">
            Error: {job.error}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:self-center shrink-0">
        <div className="text-[10px] text-slate-450 dark:text-slate-400 font-semibold font-mono pr-2 border-r border-slate-150 dark:border-slate-800 mr-1">
          {t.bytes}: <span className="font-bold text-slate-700 dark:text-slate-250">{formatSize(job.sizeBytes)}</span>
        </div>

        {/* Action controls */}
        {job.status === 'completed' && (
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold transition-all cursor-pointer shadow-sm shadow-emerald-500/10"
            title={t.download}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.download}</span>
          </button>
        )}

        {job.status === 'failed' && (
          <button
            type="button"
            onClick={() => onRetry(job.id)}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-bold transition-all cursor-pointer"
            title={t.retry}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t.retry}</span>
          </button>
        )}

        {/* Delete button with confirmation state */}
        {showDeleteConfirm ? (
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 flex items-center gap-1.5 animate-in zoom-in-95 duration-100">
            <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider pl-1">{t.confirmDelete}</span>
            <button
              type="button"
              onClick={() => {
                onDelete(job.id);
                setShowDeleteConfirm(false);
              }}
              className="px-2 py-0.5 bg-rose-600 text-white rounded text-[8.5px] font-bold cursor-pointer"
            >
              {t.yes}
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              className="px-2 py-0.5 bg-slate-250 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[8.5px] font-bold cursor-pointer"
            >
              {t.no}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="p-1.5 border border-slate-200 dark:border-slate-800 hover:border-rose-500 hover:text-rose-500 text-slate-400 rounded-xl transition-all cursor-pointer bg-slate-50/20"
            title={t.delete}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
