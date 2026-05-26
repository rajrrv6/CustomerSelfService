'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { LLMModel } from '@/types';
import { Plus, Search, RefreshCw, CheckCircle2 } from 'lucide-react';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { EnterpriseTable } from '@/components/shared/EnterpriseTable';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { Badge } from '@/components/shared/BadgeSystem';
import { translations } from '@/i18n/translations';
import { EmptyState } from '@/components/shared/EmptyState';

export function LlmRegistryTab() {
  const { lang, llmModels, setLlmModels, addAuditLog } = useApp();
  const t = translations[lang];
  const isRtl = lang === 'ar';
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Model creation state
  const [showAddModelModal, setShowAddModelModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [newModel, setNewModel] = useState<Omit<LLMModel, 'id'>>({
    name: '',
    provider: 'Google Vertex AI',
    costInput: 0.001,
    costOutput: 0.002,
    latencyMs: 250,
    status: 'active',
    contextWindow: 128000,
    accuracyScore: 92
  });

  useEffect(() => {
    if (searchQuery) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        setIsSearching(false);
      }, 400);
      return () => clearTimeout(timer);
    } else {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const handleRegisterModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModel.name) return;

    setIsSyncing(true);
    setSyncSuccess(false);

    // Simulate API gateway registration and latency check
    setTimeout(() => {
      setIsSyncing(false);
      setSyncSuccess(true);

      setTimeout(() => {
        const model: LLMModel = {
          ...newModel,
          id: `llm-${Date.now()}`
        };

        setLlmModels((prev) => [...prev, model]);
        setShowAddModelModal(false);
        setSyncSuccess(false);
        addAuditLog(`Registered and synced new LLM Model: ${model.name} with AI Gateway API`, 'success');
        setNewModel({
          name: '',
          provider: 'Google Vertex AI',
          costInput: 0.001,
          costOutput: 0.002,
          latencyMs: 250,
          status: 'active',
          contextWindow: 128000,
          accuracyScore: 92
        });
      }, 800);
    }, 1500);
  };

  const filteredModels = llmModels.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.provider.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const headerAction = (
    <button
      onClick={() => setShowAddModelModal(true)}
      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md transition-all active:scale-95 cursor-pointer"
    >
      <Plus className="w-4 h-4" />
      {t.superAdmin.llmRegistry.registerButton}
    </button>
  );

  const tableHeaders = [...t.superAdmin.llmRegistry.tableHeaders];

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t.superAdmin.llmRegistry.title}
        description={t.superAdmin.llmRegistry.description}
        action={headerAction}
      />

      {/* Search bar */}
      <div className="flex gap-2 min-w-0">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t.superAdmin.llmRegistry.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 dark:border-slate-850 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none text-slate-850 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Model Registry Table */}
      <EnterpriseTable
        headers={tableHeaders}
      >
        {isSearching ? (
          // Pulse loader row skeletons
          [1, 2, 3].map((i) => (
            <tr key={i} className="animate-pulse">
              <td className="px-6 py-4">
                <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-lg w-28" />
              </td>
              <td className="px-6 py-4">
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-lg w-24" />
              </td>
              <td className="px-6 py-4">
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-lg w-20" />
              </td>
              <td className="px-6 py-4">
                <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-lg w-32" />
              </td>
              <td className="px-6 py-4">
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-lg w-20" />
              </td>
              <td className="px-6 py-4">
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-lg w-16" />
              </td>
              <td className="px-6 py-4">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-12" />
              </td>
            </tr>
          ))
        ) : filteredModels.length === 0 ? (
          <tr>
            <td colSpan={tableHeaders.length} className="px-6 py-6">
              <EmptyState
                title={isRtl ? `لم يتم العثور على نتائج لـ "${searchQuery}"` : `No results found for "${searchQuery}"`}
                description={isRtl 
                  ? 'تحقق من تهجئة كلمة البحث أو قم بإعادة ضبط الفلاتر، أو قم بتسجيل نموذج جديد فوراً باستخدام هذا الاسم.'
                  : 'Check your search spelling, reset filters, or instantly register a new LLM configuration using this name.'}
                action={
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => setSearchQuery('')}
                      className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-[10px] font-bold transition-all cursor-pointer text-slate-700 dark:text-slate-300"
                    >
                      {isRtl ? 'إعادة تعيين البحث' : 'Reset Search'}
                    </button>
                    <button
                      onClick={() => {
                        setNewModel(prev => ({ ...prev, name: searchQuery }));
                        setShowAddModelModal(true);
                      }}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-bold shadow-sm transition-all cursor-pointer"
                    >
                      {isRtl ? `تسجيل "${searchQuery}"` : `Register "${searchQuery}"`}
                    </button>
                  </div>
                }
              />
            </td>
          </tr>
        ) : (
          filteredModels.map((model) => (
            <tr key={model.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
              <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{model.name}</td>
              <td className="px-6 py-4 font-semibold">{model.provider}</td>
              <td className="px-6 py-4 font-mono">{model.contextWindow.toLocaleString()} tokens</td>
              <td className="px-6 py-4 font-mono text-blue-600 dark:text-blue-400 font-bold">
                ${model.costInput.toFixed(6)} / ${model.costOutput.toFixed(6)}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="text-slate-800 dark:text-slate-200">{model.accuracyScore}%</span>
                  <div className="w-16 h-2 bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: `${model.accuracyScore}%` }} />
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 font-mono font-bold text-slate-700 dark:text-slate-300">{model.latencyMs} ms</td>
              <td className="px-6 py-4">
                <Badge type={model.status}>
                  {model.status}
                </Badge>
              </td>
            </tr>
          ))
        )}
      </EnterpriseTable>

      {/* Model register modal overlay */}
      <ModalWrapper
        isOpen={showAddModelModal}
        onClose={() => {
          if (!isSyncing) setShowAddModelModal(false);
        }}
        title={t.superAdmin.llmRegistry.modalTitle}
      >
        {isSyncing ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            <div className="text-center">
              <span className="font-bold text-xs text-slate-800 dark:text-white block uppercase tracking-wider font-mono animate-pulse">
                {isRtl ? 'جاري مزامنة بيانات البوابة' : 'Syncing Gateway Credentials'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                {isRtl ? 'التحقق من رموز OAuth وقياس وقت استجابة الشبكة...' : 'Testing OAuth endpoints and measuring token latencies...'}
              </span>
            </div>
          </div>
        ) : syncSuccess ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-3.5">
            <div className="w-10 h-10 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400 block uppercase tracking-wider font-mono">
                {isRtl ? 'تمت المزامنة بنجاح' : 'Sync Successful'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                {isRtl ? 'تم التحقق من النموذج ونشره في موجه LLM.' : 'LLM routing config registered and propagated.'}
              </span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRegisterModel} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">{t.superAdmin.llmRegistry.fieldName}</label>
              <input
                type="text"
                required
                value={newModel.name}
                onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                placeholder={t.superAdmin.llmRegistry.fieldPlaceholder}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">{t.superAdmin.llmRegistry.fieldCostInput}</label>
                <input
                  type="number"
                  step="0.000001"
                  required
                  value={newModel.costInput}
                  onChange={(e) => setNewModel({ ...newModel, costInput: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent focus:outline-none text-slate-800 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">{t.superAdmin.llmRegistry.fieldCostOutput}</label>
                <input
                  type="number"
                  step="0.000001"
                  required
                  value={newModel.costOutput}
                  onChange={(e) => setNewModel({ ...newModel, costOutput: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent focus:outline-none text-slate-800 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">{t.superAdmin.llmRegistry.fieldLatency}</label>
                <input
                  type="number"
                  required
                  value={newModel.latencyMs}
                  onChange={(e) => setNewModel({ ...newModel, latencyMs: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent focus:outline-none text-slate-800 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">{t.superAdmin.llmRegistry.fieldAccuracy}</label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  required
                  value={newModel.accuracyScore}
                  onChange={(e) => setNewModel({ ...newModel, accuracyScore: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent focus:outline-none text-slate-800 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModelModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                {t.superAdmin.llmRegistry.cancel}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 cursor-pointer"
              >
                {t.superAdmin.llmRegistry.register}
              </button>
            </div>
          </form>
        )}
      </ModalWrapper>
    </div>
  );
}
