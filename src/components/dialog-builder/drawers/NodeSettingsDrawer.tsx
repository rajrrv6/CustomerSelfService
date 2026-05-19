import React, { useState } from 'react';
import { WorkflowNode } from '@/data/seed/workflowSeed';
import { X, Plus, Trash2, Settings } from 'lucide-react';

interface NodeSettingsDrawerProps {
  node: WorkflowNode | null;
  onClose: () => void;
  onUpdateConfig: (id: string, config: Partial<WorkflowNode['config']>) => void;
  onUpdateName: (id: string, name: string) => void;
}

export function NodeSettingsDrawer({ node, onClose, onUpdateConfig, onUpdateName }: NodeSettingsDrawerProps) {
  const [nodeName, setNodeName] = useState(node?.name || '');
  const [outputText, setOutputText] = useState(node?.config?.outputText || '');

  // Node specific temp state
  const [intentName, setIntentName] = useState(node?.config?.intentName || '');
  const [apiUrl, setApiUrl] = useState(node?.config?.apiUrl || '');
  const [apiMethod, setApiMethod] = useState<'GET' | 'POST'>(node?.config?.apiMethod || 'GET');
  const [apiPayload, setApiPayload] = useState(node?.config?.apiPayload || '');
  const [dbTargetTable, setDbTargetTable] = useState(node?.config?.dbTargetTable || '');
  const [dbQuery, setDbQuery] = useState(node?.config?.dbQuery || '');
  const [ragSource, setRagSource] = useState(node?.config?.ragSource || '');
  const [ragMinConfidence, setRagMinConfidence] = useState(node?.config?.ragMinConfidence || 0.85);
  const [handoffQueue, setHandoffQueue] = useState(node?.config?.handoffQueue || '');
  const [delaySeconds, setDelaySeconds] = useState(node?.config?.delaySeconds || 3);

  // Lists state
  const [utterances, setUtterances] = useState<string[]>(node?.config?.utterances || []);
  const [newUtterance, setNewUtterance] = useState('');

  const [formFields, setFormFields] = useState<Array<{ name: string; type: 'text' | 'number' | 'email'; required: boolean; prompt: string }>>(node?.config?.formFields || []);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'number' | 'email'>('text');
  const [newFieldPrompt, setNewFieldPrompt] = useState('');

  const [branchConditions, setBranchConditions] = useState<Array<{ condition: string; targetNodeId: string }>>(node?.config?.branchConditions || []);
  const [newCondExpr, setNewCondExpr] = useState('');
  const [newCondTarget, setNewCondTarget] = useState('');

  const [carouselItems, setCarouselItems] = useState<Array<{ title: string; subtitle: string }>>(node?.config?.carouselItems || []);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardSubtitle, setNewCardSubtitle] = useState('');

  if (!node) return null;

  const handleSave = () => {
    onUpdateName(node.id, nodeName);
    onUpdateConfig(node.id, {
      outputText,
      intentName,
      apiUrl,
      apiMethod,
      apiPayload,
      dbTargetTable,
      dbQuery,
      ragSource,
      ragMinConfidence,
      handoffQueue,
      delaySeconds,
      utterances,
      formFields,
      branchConditions,
      carouselItems
    });
    onClose();
  };

  return (
    <div className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-full flex flex-col shrink-0 text-xs font-semibold shadow-xl z-20 overflow-hidden animate-slide-in">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
        <div className="flex items-center gap-1.5 text-slate-800 dark:text-white">
          <Settings className="w-4 h-4 text-blue-500" />
          <h3 className="font-bold">Node Configurations</h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Inputs container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Name */}
        <div>
          <label className="block text-slate-450 uppercase text-[9px] font-bold tracking-wider mb-1">Display Label</label>
          <input
            type="text"
            value={nodeName}
            onChange={(e) => setNodeName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none"
          />
        </div>

        {/* Output Statement Text */}
        <div>
          <label className="block text-slate-450 uppercase text-[9px] font-bold tracking-wider mb-1">Bot Speech Output</label>
          <textarea
            rows={2}
            value={outputText}
            onChange={(e) => setOutputText(e.target.value)}
            placeholder="Greeting speech content..."
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none text-[11px]"
          />
        </div>

        {/* Intent specific config */}
        {node.type === 'intent' && (
          <div className="space-y-3 pt-2 border-t border-slate-150 dark:border-slate-800/80">
            <div>
              <label className="block text-slate-450 uppercase text-[9px] font-bold tracking-wider mb-1">Trigger Intent Name</label>
              <input
                type="text"
                value={intentName}
                onChange={(e) => setIntentName(e.target.value)}
                placeholder="e.g. request_refund"
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-450 uppercase text-[9px] font-bold tracking-wider mb-1.5">Utterances Training list</label>
              <div className="space-y-1.5">
                {utterances.map((ut, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-900">
                    <span className="truncate max-w-[190px]">&quot;{ut}&quot;</span>
                    <button onClick={() => setUtterances(utterances.filter((_, i) => i !== idx))} className="text-rose-500 hover:text-rose-700">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-1.5 mt-1.5">
                  <input
                    type="text"
                    value={newUtterance}
                    onChange={(e) => setNewUtterance(e.target.value)}
                    placeholder="New sample..."
                    className="flex-1 px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none text-[11px]"
                  />
                  <button
                    onClick={() => {
                      if (!newUtterance) return;
                      setUtterances([...utterances, newUtterance]);
                      setNewUtterance('');
                    }}
                    className="p-2 bg-blue-650 text-white rounded-xl"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* API Hook Settings */}
        {node.type === 'api' && (
          <div className="space-y-3 pt-2 border-t border-slate-150 dark:border-slate-800/80">
            <div>
              <label className="block text-slate-450 uppercase text-[9px] font-bold tracking-wider mb-1">HTTP Method</label>
              <select
                value={apiMethod}
                onChange={(e) => setApiMethod(e.target.value as 'GET' | 'POST')}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-450 uppercase text-[9px] font-bold tracking-wider mb-1">Target Gateway URL</label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://api.stripe.com/..."
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none font-mono text-[10px]"
              />
            </div>

            {apiMethod === 'POST' && (
              <div>
                <label className="block text-slate-450 uppercase text-[9px] font-bold tracking-wider mb-1">JSON Payload Body</label>
                <textarea
                  rows={4}
                  value={apiPayload}
                  onChange={(e) => setApiPayload(e.target.value)}
                  placeholder="{}"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none font-mono text-[10px]"
                />
              </div>
            )}
          </div>
        )}

        {/* Database queries settings */}
        {node.type === 'db' && (
          <div className="space-y-3 pt-2 border-t border-slate-150 dark:border-slate-800/80">
            <div>
              <label className="block text-slate-450 uppercase text-[9px] font-bold tracking-wider mb-1">Target DB Table</label>
              <input
                type="text"
                value={dbTargetTable}
                onChange={(e) => setDbTargetTable(e.target.value)}
                placeholder="refund_audit_ledger"
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-450 uppercase text-[9px] font-bold tracking-wider mb-1">SQL Query Code</label>
              <textarea
                rows={3}
                value={dbQuery}
                onChange={(e) => setDbQuery(e.target.value)}
                placeholder="INSERT INTO ledger..."
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none font-mono text-[10px]"
              />
            </div>
          </div>
        )}

        {/* RAG Knowledge base settings */}
        {node.type === 'rag' && (
          <div className="space-y-3 pt-2 border-t border-slate-150 dark:border-slate-800/80">
            <div>
              <label className="block text-slate-450 uppercase text-[9px] font-bold tracking-wider mb-1">Select Knowledge Resource</label>
              <input
                type="text"
                value={ragSource}
                onChange={(e) => setRagSource(e.target.value)}
                placeholder="Standard Return & Exchange Policy PDF"
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-450 uppercase text-[9px] font-bold tracking-wider mb-1">Minimum Retrieval Match Score</label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={ragMinConfidence}
                onChange={(e) => setRagMinConfidence(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none font-mono"
              />
            </div>
          </div>
        )}

        {/* Branch settings */}
        {node.type === 'branch' && (
          <div className="space-y-3 pt-2 border-t border-slate-150 dark:border-slate-800/80">
            <label className="block text-slate-450 uppercase text-[9px] font-bold tracking-wider mb-1">Routing Branches Expressions</label>
            <div className="space-y-2">
              {branchConditions.map((cond, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-900 font-mono text-[10px]">
                  <div>
                    <span className="block text-[8px] text-slate-450 uppercase">Rule</span>
                    <strong className="text-violet-650 truncate block max-w-[120px]">{cond.condition}</strong>
                    <span className="block text-[8px] text-slate-450 uppercase mt-0.5">Target node</span>
                    <span className="truncate block max-w-[120px]">{cond.targetNodeId}</span>
                  </div>
                  <button onClick={() => setBranchConditions(branchConditions.filter((_, i) => i !== idx))} className="text-rose-500 hover:text-rose-700">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <div className="bg-slate-50/50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-150 dark:border-slate-850 space-y-2">
                <input
                  type="text"
                  value={newCondExpr}
                  onChange={(e) => setNewCondExpr(e.target.value)}
                  placeholder="invoice.amount > 1000"
                  className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg focus:outline-none font-mono text-[11px]"
                />
                <input
                  type="text"
                  value={newCondTarget}
                  onChange={(e) => setNewCondTarget(e.target.value)}
                  placeholder="node-rag-kb"
                  className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg focus:outline-none font-mono text-[11px]"
                />
                <button
                  onClick={() => {
                    if (!newCondExpr || !newCondTarget) return;
                    setBranchConditions([...branchConditions, { condition: newCondExpr, targetNodeId: newCondTarget }]);
                    setNewCondExpr('');
                    setNewCondTarget('');
                  }}
                  className="w-full py-1 bg-violet-600 hover:bg-violet-750 text-white rounded-lg text-[10px] font-bold"
                >
                  Add Branch Path
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Handoff queue settings */}
        {node.type === 'handoff' && (
          <div className="space-y-3 pt-2 border-t border-slate-150 dark:border-slate-800/80">
            <div>
              <label className="block text-slate-450 uppercase text-[9px] font-bold tracking-wider mb-1">Queue Name</label>
              <input
                type="text"
                value={handoffQueue}
                onChange={(e) => setHandoffQueue(e.target.value)}
                placeholder="VIP Support Queue"
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Delay timer settings */}
        {node.type === 'delay' && (
          <div className="space-y-3 pt-2 border-t border-slate-150 dark:border-slate-800/80">
            <div>
              <label className="block text-slate-450 uppercase text-[9px] font-bold tracking-wider mb-1">Wait Duration (seconds)</label>
              <input
                type="number"
                value={delaySeconds}
                onChange={(e) => setDelaySeconds(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none font-mono"
              />
            </div>
          </div>
        )}

        {/* Forms Node configurations */}
        {node.type === 'form' && (
          <div className="space-y-3 pt-2 border-t border-slate-150 dark:border-slate-800/80">
            <label className="block text-slate-450 uppercase text-[9px] font-bold tracking-wider mb-1">Interactive Form Fields</label>
            <div className="space-y-2">
              {formFields.map((f, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-900 text-[10px]">
                  <div>
                    <span className="block font-mono font-bold text-cyan-650">@{f.name} ({f.type})</span>
                    <span className="block text-slate-450 italic mt-0.5">Prompt: &quot;{f.prompt}&quot;</span>
                  </div>
                  <button onClick={() => setFormFields(formFields.filter((_, i) => i !== idx))} className="text-rose-500 hover:text-rose-700">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <div className="bg-slate-50/50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-150 dark:border-slate-850 space-y-2">
                <input
                  type="text"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  placeholder="Variable name (e.g. refundReason)"
                  className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg focus:outline-none font-mono text-[11px]"
                />
                <select
                  value={newFieldType}
                  onChange={(e) => setNewFieldType(e.target.value as 'text' | 'number' | 'email')}
                  className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg focus:outline-none text-[11px]"
                >
                  <option value="text">text</option>
                  <option value="number">number</option>
                  <option value="email">email</option>
                </select>
                <input
                  type="text"
                  value={newFieldPrompt}
                  onChange={(e) => setNewFieldPrompt(e.target.value)}
                  placeholder="System response prompt text..."
                  className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg focus:outline-none text-[11px]"
                />
                <button
                  onClick={() => {
                    if (!newFieldName || !newFieldPrompt) return;
                    setFormFields([...formFields, { name: newFieldName, type: newFieldType, required: true, prompt: newFieldPrompt }]);
                    setNewFieldName('');
                    setNewFieldPrompt('');
                  }}
                  className="w-full py-1 bg-cyan-600 hover:bg-cyan-750 text-white rounded-lg text-[10px] font-bold"
                >
                  Add Slot Field
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Carousel response configurations */}
        {node.type === 'carousel' && (
          <div className="space-y-3 pt-2 border-t border-slate-150 dark:border-slate-800/80">
            <label className="block text-slate-450 uppercase text-[9px] font-bold tracking-wider mb-1">Carousel Card Options</label>
            <div className="space-y-2">
              {carouselItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-900 text-[10px]">
                  <div>
                    <strong className="block text-fuchsia-650">{item.title}</strong>
                    <span className="block text-slate-400 text-[9px] mt-0.5">{item.subtitle}</span>
                  </div>
                  <button onClick={() => setCarouselItems(carouselItems.filter((_, i) => i !== idx))} className="text-rose-500 hover:text-rose-700">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <div className="bg-slate-50/50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-150 dark:border-slate-850 space-y-2">
                <input
                  type="text"
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  placeholder="Card Title (e.g. 10% Refund)"
                  className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg focus:outline-none text-[11px]"
                />
                <input
                  type="text"
                  value={newCardSubtitle}
                  onChange={(e) => setNewCardSubtitle(e.target.value)}
                  placeholder="Description..."
                  className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg focus:outline-none text-[11px]"
                />
                <button
                  onClick={() => {
                    if (!newCardTitle) return;
                    setCarouselItems([...carouselItems, { title: newCardTitle, subtitle: newCardSubtitle }]);
                    setNewCardTitle('');
                    setNewCardSubtitle('');
                  }}
                  className="w-full py-1 bg-fuchsia-600 hover:bg-fuchsia-750 text-white rounded-lg text-[10px] font-bold"
                >
                  Add Card Item
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save action button footer */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-2 bg-slate-50 dark:bg-slate-950">
        <button onClick={onClose} className="flex-1 py-2 text-center rounded-xl bg-slate-100 hover:bg-slate-250 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
          Cancel
        </button>
        <button onClick={handleSave} className="flex-1 py-2 text-center text-white bg-blue-600 hover:bg-blue-700 rounded-xl">
          Apply Settings
        </button>
      </div>
    </div>
  );
}
