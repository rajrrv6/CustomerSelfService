'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Agent, Conversation } from '@/types';
import { ShieldAlert, Volume2, Send, Calendar, Users, Eye, HelpCircle, Activity } from 'lucide-react';

export function SupervisorView({ activeSubScreen }: { activeSubScreen: string }) {
  const { agents, conversations, setConversations, addAuditLog } = useApp();
  const [whisperTargetChatId, setWhisperTargetChatId] = useState('conv-2');
  const [whisperInput, setWhisperInput] = useState('');
  
  // Workforce forecasting mock states
  const forecastData = [
    { hour: '09:00 - 10:00 AST', expectedChats: 45, scheduledAgents: 4, status: 'sufficient' },
    { hour: '10:00 - 11:00 AST', expectedChats: 120, scheduledAgents: 6, status: 'warning' },
    { hour: '11:00 - 12:00 AST', expectedChats: 140, scheduledAgents: 5, status: 'breach_risk' },
    { hour: '12:00 - 13:00 AST', expectedChats: 60, scheduledAgents: 4, status: 'sufficient' }
  ];

  const handleSendWhisper = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whisperInput) return;

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === whisperTargetChatId) {
          return {
            ...c,
            status: 'escalated' // Escalated status renders the supervisor whisper bar
          };
        }
        return c;
      })
    );

    addAuditLog(`Supervisor Sarah sent live whisper to chat ${whisperTargetChatId}: "${whisperInput}"`, 'success');
    setWhisperInput('');
  };

  switch (activeSubScreen) {
    case 'supervisor_monitor':
      return (
        <div className="space-y-4 sm:space-y-6 min-w-0">
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Supervisor Monitoring Console</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">Monitor active chats, review agent sentiment flags, and whisper coaching guidelines in real-time.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monitor roster */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4 min-w-0">
              <h3 className="font-bold text-xs text-slate-650 dark:text-slate-400 uppercase font-mono mb-2">Live Conversation Roster</h3>
              <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                <table className="w-full min-w-190 text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-455 font-bold">
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Agent Assigned</th>
                      <th className="pb-3">Sentiment</th>
                      <th className="pb-3">SLA Status</th>
                      <th className="pb-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-600 dark:text-slate-350">
                    {conversations.filter(c => c.status === 'active' || c.status === 'escalated').map((chat) => (
                      <tr key={chat.id} className={chat.id === whisperTargetChatId ? 'bg-slate-50 dark:bg-slate-850/40' : ''}>
                        <td className="py-3.5">
                          <span className="font-bold text-slate-900 dark:text-white block">{chat.customerName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Channel: {chat.channel.toUpperCase()}</span>
                        </td>
                        <td className="py-3.5 font-medium">{chat.agentId === 'agent-1' ? 'Liam Bennett' : 'Nadia Vance'}</td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${
                            chat.sentiment === 'negative'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-400'
                              : 'bg-emerald-100 text-emerald-850'
                          }`}>
                            {chat.sentiment}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                            chat.slaStatus === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {chat.slaStatus.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <button
                            onClick={() => setWhisperTargetChatId(chat.id)}
                            className="px-2.5 py-1 text-[10px] font-bold bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-200"
                          >
                            Listen
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Live Whisper composer panel */}
            <div className="bg-slate-150/40 dark:bg-slate-900/55 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-850 h-fit space-y-4 text-xs font-semibold min-w-0">
              <h3 className="font-bold text-xs text-slate-650 dark:text-slate-400 uppercase font-mono flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-purple-500" />
                Live Agent Whisper
              </h3>
              
              <form onSubmit={handleSendWhisper} className="space-y-4">
                <div>
                  <label className="block text-slate-500 mb-1.5">Whisper Destination</label>
                  <select
                    value={whisperTargetChatId}
                    onChange={(e) => setWhisperTargetChatId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none"
                  >
                    {conversations.filter(c => c.status === 'active' || c.status === 'escalated').map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.customerName} (Liam)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 mb-1.5">Whispering Message Note</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="e.g. Propose checking customer API logs scopes..."
                    value={whisperInput}
                    onChange={(e) => setWhisperInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-purple-650 hover:bg-purple-700 text-white font-bold rounded-xl text-center"
                >
                  Whisper to Agent
                </button>
              </form>
            </div>
          </div>
        </div>
      );

    case 'workforce':
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Forecasting & Scheduling</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">Analyze forecasted contact center queues and optimize agent shift schedules.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-xs text-slate-655 dark:text-slate-400 uppercase font-mono">Today's Traffic Forecast</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-450 font-bold">
                    <th className="pb-3">Shift Hour</th>
                    <th className="pb-3">Expected Inbound Chats</th>
                    <th className="pb-3">Scheduled Agents</th>
                    <th className="pb-3">Status Assessment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-600 dark:text-slate-350">
                  {forecastData.map((row, idx) => (
                    <tr key={idx}>
                      <td className="py-3.5 font-semibold font-mono">{row.hour}</td>
                      <td className="py-3.5 font-bold font-mono">{row.expectedChats} sessions</td>
                      <td className="py-3.5 font-mono">{row.scheduledAgents} agents</td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${
                          row.status === 'sufficient'
                            ? 'bg-emerald-100 text-emerald-800'
                            : row.status === 'warning'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {row.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}
