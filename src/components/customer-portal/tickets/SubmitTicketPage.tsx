'use client';

import React from 'react';
import { ArrowLeft, Plus } from 'lucide-react';

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
  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={onBack}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          title="Back to Home"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-850 dark:text-white">Submit Support Incident</h1>
          <p className="text-xs text-slate-450 dark:text-slate-400 mt-1">Create and track incident reports</p>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm max-w-2xl">
        <form onSubmit={handleTicketSubmit} className="space-y-5">
          {/* Subject */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
              Incident Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Invoicing dispute logs"
              value={ticketTitle}
              onChange={(e) => setTicketTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-slate-850 dark:text-white placeholder:text-slate-350 text-sm"
            />
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={ticketCategory}
                onChange={(e) => setTicketCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 rounded-xl focus:outline-none focus:border-blue-500 text-slate-850 dark:text-slate-200 text-sm cursor-pointer"
              >
                <option value="Billing & Payments">Billing & Payments</option>
                <option value="User Authentication">User Authentication</option>
                <option value="API Integrations">API Integrations</option>
                <option value="Shipments & Delivery">Shipments & Delivery</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                Priority <span className="text-red-500">*</span>
              </label>
              <select
                value={ticketPriority}
                onChange={(e) => setTicketPriority(e.target.value as any)}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 rounded-xl focus:outline-none focus:border-blue-500 text-slate-850 dark:text-slate-200 text-sm cursor-pointer"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
              Issue Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={5}
              placeholder="Please outline the full steps of what occurred, any error messages, and what you were attempting to do..."
              value={ticketDesc}
              onChange={(e) => setTicketDesc(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-slate-850 dark:text-white placeholder:text-slate-350 text-sm resize-none"
            />
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
              Minimum 20 characters. Include relevant details, order numbers, or error codes.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-md transition-all focus-visible:ring-2 focus-visible:ring-blue-500 outline-none cursor-pointer text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Ticket</span>
            </button>
          </div>
        </form>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-2xl p-4 max-w-2xl">
        <p className="text-xs text-blue-900 dark:text-blue-300">
          <strong>📌 What to expect:</strong> Your ticket will be assigned a reference number and tracked in the "My Tickets" section. Our support team will respond within 24 hours during business hours.
        </p>
      </div>
    </div>
  );
}
