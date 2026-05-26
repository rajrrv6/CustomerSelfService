import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import type { ReactNode } from 'react';
import type { ToastMessage } from '../types';

interface ToastStackProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

const toneClasses: Record<ToastMessage['tone'], string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-100',
  error: 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/60 dark:text-rose-100',
  info: 'border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100',
};

const toneIcons: Record<ToastMessage['tone'], ReactNode> = {
  success: <CheckCircle2 className="w-4 h-4" aria-hidden />,
  error: <AlertCircle className="w-4 h-4" aria-hidden />,
  info: <Info className="w-4 h-4" aria-hidden />,
};

export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex w-[min(92vw,24rem)] flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${toneClasses[toast.tone]}`}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5">{toneIcons[toast.tone]}</div>
            <div className="flex-1 space-y-0.5">
              <p className="text-sm font-bold">{toast.title}</p>
              <p className="text-xs leading-relaxed opacity-90">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="text-xs font-semibold opacity-70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md px-1"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}