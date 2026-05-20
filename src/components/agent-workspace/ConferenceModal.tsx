import React, { useState } from 'react';
import { Users, PhoneCall } from 'lucide-react';

interface ConferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConference: (participantName: string, destination: string) => void;
}

export function ConferenceModal({ isOpen, onClose, onConference }: ConferenceModalProps) {
  const [participantName, setParticipantName] = useState('');
  const [destination, setDestination] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantName || !destination) return;
    onConference(participantName, destination);
    setParticipantName('');
    setDestination('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-slate-50/95 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-sm w-full rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 text-xs font-semibold">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-100/70 dark:bg-slate-950/20">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-purple-600" />
            <h3 className="font-bold text-slate-800 dark:text-white">Start 3-Way Conference</h3>
          </div>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-lg">×</button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">Participant Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Supervisor Marc / Tariq"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">Destination Phone / SIP Address</label>
            <input
              type="text"
              required
              placeholder="e.g. +966 50 111 2222 or sip:marc@mpaas"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none font-mono"
            />
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
              className="flex items-center gap-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-500/20"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Dial Conference
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
