import { useNotificationStore } from './notificationStore';

// State selectors
export const useAlerts = () => useNotificationStore((state) => state.alerts);
export const useFilters = () => useNotificationStore((state) => state.filters);
export const useAuditLogs = () => useNotificationStore((state) => state.auditLogs);
export const useMutedAlertCodes = () => useNotificationStore((state) => state.mutedAlertCodes);

// Derived state selectors
export const useUnreadCount = () =>
  useNotificationStore((state) => state.alerts.filter((a) => !a.read && a.lifecycleState !== 'resolved').length);

export const useActiveToasts = () =>
  useNotificationStore((state) => {
    // Only display alerts that are not dismissed, not muted, and are in active/acknowledged states
    const undismissed = state.alerts.filter(
      (a) => !a.dismissed && a.lifecycleState !== 'muted' && a.lifecycleState !== 'resolved'
    );

    // Limit active toasts (rate-limiting visible toasts to max 3)
    // Critical alerts bypass stacking limits, so we want to keep them visible
    const criticals = undismissed.filter((a) => a.severity === 'critical');
    const nonCriticals = undismissed.filter((a) => a.severity !== 'critical');

    // We take all criticals, plus enough non-criticals to make a total of 3 (or just display all criticals, plus 3 non-criticals max)
    const allowedNonCriticals = nonCriticals.slice(0, Math.max(0, 3 - criticals.length));
    
    // Sort so criticals appear first/top of stack
    return [...criticals, ...allowedNonCriticals].sort((a, b) => {
      if (a.severity === 'critical' && b.severity !== 'critical') return -1;
      if (a.severity !== 'critical' && b.severity === 'critical') return 1;
      return 0;
    });
  });

// Action selectors
export const useAddAlert = () => useNotificationStore((state) => state.addAlert);
export const useDismissToast = () => useNotificationStore((state) => state.dismissToast);
export const useAcknowledgeAlert = () => useNotificationStore((state) => state.acknowledgeAlert);
export const useResolveAlert = () => useNotificationStore((state) => state.resolveAlert);
export const useMuteAlertCode = () => useNotificationStore((state) => state.muteAlertCode);
export const useUnmuteAlertCode = () => useNotificationStore((state) => state.unmuteAlertCode);
export const useAcknowledgeAll = () => useNotificationStore((state) => state.acknowledgeAll);
export const useTogglePinAlert = () => useNotificationStore((state) => state.togglePinAlert);
export const useClearResolvedAlerts = () => useNotificationStore((state) => state.clearResolvedAlerts);
export const useSetFilters = () => useNotificationStore((state) => state.setFilters);
export const useResetFilters = () => useNotificationStore((state) => state.resetFilters);
export const useAddAuditLog = () => useNotificationStore((state) => state.addAuditLog);
export const useMuteAllAlertCodes = () => useNotificationStore((state) => state.muteAllAlertCodes);
