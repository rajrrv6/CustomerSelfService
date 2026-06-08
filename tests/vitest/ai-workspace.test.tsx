import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@/test-utils';
import { AIWorkspace } from '@/components/customer-portal/ai-copilot/AIWorkspace';

describe('AIWorkspace Component QA Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it('renders privacy consent modal on first use and hides after acknowledgment', async () => {
    render(<AIWorkspace />);
    
    // Privacy consent modal should be visible
    expect(screen.getByText(/Privacy & LLM Safety Consent/i)).toBeInTheDocument();
    
    const consentBtn = screen.getByRole('button', { name: /Acknowledge & Consent/i });
    fireEvent.click(consentBtn);
    
    // Consent modal should be closed
    expect(screen.queryByText(/Privacy & LLM Safety Consent/i)).not.toBeInTheDocument();
    expect(localStorage.getItem('ai-privacy-consented')).toBe('true');
  }, 20000);

  it('shows pinned and recent conversations in the sidebar and supports search filtering', () => {
    localStorage.setItem('ai-privacy-consented', 'true');
    render(<AIWorkspace />);

    // Check conversation sidebar headings
    expect(screen.getByText(/Pinned/i)).toBeInTheDocument();
    expect(screen.getByText(/Recent Threads/i)).toBeInTheDocument();

    // Check pre-populated conversations are in the list (using getAllByText since title is also in header)
    expect(screen.getAllByText(/SaaS Subscription Refund Request/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/API Auth Credentials Settings/i).length).toBeGreaterThan(0);

    // Filter by query "SaaS"
    const searchInput = screen.getByPlaceholderText(/Search threads.../i);
    fireEvent.change(searchInput, { target: { value: 'SaaS' } });

    expect(screen.getAllByText(/SaaS Subscription Refund Request/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/API Auth Credentials Settings/i)).not.toBeInTheDocument();
  });

  it('toggles AI Trace panel on header button click', () => {
    localStorage.setItem('ai-privacy-consented', 'true');
    render(<AIWorkspace />);

    // Initially, trace console is closed
    expect(screen.queryByText(/NLU Tool Trace Console/i)).not.toBeInTheDocument();

    const traceToggleBtn = screen.getByRole('button', { name: /AI Trace Logs/i });
    fireEvent.click(traceToggleBtn);

    // Now trace console should be visible
    expect(screen.getByText(/NLU Tool Trace Console/i)).toBeInTheDocument();
    expect(screen.getByText(/MATCH_INTENT: "refund_billing"/i)).toBeInTheDocument();

    // Toggle off
    fireEvent.click(traceToggleBtn);
    expect(screen.queryByText(/NLU Tool Trace Console/i)).not.toBeInTheDocument();
  });

  it('opens and closes export modal with mock progress', () => {
    localStorage.setItem('ai-privacy-consented', 'true');
    vi.useFakeTimers();
    render(<AIWorkspace />);

    // Export button in header
    const exportBtn = screen.getByTitle(/Export thread/i);
    fireEvent.click(exportBtn);

    // Export modal should show up
    expect(screen.getByText(/Export Chat Thread/i)).toBeInTheDocument();

    const submitExportBtn = screen.getByRole('button', { name: /^Export$/i });
    fireEvent.click(submitExportBtn);

    // Should show exporting progress (starts at 10%)
    expect(screen.getByText(/10% generated/i)).toBeInTheDocument();

    // Advance timers step by step to avoid infinite loop checks
    for (let i = 0; i < 15; i++) {
      act(() => {
        vi.advanceTimersByTime(150);
      });
    }

    // Modal should be closed now after success
    expect(screen.queryByText(/Export Chat Thread/i)).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  it('opens share modal and generates link', () => {
    localStorage.setItem('ai-privacy-consented', 'true');
    render(<AIWorkspace />);

    const shareBtn = screen.getByTitle(/Share Conversation/i);
    fireEvent.click(shareBtn);

    expect(screen.getByText(/Share Conversation/i)).toBeInTheDocument();

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '7d' } });

    const generateBtn = screen.getByRole('button', { name: /^Generate$/i });
    
    // Mock navigator.clipboard
    const mockClipboard = {
      writeText: vi.fn().mockImplementation(() => Promise.resolve())
    };
    vi.stubGlobal('navigator', { clipboard: mockClipboard });

    fireEvent.click(generateBtn);

    expect(mockClipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('exp=7d'));
    expect(screen.queryByText(/Share Conversation/i)).not.toBeInTheDocument();
    
    vi.unstubAllGlobals();
  });

  it('simulates token streaming response when user sends a message', () => {
    localStorage.setItem('ai-privacy-consented', 'true');
    vi.useFakeTimers();
    render(<AIWorkspace />);

    const textarea = screen.getByPlaceholderText(/Ask a query or type '\/' for commands.../i);
    fireEvent.change(textarea, { target: { value: 'How do I cancel my subscription?' } });

    const sendBtn = screen.getByRole('button', { name: /Send message/i });
    fireEvent.click(sendBtn);

    // User message should appear in chat
    expect(screen.getByText('How do I cancel my subscription?')).toBeInTheDocument();

    // Advance timers by 500ms to trigger simulateAiResponse and set isStreaming to true
    act(() => {
      vi.advanceTimersByTime(500);
    });


    // RAG loading status should be visible
    expect(screen.getByText(/Querying RAG vectors.../i)).toBeInTheDocument();

    // Advance timer step by step to trigger response streaming and complete it
    for (let i = 0; i < 40; i++) {
      act(() => {
        vi.advanceTimersByTime(45);
      });
    }


    // RAG loading status should disappear
    expect(screen.queryByText(/Querying RAG vectors.../i)).not.toBeInTheDocument();

    // The simulated AI response should be rendered in the document
    expect(screen.getByText(/I have processed your query/i)).toBeInTheDocument();

    vi.useRealTimers();
  }, 20000);

  it('toggles voice listening modal on push-to-talk microphone trigger', () => {
    localStorage.setItem('ai-privacy-consented', 'true');
    render(<AIWorkspace />);

    const voiceBtn = screen.getByTitle(/Push-to-talk microphone/i);
    fireEvent.click(voiceBtn);

    // Listening modal should show up
    expect(screen.getByText(/Farah Voice Input active.../i)).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);

    // Modal should close
    expect(screen.queryByText(/Farah Voice Input active.../i)).not.toBeInTheDocument();
  });
});
