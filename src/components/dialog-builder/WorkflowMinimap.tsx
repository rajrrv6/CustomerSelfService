import React from 'react';
import { WorkflowNode } from '@/data/seed/workflowSeed';
import { Map } from 'lucide-react';

interface WorkflowMinimapProps {
  nodes: WorkflowNode[];
  activeNodeId: string | null;
}

export function WorkflowMinimap({ nodes, activeNodeId }: WorkflowMinimapProps) {
  // Find boundaries to fit nodes dynamically in miniature view
  const minX = Math.min(...nodes.map((n) => n.x), 0);
  const maxX = Math.max(...nodes.map((n) => n.x), 1800);
  const minY = Math.min(...nodes.map((n) => n.y), 0);
  const maxY = Math.max(...nodes.map((n) => n.y), 500);

  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  return (
    <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 shadow-lg select-none z-10 w-40 h-28 flex flex-col justify-between text-[9px] font-semibold text-slate-400 font-mono">
      <div className="flex items-center gap-1 border-b border-slate-100 dark:border-slate-850 pb-1">
        <Map className="w-3 h-3 text-blue-500" />
        <span>FLOW MINIMAP</span>
      </div>

      <div className="relative flex-1 bg-slate-50 dark:bg-slate-950 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-850 mt-1">
        {nodes.map((n) => {
          // Calculate percentage coordinates
          const pctX = ((n.x - minX) / rangeX) * 85 + 5;
          const pctY = ((n.y - minY) / rangeY) * 80 + 5;

          // Color maps
          let dotColor = 'bg-slate-350 dark:bg-slate-650';
          if (n.type === 'intent') dotColor = 'bg-blue-500';
          else if (n.type === 'api') dotColor = 'bg-indigo-500';
          else if (n.type === 'db') dotColor = 'bg-emerald-500';
          else if (n.type === 'rag') dotColor = 'bg-purple-500';
          else if (n.type === 'branch') dotColor = 'bg-violet-500';
          else if (n.type === 'handoff') dotColor = 'bg-rose-500';

          const isActive = activeNodeId === n.id;

          return (
            <div
              key={n.id}
              className={`absolute rounded-sm transition-all ${dotColor} ${
                isActive ? 'w-2.5 h-2.5 ring-2 ring-amber-500 ring-offset-1 z-10' : 'w-1.5 h-1.5'
              }`}
              style={{
                left: `${pctX}%`,
                top: `${pctY}%`
              }}
              title={n.name}
            />
          );
        })}
      </div>
    </div>
  );
}
