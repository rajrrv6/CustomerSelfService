import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render as baseRender, screen, fireEvent, waitFor } from '@/test-utils';
import PublicCallbackPage from '@/app/callback/page';
import { CustomerPortalLayout } from '@/components/customer-portal/shared/CustomerPortalLayout';
import { CallbackQueueCard } from '@/components/customer-portal/feedback/CallbackQueueCard';
import { FeedbackToastProvider } from '@/components/customer-portal/feedback/PostChatToasts';
import { useAuthStore } from '@/stores/authStore';
import { useAuth } from '@/hooks/useAuth';

// Wrap tests with FeedbackToastProvider context
const render = (ui: React.ReactElement, options?: any) => {
  return baseRender(
    <FeedbackToastProvider>
      {ui}
    </FeedbackToastProvider>,
    options
  );
};

describe('Task 3 — Callback Queue Continuity Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('1. PublicCallbackPage - Booking and Persistence', () => {
    it('persists callback queue state to localStorage when a guest books a callback', async () => {
      render(<PublicCallbackPage />);

      // Fill phone number and submit
      const phoneInput = screen.getByPlaceholderText('+966 50 123 4567');
      fireEvent.change(phoneInput, { target: { value: '+966 55 555 5555' } });
      
      const submitBtn = screen.getByRole('button', { name: /Book Callback/i });
      fireEvent.click(submitBtn);

      // Verify the CallbackQueueCard is rendered in PublicCallbackPage
      expect(screen.getByText(/Callback Queue Status/i)).toBeInTheDocument();

      // Verify localStorage was updated
      await waitFor(() => {
        const stored = localStorage.getItem('mPaaS_active_callback');
        expect(stored).not.toBeNull();
        const parsed = JSON.parse(stored!);
        expect(parsed.phoneNumber).toBe('+966 55 555 5555');
        expect(parsed.callbackStatus).toBe('queued');
        expect(typeof parsed.createdTimestamp).toBe('number');
      });
    });

    it('restores the queue status card on mount if active callback is in localStorage', () => {
      const activeSession = {
        id: 'CB-12345',
        phoneNumber: '+966 55 555 5555',
        position: 3,
        waitTimeMins: 4.5,
        callbackStatus: 'queued',
        isEscalated: false,
        createdTimestamp: Date.now()
      };
      localStorage.setItem('mPaaS_active_callback', JSON.stringify(activeSession));

      render(<PublicCallbackPage />);

      // It should bypass the booking form and render the Queue status directly
      expect(screen.getByText(/Callback Queue Status/i)).toBeInTheDocument();
      expect(screen.getByText('LINE: +966 55 555 5555')).toBeInTheDocument();
    });
  });

  describe('2. CustomerPortalLayout - Authenticated Restoration & Role Safety', () => {
    it('restores callback queue card for authenticated customer sessions', () => {
      useAuthStore.getState().setRole('customer');
      
      const activeSession = {
        id: 'CB-12345',
        phoneNumber: '+966 77 777 7777',
        position: 2,
        waitTimeMins: 3.0,
        callbackStatus: 'queued',
        isEscalated: false,
        createdTimestamp: Date.now()
      };
      localStorage.setItem('mPaaS_active_callback', JSON.stringify(activeSession));

      render(
        <CustomerPortalLayout
          activeSubScreen="customer_home"
          setActiveSubScreen={vi.fn()}
        />
      );

      // Confirm the CallbackQueueCard is restored inside Customer Portal Layout
      expect(screen.getByText(/Callback Queue Status/i)).toBeInTheDocument();
      expect(screen.getByText('LINE: +966 77 777 7777')).toBeInTheDocument();
    });

    it('does NOT restore callback queue card for non-customer roles', () => {
      // Set role to support_agent
      useAuthStore.getState().setRole('support_agent');

      const activeSession = {
        id: 'CB-12345',
        phoneNumber: '+966 77 777 7777',
        position: 2,
        waitTimeMins: 3.0,
        callbackStatus: 'queued',
        isEscalated: false,
        createdTimestamp: Date.now()
      };
      localStorage.setItem('mPaaS_active_callback', JSON.stringify(activeSession));

      render(
        <CustomerPortalLayout
          activeSubScreen="customer_home"
          setActiveSubScreen={vi.fn()}
        />
      );

      // Should not render the card
      expect(screen.queryByText(/Callback Queue Status/i)).not.toBeInTheDocument();
    });
  });

  describe('3. CallbackQueueCard - Sync and TTL Expiration', () => {
    it('clears expired sessions automatically (>2 hours old)', () => {
      const twoHoursAgo = Date.now() - (2.5 * 60 * 60 * 1000);
      const expiredSession = {
        id: 'CB-12345',
        phoneNumber: '+966 88 888 8888',
        position: 2,
        waitTimeMins: 3.0,
        callbackStatus: 'queued',
        isEscalated: false,
        createdTimestamp: twoHoursAgo
      };
      localStorage.setItem('mPaaS_active_callback', JSON.stringify(expiredSession));

      const onDismissMock = vi.fn();
      const onCloseMock = vi.fn();

      render(
        <CallbackQueueCard
          lang="en"
          phoneNumber="+966 88 888 8888"
          onDismiss={onDismissMock}
          onClose={onCloseMock}
        />
      );

      // Verify localStorage was cleared
      expect(localStorage.getItem('mPaaS_active_callback')).toBeNull();
      // Verify callback dismissals were triggered
      expect(onDismissMock).toHaveBeenCalled();
      expect(onCloseMock).toHaveBeenCalled();
    });

    it('removes session from localStorage when callback completes', () => {
      const activeSession = {
        id: 'CB-12345',
        phoneNumber: '+966 99 999 9999',
        position: 1,
        waitTimeMins: 1.5,
        callbackStatus: 'completed',
        isEscalated: false,
        createdTimestamp: Date.now()
      };
      localStorage.setItem('mPaaS_active_callback', JSON.stringify(activeSession));

      render(
        <CallbackQueueCard
          lang="en"
          phoneNumber="+966 99 999 9999"
        />
      );

      // Status 'completed' should trigger immediate localStorage removal
      expect(localStorage.getItem('mPaaS_active_callback')).toBeNull();
    });
  });

  describe('4. Logout - Session and Storage Cleanup', () => {
    it('purges mPaaS_active_callback from localStorage upon user logout', () => {
      localStorage.setItem('mPaaS_active_callback', 'active-queue-payload');

      const TestLogoutComponent = () => {
        const { logout } = useAuth();
        return (
          <button onClick={logout} data-testid="logout-btn">
            Logout
          </button>
        );
      };

      render(<TestLogoutComponent />);
      const btn = screen.getByTestId('logout-btn');
      fireEvent.click(btn);

      // Verify that callback continuity key is cleaned up
      expect(localStorage.getItem('mPaaS_active_callback')).toBeNull();
    });
  });
});
