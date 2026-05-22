'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Intent } from '@/types';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { translations } from '@/i18n/translations';

export function IntentsList() {
  const { lang, intents, setIntents, addAuditLog } = useApp();
  const t = translations[lang];

  // Intent states
  const [editingIntentId, setEditingIntentId] = useState<string | null>(null);
  const [newUtterance, setNewUtterance] = useState('');
  const [promotionMessage, setPromotionMessage] = useState('');
  const [promotingSuggestionName, setPromotingSuggestionName] = useState<string | null>(null);

  const [suggestedIntents, setSuggestedIntents] = useState([
    { name: 'change_shipping_address', count: 142, phrase: 'Send my package to another address' },
    { name: 'promo_code_issue', count: 88, phrase: 'Coupon code not working on checkout' }
  ]);

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

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t.clientAdmin.intents.title}
        description={t.clientAdmin.intents.description}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                        className="flex-1 px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-xs focus:outline-none text-slate-800 dark:text-slate-155"
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
                        className="px-2 py-1 text-xs border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400"
                      >
                        {t.clientAdmin.intents.closeButton}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingIntentId(intent.id)}
                      className="px-2 py-1 border border-dashed border-slate-300 dark:border-slate-700 text-slate-450 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg text-[11px] font-semibold transition-colors"
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
        <div className="bg-slate-150/40 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-850 h-fit space-y-4">
          <h3 className="font-bold text-xs text-slate-650 dark:text-slate-400 uppercase font-mono tracking-wider">
            {t.clientAdmin.intents.aiDiscoveryTitle}
          </h3>
          <p className="text-xs text-slate-500">{t.clientAdmin.intents.aiDiscoveryDesc}</p>

          {promotionMessage && (
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
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
                    className={`w-full py-1 text-[10px] font-bold rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      isAlreadyAdded
                        ? 'bg-emerald-600 text-white cursor-not-allowed opacity-75'
                        : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-60'
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
    </div>
  );
}
