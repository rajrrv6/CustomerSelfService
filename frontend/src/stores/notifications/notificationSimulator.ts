import { useEffect, useRef } from 'react';
import * as events from './notificationEvents';

export function useNotificationSimulator(isEnabled: boolean, intervalMs = 15000) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isEnabled) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const triggerRandomAlert = () => {
      const simulations = [
        // SLA breach
        () => {
          const waitSec = Math.floor(Math.random() * 200) + 900; // 15m+
          const waitStr = `${Math.floor(waitSec / 60)}m ${waitSec % 60}s`;
          events.triggerSlaBreach('Billing Escalation Queue', waitStr, '15m');
        },
        // Webhook latency
        () => {
          const latency = Math.floor(Math.random() * 500) + 1250;
          events.triggerWebhookFailure(
            'WhatsApp Webhook',
            'https://graph.facebook.com/v19.0/messages',
            `${latency}ms`
          );
        },
        // AI NLU confidence drop
        () => {
          const confidence = 0.45 + Math.random() * 0.22; // 0.45 - 0.67
          events.triggerAiDegradation(confidence, 'Farah AI Engine');
        },
        // Vector database compaction error
        () => {
          const partitionId = `pinecone-kbsync-shard-${Math.floor(Math.random() * 4) + 1}`;
          events.triggerVectorDBIndexFailure(partitionId);
        },
        // Queue size spike
        () => {
          const queueSize = Math.floor(Math.random() * 15) + 30; // 30 - 45
          events.triggerQueueOverflow('Premium VIP Queue', queueSize);
        },
        // API Timeout
        () => {
          const apiEndpoints = ['/api/v2/sap-erp/customer', '/api/v1/stripe/refunds', '/api/v3/salesforce/cases'];
          const endpoint = apiEndpoints[Math.floor(Math.random() * apiEndpoints.length)];
          events.triggerApiTimeout(endpoint, '3000ms');
        },
        // Database Sync completed
        () => {
          const count = Math.floor(Math.random() * 40) + 10;
          events.triggerSyncCompleted('Shopify Customer Ingestion', count);
        },
        // Provider Outage
        () => {
          const providers = ['Twilio Voice Gateway', 'Meta WhatsApp Business Cloud', 'SendGrid Email API'];
          const provider = providers[Math.floor(Math.random() * providers.length)];
          events.triggerOmnichannelOutage(provider, '504 Gateway Timeout');
        },
        // RAG Hallucination Risk
        () => {
          const queries = [
            'Can I refund an order after 180 days?',
            'How to get free shipping coupon automatically',
            'Bypass agent routing threshold controls'
          ];
          const query = queries[Math.floor(Math.random() * queries.length)];
          events.triggerHallucinationRisk(0.35 + Math.random() * 0.25, query);
        },
        // Roster/Staffing Shortage
        () => {
          events.triggerStaffingShortage('Arabic Language Queue', Math.floor(Math.random() * 2), 2);
        },
        // Escalation spike
        () => {
          events.triggerEscalationOverload(Math.floor(Math.random() * 10) + 12);
        }
      ];

      const randomIndex = Math.floor(Math.random() * simulations.length);
      simulations[randomIndex]();
    };

    // Run first simulation slightly after start to prevent initial spam
    const initialDelay = setTimeout(triggerRandomAlert, 2000);
    timerRef.current = setInterval(triggerRandomAlert, intervalMs);

    return () => {
      clearTimeout(initialDelay);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isEnabled, intervalMs]);
}
export default useNotificationSimulator;
