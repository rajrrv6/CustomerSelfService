'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/components/shared/BadgeSystem';
import {
  Phone, Play, Pause, RotateCcw, AlertTriangle, CheckCircle2, Trash2, Plus,
  Settings, ArrowLeft, Volume2, Calendar, Radio, Users, PhoneForwarded,
  MessageSquare, FileText, Check, Layers, History, HelpCircle, Save, ShieldAlert,
  Sliders, Activity, Sparkles, LogOut, RefreshCw
} from 'lucide-react';

// Define TS interfaces for IVR flow structure
export interface IVRNodeOption {
  key: string;
  label: string;
  targetId: string;
}

export type IVRNodeType =
  | 'welcome'
  | 'menu'
  | 'queue'
  | 'transfer'
  | 'hours'
  | 'voicemail'
  | 'callback'
  | 'ai_assistant'
  | 'end';

export interface IVRNode {
  id: string;
  type: IVRNodeType;
  name: string;
  data: {
    textEn?: string;
    textAr?: string;
    voice?: string;
    speed?: number;
    pitch?: number;
    promptEn?: string;
    promptAr?: string;
    options?: IVRNodeOption[];
    queueType?: 'sales' | 'support' | 'billing' | 'escalation';
    agentGroup?: string;
    transferReason?: string;
    openTargetId?: string;
    closedTargetId?: string;
    holidayTargetId?: string;
    voicemailEnabled?: boolean;
    transcriptionEnabled?: boolean;
    callbackQueue?: string;
    scheduleCallback?: boolean;
    assistantName?: string;
    confidenceThreshold?: number;
    fallbackTargetId?: string;
    triggerSurvey?: boolean;
    targetId?: string; // fallback or sequential next
  };
}

export interface IVRVersion {
  version: string;
  status: 'published' | 'draft';
  lastModified: string;
  modifiedBy: string;
  active: boolean;
  nodes: IVRNode[];
  startNodeId: string;
}

interface VoiceIvrDesignerProps {
  onClose: () => void;
}

// Initial seed nodes representing an enterprise workflow
const SEED_NODES: IVRNode[] = [
  {
    id: 'start_hours',
    type: 'hours',
    name: 'Shift Hours Verification',
    data: {
      openTargetId: 'welcome_prompt',
      closedTargetId: 'offline_voicemail',
      holidayTargetId: 'callback_schedule'
    }
  },
  {
    id: 'welcome_prompt',
    type: 'welcome',
    name: 'Welcome Greeting',
    data: {
      textEn: 'Welcome to our Enterprise Customer Support Center. Please listen carefully to the menu options.',
      textAr: 'مرحباً بكم في مركز دعم العملاء المؤسسي. يرجى الاستماع بعناية إلى خيارات القائمة التالية.',
      voice: 'female-en-1',
      speed: 1.0,
      pitch: 1.0,
      targetId: 'main_menu'
    }
  },
  {
    id: 'main_menu',
    type: 'menu',
    name: 'Main Interactive Menu',
    data: {
      promptEn: 'Press 1 for Sales, Press 2 for AI Assistant Farah, Press 3 for Voicemail.',
      promptAr: 'اضغط ١ للمبيعات، اضغط ٢ للمساعد الذكي فرح، اضغط ٣ لترك رسالة صوتية.',
      options: [
        { key: '1', label: 'Sales Dispatch', targetId: 'sales_queue' },
        { key: '2', label: 'Farah AI Voice', targetId: 'farah_voice' },
        { key: '3', label: 'Voicemail routing', targetId: 'offline_voicemail' }
      ]
    }
  },
  {
    id: 'sales_queue',
    type: 'queue',
    name: 'Route to Sales Queue',
    data: {
      queueType: 'sales',
      targetId: 'sales_transfer'
    }
  },
  {
    id: 'sales_transfer',
    type: 'transfer',
    name: 'Transfer to Sales Agent',
    data: {
      agentGroup: 'Corporate Sales Desk',
      transferReason: 'Inbound IVR Sales Inquiry'
    }
  },
  {
    id: 'farah_voice',
    type: 'ai_assistant',
    name: 'Farah AI Agent Dispatcher',
    data: {
      assistantName: 'Farah-Voice-v4',
      confidenceThreshold: 0.70,
      fallbackTargetId: 'support_transfer'
    }
  },
  {
    id: 'support_transfer',
    type: 'transfer',
    name: 'Transfer to Support Desk',
    data: {
      agentGroup: 'Tier-2 Technical Support Group',
      transferReason: 'Farah Voice Assistant Fallback'
    }
  },
  {
    id: 'offline_voicemail',
    type: 'voicemail',
    name: 'Offline Voicemail Box',
    data: {
      voicemailEnabled: true,
      transcriptionEnabled: true,
      promptEn: 'Our support desk is currently closed. Please leave your message after the tone.',
      promptAr: 'مركز الدعم الفني مغلق حالياً. يرجى ترك رسالتك بعد سماع النغمة.'
    }
  },
  {
    id: 'callback_schedule',
    type: 'callback',
    name: 'Callback Scheduler',
    data: {
      callbackQueue: 'Holiday Callback Pool',
      scheduleCallback: true
    }
  },
  {
    id: 'call_completion',
    type: 'end',
    name: 'Call Completion & CSAT',
    data: {
      textEn: 'Thank you for calling. Goodbye.',
      textAr: 'شكراً لاتصالكم بنا. مع السلامة.',
      triggerSurvey: true
    }
  }
];

const SEED_VERSIONS: IVRVersion[] = [
  {
    version: 'v2.1.0',
    status: 'published',
    lastModified: '2026-05-15 14:22',
    modifiedBy: 'admin@mp-core.ai',
    active: true,
    nodes: SEED_NODES,
    startNodeId: 'start_hours'
  },
  {
    version: 'v2.2.0-draft',
    status: 'draft',
    lastModified: '2026-06-01 10:10',
    modifiedBy: 'admin@mp-core.ai',
    active: false,
    nodes: JSON.parse(JSON.stringify(SEED_NODES)),
    startNodeId: 'start_hours'
  }
];

export function VoiceIvrDesigner({ onClose }: VoiceIvrDesignerProps) {
  const { lang, addAuditLog } = useApp();
  const isAr = lang === 'ar';

  // Component States
  const [versions, setVersions] = useState<IVRVersion[]>(SEED_VERSIONS);
  const [selectedVerTag, setSelectedVerTag] = useState<string>('v2.2.0-draft');
  const [nodes, setNodes] = useState<IVRNode[]>([]);
  const [startNodeId, setStartNodeId] = useState<string>('start_hours');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Validation Warnings
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // Simulator State
  const [simActive, setSimActive] = useState(false);
  const [simHistory, setSimHistory] = useState<
    Array<{ nodeId: string; nodeName: string; type: string; desc: string; time: string }>
  >([]);
  const [simCurrentNodeId, setSimCurrentNodeId] = useState<string | null>(null);
  const [simHoursState, setSimHoursState] = useState<'open' | 'closed' | 'holiday'>('open');
  const [simAiConfidence, setSimAiConfidence] = useState<number>(0.85);
  const [simIsPlayingAudio, setSimIsPlayingAudio] = useState(false);
  const [simStatusMessage, setSimStatusMessage] = useState<string>('');

  // Deploying animation state
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishLogs, setPublishLogs] = useState<string[]>([]);

  // Select active draft/version nodes
  useEffect(() => {
    const ver = versions.find(v => v.version === selectedVerTag);
    if (ver) {
      setNodes(ver.nodes);
      setStartNodeId(ver.startNodeId);
      setSelectedNodeId(ver.nodes[0]?.id || null);
    }
  }, [selectedVerTag, versions]);

  // Run Flow Validator
  useEffect(() => {
    const errors: string[] = [];
    
    // Check if start node exists
    if (!startNodeId || !nodes.find(n => n.id === startNodeId)) {
      errors.push(isAr ? '⚠ لم يتم تحديد عقدة البداية للمكالمة' : '⚠ Missing entry/start node in flow.');
    }

    nodes.forEach(node => {
      // 1. Missing outgoing routes on non-terminal nodes
      if (node.type === 'welcome') {
        if (!node.data.targetId) {
          errors.push(
            isAr
              ? `⚠ عقدة الترحيب "${node.name}" تفتقر إلى هدف الانتقال`
              : `⚠ Welcome node "${node.name}" is missing its next transition target.`
          );
        }
      } else if (node.type === 'queue') {
        if (!node.data.targetId) {
          errors.push(
            isAr
              ? `⚠ عقدة صف الانتظار "${node.name}" تفتقر إلى هدف الانتقال`
              : `⚠ Queue node "${node.name}" is missing its next transition target.`
          );
        }
      } else if (node.type === 'hours') {
        if (!node.data.openTargetId || !node.data.closedTargetId || !node.data.holidayTargetId) {
          errors.push(
            isAr
              ? `⚠ عقدة مواعيد العمل "${node.name}" تفتقر إلى توجيه المسار (مفتوح/مغلق/إجازة)`
              : `⚠ Business hours node "${node.name}" is missing one of its targets (Open/Closed/Holiday).`
          );
        }
      } else if (node.type === 'ai_assistant') {
        if (!node.data.fallbackTargetId) {
          errors.push(
            isAr
              ? `⚠ عقدة المساعد الذكي "${node.name}" تفتقر إلى هدف مسار الطوارئ للوكيل`
              : `⚠ AI Voice Assistant "${node.name}" is missing its agent fallback route target.`
          );
        }
      } else if (node.type === 'menu') {
        const opts = node.data.options || [];
        if (opts.length === 0) {
          errors.push(
            isAr
              ? `⚠ قائمة الاختيارات "${node.name}" لا تحتوي على أي أرقام موجهة`
              : `⚠ Menu node "${node.name}" has no route option keys configured.`
          );
        } else {
          opts.forEach(o => {
            if (!o.targetId) {
              errors.push(
                isAr
                  ? `⚠ خيار الرقم ${o.key} في القائمة "${node.name}" يفتقر إلى عقدة التوجيه`
                  : `⚠ Menu key ${o.key} in "${node.name}" is missing its route target.`
              );
            }
          });
        }
      }

      // 2. Reference validation: check if set targetIds actually exist in nodes array
      const targetsToCheck = [
        node.data.targetId,
        node.data.openTargetId,
        node.data.closedTargetId,
        node.data.holidayTargetId,
        node.data.fallbackTargetId,
        ...(node.data.options || []).map(o => o.targetId)
      ].filter(Boolean);

      targetsToCheck.forEach(tId => {
        if (!nodes.find(n => n.id === tId)) {
          errors.push(
            isAr
              ? `⚠ العقدة "${node.name}" تشير إلى عقدة غير موجودة: ID ${tId}`
              : `⚠ Node "${node.name}" references a non-existent target ID: ${tId}.`
          );
        }
      });
    });

    // 3. Unconnected Nodes Detection
    nodes.forEach(node => {
      if (node.id === startNodeId) return; // start node is always connected
      
      const hasIncoming = nodes.some(parent => {
        if (parent.id === node.id) return false;
        
        if (parent.type === 'hours') {
          return (
            parent.data.openTargetId === node.id ||
            parent.data.closedTargetId === node.id ||
            parent.data.holidayTargetId === node.id
          );
        }
        if (parent.type === 'ai_assistant') {
          return parent.data.fallbackTargetId === node.id || parent.data.targetId === node.id;
        }
        if (parent.type === 'menu') {
          return (parent.data.options || []).some(o => o.targetId === node.id);
        }
        return parent.data.targetId === node.id;
      });

      if (!hasIncoming) {
        errors.push(
          isAr
            ? `⚠ تم اكتشاف عقدة معزولة: "${node.name}" غير متصلة بأي مسار وارد`
            : `⚠ Unconnected node detected: "${node.name}" is unreachable with no incoming paths.`
        );
      }
    });

    setValidationErrors(errors);
  }, [nodes, startNodeId, isAr]);

  // Update selected Node Data helper
  const updateNodeData = (nodeId: string, updatedFields: Partial<IVRNode['data']>) => {
    setNodes(prev =>
      prev.map(n => {
        if (n.id === nodeId) {
          return { ...n, data: { ...n.data, ...updatedFields } };
        }
        return n;
      })
    );
    // Mark the selected version tag's modifications
    setVersions(prev =>
      prev.map(v => {
        if (v.version === selectedVerTag) {
          return {
            ...v,
            lastModified: new Date().toISOString().replace('T', ' ').substring(0, 16),
            nodes: v.nodes.map(n => (n.id === nodeId ? { ...n, data: { ...n.data, ...updatedFields } } : n))
          };
        }
        return v;
      })
    );
  };

  const updateNodeBase = (nodeId: string, updatedBase: Partial<Omit<IVRNode, 'data' | 'id' | 'type'>>) => {
    setNodes(prev =>
      prev.map(n => {
        if (n.id === nodeId) {
          return { ...n, ...updatedBase };
        }
        return n;
      })
    );
    setVersions(prev =>
      prev.map(v => {
        if (v.version === selectedVerTag) {
          return {
            ...v,
            lastModified: new Date().toISOString().replace('T', ' ').substring(0, 16),
            nodes: v.nodes.map(n => (n.id === nodeId ? { ...n, ...updatedBase } : n))
          };
        }
        return v;
      })
    );
  };

  // Add new node template
  const handleAddNewNode = (type: IVRNodeType) => {
    const defaultNames: Record<IVRNodeType, string> = {
      welcome: 'Welcome Prompt Greeting',
      menu: 'Interactive Keypad Menu',
      queue: 'Queue Router Desk',
      transfer: 'Agent Group Transfer',
      hours: 'Time Schedule Shift Verify',
      voicemail: 'Interactive Voicemail Box',
      callback: 'Callback Request Scheduler',
      ai_assistant: 'Farah AI Conversational Voice',
      end: 'Hang Up Call completion'
    };

    const newId = `node_${Date.now()}`;
    const newNode: IVRNode = {
      id: newId,
      type,
      name: `${defaultNames[type]} (${nodes.length + 1})`,
      data: {
        textEn: type === 'welcome' || type === 'end' || type === 'voicemail' ? 'Please configure your message.' : undefined,
        options: type === 'menu' ? [{ key: '1', label: 'Default Option', targetId: '' }] : undefined,
        confidenceThreshold: type === 'ai_assistant' ? 0.70 : undefined,
        voicemailEnabled: type === 'voicemail' ? true : undefined,
        transcriptionEnabled: type === 'voicemail' ? true : undefined
      }
    };

    const nextNodes = [...nodes, newNode];
    setNodes(nextNodes);
    setSelectedNodeId(newId);

    setVersions(prev =>
      prev.map(v => {
        if (v.version === selectedVerTag) {
          return {
            ...v,
            lastModified: new Date().toISOString().replace('T', ' ').substring(0, 16),
            nodes: nextNodes
          };
        }
        return v;
      })
    );
    addAuditLog(`Added new ${type} node to IVR flow`, 'success');
  };

  // Delete node
  const handleDeleteNode = (nodeId: string) => {
    if (nodeId === startNodeId) {
      alert(isAr ? 'لا يمكن حذف عقدة البداية مباشرة.' : 'Cannot delete the designated start node.');
      return;
    }
    const nextNodes = nodes.filter(n => n.id !== nodeId);
    setNodes(nextNodes);
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(nextNodes[0]?.id || null);
    }
    setVersions(prev =>
      prev.map(v => {
        if (v.version === selectedVerTag) {
          return {
            ...v,
            lastModified: new Date().toISOString().replace('T', ' ').substring(0, 16),
            nodes: nextNodes
          };
        }
        return v;
      })
    );
    addAuditLog('Deleted node from IVR flow', 'success');
  };

  // Simulator Tracing logic
  const startSimulator = () => {
    if (!startNodeId || nodes.length === 0) return;
    setSimActive(true);
    setSimHistory([]);
    setSimIsPlayingAudio(false);
    transitionToSimNode(startNodeId, 'Call Initialized from trunk SIP: +1 (800) 555-0199');
  };

  const stopSimulator = () => {
    setSimActive(false);
    setSimCurrentNodeId(null);
    setSimHistory([]);
    setSimStatusMessage('');
  };

  const transitionToSimNode = (targetId: string, reasonText: string) => {
    const node = nodes.find(n => n.id === targetId);
    if (!node) {
      setSimHistory(prev => [
        ...prev,
        {
          nodeId: 'error',
          nodeName: 'Disconnected Target',
          type: 'error',
          desc: `Failed to route call: Node ID "${targetId}" not found.`,
          time: new Date().toLocaleTimeString()
        }
      ]);
      setSimCurrentNodeId(null);
      setSimStatusMessage('Call Dropped: Dead-end target configuration.');
      return;
    }

    setSimCurrentNodeId(targetId);
    setSimIsPlayingAudio(false);

    const stepDescription = `Routing: ${reasonText}`;
    setSimHistory(prev => [
      ...prev,
      {
        nodeId: node.id,
        nodeName: node.name,
        type: node.type,
        desc: stepDescription,
        time: new Date().toLocaleTimeString()
      }
    ]);

    // Handle auto-routing nodes directly
    if (node.type === 'hours') {
      setTimeout(() => {
        let nextTarget = '';
        let logs = '';
        if (simHoursState === 'open') {
          nextTarget = node.data.openTargetId || '';
          logs = 'Shift Hours Check: Tenant status is OPEN (08:00 - 18:00 AST)';
        } else if (simHoursState === 'closed') {
          nextTarget = node.data.closedTargetId || '';
          logs = 'Shift Hours Check: Tenant status is CLOSED (After hours divert)';
        } else {
          nextTarget = node.data.holidayTargetId || '';
          logs = 'Shift Hours Check: Calendar indicates National Holiday Shift';
        }
        transitionToSimNode(nextTarget, logs);
      }, 1200);
    } else if (node.type === 'queue') {
      setTimeout(() => {
        const nextTarget = node.data.targetId || '';
        transitionToSimNode(nextTarget, `Enqueued in ${node.data.queueType?.toUpperCase() || 'General'} queue. Dispatching to agent.`);
      }, 1200);
    } else if (node.type === 'transfer') {
      setSimStatusMessage(`Call Successfully Transferred to Agent Group: "${node.data.agentGroup || 'General'}"`);
    } else if (node.type === 'voicemail') {
      setSimStatusMessage('Recording voicemail message. Audio capture active.');
    } else if (node.type === 'callback') {
      setSimStatusMessage(`Callback successfully registered under pool: "${node.data.callbackQueue || 'Support'}"`);
    } else if (node.type === 'end') {
      setSimStatusMessage(`Call completed. Post-Call CSAT Survey: ${node.data.triggerSurvey ? 'Triggered' : 'Disabled'}`);
    }
  };

  const handleSimKeypadPress = (digit: string) => {
    if (!simCurrentNodeId) return;
    const node = nodes.find(n => n.id === simCurrentNodeId);
    if (!node || node.type !== 'menu') return;

    const opts = node.data.options || [];
    const matched = opts.find(o => o.key === digit);

    if (matched) {
      transitionToSimNode(matched.targetId, `Keypad DTMF Input: Customer pressed ${digit} (${matched.label})`);
    } else {
      setSimHistory(prev => [
        ...prev,
        {
          nodeId: node.id,
          nodeName: node.name,
          type: 'menu_error',
          desc: `Keypad DTMF Input: Pressed ${digit} (Unmapped key options). Repeating menu options.`,
          time: new Date().toLocaleTimeString()
        }
      ]);
    }
  };

  const handleSimAiInteraction = (isConfidenceMatch: boolean) => {
    if (!simCurrentNodeId) return;
    const node = nodes.find(n => n.id === simCurrentNodeId);
    if (!node || node.type !== 'ai_assistant') return;

    const threshold = node.data.confidenceThreshold || 0.70;
    const confidence = isConfidenceMatch ? 0.88 : 0.45;

    setSimHistory(prev => [
      ...prev,
      {
        nodeId: node.id,
        nodeName: node.name,
        type: 'ai_voice',
        desc: `Farah Voice Match attempt: Confidence is ${Math.round(confidence * 100)}% (Configured threshold limit is ${Math.round(threshold * 100)}%)`,
        time: new Date().toLocaleTimeString()
      }
    ]);

    if (confidence >= threshold) {
      // Connect to AI Agent mock resolve
      setSimHistory(prev => [
        ...prev,
        {
          nodeId: node.id,
          nodeName: node.name,
          type: 'ai_voice_match',
          desc: 'Farah AI resolved customer intent successfully. Triggering RAG lookup.',
          time: new Date().toLocaleTimeString()
        }
      ]);
      setSimStatusMessage('Call Handled by Farah AI Voice Bot successfully. Transaction finished.');
    } else {
      // Trigger fallback to human
      const fallbackTarget = node.data.fallbackTargetId || '';
      transitionToSimNode(fallbackTarget, `Farah AI Speech confidence failed. Executing fallback routing desk.`);
    }
  };

  // Publish Flow simulation
  const handlePublishFlow = () => {
    if (validationErrors.length > 0) {
      alert(isAr ? 'يرجى إصلاح أخطاء التحقق قبل النشر.' : 'Please resolve validation warnings before publishing.');
      return;
    }

    setIsPublishing(true);
    setPublishLogs([]);

    const logSteps = [
      'Initiating connection credentials to Asterisk voice trunks...',
      'Compacting IVR JSON metadata schema...',
      'Validating SSML sound formats...',
      'Synchronizing tenant dialplans to SIP gateway node maps...',
      'Workflow successfully published to Production SIP Trunk!'
    ];

    logSteps.forEach((log, index) => {
      setTimeout(() => {
        setPublishLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${log}`]);
        if (index === logSteps.length - 1) {
          setIsPublishing(false);
          // Set version status to published and update live status
          setVersions(prev =>
            prev.map(v => {
              if (v.version === selectedVerTag) {
                return { ...v, status: 'published', active: true };
              }
              // Mark older published active versions as standard drafts/inactive
              if (v.version !== selectedVerTag && v.status === 'published') {
                return { ...v, active: false };
              }
              return v;
            })
          );
          addAuditLog(`Published IVR design flow (${selectedVerTag}) successfully.`, 'success');
        }
      }, (index + 1) * 600);
    });
  };

  const activeNode = nodes.find(n => n.id === selectedNodeId);
  const currentSimNode = nodes.find(n => n.id === simCurrentNodeId);

  return (
    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 text-slate-800 dark:text-slate-200">
      
      {/* ── HEADER & META BAR ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-850">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-all"
            aria-label={isAr ? 'العودة لقائمة القنوات' : 'Back to Channel Catalog'}
          >
            <ArrowLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-md font-black font-sans leading-none">
                {isAr ? 'لوحة تصميم الاستجابة الصوتية التفاعلية' : 'Voice IVR Designer Dashboard'}
              </h2>
              {versions.find(v => v.version === selectedVerTag)?.active ? (
                <span className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
                  {isAr ? 'نشط في الإنتاج' : 'LIVE in Production'}
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full">
                  {isAr ? 'مسودة معلقة' : 'Inactive Draft'}
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-450 mt-1 font-semibold">
              {isAr
                ? 'قم بإنشاء وتعديل ومحاكاة تدفق المكالمات للرقم الموحد للمستأجر'
                : 'Create, modify, and simulate inbound call routing paths for tenant trunk line.'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Version Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 font-mono">Flow Version:</span>
            <select
              value={selectedVerTag}
              onChange={e => setSelectedVerTag(e.target.value)}
              className="px-2 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-[10px] font-bold focus:outline-none"
            >
              {versions.map(v => (
                <option key={v.version} value={v.version}>
                  {v.version} ({v.status === 'published' ? 'Published' : 'Draft'})
                </option>
              ))}
            </select>
          </div>

          {/* Last Modified */}
          <span className="text-[10px] font-mono text-slate-400">
            Modified: {versions.find(v => v.version === selectedVerTag)?.lastModified}
          </span>

          <button
            onClick={handlePublishFlow}
            disabled={validationErrors.length > 0 || isPublishing}
            className={`px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 ${
              validationErrors.length > 0
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-98'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            {isPublishing ? (isAr ? 'جاري النشر...' : 'Publishing...') : (isAr ? 'نشر تدفق المكالمات' : 'Publish IVR Flow')}
          </button>
        </div>
      </div>

      {/* ── VALIDATION WARNINGS DISPLAY ── */}
      {validationErrors.length > 0 ? (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-4 rounded-2xl text-[10px] space-y-2">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-xs">
            <ShieldAlert className="w-4 h-4" />
            <span>{isAr ? 'تحذيرات التحقق من الاتصال (قفل النشر نشط)' : 'Flow Linkage Warnings (Publishing Locked)'}</span>
          </div>
          <ul className="list-disc list-inside space-y-1 font-semibold leading-relaxed">
            {validationErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-3 rounded-2xl text-[10px] flex items-center gap-2 font-bold">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{isAr ? 'تدفق المكالمات متصل وجاهز للنشر بالكامل.' : 'All nodes connected correctly. Ready to deploy.'}</span>
        </div>
      )}

      {/* ── MAIN WORKSPACE CONTAINER ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* ==========================================
            LEFT PANEL: INTERACTIVE CALL SIMULATOR
            ========================================== */}
        <div className="xl:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1.5 uppercase font-mono tracking-wider">
              <Activity className="w-4 h-4 text-blue-500 animate-pulse" />
              {isAr ? 'محاكي توجيه مكالمات SIP' : 'Call Routing Simulator'}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">
              {isAr
                ? 'اختبر سيناريوهات التوجيه بناءً على مواعيد العمل ومدخلات العميل الذكية.'
                : 'Test routing scenarios dynamically by overriding shifts and DTMF dialpad digits.'}
            </p>
          </div>

          {/* Simulator controls */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl space-y-3">
            {/* Shift hours selector override */}
            <div className="space-y-1.5">
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                1. Simulate Current Time / Shift
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(['open', 'closed', 'holiday'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setSimHoursState(mode)}
                    className={`py-1 text-[9px] font-bold rounded-lg border transition-all ${
                      simHoursState === mode
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'
                    }`}
                  >
                    {mode.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Voice slider confidence trigger override */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                <span>2. Simulate AI Confidence</span>
                <span className="font-mono text-blue-500 font-bold">{Math.round(simAiConfidence * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.30"
                max="0.99"
                step="0.05"
                value={simAiConfidence}
                onChange={e => setSimAiConfidence(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none"
              />
            </div>

            {/* Launch / Stop simulation buttons */}
            <div className="pt-2">
              {!simActive ? (
                <button
                  onClick={startSimulator}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  {isAr ? 'بدء محاكاة المكالمة' : 'Start Call Simulation'}
                </button>
              ) : (
                <button
                  onClick={stopSimulator}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  {isAr ? 'إنهاء محاكاة المكالمة' : 'End Call Simulation'}
                </button>
              )}
            </div>
          </div>

          {/* SIMULATION TRACE CONTAINER */}
          {simActive && (
            <div className="border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col min-h-[320px]">
              
              {/* Simulator screen panel */}
              <div className="bg-slate-900 text-slate-100 p-4 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold font-mono tracking-widest text-slate-400">INBOUND CALL ACTIVE</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-slate-500">Trunk #1</span>
                </div>

                {/* Active node layout display */}
                <div className="mt-4 space-y-2">
                  <div className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">Current Audio Stream</div>
                  {currentSimNode ? (
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                      <div className="font-bold text-[10px] text-blue-400 flex items-center gap-1.5">
                        <Volume2 className="w-4 h-4 animate-bounce" />
                        {currentSimNode.name}
                      </div>

                      {/* Prompt script preview */}
                      {(currentSimNode.type === 'welcome' || currentSimNode.type === 'end' || currentSimNode.type === 'voicemail') && (
                        <p className="text-[10px] text-slate-350 italic leading-relaxed">
                          "{isAr ? currentSimNode.data.textAr : currentSimNode.data.textEn}"
                        </p>
                      )}

                      {currentSimNode.type === 'menu' && (
                        <p className="text-[10px] text-slate-350 italic leading-relaxed">
                          "{isAr ? currentSimNode.data.promptAr : currentSimNode.data.promptEn}"
                        </p>
                      )}

                      {/* Simulate speech playing */}
                      <div className="flex items-center gap-2 pt-1.5 border-t border-slate-900">
                        <button
                          onClick={() => setSimIsPlayingAudio(!simIsPlayingAudio)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[8px] font-bold flex items-center gap-1 transition-all"
                        >
                          {simIsPlayingAudio ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                          {simIsPlayingAudio ? 'Mute' : 'TTS Speak'}
                        </button>
                        {simIsPlayingAudio && (
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map(i => (
                              <span
                                key={i}
                                className="w-0.5 bg-blue-500 rounded animate-pulse"
                                style={{
                                  height: `${Math.random() * 12 + 4}px`,
                                  animationDelay: `${i * 150}ms`
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center text-slate-500 italic text-[10px]">
                      {simStatusMessage || 'Connecting trunk dispatcher...'}
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Interactive Input Actions */}
              {currentSimNode && currentSimNode.type === 'menu' && (
                <div className="p-4 border-b border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 space-y-3">
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Keypad Input Required:</div>
                  <div className="grid grid-cols-3 gap-2 max-w-[160px] mx-auto">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(digit => {
                      const isValidKey = (currentSimNode.data.options || []).some(o => o.key === digit);
                      return (
                        <button
                          key={digit}
                          onClick={() => handleSimKeypadPress(digit)}
                          className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                            isValidKey
                              ? 'bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-300 dark:ring-blue-900/60 scale-105'
                              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-650'
                          }`}
                        >
                          {digit}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {currentSimNode && currentSimNode.type === 'welcome' && currentSimNode.data.targetId && (
                <div className="p-3 border-b border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 text-center">
                  <button
                    onClick={() => transitionToSimNode(currentSimNode.data.targetId || '', 'Prompt speech completed.')}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[9px] font-bold transition-all"
                  >
                    Continue to Menu Dispatch
                  </button>
                </div>
              )}

              {currentSimNode && currentSimNode.type === 'ai_assistant' && (
                <div className="p-4 border-b border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 space-y-3 text-center">
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider"> Faras AI Speech Verification:</div>
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleSimAiInteraction(true)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-bold transition-all flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Simulate Intent Match
                    </button>
                    <button
                      onClick={() => handleSimAiInteraction(false)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[9px] font-bold transition-all"
                    >
                      Simulate Match Fail
                    </button>
                  </div>
                </div>
              )}

              {/* Call history step logs */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 max-h-[220px]">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Simulated Call Path Trace:</div>
                <div className="space-y-2">
                  {simHistory.map((step, idx) => (
                    <div key={idx} className="flex gap-2 text-[9px] border-l-2 border-slate-250 dark:border-slate-800 pl-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-slate-100">{step.nodeName}</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-850 text-[8px] font-mono uppercase font-bold">
                            {step.type}
                          </span>
                          <span className="text-slate-400 font-mono text-[8px]">{step.time}</span>
                        </div>
                        <p className="text-slate-500 font-semibold">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ==========================================
            MIDDLE PANEL: IVR DESIGN PIPELINE CANVAS
            ========================================== */}
        <div className="xl:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-150 dark:border-slate-850">
            <div>
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase font-mono tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-500" />
                {isAr ? 'عقد توجيه الاتصالات' : 'IVR Dispatch Canvas Pipeline'}
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">
                {isAr ? 'المسار التدفقي المتسلسل لعقد الاتصال.' : 'Sequential list representing connected IVR node hierarchy.'}
              </p>
            </div>
            
            {/* Add Node Dropdown */}
            <div className="relative group">
              <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-xl flex items-center gap-1 shadow-sm active:scale-98 transition-all">
                <Plus className="w-3.5 h-3.5" />
                {isAr ? 'إضافة عقدة' : 'Add Node'}
              </button>
              <div className="absolute right-0 top-full mt-1.5 w-44 hidden group-hover:block hover:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg py-1 z-35 text-[10px] font-bold">
                {(['welcome', 'menu', 'hours', 'queue', 'ai_assistant', 'transfer', 'voicemail', 'callback', 'end'] as IVRNodeType[]).map(t => (
                  <button
                    key={t}
                    onClick={() => handleAddNewNode(t)}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-850 capitalize"
                  >
                    + {t.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Node Cards Canvas List */}
          <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
            {nodes.map((node, index) => {
              const isSelected = selectedNodeId === node.id;
              const isStartNode = node.id === startNodeId;

              // Color mappings based on Node Type
              const typeColors: Record<IVRNodeType, { bg: string; text: string; icon: React.ReactNode }> = {
                welcome: { bg: 'bg-blue-500/10 dark:bg-blue-500/5 border-blue-500/30', text: 'text-blue-500', icon: <Volume2 className="w-3.5 h-3.5" /> },
                menu: { bg: 'bg-purple-500/10 dark:bg-purple-500/5 border-purple-500/30', text: 'text-purple-500', icon: <Radio className="w-3.5 h-3.5" /> },
                hours: { bg: 'bg-amber-500/10 dark:bg-amber-500/5 border-amber-500/30', text: 'text-amber-500', icon: <Calendar className="w-3.5 h-3.5" /> },
                queue: { bg: 'bg-sky-500/10 dark:bg-sky-500/5 border-sky-500/30', text: 'text-sky-500', icon: <Users className="w-3.5 h-3.5" /> },
                ai_assistant: { bg: 'bg-indigo-500/10 dark:bg-indigo-500/5 border-indigo-500/30', text: 'text-indigo-500', icon: <Sparkles className="w-3.5 h-3.5" /> },
                transfer: { bg: 'bg-emerald-500/10 dark:bg-emerald-500/5 border-emerald-500/30', text: 'text-emerald-500', icon: <PhoneForwarded className="w-3.5 h-3.5" /> },
                voicemail: { bg: 'bg-rose-500/10 dark:bg-rose-500/5 border-rose-500/30', text: 'text-rose-500', icon: <MessageSquare className="w-3.5 h-3.5" /> },
                callback: { bg: 'bg-teal-500/10 dark:bg-teal-500/5 border-teal-500/30', text: 'text-teal-500', icon: <Phone className="w-3.5 h-3.5" /> },
                end: { bg: 'bg-slate-500/10 dark:bg-slate-500/5 border-slate-500/30', text: 'text-slate-500', icon: <Phone className="w-3.5 h-3.5" /> }
              };

              const style = typeColors[node.type];

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`relative p-3.5 rounded-2xl border text-left cursor-pointer transition-all duration-200 hover:-translate-y-0.5 ${
                    isSelected
                      ? 'border-blue-600 dark:border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/15 dark:bg-blue-950/10'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${style.bg} ${style.text}`}>{style.icon}</div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white text-[11px] leading-tight flex items-center gap-1.5">
                          {node.name}
                          {isStartNode && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-mono text-[7.5px] font-black uppercase">
                              START
                            </span>
                          )}
                        </span>
                        <span className="text-[8px] font-mono text-slate-400 capitalize block">{node.type.replace('_', ' ')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {!isStartNode && (
                        <button
                          onClick={() => setStartNodeId(node.id)}
                          className="px-2 py-0.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 rounded text-[7.5px] font-black uppercase text-slate-500"
                        >
                          Make Start
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNode(node.id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-950 transition-colors"
                        aria-label="Delete Node"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Summary of configurations inside card */}
                  <div className="text-[9px] text-slate-450 space-y-1 pt-1.5 border-t border-slate-100 dark:border-slate-850 leading-relaxed font-semibold">
                    {node.type === 'welcome' && (
                      <div className="truncate">Prompt: "{isAr ? node.data.textAr : node.data.textEn}"</div>
                    )}
                    {node.type === 'menu' && (
                      <div>Options Configured: {(node.data.options || []).map(o => `[Key ${o.key} -> ${o.label}]`).join(', ')}</div>
                    )}
                    {node.type === 'hours' && (
                      <div>Targets: [Open: {node.data.openTargetId || 'None'}] [Closed: {node.data.closedTargetId || 'None'}]</div>
                    )}
                    {node.type === 'ai_assistant' && (
                      <div>Bot: {node.data.assistantName || 'Farah'} (Conf limit: {Math.round((node.data.confidenceThreshold || 0.70) * 100)}%)</div>
                    )}
                    {node.type === 'queue' && (
                      <div className="capitalize">Target Queue: {node.data.queueType || 'Sales'} Queue</div>
                    )}
                    {node.type === 'transfer' && (
                      <div>Transfer Target Group: {node.data.agentGroup}</div>
                    )}
                    {node.type === 'voicemail' && (
                      <div>Voicemail mailbox: {node.data.voicemailEnabled ? 'Enabled' : 'Disabled'} (Transcription: {node.data.transcriptionEnabled ? 'On' : 'Off'})</div>
                    )}
                    {node.type === 'callback' && (
                      <div>Callback Pool Queue: {node.data.callbackQueue}</div>
                    )}
                    {node.type === 'end' && (
                      <div>Hangup script: "{isAr ? node.data.textAr : node.data.textEn}"</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ==========================================
            RIGHT PANEL: SELECTED NODE PROPERTIES EDITOR
            ========================================== */}
        <div className="xl:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase font-mono tracking-wider flex items-center gap-1.5 border-b border-slate-150 dark:border-slate-850 pb-2">
            <Settings className="w-4 h-4 text-blue-500" />
            {isAr ? 'خصائص العقدة' : 'Node Properties Inspector'}
          </h3>

          {activeNode ? (
            <div className="space-y-4 text-[10px]">
              
              {/* Node Name input */}
              <div className="space-y-1.5">
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Node Title Name
                </label>
                <input
                  type="text"
                  value={activeNode.name}
                  onChange={e => updateNodeBase(activeNode.id, { name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none text-[10.5px] font-bold text-slate-800 dark:text-white"
                />
              </div>

              {/* Unique node id display */}
              <div className="flex justify-between font-mono text-[8px] bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-900">
                <span className="text-slate-400">Node ID Reference:</span>
                <span className="font-bold text-blue-600 select-all">{activeNode.id}</span>
              </div>

              {/* Type specific config editor boxes */}
              <div className="pt-2 border-t border-slate-150 dark:border-slate-850 space-y-4">
                
                {/* 1. WELCOME PROMPT CONFIGS */}
                {activeNode.type === 'welcome' && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">SSML Speech (EN)</label>
                      <textarea
                        value={activeNode.data.textEn || ''}
                        onChange={e => updateNodeData(activeNode.id, { textEn: e.target.value })}
                        rows={2}
                        className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-[9px] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider font-mono">SSML Speech (AR)</label>
                      <textarea
                        value={activeNode.data.textAr || ''}
                        onChange={e => updateNodeData(activeNode.id, { textAr: e.target.value })}
                        rows={2}
                        dir="rtl"
                        className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-[9px] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Next Node Transition</label>
                      <select
                        value={activeNode.data.targetId || ''}
                        onChange={e => updateNodeData(activeNode.id, { targetId: e.target.value })}
                        className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg text-[9px] focus:outline-none"
                      >
                        <option value="">-- Choose target node --</option>
                        {nodes.filter(n => n.id !== activeNode.id).map(n => (
                          <option key={n.id} value={n.id}>{n.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* 2. MENU NODE CONFIGS */}
                {activeNode.type === 'menu' && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Prompt Voice Message (EN)</label>
                      <textarea
                        value={activeNode.data.promptEn || ''}
                        onChange={e => updateNodeData(activeNode.id, { promptEn: e.target.value })}
                        rows={2}
                        className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-[9px] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider font-mono">Prompt Voice Message (AR)</label>
                      <textarea
                        value={activeNode.data.promptAr || ''}
                        onChange={e => updateNodeData(activeNode.id, { promptAr: e.target.value })}
                        rows={2}
                        dir="rtl"
                        className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-[9px] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-850">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">DTMF Digit Mappings:</span>
                      {(activeNode.data.options || []).map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={opt.key}
                            maxLength={1}
                            placeholder="Key"
                            onChange={e => {
                              const nextOpts = [...(activeNode.data.options || [])];
                              nextOpts[oIdx] = { ...opt, key: e.target.value };
                              updateNodeData(activeNode.id, { options: nextOpts });
                            }}
                            className="w-8 text-center px-1 py-1 border border-slate-200 dark:border-slate-850 bg-transparent rounded focus:outline-none font-bold"
                          />
                          <input
                            type="text"
                            value={opt.label}
                            placeholder="Label"
                            onChange={e => {
                              const nextOpts = [...(activeNode.data.options || [])];
                              nextOpts[oIdx] = { ...opt, label: e.target.value };
                              updateNodeData(activeNode.id, { options: nextOpts });
                            }}
                            className="flex-1 px-1.5 py-1 border border-slate-200 dark:border-slate-850 bg-transparent rounded focus:outline-none"
                          />
                          <select
                            value={opt.targetId}
                            onChange={e => {
                              const nextOpts = [...(activeNode.data.options || [])];
                              nextOpts[oIdx] = { ...opt, targetId: e.target.value };
                              updateNodeData(activeNode.id, { options: nextOpts });
                            }}
                            className="w-24 px-1 py-1 border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 rounded text-[8px]"
                          >
                            <option value="">-- Route --</option>
                            {nodes.filter(n => n.id !== activeNode.id).map(n => (
                              <option key={n.id} value={n.id}>{n.name}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => {
                              const nextOpts = (activeNode.data.options || []).filter((_, idx) => idx !== oIdx);
                              updateNodeData(activeNode.id, { options: nextOpts });
                            }}
                            className="text-slate-400 hover:text-rose-500 p-0.5"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const nextOpts = [
                            ...(activeNode.data.options || []),
                            { key: String((activeNode.data.options || []).length + 1), label: 'New Option', targetId: '' }
                          ];
                          updateNodeData(activeNode.id, { options: nextOpts });
                        }}
                        className="text-[8px] font-bold text-blue-500 hover:underline flex items-center gap-1 mt-1"
                      >
                        + Add Digit Option
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. BUSINESS HOURS CONFIGS */}
                {activeNode.type === 'hours' && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">OPEN Status Destination</label>
                      <select
                        value={activeNode.data.openTargetId || ''}
                        onChange={e => updateNodeData(activeNode.id, { openTargetId: e.target.value })}
                        className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg text-[9px]"
                      >
                        <option value="">-- Choose target node --</option>
                        {nodes.filter(n => n.id !== activeNode.id).map(n => (
                          <option key={n.id} value={n.id}>{n.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider font-mono">CLOSED Status Destination</label>
                      <select
                        value={activeNode.data.closedTargetId || ''}
                        onChange={e => updateNodeData(activeNode.id, { closedTargetId: e.target.value })}
                        className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg text-[9px]"
                      >
                        <option value="">-- Choose target node --</option>
                        {nodes.filter(n => n.id !== activeNode.id).map(n => (
                          <option key={n.id} value={n.id}>{n.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">HOLIDAY Status Destination</label>
                      <select
                        value={activeNode.data.holidayTargetId || ''}
                        onChange={e => updateNodeData(activeNode.id, { holidayTargetId: e.target.value })}
                        className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg text-[9px]"
                      >
                        <option value="">-- Choose target node --</option>
                        {nodes.filter(n => n.id !== activeNode.id).map(n => (
                          <option key={n.id} value={n.id}>{n.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* 4. QUEUE ROUTING */}
                {activeNode.type === 'queue' && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Primary Target Queue</label>
                      <select
                        value={activeNode.data.queueType || 'support'}
                        onChange={e => updateNodeData(activeNode.id, { queueType: e.target.value as any })}
                        className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg text-[9px]"
                      >
                        <option value="sales">Sales Dispatch Queue</option>
                        <option value="support">Customer Support Desk Queue</option>
                        <option value="billing">Invoicing & Billing Desk</option>
                        <option value="escalation">Executive Escalations Queue</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Next Target Node</label>
                      <select
                        value={activeNode.data.targetId || ''}
                        onChange={e => updateNodeData(activeNode.id, { targetId: e.target.value })}
                        className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg text-[9px]"
                      >
                        <option value="">-- Choose target node --</option>
                        {nodes.filter(n => n.id !== activeNode.id).map(n => (
                          <option key={n.id} value={n.id}>{n.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* 5. AGENT TRANSFER */}
                {activeNode.type === 'transfer' && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Agent Skill Group</label>
                      <input
                        type="text"
                        value={activeNode.data.agentGroup || ''}
                        onChange={e => updateNodeData(activeNode.id, { agentGroup: e.target.value })}
                        className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-[9px]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">SIP Transfer Reason</label>
                      <input
                        type="text"
                        value={activeNode.data.transferReason || ''}
                        onChange={e => updateNodeData(activeNode.id, { transferReason: e.target.value })}
                        className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-[9px]"
                      />
                    </div>
                  </div>
                )}

                {/* 6. VOICEMAIL CONFIG */}
                {activeNode.type === 'voicemail' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-lg">
                      <span className="font-bold">Enable Recording</span>
                      <input
                        type="checkbox"
                        checked={!!activeNode.data.voicemailEnabled}
                        onChange={e => updateNodeData(activeNode.id, { voicemailEnabled: e.target.checked })}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-lg">
                      <span className="font-bold font-mono">TTS Transcription</span>
                      <input
                        type="checkbox"
                        checked={!!activeNode.data.transcriptionEnabled}
                        onChange={e => updateNodeData(activeNode.id, { transcriptionEnabled: e.target.checked })}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Voice Mail Prompt (EN)</label>
                      <textarea
                        value={activeNode.data.promptEn || ''}
                        onChange={e => updateNodeData(activeNode.id, { promptEn: e.target.value })}
                        rows={2}
                        className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-[9px]"
                      />
                    </div>
                  </div>
                )}

                {/* 7. CALLBACK CONFIG */}
                {activeNode.type === 'callback' && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Target Callback Pool Queue</label>
                      <input
                        type="text"
                        value={activeNode.data.callbackQueue || ''}
                        onChange={e => updateNodeData(activeNode.id, { callbackQueue: e.target.value })}
                        className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-[9px]"
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-lg">
                      <span className="font-bold">Autoschedule Callback</span>
                      <input
                        type="checkbox"
                        checked={!!activeNode.data.scheduleCallback}
                        onChange={e => updateNodeData(activeNode.id, { scheduleCallback: e.target.checked })}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* 8. AI ASSISTANT CONFIG */}
                {activeNode.type === 'ai_assistant' && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">AI Voice Registry Model</label>
                      <input
                        type="text"
                        value={activeNode.data.assistantName || ''}
                        onChange={e => updateNodeData(activeNode.id, { assistantName: e.target.value })}
                        className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-[9px]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>Human Fallback Threshold</span>
                        <span className="font-mono text-blue-600 font-bold">{Math.round((activeNode.data.confidenceThreshold || 0.70) * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.30"
                        max="0.95"
                        step="0.05"
                        value={activeNode.data.confidenceThreshold || 0.70}
                        onChange={e => updateNodeData(activeNode.id, { confidenceThreshold: parseFloat(e.target.value) })}
                        className="w-full accent-blue-600 cursor-pointer h-1 bg-slate-200 dark:bg-slate-800 rounded appearance-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Agent Fallback destination</label>
                      <select
                        value={activeNode.data.fallbackTargetId || ''}
                        onChange={e => updateNodeData(activeNode.id, { fallbackTargetId: e.target.value })}
                        className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg text-[9px]"
                      >
                        <option value="">-- Choose target node --</option>
                        {nodes.filter(n => n.id !== activeNode.id).map(n => (
                          <option key={n.id} value={n.id}>{n.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* 9. END CALL CONFIG */}
                {activeNode.type === 'end' && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Wrap-up Prompt Message (EN)</label>
                      <textarea
                        value={activeNode.data.textEn || ''}
                        onChange={e => updateNodeData(activeNode.id, { textEn: e.target.value })}
                        rows={2}
                        className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-[9px]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider font-mono">Wrap-up Prompt Message (AR)</label>
                      <textarea
                        value={activeNode.data.textAr || ''}
                        onChange={e => updateNodeData(activeNode.id, { textAr: e.target.value })}
                        rows={2}
                        dir="rtl"
                        className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-[9px]"
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-lg">
                      <span className="font-bold">Auto-Trigger CSAT Survey</span>
                      <input
                        type="checkbox"
                        checked={!!activeNode.data.triggerSurvey}
                        onChange={e => updateNodeData(activeNode.id, { triggerSurvey: e.target.checked })}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400 italic text-[10px]">
              Select a node to inspect and edit its parameters.
            </div>
          )}
        </div>
      </div>

      {/* ==========================================
          BOTTOM ROW: PUBLISH STEP LOGS & VERSION HISTORY
          ========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-850">
        
        {/* Version list block */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
          <h4 className="text-[10px] font-bold text-slate-700 dark:text-slate-350 uppercase font-mono tracking-wider flex items-center gap-1">
            <History className="w-3.5 h-3.5 text-blue-500" />
            IVR Version Deployment History Logs
          </h4>
          <div className="divide-y divide-slate-100 dark:divide-slate-850 text-[9px]">
            {versions.map(v => (
              <div key={v.version} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">{v.version}</span>
                  <div className="text-slate-400 font-mono mt-0.5">Author: {v.modifiedBy} · {v.lastModified}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge type={v.status === 'published' ? 'success' : 'inactive'}>
                    {v.status.toUpperCase()}
                  </Badge>
                  {v.active && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[8px] font-bold">
                      ACTIVE TRUNK
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sync loading console logs */}
        <div className="bg-slate-950 text-slate-250 p-4 border border-slate-900 rounded-2xl min-h-[140px] flex flex-col font-mono text-[9px] leading-relaxed shadow-inner">
          <div className="text-slate-500 uppercase tracking-widest font-black text-[8px] border-b border-slate-900 pb-1.5 mb-2 flex items-center justify-between">
            <span>SIP Trunk Deployment Console Stream</span>
            {isPublishing && <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin" />}
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 select-text">
            {publishLogs.length > 0 ? (
              publishLogs.map((log, lIdx) => (
                <div key={lIdx} className={lIdx === publishLogs.length - 1 ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                  {log}
                </div>
              ))
            ) : (
              <div className="text-slate-650 italic">
                No active sync deployment task running. Deployments will log here.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
