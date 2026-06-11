'use client';

/**
 * authStore — Zustand store for cross-feature auth/role state.
 *
 * Owns: role
 *
 * `role` is consumed by ~40 files for RBAC gating (canAccess checks,
 * read-only mode flags, navigation visibility). Moving it here means
 * components can subscribe with a narrow selector and only re-render
 * when the role actually changes, not on every AppContext update.
 *
 * Auth session data (session, user, status, pendingLogin) stays in
 * AuthContext — that is complex auth machine state, not shared global
 * role state.
 *
 * Synced by AppContext after login via setRole().
 */

import { create } from 'zustand';
import type { UserRole } from '@/types';

interface AuthState {
  role: UserRole;
  setRole: (role: UserRole) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  role: 'client_admin',

  setRole: (role) => {
    set({ role });
  },
}));
