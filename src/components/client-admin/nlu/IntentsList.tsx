'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Intent, Slot } from '@/types';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { translations } from '@/i18n/translations';
import { 
  HelpCircle, 
  Plus, 
  Trash2, 
  Play, 
  Check, 
  Code, 
  Sliders, 
  Brain, 
  Database,
  ArrowRight,
  RefreshCw,
  Info,
  ShieldAlert,
  ArrowRightLeft
} from 'lucide-react';

export function IntentsList() {
  const { lang, intents, setIntents, addAuditLog } = useApp();
  const t = translations[lang];

  // NLU Tab state
  const [nluTab, setNluTab] = useState<'intents' | 'entities' | 'slots'>('intents');

  // INTENT STATES
  const [editingIntentId, setEditingIntentId] = useState<string | null>(null);
  const [newUtterance, setNewUtterance] = useState('');
  const [promotionMessage, setPromotionMessage] = useState('');
  const [promotingSuggestionName, setPromotingSuggestionName] = useState<string | null>(null);
  const [suggestedIntents, setSuggestedIntents] = useState([
    { name: 'change_shipping_address', count: 142, phrase: 'Send my package to another address' },
    { name: 'promo_code_issue', count: 88, phrase: 'Coupon code not working on checkout' }
  ]);

  // ENTITY CATALOG STATES
  const [entityCatalog, setEntityCatalog] = useState([
    { name: 'order_id', regex: '^\\d{8}$', languages: ['English', 'Arabic'], samples: '48102948, 59201948', required: true },
    { name: 'customer_name', regex: '^[a-zA-Z\\s]{3,30}$', languages: ['English'], samples: 'Sara Al-Najjar, Nadia Vance', required: true },
    { name: 'phone_number', regex: '^\\+?\\d{10,15}$', languages: ['English', 'Arabic'], samples: '+966501234567, 0501234567', required: false },
    { name: 'iban', regex: '^SA\\d{22}$', languages: ['English', 'Arabic'], samples: 'SA8010000000001234567890', required: false },
    { name: 'shipment_tracking', regex: '^TRK\\d{10}$', languages: ['English'], samples: 'TRK9810293048, TRK1029485069', required: true },
    { name: 'invoice_number', regex: '^INV-\\d{6}$', languages: ['English', 'Arabic'], samples: 'INV-102948, INV-592019', required: false }
  ]);
  const [newEntityName, setNewEntityName] = useState('');
  const [newEntityRegex, setNewEntityRegex] = useState('');
  const [newEntityLanguages, setNewEntityLanguages] = useState<string[]>(['English', 'Arabic']);
  const [newEntitySamples, setNewEntitySamples] = useState('');
  const [newEntityRequired, setNewEntityRequired] = useState(false);

  // SLOT VALIDATION RULES STATES
  const [slotRules, setSlotRules] = useState([
    {
      intent: 'order_lookup',
      slotName: 'order_id',
      prompt: 'Please provide your 8-digit numeric Order ID.',
      retryPrompt: 'That order ID format is incorrect. It must be exactly 8 digits. Please try again.',
      maxRetries: 3,
      escalationTrigger: 'Route to Level-2 billing team queue',
      successCondition: 'Matched Order RegEx ^\\d{8}$'
    },
    {
      intent: 'refund_request',
      slotName: 'iban',
      prompt: 'Please enter your IBAN starting with SA followed by 22 digits.',
      retryPrompt: 'The IBAN entered is invalid. Make sure it starts with SA and contains 24 characters in total.',
      maxRetries: 2,
      escalationTrigger: 'Lock session & notify supervisor',
      successCondition: 'Valid KSA IBAN verified'
    }
  ]);

  // Form states for slot rule
  const [selectedIntent, setSelectedIntent] = useState('order_lookup');
  const [ruleSlotName, setRuleSlotName] = useState('order_id');
  const [rulePrompt, setRulePrompt] = useState('Please provide your 8-digit numeric Order ID.');
  const [ruleRetryPrompt, setRuleRetryPrompt] = useState('That order ID format is incorrect. It must be exactly 8 digits. Please try again.');
  const [ruleMaxRetries, setRuleMaxRetries] = useState(3);
  const [ruleEscalation, setRuleEscalation] = useState('Route to Level-2 billing team queue');
  const [ruleSuccess, setRuleSuccess] = useState('Matched Order RegEx ^\\d{8}$');

  // Conversational Slot Sandbox Simulator States
  const [sandboxMessages, setSandboxMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string; note?: string }>>([
    { sender: 'bot', text: lang === 'ar' ? 'تم تنشيط محاكاة معالجة الفتحات! اكتب "ابحث عن طلبي" أو "طلب استرجاع" لبدء تجربة مطابقة القواعد.' : 'Slot Filling Sandbox Activated! Type "I want to search my order" or "Initiate refund" to test slot validation rules.' }
  ]);
  const [sandboxInput, setSandboxInput] = useState('');
  const [sandboxActiveRule, setSandboxActiveRule] = useState<any | null>(null);
  const [sandboxRetriesCount, setSandboxRetriesCount] = useState(0);

  useEffect(() => {
    if (!promotionMessage) return;
    const timer = setTimeout(() => setPromotionMessage(''), 2400);
    return () => clearTimeout(timer);
  }, [promotionMessage]);

  const handleAddUtterance = (intentId: string) => {
    if (!newUtterance) return;
    setIntents((prev) =>
      prev.map((i) => {
        if (i.id === intentId) {
          return {
            ...i,
            utterances: [...i.utterances, newUtterance]
          };
        }
        return i;
      })
    );
    addAuditLog(`Added utterance to intent ${intentId}: "${newUtterance}"`, 'success');
    setNewUtterance('');
  };

  const handlePromoteSuggestion = (sug: { name: string; count: number; phrase: string }) => {
    if (promotingSuggestionName) return;

    const existingIntent = intents.some((intent) => intent.name === sug.name);
    if (existingIntent) {
      setPromotionMessage(`Intent #${sug.name} already exists.`);
      return;
    }

    setPromotingSuggestionName(sug.name);

    const promotedIntent: Intent = {
      id: `int-${Date.now()}`,
      name: sug.name,
      utterances: [sug.phrase],
      slots: [],
      confidenceThreshold: 0.85,
      fulfillmentType: 'text',
      fulfillmentValue: 'Action placeholder config.',
      status: 'active',
      hitCount: sug.count
    };

    window.setTimeout(() => {
      setIntents((prev) => [...prev, promotedIntent]);
      setSuggestedIntents((prev) => prev.filter((item) => item.name !== sug.name));
      addAuditLog(`Approved suggested intent: ${sug.name}`, 'success');
      setPromotionMessage(`Promoted #${sug.name} to active intents.`);
      setPromotingSuggestionName(null);
    }, 220);
  };

  // Entity catalog actions
  const handleAddEntity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntityName || !newEntityRegex) return;
    setEntityCatalog((prev) => [
      ...prev,
      {
        name: newEntityName,
        regex: newEntityRegex,
        languages: newEntityLanguages,
        samples: newEntitySamples || 'N/A',
        required: newEntityRequired
      }
    ]);
    addAuditLog(`Defined new custom NLU entity catalog: @${newEntityName}`, 'success');
    setNewEntityName('');
    setNewEntityRegex('');
    setNewEntitySamples('');
    setNewEntityRequired(false);
  };

  const handleDeleteEntity = (name: string) => {
    setEntityCatalog((prev) => prev.filter((e) => e.name !== name));
    addAuditLog(`Deleted entity catalog entry: @${name}`, 'success');
  };

  // Slot rule actions
  const handleAddSlotRule = (e: React.FormEvent) => {
    e.preventDefault();
    setSlotRules((prev) => [
      ...prev,
      {
        intent: selectedIntent,
        slotName: ruleSlotName,
        prompt: rulePrompt,
        retryPrompt: ruleRetryPrompt,
        maxRetries: ruleMaxRetries,
        escalationTrigger: ruleEscalation,
        successCondition: ruleSuccess
      }
    ]);
    addAuditLog(`Configured slot validation rule for #${selectedIntent}.${ruleSlotName}`, 'success');
  };

  const handleDeleteSlotRule = (intent: string, slotName: string) => {
    setSlotRules((prev) => prev.filter((r) => !(r.intent === intent && r.slotName === slotName)));
    addAuditLog(`Removed slot validation rule for #${intent}.${slotName}`, 'success');
  };

  // Sandbox simulation execution
  const handleRunSandbox = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sandboxInput) return;

    const userInput = sandboxInput;
    setSandboxMessages((prev) => [...prev, { sender: 'user', text: userInput }]);
    setSandboxInput('');

    setTimeout(() => {
      const lower = userInput.toLowerCase();

      // Case 1: No active slot rule parsing is running
      if (!sandboxActiveRule) {
        if (lower.includes('order') || lower.includes('search') || lower.includes('طلب') || lower.includes('ابحث')) {
          const rule = slotRules.find((r) => r.intent === 'order_lookup') || slotRules[0];
          setSandboxActiveRule(rule);
          setSandboxRetriesCount(0);
          setSandboxMessages((prev) => [
            ...prev,
            {
              sender: 'bot',
              text: `[Intent: #order_lookup | Required Slot: @${rule.slotName}]\n${rule.prompt}`,
              note: 'Prompting for slot parameter'
            }
          ]);
        } else if (lower.includes('refund') || lower.includes('iban') || lower.includes('استرجاع') || lower.includes('استرداد')) {
          const rule = slotRules.find((r) => r.intent === 'refund_request') || slotRules[1];
          setSandboxActiveRule(rule);
          setSandboxRetriesCount(0);
          setSandboxMessages((prev) => [
            ...prev,
            {
              sender: 'bot',
              text: `[Intent: #refund_request | Required Slot: @${rule.slotName}]\n${rule.prompt}`,
              note: 'Prompting for slot parameter'
            }
          ]);
        } else {
          setSandboxMessages((prev) => [
            ...prev,
            {
              sender: 'bot',
              text: lang === 'ar' 
                ? 'لم يتم تشغيل المطابقة. جرب كتابة "ابحث عن طلبي" لبدء اختبار الفتحات.' 
                : 'No slot-filling rules triggered. Try typing "I want to search my order" to activate rule validation.'
            }
          ]);
        }
      } else {
        // Case 2: Active slot extraction validation is running
        const rule = sandboxActiveRule;
        let isMatch = false;

        if (rule.slotName === 'order_id') {
          // regex matches exactly 8 digits
          isMatch = /^\d{8}$/.test(userInput.trim());
        } else if (rule.slotName === 'iban') {
          // starts with SA and 22 digits
          isMatch = /^SA\d{22}$/.test(userInput.trim());
        } else {
          isMatch = userInput.trim().length > 3;
        }

        if (isMatch) {
          setSandboxMessages((prev) => [
            ...prev,
            {
              sender: 'bot',
              text: `[SUCCESS] Slot "@${rule.slotName}" extracted successfully.\nValue: "${userInput}"\nCondition: ${rule.successCondition}\nSlot filling complete. Proceeding to dialogue flow step.`,
              note: 'Extraction matched RegEx'
            }
          ]);
          setSandboxActiveRule(null);
          setSandboxRetriesCount(0);
        } else {
          const nextRetries = sandboxRetriesCount + 1;
          if (nextRetries >= rule.maxRetries) {
            setSandboxMessages((prev) => [
              ...prev,
              {
                sender: 'bot',
                text: `[RETRIES EXHAUSTED] Validation failed ${nextRetries} times. Triggering escalation rules.\nEnforcement: ${rule.escalationTrigger}`,
                note: 'Max retries exhausted'
              }
            ]);
            setSandboxActiveRule(null);
            setSandboxRetriesCount(0);
          } else {
            setSandboxRetriesCount(nextRetries);
            setSandboxMessages((prev) => [
              ...prev,
              {
                sender: 'bot',
                text: `[VALIDATION FAILURE (Attempt ${nextRetries}/${rule.maxRetries})]\n${rule.retryPrompt}`,
                note: 'Regex match mismatch'
              }
            ]);
          }
        }
      }
    }, 600);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t.clientAdmin.intents.title}
        description={t.clientAdmin.intents.description}
      />

      {/* Navigation Switchers */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setNluTab('intents')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            nluTab === 'intents'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
              : 'hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          {lang === 'ar' ? 'النوايا والاستكشاف' : 'Intents & Discovery'}
        </button>
        <button
          onClick={() => setNluTab('entities')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            nluTab === 'entities'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
              : 'hover:bg-slate-100 dark:hover:bg-slate-855 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          {lang === 'ar' ? 'فهرس الكيانات (Entities)' : 'Entity Catalog'}
        </button>
        <button
          onClick={() => setNluTab('slots')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            nluTab === 'slots'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
              : 'hover:bg-slate-100 dark:hover:bg-slate-855 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          {lang === 'ar' ? 'قواعد وتصديق الفتحات (Slots)' : 'Slot Validation Rules'}
        </button>
      </div>

      {/* TAB 1: INTENTS & Discovery */}
      {nluTab === 'intents' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Left list */}
          <div className="lg:col-span-2 space-y-4">
            {intents.map((intent) => (
              <div
                key={intent.id}
                className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white font-mono">#{intent.name}</h3>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                      Fulfillment:{' '}
                      <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">
                        {intent.fulfillmentType} ({intent.fulfillmentValue})
                      </span>
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-bold font-mono">
                    Hits: {intent.hitCount}
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono block">
                    {t.clientAdmin.intents.trainingPhrases}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {intent.utterances.map((utt, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg text-[11px] text-slate-600 dark:text-slate-350"
                      >
                        "{utt}"
                      </span>
                    ))}
                    {editingIntentId === intent.id ? (
                      <div className="flex gap-1.5 mt-1.5 w-full">
                        <input
                          type="text"
                          placeholder={t.clientAdmin.intents.addPhrasePlaceholder}
                          value={newUtterance}
                          onChange={(e) => setNewUtterance(e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-xs focus:outline-none text-slate-800 dark:text-slate-150"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddUtterance(intent.id);
                          }}
                        />
                        <button
                          onClick={() => handleAddUtterance(intent.id)}
                          className="px-3 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700"
                        >
                          {t.clientAdmin.intents.addButton}
                        </button>
                        <button
                          onClick={() => setEditingIntentId(null)}
                          className="px-2 py-1 text-xs border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg text-slate-600 dark:text-slate-400"
                        >
                          {t.clientAdmin.intents.closeButton}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingIntentId(intent.id)}
                        className="px-2 py-1 border border-dashed border-slate-300 dark:border-slate-750 text-slate-450 hover:text-slate-650 dark:hover:text-slate-300 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        {t.clientAdmin.intents.addPhraseButton}
                      </button>
                    )}
                  </div>
                </div>

                {intent.slots.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono block">
                      {t.clientAdmin.intents.entitySlots}
                    </span>
                    <div className="space-y-1.5">
                      {intent.slots.map((slot, i) => (
                        <div
                          key={i}
                          className="flex items-start justify-between text-xs p-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl"
                        >
                          <div>
                            <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">@{slot.name}</span>
                            <span className="text-slate-450 text-[10px] ml-1.5">({slot.type})</span>
                            <p className="text-[10px] text-slate-500 mt-1 font-normal italic">Prompt: "{slot.prompt}"</p>
                          </div>
                          {slot.required && (
                            <span className="text-[9px] uppercase font-bold text-rose-500 font-mono">
                              {t.clientAdmin.intents.required}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Suggested Intents Drawer */}
          <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-850 h-fit space-y-4">
            <h3 className="font-bold text-xs text-slate-650 dark:text-slate-400 uppercase font-mono tracking-wider">
              {t.clientAdmin.intents.aiDiscoveryTitle}
            </h3>
            <p className="text-xs text-slate-500">{t.clientAdmin.intents.aiDiscoveryDesc}</p>

            {promotionMessage && (
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 animate-fade-in">
                {promotionMessage}
              </div>
            )}
            
            <div className="space-y-3 pt-2">
              {suggestedIntents.map((sug) => {
                const isPromoting = promotingSuggestionName === sug.name;
                const isAlreadyAdded = intents.some((intent) => intent.name === sug.name);
                const isDisabled = isPromoting || isAlreadyAdded;

                return (
                  <div
                    key={sug.name}
                    className={`bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-3.5 space-y-2 shadow-sm transition-all duration-200 ${
                      isPromoting ? 'opacity-0 -translate-y-1 scale-95 pointer-events-none' : 'opacity-100'
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800 dark:text-white font-mono">#{sug.name}</span>
                      <div className="flex items-center gap-1.5">
                        {isAlreadyAdded && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                            <span aria-hidden="true">✓</span>
                            {t.clientAdmin.intents.alreadyAdded}
                          </span>
                        )}
                        <span className="font-mono text-slate-400 font-bold">{sug.count} hits</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400">Sample: "{sug.phrase}"</p>
                    <button
                      type="button"
                      disabled={isDisabled}
                      onClick={() => handlePromoteSuggestion(sug)}
                      className={`w-full py-1 text-[10px] font-bold rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer ${
                        isAlreadyAdded
                          ? 'bg-emerald-600 text-white cursor-not-allowed opacity-75'
                          : 'bg-blue-600 hover:bg-blue-700 text-white disabled:cursor-not-allowed disabled:opacity-60'
                      }`}
                    >
                      {isPromoting
                        ? t.clientAdmin.intents.promoting
                        : isAlreadyAdded
                        ? t.clientAdmin.intents.alreadyAdded
                        : t.clientAdmin.intents.promoteToIntent}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Entity Catalog */}
      {nluTab === 'entities' && (
        <div className="space-y-6 animate-fade-in">
          {/* Add form */}
          <form onSubmit={handleAddEntity} className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-slate-50 dark:bg-slate-950 p-4 border border-slate-150 dark:border-slate-850 rounded-2xl">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'اسم الكيان' : 'Entity Key Name'}</label>
              <input
                type="text"
                required
                placeholder="e.g. shipment_tracking"
                value={newEntityName}
                onChange={(e) => setNewEntityName(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="block text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'تعبير التحقق المطابق (RegEx)' : 'Validation Regular Expression'}</label>
              <input
                type="text"
                required
                placeholder="e.g. ^TRK\d{10}$"
                value={newEntityRegex}
                onChange={(e) => setNewEntityRegex(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'أمثلة للقيم' : 'Sample Phrases / Values'}</label>
              <input
                type="text"
                placeholder="e.g. TRK4810294029"
                value={newEntitySamples}
                onChange={(e) => setNewEntitySamples(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none"
              />
            </div>

            <div className="flex items-end justify-end">
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-[10px] cursor-pointer"
              >
                {lang === 'ar' ? 'إدراج بالكتالوج' : 'Add Entity'}
              </button>
            </div>
          </form>

          {/* Catalog Listing */}
          <div className="overflow-x-auto border border-slate-150 dark:border-slate-850 rounded-2xl">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-150 dark:border-slate-850 text-slate-400 font-bold uppercase text-[9px] font-mono">
                  <th className="p-3.5 text-start">{lang === 'ar' ? 'الرمز والاسم' : 'Entity Type'}</th>
                  <th className="p-3.5 text-start">{lang === 'ar' ? 'تعبير الكشف المطابق' : 'Validation RegEx'}</th>
                  <th className="p-3.5 text-start">{lang === 'ar' ? 'اللغات المدعومة' : 'Language Scope'}</th>
                  <th className="p-3.5 text-start">{lang === 'ar' ? 'أمثلة مطابقة' : 'Sample values'}</th>
                  <th className="p-3.5 text-center">{lang === 'ar' ? 'إجراء' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850/50">
                {entityCatalog.map((entity) => (
                  <tr key={entity.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                    <td className="p-3.5 font-bold text-blue-600 dark:text-blue-400 font-mono">@{entity.name}</td>
                    <td className="p-3.5 font-mono text-slate-500 max-w-48 truncate" title={entity.regex}>{entity.regex}</td>
                    <td className="p-3.5 flex gap-1.5 flex-wrap">
                      {entity.languages.map((l) => (
                        <span key={l} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-[8px] uppercase font-bold tracking-wide text-slate-400">
                          {l}
                        </span>
                      ))}
                    </td>
                    <td className="p-3.5 font-mono text-slate-450 truncate max-w-44" title={entity.samples}>{entity.samples}</td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleDeleteEntity(entity.name)}
                        className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Slot Validation Rules */}
      {nluTab === 'slots' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Rule Builder Panel */}
            <div className="xl:col-span-2 space-y-4">
              
              <form onSubmit={handleAddSlotRule} className="bg-slate-50 dark:bg-slate-950 p-5 border border-slate-150 dark:border-slate-850 rounded-3xl space-y-4">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sliders className="w-4.5 h-4.5 text-blue-500" />
                  <span>{lang === 'ar' ? 'معالج بناء قواعد الفتحات' : 'Slot Validation Builder'}</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'النية المستهدفة' : 'Target Dialogue Intent'}</label>
                    <select
                      value={selectedIntent}
                      onChange={(e) => setSelectedIntent(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none"
                    >
                      {intents.map((i) => (
                        <option key={i.id} value={i.name}>#{i.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'الفتحة المراد ملؤها' : 'Target Slot Variable'}</label>
                    <select
                      value={ruleSlotName}
                      onChange={(e) => setRuleSlotName(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none"
                    >
                      {entityCatalog.map((e) => (
                        <option key={e.name} value={e.name}>@{e.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'رسالة حث الاستخلاص (Prompt)' : 'Required Slot extraction Prompt'}</label>
                  <input
                    type="text"
                    required
                    value={rulePrompt}
                    onChange={(e) => setRulePrompt(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'رسالة الفشل والمحاولة الثانية' : 'Validation Failure Retry Prompt'}</label>
                  <input
                    type="text"
                    required
                    value={ruleRetryPrompt}
                    onChange={(e) => setRuleRetryPrompt(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'الحد الأقصى للمحاولات' : 'Maximum retry attempts'}</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      required
                      value={ruleMaxRetries}
                      onChange={(e) => setRuleMaxRetries(parseInt(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'توجيه التصعيد عند الفشل' : 'Failure Escalation Target'}</label>
                    <input
                      type="text"
                      required
                      value={ruleEscalation}
                      onChange={(e) => setRuleEscalation(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-[10px] cursor-pointer"
                  >
                    {lang === 'ar' ? 'حفظ وتفعيل القاعدة' : 'Publish slot rule'}
                  </button>
                </div>
              </form>

              {/* Rules Catalog List */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">{lang === 'ar' ? 'قواعد مطابقة الفتحات المفعلة' : 'Active Conversational Slot extraction Rules'}</h4>
                
                {slotRules.map((rule) => (
                  <div 
                    key={`${rule.intent}-${rule.slotName}`} 
                    className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex justify-between items-start"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-850 dark:text-white font-mono">#{rule.intent}</span>
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold font-mono">@{rule.slotName}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">Prompt: "{rule.prompt}"</p>
                      <p className="text-[10px] text-slate-400 italic">Retry prompt: "{rule.retryPrompt}"</p>
                      <div className="flex gap-4 flex-wrap text-[9px] font-bold font-mono text-slate-450 mt-1">
                        <span>MAX RETRIES: {rule.maxRetries}</span>
                        <span className="text-rose-500">ESCALATION: {rule.escalationTrigger}</span>
                        <span className="text-emerald-500">SUCCESS COND: {rule.successCondition}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteSlotRule(rule.intent, rule.slotName)}
                      className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                ))}
              </div>

            </div>

            {/* Simulator Sandbox */}
            <div className="bg-slate-50 dark:bg-slate-950 p-5 border border-slate-200 dark:border-slate-850 rounded-3xl h-[560px] flex flex-col justify-between overflow-hidden">
              <div className="space-y-1 pb-3 border-b border-slate-150 dark:border-slate-905">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-emerald-500" />
                  <span>{lang === 'ar' ? 'صندوق محاكاة ملء الفتحات' : 'Conversational Slot Sandbox'}</span>
                </h4>
                <p className="text-[10px] text-slate-450">{lang === 'ar' ? 'محاكاة لتدفقات ملء فتحات NLU والتحقق الفوري.' : 'Interactive playground to debug retry loops and regex matchers locally.'}</p>
              </div>

              {/* Chat screen */}
              <div className="flex-1 overflow-y-auto py-3 space-y-3">
                {sandboxMessages.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`p-3 rounded-2xl max-w-[85%] text-[11px] font-semibold leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 text-slate-800 dark:text-slate-100 rounded-bl-none'
                    }`}>
                      {msg.text.split('\n').map((l, idx) => (
                        <p key={idx}>{l}</p>
                      ))}
                      {msg.note && (
                        <span className="block mt-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-[8px] font-bold font-mono text-slate-400 uppercase">
                          DIAGNOSTIC: {msg.note}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {sandboxActiveRule && (
                  <div className="text-[9px] font-bold text-blue-500 font-mono flex items-center gap-1 animate-pulse">
                    <Info className="w-3.5 h-3.5" />
                    <span>EXTRACTING SLOT @{sandboxActiveRule.slotName}... (ATTEMPT {sandboxRetriesCount}/{sandboxActiveRule.maxRetries})</span>
                  </div>
                )}
              </div>

              {/* Sandbox input */}
              <form onSubmit={handleRunSandbox} className="pt-3 border-t border-slate-150 dark:border-slate-905 flex gap-2 bg-transparent">
                <input
                  type="text"
                  placeholder={
                    sandboxActiveRule 
                      ? `Enter ${sandboxActiveRule.slotName} value...` 
                      : 'Type: "I want to track my order"'
                  }
                  value={sandboxInput}
                  onChange={(e) => setSandboxInput(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none"
                />
                <button 
                  type="submit" 
                  className="px-3 py-2 bg-blue-600 text-white rounded-xl"
                >
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </form>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
