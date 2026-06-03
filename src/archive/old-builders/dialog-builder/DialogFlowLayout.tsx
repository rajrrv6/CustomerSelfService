import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';
import { initialNodes, initialEdges } from '@/data/seed/workflowSeed';
import { useWorkflowState } from './hooks/useWorkflowState';
import { useNodeSelection } from './hooks/useNodeSelection';
import { useWorkflowSimulation } from './hooks/useWorkflowSimulation';
import { WorkflowToolbar } from './WorkflowToolbar';
import { WorkflowCanvas } from './WorkflowCanvas';
import { WorkflowMinimap } from './WorkflowMinimap';
import { WorkflowInspector } from './WorkflowInspector';
import { WorkflowSimulator } from './WorkflowSimulator';
import { NodeSettingsDrawer } from './drawers/NodeSettingsDrawer';
import { MobileSheet } from '@/components/responsive/MobileSheet';

export function DialogFlowLayout() {
  const { lang, addAuditLog } = useApp();
  const t = translations[lang];

  // Workflow builder graph state manager
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    updateNodePosition,
    updateNodeConfig,
    addNode,
    deleteNode,
    connectNodes,
    deleteEdge,
    undo,
    redo,
    canUndo,
    canRedo,
    validateWorkflow
  } = useWorkflowState(initialNodes, initialEdges);

  // Active user selections state manager
  const {
    selectedNodeId,
    selectedEdgeId,
    selectNode,
    selectEdge
  } = useNodeSelection();

  // Step-by-step simulator machine state manager
  const {
    activeNodeId,
    variables,
    setVariables,
    logs,
    chatHistory,
    isRunning,
    waitingForInput,
    traceHistory,
    startSimulation,
    stepSimulation,
    submitUserInput,
    resetSimulation
  } = useWorkflowSimulation(nodes, edges);

  // Canvas viewport translation state variables
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [simulatorSheetOpen, setSimulatorSheetOpen] = useState(false);

  // Diagnostics check state variable
  const [validationResult, setValidationResult] = useState<{ errors: string[]; warnings: string[] } | null>(null);

  // Keybindings delete listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
          return;
        }

        if (selectedEdgeId) {
          deleteEdge(selectedEdgeId);
          selectEdge(null);
          addAuditLog('Deleted connection path link from visual graph builder', 'success');
        } else if (selectedNodeId) {
          deleteNode(selectedNodeId);
          selectNode(null);
          addAuditLog(`Deleted node ${selectedNodeId} from visual graph builder`, 'success');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedEdgeId, selectedNodeId, deleteEdge, deleteNode, selectEdge, selectNode, addAuditLog]);

  // Toolbar viewport scale changes callbacks
  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.1, 2));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.5));
  const handleZoomReset = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  const handleUpdateNodeName = (id: string, newName: string) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, name: newName } : n))
    );
  };

  const handleValidate = () => {
    const res = validateWorkflow();
    setValidationResult(res);
    addAuditLog('Triggered dialog builder flow validation rules check', 'success');
  };

  // Local storage save/load persistence triggers
  const handleSaveFlow = () => {
    localStorage.setItem('mPaaS_dialog_flow_nodes', JSON.stringify(nodes));
    localStorage.setItem('mPaaS_dialog_flow_edges', JSON.stringify(edges));
    addAuditLog('Saved dialog builder layout configuration draft to browser cache', 'success');
    alert('Workflow saved successfully!');
  };

  const handleLoadFlow = () => {
    const savedNodes = localStorage.getItem('mPaaS_dialog_flow_nodes');
    const savedEdges = localStorage.getItem('mPaaS_dialog_flow_edges');
    if (savedNodes && savedEdges) {
      setNodes(JSON.parse(savedNodes));
      setEdges(JSON.parse(savedEdges));
      addAuditLog('Loaded dialogue builder layout configuration draft from cache', 'success');
      alert('Workflow loaded successfully!');
    } else {
      alert('No saved configuration found in cache.');
    }
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  return (
    <div
      className="flex flex-col h-[calc(100vh-80px)] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm min-w-0"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Visual Editor Toolbar */}
      <WorkflowToolbar
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        onAddNode={addNode}
        onValidate={handleValidate}
        validation={validationResult}
        onStartSimulation={startSimulation}
        onResetSimulation={resetSimulation}
        simulationActive={isRunning}
        onOpenInspector={() => setIsInspectorOpen(true)}
        onOpenSimulator={() => setSimulatorSheetOpen(true)}
      />

      {/* Main editor split view */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0 relative">
        {/* Variable context register (Left sidebar) */}
        <div className="hidden lg:flex">
          <WorkflowInspector
            variables={variables}
            onUpdateVariable={(key, val) => {
              setVariables((prev) => ({ ...prev, [key]: val }));
            }}
            traceHistory={traceHistory}
          />
        </div>

        {isInspectorOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              aria-label="Close inspector"
              onClick={() => setIsInspectorOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] rounded-t-3xl border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-800 dark:text-white">{t.dialogFlow.layout.mobileInspectorTitle}</span>
                <button
                  type="button"
                  onClick={() => setIsInspectorOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  {t.dialogFlow.layout.mobileInspectorClose}
                </button>
              </div>
              <WorkflowInspector
                variant="compact"
                className="w-full h-auto border-0 shadow-none rounded-none"
                variables={variables}
                onUpdateVariable={(key, val) => {
                  setVariables((prev) => ({ ...prev, [key]: val }));
                }}
                traceHistory={traceHistory}
              />
            </div>
          </div>
        )}

        {/* Interactive canvas grid (Center pane) */}
        <div className="flex-1 flex flex-col relative min-w-0 h-[60vh] lg:h-full">
          <WorkflowCanvas
            nodes={nodes}
            edges={edges}
            onNodePositionChange={updateNodePosition}
            onDeleteNode={deleteNode}
            selectedNodeId={selectedNodeId}
            selectedEdgeId={selectedEdgeId}
            onSelectNode={selectNode}
            onSelectEdge={selectEdge}
            onDeleteEdge={deleteEdge}
            onConnectNodes={connectNodes}
            panX={panX}
            panY={panY}
            zoom={zoom}
            onPan={(x, y) => {
              setPanX(x);
              setPanY(y);
            }}
            activeNodeId={activeNodeId}
          />

          {/* Minimap overlay */}
          <WorkflowMinimap nodes={nodes} activeNodeId={activeNodeId} />
        </div>

        {/* Simulator — desktop dock; mobile opens from toolbar sheet */}
        <div className="hidden h-full min-h-0 w-full shrink-0 lg:flex lg:w-80">
          <WorkflowSimulator
            variant="sidebar"
            isRunning={isRunning}
            chatHistory={chatHistory}
            logs={logs}
            waitingForInput={waitingForInput}
            onStep={stepSimulation}
            onSubmitInput={submitUserInput}
            onStart={startSimulation}
          />
        </div>

        {/* Node Settings slide drawer (Context overlay overlaying right simulator) */}
        {selectedNode && (
          <NodeSettingsDrawer
            key={selectedNode.id}
            node={selectedNode}
            onClose={() => selectNode(null)}
            onUpdateConfig={updateNodeConfig}
            onUpdateName={handleUpdateNodeName}
          />
        )}
      </div>

      <MobileSheet
        open={simulatorSheetOpen}
        onClose={() => setSimulatorSheetOpen(false)}
        title={t.dialogFlow.layout.simulatorSheetTitle}
        description={t.dialogFlow.layout.simulatorSheetDesc}
        bodyClassName="max-h-[min(85dvh,640px)]"
      >
        <div className="flex min-h-[min(55dvh,480px)] flex-col">
          <WorkflowSimulator
            variant="panel"
            isRunning={isRunning}
            chatHistory={chatHistory}
            logs={logs}
            waitingForInput={waitingForInput}
            onStep={stepSimulation}
            onSubmitInput={submitUserInput}
            onStart={startSimulation}
          />
        </div>
      </MobileSheet>

      {/* Persistence footer bar */}
      <div className="bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-[10px] font-mono text-slate-400 shrink-0">
        <span className="truncate">{t.dialogFlow.layout.footerVersion}</span>
        <div className="flex flex-wrap gap-2.5 sm:justify-end">
          <button
            onClick={handleLoadFlow}
            className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 rounded-lg text-slate-700 dark:text-slate-300"
          >
            {t.dialogFlow.layout.footerLoadDraft}
          </button>
          <button
            onClick={handleSaveFlow}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
          >
            {t.dialogFlow.layout.footerSaveDraft}
          </button>
        </div>
      </div>
    </div>
  );
}
