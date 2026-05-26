'use client';

import React from 'react';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';

interface SubmitTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketTitle: string;
  setTicketTitle: (val: string) => void;
  ticketCategory: string;
  setTicketCategory: (val: string) => void;
  ticketPriority: 'low' | 'medium' | 'high' | 'urgent';
  setTicketPriority: (val: 'low' | 'medium' | 'high' | 'urgent') => void;
  ticketDesc: string;
  setTicketDesc: (val: string) => void;
  handleTicketSubmit: (e: React.FormEvent) => void;
}

export function SubmitTicketModal({
  isOpen,
  onClose,
  ticketTitle,
  setTicketTitle,
  ticketCategory,
  setTicketCategory,
  ticketPriority,
  setTicketPriority,
  ticketDesc,
  setTicketDesc,
  handleTicketSubmit
}: SubmitTicketModalProps) {
  const { lang } = useApp();
  const t = translations[lang];

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title={t.portal.tickets.modalTitle} maxWidthClass="max-w-md">
      <form onSubmit={handleTicketSubmit} className="space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
        <div>
          <label htmlFor="ticket-subject-input" className="block text-slate-500 dark:text-slate-400 mb-1.5">{t.portal.tickets.incidentSubject}</label>
          <input
            id="ticket-subject-input"
            type="text"
            required
            placeholder={t.portal.tickets.subjectPlaceholder}
            value={ticketTitle}
            onChange={(e) => setTicketTitle(e.target.value)}
            className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none text-slate-855 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="ticket-category-select" className="block text-slate-500 dark:text-slate-400 mb-1.5">{t.portal.tickets.category}</label>
            <select
              id="ticket-category-select"
              value={ticketCategory}
              onChange={(e) => setTicketCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none text-slate-850 dark:text-slate-355 dark:bg-slate-900"
            >
              <option value="Billing & Payments">{t.portal.tickets.categoryBilling}</option>
              <option value="User Authentication">{t.portal.tickets.categoryAuth}</option>
              <option value="API Integrations">{t.portal.tickets.categoryApi}</option>
              <option value="Shipments & Delivery">{t.portal.tickets.categoryShipment}</option>
            </select>
          </div>
          <div>
            <label htmlFor="ticket-priority-select" className="block text-slate-500 dark:text-slate-400 mb-1.5">{t.portal.tickets.priority}</label>
            <select
              id="ticket-priority-select"
              value={ticketPriority}
              onChange={(e) => setTicketPriority(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none text-slate-850 dark:text-slate-355 dark:bg-slate-900"
            >
              <option value="low">{t.portal.tickets.priorityLow}</option>
              <option value="medium">{t.portal.tickets.priorityMedium}</option>
              <option value="high">{t.portal.tickets.priorityHigh}</option>
              <option value="urgent">{t.portal.tickets.priorityUrgent}</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="ticket-desc-textarea" className="block text-slate-500 dark:text-slate-400 mb-1.5">{t.portal.tickets.describeIssue}</label>
          <textarea
            id="ticket-desc-textarea"
            required
            rows={4}
            placeholder={t.portal.tickets.descPlaceholder}
            value={ticketDesc}
            onChange={(e) => setTicketDesc(e.target.value)}
            className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none text-slate-855 dark:text-white"
          />
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {t.portal.tickets.cancel}
          </button>
          <button type="submit" className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md focus-visible:ring-2 focus-visible:ring-blue-500 outline-none cursor-pointer">
            {t.portal.tickets.submitCase}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
