import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../test-utils';
import { CallControls } from '@/components/voice/CallControls';
import { IncomingCallModal } from '@/components/voice/IncomingCallModal';

describe('Voice Call Subsystem QA Tests', () => {
  it('renders CallControls and toggles status indicators', () => {
    const handleToggleMute = vi.fn();
    const handleToggleHold = vi.fn();
    const handleToggleRecording = vi.fn();
    const handleTransfer = vi.fn();
    const handleConference = vi.fn();
    const handleHangup = vi.fn();

    const { rerender } = render(
      <CallControls
        isMuted={false}
        isHeld={false}
        isRecording={false}
        onToggleMute={handleToggleMute}
        onToggleHold={handleToggleHold}
        onToggleRecording={handleToggleRecording}
        onTransfer={handleTransfer}
        onConference={handleConference}
        onHangup={handleHangup}
      />
    );

    // Mute click
    const muteBtn = screen.getByRole('button', { name: /Mute/i });
    fireEvent.click(muteBtn);
    expect(handleToggleMute).toHaveBeenCalled();

    // Hangup click
    const hangupBtn = screen.getByRole('button', { name: /Hang Up/i });
    fireEvent.click(hangupBtn);
    expect(handleHangup).toHaveBeenCalled();

    // Rerender with active properties
    rerender(
      <CallControls
        isMuted={true}
        isHeld={true}
        isRecording={true}
        onToggleMute={handleToggleMute}
        onToggleHold={handleToggleHold}
        onToggleRecording={handleToggleRecording}
        onTransfer={handleTransfer}
        onConference={handleConference}
        onHangup={handleHangup}
      />
    );

    expect(screen.getByText('Muted')).toBeInTheDocument();
    expect(screen.getByText('Held')).toBeInTheDocument();
    expect(screen.getByText('Recording')).toBeInTheDocument();
  });

  it('renders IncomingCallModal ringing options', () => {
    const handleAccept = vi.fn();
    const handleReject = vi.fn();

    render(
      <IncomingCallModal
        isOpen={true}
        contactName="Samantha Green"
        phoneNumber="+1 (555) 019-2834"
        onAccept={handleAccept}
        onReject={handleReject}
      />
    );

    expect(screen.getByText('Samantha Green')).toBeInTheDocument();
    expect(screen.getByText('+1 (555) 019-2834')).toBeInTheDocument();

    const acceptBtn = screen.getByRole('button', { name: /Answer Call/i });
    fireEvent.click(acceptBtn);
    expect(handleAccept).toHaveBeenCalled();

    const rejectBtn = screen.getByRole('button', { name: /Decline Call/i });
    fireEvent.click(rejectBtn);
    expect(handleReject).toHaveBeenCalled();
  });
});
