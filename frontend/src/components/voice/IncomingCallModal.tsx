import React, { useEffect, useRef } from 'react';
import { Phone, PhoneOff, User } from 'lucide-react';

interface IncomingCallModalProps {
  isOpen: boolean;
  contactName: string;
  phoneNumber: string;
  onAccept: () => void;
  onReject: () => void;
}

export function IncomingCallModal({
  isOpen,
  contactName,
  phoneNumber,
  onAccept,
  onReject
}: IncomingCallModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Play simulated ringing tone sound if supported (optional beep to warn user)
  useEffect(() => {
    if (!isOpen) return;
    
    let audioInterval: NodeJS.Timeout | null = null;
    try {
      const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioInterval = setInterval(() => {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = 440; // standard ring tone frequency start
          gainNode.gain.setValueAtTime(0.02, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
          osc.connect(gainNode);
          gainNode.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.5);
        }, 2000);
      }
    } catch {
      // AudioContext blocked
    }

    return () => {
      if (audioInterval) clearInterval(audioInterval);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    // Focus restoration: capture the active element before modal opens
    const previousActiveElement = document.activeElement as HTMLElement | null;

    // ESC close behavior
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onReject();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Focus trapping
    const modalElement = modalRef.current;
    if (!modalElement) return;

    const getFocusableElements = () => {
      return modalElement.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
    };

    const focusable = getFocusableElements();
    let cleanupTab: (() => void) | undefined;

    if (focusable.length > 0) {
      const first = focusable[0] as HTMLElement;
      const last = focusable[focusable.length - 1] as HTMLElement;

      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      };

      modalElement.addEventListener('keydown', handleTab);
      cleanupTab = () => modalElement.removeEventListener('keydown', handleTab);

      // Focus the Accept button by default if it's the second button, otherwise first. Let's focus first.
      const timer = setTimeout(() => {
        first.focus();
      }, 50);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        if (cleanupTab) cleanupTab();
        clearTimeout(timer);
        // Restore focus
        if (previousActiveElement) {
          setTimeout(() => {
            previousActiveElement.focus();
          }, 50);
        }
      };
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      // Restore focus
      if (previousActiveElement) {
        setTimeout(() => {
          previousActiveElement.focus();
        }, 50);
      }
    };
  }, [isOpen, onReject]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      <div 
        ref={modalRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="incoming-call-title"
        aria-describedby="incoming-call-desc"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-sm w-full rounded-[2.5rem] overflow-hidden shadow-2xl p-6 text-center space-y-6 animate-in zoom-in-95 text-slate-800 dark:text-slate-200"
      >
        
        {/* Ringing animations */}
        <div className="relative flex justify-center py-4">
          <div className="absolute w-24 h-24 bg-blue-500/10 dark:bg-blue-500/5 rounded-full animate-ping duration-1000" />
          <div className="absolute w-20 h-20 bg-blue-500/20 dark:bg-blue-500/10 rounded-full animate-pulse" />
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white relative z-10 shadow-lg shadow-blue-500/20">
            <User className="w-8 h-8" />
          </div>
        </div>

        {/* Identity Details */}
        <div className="space-y-1.5" id="incoming-call-desc">
          <span id="incoming-call-title" className="text-[10px] uppercase font-bold tracking-widest text-blue-600 dark:text-blue-400 font-mono block">
            Incoming Voice Call...
          </span>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
            {contactName}
          </h3>
          <p className="text-xs text-slate-500 font-mono">{phoneNumber}</p>
        </div>

        {/* Incoming SIP details */}
        <div className="bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800 text-[10px] font-mono text-slate-500">
          <span>Inbound via US-East Gateway</span>
        </div>

        {/* Buttons Action Row */}
        <div className="flex gap-4 justify-center items-center py-2">
          {/* Decline */}
          <button
            onClick={onReject}
            className="w-14 h-14 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-rose-600/30 hover:scale-105 active:scale-95 transition-all outline-none focus-visible:ring-4 focus-visible:ring-rose-500/50 focus-visible:outline-none"
            title="Decline Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>

          {/* Accept */}
          <button
            onClick={onAccept}
            className="w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/50 focus-visible:outline-none"
            title="Answer Call"
          >
            <Phone className="w-6 h-6 animate-bounce" />
          </button>
        </div>
      </div>
    </div>
  );
}

