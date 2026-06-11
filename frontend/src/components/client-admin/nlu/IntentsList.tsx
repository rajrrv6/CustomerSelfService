'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Intent } from '@/types';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { translations } from '@/i18n/translations';

// Import subcomponents
import { IntentsTable } from './IntentsTable';
import { SuggestedIntentsDrawer } from './SuggestedIntentsDrawer';
import { EntityTypesPanel } from './EntityTypesPanel';
import { SlotValidationSandbox } from './SlotValidationSandbox';
import { NluSafetyGovernance } from './NluSafetyGovernance';

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
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setNluTab('intents')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            nluTab === 'intents'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
              : 'hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          {lang === 'ar' ? 'النوايا والاستكشاف' : 'Intents & Discovery'}
        </button>
        <button
          onClick={() => setNluTab('entities')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            nluTab === 'entities'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
              : 'hover:bg-slate-100 dark:hover:bg-slate-855 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          {lang === 'ar' ? 'فهرس الكيانات (Entities)' : 'Entity Catalog'}
        </button>
        <button
          onClick={() => setNluTab('slots')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            nluTab === 'slots'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
              : 'hover:bg-slate-100 dark:hover:bg-slate-855 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          {lang === 'ar' ? 'قواعد وتصديق الفتحات (Slots)' : 'Slot Validation Rules'}
        </button>
        <button
          onClick={() => setNluTab('governance')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
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
            <IntentsTable
              intents={intents}
              lang={lang}
              t={t}
              editingIntentId={editingIntentId}
              setEditingIntentId={setEditingIntentId}
              newUtterance={newUtterance}
              setNewUtterance={setNewUtterance}
              onAddUtterance={handleAddUtterance}
            />
          </div>

          {/* Suggested Intents Drawer */}
          <SuggestedIntentsDrawer
            lang={lang}
            t={t}
            intents={intents}
            suggestedIntents={suggestedIntents}
            promotionMessage={promotionMessage}
            promotingSuggestionName={promotingSuggestionName}
            onPromoteSuggestion={handlePromoteSuggestion}
          />
        </div>
      )}

      {/* TAB 2: Entity Catalog */}
      {nluTab === 'entities' && (
        <EntityTypesPanel
          lang={lang}
          entityCatalog={entityCatalog}
          newEntityName={newEntityName}
          setNewEntityName={setNewEntityName}
          newEntityRegex={newEntityRegex}
          setNewEntityRegex={setNewEntityRegex}
          newEntitySamples={newEntitySamples}
          setNewEntitySamples={setNewEntitySamples}
          newEntityLanguages={newEntityLanguages}
          setNewEntityLanguages={setNewEntityLanguages}
          newEntityRequired={newEntityRequired}
          setNewEntityRequired={setNewEntityRequired}
          onAddEntity={handleAddEntity}
          onDeleteEntity={handleDeleteEntity}
        />
      )}

      {/* TAB 3: Slot Validation Rules */}
      {nluTab === 'slots' && (
        <SlotValidationSandbox
          lang={lang}
          intents={intents}
          entityCatalog={entityCatalog}
          slotRules={slotRules}
          selectedIntent={selectedIntent}
          setSelectedIntent={setSelectedIntent}
          ruleSlotName={ruleSlotName}
          setRuleSlotName={setRuleSlotName}
          rulePrompt={rulePrompt}
          setRulePrompt={setRulePrompt}
          ruleRetryPrompt={ruleRetryPrompt}
          setRuleRetryPrompt={setRuleRetryPrompt}
          ruleMaxRetries={ruleMaxRetries}
          setRuleMaxRetries={setRuleMaxRetries}
          ruleEscalation={ruleEscalation}
          setRuleEscalation={setRuleEscalation}
          ruleSuccess={ruleSuccess}
          setRuleSuccess={setRuleSuccess}
          sandboxMessages={sandboxMessages}
          sandboxInput={sandboxInput}
          setSandboxInput={setSandboxInput}
          sandboxActiveRule={sandboxActiveRule}
          sandboxRetriesCount={sandboxRetriesCount}
          onAddSlotRule={handleAddSlotRule}
          onDeleteSlotRule={handleDeleteSlotRule}
          onRunSandbox={handleRunSandbox}
        />
      )}

      {/* TAB 4: NLU Governance & Safety Controls */}
      {nluTab === 'governance' && (
        <NluSafetyGovernance
          lang={lang}
          t={t}
          intents={intents}
          toxicityThreshold={toxicityThreshold}
          setToxicityThreshold={setToxicityThreshold}
          piiMaskLevel={piiMaskLevel}
          setPiiMaskLevel={setPiiMaskLevel}
          forbiddenWords={forbiddenWords}
          newForbiddenWord={newForbiddenWord}
          setNewForbiddenWord={setNewForbiddenWord}
          onAddForbiddenWord={handleAddForbiddenWord}
          onDeleteForbiddenWord={handleDeleteForbiddenWord}
          governanceTemplates={governanceTemplates}
          newTemplateIntent={newTemplateIntent}
          setNewTemplateIntent={setNewTemplateIntent}
          newTemplateName={newTemplateName}
          setNewTemplateName={setNewTemplateName}
          newTemplateText={newTemplateText}
          setNewTemplateText={setNewTemplateText}
          onAddTemplate={handleAddTemplate}
          onDeleteTemplate={handleDeleteTemplate}
          safetyTestInput={safetyTestInput}
          setSafetyTestInput={setSafetyTestInput}
          safetyTestResult={safetyTestResult}
          onTestSafety={handleTestSafety}
          governanceActiveVersion={governanceActiveVersion}
          governanceRollout={governanceRollout}
          setGovernanceRollout={setGovernanceRollout}
          onPublishVersion={handlePublishVersion}
          governanceAuditLogs={governanceAuditLogs}
        />
      )}
    </div>
  );
}
