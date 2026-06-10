import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@/test-utils';
import { QueueSwitcher } from '@/components/agent-workspace/QueueSwitcher';
import { AIReplyComposer } from '@/components/agent-workspace/AIReplyComposer';
import { AICopilotPanel } from '@/components/agent-workspace/AICopilotPanel';
import { ConferenceModal } from '@/components/agent-workspace/ConferenceModal';
import { TransferModal } from '@/components/agent-workspace/TransferModal';
import { WrapupModal } from '@/components/agent-workspace/WrapupModal';
import { WrapupCodesWorkspace } from '@/components/agent-workspace/WrapupCodesWorkspace';
import { ComposerAttachmentPreview } from '@/components/agent-workspace/ComposerAttachmentPreview';
import { HoldMusicSelector } from '@/components/agent-workspace/HoldMusicSelector';
import { NoteComposer } from '@/components/agent-workspace/NoteComposer';
import { ConsultDrawer } from '@/components/agent-workspace/ConsultDrawer';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useConversationStore } from '@/stores/conversationStore';
import { analyzeConversation } from '@/utils/copilotEngine';
import { FeedbackToastProvider } from '@/components/customer-portal/feedback/PostChatToasts';
import AgentWorkspaceLayout from '@/components/agent-workspace/AgentWorkspaceLayout';

describe('Agent Workspace Subsystem QA Tests', () => {
  beforeEach(() => {
    useAuthStore.getState().setRole('support_agent');
    useUIStore.getState().setLang('en');
    if (typeof window !== 'undefined') {
      window.HTMLElement.prototype.scrollIntoView = vi.fn();
    }
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

  it('renders HoldMusicSelector and responds to user play/pause and track change interactions', () => {
    const { rerender } = render(<HoldMusicSelector sentiment="neutral" lang="en" isHold={true} />);
    
    expect(screen.getByText(/Conversation Session on Hold/i)).toBeInTheDocument();
    expect(screen.getByText(/Recommendation: Neutral Jazz track active/i)).toBeInTheDocument();

    // Play button
    const playBtn = screen.getByRole('button', { name: /Play hold music preview/i });
    fireEvent.click(playBtn);
    expect(screen.getByRole('button', { name: /Pause hold music preview/i })).toBeInTheDocument();

    const trackSelect = screen.getByLabelText(/Hold Music Track/i);
    fireEvent.change(trackSelect, { target: { value: 't-calm' } });
    expect(screen.getByRole('button', { name: /Pause hold music preview/i })).toBeInTheDocument();

    // Rerender with negative sentiment
    rerender(<HoldMusicSelector sentiment="negative" lang="en" isHold={true} />);
    expect(screen.getByText(/Calm Track suggested/i)).toBeInTheDocument();

    // Rerender with isHold = false
    rerender(<HoldMusicSelector sentiment="negative" lang="en" isHold={false} />);
    expect(screen.queryByText(/Conversation Session on Hold/i)).not.toBeInTheDocument();
  });

  it('renders NoteComposer and handles markdown options and collaborator mentions', async () => {
    const handleSend = vi.fn().mockResolvedValue(undefined);
    render(<NoteComposer onSend={handleSend} isRtl={false} lang="en" />);

    const textarea = screen.getByPlaceholderText(/Log note for team.../i);
    fireEvent.change(textarea, { target: { value: 'Discussing billing dispute with @' } });

    // Mentions dropdown should appear
    expect(screen.getByRole('listbox', { name: /Collaborators roster for mention/i })).toBeInTheDocument();
    
    const option = screen.getByRole('option', { name: /Sarah Jenkins/i });
    fireEvent.click(option);

    // Verify textarea gets updated with the mention
    expect(textarea).toHaveValue('Discussing billing dispute with @Sarah Jenkins ');

    // Toggle note visibility
    const visibilityBtn = screen.getByRole('button', { name: /Internal Only/i });
    fireEvent.click(visibilityBtn);
    expect(screen.getByRole('button', { name: /Public Timeline/i })).toBeInTheDocument();

    // Submit note
    const submitBtn = screen.getByRole('button', { name: /Save Note/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleSend).toHaveBeenCalledWith(
        'Discussing billing dispute with @Sarah Jenkins ',
        'public'
      );
    });
  });

  it('renders ConsultDrawer and simulates consult/warm-transfer flows', async () => {
    vi.useFakeTimers();
    const handleTransferSuccess = vi.fn();
    const handleClose = vi.fn();

    render(
      <FeedbackToastProvider>
        <ConsultDrawer
          isOpen={true}
          onClose={handleClose}
          lang="en"
          onTransferSuccess={handleTransferSuccess}
        />
      </FeedbackToastProvider>
    );

    expect(screen.getByText(/Consult & Warm Transfer/i)).toBeInTheDocument();

    // Start consultation with Sarah Jenkins (who is busy, but online)
    const consultBtn = screen.getAllByRole('button', { name: /Consult/i })[1];
    fireEvent.click(consultBtn);

    // Connection dial logs should show up
    expect(screen.getByText(/Connecting Consultation Line/i)).toBeInTheDocument();

    // Fast-forward timers to connection
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Chat interface should open
    expect(screen.getByPlaceholderText(/Consult with supervisor/i)).toBeInTheDocument();

    // Send a message
    const chatInput = screen.getByPlaceholderText(/Consult with supervisor/i);
    const form = chatInput.closest('form');
    fireEvent.change(chatInput, { target: { value: 'Need help with refund bypass' } });
    fireEvent.submit(form!);

    expect(screen.getByText('Need help with refund bypass')).toBeInTheDocument();

    // Fast-forward peer response
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    expect(screen.getByText(/Verified wire audit logs/i)).toBeInTheDocument();

    // Trigger warm transfer
    const warmTransferBtn = screen.getByRole('button', { name: /Warm Transfer/i });
    fireEvent.click(warmTransferBtn);

    expect(screen.getByText(/Reassigning queue ticket routing/i)).toBeInTheDocument();

    // Complete warm transfer animation
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(handleTransferSuccess).toHaveBeenCalledWith('Sarah Jenkins', 'q-vip');
    vi.useRealTimers();
  });

  it('renders AIReplyComposer with advanced controls and compliance indicators', async () => {
    const handleDraftChange = vi.fn();
    const handleSend = vi.fn();
    const handleSummarize = vi.fn();

    const { rerender } = render(
      <AIReplyComposer
        draftText="Check our site"
        onChangeDraft={handleDraftChange}
        onSend={handleSend}
        suggestedReplyText="Suggested answer"
        lang="en"
        onSummarize={handleSummarize}
      />
    );

    // Speed selection control
    const speedSelect = screen.getByRole('combobox', { name: /Streaming speed/i });
    expect(speedSelect).toHaveValue('fast');
    fireEvent.change(speedSelect, { target: { value: 'normal' } });
    expect(speedSelect).toHaveValue('normal');

    // PCI/PII Scan passed initially
    expect(screen.getByText('PCI/PII Scan: PASSED')).toBeInTheDocument();

    // Lock/Unlock editor
    const lockBtn = screen.getByTitle('Lock Editor (PCI/Compliance Mode)');
    fireEvent.click(lockBtn);
    expect(screen.getByTitle('Unlock Editor')).toBeInTheDocument();
    
    // Textarea should be read-only now
    const textareas = screen.getAllByRole('textbox');
    expect(textareas[0]).toHaveAttribute('readonly');

    // Unlock
    fireEvent.click(screen.getByTitle('Unlock Editor'));
    expect(screen.getByTitle('Lock Editor (PCI/Compliance Mode)')).toBeInTheDocument();

    // Rerender with sensitive SSN to trigger PII Warning
    rerender(
      <AIReplyComposer
        draftText="SSN number is 000-12-3456"
        onChangeDraft={handleDraftChange}
        onSend={handleSend}
        suggestedReplyText="Suggested answer"
        lang="en"
        onSummarize={handleSummarize}
      />
    );

    expect(screen.getByText(/PII Warning: Sensitive Card\/SSN detected/i)).toBeInTheDocument();

    // Mask PII button click
    const maskBtn = screen.getByRole('button', { name: /Mask PII/i });
    fireEvent.click(maskBtn);
    expect(handleDraftChange).toHaveBeenCalledWith('SSN number is ***-**-3456');
  });

  it('renders AICopilotPanel with advanced zones and handles action triggers', async () => {
    const handleApplyReply = vi.fn();
    const handleSummarize = vi.fn();

    const mockChat: any = {
      id: 'conv-test-copilot',
      customerName: 'Alice Johnson',
      channel: 'web',
      lastMessage: 'Help with refund request dispute',
      lastMessageTime: '10:00 AM',
      status: 'active',
      sentiment: 'negative',
      slaStatus: 'warning',
      slaDeadline: '10:15 AM',
      language: 'en',
      messages: [
        { id: 'm1', sender: 'customer', senderName: 'Alice Johnson', text: 'Help with refund request dispute', timestamp: '10:00 AM' }
      ]
    };

    // Populate store
    act(() => {
      useConversationStore.setState({
        conversations: {
          ...useConversationStore.getState().conversations,
          'conv-test-copilot': mockChat
        }
      });
      // Trigger suggestion generation
      useConversationStore.getState().generateCopilotSuggestions('conv-test-copilot');
    });

    render(
      <AICopilotPanel
        activeChat={mockChat}
        lang="en"
        onApplySuggestedReply={handleApplyReply}
        onSummarize={handleSummarize}
      />
    );

    // Verify NLU Intent classification chips are rendered
    expect(screen.getByText(/refund_request/i)).toBeInTheDocument();
    
    // Verify Customer Risk Intelligence strip
    expect(screen.getByText(/Customer Risk Intelligence/i)).toBeInTheDocument();
    expect(screen.getByText('1.2/5')).toBeInTheDocument(); // CSAT Predict
    expect(screen.getByText('85%')).toBeInTheDocument(); // Churn Risk
    expect(screen.getByText('90%')).toBeInTheDocument(); // SLA Breach Prob

    // Verify AI Activity Timeline completed events
    expect(screen.getByText(/Intent classified/i)).toBeInTheDocument();
    expect(screen.getByText(/Compliance scan complete/i)).toBeInTheDocument();

    // Verify Live AI Recommendation Card
    expect(screen.getByText(/Escalate to Tier 2 Billing/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Billing Operations/i).length).toBeGreaterThan(0);

    // Verify suggested next action click
    const refundActionBtn = screen.getByRole('button', { name: /Send refund policy/i });
    fireEvent.click(refundActionBtn);
    expect(handleApplyReply).toHaveBeenCalled();
  });

  it('renders WrapupCodesWorkspace and handles resolution workflow changes', async () => {
    // 1. Render component
    render(<WrapupCodesWorkspace />);

    // 2. Verify Analytics strip components
    expect(screen.getByText(/Avg Resolution Time/i)).toBeInTheDocument();
    expect(screen.getByText(/^AI Confidence$/i)).toBeInTheDocument();
    expect(screen.getByText(/Escalation Prob/i)).toBeInTheDocument();

    // 3. Verify AI Assistant recommendations
    expect(screen.getByText(/AI Resolution & Disposition Assistant/i)).toBeInTheDocument();
    expect(screen.getAllByText('SAP-CRM-305').length).toBeGreaterThan(0);

    // 4. Verify Active Case resolution workspace notes input
    const notesTextarea = screen.getByLabelText(/Internal Wrap-up Notes/i);
    fireEvent.change(notesTextarea, { target: { value: 'My custom wrapup notes details' } });
    expect(notesTextarea).toHaveValue('My custom wrapup notes details');

    // 5. Verify Checklist interaction
    const identityCheck = screen.getByLabelText(/Customer Identity Verified/i);
    fireEvent.click(identityCheck);
    expect(identityCheck).toBeChecked();

    // 6. Verify Table searches & category filters
    const searchInput = screen.getByPlaceholderText(/Search CRM codes or categories/i);
    fireEvent.change(searchInput, { target: { value: 'SAP-CRM-204' } });
    expect(screen.getAllByText('SIP Trunk Dropout').length).toBe(2);
    expect(screen.getAllByText('Billing Mismatch').length).toBe(1);
  });

  it('runs wrap-up audit timeline log updates', async () => {
    render(<WrapupCodesWorkspace />);

    // Apply AI recommendation and verify store updates & audit logs
    const applyBtn = screen.getByRole('button', { name: /Apply AI Recommendation/i });
    fireEvent.click(applyBtn);

    // Wait for the action to complete (and trigger appendWrapupAuditEvent)
    await waitFor(() => {
      const state = useConversationStore.getState();
      const workflowState = state.resolutionWorkflows['conv-102'];
      expect(workflowState.explanation).toContain('SAP-CRM-305');
    });

    // Verify audit log timeline has entry
    expect(screen.getByText(/AI Recommendation applied: code SAP-CRM-305/i)).toBeInTheDocument();
  });

  it('AgentWorkspaceLayout - view ticket details opens and closes custom modal', async () => {
    render(
      <FeedbackToastProvider>
        <AgentWorkspaceLayout activeSubScreen="tickets" />
      </FeedbackToastProvider>
    );

    // Eye button for TIC-2033 (there are multiple eye buttons, let's get the first one)
    const viewButtons = screen.getAllByTitle(/View Details/i);
    expect(viewButtons.length).toBeGreaterThan(0);

    // Click view details
    fireEvent.click(viewButtons[0]);

    // Check modal title is rendered
    expect(screen.getByText('Ticket Details')).toBeInTheDocument();
    // Check ticket title in modal matches seed data for TIC-2033
    expect(screen.getAllByText('Double charge dispute billing error').length).toBeGreaterThan(1);

    // Click close button in modal
    const closeBtn = screen.getByLabelText('Close dialog');
    fireEvent.click(closeBtn);

    // Verify modal is closed
    await waitFor(() => {
      expect(screen.queryByText('Ticket Details')).not.toBeInTheDocument();
    });
  });

  it('AgentWorkspaceLayout - supervisor join session triggers toast notification instead of alert', async () => {
    // Set role to supervisor or anything non-agent so supervisor panel renders
    useAuthStore.getState().setRole('supervisor');

    render(
      <FeedbackToastProvider>
        <AgentWorkspaceLayout activeSubScreen="agent_dashboard" />
      </FeedbackToastProvider>
    );

    const joinBtn = screen.getByRole('button', { name: /Join Active Session/i });
    fireEvent.click(joinBtn);

    // Verify toast is triggered
    expect(screen.getByText('Supervisor Joined')).toBeInTheDocument();
    expect(screen.getByText('Supervisor joined active session. 3-Way dialog initialized.')).toBeInTheDocument();
  });

  it('AgentWorkspaceLayout - AI Copilot apply suggestion and Reply Composer send response trigger toasts', async () => {
    // 1. Test AI Copilot panel trigger
    render(
      <FeedbackToastProvider>
        <AgentWorkspaceLayout activeSubScreen="copilot" />
      </FeedbackToastProvider>
    );

    const suggestBtn = screen.getByRole('button', { name: /Send refund policy/i });
    fireEvent.click(suggestBtn);

    // Verify toast is triggered
    expect(screen.getByText('Reply Applied')).toBeInTheDocument();

    // 2. Test Smart Response composer send trigger
    render(
      <FeedbackToastProvider>
        <AgentWorkspaceLayout activeSubScreen="suggested_replies" />
      </FeedbackToastProvider>
    );

    const sendBtn = screen.getByRole('button', { name: /Send response/i });
    fireEvent.click(sendBtn);

    // Verify toast is triggered
    expect(screen.getByText('Response Sent')).toBeInTheDocument();
  });
});

