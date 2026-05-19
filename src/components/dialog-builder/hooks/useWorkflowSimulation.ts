import { useState, useCallback } from 'react';
import { WorkflowNode, WorkflowEdge, initialVariables } from '@/data/seed/workflowSeed';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'system';
  text: string;
  timestamp: string;
}

export function useWorkflowSimulation(nodes: WorkflowNode[], edges: WorkflowEdge[]) {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>(initialVariables);
  const [logs, setLogs] = useState<string[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [waitingForInput, setWaitingForInput] = useState<{ fieldName: string; prompt: string } | null>(null);
  const [traceHistory, setTraceHistory] = useState<string[]>([]);

  const addLog = useCallback((msg: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }, []);

  const addChat = useCallback((sender: 'user' | 'bot' | 'system', text: string) => {
    setChatHistory((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        sender,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, []);

  const startSimulation = useCallback(() => {
    const startNode = nodes.find((n) => n.type === 'intent') || nodes[0];
    if (!startNode) return;

    setActiveNodeId(startNode.id);
    setVariables(initialVariables);
    setLogs([]);
    setChatHistory([]);
    setWaitingForInput(null);
    setTraceHistory([startNode.id]);
    setIsRunning(true);

    const timestamp = new Date().toLocaleTimeString();
    setLogs([`[${timestamp}] Simulation initialized at Intent Trigger Node: ${startNode.name}`]);
    addChat('system', `Simulation started. Entry intent: request_refund`);
    if (startNode.config.outputText) {
      addChat('bot', startNode.config.outputText);
    }
  }, [nodes, addChat]);

  const stepSimulation = useCallback(() => {
    if (!activeNodeId) return;

    const currentNode = nodes.find((n) => n.id === activeNodeId);
    if (!currentNode) return;

    // Check if waiting for input
    if (waitingForInput) {
      addLog(`Waiting for client slot input: "${waitingForInput.fieldName}"`);
      return;
    }

    // Find outgoing edges
    const outgoing = edges.filter((e) => e.source === currentNode.id);

    if (outgoing.length === 0) {
      addLog(`Reached end of workflow path at node: ${currentNode.name}`);
      setIsRunning(false);
      return;
    }

    let nextNodeId: string | null = null;
    let transitionLabel = '';

    // Handle node-specific actions and select next target
    if (currentNode.type === 'branch') {
      // Evaluate VIP logic conditions
      const conditions = currentNode.config.branchConditions || [];
      const invoiceVal = parseFloat(variables.invoiceAmount || '0');

      for (const cond of conditions) {
        if (cond.condition.includes('amount > 1000') && invoiceVal > 1000) {
          nextNodeId = cond.targetNodeId;
          transitionLabel = 'VIP tier (amount > 1000)';
          break;
        }
      }

      if (!nextNodeId) {
        const defaultCond = conditions.find((c) => c.condition === 'default');
        if (defaultCond) {
          nextNodeId = defaultCond.targetNodeId;
          transitionLabel = 'default fallback';
        } else {
          nextNodeId = outgoing[0]?.target;
          transitionLabel = 'fallback sequence';
        }
      }

      addLog(`Evaluated Branch condition. Routing path matches: "${transitionLabel}"`);
    } else if (currentNode.type === 'form') {
      const fields = currentNode.config.formFields || [];
      // Find first empty field
      const unfilled = fields.find((f) => !variables[f.name]);
      if (unfilled) {
        setWaitingForInput({ fieldName: unfilled.name, prompt: unfilled.prompt });
        addChat('bot', unfilled.prompt);
        addLog(`Form node paused: Prompting user input for field "${unfilled.name}"`);
        return;
      } else {
        nextNodeId = outgoing[0]?.target;
        addLog(`Form fields collection complete.`);
      }
    } else {
      nextNodeId = outgoing[0]?.target;
    }

    if (!nextNodeId) {
      addLog(`No valid transition target found.`);
      setIsRunning(false);
      return;
    }

    const nextNode = nodes.find((n) => n.id === nextNodeId);
    if (!nextNode) {
      addLog(`Transition error: Node ${nextNodeId} not found.`);
      setIsRunning(false);
      return;
    }

    // Move to next node
    setActiveNodeId(nextNode.id);
    setTraceHistory((prev) => [...prev, nextNode.id]);
    addLog(`Navigated to node: ${nextNode.name}`);

    // Execute next node configuration logs
    if (nextNode.type === 'api') {
      addChat('system', `API Call: ${nextNode.config.apiMethod || 'GET'} ${nextNode.config.apiUrl}`);
      // Replace variables in payload preview
      let payload = nextNode.config.apiPayload || '';
      Object.entries(variables).forEach(([k, v]) => {
        payload = payload.replace(`{{${k}}}`, v);
      });
      addLog(`API Mock trigger success. Request payload: ${payload}`);
      addChat('bot', `Retrieving transaction invoice ledger status for client account...`);
    } else if (nextNode.type === 'db') {
      addChat('system', `DB Query: ${nextNode.config.dbQuery} on table [${nextNode.config.dbTargetTable}]`);
      addLog(`Database insert query committed safely.`);
      addChat('bot', `Updating system ledger transaction logs.`);
    } else if (nextNode.type === 'rag') {
      addChat('system', `RAG Search: "${nextNode.config.ragSource}" with Min Confidence Score ${(nextNode.config.ragMinConfidence ?? 0.85) * 100}%`);
      addLog(`Chunk retrieval match: "Section 3.2 refunds allow exceptions for shipping damages"`);
      addChat('bot', `Knowledge retrieved: Refunds exceptions are authorized for shipping damages.`);
    } else if (nextNode.type === 'delay') {
      addChat('system', `Delay Node activated: Waiting ${nextNode.config.delaySeconds || 3}s`);
      addLog(`Holding session context... Done.`);
      addChat('bot', `Synchronization complete. Proceeding.`);
    } else if (nextNode.type === 'carousel') {
      addChat('bot', nextNode.config.outputText || 'Please choose from the replacement options below:');
      const items = nextNode.config.carouselItems || [];
      items.forEach((item) => {
        addChat('bot', `[CARD] Option: ${item.title} - ${item.subtitle}`);
      });
    } else if (nextNode.type === 'handoff') {
      addChat('system', `Escalating to queue: ${nextNode.config.handoffQueue}`);
      addLog(`Active socket context transferred directly to: ${nextNode.config.handoffQueue}`);
      addChat('bot', `Routing you to a support specialist from the ${nextNode.config.handoffQueue}.`);
      setIsRunning(false);
    } else if (nextNode.config.outputText) {
      addChat('bot', nextNode.config.outputText);
    }
  }, [activeNodeId, nodes, edges, variables, waitingForInput, addLog, addChat]);

  const submitUserInput = useCallback((text: string) => {
    if (!waitingForInput) return;

    addChat('user', text);
    const field = waitingForInput.fieldName;

    setVariables((prev) => ({
      ...prev,
      [field]: text
    }));

    addLog(`Assigned value "${text}" to local state register variable "${field}"`);
    setWaitingForInput(null);

    // Auto trigger next step after short timeout
    setTimeout(() => {
      stepSimulation();
    }, 400);
  }, [waitingForInput, addChat, addLog, stepSimulation]);

  const resetSimulation = useCallback(() => {
    setActiveNodeId(null);
    setVariables(initialVariables);
    setLogs([]);
    setChatHistory([]);
    setWaitingForInput(null);
    setTraceHistory([]);
    setIsRunning(false);
  }, []);

  return {
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
  };
}
