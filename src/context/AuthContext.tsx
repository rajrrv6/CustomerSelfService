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
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [session, setSession] = useState<AuthSession | null>(null);
  const [pendingLogin, setPendingLogin] = useState<PendingLogin | null>(null);

  useEffect(() => {
    const existing = readSession();
    if (existing) {
      setSession(existing);
      setStatus('authenticated');
    } else {
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

  const resendMfaCode = useCallback(async () => {
    await delay(500);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    clearPendingLogin();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('role');
      localStorage.removeItem('mpaas_registered_roles');
      localStorage.removeItem('mPaaS_active_callback');
      sessionStorage.removeItem('mPaaS_guest_chat_history');
      sessionStorage.removeItem('mPaaS_guest_chat_escalated');
    }
    setSession(null);
    setPendingLogin(null);
    setStatus('idle');
    useAuthStore.getState().setRole('client_admin');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user: session?.user ?? null,
      session,
      pendingLogin,
      isAuthenticated: status === 'authenticated' && !!session,
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
