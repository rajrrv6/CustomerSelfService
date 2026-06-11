import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render as baseRender, screen, fireEvent, waitFor } from '@/test-utils';
import { LoginCard } from '@/components/auth/LoginCard';
import { MFAInput } from '@/components/auth/MFAInput';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { FeedbackToastProvider } from '@/components/customer-portal/feedback/PostChatToasts';
import * as navigation from 'next/navigation';
import LoginPage from '@/app/signin/page';
import { readSession, clearSession } from '@/lib/auth/authStorage';
import { AuthProvider, useAuthContext } from '@/context/AuthContext';

const render = (ui: React.ReactElement, options?: any) => {
  return baseRender(
    <FeedbackToastProvider>
      {ui}
    </FeedbackToastProvider>,
    options
  );
};

// Dynamic mock setup to prevent hoisting conflicts
const mockUseAuth = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('Auth Subsystem QA Tests', () => {
  it('renders LoginCard forms and triggers validation warnings', async () => {
    mockUseAuth.mockReturnValue({
      status: 'idle',
      isAuthenticated: false,
      user: null,
      canAccessPath: () => false,
      login: vi.fn().mockResolvedValue({
        success: false,
        errors: { email: 'Email is required', password: 'Password is required' }
      }),
      verifyMfa: vi.fn(),
      logout: vi.fn(),
      resendMfaCode: vi.fn(),
    });

    render(<LoginCard />);

    expect(screen.getByLabelText(/work email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /continue to verification/i });
    fireEvent.click(submitBtn);

    // Wait for client validations
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('renders MFAInput with 6 blank inputs, focusing the first input automatically', () => {
    render(<MFAInput onComplete={vi.fn()} />);
    
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(6);
    expect(inputs[0]).toHaveFocus();
  });

  it('navigates through digit fields in MFAInput and triggers completion handler', async () => {
    const handleComplete = vi.fn();
    render(<MFAInput onComplete={handleComplete} />);
    
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
    
    fireEvent.change(inputs[0], { target: { value: '1' } });
    expect(inputs[1]).toHaveFocus();

    fireEvent.change(inputs[1], { target: { value: '2' } });
    fireEvent.change(inputs[2], { target: { value: '3' } });
    fireEvent.change(inputs[3], { target: { value: '4' } });
    fireEvent.change(inputs[4], { target: { value: '5' } });
    fireEvent.change(inputs[5], { target: { value: '6' } });

    await waitFor(() => {
      expect(handleComplete).toHaveBeenCalledWith('123456');
    });
  });

  it('ProtectedRoute displays a loading spinner when auth state is loading', () => {
    mockUseAuth.mockReturnValue({
      status: 'loading',
      isAuthenticated: false,
      user: null,
      canAccessPath: () => false,
      login: vi.fn(),
      verifyMfa: vi.fn(),
      logout: vi.fn(),
      resendMfaCode: vi.fn(),
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.queryByText(/protected content/i)).not.toBeInTheDocument();
  });

  it('ProtectedRoute redirects unauthenticated users to login with encoded current path', () => {
    mockUseAuth.mockReturnValue({
      status: 'idle',
      isAuthenticated: false,
      user: null,
      canAccessPath: () => false,
      login: vi.fn(),
      verifyMfa: vi.fn(),
      logout: vi.fn(),
      resendMfaCode: vi.fn(),
    });

    const mockRouter = { replace: vi.fn(), push: vi.fn(), prefetch: vi.fn(), back: vi.fn(), forward: vi.fn(), refresh: vi.fn() };
    vi.spyOn(navigation, 'useRouter').mockReturnValue(mockRouter);
    vi.spyOn(navigation, 'usePathname').mockReturnValue('/portal/home');
    vi.spyOn(navigation, 'useSearchParams').mockReturnValue(new URLSearchParams('action=submit_ticket') as any);

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(mockRouter.replace).toHaveBeenCalledWith(
      `/signin?redirect=${encodeURIComponent('/portal/home?action=submit_ticket')}`
    );
  });

  it('LoginPage redirects authenticated users to redirect query path if safe', () => {
    mockUseAuth.mockReturnValue({
      status: 'idle',
      isAuthenticated: true,
      user: { role: 'customer' },
      canAccessPath: () => true,
    });

    const mockRouter = { replace: vi.fn(), push: vi.fn(), prefetch: vi.fn(), back: vi.fn(), forward: vi.fn(), refresh: vi.fn() };
    vi.spyOn(navigation, 'useRouter').mockReturnValue(mockRouter);
    vi.spyOn(navigation, 'useSearchParams').mockReturnValue(new URLSearchParams('redirect=/portal/home?action=submit_ticket') as any);

    render(<LoginPage />);

    expect(mockRouter.replace).toHaveBeenCalledWith('/portal/home?action=submit_ticket');
  });

  it('LoginPage redirects authenticated users to default role route if redirect query is external/unsafe', () => {
    mockUseAuth.mockReturnValue({
      status: 'idle',
      isAuthenticated: true,
      user: { role: 'customer' },
      canAccessPath: () => true,
    });

    const mockRouter = { replace: vi.fn(), push: vi.fn(), prefetch: vi.fn(), back: vi.fn(), forward: vi.fn(), refresh: vi.fn() };
    vi.spyOn(navigation, 'useRouter').mockReturnValue(mockRouter);
    vi.spyOn(navigation, 'useSearchParams').mockReturnValue(new URLSearchParams('redirect=https://external-malicious-site.com') as any);

    render(<LoginPage />);

    expect(mockRouter.replace).toHaveBeenCalledWith('/portal/home'); // fallback to customer default route
  });

  it('blocks empty credential submission and displays error toast in the DOM', async () => {
    mockUseAuth.mockReturnValue({
      status: 'idle',
      isAuthenticated: false,
      user: null,
      canAccessPath: () => false,
      login: vi.fn(),
    });

    render(<LoginCard />);

    const submitBtn = screen.getByRole('button', { name: /continue to verification/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Email and password are required')).toBeInTheDocument();
    });
  });

  it('readSession rejects partial or corrupted session cache', () => {
    // Set cookie helper manually for jsdom environment
    document.cookie = 'mpaas_authenticated=1; SameSite=Lax';
    document.cookie = 'mpaas_role=customer; SameSite=Lax';

    // 1. Partial/missing fields session
    localStorage.setItem('mpaas_auth_session', JSON.stringify({
      user: { email: 'customer@company.com' } // missing role and displayName
    }));

    expect(readSession()).toBeNull();

    // 2. Expired session
    localStorage.setItem('mpaas_auth_session', JSON.stringify({
      user: { email: 'customer@company.com', displayName: 'customer', role: 'customer' },
      expiresAt: new Date(Date.now() - 1000).toISOString() // past expiry
    }));

    expect(readSession()).toBeNull();
  });

  it('logout purges unsafe storage and resets active screen memory', async () => {
    // Set some unsafe storage keys
    localStorage.setItem('role', 'super_admin');
    localStorage.setItem('mpaas_registered_roles', 'some-roles');
    localStorage.setItem('current_tenant_id', 'tenant-123');
    sessionStorage.setItem('mPaaS_guest_chat_history', 'chat-history');

    // Safe keys should be retained
    localStorage.setItem('theme', 'dark');
    localStorage.setItem('lang', 'en');

    const TestComponent = () => {
      const { logout } = useAuthContext();
      return <button onClick={logout}>Logout</button>;
    };

    const mockRouter = { replace: vi.fn(), push: vi.fn(), prefetch: vi.fn(), back: vi.fn(), forward: vi.fn(), refresh: vi.fn() };
    vi.spyOn(navigation, 'useRouter').mockReturnValue(mockRouter);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(localStorage.getItem('role')).toBeNull();
      expect(localStorage.getItem('mpaas_registered_roles')).toBeNull();
      expect(localStorage.getItem('current_tenant_id')).toBeNull();
      expect(sessionStorage.getItem('mPaaS_guest_chat_history')).toBeNull();
      
      // Theme and lang should be preserved
      expect(localStorage.getItem('theme')).toBe('dark');
      expect(localStorage.getItem('lang')).toBe('en');
    });
  });
});
