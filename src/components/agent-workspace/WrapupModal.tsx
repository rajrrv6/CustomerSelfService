import React, { useState } from 'react';
import { ClipboardCheck, Calendar } from 'lucide-react';
import { ModalWrapper } from '../shared/ModalWrapper';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';

interface WrapupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResolve: (code: string, notes: string, followUpDate?: string) => void;
  slaStatus: 'within_sla' | 'breached' | 'warning';
}

export function WrapupModal({ isOpen, onClose, onResolve, slaStatus }: WrapupModalProps) {
  const { lang } = useApp();
  const t = translations[lang];
  const [resolutionCode, setResolutionCode] = useState('REFUND_PROCESSED');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onResolve(resolutionCode, resolutionNotes, followUpDate || undefined);
    setResolutionNotes('');
    setFollowUpDate('');
  };

  const slaLabels = {
    within_sla: { bg: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/30', label: t.agentWorkspace.wrapup.withinSlaTarget },
    warning: { bg: 'bg-amber-50 text-amber-800 dark:bg-amber-955/30 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/30', label: t.agentWorkspace.wrapup.slaWarningStage },
    breached: { bg: 'bg-rose-50 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400 border-rose-200/50 dark:border-rose-800/30', label: t.agentWorkspace.wrapup.slaBreached }
  };

  const activeSla = slaLabels[slaStatus] || slaLabels.within_sla;

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title={t.agentWorkspace.wrapup.resolveTitle} maxWidthClass="max-w-sm">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
        {/* SLA Outcome Badge */}
        <div className={`p-2.5 rounded-xl border flex items-center justify-between ${activeSla.bg}`}>
          <span className="text-[10px] font-bold uppercase tracking-wider font-mono">{t.agentWorkspace.wrapup.slaOutcome}</span>
          <span className="font-mono text-[9px] font-extrabold uppercase px-2 py-0.5 bg-white/70 dark:bg-slate-950/40 rounded text-current">
            {activeSla.label}
          </span>
        </div>

        <div>
          <label htmlFor="resolution-code" className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase font-mono tracking-wider">{t.agentWorkspace.wrapup.resolutionCode}</label>
          <select
            id="resolution-code"
            value={resolutionCode}
            onChange={(e) => setResolutionCode(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent dark:bg-slate-950/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-500"
          >
            <option value="REFUND_PROCESSED" className="dark:bg-slate-900">{t.agentWorkspace.wrapup.refundProcessed}</option>
            <option value="ADDRESS_CORRECTED" className="dark:bg-slate-900">{t.agentWorkspace.wrapup.addressCorrected}</option>
            <option value="ROUTING_ACTIVATED" className="dark:bg-slate-900">{t.agentWorkspace.wrapup.routingActivated}</option>
            <option value="TECH_ESCALATED" className="dark:bg-slate-900">{t.agentWorkspace.wrapup.techEscalated}</option>
            <option value="GENERAL_INFO" className="dark:bg-slate-900">{t.agentWorkspace.wrapup.generalInfo}</option>
          </select>
        </div>

        <div>
          <label htmlFor="resolution-notes" className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase font-mono tracking-wider">{t.agentWorkspace.wrapup.resolutionNotes}</label>
          <textarea
            id="resolution-notes"
            required
            placeholder={t.agentWorkspace.wrapup.outcomePlaceholder}
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent dark:bg-slate-950/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-500 resize-none"
          />
        </div>

        <div>
          <label htmlFor="follow-up-date" className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase font-mono tracking-wider">{t.agentWorkspace.wrapup.scheduleFollowup}</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              id="follow-up-date"
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 bg-transparent dark:bg-slate-950/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-500"
          >
            {t.agentWorkspace.wrapup.cancel}
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-600 shadow-md"
          >
            {t.agentWorkspace.wrapup.confirmResolution}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}

