'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { WorkspaceShell } from '@/components/workspace/WorkspaceShell';

export default function TenantDashboardPage() {
  return (
    <ProtectedRoute>
      <WorkspaceShell initialScreen="bots" />
    </ProtectedRoute>
  );
}
