/**
 * Client-only mock for password reset handoff (forgot → reset).
 * Replace with signed token from backend email link in production.
 */

const STORAGE_KEY = 'mpaas_password_reset_pending';

export interface PendingPasswordReset {
  token: string;
  email: string;
  createdAt: string;
  /** ISO time after which the mock reset session is invalid */
  expiresAt: string;
}

const MOCK_TTL_MS = 30 * 60 * 1000; // 30 minutes

export function createPendingPasswordReset(email: string): PendingPasswordReset {
  const now = new Date();
  const expires = new Date(now.getTime() + MOCK_TTL_MS);
  const token =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `mock-${now.getTime()}-${Math.random().toString(36).slice(2)}`;

  const pending: PendingPasswordReset = {
    token,
    email: email.trim().toLowerCase(),
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString(),
  };

  if (typeof window !== 'undefined') {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
  }

  return pending;
}

export function readPendingPasswordReset(): PendingPasswordReset | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const pending = JSON.parse(raw) as PendingPasswordReset;
    if (new Date(pending.expiresAt).getTime() < Date.now()) {
      clearPendingPasswordReset();
      return null;
    }
    return pending;
  } catch {
    clearPendingPasswordReset();
    return null;
  }
}

export function clearPendingPasswordReset(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEY);
}
