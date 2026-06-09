import React, { useState } from 'react';
import { ArrowRightLeft } from 'lucide-react';
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
  const [selectedAgent, setSelectedAgent] = useState(agents[1]?.id || 'agent-2');
  const [selectedQueue, setSelectedQueue] = useState('q-default');
  const [consultNotes, setConsultNotes] = useState('');

  const isAr = lang === 'ar';

  const queues = [
    { id: 'q-default', name: isAr ? 'دعم العملاء الافتراضي' : 'Default Support Queue' },
    { id: 'q-vip', name: isAr ? 'طابور العملاء المهمين (VIP)' : 'VIP Priority Queue' },
    { id: 'q-telco', name: isAr ? 'طابور الدعم الفني للاتصالات' : 'Telco Technical Queue' },
    { id: 'q-billing', name: isAr ? 'طابور العمليات والفواتير' : 'Billing & Operations Queue' }
  ];

  const handleConfirm = () => {
    onTransfer(selectedAgent, consultNotes, selectedQueue);
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title={t.agentWorkspace.transfer.titleConsult} maxWidthClass="max-w-sm">
      <div className={`space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-200 ${isAr ? 'text-right' : 'text-left'}`} dir={isAr ? 'rtl' : 'ltr'}>
        <div>
          <label htmlFor="queue-select" className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase font-mono tracking-wider">
            {isAr ? 'اختر طابور التحويل' : 'Select Destination Queue'}
          </label>
          <select
            id="queue-select"
            value={selectedQueue}
            onChange={(e) => setSelectedQueue(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent dark:bg-slate-950/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
            aria-label={isAr ? 'طابور التحويل' : 'Destination Queue'}
          >
            {queues.map((q) => (
              <option key={q.id} value={q.id} className="dark:bg-slate-900">
                {q.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="agent-select" className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase font-mono tracking-wider">
            {t.agentWorkspace.transfer.selectAgent}
          </label>
          <select
            id="agent-select"
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent dark:bg-slate-950/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
            aria-label={isAr ? 'الوكيل المستهدف' : 'Target human agent'}
          >
            {agents.map((ag) => (
              <option key={ag.id} value={ag.id} className="dark:bg-slate-900">
                {ag.name} ({ag.activeChatsCount}/{ag.maxChatsCount} {t.agentWorkspace.transfer.busy})
              </option>
            ))}
          </select>
        </div>

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
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent dark:bg-slate-950/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-500 resize-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
            aria-label={isAr ? 'ملاحظات الاستشارة والتحويل' : 'Consultation notes context'}
          />
        </div>

        <div className={`flex justify-end gap-2 pt-2 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
            aria-label={isAr ? 'إلغاء التحويل' : 'Cancel transfer'}
          >
            {t.agentWorkspace.transfer.cancel}
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
            aria-label={isAr ? 'تأكيد تحويل الحالة' : 'Route case to agent'}
          >
            {t.agentWorkspace.transfer.transferCase}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}
