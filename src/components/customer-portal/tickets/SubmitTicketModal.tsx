'use client';

import React from 'react';
import { ModalWrapper } from '@/components/shared/ModalWrapper';

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
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Submit Support Incident" maxWidthClass="max-w-md">
      <form onSubmit={handleTicketSubmit} className="space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
        <div>
          <label className="block text-slate-500 dark:text-slate-400 mb-1.5">Incident Subject</label>
          <input
            type="text"
            required
            placeholder="e.g. Invoicing dispute logs"
            value={ticketTitle}
            onChange={(e) => setTicketTitle(e.target.value)}
            className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-slate-850 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1.5">Category</label>
            <select
              value={ticketCategory}
              onChange={(e) => setTicketCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-slate-850 dark:text-slate-350 dark:bg-slate-900"
            >
              <option>Billing & Payments</option>
              <option>User Authentication</option>
              <option>API Integrations</option>
              <option>Shipments & Delivery</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1.5">Priority</label>
            <select
              value={ticketPriority}
              onChange={(e) => setTicketPriority(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-slate-850 dark:text-slate-350 dark:bg-slate-900"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-slate-500 dark:text-slate-400 mb-1.5">Describe issue details</label>
          <textarea
            required
            rows={4}
            placeholder="Please outline the full steps of what occurred..."
            value={ticketDesc}
            onChange={(e) => setTicketDesc(e.target.value)}
            className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-slate-855 dark:text-white"
          />
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button type="submit" className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md focus-visible:ring-2 focus-visible:ring-blue-500 outline-none cursor-pointer">
            Submit Case
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
