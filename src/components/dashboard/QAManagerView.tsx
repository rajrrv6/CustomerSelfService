'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { QAReview, Conversation } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import {
  Award,
  Plus,
  Sliders,
  CheckCircle,
  HelpCircle,
  MessageSquare,
  AlertTriangle,
  Heart,
  Smile,
  FileText,
  User,
  ArrowRight,
  TrendingUp,
  Settings,
  Scale
} from 'lucide-react';
import AgentWorkspaceLayout from '@/components/agent-workspace/AgentWorkspaceLayout';
import { SurveysTab } from '@/components/client-admin/operations/SurveysTab';
import { TrainingTab } from '@/components/client-admin/training/TrainingTab';
import { EnterpriseTable } from '@/components/shared/EnterpriseTable';
import { ApprovalStepper } from '@/components/shared/workflows/ApprovalStepper';
import { WorkflowTimeline } from '@/components/shared/workflows/WorkflowTimeline';
import { StatusIndicator } from '@/components/shared/workflows/StatusIndicator';
import { ScorecardBuilderWorkspace } from '@/components/qa/ScorecardBuilderWorkspace';

export function QAManagerView({ activeSubScreen }: { activeSubScreen: string }) {
  const { lang, qaReviews, setQaReviews, addAuditLog, conversations } = useApp();
  const actualRole = useAuthStore((s) => s.role);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>('qa-1');
  const [simulatedRole, setSimulatedRole] = useState<'qa_manager' | 'support_agent'>('qa_manager');

  // Coaching plan state
  const [coachingPlans, setCoachingPlans] = useState([
    { id: 'cp-1', agent: 'Liam Bennett', metric: 'First Response Time', target: '< 45s', progress: 'In Progress', date: '2026-05-18' },
    { id: 'cp-2', agent: 'Nadia Vance', metric: 'CSAT Conversion Rate', target: '96% CSAT', progress: 'Completed', date: '2026-05-10' }
  ]);

  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [newPlanAgent, setNewPlanAgent] = useState('Liam Bennett');
  const [newPlanMetric, setNewPlanMetric] = useState('Greeting delay minimization');

  // Scorecard grading fields (temp local state)
  const [gradeCompliance, setGradeCompliance] = useState<number>(85);
  const [gradeEmpathy, setGradeEmpathy] = useState<number>(90);
  const [gradeTechnical, setGradeTechnical] = useState<number>(80);
  const [gradeResolution, setGradeResolution] = useState<number>(85);

  const [positivesText, setPositivesText] = useState<string>('Clear guidance, Professional tone');
  const [negativesText, setNegativesText] = useState<string>('Response time exceeded benchmark');
  const [coachingText, setCoachingText] = useState<string>('Focus on proactive greeting times');
  const [supervisorNotesText, setSupervisorNotesText] = useState<string>('Agent is showing improvement');

  // Dispute local states
  const [disputeReason, setDisputeReason] = useState<string>('');
  const [disputeResponse, setDisputeResponse] = useState<string>('');
  const [disputeResolutionType, setDisputeResolutionType] = useState<'accept' | 'reject'>('accept');

  const selectedReview = qaReviews.find((r) => r.id === selectedReviewId);
  const selectedConversation = selectedReview
    ? conversations.find((c) => c.id === selectedReview.conversationId)
    : null;

  const isRtl = lang === 'ar';

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

  const handleSaveGrade = (reviewId: string) => {
    const finalScore = Math.round(
      (gradeCompliance + gradeEmpathy + gradeTechnical + gradeResolution) / 4
    );

    const posList = positivesText.split(',').map((x) => x.trim()).filter(Boolean);
    const negList = negativesText.split(',').map((x) => x.trim()).filter(Boolean);
    const coachList = coachingText.split(',').map((x) => x.trim()).filter(Boolean);

    setQaReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
          const oldHistory = r.historyTimeline || [];
          return {
            ...r,
            status: 'completed',
            score: finalScore,
            positives: posList,
            negatives: negList,
            coachingPoints: coachList,
            supervisorNotes: supervisorNotesText,
            scorecardMetrics: {
              compliance: gradeCompliance,
              empathy: gradeEmpathy,
              technical: gradeTechnical,
              resolution: gradeResolution
            },
            historyTimeline: [
              ...oldHistory,
              {
                status: 'completed',
                date: timestamp,
                updatedBy: 'Marc Antoine (Supervisor)',
                notes: `Scorecard completed. Score: ${finalScore}%`
              }
            ]
          };
        }
        return r;
      })
    );

    addAuditLog(`Saved scorecard and finalized QA grade of ${finalScore}% for review ${reviewId}`, 'success');
  };

  const handleFileDispute = (reviewId: string) => {
    if (!disputeReason.trim()) return;

    setQaReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
          const oldHistory = r.historyTimeline || [];
          return {
            ...r,
            status: 'disputed',
            disputeReason: disputeReason,
            historyTimeline: [
              ...oldHistory,
              {
                status: 'disputed',
                date: timestamp,
                updatedBy: `${r.agentName} (Agent)`,
                notes: `Dispute filed: "${disputeReason}"`
              }
            ]
          };
        }
        return r;
      })
    );

    addAuditLog(`Dispute filed by agent for review ${reviewId}`, 'success');
    setDisputeReason('');
  };

  const handleResolveDispute = (reviewId: string) => {
    if (!disputeResponse.trim()) return;

    setQaReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
          const oldHistory = r.historyTimeline || [];
          
          let finalScore = r.score;
          let finalStatus: 'completed' | 'coaching_assigned' = 'completed';
          let finalNotes = `Dispute Resolved (${disputeResolutionType === 'accept' ? 'Approved' : 'Rejected'}): ${disputeResponse}`;

          if (disputeResolutionType === 'accept') {
            // Simulated score boost
            finalScore = Math.min(100, r.score + 5);
            finalStatus = 'completed';
          } else {
            // Assign coaching
            finalStatus = 'coaching_assigned';
          }

          return {
            ...r,
            status: finalStatus,
            score: finalScore,
            disputeResponse: disputeResponse,
            historyTimeline: [
              ...oldHistory,
              {
                status: finalStatus,
                date: timestamp,
                updatedBy: 'Marc Antoine (Supervisor)',
                notes: finalNotes
              }
            ]
          };
        }
        return r;
      })
    );

    addAuditLog(`Dispute resolved for review ${reviewId} (${disputeResolutionType})`, 'success');
    setDisputeResponse('');
  };

  const tableHeaders = [
    { key: 'agent', label: isRtl ? 'الوكيل' : 'Agent' },
    { key: 'date', label: isRtl ? 'التاريخ' : 'Date' },
    { key: 'score', label: isRtl ? 'الدرجة' : 'QA Score' },
    { key: 'status', label: isRtl ? 'الحالة' : 'Audit Status' },
    { key: 'actions', label: isRtl ? 'الإجراءات' : 'Actions' }
  ];

  switch (activeSubScreen) {
    case 'scorecard_builder':
      return <ScorecardBuilderWorkspace />;
    case 'evaluations':
      const completedReviews = qaReviews.filter(r => r.status === 'completed');
      return (
        <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              {isRtl ? 'سجلات تقييم أداء الوكلاء' : 'Agent Performance Evaluations'}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {isRtl 
                ? 'عرض تفاصيل التقييمات المكتملة ومتوسطات درجات الجودة المحققة.' 
                : 'Review completed agent evaluations and average quality scoring aggregates.'}
            </p>
          </div>

          {/* Aggregates Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Compliance Avg', value: '86%', color: 'text-blue-500' },
              { title: 'Empathy & Tone Avg', value: '91%', color: 'text-emerald-500' },
              { title: 'Technical Accuracy Avg', value: '84%', color: 'text-purple-500' },
              { title: 'Resolution Skill Avg', value: '87%', color: 'text-amber-500' }
            ].map((card, idx) => (
              <div key={idx} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                <span className="text-[9px] uppercase font-bold text-slate-400 font-mono block">
                  {card.title}
                </span>
                <strong className={`text-lg font-bold font-mono block mt-1 ${card.color}`}>
                  {card.value}
                </strong>
              </div>
            ))}
          </div>

          {/* Evaluations List Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-xs text-slate-650 dark:text-slate-400 uppercase font-mono">
              {isRtl ? 'التقييمات المعتمدة والنهائية' : 'Completed QA Evaluations'}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-455 font-bold">
                    <th className="pb-3">{isRtl ? 'الوكيل' : 'Agent'}</th>
                    <th className="pb-3">{isRtl ? 'التاريخ' : 'Date'}</th>
                    <th className="pb-3">{isRtl ? 'درجة الجودة' : 'Quality Score'}</th>
                    <th className="pb-3">{isRtl ? 'الحالة' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-600 dark:text-slate-350">
                  {completedReviews.map((row) => (
                    <tr key={row.id}>
                      <td className="py-3.5 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-mono font-bold text-slate-600 dark:text-slate-350">
                            {row.agentName.substring(0,2).toUpperCase()}
                          </div>
                          <span>{row.agentName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 font-mono text-slate-500 dark:text-slate-400">{row.date}</td>
                      <td className="py-3.5 font-bold font-mono text-emerald-500">{row.score}%</td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold font-mono bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400">
                          {isRtl ? 'مكتمل' : 'COMPLETED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {completedReviews.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400 italic">
                        {isRtl ? 'لا توجد تقييمات مكتملة حالياً' : 'No completed evaluations found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );

    case 'qa_queue':
      return (
        <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
          {/* Header & Simulator Panel */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-205 dark:border-slate-800 rounded-2xl">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                {isRtl ? 'طابور مراجعة الجودة' : 'QA Review Queue'}
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                {isRtl
                  ? 'تدقيق محادثات العملاء والتسجيلات الصوتية لضمان الامتثال لـ SLAs ومعايير التقييم.'
                  : 'Audit call recordings and chat transcripts to enforce compliance SLAs and grading rules.'}
              </p>
            </div>

            {/* Simulated Persona Switcher for Vibe coding sandbox testing */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
              <Scale className="w-4 h-4 text-blue-500" />
              <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wider">
                {isRtl ? 'محاكاة الدور:' : 'Sandbox Persona:'}
              </span>
              <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200/50 dark:border-slate-800/50">
                <button
                  onClick={() => setSimulatedRole('qa_manager')}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${
                    simulatedRole === 'qa_manager'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                  }`}
                >
                  {isRtl ? 'مدير الجودة' : 'QA Manager'}
                </button>
                <button
                  onClick={() => setSimulatedRole('support_agent')}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${
                    simulatedRole === 'support_agent'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                  }`}
                >
                  {isRtl ? 'العميل المساعد' : 'Support Agent'}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Audits Queue List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-slate-650 dark:text-slate-400 uppercase font-mono tracking-wider">
                  {isRtl ? 'طابور التدقيق والتقييم' : 'Audits Queue'}
                </h3>
              </div>

              <EnterpriseTable headers={tableHeaders} empty={qaReviews.length === 0}>
                {qaReviews.map((rev) => {
                  const isSelected = rev.id === selectedReviewId;
                  return (
                    <tr
                      key={rev.id}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-all ${
                        isSelected
                          ? 'bg-blue-50/30 dark:bg-blue-955/10 border-l-2 border-l-blue-600 dark:border-l-blue-500'
                          : ''
                      }`}
                    >
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-mono font-bold text-slate-600 dark:text-slate-350">
                            {rev.agentName.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-xs">{rev.agentName}</span>
                            <span className="text-[10px] font-mono text-slate-400 font-normal">
                              {rev.conversationId}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono font-medium text-slate-500 dark:text-slate-400">
                        {rev.date}
                      </td>
                      <td className="px-6 py-4 font-bold font-mono text-slate-700 dark:text-slate-300">
                        {rev.score > 0 ? (
                          <span className={`text-xs ${rev.score >= 90 ? 'text-emerald-500' : rev.score >= 80 ? 'text-blue-500' : 'text-rose-500'}`}>
                            {rev.score}%
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">
                            {isRtl ? 'قيد الانتظار' : 'Pending'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <StatusIndicator status={rev.status as any} isRtl={isRtl} />
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedReviewId(rev.id);
                            // Prepopulate edit states if pending
                            if (rev.status === 'pending') {
                              setGradeCompliance(85);
                              setGradeEmpathy(90);
                              setGradeTechnical(80);
                              setGradeResolution(85);
                              setPositivesText('Clear guidance, Professional tone');
                              setNegativesText('Response time exceeded benchmark');
                              setCoachingText('Focus on proactive greeting times');
                              setSupervisorNotesText('Agent is showing improvement');
                            } else {
                              setGradeCompliance(rev.scorecardMetrics?.compliance || 80);
                              setGradeEmpathy(rev.scorecardMetrics?.empathy || 80);
                              setGradeTechnical(rev.scorecardMetrics?.technical || 80);
                              setGradeResolution(rev.scorecardMetrics?.resolution || 80);
                              setPositivesText(rev.positives.join(', '));
                              setNegativesText(rev.negatives.join(', '));
                              setCoachingText(rev.coachingPoints.join(', '));
                              setSupervisorNotesText(rev.supervisorNotes || '');
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-colors select-none ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-650 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-850'
                          }`}
                        >
                          {isRtl ? 'تفاصيل' : 'Details'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </EnterpriseTable>

              {/* Chat Replay Transcript Area */}
              {selectedReview && (
                <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-850">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-500" />
                      <h4 className="font-bold text-xs text-slate-850 dark:text-white uppercase font-mono tracking-wider">
                        {isRtl ? 'سجل المحادثة وتوزيع المشاعر' : 'Conversation Transcript & Sentiment'}
                      </h4>
                    </div>
                    {selectedConversation && (
                      <span className="text-[10px] font-bold font-mono uppercase bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded-lg border border-blue-200/40">
                        {selectedConversation.channel}
                      </span>
                    )}
                  </div>

                  {selectedConversation ? (
                    <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-2">
                      {selectedConversation.messages.map((msg) => {
                        const isCustomer = msg.sender === 'customer';
                        const isSystem = msg.sender === 'system';
                        
                        // Determine background style based on sentiment
                        let sentimentStyle = 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850';
                        if (msg.sentiment === 'positive') {
                          sentimentStyle = 'bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-250 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-450';
                        } else if (msg.sentiment === 'negative') {
                          sentimentStyle = 'bg-rose-50/40 dark:bg-rose-950/10 border-rose-250 dark:border-rose-900/40 text-rose-800 dark:text-rose-455';
                        }

                        if (isSystem) {
                          return (
                            <div key={msg.id} className="text-center py-2">
                              <span className="inline-block text-[10px] font-bold font-mono uppercase bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-xl border border-dashed border-amber-200/50">
                                {msg.text}
                              </span>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col max-w-[85%] ${
                              isCustomer ? (isRtl ? 'mr-auto items-end' : 'ml-auto items-end') : 'items-start'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-[10px] font-bold text-slate-400">
                                {msg.senderName}
                              </span>
                              <span className="text-[8px] text-slate-400 font-mono">
                                {msg.timestamp}
                              </span>
                              {msg.sentiment && (
                                <span className={`text-[8px] px-1.5 py-0.2 rounded font-bold uppercase ${
                                  msg.sentiment === 'positive'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400'
                                    : msg.sentiment === 'negative'
                                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-400'
                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800'
                                }`}>
                                  {msg.sentiment}
                                </span>
                              )}
                            </div>
                            <div className={`p-3 rounded-2xl border text-xs font-semibold leading-relaxed ${sentimentStyle}`}>
                              <p>{msg.text}</p>
                              {msg.translatedText && (
                                <p className="text-[10px] mt-1.5 border-t border-dashed border-slate-200 dark:border-slate-800 pt-1.5 italic text-slate-400">
                                  {isRtl ? msg.text : msg.translatedText}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs italic">
                      {isRtl ? 'سجل المحادثة غير متوفر' : 'Associated transcript log not available.'}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Audit Inspector Panel */}
            <div className="space-y-4">
              <h3 className="font-bold text-xs text-slate-655 dark:text-slate-400 uppercase font-mono tracking-wider">
                {isRtl ? 'تفاصيل المراجعة والتقييم' : 'Audit Inspector'}
              </h3>

              {selectedReview ? (
                <div className="bg-slate-150/40 dark:bg-slate-900/55 border border-slate-205 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-5 text-xs font-semibold">
                  
                  {/* Approval Stepper Widget */}
                  <div className="bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-850">
                    <ApprovalStepper
                      currentStepKey={selectedReview.status}
                      steps={[
                        { labelEn: 'Pending', labelAr: 'معلق', key: 'pending' },
                        { labelEn: 'Calibration', labelAr: 'معايرة', key: 'in_calibration' },
                        { labelEn: 'Disputed', labelAr: 'نزاع', key: 'disputed' },
                        { labelEn: 'Coaching', labelAr: 'توجيه', key: 'coaching_assigned' },
                        { labelEn: 'Completed', labelAr: 'مكتمل', key: 'completed' }
                      ]}
                      isRtl={isRtl}
                    />
                  </div>

                  {/* Summary Core Header */}
                  <div className="flex justify-between items-center bg-white dark:bg-slate-950 p-3.5 rounded-xl border border-slate-100 dark:border-slate-900 shadow-sm">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-mono">
                        {isRtl ? 'الدرجة الممنوحة' : 'QA Quality Score'}
                      </span>
                      <span className="text-xl font-bold text-emerald-500 font-mono mt-1 block">
                        {selectedReview.score > 0 ? `${selectedReview.score}%` : 'N/A'}
                      </span>
                    </div>
                    <Award className="w-8 h-8 text-emerald-500 opacity-80" />
                  </div>

                  {/* Read-Only Completed View OR Editable Grading Form */}
                  {selectedReview.status !== 'pending' && selectedReview.status !== 'in_calibration' ? (
                    // Read-only parameters
                    <div className="space-y-4">
                      {selectedReview.scorecardMetrics && (
                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="p-2.5 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl">
                            <span className="text-[9px] text-slate-400 block uppercase font-mono">Compliance</span>
                            <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                              {selectedReview.scorecardMetrics.compliance}%
                            </span>
                          </div>
                          <div className="p-2.5 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl">
                            <span className="text-[9px] text-slate-400 block uppercase font-mono">Empathy & Tone</span>
                            <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                              {selectedReview.scorecardMetrics.empathy}%
                            </span>
                          </div>
                          <div className="p-2.5 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl">
                            <span className="text-[9px] text-slate-400 block uppercase font-mono">Technical Knowledge</span>
                            <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                              {selectedReview.scorecardMetrics.technical}%
                            </span>
                          </div>
                          <div className="p-2.5 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl">
                            <span className="text-[9px] text-slate-400 block uppercase font-mono">Resolution Skill</span>
                            <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                              {selectedReview.scorecardMetrics.resolution}%
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <span className="text-[9px] font-bold text-emerald-650 uppercase font-mono block">
                          {isRtl ? 'نقاط القوة' : 'Audit Strengths'}
                        </span>
                        <ul className="list-disc list-inside text-[11px] text-slate-650 dark:text-slate-350 space-y-1 font-medium pl-1">
                          {selectedReview.positives.map((p, idx) => (
                            <li key={idx}>{p}</li>
                          ))}
                        </ul>
                      </div>

                      {selectedReview.negatives.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[9px] font-bold text-rose-500 uppercase font-mono block">
                            {isRtl ? 'فجوات الأداء' : 'Identified Gaps'}
                          </span>
                          <ul className="list-disc list-inside text-[11px] text-slate-650 dark:text-slate-350 space-y-1 font-medium pl-1">
                            {selectedReview.negatives.map((n, idx) => (
                              <li key={idx}>{n}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedReview.coachingPoints.length > 0 && (
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase font-mono block">
                            {isRtl ? 'تعليمات التوجيه والتدريب' : 'Coaching Guidelines'}
                          </span>
                          <p className="text-[11px] leading-relaxed text-slate-500 font-normal italic">
                            "{selectedReview.coachingPoints[0]}"
                          </p>
                        </div>
                      )}

                      {selectedReview.supervisorNotes && (
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase font-mono block">
                            {isRtl ? 'ملاحظات المشرف' : 'Supervisor Notes'}
                          </span>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-normal">
                            {selectedReview.supervisorNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Interactive Scorecard Form (For QA Manager / Supervisor)
                    <div className="space-y-4">
                      <div className="pb-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-700 dark:text-slate-300">
                          {isRtl ? 'نموذج تقييم المكالمة' : 'Audit Scorecard Form'}
                        </span>
                        <span className="text-[10px] font-mono text-blue-500 font-bold uppercase">
                          {isRtl ? 'جاري التدقيق' : 'Grading Mode'}
                        </span>
                      </div>

                      <div className="space-y-3.5">
                        {/* Compliance score */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-slate-550">
                            <span>Compliance Check</span>
                            <span className="font-mono">{gradeCompliance}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={gradeCompliance}
                            onChange={(e) => setGradeCompliance(Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                        </div>

                        {/* Empathy score */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-slate-550">
                            <span>Empathy & Soft Skills</span>
                            <span className="font-mono">{gradeEmpathy}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={gradeEmpathy}
                            onChange={(e) => setGradeEmpathy(Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                        </div>

                        {/* Technical knowledge score */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-slate-550">
                            <span>Technical / Product Accuracy</span>
                            <span className="font-mono">{gradeTechnical}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={gradeTechnical}
                            onChange={(e) => setGradeTechnical(Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                        </div>

                        {/* Resolution score */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-slate-550">
                            <span>Resolution & Documentation</span>
                            <span className="font-mono">{gradeResolution}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={gradeResolution}
                            onChange={(e) => setGradeResolution(Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                        </div>
                      </div>

                      {/* Text details */}
                      <div className="space-y-3.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                            Strengths (positives, comma-separated)
                          </label>
                          <input
                            type="text"
                            value={positivesText}
                            onChange={(e) => setPositivesText(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                            Identified Gaps (negatives, comma-separated)
                          </label>
                          <input
                            type="text"
                            value={negativesText}
                            onChange={(e) => setNegativesText(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                            Coaching Points
                          </label>
                          <textarea
                            value={coachingText}
                            onChange={(e) => setCoachingText(e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold resize-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                            Internal Supervisor Notes
                          </label>
                          <textarea
                            value={supervisorNotesText}
                            onChange={(e) => setSupervisorNotesText(e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold resize-none"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => handleSaveGrade(selectedReview.id)}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold text-center transition-colors shadow-md shadow-blue-550/15"
                      >
                        {isRtl ? 'حفظ تقرير التدقيق النهائي' : 'Complete & Save Grade Audit'}
                      </button>
                    </div>
                  )}

                  {/* Dispute Filing Form - Support Agent Role simulation */}
                  {selectedReview.status === 'completed' && simulatedRole === 'support_agent' && (
                    <div className="bg-rose-50/40 dark:bg-rose-955/10 border border-rose-200/50 dark:border-rose-900/35 p-4 rounded-xl space-y-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                        <span className="font-bold text-xs text-rose-800 dark:text-rose-400">
                          {isRtl ? 'اعتراض على تقييم الأداء' : 'Dispute Grade (Agent Role)'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed font-normal">
                        {isRtl
                          ? 'بصفتك وكيلاً، إذا كنت تعتقد أن هذا التدقيق غير عادل، يمكنك تقديم طلب نزاع رسمي لمراجعة الملاحظات.'
                          : 'As an agent, if you believe this audit was unfair or details are inaccurate, you can submit a dispute to request supervisor recalibration.'}
                      </p>
                      <textarea
                        value={disputeReason}
                        onChange={(e) => setDisputeReason(e.target.value)}
                        placeholder={isRtl ? 'اذكر سبب الاعتراض بالتفصيل...' : 'Detail the reasons for disputing this audit score...'}
                        rows={3}
                        className="w-full px-3 py-2 text-xs border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500 font-semibold"
                      />
                      <button
                        onClick={() => handleFileDispute(selectedReview.id)}
                        disabled={!disputeReason.trim()}
                        className="w-full py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white rounded-xl text-xs font-bold text-center transition-colors"
                      >
                        {isRtl ? 'تقديم الاعتراض الرسمي' : 'Submit Dispute Request'}
                      </button>
                    </div>
                  )}

                  {/* Dispute Calibration Form - Supervisor / QA Manager Role simulation */}
                  {selectedReview.status === 'disputed' && (
                    <div className="bg-amber-50/40 dark:bg-amber-955/10 border border-amber-200/50 dark:border-amber-900/35 p-4 rounded-xl space-y-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span className="font-bold text-xs text-amber-800 dark:text-amber-400">
                          {isRtl ? 'معالجة طلب النزاع المقدم' : 'Resolve Pending Dispute'}
                        </span>
                      </div>
                      <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-amber-200/30">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">Agent Dispute Reason:</span>
                        <p className="text-[11px] text-slate-700 dark:text-slate-300 font-normal italic mt-1 leading-relaxed">
                          "{selectedReview.disputeReason}"
                        </p>
                      </div>

                      {simulatedRole === 'qa_manager' ? (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">
                              Calibration Decision
                            </label>
                            <select
                              value={disputeResolutionType}
                              onChange={(e) => setDisputeResolutionType(e.target.value as any)}
                              className="w-full px-2.5 py-1.5 border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                            >
                              <option value="accept">Accept Dispute (+5 Score Recalibration)</option>
                              <option value="reject">Reject Dispute (Maintain Grade, Assign Coaching)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">
                              Response to Agent
                            </label>
                            <textarea
                              value={disputeResponse}
                              onChange={(e) => setDisputeResponse(e.target.value)}
                              placeholder="Explain your calibration details or reasons..."
                              rows={2}
                              className="w-full px-3 py-2 text-xs border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                            />
                          </div>

                          <button
                            onClick={() => handleResolveDispute(selectedReview.id)}
                            disabled={!disputeResponse.trim()}
                            className="w-full py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white rounded-xl text-xs font-bold text-center transition-colors"
                          >
                            Resolve Dispute Request
                          </button>
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-400 italic text-center">
                          Please switch to QA Manager persona to resolve this dispute.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Audit Transition History Timeline */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-850 space-y-3">
                    <span className="font-bold text-xs text-slate-700 dark:text-slate-300 block uppercase font-mono tracking-wide">
                      {isRtl ? 'سجل العمليات والاعتماد' : 'Audit Lifecycle Trail'}
                    </span>
                    <WorkflowTimeline events={selectedReview.historyTimeline} isRtl={isRtl} />
                  </div>

                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-white dark:bg-slate-900">
                  {isRtl ? 'يرجى اختيار مراجعة من الجدول لعرض التفاصيل' : 'Select a review from the queue.'}
                </div>
              )}
            </div>
          </div>
        </div>
      );

    case 'coaching':
      return (
        <div className="space-y-4 sm:space-y-6 min-w-0" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                {isRtl ? 'خطط تدريب وتوجيه الوكلاء' : 'Agent Coaching Plans'}
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {isRtl
                  ? 'إعداد وتصميم برامج تدريبية مخصصة ومتابعة أهداف درجات تقييم أداء الوكلاء.'
                  : 'Draft customized training programs and monitor agent score targets.'}
              </p>
            </div>
            <button
              onClick={() => setShowAddPlanModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              {isRtl ? 'إضافة خطة تدريبية جديدة' : 'Create Coaching Plan'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {coachingPlans.map((plan) => (
              <div key={plan.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between min-w-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-slate-850 dark:text-white">{plan.agent}</h4>
                      <span className="text-[10px] text-slate-400 font-mono block mt-1">
                        {isRtl ? 'تاريخ البدء:' : 'Initiated:'} {plan.date}
                      </span>
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
                  <h3 className="font-bold text-slate-850 dark:text-white text-sm">
                    {isRtl ? 'إنشاء خطة تدريب جديدة' : 'Create Coaching Plan'}
                  </h3>
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

    case 'qa_analytics':
      return (
        <div className="space-y-6 animate-in fade-in-50 duration-200" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              {isRtl ? 'تحليلات الجودة والامتثال' : 'QA Quality & Compliance Analytics'}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {isRtl
                ? 'تحليل انحراف درجات التقييم، وتحديد مواطن الضعف في المحادثات وقنوات الاتصال الموحدة.'
                : 'Monitor QA calibration limits, evaluate compliance SLA metrics, and check agent dispute metrics.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl p-5 space-y-4">
              <h3 className="font-bold text-xs text-slate-650 dark:text-slate-400 uppercase font-mono tracking-wider">
                Compliance & Tone Score Calibration
              </h3>
              <div className="h-48 flex items-end justify-between gap-2 pt-4">
                {[
                  { label: 'Week 21', value: 82 },
                  { label: 'Week 22', value: 85 },
                  { label: 'Week 23', value: 89 },
                  { label: 'Week 24', value: 87 },
                  { label: 'Week 25', value: 92 },
                  { label: 'Week 26 (Current)', value: 94 }
                ].map((bar, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg h-36 relative flex items-end">
                      <div
                        style={{ height: `${bar.value}%` }}
                        className="w-full bg-blue-600 rounded-lg group-hover:bg-blue-500 transition-all cursor-pointer"
                      />
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 font-mono font-bold text-[10px] text-slate-700 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                        {bar.value}%
                      </span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 text-center truncate w-full">{bar.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl p-5 space-y-4">
              <h3 className="font-bold text-xs text-slate-650 dark:text-slate-400 uppercase font-mono tracking-wider">
                Audits Breakdown By Channel
              </h3>
              <div className="space-y-3">
                {[
                  { channel: 'WhatsApp Chat', count: 48, percentage: 91, bg: 'bg-emerald-500' },
                  { channel: 'Web Chat widget', count: 32, percentage: 86, bg: 'bg-blue-500' },
                  { channel: 'Voice SIP call', count: 19, percentage: 81, bg: 'bg-indigo-500' },
                  { channel: 'Customer Email', count: 12, percentage: 89, bg: 'bg-purple-500' }
                ].map((row, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-semibold text-slate-800 dark:text-white">{row.channel}</span>
                      <span className="font-mono font-bold text-slate-400">{row.count} audits ({row.percentage}%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full">
                      <div style={{ width: `${row.percentage}%` }} className={`h-full rounded-full ${row.bg}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    case 'agent_performance':
      const performanceData = [
        { name: 'Liam Bennett', audits: 24, avgScore: 89, disputes: 1, coaching: 'Active' },
        { name: 'Nadia Vance', audits: 18, avgScore: 92, disputes: 0, coaching: 'None' },
        { name: 'Tariq Mansoor', audits: 15, avgScore: 84, disputes: 2, coaching: 'Active' },
        { name: 'Amira Ghadbi', audits: 12, avgScore: 95, disputes: 0, coaching: 'None' }
      ];

      return (
        <div className="space-y-6 animate-in fade-in-50 duration-200" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              {isRtl ? 'مؤشرات أداء وكلاء الخدمة' : 'Agent Performance Roster'}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {isRtl
                ? 'مراجعة وتدقيق جودة أداء كل موظف، ومتابعة الاعتراضات النشطة وبرامج التوجيه.'
                : 'Review quality metrics, track agent disputes, and analyze active calibration states.'}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-xs text-slate-650 dark:text-slate-400 uppercase font-mono tracking-wider">
              Agent Performance Leaderboard
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-455 font-bold">
                    <th className="pb-3">{isRtl ? 'الوكيل' : 'Agent Name'}</th>
                    <th className="pb-3">{isRtl ? 'عدد عمليات التدقيق' : 'Audits Logged'}</th>
                    <th className="pb-3">{isRtl ? 'متوسط درجة الجودة' : 'Average Score'}</th>
                    <th className="pb-3">{isRtl ? 'الاعتراضات النشطة' : 'Active Disputes'}</th>
                    <th className="pb-3">{isRtl ? 'حالة التوجيه' : 'Coaching Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-600 dark:text-slate-350">
                  {performanceData.map((row) => (
                    <tr key={row.name}>
                      <td className="py-3.5 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-850 flex items-center justify-center text-[10px] font-mono font-bold text-slate-600">
                            {row.name.substring(0, 2).toUpperCase()}
                          </div>
                          <span>{row.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 font-mono text-slate-500 dark:text-slate-400">{row.audits} logged</td>
                      <td className="py-3.5 font-bold font-mono">
                        <span className={row.avgScore >= 90 ? 'text-emerald-500' : 'text-blue-500'}>
                          {row.avgScore}%
                        </span>
                      </td>
                      <td className="py-3.5 font-mono">
                        {row.disputes > 0 ? (
                          <span className="text-rose-500 font-bold">{row.disputes} dispute(s)</span>
                        ) : (
                          <span className="text-slate-400 font-normal">0 active</span>
                        )}
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold font-mono uppercase ${
                          row.coaching === 'Active' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {row.coaching}
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
export default QAManagerView;
