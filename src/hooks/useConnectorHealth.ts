import { useState, useEffect } from 'react';
import { initialHealthMetrics, ConnectorHealthMetrics } from '../data/seed/integrationHealthSeed';
import { CRMConnector } from '../data/seed/crmConnectorsSeed';

export function useConnectorHealth(activeConnectors: CRMConnector[]) {
  const [metrics, setMetrics] = useState<ConnectorHealthMetrics[]>(initialHealthMetrics);

  useEffect(() => {
    const timer = setInterval(() => {
      // 1. Simulate API Rate Limit Increases for Connected Integrations
      setMetrics(prevMetrics =>
        prevMetrics.map(metric => {
          const conn = activeConnectors.find(c => c.id === metric.connectorId);
          if (!conn || conn.status === 'disconnected') {
            return metric;
          }

          // Random requests count increment (+5 to +35 calls)
          const newCalls = Math.floor(5 + Math.random() * 30);
          
          // Random latency drift (+/- 8ms)
          const latencyDrift = Math.floor(-8 + Math.random() * 16);
          const nextAvgLatency = Math.max(40, Math.min(800, metric.avgLatency + latencyDrift));

          // Append to history24h
          const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
          const updatedHistory = [...metric.history24h.slice(1), { time: timeString.substring(0, 5), latencyMs: nextAvgLatency }];

          // 2% chance of single simulated error
          const hadError = Math.random() > 0.98;

          return {
            ...metric,
            avgLatency: nextAvgLatency,
            totalCalls24h: metric.totalCalls24h + newCalls,
            errorCount24h: metric.errorCount24h + (hadError ? 1 : 0),
            history24h: updatedHistory
          };
        })
      );
    }, 6000); // Drifts every 6 seconds

    return () => clearInterval(timer);
  }, [activeConnectors]);

  // Calculations for general dashboard usage metrics
  const getRateLimitStatus = (connectorId: string, currentUsed: number, currentMax: number) => {
    // We dynamically sync the rate limits between the connector state and the health state
    const metric = metrics.find(m => m.connectorId === connectorId);
    if (!metric) return { used: currentUsed, max: currentMax, percentage: 0 };
    
    // We add the calls generated in health ticker to the connector's rateLimitUsed
    const syncedUsed = Math.min(currentMax, currentUsed + (metric.totalCalls24h % 500));
    const percentage = Math.round((syncedUsed / currentMax) * 100);

    return {
      used: syncedUsed,
      max: currentMax,
      percentage
    };
  };

  return {
    metrics,
    getRateLimitStatus
  };
}
