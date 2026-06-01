'use client';

import React from 'react';
import { Handle, Position } from 'reactflow';
import { useDialogStore } from '../store/useDialogStore';
import { useUIStore } from '@/stores/uiStore';
import { Trash2, AlertTriangle, Play } from 'lucide-react';

interface HandleSpec {
  id: string;
  label?: string;
  position?: Position;
}

interface BaseNodeProps {
  id: string;
  type: string;
  labelEn: string;
  labelAr: string;
  selected: boolean;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string; // e.g. "blue", "emerald", "amber"
  children?: React.ReactNode;
  inputs?: HandleSpec[];
  outputs?: HandleSpec[];
}

export function BaseNode({
  id,
  type,
  labelEn,
  labelAr,
  selected,
  icon: Icon,
  colorClass,
  children,
  inputs = [{ id: 'input' }],
  outputs = [{ id: 'output' }]
}: BaseNodeProps) {
  // Narrow Zustand selectors
  const lang = useUIStore((s) => s.lang);
  const deleteNode = useDialogStore((s) => s.deleteNode);
  const activeSimNodeId = useDialogStore((s) => s.activeSimNodeId);
  const diagnostics = useDialogStore((s) => s.diagnostics);

  const isAr = lang === 'ar';
  const isExecuting = activeSimNodeId === id;
  
  // Find validation warnings/errors for this specific node
  const nodeDiagnostics = diagnostics.filter((d) => d.nodeId === id);
  const hasCritical = nodeDiagnostics.some((d) => d.severity === 'critical');
  const hasWarning = nodeDiagnostics.some((d) => d.severity === 'warning');

  // Dynamic handle positioning based on LTR/RTL
  const defaultInputPos = isAr ? Position.Right : Position.Left;
  const defaultOutputPos = isAr ? Position.Left : Position.Right;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNode(id);
  };

  // Color mappings for Tailwind border/text/bg styling to respect design rules (avoid purple)
  const colorMap: Record<string, { border: string; bg: string; text: string; headerBg: string }> = {
    blue: {
      border: 'border-blue-200 dark:border-blue-900/40',
      bg: 'bg-blue-50/50 dark:bg-blue-950/10',
      text: 'text-blue-600 dark:text-blue-400',
      headerBg: 'bg-blue-50 dark:bg-blue-950/30'
    },
    emerald: {
      border: 'border-emerald-250 dark:border-emerald-900/30',
      bg: 'bg-emerald-50/30 dark:bg-emerald-950/5',
      text: 'text-emerald-600 dark:text-emerald-400',
      headerBg: 'bg-emerald-50 dark:bg-emerald-950/20'
    },
    amber: {
      border: 'border-amber-200 dark:border-amber-900/30',
      bg: 'bg-amber-50/30 dark:bg-amber-950/5',
      text: 'text-amber-600 dark:text-amber-400',
      headerBg: 'bg-amber-50 dark:bg-amber-950/20'
    },
    red: {
      border: 'border-red-200 dark:border-red-900/30',
      bg: 'bg-red-50/30 dark:bg-red-950/5',
      text: 'text-red-600 dark:text-red-400',
      headerBg: 'bg-red-50 dark:bg-red-950/20'
    },
    slate: {
      border: 'border-slate-200 dark:border-slate-800',
      bg: 'bg-slate-50/50 dark:bg-slate-900/30',
      text: 'text-slate-650 dark:text-slate-400',
      headerBg: 'bg-slate-100/80 dark:bg-slate-800/80'
    }
  };

  const colors = colorMap[colorClass] || colorMap.slate;

  // Selected state border classes
  const borderClass = selected
    ? 'border-slate-800 dark:border-slate-100 ring-2 ring-slate-800/10 dark:ring-slate-100/10 scale-[1.01]'
    : isExecuting
    ? 'border-blue-500 dark:border-blue-400 ring-4 ring-blue-500/20 dark:ring-blue-400/20 animate-pulse'
    : colors.border;

  return (
    <div
      className={`w-64 bg-white dark:bg-[#111827] border rounded-2xl shadow-sm text-xs font-semibold text-slate-800 dark:text-slate-200 select-none transition-all relative ${borderClass}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Target/Input handles (normally left in LTR, right in RTL) */}
      {type !== 'start' &&
        inputs.map((inp, idx) => {
          const pos = inp.position || defaultInputPos;
          // Distribute multiple inputs vertically if needed
          const topPercent = inputs.length > 1 ? `${((idx + 1) / (inputs.length + 1)) * 100}%` : '50%';
          return (
            <Handle
              key={inp.id}
              type="target"
              position={pos}
              id={inp.id}
              className="w-3.5 h-3.5 bg-slate-350 dark:bg-slate-650 border-2 border-white dark:border-[#111827] rounded-full z-10 transition-colors hover:bg-blue-500"
              style={{ top: topPercent }}
            />
          );
        })}

      {/* Source/Output handles (normally right in LTR, left in RTL) */}
      {type !== 'end' && type !== 'human_handoff' && type !== 'escalation' &&
        outputs.map((out, idx) => {
          const pos = out.position || defaultOutputPos;
          const topPercent = outputs.length > 1 ? `${((idx + 1) / (outputs.length + 1)) * 100}%` : '50%';
          return (
            <div
              key={out.id}
              className="absolute z-10"
              style={{
                top: topPercent,
                transform: 'translateY(-50%)',
                [isAr ? 'left' : 'right']: '-8px'
              }}
            >
              <Handle
                type="source"
                position={pos}
                id={out.id}
                className="w-3.5 h-3.5 bg-blue-600 border-2 border-white dark:border-[#111827] rounded-full transition-colors hover:bg-emerald-500"
              />
              {out.label && (
                <span
                  className={`absolute top-1/2 -translate-y-1/2 text-[8px] font-bold font-mono px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 whitespace-nowrap ${
                    isAr ? 'right-4' : 'left-4'
                  }`}
                >
                  {out.label}
                </span>
              )}
            </div>
          );
        })}

      {/* Node Header */}
      <div className={`flex items-center justify-between p-3 rounded-t-2xl border-b border-slate-100 dark:border-slate-800 ${colors.headerBg}`}>
        <div className="flex items-center gap-1.5 min-w-0">
          <div className={`${colors.text} shrink-0`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="font-bold font-sans truncate pr-1">
            {isAr ? labelAr : labelEn}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Validation Indicators */}
          {hasCritical && (
            <span title={isAr ? 'أخطاء حرجة في التكوين' : 'Critical configuration errors'}>
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
            </span>
          )}
          {hasWarning && !hasCritical && (
            <span title={isAr ? 'تحذير في التكوين' : 'Configuration warnings'}>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            </span>
          )}

          {/* Delete Button (disabled for start node) */}
          {id !== 'node-start' && (
            <button
              onClick={handleDelete}
              className="p-1 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-red-500 dark:hover:text-red-400 rounded transition-colors"
              title={isAr ? 'حذف العقدة' : 'Delete Node'}
            >
              <Trash2 className="w-3.5 h-3.5 opacity-60 hover:opacity-100" />
            </button>
          )}
        </div>
      </div>

      {/* Node Content / Config summary */}
      <div className="p-3 bg-white dark:bg-[#111827] rounded-b-2xl min-h-12 flex flex-col justify-center">
        {children}
      </div>

      {/* Execution Indicator overlay */}
      {isExecuting && (
        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-blue-600 text-white text-[8px] font-bold rounded-full uppercase tracking-wider font-mono shadow flex items-center gap-1 shrink-0 animate-bounce">
          <Play className="w-2 h-2 fill-current" />
          <span>{isAr ? 'جاري التشغيل' : 'Executing'}</span>
        </div>
      )}
    </div>
  );
}
