import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@/test-utils';
import { QueueSwitcher } from '@/components/agent-workspace/QueueSwitcher';
import { AIReplyComposer } from '@/components/agent-workspace/AIReplyComposer';
import { ConferenceModal } from '@/components/agent-workspace/ConferenceModal';
import { TransferModal } from '@/components/agent-workspace/TransferModal';
import { WrapupModal } from '@/components/agent-workspace/WrapupModal';
import { ComposerAttachmentPreview } from '@/components/agent-workspace/ComposerAttachmentPreview';
import { useAuthStore } from '@/stores/authStore';
import { useConversationStore } from '@/stores/conversationStore';
import { analyzeConversation } from '@/utils/copilotEngine';
import { FeedbackToastProvider } from '@/components/customer-portal/feedback/PostChatToasts';

describe('Agent Workspace Subsystem QA Tests', () => {
  beforeEach(() => {
    useAuthStore.getState().setRole('support_agent');
  });

  it('renders QueueSwitcher and responds to click triggers', () => {
    const mockQueues = [
      { id: 'q1', name: 'General Support', count: 5, active: true, avgWaitMins: 2, priority: 'medium' as const },
      { id: 'q2', name: 'Billing Issues', count: 3, active: false, avgWaitMins: 5, priority: 'high' as const }
    ];
    const handleSelect = vi.fn();
    
    render(<QueueSwitcher queues={mockQueues} selectedQueue="q1" onSelectQueue={handleSelect} />);
    
    expect(screen.queryAllByText('General Support').length).toBeGreaterThan(0);
    
    const billingBtn = screen.getByRole('option', { name: /Billing Issues/i });
    fireEvent.click(billingBtn);
    expect(handleSelect).toHaveBeenCalledWith('q2');
  });

  it('renders AIReplyComposer and handles AI response actions', async () => {
    const handleDraftChange = vi.fn();
    const handleSend = vi.fn();
    const handleSummarize = vi.fn();

    // Mock useIsDesktopOperational to return true
    vi.mock('@/hooks/useMediaQuery', () => ({
      useIsDesktopOperational: () => true
    }));

    render(
      <AIReplyComposer
        draftText="Draft Message"
        onChangeDraft={handleDraftChange}
        onSend={handleSend}
        suggestedReplyText="Suggested AI response text here"
        lang="en"
        onSummarize={handleSummarize}
      />
    );

    expect(screen.getByDisplayValue('Draft Message')).toBeInTheDocument();

    const applySuggestionBtn = screen.getByRole('button', { name: /Apply suggestion/i });
    fireEvent.click(applySuggestionBtn);
    expect(handleDraftChange).toHaveBeenCalledWith('Suggested AI response text hereDraft Message');

    const sendBtn = screen.getByRole('button', { name: /Send response/i }); // Sparkles send button
    fireEvent.click(sendBtn);
    expect(handleSend).toHaveBeenCalledWith('Draft Message', 'chat');
  });

  it('renders TransferModal and lets supervisors select agents', () => {
    const handleClose = vi.fn();
    const handleTransfer = vi.fn();
    const mockAgents = [
      { id: 'agent-1', name: 'Liam Bennett', role: 'agent', activeChatsCount: 2, maxChatsCount: 4 },
      { id: 'agent-2', name: 'Sarah Connor', role: 'agent', activeChatsCount: 1, maxChatsCount: 3 }
    ] as any[];

    render(
      <TransferModal
        isOpen={true}
        agents={mockAgents}
        onClose={handleClose}
        onTransfer={handleTransfer}
      />
    );

    expect(screen.getByText(/Transfer \/ Consult Agent/i)).toBeInTheDocument();
    
    const select = screen.getByLabelText(/Select Support Agent/i);
    fireEvent.change(select, { target: { value: 'agent-2' } });

    const submitBtn = screen.getByRole('button', { name: /Route case to agent/i });
    fireEvent.click(submitBtn);

    expect(handleTransfer).toHaveBeenCalledWith('agent-2', '', 'q-default');
  });

  it('renders ConferenceModal and triggers submit', () => {
    vi.useFakeTimers();
    const handleClose = vi.fn();
    const handleConference = vi.fn();

    render(
      <FeedbackToastProvider>
        <ConferenceModal
          isOpen={true}
          onClose={handleClose}
          onConference={handleConference}
        />
      </FeedbackToastProvider>
    );

    expect(screen.getByText(/Start 3-Way Conference/i)).toBeInTheDocument();
    
    const nameInput = screen.getByLabelText(/Invitee Name/i);
    const destInput = screen.getByLabelText(/Phone \/ SIP Address/i);
    
    fireEvent.change(nameInput, { target: { value: 'Farah AI Supervisor' } });
    fireEvent.change(destInput, { target: { value: '+966 50 111 2222' } });

    // Click "Queue Invitee" to add to queue
    const addBtn = screen.getByRole('button', { name: /Queue Invitee/i });
    fireEvent.click(addBtn);

    // Verify participant is in queue
    expect(screen.getByText('Farah AI Supervisor')).toBeInTheDocument();

    // Click "Dial Group Conference" to start dialing
    const submitBtn = screen.getByRole('button', { name: /Dial Group Conference/i });
    fireEvent.click(submitBtn);

    // Advance timers to complete dialing sequence
    act(() => {
      vi.runAllTimers();
    });

    expect(handleConference).toHaveBeenCalledWith([
      {
        name: 'Farah AI Supervisor',
        role: 'supervisor',
        destination: '+966 50 111 2222',
      }
    ]);
    vi.useRealTimers();
  });

  it('renders WrapupModal and records selections', () => {
    const handleClose = vi.fn();
    const handleSave = vi.fn();

    render(
      <WrapupModal
        isOpen={true}
        onClose={handleClose}
        onResolve={handleSave}
        slaStatus="within_sla"
      />
    );

    expect(screen.getByText(/Resolve Case & Disposition/i)).toBeInTheDocument();

    const categorySelect = screen.getByLabelText(/Resolution Code/i);
    fireEvent.change(categorySelect, { target: { value: 'REFUND_PROCESSED' } });

    const notesArea = screen.getByPlaceholderText(/Detail the case outcome/i);
    fireEvent.change(notesArea, { target: { value: 'Resolved billing exception' } });

    const submitBtn = screen.getByRole('button', { name: /Confirm Resolution/i });
    fireEvent.click(submitBtn);

    expect(handleSave).toHaveBeenCalledWith('REFUND_PROCESSED', 'Resolved billing exception', undefined);
  });

  it('handles attachment preview rendering and removal', () => {
    const mockAttachments = [
      { id: 'staged-1', name: 'invoice.pdf', url: '#', sizeBytes: 102400, type: 'pdf' as const },
      { id: 'staged-2', name: 'photo.png', url: '#', sizeBytes: 204800, type: 'image' as const }
    ];
    const handleRemove = vi.fn();
    
    render(
      <ComposerAttachmentPreview
        attachments={mockAttachments}
        onRemove={handleRemove}
        lang="en"
      />
    );
    
    expect(screen.getByText('invoice.pdf')).toBeInTheDocument();
    expect(screen.getByText('photo.png')).toBeInTheDocument();
    
    // Check formatted sizes
    expect(screen.getByText('100 KB')).toBeInTheDocument();
    expect(screen.getByText('200 KB')).toBeInTheDocument();
    
    const removeBtns = screen.getAllByRole('button', { name: /Remove/i });
    expect(removeBtns.length).toBe(2);
    fireEvent.click(removeBtns[0]);
    expect(handleRemove).toHaveBeenCalledWith('staged-1');
  });

  it('verifies SLA ticking and idle state transitions in the store', () => {
    // Ensure SLA starts within range
    const currentState = useConversationStore.getState();
    useConversationStore.setState({
      slaSeconds: { ...currentState.slaSeconds, 'conv-102': 5 },
      activityStates: {
        ...currentState.activityStates,
        'conv-102': { lastActivityTimestamp: Date.now() - 31050 } // inactive for 31 seconds
      }
    });

    // Tick the systems
    useConversationStore.getState().tickRealtimeSystems();

    const updatedState = useConversationStore.getState();
    expect(updatedState.slaSeconds['conv-102']).toBe(4);
    expect(updatedState.slaStates['conv-102'].timeLeft).toBe('00:04');
    expect(updatedState.slaStates['conv-102'].status).toBe('warning');
    expect(updatedState.idleStates['conv-102']).toBe(true);

    // Reset activity and verify idle banner goes away
    useConversationStore.getState().setConversationActivity('conv-102');

    expect(useConversationStore.getState().idleStates['conv-102']).toBe(false);
  });

  it('verifies presence transitions and simulated customer typing events', () => {
    useConversationStore.getState().setPresenceState('conv-102', 'away');
    expect(useConversationStore.getState().presenceStates['conv-102']).toBe('away');

    useConversationStore.getState().simulateTypingEvent('conv-102', true);
    expect(useConversationStore.getState().typingStates['conv-102']).toBe(true);
    // Typing should transition presence to online
    expect(useConversationStore.getState().presenceStates['conv-102']).toBe('online');
  });

  it('verifies copilotEngine keyword intent classification and sentiment tracking', () => {
    // Refund intent and negative sentiment
    const resultRefund = analyzeConversation([
      { id: '1', sender: 'customer', senderName: 'User', text: 'I want a refund for the broken unit', timestamp: '10:00' }
    ]);
    expect(resultRefund.intent.name).toBe('refund_request');
    expect(resultRefund.sentiment).toBe('negative');
    expect(resultRefund.suggestions.length).toBeGreaterThan(0);
    expect(resultRefund.wrapup[0].code).toBe('SAP-CRM-101');

    // Payment failure
    const resultPayment = analyzeConversation([
      { id: '1', sender: 'customer', senderName: 'User', text: 'Stripe transaction declined and payment failed', timestamp: '10:00' }
    ]);
    expect(resultPayment.intent.name).toBe('payment_failure');

    // Technical API issue
    const resultTech = analyzeConversation([
      { id: '1', sender: 'customer', senderName: 'User', text: 'Got a 403 authorization error webhook latency', timestamp: '10:00' }
    ]);
    expect(resultTech.intent.name).toBe('technical_issue');
  });

  it('verifies store actions for AI suggestions, streaming, apply/dismiss, and resets', () => {
    // Trigger suggestion generation
    act(() => {
      useConversationStore.setState({
        conversations: {
          'conv-test': {
            id: 'conv-test',
            customerName: 'Amina',
            channel: 'web',
            status: 'active',
            slaStatus: 'within_sla',
            slaDeadline: '24m',
            lastMessage: 'I need a refund',
            lastMessageTime: '10:00',
            sentiment: 'neutral',
            language: 'en',
            messages: [
              { id: 'm1', sender: 'customer', senderName: 'Amina', text: 'I need a refund for the invoice', timestamp: '10:00' }
            ]
          }
        }
      });
    });

    // Generate suggestions
    act(() => {
      useConversationStore.getState().generateCopilotSuggestions('conv-test');
    });

    // Check loading and streaming states
    let state = useConversationStore.getState();
    expect(state.copilotLoadingStates['conv-test']).toBe(true);
    expect(state.suggestionStreams['conv-test'].streaming).toBe(true);
    expect(state.intentStates['conv-test'].name).toBe('refund_request');

    // Fast-forward streaming chunks manually
    act(() => {
      useConversationStore.getState().streamSuggestionChunk('conv-test', { id: 'sug-test', text: 'Simulated suggestion text', confidence: 'high', score: 99 });
    });
    expect(useConversationStore.getState().copilotSuggestions['conv-test'].length).toBe(1);

    // Apply suggestion
    act(() => {
      useConversationStore.getState().applySuggestion('conv-test', 'sug-test');
    });
    expect(useConversationStore.getState().appliedSuggestions['conv-test']).toContain('Simulated suggestion text');

    // Dismiss suggestion
    act(() => {
      useConversationStore.getState().dismissSuggestion('conv-test', 'sug-test');
    });
    expect(useConversationStore.getState().copilotSuggestions['conv-test'].length).toBe(0);

    // Complete stream
    act(() => {
      useConversationStore.getState().completeSuggestionStream('conv-test');
    });
    expect(useConversationStore.getState().copilotLoadingStates['conv-test']).toBe(false);
    expect(useConversationStore.getState().suggestionStreams['conv-test'].completed).toBe(true);

    // Clear recommendations (resets when switching or clearing)
    act(() => {
      useConversationStore.getState().clearConversationRecommendations('conv-test');
    });
    expect(useConversationStore.getState().copilotSuggestions['conv-test']).toBeUndefined();
  });

  it('verifies transfer state lifecycle and actions in the store', () => {
    act(() => {
      useConversationStore.getState().startTransfer('conv-test-transfer', 'q-billing', 'agent-2', 'Need billing dispute help');
    });

    const state = useConversationStore.getState();
    expect(state.transferStates['conv-test-transfer'].targetQueue).toBe('q-billing');
    expect(state.transferStates['conv-test-transfer'].status).toBe('pending');
    expect(state.queueAssignments['conv-test-transfer']).toBe('q-billing');
    expect(state.auditEvents['conv-test-transfer'][0].type).toBe('transfer_started');

    act(() => {
      useConversationStore.getState().completeTransfer('conv-test-transfer');
    });
    expect(useConversationStore.getState().transferStates['conv-test-transfer'].status).toBe('completed');
    expect(useConversationStore.getState().auditEvents['conv-test-transfer'][1].type).toBe('transfer_completed');

    act(() => {
      useConversationStore.getState().cancelTransfer('conv-test-transfer');
    });
    expect(useConversationStore.getState().transferStates['conv-test-transfer'].status).toBe('cancelled');
  });

  it('verifies escalation trigger and resolution state transitions', () => {
    act(() => {
      useConversationStore.getState().triggerEscalation('conv-test-escalate', 'sla_breach');
    });

    const state = useConversationStore.getState();
    expect(state.escalationStates['conv-test-escalate'].status).toBe('escalated');
    expect(state.escalationStates['conv-test-escalate'].type).toBe('sla_breach');
    expect(state.supervisorRecommendations['conv-test-escalate'].length).toBeGreaterThan(0);
    expect(state.auditEvents['conv-test-escalate'][0].type).toBe('escalation_triggered');

    act(() => {
      useConversationStore.getState().resolveEscalation('conv-test-escalate');
    });
    expect(useConversationStore.getState().escalationStates['conv-test-escalate'].status).toBe('resolved');
  });

  it('verifies conference participant management and supervisor consults', () => {
    const p1 = { id: 'part-1', name: 'Nadia Supervisor', role: 'supervisor' as const, joinedAt: '12:00' };
    const p2 = { id: 'part-2', name: 'Tariq Expert', role: 'agent' as const, joinedAt: '12:01' };

    act(() => {
      useConversationStore.getState().startConference('conv-test-conf', [p1, p2]);
    });

    let state = useConversationStore.getState();
    expect(state.conferenceStates['conv-test-conf'].status).toBe('active');
    expect(state.conferenceStates['conv-test-conf'].participants.length).toBe(2);

    act(() => {
      useConversationStore.getState().removeConferenceParticipant('conv-test-conf', 'part-2');
    });
    state = useConversationStore.getState();
    expect(state.conferenceStates['conv-test-conf'].participants.length).toBe(1);
    expect(state.conferenceStates['conv-test-conf'].participants[0].name).toBe('Nadia Supervisor');

    act(() => {
      useConversationStore.getState().endConference('conv-test-conf');
    });
    expect(useConversationStore.getState().conferenceStates['conv-test-conf'].status).toBe('ended');

    act(() => {
      useConversationStore.getState().startSupervisorConsult('conv-test-conf', 'super-1', 'Notes context');
    });
    expect(useConversationStore.getState().consultationStates['conv-test-conf'].status).toBe('consulting');

    act(() => {
      useConversationStore.getState().endSupervisorConsult('conv-test-conf');
    });
    expect(useConversationStore.getState().consultationStates['conv-test-conf'].status).toBe('ended');
  });
});
