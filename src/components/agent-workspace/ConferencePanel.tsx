import React, { useState } from 'react';
import { Users, PhoneOff, Mic, MicOff, Play, Pause, Trash2, UserPlus } from 'lucide-react';
import { useConversationStore } from '@/stores/conversationStore';
import { Participant } from '@/types';

interface ConferencePanelProps {
  conversationId: string;
  lang: 'en' | 'ar';
}

export function ConferencePanel({ conversationId, lang }: ConferencePanelProps) {
  const isAr = lang === 'ar';
  const store = useConversationStore();
  const conference = store.conferenceStates[conversationId];
  const removeParticipant = store.removeConferenceParticipant;
  const endConference = store.endConference;
  const startConference = store.startConference;

  const [newParticipantName, setNewParticipantName] = useState('');
  const [newParticipantRole, setNewParticipantRole] = useState<'supervisor' | 'agent'>('supervisor');

  // Mute & Hold state tracked locally for simulation
  const [mutedIds, setMutedIds] = useState<Record<string, boolean>>({});
  const [heldIds, setHeldIds] = useState<Record<string, boolean>>({});

  if (!conference || conference.status !== 'active') return null;

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParticipantName.trim()) return;

    const newParticipant: Participant = {
      id: `part-${Date.now()}`,
      name: newParticipantName.trim(),
      role: newParticipantRole,
      joinedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMuted: false,
      isOnHold: false
    };

    const currentParticipants = conference.participants || [];
    startConference(conversationId, [...currentParticipants, newParticipant]);
    setNewParticipantName('');
  };

  const toggleMute = (id: string) => {
    setMutedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleHold = (id: string) => {
    setHeldIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div
      className="p-4 bg-purple-50/50 dark:bg-purple-950/10 border border-purple-200 dark:border-purple-900/50 rounded-2xl space-y-4 animate-in fade-in-50 duration-200 text-xs font-semibold"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="text-purple-900 dark:text-purple-300 font-bold">
            {isAr
              ? `المكالمة الجماعية النشطة (${conference.participants.length} مشاركين)`
              : `Active 3-Way Conference (${conference.participants.length} participants)`}
          </span>
        </div>
        <button
          onClick={() => endConference(conversationId)}
          className="flex items-center gap-1 px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold transition-all focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none"
          aria-label={isAr ? 'إنهاء المكالمة الجماعية' : 'End conference call'}
        >
          <PhoneOff className="w-3.5 h-3.5" />
          <span>{isAr ? 'إنهاء' : 'End'}</span>
        </button>
      </div>

      {/* Participants List */}
      <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
        {conference.participants.map((p) => {
          const isMuted = mutedIds[p.id] || false;
          const isOnHold = heldIds[p.id] || false;

          return (
            <div
              key={p.id}
              className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                {/* Avatar */}
                <div className="w-7 h-7 rounded-full bg-purple-600/10 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 flex items-center justify-center font-bold font-mono shrink-0">
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-slate-800 dark:text-slate-200 font-bold">
                    {p.name}
                  </p>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">
                    {p.role === 'supervisor' ? (isAr ? 'مشرف' : 'Supervisor') : (isAr ? 'وكيل' : 'Agent')} • {p.joinedAt}
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Mute toggle */}
                <button
                  onClick={() => toggleMute(p.id)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    isMuted
                      ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/50'
                      : 'border-slate-200 hover:bg-slate-50 dark:border-slate-850 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                  aria-label={isMuted ? (isAr ? 'إلغاء كتم الصوت' : 'Unmute') : (isAr ? 'كتم الصوت' : 'Mute')}
                >
                  {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                </button>

                {/* Hold toggle */}
                <button
                  onClick={() => toggleHold(p.id)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    isOnHold
                      ? 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/20 dark:border-amber-900/50'
                      : 'border-slate-200 hover:bg-slate-50 dark:border-slate-850 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                  aria-label={isOnHold ? (isAr ? 'استئناف' : 'Resume') : (isAr ? 'وضع الانتظار' : 'Hold')}
                >
                  {isOnHold ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                </button>

                {/* Kick button */}
                <button
                  onClick={() => removeParticipant(conversationId, p.id)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-850 text-slate-450 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 dark:hover:bg-rose-950/20 dark:hover:border-rose-900/50 transition-colors focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none"
                  aria-label={isAr ? 'إزالة المشارك' : 'Remove participant'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Participant Input */}
      <form onSubmit={handleAddParticipant} className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            required
            placeholder={isAr ? 'اسم المشارك الجديد...' : 'Add participant name...'}
            value={newParticipantName}
            onChange={(e) => setNewParticipantName(e.target.value)}
            className="w-full pl-3 pr-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            aria-label={isAr ? 'اسم العضو الجديد' : 'New participant name'}
          />
        </div>
        <select
          value={newParticipantRole}
          onChange={(e) => setNewParticipantRole(e.target.value as any)}
          className="px-2 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none"
          aria-label={isAr ? 'دور المشارك' : 'Participant role'}
        >
          <option value="supervisor">{isAr ? 'مشرف' : 'Supervisor'}</option>
          <option value="agent">{isAr ? 'وكيل' : 'Agent'}</option>
        </select>
        <button
          type="submit"
          className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none flex items-center justify-center shrink-0"
          aria-label={isAr ? 'إضافة عضو' : 'Add member'}
        >
          <UserPlus className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
