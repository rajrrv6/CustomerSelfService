'use client';

import React, { useRef, useCallback, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  ConnectionLineType,
  Node,
  Edge,
  ReactFlowProvider,
  useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useDialogStore } from '../store/useDialogStore';
import { useUIStore } from '@/stores/uiStore';
import { DialogNodeType } from '../types';

// Custom Nodes Registry
import { StartNode } from '../nodes/StartNode';
import { MessageNode } from '../nodes/MessageNode';
import { ConditionNode } from '../nodes/ConditionNode';
import { IntentNode } from '../nodes/IntentNode';
import { APIActionNode } from '../nodes/APIActionNode';
import { EscalationNode } from '../nodes/EscalationNode';
import { VariableSetNode } from '../nodes/VariableSetNode';
import { DelayNode } from '../nodes/DelayNode';
import { HumanHandoffNode } from '../nodes/HumanHandoffNode';
import { KnowledgeSearchNode } from '../nodes/KnowledgeSearchNode';
import { EndNode } from '../nodes/EndNode';

const nodeTypes = {
  start: StartNode,
  message: MessageNode,
  condition: ConditionNode,
  intent: IntentNode,
  api_action: APIActionNode,
  escalation: EscalationNode,
  variable_set: VariableSetNode,
  delay: DelayNode,
  human_handoff: HumanHandoffNode,
  knowledge_search: KnowledgeSearchNode,
  end: EndNode
};

function FlowInner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { project } = useReactFlow();

  // Zustand State selectors
  const nodes = useDialogStore((s) => s.nodes);
  const edges = useDialogStore((s) => s.edges);
  const onNodesChange = useDialogStore((s) => s.onNodesChange);
  const onEdgesChange = useDialogStore((s) => s.onEdgesChange);
  const onConnect = useDialogStore((s) => s.onConnect);
  const selectNode = useDialogStore((s) => s.selectNode);
  const selectEdge = useDialogStore((s) => s.selectEdge);
  const addNode = useDialogStore((s) => s.addNode);
  const deleteNode = useDialogStore((s) => s.deleteNode);
  const deleteEdge = useDialogStore((s) => s.deleteEdge);
  const selectedNodeId = useDialogStore((s) => s.selectedNodeId);
  const selectedEdgeId = useDialogStore((s) => s.selectedEdgeId);
  const activeSimNodeId = useDialogStore((s) => s.activeSimNodeId);
  const pushHistory = useDialogStore((s) => s.pushHistory);

  const lang = useUIStore((s) => s.lang);
  const isAr = lang === 'ar';

  // Handle drag over
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop node
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current) return;

      const type = event.dataTransfer.getData('application/reactflow') as DialogNodeType;

      if (!type) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      // Calculate drop position relative to canvas coordinate space
      const position = project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      addNode(type, position);
    },
    [project, addNode]
  );

  // Handle selection change
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      selectNode(node.id);
    },
    [selectNode]
  );

  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      selectEdge(edge.id);
    },
    [selectEdge]
  );

  const onPaneClick = useCallback(() => {
    selectNode(null);
    selectEdge(null);
  }, [selectNode, selectEdge]);

  // Keyboard delete listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId && selectedNodeId !== 'node-start') {
          deleteNode(selectedNodeId);
        } else if (selectedEdgeId) {
          deleteEdge(selectedEdgeId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, selectedEdgeId, deleteNode, deleteEdge]);

  // Render edge highlights when active simulation is running
  const styledEdges = edges.map((edge) => {
    // If the edge connects from active simulation node, highlight it
    const isTraversed = activeSimNodeId === edge.source;
    if (isTraversed) {
      return {
        ...edge,
        animated: true,
        style: { stroke: '#3b82f6', strokeWidth: 3 },
      };
    }
    const isSelected = selectedEdgeId === edge.id;
    if (isSelected) {
      return {
        ...edge,
        style: { stroke: '#1e293b', strokeWidth: 3 },
      };
    }
    return {
      ...edge,
      style: { stroke: '#cbd5e1', strokeWidth: 1.5 },
    };
  });

  return (
    <div className="flex-1 h-full w-full relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={styledEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        connectionLineType={ConnectionLineType.SmoothStep}
        snapToGrid={true}
        snapGrid={[15, 15]}
        onNodeDragStop={() => {
          // Push position edits to history stack
          pushHistory();
        }}
        fitView
      >
        <Controls
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-md text-slate-800 dark:text-slate-200"
          showInteractive={false}
        />
        <Background
          color="#94a3b8"
          gap={15}
          size={1}
          className="bg-slate-50 dark:bg-slate-950"
        />
        <MiniMap
          className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl shadow-md hidden sm:block overflow-hidden"
          nodeColor={(node) => {
            if (node.id === activeSimNodeId) return '#3b82f6';
            if (node.id === selectedNodeId) return '#1e293b';
            switch (node.type) {
              case 'start':
                return '#60a5fa';
              case 'end':
              case 'escalation':
                return '#f87171';
              case 'api_action':
              case 'knowledge_search':
                return '#34d399';
              case 'condition':
                return '#fbbf24';
              default:
                return '#94a3b8';
            }
          }}
          maskColor="rgba(241, 245, 249, 0.4)"
        />
      </ReactFlow>
    </div>
  );
}

export function DialogFlowCanvas() {
  return (
    <ReactFlowProvider>
      <FlowInner />
    </ReactFlowProvider>
  );
}
