import { Node, Edge } from 'reactflow';

export type DialogNodeType =
  | 'start'
  | 'message'
  | 'condition'
  | 'intent'
  | 'api_action'
  | 'escalation'
  | 'variable_set'
  | 'delay'
  | 'human_handoff'
  | 'knowledge_search'
  | 'end';

export interface Attachment {
  type: 'image' | 'pdf' | 'link';
  url: string;
  name: string;
}

export interface ConditionRule {
  id: string;
  variable: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains';
  value: string;
  targetHandleId: string;
}

export interface HeaderConfig {
  key: string;
  value: string;
}

export interface DialogNodeConfig {
  // Start Node
  startMessageEn?: string;
  startMessageAr?: string;

  // Message Node
  messageEn?: string;
  messageAr?: string;
  typingDelayMs?: number;
  attachments?: Attachment[];

  // Condition Node
  conditions?: ConditionRule[];
  fallbackHandleId?: string;

  // Intent Node
  intentName?: string;
  utterances?: string[];
  intentOutputTextEn?: string;
  intentOutputTextAr?: string;

  // API Action Node
  apiUrl?: string;
  apiMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  apiHeaders?: HeaderConfig[];
  apiPayload?: string;
  apiRetryCount?: number;
  apiTimeoutSeconds?: number;

  // Escalation Node
  escalationQueue?: string;
  escalationPriority?: 'low' | 'medium' | 'high' | 'urgent';
  escalationSeverity?: number;
  escalationReasonEn?: string;
  escalationReasonAr?: string;

  // Variable Set Node
  variableKey?: string;
  variableValue?: string;

  // Delay Node
  delaySeconds?: number;

  // Human Handoff Node
  handoffQueue?: string;
  handoffReasonEn?: string;
  handoffReasonAr?: string;

  // Knowledge Search Node
  kbSource?: string;
  kbMinConfidence?: number;

  // End Node
  endMessageEn?: string;
  endMessageAr?: string;
  triggerCSAT?: boolean;
}

export interface DialogNodeData {
  labelEn: string;
  labelAr: string;
  config: DialogNodeConfig;
  status?: 'success' | 'warning' | 'error' | 'neutral';
  validationErrors?: string[];
}

export type DialogNode = Node<DialogNodeData>;
export type DialogEdge = Edge;

export interface VariableItem {
  key: string;
  category: 'system' | 'session' | 'customer' | 'order' | 'ai';
  description: string;
  defaultValue: string;
}

export type SimulationMode = 'normal' | 'low_confidence' | 'escalation' | 'api_timeout';

export interface SimulationLog {
  nodeId: string;
  nodeName: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: string;
}

export interface ChatMessage {
  sender: 'user' | 'bot' | 'system';
  text: string;
  timestamp: string;
}

export interface ValidationDiagnostic {
  nodeId: string;
  rule: string;
  severity: 'info' | 'warning' | 'critical';
  messageEn: string;
  messageAr: string;
}
