import { Sliders } from 'lucide-react';
import { WorkflowNode } from '@/data/seed/workflowSeed';

interface NodeProps {
  node: WorkflowNode;
  selected: boolean;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export function IntentNode({ node, selected, isActive, onSelect, onDelete }: NodeProps) {
  const intent = node.config.intentName || 'Not Set';
  const utterances = node.config.utterances || [];

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`absolute w-56 bg-white dark:bg-slate-900 border-2 rounded-2xl shadow-md transition-all cursor-move select-none p-3.5 text-xs font-semibold ${
        isActive
          ? 'border-blue-500 ring-2 ring-blue-500/20 scale-[1.02]'
          : selected
          ? 'border-slate-800 dark:border-white'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700'
      }`}
      style={{ left: node.x, top: node.y }}
    >
      {/* Target port indicators */}
      <div className="absolute right-0 top-1/2 -mr-2 -mt-2 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-white dark:border-slate-900 z-10 flex items-center justify-center cursor-pointer" title="Output port" />

      <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
          <Sliders className="w-4 h-4 shrink-0" />
          <span className="font-bold font-mono">INTENT</span>
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

      <div className="mt-2.5 space-y-1.5">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide font-mono block">Trigger Intent</span>
          <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">#{intent}</span>
        </div>

        {utterances.length > 0 && (
          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase block">Utterances</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {utterances.slice(0, 2).map((ut, idx) => (
                <span key={idx} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800/80 rounded text-[9px] font-normal text-slate-650 truncate max-w-[90px]">
                  &quot;{ut}&quot;
                </span>
              ))}
              {utterances.length > 2 && (
                <span className="text-[9px] text-slate-400 font-mono font-bold">+{utterances.length - 2} more</span>
              )}
            </div>
          </div>
        )}
      </div>

      {isActive && (
        <div className="absolute -bottom-2.5 left-1/2 -ml-8 px-2 py-0.5 bg-blue-600 text-white text-[8px] rounded-full uppercase tracking-wider font-mono animate-bounce shadow">
          Executing
        </div>
      )}
    </div>
  );
}
