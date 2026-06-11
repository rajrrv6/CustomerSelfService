'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { WorkspaceShell } from '@/components/workspace/WorkspaceShell';

export default function PortalHomePage() {
  return (
    <ProtectedRoute>
      <WorkspaceShell initialScreen="customer_home" />
    </ProtectedRoute>
  );
}
