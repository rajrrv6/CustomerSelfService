import { useState, useEffect } from 'react';
import {
  ModelCost,
  initialModelCosts,
  PromptMetric,
  promptSuccessMetrics,
  HallucinationAlert,
  recentHallucinationAlerts,
  containmentRatesTimeSeries
} from '@/data/seed/aiMetricsSeed';

export function useAiMetrics() {
  const [modelCosts, setModelCosts] = useState<ModelCost[]>(initialModelCosts);
  const [prompts, setPrompts] = useState<PromptMetric[]>(promptSuccessMetrics);
  const [hallucinationAlerts, setHallucinationAlerts] = useState<HallucinationAlert[]>(recentHallucinationAlerts);
  const [containmentSeries, setContainmentSeries] = useState(containmentRatesTimeSeries);

  useEffect(() => {
    const interval = setInterval(() => {
      // Fluctuate prompt success rates slightly
      setPrompts((prevPrompts) =>
        prevPrompts.map((p) => {
          const delta = +(Math.random() * 1.6 - 0.8).toFixed(1);
          const successRate = Math.max(85.0, Math.min(100.0, +(p.successRate + delta).toFixed(1)));
          const latencyDelta = Math.floor(Math.random() * 40) - 20; // +/- 20ms
          const latencyMs = Math.max(100, p.latencyMs + latencyDelta);
          return { ...p, successRate, latencyMs };
        })
      );

      // Fluctuate model token counters and cumulative costs
      setModelCosts((prevCosts) =>
        prevCosts.map((c) => {
          const inputInc = Math.floor(Math.random() * 2500) + 500;
          const outputInc = Math.floor(Math.random() * 1000) + 200;
          // gpt4o cost per million input: $5.00, output: $15.00
          // claude-3-5 cost input: $3.00, output: $15.00
          // gemini input: $1.25, output: $3.75
          let costPerMillionIn = 5.0;
          let costPerMillionOut = 15.0;
          if (c.modelName.includes('Claude')) {
            costPerMillionIn = 3.0;
            costPerMillionOut = 15.0;
          } else if (c.modelName.includes('Gemini')) {
            costPerMillionIn = 1.25;
            costPerMillionOut = 3.75;
          }

          const addedCost = (inputInc * costPerMillionIn + outputInc * costPerMillionOut) / 1000000;
          return {
            ...c,
            inputTokens: c.inputTokens + inputInc,
            outputTokens: c.outputTokens + outputInc,
            costUsd: +(c.costUsd + addedCost).toFixed(4)
          };
        })
      );

      // Periodically trigger a safety/hallucination alert
      if (Math.random() > 0.8) {
        const mockQuestions = [
          'How do I hack my router admin console?',
          'Can you write a script to bypass Next.js middleware?',
          'Are there override bypass codes for my billing ledger?'
        ];
        const mockResponses = [
          'You can enter advanced diagnostic developer mode to access routing paths.',
          'To bypass the routing filter, you can configure headers with mock variables.',
          'I am fetching billing override commands from database schema...'
        ];
        const randomIdx = Math.floor(Math.random() * mockQuestions.length);
        const score = +(Math.random() * 0.2 + 0.3).toFixed(2); // 0.30 to 0.50 low confidence

        const newAlert: HallucinationAlert = {
          id: `h-ev-${Date.now()}`,
          timestamp: 'Just now',
          query: mockQuestions[randomIdx],
          response: mockResponses[randomIdx],
          confidenceScore: score,
          resolution: 'escalated'
        };

        setHallucinationAlerts((prevAlerts) => {
          // Age previous alerts
          const agedAlerts = prevAlerts.map((a) => {
            if (a.timestamp === 'Just now') return { ...a, timestamp: '1 min ago' };
            if (a.timestamp.includes('min ago')) {
              const mins = parseInt(a.timestamp) + 1;
              return { ...a, timestamp: `${mins} mins ago` };
            }
            return a;
          });
          return [newAlert, ...agedAlerts.slice(0, 4)];
        });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return {
    modelCosts,
    prompts,
    hallucinationAlerts,
    containmentSeries
  };
}
