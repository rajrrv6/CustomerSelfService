'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  tone: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

interface FeedbackToastContextType {
  pushToast: (tone: 'success' | 'error' | 'info', title: string, message: string) => void;
  removeToast: (id: string) => void;
}

const FeedbackToastContext = createContext<FeedbackToastContextType | undefined>(undefined);

export function useFeedbackToasts() {
  const context = useContext(FeedbackToastContext);
  if (!context) {
    throw new Error('useFeedbackToasts must be used within a FeedbackToastProvider');
  }
  return context;
}

const toneClasses = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-100',
  error: 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/60 dark:text-rose-100',
  info: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/60 dark:text-blue-100',
};

const toneIcons = {
  success: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-450" aria-hidden />,
  error: <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-455" aria-hidden />,
  info: <Info className="w-4 h-4 text-blue-600 dark:text-blue-450" aria-hidden />,
};

export function FeedbackToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    (tone: 'success' | 'error' | 'info', title: string, message: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((current) => [...current, { id, tone, title, message }]);
      window.setTimeout(() => removeToast(id), 5000);
    },
    [removeToast]
  );

  return (
    <FeedbackToastContext.Provider value={{ pushToast, removeToast }}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 flex w-[min(92vw,24rem)] flex-col gap-3 pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-bottom-5 ${toneClasses[toast.tone]}`}
              role="status"
              aria-live="polite"
            >
              <div className="flex items-start gap-3 text-xs font-semibold">
                <div className="mt-0.5 shrink-0">{toneIcons[toast.tone]}</div>
                <div className="flex-1 space-y-0.5">
                  <p className="font-bold text-slate-900 dark:text-white">{toast.title}</p>
                  <p className="text-[10px] leading-relaxed opacity-90 font-normal">{toast.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="text-slate-400 hover:text-slate-655 focus-visible:outline-none rounded-md px-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </FeedbackToastContext.Provider>
  );
}
