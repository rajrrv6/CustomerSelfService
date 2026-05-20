'use client';

import { useAuthContext } from '@/context/AuthContext';
import { canRoleAccessPath } from '@/lib/auth/roleRouting';

export function useAuth() {
  const auth = useAuthContext();

  return {
    ...auth,
    canAccessPath: (pathname: string) =>
      auth.user ? canRoleAccessPath(auth.user.role, pathname) : false,
  };
}
