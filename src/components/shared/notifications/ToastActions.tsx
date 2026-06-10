'use client';

import React from 'react';
import { NotificationAction } from '@/stores/notifications/notificationTypes';
import { useAcknowledgeAlert, useResolveAlert, getAllowedNotificationActions } from '@/stores/notifications/notificationSelectors';
import { useAuthStore } from '@/stores/authStore';

interface ToastActionsProps {
  alertId: string;
  actions?: NotificationAction[];
  onActionTriggered?: () => void;
  isLightBg?: boolean;
}

export function ToastActions({ alertId, actions, onActionTriggered, isLightBg = false }: ToastActionsProps) {
  const acknowledgeAlert = useAcknowledgeAlert();
  const resolveAlert = useResolveAlert();
  const role = useAuthStore((s) => s.role);

  if (!actions || actions.length === 0) return null;

  const allowedActions = getAllowedNotificationActions({ id: alertId, actions } as any, role);

  if (allowedActions.length === 0) {
    return (
      <span className="text-[10px] italic text-slate-400 dark:text-slate-500 mt-1 block">
        No longer available
      </span>
    );
  }

  const handleActionClick = (action: NotificationAction) => {
    if (action.actionType === 'acknowledge') {
      acknowledgeAlert(alertId);
    } else if (action.actionType === 'resolve') {
      resolveAlert(alertId);
    } else if (action.actionType === 'navigate') {
      const screenId = action.payload?.screenId;
      if (screenId) {
        const event = new CustomEvent('navigate-to-screen', {
          detail: { screenId },
        });
        window.dispatchEvent(event);
      }
      acknowledgeAlert(alertId);
    } else if (action.actionType === 'retry') {
      // Operational simulation: alert logs retry success in audit logs after a small latency
      console.log(`[ToastActions] Retrying action: ${action.label}`, action.payload);
      acknowledgeAlert(alertId);
    }

    if (onActionTriggered) {
      onActionTriggered();
    }
  };

  return (
    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
      {allowedActions.map((act, index) => (
        <button
          key={index}
          type="button"
          onClick={() => handleActionClick(act)}
          className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all focus-visible:ring-1 active:scale-95 focus:outline-none ${
            isLightBg
              ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 focus-visible:ring-blue-500'
              : 'bg-white/15 hover:bg-white/25 text-white focus-visible:ring-white'
          }`}
        >
          {act.label}
        </button>
      ))}
    </div>
  );
}
