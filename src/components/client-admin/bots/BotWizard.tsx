'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useNotificationsStore } from '@/stores/notificationsStore';
import { 
  Info, 
  User, 
  Layers, 
  Brain, 
  PlayCircle, 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  ShieldAlert, 
  ArrowRight,
  Sliders,
  Sparkles
} from 'lucide-react';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { translations } from '@/i18n/translations';

interface BotWizardProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'ar';
}

export function BotWizard({ isOpen, onClose, lang }: BotWizardProps) {
  const { createBot } = useApp();
  const addAuditLog = useNotificationsStore((s) => s.addAuditLog);
  const t = translations[lang];

  // Stepper state
  const [wizardStep, setWizardStep] = useState(1);

  // STEP 1 - Bot Basics
  const [newBotName, setNewBotName] = useState('');
  const [newBotDescription, setNewBotDescription] = useState('');
  const [newBotDomain, setNewBotDomain] = useState('Retail');
  const [newBotLangs, setNewBotLangs] = useState<string[]>(['English', 'Arabic']);

  // STEP 2 - Persona & Tone
  const [newBotPersonality, setNewBotPersonality] = useState('An empathetic financial chatbot helper.');
  const [newBotTone, setNewBotTone] = useState('Friendly');
  const [newBotEscalation, setNewBotEscalation] = useState('fallback_limit');
  const [newBotMultiBehavior, setNewBotMultiBehavior] = useState('auto_detect');

  // STEP 3 - Channels
  const [newBotChannels, setNewBotChannels] = useState<Record<string, boolean>>({
    web: true,
    whatsapp: false,
    email: false,
    voice: false,
    instagram: false,
    messenger: false
  });
  const [whatsappNumber, setWhatsappNumber] = useState('+966 50 123 4567');
  const [webChatColor, setWebChatColor] = useState('#2563EB');
  const [sipTrunkGateway, setSipTrunkGateway] = useState('VoIP Gate AST/KSA');
  const [supportEmail, setSupportEmail] = useState('support@mpaas-tenant.com');

  // STEP 4 - Knowledge & AI
  const [selectedKB, setSelectedKB] = useState<string[]>(['kb-custom']);
  const [embeddingModel, setEmbeddingModel] = useState('text-embedding-3-small');
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.70);
  const [fallbackBehavior, setFallbackBehavior] = useState('search_kb');

  // STEP 5 - Testing & Simulation
  const [testQuery, setTestQuery] = useState('');
  const [testChat, setTestChat] = useState<Array<{ sender: 'user' | 'bot'; text: string; details?: any }>>([
    {
      sender: 'bot',
      text: lang === 'ar' ? 'مرحباً! أنا محاكاة البوت الخاص بك. اسألني أي سؤال لتجربة نبرة الصوت والمطابقة!' : 'Hi! I am your bot simulator. Ask me anything to test the tone and matching behavior!',
      details: { intent: 'greeting', confidence: 1.00, fallback: false, entities: [] }
    }
  ]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [lastDetails, setLastDetails] = useState<any>(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // STEP 6 - Publish & Deployment
  const [deployEnv, setDeployEnv] = useState('staging');
  const [deployRollout, setDeployRollout] = useState(100);
  const [deployStatus, setDeployStatus] = useState<'live' | 'draft' | 'training'>('draft');
  const [deployLoading, setDeployLoading] = useState(false);

  const isWizardDirty = 
    newBotName !== '' ||
    newBotDescription !== '' ||
    newBotPersonality !== 'An empathetic financial chatbot helper.' ||
    newBotTone !== 'Friendly' ||
    newBotEscalation !== 'fallback_limit' ||
    newBotMultiBehavior !== 'auto_detect' ||
    newBotChannels.whatsapp || newBotChannels.email || newBotChannels.voice || newBotChannels.instagram || newBotChannels.messenger ||
    selectedKB.length > 1 || (selectedKB.length === 1 && selectedKB[0] !== 'kb-custom') ||
    testChat.length > 1 ||
    testQuery !== '';

  const handleCloseAttempt = () => {
    if (isWizardDirty) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  const handleNextStep = () => {
    if (wizardStep === 1 && !newBotName) return;
    setWizardStep((prev) => Math.min(prev + 1, 6));
  };

  const handlePrevStep = () => {
    setWizardStep((prev) => Math.max(prev - 1, 1));
  };

  const handleRunSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testQuery) return;

    const userText = testQuery;
    setTestChat((prev) => [...prev, { sender: 'user', text: userText }]);
    setTestQuery('');
    setIsSimulating(true);

    setTimeout(() => {
      let responseText = '';
      const entities: Array<{ name: string; value: string }> = [];
      
      const orderMatch = userText.match(/\b\d{8}\b/);
      if (orderMatch) {
        entities.push({ name: 'order_id', value: orderMatch[0] });
      }
      
      const emailMatch = userText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) {
        entities.push({ name: 'email', value: emailMatch[0] });
      }
      
      const ibanMatch = userText.match(/\bSA\d{22}\b/i);
      if (ibanMatch) {
        entities.push({ name: 'iban', value: ibanMatch[0].toUpperCase() });
      }

      let details: any = { 
        intent: 'default', 
        confidence: 0.85, 
        fallback: false, 
        escalation: false,
        entities,
        fallbackReason: '',
        escalationReason: ''
      };
      
      const lower = userText.toLowerCase();

      if (lower.includes('price') || lower.includes('cost') || lower.includes('سعر') || lower.includes('تكلفة')) {
        details.intent = 'pricing_query';
        responseText = lang === 'ar' 
          ? `[نبرة صوت: ${newBotTone}] بناءً على معلومات قاعدة المعرفة المعتمدة: تبلغ رسوم الاشتراك للباقة الأساسية 49 دولاراً شهرياً وللباقة الممتازة 99 دولاراً شهرياً.` 
          : `[Tone: ${newBotTone}] Based on our attached Knowledge Base, the SaaS basic tier is $49/month, and the Enterprise tier is $99/month.`;
      } else if (lower.includes('refund') || lower.includes('return') || lower.includes('استرجاع') || lower.includes('استرداد')) {
        details.intent = 'refund_inquiry';
        responseText = lang === 'ar' 
          ? `[نبرة صوت: ${newBotTone}] بالتأكيد، يُسمح بالاسترداد المالي خلال 30 يوماً من الشراء. يرجى توفير رقم الطلب للبدء.` 
          : `[Tone: ${newBotTone}] Certainly, refunds are allowed within 30 days of purchase. Please supply your Order ID to initiate the return.`;
        if (entities.length === 0) {
          details.fallback = true;
          details.confidence = 0.55;
          details.fallbackReason = lang === 'ar' 
            ? 'مطلوب إدخال رقم الطلب (order_id) ذو الـ 8 خانات للتحقق.'
            : 'Slot validation failed: Missing required 8-digit Order ID entity.';
        }
      } else if (lower.includes('broken') || lower.includes('angry') || lower.includes('double charge') || lower.includes('غاضب') || lower.includes('مشكلة')) {
        details.intent = 'billing_dispute';
        details.escalation = true;
        details.confidence = 0.95;
        details.escalationReason = lang === 'ar'
          ? 'تم الكشف عن مشاعر سلبية شديدة أو نزاع مالي (تجاوز حد السمية 0.85).'
          : 'Negative sentiment score detected (toxicity 0.92 limit breached on billing dispute).';
        responseText = lang === 'ar' 
          ? `[نبرة صوت: ${newBotTone}] أعتذر بشدة عن الإزعاج. سأقوم بتمرير المحادثة فوراً لوكيل دعم بشري لمراجعة الرسوم المزدوجة.` 
          : `[Tone: ${newBotTone}] I sincerely apologize for the inconvenience. Let me route you to a live support representative immediately.`;
      } else {
        details.fallback = true;
        details.confidence = 0.32;
        details.fallbackReason = lang === 'ar'
          ? `نسبة الثقة (32٪) أقل من حد القبول المستهدف (${(confidenceThreshold * 100).toFixed(0)}٪).`
          : `Confidence score of 32% fell below target NLU threshold of ${(confidenceThreshold * 100).toFixed(0)}%.`;
        if (fallbackBehavior === 'search_kb') {
          responseText = lang === 'ar' 
            ? `[أداء بديل] لم أستطع العثور على مطابقة دقيقة. جاري البحث في مستودع المعرفة عن "${userText}"...` 
            : `[Fallback Triggered] I could not find a precise match. Searching the knowledge repository for "${userText}"...`;
        } else {
          responseText = lang === 'ar' 
            ? `[أداء بديل] أعتذر، لم أفهم استفسارك. هل ترغب في التحدث إلى ممثل خدمة العملاء؟` 
            : `[Fallback Triggered] I apologize, I did not catch that. Would you like me to transfer you to a human agent?`;
        }
      }

      setTestChat((prev) => [...prev, { sender: 'bot', text: responseText, details }]);
      setLastDetails(details);
      setIsSimulating(false);
    }, 800);
  };

  const handleCreateBotSubmit = () => {
    setDeployLoading(true);
    setTimeout(() => {
      createBot({
        name: newBotName,
        persona: newBotPersonality,
        status: deployStatus,
        language: newBotLangs,
        intentCount: 15,
        knowledgeBaseId: selectedKB[0] || 'kb-custom'
      });
      addAuditLog(`Deployed new AI bot: ${newBotName} to environment: ${deployEnv.toUpperCase()}`, 'success');
      setDeployLoading(false);
      onClose();
    }, 1500);
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={handleCloseAttempt}
      preventCloseOnOverlayClick={isWizardDirty}
      preventCloseOnEsc={isWizardDirty}
      title={lang === 'ar' ? 'معالج إنشاء بوت ذكي متكامل' : 'Enterprise Bot Provisioning Wizard'}
      maxWidthClass="max-w-4xl"
    >
      {showDiscardConfirm ? (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center space-y-4 animate-zoom-in">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 dark:bg-rose-500/20 text-rose-500 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-bold text-base text-slate-850 dark:text-white">
              {lang === 'ar' ? 'هل أنت متأكد من إلغاء الإعداد؟' : 'Discard unsaved changes?'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm">
              {lang === 'ar' 
                ? 'لديك تغييرات غير محفوظة في معالج البوت. إذا قمت بالإغلاق الآن، ستفقد جميع التكوينات المدخلة.'
                : 'You are currently configuring a new AI agent. Closing now will permanently discard all inputs and configurations.'}
            </p>
          </div>
          <div className="flex gap-3 pt-2 w-full max-w-xs justify-center">
            <button
              type="button"
              onClick={() => {
                setShowDiscardConfirm(false);
              }}
              className="flex-1 py-2 px-4 border border-slate-200 dark:border-slate-800 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors text-slate-700 dark:text-slate-350 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {lang === 'ar' ? 'الرجوع ومتابعة التعديل' : 'Keep Editing'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowDiscardConfirm(false);
                onClose();
              }}
              className="flex-1 py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md shadow-rose-500/15 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              {lang === 'ar' ? 'تأكيد الإلغاء والحذف' : 'Discard & Close'}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full mb-5 overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300 ease-out" 
              style={{ width: `${(wizardStep / 6) * 100}%` }}
            />
          </div>
          
          {/* Step Indicators */}
          <div className="mb-6 flex items-center justify-between overflow-x-auto pb-2 border-b border-slate-100 dark:border-slate-800">
            {[
              { step: 1, label: lang === 'ar' ? 'الأساسيات' : 'Basics', icon: Info },
              { step: 2, label: lang === 'ar' ? 'الشخصية' : 'Persona', icon: User },
              { step: 3, label: lang === 'ar' ? 'القنوات' : 'Channels', icon: Layers },
              { step: 4, label: lang === 'ar' ? 'المعرفة' : 'Knowledge', icon: Brain },
              { step: 5, label: lang === 'ar' ? 'المحاكاة' : 'Simulate', icon: PlayCircle },
              { step: 6, label: lang === 'ar' ? 'النشر' : 'Publish', icon: CheckCircle },
            ].map((item) => {
              const Icon = item.icon;
              const isCompleted = item.step < wizardStep;
              const isActive = item.step === wizardStep;
              return (
                <div key={item.step} className="flex items-center gap-1.5 shrink-0 px-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                      isCompleted
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                        : isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-650'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : item.step}
                  </div>
                  <span
                    className={`text-[10px] font-bold ${
                      isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-550'
                    }`}
                  >
                    {item.label}
                  </span>
                  {item.step < 6 && (
                    <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-700 mx-1 hidden sm:block rtl:rotate-180" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Wizard Step Content */}
          <div className="min-h-96 py-2 text-xs text-slate-700 dark:text-slate-300">
            {/* STEP 1: Basics */}
            {wizardStep === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/10 rounded-2xl p-4 flex gap-3 items-start">
                  <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-0.5">{lang === 'ar' ? 'الأساسيات والمجال' : 'Bot Core Basics'}</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {lang === 'ar' 
                        ? 'حدد اسم البوت ونطاق الخدمات الموجهة للمؤسسة بالإضافة إلى اللغات المستهدفة.' 
                        : 'Provide your primary AI agent title, corporate scope parameters, and native multi-language configurations.'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-550 dark:text-slate-400">{lang === 'ar' ? 'اسم البوت' : 'Bot Identifier / Name'}</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Layla Smart Agent"
                      value={newBotName}
                      onChange={(e) => setNewBotName(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-550 dark:text-slate-400">{lang === 'ar' ? 'مجال الأعمال' : 'Business Category / Domain'}</label>
                    <select
                      value={newBotDomain}
                      onChange={(e) => setNewBotDomain(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none text-slate-800 dark:text-slate-100"
                    >
                      {['Retail', 'Banking', 'Telecom', 'Healthcare', 'Logistics'].map((dom) => (
                        <option key={dom} value={dom}>{dom}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-550 dark:text-slate-400">{lang === 'ar' ? 'الوصف والغرض' : 'Bot Scope Description'}</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Primary agent managing refunds, ticket classification, and standard order inquiries."
                    value={newBotDescription}
                    onChange={(e) => setNewBotDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block font-bold text-slate-550 dark:text-slate-400">{lang === 'ar' ? 'اللغات المدعومة' : 'Multilingual Checklist'}</label>
                  <div className="flex gap-4 flex-wrap">
                    {['English', 'Arabic', 'Spanish', 'French'].map((l) => {
                      const isChecked = newBotLangs.includes(l);
                      return (
                        <label key={l} className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewBotLangs((prev) => [...prev, l]);
                              } else {
                                setNewBotLangs((prev) => prev.filter((item) => item !== l));
                              }
                            }}
                            className="rounded text-blue-600"
                          />
                          <span className="font-bold">{l}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Persona & Tone */}
            {wizardStep === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-550 dark:text-slate-400">{lang === 'ar' ? 'التعليمات الشخصية الأساسية (System Prompt)' : 'AI Personality instructions'}</label>
                    <textarea
                      rows={4}
                      placeholder="Describe how the bot should behave: empathetic, concise, no conversational fillers..."
                      value={newBotPersonality}
                      onChange={(e) => setNewBotPersonality(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block font-bold text-slate-550 dark:text-slate-400">{lang === 'ar' ? 'النبرة والأسلوب' : 'Tone Presets'}</label>
                      <select
                        value={newBotTone}
                        onChange={(e) => setNewBotTone(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none text-slate-800 dark:text-slate-100"
                      >
                        {['Friendly', 'Professional', 'Concise', 'Empathetic', 'Humorous'].map((tone) => (
                          <option key={tone} value={tone}>{tone}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block font-bold text-slate-550 dark:text-slate-400">{lang === 'ar' ? 'سلوك التصعيد التلقائي' : 'Escalation Behavior Rule'}</label>
                      <select
                        value={newBotEscalation}
                        onChange={(e) => setNewBotEscalation(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none text-slate-800 dark:text-slate-100"
                      >
                        <option value="fallback_limit">{lang === 'ar' ? 'التصعيد بعد 3 أخطاء متتالية' : 'Escalate on 3 consecutive NLU fallbacks'}</option>
                        <option value="sentiment_breach">{lang === 'ar' ? 'التصعيد الفوري عند المشاعر السلبية' : 'Immediate handoff on negative sentiment score'}</option>
                        <option value="immediate">{lang === 'ar' ? 'تصعيد عند طلب العميل مباشرة' : 'Handoff immediately upon user request'}</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-550 dark:text-slate-400">{lang === 'ar' ? 'إدارة التنوع اللغوي' : 'Multilingual Orchestration Engine'}</label>
                  <select
                    value={newBotMultiBehavior}
                    onChange={(e) => setNewBotMultiBehavior(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none text-slate-800 dark:text-slate-100"
                  >
                    <option value="auto_detect">{lang === 'ar' ? 'الكشف التلقائي والمطابقة المحلية' : 'Auto-detect incoming language & route locally'}</option>
                    <option value="translate_fly">{lang === 'ar' ? 'الترجمة الفورية أثناء الحوار' : 'Translate on-the-fly via translation broker'}</option>
                    <option value="route_queue">{lang === 'ar' ? 'إعادة التوجيه إلى قوائم متخصصة باللغة' : 'Re-route directly to specialized agent queue'}</option>
                  </select>
                </div>
              </div>
            )}

            {/* STEP 3: Channels */}
            {wizardStep === 3 && (
              <div className="space-y-5 animate-fade-in">
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-2">{lang === 'ar' ? 'تخصيص قنوات الاتصال والاتصالات' : 'Enable Omnichannel Deployment Integrations'}</label>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'web', name: lang === 'ar' ? 'دردشة الويب' : 'Web Chat Widget', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
                    { id: 'whatsapp', name: lang === 'ar' ? 'واتساب بزنس' : 'WhatsApp Business', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
                    { id: 'email', name: lang === 'ar' ? 'البريد الدعم' : 'Email Helpdesk', color: 'bg-sky-500/10 text-sky-500 border-sky-500/20' },
                    { id: 'voice', name: lang === 'ar' ? 'بوابة الصوت IVR' : 'Voice Gateway (IVR)', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
                    { id: 'instagram', name: 'Instagram DM', color: 'bg-pink-500/10 text-pink-500 border-pink-500/20' },
                    { id: 'messenger', name: 'Facebook Messenger', color: 'bg-violet-500/10 text-violet-500 border-violet-500/20' }
                  ].map((ch) => {
                    const isChecked = newBotChannels[ch.id];
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => setNewBotChannels((prev) => ({ ...prev, [ch.id]: !prev[ch.id] }))}
                        className={`flex flex-col items-center justify-center p-4 border rounded-2xl transition-all gap-2 text-center focus:outline-none ${
                          isChecked 
                            ? 'border-blue-500 bg-blue-500/5 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-sm scale-[1.02]' 
                            : 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-555 hover:bg-slate-50 dark:hover:bg-slate-900'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center border font-semibold ${ch.color}`}>
                          {ch.id.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-bold text-[10px]">{ch.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Sub configurations */}
                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 border border-slate-150 dark:border-slate-850 rounded-2xl space-y-4">
                  <h4 className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-900 pb-1">{lang === 'ar' ? 'معايير الاتصال المفعلة' : 'Active Channel Metadata Settings'}</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {newBotChannels.web && (
                      <div className="space-y-1.5">
                        <label className="block font-bold text-slate-500">{lang === 'ar' ? 'اللون الأساسي للويدجت' : 'Widget Brand Theme Hex'}</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={webChatColor}
                            onChange={(e) => setWebChatColor(e.target.value)}
                            className="w-8 h-8 rounded-xl bg-transparent border-0 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={webChatColor}
                            onChange={(e) => setWebChatColor(e.target.value)}
                            className="flex-1 px-3 py-1 border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {newBotChannels.whatsapp && (
                      <div className="space-y-1.5 animate-fade-in">
                        <label className="block font-bold text-slate-500">{lang === 'ar' ? 'رقم أعمال الواتساب (Twilio Sender)' : 'WhatsApp Business Number'}</label>
                        <input
                          type="text"
                          value={whatsappNumber}
                          onChange={(e) => setWhatsappNumber(e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent focus:outline-none"
                        />
                      </div>
                    )}

                    {newBotChannels.voice && (
                      <div className="space-y-1.5 animate-fade-in">
                        <label className="block font-bold text-slate-500">{lang === 'ar' ? 'بوابة التوجيه SIP Trunk' : 'Primary SIP Media Gateway'}</label>
                        <select
                          value={sipTrunkGateway}
                          onChange={(e) => setSipTrunkGateway(e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent focus:outline-none"
                        >
                          <option value="VoIP Gate AST/KSA">VoIP Gate primary (AST/KSA)</option>
                          <option value="VoIP Gate Fallback (DXB)">VoIP Gate Fallback (DXB)</option>
                        </select>
                      </div>
                    )}

                    {newBotChannels.email && (
                      <div className="space-y-1.5 animate-fade-in">
                        <label className="block font-bold text-slate-500">{lang === 'ar' ? 'البريد الإلكتروني للدعم' : 'Support Inbox Alias Address'}</label>
                        <input
                          type="email"
                          value={supportEmail}
                          onChange={(e) => setSupportEmail(e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Knowledge & AI */}
            {wizardStep === 4 && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="block font-bold text-slate-550 dark:text-slate-400">{lang === 'ar' ? 'ربط مستندات المعرفة RAG' : 'RAG Knowledge Source Assignment'}</label>
                    <div className="space-y-2">
                      {[
                        { id: 'kb-custom', name: lang === 'ar' ? 'دليل استرجاع المنتجات Dubai-Core' : 'Dubai-Core Returns Exemption (RAG PDF)', count: '142 chunks' },
                        { id: 'kb-sap', name: lang === 'ar' ? 'بوابات الفحص المالي SAP ERP' : 'SAP ERP Operational Guide (Database)', count: '98 chunks' },
                        { id: 'kb-faq', name: lang === 'ar' ? 'الأسئلة الشائعة العامة' : 'General Support Helpdesk FAQ (URL)', count: '210 chunks' }
                      ].map((kb) => {
                        const isChecked = selectedKB.includes(kb.id);
                        return (
                          <label key={kb.id} className="flex justify-between items-center p-3 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition-colors">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedKB((prev) => [...prev, kb.id]);
                                  } else {
                                    setSelectedKB((prev) => prev.filter((i) => i !== kb.id));
                                  }
                                }}
                                className="rounded text-blue-600"
                              />
                              <div className="flex flex-col">
                                <span className="font-bold text-xs">{kb.name}</span>
                                <span className="text-[9px] text-slate-400 font-mono mt-0.5">{kb.count}</span>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block font-bold text-slate-550 dark:text-slate-400">{lang === 'ar' ? 'نموذج التقطيع والترميز' : 'Embedding Vector Model'}</label>
                      <select
                        value={embeddingModel}
                        onChange={(e) => setEmbeddingModel(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none text-slate-800 dark:text-slate-100"
                      >
                        <option value="text-embedding-3-small">text-embedding-3-small (1536d)</option>
                        <option value="text-embedding-ada-002">text-embedding-ada-002 (1536d)</option>
                        <option value="voyage-multilingual-2">voyage-multilingual-2 (1024d)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="block font-bold text-slate-550 dark:text-slate-400">{lang === 'ar' ? 'درجة الثقة الأدنى للمطابقة' : 'AI Confidence Threshold'}</label>
                        <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">{(confidenceThreshold * 100).toFixed(0)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.30"
                        max="0.95"
                        step="0.05"
                        value={confidenceThreshold}
                        onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                        className="w-full accent-blue-600 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer h-1.5"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block font-bold text-slate-550 dark:text-slate-400">{lang === 'ar' ? 'إجراء الاستجابة البديلة (Fallback)' : 'Confidence Fallback Action'}</label>
                      <select
                        value={fallbackBehavior}
                        onChange={(e) => setFallbackBehavior(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none text-slate-800 dark:text-slate-100"
                      >
                        <option value="search_kb">{lang === 'ar' ? 'البحث المعمق في RAG وتوليد نص' : 'Generative answer fallback search RAG'}</option>
                        <option value="custom_msg">{lang === 'ar' ? 'إرجاع رسالة اعتذار مخصصة' : 'Display custom static apology response'}</option>
                        <option value="handoff">{lang === 'ar' ? 'التصعيد المباشر لقائمة الوكلاء' : 'Route case immediately to human support'}</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Testing & Simulation */}
            {wizardStep === 5 && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Chat window */}
                  <div className="lg:col-span-2 bg-slate-550/5 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 rounded-2xl flex flex-col justify-between overflow-hidden h-96">
                    {/* messages list */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {testChat.map((msg, i) => (
                        <div key={i} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                          <div className={`p-3 rounded-2xl max-w-[85%] text-xs font-semibold ${
                            msg.sender === 'user' 
                              ? 'bg-blue-600 text-white rounded-br-none' 
                              : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none'
                          }`}>
                            <p>{msg.text}</p>
                            
                            {msg.details && (
                              <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap gap-2 text-[8px] font-bold text-slate-400 dark:text-slate-500 font-mono">
                                <span>INTENT: #{msg.details.intent}</span>
                                <span>CONFIDENCE: {(msg.details.confidence * 100).toFixed(0)}%</span>
                                {msg.details.fallback && <span className="text-amber-500 font-extrabold">[FALLBACK]</span>}
                                {msg.details.escalation && <span className="text-rose-500 font-extrabold">[ESCALATED]</span>}
                              </div>
                            )}

                            {msg.details?.entities?.length > 0 && (
                              <div className="mt-1.5 pt-1.5 border-t border-dotted border-slate-100 dark:border-slate-800 flex flex-wrap gap-1">
                                {msg.details.entities.map((ent: any) => (
                                  <span key={ent.name} className="px-1.5 py-0.5 text-[8px] font-bold font-mono bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-md">
                                    @{ent.name}: {ent.value}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {isSimulating && (
                        <div className="text-[10px] text-slate-400 italic animate-pulse">
                          {lang === 'ar' ? 'جاري محاكاة النماذج وRAG...' : 'Analyzing RAG vector indexes & matching intent...'}
                        </div>
                      )}
                    </div>

                    {/* input form */}
                    <form onSubmit={handleRunSimulation} className="p-3 border-t border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 flex gap-2">
                      <input
                        type="text"
                        placeholder={lang === 'ar' ? "اسأل البوت عن الأسعار أو الاسترجاع..." : "Ask: 'What is the pricing?' or 'Return order'"}
                        value={testQuery}
                        onChange={(e) => setTestQuery(e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent focus:outline-none"
                      />
                      <button 
                        type="submit"
                        disabled={isSimulating || !testQuery}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl disabled:opacity-50 cursor-pointer"
                      >
                        <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                      </button>
                    </form>
                  </div>

                  {/* Diagnostic helper */}
                  <div className="bg-slate-100/50 dark:bg-slate-900/40 p-4 border border-slate-200 dark:border-slate-850 rounded-2xl space-y-4">
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-blue-500" />
                      <span>{lang === 'ar' ? 'أدوات التشخيص NLU' : 'Simulation Diagnostics'}</span>
                    </h4>
                    
                    <div className="space-y-3 text-[10px] font-mono leading-relaxed">
                      <div className="p-2.5 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl space-y-1">
                        <span className="text-slate-400 block">CONNECTED PERSONA:</span>
                        <span className="font-bold text-slate-850 dark:text-white truncate block">{newBotName || 'Layla Default'}</span>
                      </div>

                      <div className="p-2.5 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl space-y-1">
                        <span className="text-slate-400 block">ACTIVE EMBEDDING:</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">{embeddingModel}</span>
                      </div>

                      {lastDetails ? (
                        <>
                          <div className="p-2.5 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl space-y-1">
                            <span className="text-slate-400 block">MATCHED INTENT:</span>
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-blue-600 dark:text-blue-400">#{lastDetails.intent}</span>
                              <span className="font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 text-[9px]">
                                {(lastDetails.confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>

                          <div className="p-2.5 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl space-y-1.5">
                            <span className="text-slate-400 block">EXTRACTED ENTITIES:</span>
                            {lastDetails.entities.length > 0 ? (
                              <div className="space-y-1">
                                {lastDetails.entities.map((ent: any) => (
                                  <div key={ent.name} className="flex justify-between border-b border-slate-50 dark:border-slate-900 pb-0.5">
                                    <span className="text-slate-550">@{ent.name}</span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200">{ent.value}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-500 italic block">{lang === 'ar' ? 'لا يوجد مدخلات مستخرجة' : 'No entities extracted'}</span>
                            )}
                          </div>

                          {lastDetails.fallback && (
                            <div className="p-2.5 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-1">
                              <span className="text-amber-500 font-bold block">{lang === 'ar' ? 'سبب الإجراء البديل (Fallback):' : 'Fallback Reason:'}</span>
                              <p className="text-[9px] text-amber-600 dark:text-amber-400 normal-case leading-normal font-sans">
                                {lastDetails.fallbackReason}
                              </p>
                            </div>
                          )}

                          {lastDetails.escalation && (
                            <div className="p-2.5 bg-rose-500/5 border border-rose-500/20 rounded-xl space-y-1">
                              <span className="text-rose-500 font-bold block">{lang === 'ar' ? 'سبب التصعيد الفوري:' : 'Escalation Trigger Reason:'}</span>
                              <p className="text-[9px] text-rose-600 dark:text-rose-400 normal-case leading-normal font-sans">
                                {lastDetails.escalationReason}
                              </p>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center text-slate-450 dark:text-slate-500 font-sans italic text-[11px]">
                          {lang === 'ar' ? 'بانتظار إدخال الاستفسار لتشغيل المحاكاة الفورية...' : 'Awaiting query simulation to trigger live diagnostics...'}
                        </div>
                      )}

                      <div className="p-2.5 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl space-y-1.5">
                        <span className="text-slate-400 block">SIMULATION HINT:</span>
                        <p className="text-[9px] text-slate-400 normal-case leading-normal font-sans">
                          {lang === 'ar' 
                            ? 'جرب كتابة "سعر" لفحص RAG، أو "استرجاع" بدون رقم طلب، أو "غاضب" لتجربة التصعيد الفوري لوكيل الدعم.' 
                            : 'Try typing "pricing" to test RAG retrieval, "refund" without Order ID to observe slot validation failure, or "angry" to trigger the automatic supervisor escalation locks.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: Publish & Deployment */}
            {wizardStep === 6 && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 rounded-2xl p-4 flex gap-3 items-start">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-0.5">{lang === 'ar' ? 'جاهز للنشر وتوزيع المرور' : 'Deployment Target Split & Rollout'}</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {lang === 'ar' 
                        ? 'قم بمراجعة إعدادات البوت وتأكيد البيئة التشغيلية المستهدفة.' 
                        : 'Assign target release infrastructure, define traffic rollout split limits, and confirm deployment compile.'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* summary lists */}
                  <div className="bg-slate-50 dark:bg-slate-950/40 p-4 border border-slate-150 dark:border-slate-850 rounded-2xl space-y-3">
                    <h4 className="font-bold text-slate-900 dark:text-white">{lang === 'ar' ? 'ملخص مراجعة البوت' : 'Bot Configuration Summary'}</h4>
                    
                    <div className="space-y-2 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Name:</span>
                        <span className="font-bold text-slate-850 dark:text-white">{newBotName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Domain:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{newBotDomain}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tone Preset:</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">{newBotTone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Embedding:</span>
                        <span className="font-bold text-slate-600 dark:text-slate-350 truncate max-w-44" title={embeddingModel}>{embeddingModel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Confidence Match:</span>
                        <span className="font-bold font-mono text-emerald-500">{(confidenceThreshold * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Channels:</span>
                        <span className="font-bold text-slate-855 dark:text-white truncate max-w-44">
                          {Object.keys(newBotChannels).filter(k => newBotChannels[k]).join(', ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* split sliders */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block font-bold text-slate-550 dark:text-slate-400">{lang === 'ar' ? 'بيئة التشغيل المستهدفة' : 'Target Release Environment'}</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['development', 'staging', 'production'].map((env) => {
                          const isSelected = deployEnv === env;
                          return (
                            <button
                              key={env}
                              type="button"
                              onClick={() => setDeployEnv(env)}
                              className={`py-2 px-1 border font-bold uppercase rounded-xl transition-colors focus:outline-none text-[10px] cursor-pointer ${
                                isSelected 
                                  ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/10' 
                                  : 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-550 hover:bg-slate-50 dark:hover:bg-slate-900'
                              }`}
                            >
                              {env}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="block font-bold text-slate-550 dark:text-slate-400">{lang === 'ar' ? 'نسبة توزيع المرور (Rollout Weight)' : 'Gradual Rollout Splitting'}</label>
                        <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">{deployRollout}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="10"
                        value={deployRollout}
                        onChange={(e) => setDeployRollout(parseInt(e.target.value))}
                        className="w-full accent-blue-600 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer h-1.5"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block font-bold text-slate-550 dark:text-slate-400">{lang === 'ar' ? 'حالة النشر الأولية' : 'Initial Status Gate'}</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'draft', label: 'DRAFT' },
                          { id: 'live', label: 'LIVE' },
                          { id: 'training', label: 'TRAINING' }
                        ].map((st) => {
                          const isSelected = deployStatus === st.id;
                          return (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => setDeployStatus(st.id as any)}
                              className={`py-2 px-1 border font-bold rounded-xl transition-colors focus:outline-none text-[10px] cursor-pointer ${
                                isSelected 
                                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/10' 
                                  : 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-550 hover:bg-slate-50 dark:hover:bg-slate-900'
                              }`}
                            >
                              {st.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
            <button
              type="button"
              disabled={wizardStep === 1 || deployLoading}
              onClick={handlePrevStep}
              className="flex items-center gap-1 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
              <span>{lang === 'ar' ? 'السابق' : 'Previous'}</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={deployLoading}
                onClick={handleCloseAttempt}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-400 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {t.clientAdmin.bots.cancel}
              </button>
              {wizardStep < 6 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={wizardStep === 1 && !newBotName}
                  className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl disabled:opacity-50 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <span>{lang === 'ar' ? 'المتابعة' : 'Continue'}</span>
                  <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCreateBotSubmit}
                  disabled={deployLoading}
                  className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl disabled:opacity-50 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  {deployLoading ? (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>{deployLoading ? (lang === 'ar' ? 'جاري الفهرسة والنشر...' : 'Publishing & Compiling Vector index...') : (lang === 'ar' ? 'إطلاق وتفعيل البوت' : 'Deploy & Activate AI')}</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </ModalWrapper>
  );
}
