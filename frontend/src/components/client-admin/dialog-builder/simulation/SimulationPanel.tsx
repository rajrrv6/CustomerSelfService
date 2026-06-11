'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDialogStore, initialVariables } from '../store/useDialogStore';
import { useUIStore } from '@/stores/uiStore';
import { translations } from '@/i18n/translations';
import { ExecutionConsole } from './ExecutionConsole';
import { evaluateCondition, resolveTemplate } from './GraphExecutionRunner';
import {
  Play, StopCircle, SkipForward, RefreshCw, Send,
  Sliders, MessageSquare, Terminal, Eye, AlertCircle
} from 'lucide-react';
import { ChatMessage, SimulationLog } from '../types';
import { triggerApiTimeout, triggerAiDegradation, triggerSlaBreach } from '@/stores/notifications/notificationEvents';

export function SimulationPanel() {
  const lang = useUIStore((s) => s.lang);
  const isAr = lang === 'ar';
  const t = translations[lang];

  // Zustand selectors
  const nodes = useDialogStore((s) => s.nodes);
  const edges = useDialogStore((s) => s.edges);
  
  const isSimulating = useDialogStore((s) => s.isSimulating);
  const activeSimNodeId = useDialogStore((s) => s.activeSimNodeId);
  const simVariables = useDialogStore((s) => s.simVariables);
  const simulationMode = useDialogStore((s) => s.simulationMode);
  const chatHistory = useDialogStore((s) => s.simChatHistory);
  const simWaitingForInput = useDialogStore((s) => s.simWaitingForInput);
  const simInputPrompt = useDialogStore((s) => s.simInputPrompt);

  const startSimulation = useDialogStore((s) => s.startSimulation);
  const stopSimulation = useDialogStore((s) => s.stopSimulation);
  const setSimVariable = useDialogStore((s) => s.setSimVariable);
  const resetSimVariables = useDialogStore((s) => s.resetSimVariables);

  // Local text input for simulator chat
  const [userInput, setUserInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const addLog = (type: SimulationLog['type'], nodeId: string, nodeName: string, message: string) => {
    useDialogStore.setState((state) => ({
      simLogs: [
        ...state.simLogs,
        {
          nodeId,
          nodeName,
          type,
          message,
          timestamp: new Date().toLocaleTimeString()
        }
      ]
    }));
  };

  const addChatMessage = (sender: ChatMessage['sender'], text: string) => {
    useDialogStore.setState((state) => ({
      simChatHistory: [
        ...state.simChatHistory,
        {
          sender,
          text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    }));
  };

  const handleStep = () => {
    if (!activeSimNodeId) return;

    const currentNode = nodes.find((n) => n.id === activeSimNodeId);
    if (!currentNode) {
      addLog('error', activeSimNodeId, 'System', `Execution interrupted: Node ID ${activeSimNodeId} not found.`);
      return;
    }

    const nodeName = isAr ? currentNode.data.labelAr : currentNode.data.labelEn;

    // Check if we are currently waiting for slot-filling input
    if (simWaitingForInput) {
      addLog('warning', currentNode.id, nodeName, `Halted: Waiting for customer slot input.`);
      return;
    }

    // Process current node side effects
    let nextNodeId: string | null = null;
    let transitionHandle: string | undefined = undefined;

    switch (currentNode.type) {
      case 'start': {
        const msg = isAr ? currentNode.data.config.startMessageAr : currentNode.data.config.startMessageEn;
        addLog('info', currentNode.id, nodeName, 'Starting flow gateway routing.');
        if (msg) addChatMessage('bot', msg);
        break;
      }
      case 'intent': {
        const intent = currentNode.data.config.intentName || 'request_refund';
        const msg = isAr ? currentNode.data.config.intentOutputTextAr : currentNode.data.config.intentOutputTextEn;
        addLog('info', currentNode.id, nodeName, `Intent triggered: #${intent} (Confidence: ${simVariables.intent_confidence || '0.85'}).`);
        if (msg) addChatMessage('bot', msg);
        break;
      }
      case 'message': {
        const rawTemplate = isAr ? currentNode.data.config.messageAr : currentNode.data.config.messageEn;
        const resolvedText = resolveTemplate(rawTemplate || '', simVariables);
        
        // Scan if this template references variables that are currently EMPTY
        const emptyVarMatch = rawTemplate?.match(/\{\{([a-zA-Z0-9_]+)\}\}/);
        if (emptyVarMatch && !simVariables[emptyVarMatch[1]]) {
          const varName = emptyVarMatch[1];
          useDialogStore.setState({
            simWaitingForInput: true,
            simInputPrompt: varName
          });
          addLog('warning', currentNode.id, nodeName, `Slot Filling active. Paused to collect customer input for {{${varName}}}.`);
          addChatMessage('bot', isAr ? `يرجى تزويدي بـ ${varName}:` : `Please supply your ${varName.replace('_', ' ')}:`);
          return;
        }

        addLog('info', currentNode.id, nodeName, `Sent message: "${resolvedText}"`);
        addChatMessage('bot', resolvedText);
        break;
      }
      case 'condition': {
        const conditions = currentNode.data.config.conditions || [];
        addLog('info', currentNode.id, nodeName, 'Evaluating conditional branches.');

        let matched = false;
        for (const cond of conditions) {
          const varVal = simVariables[cond.variable] || '';
          const result = evaluateCondition(varVal, cond.operator, cond.value);
          addLog('info', currentNode.id, nodeName, `Checking rule: If {{${cond.variable}}} (${varVal}) ${cond.operator} "${cond.value}" -> Result: ${result.toString().toUpperCase()}`);
          
          if (result) {
            transitionHandle = cond.targetHandleId;
            matched = true;
            break;
          }
        }

        if (!matched) {
          addLog('info', currentNode.id, nodeName, 'No rules matched. Executing default fallback path.');
          transitionHandle = 'fallback';
        }
        break;
      }
      case 'api_action': {
        const url = currentNode.data.config.apiUrl || '';
        const method = currentNode.data.config.apiMethod || 'GET';
        addLog('info', currentNode.id, nodeName, `REST API: Dispatching ${method} request to endpoint: ${url}`);

        if (simulationMode === 'api_timeout') {
          addLog('error', currentNode.id, nodeName, 'API timeout limit breached (5000ms). Network request failed.');
          triggerApiTimeout(url || '/api/v2/sap-erp', '5000ms');
          transitionHandle = 'failure';
        } else {
          addLog('success', currentNode.id, nodeName, 'API response 200 OK. Payload successfully fetched.');
          transitionHandle = 'success';
        }
        break;
      }
      case 'variable_set': {
        const key = currentNode.data.config.variableKey;
        const val = currentNode.data.config.variableValue || '';
        if (key) {
          setSimVariable(key, val);
          addLog('success', currentNode.id, nodeName, `Assigned context state variable: {{${key}}} = "${val}"`);
        }
        break;
      }
      case 'delay': {
        const sec = currentNode.data.config.delaySeconds || 3;
        addLog('info', currentNode.id, nodeName, `Delaying workflow thread execution for ${sec} seconds.`);
        addChatMessage('system', `Sleeping for ${sec}s...`);
        break;
      }
      case 'knowledge_search': {
        const src = currentNode.data.config.kbSource || 'General FAQ';
        const limit = currentNode.data.config.kbMinConfidence || 0.75;
        addLog('info', currentNode.id, nodeName, `Scanning vectorized KB repository: "${src}" (Threshold limit: ${limit})`);

        if (simulationMode === 'low_confidence') {
          addLog('warning', currentNode.id, nodeName, 'Search failed: NLU vector match confidence was 0.42 (low confidence).');
          triggerAiDegradation(0.42, 'RAG Search Engine');
          transitionHandle = 'not_found';
        } else {
          addLog('success', currentNode.id, nodeName, 'Search success: Found direct match: "Section 4.1 refund allowance policies" (Confidence 0.94).');
          addChatMessage('bot', isAr ? 'بحسب سياسة الاسترجاع: يحق للعملاء استرداد الأموال للطلبات التالفة.' : 'Knowledge matched: Refund requests are authorized for shipment damages.');
          transitionHandle = 'found';
        }
        break;
      }
      case 'human_handoff': {
        const queue = currentNode.data.config.handoffQueue || 'General Pool';
        addLog('success', currentNode.id, nodeName, `Handoff complete. Thread routed directly to live workspace queue: "${queue}".`);
        addChatMessage('system', `Routed to queue: ${queue}`);
        addChatMessage('bot', isAr ? `جاري تحويلك الآن لممثل خدمة عملاء متخصص في طابور ${queue}.` : `Please wait while I route your session directly to a live representative in the ${queue}.`);
        useDialogStore.setState({ activeSimNodeId: null, isSimulating: false });
        return;
      }
      case 'escalation': {
        const queue = currentNode.data.config.escalationQueue || 'VIP Support';
        const prio = currentNode.data.config.escalationPriority || 'medium';
        addLog('error', currentNode.id, nodeName, `CRITICAL: SLA breach warning. Handoff lock committed. Queue: ${queue} (${prio.toUpperCase()}).`);
        addChatMessage('system', `SLA Breach: Escalated to priority ${prio} in ${queue}`);
        triggerSlaBreach(queue, '19m 15s', '15m');
        useDialogStore.setState({ activeSimNodeId: null, isSimulating: false });
        return;
      }
      case 'end': {
        const endMsg = isAr ? currentNode.data.config.endMessageAr : currentNode.data.config.endMessageEn;
        if (endMsg) addChatMessage('bot', endMsg);
        if (currentNode.data.config.triggerCSAT) {
          addChatMessage('system', 'CSAT Survey Triggered (1-5 Star Ratings Prompt)');
        }
        addLog('success', currentNode.id, nodeName, 'Reached terminal End Node. Workflow completed successfully.');
        useDialogStore.setState({ activeSimNodeId: null, isSimulating: false });
        return;
      }
      default:
        break;
    }

    // Determine next node by edges matching output handles
    const outgoingEdges = edges.filter((e) => e.source === currentNode.id);
    if (outgoingEdges.length === 0) {
      addLog('warning', currentNode.id, nodeName, 'Halted: Workflow reached a dead end with no outgoing connections.');
      useDialogStore.setState({ activeSimNodeId: null, isSimulating: false });
      return;
    }

    // Match edge with specific sourceHandle if defined
    let targetEdge = outgoingEdges[0];
    if (transitionHandle) {
      const matchedEdge = outgoingEdges.find((e) => e.sourceHandle === transitionHandle);
      if (matchedEdge) {
        targetEdge = matchedEdge;
      } else {
        addLog('error', currentNode.id, nodeName, `Routing failure: Outgoing port connection for "${transitionHandle}" is not wired.`);
        useDialogStore.setState({ activeSimNodeId: null, isSimulating: false });
        return;
      }
    }

    nextNodeId = targetEdge.target;
    const nextNode = nodes.find((n) => n.id === nextNodeId);

    if (nextNode) {
      const nextName = isAr ? nextNode.data.labelAr : nextNode.data.labelEn;
      addLog('info', currentNode.id, nodeName, `Transitioning to node: "${nextName}"`);
      useDialogStore.setState({ activeSimNodeId: nextNode.id });
    } else {
      addLog('error', currentNode.id, nodeName, `Transition failure: Target node ID "${nextNodeId}" does not exist.`);
      useDialogStore.setState({ activeSimNodeId: null, isSimulating: false });
    }
  };

  const handleSendInput = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !simWaitingForInput || !activeSimNodeId) return;

    const value = userInput.trim();
    addChatMessage('user', value);
    setUserInput('');

    // Assign the input to the paused slot variable
    if (simInputPrompt) {
      setSimVariable(simInputPrompt, value);
      const currentNode = nodes.find((n) => n.id === activeSimNodeId);
      const nodeName = currentNode ? (isAr ? currentNode.data.labelAr : currentNode.data.labelEn) : 'Message';
      addLog('success', activeSimNodeId, nodeName, `User input matched slot: {{${simInputPrompt}}} = "${value}"`);
    }

    // Unpause simulation
    useDialogStore.setState({
      simWaitingForInput: false,
      simInputPrompt: ''
    });

    // Automatically trigger next step after typing delay
    setTimeout(() => {
      handleStep();
    }, 500);
  };

  return (
    <div
      className="w-80 bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden shrink-0"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Header controls */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
        <div>
          <h3 className="text-xs font-black uppercase font-sans text-slate-800 dark:text-slate-100 flex items-center gap-1">
            <Eye className="w-4 h-4 text-blue-500" />
            <span>{isAr ? 'محاكي الحوار التفاعلي' : 'Interactive Flow Simulator'}</span>
          </h3>
          <span className="text-[9px] text-slate-400 font-bold block mt-0.5">
            {isAr ? 'تتبع خطوات العميل وفحص المتغيرات' : 'Run step-by-step client actions'}
          </span>
        </div>

        {isSimulating && (
          <button
            onClick={handleStep}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold shadow-sm transition-all"
            title={isAr ? 'الخطوة التالية' : 'Next Step'}
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>{isAr ? 'خطوة' : 'Step'}</span>
          </button>
        )}
      </div>

      {/* Simulator Body */}
      <div className="flex-1 flex flex-col min-h-0 p-4 gap-4 overflow-y-auto">
        {/* Chat log window */}
        <div className="flex-1 min-h-48 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-inner flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {chatHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-655 text-center p-4">
                <MessageSquare className="w-8 h-8 opacity-45 mb-2" />
                <p className="text-[10px] font-medium leading-normal">
                  {isAr ? 'لم يتم بدء المحاكاة بعد. اضغط على تشغيل في الأعلى.' : 'Simulator inactive. Click "Simulate" in the top bar to begin.'}
                </p>
              </div>
            ) : (
              chatHistory.map((msg, index) => {
                if (msg.sender === 'system') {
                  return (
                    <div key={index} className="flex justify-center select-none">
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800/80 rounded-md text-[8px] font-bold font-mono text-slate-450 dark:text-slate-500 uppercase tracking-wide">
                        {msg.text}
                      </span>
                    </div>
                  );
                }

                const isBot = msg.sender === 'bot';
                return (
                  <div
                    key={index}
                    className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
                  >
                    <div
                      className={`p-2.5 rounded-xl text-[10px] max-w-[85%] font-medium leading-relaxed ${
                        isBot
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-850 dark:text-slate-150 rounded-tl-none border border-slate-200/50 dark:border-slate-800/50'
                          : 'bg-blue-600 text-white rounded-tr-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[8px] text-slate-400 font-bold font-mono mt-0.5 px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* User slot filling input form */}
          {simWaitingForInput && (
            <form
              onSubmit={handleSendInput}
              className="mt-2.5 p-1.5 border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl flex gap-1.5 items-center animate-pulse"
            >
              <input
                type="text"
                placeholder={isAr ? `أدخل قيمة ${simInputPrompt}...` : `Enter value for ${simInputPrompt.replace('_', ' ')}...`}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="flex-1 px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] focus:outline-none focus:border-blue-500"
                autoFocus
              />
              <button
                type="submit"
                className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>

        {/* Variables State inspector */}
        {isSimulating && (
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2 shrink-0">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <span className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-1 select-none">
                <Sliders className="w-3.5 h-3.5 text-blue-500" />
                <span>{isAr ? 'قيم المتغيرات الحية' : 'Live Variable State'}</span>
              </span>
              <button
                onClick={resetSimVariables}
                className="text-[9px] text-slate-450 hover:text-slate-850 dark:hover:text-white flex items-center gap-1 font-bold"
                title="Reset Variables"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                <span>{isAr ? 'إعادة ضبط' : 'Reset'}</span>
              </button>
            </div>

            <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1 font-mono text-[9px]">
              {Object.entries(simVariables).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-0.5 border-b border-dashed border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-500 font-bold truncate max-w-28" title={key}>
                    {key}
                  </span>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setSimVariable(key, e.target.value)}
                    className="w-28 text-right bg-transparent text-slate-850 dark:text-slate-200 font-bold focus:outline-none focus:border-b focus:border-blue-500"
                    placeholder="(empty)"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Developer Console */}
        <ExecutionConsole />
      </div>
    </div>
  );
}
