import React from 'react';
import {
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Maximize,
  Play,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Plus
} from 'lucide-react';
import { WorkflowNode } from '@/data/seed/workflowSeed';

interface WorkflowToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onAddNode: (type: WorkflowNode['type']) => void;
  onValidate: () => void;
  validation: { errors: string[]; warnings: string[] } | null;
  onStartSimulation: () => void;
  onResetSimulation: () => void;
  simulationActive: boolean;
}

export function WorkflowToolbar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onAddNode,
  onValidate,
  validation,
  onStartSimulation,
  onResetSimulation,
  simulationActive
}: WorkflowToolbarProps) {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between text-xs font-semibold select-none z-10 shrink-0">
      
      {/* Node creation controls */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono mr-1.5">Add Node:</span>
        {(['intent', 'api', 'db', 'rag', 'branch', 'handoff', 'delay', 'form', 'carousel'] as WorkflowNode['type'][]).map((type) => (
          <button
            key={type}
            onClick={() => onAddNode(type)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-500 hover:text-blue-500 transition-all text-[10px]"
          >
            <Plus className="w-3 h-3" />
            <span className="uppercase font-mono">{type}</span>
          </button>
        ))}
      </div>

      {/* Editor history and zoom actions */}
      <div className="flex items-center gap-3">
        {/* History stacks */}
        <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-850 pr-3">
          <button
            disabled={!canUndo}
            onClick={onUndo}
            className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg disabled:opacity-40 hover:text-blue-500 transition-colors"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            disabled={!canRedo}
            onClick={onRedo}
            className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg disabled:opacity-40 hover:text-blue-500 transition-colors"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-850 pr-3">
          <button
            onClick={onZoomOut}
            className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:text-blue-500"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="w-12 text-center text-[10px] font-mono text-slate-400">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={onZoomIn}
            className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:text-blue-500"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={onZoomReset}
            className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:text-blue-500"
            title="Reset Zoom"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>

        {/* Validate & Simulator triggers */}
        <div className="flex items-center gap-2">
          <button
            onClick={onValidate}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-250 dark:border-slate-750 text-slate-700 dark:text-slate-300 rounded-xl"
          >
            Validate Flow
          </button>

          <button
            onClick={simulationActive ? onResetSimulation : onStartSimulation}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-white font-bold rounded-xl transition-all shadow-sm ${
              simulationActive
                ? 'bg-rose-500 hover:bg-rose-600'
                : 'bg-emerald-650 hover:bg-emerald-700'
            }`}
          >
            {simulationActive ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {simulationActive ? 'Reset Sim' : 'Start Sim'}
          </button>
        </div>
      </div>

      {/* Validation status output banner */}
      {validation && (validation.errors.length > 0 || validation.warnings.length > 0) && (
        <div className="w-full mt-2.5 p-3 rounded-2xl flex flex-col gap-1.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-250 dark:border-amber-900 font-mono text-[10px]">
          {validation.errors.map((err, i) => (
            <div key={i} className="flex items-center gap-1.5 text-rose-650 dark:text-rose-450">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>[ERROR] {err}</span>
            </div>
          ))}
          {validation.warnings.map((warn, i) => (
            <div key={i} className="flex items-center gap-1.5 text-amber-800 dark:text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>[WARNING] {warn}</span>
            </div>
          ))}
        </div>
      )}

      {validation && validation.errors.length === 0 && validation.warnings.length === 0 && (
        <div className="w-full mt-2.5 p-3 rounded-2xl flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900 font-mono text-[10px] text-emerald-700 dark:text-emerald-400">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Workflow structural integrity looks correct. Ready for production ingestion deployment pipeline.</span>
        </div>
      )}
    </div>
  );
}
