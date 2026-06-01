'use client';

import React from 'react';
import { useActiveToasts } from '@/stores/notifications/notificationSelectors';
import { ToastCard } from './ToastCard';
import { useUIStore } from '@/stores/uiStore';

export function ToastViewport() {
  const activeToasts = useActiveToasts();
  const lang = useUIStore((s) => s.lang);

  const isRtl = lang === 'ar';

  return (
    <div
      className={`fixed bottom-4 sm:bottom-6 z-50 flex flex-col gap-3 pointer-events-none transition-all duration-300 max-w-[calc(100vw-2rem)]`}
      style={{
        [isRtl ? 'left' : 'right']: '1.5rem',
      }}
    >
      <div className="flex flex-col gap-3 items-end">
        {activeToasts.map((toast) => (
          <ToastCard key={toast.id} alert={toast} />
        ))}
      </div>
    </div>
  );
}
export default ToastViewport;
