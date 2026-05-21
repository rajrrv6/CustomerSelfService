'use client';

import React from 'react';
import { ArrowLeft, Send, Upload, Star, CheckCircle } from 'lucide-react';
import { Ticket } from '@/types';
import { useApp } from '@/context/AppContext';

interface TicketDetailProps {
  tickets: Ticket[];
  selectedTicketId: string | null;
  setActiveSubScreen: (sub: string) => void;
  ticketReplyText: string;
  setTicketReplyText: (val: string) => void;
  handlePostReply: (e: React.FormEvent) => void;
}

export function TicketDetail({
  tickets,
  selectedTicketId,
  setActiveSubScreen,
  ticketReplyText,
  setTicketReplyText,
  handlePostReply
}: TicketDetailProps) {
  const { addAuditLog } = useApp();
  const [csatRating, setCsatRating] = React.useState(0);
  const [csatHover, setCsatHover] = React.useState(0);
  const [npsRating, setNpsRating] = React.useState(0);
  const [feedbackSubmitted, setFeedbackSubmitted] = React.useState(false);
  const [feedbackText, setFeedbackText] = React.useState('');

  const ticket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  if (!ticket) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveSubScreen('customer_my_tickets')}
            className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xl font-bold">Ticket Details</h2>
            <p className="text-xs text-slate-400">View resolution thread history</p>
          </div>
        </div>
        <div className="text-center py-10 text-slate-400">
          <span>Ticket not found.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setActiveSubScreen('customer_my_tickets')}
          className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-xl font-bold">Ticket Details</h2>
          <p className="text-xs text-slate-400">View resolution thread history</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-slate-800 dark:text-slate-200">
        {/* Left panel: Replies list & Composer */}
        <div className="lg:col-span-2 space-y-4">
          {/* Main Ticket description bubble */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex justify-between items-center text-[10px] text-slate-400">
              <span className="font-mono font-bold">{ticket.id}</span>
              <span>Opened on: 2026-05-18</span>
            </div>
            <h3 className="font-bold text-sm text-slate-850 dark:text-white">{ticket.title}</h3>
            <p className="text-xs text-slate-655 dark:text-slate-350 leading-relaxed font-normal bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-900/50">
              {ticket.description}
            </p>
          </div>

          {/* Threaded replies */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider block">Conversation History</span>
            
            {/* Thread Item 1: Auto bot triage */}
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none shadow-sm">
                <div className="flex justify-between items-center gap-4 text-[9px] text-slate-400 font-bold mb-1">
                  <span>Farah AI Assistant</span>
                  <span>May 18, 14:15</span>
                </div>
                <p className="text-xs font-medium">Hello David. I have logged ticket {ticket.id} and categorized it under {ticket.category}. An agent will verify and reply shortly.</p>
              </div>
            </div>

            {/* Thread Item 2: Agent Response */}
            {ticket.status !== 'open' && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none shadow-sm">
                  <div className="flex justify-between items-center gap-4 text-[9px] text-slate-400 font-bold mb-1">
                    <span>Liam Bennett (Support Desk)</span>
                    <span>May 18, 16:30</span>
                  </div>
                  <p className="text-xs font-medium">I have checked your duplicate transaction error logs inside Stripe. I can confirm the second charge has been exempted and refunded. It will reflect in your statements shortly.</p>
                </div>
              </div>
            )}
          </div>

          {ticket.status === 'solved' && (
            feedbackSubmitted ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-800 rounded-3xl p-5 shadow-sm flex flex-col items-center justify-center text-center space-y-2 animate-in fade-in-50 duration-300">
                <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-450 animate-bounce" />
                <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-350">Thank You for Your Feedback!</h4>
                <p className="text-xs text-slate-555 dark:text-slate-400 font-normal">
                  Your rating (CSAT: {csatRating}/5, NPS: {npsRating}/10) and notes have been logged to improve our support services.
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2">
                  <div>
                    <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase font-mono">Resolution Feedback Survey</h4>
                    <p className="text-[10px] text-slate-455 font-normal font-sans">Please rate your experience resolving ticket {ticket.id}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold font-mono bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400">
                    SOLVED
                  </span>
                </div>

                {/* CSAT Star Rating */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-450 uppercase font-mono tracking-wider block">1. Customer Satisfaction (CSAT)</span>
                  <div className="flex gap-1.5 items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setCsatRating(star)}
                        onMouseEnter={() => setCsatHover(star)}
                        onMouseLeave={() => setCsatHover(0)}
                        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded p-1 transition-transform active:scale-95 hover:scale-110"
                        aria-label={`Rate ${star} out of 5 stars`}
                      >
                        <Star
                          className={`w-5 h-5 transition-colors duration-150 ${
                            (csatHover || csatRating) >= star
                              ? 'fill-amber-400 text-amber-450 filter drop-shadow-[0_0_2px_rgba(251,191,36,0.5)]'
                              : 'text-slate-300 dark:text-slate-700'
                          }`}
                        />
                      </button>
                    ))}
                    {csatRating > 0 && (
                      <span className="text-[10px] font-bold text-slate-500 font-mono pl-2">
                        ({csatRating}/5 stars)
                      </span>
                    )}
                  </div>
                </div>

                {/* NPS Score Rating */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-850">
                  <span className="text-[10px] font-bold text-slate-455 uppercase font-mono tracking-wider block">2. Net Promoter Score (NPS)</span>
                  <p className="text-[10px] text-slate-550 dark:text-slate-400 font-normal">How likely are you to recommend our support desk to a colleague?</p>
                  <div className="grid grid-cols-10 gap-1 mt-1.5">
                    {Array.from({ length: 10 }).map((_, i) => {
                      const score = i + 1;
                      const isSelected = npsRating === score;
                      return (
                        <button
                          key={score}
                          type="button"
                          onClick={() => setNpsRating(score)}
                          className={`py-1 rounded-lg flex items-center justify-center font-mono font-bold text-[10px] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 active:scale-95 ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {score}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[8px] text-slate-400 font-bold px-1 font-mono uppercase">
                    <span>Not Likely</span>
                    <span>Extremely Likely</span>
                  </div>
                </div>

                {/* Review Text Area */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-850">
                  <label htmlFor="feedback-comment" className="text-[10px] font-bold text-slate-450 uppercase font-mono tracking-wider block">
                    3. Additional Comments (Optional)
                  </label>
                  <textarea
                    id="feedback-comment"
                    rows={2}
                    placeholder="Anything else you'd like to share about this resolution..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl text-xs p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-850 dark:text-slate-100 font-normal"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="button"
                  disabled={csatRating === 0 || npsRating === 0}
                  onClick={() => {
                    addAuditLog(`CSAT: ${csatRating}/5, NPS: ${npsRating}/10 submitted for solved ticket ${ticket.id}`, 'success');
                    setFeedbackSubmitted(true);
                  }}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs text-center shadow-md transition-all ${
                    csatRating === 0 || npsRating === 0
                      ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer'
                  }`}
                >
                  Submit Resolution Feedback
                </button>
              </div>
            )
          )}

          {/* Composer */}
          <form onSubmit={handlePostReply} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 flex flex-col gap-2 shadow-sm">
            <textarea
              rows={3}
              placeholder="Write a message reply back to the support agent..."
              value={ticketReplyText}
              onChange={(e) => setTicketReplyText(e.target.value)}
              className="w-full bg-transparent text-xs p-2 focus:outline-none text-slate-850 dark:text-slate-100"
            />
            
            <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-850">
              <button
                type="button"
                onClick={() => {
                  const fileInput = document.createElement('input');
                  fileInput.type = 'file';
                  fileInput.onchange = (e: any) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      alert(`File attached: ${file.name}`);
                    }
                  };
                  fileInput.click();
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
                title="Attach file to ticket"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Attach File</span>
              </button>
              
              <button
                type="submit"
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md transition-all focus-visible:ring-2 focus-visible:ring-blue-500 outline-none cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Message</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right panel: Metadata & SLA Timeline */}
        <div className="space-y-4">
          {/* Metadata summary */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
            <h4 className="font-bold text-xs text-slate-450 uppercase font-mono">Case Specifications</h4>
            <div className="space-y-2 text-xs font-semibold">
              <div className="flex justify-between">
                <span className="text-slate-450">Category</span>
                <span>{ticket.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-450">Priority</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                  ticket.priority === 'urgent' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {ticket.priority.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-450">Resolution Status</span>
                <span className="font-mono text-blue-500 font-bold uppercase">{ticket.status}</span>
              </div>
            </div>
          </div>

          {/* Timeline status milestones */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3.5">
            <h4 className="font-bold text-xs text-slate-450 uppercase font-mono">Status Timeline</h4>
            
            <div className="space-y-4">
              <div className="flex gap-3 border-l border-emerald-500 pb-2 pl-3 relative">
                <div className="absolute -left-1 w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <div className="text-[11px] font-semibold">
                  <h5 className="font-bold">Ticket Open</h5>
                  <span className="text-[9px] text-slate-450 font-mono">May 18, 14:15</span>
                </div>
              </div>

              <div className={`flex gap-3 pb-2 pl-3 relative ${ticket.status !== 'open' ? 'border-l border-emerald-500' : 'border-l border-slate-250'}`}>
                <div className={`absolute -left-1 w-2.5 h-2.5 rounded-full ${ticket.status !== 'open' ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                <div className="text-[11px] font-semibold">
                  <h5 className="font-bold">Assigned Agent (Liam)</h5>
                  <span className="text-[9px] text-slate-450 font-mono">{ticket.status !== 'open' ? 'May 18, 14:30' : 'Pending Allocation'}</span>
                </div>
              </div>

              <div className="flex gap-3 pl-3 relative">
                <div className={`absolute -left-1 w-2.5 h-2.5 rounded-full ${ticket.status === 'solved' ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                <div className="text-[11px] font-semibold">
                  <h5 className="font-bold">Resolution Finalized</h5>
                  <span className="text-[9px] text-slate-450 font-mono">{ticket.status === 'solved' ? 'May 18, 16:30' : 'Pending resolution'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
