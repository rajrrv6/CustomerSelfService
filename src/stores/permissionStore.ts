'use client';

import { create } from 'zustand';
import { useAuthStore } from '@/stores/authStore';
import type { UserRole } from '@/types';

export type PermissionLevel = 'none' | 'view' | 'edit' | 'manage' | 'export' | 'admin';

export interface RolePermissions {
  inbox: PermissionLevel;
  sla: PermissionLevel;
  billing: PermissionLevel;
  analytics: PermissionLevel;
  workforce: PermissionLevel;
  qa: PermissionLevel;
  rag: PermissionLevel;
  copilot: PermissionLevel;
  bot: PermissionLevel;
  surveys: PermissionLevel;
  audit: PermissionLevel;
}

export type PermissionsMap = Record<string, RolePermissions>; // keys: admin, supervisor, qa, agent, viewer, operations

export const DEFAULT_PERMISSIONS: PermissionsMap = {
  admin: {
    inbox: 'admin', sla: 'admin', billing: 'admin', analytics: 'admin',
    workforce: 'admin', qa: 'admin', rag: 'admin', copilot: 'admin',
    bot: 'admin', surveys: 'admin', audit: 'admin'
  },
  supervisor: {
    inbox: 'manage', sla: 'manage', billing: 'view', analytics: 'manage',
    workforce: 'manage', qa: 'manage', rag: 'view', copilot: 'edit',
    bot: 'view', surveys: 'manage', audit: 'view'
  },
  qa: {
    inbox: 'view', sla: 'view', billing: 'none', analytics: 'view',
    workforce: 'view', qa: 'manage', rag: 'none', copilot: 'view',
    bot: 'none', surveys: 'edit', audit: 'none'
  },
  agent: {
    inbox: 'edit', sla: 'view', billing: 'none', analytics: 'view',
    workforce: 'view', qa: 'none', rag: 'none', copilot: 'edit',
    bot: 'none', surveys: 'none', audit: 'none'
  },
  viewer: {
    inbox: 'view', sla: 'view', billing: 'none', analytics: 'view',
    workforce: 'none', qa: 'none', rag: 'none', copilot: 'view',
    bot: 'none', surveys: 'view', audit: 'view'
  },
  operations: {
    inbox: 'view', sla: 'manage', billing: 'none', analytics: 'edit',
    workforce: 'manage', qa: 'none', rag: 'none', copilot: 'none',
    bot: 'none', surveys: 'view', audit: 'none'
  }
};

export const LEVEL_RANKS: Record<PermissionLevel, number> = {
  none: 0,
  view: 1,
  edit: 2,
  manage: 3,
  export: 4,
  admin: 5,
};

export const SCREEN_TO_MODULE_MAP: Record<string, keyof RolePermissions> = {
  inbox: 'inbox',
  tickets: 'inbox',
  agent_dashboard: 'inbox',
  sla: 'sla',
  billing: 'billing',
  analytics_center: 'analytics',
  workforce: 'workforce',
  agents: 'workforce',
  supervisor_monitor: 'workforce',
  qa_queue: 'qa',
  coaching: 'qa',
  knowledge_base: 'rag',
  bots: 'bot',
  intents: 'bot',
  dialog_flow: 'bot',
  guardrails: 'bot',
  deployments: 'bot',
  training: 'bot',
  integrations: 'bot',
  channels: 'bot',
  rbac: 'audit',
};

export function mapUserRoleToMatrixRole(role: UserRole): string {
  switch (role) {
    case 'super_admin':
    case 'client_admin':
      return 'admin';
    case 'supervisor':
      return 'supervisor';
    case 'operations_manager':
      return 'operations';
    case 'qa_manager':
      return 'qa';
    case 'support_agent':
      return 'agent';
    case 'viewer':
      return 'viewer';
    default:
      return 'viewer';
  }
}

interface PermissionState {
  permissions: PermissionsMap;
  apiPermissions: Record<string, PermissionLevel> | null;
  updatePermission: (roleId: string, moduleId: string, level: PermissionLevel) => void;
  setApiPermissions: (payload: Record<string, PermissionLevel> | null) => void;
  resetPermissions: () => void;
}

function getInitialPermissions(): PermissionsMap {
  if (typeof window === 'undefined') return DEFAULT_PERMISSIONS;
  try {
    const saved = localStorage.getItem('rbac_permissions_matrix');
    return saved ? JSON.parse(saved) : DEFAULT_PERMISSIONS;
  } catch (e) {
    return DEFAULT_PERMISSIONS;
  }
}

export const usePermissionStore = create<PermissionState>((set) => ({
  permissions: getInitialPermissions(),
  apiPermissions: null,

  updatePermission: (roleId, moduleId, level) => {
    set((state) => {
      const nextPermissions = {
        ...state.permissions,
        [roleId]: {
          ...state.permissions[roleId],
          [moduleId]: level,
        },
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('rbac_permissions_matrix', JSON.stringify(nextPermissions));
      }
      return { permissions: nextPermissions };
    });
  },

  setApiPermissions: (payload) => {
    set({ apiPermissions: payload });
  },

  resetPermissions: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('rbac_permissions_matrix');
    }
    set({ permissions: DEFAULT_PERMISSIONS, apiPermissions: null });
  },
}));

// Static/Utility helper for non-react contexts (e.g. middleware, router guards)
export function getPermissionLevel(role: UserRole, screenOrModule: string): PermissionLevel {
  const state = usePermissionStore.getState();
  
  // 1. Check API override first (Future backend compatibility)
  if (state.apiPermissions) {
    const mapped = SCREEN_TO_MODULE_MAP[screenOrModule] || screenOrModule;
    if (state.apiPermissions[mapped]) {
      return state.apiPermissions[mapped];
    }
  }

  // 2. Check role matrix
  const matrixRole = mapUserRoleToMatrixRole(role);
  const mappedModule = SCREEN_TO_MODULE_MAP[screenOrModule] || screenOrModule;
  
  const roleRules = state.permissions[matrixRole];
  if (roleRules && roleRules[mappedModule as keyof RolePermissions]) {
    return roleRules[mappedModule as keyof RolePermissions];
  }

  // Super admins have admin permissions on everything by default
  if (role === 'super_admin' || role === 'client_admin') {
    return 'admin';
  }

  return 'none';
}

export function canView(screenOrModule: string, role: UserRole): boolean {
  const level = getPermissionLevel(role, screenOrModule);
  return (LEVEL_RANKS[level] ?? 0) >= LEVEL_RANKS.view;
}

export function canEdit(screenOrModule: string, role: UserRole): boolean {
  const level = getPermissionLevel(role, screenOrModule);
  return (LEVEL_RANKS[level] ?? 0) >= LEVEL_RANKS.edit;
}

export function canManage(screenOrModule: string, role: UserRole): boolean {
  const level = getPermissionLevel(role, screenOrModule);
  return (LEVEL_RANKS[level] ?? 0) >= LEVEL_RANKS.manage;
}

export function canExport(screenOrModule: string, role: UserRole): boolean {
  const level = getPermissionLevel(role, screenOrModule);
  return (LEVEL_RANKS[level] ?? 0) >= LEVEL_RANKS.export;
}

export function canAdmin(screenOrModule: string, role: UserRole): boolean {
  const level = getPermissionLevel(role, screenOrModule);
  return (LEVEL_RANKS[level] ?? 0) >= LEVEL_RANKS.admin;
}

// React hooks to subscribe to specific permissions dynamically
export function usePermission(screenOrModule: string) {
  const role = useAuthStore((s) => s.role);
  
  // Subscribe specifically to the sub-state to prevent redundant re-renders
  const apiPermissions = usePermissionStore((s) => s.apiPermissions);
  
  const matrixRole = mapUserRoleToMatrixRole(role);
  const rolePermissions = usePermissionStore((s) => s.permissions[matrixRole]);

  const level: PermissionLevel = (() => {
    // 1. Check API override
    if (apiPermissions) {
      const mapped = SCREEN_TO_MODULE_MAP[screenOrModule] || screenOrModule;
      if (apiPermissions[mapped]) return apiPermissions[mapped];
    }

    // 2. Check role matrix
    const mappedModule = SCREEN_TO_MODULE_MAP[screenOrModule] || screenOrModule;
    const levelVal = rolePermissions?.[mappedModule as keyof RolePermissions];
    
    if (levelVal) return levelVal;

    if (role === 'super_admin' || role === 'client_admin') {
      return 'admin';
    }
    return 'none';
  })();

  const rank = LEVEL_RANKS[level] ?? 0;

  return {
    level,
    canView: rank >= LEVEL_RANKS.view,
    canEdit: rank >= LEVEL_RANKS.edit,
    canManage: rank >= LEVEL_RANKS.manage,
    canExport: rank >= LEVEL_RANKS.export,
    canAdmin: rank >= LEVEL_RANKS.admin,
  };
}
