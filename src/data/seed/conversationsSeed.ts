import { Conversation } from '@/types';

export const conversationsSeed: Conversation[] = [
  {
    id: 'conv-101',
    customerName: 'Amina Al-Fayed',
    customerPhone: '+966 50 241 5566',
    customerEmail: 'amina.fayed@aramco.com.sa',
    customerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    channel: 'whatsapp',
    lastMessage: 'أحتاج لتغيير عنوان الفاتورة الخاصة بالدفعة القادمة ورقم التوصيل',
    lastMessageTime: '15:10',
    status: 'active',
    agentId: 'agent-1',
    sentiment: 'neutral',
    language: 'ar',
    slaStatus: 'within_sla',
    slaDeadline: '15:40',
    priority: 'medium',
    unreadCount: 2,
    messages: [
      {
        id: 'am1',
        sender: 'customer',
        senderName: 'Amina Al-Fayed',
        text: 'مرحباً، أواجه مشكلة في مطابقة الحساب الخاص بي مع بوابة الفواتير.',
        timestamp: '15:02',
        translatedText: 'Hello, I am facing an issue matching my account with the billing portal.',
        sentiment: 'neutral'
      },
      {
        id: 'am2',
        sender: 'bot',
        senderName: 'Farah AI',
        text: 'أهلاً بك أمينة. يرجى تزويدي برقم الهوية الضريبية للمنشأة لتسجيل الطلب.',
        timestamp: '15:04',
        translatedText: 'Welcome Amina. Please provide the company tax ID to log the request.',
        sentiment: 'neutral'
      },
      {
        id: 'am3',
        sender: 'customer',
        senderName: 'Amina Al-Fayed',
        text: 'أحتاج لتغيير عنوان الفاتورة الخاصة بالدفعة القادمة ورقم التوصيل',
        timestamp: '15:10',
        translatedText: 'I need to change the billing address for the next batch and delivery number',
        sentiment: 'neutral'
      }
    ]
  },
  {
    id: 'conv-102',
    customerName: 'Marcus Aurelius',
    customerEmail: 'marcus@roman-empire.org',
    customerPhone: '+39 06 1234 5678',
    customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    channel: 'web',
    lastMessage: 'The API is throwing 403 Forbidden on our webhook connector endpoint.',
    lastMessageTime: '15:05',
    status: 'escalated',
    agentId: 'agent-1',
    sentiment: 'negative',
    language: 'en',
    slaStatus: 'breached',
    slaDeadline: '14:45',
    priority: 'urgent',
    unreadCount: 0,
    messages: [
      {
        id: 'mm1',
        sender: 'customer',
        senderName: 'Marcus Aurelius',
        text: 'Our night batch operations failed completely. Webhook return scopes are broken.',
        timestamp: '14:15',
        sentiment: 'negative'
      },
      {
        id: 'mm2',
        sender: 'bot',
        senderName: 'Farah AI',
        text: 'Under safety-guardrails ks-4, access is locked if OAuth sync tokens are expired. Escalating to engineering desk.',
        timestamp: '14:18',
        sentiment: 'neutral'
      },
      {
        id: 'mm3',
        sender: 'system',
        senderName: 'System',
        text: 'Escalated session allocated to Support Queue Level-2.',
        timestamp: '14:19'
      },
      {
        id: 'mm4',
        sender: 'customer',
        senderName: 'Marcus Aurelius',
        text: 'The API is throwing 403 Forbidden on our webhook connector endpoint.',
        timestamp: '15:05',
        sentiment: 'negative'
      }
    ]
  },
  {
    id: 'conv-103',
    customerName: 'Juliana Carter',
    customerEmail: 'j.carter@vertex-logistics.com',
    customerPhone: '+1 (555) 987-6543',
    customerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    channel: 'email',
    lastMessage: 'Can you please check invoice INV-2026-7891? We paid it yesterday.',
    lastMessageTime: '14:50',
    status: 'unassigned',
    sentiment: 'neutral',
    language: 'en',
    slaStatus: 'warning',
    slaDeadline: '15:10',
    priority: 'low',
    unreadCount: 1,
    messages: [
      {
        id: 'jm1',
        sender: 'customer',
        senderName: 'Juliana Carter',
        text: 'Hello, our accounts department sent a bank wire transfer confirmation but our workspace says payment pending.',
        timestamp: '14:40',
        sentiment: 'neutral'
      },
      {
        id: 'jm2',
        sender: 'bot',
        senderName: 'Farah AI',
        text: 'Please upload the payment transaction receipt or provide invoice reference details.',
        timestamp: '14:42',
        sentiment: 'neutral'
      },
      {
        id: 'jm3',
        sender: 'customer',
        senderName: 'Juliana Carter',
        text: 'Can you please check invoice INV-2026-7891? We paid it yesterday.',
        timestamp: '14:50',
        sentiment: 'neutral'
      }
    ]
  },
  {
    id: 'conv-104',
    customerName: 'Yasser Al-Shahrani',
    customerPhone: '+966 53 777 8899',
    customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    channel: 'voice',
    lastMessage: 'Call transcript sync completed. Issue: Telecom gateway downtime resolution.',
    lastMessageTime: '13:00',
    status: 'resolved',
    agentId: 'agent-1',
    sentiment: 'positive',
    language: 'ar',
    slaStatus: 'within_sla',
    slaDeadline: '13:30',
    priority: 'medium',
    unreadCount: 0,
    messages: [
      {
        id: 'ym1',
        sender: 'customer',
        senderName: 'Yasser Al-Shahrani',
        text: 'توجد تقطعات مستمرة في اتصال الفايبر جيتواي المخصص لشركتنا.',
        timestamp: '12:45',
        translatedText: 'There are continuous disconnections in the fiber gateway dedicated to our company.',
        sentiment: 'negative'
      },
      {
        id: 'ym2',
        sender: 'agent',
        senderName: 'Liam Bennett',
        text: 'أهلاً بك يا فندم. قمت بمراجعة المنفذ رقم 3 وتفعيل خادم الاحتياط البديل. هل استقر الاتصال الآن؟',
        timestamp: '12:55',
        translatedText: 'Welcome sir. I checked port 3 and activated the backup failover server. Has the connection stabilized now?',
        sentiment: 'positive'
      },
      {
        id: 'ym3',
        sender: 'customer',
        senderName: 'Yasser Al-Shahrani',
        text: 'نعم، السرعة ممتازة الآن والاتصال مستقر جداً. شكراً جزيلاً لك.',
        timestamp: '13:00',
        translatedText: 'Yes, the speed is excellent now and the connection is very stable. Thank you very much.',
        sentiment: 'positive'
      }
    ]
  },
  {
    id: 'conv-105',
    customerName: 'Layla Hassan',
    customerPhone: '+966 50 111 2222',
    customerEmail: 'layla.hassan@riyadh.sa',
    customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    channel: 'instagram',
    lastMessage: 'Hi support team, I sent a direct message about the discount voucher mismatch.',
    lastMessageTime: '15:15',
    status: 'active',
    agentId: 'agent-1',
    sentiment: 'neutral',
    language: 'en',
    slaStatus: 'within_sla',
    slaDeadline: '15:55',
    priority: 'medium',
    unreadCount: 3,
    messages: [
      {
        id: 'im1',
        sender: 'customer',
        senderName: 'Layla Hassan',
        text: 'Hi! Is the checkout discount code active?',
        timestamp: '15:10',
        sentiment: 'neutral'
      },
      {
        id: 'im2',
        sender: 'bot',
        senderName: 'Farah AI',
        text: 'Hello Layla. Standard discount code rules apply to items in your cart. Check exclusions at ks-5 policy dashboard.',
        timestamp: '15:12',
        sentiment: 'neutral'
      },
      {
        id: 'im3',
        sender: 'customer',
        senderName: 'Layla Hassan',
        text: 'Hi support team, I sent a direct message about the discount voucher mismatch.',
        timestamp: '15:15',
        sentiment: 'neutral'
      }
    ]
  },
  {
    id: 'conv-106',
    customerName: 'Alex Mercer',
    customerEmail: 'alex.mercer@gentek.com',
    customerPhone: '+1 (555) 777-8888',
    customerAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    channel: 'messenger',
    lastMessage: 'Billing issue: my account got charged twice for the monthly SaaS subscription.',
    lastMessageTime: '15:20',
    status: 'active',
    agentId: 'agent-1',
    sentiment: 'negative',
    language: 'en',
    slaStatus: 'warning',
    slaDeadline: '15:35',
    priority: 'high',
    unreadCount: 0,
    messages: [
      {
        id: 'mmc1',
        sender: 'customer',
        senderName: 'Alex Mercer',
        text: 'Why is there a duplicate payment charge on my invoice?',
        timestamp: '15:05',
        sentiment: 'negative'
      },
      {
        id: 'mmc2',
        sender: 'bot',
        senderName: 'Farah AI',
        text: 'Scanning billing repository. Found active charge for sub-99881. Initiating support ticket.',
        timestamp: '15:10',
        sentiment: 'neutral'
      },
      {
        id: 'mmc3',
        sender: 'customer',
        senderName: 'Alex Mercer',
        text: 'Billing issue: my account got charged twice for the monthly SaaS subscription.',
        timestamp: '15:20',
        sentiment: 'negative'
      }
    ]
  }
];
