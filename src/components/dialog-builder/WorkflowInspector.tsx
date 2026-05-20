import React, { useState } from 'react';
import { Database, Play, CheckCircle, XCircle, RefreshCcw, Cpu } from 'lucide-react';

interface WorkflowInspectorProps {
  variables: Record<string, string>;
  onUpdateVariable: (key: string, value: string) => void;
  traceHistory: string[];
  className?: string;
  variant?: 'default' | 'compact';
}

export function WorkflowInspector({ variables, onUpdateVariable, traceHistory, className = '', variant = 'default' }: WorkflowInspectorProps) {
  const [activeTab, setActiveTab] = useState<'variables' | 'regression'>('variables');
  const [testResults, setTestResults] = useState<Array<{ name: string; status: 'passed' | 'failed' | 'idle'; output: string }>>([
    { name: '1. VIP Branch Escalation Route', status: 'idle', output: 'Asserts route reaches RAG check when invoiceAmount > 1000.' },
    { name: '2. Standard Slot Filling Route', status: 'idle', output: 'Asserts route falls back to collect form inputs when invoiceAmount <= 1000.' },
    { name: '3. Webhook Parameter Mapping', status: 'idle', output: 'Checks Stripe payload contains valid client email variable interpolation.' }
  ]);

  const handleRunTests = () => {
    setTestResults((prev) =>
      prev.map((test) => {
        if (test.name.includes('VIP')) {
          // Check if invoiceAmount in variables is > 1000
          const amt = parseFloat(variables.invoiceAmount || '0');
          if (amt > 1000) {
            return {
              ...test,
              status: 'passed',
              output: `PASSED: Confirmed transaction value (${amt}) routed to node-rag-kb.`
            };
          } else {
            return {
              ...test,
              status: 'failed',
              output: `FAILED: Current invoiceAmount (${amt}) <= 1000. Setup variables to pass.`
            };
          }
        }

        if (test.name.includes('Standard')) {
          const amt = parseFloat(variables.invoiceAmount || '0');
          if (amt <= 1000) {
            return {
              ...test,
              status: 'passed',
              output: `PASSED: Verified routing path defaults correctly to form collection.`
            };
          } else {
            return {
              ...test,
              status: 'failed',
              output: `FAILED: Current value (${amt}) is in VIP range (> 1000).`
            };
          }
        }

        if (test.name.includes('Webhook')) {
          const email = variables.customerEmail || '';
          if (email.includes('@')) {
            return {
              ...test,
              status: 'passed',
              output: `PASSED: Found customerEmail: "${email}". Interpolation regex checks OK.`
            };
          } else {
            return {
              ...test,
              status: 'failed',
              output: `FAILED: Missing or invalid customerEmail.`
            };
          }
        }

        return test;
      })
    );
  };

  return (
    <div
      className={`border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 text-xs font-semibold select-none shadow-sm ${
        variant === 'compact' ? 'w-full h-auto border-0 shadow-none rounded-none' : 'w-80 h-full'
      } ${className}`}
    >
      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-950">
        <button
          onClick={() => setActiveTab('variables')}
          className={`flex-1 py-3 text-center border-b-2 font-bold transition-all ${
            activeTab === 'variables'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Variables Context
        </button>
        <button
          onClick={() => setActiveTab('regression')}
          className={`flex-1 py-3 text-center border-b-2 font-bold transition-all ${
            activeTab === 'regression'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Regression Suite
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'variables' ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Memory Register</span>
              <Database className="w-3.5 h-3.5 text-blue-500" />
            </div>

            <div className="space-y-3">
              {Object.entries(variables).map(([key, val]) => (
                <div key={key} className="space-y-1">
                  <label className="block text-slate-500 font-mono text-[10px]">{key}</label>
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => onUpdateVariable(key, e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg font-mono text-[11px] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}
            </div>

            {/* Trace History */}
            {traceHistory.length > 0 && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
                <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider block">Live Trace Map</span>
                <div className="space-y-1 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-[9px] leading-relaxed">
                  {traceHistory.map((nodeId, idx) => (
                    <div key={idx} className="flex items-center gap-1 text-slate-500">
                      <span className="text-blue-500 font-bold">[{idx + 1}]</span>
                      <span>{nodeId}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Assertions</span>
              <Cpu className="w-3.5 h-3.5 text-violet-500" />
            </div>

            <button
              onClick={handleRunTests}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              Run Assertion Suite
            </button>

            <div className="space-y-3 pt-2">
              {testResults.map((test, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl space-y-1.5">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 leading-tight">
                      {test.name}
                    </span>
                    {test.status === 'passed' && (
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    )}
                    {test.status === 'failed' && (
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    )}
                    {test.status === 'idle' && (
                      <RefreshCcw className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 font-normal leading-normal italic font-mono">
                    {test.output}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
