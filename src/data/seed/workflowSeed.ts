export interface WorkflowNode {
  id: string;
  type: 'intent' | 'api' | 'db' | 'rag' | 'branch' | 'handoff' | 'delay' | 'form' | 'carousel';
  name: string;
  x: number;
  y: number;
  config: {
    intentName?: string;
    utterances?: string[];
    apiUrl?: string;
    apiMethod?: 'GET' | 'POST';
    apiPayload?: string;
    dbQuery?: string;
    dbTargetTable?: string;
    ragSource?: string;
    ragMinConfidence?: number;
    branchConditions?: Array<{ condition: string; targetNodeId: string }>;
    handoffQueue?: string;
    delaySeconds?: number;
    formFields?: Array<{ name: string; type: 'text' | 'number' | 'email'; required: boolean; prompt: string }>;
    carouselItems?: Array<{ title: string; subtitle: string; imageUrl?: string }>;
    outputText?: string;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export const initialNodes: WorkflowNode[] = [
  {
    id: 'node-welcome',
    type: 'intent',
    name: '1. Welcome Intent Triggers',
    x: 80,
    y: 120,
    config: {
      intentName: 'request_refund',
      utterances: ['I want a refund', 'Refund status', 'Cancel my subscription'],
      outputText: 'Welcome to mPaaS Customer Self Service. Let me check your request details...'
    }
  },
  {
    id: 'node-stripe-api',
    type: 'api',
    name: '2. Stripe API Fetch Invoice',
    x: 320,
    y: 120,
    config: {
      apiUrl: 'https://api.stripe.com/v1/invoices/latest',
      apiMethod: 'GET',
      apiPayload: '{\n  "customer": "{{customerEmail}}"\n}',
      outputText: 'Invoking Stripe secure gateway to retrieve the latest transaction...'
    }
  },
  {
    id: 'node-vip-branch',
    type: 'branch',
    name: '3. VIP Segment Router',
    x: 560,
    y: 120,
    config: {
      branchConditions: [
        { condition: 'invoice.amount > 1000', targetNodeId: 'node-rag-kb' },
        { condition: 'default', targetNodeId: 'node-refund-form' }
      ],
      outputText: 'Evaluating transaction volume rules against client profile...'
    }
  },
  {
    id: 'node-rag-kb',
    type: 'rag',
    name: '4. Knowledge Base Query',
    x: 800,
    y: 40,
    config: {
      ragSource: 'Standard Return & Exchange Policy PDF',
      ragMinConfidence: 0.85,
      outputText: 'Scanning RAG indexed vector DB for refund thresholds exceptions...'
    }
  },
  {
    id: 'node-delay-sync',
    type: 'delay',
    name: '5. Wait API Ledger Lock',
    x: 1040,
    y: 40,
    config: {
      delaySeconds: 3,
      outputText: 'Holding session briefly to verify ledger locks...'
    }
  },
  {
    id: 'node-db-audit',
    type: 'db',
    name: '6. DB Audit Check Logs',
    x: 1280,
    y: 40,
    config: {
      dbTargetTable: 'refund_audit_ledger',
      dbQuery: 'INSERT INTO audit_logs (id, event) VALUES (?, ?);',
      outputText: 'Updating target secure compliance database records...'
    }
  },
  {
    id: 'node-refund-carousel',
    type: 'carousel',
    name: '7. Card Replacement Offers',
    x: 1520,
    y: 40,
    config: {
      carouselItems: [
        { title: '10% Refund + Gift Voucher', subtitle: 'Instant bonus voucher credit code' },
        { title: 'Full Refund to Visa card', subtitle: 'Settlement takes 3 to 5 business days' }
      ],
      outputText: 'Presenting active replacement choices to user...'
    }
  },
  {
    id: 'node-refund-form',
    type: 'form',
    name: '4b. Collect Account Fields',
    x: 800,
    y: 280,
    config: {
      formFields: [
        { name: 'refundReason', type: 'text', required: true, prompt: 'Please write your refund reason:' },
        { name: 'preferredEmail', type: 'email', required: true, prompt: 'Provide your notification email:' }
      ],
      outputText: 'Gathering mandatory verification data fields...'
    }
  },
  {
    id: 'node-agent-handoff',
    type: 'handoff',
    name: '5b. Tier 2 Support Escalator',
    x: 1040,
    y: 280,
    config: {
      handoffQueue: 'VIP Support Queue',
      outputText: 'Routing active session state parameters directly to agent unified workspace...'
    }
  }
];

export const initialEdges: WorkflowEdge[] = [
  { id: 'e1', source: 'node-welcome', target: 'node-stripe-api' },
  { id: 'e2', source: 'node-stripe-api', target: 'node-vip-branch' },
  { id: 'e3', source: 'node-vip-branch', target: 'node-rag-kb', label: 'VIP tier' },
  { id: 'e4', source: 'node-vip-branch', target: 'node-refund-form', label: 'Standard tier' },
  { id: 'e5', source: 'node-rag-kb', target: 'node-delay-sync' },
  { id: 'e6', source: 'node-delay-sync', target: 'node-db-audit' },
  { id: 'e7', source: 'node-db-audit', target: 'node-refund-carousel' },
  { id: 'e8', source: 'node-refund-form', target: 'node-agent-handoff' }
];

export const initialVariables = {
  customerName: 'Amina Al-Farsi',
  customerEmail: 'amina.farsi@company.sa',
  customerTier: 'VIP',
  invoiceAmount: '1240.00',
  refundReason: '',
  preferredEmail: '',
  stripeConnected: 'true',
  ledgerLockVerified: 'false'
};
