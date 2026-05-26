import { useEffect, useMemo, useRef } from 'react';
import type { ClipboardEvent, KeyboardEvent } from 'react';

interface OtpDigitInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string | null;
  label: string;
  isRtl: boolean;
}

export function OtpDigitInput({ value, onChange, disabled, error, label, isRtl }: OtpDigitInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = useMemo(() => value.padEnd(6, ' ').slice(0, 6).split(''), [value]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const updateDigit = (index: number, nextValue: string) => {
    const nextDigits = digits.map((digit, digitIndex) => (digitIndex === index ? nextValue.slice(-1) : digit.trim()));
    const combined = nextDigits.join('').replace(/\s/g, '');
    onChange(combined);

    if (nextValue && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === 'Backspace' && !digits[index]?.trim() && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    event.preventDefault();
    onChange(pasted);
    inputsRef.current[Math.min(pasted.length - 1, 5)]?.focus();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">{label}</label>
        <span className="text-[11px] text-slate-400 dark:text-slate-500">
          {isRtl ? 'أدخل الرمز المكون من 6 أرقام' : 'Enter the 6-digit code'}
        </span>
      </div>

      <div className="flex gap-2 sm:gap-3" onPaste={handlePaste} dir="ltr">
        {Array.from({ length: 6 }).map((_, index) => (
          <input
            key={index}
            ref={(node) => {
              inputsRef.current[index] = node;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digits[index]?.trim() ?? ''}
            onChange={(event) => updateDigit(index, event.target.value.replace(/\D/g, ''))}
            onKeyDown={(event) => handleKeyDown(event, index)}
            disabled={disabled}
            aria-label={`${label} ${index + 1}`}
            className={`h-12 w-12 sm:h-14 sm:w-14 rounded-xl border bg-white dark:bg-slate-950 text-center text-lg font-bold tracking-widest text-slate-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors ${
              error ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
            }`}
          />
        ))}
      </div>

      {error && (
        <p className="text-xs font-medium text-rose-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}