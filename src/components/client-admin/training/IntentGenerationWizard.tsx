'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Brain, AlertCircle, Sparkles, ChevronRight, ChevronLeft, ShieldAlert } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/components/shared/BadgeSystem';

interface IntentGenerationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (intentData: {
    name: string;
    category: string;
    utterances: string[];
    slots: { name: string; type: string; required: boolean; prompt: string }[];
    fulfillmentValue: string;
  }) => void;
  initialIntentName?: string;
  initialPhrases?: string[];
  initialCategory?: string;
  isReadOnly?: boolean;
}

export function IntentGenerationWizard({
  isOpen,
  onClose,
  onPublish,
  initialIntentName = '',
  initialPhrases = [],
  initialCategory = 'billing',
  isReadOnly = false,
}: IntentGenerationWizardProps) {
  const { lang, addAuditLog } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);

  // Form states
  const [intentName, setIntentName] = useState(initialIntentName);
  const [category, setCategory] = useState(initialCategory);
  
  // Phrases state (editable list)
  const [phrases, setPhrases] = useState<string[]>(initialPhrases);
  const [newPhrase, setNewPhrase] = useState('');

  // Entities/Parameters state
  // We mock a selection of standard system entities that map to the Entity Catalog
  const defaultEntities = [
    { name: 'order_id', label: 'Order ID (@order_id)', regex: '^\\d{8}$', description: '8-digit order identifier', defaultPrompt: 'Please provide your 8-digit Order ID.' },
    { name: 'customer_name', label: 'Customer Name (@customer_name)', regex: '^[a-zA-Z\\s]{3,30}$', description: 'Alphabetical user name', defaultPrompt: 'Could you please state your full name?' },
    { name: 'phone_number', label: 'Phone Number (@phone_number)', regex: '^\\+?\\d{10,15}$', description: 'International or local phone format', defaultPrompt: 'Please provide a valid contact number.' },
    { name: 'iban', label: 'IBAN (@iban)', regex: '^SA\\d{22}$', description: 'Saudi bank account identifier', defaultPrompt: 'Please provide your SA IBAN for refund processing.' },
    { name: 'shipment_tracking', label: 'Shipment Tracking (@shipment_tracking)', regex: '^TRK\\d{10}$', description: '13-char shipping tracker', defaultPrompt: 'What is the tracking number of your shipment?' }
  ];

  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  
  // Slot validation rules state
  const [slotRules, setSlotRules] = useState<Record<string, {
    required: boolean;
    prompt: string;
    maxRetries: number;
    escalationAction: string;
  }>>({});

  // Responses state
  const [enResponse, setEnResponse] = useState('');
  const [arResponse, setArResponse] = useState('');

  // Sync state from props when modal opens or initial values change
  useEffect(() => {
    if (isOpen) {
      setIntentName(initialIntentName);
      setCategory(initialCategory);
      setPhrases(initialPhrases);
      setCurrentStep(1);
      setIsPublishing(false);
      
      // Auto-detect which entities might be relevant
      const detected: string[] = [];
      const lowerPhrases = initialPhrases.map(p => p.toLowerCase()).join(' ');
      if (lowerPhrases.includes('order') || lowerPhrases.includes('طلب') || lowerPhrases.includes('رقم')) {
        detected.push('order_id');
      }
      if (lowerPhrases.includes('phone') || lowerPhrases.includes('هاتف') || lowerPhrases.includes('جوال')) {
        detected.push('phone_number');
      }
      if (lowerPhrases.includes('iban') || lowerPhrases.includes('ايبان') || lowerPhrases.includes('حساب')) {
        detected.push('iban');
      }
      setSelectedEntities(detected);

      // Initialize slot rules for detected entities
      const initialRules: Record<string, any> = {};
      defaultEntities.forEach(ent => {
        initialRules[ent.name] = {
          required: ent.name === 'order_id' || ent.name === 'shipment_tracking',
          prompt: ent.defaultPrompt,
          maxRetries: 3,
          escalationAction: 'Transfer to Live Agent'
        };
      });
      setSlotRules(initialRules);

      // Seed responses based on intent name
      if (initialIntentName.toLowerCase().includes('refund')) {
        setEnResponse('I can help process your refund for order {{order_id}}. Let me verify the transaction details.');
        setArResponse('يمكنني مساعدتك في استرجاع المبلغ للطلب {{order_id}}. دعني أتحقق من تفاصيل المعاملة.');
      } else if (initialIntentName.toLowerCase().includes('status') || initialIntentName.toLowerCase().includes('track')) {
        setEnResponse('Let me look up the shipping status of shipment {{shipment_tracking}}.');
        setArResponse('دعني أتحقق من حالة الشحن للشحنة رقم {{shipment_tracking}}.');
      } else {
        setEnResponse('Thank you. I have logged your request. Our assistant is looking into it.');
        setArResponse('شكرًا لك. لقد قمنا بتسجيل طلبك. المساعد الذكي يتابع الأمر حاليًا.');
      }
    }
  }, [isOpen, initialIntentName, initialPhrases, initialCategory]);

  if (!isOpen) return null;

  const handleAddPhrase = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPhrase.trim()) {
      setPhrases([...phrases, newPhrase.trim()]);
      setNewPhrase('');
    }
  };

  const handleRemovePhrase = (index: number) => {
    setPhrases(phrases.filter((_, i) => i !== index));
  };

  const toggleEntity = (entityName: string) => {
    if (selectedEntities.includes(entityName)) {
      setSelectedEntities(selectedEntities.filter(name => name !== entityName));
    } else {
      setSelectedEntities([...selectedEntities, entityName]);
    }
  };

  const updateSlotRule = (entityName: string, field: string, value: any) => {
    setSlotRules(prev => ({
      ...prev,
      [entityName]: {
        ...prev[entityName],
        [field]: value
      }
    }));
  };

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePublishClick = () => {
    if (isReadOnly) return;
    setIsPublishing(true);

    // Simulate 1.5s gateway credential sync & compiler compile
    setTimeout(() => {
      // Map selected entities to standard Intent Slot format
      const finalSlots = selectedEntities.map(name => {
        const rule = slotRules[name];
        return {
          name,
          type: name === 'order_id' || name === 'iban' ? 'string' : 'text',
          required: rule?.required ?? false,
          prompt: rule?.prompt ?? `Please provide value for ${name}`
        };
      });

      onPublish({
        name: intentName.replace(/\s+/g, '_').toLowerCase(),
        category,
        utterances: phrases,
        slots: finalSlots,
        fulfillmentValue: lang === 'ar' ? arResponse : enResponse
      });

      setIsPublishing(false);
      onClose();
    }, 1500);
  };

  const steps = [
    { num: 1, name: lang === 'ar' ? 'الاسم والتصنيف' : 'Name & Category' },
    { num: 2, name: lang === 'ar' ? 'العبارات التدريبية' : 'Training Phrases' },
    { num: 3, name: lang === 'ar' ? 'الكيانات والمعايير' : 'Entities' },
    { num: 4, name: lang === 'ar' ? 'تصديق الفتحات' : 'Slot Rules' },
    { num: 5, name: lang === 'ar' ? 'الاستجابات الجاهزة' : 'Agent Replies' },
    { num: 6, name: lang === 'ar' ? 'النشر النهائي' : 'Publish & Sync' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/10 rounded-xl">
              <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {lang === 'ar' ? 'معالج إنشاء النية الذكي' : 'Intent Generation Wizard'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'ar' ? 'تحويل العبارات غير المطابقة إلى نية NLU معالجة بالكامل' : 'Map unmatched query streams into a structured NLU intent'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Read-Only Notice */}
        {isReadOnly && (
          <div className="bg-amber-500/10 dark:bg-amber-950/40 border-b border-amber-250 dark:border-amber-900/60 px-6 py-2.5 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
              {lang === 'ar' ? 'وضع القراءة فقط: حساب مدير الجودة لا يملك صلاحية تعديل أو نشر النوايا.' : 'Read-Only Mode: QA Manager permissions do not allow intent modifications or deployment.'}
            </span>
          </div>
        )}

        {/* Stepper Progress bar */}
        <div className="px-6 py-3.5 bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center overflow-x-auto gap-4">
          {steps.map((s) => (
            <div key={s.num} className="flex items-center gap-2 min-w-max">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                currentStep === s.num
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10'
                  : currentStep > s.num
                    ? 'bg-emerald-600/20 text-emerald-600 dark:text-emerald-500 border border-emerald-500/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
              }`}>
                {currentStep > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
              </div>
              <span className={`text-[11px] font-medium transition-all ${
                currentStep === s.num ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-500'
              }`}>
                {s.name}
              </span>
              {s.num < 6 && <ChevronRight className="w-3.5 h-3.5 text-slate-350 dark:text-slate-705 rtl:rotate-180" />}
            </div>
          ))}
        </div>

        {/* Step Contents */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-850 dark:text-slate-200">
          {/* STEP 1: Intent Name & Category */}
          {currentStep === 1 && (
            <div className="space-y-4 max-w-xl mx-auto py-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {lang === 'ar' ? 'اسم النية NLU' : 'Intent Identifier Name'}
                </label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  placeholder="e.g. request_refund_exemption"
                  value={intentName}
                  onChange={(e) => setIntentName(e.target.value.replace(/\s+/g, '_').toLowerCase())}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none rounded-xl text-sm font-mono text-slate-800 dark:text-white transition-colors"
                />
                <p className="text-[10px] text-slate-500">
                  {lang === 'ar' ? 'استخدم الحروف الصغيرة والشرطة السفلية (_) كفواصل فقط (مثال: billing_dispute).' : 'Standard lower-case characters and underscores only. Avoid special characters.'}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {lang === 'ar' ? 'تصنيف الأعمال' : 'Business Category'}
                </label>
                <select
                  disabled={isReadOnly}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:outline-none rounded-xl text-sm text-slate-700 dark:text-slate-300"
                >
                  <option value="billing">{lang === 'ar' ? 'الفوترة والمدفوعات' : 'Billing & Payments'}</option>
                  <option value="account">{lang === 'ar' ? 'إدارة الحساب' : 'Account Management'}</option>
                  <option value="shipping">{lang === 'ar' ? 'الشحن والتوصيل' : 'Shipping & Fulfillment'}</option>
                  <option value="technical">{lang === 'ar' ? 'الدعم الفني والشبكات' : 'Technical Support'}</option>
                  <option value="other">{lang === 'ar' ? 'آخر' : 'Other General Queries'}</option>
                </select>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-2xl flex gap-3 mt-8">
                <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-350">{lang === 'ar' ? 'اقتراح الذكاء الاصطناعي التوليدي' : 'AI Intent Suggestion'}</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-450 mt-1 leading-relaxed">
                    {lang === 'ar' ? 'اكتشف محرك التصنيف لدينا ترابطاً عالياً في العبارات المحددة وتمت مواءمة الاسم المقترح لتقليل التداخل مع النوايا المسجلة.' : 'Our compiler mapped these utterances to a unique semantic workspace. We recommend grouping them under this identifier.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Training Phrases */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {lang === 'ar' ? 'مجموعة عبارات التدريب' : 'Utterance Training Set'}
                </h4>
                <Badge type="neutral">
                  {phrases.length} {lang === 'ar' ? 'عبارات' : 'phrases'}
                </Badge>
              </div>

              {/* Add form */}
              <form onSubmit={handleAddPhrase} className="flex gap-2">
                <input
                  type="text"
                  disabled={isReadOnly}
                  placeholder={lang === 'ar' ? 'أضف عبارة تدريبية جديدة...' : 'Enter training phrase...'}
                  value={newPhrase}
                  onChange={(e) => setNewPhrase(e.target.value)}
                  className="flex-1 px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:outline-none rounded-xl text-xs text-slate-800 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={isReadOnly}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors"
                >
                  {lang === 'ar' ? 'إضافة' : 'Add'}
                </button>
              </form>

              {/* Phrases list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                {phrases.map((phrase, idx) => (
                  <div key={idx} className="px-3.5 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-150 dark:border-slate-850 rounded-xl flex justify-between items-center group hover:border-slate-200 dark:hover:border-slate-750 transition-colors">
                    <span className="text-xs text-slate-750 dark:text-slate-350 font-mono truncate mr-2">{phrase}</span>
                    {!isReadOnly && (
                      <button
                        onClick={() => handleRemovePhrase(idx)}
                        className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Parameters / Entities */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                  {lang === 'ar' ? 'ربط كيانات الكتالوج' : 'Associated Entity Entities'}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {lang === 'ar' ? 'حدد أي الكيانات من كتالوج الكيانات النشط تحتاج إلى استخراجها من عبارات العميل.' : 'Link pre-defined entities from your Entity Catalog to parse them automatically.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {defaultEntities.map((ent) => {
                  const isSelected = selectedEntities.includes(ent.name);
                  return (
                    <div
                      key={ent.name}
                      onClick={() => !isReadOnly && toggleEntity(ent.name)}
                      className={`p-4 border rounded-xl cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-blue-600/10 border-blue-500 shadow-md shadow-blue-500/5'
                          : 'bg-slate-50 dark:bg-slate-950/40 border-slate-150 dark:border-slate-850 hover:border-slate-250 dark:hover:border-slate-750'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-bold text-slate-800 dark:text-white font-mono">@{ent.name}</span>
                          <p className="text-[10px] text-slate-500 mt-0.5">{ent.description}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-350 dark:border-slate-700'
                        }`}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                      <div className="mt-3.5 pt-2 border-t border-slate-200 dark:border-slate-900/50 flex justify-between items-center">
                        <span className="text-[9px] text-slate-500 font-mono">RegEx: {ent.regex}</span>
                        <Badge type="neutral" className="text-[8px]">System</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Slot Rules */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                  {lang === 'ar' ? 'شروط وقواعد الفتحات (Slots)' : 'Slot Filling Validation Rules'}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {lang === 'ar' ? 'حدد سلوك الحوار ومطالبات المطابقة وتجاوزات الفشل لكل معلمة مستهدفة.' : 'Define required prompts, validation tolerances, and fallback actions for each parameter.'}
                </p>
              </div>

              {selectedEntities.length === 0 ? (
                <div className="p-8 bg-slate-50 dark:bg-slate-950/30 border border-slate-150 dark:border-slate-850 rounded-xl text-center space-y-2">
                  <AlertCircle className="w-6 h-6 text-slate-400 dark:text-slate-650 mx-auto" />
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    {lang === 'ar' ? 'لا توجد كيانات محددة للاستخراج.' : 'No entities selected.'}
                  </p>
                  <p className="text-[10px] text-slate-450 dark:text-slate-600">
                    {lang === 'ar' ? 'ارجع للخطوة السابقة لربط الكيانات وتفعيل معالجة الفتحات.' : 'Go back to step 3 to associate parameters first.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                  {selectedEntities.map((name) => {
                    const rule = slotRules[name] || { required: false, prompt: '', maxRetries: 3, escalationAction: 'Transfer to Live Agent' };
                    return (
                      <div key={name} className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-150 dark:border-slate-850 hover:border-slate-200 dark:hover:border-slate-750 rounded-xl space-y-4 transition-colors">
                        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-900/55 pb-2">
                          <span className="text-xs font-bold text-slate-850 dark:text-white font-mono">@{name} Slot Rule</span>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              disabled={isReadOnly}
                              checked={rule.required}
                              onChange={(e) => updateSlotRule(name, 'required', e.target.checked)}
                              className="w-3.5 h-3.5 rounded accent-blue-600"
                            />
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Required parameter</span>
                          </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                              {lang === 'ar' ? 'رسالة المطالبة (Prompt)' : 'Required Value Prompt Text'}
                            </label>
                            <input
                              type="text"
                              disabled={isReadOnly}
                              value={rule.prompt}
                              onChange={(e) => updateSlotRule(name, 'prompt', e.target.value)}
                              className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1.5">
                              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                                {lang === 'ar' ? 'محاولات الفشل' : 'Max Retry Count'}
                              </label>
                              <select
                                disabled={isReadOnly}
                                value={rule.maxRetries}
                                onChange={(e) => updateSlotRule(name, 'maxRetries', parseInt(e.target.value))}
                                className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-705 dark:text-white focus:outline-none focus:border-blue-500"
                              >
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="5">5</option>
                              </select>
                            </div>

                            <div className="space-y-1.5">
                              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                                {lang === 'ar' ? 'إجراء التجاوز' : 'Escalation Action'}
                              </label>
                              <select
                                disabled={isReadOnly}
                                value={rule.escalationAction}
                                onChange={(e) => updateSlotRule(name, 'escalationAction', e.target.value)}
                                className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-705 dark:text-white focus:outline-none focus:border-blue-500"
                              >
                                <option value="Transfer to Live Agent">Live Agent Transfer</option>
                                <option value="Trigger Bot Fallback">Bot Fallback Dialog</option>
                                <option value="End Session">End Conversation</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Responses */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  {lang === 'ar' ? 'صياغة رد البوت للنية' : 'Intent Fulfillment Responses'}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {lang === 'ar' ? 'صغ الردود الافتراضية. استخدم الأقواس المزدوجة مثل {{order_id}} لإدراج الكيانات المستخرجة.' : 'Formulate localized responses. Reference variables using double brackets, e.g. {{order_id}}.'}
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-bold text-slate-550 dark:text-slate-450 uppercase">English Bot Reply</label>
                    <Badge type="neutral" className="text-[8px] tracking-normal font-mono">EN-US</Badge>
                  </div>
                  <textarea
                    rows={3}
                    disabled={isReadOnly}
                    value={enResponse}
                    onChange={(e) => setEnResponse(e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none rounded-xl text-xs text-slate-800 dark:text-white font-mono"
                    placeholder="e.g. Your request for {{order_id}} is being processed."
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-bold text-slate-550 dark:text-slate-455 uppercase">Arabic Bot Reply</label>
                    <Badge type="neutral" className="text-[8px] tracking-normal font-mono">AR-SA</Badge>
                  </div>
                  <textarea
                    rows={3}
                    disabled={isReadOnly}
                    dir="rtl"
                    value={arResponse}
                    onChange={(e) => setArResponse(e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none rounded-xl text-xs text-slate-800 dark:text-white font-mono"
                    placeholder="مثال: تم استقبال طلبك رقم {{order_id}} وجاري المراجعة."
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Publish */}
          {currentStep === 6 && (
            <div className="space-y-6 max-w-xl mx-auto py-4 text-center">
              <div className="w-16 h-16 bg-blue-600/10 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {lang === 'ar' ? 'مزامنة ونشر نموذج NLU' : 'NLU Compilation & Production Push'}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {lang === 'ar'
                    ? 'سيقوم المعالج بتجميع النية الجديدة مع عبارات التدريب وقواعد الفتحات المرفقة، ثم تنشيطها في سجل NLU المحلي للعميل.'
                    : 'Compile your custom intent setup, validation parameters, and response nodes, publishing directly to the tenant NLU gateway.'}
                </p>
              </div>

              <div className="border border-slate-200 dark:border-slate-850 rounded-2xl bg-slate-50 dark:bg-slate-950/40 p-4 text-start font-mono text-[10px] text-slate-600 dark:text-slate-450 space-y-1">
                <p><span className="text-blue-650 dark:text-blue-400 font-bold">Target Intent:</span> #{intentName.replace(/\s+/g, '_').toLowerCase()}</p>
                <p><span className="text-blue-650 dark:text-blue-400 font-bold">Phrases Count:</span> {phrases.length}</p>
                <p><span className="text-blue-650 dark:text-blue-400 font-bold">Extracted Slots:</span> {selectedEntities.map(s => `@${s}`).join(', ') || 'None'}</p>
                <p><span className="text-blue-650 dark:text-blue-400 font-bold">Active Handlers:</span> dialog-router-v1</p>
              </div>

              <div className="pt-4 flex justify-center">
                {isPublishing ? (
                  <button
                    disabled
                    className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl text-xs flex items-center gap-2"
                  >
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>{lang === 'ar' ? 'تجميع وتحديث البوابة NLU...' : 'Compiling & pushing to Gateway...'}</span>
                  </button>
                ) : (
                  <button
                    onClick={handlePublishClick}
                    disabled={isReadOnly || phrases.length === 0 || !intentName}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-lg shadow-blue-500/20 transition-all"
                  >
                    {lang === 'ar' ? 'نشر إلى نموذج NLU الفعلي' : 'Publish to Production NLU'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <button
            onClick={handleBack}
            disabled={currentStep === 1 || isPublishing}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-100 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs cursor-pointer transition-colors flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
            <span>{lang === 'ar' ? 'السابق' : 'Back'}</span>
          </button>

          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold font-mono">
            {lang === 'ar' ? `خطوة ${currentStep} من 6` : `Step ${currentStep} of 6`}
          </span>

          {currentStep < 6 ? (
            <button
              onClick={handleNext}
              disabled={currentStep === 1 ? !intentName : currentStep === 2 ? phrases.length === 0 : false}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors flex items-center gap-1"
            >
              <span>{lang === 'ar' ? 'التالي' : 'Next'}</span>
              <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          ) : (
            <div className="w-20" /> // Placeholder to keep alignment
          )}
        </div>
      </div>
    </div>
  );
}
