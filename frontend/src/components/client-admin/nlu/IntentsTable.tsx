'use client';

import React from 'react';
import { Intent } from '@/types';

interface IntentsTableProps {
  intents: Intent[];
  lang: 'en' | 'ar';
  t: any;
  editingIntentId: string | null;
  setEditingIntentId: (id: string | null) => void;
  newUtterance: string;
  setNewUtterance: (val: string) => void;
  onAddUtterance: (intentId: string) => void;
}

export function IntentsTable({
  intents,
  lang,
  t,
  editingIntentId,
  setEditingIntentId,
  newUtterance,
  setNewUtterance,
  onAddUtterance
}: IntentsTableProps) {
  return (
    <div className="space-y-4">
      {intents.map((intent) => (
        <div
          key={intent.id}
          className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white font-mono">#{intent.name}</h3>
              <span className="text-[10px] text-slate-450 dark:text-slate-500 mt-1 block">
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
                      if (e.key === 'Enter') onAddUtterance(intent.id);
                    }}
                  />
                  <button
                    onClick={() => onAddUtterance(intent.id)}
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
  );
}
