import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render as baseRender, screen, fireEvent, waitFor } from '@/test-utils';
import { PublicBotWidget } from '@/components/dashboard/PublicBotWidget';
import { LiveChatOverlay } from '@/components/customer-portal/live-chat/LiveChatOverlay';
import { SubmitTicketPage } from '@/components/customer-portal/tickets/SubmitTicketPage';
import { FeedbackToastProvider } from '@/components/customer-portal/feedback/PostChatToasts';

// Wrap tests with FeedbackToastProvider context
const render = (ui: React.ReactElement, options?: any) => {
  return baseRender(
    <FeedbackToastProvider>
      {ui}
    </FeedbackToastProvider>,
    options
  );
};

describe('Task 2 — Guest Chat Context Preservation Tests', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
    
    // Mock window.location using Object.defineProperty
    Object.defineProperty(window, 'location', {
      value: {
        href: '',
        assign: vi.fn(),
        replace: vi.fn()
      },
      writable: true,
      configurable: true
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true
    });
  });

  describe('1. PublicBotWidget - Guest Chat Serialization', () => {
    it('saves guest chat messages to sessionStorage when messages update', async () => {
      render(<PublicBotWidget />);

      // Verify the default bot greeting is rendered
      expect(screen.getByText(/Hi! I am Farah. How can I help you today?/i)).toBeInTheDocument();

      // Check sessionStorage immediately after render (should contain the default message)
      const storedHistory = sessionStorage.getItem('mPaaS_guest_chat_history');
      expect(storedHistory).not.toBeNull();
      const parsed = JSON.parse(storedHistory!);
      expect(parsed[0].sender).toBe('bot');

      // Send a user message
      const input = screen.getByPlaceholderText(/Type a message.../i);
      fireEvent.change(input, { target: { value: 'What is the standard SaaS pricing?' } });
      
      const sendBtn = screen.getByRole('button', {
        name: '' // The send button has a Send icon but no text, checking for icon SVG
      });
      // Fallback to finding button or pressing enter
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      // Verify user message appears in UI
      expect(screen.getByText('What is the standard SaaS pricing?')).toBeInTheDocument();

      // Wait a bit for the effect to sync to sessionStorage
      await waitFor(() => {
        const updatedHistory = sessionStorage.getItem('mPaaS_guest_chat_history');
        expect(updatedHistory).toContain('What is the standard SaaS pricing?');
      });
    });

    it('sets the escalation flag and redirects when File Support Ticket is clicked', () => {
      render(<PublicBotWidget />);

      const fileTicketBtn = screen.getByRole('button', { name: /File Support Ticket/i });
      fireEvent.click(fileTicketBtn);

      // Verify escalation flag is set
      expect(sessionStorage.getItem('mPaaS_guest_chat_escalated')).toBe('true');

      // Verify redirection target includes safety redirect parameters
      expect(window.location.href).toContain('/login?redirect=');
      expect(window.location.href).toContain(encodeURIComponent('/portal/home?action=submit_ticket'));
    });
  });

  describe('2. LiveChatOverlay - Authenticated Chat Merge', () => {
    const defaultMessages = [
      { sender: 'bot' as const, text: 'Hi! I am Farah. How can I help you today?', time: '15:00' }
    ];

    it('merges guest chat history on mount and purges the sessionStorage key', () => {
      const mockGuestHistory = [
        { sender: 'bot', text: 'Hi! I am Farah.', time: '14:30' },
        { sender: 'user', text: 'How do I request a refund?', time: '14:31' }
      ];
      sessionStorage.setItem('mPaaS_guest_chat_history', JSON.stringify(mockGuestHistory));

      const setChatMessagesMock = vi.fn();
      
      render(
        <LiveChatOverlay
          chatOpen={true}
          setChatOpen={vi.fn()}
          chatInput=""
          setChatInput={vi.fn()}
          chatLanguage="en"
          setChatLanguage={vi.fn()}
          chatMessages={defaultMessages}
          setChatMessages={setChatMessagesMock}
          chatStatus="idle"
          setChatStatus={vi.fn()}
          queuePos={0}
          setQueuePos={vi.fn()}
          surveyCsat={0}
          setSurveyCsat={vi.fn()}
          surveyNps={0}
          setSurveyNps={vi.fn()}
          transcriptEmail=""
          setTranscriptEmail={vi.fn()}
          handleSendChatMessage={vi.fn()}
        />
      );

      // Verify update callback was called to merge messages
      expect(setChatMessagesMock).toHaveBeenCalled();
      const updateFn = setChatMessagesMock.mock.calls[0][0];
      const merged = updateFn(defaultMessages);

      // Check order of merged messages: Guest history, then separator, then authenticated greeting (excluding duplicate greeting if filtered)
      expect(merged[0].text).toBe('Hi! I am Farah.');
      expect(merged[1].text).toBe('How do I request a refund?');
      expect(merged[2].text).toContain('Previous Guest Session History');
      
      // Verify sessionStorage key was removed
      expect(sessionStorage.getItem('mPaaS_guest_chat_history')).toBeNull();
    });

    it('does not merge if no guest chat history is in sessionStorage', () => {
      const setChatMessagesMock = vi.fn();

      render(
        <LiveChatOverlay
          chatOpen={true}
          setChatOpen={vi.fn()}
          chatInput=""
          setChatInput={vi.fn()}
          chatLanguage="en"
          setChatLanguage={vi.fn()}
          chatMessages={defaultMessages}
          setChatMessages={setChatMessagesMock}
          chatStatus="idle"
          setChatStatus={vi.fn()}
          queuePos={0}
          setQueuePos={vi.fn()}
          surveyCsat={0}
          setSurveyCsat={vi.fn()}
          surveyNps={0}
          setSurveyNps={vi.fn()}
          transcriptEmail=""
          setTranscriptEmail={vi.fn()}
          handleSendChatMessage={vi.fn()}
        />
      );

      expect(setChatMessagesMock).not.toHaveBeenCalled();
    });
  });

  describe('3. SubmitTicketPage - Ticket Prefill Continuity', () => {
    const mockGuestHistory = [
      { sender: 'bot', text: 'Hi! How can I help you?', time: '14:30' },
      { sender: 'user', text: 'refund eligibility', time: '14:31' },
      { sender: 'user', text: 'subscription cancellation', time: '14:32' }
    ];

    it('pre-fills the ticket description if escalation is true and description is empty', () => {
      sessionStorage.setItem('mPaaS_guest_chat_escalated', 'true');
      sessionStorage.setItem('mPaaS_guest_chat_history', JSON.stringify(mockGuestHistory));

      const setTicketDescMock = vi.fn();

      render(
        <SubmitTicketPage
          ticketTitle=""
          setTicketTitle={vi.fn()}
          ticketCategory="Billing & Payments"
          setTicketCategory={vi.fn()}
          ticketPriority="medium"
          setTicketPriority={vi.fn()}
          ticketDesc=""
          setTicketDesc={setTicketDescMock}
          handleTicketSubmit={vi.fn()}
          onBack={vi.fn()}
        />
      );

      // Verify it prefilled with summarised guest context
      expect(setTicketDescMock).toHaveBeenCalled();
      const prefillValue = setTicketDescMock.mock.calls[0][0];
      expect(prefillValue).toContain('[Guest Session Context]:');
      expect(prefillValue).toContain('refund eligibility');
      expect(prefillValue).toContain('subscription cancellation');

      // Verify the escalation flag is cleaned up
      expect(sessionStorage.getItem('mPaaS_guest_chat_escalated')).toBeNull();
    });

    it('does not overwrite existing user input in description', () => {
      sessionStorage.setItem('mPaaS_guest_chat_escalated', 'true');
      sessionStorage.setItem('mPaaS_guest_chat_history', JSON.stringify(mockGuestHistory));

      const setTicketDescMock = vi.fn();

      render(
        <SubmitTicketPage
          ticketTitle=""
          setTicketTitle={vi.fn()}
          ticketCategory="Billing & Payments"
          setTicketCategory={vi.fn()}
          ticketPriority="medium"
          setTicketPriority={vi.fn()}
          ticketDesc="User already typed some details."
          setTicketDesc={setTicketDescMock}
          handleTicketSubmit={vi.fn()}
          onBack={vi.fn()}
        />
      );

      // Should not call setTicketDesc since ticketDesc is not empty
      expect(setTicketDescMock).not.toHaveBeenCalled();
      expect(sessionStorage.getItem('mPaaS_guest_chat_escalated')).toBeNull();
    });

    it('does not pre-fill if the escalation flag is not set', () => {
      sessionStorage.setItem('mPaaS_guest_chat_history', JSON.stringify(mockGuestHistory));

      const setTicketDescMock = vi.fn();

      render(
        <SubmitTicketPage
          ticketTitle=""
          setTicketTitle={vi.fn()}
          ticketCategory="Billing & Payments"
          setTicketCategory={vi.fn()}
          ticketPriority="medium"
          setTicketPriority={vi.fn()}
          ticketDesc=""
          setTicketDesc={setTicketDescMock}
          handleTicketSubmit={vi.fn()}
          onBack={vi.fn()}
        />
      );

      expect(setTicketDescMock).not.toHaveBeenCalled();
    });
  });
});
