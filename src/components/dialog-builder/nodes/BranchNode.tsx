import React from 'react';
import { GitBranch } from 'lucide-react';
import { WorkflowNode } from '@/data/seed/workflowSeed';

interface NodeProps {
  node: WorkflowNode;
  selected: boolean;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export function BranchNode({ node, selected, isActive, onSelect, onDelete }: NodeProps) {
  const conditions = node.config.branchConditions || [];

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`absolute w-56 bg-white dark:bg-slate-900 border-2 rounded-2xl shadow-md transition-all cursor-move select-none p-3.5 text-xs font-semibold ${
        isActive
          ? 'border-violet-500 ring-2 ring-violet-500/20 scale-[1.02]'
          : selected
          ? 'border-slate-800 dark:border-white'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700'
      }`}
      style={{ left: node.x, top: node.y }}
    >
      {/* Target port indicators */}
      <div className="absolute left-0 top-1/2 -ml-2 -mt-2 w-3.5 h-3.5 bg-slate-300 dark:bg-slate-750 rounded-full border-2 border-white dark:border-slate-900 z-10" title="Input port" />
      <div className="absolute right-0 top-1/3 -mr-2 -mt-2 w-3.5 h-3.5 bg-violet-500 rounded-full border-2 border-white dark:border-slate-900 z-10 cursor-pointer" title="Output Condition A" />
      <div className="absolute right-0 top-2/3 -mr-2 -mt-2 w-3.5 h-3.5 bg-fuchsia-500 rounded-full border-2 border-white dark:border-slate-900 z-10 cursor-pointer" title="Output Condition B" />

      <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5 text-violet-650 dark:text-violet-400">
          <GitBranch className="w-4 h-4 shrink-0" />
          <span className="font-bold font-mono">BRANCH SPLIT</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-slate-400 hover:text-rose-500 transition-colors text-[10px]"
        >
          ✕
        </button>
      </div>

      <div className="mt-2.5 space-y-2">
        <span className="text-[10px] text-slate-450 uppercase font-mono block">Router Branches</span>
        <div className="space-y-1.5 text-[10px]">
          {conditions.map((cond, idx) => (
            <div key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-1.5 border border-slate-100 dark:border-slate-900 rounded-lg">
              <span className="truncate max-w-[110px] font-mono text-slate-650" title={cond.condition}>
                IF {cond.condition}
              </span>
              <span className="text-[8px] bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-500 font-mono">
                {cond.targetNodeId.substring(0, 10)}
              </span>
            </div>
          ))}
          {conditions.length === 0 && (
            <span className="text-slate-400 font-normal italic">No paths defined.</span>
          )}
        </div>
      </div>

      {isActive && (
        <div className="absolute -bottom-2.5 left-1/2 -ml-8 px-2 py-0.5 bg-violet-600 text-white text-[8px] rounded-full uppercase tracking-wider font-mono animate-bounce shadow">
          Evaluating
        </div>
      )}
    </div>
  );
}
