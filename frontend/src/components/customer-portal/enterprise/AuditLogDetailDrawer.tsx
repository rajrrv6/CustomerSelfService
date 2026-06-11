import React, { useEffect, useRef } from 'react';
import { AuditRecord } from './types';
import { X, ShieldAlert, Cpu, Landmark, Clock, ArrowRight } from 'lucide-react';

interface AuditLogDetailDrawerProps {
  record: AuditRecord | null;
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'ar';
}

export function AuditLogDetailDrawer({ record, isOpen, onClose, lang }: AuditLogDetailDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Trap focus & close on Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Focus close button on mount
    const closeBtn = drawerRef.current?.querySelector('button');
    closeBtn?.focus();

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !record) return null;

  const severityColors = {
    critical: 'bg-rose-500/10 text-rose-500 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900',
    warning: 'bg-amber-500/10 text-amber-500 border-amber-200 dark:bg-amber-955/20 dark:border-amber-900',
    info: 'bg-blue-500/10 text-blue-500 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900',
  }[record.severity];

  const t = {
    en: {
      details: 'Audit Log Details',
      action: 'Action Perform',
      actor: 'Initiated By',
      module: 'Module Scope',
      timestamp: 'Logged Time',
      metadata: 'System Metadata',
      changeset: 'Governance Changeset (Diff)',
      before: 'Before State',
      after: 'After State',
      noDiff: 'No state modifications were applied to this entry.',
    },
    ar: {
      details: 'تفاصيل سجل التدقيق',
      action: 'الإجراء المنجز',
      actor: 'المنفذ بواسطة',
      module: 'نطاق الوحدة',
      timestamp: 'وقت التسجيل',
      metadata: 'بيانات النظام الفنية',
      changeset: 'مجموعة التغييرات (الفروقات)',
      before: 'الحالة السابقة',
      after: 'الحالة الجديدة',
      noDiff: 'لم يتم تطبيق أي تعديلات في الحالة على هذا السجل.',
    },
  }[lang] || {
    details: 'Audit Log Details',
    action: 'Action Perform',
    actor: 'Initiated By',
    module: 'Module Scope',
    timestamp: 'Logged Time',
    metadata: 'System Metadata',
    changeset: 'Governance Changeset (Diff)',
    before: 'Before State',
    after: 'After State',
    noDiff: 'No state modifications were applied to this entry.',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-xs z-50 transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="audit-drawer-title"
        className={`fixed top-0 bottom-0 ${
          lang === 'ar' ? 'left-0' : 'right-0'
        } w-full sm:w-[460px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-6 overflow-y-auto animate-in ${
          lang === 'ar' ? 'slide-in-from-left' : 'slide-in-from-right'
        } duration-200 flex flex-col`}
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 id="audit-drawer-title" className="font-bold text-sm text-slate-900 dark:text-white">
              {t.details}
            </h3>
            <span className="text-[9px] font-mono text-slate-400 block mt-0.5">{record.id}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer text-slate-400 hover:text-slate-650"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-5 py-5 text-xs">
          {/* Main Info */}
          <div className="space-y-3">
            <div>
              <span className="block text-[8.5px] uppercase font-bold text-slate-400 font-mono tracking-wider mb-1">
                {t.action}
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-150 text-[13px] leading-snug">
                {record.action}
              </p>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <span className="block text-[8.5px] uppercase font-bold text-slate-400 font-mono tracking-wider mb-0.5">
                  {t.module}
                </span>
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800/80 rounded-md font-mono text-[10px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50">
                  {record.module}
                </span>
              </div>
              <div>
                <span className="block text-[8.5px] uppercase font-bold text-slate-400 font-mono tracking-wider mb-0.5">
                  Severity
                </span>
                <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${severityColors}`}>
                  {record.severity}
                </span>
              </div>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Details Metadata */}
          <div className="space-y-3.5 bg-slate-50/50 dark:bg-slate-900/20 p-4 border border-slate-150 dark:border-slate-850 rounded-2xl">
            <h4 className="font-extrabold text-[10px] uppercase text-slate-400 tracking-wider font-mono flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              {t.metadata}
            </h4>

            <div className="space-y-2.5 font-medium text-slate-600 dark:text-slate-350">
              <div className="flex justify-between items-center text-[10.5px]">
                <span className="text-slate-400 font-semibold">{t.actor}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{record.actor}</span>
              </div>
              <div className="flex justify-between items-center text-[10.5px]">
                <span className="text-slate-400 font-semibold">IP Address / Geo</span>
                <span className="font-bold text-slate-800 dark:text-slate-250 font-mono">
                  {record.ip} ({record.region})
                </span>
              </div>
              <div className="flex justify-between items-center text-[10.5px]">
                <span className="text-slate-400 font-semibold">Client Agent</span>
                <span className="truncate max-w-[220px] font-mono text-[9.5px] text-right" title={record.userAgent}>
                  {record.userAgent}
                </span>
              </div>
              <div className="flex justify-between items-center text-[10.5px] border-t border-slate-150/60 dark:border-slate-800/60 pt-2">
                <span className="text-slate-400 font-semibold">Session Token ID</span>
                <span className="font-bold text-[9px] font-mono text-slate-550 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                  {record.sessionId}
                </span>
              </div>
              <div className="flex justify-between items-center text-[10.5px]">
                <span className="text-slate-400 font-semibold">{t.timestamp}</span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                  {new Date(record.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Governance Changeset Diff */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-[10px] uppercase text-slate-400 tracking-wider font-mono flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5" />
              {t.changeset}
            </h4>

            {record.diff ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden bg-rose-50/10 dark:bg-rose-950/5">
                  <div className="bg-rose-500/10 border-b border-rose-200/50 px-3 py-1.5 text-[8.5px] font-mono font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    {t.before}
                  </div>
                  <pre className="p-3 text-[9px] font-mono text-rose-600 dark:text-rose-455 overflow-x-auto leading-relaxed max-h-40">
                    {JSON.stringify(record.diff.before, null, 2)}
                  </pre>
                </div>

                <div className="border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden bg-emerald-50/10 dark:bg-emerald-950/5">
                  <div className="bg-emerald-500/10 border-b border-emerald-200/50 px-3 py-1.5 text-[8.5px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    {t.after}
                  </div>
                  <pre className="p-3 text-[9px] font-mono text-emerald-600 dark:text-emerald-450 overflow-x-auto leading-relaxed max-h-40">
                    {JSON.stringify(record.diff.after, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 font-normal leading-normal italic py-1.5">
                {t.noDiff}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
