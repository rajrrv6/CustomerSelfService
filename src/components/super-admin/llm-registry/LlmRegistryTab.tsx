'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { LLMModel } from '@/types';
import { Plus, Search } from 'lucide-react';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { EnterpriseTable } from '@/components/shared/EnterpriseTable';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { Badge } from '@/components/shared/BadgeSystem';

export function LlmRegistryTab() {
  const { llmModels, setLlmModels, addAuditLog } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Model creation state
  const [showAddModelModal, setShowAddModelModal] = useState(false);
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

  const handleRegisterModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModel.name) return;

    const model: LLMModel = {
      ...newModel,
      id: `llm-${Date.now()}`
    };

    setLlmModels((prev) => [...prev, model]);
    setShowAddModelModal(false);
    addAuditLog(`Registered new LLM Model: ${model.name}`, 'success');
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
  };

  const filteredModels = llmModels.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.provider.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const headerAction = (
    <button
      onClick={() => setShowAddModelModal(true)}
      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md transition-all active:scale-95"
    >
      <Plus className="w-4 h-4" />
      Register Model
    </button>
  );

  const tableHeaders = [
    'Model Name',
    'Provider',
    'Context Window',
    'Cost (Input/Output per 1k)',
    'Accuracy Score',
    'Avg Latency',
    'Status'
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="LLM Model Registry"
        description="Configure global model routes, parameter rules, and base pricing structures."
        action={headerAction}
      />

      {/* Search bar */}
      <div className="flex gap-2 min-w-0">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search registered LLMs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 dark:border-slate-850 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Model Registry Table */}
      <EnterpriseTable
        headers={tableHeaders}
        empty={filteredModels.length === 0}
        emptyTitle="No Models Registered"
        emptyDesc="No LLM models match your search query."
      >
        {filteredModels.map((model) => (
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
        ))}
      </EnterpriseTable>

      {/* Model register modal overlay */}
      <ModalWrapper
        isOpen={showAddModelModal}
        onClose={() => setShowAddModelModal(false)}
        title="Register LLM Model"
      >
        <form onSubmit={handleRegisterModel} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Model Name (e.g. GPT-5 Small)</label>
            <input
              type="text"
              required
              value={newModel.name}
              onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
              placeholder="My Enterprise Llama-4"
              className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Cost Input (per 1k)</label>
              <input
                type="number"
                step="0.000001"
                required
                value={newModel.costInput}
                onChange={(e) => setNewModel({ ...newModel, costInput: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent focus:outline-none text-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Cost Output (per 1k)</label>
              <input
                type="number"
                step="0.000001"
                required
                value={newModel.costOutput}
                onChange={(e) => setNewModel({ ...newModel, costOutput: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent focus:outline-none text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Avg Latency (ms)</label>
              <input
                type="number"
                required
                value={newModel.latencyMs}
                onChange={(e) => setNewModel({ ...newModel, latencyMs: parseInt(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent focus:outline-none text-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Accuracy Score (%)</label>
              <input
                type="number"
                min="50"
                max="100"
                required
                value={newModel.accuracyScore}
                onChange={(e) => setNewModel({ ...newModel, accuracyScore: parseInt(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent focus:outline-none text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddModelModal(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700"
            >
              Register
            </button>
          </div>
        </form>
      </ModalWrapper>
    </div>
  );
}
