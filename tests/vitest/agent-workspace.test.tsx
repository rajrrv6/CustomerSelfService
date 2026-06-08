import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test-utils';
import { QueueSwitcher } from '@/components/agent-workspace/QueueSwitcher';
import { AIReplyComposer } from '@/components/agent-workspace/AIReplyComposer';
import { ConferenceModal } from '@/components/agent-workspace/ConferenceModal';
import { TransferModal } from '@/components/agent-workspace/TransferModal';
import { WrapupModal } from '@/components/agent-workspace/WrapupModal';
import { useAuthStore } from '@/stores/authStore';

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
    
    const billingBtn = screen.getByRole('button', { name: /Billing Issues/i });
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
    expect(handleDraftChange).toHaveBeenCalledWith('Suggested AI response text here');

    const sendBtn = screen.getByRole('button', { name: '' }); // Sparkles send button
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
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'agent-2' } });

    const submitBtn = screen.getByRole('button', { name: /Transfer Case/i });
    fireEvent.click(submitBtn);

    expect(handleTransfer).toHaveBeenCalledWith('agent-2', '');
  });

  it('renders ConferenceModal and triggers submit', () => {
    const handleClose = vi.fn();
    const handleConference = vi.fn();

    render(
      <ConferenceModal
        isOpen={true}
        onClose={handleClose}
        onConference={handleConference}
      />
    );

    expect(screen.getByText(/Start 3-Way Conference/i)).toBeInTheDocument();
    
    const nameInput = screen.getByLabelText(/Participant Name/i);
    const destInput = screen.getByLabelText(/Destination Phone/i);
    
    fireEvent.change(nameInput, { target: { value: 'Farah AI Supervisor' } });
    fireEvent.change(destInput, { target: { value: '+966 50 111 2222' } });

    const submitBtn = screen.getByRole('button', { name: /Dial Conference/i });
    fireEvent.click(submitBtn);

    expect(handleConference).toHaveBeenCalledWith('Farah AI Supervisor', '+966 50 111 2222');
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
});
