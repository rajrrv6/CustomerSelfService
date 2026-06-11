import {
  LLMModel,
  ASRTTSProvider,
  Channel,
  Bot,
  Intent,
  KnowledgeSource,
  IngestionLog,
  Conversation,
  Ticket,
  Agent,
  QAReview,
  SLARule,
  AuditLog,
  CallLog
} from '../types';

export const mockLLMModels: LLMModel[] = [
  {
    id: 'llm-1',
    name: 'Gemini 1.5 Pro (Custom)',
    provider: 'Google Vertex AI',
    costInput: 0.00125,
    costOutput: 0.00375,
    latencyMs: 380,
    status: 'active',
    contextWindow: 1048576,
    accuracyScore: 94.5
  },
  {
    id: 'llm-2',
    name: 'Gemini 1.5 Flash (Default)',
    provider: 'Google Vertex AI',
    costInput: 0.000075,
    costOutput: 0.0003,
    latencyMs: 180,
    status: 'active',
    contextWindow: 1048576,
    accuracyScore: 89.2
  },
  {
    id: 'llm-3',
    name: 'GPT-4o Omnichannel',
    provider: 'OpenAI Enterprise',
    costInput: 0.005,
    costOutput: 0.015,
    latencyMs: 450,
    status: 'active',
    contextWindow: 128000,
    accuracyScore: 95.8
  },
  {
    id: 'llm-4',
    name: 'Llama 3 70B (On-Prem)',
    provider: 'Anyscale Private Cloud',
    costInput: 0.0008,
    costOutput: 0.0012,
    latencyMs: 240,
    status: 'testing',
    contextWindow: 32000,
    accuracyScore: 91.0
  },
  {
    id: 'llm-5',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic AWS Bedrock',
    costInput: 0.003,
    costOutput: 0.015,
    latencyMs: 410,
    status: 'active',
    contextWindow: 200000,
    accuracyScore: 96.1
  }
];

export const mockASRTTSProviders: ASRTTSProvider[] = [
  {
    id: 'provider-1',
    name: 'Whisper v3 Large',
    type: 'ASR',
    languages: ['English', 'Arabic', 'Spanish', 'French', 'German', 'Hindi'],
    latencyMs: 290,
    costPerMin: 0.006,
    status: 'online'
  },
  {
    id: 'provider-2',
    name: 'Google Cloud Speech-to-Text v2',
    type: 'ASR',
    languages: ['English', 'Arabic', 'Turkish', 'Italian', 'Russian'],
    latencyMs: 150,
    costPerMin: 0.012,
    status: 'online'
  },
  {
    id: 'provider-3',
    name: 'ElevenLabs Multilingual v2',
    type: 'TTS',
    languages: ['English', 'Arabic', 'Spanish', 'French', 'German', 'Japanese'],
    latencyMs: 350,
    costPerMin: 0.024,
    status: 'online'
  },
  {
    id: 'provider-4',
    name: 'Microsoft Neural Voices Pro',
    type: 'TTS',
    languages: ['English', 'Arabic', 'Chinese', 'Portuguese'],
    latencyMs: 180,
    costPerMin: 0.008,
    status: 'online'
  }
];

export const mockChannels: Channel[] = [
  {
    id: 'ch-1',
    name: 'Global WhatsApp Business',
    type: 'whatsapp',
    icon: 'MessageSquare',
    connectedBots: ['bot-1', 'bot-3'],
    status: 'active',
    rateLimit: '120 msgs/sec'
  },
  {
    id: 'ch-2',
    name: 'Main Customer Web Widget',
    type: 'web',
    icon: 'Globe',
    connectedBots: ['bot-1'],
    status: 'active',
    rateLimit: 'Unlimited'
  },
  {
    id: 'ch-3',
    name: 'IVR Voice Trunk Core',
    type: 'voice',
    icon: 'Phone',
    connectedBots: ['bot-2'],
    status: 'active',
    rateLimit: '500 concurrent lines'
  },
  {
    id: 'ch-4',
    name: 'Global Support Email Mailbox',
    type: 'email',
    icon: 'Mail',
    connectedBots: ['bot-4'],
    status: 'active',
    rateLimit: '50 calls/min'
  }
];

export const mockBots: Bot[] = [
  {
    id: 'bot-1',
    name: 'Farah AI (Main Concierge)',
    persona: 'Professional, empathetic, and efficient retail concierge assistant. Knows all products and refund policies.',
    status: 'live',
    language: ['English', 'Arabic'],
    deflectionRate: 72.8,
    intentCount: 42,
    knowledgeBaseId: 'kb-default',
    createdAt: '2026-01-10',
    activeSessions: 1420
  },
  {
    id: 'bot-2',
    name: 'Voice IVR Copilot (Telco Core)',
    persona: 'Clear, simple voice assistant. Keeps instructions brief, responds nicely to interruption, redirects callers efficiently.',
    status: 'live',
    language: ['English', 'Arabic'],
    deflectionRate: 54.3,
    intentCount: 15,
    knowledgeBaseId: 'kb-voice',
    createdAt: '2026-02-15',
    activeSessions: 890
  },
  {
    id: 'bot-3',
    name: 'WhatsApp Dispatcher Bot',
    persona: 'Concise, emoji-friendly agent optimized for quick messaging and interactive WhatsApp menu templates.',
    status: 'live',
    language: ['English', 'Arabic', 'Hindi'],
    deflectionRate: 64.9,
    intentCount: 28,
    knowledgeBaseId: 'kb-whatsapp',
    createdAt: '2026-03-01',
    activeSessions: 2310
  },
  {
    id: 'bot-4',
    name: 'Email Autoreply Assistant',
    persona: 'Formal and analytical draft creator. Synthesizes long documents to draft full email solutions.',
    status: 'training',
    language: ['English'],
    deflectionRate: 41.2,
    intentCount: 30,
    knowledgeBaseId: 'kb-email',
    createdAt: '2026-04-12',
    activeSessions: 0
  }
];

export const mockIntents: Intent[] = [
  {
    id: 'int-1',
    name: 'order_refund',
    utterances: [
      'I want a refund for my order',
      'Can I get my money back?',
      'How to return a broken product',
      'Need a refund asap',
      'Refund process please'
    ],
    slots: [
      { name: 'orderNumber', type: 'string', required: true, prompt: 'Please provide your order number starting with ORD (e.g. ORD-12345).' },
      { name: 'refundReason', type: 'string', required: true, prompt: 'What is the reason for your refund request?' }
    ],
    confidenceThreshold: 0.85,
    fulfillmentType: 'dialog',
    fulfillmentValue: 'flow-refund-initiation',
    status: 'active',
    hitCount: 1245
  },
  {
    id: 'int-2',
    name: 'order_status',
    utterances: [
      'Where is my package?',
      'Check shipping details',
      'Is my order shipped?',
      'Track my delivery',
      'Status of ORD-88712'
    ],
    slots: [
      { name: 'orderNumber', type: 'string', required: true, prompt: 'What is the order number you want to track?' }
    ],
    confidenceThreshold: 0.8,
    fulfillmentType: 'webhook',
    fulfillmentValue: 'https://api.mpaas.internal/orders/track',
    status: 'active',
    hitCount: 3410
  },
  {
    id: 'int-3',
    name: 'billing_dispute',
    utterances: [
      'I was charged twice',
      'Incorrect bill amount',
      'Dispute this card charge',
      'Why is my bill so high this month?',
      'Unrecognized payment request'
    ],
    slots: [
      { name: 'invoiceId', type: 'string', required: false, prompt: 'Do you have the invoice ID or transaction ID?' }
    ],
    confidenceThreshold: 0.88,
    fulfillmentType: 'dialog',
    fulfillmentValue: 'flow-billing-dispute',
    status: 'active',
    hitCount: 520
  },
  {
    id: 'int-4',
    name: 'cancel_subscription',
    utterances: [
      'Cancel my account',
      'Stop recurring payments',
      'I want to close my subscription',
      'Deactivate my membership',
      'Opt out of premium'
    ],
    slots: [
      { name: 'confirmCancel', type: 'boolean', required: true, prompt: 'Cancelling will remove your discounts. Are you sure you want to proceed? (yes/no)' }
    ],
    confidenceThreshold: 0.9,
    fulfillmentType: 'dialog',
    fulfillmentValue: 'flow-churn-prevention',
    status: 'active',
    hitCount: 980
  },
  {
    id: 'int-5',
    name: 'change_shipping_address',
    utterances: [
      'Change my delivery address',
      'Update shipping address',
      'Send my package to another street',
      'Wrong address on order'
    ],
    slots: [],
    confidenceThreshold: 0.85,
    fulfillmentType: 'text',
    fulfillmentValue: 'Please contact us within 2 hours of placing the order to update the delivery address. You can do this under Order Details.',
    status: 'suggested',
    hitCount: 142
  }
];

export const mockKnowledgeSources: KnowledgeSource[] = [
  {
    id: 'ks-1',
    name: 'Standard Return & Exchange Policy 2026.pdf',
    type: 'pdf',
    status: 'ready',
    chunkCount: 148,
    lastIngested: '2026-05-18 10:24',
    sizeBytes: 2450000
  },
  {
    id: 'ks-2',
    name: 'https://docs.mycompany.com/faq-main',
    type: 'url',
    status: 'ready',
    chunkCount: 312,
    lastIngested: '2026-05-19 02:15',
    sizeBytes: 154000
  },
  {
    id: 'ks-3',
    name: 'Customer Support Confluence Wiki',
    type: 'confluence',
    status: 'syncing',
    chunkCount: 1250,
    lastIngested: '2026-05-19 14:10',
    sizeBytes: 18500000
  },
  {
    id: 'ks-4',
    name: 'Oracle ERP Master Inventory Feed',
    type: 'database',
    status: 'error',
    chunkCount: 0,
    lastIngested: '2026-05-17 12:00',
    sizeBytes: 0
  }
];

export const mockIngestionLogs: IngestionLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-05-19 14:10:22',
    sourceName: 'Customer Support Confluence Wiki',
    status: 'processing',
    chunksCount: 45,
    durationMs: 8200
  },
  {
    id: 'log-2',
    timestamp: '2026-05-19 02:15:00',
    sourceName: 'https://docs.mycompany.com/faq-main',
    status: 'success',
    chunksCount: 312,
    durationMs: 45200
  },
  {
    id: 'log-3',
    timestamp: '2026-05-18 10:24:12',
    sourceName: 'Standard Return & Exchange Policy 2026.pdf',
    status: 'success',
    chunksCount: 148,
    durationMs: 12400
  },
  {
    id: 'log-4',
    timestamp: '2026-05-17 12:00:05',
    sourceName: 'Oracle ERP Master Inventory Feed',
    status: 'failed',
    chunksCount: 0,
    durationMs: 1500,
    errorDetail: 'Connection timeout. Host: erp-prod.internal.local. Code: ETIMEDOUT.'
  }
];

export const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    customerName: 'Samir Al-Mansoor',
    customerPhone: '+966 50 123 4567',
    customerEmail: 'samir.mansoor@example.sa',
    customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    channel: 'whatsapp',
    lastMessage: 'أحتاج إلى تعديل موعد التوصيل لطلبي رقم ORD-77612',
    lastMessageTime: '14:28',
    status: 'unassigned',
    sentiment: 'neutral',
    language: 'ar',
    slaStatus: 'within_sla',
    slaDeadline: '14:58',
    messages: [
      {
        id: 'm1',
        sender: 'customer',
        senderName: 'Samir Al-Mansoor',
        text: 'مرحباً، قمت بطلب منتج بالأمس وأرغب في تغيير عنوان الشحن والموعد.',
        timestamp: '14:25',
        translatedText: 'Hello, I ordered a product yesterday and I want to change the shipping address and time.',
        sentiment: 'neutral'
      },
      {
        id: 'm2',
        sender: 'bot',
        senderName: 'Farah AI',
        text: 'أهلاً بك يا سمير! يسعدني مساعدتك. هل يمكنك تزويدي برقم الطلب الخاص بك؟',
        timestamp: '14:25',
        translatedText: 'Welcome Samir! Glad to help. Could you please provide your order number?',
        sentiment: 'positive'
      },
      {
        id: 'm3',
        sender: 'customer',
        senderName: 'Samir Al-Mansoor',
        text: 'أحتاج إلى تعديل موعد التوصيل لطلبي رقم ORD-77612',
        timestamp: '14:28',
        translatedText: 'I need to modify the delivery date for my order ORD-77612',
        sentiment: 'neutral'
      }
    ]
  },
  {
    id: 'conv-2',
    customerName: 'Sarah Jenkins',
    customerEmail: 'sarah.jenkins@gmail.com',
    customerPhone: '+1 (555) 019-2834',
    customerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    channel: 'web',
    lastMessage: 'The refund button is greyed out. Can you manually override it?',
    lastMessageTime: '14:22',
    status: 'active',
    agentId: 'agent-1',
    sentiment: 'negative',
    language: 'en',
    slaStatus: 'warning',
    slaDeadline: '14:32',
    messages: [
      {
        id: 'm4',
        sender: 'customer',
        senderName: 'Sarah Jenkins',
        text: 'Hi, I received a damaged item in my last package and need a refund.',
        timestamp: '14:10',
        sentiment: 'negative'
      },
      {
        id: 'm5',
        sender: 'bot',
        senderName: 'Farah AI',
        text: 'I am so sorry to hear that the item was damaged. Let me initiate a refund for you. Please confirm your order number.',
        timestamp: '14:10',
        sentiment: 'neutral'
      },
      {
        id: 'm6',
        sender: 'customer',
        senderName: 'Sarah Jenkins',
        text: 'It is ORD-99881. I tried doing it on the website but it says the return window is closed.',
        timestamp: '14:12',
        sentiment: 'negative'
      },
      {
        id: 'm7',
        sender: 'bot',
        senderName: 'Farah AI',
        text: 'According to our system, order ORD-99881 was delivered 35 days ago, which is outside our standard 30-day return policy. Let me transfer you to a live support agent to assist with this exception.',
        timestamp: '14:13',
        sentiment: 'neutral'
      },
      {
        id: 'm8',
        sender: 'system',
        senderName: 'System',
        text: 'Farah AI transferred the chat to Agent Liam Bennett.',
        timestamp: '14:13'
      },
      {
        id: 'm9',
        sender: 'agent',
        senderName: 'Liam Bennett',
        text: 'Hi Sarah, I am looking into your order ORD-99881. Since the item arrived damaged, I can request an exception from the billing team. Let me check the photos if you have any.',
        timestamp: '14:15',
        sentiment: 'positive'
      },
      {
        id: 'm10',
        sender: 'customer',
        senderName: 'Sarah Jenkins',
        text: 'The refund button is greyed out. Can you manually override it?',
        timestamp: '14:22',
        sentiment: 'negative'
      }
    ]
  },
  {
    id: 'conv-3',
    customerName: 'Aria Sterling',
    customerEmail: 'aria@sterling-consulting.co.uk',
    customerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    channel: 'email',
    lastMessage: 'Thank you for the prompt response, I will wait for the invoice update.',
    lastMessageTime: '13:05',
    status: 'resolved',
    agentId: 'agent-2',
    sentiment: 'positive',
    language: 'en',
    slaStatus: 'within_sla',
    slaDeadline: '17:00',
    messages: [
      {
        id: 'm11',
        sender: 'customer',
        senderName: 'Aria Sterling',
        text: 'Hello, our corporate account was charged twice for the monthly API subscription. We need a credit note issued for the second charge of $499.00.',
        timestamp: '11:15',
        sentiment: 'neutral'
      },
      {
        id: 'm12',
        sender: 'agent',
        senderName: 'Nadia Vance',
        text: 'Dear Aria, thank you for reaching out. I have investigated invoice INV-2026-9982 and confirmed a duplicate billing run error. I have processed a refund of $499.00 and issued a credit note. You will see it in your portal within 2 hours.',
        timestamp: '12:45',
        sentiment: 'positive'
      },
      {
        id: 'm13',
        sender: 'customer',
        senderName: 'Aria Sterling',
        text: 'Thank you for the prompt response, I will wait for the invoice update.',
        timestamp: '13:05',
        sentiment: 'positive'
      }
    ]
  },
  {
    id: 'conv-4',
    customerName: 'Yousef Al-Harbi',
    customerPhone: '+966 55 987 6543',
    customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    channel: 'voice',
    lastMessage: 'Call completed. Duration: 4m 12s. AI Summary: Customer requested activation of data roaming for trip to UAE.',
    lastMessageTime: '10:14',
    status: 'resolved',
    agentId: 'agent-1',
    sentiment: 'positive',
    language: 'ar',
    slaStatus: 'within_sla',
    slaDeadline: '10:30',
    messages: [
      {
        id: 'm14',
        sender: 'customer',
        senderName: 'Yousef Al-Harbi',
        text: 'أريد تفعيل التجوال الدولي لخط الموبايل الخاص بي، أنا مسافر غداً إلى دبي.',
        timestamp: '10:10',
        translatedText: 'I want to activate international roaming for my mobile line, I am traveling to Dubai tomorrow.',
        sentiment: 'neutral'
      },
      {
        id: 'm15',
        sender: 'agent',
        senderName: 'Liam Bennett',
        text: 'أهلاً بك يا فندم. لقد قمت بتفعيل باقة التجوال الخليجي الموحد على خطك بنجاح. ستعمل تلقائياً فور وصولك إلى دولة الإمارات.',
        timestamp: '10:13',
        translatedText: 'Welcome sir. I have successfully activated the Unified Gulf Roaming package on your line. It will work automatically upon arrival in the UAE.',
        sentiment: 'positive'
      }
    ]
  },
  {
    id: 'conv-5',
    customerName: 'Marcus Aurelius',
    customerEmail: 'marcus@roman-empire.org',
    customerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    channel: 'whatsapp',
    lastMessage: 'I need to check why my API integration is failing with status 403.',
    lastMessageTime: '14:30',
    status: 'escalated',
    sentiment: 'negative',
    language: 'en',
    slaStatus: 'breached',
    slaDeadline: '14:00',
    messages: [
      {
        id: 'm16',
        sender: 'customer',
        senderName: 'Marcus Aurelius',
        text: 'I need to check why my API integration is failing with status 403.',
        timestamp: '13:00',
        sentiment: 'negative'
      },
      {
        id: 'm17',
        sender: 'bot',
        senderName: 'Farah AI',
        text: 'A 403 Forbidden error indicates invalid credentials or lack of permissions. Let me review your API key scopes. Please provide your client ID.',
        timestamp: '13:01',
        sentiment: 'neutral'
      },
      {
        id: 'm18',
        sender: 'customer',
        senderName: 'Marcus Aurelius',
        text: 'Client ID is CL-998. The credentials are correct. I checked them twice. It was working yesterday and stopped suddenly.',
        timestamp: '13:03',
        sentiment: 'negative'
      },
      {
        id: 'm19',
        sender: 'bot',
        senderName: 'Farah AI',
        text: 'Escalating this query to our tier 2 security engineering team for key validation.',
        timestamp: '13:04',
        sentiment: 'neutral'
      }
    ]
  }
];

export const mockTickets: Ticket[] = [
  {
    id: 'TIC-1021',
    title: 'Duplicate Credit Card Charges on Subscription Refills',
    description: 'The user was charged twice ($99 x 2) for the auto-refill package. One of the transactions is pending on the credit card statement, and the other is settled.',
    customerName: 'David Miller',
    customerEmail: 'david.miller@yahoo.com',
    priority: 'high',
    status: 'open',
    assignedAgentId: 'agent-1',
    category: 'Billing & Payments',
    createdAt: '2026-05-19 09:30',
    slaBreachTime: '2026-05-19 15:30',
    messages: [
      {
        id: 't1',
        sender: 'customer',
        senderName: 'David Miller',
        text: 'Hello, I see two identical charges of $99 on my Visa card today. Please refund the duplicate transaction.',
        timestamp: '09:30'
      }
    ]
  },
  {
    id: 'TIC-1022',
    title: 'Arabic Language Speech-to-Text Latency Spikes',
    description: 'During peak hours (10:00 to 12:00 AST), the voice bot takes up to 4 seconds to parse Arabic dialect. Logs show speech segmentation timeout.',
    customerName: 'Fatima Al-Zahrani',
    customerEmail: 'f.zahrani@stc.com.sa',
    priority: 'urgent',
    status: 'pending',
    assignedAgentId: 'agent-2',
    category: 'AI Model Performance',
    createdAt: '2026-05-19 11:15',
    slaBreachTime: '2026-05-19 13:15',
    messages: [
      {
        id: 't2',
        sender: 'customer',
        senderName: 'Fatima Al-Zahrani',
        text: 'The IVR bot is extremely slow today. It is dropping calls because of speech parsing delays.',
        timestamp: '11:15'
      }
    ]
  },
  {
    id: 'TIC-1023',
    title: 'Confluence Wiki Connector Sync Failure',
    description: 'The automated nightly crawl of the enterprise knowledge base failed with OAuth2 token expiration.',
    customerName: 'System Monitor',
    customerEmail: 'cron@mpaas.internal',
    priority: 'medium',
    status: 'open',
    category: 'Integrations',
    createdAt: '2026-05-19 04:00',
    slaBreachTime: '2026-05-20 04:00',
    messages: [
      {
        id: 't3',
        sender: 'system',
        senderName: 'Cron Daemon',
        text: 'Warning: OAuth token sync error for Confluence Cloud client. Refresh token rejected.',
        timestamp: '04:00'
      }
    ]
  },
  {
    id: 'TIC-1024',
    title: 'Password Reset Loop in Mobile Application',
    description: 'User enters email, receives code, enters code, is prompted to enter password, and is then immediately redirected back to the code screen.',
    customerName: 'Alex Mercer',
    customerEmail: 'alex.mercer@gmail.com',
    priority: 'low',
    status: 'solved',
    assignedAgentId: 'agent-1',
    category: 'User Authentication',
    createdAt: '2026-05-18 15:40',
    slaBreachTime: '2026-05-19 15:40',
    messages: [
      {
        id: 't4',
        sender: 'customer',
        senderName: 'Alex Mercer',
        text: 'I cannot log into the mobile app, I am stuck in an infinite password reset loop!',
        timestamp: '15:40'
      },
      {
        id: 't5',
        sender: 'agent',
        senderName: 'Liam Bennett',
        text: 'Hi Alex, we identified a session cache issue on our mobile backend and deployed a hotfix. Please clear the app storage or reinstall, it should be working fine now.',
        timestamp: '16:45'
      }
    ]
  },
  {
    id: 'TIC-1020',
    title: 'Incorrect invoice generation on Gold plan',
    description: 'Gold level subscription renewal charged twice due to API sync delays. Need support for exemption logs.',
    customerName: 'David Miller',
    customerEmail: 'david.miller@yahoo.com',
    priority: 'medium',
    status: 'solved',
    assignedAgentId: 'agent-1',
    category: 'Billing & Payments',
    createdAt: '2026-05-18 10:00',
    slaBreachTime: '2026-05-19 10:00',
    messages: [
      {
        id: 't6',
        sender: 'customer',
        senderName: 'David Miller',
        text: 'Hello, the invoice generated for this billing cycle shows a double charge. Can you check?',
        timestamp: '10:00'
      },
      {
        id: 't7',
        sender: 'agent',
        senderName: 'Liam Bennett',
        text: 'Hi David, I have corrected the double billing line on the gateway and updated the active statement details. The invoice has been synced.',
        timestamp: '11:30'
      }
    ]
  }
];

export const mockAgents: Agent[] = [
  {
    id: 'agent-1',
    name: 'Liam Bennett',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    email: 'liam.b@mpaas-support.com',
    status: 'online',
    activeChatsCount: 2,
    maxChatsCount: 4,
    csatScore: 92.4,
    resolvedTicketsCount: 148,
    lastActive: 'Active now'
  },
  {
    id: 'agent-2',
    name: 'Nadia Vance',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    email: 'nadia.v@mpaas-support.com',
    status: 'busy',
    activeChatsCount: 4,
    maxChatsCount: 4,
    csatScore: 95.8,
    resolvedTicketsCount: 202,
    lastActive: 'Active now'
  },
  {
    id: 'agent-3',
    name: 'Tariq Mansoor',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    email: 'tariq.m@mpaas-support.com',
    status: 'away',
    activeChatsCount: 0,
    maxChatsCount: 3,
    csatScore: 88.9,
    resolvedTicketsCount: 75,
    lastActive: 'Away for 12m'
  }
];

export const mockQAReviews: QAReview[] = [
  {
    id: 'qa-1',
    conversationId: 'conv-3',
    agentName: 'Nadia Vance',
    supervisorName: 'Marc Antoine',
    score: 96,
    status: 'completed',
    date: '2026-05-19',
    positives: ['Highly professional tone', 'Accurate resolution steps', 'Immediate follow-up details'],
    negatives: [],
    coachingPoints: ['Keep up the excellent response speed. Good utilization of API macro tags.'],
    scorecardMetrics: {
      compliance: 100,
      empathy: 95,
      technical: 95,
      resolution: 94
    },
    sentimentBreakdown: {
      positive: 70,
      neutral: 25,
      negative: 5
    },
    resolutionQuality: 'resolved',
    slaContext: {
      met: true,
      actualDuration: '1h 30m',
      targetLimit: '4h 00m'
    },
    historyTimeline: [
      { status: 'pending', date: '2026-05-19 11:15', updatedBy: 'System' },
      { status: 'completed', date: '2026-05-19 12:45', updatedBy: 'Marc Antoine', notes: 'Excellent handling of gold account renewal dispute.' }
    ]
  },
  {
    id: 'qa-2',
    conversationId: 'conv-2',
    agentName: 'Liam Bennett',
    supervisorName: 'Marc Antoine',
    score: 82,
    status: 'completed',
    date: '2026-05-18',
    positives: ['Polite language', 'Offered clear transition to team lead support'],
    negatives: ['Delayed greeting for 3 minutes', 'Did not confirm order refund criteria before proposing exception'],
    coachingPoints: ['Work on immediate initial response. Always verify items against the returns checklist before promising exceptions.'],
    scorecardMetrics: {
      compliance: 80,
      empathy: 90,
      technical: 85,
      resolution: 73
    },
    sentimentBreakdown: {
      positive: 40,
      neutral: 30,
      negative: 30
    },
    resolutionQuality: 'partially_resolved',
    slaContext: {
      met: false,
      actualDuration: '4h 12m',
      targetLimit: '4h 00m'
    },
    historyTimeline: [
      { status: 'pending', date: '2026-05-18 14:10', updatedBy: 'System' },
      { status: 'completed', date: '2026-05-18 15:30', updatedBy: 'Marc Antoine', notes: 'Good tone but response time violated SLAs.' }
    ]
  },
  {
    id: 'qa-3',
    conversationId: 'conv-1',
    agentName: 'Liam Bennett',
    supervisorName: 'Marc Antoine',
    score: 0,
    status: 'pending',
    date: '2026-05-19',
    positives: [],
    negatives: [],
    coachingPoints: [],
    historyTimeline: [
      { status: 'pending', date: '2026-05-19 14:25', updatedBy: 'System' }
    ]
  }
];

export const mockSLARules: SLARule[] = [
  { id: 'sla-1', name: 'Urgent Priority Breach Rule', priority: 'urgent', responseTimeMins: 15, resolutionTimeMins: 60, active: true },
  { id: 'sla-2', name: 'High Priority SLA Policy', priority: 'high', responseTimeMins: 30, resolutionTimeMins: 240, active: true },
  { id: 'sla-3', name: 'Medium Priority SLA Policy', priority: 'medium', responseTimeMins: 120, resolutionTimeMins: 720, active: true },
  { id: 'sla-4', name: 'Low Priority SLA Policy', priority: 'low', responseTimeMins: 480, resolutionTimeMins: 1440, active: true }
];

export const mockAuditLogs: AuditLog[] = [
  { id: 'aud-1', timestamp: '2026-05-19 14:25:01', user: 'admin.saud@mpaas.com', role: 'Client Admin', action: 'Modified Guardrail: PII Masking Filter enabled', ipAddress: '192.168.10.42', status: 'success' },
  { id: 'aud-2', timestamp: '2026-05-19 13:40:12', user: 'super.richard@mpaas.com', role: 'Super Admin', action: 'Registered LLM: Claude 3.5 Sonnet Bedrock', ipAddress: '10.0.4.88', status: 'success' },
  { id: 'aud-3', timestamp: '2026-05-19 11:20:05', user: 'supervisor.marc@mpaas.com', role: 'Supervisor', action: 'Created Coaching Plan: Liam Bennett - Q2 Performance Plan', ipAddress: '192.168.10.15', status: 'success' },
  { id: 'aud-4', timestamp: '2026-05-19 10:05:42', user: 'agent.liam@mpaas.com', role: 'Support Agent', action: 'Exported conversation report: conv-3', ipAddress: '192.168.12.110', status: 'failed' }
];

export const mockCallLogs: CallLog[] = [
  {
    id: 'call-1',
    customerName: 'Saleh Al-Otaibi',
    phoneNumber: '+966 50 444 8888',
    durationSec: 145,
    direction: 'inbound',
    status: 'completed',
    recordingUrl: '/voice/rec-1.wav',
    timestamp: '2026-05-19 14:02',
    transcript: `[IVR]: Thank you for calling. For billing press 1, for support press 2.\n[Customer]: Hi, I need support with my fiber internet line. It keeps dropping connection every 10 minutes.\n[IVR]: Let me check your line. Please hold... I see a line noise issue. I will reset your optical terminal. Can you check your router lights now?\n[Customer]: Yes, the red optical alarm light just turned off, and it looks like it is green now. Let me test the connection. It works! Thank you.\n[IVR]: Excellent. Have a great day!`,
    aiSummary: 'Customer called due to intermittent fiber connection drops. Automated optical terminal reset resolved the red light error. Customer confirmed resolution. Ticket auto-closed.'
  },
  {
    id: 'call-2',
    customerName: 'Emma Watson',
    phoneNumber: '+1 (415) 887-2231',
    durationSec: 250,
    direction: 'inbound',
    status: 'completed',
    timestamp: '2026-05-19 11:30',
    transcript: `[Customer]: Hi, I am calling because my debit card was charged for renewal after I cancelled the account.\n[Agent Liam]: Hi Emma, I see the ticket here. Let me search your details. Ah, it seems the cancellation was processed at 11:45 PM, but the automated renewal job ran at 11:00 PM. So they overlapped.\n[Customer]: Yes, I need this charge returned immediately. It was $49.99.\n[Agent Liam]: Understood, I have queued a refund request. Since it is a debit card, it might take 3-5 business days to show up.\n[Customer]: Okay, perfect. Thank you.`,
    aiSummary: 'Customer disputed renewal charge after cancellation. Agent confirmed overlap between cancellation and billing job. Charge of $49.99 was refunded. Customer notified of 3-5 days lead time.'
  }
];
