'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { WorkspaceShell } from '@/components/workspace/WorkspaceShell';

export default function AdminInfrastructurePage() {
  return (
    <ProtectedRoute>
      <WorkspaceShell initialScreen="sa_dashboard" />
    </ProtectedRoute>
  );
}
