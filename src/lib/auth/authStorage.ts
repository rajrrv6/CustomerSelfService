import type { AuthSession, PendingLogin } from '@/types/auth';
import type { UserRole } from '@/types';

const SESSION_KEY = 'mpaas_auth_session';
const PENDING_KEY = 'mpaas_pending_login';
const AUTH_COOKIE = 'mpaas_authenticated';
const ROLE_COOKIE = 'mpaas_role';
const REGISTERED_ROLE_KEY = 'mpaas_registered_roles';

const COOKIE_MAX_AGE_DAYS = 7;

function setCookie(name: string, value: string, maxAgeDays: number) {
  if (typeof document === 'undefined') return;
  const maxAge = maxAgeDays * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

function readRegisteredRoles(): Record<string, UserRole> {
  if (typeof window === 'undefined') return {};
  const raw = localStorage.getItem(REGISTERED_ROLE_KEY);
  if (!raw) return {};

  try {
    return JSON.parse(raw) as Record<string, UserRole>;
  } catch {
    localStorage.removeItem(REGISTERED_ROLE_KEY);
    return {};
  }
}

function writeRegisteredRoles(roles: Record<string, UserRole>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REGISTERED_ROLE_KEY, JSON.stringify(roles));
}

export function persistSession(session: AuthSession): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  setCookie(AUTH_COOKIE, '1', COOKIE_MAX_AGE_DAYS);
  setCookie(ROLE_COOKIE, session.user.role, COOKIE_MAX_AGE_DAYS);
}

export function readSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as AuthSession;
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      clearSession();
      return null;
    }
    return session;
  } catch {
    clearSession();
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
  clearCookie(AUTH_COOKIE);
  clearCookie(ROLE_COOKIE);
}

export function persistPendingLogin(pending: PendingLogin): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
}

export function readPendingLogin(): PendingLogin | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(PENDING_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingLogin;
  } catch {
    clearPendingLogin();
    return null;
  }
}

export function clearPendingLogin(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PENDING_KEY);
}

export function createSession(email: string, role: UserRole, displayName?: string): AuthSession {
  const now = new Date();
  const expires = new Date(now);
  expires.setDate(expires.getDate() + COOKIE_MAX_AGE_DAYS);

  return {
    user: {
      email: email.trim().toLowerCase(),
      displayName: displayName ?? email.split('@')[0],
      role,
    },
    authenticatedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
  };
}

export function persistRegisteredRole(email: string, role: UserRole): void {
  if (typeof window === 'undefined') return;

  const normalizedEmail = email.trim().toLowerCase();
  const registeredRoles = readRegisteredRoles();
  registeredRoles[normalizedEmail] = role;
  writeRegisteredRoles(registeredRoles);
}

export function readRegisteredRole(email: string): UserRole | null {
  if (typeof window === 'undefined') return null;

  const normalizedEmail = email.trim().toLowerCase();
  return readRegisteredRoles()[normalizedEmail] ?? null;
}

/** Server/middleware-readable cookie names */
export const AUTH_COOKIES = {
  authenticated: AUTH_COOKIE,
  role: ROLE_COOKIE,
} as const;
