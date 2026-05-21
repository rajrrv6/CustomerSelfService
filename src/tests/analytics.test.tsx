import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../test-utils';
import { AIContainmentMetrics } from '@/components/analytics/AIContainmentMetrics';
import { QueueHeatmap } from '@/components/analytics/QueueHeatmap';
import { LiveWallboard } from '@/components/analytics/LiveWallboard';

// Mock hooks
const mockUseAiMetrics = vi.fn();
vi.mock('@/hooks/useAiMetrics', () => ({
  useAiMetrics: () => mockUseAiMetrics()
}));

const mockUseWallboardFeed = vi.fn();
vi.mock('@/hooks/useWallboardFeed', () => ({
  useWallboardFeed: () => mockUseWallboardFeed()
}));

const mockUseVoiceQueue = vi.fn();
vi.mock('@/hooks/useVoiceQueue', () => ({
  useVoiceQueue: () => mockUseVoiceQueue()
}));

const mockUseRealtimeMetrics = vi.fn();
vi.mock('@/hooks/useRealtimeMetrics', () => ({
  useRealtimeMetrics: () => mockUseRealtimeMetrics()
}));

describe('Analytics & Observability Subsystem QA Tests', () => {
  it('renders AIContainmentMetrics and checks hallucination alerts and prompt performance grid', () => {
    mockUseAiMetrics.mockReturnValue({
      prompts: [
        {
          id: 'p-1',
          name: 'SAP Contact Matching Resolver v4',
          category: 'RAG',
          successRate: 98.4,
          tokensAvg: 450,
          latencyMs: 380
        }
      ],
      hallucinationAlerts: [
        {
          id: 'ha-1',
          timestamp: '2 mins ago',
          query: 'How to bypass system validation?',
          response: 'Access bypassed by debug settings.',
          confidenceScore: 0.32,
          resolution: 'escalated'
        }
      ],
      containmentSeries: [
        { timestamp: '10:00', value: 85.5 }
      ],
      modelCosts: []
    });

    render(<AIContainmentMetrics />);

    expect(screen.getByText(/Generative Guardrails & Hallucination Logs/i)).toBeInTheDocument();
    expect(screen.getByText(/Q: "How to bypass system validation\?"/i)).toBeInTheDocument();
    expect(screen.getByText(/Confidence Score: 0.32/i)).toBeInTheDocument();
    expect(screen.getByText(/ESCALATED TO AGENT/i)).toBeInTheDocument();

    // Verify prompt table row
    expect(screen.getByText('SAP Contact Matching Resolver v4')).toBeInTheDocument();
    expect(screen.getByText('98.4%')).toBeInTheDocument();
  });

  it('renders QueueHeatmap distribution list and roster', () => {
    mockUseWallboardFeed.mockReturnValue({
      agents: [
        {
          avatarLetter: 'KB',
          agentName: 'Khalid Benjelloun',
          role: 'Billing Lead',
          activeStatus: 'on_call',
          slaAdherence: 95,
          handledTickets: 15,
          handledCalls: 8,
          csatAvg: 4.9,
          utilizationRate: 92
        }
      ],
      distribution: [
        { label: 'On Voice Call', count: 12, color: '#3b82f6' }
      ]
    });

    render(<QueueHeatmap />);

    expect(screen.getByText('Workforce Productivity & Roster')).toBeInTheDocument();
    expect(screen.getByText('Khalid Benjelloun')).toBeInTheDocument();
    expect(screen.getByText('12 agents (29%)')).toBeInTheDocument();
  });

  it('renders LiveWallboard console and simulates incoming call triggers', () => {
    const handleSimulate = vi.fn().mockReturnValue({
      id: 'c-new',
      customerName: 'Alice Green',
      phoneNumber: '+1 (555) 999-8888',
      queueName: 'VIP Tech Support',
      priority: 'VIP' as const,
      waitTime: 0
    });
    const handleRoute = vi.fn();

    mockUseVoiceQueue.mockReturnValue({
      queue: [
        {
          id: 'c-1',
          customerName: 'Robert Vance',
          phoneNumber: '+1 (555) 123-4567',
          queueName: 'Billing Queue',
          priority: 'High' as const,
          waitTime: 45
        }
      ],
      simulateInboundQueuedCall: handleSimulate,
      dequeueCall: handleRoute
    });

    mockUseWallboardFeed.mockReturnValue({
      agents: [],
      logs: [
        {
          id: 'log-1',
          supervisorName: 'Farah AI Supervisor',
          agentName: 'Liam Bennett',
          actionType: 'whisper' as const,
          durationMins: 3.5,
          timestamp: '10:45:00'
        }
      ],
      qualityBreakdown: [
        { codec: 'Opus', mosScore: 4.45, jitterMs: 1.2, packetLossAvg: 0.05 }
      ]
    });

    mockUseRealtimeMetrics.mockReturnValue({
      metrics: { activeAgents: 15 }
    });

    render(<LiveWallboard />);

    expect(screen.getByText('Live Telephony Wallboard Console')).toBeInTheDocument();
    expect(screen.getByText('Robert Vance')).toBeInTheDocument();
    expect(screen.getByText('Farah AI Supervisor')).toBeInTheDocument();

    // Click simulate call
    const simulateBtn = screen.getByRole('button', { name: /Simulate inbound VIP/i });
    fireEvent.click(simulateBtn);
    expect(handleSimulate).toHaveBeenCalled();

    // Verify route button
    const routeBtn = screen.getByRole('button', { name: /Route Robert Vance to agent/i });
    fireEvent.click(routeBtn);
    expect(handleRoute).toHaveBeenCalledWith('c-1');
  });
});
