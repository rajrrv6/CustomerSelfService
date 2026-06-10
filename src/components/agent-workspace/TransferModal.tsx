'use client';

import React, { useState } from 'react';
import { ArrowRightLeft, Search, CheckCircle, RefreshCw, AlertTriangle, User } from 'lucide-react';
import { Agent } from '@/types';
import { ModalWrapper } from '../shared/ModalWrapper';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: Agent[];
  onTransfer: (agentId: string, notes: string, queueId: string) => void;
}

export function TransferModal({ isOpen, onClose, agents, onTransfer }: TransferModalProps) {
  const { lang } = useApp();
  const t = translations[lang];
  const isAr = lang === 'ar';

  const [selectedAgentId, setSelectedAgentId] = useState(agents[0]?.id || 'agent-2');
  const [selectedQueue, setSelectedQueue] = useState('q-default');
  const [consultNotes, setConsultNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Simulation states
  const [transferStatus, setTransferStatus] = useState<'idle' | 'routing' | 'success' | 'failed'>('idle');
  const [simulatedError, setSimulatedError] = useState('');

  const queues = [
    { id: 'q-default', name: isAr ? 'دعم العملاء الافتراضي' : 'Default Support Queue' },
    { id: 'q-vip', name: isAr ? 'طابور العملاء المهمين (VIP)' : 'VIP Priority Queue' },
    { id: 'q-telco', name: isAr ? 'طابور الدعم الفني للاتصالات' : 'Telco Technical Queue' },
    { id: 'q-billing', name: isAr ? 'طابور العمليات والفواتير' : 'Billing & Operations Queue' }
  ];

  const filteredAgents = agents.filter((ag) =>
    ag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConfirm = () => {
    setTransferStatus('routing');
    setSimulatedError('');

    const runTransfer = () => {
      try {
        if (consultNotes.toLowerCase().includes('fail')) {
          throw new Error('Telephony network dropout occurred. SIP handshake timed out.');
        }
        
        onTransfer(selectedAgentId, consultNotes, selectedQueue);
        setTransferStatus('success');
        
        const complete = () => {
          setTransferStatus('idle');
          setConsultNotes('');
          onClose();
        };

        if (process.env.NODE_ENV === 'test') {
          complete();
        } else {
          setTimeout(complete, 1200);
        }
      } catch (err: any) {
        setSimulatedError(err.message || 'Routing failure.');
        setTransferStatus('failed');
      }
    };

    if (process.env.NODE_ENV === 'test') {
      runTransfer();
    } else {
      setTimeout(runTransfer, 1500);
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title={t.agentWorkspace.transfer.titleConsult} maxWidthClass="max-w-md">
      <div className={`space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-205 ${isAr ? 'text-right' : 'text-left'}`} dir={isAr ? 'rtl' : 'ltr'}>
        
        {transferStatus === 'idle' || transferStatus === 'failed' ? (
          <>
            {/* Queue selection */}
            <div>
              <label htmlFor="queue-select" className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase font-mono tracking-wider">
                {isAr ? 'اختر طابور التحويل' : 'Select Destination Queue'}
              </label>
              <select
                id="queue-select"
                value={selectedQueue}
                onChange={(e) => setSelectedQueue(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent dark:bg-slate-950/40 rounded-xl focus:outline-none"
              >
                {queues.map((q) => (
                  <option key={q.id} value={q.id} className="dark:bg-slate-900">
                    {q.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Searchable Agent Directory select element */}
            <div className="space-y-2">
              <label htmlFor="agent-select" className="block text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider">
                {t.agentWorkspace.transfer.selectAgent}
              </label>
              
              <div className="relative mb-2">
                <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isAr ? 'right-3' : 'left-3'}`} />
                <input
                  type="text"
                  placeholder={isAr ? 'ابحث بالاسم...' : 'Search by name...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                    isAr ? 'pl-3 pr-9' : 'pl-9 pr-3'
                  }`}
                />
              </div>

              <select
                id="agent-select"
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent dark:bg-slate-950/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-white"
                aria-label={isAr ? 'الوكيل المستهدف' : 'Target human agent'}
              >
                {filteredAgents.map((ag) => (
                  <option key={ag.id} value={ag.id} className="dark:bg-slate-900">
                    {ag.name} ({ag.activeChatsCount}/{ag.maxChatsCount} {isAr ? 'محادثات نشطة' : 'active sessions'}) • {ag.status || 'offline'}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes textarea */}
            <div>
              <label htmlFor="consult-notes" className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase font-mono tracking-wider">
                {t.agentWorkspace.transfer.consultNotes}
              </label>
              <textarea
                id="consult-notes"
                placeholder={t.agentWorkspace.transfer.notesPlaceholder}
                value={consultNotes}
                onChange={(e) => setConsultNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent dark:bg-slate-950/40 rounded-xl focus:outline-none resize-none"
              />
            </div>

            {/* Error state */}
            {transferStatus === 'failed' && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-450">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{simulatedError}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className={`flex justify-end gap-2 pt-2 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                {t.agentWorkspace.transfer.cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex items-center gap-1.5 px-4.5 py-2 bg-blue-600 hover:bg-blue-750 text-white rounded-xl font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                aria-label={isAr ? 'تأكيد تحويل الحالة' : 'Route case to agent'}
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>{t.agentWorkspace.transfer.transferCase}</span>
              </button>
            </div>
          </>
        ) : transferStatus === 'routing' ? (
          /* Transferring / Routing simulation state */
          <div className="py-8 flex flex-col items-center justify-center space-y-4">
            <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
            <span className="font-extrabold text-slate-900 dark:text-white text-sm">
              {isAr ? 'جاري تحويل مسار الاتصال والبيانات...' : 'Re-routing case to target agent...'}
            </span>
            <div className="w-full max-w-xs bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full animate-[loading_1.5s_ease-in-out_infinite]" style={{ width: '40%' }} />
            </div>
          </div>
        ) : (
          /* Success complete state */
          <div className="py-8 flex flex-col items-center justify-center space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-500 animate-bounce" />
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm text-center">
              {isAr ? 'تم تحويل الحالة بنجاح!' : 'Case Routed Successfully!'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-[10.5px] text-center max-w-xs">
              {isAr
                ? 'تم فك ارتباط الحالة وتوجيه جهة الاتصال إلى الوكيل الجديد.'
                : 'Interaction reassigned and routing queue configurations updated.'}
            </p>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
}
