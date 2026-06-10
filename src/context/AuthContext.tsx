'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type {
  AuthSession,
  AuthStatus,
  AuthUser,
  LoginCredentials,
  PendingLogin,
  ValidationResult,
} from '@/types/auth';
import type { UserRole } from '@/types';
import { useRouter } from 'next/navigation';
import {
  clearPendingLogin,
  clearSession,
  createSession,
  readRegisteredRole,
  persistPendingLogin,
  persistSession,
  readPendingLogin,
  readSession,
} from '@/lib/auth/authStorage';
import { validateLoginCredentials } from '@/lib/auth/authValidation';
import {
  getHomeRouteForRole,
  inferRoleFromEmail,
} from '@/lib/auth/roleRouting';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

const MOCK_API_DELAY_MS = 900;
const MOCK_MFA_DELAY_MS = 700;
const MOCK_MFA_CODE = '123456';

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  session: AuthSession | null;
  pendingLogin: PendingLogin | null;
  isAuthenticated: boolean;
  login: (
    credentials: LoginCredentials
  ) => Promise<{ success: boolean; errors?: ValidationResult['errors'] }>;
  verifyMfa: (code: string) => Promise<{ success: boolean; redirectTo?: string; error?: string }>;
  logout: () => void;
  resendMfaCode: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [session, setSession] = useState<AuthSession | null>(null);
  const [pendingLogin, setPendingLogin] = useState<PendingLogin | null>(null);

  useEffect(() => {
    const existing = readSession();
    if (existing) {
      setSession(existing);
      setStatus('authenticated');
    } else {
      clearSession(); // Clean invalid/stale auth state during app bootstrap
      const pending = readPendingLogin();
      if (pending) {
        setPendingLogin(pending);
        setStatus('pending_mfa');
      } else {
        setStatus('idle');
      }
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const validation = validateLoginCredentials(credentials);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    setStatus('loading');
    clearSession();
    setSession(null);

    await delay(MOCK_API_DELAY_MS);

    // Resolve role explicitly based on credentials mapping
    let inferredRole = inferRoleFromEmail(credentials.email);
    if (inferredRole === 'customer') {
      const registered = readRegisteredRole(credentials.email);
      if (registered) {
        inferredRole = registered;
      }
    }

    const pending: PendingLogin = {
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
      inferredRole,
      requestedAt: new Date().toISOString(),
    };

    persistPendingLogin(pending);
    setPendingLogin(pending);
    setStatus('pending_mfa');

    return { success: true };
  }, []);

  const verifyMfa = useCallback(
    async (code: string) => {
      if (!pendingLogin) {
        return { success: false, error: 'No pending login session. Please sign in again.' };
      }

      setStatus('loading');
      await delay(MOCK_MFA_DELAY_MS);

      if (code !== MOCK_MFA_CODE) {
        setStatus('pending_mfa');
        return { success: false, error: 'Invalid verification code. Try 123456 for demo access.' };
      }

      const newSession = createSession(
        pendingLogin.email,
        pendingLogin.inferredRole
      );

      persistSession(newSession);
      clearPendingLogin();
      setPendingLogin(null);
      setSession(newSession);
      setStatus('authenticated');

      return {
        success: true,
        redirectTo: getHomeRouteForRole(newSession.user.role),
      };
    },
    [pendingLogin]
  );

function clearUnsafeLocalStorage() {
  if (typeof window === 'undefined') return;
  const safeKeys = [
    'theme',
    'lang',
    'accessibility-font-size',
    'accessibility-reduced-motion',
    'accessibility-sepia-mode',
    'appearance-accent-color',
    'appearance-display-density',
    'user-notification-preferences',
  ];
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && !safeKeys.includes(key)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));
}

  const resendMfaCode = useCallback(async () => {
    await delay(500);
  }, []);

  const logout = useCallback(() => {
    setStatus('loading');

    const forceResetLogoutState = () => {
      if (typeof window !== 'undefined') {
        window.location.href = '/signin';
      }
    };

    const fallbackTimeout = setTimeout(forceResetLogoutState, 5000);

    try {
      clearSession();
      clearPendingLogin();
      clearUnsafeLocalStorage();
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
      }

      setSession(null);
      setPendingLogin(null);

      useAuthStore.getState().setRole('client_admin');
      useUIStore.getState().setActiveScreen('');

      router.replace('/signin');
      router.refresh();

      clearTimeout(fallbackTimeout);
    } catch (err) {
      console.error('Logout error:', err);
      forceResetLogoutState();
    } finally {
      setStatus('idle');
    }
  }, [router]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Cross-tab logout synchronization: if session is removed in another tab, log out here.
      if (e.key === 'mpaas_auth_session' && !e.newValue) {
        logout();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [logout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user: session?.user ?? null,
      session,
      pendingLogin,
      isAuthenticated:
        status === 'authenticated' &&
        !!session &&
        !!session.user &&
        !!session.user.role &&
        !!session.user.email &&
        new Date(session.expiresAt).getTime() > Date.now(),
      login,
      verifyMfa,
      logout,
      resendMfaCode,
    }),
    [status, session, pendingLogin, login, verifyMfa, logout, resendMfaCode]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return ctx;
}

/** Sync authenticated role into AppContext without duplicating role logic in pages */
export function useAuthRoleSync(setRole: (role: UserRole) => void, userRole: UserRole | undefined) {
  useEffect(() => {
    if (userRole) {
      setRole(userRole);
    }
  }, [userRole, setRole]);
}
