import React, { useState } from 'react';
import { Users, PhoneCall } from 'lucide-react';
import { ModalWrapper } from '../shared/ModalWrapper';

interface ConferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConference: (participantName: string, destination: string) => void;
}

export function ConferenceModal({ isOpen, onClose, onConference }: ConferenceModalProps) {
  const [participantName, setParticipantName] = useState('');
  const [destination, setDestination] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantName || !destination) return;
    onConference(participantName, destination);
    setParticipantName('');
    setDestination('');
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Start 3-Way Conference" maxWidthClass="max-w-sm">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
        <div>
          <label htmlFor="participant-name" className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase font-mono tracking-wider">Participant Name</label>
          <input
            id="participant-name"
            type="text"
            required
            placeholder="e.g. Supervisor Marc / Tariq"
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-500 dark:bg-slate-950/40"
          />
        </div>

        <div>
          <label htmlFor="destination" className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase font-mono tracking-wider">Destination Phone / SIP Address</label>
          <input
            id="destination"
            type="text"
            required
            placeholder="e.g. +966 50 111 2222 or sip:marc@mpaas"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-500 font-mono dark:bg-slate-950/40"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-500/20 focus:outline-none focus:ring-2 focus:ring-purple-550 focus:border-purple-600"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            Dial Conference
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
