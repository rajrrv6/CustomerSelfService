import React, { useState } from 'react';
import { ClipboardCheck, Calendar } from 'lucide-react';

interface WrapupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResolve: (code: string, notes: string, followUpDate?: string) => void;
  slaStatus: 'within_sla' | 'breached' | 'warning';
}

export function WrapupModal({ isOpen, onClose, onResolve, slaStatus }: WrapupModalProps) {
  const [resolutionCode, setResolutionCode] = useState('REFUND_PROCESSED');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onResolve(resolutionCode, resolutionNotes, followUpDate || undefined);
    setResolutionNotes('');
    setFollowUpDate('');
  };

  const slaLabels = {
    within_sla: { bg: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400', label: 'WITHIN SLA TARGET' },
    warning: { bg: 'bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400', label: 'SLA WARNING STAGE' },
    breached: { bg: 'bg-rose-50 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400', label: 'SLA BREACHED' }
  };

  const activeSla = slaLabels[slaStatus] || slaLabels.within_sla;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-slate-50/95 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-sm w-full rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 text-xs font-semibold">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-100/70 dark:bg-slate-950/20">
          <div className="flex items-center gap-1.5">
            <ClipboardCheck className="w-4.5 h-4.5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 dark:text-white">Resolve Case & Disposition</h3>
          </div>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-lg">×</button>
        </div>

        <div className="p-5 space-y-4">
          {/* SLA Outcome Badge */}
          <div className={`p-2.5 rounded-xl border flex items-center justify-between ${activeSla.bg}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Case SLA Outcome</span>
            <span className="font-mono text-[9px] font-extrabold uppercase px-2 py-0.5 bg-white/70 dark:bg-slate-950/40 rounded text-current">
              {activeSla.label}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">Resolution Code</label>
            <select
              value={resolutionCode}
              onChange={(e) => setResolutionCode(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none"
            >
              <option value="REFUND_PROCESSED">REFUND_PROCESSED (Billing Approval)</option>
              <option value="ADDRESS_CORRECTED">ADDRESS_CORRECTED (SAP Sync)</option>
              <option value="ROUTING_ACTIVATED">ROUTING_ACTIVATED (Data Roaming)</option>
              <option value="TECH_ESCALATED">TECH_ESCALATED (Level-3 Queue)</option>
              <option value="GENERAL_INFO">GENERAL_INFO (Inquiry Answered)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">Resolution / Close Notes</label>
            <textarea
              required
              placeholder="Detail the case outcome for audit tracking..."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">Schedule Follow-up (Optional)</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-md"
            >
              Confirm Resolution
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
