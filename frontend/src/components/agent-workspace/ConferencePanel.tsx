'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Users, PhoneOff, Mic, MicOff, Play, Pause, Trash2, UserPlus, FileText, ChevronRight, ChevronLeft } from 'lucide-react';
import { useConversationStore } from '@/stores/conversationStore';
import { Participant } from '@/types';
import { ParticipantRosterItem } from './ParticipantRosterItem';
import { ConferenceStatusCard } from './ConferenceStatusCard';

interface ConferencePanelProps {
  conversationId: string;
  lang: 'en' | 'ar';
}

interface TranscriptLine {
  id: string;
  time: string;
  speaker: string;
  text: string;
}

const SEED_TRANSCRIPTS: TranscriptLine[] = [
  { id: 't-1', time: '11:50:02', speaker: 'Liam Bennett (Agent)', text: 'Hello team, thank you for joining the bridge. We are investigating the billing mismatch for transaction ID TX-88991.' },
  { id: 't-2', time: '11:50:18', speaker: 'Nadia Vance (Supervisor)', text: 'I checked the Dubai database cluster. The bank wire has successfully settled on our end.' },
  { id: 't-3', time: '11:50:35', speaker: 'External Expert', text: 'Confirmed. The API webhook returned a 200 OK. We can safely clear the credit lock.' },
];

export function ConferencePanel({ conversationId, lang }: ConferencePanelProps) {
  const isAr = lang === 'ar';
  const isRtl = isAr;
  const store = useConversationStore();
  const conference = store.conferenceStates[conversationId];
  const removeParticipant = store.removeConferenceParticipant;
  const endConference = store.endConference;
  const startConference = store.startConference;

  const [newParticipantName, setNewParticipantName] = useState('');
  const [newParticipantRole, setNewParticipantRole] = useState<'supervisor' | 'agent' | 'customer'>('supervisor');

  // Mute & Hold state tracked locally for simulation
  const [mutedIds, setMutedIds] = useState<Record<string, boolean>>({});
  const [heldIds, setHeldIds] = useState<Record<string, boolean>>({});

  // Transcript sidebar state
  const [showTranscript, setShowTranscript] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptLine[]>(SEED_TRANSCRIPTS);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showTranscript) {
      transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showTranscript, transcripts]);

  // Simulate incoming speech transcript messages periodically
  useEffect(() => {
    if (!conference || conference.status !== 'active') return;

    let index = 0;
    const extraSpeakers = ['Nadia Vance (Supervisor)', 'External Expert', 'Liam Bennett (Agent)'];
    const extraTexts = [
      isAr ? 'تمت مطابقة قيد الفاتورة في نظام SAP.' : 'SAP diagnostic codes matched successfully.',
      isAr ? 'سنقوم بحفظ هذه التغييرات في سجل التدقيق فوراً.' : 'Saving these updates directly to the compliance logs.',
      isAr ? 'ممتاز. سأقوم بتسوية الحالة ورفع التعليق عن حساب العميل.' : 'Excellent. I will resolve the case and release the hold on the client account.',
    ];

    const interval = setInterval(() => {
      if (index >= extraTexts.length) {
        clearInterval(interval);
        return;
      }

      const newLine: TranscriptLine = {
        id: `t-sim-${Date.now()}-${index}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        speaker: extraSpeakers[index],
        text: extraTexts[index],
      };

      setTranscripts((prev) => [...prev, newLine]);
      index++;
    }, 12000); // Add a line every 12 seconds

    return () => clearInterval(interval);
  }, [conference]);

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
    setMutedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleHold = (id: string) => {
    setHeldIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div
      className="p-4 bg-purple-50/50 dark:bg-purple-950/10 border border-purple-200 dark:border-purple-900/50 rounded-2xl space-y-4 animate-in fade-in-50 duration-200 text-xs font-semibold"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* ConferenceStatusCard Header */}
      <ConferenceStatusCard
        status="active"
        participantCount={conference.participants.length}
        onEnd={() => endConference(conversationId)}
        lang={lang}
      />

      <div className="flex flex-col md:flex-row gap-4">
        {/* Roster Controls Panel */}
        <div className="flex-1 space-y-4 min-w-0">
          {/* Participants List */}
          <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin pr-1">
            {conference.participants.map((p) => (
              <ParticipantRosterItem
                key={p.id}
                participant={p}
                isMuted={mutedIds[p.id] || false}
                isOnHold={heldIds[p.id] || false}
                onMuteToggle={() => toggleMute(p.id)}
                onHoldToggle={() => toggleHold(p.id)}
                onRemove={() => removeParticipant(conversationId, p.id)}
                lang={lang}
              />
            ))}
          </div>

          {/* Add Participant Input Form */}
          <form onSubmit={handleAddParticipant} className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                required
                placeholder={isAr ? 'اسم المشارك الجديد...' : 'Add participant name...'}
                value={newParticipantName}
                onChange={(e) => setNewParticipantName(e.target.value)}
                className="w-full pl-3 pr-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-xs font-semibold"
                aria-label={isAr ? 'اسم العضو الجديد' : 'New participant name'}
              />
            </div>
            <select
              value={newParticipantRole}
              onChange={(e) => setNewParticipantRole(e.target.value as any)}
              className="px-2 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none text-xs font-bold"
              aria-label={isAr ? 'دور المشارك' : 'Participant role'}
            >
              <option value="supervisor">{isAr ? 'مشرف' : 'Supervisor'}</option>
              <option value="agent">{isAr ? 'وكيل' : 'Agent'}</option>
              <option value="customer">{isAr ? 'مستشار خارجي' : 'External Expert'}</option>
            </select>
            <button
              type="submit"
              className="p-2 bg-purple-600 hover:bg-purple-750 text-white rounded-xl font-bold transition-all focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none flex items-center justify-center shrink-0 cursor-pointer"
              aria-label={isAr ? 'إضافة عضو' : 'Add member'}
            >
              <UserPlus className="w-4 h-4" />
            </button>
          </form>

          {/* Transcript Drawer Toggle button */}
          <div className={`flex ${isRtl ? 'justify-start' : 'justify-end'}`}>
            <button
              type="button"
              onClick={() => setShowTranscript(!showTranscript)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-purple-200 dark:border-purple-900/50 hover:bg-purple-100/50 text-purple-700 dark:text-purple-400 rounded-xl font-bold transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{showTranscript ? (isAr ? 'إخفاء النص المكتوب' : 'Hide Live Transcript') : (isAr ? 'عرض النص المكتوب' : 'Show Live Transcript')}</span>
            </button>
          </div>
        </div>

        {/* Live Call Transcript Sidebar Panel */}
        {showTranscript && (
          <div className="w-full md:w-64 border-t md:border-t-0 md:border-s border-purple-200/50 dark:border-purple-900/40 pt-4 md:pt-0 md:ps-4 flex flex-col h-48 md:h-auto min-h-[160px] animate-in slide-in-from-right duration-300">
            <span className="text-[10px] uppercase font-bold text-purple-500 font-mono tracking-wider mb-2 block select-none">
              🎙️ Live VoIP Call Transcripts
            </span>
            <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-300 border border-slate-850 p-2.5 rounded-xl font-mono text-[9px] space-y-2 select-text leading-normal max-h-40 md:max-h-none">
              {transcripts.map((t) => (
                <div key={t.id} className="space-y-0.5">
                  <div className="flex justify-between text-[8px] text-slate-500 font-bold">
                    <span>{t.speaker}</span>
                    <span>{t.time}</span>
                  </div>
                  <p className="text-slate-200 break-words">{t.text}</p>
                </div>
              ))}
              <div ref={transcriptEndRef} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
