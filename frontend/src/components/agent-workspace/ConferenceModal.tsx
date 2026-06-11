'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Users, PhoneCall, Plus, Trash2, Terminal, ShieldAlert, Loader2, CheckCircle2 } from 'lucide-react';
import { ModalWrapper } from '../shared/ModalWrapper';
import { useApp } from '@/context/AppContext';
import { useFeedbackToasts } from '@/components/customer-portal/feedback/PostChatToasts';

interface ParticipantInput {
  name: string;
  role: 'supervisor' | 'agent' | 'customer';
  destination: string;
}

interface ConferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConference: (participants: ParticipantInput[]) => void;
}

interface DialLog {
  time: string;
  message: string;
  type: 'info' | 'success' | 'warn';
}

export function ConferenceModal({ isOpen, onClose, onConference }: ConferenceModalProps) {
  const { lang } = useApp();
  const { pushToast } = useFeedbackToasts();
  const isRtl = lang === 'ar';

  // State
  const [participantName, setParticipantName] = useState('');
  const [destination, setDestination] = useState('');
  const [role, setRole] = useState<'supervisor' | 'agent' | 'customer'>('supervisor');
  
  const [queue, setQueue] = useState<ParticipantInput[]>([]);
  const [isDialing, setIsDialing] = useState(false);
  const [dialLogs, setDialLogs] = useState<DialLog[]>([]);
  
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll dial logs
  useEffect(() => {
    if (logsEndRef.current && typeof logsEndRef.current.scrollIntoView === 'function') {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [dialLogs]);

  // Handle adding participant to queue
  const handleAddToQueue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantName.trim() || !destination.trim()) return;

    // Validation
    if (queue.some(p => p.destination === destination)) {
      pushToast(
        'error',
        isRtl ? 'المشترك مضاف بالفعل' : 'Duplicate Participant',
        isRtl ? 'هذا الرقم أو عنوان SIP مضاف بالفعل إلى قائمة المدعوين.' : 'This number or SIP address is already in the queue.'
      );
      return;
    }

    const newItem: ParticipantInput = {
      name: participantName.trim(),
      role,
      destination: destination.trim(),
    };

    setQueue(prev => [...prev, newItem]);
    setParticipantName('');
    setDestination('');
    
    pushToast(
      'success',
      isRtl ? 'تمت إضافة المشترك' : 'Added to Invite Queue',
      isRtl ? `تمت إضافة ${newItem.name} إلى قائمة دعوة المؤتمر.` : `Added ${newItem.name} to pending conference invite list.`
    );
  };

  const handleRemoveFromQueue = (index: number) => {
    const removedItem = queue[index];
    setQueue(prev => prev.filter((_, i) => i !== index));
    pushToast(
      'info',
      isRtl ? 'تمت الإزالة' : 'Removed from Queue',
      isRtl ? `تمت إزالة ${removedItem.name} من القائمة.` : `Removed ${removedItem.name} from invitation queue.`
    );
  };

  // Trigger Dialing Sequence
  const handleStartDialing = () => {
    if (queue.length === 0) return;
    setIsDialing(true);
    setDialLogs([]);

    const addLog = (msg: string, type: DialLog['type'] = 'info') => {
      setDialLogs(prev => [
        ...prev,
        {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          message: msg,
          type
        }
      ]);
    };

    // Sequential simulation of network handshakes
    setTimeout(() => {
      addLog(isRtl ? 'تهيئة جلسة SIP للمؤتمر الفوري...' : 'Initializing multi-party SIP bridge session...');
    }, 100);

    setTimeout(() => {
      addLog(isRtl ? 'الاتصال ببوابة الاتصالات الإقليمية PSTN...' : 'Routing call segments via local PSTN trunk gateway...');
    }, 600);

    setTimeout(() => {
      addLog(isRtl ? 'إرسال طلبات INVITE إلى مسجل SIP...' : 'Broadcasting INVITE headers to SIP registrar...');
    }, 1200);

    // Dynamic logs based on queue
    queue.forEach((part, index) => {
      setTimeout(() => {
        addLog(
          isRtl 
            ? `جاري الاتصال بـ ${part.name} على (${part.destination})...` 
            : `Ringing participant: ${part.name} at "${part.destination}"...`
        );
      }, 1800 + index * 600);

      setTimeout(() => {
        addLog(
          isRtl 
            ? `تم قبول الاتصال بنجاح من ${part.name} (${part.role}).` 
            : `Participant ${part.name} (${part.role.toUpperCase()}) answered call.`,
          'success'
        );
      }, 2600 + index * 800);
    });

    // Complete dialing action
    const totalDuration = 2650 + queue.length * 800;
    setTimeout(() => {
      addLog(isRtl ? 'تم دمج جميع القنوات بنجاح. المؤتمر نشط الآن.' : 'Unified audio streams. Conference bridge active.', 'success');
      
      setTimeout(() => {
        onConference(queue);
        setIsDialing(false);
        setQueue([]);
        onClose();
      }, 1000);
    }, totalDuration);
  };

  return (
    <ModalWrapper 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isRtl ? 'بدء مؤتمر اتصالات ثلاثي' : 'Start 3-Way Conference'} 
      maxWidthClass="max-w-md"
    >
      <div className="space-y-4 text-xs font-semibold text-slate-805 dark:text-slate-205" dir={isRtl ? 'rtl' : 'ltr'}>
        {!isDialing ? (
          <>
            {/* Form to add to queue */}
            <form onSubmit={handleAddToQueue} className="bg-slate-50 dark:bg-slate-900/40 p-4 border border-slate-100 dark:border-slate-850 rounded-2xl space-y-3">
              <span className="block text-[10px] font-bold text-slate-450 uppercase font-mono tracking-wider">
                {isRtl ? 'إضافة مشترك للمؤتمر' : 'Add Conference Invitee'}
              </span>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="participant-name" className="block text-[9px] font-bold text-slate-500 mb-1 uppercase font-mono">
                    {isRtl ? 'اسم المشترك' : 'Invitee Name'}
                  </label>
                  <input
                    id="participant-name"
                    type="text"
                    required
                    placeholder={isRtl ? 'مثال: المشرف طارق' : 'e.g. Supervisor Tariq'}
                    value={participantName}
                    onChange={(e) => setParticipantName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="participant-role" className="block text-[9px] font-bold text-slate-500 mb-1 uppercase font-mono">
                    {isRtl ? 'دور المشترك' : 'Invitee Role'}
                  </label>
                  <select
                    id="participant-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none text-slate-900 dark:text-white"
                  >
                    <option value="supervisor">{isRtl ? 'مشرف' : 'Supervisor'}</option>
                    <option value="agent">{isRtl ? 'عميل آخر' : 'Peer Agent'}</option>
                    <option value="customer">{isRtl ? 'مستشار خارجي' : 'External Expert'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="destination" className="block text-[9px] font-bold text-slate-500 mb-1 uppercase font-mono">
                  {isRtl ? 'الرقم أو SIP' : 'Phone / SIP Address'}
                </label>
                <input
                  id="destination"
                  type="text"
                  required
                  placeholder="e.g. +966 50 111 2222 or sip:tariq@net"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'إضافة إلى الطابور' : 'Queue Invitee'}</span>
                </button>
              </div>
            </form>

            {/* Invitees Queue list */}
            <div className="space-y-2">
              <span className="block text-[10px] font-bold text-slate-450 uppercase font-mono tracking-wider">
                {isRtl ? 'طابور دعوات المؤتمر' : 'Invite Queue List'}
              </span>

              {queue.length === 0 ? (
                <div className="py-6 text-center border border-dashed border-slate-200 dark:border-slate-850 rounded-2xl bg-slate-50/50 dark:bg-slate-900/10 text-slate-400">
                  <Users className="w-6 h-6 text-slate-350 mx-auto mb-1.5 animate-pulse" />
                  <p>{isRtl ? 'لا يوجد مشتركين مدعوين حالياً.' : 'Queue is empty. Add a participant above to start.'}</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {queue.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 px-3 py-2.5 rounded-xl flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 dark:text-white text-xs">{item.name}</span>
                          <span className="bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 text-[8px] px-1.5 py-0.2 rounded uppercase font-bold font-mono">
                            {item.role}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{item.destination}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveFromQueue(idx)}
                        className="p-1 hover:bg-rose-50 dark:hover:bg-slate-800 text-rose-500 rounded-lg cursor-pointer"
                        title="Remove Invitee"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-850">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-205 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              
              <button
                type="button"
                onClick={handleStartDialing}
                disabled={queue.length === 0}
                className="flex items-center gap-1.5 px-4.5 py-2 bg-purple-600 hover:bg-purple-750 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-md shadow-purple-500/20 active:scale-95 cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{isRtl ? 'بدء طلب الاتصال للمجموعة' : 'Dial Group Conference'}</span>
              </button>
            </div>
          </>
        ) : (
          /* Dialing State Terminal Logs */
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2.5">
              <span className="font-extrabold text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isRtl ? 'جاري الاتصال وإنشاء الجسر...' : 'Establishing Conference Bridge...'}</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">SIP Status: CONNECTING</span>
            </div>

            <div className="bg-slate-955 text-slate-350 font-mono text-[9px] p-3 rounded-2xl h-44 overflow-y-auto space-y-2 border border-slate-850 select-text leading-relaxed">
              <div className="flex gap-2 text-slate-500 font-bold border-b border-slate-800 pb-1 mb-1 select-none">
                <Terminal className="w-3.5 h-3.5 shrink-0" />
                <span>GATEWAY CALL ROUTING LOGS</span>
              </div>
              
              {dialLogs.map((log, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-slate-550 shrink-0">[{log.time}]</span>
                  {log.type === 'success' ? (
                    <span className="text-emerald-400 shrink-0">[OK]</span>
                  ) : log.type === 'warn' ? (
                    <span className="text-amber-500 shrink-0">[WARN]</span>
                  ) : (
                    <span className="text-blue-400 shrink-0">[SIP]</span>
                  )}
                  <span className="break-all">{log.message}</span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>

            <div className="flex items-center gap-2 p-3 bg-purple-500/5 border border-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl leading-relaxed text-[10.5px]">
              <ShieldAlert className="w-4 h-4 shrink-0 animate-pulse" />
              <span>
                {isRtl 
                  ? 'برجاء عدم إغلاق النافذة. جاري مصافحة بروتوكولات الاتصال مع الأطراف الخارجية.'
                  : 'Please do not close this window. Merging dial channels with remote VoIP endpoints.'}
              </span>
            </div>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
}
