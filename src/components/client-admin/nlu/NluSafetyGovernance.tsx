'use client';

import React from 'react';
import { Trash2, Brain, Info } from 'lucide-react';
import { Intent } from '@/types';

interface TemplateItem {
  id: string;
  intent: string;
  name: string;
  text: string;
}

interface AuditLogItem {
  timestamp: string;
  user: string;
  action: string;
}

interface NluSafetyGovernanceProps {
  lang: 'en' | 'ar';
  t: any;
  intents: Intent[];
  toxicityThreshold: number;
  setToxicityThreshold: (val: number) => void;
  piiMaskLevel: string;
  setPiiMaskLevel: (val: string) => void;
  forbiddenWords: string[];
  newForbiddenWord: string;
  setNewForbiddenWord: (val: string) => void;
  onAddForbiddenWord: (e: React.FormEvent) => void;
  onDeleteForbiddenWord: (word: string) => void;
  governanceTemplates: TemplateItem[];
  newTemplateIntent: string;
  setNewTemplateIntent: (val: string) => void;
  newTemplateName: string;
  setNewTemplateName: (val: string) => void;
  newTemplateText: string;
  setNewTemplateText: (val: string) => void;
  onAddTemplate: (e: React.FormEvent) => void;
  onDeleteTemplate: (id: string, name: string) => void;
  safetyTestInput: string;
  setSafetyTestInput: (val: string) => void;
  safetyTestResult: any;
  onTestSafety: (e: React.FormEvent) => void;
  governanceActiveVersion: string;
  governanceRollout: number;
  setGovernanceRollout: (val: number) => void;
  onPublishVersion: (version: string) => void;
  governanceAuditLogs: AuditLogItem[];
}

export function NluSafetyGovernance({
  lang,
  t,
  intents,
  toxicityThreshold,
  setToxicityThreshold,
  piiMaskLevel,
  setPiiMaskLevel,
  forbiddenWords,
  newForbiddenWord,
  setNewForbiddenWord,
  onAddForbiddenWord,
  onDeleteForbiddenWord,
  governanceTemplates,
  newTemplateIntent,
  setNewTemplateIntent,
  newTemplateName,
  setNewTemplateName,
  newTemplateText,
  setNewTemplateText,
  onAddTemplate,
  onDeleteTemplate,
  safetyTestInput,
  setSafetyTestInput,
  safetyTestResult,
  onTestSafety,
  governanceActiveVersion,
  governanceRollout,
  setGovernanceRollout,
  onPublishVersion,
  governanceAuditLogs
}: NluSafetyGovernanceProps) {
  return (
    <div className="space-y-6 animate-fade-in text-slate-700 dark:text-slate-350">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Safety & Profanity Controls Section */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Toxicity & PII Controls */}
          <div className="bg-white dark:bg-[#111827] border border-slate-205 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
              <span>{lang === 'ar' ? 'معايير جدار الحماية للسمية والخصوصية' : 'Toxicity & PII Shield Gateways'}</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-normal">
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
                  className="w-full accent-rose-605 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer h-1.5"
                />
                <span className="text-[9px] text-slate-400 block italic leading-relaxed font-normal">
                  {lang === 'ar' ? 'أي مدخل عميل يتجاوز هذا النسبة سيتم اعتراضه وتوجيهه لإنهاء الحوار.' : 'Inputs scored above this will trigger containment/fallback.'}
                </span>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-655 dark:text-slate-400">{lang === 'ar' ? 'مستوى قناع الهوية (PII Masking)' : 'PII Leak Protection Level'}</label>
                <select
                  value={piiMaskLevel}
                  onChange={(e) => setPiiMaskLevel(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none text-xs focus-visible:ring-2 focus-visible:ring-blue-500 text-slate-800 dark:text-slate-100 font-semibold"
                >
                  <option value="full">{lang === 'ar' ? 'تشفير وحظر كامل لجميع الفئات' : 'Strict - Anonymize all and Block Send'}</option>
                  <option value="anonymize">{lang === 'ar' ? 'استبدال القيم بنصوص بديلة (أقنعة)' : 'Medium - Mask values (e.g. [EMAIL_MASKED])'}</option>
                  <option value="none">{lang === 'ar' ? 'تعطيل الحظر (تنبيه فقط)' : 'Log Only - Allow with Warning Audit logs'}</option>
                </select>
                <span className="text-[9px] text-slate-400 block italic leading-relaxed font-normal">
                  {lang === 'ar' ? 'فئات الكشف: البريد الإلكتروني، الهواتف، الحسابات البنكية (IBAN).' : 'Targets: Saudi National IDs, credit cards, KSA IBANs, and email strings.'}
                </span>
              </div>
            </div>
          </div>

          {/* Forbidden Keywords blocklist manager */}
          <div className="bg-white dark:bg-[#111827] border border-slate-205 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{lang === 'ar' ? 'الكلمات والعبارات المحظورة' : 'Safety Filter Blocklist Words'}</span>
            </h3>

            <form onSubmit={onAddForbiddenWord} className="flex gap-2 bg-transparent">
              <input
                type="text"
                required
                placeholder={lang === 'ar' ? "أضف كلمة محظورة (مثال: نصب)" : "Add forbidden word (e.g. scam)"}
                value={newForbiddenWord}
                onChange={(e) => setNewForbiddenWord(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-100 font-semibold"
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
                    onClick={() => onDeleteForbiddenWord(word)}
                    className="text-rose-400 hover:text-rose-700 focus:outline-none transition-colors cursor-pointer text-xs"
                  >
                    ×
                  </button>
                </span>
              ))}
              {forbiddenWords.length === 0 && (
                <span className="text-slate-400 italic text-xs font-normal">{lang === 'ar' ? 'لا يوجد كلمات في قائمة الحظر حالياً.' : 'No active keywords on the blocklist.'}</span>
              )}
            </div>
          </div>

          {/* Response Template Governance */}
          <div className="bg-white dark:bg-[#111827] border border-slate-205 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{lang === 'ar' ? 'قوالب الردود الموحدة للحوكمة' : 'Governance Response Templates'}</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-normal">
              {lang === 'ar' 
                ? 'قم بإعداد نصوص موحدة لاستخدامها في إجابات النوايا لضمان الحفاظ على الهوية القانونية للمؤسسة.' 
                : 'Manage standardized response templates mapped to intents. Dynamically inject slots using double brackets.'}
            </p>

            <form onSubmit={onAddTemplate} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'النية المستهدفة' : 'Target Intent'}</label>
                  <select
                    value={newTemplateIntent}
                    onChange={(e) => setNewTemplateIntent(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none text-xs text-slate-800 dark:text-slate-100 font-semibold"
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
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none text-xs text-slate-800 dark:text-slate-100 font-semibold"
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
                  className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none text-xs text-slate-805 dark:text-slate-100 font-semibold"
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
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-serif leading-relaxed italic font-normal">"{tpl.text}"</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteTemplate(tpl.id, tpl.name)}
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
          <div className="bg-white dark:bg-[#111827] border border-slate-205 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <Brain className="w-4.5 h-4.5 text-emerald-500" />
              <span>{lang === 'ar' ? 'فاحص جدار الحماية (Safety Intercept)' : 'Safety Intercept Sandbox'}</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-normal">
              {lang === 'ar'
                ? 'اختبار فوري لعبارات العميل قبل معالجتها من محرك NLU للتأكد من فلاتر الحماية.'
                : 'Test user statements locally to analyze PII triggers, forbidden lists, and masking outcomes.'}
            </p>

            <form onSubmit={onTestSafety} className="space-y-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-150 dark:border-slate-850">
              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-slate-500">{lang === 'ar' ? 'عبارة عميل تجريبية' : 'Test Client input statement'}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My email is user@mpaas.com or spam"
                  value={safetyTestInput}
                  onChange={(e) => setSafetyTestInput(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-205 dark:border-slate-850 rounded-xl bg-white dark:bg-slate-900 focus:outline-none text-xs text-slate-800 dark:text-slate-100 font-semibold"
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
                    <span className="text-slate-650 dark:text-slate-350 block font-sans font-semibold">{safetyTestResult.blockReason}</span>
                  </div>
                )}

                <div className="space-y-1 border-t border-slate-200 dark:border-slate-850 pt-2">
                  <span className="text-slate-400 block">ANONYMIZED OUTPUT SENT TO NLU:</span>
                  <p className="text-[10px] text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-2 rounded border border-slate-105 dark:border-slate-900/50 font-sans whitespace-pre-wrap font-semibold">
                    {safetyTestResult.anonymizedText}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Tenant Distribution tracker */}
          <div className="bg-white dark:bg-[#111827] border border-slate-205 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{lang === 'ar' ? 'تتبع توزيع وإصدارات المستأجر' : 'NLU Tenant Deployment'}</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-normal">
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
                <span className="text-[10px] font-bold text-slate-500 block uppercase font-sans">{lang === 'ar' ? 'إجراءات النشر والحوكمة' : 'Deploy Control Panel'}</span>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <button
                    type="button"
                    disabled={governanceActiveVersion === 'v2.2.0-rc-1'}
                    onClick={() => onPublishVersion('v2.2.0-rc-1')}
                    className="py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors cursor-pointer text-[10px] disabled:opacity-50 font-sans"
                  >
                    {lang === 'ar' ? 'نشر v2.2.0-rc-1' : 'Publish RC'}
                  </button>
                  <button
                    type="button"
                    disabled={governanceActiveVersion === 'v2.0.4-stable'}
                    onClick={() => onPublishVersion('v2.0.4-stable')}
                    className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 font-bold rounded-lg transition-colors cursor-pointer text-[10px] disabled:opacity-50 font-sans"
                  >
                    {lang === 'ar' ? 'تراجع لـ v2.0.4' : 'Rollback Stable'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Governance Audit Log Console */}
          <div className="bg-slate-100/50 dark:bg-slate-900/40 p-4 border border-slate-200 dark:border-slate-850 rounded-2xl space-y-3">
            <h4 className="font-bold text-[10px] uppercase font-mono tracking-wide text-slate-505">{lang === 'ar' ? 'سجل حوكمة الأمان والانتشار' : 'Governance Audit Log'}</h4>
            
            <div className="space-y-2.5 max-h-40 overflow-y-auto font-mono text-[9px] leading-relaxed pr-1">
              {governanceAuditLogs.map((log, index) => (
                <div key={index} className="space-y-0.5 border-b border-slate-200 dark:border-slate-855 pb-1.5 last:border-b-0">
                  <div className="flex justify-between text-slate-400">
                    <span>{log.timestamp}</span>
                    <span className="text-slate-500 font-bold font-mono">@{log.user}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-350 font-normal">{log.action}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
