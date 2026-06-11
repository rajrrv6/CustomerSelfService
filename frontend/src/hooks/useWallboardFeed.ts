import { useState, useEffect } from 'react';
import {
  agentPerformanceRoster,
  AgentPerformance,
  workforceUtilizationDistribution,
  recentSupervisorLogs,
  SupervisorActivityLog
} from '@/data/seed/workforceMetricsSeed';
import { CallQualitySample, callQualityBreakdown } from '@/data/seed/voiceMetricsSeed';

export function useWallboardFeed(speedMultiplier: number = 1) {
  const [agents, setAgents] = useState<AgentPerformance[]>(agentPerformanceRoster);
  const [logs, setLogs] = useState<SupervisorActivityLog[]>(recentSupervisorLogs);
  const [qualityBreakdown, setQualityBreakdown] = useState<CallQualitySample[]>(callQualityBreakdown);

  useEffect(() => {
    const delay = Math.round(5000 / Math.max(1, speedMultiplier));
    const interval = setInterval(() => {
      // Simulate status swapping of agents
      setAgents((prevAgents) =>
        prevAgents.map((a) => {
          // Emma stays offline, Yousef on break
          if (a.agentName === 'Emma Watson' || a.agentName === 'Yousef Al-Harbi') {
            // occasionally Yousef goes back to work
            if (a.agentName === 'Yousef Al-Harbi' && Math.random() > 0.8) {
              return { ...a, activeStatus: 'online' as const };
            }
            return a;
          }

          // Randomize statuses between online and busy for other agents
          if (Math.random() > 0.75) {
            const statuses = ['online', 'busy'] as const;
            const nextStatus = statuses[Math.floor(Math.random() * statuses.length)];
            return {
              ...a,
              activeStatus: nextStatus,
              handledTickets: a.handledTickets + (Math.random() > 0.6 ? 1 : 0),
              handledCalls: a.handledCalls + (Math.random() > 0.5 ? 1 : 0),
              utilizationRate: Math.max(70, Math.min(100, +(a.utilizationRate + (Math.random() * 4 - 2)).toFixed(1)))
            };
          }
          return a;
        })
      );

      // Fluctuate latency and packet loss on voice trunks
      setQualityBreakdown((prevQ) =>
        prevQ.map((q) => {
          const lossDelta = +(Math.random() * 0.4 - 0.2).toFixed(2);
          const packetLossAvg = Math.max(0.01, Math.min(2.5, +(q.packetLossAvg + lossDelta).toFixed(2)));
          
          const jitterDelta = Math.floor(Math.random() * 4) - 2;
          const jitterMs = Math.max(1.0, +(q.jitterMs + jitterDelta).toFixed(1));

          let mosScore = q.mosScore;
          if (packetLossAvg > 1.2 || jitterMs > 6.0) {
            mosScore = Math.max(2.5, +(q.mosScore - 0.1).toFixed(2));
          } else {
            mosScore = Math.min(5.0, +(q.mosScore + 0.05).toFixed(2));
          }

          return { ...q, packetLossAvg, jitterMs, mosScore };
        })
      );

      // Periodically trigger supervisor whisper activity
      if (Math.random() > 0.85) {
        const names = ['Tariq Mahmood', 'Amani Faris'];
        const targets = ['Amina Mansoor', 'Sanjay Kumar', 'Sarah Jenkins'];
        const actions = ['whisper', 'barge', 'silent_monitor'] as const;

        const newLog: SupervisorActivityLog = {
          id: `s-ev-${Date.now()}`,
          supervisorName: names[Math.floor(Math.random() * names.length)],
          agentName: targets[Math.floor(Math.random() * targets.length)],
          actionType: actions[Math.floor(Math.random() * actions.length)],
          timestamp: 'Just now',
          durationMins: +(Math.random() * 5 + 1).toFixed(1)
        };

        setLogs((prevLogs) => {
          const agedLogs = prevLogs.map((l) => {
            if (l.timestamp === 'Just now') return { ...l, timestamp: '1 min ago' };
            if (l.timestamp.includes('min ago')) {
              const mins = parseInt(l.timestamp) + 1;
              return { ...l, timestamp: `${mins} mins ago` };
            }
            return l;
          });
          return [newLog, ...agedLogs.slice(0, 4)];
        });
      }

    }, delay);

    return () => clearInterval(interval);
  }, [speedMultiplier]);

  return {
    agents,
    logs,
    qualityBreakdown,
    distribution: workforceUtilizationDistribution
  };
}
