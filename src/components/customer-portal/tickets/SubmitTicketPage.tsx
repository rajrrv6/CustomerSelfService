'use client';

import React from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';

interface SubmitTicketPageProps {
  ticketTitle: string;
  setTicketTitle: (val: string) => void;
  ticketCategory: string;
  setTicketCategory: (val: string) => void;
  ticketPriority: 'low' | 'medium' | 'high' | 'urgent';
  setTicketPriority: (val: 'low' | 'medium' | 'high' | 'urgent') => void;
  ticketDesc: string;
  setTicketDesc: (val: string) => void;
  handleTicketSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

export function SubmitTicketPage({
  ticketTitle,
  setTicketTitle,
  ticketCategory,
  setTicketCategory,
  ticketPriority,
  setTicketPriority,
  ticketDesc,
  setTicketDesc,
  handleTicketSubmit,
  onBack
}: SubmitTicketPageProps) {
  const { lang } = useApp();
  const t = translations[lang];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={onBack}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          title={t.portal.tickets.cancel}
        >
          <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-850 dark:text-white">{t.portal.tickets.pageTitle}</h1>
          <p className="text-xs text-slate-450 dark:text-slate-400 mt-1">{t.portal.tickets.pageSubtitle}</p>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm max-w-2xl">
        <form onSubmit={handleTicketSubmit} className="space-y-5">
          {/* Subject */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
              {t.portal.tickets.incidentSubject} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={t.portal.tickets.subjectPlaceholder}
              value={ticketTitle}
              onChange={(e) => setTicketTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-slate-850 dark:text-white placeholder:text-slate-350 text-sm"
            />
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                {t.portal.tickets.category} <span className="text-red-500">*</span>
              </label>
              <select
                value={ticketCategory}
                onChange={(e) => setTicketCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 rounded-xl focus:outline-none focus:border-blue-500 text-slate-850 dark:text-slate-200 text-sm cursor-pointer"
              >
                <option value="Billing & Payments">{t.portal.tickets.categoryBilling}</option>
                <option value="User Authentication">{t.portal.tickets.categoryAuth}</option>
                <option value="API Integrations">{t.portal.tickets.categoryApi}</option>
                <option value="Shipments & Delivery">{t.portal.tickets.categoryShipment}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                {t.portal.tickets.priority} <span className="text-red-500">*</span>
              </label>
              <select
                value={ticketPriority}
                onChange={(e) => setTicketPriority(e.target.value as any)}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 rounded-xl focus:outline-none focus:border-blue-500 text-slate-850 dark:text-slate-200 text-sm cursor-pointer"
              >
                <option value="low">{t.portal.tickets.priorityLow}</option>
                <option value="medium">{t.portal.tickets.priorityMedium}</option>
                <option value="high">{t.portal.tickets.priorityHigh}</option>
                <option value="urgent">{t.portal.tickets.priorityUrgent}</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
              {t.portal.tickets.issueLabelFull} <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={5}
              placeholder={t.portal.tickets.descPlaceholderFull}
              value={ticketDesc}
              onChange={(e) => setTicketDesc(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-slate-850 dark:text-white placeholder:text-slate-350 text-sm resize-none"
            />
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
              {t.portal.tickets.descHint}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm cursor-pointer"
            >
              {t.portal.tickets.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-md transition-all focus-visible:ring-2 focus-visible:ring-blue-500 outline-none cursor-pointer text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{t.portal.tickets.submitTicket}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-2xl p-4 max-w-2xl">
        <p className="text-xs text-blue-900 dark:text-blue-300">
          {t.portal.tickets.whatToExpect}
        </p>
      </div>
    </div>
  );
}
