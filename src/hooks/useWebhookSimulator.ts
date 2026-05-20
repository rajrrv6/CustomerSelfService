import { useState, useCallback } from 'react';
import { initialEndpoints, initialWebhookLogs, webhookCatalog, WebhookEndpoint, WebhookDeliveryLog } from '../data/seed/webhookEventsSeed';

export function useWebhookSimulator() {
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>(initialEndpoints);
  const [logs, setLogs] = useState<WebhookDeliveryLog[]>(initialWebhookLogs);

  const addEndpoint = useCallback((url: string, selectedEvents: string[]) => {
    const randomHex = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newEndpoint: WebhookEndpoint = {
      id: `end-${Date.now()}`,
      url,
      secret: `whsec_${randomHex}`,
      active: true,
      events: selectedEvents,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setEndpoints(prev => [...prev, newEndpoint]);
  }, []);

  const toggleEndpoint = useCallback((id: string) => {
    setEndpoints(prev =>
      prev.map(end => (end.id === id ? { ...end, active: !end.active } : end))
    );
  }, []);

  const deleteEndpoint = useCallback((id: string) => {
    setEndpoints(prev => prev.filter(end => end.id !== id));
  }, []);

  // Simulates outgoing webhook event trigger
  const triggerMockEvent = useCallback((eventType: string, targetEndpointId?: string) => {
    const descriptor = webhookCatalog.find(e => e.type === eventType);
    if (!descriptor) return;

    // Pick target endpoints (either specific one or all endpoints listening to this event)
    const targets = targetEndpointId 
      ? endpoints.filter(e => e.id === targetEndpointId && e.active)
      : endpoints.filter(e => e.active && e.events.includes(eventType));

    if (targets.length === 0) return;

    targets.forEach(end => {
      const logId = `wlog-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

      // Create initial pending log
      const pendingLog: WebhookDeliveryLog = {
        id: logId,
        endpointUrl: end.url,
        eventType,
        timestamp,
        statusCode: 0, // 0 stands for processing/pending
        latencyMs: 0,
        payload: descriptor.schema,
        responseBody: 'Pinging listener socket...',
        retryAttempt: 0,
        status: 'retrying'
      };

      setLogs(prev => [pendingLog, ...prev]);

      // Delay response simulation
      setTimeout(() => {
        // Randomly simulate success or fail (85% success)
        const rand = Math.random();
        const success = rand > 0.15;
        const statusCode = success ? 200 : rand > 0.07 ? 500 : 404;
        const responseBody = success 
          ? JSON.stringify({ success: true, message: 'Event successfully received by target worker.' })
          : statusCode === 500 
          ? 'Error: Internal Server Error - Endpoint crashed while parsing payload.' 
          : 'Error: 404 Not Found - Listener route does not exist.';

        setLogs(prev =>
          prev.map(log => {
            if (log.id === logId) {
              return {
                ...log,
                statusCode,
                latencyMs: Math.floor(50 + Math.random() * 300),
                responseBody,
                status: success ? 'success' : 'failed'
              };
            }
            return log;
          })
        );
      }, 1000);
    });
  }, [endpoints]);

  // Clean log list
  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return {
    endpoints,
    addEndpoint,
    toggleEndpoint,
    deleteEndpoint,
    logs,
    triggerMockEvent,
    clearLogs,
    webhookCatalog
  };
}
