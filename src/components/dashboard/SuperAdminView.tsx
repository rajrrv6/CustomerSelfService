'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { LLMModel, ASRTTSProvider, Channel } from '@/types';
import { Plus, Search, HelpCircle, HardDrive, Phone, Database, Server, RefreshCw, BarChart2 } from 'lucide-react';
import { SVGBarChart } from './Charts';

export function SuperAdminView({ activeSubScreen }: { activeSubScreen: string }) {
  const {
    llmModels,
    setLlmModels,
    asrProviders,
    setAsrProviders,
    channels,
    setChannels,
    addAuditLog
  } = useApp();

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

  // ASR/TTS creation state
  const [showAddProviderModal, setShowAddProviderModal] = useState(false);
  const [newProvider, setNewProvider] = useState<Omit<ASRTTSProvider, 'id'>>({
    name: '',
    type: 'ASR',
    languages: ['English', 'Arabic'],
    latencyMs: 150,
    costPerMin: 0.01,
    status: 'online'
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

  const handleRegisterProvider = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProvider.name) return;

    const provider: ASRTTSProvider = {
      ...newProvider,
      id: `prov-${Date.now()}`
    };

    setAsrProviders((prev) => [...prev, provider]);
    setShowAddProviderModal(false);
    addAuditLog(`Registered new ASR/TTS Engine: ${provider.name}`, 'success');
    setNewProvider({
      name: '',
      type: 'ASR',
      languages: ['English', 'Arabic'],
      latencyMs: 150,
      costPerMin: 0.01,
      status: 'online'
    });
  };

  // Filtered lists
  const filteredModels = llmModels.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.provider.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProviders = asrProviders.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render Sub Screens
  switch (activeSubScreen) {
    case 'llm_registry':
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">LLM Model Registry</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">Configure global model routes, parameter rules, and base pricing structures.</p>
            </div>
            <button
              onClick={() => setShowAddModelModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Register Model
            </button>
          </div>

          {/* Search bar */}
          <div className="flex gap-2 min-w-0">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search registered LLMs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Model Registry Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm min-w-0">
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full min-w-max border-collapse text-left text-xs text-slate-500 dark:text-slate-400">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Model Name</th>
                    <th className="px-6 py-4">Provider</th>
                    <th className="px-6 py-4">Context Window</th>
                    <th className="px-6 py-4">Cost (Input/Output per 1k)</th>
                    <th className="px-6 py-4">Accuracy Score</th>
                    <th className="px-6 py-4">Avg Latency</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
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
                          <div className="w-16 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full" style={{ width: `${model.accuracyScore}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-700 dark:text-slate-300">{model.latencyMs} ms</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          model.status === 'active' 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : model.status === 'testing'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {model.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Model register modal overlay */}
          {showAddModelModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 max-h-[90dvh] overflow-y-auto">
                <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 dark:text-white">Register LLM Model</h3>
                  <button onClick={() => setShowAddModelModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
                </div>
                <form onSubmit={handleRegisterModel} className="p-4 sm:p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Model Name (e.g. GPT-5 Small)</label>
                    <input
                      type="text"
                      required
                      value={newModel.name}
                      onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                      placeholder="My Enterprise Llama-4"
                      className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Cost Input (per 1k)</label>
                      <input
                        type="number"
                        step="0.000001"
                        required
                        value={newModel.costInput}
                        onChange={(e) => setNewModel({ ...newModel, costInput: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Cost Output (per 1k)</label>
                      <input
                        type="number"
                        step="0.000001"
                        required
                        value={newModel.costOutput}
                        onChange={(e) => setNewModel({ ...newModel, costOutput: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Avg Latency (ms)</label>
                      <input
                        type="number"
                        required
                        value={newModel.latencyMs}
                        onChange={(e) => setNewModel({ ...newModel, latencyMs: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Accuracy Score (%)</label>
                      <input
                        type="number"
                        min="50"
                        max="100"
                        required
                        value={newModel.accuracyScore}
                        onChange={(e) => setNewModel({ ...newModel, accuracyScore: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModelModal(false)}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-850"
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
              </div>
            </div>
          )}
        </div>
      );

    case 'asr_tts_registry':
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">ASR & TTS Provider Registry</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">Configure speech-to-text translators and text-to-speech voice generators.</p>
            </div>
            <button
              onClick={() => setShowAddProviderModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Register Provider
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm min-w-0">
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full min-w-max border-collapse text-left text-xs text-slate-500 dark:text-slate-400">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Engine Name</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Languages Supported</th>
                    <th className="px-6 py-4">Latency Index</th>
                    <th className="px-6 py-4">Billing Rate (per Min)</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {filteredProviders.map((provider) => (
                    <tr key={provider.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{provider.name}</td>
                      <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">{provider.type}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {provider.languages.map((l, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] text-slate-600 dark:text-slate-400">
                              {l}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-800 dark:text-slate-200">{provider.latencyMs} ms</td>
                      <td className="px-6 py-4 font-mono text-blue-600 dark:text-blue-400 font-bold">${provider.costPerMin.toFixed(4)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          provider.status === 'online'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
                        }`}>
                          {provider.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Provider modal overlay */}
          {showAddProviderModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 max-h-[90dvh] overflow-y-auto">
                <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 dark:text-white">Register ASR/TTS Engine</h3>
                  <button onClick={() => setShowAddProviderModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
                </div>
                <form onSubmit={handleRegisterProvider} className="p-4 sm:p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Engine Name</label>
                    <input
                      type="text"
                      required
                      value={newProvider.name}
                      onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
                      placeholder="e.g. DeepL Voice Synthesizer"
                      className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Type</label>
                      <select
                        value={newProvider.type}
                        onChange={(e) => setNewProvider({ ...newProvider, type: e.target.value as any })}
                        className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent focus:outline-none"
                      >
                        <option value="ASR">ASR (Speech-to-Text)</option>
                        <option value="TTS">TTS (Text-to-Speech)</option>
                        <option value="both">Both</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Latency Index (ms)</label>
                      <input
                        type="number"
                        required
                        value={newProvider.latencyMs}
                        onChange={(e) => setNewProvider({ ...newProvider, latencyMs: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Cost per Minute (USD)</label>
                    <input
                      type="number"
                      step="0.0001"
                      required
                      value={newProvider.costPerMin}
                      onChange={(e) => setNewProvider({ ...newProvider, costPerMin: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddProviderModal(false)}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-50"
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
              </div>
            </div>
          )}
        </div>
      );

    case 'cost_benchmarks':
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Model Cost Benchmarks</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">Benchmark real-world API costs per 1,000,000 tokens for comparative pricing analysis.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SVGBarChart
              data={llmModels.map((m) => m.costInput * 1000)}
              labels={llmModels.map((m) => m.name.substring(0, 8))}
              title="Input Tokens Cost ($ per 1M tokens)"
              barColor="#3b82f6"
            />
            <SVGBarChart
              data={llmModels.map((m) => m.costOutput * 1000)}
              labels={llmModels.map((m) => m.name.substring(0, 8))}
              title="Output Tokens Cost ($ per 1M tokens)"
              barColor="#f43f5e"
            />
          </div>

          <div className="bg-slate-100 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase font-mono mb-2">Cost Optimization Recommendation</h4>
            <p className="text-xs leading-relaxed text-slate-500">
              By automatically routing simple standard queries (e.g. greetings, returns lookup) to <span className="font-semibold text-blue-500">Gemini 1.5 Flash</span> and reserving advanced dialogues for <span className="font-semibold text-emerald-500">Claude 3.5 Sonnet</span>, the platform has achieved an average cost reduction of <span className="font-bold text-slate-800 dark:text-white">43.8%</span> over the past 30 days.
            </p>
          </div>
        </div>
      );

    case 'cross_tenant_analytics':
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Cross-Tenant Analytics</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">Infrastructure loads, tokens consumed, and API concurrency counts across enterprise client tenants.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { title: 'Aggregate API Calls', value: '45.2M', desc: '+12.4% over last 30d' },
              { title: 'Active Tenant Clusters', value: '18 Tenant DBs', desc: 'All healthy status' },
              { title: 'Platform Latency (p95)', value: '240ms', desc: 'ASR+LLM orchestration pipeline' }
            ].map((card, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">{card.title}</span>
                <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1 font-mono">{card.value}</p>
                <span className="text-[10px] text-slate-500 mt-1 block">{card.desc}</span>
              </div>
            ))}
          </div>

          {/* Tenants table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
            <h3 className="font-bold text-xs text-slate-600 dark:text-slate-400 uppercase font-mono mb-4">Active Enterprise Clients</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold">
                    <th className="pb-3">Client Identifier</th>
                    <th className="pb-3">Monthly Tokens</th>
                    <th className="pb-3">Active Bots</th>
                    <th className="pb-3">SLA Compliance</th>
                    <th className="pb-3">Endpoint Load</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-slate-600 dark:text-slate-300 font-medium">
                  {[
                    { id: 'saudi-telecom-corp', tokens: '14.8M', bots: 8, sla: '99.2%', load: '14.2 req/sec' },
                    { id: 'al-rajhi-retail', tokens: '22.1M', bots: 12, sla: '98.5%', load: '22.8 req/sec' },
                    { id: 'emirates-airlines', tokens: '8.4M', bots: 4, sla: '99.8%', load: '8.1 req/sec' },
                    { id: 'gulf-fintech-hub', tokens: '1.2M', bots: 2, sla: '94.0%', load: '1.1 req/sec' }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                      <td className="py-3 font-bold text-slate-900 dark:text-white font-mono">{row.id}</td>
                      <td className="py-3 font-mono">{row.tokens}</td>
                      <td className="py-3">{row.bots}</td>
                      <td className="py-3 text-emerald-500 font-bold">{row.sla}</td>
                      <td className="py-3 font-mono">{row.load}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );

    case 'vector_db':
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Vector DB Cluster Status</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">Real-time status of RAG index clusters hosted on Pinecone Enterprise and pgvector.</p>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-200">
              <RefreshCw className="w-3.5 h-3.5" />
              Rebalance Nodes
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cluster 1 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-500" />
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white">Cluster pinecone-us-east-1</h3>
                    <span className="text-[10px] text-slate-400 font-mono">Host: api-p1.us-east.pinecone.io</span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-bold">HEALTHY</span>
              </div>
              <div className="grid grid-cols-1 gap-2 py-3 text-center border-t border-b border-slate-100 dark:border-slate-850 sm:grid-cols-3">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-mono block">Dimensions</span>
                  <span className="text-sm font-bold font-mono">1,536</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-mono block">Total Vectors</span>
                  <span className="text-sm font-bold font-mono">4,120,412</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-mono block">Active Indexes</span>
                  <span className="text-sm font-bold font-mono">18</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Cluster Storage Limit</span>
                  <span>41.2% Used</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full" style={{ width: '41.2%' }} />
                </div>
              </div>
            </div>

            {/* Cluster 2 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-purple-500" />
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white">Cluster pgvector-fra-core</h3>
                    <span className="text-[10px] text-slate-400 font-mono">Host: pg-vector.internal.fra.aws</span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-bold">HEALTHY</span>
              </div>
              <div className="grid grid-cols-1 gap-2 py-3 text-center border-t border-b border-slate-100 dark:border-slate-850 sm:grid-cols-3">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-mono block">Dimensions</span>
                  <span className="text-sm font-bold font-mono">3,072</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-mono block">Total Vectors</span>
                  <span className="text-sm font-bold font-mono">812,410</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-mono block">Active Indexes</span>
                  <span className="text-sm font-bold font-mono">4</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Cluster Storage Limit</span>
                  <span>14.8% Used</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full" style={{ width: '14.8%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'sip_trunk':
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">SIP Trunk Voice Configuration</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">Configure SIP trunking endpoints, telephony carriers, VoIP networks, and fallback routing lists.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">Primary Telephony Carrier Registry</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase font-mono mb-1.5">Primary VoIP Gate (AST/KSA)</label>
                <input
                  type="text"
                  readOnly
                  value="sip.ksa-trunk.stc.com.sa:5060"
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 font-mono text-slate-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase font-mono mb-1.5">Secondary VoIP Gate (Fallback)</label>
                <input
                  type="text"
                  readOnly
                  value="sip.du-trunk.dubai.ae:5060"
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 font-mono text-slate-600 focus:outline-none"
                />
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-100 dark:border-slate-850">
              <h4 className="font-bold text-xs text-slate-800 dark:text-white mb-2">Trunk Load Balancing</h4>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs font-semibold">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  Enable TLS encryption (SIPS)
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  G.711 / G.729 Audio Codec Auto-Negotiate
                </label>
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <HelpCircle className="w-10 h-10 mb-2 opacity-50" />
          <span>Screen not implemented</span>
        </div>
      );
  }
}
