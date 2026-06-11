import { useState, useEffect, useCallback } from 'react';

export interface TimelineEvent {
  id: string;
  connectorName: string;
  connectorId: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
  detail?: string;
  timestamp: string;
}

const mockNames = ['Sarah Connor', 'Liam Gallagher', 'Omar Farooq', 'Layla Al-Subaei', 'James Vance', 'Aisha Qasim', 'Yousef Harb'];
const mockSkus = ['SKU-PRO-99', 'SKU-BASE-41', 'SKU-ELEC-88', 'SKU-COR-10', 'SKU-SOFT-22'];

export function useSyncTimeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([
    {
      id: 'time-1',
      connectorId: 'salesforce',
      connectorName: 'Salesforce CRM',
      type: 'success',
      message: 'Synced Contact record Sarah Jenkins-Connor',
      detail: 'Fields modified: lastName. API status: 200 OK',
      timestamp: '17:55:22'
    },
    {
      id: 'time-2',
      connectorId: 'shopify',
      connectorName: 'Shopify Store',
      type: 'info',
      message: 'Ingested Order ORD-55410 delivery updates',
      detail: 'Carrier status: IN_TRANSIT (DHL). Delivery estimate: 2026-05-22',
      timestamp: '17:52:10'
    },
    {
      id: 'time-3',
      connectorId: 'zendesk',
      connectorName: 'Zendesk Support',
      type: 'success',
      message: 'Exported Ticket TIC-9041 to Zendesk agent queue',
      detail: 'Assigned ID: zd-ticket-119283. Priority: High',
      timestamp: '17:45:15'
    },
    {
      id: 'time-4',
      connectorId: 'stripe',
      connectorName: 'Stripe Billing',
      type: 'error',
      message: 'Sync timeout on customer Michael Vance invoice calculation',
      detail: 'Stripe API returned 504 Gateway Timeout. Added to retry queue.',
      timestamp: '17:40:02'
    },
    {
      id: 'time-5',
      connectorId: 'salesforce',
      connectorName: 'Salesforce CRM',
      type: 'success',
      message: 'Contact record synchronized successfully: Layla Al-Subaei',
      detail: 'No field changes detected. Profile up to date.',
      timestamp: '17:35:48'
    }
  ]);

  // Append single event
  const addEvent = useCallback((event: Omit<TimelineEvent, 'id' | 'timestamp'>) => {
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const newEvent: TimelineEvent = {
      ...event,
      id: `time-${Date.now()}`,
      timestamp: timeString
    };
    setEvents(prev => [newEvent, ...prev.slice(0, 49)]); // Cap logs at 50
  }, []);

  // Set background dynamic simulation ticker
  useEffect(() => {
    const interval = setInterval(() => {
      const rand = Math.random();
      const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
      const randomSku = mockSkus[Math.floor(Math.random() * mockSkus.length)];

      if (rand < 0.25) {
        // Salesforce Contact Sync success
        addEvent({
          connectorId: 'salesforce',
          connectorName: 'Salesforce CRM',
          type: 'success',
          message: `Synchronized Contact profile for ${randomName}`,
          detail: `Pushed updates: phone, accountGroup. Latency: 110ms`
        });
      } else if (rand < 0.50) {
        // Shopify Order Sync success
        const orderId = Math.floor(10000 + Math.random() * 90000);
        addEvent({
          connectorId: 'shopify',
          connectorName: 'Shopify Store',
          type: 'info',
          message: `Fetched retail order details: ORD-${orderId}`,
          detail: `Matched email. SKU: ${randomSku}. Fulfillment status: PENDING`
        });
      } else if (rand < 0.70) {
        // Zendesk Sync
        const ticketId = Math.floor(1000 + Math.random() * 9000);
        addEvent({
          connectorId: 'zendesk',
          connectorName: 'Zendesk Support',
          type: 'success',
          message: `Merged external ticket comments for TIC-${ticketId}`,
          detail: `Sync state: completed. 2 new responses merged into portal.`
        });
      } else if (rand < 0.85) {
        // Stripe Charge Success
        addEvent({
          connectorId: 'stripe',
          connectorName: 'Stripe Billing',
          type: 'success',
          message: `Validated billing subscription token: ${randomName.replace(' ', '.').toLowerCase()}@mpaas.com`,
          detail: `Status: ACTIVE. Next charge date: 2026-06-20`
        });
      } else if (rand < 0.95) {
        // SAP Material balance sync info
        addEvent({
          connectorId: 'saperp',
          connectorName: 'SAP ERP',
          type: 'info',
          message: `Refreshed material inventory levels for ${randomSku}`,
          detail: `Warehouse balance: ${Math.floor(10 + Math.random() * 500)} units. Plant: DPT-RIYADH`
        });
      } else {
        // Stripe Rate limit warning
        addEvent({
          connectorId: 'stripe',
          connectorName: 'Stripe Billing',
          type: 'warning',
          message: 'API rate limits approaching limit threshold (92% consumed)',
          detail: '23,000 / 25,000 requests processed. Quota resets in 12 mins.'
        });
      }
    }, 10000); // Trigger every 10 seconds

    return () => clearInterval(interval);
  }, [addEvent]);

  return {
    events,
    addEvent
  };
}
