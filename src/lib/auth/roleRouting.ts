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
};

const EMAIL_ROLE_PATTERNS: { pattern: RegExp; role: UserRole }[] = [
  { pattern: /^superadmin@/i, role: 'super_admin' },
  { pattern: /^clientadmin@/i, role: 'client_admin' },
  { pattern: /^agent@/i, role: 'support_agent' },
  { pattern: /^customer@/i, role: 'customer' },
  { pattern: /^operations@/i, role: 'operations_manager' },
  { pattern: /^qa@/i, role: 'qa_manager' },
  { pattern: /^supervisor@/i, role: 'supervisor' },
  { pattern: /^viewer@/i, role: 'viewer' },
];

export function inferRoleFromEmail(email: string): UserRole {
  const normalized = email.trim().toLowerCase();
  const match = EMAIL_ROLE_PATTERNS.find(({ pattern }) => pattern.test(normalized));
  return match?.role ?? 'client_admin';
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
  if (pathname.startsWith('/admin/infrastructure')) return 'llm_registry';
  if (pathname.startsWith('/tenant/dashboard')) return 'bots';
  if (pathname.startsWith('/workspace/inbox')) return 'inbox';
  if (pathname.startsWith('/portal/home')) return 'customer_home';
  return null;
}
