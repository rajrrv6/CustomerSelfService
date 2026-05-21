'use client';

import React from 'react';
import { ShieldCheck, Sliders } from 'lucide-react';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { OperationalCard } from '@/components/shared/OperationalCard';

export function GuardrailsTab() {
  const piiFilters = [
    { label: 'Filter Visa/Mastercard Numbers', active: true },
    { label: 'Filter Email Addresses', active: true },
    { label: 'Filter Saudi National IDs / Civil Registry', active: true },
    { label: 'Filter Cell Phone Numbers', active: false }
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Safety & Guardrails Config"
        description="Configure PII filters, toxic prompt sanitizers, and RAG hallucinations thresholds."
      />

      <OperationalCard hoverEffect={false} className="p-6 space-y-6 shadow-sm">
        {/* PII Masking Section */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-slate-805 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-500" />
            PII Masking & Privacy Filters
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal font-normal">
            Strict PII filters replace sensitive customer metrics (e.g. credit cards, passport, emails) with generic placeholder tokens before requests hit third-party LLMs.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {piiFilters.map((pii, idx) => (
              <label
                key={idx}
                className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl cursor-pointer hover:border-slate-200 dark:hover:border-slate-800 transition-colors text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                <input
                  type="checkbox"
                  defaultChecked={pii.active}
                  className="rounded border-slate-350 dark:border-slate-800 text-blue-600 focus:ring-blue-550 bg-transparent"
                />
                <span>{pii.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Toxicity threshold */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-slate-850 dark:text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-purple-500" />
            NLU Guardrail Score Thresholds
          </h3>
          
          <div className="space-y-4 max-w-xl">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5 text-slate-655 dark:text-slate-400">
                <span>PII Leaks / Hallucination Limit</span>
                <span className="font-mono text-slate-850 dark:text-slate-200">0.88 Threshold</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                defaultValue="88"
                className="w-full h-1.5 bg-slate-205 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5 text-slate-655 dark:text-slate-400">
                <span>Toxicity Prompt Score</span>
                <span className="font-mono text-slate-850 dark:text-slate-200">0.65 Threshold</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                defaultValue="65"
                className="w-full h-1.5 bg-slate-205 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      </OperationalCard>
    </div>
  );
}
