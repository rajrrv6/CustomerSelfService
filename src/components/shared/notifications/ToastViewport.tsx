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
      className={`fixed top-16 sm:top-20 z-50 flex flex-col gap-3 pointer-events-none transition-all duration-300 max-w-[calc(100vw-2rem)] w-80`}
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
