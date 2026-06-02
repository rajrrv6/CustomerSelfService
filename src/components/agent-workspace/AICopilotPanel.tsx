'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, TrendingDown, BookOpen, ShieldCheck, AlertTriangle, Clock, ArrowRight, Copy, Check } from 'lucide-react';
import { Conversation } from '@/types';
import { translations } from '@/i18n/translations';

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
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('24:50');

  // Parse static deadline to ticking countdown
  useEffect(() => {
    // Generate simulated minutes/seconds remaining based on active chat
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
      secs = 12;
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
  }, [activeChat.id, activeChat.slaStatus, lang]);

  // Sentiment values mapping
  const sentimentScore = {
    positive: 88,
    neutral: 50,
    negative: 15
  }[activeChat.sentiment] || 50;

  const sentimentLabel = {
    positive: lang === 'ar' ? 'إيجابي (مستقر)' : 'Positive (Stable)',
    neutral: lang === 'ar' ? 'محايد (متوازن)' : 'Neutral (Balanced)',
    negative: lang === 'ar' ? 'سلبي (مخاطر)' : 'Negative (At Risk)'
  }[activeChat.sentiment] || 'Neutral';

  // NLU intent mapping
  const detectedIntent = {
    'conv-101': { name: 'billing_address_update', confidence: 96, category: 'Billing Operations' },
    'conv-102': { name: 'api_403_webhook_error', confidence: 98, category: 'Developer APIs' },
    'conv-103': { name: 'wire_payment_audit', confidence: 94, category: 'Accounts Payable' },
    'conv-104': { name: 'fiber_downtime_failover', confidence: 97, category: 'Telecom Gateway' },
    'conv-105': { name: 'discount_voucher_exclusions', confidence: 92, category: 'Promotions' },
    'conv-106': { name: 'duplicate_subscription_charge', confidence: 99, category: 'Billing Operations' }
  }[activeChat.id] || { name: 'general_support_inquiry', confidence: 85, category: 'Customer Care' };

  // AI suggested replies
  const suggestedReplies = {
    'conv-101': [
      'أهلاً بك أمينة. قمت بتحديث الهوية الضريبية وعنوان الفاتورة لطلبك رقم ORD-77612 بنجاح.',
      'تأكيد استلام الطلب للتعديل. سيتم المزامنة مع بوابة الفواتير خلال دقائق.'
    ],
    'conv-102': [
      'Under return policy checks (ks-1), refunds are allowed within 30 days. I have logged a damages exception on ORD-99881 and initiated a credit.',
      'Checking webhook token expirations in our developer gateway dashboard right now.'
    ],
    'conv-103': [
      'We confirmed settlement for payment receipt INV-2026-7891. Your subscription limit has been restored.',
      'Let me dispatch a manual sync request to the accounts department to verify wire ID INV-2026-7891.'
    ],
    'conv-104': [
      'Welcome sir. I checked port 3 and activated the backup failover server. Please verify gateway connectivity.',
      'Confirming fiber link test checks. The latency issue has stabilized.'
    ],
    'conv-105': [
      'Hi Layla. I see the checkout discount voucher failed because of a mismatch with policy exclusions. I can override this manually for you.',
      'Standard discount code rules exclude items already on promotion. Let me check exclusions.'
    ],
    'conv-106': [
      'Hello Alex, I apologize for the duplicate charge on subscription sub-99881. I will log a refund exception right away.',
      'Checking our Stripe billing log for sub-99881 double transactions.'
    ]
  }[activeChat.id] || [
    'Thank you for reaching out. Let me check the database system to confirm your active service key.',
    'I have logged this ticket into our system for manual audit check.'
  ];

  // RAG article links
  const suggestedArticles = {
    'conv-101': [
      { id: 'art-1', title: 'Managing Corporate Billing Profiles', match: 94 },
      { id: 'art-2', title: 'VAT Invoicing Compliance Standards', match: 89 }
    ],
    'conv-102': [
      { id: 'art-3', title: 'Troubleshooting 403 Forbidden on Webhooks', match: 98 },
      { id: 'art-4', title: 'Regenerating Client Secret Keys', match: 92 }
    ],
    'conv-103': [
      { id: 'art-5', title: 'Wire Transfer Verification Timelines', match: 95 },
      { id: 'art-6', title: 'Resolving Workspace Pending Payment Status', match: 91 }
    ],
    'conv-104': [
      { id: 'art-7', title: 'Activating Backup Fiber Failover Systems', match: 97 },
      { id: 'art-8', title: 'Monitoring Port Latency Spikes', match: 88 }
    ],
    'conv-105': [
      { id: 'art-9', title: 'Checkout Promotion Code Guidelines', match: 93 },
      { id: 'art-10', title: 'Overriding Policy Exclusions Manual Guide', match: 85 }
    ],
    'conv-106': [
      { id: 'art-11', title: 'Processing Stripe Subscription Refunds', match: 99 },
      { id: 'art-12', title: 'Detecting Double Transaction Failures', match: 94 }
    ]
  }[activeChat.id] || [
    { id: 'art-gen', title: 'Standard Incident Resolution Procedures', match: 85 }
  ];

  const handleCopySuggestion = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col justify-between overflow-y-auto p-4 space-y-4 bg-slate-50/90 dark:bg-slate-950/20 text-xs font-semibold text-slate-700 dark:text-slate-200">
      
      {/* SLA Ticking Timer Widget */}
      <div className={`p-3 rounded-xl border flex items-center justify-between shadow-xs ${
        activeChat.slaStatus === 'breached'
          ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400'
          : activeChat.slaStatus === 'warning'
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400'
          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
      }`}>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 shrink-0" />
          <div>
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

      {/* Sentiment Tracker dial */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2 shadow-xs">
        <div className="flex justify-between items-center text-[10.5px] uppercase tracking-wider text-slate-400 font-mono">
          <span>{lang === 'ar' ? 'تحليل المشاعر الحية' : 'Sentiment Analysis'}</span>
          <span className="flex items-center gap-1 font-extrabold">
            {activeChat.sentiment === 'positive' ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
            )}
            {sentimentLabel}
          </span>
        </div>
        <div className="relative pt-1">
          <div className="flex mb-1 items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold inline-block py-0.5 px-1.5 uppercase rounded-full text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300">
                {lang === 'ar' ? 'معدل الرضا' : 'CSAT Predict'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[13px] font-black font-mono text-slate-800 dark:text-white">
                {sentimentScore}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 text-xs flex rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              style={{ width: `${sentimentScore}%` }}
              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${
                activeChat.sentiment === 'positive'
                  ? 'bg-emerald-500'
                  : activeChat.sentiment === 'negative'
                  ? 'bg-rose-500'
                  : 'bg-amber-500'
              }`}
            />
          </div>
        </div>
      </div>

      {/* matched Intent Classifier */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2 shadow-xs">
        <span className="text-[10.5px] uppercase tracking-wider text-slate-400 font-mono block">Matched NLU Intent</span>
        <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-850 font-mono">
          <div className="truncate">
            <span className="text-[9.5px] text-slate-400 block font-bold uppercase">{detectedIntent.category}</span>
            <strong className="text-[13px] text-blue-600 dark:text-blue-400">{detectedIntent.name}</strong>
          </div>
          <span className="shrink-0 text-xs font-black text-slate-500 dark:text-slate-400">
            {detectedIntent.confidence}%
          </span>
        </div>
      </div>

      {/* Suggested replies */}
      <div className="space-y-2 flex-1 flex flex-col justify-start">
        <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-slate-400 uppercase font-mono">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>{lang === 'ar' ? 'الردود المقترحة بالذكاء الاصطناعي' : 'Suggested Replies'}</span>
        </div>
        <div className="space-y-2">
          {suggestedReplies.map((reply, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 hover:border-slate-350 dark:hover:border-slate-700 transition-all text-xs font-normal leading-relaxed text-slate-700 dark:text-slate-300 relative group cursor-pointer"
              onClick={() => onApplySuggestedReply(reply)}
            >
              <p>{reply}</p>
              <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800/80 pt-1.5 mt-1 select-none">
                <span className="text-[9.5px] text-slate-400 font-mono font-bold uppercase flex items-center gap-1">
                  <span>Click to Apply</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopySuggestion(reply);
                  }}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all text-slate-400 hover:text-slate-600"
                  title="Copy to Clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RAG Knowledge articles */}
      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-slate-400 uppercase font-mono">
          <BookOpen className="w-3.5 h-3.5" />
          <span>RAG Article Matching</span>
        </div>
        <div className="space-y-2">
          {suggestedArticles.map((art) => (
            <div key={art.id} className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs shadow-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200 hover:underline cursor-pointer truncate max-w-44">
                {art.title}
              </span>
              <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                {art.match}% match
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance / Safety Masking Panel */}
      <div className="bg-slate-100/50 dark:bg-slate-900/30 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800 text-xs text-slate-500 leading-normal flex items-start gap-2 shadow-xs shrink-0 select-none">
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-500 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-700 dark:text-slate-300 block uppercase font-mono text-[9.5px] font-bold">Compliance Safeguard Active</strong>
          Saudi National ID &amp; Credit Cards masked. Farah AI Gateway safety-sync checks passed.
        </div>
      </div>
      
    </div>
  );
}
