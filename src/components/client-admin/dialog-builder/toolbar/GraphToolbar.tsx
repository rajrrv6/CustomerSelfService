'use client';

import React from 'react';
import { useDialogStore } from '../store/useDialogStore';
import { useUIStore } from '@/stores/uiStore';
import { translations } from '@/i18n/translations';
import {
  RotateCcw, RotateCw, ShieldCheck, PlayCircle, PauseCircle,
  Save, Download, CheckCircle, AlertTriangle
} from 'lucide-react';
import { SimulationMode } from '../types';

export function GraphToolbar() {
  // Narrow selectors
  const lang = useUIStore((s) => s.lang);
  const isAr = lang === 'ar';
  const t = translations[lang];

  const undo = useDialogStore((s) => s.undo);
  const redo = useDialogStore((s) => s.redo);
  const canUndo = useDialogStore((s) => s.canUndo)();
  const canRedo = useDialogStore((s) => s.canRedo)();
  
  const isSimulating = useDialogStore((s) => s.isSimulating);
  const startSimulation = useDialogStore((s) => s.startSimulation);
  const stopSimulation = useDialogStore((s) => s.stopSimulation);
  const simulationMode = useDialogStore((s) => s.simulationMode);
  const setSimulationMode = useDialogStore((s) => s.setSimulationMode);

  const diagnostics = useDialogStore((s) => s.diagnostics);
  const nodes = useDialogStore((s) => s.nodes);
  const edges = useDialogStore((s) => s.edges);
  const setNodes = useDialogStore((s) => s.setNodes);
  const setEdges = useDialogStore((s) => s.setEdges);

  const hasCritical = diagnostics.some((d) => d.severity === 'critical');
  const hasWarning = diagnostics.some((d) => d.severity === 'warning');

  // Trigger local storage save
  const handleSave = () => {
    localStorage.setItem('mPaaS_rf_dialog_nodes', JSON.stringify(nodes));
    localStorage.setItem('mPaaS_rf_dialog_edges', JSON.stringify(edges));
    alert(isAr ? 'تم حفظ مسودة الحوار بنجاح!' : 'Dialogue flow draft saved successfully!');
  };

  const handleLoad = () => {
    const savedNodes = localStorage.getItem('mPaaS_rf_dialog_nodes');
    const savedEdges = localStorage.getItem('mPaaS_rf_dialog_edges');
    if (savedNodes && savedEdges) {
      setNodes(JSON.parse(savedNodes));
      setEdges(JSON.parse(savedEdges));
      alert(isAr ? 'تم استرجاع المسودة بنجاح!' : 'Flow layout loaded successfully!');
    } else {
      alert(isAr ? 'لا يوجد مسودة محفوظة.' : 'No saved configuration found.');
    }
  };

  return (
    <div
      className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Undo/Redo & Save Actions */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="p-1.5 border border-slate-250 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-all cursor-pointer"
          title={isAr ? 'تراجع' : 'Undo'}
        >
          <RotateCcw className={`w-4 h-4 ${isAr ? 'scale-x-[-1]' : ''}`} />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="p-1.5 border border-slate-250 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-all cursor-pointer"
          title={isAr ? 'إعادة' : 'Redo'}
        >
          <RotateCw className={`w-4 h-4 ${isAr ? 'scale-x-[-1]' : ''}`} />
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-250 dark:border-slate-800 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-bold text-slate-700 dark:text-slate-350 cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isAr ? 'حفظ المسودة' : 'Save Draft'}</span>
        </button>

        <button
          onClick={handleLoad}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-250 dark:border-slate-800 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-bold text-slate-700 dark:text-slate-350 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isAr ? 'تحميل المسودة' : 'Load Draft'}</span>
        </button>
      </div>

      {/* Validation status badge and Simulation setups */}
      <div className="flex items-center gap-3.5 flex-wrap">
        {/* Validation Summary */}
        <div className="flex items-center gap-1.5">
          {diagnostics.length === 0 ? (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{isAr ? 'المخطط سليم' : 'Graph Validated'}</span>
            </span>
          ) : hasCritical ? (
            <span className="flex items-center gap-1 text-red-500 text-[10px] font-bold animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{isAr ? 'تنبيه حرج' : 'Critical Faults'}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-500 text-[10px] font-bold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{isAr ? 'تحذير التوصيل' : 'Warnings'}</span>
            </span>
          )}
        </div>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

        {/* Simulation Configuration overrides */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 font-mono">
            {isAr ? 'وضعية التشغيل:' : 'Sim Mode:'}
          </span>
          <select
            value={simulationMode}
            onChange={(e) => setSimulationMode(e.target.value as SimulationMode)}
            disabled={isSimulating}
            className="px-2 py-1 border border-slate-250 dark:border-slate-800 bg-transparent text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold focus:outline-none disabled:opacity-50"
          >
            <option value="normal">{isAr ? 'عميل كبار الشخصيات' : 'Normal VIP Flow'}</option>
            <option value="low_confidence">{isAr ? 'ثقة NLU منخفضة' : 'Low Confidence AI'}</option>
            <option value="escalation">{isAr ? 'مسار التصعيد المباشر' : 'Immediate Handoff'}</option>
            <option value="api_timeout">{isAr ? 'عطل استدعاء Stripe API' : 'API Connection Timeout'}</option>
          </select>

          {isSimulating ? (
            <button
              onClick={stopSimulation}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-650 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              <PauseCircle className="w-4 h-4" />
              <span>{isAr ? 'إيقاف المحاكاة' : 'Stop Simulation'}</span>
            </button>
          ) : (
            <button
              onClick={startSimulation}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm shadow-blue-500/10"
            >
              <PlayCircle className="w-4 h-4" />
              <span>{isAr ? 'بدء المحاكاة' : 'Simulate'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
