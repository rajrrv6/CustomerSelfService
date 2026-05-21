import React, { useState } from 'react';
import { ArrowRightLeft } from 'lucide-react';
import { Agent } from '@/types';
import { ModalWrapper } from '../shared/ModalWrapper';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: Agent[];
  onTransfer: (agentId: string, notes: string) => void;
}

export function TransferModal({ isOpen, onClose, agents, onTransfer }: TransferModalProps) {
  const [selectedAgent, setSelectedAgent] = useState(agents[1]?.id || 'agent-2');
  const [consultNotes, setConsultNotes] = useState('');

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Transfer / Consult Agent" maxWidthClass="max-w-sm">
      <div className="space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
        <div>
          <label htmlFor="agent-select" className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase font-mono tracking-wider">Select Support Agent</label>
          <select
            id="agent-select"
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent dark:bg-slate-950/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-500"
          >
            {agents.map((ag) => (
              <option key={ag.id} value={ag.id} className="dark:bg-slate-900">
                {ag.name} ({ag.activeChatsCount}/{ag.maxChatsCount} busy)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="consult-notes" className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase font-mono tracking-wider">Consultation Notes (Sent to Agent)</label>
          <textarea
            id="consult-notes"
            placeholder="Provide context for the receiving agent..."
            value={consultNotes}
            onChange={(e) => setConsultNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent dark:bg-slate-950/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-500 resize-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={() => onTransfer(selectedAgent, consultNotes)}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
          >
            Transfer Case
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}
