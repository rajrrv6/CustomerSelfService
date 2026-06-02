export interface CustomerProfile360 {
  customerId: string;
  customerName: string;
  email: string;
  phone: string;
  tier: 'VIP Platinum' | 'Corporate Gold' | 'Standard Business';
  churnRisk: 'Low' | 'Medium' | 'High';
  npsScore: number;
  totalSpent: number;
  segmentTags: string[];
  orders: Array<{
    id: string;
    date: string;
    amount: number;
    status: 'DELIVERED' | 'SHIPPED' | 'HOLD' | 'CANCELLED';
    itemName: string;
  }>;
  tickets: Array<{
    id: string;
    title: string;
    status: 'open' | 'pending' | 'solved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    date: string;
  }>;
  csatRatings: Array<{
    chatId: string;
    date: string;
    rating: number;
    feedback?: string;
  }>;
}

export const customer360Seed: Record<string, CustomerProfile360> = {
  'conv-101': {
    customerId: 'CUST-8812',
    customerName: 'Amina Al-Fayed',
    email: 'amina.fayed@aramco.com.sa',
    phone: '+966 50 241 5566',
    tier: 'VIP Platinum',
    churnRisk: 'Low',
    npsScore: 9,
    totalSpent: 45200.0,
    segmentTags: ['Aramco Portal Link', 'Direct Invoicing', 'Premium SLA'],
    orders: [
      { id: 'ORD-98811', date: '2026-05-10', amount: 4999.0, status: 'DELIVERED', itemName: 'Enterprise SaaS Annual License' },
      { id: 'ORD-77612', date: '2026-05-18', amount: 1200.0, status: 'SHIPPED', itemName: 'Core Gateway Router (Aramco-Pack)' }
    ],
    tickets: [
      { id: 'TIC-1102', title: 'OAuth Domain Whitelist Update', status: 'solved', priority: 'high', date: '2026-04-14' },
      { id: 'TIC-1145', title: 'Duplicate billing verification query', status: 'open', priority: 'medium', date: '2026-05-19' }
    ],
    csatRatings: [
      { chatId: 'ch-981', date: '2026-04-12', rating: 5, feedback: 'Instant support response, very polite agent.' },
      { chatId: 'ch-772', date: '2026-05-01', rating: 4 }
    ]
  },
  'conv-102': {
    customerId: 'CUST-3310',
    customerName: 'Marcus Aurelius',
    email: 'marcus@roman-empire.org',
    phone: '+39 06 1234 5678',
    tier: 'Corporate Gold',
    churnRisk: 'High',
    npsScore: 4,
    totalSpent: 12900.0,
    segmentTags: ['Unstable Connector Logs', 'High Latency Zone', 'Risk Accounts'],
    orders: [
      { id: 'ORD-99881', date: '2026-04-12', amount: 49.99, status: 'DELIVERED', itemName: 'SaaS License Monthly Refill' },
      { id: 'ORD-99905', date: '2026-05-14', amount: 499.0, status: 'HOLD', itemName: 'ERP DB Integration Gateway' }
    ],
    tickets: [
      { id: 'TIC-1022', title: 'Arabic STT latency spikes', status: 'pending', priority: 'urgent', date: '2026-05-19' },
      { id: 'TIC-0992', title: 'Stripe API webhook failures', status: 'closed', priority: 'high', date: '2026-05-10' }
    ],
    csatRatings: [
      { chatId: 'ch-112', date: '2026-05-10', rating: 2, feedback: 'Downtime cost us two hours. Please fix the gateway speed.' }
    ]
  },
  'conv-103': {
    customerId: 'CUST-6541',
    customerName: 'Juliana Carter',
    email: 'j.carter@vertex-logistics.com',
    phone: '+1 (555) 987-6543',
    tier: 'Standard Business',
    churnRisk: 'Medium',
    npsScore: 7,
    totalSpent: 4500.0,
    segmentTags: ['Logistics Sync Hub', 'Email Preferred'],
    orders: [
      { id: 'ORD-78910', date: '2026-05-17', amount: 350.0, status: 'DELIVERED', itemName: 'Fiber Optic Cable Refills' }
    ],
    tickets: [],
    csatRatings: []
  },
  'conv-104': {
    customerId: 'CUST-0024',
    customerName: 'Yasser Al-Shahrani',
    email: 'y.shahrani@fifa.sa',
    phone: '+966 53 777 8899',
    tier: 'VIP Platinum',
    churnRisk: 'Low',
    npsScore: 10,
    totalSpent: 98000.0,
    segmentTags: ['Voice IVR Primary Channel', 'Managed Accounts Team'],
    orders: [
      { id: 'ORD-88112', date: '2026-05-11', amount: 15400.0, status: 'DELIVERED', itemName: 'Multi-Region WAN Hub setup' }
    ],
    tickets: [
      { id: 'TIC-0881', title: 'Fiber connection stability check', status: 'solved', priority: 'medium', date: '2026-05-12' }
    ],
    csatRatings: [
      { chatId: 'ch-002', date: '2026-05-12', rating: 5, feedback: 'Liam Bennett was fantastic. Speed was immediate!' }
    ]
  },
  'conv-105': {
    customerId: 'CUST-4122',
    customerName: 'Layla Hassan',
    email: 'layla.hassan@riyadh.sa',
    phone: '+966 50 111 2222',
    tier: 'Standard Business',
    churnRisk: 'Low',
    npsScore: 8,
    totalSpent: 3400.0,
    segmentTags: ['Instagram User', 'Voucher Inquiries'],
    orders: [
      { id: 'ORD-54321', date: '2026-05-01', amount: 150.0, status: 'DELIVERED', itemName: 'SaaS Expansion Pack v2' }
    ],
    tickets: [],
    csatRatings: []
  },
  'conv-106': {
    customerId: 'CUST-2090',
    customerName: 'Alex Mercer',
    email: 'alex.mercer@gentek.com',
    phone: '+1 (555) 777-8888',
    tier: 'Corporate Gold',
    churnRisk: 'High',
    npsScore: 5,
    totalSpent: 18500.0,
    segmentTags: ['Facebook Messenger User', 'Billing Disputes'],
    orders: [
      { id: 'ORD-12290', date: '2026-04-20', amount: 499.0, status: 'DELIVERED', itemName: 'Core Gateway Router (Gentek-Pack)' }
    ],
    tickets: [
      { id: 'TIC-2033', title: 'Double charge dispute billing error', status: 'open', priority: 'high', date: '2026-05-20' }
    ],
    csatRatings: []
  }
};
