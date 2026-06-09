'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { WorkspaceShell } from '@/components/workspace/WorkspaceShell';

export default function TicketsPage() {
  return (
    <ProtectedRoute>
      <WorkspaceShell initialScreen="tickets" />
    </ProtectedRoute>
  );
}
