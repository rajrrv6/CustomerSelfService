import { useState, useEffect, useRef } from 'react';
import { initialExecutiveKpis, ExecutiveKpis } from '@/data/seed/analyticsSeed';

export interface AlertNotification {
  id: string;
  timestamp: string;
  source: 'telephony' | 'queue' | 'sla' | 'integration' | 'ai';
  severity: 'warning' | 'critical' | 'info';
  message: string;
}

export function useRealtimeMetrics() {
  const [metrics, setMetrics] = useState<ExecutiveKpis>(initialExecutiveKpis);
  const [alerts, setAlerts] = useState<AlertNotification[]>([
    {
      id: 'alert-init-1',
      timestamp: '5 mins ago',
      source: 'integration',
      severity: 'warning',
      message: 'SAP ERP webhook endpoint latency spiked to 480ms.'
    }
  ]);

  // Store current metrics in a ref so the interval callback can read the latest
  // queueSize without listing `metrics` in the dependency array.
  // This prevents the interval from being torn down and recreated on every queue
  // fluctuation, which was causing unnecessary timer churn.
  const metricsRef = useRef<ExecutiveKpis>(metrics);
  useEffect(() => {
    metricsRef.current = metrics;
  }, [metrics]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => {
        // Random queue fluctuation (-1 to +2)
        const queueDelta = Math.random() > 0.4 ? (Math.random() > 0.5 ? 1 : -1) : 2;
        const nextQueueSize = Math.max(0, Math.min(25, prev.queueSize + queueDelta));
        
        // SLA drops slightly if queue size gets high
        let slaCompliance = prev.slaCompliance;
        if (nextQueueSize > 12) {
          slaCompliance = Math.max(92.0, +(prev.slaCompliance - 0.2).toFixed(1));
        } else {
          slaCompliance = Math.min(100.0, +(prev.slaCompliance + 0.05).toFixed(1));
        }

        // Active agents shifting between 40 and 45
        const nextAgents = Math.max(38, Math.min(48, prev.activeAgents + (Math.random() > 0.5 ? 1 : -1)));

        // Deflection rate fluctuates
        const deflectionDelta = +(Math.random() * 0.8 - 0.4).toFixed(1);
        const deflectionRate = Math.max(55.0, Math.min(75.0, +(prev.deflectionRate + deflectionDelta).toFixed(1)));

        // CSAT adjusts slightly
        const csatDelta = +(Math.random() * 0.04 - 0.02).toFixed(2);
        const averageCsat = Math.max(4.2, Math.min(5.0, +(prev.averageCsat + csatDelta).toFixed(2)));

        return {
          ...prev,
          totalInteractions: prev.totalInteractions + (Math.random() > 0.3 ? 1 : 0),
          queueSize: nextQueueSize,
          slaCompliance,
          activeAgents: nextAgents,
          deflectionRate,
          averageCsat
        };
      });

      // Periodically trigger a live warning alert on queue spikes.
      // Read current queueSize from metricsRef to avoid stale closure capture.
      setAlerts((prevAlerts) => {
        const currentQueueSize = metricsRef.current.queueSize;
        const hasQueueWarning = prevAlerts.some(a => a.source === 'queue' && a.severity === 'critical');
        
        if (currentQueueSize > 10 && !hasQueueWarning) {
          const newAlert: AlertNotification = {
            id: `alert-q-${Date.now()}`,
            timestamp: 'Just now',
            source: 'queue',
            severity: 'critical',
            message: `Queue size spiked to ${currentQueueSize} waiting sessions. Consider routing agents.`
          };
          return [newAlert, ...prevAlerts.slice(0, 4)];
        }
        
        // Randomly clear old queue alerts or trigger occasional integration latency warnings
        if (Math.random() > 0.85) {
          const newAlert: AlertNotification = {
            id: `alert-int-${Date.now()}`,
            timestamp: 'Just now',
            source: 'integration',
            severity: 'warning',
            message: `External Salesforce API sync reported slow response.`
          };
          return [newAlert, ...prevAlerts.slice(0, 4)];
        }

        return prevAlerts;
      });

    }, 3000);

    return () => clearInterval(interval);
  }, []); // Empty dep array: interval runs continuously without recreation

  return {
    metrics,
    alerts
  };
}
