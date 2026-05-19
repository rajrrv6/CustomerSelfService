import { useState, useCallback } from 'react';
import { WorkflowNode, WorkflowEdge } from '@/data/seed/workflowSeed';

export function useWorkflowState(initialNodes: WorkflowNode[], initialEdges: WorkflowEdge[]) {
  const [nodes, setNodes] = useState<WorkflowNode[]>(initialNodes);
  const [edges, setEdges] = useState<WorkflowEdge[]>(initialEdges);
  const [undoStack, setUndoStack] = useState<Array<{ nodes: WorkflowNode[]; edges: WorkflowEdge[] }>>([]);
  const [redoStack, setRedoStack] = useState<Array<{ nodes: WorkflowNode[]; edges: WorkflowEdge[] }>>([]);

  const pushState = useCallback((currentNodes: WorkflowNode[], currentEdges: WorkflowEdge[]) => {
    setUndoStack((prev) => [...prev.slice(-49), { nodes: currentNodes, edges: currentEdges }]);
    setRedoStack([]);
  }, []);

  const updateNodePosition = useCallback((id: string, x: number, y: number) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, x: Math.round(x), y: Math.round(y) } : n))
    );
  }, []);

  const updateNodeConfig = useCallback((id: string, newConfig: Partial<WorkflowNode['config']>) => {
    setNodes((prev) => {
      const next = prev.map((n) =>
        n.id === id ? { ...n, config: { ...n.config, ...newConfig } } : n
      );
      pushState(prev, edges);
      return next;
    });
  }, [edges, pushState]);

  const addNode = useCallback((type: WorkflowNode['type']) => {
    setNodes((prev) => {
      const id = `node-${type}-${Date.now()}`;
      const name = `${type.toUpperCase()} Node #${prev.length + 1}`;
      // Offset position slightly from center
      const next = [
        ...prev,
        {
          id,
          type,
          name,
          x: 250 + Math.random() * 80,
          y: 200 + Math.random() * 80,
          config: {}
        }
      ];
      pushState(prev, edges);
      return next;
    });
  }, [edges, pushState]);

  const deleteNode = useCallback((id: string) => {
    setNodes((prevNodes) => {
      setEdges((prevEdges) => {
        const nextEdges = prevEdges.filter((e) => e.source !== id && e.target !== id);
        pushState(prevNodes, prevEdges);
        return nextEdges;
      });
      return prevNodes.filter((n) => n.id !== id);
    });
  }, [pushState]);

  const connectNodes = useCallback((source: string, target: string, label?: string) => {
    if (source === target) return;
    setEdges((prev) => {
      // Avoid duplicate edges
      const exists = prev.some((e) => e.source === source && e.target === target);
      if (exists) return prev;

      const newEdge: WorkflowEdge = {
        id: `edge-${Date.now()}`,
        source,
        target,
        label
      };
      const next = [...prev, newEdge];
      pushState(nodes, prev);
      return next;
    });
  }, [nodes, pushState]);

  const deleteEdge = useCallback((edgeId: string) => {
    setEdges((prev) => {
      const next = prev.filter((e) => e.id !== edgeId);
      pushState(nodes, prev);
      return next;
    });
  }, [nodes, pushState]);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, { nodes, edges }]);
    setNodes(previous.nodes);
    setEdges(previous.edges);
  }, [nodes, edges, undoStack]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev, { nodes, edges }]);
    setNodes(next.nodes);
    setEdges(next.edges);
  }, [nodes, edges, redoStack]);

  // Validation
  const validateWorkflow = useCallback((): { errors: string[]; warnings: string[] } => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Must have at least one Intent node
    const hasIntent = nodes.some((n) => n.type === 'intent');
    if (!hasIntent) {
      errors.push('Workflow must contain at least one Intent trigger node to handle starting phrases.');
    }

    // 2. Disconnected Nodes check
    nodes.forEach((n) => {
      const hasConnection = edges.some((e) => e.source === n.id || e.target === n.id);
      if (!hasConnection) {
        warnings.push(`Node "${n.name}" is fully disconnected and will never execute.`);
      }

      // Specific validation
      if (n.type === 'api' && !n.config.apiUrl) {
        errors.push(`API Node "${n.name}" is missing a valid HTTP target URL.`);
      }
      if (n.type === 'db' && !n.config.dbTargetTable) {
        warnings.push(`DB Query Node "${n.name}" has no target table selected.`);
      }
      if (n.type === 'rag' && !n.config.ragSource) {
        errors.push(`RAG Retrieval Node "${n.name}" is missing target knowledge base sources.`);
      }
    });

    return { errors, warnings };
  }, [nodes, edges]);

  return {
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
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    validateWorkflow
  };
}
