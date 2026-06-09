import { useShallow } from 'zustand/react/shallow';
import { useNotificationStore } from './notificationStore';
import { useAuthStore } from '@/stores/authStore';
import { useClientAdminStore } from '@/stores/clientAdminPersistenceStore';
import { getPermissionLevel } from '@/stores/permissionStore';
import { SystemAlert } from './notificationTypes';

/**
 * Centered filtering helper that executes RBAC, Persona, Module Access, and Tenant-level gates.
 */
export function filterAlertsForUser(alerts: SystemAlert[], role: string, activeTenant?: string): SystemAlert[] {
  const roleUpper = role.toUpperCase();
  const rolesToMatch = [roleUpper];
  if (role === 'support_agent') {
    rolesToMatch.push('AGENT', 'SUPPORT_AGENT');
  } else if (role === 'customer') {
    rolesToMatch.push('CUSTOMER', 'END_USER', 'USER');
  } else if (role === 'operations_manager') {
    rolesToMatch.push('OPERATIONS', 'OPERATIONS_MANAGER');
  } else if (role === 'qa_manager') {
    rolesToMatch.push('QA', 'QA_MANAGER');
  } else if (role === 'super_admin' || role === 'client_admin') {
    rolesToMatch.push('ADMIN');
  }

  return alerts.filter((alert) => {
    // 1. Role Gating
    if (alert.allowedRoles && alert.allowedRoles.length > 0) {
      const allowedRolesUpper = alert.allowedRoles.map((r) => r.toUpperCase());
      const hasRoleMatch = rolesToMatch.some((r) => allowedRolesUpper.includes(r));
      if (!hasRoleMatch) return false;
    } else {
      // Fallback default roles when allowedRoles does not exist:
      // Infrastructure/system/admin categories are strictly for admins
      const sysInfraCats = ['sync', 'compliance', 'ai', 'webhook'];
      if (sysInfraCats.includes(alert.category)) {
        if (role !== 'super_admin' && role !== 'client_admin') {
          return false;
        }
      }
      
      // End User (customer) should NEVER see alerts unless explicitly allowed.
      if (role === 'customer') {
        return false;
      }

      // Agent should only see operations/queue/routing alerts by default.
      if (role === 'support_agent') {
        const agentAllowedCats = ['sla', 'routing', 'operations', 'escalation'];
        if (!agentAllowedCats.includes(alert.category)) {
          return false;
        }
      }
    }

    // 2. Persona Gating
    if (alert.allowedPersonas && alert.allowedPersonas.length > 0) {
      const allowedPersonasUpper = alert.allowedPersonas.map((p) => p.toUpperCase());
      const hasPersonaMatch = rolesToMatch.some((p) => allowedPersonasUpper.includes(p));
      if (!hasPersonaMatch) return false;
    }

    // 3. Module Access / Permission Scope Gating
    if (alert.allowedModules && alert.allowedModules.length > 0) {
      // Admins bypass module checking as they have admin access on everything
      if (role !== 'super_admin' && role !== 'client_admin') {
        const hasModuleAccess = alert.allowedModules.some((mod) => {
          let storeMod = mod.toLowerCase();
          if (storeMod === 'operations') storeMod = 'workforce';
          else if (storeMod === 'infrastructure') storeMod = 'audit';
          else if (storeMod === 'integrations') storeMod = 'bot';
          else if (storeMod === 'ai-copilot' || storeMod === 'ai') storeMod = 'copilot';
          else if (storeMod === 'sync') storeMod = 'rag';
          else if (storeMod === 'compliance') storeMod = 'bot';

          const permissionLevel = getPermissionLevel(role as any, storeMod);
          return permissionLevel !== 'none';
        });
        if (!hasModuleAccess) return false;
      }
    }

    // 4. Tenant Gating
    if (alert.tenantScope && alert.tenantScope !== 'global') {
      if (activeTenant && alert.tenantScope !== activeTenant) {
        return false;
      }
    }

    return true;
  });
}

// State selectors (subscribed to role and tenantName to ensure reactivity)
export const useAlerts = () => {
  const role = useAuthStore((s) => s.role);
  const activeTenant = useClientAdminStore((s) => s.settings.tenantName);
  return useNotificationStore(
    useShallow((state) => filterAlertsForUser(state.alerts, role, activeTenant))
  );
};

export const useFilters = () => useNotificationStore((state) => state.filters);
export const useAuditLogs = () => useNotificationStore((state) => state.auditLogs);
export const useMutedAlertCodes = () => useNotificationStore((state) => state.mutedAlertCodes);

// Derived state selectors
export const useUnreadCount = () => {
  const role = useAuthStore((s) => s.role);
  const activeTenant = useClientAdminStore((s) => s.settings.tenantName);
  return useNotificationStore((state) => {
    const filtered = filterAlertsForUser(state.alerts, role, activeTenant);
    return filtered.filter((a) => !a.read && a.lifecycleState !== 'resolved').length;
  });
};

export const useActiveToasts = () => {
  const role = useAuthStore((s) => s.role);
  const activeTenant = useClientAdminStore((s) => s.settings.tenantName);
  return useNotificationStore(
    useShallow((state) => {
      const filtered = filterAlertsForUser(state.alerts, role, activeTenant);
      // Only display alerts that are not dismissed, not muted, and are in active/acknowledged states
      const undismissed = filtered.filter(
        (a) => !a.dismissed && a.lifecycleState !== 'muted' && a.lifecycleState !== 'resolved'
      );

      // Limit active toasts (rate-limiting visible toasts to max 3)
      // Critical alerts bypass stacking limits, so we want to keep them visible
      const criticals = undismissed.filter((a) => a.severity === 'critical');
      const nonCriticals = undismissed.filter((a) => a.severity !== 'critical');

      // We take all criticals, plus enough non-criticals to make a total of 3
      const allowedNonCriticals = nonCriticals.slice(0, Math.max(0, 3 - criticals.length));
      
      // Sort so criticals appear first/top of stack
      return [...criticals, ...allowedNonCriticals].sort((a, b) => {
        if (a.severity === 'critical' && b.severity !== 'critical') return -1;
        if (a.severity !== 'critical' && b.severity === 'critical') return 1;
        return 0;
      });
    })
  );
};

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

