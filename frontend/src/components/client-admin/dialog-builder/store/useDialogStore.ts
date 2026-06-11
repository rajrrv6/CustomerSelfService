import { create } from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges, Connection, EdgeChange, NodeChange, XYPosition } from 'reactflow';
import { DialogNode, DialogEdge, DialogNodeConfig, SimulationMode, SimulationLog, ChatMessage, ValidationDiagnostic, DialogNodeType } from '../types';

interface HistoryState {
  nodes: DialogNode[];
  edges: DialogEdge[];
}

interface DialogState {
  // Graph Canvas States
  nodes: DialogNode[];
  edges: DialogEdge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  
  // History States (Undo/Redo)
  past: HistoryState[];
  future: HistoryState[];

  // Validation States
  diagnostics: ValidationDiagnostic[];

  // Simulation States
  simulationMode: SimulationMode;
  isSimulating: boolean;
  activeSimNodeId: string | null;
  simVariables: Record<string, string>;
  simLogs: SimulationLog[];
  simChatHistory: ChatMessage[];
  simWaitingForInput: boolean;
  simInputPrompt: string;

  // Canvas Viewport Info
  zoom: number;

  // Actions - Graph Modifications
  setNodes: (nodes: DialogNode[] | ((prev: DialogNode[]) => DialogNode[])) => void;
  setEdges: (edges: DialogEdge[] | ((prev: DialogEdge[]) => DialogEdge[])) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  selectNode: (nodeId: string | null) => void;
  selectEdge: (edgeId: string | null) => void;
  addNode: (type: DialogNodeType, position?: XYPosition) => void;
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void;
  updateNodeConfig: (nodeId: string, config: Partial<DialogNodeConfig>) => void;
  updateNodeName: (nodeId: string, nameEn: string, nameAr: string) => void;

  // Actions - Undo/Redo
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Actions - Validation
  setDiagnostics: (diagnostics: ValidationDiagnostic[]) => void;

  // Actions - Simulation
  setSimulationMode: (mode: SimulationMode) => void;
  startSimulation: () => void;
  stepSimulation: () => void;
  submitSimInput: (input: string) => void;
  stopSimulation: () => void;
  setSimVariable: (key: string, value: string) => void;
  resetSimVariables: () => void;
}

export const initialVariables: Record<string, string> = {
  customer_name: 'Amina Al-Farsi',
  customer_email: 'amina.farsi@company.sa',
  customer_tier: 'VIP',
  invoice_amount: '1240.00',
  refund_reason: '',
  preferred_email: '',
  stripe_connected: 'true',
  ledger_lock_verified: 'false',
  ticket_id: 'TKT-82739',
  intent_confidence: '0.85',
  language: 'en',
  queue_name: ''
};

// Initial Seed Nodes
const seedNodes: DialogNode[] = [
  {
    id: 'node-start',
    type: 'start',
    position: { x: 100, y: 200 },
    data: {
      labelEn: 'Start Gateway',
      labelAr: 'بوابة البداية',
      config: {
        startMessageEn: 'Session initialized.',
        startMessageAr: 'تم بدء الجلسة.'
      }
    }
  },
  {
    id: 'node-welcome',
    type: 'intent',
    position: { x: 300, y: 200 },
    data: {
      labelEn: 'Welcome Intent Matcher',
      labelAr: 'مطابق نية الترحيب',
      config: {
        intentName: 'request_refund',
        utterances: ['I want a refund', 'Refund status', 'Cancel my subscription'],
        intentOutputTextEn: 'Welcome to mPaaS Customer Self Service. Let me check your request details...',
        intentOutputTextAr: 'مرحباً بكم في الخدمة الذاتية للعملاء. دعني أتحقق من تفاصيل طلبك...'
      }
    }
  },
  {
    id: 'node-stripe-api',
    type: 'api_action',
    position: { x: 550, y: 200 },
    data: {
      labelEn: 'Stripe Invoice API',
      labelAr: 'واجهة فواتير Stripe',
      config: {
        apiUrl: 'https://api.stripe.com/v1/invoices/latest',
        apiMethod: 'POST',
        apiHeaders: [{ key: 'Authorization', value: 'Bearer sk_test_51P' }],
        apiPayload: '{\n  "customer": "{{customer_email}}"\n}',
        apiTimeoutSeconds: 5,
        apiRetryCount: 1
      }
    }
  },
  {
    id: 'node-vip-branch',
    type: 'condition',
    position: { x: 800, y: 200 },
    data: {
      labelEn: 'VIP Segment Router',
      labelAr: 'موجّه فئات كبار الشخصيات',
      config: {
        conditions: [
          {
            id: 'c1',
            variable: 'invoice_amount',
            operator: 'greater_than',
            value: '1000',
            targetHandleId: 'cond-0'
          }
        ],
        fallbackHandleId: 'fallback'
      }
    }
  },
  {
    id: 'node-rag-kb',
    type: 'knowledge_search',
    position: { x: 1100, y: 80 },
    data: {
      labelEn: 'RAG Policy Search',
      labelAr: 'البحث الذكي في السياسات',
      config: {
        kbSource: 'Standard Return & Exchange Policy PDF',
        kbMinConfidence: 0.85
      }
    }
  },
  {
    id: 'node-delay-sync',
    type: 'delay',
    position: { x: 1350, y: 80 },
    data: {
      labelEn: 'Wait API Sync',
      labelAr: 'انتظار مزامنة الواجهة',
      config: {
        delaySeconds: 3
      }
    }
  },
  {
    id: 'node-variable-set',
    type: 'variable_set',
    position: { x: 1550, y: 80 },
    data: {
      labelEn: 'Set Ledger Status',
      labelAr: 'تحديث سجل المعاملات',
      config: {
        variableKey: 'ledger_lock_verified',
        variableValue: 'true'
      }
    }
  },
  {
    id: 'node-db-audit',
    type: 'api_action',
    position: { x: 1750, y: 80 },
    data: {
      labelEn: 'DB Log Audit',
      labelAr: 'تدقيق سجل قاعدة البيانات',
      config: {
        apiUrl: 'https://api.mpaas.internal/v1/audit',
        apiMethod: 'POST',
        apiPayload: '{\n  "event": "refund_triggered",\n  "amount": "{{invoice_amount}}"\n}',
        apiTimeoutSeconds: 5,
        apiRetryCount: 1
      }
    }
  },
  {
    id: 'node-end',
    type: 'end',
    position: { x: 2000, y: 200 },
    data: {
      labelEn: 'CSAT & Complete',
      labelAr: 'تقييم الرضا والإنهاء',
      config: {
        endMessageEn: 'Your refund request has been logged. Settlement takes 3 to 5 business days.',
        endMessageAr: 'تم تسجيل طلب الاسترداد الخاص بك. تستغرق التسوية من ٣ إلى ٥ أيام عمل.',
        triggerCSAT: true
      }
    }
  },
  {
    id: 'node-refund-form',
    type: 'message',
    position: { x: 1100, y: 350 },
    data: {
      labelEn: 'Collect Return Info',
      labelAr: 'جمع بيانات الاسترجاع',
      config: {
        messageEn: 'Please state your refund reason (e.g., {{refund_reason}}):',
        messageAr: 'يرجى تقديم سبب طلب الاسترداد:',
        typingDelayMs: 500
      }
    }
  },
  {
    id: 'node-agent-handoff',
    type: 'human_handoff',
    position: { x: 1350, y: 350 },
    data: {
      labelEn: 'Escalate to Tier 2',
      labelAr: 'تصعيد للمستوى الثاني',
      config: {
        handoffQueue: 'VIP Support Queue',
        handoffReasonEn: 'Standard refund threshold limit exceeded.',
        handoffReasonAr: 'تجاوز حد الاسترداد المالي القياسي.'
      }
    }
  }
];

const seedEdges: DialogEdge[] = [
  { id: 'e-start-welcome', source: 'node-start', target: 'node-welcome' },
  { id: 'e-welcome-stripe', source: 'node-welcome', target: 'node-stripe-api' },
  { id: 'e-stripe-branch', source: 'node-stripe-api', sourceHandle: 'success', target: 'node-vip-branch' },
  { id: 'e-branch-rag', source: 'node-vip-branch', sourceHandle: 'cond-0', target: 'node-rag-kb' },
  { id: 'e-branch-form', source: 'node-vip-branch', sourceHandle: 'fallback', target: 'node-refund-form' },
  { id: 'e-rag-delay', source: 'node-rag-kb', sourceHandle: 'found', target: 'node-delay-sync' },
  { id: 'e-rag-form', source: 'node-rag-kb', sourceHandle: 'not_found', target: 'node-refund-form' },
  { id: 'e-delay-var', source: 'node-delay-sync', target: 'node-variable-set' },
  { id: 'e-var-audit', source: 'node-variable-set', target: 'node-db-audit' },
  { id: 'e-audit-end', source: 'node-db-audit', sourceHandle: 'success', target: 'node-end' },
  { id: 'e-form-handoff', source: 'node-refund-form', target: 'node-agent-handoff' }
];

export const useDialogStore = create<DialogState>((set, get) => ({
  // Core Graph State
  nodes: seedNodes,
  edges: seedEdges,
  selectedNodeId: null,
  selectedEdgeId: null,

  // Undo/Redo history
  past: [],
  future: [],

  // Validation diagnostics
  diagnostics: [],

  // Simulation parameters
  simulationMode: 'normal',
  isSimulating: false,
  activeSimNodeId: null,
  simVariables: { ...initialVariables },
  simLogs: [],
  simChatHistory: [],
  simWaitingForInput: false,
  simInputPrompt: '',

  // Viewport
  zoom: 1,

  // Node & Edge state updates
  setNodes: (nodes) => {
    set((state) => {
      const nextNodes = typeof nodes === 'function' ? nodes(state.nodes) : nodes;
      return { nodes: nextNodes };
    });
  },

  setEdges: (edges) => {
    set((state) => {
      const nextEdges = typeof edges === 'function' ? edges(state.edges) : edges;
      return { edges: nextEdges };
    });
  },

  onNodesChange: (changes) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
    }));
  },

  onEdgesChange: (changes) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    }));
  },

  onConnect: (connection) => {
    get().pushHistory();
    // React Flow connection helper: handles source/target handles automatically
    set((state) => ({
      edges: addEdge({ ...connection, id: `e-${Date.now()}` }, state.edges),
    }));
  },

  selectNode: (nodeId) => {
    set({ selectedNodeId: nodeId, selectedEdgeId: null });
  },

  selectEdge: (edgeId) => {
    set({ selectedEdgeId: edgeId, selectedNodeId: null });
  },

  addNode: (type, position) => {
    get().pushHistory();
    const id = `node-${Date.now()}`;
    const defaultLabels: Record<DialogNodeType, { en: string; ar: string }> = {
      start: { en: 'Start Gateway', ar: 'بوابة البداية' },
      message: { en: 'New Message', ar: 'رسالة جديدة' },
      condition: { en: 'Condition Router', ar: 'موجّه الشرط' },
      intent: { en: 'Intent Matcher', ar: 'مطابق النية' },
      api_action: { en: 'API Request', ar: 'طلب واجهة برمجة' },
      escalation: { en: 'SLA Escalation', ar: 'تصعيد SLA' },
      variable_set: { en: 'Set Variable', ar: 'تعيين متغير' },
      delay: { en: 'Time Delay', ar: 'تأخير زمني' },
      human_handoff: { en: 'Agent Handoff', ar: 'تحويل لوكيل بشري' },
      knowledge_search: { en: 'Knowledge KB Search', ar: 'بحث قاعدة المعرفة' },
      end: { en: 'End Node', ar: 'عقدة النهاية' }
    };

    const defaultConfigs: Record<DialogNodeType, DialogNodeConfig> = {
      start: { startMessageEn: 'Session started.' },
      message: { messageEn: 'Enter text here.', typingDelayMs: 300, attachments: [] },
      condition: { conditions: [], fallbackHandleId: 'fallback' },
      intent: { intentName: 'default_intent', utterances: [], intentOutputTextEn: 'Intent matched.' },
      api_action: { apiUrl: 'https://api.example.com', apiMethod: 'GET', apiHeaders: [], apiPayload: '', apiRetryCount: 1, apiTimeoutSeconds: 5 },
      escalation: { escalationQueue: 'General Support Queue', escalationPriority: 'medium', escalationSeverity: 3 },
      variable_set: { variableKey: '', variableValue: '' },
      delay: { delaySeconds: 5 },
      human_handoff: { handoffQueue: 'General Queue' },
      knowledge_search: { kbSource: 'faq', kbMinConfidence: 0.75 },
      end: { endMessageEn: 'Thank you.', triggerCSAT: false }
    };

    const newNode: DialogNode = {
      id,
      type,
      position: position || { x: 300, y: 150 },
      data: {
        labelEn: defaultLabels[type].en,
        labelAr: defaultLabels[type].ar,
        config: defaultConfigs[type],
        status: 'neutral'
      }
    };

    set((state) => ({
      nodes: [...state.nodes, newNode],
      selectedNodeId: id,
      selectedEdgeId: null
    }));
  },

  deleteNode: (nodeId) => {
    if (nodeId === 'node-start') return; // Cannot delete start node
    get().pushHistory();
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId
    }));
  },

  deleteEdge: (edgeId) => {
    get().pushHistory();
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== edgeId),
      selectedEdgeId: state.selectedEdgeId === edgeId ? null : state.selectedEdgeId
    }));
  },

  updateNodeConfig: (nodeId, config) => {
    get().pushHistory();
    set((state) => ({
      nodes: state.nodes.map((n) => {
        if (n.id === nodeId) {
          return {
            ...n,
            data: {
              ...n.data,
              config: {
                ...n.data.config,
                ...config
              }
            }
          };
        }
        return n;
      })
    }));
  },

  updateNodeName: (nodeId, nameEn, nameAr) => {
    get().pushHistory();
    set((state) => ({
      nodes: state.nodes.map((n) => {
        if (n.id === nodeId) {
          return {
            ...n,
            data: {
              ...n.data,
              labelEn: nameEn,
              labelAr: nameAr
            }
          };
        }
        return n;
      })
    }));
  },

  // Undo/Redo core implementations
  pushHistory: () => {
    const { nodes, edges } = get();
    // Compact deep copy of nodes & edges to store in history
    const nodesCopy = JSON.parse(JSON.stringify(nodes));
    const edgesCopy = JSON.parse(JSON.stringify(edges));
    set((state) => ({
      past: [...state.past.slice(-49), { nodes: state.nodes, edges: state.edges }], // Max 50 history size
      future: []
    }));
  },

  undo: () => {
    const { past, nodes, edges } = get();
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    
    set({
      nodes: previous.nodes,
      edges: previous.edges,
      past: newPast,
      future: [{ nodes, edges }, ...get().future],
      selectedNodeId: null,
      selectedEdgeId: null
    });
  },

  redo: () => {
    const { future, nodes, edges } = get();
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);

    set({
      nodes: next.nodes,
      edges: next.edges,
      past: [...get().past, { nodes, edges }],
      future: newFuture,
      selectedNodeId: null,
      selectedEdgeId: null
    });
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,

  setDiagnostics: (diagnostics) => {
    set({ diagnostics });
  },

  // Simulation implementation parameters
  setSimulationMode: (mode) => {
    set({ simulationMode: mode });
  },

  startSimulation: () => {
    const startNode = get().nodes.find(n => n.type === 'start');
    if (!startNode) {
      alert('Start node is missing. Cannot simulate.');
      return;
    }
    set({
      isSimulating: true,
      activeSimNodeId: startNode.id,
      simVariables: { ...initialVariables },
      simLogs: [{
        nodeId: startNode.id,
        nodeName: startNode.data.labelEn,
        type: 'info',
        message: `Simulation initialized on mode: ${get().simulationMode.toUpperCase()}`,
        timestamp: new Date().toLocaleTimeString()
      }],
      simChatHistory: [{
        sender: 'system',
        text: 'Self-service chat session initialized.',
        timestamp: new Date().toLocaleTimeString()
      }],
      simWaitingForInput: false,
      simInputPrompt: ''
    });
  },

  stepSimulation: () => {
    // Handled by GraphExecutionRunner traversal logic
  },

  submitSimInput: (input) => {
    // Handled by GraphExecutionRunner input processing
  },

  stopSimulation: () => {
    set({
      isSimulating: false,
      activeSimNodeId: null,
      simWaitingForInput: false,
      simInputPrompt: ''
    });
  },

  setSimVariable: (key, value) => {
    set((state) => ({
      simVariables: {
        ...state.simVariables,
        [key]: value
      }
    }));
  },

  resetSimVariables: () => {
    set({ simVariables: { ...initialVariables } });
  }
}));
