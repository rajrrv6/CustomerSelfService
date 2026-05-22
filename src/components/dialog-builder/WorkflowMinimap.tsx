import React from 'react';
import { WorkflowNode } from '@/data/seed/workflowSeed';
import { Map } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';

interface WorkflowMinimapProps {
  nodes: WorkflowNode[];
  activeNodeId: string | null;
}

export function WorkflowMinimap({ nodes, activeNodeId }: WorkflowMinimapProps) {
  const { lang } = useApp();
  const t = translations[lang];

  // Find boundaries to fit nodes dynamically in miniature view
  const minX = Math.min(...nodes.map((n) => n.x), 0);
  const maxX = Math.max(...nodes.map((n) => n.x), 1800);
  const minY = Math.min(...nodes.map((n) => n.y), 0);
  const maxY = Math.max(...nodes.map((n) => n.y), 500);

  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  return (
    <div className="pointer-events-none absolute bottom-2 start-2 z-10 flex h-20 w-28 flex-col justify-between rounded-xl border border-slate-200 bg-white/95 p-1.5 text-[8px] font-semibold text-slate-400 shadow-lg select-none dark:border-slate-800 dark:bg-slate-900/95 sm:bottom-3 sm:start-3 sm:h-24 sm:w-32 sm:rounded-2xl sm:p-2 sm:text-[9px] lg:bottom-4 lg:start-4 lg:h-28 lg:w-40 lg:p-2.5">
      <div className="flex items-center gap-1 border-b border-slate-100 pb-0.5 dark:border-slate-800 sm:pb-1">
        <Map className="h-2.5 w-2.5 text-blue-500 sm:h-3 sm:w-3" />
        <span className="font-mono uppercase">{t.dialogFlow.canvas.mapTitle}</span>
      </div>

      <div className="relative mt-0.5 flex-1 overflow-hidden rounded-md border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 sm:rounded-lg sm:mt-1">
        {nodes.map((n) => {
          // Calculate percentage coordinates
          const pctX = ((n.x - minX) / rangeX) * 85 + 5;
          const pctY = ((n.y - minY) / rangeY) * 80 + 5;

          // Color maps
          let dotColor = 'bg-slate-400 dark:bg-slate-600';
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
