'use client';

import React, { useEffect } from 'react';
import { useDialogStore } from './store/useDialogStore';
import { useUIStore } from '@/stores/uiStore';
import { translations } from '@/i18n/translations';

// Subcomponents
import { DialogFlowCanvas } from './graph/DialogFlowCanvas';
import { GraphSidebar } from './graph/GraphSidebar';
import { GraphToolbar } from './toolbar/GraphToolbar';
import { NodeInspectorPanel } from './inspectors/NodeInspectorPanel';
import { VariablesSidebar } from './inspectors/VariablesSidebar';
import { SimulationPanel } from './simulation/SimulationPanel';
import { validateGraph } from './validation/graphValidator';

export function DialogFlowLayout() {
  const lang = useUIStore((s) => s.lang);
  const isAr = lang === 'ar';
  const t = translations[lang];

  // Zustand State
  const nodes = useDialogStore((s) => s.nodes);
  const edges = useDialogStore((s) => s.edges);
  const selectedNodeId = useDialogStore((s) => s.selectedNodeId);
  const isSimulating = useDialogStore((s) => s.isSimulating);
  const setDiagnostics = useDialogStore((s) => s.setDiagnostics);
  const diagnostics = useDialogStore((s) => s.diagnostics);

  // Background Validation runner on graph changes
  useEffect(() => {
    const results = validateGraph(nodes, edges);
    setDiagnostics(results);

    // Write updated validation statuses back to nodes list in store
    useDialogStore.setState((state) => ({
      nodes: state.nodes.map((node) => {
        const nodeErrors = results.filter((d) => d.nodeId === node.id);
        const status =
          nodeErrors.some((e) => e.severity === 'critical')
            ? 'error'
            : nodeErrors.some((e) => e.severity === 'warning')
            ? 'warning'
            : 'success';

        return {
          ...node,
          data: {
            ...node.data,
            status,
            validationErrors: nodeErrors.map((e) => e.messageEn)
          }
        };
      })
    }));
  }, [nodes, edges, setDiagnostics]);

  return (
    <div
      className="flex flex-col h-[calc(100vh-80px)] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden bg-white dark:bg-slate-950 shadow-sm min-w-0"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* 1. Global Toolbar */}
      <GraphToolbar />

      {/* 2. Main Workspace Row */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* Left Side: Draggable Elements Sidebar */}
        <GraphSidebar />

        {/* Center: Interactive React Flow Canvas */}
        <div className="flex-1 flex flex-col relative min-w-0 h-full">
          <DialogFlowCanvas />

          {/* Validation Diagnostics summary overlay at bottom of canvas */}
          {diagnostics.length > 0 && (
            <div className={`absolute bottom-3 ${isAr ? 'left-3' : 'right-3'} max-w-sm max-h-36 overflow-y-auto bg-slate-900/95 dark:bg-slate-950/95 border border-slate-800/90 p-3 rounded-2xl shadow-xl z-10 text-[9px] font-mono leading-normal backdrop-blur-sm text-slate-300 space-y-1.5`}>
              <div className="flex items-center gap-1.5 border-b border-slate-800 pb-1 font-bold text-slate-400 select-none">
                <span>{isAr ? 'موجز أخطاء التحقق للتدفق' : 'Flow Validation Diagnostics'}</span>
                <span className="px-1.5 py-0.5 rounded bg-red-950/20 text-red-400 text-[8px]">
                  {diagnostics.length} issues
                </span>
              </div>
              <div className="space-y-1">
                {diagnostics.slice(0, 3).map((diag, idx) => (
                  <div key={idx} className="flex gap-1.5 items-start">
                    <span className={`font-bold uppercase text-[8px] ${diag.severity === 'critical' ? 'text-red-500 animate-pulse' : 'text-amber-500'}`}>
                      [{diag.severity}]
                    </span>
                    <p className="font-medium">{isAr ? diag.messageAr : diag.messageEn}</p>
                  </div>
                ))}
                {diagnostics.length > 3 && (
                  <p className="text-slate-500 italic select-none text-[8.5px] font-semibold pt-0.5">
                    + {diagnostics.length - 3} more issue(s) detected. Fix connections to resolve.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Side Pane: Dynamic Context Sidebar */}
        {isSimulating ? (
          <SimulationPanel />
        ) : selectedNodeId ? (
          <NodeInspectorPanel />
        ) : (
          <VariablesSidebar />
        )}
      </div>
    </div>
  );
}
export default DialogFlowLayout;
