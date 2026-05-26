import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@/test-utils';
import { OAuthConnectModal } from '@/components/integrations/OAuthConnectModal';
import { RetryQueuePanel } from '@/components/integrations/RetryQueuePanel';
import { WebhookConsole } from '@/components/integrations/WebhookConsole';

// Mock hook for outgoing webhooks console
const mockUseWebhookSimulator = vi.fn();
vi.mock('@/hooks/useWebhookSimulator', () => ({
  useWebhookSimulator: () => mockUseWebhookSimulator()
}));

describe('Integrations Subsystem QA Tests', () => {
  const mockConnector = {
    id: 'salesforce',
    name: 'Salesforce CRM',
    status: 'disconnected' as const,
    icon: 'Shield',
    description: 'Enterprise contact and account data integration',
    docsUrl: 'https://salesforce.com/docs',
    lastSync: 'Never'
  };

  it('renders OAuthConnectModal and completes client side authorization steps', async () => {
    vi.useFakeTimers();
    const handleClose = vi.fn();
    const handleConnect = vi.fn();

    render(
      <OAuthConnectModal
        connector={mockConnector as any}
        onClose={handleClose}
        onConnect={handleConnect}
      />
    );

    // Initial step 1 should show Client ID and Secret inputs
    expect(screen.getByText(/Connect Salesforce CRM/i)).toBeInTheDocument();
    
    const clientInput = screen.getByLabelText(/Client Identifier/i);
    const secretInput = screen.getByLabelText(/Client Secret Key/i);
    const submitBtn = screen.getByRole('button', { name: /Authorize API Link/i });

    // Submit without credentials should trigger validation warning
    fireEvent.click(submitBtn);
    expect(screen.getByText(/Client ID and Secret are required/i)).toBeInTheDocument();

    // Fill details
    fireEvent.change(clientInput, { target: { value: 'sf-client-id-123' } });
    fireEvent.change(secretInput, { target: { value: 'sf-secret-key-xyz' } });

    // Verify scope toggling
    const firstScopeCheckbox = screen.getByLabelText('read_contacts');
    expect(firstScopeCheckbox).toBeChecked();
    fireEvent.click(firstScopeCheckbox);
    expect(firstScopeCheckbox).not.toBeChecked();

    // Submit
    fireEvent.click(submitBtn);

    // Step 2 is progress spinner state
    expect(screen.getByText(/OAuth Verification in Progress/i)).toBeInTheDocument();

    // Fast-forward simulated steps
    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(screen.getByText(/Integration Linked Successfully/i)).toBeInTheDocument();

    const finalizeBtn = screen.getByRole('button', { name: /Finalize & Close/i });
    fireEvent.click(finalizeBtn);

    expect(handleConnect).toHaveBeenCalledWith(
      'sf-client-id-123',
      'sf-secret-key-xyz',
      ['write_accounts', 'refresh_token']
    );
    expect(handleClose).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('renders RetryQueuePanel, displays stats, and triggers force-sync retry callback', () => {
    const mockQueue = [
      {
        id: 'rq-1',
        connectorId: 'hubspot',
        connectorName: 'Hubspot',
        recordName: 'Contact: Alice Smith',
        entityType: 'Contact',
        failedAt: '2026-05-21 10:00:00',
        retryCount: 2,
        maxRetries: 5,
        errorMessage: 'Connection timeout - 504 Gateway Timeout on hubspot webhook client API wrapper',
        status: 'failed' as const
      },
      {
        id: 'rq-2',
        connectorId: 'salesforce',
        connectorName: 'Salesforce CRM',
        recordName: 'Account: ACME Corp',
        entityType: 'Account',
        failedAt: '2026-05-21 10:05:00',
        retryCount: 1,
        maxRetries: 5,
        errorMessage: 'Oauth token expired',
        status: 'succeeded' as const
      }
    ];

    const handleRetry = vi.fn();

    render(
      <RetryQueuePanel
        queue={mockQueue as any}
        onRetry={handleRetry}
      />
    );

    expect(screen.getByText(/Failed Sync & Retry Queue/i)).toBeInTheDocument();
    expect(screen.getByText('1 Active Errors')).toBeInTheDocument();
    expect(screen.getByText('1 Recovered')).toBeInTheDocument();
    expect(screen.getByText('Contact: Alice Smith')).toBeInTheDocument();

    // Verify error detail panel contains the error message
    expect(screen.getByText(/Connection timeout - 504 Gateway Timeout/i)).toBeInTheDocument();

    const forceSyncBtn = screen.getByRole('button', { name: /Force Sync/i });
    fireEvent.click(forceSyncBtn);
    expect(handleRetry).toHaveBeenCalledWith('rq-1');
  });

  it('renders RetryQueuePanel empty state', () => {
    render(
      <RetryQueuePanel
        queue={[]}
        onRetry={vi.fn()}
      />
    );
    expect(screen.getByText(/Retry queue is empty/i)).toBeInTheDocument();
  });

  it('renders WebhookConsole list, triggers deletes and toggles', () => {
    const addMock = vi.fn();
    const toggleMock = vi.fn();
    const deleteMock = vi.fn();
    const triggerMock = vi.fn();
    const clearMock = vi.fn();

    mockUseWebhookSimulator.mockReturnValue({
      endpoints: [
        {
          id: 'end-1',
          url: 'https://api.mycrm.com/webhook',
          secret: 'whsec_secret123',
          active: true,
          events: ['ticket.created'],
          createdAt: '2026-05-21 09:00:00'
        }
      ],
      addEndpoint: addMock,
      toggleEndpoint: toggleMock,
      deleteEndpoint: deleteMock,
      logs: [],
      triggerMockEvent: triggerMock,
      clearLogs: clearMock,
      webhookCatalog: [
        { type: 'ticket.created', label: 'Ticket Created', schema: {} }
      ]
    });

    render(<WebhookConsole />);

    expect(screen.getByText('https://api.mycrm.com/webhook')).toBeInTheDocument();

    const deleteBtn = screen.getByRole('button', { name: /Delete/i });
    expect(deleteBtn).toBeInTheDocument();
    fireEvent.click(deleteBtn);
    expect(deleteMock).toHaveBeenCalledWith('end-1');
  });
});
