'use client';

import React from 'react';
import { useUIStore } from '@/stores/uiStore';
import { AuditEvent } from '@/types/audit';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { AuditStatusBadge } from './AuditStatusBadge';
import { Calendar, User, ShieldAlert, Monitor, Globe, FileText, X } from 'lucide-react';

interface AuditEventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: AuditEvent | null;
}

export function AuditEventDetailsModal({ isOpen, onClose, event }: AuditEventDetailsModalProps) {
  const lang = useUIStore((s) => s.lang);
  const isRtl = lang === 'ar';

  if (!event) return null;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={isRtl ? 'تفاصيل سجل التدقيق الأمني' : 'Security Audit Log Details'}
    >
      <div className="space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
        {/* Header summary */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="text-xs font-bold text-slate-400 font-mono tracking-wider">EVENT ID: {event.id}</h4>
            <div className="flex items-center gap-2 mt-1.5">
              <AuditStatusBadge type="severity" value={event.severity} />
              <AuditStatusBadge type="status" value={event.status} />
            </div>
          </div>
          <div className="text-end">
            <span className="text-[10px] text-slate-400 block font-mono">{isRtl ? 'طابع الوقت' : 'TIMESTAMP'}</span>
            <span className="text-xs font-bold text-slate-900 dark:text-white font-mono flex items-center gap-1 mt-0.5 justify-end">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              {event.timestamp.replace('T', ' ').replace('Z', ' UTC')}
            </span>
          </div>
        </div>

        {/* Core fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
              {isRtl ? 'المستأجر المعني' : 'Client Organization'}
            </span>
            <span className="text-xs font-extrabold text-slate-900 dark:text-white block mt-1">
              {event.tenantName}
            </span>
            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">ID: {event.tenantId}</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
              {isRtl ? 'المسؤول / الفاعل' : 'Actor / Initiated By'}
            </span>
            <span className="text-xs font-extrabold text-slate-900 dark:text-white block mt-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-450" />
              {event.actor}
            </span>
            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{event.actorRole}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
              {isRtl ? 'نوع العملية' : 'Action Class'}
            </span>
            <span className="text-xs font-extrabold text-blue-600 dark:text-blue-450 block mt-1 font-mono">
              {event.actionType}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
              {isRtl ? 'عنوان IP المصدر' : 'Source IP Address'}
            </span>
            <span className="text-xs font-extrabold text-slate-900 dark:text-white block mt-1 font-mono flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-slate-400" />
              {event.ipAddress}
            </span>
          </div>
        </div>

        {/* Target Resource */}
        <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
            {isRtl ? 'المورد المستهدف' : 'Target Resource Entity'}
          </span>
          <span className="text-xs font-bold text-slate-900 dark:text-white block mt-1 font-mono bg-white dark:bg-slate-950 p-2 rounded-lg border border-slate-200/50 dark:border-slate-850">
            {event.targetResource}
          </span>
        </div>

        {/* Event description */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            {isRtl ? 'وصف العملية والأحداث المخزنة' : 'Log Entry Description'}
          </label>
          <div className="w-full bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 border border-slate-100 dark:border-slate-800/80 rounded-xl leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
            {event.details}
          </div>
        </div>

        {/* Compliance impact */}
        {event.complianceImpact && (
          <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 dark:border-amber-500/30 rounded-xl p-3.5 flex gap-3">
            <Globe className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-[10px] font-bold text-amber-800 dark:text-amber-500 uppercase tracking-wider font-mono">
                {isRtl ? 'تأثير التوافق والامتثال السيادي' : 'Compliance & Governance Impact'}
              </h5>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1 leading-relaxed font-semibold">
                {event.complianceImpact}
              </p>
            </div>
          </div>
        )}

        {/* Footer controls */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer text-slate-700 dark:text-slate-300"
          >
            {isRtl ? 'إغلاق السجل' : 'Close Audit View'}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}
