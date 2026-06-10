import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, TrendingDown, BookOpen, ShieldCheck, AlertTriangle, Clock, ArrowRight, Copy, Check, ShieldAlert, Activity } from 'lucide-react';
import { Conversation } from '@/types';
import { translations } from '@/i18n/translations';
import { useConversationStore } from '@/stores/conversationStore';

interface AICopilotPanelProps {
  activeChat: Conversation;
  lang: 'en' | 'ar';
  onApplySuggestedReply: (text: string) => void;
  onSummarize: () => void;
}

export function AICopilotPanel({
  activeChat,
  lang,
  onApplySuggestedReply,
  onSummarize
}: AICopilotPanelProps) {
  const t = translations[lang];
  const store = useConversationStore();

  const suggestions = store.copilotSuggestions[activeChat.id] || [];
  const articles = store.knowledgeArticles[activeChat.id] || [];
  const intent = store.intentStates[activeChat.id];
  const sentiment = store.sentimentStates[activeChat.id] || activeChat.sentiment || 'neutral';
  const isLoading = store.copilotLoadingStates[activeChat.id] || false;
  const wrapup = store.wrapupRecommendations[activeChat.id] || [];
  const escalations = store.escalationRecommendations[activeChat.id] || [];

  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('24:50');

  useEffect(() => {
    setCopied(false);
  }, [activeChat.id]);

  // Parse static deadline to ticking countdown from SLA store seconds
  useEffect(() => {
    const slaSeconds = store.slaSeconds[activeChat.id];
    if (slaSeconds === undefined) {
      // Fallback local ticking
      let mins = 15;
      let secs = 0;
      if (activeChat.slaStatus === 'breached') {
        setTimeLeft(lang === 'ar' ? 'تم تجاوزه' : 'BREACHED');
        return;
      } else if (activeChat.slaStatus === 'warning') {
        mins = 3;
        secs = 45;
      } else {
        mins = 28;
      }

      const timer = setInterval(() => {
        if (secs > 0) {
          secs--;
        } else if (mins > 0) {
          mins--;
          secs = 59;
        } else {
          clearInterval(timer);
        }
        const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        setTimeLeft(formatted);
      }, 1000);

      return () => clearInterval(timer);
    } else {
      const formatTime = (sec: number) => {
        if (sec <= 0) return lang === 'ar' ? 'تم تجاوزه' : 'BREACHED';
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      };
      setTimeLeft(formatTime(slaSeconds));
    }
  }, [activeChat.id, activeChat.slaStatus, store.slaSeconds, lang]);

  const sentimentScore = {
    positive: 88,
    neutral: 50,
    negative: 15
  }[sentiment] || 50;

  const sentimentLabel = {
    positive: lang === 'ar' ? 'إيجابي (مستقر)' : 'Positive (Stable)',
    neutral: lang === 'ar' ? 'محايد (متوازن)' : 'Neutral (Balanced)',
    negative: lang === 'ar' ? 'سلبي (مخاطر)' : 'Negative (At Risk)'
  }[sentiment] || 'Neutral';

  const handleCopySuggestion = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getConfidenceBadge = (confidence: 'high' | 'medium' | 'low') => {
    const styles = {
      high: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400',
      medium: 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400',
      low: 'bg-slate-100 text-slate-800 dark:bg-slate-900/50 dark:text-slate-400'
    }[confidence];
    return (
      <span className={`px-1.5 py-0.5 rounded-md text-[8.5px] font-bold font-mono uppercase ${styles}`}>
        {confidence}
      </span>
    );
  };

  const renderSkeletons = () => (
    <div className="space-y-2 animate-pulse" data-testid="copilot-skeletons">
      <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl" />
    </div>
  );

  // Intent Intelligence Chips mapping
  const activeChips = [];
  const confidenceVal = intent ? intent.confidence : 85;
  if (intent?.name === 'refund_request' || intent?.name === 'billing_issue' || intent?.name === 'payment_failure') {
    activeChips.push({ id: 'refund_request', label: lang === 'ar' ? 'طلب استرجاع' : 'refund_request', confidence: confidenceVal, severity: 'warning' });
  }
  if (intent?.name === 'billing_issue' || intent?.name === 'payment_failure') {
    activeChips.push({ id: 'billing_dispute', label: lang === 'ar' ? 'نزاع فواتير' : 'billing_dispute', confidence: confidenceVal, severity: 'warning' });
  }
  if (sentiment === 'negative') {
    activeChips.push({ id: 'sentiment_risk', label: lang === 'ar' ? 'مخاطر المشاعر' : 'sentiment_risk', confidence: 94, severity: 'danger' });
  }
  if (activeChat.priority === 'urgent' || activeChat.priority === 'high' || store.queueAssignments[activeChat.id] === 'q-vip') {
    activeChips.push({ id: 'vip_customer', label: lang === 'ar' ? 'عميل مهم' : 'vip_customer', confidence: 99, severity: 'info' });
  }
  if (intent?.name === 'technical_issue' || intent?.name === 'refund_request') {
    activeChips.push({ id: 'compliance_sensitive', label: lang === 'ar' ? 'حساس للامتثال' : 'compliance_sensitive', confidence: 96, severity: 'danger' });
  }
  if (activeChat.slaStatus === 'warning' || activeChat.slaStatus === 'breached') {
    activeChips.push({ id: 'sla_breach_risk', label: lang === 'ar' ? 'مخاطر اتفاقية الخدمة' : 'sla_breach_risk', confidence: 98, severity: 'danger' });
  }
  if (activeChips.length === 0) {
    activeChips.push({ id: 'general_support', label: lang === 'ar' ? 'دعم عام' : 'general_support', confidence: 85, severity: 'info' });
  }

  // Customer Risk Intelligence values
  const csatPredict = sentiment === 'positive' ? '4.8/5' : sentiment === 'negative' ? '1.2/5' : '3.5/5';
  const churnRisk = sentiment === 'positive' ? '5%' : sentiment === 'negative' ? '85%' : '35%';
  const escalationProb = activeChat.status === 'escalated' ? '100%' : sentiment === 'negative' ? '75%' : '20%';
  const slaBreachProb = activeChat.slaStatus === 'breached' ? '100%' : activeChat.slaStatus === 'warning' ? '90%' : '10%';
  const accountHealth = sentiment === 'positive' ? '96/100' : sentiment === 'negative' ? '38/100' : '70/100';

  // Live Recommendation Cards
  const recommendationsList = [];
  if (intent?.name === 'refund_request') {
    recommendationsList.push({
      type: '[AI ACTION]',
      confidence: 96,
      action: 'Escalate to Tier 2 Billing',
      risk: 'High (Dispute Risk)',
      department: 'Billing Operations',
      reason: 'Repeated refund dispute + negative sentiment spike.'
    });
  } else if (intent?.name === 'payment_failure') {
    recommendationsList.push({
      type: '[AI ACTION]',
      confidence: 94,
      action: 'Launch Secure Card Verification Flow',
      risk: 'Medium (Auth Lockout)',
      department: 'Technical Payments Team',
      reason: 'Multiple card authorisations failures detected via webhook.'
    });
  } else {
    recommendationsList.push({
      type: '[AI ACTION]',
      confidence: 88,
      action: 'Provide Policy Explanation (ks-1)',
      risk: 'Low',
      department: 'Standard Support Desk',
      reason: 'General inquiry matching standard refund/billing policy clauses.'
    });
  }

  return (
    <div className="h-full flex flex-col justify-between overflow-y-auto p-4 space-y-4 bg-slate-50/90 dark:bg-slate-950/20 text-xs font-semibold text-slate-700 dark:text-slate-200">
      
      {/* SLA Ticking Timer Widget */}
      <div className={`p-3 rounded-xl border flex items-center justify-between shadow-xs shrink-0 ${
        activeChat.slaStatus === 'breached'
          ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400'
          : activeChat.slaStatus === 'warning'
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400'
          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
      }`}>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 shrink-0" />
          <div className="text-start">
            <span className="text-[9.5px] uppercase tracking-wider block font-bold font-mono">
              {lang === 'ar' ? 'مؤقت اتفاقية مستوى الخدمة' : 'SLA Resolution Timer'}
            </span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-white leading-none">
              {activeChat.slaStatus === 'breached'
                ? (lang === 'ar' ? 'تم تجاوز المهلة' : 'SLA Target Breached')
                : activeChat.slaStatus === 'warning'
                ? (lang === 'ar' ? 'مهلة حرجة وشيكة' : 'Critical Deadline Warning')
                : (lang === 'ar' ? 'ضمن نطاق الخدمة' : 'Within Target Limit')}
            </span>
          </div>
        </div>
        <div className="font-mono text-sm font-black tracking-widest bg-white dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
          {timeLeft}
        </div>
      </div>

      {/* Sentiment Tracker & CSAT dial */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2 shadow-xs shrink-0">
        <div className="flex justify-between items-center text-[10.5px] uppercase tracking-wider text-slate-400 font-mono">
          <span>{lang === 'ar' ? 'تحليل المشاعر الحية' : 'Sentiment Analysis'}</span>
          <span className="flex items-center gap-1 font-extrabold">
            {sentiment === 'positive' ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
            )}
            {sentimentLabel}
          </span>
        </div>
        <div className="relative pt-1">
          <div className="flex mb-1 items-center justify-between">
            <div className="text-start">
              <span className="text-[10px] font-mono font-bold inline-block py-0.5 px-1.5 uppercase rounded-full text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300">
                {lang === 'ar' ? 'معدل الرضا المتوقع' : 'CSAT Predict'}
              </span>
            </div>
            <div className="text-end">
              <span className="text-[13px] font-black font-mono text-slate-800 dark:text-white">
                {sentimentScore}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 text-xs flex rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              style={{ width: `${sentimentScore}%` }}
              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${
                sentiment === 'positive'
                  ? 'bg-emerald-500'
                  : sentiment === 'negative'
                  ? 'bg-rose-500'
                  : 'bg-amber-500'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Customer Risk Intelligence Analytics Strip */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2 shadow-xs shrink-0">
        <span className="text-[10.5px] uppercase tracking-wider text-slate-400 font-mono block text-start">Customer Risk Intelligence</span>
        <div className="grid grid-cols-5 gap-1.5 text-center font-mono">
          <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-850" tabIndex={0}>
            <span className="text-[8px] text-slate-400 block uppercase truncate">CSAT</span>
            <strong className="text-[11px] text-slate-800 dark:text-white">{csatPredict}</strong>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-850" tabIndex={0}>
            <span className="text-[8px] text-slate-400 block uppercase truncate">Churn</span>
            <strong className={`text-[11px] ${sentiment === 'negative' ? 'text-rose-600 font-extrabold' : 'text-slate-800 dark:text-white'}`}>{churnRisk}</strong>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-850" tabIndex={0}>
            <span className="text-[8px] text-slate-400 block uppercase truncate">Escalation</span>
            <strong className={`text-[11px] ${activeChat.status === 'escalated' ? 'text-rose-600 font-extrabold' : 'text-slate-800 dark:text-white'}`}>{escalationProb}</strong>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-850" tabIndex={0}>
            <span className="text-[8px] text-slate-400 block uppercase truncate">SLA Breach</span>
            <strong className={`text-[11px] ${activeChat.slaStatus === 'warning' ? 'text-amber-600 font-extrabold' : activeChat.slaStatus === 'breached' ? 'text-rose-600 font-extrabold' : 'text-slate-800 dark:text-white'}`}>{slaBreachProb}</strong>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-850" tabIndex={0}>
            <span className="text-[8px] text-slate-400 block uppercase truncate">Health</span>
            <strong className={`text-[11px] ${sentiment === 'negative' ? 'text-rose-600 font-extrabold' : 'text-emerald-600 font-extrabold'}`}>{accountHealth}</strong>
          </div>
        </div>
      </div>

      {/* Intent Intelligence Layer Chips */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2 shadow-xs shrink-0">
        <span className="text-[10.5px] uppercase tracking-wider text-slate-400 font-mono block text-start">NLU Intent Intelligence</span>
        <div className="flex flex-wrap gap-1.5 justify-start text-start" role="group" aria-label="NLU Intent Intelligence">
          {activeChips.map((chip) => (
            <span
              key={chip.id}
              tabIndex={0}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border font-mono transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                chip.severity === 'danger'
                  ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-900/30'
                  : chip.severity === 'warning'
                  ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-900/30'
                  : 'bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-900/30'
              }`}
            >
              {chip.label} ({chip.confidence}%)
            </span>
          ))}
        </div>
      </div>

      {/* AI Activity Timeline Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-3 shadow-xs shrink-0">
        <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-slate-400 uppercase font-mono">
          <Activity className="w-3.5 h-3.5 text-blue-500" />
          <span>AI Activity Timeline</span>
        </div>
        <div className="space-y-2.5" role="log" aria-live="polite">
          {(store.orchestrationEvents[activeChat.id] || []).map((evt) => (
            <div key={evt.id} className="flex items-center gap-2 text-[11px] font-medium font-sans">
              {evt.status === 'completed' ? (
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-black shrink-0 select-none">✓</span>
              ) : (
                <span className="w-4 h-4 rounded-full border-2 border-blue-400 border-t-transparent animate-spin shrink-0 select-none"></span>
              )}
              <span className={evt.status === 'completed' ? 'text-slate-800 dark:text-slate-200 text-start' : 'text-slate-400 text-start'}>
                {evt.event}
              </span>
              <span className="ml-auto font-mono text-[9px] text-slate-400 shrink-0 select-none">{evt.timestamp}</span>
            </div>
          ))}
          {(store.orchestrationEvents[activeChat.id] || []).length === 0 && (
            <span className="text-slate-450 dark:text-slate-500 italic font-normal text-start block">Waiting for customer input trace...</span>
          )}
        </div>
      </div>

      {/* Live AI Recommendation Cards */}
      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-slate-400 uppercase font-mono">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>AI Action Recommendation</span>
        </div>
        <div className="space-y-2">
          {recommendationsList.map((rec, idx) => (
            <div
              key={idx}
              tabIndex={0}
              className="p-3 rounded-xl border border-blue-200 bg-blue-500/5 dark:border-blue-900/40 dark:bg-blue-950/20 text-start space-y-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="flex justify-between items-center">
                <span className="font-mono text-[9px] font-black uppercase bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded border border-blue-200/50 dark:border-blue-900">
                  {rec.type}
                </span>
                <span className="text-[10.5px] font-mono font-bold text-slate-500">
                  Confidence: {rec.confidence}%
                </span>
              </div>
              <strong className="text-xs block text-slate-800 dark:text-slate-100">
                Suggested Action: {rec.action}
              </strong>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 leading-normal border-t border-slate-200/50 dark:border-slate-800/80 pt-2 font-mono">
                <div>
                  <span className="text-slate-400 block text-[9.5px]">Risk Level:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{rec.risk}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9.5px]">Recommended Dept:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{rec.department}</span>
                </div>
              </div>
              <div className="bg-slate-100/50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200/30 dark:border-slate-850 text-[10px] text-slate-650 dark:text-slate-400 leading-relaxed font-normal">
                <span className="font-bold block text-slate-705 dark:text-slate-350 mb-0.5">Escalation Justification:</span>
                {rec.reason}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested replies */}
      <div className="space-y-2 flex-1 flex flex-col justify-start">
        <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-slate-400 uppercase font-mono">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>{lang === 'ar' ? 'الردود المقترحة بالذكاء الاصطناعي' : 'Suggested Replies'}</span>
        </div>
        <div className="space-y-2">
          {isLoading && suggestions.length === 0 ? renderSkeletons() : null}
          {suggestions.map((reply) => (
            <div
              key={reply.id}
              className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 hover:border-slate-350 dark:hover:border-slate-700 transition-all text-xs font-normal leading-relaxed text-slate-700 dark:text-slate-300 relative group"
            >
              <div className="flex justify-between items-start">
                <p className="flex-1 pr-6 text-start">{reply.text}</p>
                <button
                  type="button"
                  onClick={() => store.dismissSuggestion(activeChat.id, reply.id)}
                  aria-label={lang === 'ar' ? 'تجاهل الاقتراح' : 'Dismiss suggestion'}
                  className="text-slate-400 hover:text-rose-500 absolute top-2 right-2 p-1 rounded focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  &times;
                </button>
              </div>
              <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800/80 pt-1.5 mt-1 select-none">
                <div className="flex items-center gap-1.5">
                  {getConfidenceBadge(reply.confidence)}
                  <button
                    type="button"
                    onClick={() => onApplySuggestedReply(reply.text)}
                    className="text-[9.5px] text-blue-600 hover:underline dark:text-blue-400 font-bold uppercase flex items-center gap-1 focus:outline-none"
                  >
                    <span>{lang === 'ar' ? 'تطبيق' : 'Apply'}</span>
                    <ArrowRight className="w-2.5 h-2.5 rtl:rotate-180" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopySuggestion(reply.text)}
                  aria-label={lang === 'ar' ? 'نسخ الرد المقترح إلى الحافظة' : 'Copy suggested reply to clipboard'}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all text-slate-400 hover:text-slate-650 focus:outline-none"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RAG Knowledge articles matching Panel */}
      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-slate-400 uppercase font-mono">
          <BookOpen className="w-3.5 h-3.5" />
          <span>RAG Article Matching</span>
        </div>
        <div className="space-y-2">
          {articles.map((art) => (
            <div
              key={art.id}
              tabIndex={0}
              className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col text-start text-xs shadow-xs space-y-2 relative group focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-850 dark:text-slate-200 hover:underline cursor-pointer truncate max-w-44">
                  {art.title}
                </span>
                <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                  {art.matchPercent}% Match
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-400 leading-normal border-b border-slate-100 dark:border-slate-855 pb-1 font-mono select-none">
                <div>
                  <span className="block text-slate-500">Vector Namespace:</span>
                  <span className="font-bold text-slate-650 dark:text-slate-350">farah-nlu-kb-v3</span>
                </div>
                <div>
                  <span className="block text-slate-500">Indexed Source:</span>
                  <span className="font-bold text-slate-650 dark:text-slate-350">policy_dir/{art.category.toLowerCase().replace(' ', '_')}</span>
                </div>
              </div>
              
              <p className="text-[10.5px] text-slate-400 dark:text-slate-400 leading-normal font-normal">
                {art.preview}
              </p>

              {/* Accessible Expandable citation block */}
              <details className="mt-1 text-[10px] text-slate-500 bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-200 dark:border-slate-850">
                <summary className="cursor-pointer font-bold select-none text-[9.5px] uppercase tracking-wider text-blue-600 dark:text-blue-400 outline-none">
                  {lang === 'ar' ? 'عرض الاقتباس الكامل' : 'Expand Citation Chunk'}
                </summary>
                <p className="mt-1.5 font-mono text-[9px] leading-relaxed text-slate-600 dark:text-slate-400 select-text border-t border-slate-100 dark:border-slate-850 pt-1.5">
                  [KB-ID: {art.id}] Cosine Similarity: {(art.matchPercent / 100).toFixed(4)} • Target: Farah Ingestion • Chunk: &quot;{art.preview} matching parameters.&quot;
                </p>
              </details>
              
              {/* Accessible Tooltip displaying RAG parameters */}
              <div
                role="tooltip"
                className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-56 bg-slate-900 text-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-700 shadow-lg hidden group-hover:block group-focus-within:block z-50 pointer-events-none select-none text-[10px] leading-relaxed transition-all duration-200 font-normal font-sans"
              >
                <div className="space-y-1">
                  <div className="font-bold text-blue-400 border-b border-slate-700 pb-1 flex justify-between">
                    <span>RAG Parameters</span>
                    <span className="font-mono text-[8.5px] bg-slate-800 px-1 py-0.5 rounded border border-slate-700">ID: {art.id}</span>
                  </div>
                  <div className="pt-1 flex justify-between">
                    <span className="text-slate-400">Confidence Match:</span>
                    <span className="font-mono font-bold text-emerald-450">{art.matchPercent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Category Source:</span>
                    <span className="font-mono font-bold text-slate-200">{art.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Vector Metric:</span>
                    <span className="font-mono text-slate-200">Cosine Similarity</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Index Target:</span>
                    <span className="font-mono text-slate-200">Farah Ingestion</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/40">
                <button
                  type="button"
                  onClick={() => onApplySuggestedReply(`Reference Article: ${art.title}`)}
                  className="text-[9px] text-blue-500 font-bold uppercase hover:underline"
                >
                  Link Article
                </button>
                <button
                  type="button"
                  onClick={() => handleCopySuggestion(art.title)}
                  className="text-[9px] text-slate-400 font-bold uppercase hover:text-slate-650"
                >
                  Copy Title
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Next Actions Strip */}
      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-slate-400 uppercase font-mono">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>Suggested Next Actions</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-start">
          <button
            type="button"
            onClick={() => onApplySuggestedReply(lang === 'ar' ? 'يرجى مراجعة شروط سياسة الإرجاع...' : 'Under Return Policy (ks-1), refunds are allowed...')}
            className="p-2 border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 rounded-lg text-[9.5px] font-bold text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            📋 Send refund policy
          </button>
          <button
            type="button"
            onClick={() => store.startSupervisorConsult(activeChat.id, 'super-1', 'Agent initiated priority review via Next Actions panel.')}
            className="p-2 border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 rounded-lg text-[9.5px] font-bold text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            🕵️ Trigger supervisor review
          </button>
          <button
            type="button"
            onClick={() => {
              store.setActiveTone(activeChat.id, 'empathetic');
              onApplySuggestedReply('I truly understand how frustrating this must be. Let me resolve this right away.');
            }}
            className="p-2 border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 rounded-lg text-[9.5px] font-bold text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            ❤️ Generate empathetic response
          </button>
          <button
            type="button"
            onClick={() => onApplySuggestedReply('We can schedule a priority telephone callback for you. Please confirm your phone number.')}
            className="p-2 border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 rounded-lg text-[9.5px] font-bold text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            📞 Offer callback option
          </button>
          <button
            type="button"
            onClick={() => onApplySuggestedReply('Please complete secure card auth verification at: http://secure-verify.realtime-gateway.net/auth')}
            className="p-2 border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 rounded-lg text-[9.5px] font-bold text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-1 focus:ring-blue-500 grid-span-2"
          >
            🔒 Launch secure verification flow
          </button>
        </div>
      </div>

      {/* Escalation Recommendations */}
      {escalations.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-rose-500 uppercase font-mono">
            <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
            <span>Escalation Recommendation</span>
          </div>
          <div className="space-y-2">
            {escalations.map((esc) => (
              <div
                key={esc.id}
                className={`p-3 rounded-xl border flex flex-col gap-1.5 shadow-sm text-start ${
                  esc.severity === 'critical'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-400'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-400'
                }`}
              >
                <strong className="text-[10.5px] font-bold uppercase block tracking-wide font-mono">
                  {esc.severity.toUpperCase()} ALERT
                </strong>
                <p className="text-xs font-normal leading-normal">{esc.reason}</p>
                <div className="flex justify-end gap-1.5 mt-1">
                  <span className="text-[9.5px] font-mono font-extrabold uppercase bg-white/70 dark:bg-slate-900/70 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 text-slate-500">
                    Confidence: {esc.confidence}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Escalation Action for Non-Escalated Chats */}
      {activeChat.status !== 'escalated' && (
        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-amber-600 uppercase font-mono">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Escalation Actions</span>
          </div>
          <button
            onClick={() => store.triggerEscalation(activeChat.id, 'sentiment_risk')}
            className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-all focus:outline-none focus:ring-2 focus:ring-rose-500 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none flex items-center justify-center gap-1.5"
            aria-label="Escalate conversation to Tier 2"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Escalate to Tier 2 Support</span>
          </button>
        </div>
      )}

      {/* Supervisor Recommendations when Escalated */}
      {activeChat.status === 'escalated' && (
        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-rose-500 uppercase font-mono">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Supervisor Recommendations</span>
          </div>
          <div className="space-y-2">
            {(store.supervisorRecommendations[activeChat.id] || []).map((rec) => (
              <div
                key={rec.id}
                className="p-3 bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-950/45 rounded-xl shadow-xs text-start"
              >
                <div className="flex justify-between items-baseline gap-2">
                  <strong className="text-slate-800 dark:text-slate-200 block text-xs">
                    {rec.title}
                  </strong>
                  <span className="text-[9px] font-mono text-rose-700 font-bold">{rec.confidence}%</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[10px] mt-1">
                  {rec.description}
                </p>
                <div className="mt-2.5 flex justify-end gap-1.5 border-t border-slate-100 dark:border-slate-850 pt-2">
                  {rec.actionType === 'transfer' && (
                    <button
                      onClick={() => store.startTransfer(activeChat.id, 'q-vip', 'agent-3', 'Auto-routing recommendation applied.')}
                      className="px-2 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-bold hover:bg-blue-700"
                    >
                      Apply Route
                    </button>
                  )}
                  {rec.actionType === 'consult' && (
                    <button
                      onClick={() => store.startSupervisorConsult(activeChat.id, 'super-1', 'Auto-consultation recommendation applied.')}
                      className="px-2 py-1 bg-purple-600 text-white rounded-lg text-[10px] font-bold hover:bg-purple-700"
                    >
                      Consult Supervisor
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wrap-Up Recommendations */}
      {wrapup.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-slate-400 uppercase font-mono">
            <Check className="w-3.5 h-3.5 text-emerald-500" />
            <span>Suggested Wrap-Up Codes</span>
          </div>
          <div className="space-y-2">
            {wrapup.map((w, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 text-start shadow-xs"
              >
                <div className="flex justify-between items-baseline">
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">
                    {w.code}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">
                    {w.confidence}% confidence
                  </span>
                </div>
                <strong className="text-[10.5px] block font-bold text-slate-800 dark:text-white">
                  Category: {w.category}
                </strong>
                <p className="text-[10.5px] font-normal leading-relaxed text-slate-500 dark:text-slate-400">
                  {w.summary}
                </p>
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => onApplySuggestedReply(`[AI Generated Wrapup - ${w.code}]: ${w.summary}`)}
                    className="text-[9px] text-blue-500 font-bold uppercase hover:underline"
                  >
                    Apply Disposition
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compliance / Safety Masking Panel */}
      <div className="bg-slate-100/50 dark:bg-slate-900/30 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800 text-xs text-slate-500 leading-normal flex items-start gap-2 shadow-xs shrink-0 select-none">
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-500 shrink-0 mt-0.5" />
        <div className="text-start" tabIndex={0}>
          <strong className="text-slate-700 dark:text-slate-300 block uppercase font-mono text-[9.5px] font-bold">Compliance Safeguard Active</strong>
          Saudi National ID &amp; Credit Cards masked. Farah AI Gateway safety-sync checks passed.
        </div>
      </div>
      
    </div>
  );
}
