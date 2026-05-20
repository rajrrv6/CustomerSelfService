import React, { useState, useRef, useEffect } from 'react';
import { Send, Play, CornerDownRight, HelpCircle as HelpIcon } from 'lucide-react';
import { ChatMessage } from './hooks/useWorkflowSimulation';

interface WorkflowSimulatorProps {
  isRunning: boolean;
  chatHistory: ChatMessage[];
  logs: string[];
  waitingForInput: { fieldName: string; prompt: string } | null;
  onStep: () => void;
  onSubmitInput: (txt: string) => void;
  onStart: () => void;
  /** `panel` = full-height inside mobile sheet; `sidebar` = default docked layout */
  variant?: 'sidebar' | 'panel';
  className?: string;
}

export function WorkflowSimulator({
  isRunning,
  chatHistory,
  logs,
  waitingForInput,
  onStep,
  onSubmitInput,
  onStart,
  variant = 'sidebar',
  className = '',
}: WorkflowSimulatorProps) {
  const [inputText, setInputText] = useState('');
  const [activeView, setActiveView] = useState<'chat' | 'logs'>('chat');
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const logBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  useEffect(() => {
    logBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText) return;
    onSubmitInput(inputText);
    setInputText('');
  };

  const shell =
    variant === 'panel'
      ? `flex h-full min-h-[min(60dvh,480px)] w-full flex-col bg-[#111827] text-xs font-semibold text-white select-none ${className}`
      : `flex w-full shrink-0 flex-col border-t border-slate-200 bg-[#111827] text-xs font-semibold text-white shadow-xl select-none dark:border-slate-800 lg:h-full lg:w-80 lg:max-h-none lg:border-s lg:border-t-0 min-w-0 max-h-[50vh] ${className}`;

  return (
    <div className={shell.trim()}>
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <h3 className="font-bold font-mono uppercase text-slate-300">Farah NLU Sim</h3>
        </div>

        <div className="flex gap-1.5">
          <button
            onClick={() => setActiveView('chat')}
            className={`px-2.5 py-1 rounded font-mono text-[9px] ${
              activeView === 'chat' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveView('logs')}
            className={`px-2.5 py-1 rounded font-mono text-[9px] ${
              activeView === 'logs' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Trace logs
          </button>
        </div>
      </div>

      {/* Body panel */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        {activeView === 'chat' ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col">
            {chatHistory.length === 0 && (
              <div className="my-auto text-center space-y-3 px-4">
                <HelpIcon className="w-8 h-8 mx-auto text-slate-500" />
                <p className="text-slate-500 font-normal">
                  Simulator is idle. Setup target parameters in the canvas and click &quot;Start Simulation&quot; to test variables.
                </p>
                <button
                  onClick={onStart}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
                >
                  Start Sim
                </button>
              </div>
            )}

            {chatHistory.map((msg) => {
              if (msg.sender === 'system') {
                return (
                  <div key={msg.id} className="text-center text-[9px] text-amber-500 font-mono py-1 border-y border-slate-900/60 leading-normal">
                    * {msg.text}
                  </div>
                );
              }

              const isUser = msg.sender === 'user';
              return (
                <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 leading-relaxed ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/50'
                    }`}
                  >
                    <p className="font-normal text-[11px] whitespace-pre-wrap">{msg.text}</p>
                    <span className="text-[8px] text-slate-400 block mt-1 text-right font-mono font-bold">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={chatBottomRef} />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-1.5 font-mono text-[9px] leading-relaxed text-slate-400">
            {logs.map((log, idx) => (
              <div key={idx} className="flex gap-1.5 border-b border-slate-900/40 pb-1">
                <CornerDownRight className="w-3 h-3 text-blue-500 shrink-0 mt-0.5" />
                <span className="break-all">{log}</span>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="text-center text-slate-600 italic py-10">No execution traces.</div>
            )}
            <div ref={logBottomRef} />
          </div>
        )}
      </div>

      {/* Manual Step trigger action */}
      {isRunning && !waitingForInput && (
        <div className="p-3 bg-slate-950 border-t border-slate-900 flex justify-between items-center">
          <span className="text-[10px] text-slate-500 font-mono">Step debugger active:</span>
          <button
            onClick={onStep}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow"
          >
            <Play className="w-3.5 h-3.5" />
            Next Step
          </button>
        </div>
      )}

      {/* Input composition or slot filling notifications */}
      <div className="p-4 border-t border-slate-900 bg-slate-950">
        {waitingForInput ? (
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              required
              placeholder={`Provide ${waitingForInput.fieldName}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 text-xs px-3.5 py-2 rounded-xl focus:outline-none focus:border-blue-500"
            />
            <button type="submit" className="p-2 bg-blue-600 text-white rounded-xl">
              <Send className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="text-center py-1 text-slate-500 italic text-[10px]">
            {isRunning ? 'Execution in progress. Click Next Step.' : 'Simulator is waiting to be initialized.'}
          </div>
        )}
      </div>
    </div>
  );
}
