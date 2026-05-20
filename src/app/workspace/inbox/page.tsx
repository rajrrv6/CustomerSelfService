'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { WorkspaceShell } from '@/components/workspace/WorkspaceShell';

export default function WorkspaceInboxPage() {
  return (
    <ProtectedRoute>
      <WorkspaceShell initialScreen="inbox" />
    </ProtectedRoute>
  );
}
