export interface WebhookEventDescriptor {
  type: string;
  category: 'ticket' | 'order' | 'customer' | 'payment';
  description: string;
  schema: string;
}

export interface WebhookDeliveryLog {
  id: string;
  endpointUrl: string;
  eventType: string;
  timestamp: string;
  statusCode: number;
  latencyMs: number;
  payload: string;
  responseBody: string;
  retryAttempt: number;
  status: 'success' | 'failed' | 'retrying';
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  secret: string;
  active: boolean;
  events: string[];
  createdAt: string;
}

export const webhookCatalog: WebhookEventDescriptor[] = [
  {
    type: 'ticket.created',
    category: 'ticket',
    description: 'Fires when a new customer support ticket is initialized in the console.',
    schema: JSON.stringify({
      event: 'ticket.created',
      timestamp: '2026-05-20T12:00:00Z',
      data: {
        ticket_id: 'TIC-8839',
        subject: 'API credentials rotation issue',
        priority: 'high',
        status: 'open',
        customer: {
          name: 'Sarah Connor',
          email: 'sconnor@cyberdyne.com'
        }
      }
    }, null, 2)
  },
  {
    type: 'ticket.solved',
    category: 'ticket',
    description: 'Fires when a ticket is marked as solved by an agent or automated dialog.',
    schema: JSON.stringify({
      event: 'ticket.solved',
      timestamp: '2026-05-20T12:15:00Z',
      data: {
        ticket_id: 'TIC-8839',
        subject: 'API credentials rotation issue',
        status: 'solved',
        resolution_notes: 'Rotated OAuth parameters and cleared cache.',
        resolved_by: 'Liam Bennett (Agent)'
      }
    }, null, 2)
  },
  {
    type: 'order.shipped',
    category: 'order',
    description: 'Fires when a tracking status update is ingested from the ERP system.',
    schema: JSON.stringify({
      event: 'order.shipped',
      timestamp: '2026-05-20T10:30:00Z',
      data: {
        order_id: 'ORD-104928',
        tracking_number: 'TRK-DHL-9920199',
        carrier: 'DHL Express',
        recipient: {
          name: 'John Doe',
          address: '42 Wallaby Way, Sydney'
        }
      }
    }, null, 2)
  },
  {
    type: 'customer.merged',
    category: 'customer',
    description: 'Fires when duplicate user profiles are unified into a master golden record.',
    schema: JSON.stringify({
      event: 'customer.merged',
      timestamp: '2026-05-20T11:45:00Z',
      data: {
        master_customer_id: 'cust-9920',
        duplicate_customer_ids: ['cust-1039', 'cust-7721'],
        merged_fields: {
          email: 'jdoe@gmail.com',
          phone: '+966 50 123 4567'
        }
      }
    }, null, 2)
  },
  {
    type: 'payment.failed',
    category: 'payment',
    description: 'Fires when Stripe auto-billing attempts fail due to expired or blocked credit cards.',
    schema: JSON.stringify({
      event: 'payment.failed',
      timestamp: '2026-05-20T08:00:00Z',
      data: {
        invoice_id: 'in_1McaB3299Fhs',
        amount_due: 49.00,
        currency: 'usd',
        failure_reason: 'card_declined',
        customer_email: 'billing@startup.io'
      }
    }, null, 2)
  }
];

export const initialEndpoints: WebhookEndpoint[] = [
  {
    id: 'end-1',
    url: 'https://api.mycrm.com/v1/webhooks/receive',
    secret: 'whsec_993018Fhsa99AJDG129',
    active: true,
    events: ['ticket.created', 'ticket.solved'],
    createdAt: '2026-04-01 10:00:00'
  },
  {
    id: 'end-2',
    url: 'process.env.SLACK_WEBHOOK_URL',
    secret: 'whsec_slack_282910Asfh9',
    active: true,
    events: ['ticket.solved', 'payment.failed'],
    createdAt: '2026-05-10 15:30:00'
  }
];

export const initialWebhookLogs: WebhookDeliveryLog[] = [
  {
    id: 'wlog-1',
    endpointUrl: 'https://api.mycrm.com/v1/webhooks/receive',
    eventType: 'ticket.created',
    timestamp: '2026-05-20 17:45:12',
    statusCode: 200,
    latencyMs: 145,
    payload: JSON.stringify({
      event: 'ticket.created',
      timestamp: '2026-05-20T17:45:12Z',
      data: {
        ticket_id: 'TIC-9041',
        subject: 'Payment dispute',
        priority: 'high',
        status: 'open',
        customer: { name: 'Ahmad Al-Sudais', email: 'ahmad@sudais.com' }
      }
    }, null, 2),
    responseBody: JSON.stringify({ success: true, received: true }),
    retryAttempt: 0,
    status: 'success'
  },
  {
    id: 'wlog-2',
    endpointUrl: 'process.env.SLACK_WEBHOOK_URL',
    eventType: 'ticket.solved',
    timestamp: '2026-05-20 17:30:05',
    statusCode: 200,
    latencyMs: 88,
    payload: JSON.stringify({
      event: 'ticket.solved',
      timestamp: '2026-05-20T17:30:05Z',
      data: {
        ticket_id: 'TIC-1234',
        subject: 'Reset billing password',
        status: 'solved',
        resolved_by: 'Liam Bennett (Agent)'
      }
    }, null, 2),
    responseBody: 'ok',
    retryAttempt: 0,
    status: 'success'
  },
  {
    id: 'wlog-3',
    endpointUrl: 'https://api.mycrm.com/v1/webhooks/receive',
    eventType: 'payment.failed',
    timestamp: '2026-05-20 17:15:00',
    statusCode: 504,
    latencyMs: 5000,
    payload: JSON.stringify({
      event: 'payment.failed',
      timestamp: '2026-05-20T17:10:00Z',
      data: {
        invoice_id: 'in_99201Fha8',
        amount_due: 99.00,
        currency: 'usd',
        failure_reason: 'insufficient_funds',
        customer_email: 'billing@enterprise.com'
      }
    }, null, 2),
    responseBody: 'Gateway Timeout - Connection Closed',
    retryAttempt: 2,
    status: 'failed'
  },
  {
    id: 'wlog-4',
    endpointUrl: 'https://api.mycrm.com/v1/webhooks/receive',
    eventType: 'order.shipped',
    timestamp: '2026-05-20 16:50:33',
    statusCode: 500,
    latencyMs: 1200,
    payload: JSON.stringify({
      event: 'order.shipped',
      timestamp: '2026-05-20T16:50:30Z',
      data: {
        order_id: 'ORD-55410',
        tracking_number: 'TRK-UPS-110292',
        carrier: 'UPS Ground',
        recipient: { name: 'Mariam Ali', address: 'Prince Sultan St, Riyadh' }
      }
    }, null, 2),
    responseBody: 'Internal Server Error - Cannot parse payload JSON',
    retryAttempt: 1,
    status: 'retrying'
  }
];
