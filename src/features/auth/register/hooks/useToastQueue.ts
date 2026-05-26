import { useCallback, useState } from 'react';
import type { ToastMessage } from '../types';

export function useToastQueue() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    (tone: ToastMessage['tone'], title: string, message: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((current) => [...current, { id, tone, title, message }]);
      window.setTimeout(() => removeToast(id), 4200);
    },
    [removeToast]
  );

  return {
    toasts,
    pushToast,
    removeToast,
  };
}