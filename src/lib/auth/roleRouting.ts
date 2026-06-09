import type { UserRole } from '@/types';

/** Centralized post-auth landing routes per primary persona */
export const ROLE_HOME_ROUTES: Record<
  'super_admin' | 'client_admin' | 'support_agent' | 'customer',
  string
> = {
  super_admin: '/admin/infrastructure',
  client_admin: '/tenant/dashboard',
  support_agent: '/workspace/inbox',
  customer: '/portal/home',
};

/** Route prefix → roles allowed to access that workspace */
export const ROUTE_ROLE_ACCESS: Record<string, UserRole[]> = {
  '/admin': ['super_admin'],
  '/tenant': ['client_admin', 'operations_manager', 'viewer'],
  '/workspace': ['support_agent', 'supervisor', 'qa_manager'],
  '/portal': ['customer'],
  '/tickets': ['support_agent'],
};

const MOCK_STAFF_REGISTRY: Record<string, UserRole> = {
  // @company.com (used in E2E tests)
  'superadmin@company.com': 'super_admin',
  'clientadmin@company.com': 'client_admin',
  'agent@company.com': 'support_agent',
  'operations@company.com': 'operations_manager',
  'qa@company.com': 'qa_manager',
  'supervisor@company.com': 'supervisor',
  'viewer@company.com': 'viewer',
  'customer@company.com': 'customer',

  // @mpaas.com
  'superadmin@mpaas.com': 'super_admin',
  'clientadmin@mpaas.com': 'client_admin',
  'agent@mpaas.com': 'support_agent',
  'operations@mpaas.com': 'operations_manager',
  'qa@mpaas.com': 'qa_manager',
  'supervisor@mpaas.com': 'supervisor',
  'viewer@mpaas.com': 'viewer',
  'customer@mpaas.com': 'customer',

  // Legacy exact shortcut prefixes (to support test and demo utility triggers)
  'superadmin@': 'super_admin',
  'clientadmin@': 'client_admin',
  'agent@': 'support_agent',
  'customer@': 'customer',
  'operations@': 'operations_manager',
  'qa@': 'qa_manager',
  'supervisor@': 'supervisor',
  'viewer@': 'viewer',
};

export function inferRoleFromEmail(email: string): UserRole {
  const normalized = email.trim().toLowerCase();
  
  if (normalized === 'superadmin@mpaas.com') {
    return 'super_admin';
  }
  
  if (normalized in MOCK_STAFF_REGISTRY) {
    return MOCK_STAFF_REGISTRY[normalized];
  }

  // Unrecognized corporate logins default to customer to prevent security escalation.
  return 'customer';
}

export function getHomeRouteForRole(role: UserRole): string {
  if (role in ROLE_HOME_ROUTES) {
    return ROLE_HOME_ROUTES[role as keyof typeof ROLE_HOME_ROUTES];
  }

  const extendedDefaults: Partial<Record<UserRole, string>> = {
    operations_manager: '/tenant/dashboard',
    qa_manager: '/workspace/inbox',
    supervisor: '/workspace/inbox',
    viewer: '/tenant/dashboard',
  };

  return extendedDefaults[role] ?? '/tenant/dashboard';
}

export function getRoutePrefix(pathname: string): string | null {
  const prefixes = Object.keys(ROUTE_ROLE_ACCESS).sort((a, b) => b.length - a.length);
  return prefixes.find((prefix) => pathname.startsWith(prefix)) ?? null;
}

export function canRoleAccessPath(role: UserRole, pathname: string): boolean {
  const prefix = getRoutePrefix(pathname);
  if (!prefix) return true;
  return ROUTE_ROLE_ACCESS[prefix]?.includes(role) ?? false;
}

export function getDefaultScreenForPath(pathname: string): string | null {
  if (pathname.startsWith('/admin/infrastructure')) return 'sa_dashboard';
  if (pathname.startsWith('/tenant/dashboard')) return 'bots';
  if (pathname.startsWith('/workspace/inbox')) return 'inbox';
  if (pathname.startsWith('/portal/home')) return 'customer_home';
  if (pathname.startsWith('/tickets')) return 'tickets';
  return null;
}
