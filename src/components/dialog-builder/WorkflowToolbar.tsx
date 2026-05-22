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
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';

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
  onOpenInspector: () => void;
  /** Open NLU simulator in mobile sheet (lg+ uses side panel) */
  onOpenSimulator?: () => void;
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
  simulationActive,
  onOpenInspector,
  onOpenSimulator
}: WorkflowToolbarProps) {
  const { lang } = useApp();
  const t = translations[lang];

  return (
    <div className="bg-slate-50 dark:bg-slate-950 px-3 py-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-3 text-xs font-semibold select-none z-10 shrink-0 min-w-0">
      
      {/* Node creation controls */}
      <div className="flex items-center justify-between gap-2 sm:hidden">
        <span className="block font-mono text-[10px] uppercase tracking-wider text-slate-400">{t.dialogFlow.toolbar.panels}</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onOpenInspector}
            className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-[10px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            {t.dialogFlow.toolbar.variables}
          </button>
          {onOpenSimulator && (
            <button
              type="button"
              onClick={onOpenSimulator}
              className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-[10px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              {t.dialogFlow.toolbar.simulator}
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 sm:overflow-visible sm:pb-0 sm:mx-0 sm:px-0">
        <span className="hidden sm:block text-[10px] text-slate-400 uppercase tracking-wider font-mono mr-1.5 shrink-0">{t.dialogFlow.toolbar.addNode}</span>
        {(['intent', 'api', 'db', 'rag', 'branch', 'handoff', 'delay', 'form', 'carousel'] as WorkflowNode['type'][]).map((type) => (
          <button
            key={type}
            onClick={() => onAddNode(type)}
            className="shrink-0 flex items-center gap-1 px-3 py-2 sm:px-2.5 sm:py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-500 hover:text-blue-500 transition-all text-[10px] min-h-10"
          >
            <Plus className="w-3 h-3" />
            <span className="uppercase font-mono">{type}</span>
          </button>
        ))}
      </div>

      {/* Editor history and zoom actions */}
      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 -mx-1 px-1 sm:overflow-visible sm:pb-0 sm:mx-0 sm:px-0">
        {/* History stacks */}
        <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-800 pr-2 sm:pr-3 shrink-0">
          <button
            disabled={!canUndo}
            onClick={onUndo}
            className="p-2 sm:p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg disabled:opacity-40 hover:text-blue-500 transition-colors min-h-10 min-w-10"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            disabled={!canRedo}
            onClick={onRedo}
            className="p-2 sm:p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg disabled:opacity-40 hover:text-blue-500 transition-colors min-h-10 min-w-10"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-800 pr-2 sm:pr-3 shrink-0">
          <button
            onClick={onZoomOut}
            className="p-2 sm:p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:text-blue-500 min-h-10 min-w-10"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="w-14 sm:w-12 text-center text-[10px] font-mono text-slate-400 shrink-0">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={onZoomIn}
            className="p-2 sm:p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:text-blue-500 min-h-10 min-w-10"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={onZoomReset}
            className="p-2 sm:p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:text-blue-500 min-h-10 min-w-10"
            title="Reset Zoom"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>

        {/* Validate & Simulator triggers */}
        <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
          <button
            onClick={onValidate}
            className="flex items-center gap-1.5 px-3 py-2 sm:py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl min-h-10"
          >
            {t.dialogFlow.toolbar.validateFlow}
          </button>

          <button
            onClick={simulationActive ? onResetSimulation : onStartSimulation}
            className={`flex items-center gap-1.5 px-4 py-2 sm:py-1.5 text-white font-bold rounded-xl transition-all shadow-sm min-h-10 ${
              simulationActive
                ? 'bg-rose-500 hover:bg-rose-600'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {simulationActive ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {simulationActive ? t.dialogFlow.toolbar.resetSim : t.dialogFlow.toolbar.startSim}
          </button>
        </div>
      </div>

      {/* Validation status output banner */}
      {validation && (validation.errors.length > 0 || validation.warnings.length > 0) && (
        <div className="w-full overflow-x-auto mt-2.5 p-3 rounded-2xl flex flex-col gap-1.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 font-mono text-[10px]">
          {validation.errors.map((err, i) => (
            <div key={i} className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
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
        <div className="w-full overflow-x-auto mt-2.5 p-3 rounded-2xl flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 font-mono text-[10px] text-emerald-700 dark:text-emerald-400">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>{t.dialogFlow.toolbar.validationOk}</span>
        </div>
      )}
    </div>
  );
}
