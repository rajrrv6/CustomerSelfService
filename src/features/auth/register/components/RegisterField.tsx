import type { ReactNode } from 'react';

interface RegisterFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export function RegisterField({ label, htmlFor, error, hint, children }: RegisterFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-xs font-semibold text-slate-600 dark:text-slate-300">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-slate-400 dark:text-slate-500">{hint}</p>}
      {error && (
        <p className="text-xs font-medium text-rose-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}