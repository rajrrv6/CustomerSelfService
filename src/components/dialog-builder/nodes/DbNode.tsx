import { Database } from 'lucide-react';
import { WorkflowNode } from '@/data/seed/workflowSeed';

interface NodeProps {
  node: WorkflowNode;
  selected: boolean;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export function DbNode({ node, selected, isActive, onSelect, onDelete }: NodeProps) {
  const table = node.config.dbTargetTable || 'No table selected';

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`absolute w-56 bg-white dark:bg-slate-900 border-2 rounded-2xl shadow-md transition-all cursor-move select-none p-3.5 text-xs font-semibold ${
        isActive
          ? 'border-emerald-500 ring-2 ring-emerald-500/20 scale-[1.02]'
          : selected
          ? 'border-slate-800 dark:border-white'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700'
      }`}
      style={{ left: node.x, top: node.y }}
    >
      {/* Target port indicators */}
      <div className="absolute left-0 top-1/2 -ml-2 -mt-2 w-3.5 h-3.5 bg-slate-300 dark:bg-slate-750 rounded-full border-2 border-white dark:border-slate-900 z-10" title="Input port" />
      <div className="absolute right-0 top-1/2 -mr-2 -mt-2 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 z-10 cursor-pointer" title="Output port" />

      <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
          <Database className="w-4 h-4 shrink-0" />
          <span className="font-bold font-mono">DB QUERY</span>
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

      <div className="mt-2.5 space-y-1">
        <span className="text-[10px] text-slate-400 uppercase font-mono block">Target Table</span>
        <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate block">{table}</span>
      </div>

      {isActive && (
        <div className="absolute -bottom-2.5 left-1/2 -ml-8 px-2 py-0.5 bg-emerald-650 text-white text-[8px] rounded-full uppercase tracking-wider font-mono animate-bounce shadow">
          Executing
        </div>
      )}
    </div>
  );
}
