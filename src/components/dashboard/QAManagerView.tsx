'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { QAReview } from '@/types';
import { Award, Plus, Sliders, CheckCircle, HelpCircle, MessageSquare } from 'lucide-react';

export function QAManagerView({ activeSubScreen }: { activeSubScreen: string }) {
  const { qaReviews, setQaReviews, addAuditLog } = useApp();
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>('qa-1');

  // Coaching plan mock state
  const [coachingPlans, setCoachingPlans] = useState([
    { id: 'cp-1', agent: 'Liam Bennett', metric: 'First Response Time', target: '< 45s', progress: 'In Progress', date: '2026-05-18' },
    { id: 'cp-2', agent: 'Nadia Vance', metric: 'CSAT Conversion Rate', target: '96% CSAT', progress: 'Completed', date: '2026-05-10' }
  ]);

  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [newPlanAgent, setNewPlanAgent] = useState('Liam Bennett');
  const [newPlanMetric, setNewPlanMetric] = useState('Greeting delay minimization');

  const selectedReview = qaReviews.find((r) => r.id === selectedReviewId);

  const handleCreateCoachingPlan = (e: React.FormEvent) => {
    e.preventDefault();
    const newPlan = {
      id: `cp-${Date.now()}`,
      agent: newPlanAgent,
      metric: newPlanMetric,
      target: 'Score > 85%',
      progress: 'In Progress',
      date: new Date().toISOString().split('T')[0]
    };
    setCoachingPlans((prev) => [newPlan, ...prev]);
    setShowAddPlanModal(false);
    addAuditLog(`Created coaching plan for ${newPlanAgent} targeting ${newPlanMetric}`, 'success');
  };

  switch (activeSubScreen) {
    case 'qa_queue':
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">QA Review Queue</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">Audit call recordings and chat transcripts to enforce compliance SLAs and grading rules.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List queue */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-xs text-slate-650 dark:text-slate-400 uppercase font-mono mb-2">Audits Queue</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-450 font-bold">
                      <th className="pb-3">Agent</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3">QA Score</th>
                      <th className="pb-3">Audit Status</th>
                      <th className="pb-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-600 dark:text-slate-350">
                    {qaReviews.map((rev) => (
                      <tr key={rev.id} className={rev.id === selectedReviewId ? 'bg-slate-50 dark:bg-slate-850/30' : ''}>
                        <td className="py-3.5 font-bold text-slate-900 dark:text-white">{rev.agentName}</td>
                        <td className="py-3.5 font-mono">{rev.date}</td>
                        <td className="py-3.5 font-bold font-mono text-blue-600 dark:text-blue-400">{rev.score > 0 ? `${rev.score}%` : 'N/A'}</td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${
                            rev.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-850'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
                          }`}>
                            {rev.status}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <button
                            onClick={() => setSelectedReviewId(rev.id)}
                            className="px-2.5 py-1 text-[10px] font-bold bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-200"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Review detail panel */}
            <div className="bg-slate-150/40 dark:bg-slate-900/55 p-5 rounded-2xl border border-slate-200 dark:border-slate-850 h-fit space-y-4 text-xs font-semibold">
              <h3 className="font-bold text-xs text-slate-650 dark:text-slate-400 uppercase font-mono">Grading Breakdown</h3>
              
              {selectedReview ? (
                selectedReview.status === 'completed' ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-white dark:bg-slate-950 p-3.5 rounded-xl border border-slate-100 dark:border-slate-900 shadow-sm">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block font-mono">Assigned QA Grade</span>
                        <span className="text-xl font-bold text-emerald-500 font-mono mt-1 block">{selectedReview.score}%</span>
                      </div>
                      <Award className="w-8 h-8 text-emerald-500 opacity-80" />
                    </div>

                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-slate-450 uppercase font-mono block text-emerald-600">Audit Strengths</span>
                      <ul className="list-disc list-inside text-[11px] text-slate-600 dark:text-slate-350 space-y-1 font-medium pl-1">
                        {selectedReview.positives.map((p, idx) => (
                          <li key={idx}>{p}</li>
                        ))}
                      </ul>
                    </div>

                    {selectedReview.negatives.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[9px] font-bold text-slate-455 uppercase font-mono block text-rose-500">Identified Gaps</span>
                        <ul className="list-disc list-inside text-[11px] text-slate-600 dark:text-slate-350 space-y-1 font-medium pl-1">
                          {selectedReview.negatives.map((n, idx) => (
                            <li key={idx}>{n}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase font-mono block">Coaching Instruction</span>
                      <p className="text-[11px] leading-relaxed text-slate-500 font-normal italic">
                        "{selectedReview.coachingPoints[0]}"
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-400">Review status is pending grading. Click below to grade.</p>
                    <button
                      onClick={() => {
                        setQaReviews((prev) =>
                          prev.map((r) =>
                            r.id === selectedReview.id
                              ? {
                                  ...r,
                                  status: 'completed',
                                  score: 88,
                                  positives: ['Accurate slot collection', 'Clear validation steps'],
                                  negatives: ['Language translator template was bypassed'],
                                  coachingPoints: ['Review multilingual template guidelines. Ensure LTR/RTL rules are verified.']
                                }
                              : r
                          )
                        );
                        addAuditLog(`Completed QA grade audit for conversation: ${selectedReview.conversationId}`, 'success');
                      }}
                      className="w-full py-2 bg-blue-650 hover:bg-blue-700 text-white rounded-xl text-xs font-bold text-center"
                    >
                      Assign Grade (88%)
                    </button>
                  </div>
                )
              ) : (
                <div className="text-center py-6 text-slate-400">Select a review from the queue.</div>
              )}
            </div>
          </div>
        </div>
      );

    case 'coaching':
      return (
        <div className="space-y-4 sm:space-y-6 min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Agent Coaching Plans</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">Draft customized training programs and monitor agent score targets.</p>
            </div>
            <button
              onClick={() => setShowAddPlanModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Create Coaching Plan
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {coachingPlans.map((plan) => (
              <div key={plan.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between min-w-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-slate-850 dark:text-white">{plan.agent}</h4>
                      <span className="text-[10px] text-slate-400 font-mono block mt-1">Initiated: {plan.date}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                      plan.progress === 'Completed'
                        ? 'bg-emerald-100 text-emerald-850'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                    }`}>
                      {plan.progress.toUpperCase()}
                    </span>
                  </div>
                  <div className="pt-2 text-xs font-semibold space-y-1">
                    <div className="text-slate-450">Focus Metric: <strong className="text-slate-700 dark:text-slate-300 font-mono">{plan.metric}</strong></div>
                    <div className="text-slate-450">Performance Target: <strong className="text-slate-750 dark:text-slate-350 font-mono">{plan.target}</strong></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Create coaching plan modal */}
          {showAddPlanModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 max-h-[90dvh] overflow-y-auto">
                <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="font-bold text-slate-850 dark:text-white text-sm">Create Coaching Plan</h3>
                  <button onClick={() => setShowAddPlanModal(false)} className="text-slate-400 text-lg">×</button>
                </div>
                <form onSubmit={handleCreateCoachingPlan} className="p-4 sm:p-5 space-y-4 text-xs font-semibold">
                  <div>
                    <label className="block text-slate-500 mb-1.5">Select Agent</label>
                    <select
                      value={newPlanAgent}
                      onChange={(e) => setNewPlanAgent(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none"
                    >
                      <option>Liam Bennett</option>
                      <option>Nadia Vance</option>
                      <option>Tariq Mansoor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1.5">Target Metric / Skill Area</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Conversational Tone Polish"
                      value={newPlanMetric}
                      onChange={(e) => setNewPlanMetric(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddPlanModal(false)}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
                    >
                      Save Plan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
}
