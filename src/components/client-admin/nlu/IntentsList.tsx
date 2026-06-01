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
  const [nluTab, setNluTab] = useState<'intents' | 'entities' | 'slots' | 'governance'>('intents');

  // NLU Governance & Safety States
  const [toxicityThreshold, setToxicityThreshold] = useState(0.85);
  const [piiMaskLevel, setPiiMaskLevel] = useState('full');
  const [forbiddenWords, setForbiddenWords] = useState<string[]>(['spam', 'scam', 'fake', 'احتيال', 'نصب']);
  const [newForbiddenWord, setNewForbiddenWord] = useState('');
  const [safetyTestInput, setSafetyTestInput] = useState('');
  const [safetyTestResult, setSafetyTestResult] = useState<any>(null);
  const [governanceTemplates, setGovernanceTemplates] = useState([
    { id: 't1', intent: 'order_lookup', name: 'Order Success Response', text: 'Hello {{customer_name}}, we found your order {{order_id}} in our database. Shipping status: On the way.' },
    { id: 't2', intent: 'refund_request', name: 'IBAN Verification Response', text: 'Thank you. We have verified your IBAN {{iban}}. Your refund has been scheduled.' }
  ]);
  const [newTemplateIntent, setNewTemplateIntent] = useState('order_lookup');
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateText, setNewTemplateText] = useState('');
  const [governanceActiveVersion, setGovernanceActiveVersion] = useState('v2.1.0-stable');
  const [governanceRollout, setGovernanceRollout] = useState(100);
  const [governanceAuditLogs, setGovernanceAuditLogs] = useState([
    { timestamp: '2026-06-01 10:15:22', user: 'admin_sudhir', action: 'Published NLU Engine version v2.1.0-stable to production tenant.' },
    { timestamp: '2026-06-01 09:42:10', user: 'admin_sudhir', action: 'Added forbidden word "احتيال" to toxicity filter blocklist.' }
  ]);

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

  // NLU Governance actions
  const handleAddForbiddenWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForbiddenWord) return;
    if (forbiddenWords.includes(newForbiddenWord)) return;
    setForbiddenWords(prev => [...prev, newForbiddenWord]);
    setGovernanceAuditLogs(prev => [
      { timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), user: 'admin_sudhir', action: `Added forbidden word "${newForbiddenWord}" to blocklist.` },
      ...prev
    ]);
    addAuditLog(`Added forbidden keyword to toxicity blocklist: "${newForbiddenWord}"`, 'success');
    setNewForbiddenWord('');
  };

  const handleDeleteForbiddenWord = (word: string) => {
    setForbiddenWords(prev => prev.filter(w => w !== word));
    setGovernanceAuditLogs(prev => [
      { timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), user: 'admin_sudhir', action: `Removed forbidden word "${word}" from blocklist.` },
      ...prev
    ]);
    addAuditLog(`Removed forbidden keyword: "${word}"`, 'success');
  };

  const handleTestSafety = (e: React.FormEvent) => {
    e.preventDefault();
    if (!safetyTestInput) return;

    const input = safetyTestInput.toLowerCase();
    const matchedForbidden = forbiddenWords.filter(w => input.includes(w.toLowerCase()));
    
    // check PII leaks
    const matchesEmail = input.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const matchesPhone = input.match(/\b\d{10,15}\b/);
    const matchesIban = input.match(/\bSA\d{22}\b/i);

    let classification: 'pass' | 'blocked' = 'pass';
    let blockReason = '';
    let anonymized = safetyTestInput;

    if (matchedForbidden.length > 0) {
      classification = 'blocked';
      blockReason = `Toxicity/Forbidden keywords detected: [${matchedForbidden.join(', ')}]`;
    } else if (matchesEmail || matchesPhone || matchesIban) {
      classification = 'blocked';
      blockReason = 'Unmasked PII transmission intercepted (Email/Phone/IBAN detected).';
      
      // simulate anonymization
      if (matchesEmail) anonymized = anonymized.replace(matchesEmail[0], '[EMAIL_MASKED]');
      if (matchesPhone) anonymized = anonymized.replace(matchesPhone[0], 'XXXXXX' + matchesPhone[0].slice(-4));
      if (matchesIban) anonymized = anonymized.replace(matchesIban[0], 'SAXXXXXXXXXXXXXXXXXXXX' + matchesIban[0].slice(-4));
    }

    setSafetyTestResult({
      classification,
      blockReason,
      anonymizedText: anonymized,
      testedInput: safetyTestInput
    });
  };

  const handleAddTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName || !newTemplateText) return;
    const newT = {
      id: `t-${Date.now()}`,
      intent: newTemplateIntent,
      name: newTemplateName,
      text: newTemplateText
    };
    setGovernanceTemplates(prev => [...prev, newT]);
    setGovernanceAuditLogs(prev => [
      { timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), user: 'admin_sudhir', action: `Registered response template "${newTemplateName}" for #${newTemplateIntent}.` },
      ...prev
    ]);
    addAuditLog(`Registered NLU response template: ${newTemplateName}`, 'success');
    setNewTemplateName('');
    setNewTemplateText('');
  };

  const handleDeleteTemplate = (id: string, name: string) => {
    setGovernanceTemplates(prev => prev.filter(t => t.id !== id));
    setGovernanceAuditLogs(prev => [
      { timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), user: 'admin_sudhir', action: `Deleted response template "${name}".` },
      ...prev
    ]);
    addAuditLog(`Deleted response template: ${name}`, 'success');
  };

  const handlePublishVersion = (version: string) => {
    setGovernanceActiveVersion(version);
    setGovernanceAuditLogs(prev => [
      { timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), user: 'admin_sudhir', action: `Published active NLU version: ${version}.` },
      ...prev
    ]);
    addAuditLog(`Published NLU version: ${version}`, 'success');
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
              text: `[SUCCESS] Extraction complete for slot @${rule.slotName}.\n- Value: "${userInput}"\n- Rule match: ${rule.successCondition}\n- Dialogue flow state updated.`,
              note: 'Extraction verified'
            }
          ]);
          setSandboxActiveRule(null);
          setSandboxRetriesCount(0);
        } else {
          const nextRetries = sandboxRetriesCount + 1;
          const explanation = rule.slotName === 'order_id' 
            ? `The input '${userInput}' fails the required 8-digit numeric check (Regex: ^\\d{8}$)`
            : `The input '${userInput}' does not match the valid Saudi IBAN pattern SA + 22 digits (Regex: ^SA\\d{22}$)`;

          if (nextRetries >= rule.maxRetries) {
            setSandboxMessages((prev) => [
              ...prev,
              {
                sender: 'bot',
                text: `[ESCALATED] Slot validation threshold breached (${nextRetries} of ${rule.maxRetries} failed attempts).\n\n- Reason: ${explanation}\n- Handoff Action: ${rule.escalationTrigger}\n- Session Lock: Enabled`,
                note: 'Max attempts breached'
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
                text: `[VALIDATION FAILURE - Attempt ${nextRetries} of ${rule.maxRetries}]\n\n- Explanation: ${explanation}\n\n- System Prompt: ${rule.retryPrompt}`,
                note: `Regex failed on value: '${userInput}'`
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
        <button
          onClick={() => setNluTab('governance')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            nluTab === 'governance'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
              : 'hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          {lang === 'ar' ? 'حوكمة وقوانين السلامة' : 'NLU Governance & Safety'}
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

      {/* TAB 4: NLU Governance & Safety Controls */}
      {nluTab === 'governance' && (
        <div className="space-y-6 animate-fade-in text-slate-700 dark:text-slate-350">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Safety & Profanity Controls Section */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Toxicity & PII Controls */}
              <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                  <span>{lang === 'ar' ? 'معايير جدار الحماية للسمية والخصوصية' : 'Toxicity & PII Shield Gateways'}</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  {lang === 'ar' 
                    ? 'قم بضبط حساسية مصنف السمية التلقائي ومستويات إخفاء معلومات الهوية الشخصية (PII).' 
                    : 'Manage active toxicity scoring classifications and PII masking layers to restrict credit card or phone leaks.'}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <label className="font-bold text-slate-650 dark:text-slate-400">{lang === 'ar' ? 'حساسية مصنف السمية' : 'Toxicity Sensitivity Score'}</label>
                      <span className="font-bold text-rose-500 font-mono">{(toxicityThreshold * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.50"
                      max="0.95"
                      step="0.05"
                      value={toxicityThreshold}
                      onChange={(e) => setToxicityThreshold(parseFloat(e.target.value))}
                      className="w-full accent-rose-600 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer h-1.5"
                    />
                    <span className="text-[9px] text-slate-400 block italic leading-relaxed">
                      {lang === 'ar' ? 'أي مدخل عميل يتجاوز هذا النسبة سيتم اعتراضه وتوجيهه لإنهاء الحوار.' : 'Inputs scored above this will trigger containment/fallback.'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-650 dark:text-slate-400">{lang === 'ar' ? 'مستوى قناع الهوية (PII Masking)' : 'PII Leak Protection Level'}</label>
                    <select
                      value={piiMaskLevel}
                      onChange={(e) => setPiiMaskLevel(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none text-xs focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      <option value="full">{lang === 'ar' ? 'تشفير وحظر كامل لجميع الفئات' : 'Strict - Anonymize all and Block Send'}</option>
                      <option value="anonymize">{lang === 'ar' ? 'استبدال القيم بنصوص بديلة (أقنعة)' : 'Medium - Mask values (e.g. [EMAIL_MASKED])'}</option>
                      <option value="none">{lang === 'ar' ? 'تعطيل الحظر (تنبيه فقط)' : 'Log Only - Allow with Warning Audit logs'}</option>
                    </select>
                    <span className="text-[9px] text-slate-400 block italic leading-relaxed">
                      {lang === 'ar' ? 'فئات الكشف: البريد الإلكتروني، الهواتف، الحسابات البنكية (IBAN).' : 'Targets: Saudi National IDs, credit cards, KSA IBANs, and email strings.'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Forbidden Keywords blocklist manager */}
              <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{lang === 'ar' ? 'الكلمات والعبارات المحظورة' : 'Safety Filter Blocklist Words'}</span>
                </h3>

                <form onSubmit={handleAddForbiddenWord} className="flex gap-2 bg-transparent">
                  <input
                    type="text"
                    required
                    placeholder={lang === 'ar' ? "أضف كلمة محظورة (مثال: نصب)" : "Add forbidden word (e.g. scam)"}
                    value={newForbiddenWord}
                    onChange={(e) => setNewForbiddenWord(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-xs focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    {lang === 'ar' ? 'إضافة' : 'Block Word'}
                  </button>
                </form>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {forbiddenWords.map((word) => (
                    <span
                      key={word}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-500/20 rounded-xl text-xs font-mono font-bold"
                    >
                      <span>{word}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteForbiddenWord(word)}
                        className="text-rose-455 hover:text-rose-700 focus:outline-none transition-colors cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {forbiddenWords.length === 0 && (
                    <span className="text-slate-400 italic text-xs">{lang === 'ar' ? 'لا يوجد كلمات في قائمة الحظر حالياً.' : 'No active keywords on the blocklist.'}</span>
                  )}
                </div>
              </div>

              {/* Response Template Governance */}
              <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{lang === 'ar' ? 'قوالب الردود الموحدة للحوكمة' : 'Governance Response Templates'}</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  {lang === 'ar' 
                    ? 'قم بإعداد نصوص موحدة لاستخدامها في إجابات النوايا لضمان الحفاظ على الهوية القانونية للمؤسسة.' 
                    : 'Manage standardized response templates mapped to intents. Dynamically inject slots using double brackets.'}
                </p>

                <form onSubmit={handleAddTemplate} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'النية المستهدفة' : 'Target Intent'}</label>
                      <select
                        value={newTemplateIntent}
                        onChange={(e) => setNewTemplateIntent(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none text-xs"
                      >
                        {intents.map((i) => (
                          <option key={i.id} value={i.name}>#{i.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2 space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'اسم القالب' : 'Template Identifier'}</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Order Tracking Update"
                        value={newTemplateName}
                        onChange={(e) => setNewTemplateName(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'محتوى الرد (Response Content)' : 'Response Content'}</label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Hello {{customer_name}}, tracking is {{shipment_tracking}}..."
                      value={newTemplateText}
                      onChange={(e) => setNewTemplateText(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none text-xs"
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      {lang === 'ar' ? 'تسجيل القالب المعتمد' : 'Register Template'}
                    </button>
                  </div>
                </form>

                <div className="space-y-3 pt-1">
                  {governanceTemplates.map((tpl) => (
                    <div 
                      key={tpl.id}
                      className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl flex justify-between items-start"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-850 dark:text-white">{tpl.name}</span>
                          <span className="text-[9px] font-bold font-mono text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 rounded">
                            #{tpl.intent}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-serif leading-relaxed italic">"{tpl.text}"</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteTemplate(tpl.id, tpl.name)}
                        className="text-slate-400 hover:text-rose-500 transition-colors p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right sidebar: Tenant Distribution Tracker & Safety Test Panel */}
            <div className="space-y-6">
              
              {/* Safety Intercept Tester Sandbox */}
              <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Brain className="w-4.5 h-4.5 text-emerald-500" />
                  <span>{lang === 'ar' ? 'فاحص جدار الحماية (Safety Intercept)' : 'Safety Intercept Sandbox'}</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  {lang === 'ar'
                    ? 'اختبار فوري لعبارات العميل قبل معالجتها من محرك NLU للتأكد من فلاتر الحماية.'
                    : 'Test user statements locally to analyze PII triggers, forbidden lists, and masking outcomes.'}
                </p>

                <form onSubmit={handleTestSafety} className="space-y-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-150 dark:border-slate-850">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-500">{lang === 'ar' ? 'عبارة عميل تجريبية' : 'Test Client input statement'}</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. My email is user@mpaas.com or spam"
                      value={safetyTestInput}
                      onChange={(e) => setSafetyTestInput(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-205 dark:border-slate-850 rounded-xl bg-white dark:bg-slate-900 focus:outline-none text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-1.5 bg-blue-650 hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    {lang === 'ar' ? 'فحص واعتراض القوانين' : 'Analyze Safety Gateway'}
                  </button>
                </form>

                {safetyTestResult && (
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-850 rounded-2xl space-y-3 animate-fade-in text-[10px] font-mono">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">CLASSIFICATION:</span>
                      <span className={`font-bold px-1.5 py-0.5 rounded text-[9px] ${
                        safetyTestResult.classification === 'pass' 
                          ? 'bg-emerald-500/10 text-emerald-500' 
                          : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                      }`}>
                        {safetyTestResult.classification.toUpperCase()}
                      </span>
                    </div>

                    {safetyTestResult.classification === 'blocked' && (
                      <div className="space-y-1">
                        <span className="text-rose-500 font-bold block">BLOCK REASON:</span>
                        <span className="text-slate-650 dark:text-slate-350 block font-sans">{safetyTestResult.blockReason}</span>
                      </div>
                    )}

                    <div className="space-y-1 border-t border-slate-200 dark:border-slate-850 pt-2">
                      <span className="text-slate-400 block">ANONYMIZED OUTPUT SENT TO NLU:</span>
                      <p className="text-[10px] text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-900/50 font-sans whitespace-pre-wrap">
                        {safetyTestResult.anonymizedText}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Tenant Distribution tracker */}
              <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{lang === 'ar' ? 'تتبع توزيع وإصدارات المستأجر' : 'NLU Tenant Deployment'}</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  {lang === 'ar' 
                    ? 'إدارة التوزيع وتوزيع حركة مرور النية على البيئات المختلفة للمستأجر.' 
                    : 'Manage NLU activations, monitor rollout split, and rollback to older model states.'}
                </p>

                <div className="space-y-3 pt-1 text-[11px]">
                  <div className="flex justify-between border-b border-slate-50 dark:border-slate-850 pb-1.5">
                    <span className="text-slate-400">ACTIVE ENGINE VERSION:</span>
                    <span className="font-mono font-bold text-emerald-500">{governanceActiveVersion}</span>
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">{lang === 'ar' ? 'توزيع حركة المرور للمستأجر (A/B)' : 'Split Traffic Assignment'}</label>
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-blue-500">Variant A: {governanceRollout}%</span>
                      <span className="text-slate-400 font-bold">Variant B: {100 - governanceRollout}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="10"
                      value={governanceRollout}
                      onChange={(e) => setGovernanceRollout(parseInt(e.target.value))}
                      className="w-full accent-blue-650 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer h-1"
                    />
                  </div>

                  <div className="pt-2.5 space-y-2">
                    <span className="text-[10px] font-bold text-slate-505 block uppercase">{lang === 'ar' ? 'إجراءات النشر والحوكمة' : 'Deploy Control Panel'}</span>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <button
                        type="button"
                        disabled={governanceActiveVersion === 'v2.2.0-rc-1'}
                        onClick={() => handlePublishVersion('v2.2.0-rc-1')}
                        className="py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors cursor-pointer text-[10px] disabled:opacity-50"
                      >
                        {lang === 'ar' ? 'نشر v2.2.0-rc-1' : 'Publish RC'}
                      </button>
                      <button
                        type="button"
                        disabled={governanceActiveVersion === 'v2.0.4-stable'}
                        onClick={() => handlePublishVersion('v2.0.4-stable')}
                        className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 font-bold rounded-lg transition-colors cursor-pointer text-[10px] disabled:opacity-50"
                      >
                        {lang === 'ar' ? 'تراجع لـ v2.0.4' : 'Rollback Stable'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Governance Audit Log Console */}
              <div className="bg-slate-100/50 dark:bg-slate-900/40 p-4 border border-slate-200 dark:border-slate-850 rounded-2xl space-y-3">
                <h4 className="font-bold text-[10px] uppercase font-mono tracking-wide text-slate-500">{lang === 'ar' ? 'سجل حوكمة الأمان والانتشار' : 'Governance Audit Log'}</h4>
                
                <div className="space-y-2.5 max-h-40 overflow-y-auto font-mono text-[9px] leading-relaxed">
                  {governanceAuditLogs.map((log, index) => (
                    <div key={index} className="space-y-0.5 border-b border-slate-200 dark:border-slate-850 pb-1.5 last:border-b-0">
                      <div className="flex justify-between text-slate-400">
                        <span>{log.timestamp}</span>
                        <span className="text-slate-500 font-bold font-mono">@{log.user}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-350">{log.action}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
