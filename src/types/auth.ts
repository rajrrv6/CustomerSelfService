import type { UserRole } from '@/types';

export type AuthStatus = 'idle' | 'pending_mfa' | 'authenticated' | 'loading';

export interface AuthUser {
  email: string;
  displayName: string;
  role: UserRole;
}

export interface PendingLogin {
  email: string;
  password: string;
  inferredRole: UserRole;
  requestedAt: string;
}

export interface AuthSession {
  user: AuthUser;
  authenticatedAt: string;
  expiresAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: {
    email?: string;
    password?: string;
  };
}

export interface ResetPasswordFormErrors {
  newPassword?: string;
  confirmPassword?: string;
}

export type PasswordStrengthLevel = 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordStrengthResult {
  level: PasswordStrengthLevel;
  score: number; // 0–4
  /** 0–100 for progress bar */
  percent: number;
}
