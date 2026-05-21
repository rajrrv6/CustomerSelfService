'use client';

import React from 'react';

export type BadgeType =
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral'
  | 'active'
  | 'inactive'
  | 'live'
  | 'training'
  | 'testing'
  | 'open'
  | 'closed'
  | 'pending'
  | 'urgent'
  | 'high'
  | 'medium'
  | 'low'
  | 'billing'
  | 'solved';

interface BadgeProps {
  type: BadgeType | string;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ type, children, className = '' }: BadgeProps) {
  const normalizedType = type.toLowerCase();

  let styles = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';

  if (normalizedType === 'success' || normalizedType === 'active' || normalizedType === 'live' || normalizedType === 'solved' || normalizedType === 'operational') {
    styles = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400';
  } else if (normalizedType === 'warning' || normalizedType === 'testing' || normalizedType === 'pending' || normalizedType === 'medium' || normalizedType === 'degraded') {
    styles = 'bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400';
  } else if (normalizedType === 'error' || normalizedType === 'closed' || normalizedType === 'urgent' || normalizedType === 'high' || normalizedType === 'exceeded') {
    styles = 'bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400';
  } else if (normalizedType === 'info' || normalizedType === 'training' || normalizedType === 'open' || normalizedType === 'billing') {
    styles = 'bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400';
  } else if (normalizedType === 'low' || normalizedType === 'inactive') {
    styles = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase transition-colors whitespace-nowrap ${styles} ${className}`}
    >
      {children}
    </span>
  );
}
