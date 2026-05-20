'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface MFAInputProps {
  onComplete: (code: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

const DIGIT_COUNT = 6;

export function MFAInput({ onComplete, isLoading = false, error }: MFAInputProps) {
  const { lang } = useApp();
  const isRtl = lang === 'ar';
  const [digits, setDigits] = useState<string[]>(Array(DIGIT_COUNT).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const focusIndex = useCallback((index: number) => {
    const el = inputRefs.current[index];
    if (el) {
      el.focus();
      el.select();
    }
  }, []);

  useEffect(() => {
    focusIndex(0);
  }, [focusIndex]);

  const submitIfComplete = useCallback(
    (next: string[]) => {
      if (next.every((d) => d !== '') && next.join('').length === DIGIT_COUNT) {
        onComplete(next.join(''));
      }
    },
    [onComplete]
  );

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);

    if (digit && index < DIGIT_COUNT - 1) {
      focusIndex(index + 1);
    }

    submitIfComplete(next);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        const next = [...digits];
        next[index - 1] = '';
        setDigits(next);
        focusIndex(index - 1);
      } else if (digits[index]) {
        const next = [...digits];
        next[index] = '';
        setDigits(next);
      }
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focusIndex(isRtl ? index + 1 : index - 1);
    } else if (e.key === 'ArrowRight' && index < DIGIT_COUNT - 1) {
      focusIndex(isRtl ? index - 1 : index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, DIGIT_COUNT);
    if (!pasted) return;

    const next = Array(DIGIT_COUNT).fill('');
    pasted.split('').forEach((char, i) => {
      next[i] = char;
    });
    setDigits(next);
    focusIndex(Math.min(pasted.length, DIGIT_COUNT - 1));
    submitIfComplete(next);
  };

  return (
    <div className="space-y-4">
      <div
        className="flex justify-center gap-2 sm:gap-3"
        dir="ltr"
        role="group"
        aria-label={isRtl ? 'رمز التحقق المكون من 6 أرقام' : '6-digit verification code'}
        onPaste={handlePaste}
      >
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            value={digit}
            disabled={isLoading}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className={`w-10 h-12 sm:w-11 sm:h-14 text-center text-lg font-bold font-mono rounded-xl border bg-slate-50 dark:bg-slate-950 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 disabled:opacity-50 ${
              error ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
            }`}
            aria-label={`${isRtl ? 'رقم' : 'Digit'} ${index + 1}`}
          />
        ))}
      </div>

      {error && (
        <p className="text-xs text-rose-500 text-center font-medium" role="alert">
          {error}
        </p>
      )}

      {isLoading && (
        <div className="flex justify-center items-center gap-2 text-xs text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
          {isRtl ? 'جاري التحقق من الرمز...' : 'Verifying code...'}
        </div>
      )}
    </div>
  );
}
