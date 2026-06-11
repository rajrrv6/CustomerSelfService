'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { WorkspaceShell } from '@/components/workspace/WorkspaceShell';
import { ROLE_DEFAULT_SCREEN } from '@/lib/rbac/permissions';
import { useAuthStore } from '@/stores/authStore';

export default function TenantDashboardPage() {
  const role = useAuthStore((s) => s.role);
  const initialScreen = ROLE_DEFAULT_SCREEN[role];

  return (
    <ProtectedRoute>
      <WorkspaceShell initialScreen={initialScreen} />
    </ProtectedRoute>
  );
}
