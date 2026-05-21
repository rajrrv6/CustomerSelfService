import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test-utils';
import { SubmitTicketModal } from '@/components/customer-portal/tickets/SubmitTicketModal';
import { OtpAuth } from '@/components/customer-portal/refunds/OtpAuth';

describe('Customer Portal Subsystem QA Tests', () => {
  it('renders SubmitTicketModal fields and submits details', () => {
    const handleClose = vi.fn();
    const handleTitleChange = vi.fn();
    const handleCategoryChange = vi.fn();
    const handlePriorityChange = vi.fn();
    const handleDescChange = vi.fn();
    const handleSubmit = vi.fn((e) => e.preventDefault());

    render(
      <SubmitTicketModal
        isOpen={true}
        onClose={handleClose}
        ticketTitle="API connection timeout"
        setTicketTitle={handleTitleChange}
        ticketCategory="API Integrations"
        setTicketCategory={handleCategoryChange}
        ticketPriority="high"
        setTicketPriority={handlePriorityChange}
        ticketDesc="The endpoint is returning 504 Gateway Timeout"
        setTicketDesc={handleDescChange}
        handleTicketSubmit={handleSubmit}
      />
    );

    expect(screen.getByPlaceholderText(/e.g. Invoicing dispute logs/i)).toHaveValue('API connection timeout');
    expect(screen.getByPlaceholderText(/outline the full steps/i)).toHaveValue('The endpoint is returning 504 Gateway Timeout');

    // Simulate input actions
    fireEvent.change(screen.getByPlaceholderText(/e.g. Invoicing dispute logs/i), { target: { value: 'API connection timeout updated' } });
    expect(handleTitleChange).toHaveBeenCalledWith('API connection timeout updated');

    fireEvent.submit(screen.getByRole('button', { name: /Submit Case/i }));
    expect(handleSubmit).toHaveBeenCalled();
  });

  it('renders OtpAuth email request step and handles OTP dispatch triggers', () => {
    const handleRequest = vi.fn((e) => e.preventDefault());
    const handleVerify = vi.fn((e) => e.preventDefault());
    const setEmail = vi.fn();
    const setOtp = vi.fn();

    render(
      <OtpAuth
        otpStep="email"
        lookupEmail="david@company.com"
        setLookupEmail={setEmail}
        lookupOtp=""
        setLookupOtp={setOtp}
        handleOtpRequest={handleRequest}
        handleVerifyOtp={handleVerify}
        otpError={null}
        setOtpError={vi.fn()}
      />
    );

    expect(screen.getByText(/registered account email/i)).toBeInTheDocument();
    
    const emailInput = screen.getByPlaceholderText(/david.miller@yahoo.com/i);
    expect(emailInput).toHaveValue('david@company.com');

    fireEvent.change(emailInput, { target: { value: 'new@company.com' } });
    expect(setEmail).toHaveBeenCalledWith('new@company.com');

    fireEvent.submit(screen.getByRole('button', { name: /Send Verification Code/i }));
    expect(handleRequest).toHaveBeenCalled();
  });

  it('renders OtpAuth code verification step and verifies password entry', () => {
    const handleRequest = vi.fn((e) => e.preventDefault());
    const handleVerify = vi.fn((e) => e.preventDefault());
    const setEmail = vi.fn();
    const setOtp = vi.fn();

    render(
      <OtpAuth
        otpStep="code"
        lookupEmail="david@company.com"
        setLookupEmail={setEmail}
        lookupOtp="12"
        setLookupOtp={setOtp}
        handleOtpRequest={handleRequest}
        handleVerifyOtp={handleVerify}
        otpError={null}
        setOtpError={vi.fn()}
      />
    );

    expect(screen.getByText(/We sent a verification code to david@company.com/i)).toBeInTheDocument();
    
    const codeInput = screen.getByPlaceholderText(/e.g. 1234/i);
    expect(codeInput).toHaveValue('12');

    fireEvent.change(codeInput, { target: { value: '1234' } });
    expect(setOtp).toHaveBeenCalledWith('1234');

    fireEvent.submit(screen.getByRole('button', { name: /Verify Code/i }));
    expect(handleVerify).toHaveBeenCalled();
  });
});
