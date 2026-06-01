'use client';

import React from 'react';
import { ToastViewport } from './ToastViewport';

interface ToastProviderProps {
  children: React.ReactNode;
}

/**
 * Lightweight ToastProvider.
 *
 * Exposes NO business logic, React Context, or state variables.
 * Simply mounts the <ToastViewport /> to display notifications managed by the Zustand store,
 * avoiding re-render propagation across the component tree.
 */
export function ToastProvider({ children }: ToastProviderProps) {
  return (
    <>
      {children}
      <ToastViewport />
    </>
  );
}
export default ToastProvider;
