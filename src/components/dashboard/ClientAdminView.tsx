'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Bot, Intent, KnowledgeSource, IngestionLog, Agent, SLARule } from '@/types';
import {
  Plus,
  Search,
  Bot as BotIcon,
  Cpu,
  Brain,
  Sliders,
  Send,
  RefreshCw,
  AlertTriangle,
  Play,
  TrendingUp,
  ShieldCheck,
  Grid,
  Phone,
  Link2,
  Lock,
  Layers,
  ArrowRight,
  GitBranch,
  Smile,
  AlertCircle
} from 'lucide-react';
import { SVGDonutChart, SVGLineChart } from './Charts';

import { DialogFlowLayout } from '@/components/dialog-builder/DialogFlowLayout';
import { IntegrationsDashboard } from '@/components/integrations/IntegrationsDashboard';

export function ClientAdminView({ activeSubScreen }: { activeSubScreen: string }) {
  const {
    bots,
    createBot,
    intents,
    setIntents,
    knowledgeSources,
    ingestionLogs,
    triggerIngestion,
    agents,
    setAgents,
    slaRules,
    setSlaRules,
    conversations,
    sendMessage,
    triggerBotResponse,
    addAuditLog,
    lang
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');

  // 1. Bot creation states
  const [showAddBotModal, setShowAddBotModal] = useState(false);
  const [newBotName, setNewBotName] = useState('');
  const [newBotPersona, setNewBotPersona] = useState('');
  const [newBotLang, setNewBotLang] = useState('English, Arabic');

  const handleCreateBotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBotName || !newBotPersona) return;
    createBot({
      name: newBotName,
      persona: newBotPersona,
      status: 'draft',
      language: newBotLang.split(',').map((l) => l.trim()),
      intentCount: 12,
      knowledgeBaseId: 'kb-custom'
    });
    setShowAddBotModal(false);
    setNewBotName('');
    setNewBotPersona('');
  };

  // 2. Intent states
  const [editingIntentId, setEditingIntentId] = useState<string | null>(null);
  const [newUtterance, setNewUtterance] = useState('');

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

  // 3. Dialog Simulator States
  const [simulatorChatId, setSimulatorChatId] = useState('conv-1');
  const [simMessage, setSimMessage] = useState('');
  
  const activeSimConv = conversations.find(c => c.id === simulatorChatId) || conversations[0];

  const handleSendSimMessage = () => {
    if (!simMessage) return;
    // Send customer message
    sendMessage(activeSimConv.id, simMessage, 'customer', activeSimConv.customerName);
    const textSent = simMessage;
    setSimMessage('');

    // Trigger Farah AI reply after 1 sec
    triggerBotResponse(activeSimConv.id, textSent);
  };

  // 4. Ingestion Sync Trigger
  const [syncingId, setSyncingId] = useState<string | null>(null);
  
  const handleSyncSource = (sourceId: string) => {
    setSyncingId(sourceId);
    triggerIngestion(sourceId);
    setTimeout(() => {
      setSyncingId(null);
    }, 3000);
  };

  // Render sub-screens
  switch (activeSubScreen) {
    case 'bots':
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">AI Bots Management</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">Configure corporate personas, custom LLM models, and deflection criteria.</p>
            </div>
            <button
              onClick={() => setShowAddBotModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md transition-all active:scale-95 animate-fade-in"
            >
              <Plus className="w-4 h-4" />
              Create Bot Persona
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {bots.map((bot) => (
              <div
                key={bot.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <BotIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-850 dark:text-white">{bot.name}</h3>
                        <span className="text-[10px] text-slate-400 font-medium">Created: {bot.createdAt}</span>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold ${
                      bot.status === 'live'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : bot.status === 'training'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-450'
                    }`}>
                      {bot.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal min-h-[48px]">
                    {bot.persona}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-100 dark:border-slate-900/50">
                      <span className="text-[9px] text-slate-400 uppercase font-mono block">Deflection</span>
                      <span className="font-bold text-slate-850 dark:text-white font-mono">{bot.deflectionRate}%</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-100 dark:border-slate-900/50">
                      <span className="text-[9px] text-slate-400 uppercase font-mono block">Active chats</span>
                      <span className="font-bold text-slate-850 dark:text-white font-mono">{bot.activeSessions}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-350">
                      Edit Persona
                    </button>
                    <button className="px-3 py-2 text-xs bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                      Flows
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Bot Modal */}
          {showAddBotModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-md w-full rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 dark:text-white">Create Bot Persona</h3>
                  <button onClick={() => setShowAddBotModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">×</button>
                </div>
                <form onSubmit={handleCreateBotSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Bot Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Layla AI Support"
                      value={newBotName}
                      onChange={(e) => setNewBotName(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Persona & Voice Description</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="e.g. Empathetic financial chatbot. Keeps replies under 2 sentences..."
                      value={newBotPersona}
                      onChange={(e) => setNewBotPersona(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Languages (Comma separated)</label>
                    <input
                      type="text"
                      value={newBotLang}
                      onChange={(e) => setNewBotLang(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl text-xs focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddBotModal(false)}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700"
                    >
                      Initialize Bot
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      );

    case 'intents':
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Intent & Slot Filling Management</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">Train NLU layers, define slots, and configure fallback webhook triggers.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left list */}
            <div className="lg:col-span-2 space-y-4">
              {intents.map((intent) => (
                <div
                  key={intent.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white font-mono">#{intent.name}</h3>
                      <span className="text-[10px] text-slate-400 mt-1 block">Fulfillment: <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">{intent.fulfillmentType} ({intent.fulfillmentValue})</span></span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-bold font-mono">
                      Hits: {intent.hitCount}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Training Phrases</span>
                    <div className="flex flex-wrap gap-1.5">
                      {intent.utterances.map((utt, i) => (
                        <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg text-[11px] text-slate-600 dark:text-slate-350">
                          "{utt}"
                        </span>
                      ))}
                      {editingIntentId === intent.id ? (
                        <div className="flex gap-1.5 mt-1.5 w-full">
                          <input
                            type="text"
                            placeholder="Add training phrase..."
                            value={newUtterance}
                            onChange={(e) => setNewUtterance(e.target.value)}
                            className="flex-1 px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-xs focus:outline-none"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddUtterance(intent.id);
                            }}
                          />
                          <button
                            onClick={() => handleAddUtterance(intent.id)}
                            className="px-3 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => setEditingIntentId(null)}
                            className="px-2 py-1 text-xs border border-slate-200 dark:border-slate-800 hover:bg-slate-50 rounded-lg"
                          >
                            Close
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingIntentId(intent.id)}
                          className="px-2 py-1 border border-dashed border-slate-300 dark:border-slate-700 text-slate-450 hover:text-slate-700 rounded-lg text-[11px] font-semibold"
                        >
                          + Add Phrase
                        </button>
                      )}
                    </div>
                  </div>

                  {intent.slots.length > 0 && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Entity Slots (Variables)</span>
                      <div className="space-y-1.5">
                        {intent.slots.map((slot, i) => (
                          <div key={i} className="flex items-start justify-between text-xs p-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl">
                            <div>
                              <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">@{slot.name}</span>
                              <span className="text-slate-450 text-[10px] ml-1.5">({slot.type})</span>
                              <p className="text-[10px] text-slate-500 mt-1 font-normal italic">Prompt: "{slot.prompt}"</p>
                            </div>
                            {slot.required && (
                              <span className="text-[9px] uppercase font-bold text-rose-500 font-mono">REQUIRED</span>
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
              <h3 className="font-bold text-xs text-slate-650 dark:text-slate-400 uppercase font-mono tracking-wider">Suggested Intents (AI Discovery)</h3>
              <p className="text-xs text-slate-500">The LLM identified cluster phrases that do not match existing intents. Promote them to save time.</p>
              
              <div className="space-y-3 pt-2">
                {[
                  { name: 'change_shipping_address', count: 142, phrase: 'Send my package to another address' },
                  { name: 'promo_code_issue', count: 88, phrase: 'Coupon code not working on checkout' }
                ].map((sug, i) => (
                  <div key={i} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-3.5 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800 dark:text-white font-mono">#{sug.name}</span>
                      <span className="font-mono text-slate-400 font-bold">{sug.count} hits</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Sample: "{sug.phrase}"</p>
                    <button
                      onClick={() => {
                        const newInt: Intent = {
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
                        setIntents((prev) => [...prev, newInt]);
                        addAuditLog(`Approved suggested intent: ${sug.name}`, 'success');
                      }}
                      className="w-full py-1 text-[10px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    >
                      Promote to Intent
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    case 'dialog_flow':
      return <DialogFlowLayout />;

    case 'knowledge_base':
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">RAG Knowledge Ingestion</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">Inject PDFs, sync Confluence wikis, modify chunking size, and track indexing databases.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sources list */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                <h3 className="font-bold text-xs text-slate-650 dark:text-slate-400 uppercase font-mono mb-4">Indexing Knowledge Sources</h3>
                <div className="space-y-4">
                  {knowledgeSources.map((src) => (
                    <div
                      key={src.id}
                      className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-2xl hover:border-slate-200 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                          <Brain className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white">{src.name}</h4>
                          <div className="flex gap-3 text-[10px] text-slate-450 mt-1 font-mono">
                            <span>Chunks: <strong className="text-slate-700 dark:text-slate-350">{src.chunkCount}</strong></span>
                            <span>Type: <strong className="uppercase">{src.type}</strong></span>
                            {src.sizeBytes ? (
                              <span>Size: <strong>{(src.sizeBytes / 1000000).toFixed(2)} MB</strong></span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {src.status === 'syncing' ? (
                          <div className="flex items-center gap-1.5 text-blue-500 text-[10px] font-bold font-mono">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>INDEXING...</span>
                          </div>
                        ) : src.status === 'error' ? (
                          <div className="flex items-center gap-1.5 text-rose-500 text-[10px] font-bold font-mono">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>ERROR</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">Synced: {src.lastIngested}</span>
                        )}

                        <button
                          disabled={src.status === 'syncing'}
                          onClick={() => handleSyncSource(src.id)}
                          className="px-3 py-1.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                        >
                          Sync
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chunking config */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="font-bold text-xs text-slate-650 dark:text-slate-400 uppercase font-mono">Chunking & Embedding Configurations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                  <div>
                    <label className="block text-xs font-bold text-slate-450 uppercase font-mono mb-1.5">Embedding Model</label>
                    <select className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none">
                      <option>text-embedding-3-small (1536-dim)</option>
                      <option>text-embedding-3-large (3072-dim)</option>
                      <option>Cohere Multilingual v3</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-450 uppercase font-mono mb-1.5">Overlap Size</label>
                    <input
                      type="number"
                      defaultValue={128}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Ingestion logs timeline */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 h-fit">
              <h3 className="font-bold text-xs text-slate-650 dark:text-slate-400 uppercase font-mono">Ingestion Audit Timeline</h3>
              <div className="space-y-3.5">
                {ingestionLogs.map((log) => (
                  <div key={log.id} className="border-l-2 border-slate-100 dark:border-slate-800 pl-3.5 space-y-1 relative">
                    <div className="absolute -left-1.5 top-1 w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-800" />
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-slate-800 dark:text-white truncate max-w-[130px]" title={log.sourceName}>
                        {log.sourceName}
                      </span>
                      <span className="font-mono text-slate-400">{log.timestamp.substring(11, 16)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-semibold">
                      <span className={`px-1.5 py-0.5 rounded font-bold font-mono ${
                        log.status === 'success'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400'
                          : log.status === 'processing'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-400'
                      }`}>
                        {log.status.toUpperCase()}
                      </span>
                      {log.chunksCount > 0 && (
                        <span className="text-slate-450 font-mono">+{log.chunksCount} chunks</span>
                      )}
                    </div>
                    {log.errorDetail && (
                      <p className="text-[9px] text-rose-500 font-mono mt-1 leading-normal italic bg-rose-500/5 p-1.5 rounded-lg">
                        {log.errorDetail}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    case 'guardrails':
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Safety & Guardrails Config</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">Configure PII filters, toxic prompt sanitizers, and RAG hallucinations thresholds.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm">
            {/* PII Masking Section */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-500" />
                PII Masking & Privacy Filters
              </h3>
              <p className="text-xs text-slate-500 leading-normal">
                Strict PII filters replace sensitive customer metrics (e.g. credit cards, passport, emails) with generic placeholder tokens before requests hit third-party LLMs.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  { label: 'Filter Visa/Mastercard Numbers', active: true },
                  { label: 'Filter Email Addresses', active: true },
                  { label: 'Filter Saudi National IDs / Civil Registry', active: true },
                  { label: 'Filter Cell Phone Numbers', active: false }
                ].map((pii, idx) => (
                  <label key={idx} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl cursor-pointer hover:border-slate-200 text-xs font-semibold">
                    <input type="checkbox" defaultChecked={pii.active} className="rounded border-slate-350 text-blue-600 focus:ring-blue-550" />
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
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-450">PII Leaks / Hallucination Limit</span>
                    <span>0.88 Threshold</span>
                  </div>
                  <input type="range" min="50" max="100" defaultValue="88" className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer" />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-450">Toxicity Prompt Score</span>
                    <span>0.65 Threshold</span>
                  </div>
                  <input type="range" min="50" max="100" defaultValue="65" className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer" />
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'channels':
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Omnichannel Customizer</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">Enable integration keys, register WhatsApp webhook credentials, and configure Web Chat Widgets.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Widget config widget */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                <Grid className="w-5 h-5 text-blue-500" />
                Web Chat Widget Options
              </h3>
              
              <div className="space-y-3.5 text-xs font-semibold">
                <div>
                  <label className="block text-slate-450 mb-1.5 font-mono text-[10px] uppercase">Widget Primary Color</label>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 border border-white cursor-pointer shadow-sm" />
                    <div className="w-8 h-8 rounded-lg bg-emerald-650 cursor-pointer" />
                    <div className="w-8 h-8 rounded-lg bg-violet-600 cursor-pointer" />
                    <input type="text" defaultValue="#2563eb" className="px-3 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg font-mono text-[11px]" />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-450 mb-1.5 font-mono text-[10px] uppercase">Bot Greeting Message (EN)</label>
                  <input type="text" defaultValue="Hello! I am Farah. How can I help you today?" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none" />
                </div>
                <div>
                  <label className="block text-slate-450 mb-1.5 font-mono text-[10px] uppercase">Bot Greeting Message (AR)</label>
                  <input type="text" defaultValue="مرحباً! أنا فرح المساعد الذكي. كيف يمكنني مساعدتك؟" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none" />
                </div>
              </div>
            </div>

            {/* WhatsApp templates */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                <Phone className="w-5 h-5 text-emerald-500" />
                WhatsApp Message Templates
              </h3>
              
              <div className="space-y-3">
                {[
                  { name: 'order_delivery_update', status: 'approved', lang: 'ar/en' },
                  { name: 'refund_issued_receipt', status: 'approved', lang: 'ar/en' },
                  { name: 'ticket_escalation_alert', status: 'pending', lang: 'en' }
                ].map((tpl, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl text-xs font-semibold">
                    <div>
                      <span className="font-mono text-slate-800 dark:text-white font-bold">{tpl.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono ml-2">({tpl.lang})</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                      tpl.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
                    }`}>
                      {tpl.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    case 'agents':
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Queues & Agent Roster</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">Monitor active live queues, agent allocation targets, and real-time support rosters.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {agents.map((agent) => (
              <div key={agent.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-start justify-between">
                <div className="flex gap-3">
                  <img src={agent.avatarUrl} alt={agent.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                  <div>
                    <h4 className="font-bold text-xs text-slate-800 dark:text-white">{agent.name}</h4>
                    <span className="text-[10px] text-slate-450 block font-mono">{agent.email}</span>
                    
                    <div className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
                      <span className="text-slate-400">Chats: <strong className="text-slate-700 dark:text-slate-350">{agent.activeChatsCount}/{agent.maxChatsCount}</strong></span>
                      <span className="text-slate-400">CSAT Score: <strong className="text-emerald-500">{agent.csatScore}%</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between h-full">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono ${
                    agent.status === 'online'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400'
                      : agent.status === 'busy'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
                  }`}>
                    {agent.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'sla':
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">SLA Dashboard Policies</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">Configure corporate response SLAs, resolution deadline limits, and email notification paths.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-xs text-slate-650 dark:text-slate-400 uppercase font-mono">Configured SLA Targets</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-805 text-slate-400 font-bold pb-2">
                    <th className="pb-3">Policy Priority</th>
                    <th className="pb-3">Response Limit</th>
                    <th className="pb-3">Resolution Limit</th>
                    <th className="pb-3">Targets Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-805 text-slate-600 dark:text-slate-350">
                  {slaRules.map((rule) => (
                    <tr key={rule.id}>
                      <td className="py-3.5 font-bold uppercase text-slate-900 dark:text-white font-mono">{rule.priority}</td>
                      <td className="py-3.5 font-mono">{rule.responseTimeMins} mins</td>
                      <td className="py-3.5 font-mono">{rule.resolutionTimeMins} mins</td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                          rule.active
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400'
                            : 'bg-slate-100 text-slate-550'
                        }`}>
                          {rule.active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );

    case 'deployments':
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Pipelines & A/B Testing</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">Deploy bot revisions to staging environments and configure client traffic splitting.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-850 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              A/B Traffic Configurations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
              <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-900 rounded-2xl">
                <span className="font-bold text-blue-600 dark:text-blue-400 font-mono block">Variant A (Control): Farah AI v2.2</span>
                <span className="text-[10px] text-slate-400 mt-1 block">Traffic Weight: 80%</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-900 rounded-2xl">
                <span className="font-bold text-purple-600 dark:text-purple-400 font-mono block">Variant B (Challenger): Farah-DeepSeek Core</span>
                <span className="text-[10px] text-slate-400 mt-1 block">Traffic Weight: 20%</span>
              </div>
            </div>
          </div>
        </div>
      );

    case 'integrations':
      return <IntegrationsDashboard />;

    case 'surveys':
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-850 dark:text-white">Voice of Customer & CSAT</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">Aggregate satisfaction indexes, net promoter logs, and customer feedback trends.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SVGDonutChart
              data={[72, 18, 10]}
              labels={['Positive', 'Neutral', 'Negative']}
              colors={['#10b981', '#6b7280', '#f43f5e']}
              title="Customer Satisfaction (CSAT) Breakdown"
            />
            <SVGLineChart
              data={[84, 86, 89, 91, 92]}
              labels={['Jan', 'Feb', 'Mar', 'Apr', 'May']}
              title="Net Promoter Score (NPS) Trend"
              gradientColor="#a855f7"
            />
          </div>
        </div>
      );

    default:
      return (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <AlertTriangle className="w-10 h-10 mb-2 opacity-50" />
          <span>Section not implemented</span>
        </div>
      );
  }
}
