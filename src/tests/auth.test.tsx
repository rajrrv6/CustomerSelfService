import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test-utils';
import { LoginCard } from '@/components/auth/LoginCard';
import { MFAInput } from '@/components/auth/MFAInput';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

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
});
