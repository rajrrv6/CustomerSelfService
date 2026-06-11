'use client';

import React from 'react';
import { Sliders, Trash2, Brain, Info, ArrowRight } from 'lucide-react';
import { Intent } from '@/types';

interface SlotRule {
  intent: string;
  slotName: string;
  prompt: string;
  retryPrompt: string;
  maxRetries: number;
  escalationTrigger: string;
  successCondition: string;
}

interface EntityItem {
  name: string;
  regex: string;
  languages: string[];
  samples: string;
  required: boolean;
}

interface SandboxMessage {
  sender: 'bot' | 'user';
  text: string;
  note?: string;
}

interface SlotValidationSandboxProps {
  lang: 'en' | 'ar';
  intents: Intent[];
  entityCatalog: EntityItem[];
  slotRules: SlotRule[];
  selectedIntent: string;
  setSelectedIntent: (val: string) => void;
  ruleSlotName: string;
  setRuleSlotName: (val: string) => void;
  rulePrompt: string;
  setRulePrompt: (val: string) => void;
  ruleRetryPrompt: string;
  setRuleRetryPrompt: (val: string) => void;
  ruleMaxRetries: number;
  setRuleMaxRetries: (val: number) => void;
  ruleEscalation: string;
  setRuleEscalation: (val: string) => void;
  ruleSuccess: string;
  setRuleSuccess: (val: string) => void;
  sandboxMessages: SandboxMessage[];
  sandboxInput: string;
  setSandboxInput: (val: string) => void;
  sandboxActiveRule: SlotRule | null;
  sandboxRetriesCount: number;
  onAddSlotRule: (e: React.FormEvent) => void;
  onDeleteSlotRule: (intent: string, slotName: string) => void;
  onRunSandbox: (e: React.FormEvent) => void;
}

export function SlotValidationSandbox({
  lang,
  intents,
  entityCatalog,
  slotRules,
  selectedIntent,
  setSelectedIntent,
  ruleSlotName,
  setRuleSlotName,
  rulePrompt,
  setRulePrompt,
  ruleRetryPrompt,
  setRuleRetryPrompt,
  ruleMaxRetries,
  setRuleMaxRetries,
  ruleEscalation,
  setRuleEscalation,
  ruleSuccess,
  setRuleSuccess,
  sandboxMessages,
  sandboxInput,
  setSandboxInput,
  sandboxActiveRule,
  sandboxRetriesCount,
  onAddSlotRule,
  onDeleteSlotRule,
  onRunSandbox
}: SlotValidationSandboxProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Rule Builder Panel */}
        <div className="xl:col-span-2 space-y-4">
          <form onSubmit={onAddSlotRule} className="bg-slate-50 dark:bg-slate-955 p-5 border border-slate-150 dark:border-slate-850 rounded-3xl space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
              <Sliders className="w-4.5 h-4.5 text-blue-500" />
              <span>{lang === 'ar' ? 'معالج بناء قواعد الفتحات' : 'Slot Validation Builder'}</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'النية المستهدفة' : 'Target Dialogue Intent'}</label>
                <select
                  value={selectedIntent}
                  onChange={(e) => setSelectedIntent(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-205 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none text-xs text-slate-800 dark:text-slate-100 font-semibold"
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
                  className="w-full px-3 py-1.5 border border-slate-205 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none text-xs text-slate-800 dark:text-slate-100 font-semibold"
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
                className="w-full px-3 py-1.5 border border-slate-205 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none text-xs text-slate-800 dark:text-slate-100 font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'رسالة الفشل والمحاولة الثانية' : 'Validation Failure Retry Prompt'}</label>
              <input
                type="text"
                required
                value={ruleRetryPrompt}
                onChange={(e) => setRuleRetryPrompt(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-205 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none text-xs text-slate-800 dark:text-slate-100 font-semibold"
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
                  className="w-full px-3 py-1.5 border border-slate-205 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none font-mono text-xs text-slate-800 dark:text-slate-100 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'توجيه التصعيد عند الفشل' : 'Failure Escalation Target'}</label>
                <input
                  type="text"
                  required
                  value={ruleEscalation}
                  onChange={(e) => setRuleEscalation(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-205 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none text-xs text-slate-800 dark:text-slate-100 font-semibold"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-[10px] cursor-pointer font-sans"
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
                  <p className="text-[11px] text-slate-500 font-normal">Prompt: "{rule.prompt}"</p>
                  <p className="text-[10px] text-slate-450 italic font-normal">Retry prompt: "{rule.retryPrompt}"</p>
                  <div className="flex gap-4 flex-wrap text-[9px] font-bold font-mono text-slate-450 mt-1">
                    <span>MAX RETRIES: {rule.maxRetries}</span>
                    <span className="text-rose-500">ESCALATION: {rule.escalationTrigger}</span>
                    <span className="text-emerald-500">SUCCESS COND: {rule.successCondition}</span>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteSlotRule(rule.intent, rule.slotName)}
                  className="text-slate-400 hover:text-rose-500 transition-colors p-1 cursor-pointer"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            ))}
          </div>

        </div>

        {/* Simulator Sandbox */}
        <div className="bg-slate-50 dark:bg-slate-950 p-5 border border-slate-200 dark:border-slate-850 rounded-3xl h-[560px] flex flex-col justify-between overflow-hidden">
          <div className="space-y-1 pb-3 border-b border-slate-150 dark:border-slate-900/50">
            <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-emerald-500" />
              <span>{lang === 'ar' ? 'صندوق محاكاة ملء الفتحات' : 'Conversational Slot Sandbox'}</span>
            </h4>
            <p className="text-[10px] text-slate-450 font-normal">{lang === 'ar' ? 'محاكاة لتدفقات ملء فتحات NLU والتحقق الفوري.' : 'Interactive playground to debug retry loops and regex matchers locally.'}</p>
          </div>

          {/* Chat screen */}
          <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
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
              <div className="text-[9px] font-bold text-blue-500 font-mono flex items-center gap-1 animate-pulse select-none">
                <Info className="w-3.5 h-3.5" />
                <span>EXTRACTING SLOT @{sandboxActiveRule.slotName}... (ATTEMPT {sandboxRetriesCount}/{sandboxActiveRule.maxRetries})</span>
              </div>
            )}
          </div>

          {/* Sandbox input */}
          <form onSubmit={onRunSandbox} className="pt-3 border-t border-slate-150 dark:border-slate-900/50 flex gap-2 bg-transparent">
            <input
              type="text"
              placeholder={
                sandboxActiveRule 
                  ? `Enter ${sandboxActiveRule.slotName} value...` 
                  : 'Type: "I want to track my order"'
              }
              value={sandboxInput}
              onChange={(e) => setSandboxInput(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none text-xs text-slate-800 dark:text-slate-100 font-semibold"
            />
            <button 
              type="submit" 
              className="px-3 py-2 bg-blue-600 text-white rounded-xl cursor-pointer"
            >
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
