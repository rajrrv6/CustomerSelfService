export interface Article {
  id: string;
  title: string;
  category: string;
  content: string;
  helpfulCount: number;
  tags: string[];
}

export interface ChatHistoryItem {
  id: string;
  title: string;
  solvedDate: string;
  rating: number;
  agent: string;
}

export const kbArticles: Article[] = [
  {
    id: 'art-1',
    title: 'How to Request a SaaS Subscription Refund',
    category: 'Returns & Refunds',
    tags: ['refund', 'billing', 'subscription'],
    helpfulCount: 154,
    content: `Under the standard AI-Native mPaaS subscription guidelines, corporate customers are eligible for a full refund within 30 days of shipment/renewal if the service tier parameters fall below the stated SLA metrics.

To initiate a refund request:
1. Locate your Order ID inside the Order Lookup portal (formatted as ORD-XXXXX).
2. If the order date is within the 30-day window, you will see a 'Refund Eligible' indicator.
3. Click 'Initiate Return/Refund' to open the wizard, select your return reason, and submit.
4. Once verified, the credits will reflect in your active account statement within 3 to 5 banking days.

For orders outside the 30-day window, please submit a formal ticket category 'Billing & Payments' with attachments proving system downtime or failure logs.`
  },
  {
    id: 'art-2',
    title: 'Setting Up OAuth for Client-Gate API Connectors',
    category: 'Developer APIs',
    tags: ['oauth', 'api', 'connector', 'integration'],
    helpfulCount: 92,
    content: `Our client-gate connectors support OAuth 2.0 authorization rules. To establish an API link:
- Log in to your Client Admin console, navigate to settings, and locate the 'ERP Connectors' tab.
- Generate a new client credentials pair (Client ID & Client Secret).
- Ensure your security firewalls whitelist our gateway IPs: 147.28.112.5 and 147.28.112.6.
- A HTTP 403 Forbidden indicates invalid permission scopes. Verify your tenant tokens have read:billing scopes enabled.`
  },
  {
    id: 'art-3',
    title: 'Resetting Locked Civil Registry Logins',
    category: 'Account & Access',
    tags: ['login', 'auth', 'password', 'civil-registry'],
    helpfulCount: 210,
    content: `If your civil registry login credentials fail 3 consecutive times, your user ID will be locked for security.

To unlock your access:
1. Trigger the OTP request flow using your registered corporate email.
2. Enter the 4-digit code (sent via email/SMS).
3. Reset your credentials using a password with at least 12 characters, including one symbol, one uppercase letter, and one number.
4. If OTP delivery fails, check that your telecom carrier allows inbound automated SMS broadcasts.`
  },
  {
    id: 'art-4',
    title: 'Handling Fiber Gateway Delivery Delays',
    category: 'Returns & Refunds',
    tags: ['shipping', 'delivery', 'delay', 'fiber'],
    helpfulCount: 45,
    content: `In the event that your Fiber Gateway Pack (ORD-77612) shows delayed logistics indicators on SAP:
- Verify shipping milestone schedules.
- If delivery exceeds the estimated ETA by 48 hours, a delivery agent will automatically prompt a voice callback to confirm coordinate metrics.
- Delivery changes requested within 12 hours of dispatch can be performed directly inside the Order Status Timeline on your Portal.`
  }
];

export const historicalChats: ChatHistoryItem[] = [
  { id: 'ch-1', title: 'Help with locked registry credential resets', solvedDate: '2026-05-10', rating: 5, agent: 'Nadia Vance' },
  { id: 'ch-2', title: 'Duplicate invoice transaction inquiry', solvedDate: '2026-05-14', rating: 4, agent: 'Farah Bot' }
];
