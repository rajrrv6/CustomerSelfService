'use client';

import React from 'react';
import { Intent } from '@/types';

interface SuggestedIntent {
  name: string;
  count: number;
  phrase: string;
}

interface SuggestedIntentsDrawerProps {
  lang: 'en' | 'ar';
  t: any;
  intents: Intent[];
  suggestedIntents: SuggestedIntent[];
  promotionMessage: string;
  promotingSuggestionName: string | null;
  onPromoteSuggestion: (sug: SuggestedIntent) => void;
}

export function SuggestedIntentsDrawer({
  lang,
  t,
  intents,
  suggestedIntents,
  promotionMessage,
  promotingSuggestionName,
  onPromoteSuggestion
}: SuggestedIntentsDrawerProps) {
  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-850 h-fit space-y-4">
      <h3 className="font-bold text-xs text-slate-655 dark:text-slate-400 uppercase font-mono tracking-wider">
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
                <span className="font-bold text-slate-855 dark:text-white font-mono">#{sug.name}</span>
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
              <p className="text-[10px] text-slate-400 font-normal">Sample: "{sug.phrase}"</p>
              <button
                type="button"
                disabled={isDisabled}
                onClick={() => onPromoteSuggestion(sug)}
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
  );
}
