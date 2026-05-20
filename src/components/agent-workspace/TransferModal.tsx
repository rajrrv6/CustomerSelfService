import React, { useState } from 'react';
import { ArrowRightLeft } from 'lucide-react';
import { Agent } from '@/types';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: Agent[];
  onTransfer: (agentId: string, notes: string) => void;
}

export function TransferModal({ isOpen, onClose, agents, onTransfer }: TransferModalProps) {
  const [selectedAgent, setSelectedAgent] = useState(agents[1]?.id || 'agent-2');
  const [consultNotes, setConsultNotes] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-50/95 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-sm w-full rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 text-xs font-semibold">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-100/70 dark:bg-slate-950/20">
          <div className="flex items-center gap-1.5">
            <ArrowRightLeft className="w-4 h-4 text-blue-500" />
            <h3 className="font-bold text-slate-800 dark:text-white">Transfer / Consult Agent</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-lg">×</button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">Select Support Agent</label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none"
            >
              {agents.map((ag) => (
                <option key={ag.id} value={ag.id}>
                  {ag.name} ({ag.activeChatsCount}/{ag.maxChatsCount} busy)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">Consultation Notes (Sent to Agent)</label>
            <textarea
              placeholder="Provide context for the receiving agent..."
              value={consultNotes}
              onChange={(e) => setConsultNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={() => onTransfer(selectedAgent, consultNotes)}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
            >
              Transfer Case
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
