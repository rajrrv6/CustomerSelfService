export interface ConnectorField {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'date';
  required: boolean;
}

export interface ConnectorMapping {
  externalField: string;
  localField: string;
}

export interface CRMConnector {
  id: string;
  name: string;
  desc: string;
  category: 'crm' | 'erp' | 'billing' | 'support' | 'webhook';
  status: 'connected' | 'disconnected' | 'degraded';
  logoName: string;
  rateLimitUsed: number;
  rateLimitMax: number;
  latencyMs: number;
  fields: ConnectorField[];
  mappings: ConnectorMapping[];
  clientId?: string;
  clientSecret?: string;
  scopes?: string[];
  connectedAt?: string;
}

export const initialConnectors: CRMConnector[] = [
  {
    id: 'salesforce',
    name: 'Salesforce CRM Cloud',
    desc: 'Synchronize contacts, accounts, and lead records with customer profiles in real-time.',
    category: 'crm',
    status: 'connected',
    logoName: 'Salesforce',
    rateLimitUsed: 42000,
    rateLimitMax: 100000,
    latencyMs: 120,
    fields: [
      { key: 'FirstName', label: 'First Name', type: 'string', required: true },
      { key: 'LastName', label: 'Last Name', type: 'string', required: true },
      { key: 'Email', label: 'Email Address', type: 'string', required: true },
      { key: 'Phone', label: 'Mobile Number', type: 'string', required: false },
      { key: 'AccountName', label: 'Company / Account Name', type: 'string', required: false },
      { key: 'CreatedDate', label: 'SF Created Time', type: 'date', required: false }
    ],
    mappings: [
      { externalField: 'FirstName', localField: 'firstName' },
      { externalField: 'LastName', localField: 'lastName' },
      { externalField: 'Email', localField: 'email' },
      { externalField: 'Phone', localField: 'phone' }
    ],
    clientId: 'sf-oauth-client-prod-88391',
    scopes: ['read_contacts', 'write_accounts', 'refresh_token'],
    connectedAt: '2026-04-12 11:20:00'
  },
  {
    id: 'hubspot',
    name: 'HubSpot Integrator',
    desc: 'Manage contact lifecycle stages, company segments, and support-to-sales Handshake alerts.',
    category: 'crm',
    status: 'disconnected',
    logoName: 'Hubspot',
    rateLimitUsed: 0,
    rateLimitMax: 50000,
    latencyMs: 95,
    fields: [
      { key: 'firstname', label: 'First Name', type: 'string', required: true },
      { key: 'lastname', label: 'Last Name', type: 'string', required: true },
      { key: 'email', label: 'Email Address', type: 'string', required: true },
      { key: 'phone', label: 'Phone', type: 'string', required: false },
      { key: 'hs_lead_status', label: 'Lead Status', type: 'string', required: false }
    ],
    mappings: []
  },
  {
    id: 'zendesk',
    name: 'Zendesk Support Link',
    desc: 'Escalate bot transcripts into standard ticket queues, mapping agent allocations and notes.',
    category: 'support',
    status: 'connected',
    logoName: 'Zendesk',
    rateLimitUsed: 18200,
    rateLimitMax: 40000,
    latencyMs: 145,
    fields: [
      { key: 'id', label: 'Ticket ID', type: 'string', required: true },
      { key: 'subject', label: 'Subject Line', type: 'string', required: true },
      { key: 'description', label: 'Body Description', type: 'string', required: true },
      { key: 'status', label: 'Status Code', type: 'string', required: true },
      { key: 'priority', label: 'Priority Code', type: 'string', required: false }
    ],
    mappings: [
      { externalField: 'subject', localField: 'ticketTitle' },
      { externalField: 'description', localField: 'ticketDesc' },
      { externalField: 'status', localField: 'ticketStatus' }
    ],
    clientId: 'zd-oauth-id-99881',
    scopes: ['read_tickets', 'write_tickets', 'offline_access'],
    connectedAt: '2026-05-01 09:15:30'
  },
  {
    id: 'shopify',
    name: 'Shopify Order API',
    desc: 'Retrieve customer orders, checkout cart values, and tracking numbers directly inside dialog flows.',
    category: 'erp',
    status: 'connected',
    logoName: 'Shopify',
    rateLimitUsed: 7500,
    rateLimitMax: 20000,
    latencyMs: 105,
    fields: [
      { key: 'order_id', label: 'Shopify Order ID', type: 'string', required: true },
      { key: 'customer_email', label: 'Customer Email', type: 'string', required: true },
      { key: 'total_price', label: 'Total Paid Amount', type: 'number', required: true },
      { key: 'financial_status', label: 'Payment Status', type: 'string', required: false },
      { key: 'fulfillment_status', label: 'Shipping Status', type: 'string', required: false },
      { key: 'shipping_address', label: 'Delivery Location', type: 'string', required: false }
    ],
    mappings: [
      { externalField: 'order_id', localField: 'orderId' },
      { externalField: 'total_price', localField: 'orderAmount' },
      { externalField: 'fulfillment_status', localField: 'orderStatus' }
    ],
    clientId: 'sh-api-merchant-key-29938',
    scopes: ['read_orders', 'read_customers'],
    connectedAt: '2026-05-18 16:45:00'
  },
  {
    id: 'stripe',
    name: 'Stripe Billing Gate',
    desc: 'Verify active subscription licenses, checkout cards, charge invoices, and handle refunds.',
    category: 'billing',
    status: 'degraded',
    logoName: 'Stripe',
    rateLimitUsed: 19800,
    rateLimitMax: 25000,
    latencyMs: 450, // Degraded latency
    fields: [
      { key: 'id', label: 'Customer ID', type: 'string', required: true },
      { key: 'email', label: 'Stripe Account Email', type: 'string', required: true },
      { key: 'delinquent', label: 'Payment Overdue Status', type: 'boolean', required: true },
      { key: 'subscription_status', label: 'Subscription Plan Status', type: 'string', required: false }
    ],
    mappings: [
      { externalField: 'subscription_status', localField: 'billingStatus' },
      { externalField: 'delinquent', localField: 'isOverdue' }
    ],
    clientId: 'pk_live_51McaB3299Fhs',
    scopes: ['charges_read', 'customers_read_write'],
    connectedAt: '2026-05-10 14:02:11'
  },
  {
    id: 'saperp',
    name: 'SAP Inventory ERP',
    desc: 'Verify real-time warehouse supply levels, logistics tracking, and item master catalogues.',
    category: 'erp',
    status: 'disconnected',
    logoName: 'Sap',
    rateLimitUsed: 0,
    rateLimitMax: 10000,
    latencyMs: 190,
    fields: [
      { key: 'MaterialNumber', label: 'Material Number (SKU)', type: 'string', required: true },
      { key: 'Plant', label: 'Plant Depot ID', type: 'string', required: true },
      { key: 'StorageLocation', label: 'Aisle Bin ID', type: 'string', required: false },
      { key: 'QuantityAvailable', label: 'Warehouse Stock Balance', type: 'number', required: true }
    ],
    mappings: []
  }
];
