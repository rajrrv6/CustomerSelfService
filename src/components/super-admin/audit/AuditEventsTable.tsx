'use client';

import React from 'react';
import { useUIStore } from '@/stores/uiStore';
import { AuditEvent } from '@/types/audit';
import { AuditStatusBadge } from './AuditStatusBadge';
import { FileText, Eye, CheckCircle2, Download, AlertCircle } from 'lucide-react';

interface AuditEventsTableProps {
  data: AuditEvent[];
  onViewDetails: (event: AuditEvent) => void;
  onMarkReviewed: (event: AuditEvent) => void;
  onExport: (event: AuditEvent) => void;
}

export function AuditEventsTable({ data, onViewDetails, onMarkReviewed, onExport }: AuditEventsTableProps) {
  const lang = useUIStore((s) => s.lang);
  const isRtl = lang === 'ar';

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center max-w-xl mx-auto space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-900 text-slate-400 flex items-center justify-center border border-slate-100 dark:border-slate-800/80">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider font-mono">
            {isRtl ? 'لا توجد سجلات تدقيق متاحة' : 'No Audit Events Available'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed max-w-sm mx-auto">
            {isRtl
              ? 'لم يتم العثور على أي عمليات مسجلة تطابق محددات البحث النشطة حالياً. حاول تعديل خيارات التصفية.'
              : 'No security logs or operational events match your query parameters. Try clearing search filters to locate audits.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-wider font-mono">
              <th className={`px-4 py-3 text-center ${isRtl ? 'text-right' : 'text-left'}`}>
                {isRtl ? 'معرف السجل / الوقت' : 'Event / Timestamp'}
              </th>
              <th className={`px-4 py-3 ${isRtl ? 'text-right' : 'text-left'}`}>
                {isRtl ? 'الفاعل' : 'Actor'}
              </th>
              <th className={`px-4 py-3 ${isRtl ? 'text-right' : 'text-left'}`}>
                {isRtl ? 'العملية والمورد' : 'Action & Resource'}
              </th>
              <th className={`px-4 py-3 ${isRtl ? 'text-right' : 'text-left'}`}>
                {isRtl ? 'المستأجر' : 'Tenant'}
              </th>
              <th className="px-4 py-3 text-center">
                {isRtl ? 'الخطورة' : 'Severity'}
              </th>
              <th className="px-4 py-3 text-center">
                {isRtl ? 'الحالة' : 'Status'}
              </th>
              <th className="px-4 py-3 text-center">
                {isRtl ? 'الإجراءات' : 'Actions'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold text-slate-700 dark:text-slate-350">
            {data.map((evt) => (
              <tr
                key={evt.id}
                className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors"
              >
                <td className="px-4 py-3 text-center">
                  <div className={`font-mono font-bold text-slate-900 dark:text-white ${isRtl ? 'text-right' : 'text-left'}`}>
                    {evt.id}
                  </div>
                  <div className={`text-[10px] text-slate-400 font-mono mt-0.5 ${isRtl ? 'text-right' : 'text-left'}`}>
                    {evt.timestamp.replace('T', ' ').slice(0, 19)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-extrabold text-slate-800 dark:text-white">{evt.actor}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{evt.actorRole}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-blue-600 dark:text-blue-450 font-mono">{evt.actionType}</div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[180px] font-mono mt-0.5">
                    {evt.targetResource}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-slate-900 dark:text-white font-bold">{evt.tenantName}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <AuditStatusBadge type="severity" value={evt.severity} />
                </td>
                <td className="px-4 py-3 text-center">
                  <AuditStatusBadge type="status" value={evt.status} />
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => onViewDetails(evt)}
                      title={isRtl ? 'عرض التفاصيل' : 'View Details'}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {evt.status === 'open' && (
                      <button
                        onClick={() => onMarkReviewed(evt)}
                        title={isRtl ? 'تعليم كمراجع' : 'Mark Reviewed'}
                        className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 transition-all cursor-pointer border border-emerald-100/30 dark:border-emerald-900/20"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => onExport(evt)}
                      title={isRtl ? 'تصدير السجل' : 'Export Event'}
                      className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-all cursor-pointer border border-blue-100/30 dark:border-blue-900/20"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
