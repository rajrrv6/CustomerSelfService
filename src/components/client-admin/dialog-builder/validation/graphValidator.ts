import { DialogNode, DialogEdge, ValidationDiagnostic } from '../types';
import { variablesRegistry } from '../inspectors/VariablesSidebar';

export function validateGraph(nodes: DialogNode[], edges: DialogEdge[]): ValidationDiagnostic[] {
  const diagnostics: ValidationDiagnostic[] = [];
  const registeredVarKeys = new Set(variablesRegistry.map((v) => v.key));

  // 1. Check Start Node
  const startNodes = nodes.filter((n) => n.type === 'start');
  if (startNodes.length === 0) {
    diagnostics.push({
      nodeId: 'global',
      rule: 'missing_start',
      severity: 'critical',
      messageEn: 'The dialogue flow has no Start Gateway node. Add a Start Node to begin.',
      messageAr: 'يفتقر مسار الحوار إلى عقدة بوابة البداية. أضف بوابة بداية للبدء.'
    });
  } else if (startNodes.length > 1) {
    startNodes.forEach((n) => {
      diagnostics.push({
        nodeId: n.id,
        rule: 'multiple_start',
        severity: 'critical',
        messageEn: 'Multiple Start Gateway nodes detected. Only one start node is allowed.',
        messageAr: 'تم اكتشاف أكثر من عقدة بداية واحدة. مسموح بعقدة بداية واحدة فقط.'
      });
    });
  }

  const startNode = startNodes[0] || null;

  // Build adjacency list for reachability checks
  const adjList: Record<string, string[]> = {};
  const incomingCount: Record<string, number> = {};

  nodes.forEach((n) => {
    adjList[n.id] = [];
    incomingCount[n.id] = 0;
  });

  edges.forEach((e) => {
    if (adjList[e.source]) {
      adjList[e.source].push(e.target);
    }
    if (incomingCount[e.target] !== undefined) {
      incomingCount[e.target]++;
    }
  });

  // Reachability check using DFS from StartNode
  const visited = new Set<string>();
  function dfs(nodeId: string) {
    visited.add(nodeId);
    const neighbors = adjList[nodeId] || [];
    neighbors.forEach((nId) => {
      if (!visited.has(nId)) {
        dfs(nId);
      }
    });
  }

  if (startNode) {
    dfs(startNode.id);
  }

  nodes.forEach((n) => {
    const nodeName = n.data.labelEn;

    // 2. Unreachable nodes warning
    if (startNode && !visited.has(n.id) && n.type !== 'start') {
      diagnostics.push({
        nodeId: n.id,
        rule: 'unreachable_node',
        severity: 'warning',
        messageEn: `Node is unreachable from the Start Gateway.`,
        messageAr: 'العقدة معزولة وغير متصلة ببوابة البداية.'
      });
    }

    // 3. Disconnected nodes (no incoming edges, except start)
    if (incomingCount[n.id] === 0 && n.type !== 'start' && visited.has(n.id)) {
      diagnostics.push({
        nodeId: n.id,
        rule: 'disconnected_node',
        severity: 'warning',
        messageEn: 'No incoming paths connected to this node.',
        messageAr: 'لا توجد مسارات واردة متصلة بهذه العقدة.'
      });
    }

    // 4. Dead-ends: non-terminal nodes with no outgoing edges
    const outgoing = edges.filter((e) => e.source === n.id);
    const isTerminal = n.type === 'end' || n.type === 'human_handoff' || n.type === 'escalation';

    if (outgoing.length === 0 && !isTerminal) {
      diagnostics.push({
        nodeId: n.id,
        rule: 'dead_end',
        severity: 'critical',
        messageEn: 'Node has no outgoing paths connected. Must lead to another node or end.',
        messageAr: 'العقدة لا تحتوي على مسارات صادرة. يجب توصيلها بعقدة أخرى أو إنهائها.'
      });
    }

    // 5. Node-specific configuration validators
    const config = n.data.config || {};

    // Condition Node
    if (n.type === 'condition') {
      const conditions = config.conditions || [];
      if (conditions.length === 0) {
        diagnostics.push({
          nodeId: n.id,
          rule: 'empty_conditions',
          severity: 'warning',
          messageEn: 'Condition node has no routing rules configured. It will route all chats to Fallback.',
          messageAr: 'عقدة الشرط لا تحتوي على أي قواعد مضافة. سيتم توجيه جميع المحادثات للمسار البديل.'
        });
      } else {
        // Check if any rule targets are not wired
        conditions.forEach((c) => {
          const hasEdge = outgoing.some((e) => e.sourceHandle === c.targetHandleId);
          if (!hasEdge) {
            diagnostics.push({
              nodeId: n.id,
              rule: 'unwired_condition_handle',
              severity: 'critical',
              messageEn: `Branch rule targeting "${c.variable}" is unwired. Connect the output handle on the canvas.`,
              messageAr: `المسار الخاص بشرط "${c.variable}" غير متصل. يرجى توصيل مخرج الشرط في مساحة العمل.`
            });
          }
        });
      }

      // Check default fallback edge
      const hasFallbackEdge = outgoing.some((e) => e.sourceHandle === 'fallback');
      if (!hasFallbackEdge) {
        diagnostics.push({
          nodeId: n.id,
          rule: 'missing_fallback_edge',
          severity: 'critical',
          messageEn: 'Missing default Fallback outlet. Wire the default fallback handle.',
          messageAr: 'يفتقر موجّه الشرط إلى مخرج المسار البديل. يرجى توصيل مخرج Fallback.'
        });
      }
    }

    // API Node Success/Failure handles check
    if (n.type === 'api_action') {
      const hasSuccess = outgoing.some((e) => e.sourceHandle === 'success');
      const hasFailure = outgoing.some((e) => e.sourceHandle === 'failure');

      if (!hasSuccess) {
        diagnostics.push({
          nodeId: n.id,
          rule: 'missing_api_success',
          severity: 'critical',
          messageEn: 'Missing Success path connection. Connect the Success handle.',
          messageAr: 'يفتقر طلب الـ API إلى توصيل مسار النجاح. يرجى توصيل مخرج Success.'
        });
      }
      if (!hasFailure) {
        diagnostics.push({
          nodeId: n.id,
          rule: 'missing_api_failure',
          severity: 'warning',
          messageEn: 'Missing Failure/exception recovery path connection.',
          messageAr: 'يفتقر طلب الـ API إلى توصيل مسار الفشل أو الطوارئ.'
        });
      }

      // Payload JSON format validator
      if (config.apiPayload) {
        try {
          // Replace brackets to see if it parses
          const dummyPayload = config.apiPayload.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, 'dummy');
          JSON.parse(dummyPayload);
        } catch (err) {
          diagnostics.push({
            nodeId: n.id,
            rule: 'invalid_json_payload',
            severity: 'critical',
            messageEn: 'API JSON payload syntax is malformed.',
            messageAr: 'صيغة نص JSON في حمولة الـ API غير صالحة.'
          });
        }
      }
    }

    // RAG KB Search Found/Not-found handles check
    if (n.type === 'knowledge_search') {
      const hasFound = outgoing.some((e) => e.sourceHandle === 'found');
      const hasNotFound = outgoing.some((e) => e.sourceHandle === 'not_found');

      if (!hasFound) {
        diagnostics.push({
          nodeId: n.id,
          rule: 'missing_rag_found',
          severity: 'critical',
          messageEn: 'Missing Found path connection. Connect the Found handle.',
          messageAr: 'يفتقر بحث المعرفة إلى توصيل مسار العثور. يرجى توصيل مخرج Found.'
        });
      }
      if (!hasNotFound) {
        diagnostics.push({
          nodeId: n.id,
          rule: 'missing_rag_notfound',
          severity: 'critical',
          messageEn: 'Missing Fallback Not-Found path connection.',
          messageAr: 'يفتقر بحث المعرفة إلى توصيل مسار عدم العثور.'
        });
      }
    }

    // Escalation target queue check
    if (n.type === 'escalation' && !config.escalationQueue) {
      diagnostics.push({
        nodeId: n.id,
        rule: 'missing_escalation_queue',
        severity: 'critical',
        messageEn: 'Escalation queue is not selected.',
        messageAr: 'طابور التصعيد غير محدد.'
      });
    }

    // Human Handoff queue check
    if (n.type === 'human_handoff' && !config.handoffQueue) {
      diagnostics.push({
        nodeId: n.id,
        rule: 'missing_handoff_queue',
        severity: 'critical',
        messageEn: 'Agent handoff target group is not selected.',
        messageAr: 'طابور تحويل العميل غير محدد.'
      });
    }

    // 6. Orphan variables checking: search for {{variable}} in text configurations
    const textBlocksToCheck = [
      config.messageEn,
      config.messageAr,
      config.apiPayload,
      config.variableValue
    ].filter(Boolean) as string[];

    textBlocksToCheck.forEach((text) => {
      const matches = text.match(/\{\{([a-zA-Z0-9_]+)\}\}/g) || [];
      matches.forEach((m) => {
        const varKey = m.slice(2, -2);
        if (!registeredVarKeys.has(varKey)) {
          diagnostics.push({
            nodeId: n.id,
            rule: 'orphan_variable',
            severity: 'warning',
            messageEn: `Orphan variable token found: {{${varKey}}}. This variable is not registered in the system registry.`,
            messageAr: `تم العثور على رمز متغير غير معرّف: {{${varKey}}}. هذا المتغير غير مسجل في سجل النظام.`
          });
        }
      });
    });
  });

  return diagnostics;
}
