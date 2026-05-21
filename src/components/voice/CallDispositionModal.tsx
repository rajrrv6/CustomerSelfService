import React, { useState } from 'react';
import { ShieldCheck, FileText } from 'lucide-react';
import { ModalWrapper } from '../shared/ModalWrapper';

interface CallDispositionModalProps {
  isOpen: boolean;
  contactName: string;
  phoneNumber: string;
  duration: string;
  onSubmit: (code: string, notes: string) => void;
}

export function CallDispositionModal({
  isOpen,
  contactName,
  phoneNumber,
  duration,
  onSubmit
}: CallDispositionModalProps) {
  const [selectedCode, setSelectedCode] = useState('Inquiry Resolved');
  const [notes, setNotes] = useState('');

  const codes = [
    'Inquiry Resolved',
    'Refund Approved',
    'Callback Scheduled',
    'Escalated to Tier 2',
    'Authentication Mismatch',
    'Complaint Logged',
    'Spam/Incorrect Number'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(selectedCode, notes);
    setNotes('');
    setSelectedCode('Inquiry Resolved');
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={() => {}}
      title="Call Wrap-Up Disposition"
      hideCloseButton={true}
      preventCloseOnOverlayClick={true}
      preventCloseOnEsc={true}
      maxWidthClass="max-w-md"
    >
      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
        {/* Subtitle / Icon info at the top of the body for parity */}
        <div className="flex items-center gap-2 mb-4 p-2.5 bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <span className="text-[10px] font-mono">Select call outcome to complete the voice ticket</span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Caller Profile Info */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 rounded-2xl flex justify-between items-center text-[11px]">
            <div>
              <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold font-mono">Caller:</span>
              <strong className="text-slate-900 dark:text-white block mt-0.5">{contactName}</strong>
              <span className="text-slate-500 font-mono text-[9px]">{phoneNumber}</span>
            </div>
            
            <div className="text-right">
              <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold font-mono">Duration:</span>
              <strong className="text-slate-800 dark:text-slate-200 font-mono block mt-0.5">{duration}</strong>
            </div>
          </div>

          {/* Disposition Codes Select */}
          <div className="space-y-1.5">
            <label className="text-[9px] uppercase tracking-wider text-slate-400 block font-mono">Disposition Code:</label>
            <select
              value={selectedCode}
              onChange={(e) => setSelectedCode(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-500 font-bold text-slate-800 dark:text-slate-200"
            >
              {codes.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </div>

          {/* Call Summary Notes */}
          <div className="space-y-1.5">
            <label className="text-[9px] uppercase tracking-wider text-slate-400 block font-mono">Wrap-Up Notes:</label>
            <div className="relative">
              <textarea
                required
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Detail the call resolution, next action steps, or follow-ups here..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs leading-relaxed outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-500 text-slate-800 dark:text-slate-200 font-normal"
              />
              {notes.trim().length === 0 && (
                <div className="absolute right-3 bottom-3 text-slate-400">
                  <FileText className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span>Complete Voice Session</span>
          </button>
        </form>
      </div>
    </ModalWrapper>
  );
}

