'use client';

import React, { useState } from 'react';
import { Brain, TrendingUp, HelpCircle, AlertCircle, Layers, CheckCircle2, ChevronRight, Activity, Plus, ShieldAlert, Cpu } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';
import { UnansweredQueriesTab, UnansweredQuery } from './UnansweredQueriesTab';
import { SuggestedClustersTab, Cluster } from './SuggestedClustersTab';
import { IntentGenerationWizard } from './IntentGenerationWizard';

export function TrainingTab() {
  const { lang, role, intents, setIntents, addAuditLog } = useApp();
  const t = translations[lang];
  const [activeSubTab, setActiveSubTab] = useState<'queries' | 'clusters'>('queries');
  const isReadOnly = role === 'qa_manager';

  // --- MOCK STATE DATA ---
  const [queries, setQueries] = useState<UnansweredQuery[]>([
    {
      id: 'uq-1',
      text: 'Is there any hidden fee for custom shipments?',
      lang: 'en',
      frequency: 24,
      lastSeen: '2026-06-01 10:45',
      confidence: 0.42,
      suggestedCluster: 'shipping_fees_inquiry',
      sentiment: 'neutral',
      status: 'New',
      conversationTranscript: [
        { sender: 'customer', text: 'Hi, I want to order a heavy item to Riyadh.', timestamp: '10:41' },
        { sender: 'bot', text: 'Sure! I can help with domestic order placement. Standard delivery is free.', timestamp: '10:42' },
        { sender: 'customer', text: 'Is there any hidden fee for custom shipments?', timestamp: '10:45' },
        { sender: 'bot', text: 'I am sorry, I did not catch that. Let me look up delivery rules.', timestamp: '10:45' }
      ],
      previousFallbackResponse: 'I am sorry, I did not catch that. Let me look up delivery rules.',
      similarOccurrences: [
        'extra tax on custom cargo',
        'hidden charges for custom import',
        'do we pay customs fee'
      ]
    },
    {
      id: 'uq-2',
      text: 'أريد إلغاء شحنتي المستعجلة فوراً',
      lang: 'ar',
      frequency: 42,
      lastSeen: '2026-06-01 09:22',
      confidence: 0.38,
      suggestedCluster: 'cancel_express_shipment',
      sentiment: 'negative',
      status: 'New',
      conversationTranscript: [
        { sender: 'customer', text: 'مرحباً، طلبت شحنة مستعجلة بالأمس ولكن غيرت رأيي.', timestamp: '09:20' },
        { sender: 'bot', text: 'أهلاً بك! يمكنك تتبع شحنتك باستخدام رقم التتبع الخاص بك.', timestamp: '09:21' },
        { sender: 'customer', text: 'أريد إلغاء شحنتي المستعجلة فوراً', timestamp: '09:22' },
        { sender: 'bot', text: 'عذراً، لم أفهم طلبك بالكامل. يمكنك مراجعة شروط الاسترجاع.', timestamp: '09:22' }
      ],
      previousFallbackResponse: 'عذراً، لم أفهم طلبك بالكامل. يمكنك مراجعة شروط الاسترجاع.',
      similarOccurrences: [
        'إلغاء الطلب المستعجل',
        'كيف أوقف شحن الطرد السريع',
        'إلغاء الشحنة قبل خروجها'
      ]
    },
    {
      id: 'uq-3',
      text: 'Credit card statement shows double subscription charge',
      lang: 'en',
      frequency: 18,
      lastSeen: '2026-06-01 08:14',
      confidence: 0.68,
      suggestedCluster: 'double_charge_billing',
      sentiment: 'negative',
      status: 'Reviewed',
      conversationTranscript: [
        { sender: 'customer', text: 'Why was I billed $99 twice this morning?', timestamp: '08:12' },
        { sender: 'bot', text: 'Our subscription costs $99/month. Let me know if you want to cancel.', timestamp: '08:13' },
        { sender: 'customer', text: 'Credit card statement shows double subscription charge', timestamp: '08:14' },
        { sender: 'bot', text: 'Let me transfer you to a human assistant to check the credit card invoice.', timestamp: '08:14' }
      ],
      previousFallbackResponse: 'Let me transfer you to a human assistant to check the credit card invoice.',
      similarOccurrences: [
        'charged twice for premium',
        'double billing line in gold plan',
        'unrecognized extra payments'
      ]
    },
    {
      id: 'uq-4',
      text: 'كيف يمكنني تحديث رقم الجوال المسجل؟',
      lang: 'ar',
      frequency: 31,
      lastSeen: '2026-05-31 22:15',
      confidence: 0.72,
      suggestedCluster: 'update_account_phone',
      sentiment: 'neutral',
      status: 'Clustered',
      conversationTranscript: [
        { sender: 'customer', text: 'دخلت على حسابي ورقم الهاتف القديم لا زال مسجلاً.', timestamp: '22:12' },
        { sender: 'bot', text: 'أهلاً بك! يمكنك مراجعة معلومات الحساب من لوحة التحكم.', timestamp: '22:13' },
        { sender: 'customer', text: 'كيف يمكنني تحديث رقم الجوال المسجل؟', timestamp: '22:15' },
        { sender: 'bot', text: 'لم أتمكن من العثور على إجابة دقيقة. سأقوم بتوجيهك لوكيل دعم مباشر.', timestamp: '22:15' }
      ],
      previousFallbackResponse: 'لم أتمكن من العثور على إجابة دقيقة. سأقوم بتوجيهك لوكيل دعم مباشر.',
      similarOccurrences: [
        'تغيير رقم الجوال في الحساب',
        'تعديل الهاتف القديم بالجديد',
        'تعديل الرقم المسجل'
      ]
    },
    {
      id: 'uq-5',
      text: 'My order status is stuck in pending since 3 days',
      lang: 'en',
      frequency: 15,
      lastSeen: '2026-05-31 18:30',
      confidence: 0.51,
      suggestedCluster: 'order_pending_check',
      sentiment: 'neutral',
      status: 'New',
      conversationTranscript: [
        { sender: 'customer', text: 'Hi, checking status for order ORD-991.', timestamp: '18:28' },
        { sender: 'bot', text: 'Your order ORD-991 is verified. Anything else?', timestamp: '18:29' },
        { sender: 'customer', text: 'My order status is stuck in pending since 3 days', timestamp: '18:30' },
        { sender: 'bot', text: 'Checking order guidelines. Hold on please.', timestamp: '18:30' }
      ],
      previousFallbackResponse: 'Checking order guidelines. Hold on please.',
      similarOccurrences: [
        'order still pending verification',
        'why order not shipped yet',
        'stuck on processing'
      ]
    }
  ]);

  const [clusters, setClusters] = useState<Cluster[]>([
    {
      id: 'cl-1',
      name: 'shipping_fees_inquiry',
      frequency: 24,
      confidence: 0.92,
      trend: 'up' as const,
      examplePhrases: [
        'Is there any hidden fee for custom shipments?',
        'extra tax on custom cargo',
        'hidden charges for custom import',
        'do we pay customs fee'
      ],
      keywords: ['shipping', 'fees', 'customs', 'taxes', 'hidden charges'],
      suggestedEntities: ['order_id'],
      suggestedSlots: [
        { name: 'order_id', type: 'string', required: true, prompt: 'Please provide the order number for checking custom fees.' }
      ],
      suggestedResponseEn: 'We charge dynamic shipping fees depending on weight. Custom duties are mapped in the invoice check detail.',
      suggestedResponseAr: 'نحن نفرض رسوم شحن متغيرة بناءً على الوزن. يتم توضيح الرسوم الجمركية في تفاصيل الفاتورة.',
      status: 'New' as const
    },
    {
      id: 'cl-2',
      name: 'cancel_express_shipment',
      frequency: 42,
      confidence: 0.88,
      trend: 'up' as const,
      examplePhrases: [
        'أريد إلغاء شحنتي المستعجلة فوراً',
        'إلغاء الطلب المستعجل',
        'كيف أوقف شحن الطرد السريع',
        'إلغاء الشحنة قبل خروجها'
      ],
      keywords: ['إلغاء', 'شحنة', 'مستعجل', 'طرد', 'توقف'],
      suggestedEntities: ['order_id'],
      suggestedSlots: [
        { name: 'order_id', type: 'string', required: true, prompt: 'الرجاء تزويدنا برقم الشحنة أو الطلب لإتمام الإلغاء.' }
      ],
      suggestedResponseEn: 'You can cancel your express shipment from your account dashboard before fulfillment status updates.',
      suggestedResponseAr: 'يمكنك إلغاء شحنتك المستعجلة من لوحة التحكم قبل تحديث حالة التنفيذ.',
      status: 'New' as const
    },
    {
      id: 'cl-3',
      name: 'double_charge_billing',
      frequency: 18,
      confidence: 0.95,
      trend: 'stable' as const,
      examplePhrases: [
        'Credit card statement shows double subscription charge',
        'charged twice for premium',
        'double billing line in gold plan',
        'unrecognized extra payments'
      ],
      keywords: ['double charge', 'charged twice', 'billing', 'subscription', 'statement'],
      suggestedEntities: ['invoice_number'],
      suggestedSlots: [
        { name: 'invoice_number', type: 'string', required: false, prompt: 'Please provide your INV transaction invoice number.' }
      ],
      suggestedResponseEn: 'Double charges are immediately auto-reversed. We apologize for the bank settlement delays.',
      suggestedResponseAr: 'يتم استرداد الخصم المزدوج تلقائياً. نعتذر عن أي تأخير في تسوية المعاملات البنكية.',
      status: 'Reviewed' as const
    },
    {
      id: 'cl-4',
      name: 'update_account_phone',
      frequency: 31,
      confidence: 0.84,
      trend: 'down' as const,
      examplePhrases: [
        'كيف يمكنني تحديث رقم الجوال المسجل؟',
        'تغيير رقم الجوال في الحساب',
        'تعديل الهاتف القديم بالجديد',
        'تعديل الرقم المسجل'
      ],
      keywords: ['تحديث', 'رقم الجوال', 'تعديل الهاتف', 'حسابي', 'الرقم المسجل'],
      suggestedEntities: ['phone_number'],
      suggestedSlots: [
        { name: 'phone_number', type: 'string', required: true, prompt: 'الرجاء كتابة رقم الجوال الجديد المراد تفعيله بالصيغة الدولية.' }
      ],
      suggestedResponseEn: 'Go to account settings, click phone, verify with MFA code, and input new phone details.',
      suggestedResponseAr: 'اذهب لإعدادات الحساب، اضغط على رقم الجوال، تحقق برمز OTP، ثم أدخل رقم الجوال الجديد.',
      status: 'Clustered' as const
    }
  ]);

  // Wizard Launch state
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardInitData, setWizardInitData] = useState<{
    intentName: string;
    phrases: string[];
    category: string;
  }>({ intentName: '', phrases: [], category: 'billing' });

  const handleOpenWizard = (intentName: string, phrases: string[], category: string) => {
    setWizardInitData({ intentName, phrases, category });
    setIsWizardOpen(true);
  };

  // Callback on Wizard Publish: Add to active intents and update status
  const handlePublishIntent = (intentData: {
    name: string;
    category: string;
    utterances: string[];
    slots: { name: string; type: string; required: boolean; prompt: string }[];
    fulfillmentValue: string;
  }) => {
    if (isReadOnly) return;

    // Check if intent already exists to avoid duplication
    const exists = intents.some(i => i.name === intentData.name);
    if (exists) {
      addAuditLog(`Attempted duplicate intent registration rejected: #${intentData.name}`, 'failed');
      return;
    }

    // Add intent
    const newIntent = {
      id: `int-${Date.now()}`,
      name: intentData.name,
      utterances: intentData.utterances,
      slots: intentData.slots,
      confidenceThreshold: 0.82,
      fulfillmentType: 'text' as const,
      fulfillmentValue: intentData.fulfillmentValue,
      status: 'active' as const,
      hitCount: 0
    };

    setIntents(prev => [...prev, newIntent]);

    // Update matching queries status to Intent Created and Clustered/Published
    setQueries(prev => prev.map(q => {
      if (q.suggestedCluster === wizardInitData.intentName || intentData.utterances.includes(q.text)) {
        return { ...q, status: 'Published' as const };
      }
      return q;
    }));

    // Update clusters status to Published
    setClusters(prev => prev.map(c => {
      if (c.name === wizardInitData.intentName) {
        return { ...c, status: 'Published' as const };
      }
      return c;
    }));

    addAuditLog(`Published NLU Intent: #${intentData.name} from training intelligence loop`, 'success');
  };

  // Metric aggregates
  const totalUnmatched = queries.length;
  const misses24h = queries.reduce((acc, q) => acc + q.frequency, 0);
  const escalatedCount = queries.filter(q => q.status === 'Reviewed').length;

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">
            {lang === 'ar' ? 'حلقة التدريب الذكي (NLU)' : 'Training Intelligence Loop'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ar'
              ? 'راجع طوابير الاستفسارات غير المجابة، وصنف العبارات إلى مجموعات، وحلل مقترحات الذكاء الاصطناعي، وانشر النوايا مباشرة للإنتاج.'
              : 'Review unanswered query queues, assign phrases to clusters, analyze AI intent suggestions, and publish new intents directly to production.'}
          </p>
        </div>

        {isReadOnly && (
          <div className="px-3.5 py-1.5 bg-amber-950/40 border border-amber-900/60 rounded-xl flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span className="text-[11px] text-amber-400 font-medium">
              {lang === 'ar' ? 'حساب التدقيق (مدير الجودة) - للقراءة فقط' : 'Audit account (QA Manager) - Read-only mode'}
            </span>
          </div>
        )}
      </div>

      {/* Metric Widgets Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 hover:border-slate-350 dark:hover:border-slate-700 transition-all">
          <div className="p-3 bg-blue-600/10 rounded-2xl">
            <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {lang === 'ar' ? 'إجمالي الاستفسارات غير المطابقة' : 'Total Unmatched Queries'}
            </span>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">{totalUnmatched}</h3>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 hover:border-slate-350 dark:hover:border-slate-700 transition-all">
          <div className="p-3 bg-blue-600/10 rounded-2xl">
            <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {lang === 'ar' ? 'أخطاء آخر 24 ساعة' : 'Last 24h Misses'}
            </span>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">{misses24h}</h3>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 hover:border-slate-350 dark:hover:border-slate-700 transition-all">
          <div className="p-3 bg-amber-600/10 rounded-2xl">
            <AlertCircle className="w-6 h-6 text-amber-550 dark:text-amber-400" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {lang === 'ar' ? 'الأخطاء المصعّدة' : 'Escalated Misses'}
            </span>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">{escalatedCount}</h3>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 hover:border-slate-350 dark:hover:border-slate-700 transition-all">
          <div className="p-3 bg-emerald-600/10 rounded-2xl">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {lang === 'ar' ? 'معدل دقة NLU المستهدف' : 'Target NLU Accuracy'}
            </span>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">92.8%</h3>
          </div>
        </div>
      </div>

      {/* Sub-Tab Selector Buttons */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveSubTab('queries')}
          className={`pb-3 text-sm font-bold border-b-2 px-4 transition-all duration-200 cursor-pointer ${
            activeSubTab === 'queries'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-750 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          {t.analyticsCenter.training.unansweredTab}
        </button>
        <button
          onClick={() => setActiveSubTab('clusters')}
          className={`pb-3 text-sm font-bold border-b-2 px-4 transition-all duration-200 cursor-pointer ${
            activeSubTab === 'clusters'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-750 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          {t.analyticsCenter.training.clustersTab}
        </button>
      </div>

      {/* Sub-Tab content area */}
      <div className="animate-fade-in">
        {activeSubTab === 'queries' ? (
          <UnansweredQueriesTab
            queries={queries}
            setQueries={setQueries}
            onOpenWizard={handleOpenWizard}
            isReadOnly={isReadOnly}
          />
        ) : (
          <SuggestedClustersTab
            clusters={clusters}
            setClusters={setClusters}
            onOpenWizard={handleOpenWizard}
            isReadOnly={isReadOnly}
          />
        )}
      </div>

      {/* Stepper Intent Generation Wizard modal */}
      <IntentGenerationWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onPublish={handlePublishIntent}
        initialIntentName={wizardInitData.intentName}
        initialPhrases={wizardInitData.phrases}
        initialCategory={wizardInitData.category}
        isReadOnly={isReadOnly}
      />
    </div>
  );
}
